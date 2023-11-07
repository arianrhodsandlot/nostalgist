import ini from 'ini'
import { coreInfoMap } from './constants/core-info'
import { keyboardCodeMap } from './constants/keyboard-code-map'
import { createEmscriptenFS, getEmscriptenModuleOverrides } from './emscripten'
import type { EmulatorOptions } from './types/emulator-options'
import type { RetroArchCommand } from './types/retroarch-command'
import type { RetroArchEmscriptenModule } from './types/retroarch-emscripten'
import { basename, blobToBuffer, delay, dirname, importCoreJsAsESM, join, updateStyle } from './utils'

const encoder = new TextEncoder()

const raUserdataDir = '/home/web_user/retroarch/userdata/'
const raCoreConfigDir = `${raUserdataDir}config/`
const raConfigPath = `${raUserdataDir}retroarch.cfg`

type GameStatus = 'initial' | 'paused' | 'running'

interface EmulatorEmscripten {
  Module: RetroArchEmscriptenModule
  exit: (code: number) => void
  JSEvents: any
}

export class Emulator {
  emscripten: EmulatorEmscripten | undefined
  private options: EmulatorOptions
  private messageQueue: [Uint8Array, number][] = []
  private gameStatus: GameStatus = 'initial'
  private canvasInitialSize = { width: 0, height: 0 }

  constructor(options: EmulatorOptions) {
    this.options = options
  }

  private get stateFileName() {
    const {
      rom: [{ fileName }],
      core,
    } = this.options
    const baseName = fileName.slice(0, fileName.lastIndexOf('.'))
    const coreFullName = coreInfoMap[core.name].corename
    if (!coreFullName) {
      throw new Error(`invalid core name: ${core.name}`)
    }
    return `${raUserdataDir}states/${coreFullName}/${baseName}.state`
  }

  private get stateThumbnailFileName() {
    return `${this.stateFileName}.png`
  }

  getOptions() {
    return this.options
  }

  async launch() {
    await this.setupEmscripten()
    this.setupRaConfigFile()
    this.setupRaCoreConfigFile()

    const { element, style, respondToGlobalEvents, waitForInteraction } = this.options
    updateStyle(element, style)

    if (!element.isConnected) {
      document.body.append(element)
    }
    this.canvasInitialSize = this.getElementSize()

    if (respondToGlobalEvents === false) {
      if (!element.tabIndex || element.tabIndex === -1) {
        element.tabIndex = 0
      }
      element.focus()
    }

    if (waitForInteraction) {
      waitForInteraction({ done: () => this.runMain() })
    } else {
      this.runMain()
    }
  }

  resume() {
    if (this.gameStatus === 'paused') {
      this.sendCommand('PAUSE_TOGGLE')
    }
    this.gameStatus = 'running'
  }

  restart() {
    this.sendCommand('RESET')
    this.resume()
  }

  pause() {
    if (this.gameStatus === 'running') {
      this.sendCommand('PAUSE_TOGGLE')
    }
    this.gameStatus = 'paused'
  }

  getEmscripten() {
    if (!this.emscripten) {
      throw new Error('emulator is not ready')
    }
    return this.emscripten
  }

  async saveState() {
    this.clearStateFile()
    this.sendCommand('SAVE_STATE')
    const savestateThumbnailEnable = this.options.retroarchConfig.savestate_thumbnail_enable
    let stateBuffer: Buffer
    let stateThumbnailBuffer: Buffer | undefined
    if (savestateThumbnailEnable) {
      ;[stateBuffer, stateThumbnailBuffer] = await Promise.all([
        this.waitForEmscriptenFile(this.stateFileName),
        this.waitForEmscriptenFile(this.stateThumbnailFileName),
      ])
    } else {
      stateBuffer = await this.waitForEmscriptenFile(this.stateFileName)
    }
    this.clearStateFile()

    const blobProperty = { type: 'application/octet-stream' }
    const state = new Blob([stateBuffer], blobProperty)
    const thumbnail = stateThumbnailBuffer ? new Blob([stateThumbnailBuffer], blobProperty) : undefined
    return { state, thumbnail }
  }

  async loadState(blob: Blob) {
    this.clearStateFile()
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const buffer = await blobToBuffer(blob)
    FS.writeFile(this.stateFileName, buffer)
    await this.waitForEmscriptenFile(this.stateFileName)
    this.sendCommand('LOAD_STATE')
  }

  exit(statusCode = 0) {
    const { emscripten } = this
    if (emscripten) {
      const { Module, exit, JSEvents } = this.getEmscripten()
      const { FS } = Module
      exit(statusCode)
      FS.unmount('/home')
      JSEvents.removeAllEventListeners()
    }
  }

  resize({ width, height }: { width: number; height: number }) {
    const { Module } = this.getEmscripten()
    if (typeof width === 'number' && typeof height === 'number') {
      Module.setCanvasSize(width, height)
    }
  }

  pressDown(button: string, player = 1) {
    const code = this.getKeyboardCode(button, player)
    if (code) {
      this.keyboardDown(code)
    }
  }

  pressUp(button: string, player = 1) {
    const code = this.getKeyboardCode(button, player)
    if (code) {
      this.keyboardUp(code)
    }
  }

  async press(button: string, player = 1, time = 100) {
    const code = this.getKeyboardCode(button, player)
    if (code) {
      await this.keyboardPress(code, time)
    }
  }

  private getElementSize() {
    const { element, size } = this.options
    return !size || size === 'auto' ? { width: element.offsetWidth, height: element.offsetHeight } : size
  }

  private async writeBlobToDirectory({
    fileName,
    fileContent,
    directory,
  }: {
    fileName: string
    fileContent: Blob
    directory: string
  }) {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const buffer = await blobToBuffer(fileContent)
    FS.createDataFile('/', fileName, buffer, true, false)
    const encoding = 'binary'
    const data = FS.readFile(fileName, { encoding })
    FS.writeFile(join(directory, fileName), data, { encoding })
    FS.unlink(fileName)
  }

  private writeTextToDirectory({
    fileName,
    fileContent,
    directory,
  }: {
    fileName: string
    fileContent: string
    directory: string
  }) {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const encoding = 'utf8'
    FS.writeFile(join(directory, fileName), fileContent, { encoding })
  }

  private async setupFileSystem() {
    const { Module } = this.getEmscripten()
    const { FS, PATH, ERRNO_CODES } = Module
    const { rom, bios } = this.options

    const emscriptenFS = createEmscriptenFS({ FS, PATH, ERRNO_CODES })
    FS.mount(emscriptenFS, { root: '/home' }, '/home')

    const romDirectory = join(raUserdataDir, 'content')
    if (rom.length > 0) {
      FS.mkdirTree(romDirectory)
    }
    const biosDirectory = join(raUserdataDir, 'content')
    if (bios.length > 0) {
      FS.mkdirTree(biosDirectory)
    }

    // a hack used for waiting for wasm's instantiation.
    // it's dirty but it works
    const maxWaitTime = 100
    let waitTime = 0
    // eslint-disable-next-line unicorn/consistent-destructuring
    while (!Module.asm && waitTime < maxWaitTime) {
      await delay(10)
      waitTime += 5
    }

    await Promise.all([
      ...rom.map((file) => this.writeBlobToDirectory({ ...file, directory: romDirectory })),
      ...bios.map((file) => this.writeBlobToDirectory({ ...file, directory: biosDirectory })),
    ])
  }

  private async setupEmscripten() {
    if (typeof window === 'object') {
      // @ts-expect-error for retroarch fast forward
      window.setImmediate ??= window.setTimeout
    }

    const { element, core, emscriptenModule } = this.options
    const { wasm } = core
    const moduleOptions = { wasmBinary: wasm, canvas: element, preRun: [], ...emscriptenModule }
    const initialModule = getEmscriptenModuleOverrides(moduleOptions)
    initialModule.preRun?.push(() => initialModule.FS.init(() => this.stdin()))

    const { getEmscripten } = await importCoreJsAsESM(core)
    const emscripten: EmulatorEmscripten = await getEmscripten({ Module: initialModule })
    this.emscripten = emscripten
    const { Module } = emscripten
    await Module.monitorRunDependencies()
    await this.setupFileSystem()
  }

  private sendCommand(msg: RetroArchCommand) {
    const bytes = encoder.encode(`${msg}\n`)
    this.messageQueue.push([bytes, 0])
  }

  // copied from https://github.com/libretro/RetroArch/pull/15017
  private stdin() {
    const { messageQueue } = this
    // Return ASCII code of character, or null if no input
    while (messageQueue.length > 0) {
      const msg = messageQueue[0][0]
      const index = messageQueue[0][1]
      if (index >= msg.length) {
        messageQueue.shift()
      } else {
        messageQueue[0][1] = index + 1
        // assumption: msg is a uint8array
        return msg[index]
      }
    }
    return null
  }

  private writeConfigFile({ path, config }: { path: string; config: Record<string, any> }) {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const dir = path.slice(0, path.lastIndexOf('/'))
    FS.mkdirTree(dir)
    for (const key in config) {
      config[key] = `__${config[key]}__`
    }
    // @ts-expect-error `platform` option is not listed in @types/ini for now
    let fileContent = ini.stringify(config, { whitespace: true, platform: 'linux' })
    fileContent = fileContent.replaceAll('__', '"')
    const fileName = basename(path)
    const directory = dirname(path)
    this.writeTextToDirectory({ fileContent, fileName, directory })
  }

  private setupRaConfigFile() {
    this.writeConfigFile({ path: raConfigPath, config: this.options.retroarchConfig })
  }

  private setupRaCoreConfigFile() {
    const coreName = this.options.core.name
    const coreConfig = this.options.retroarchCoreConfig
    const coreInfo = coreInfoMap[coreName]
    if (coreInfo && coreInfo.corename) {
      const raCoreConfigPath = `${raCoreConfigDir}${coreInfo.corename}/${coreInfo.corename}.opt`
      this.writeConfigFile({ path: raCoreConfigPath, config: coreConfig })
    }
  }

  private runMain() {
    const { Module } = this.getEmscripten()
    const raArgs: string[] = []
    const { rom } = this.options
    if (rom.length > 0) {
      const [{ fileName }] = rom
      raArgs.push(`/home/web_user/retroarch/userdata/content/${fileName}`)
    }
    Module.callMain(raArgs)
    this.gameStatus = 'running'
    this.postRun()
  }

  private postRun() {
    this.resize(this.canvasInitialSize)
    this.fireGamepadEvents()
    this.updateKeyboardEventHandlers()
  }

  private fireGamepadEvents() {
    // tell retroarch that controllers are connected
    for (const gamepad of navigator.getGamepads?.() ?? []) {
      if (gamepad) {
        window.dispatchEvent(new GamepadEvent('gamepadconnected', { gamepad }))
      }
    }
  }

  private updateKeyboardEventHandlers() {
    const { JSEvents } = this.getEmscripten()
    const { respondToGlobalEvents, element } = this.options
    if (!respondToGlobalEvents) {
      if (!element.getAttribute('tabindex')) {
        element.tabIndex = -1
      }
      element.focus()
      element.addEventListener('click', () => {
        element.focus()
      })
    }

    // Emscripten module may register keyboard events to document or canvas.
    // Versions before 1.16.0 will use document while newer versions will use canvas.
    // Let's modify the default event liseners as needed
    const keyboardEvents = new Set(['keyup', 'keydown', 'keypress'])
    const globalKeyboardEventHandlers = JSEvents.eventHandlers.filter(
      ({ eventTypeString, target }: { eventTypeString: string; target: Element | Document }) =>
        keyboardEvents.has(eventTypeString) && (target === document || target === element),
    )
    for (const globalKeyboardEventHandler of globalKeyboardEventHandlers) {
      const { eventTypeString, target, handlerFunc } = globalKeyboardEventHandler
      JSEvents.registerOrRemoveHandler({ eventTypeString, target })
      JSEvents.registerOrRemoveHandler({
        ...globalKeyboardEventHandler,
        target: respondToGlobalEvents ? document : element,
        handlerFunc: (...args: [Event]) => {
          const [event] = args
          if (respondToGlobalEvents || event?.target === element) {
            handlerFunc(...args)
          }
        },
      })
    }
  }

  private async waitForEmscriptenFile(fileName: string) {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const maxRetries = 30
    let buffer
    let isFinished = false
    let retryTimes = 0
    while (retryTimes <= maxRetries && !isFinished) {
      const delayTime = Math.min(100 * 2 ** retryTimes, 1000)
      await delay(delayTime)
      try {
        const newBuffer = FS.readFile(fileName).buffer
        isFinished = buffer?.byteLength > 0 && buffer?.byteLength === newBuffer.byteLength
        buffer = newBuffer
      } catch (error) {
        console.warn(error)
      }
      retryTimes += 1
    }
    if (!isFinished) {
      throw new Error('fs timeout')
    }
    return buffer
  }

  private clearStateFile() {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    try {
      FS.unlink(this.stateFileName)
      FS.unlink(this.stateThumbnailFileName)
    } catch {}
  }

  private getCurrentRetroarchConfig() {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const configContent = FS.readFile(raConfigPath, { encoding: 'utf8' })
    return ini.parse(configContent)
  }

  private fireKeyboardEvent(type: 'keydown' | 'keyup', code: string) {
    const { JSEvents } = this.getEmscripten()
    for (const { eventTypeString, eventListenerFunc } of JSEvents.eventHandlers) {
      if (eventTypeString === type) {
        try {
          eventListenerFunc({ code, target: this.options.element })
        } catch {}
      }
    }
  }

  private getKeyboardCode(button: string, player = 1) {
    const config = this.getCurrentRetroarchConfig()
    const configName = `input_player${player}_${button}`
    const key: string = config[configName]
    if (!key || key === 'nul') {
      return
    }
    const { length } = key
    // single letters
    if (length === 1) {
      return `Key${key.toUpperCase()}`
    }
    // f1, f2, f3...
    if (key[0] === 'f' && (length === 2 || length === 3)) {
      return key.toUpperCase()
    }
    // num1, num2, num3...
    if (length === 4 && key.startsWith('num')) {
      return `Numpad${key.at(-1)}`
    }
    if (length === 7 && key.startsWith('keypad')) {
      return `Digit${key.at(-1)}`
    }
    return keyboardCodeMap[key] || ''
  }

  private keyboardUp(code: string) {
    this.fireKeyboardEvent('keyup', code)
  }

  private keyboardDown(code: string) {
    this.fireKeyboardEvent('keydown', code)
  }

  private async keyboardPress(code: string, time = 100) {
    this.keyboardDown(code)
    await delay(time)
    this.keyboardUp(code)
  }
}
