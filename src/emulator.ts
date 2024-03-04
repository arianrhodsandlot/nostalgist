import { type EmscriptenFS } from 'browserfs'
import ini from 'ini'
import { coreInfoMap } from './constants/core-info'
import { keyboardCodeMap } from './constants/keyboard-code-map'
import { createEmscriptenFS, getEmscriptenModuleOverrides } from './emscripten'
import type { EmulatorOptions } from './types/emulator-options'
import type { RetroArchCommand } from './types/retroarch-command'
import type { RetroArchEmscriptenModule } from './types/retroarch-emscripten'
import { basename, blobToBuffer, delay, dirname, importCoreJsAsESM, join, stringToBuffer, updateStyle } from './utils'

const encoder = new TextEncoder()

const raUserdataDir = '/home/web_user/retroarch/userdata'
const raBundleDir = '/home/web_user/retroarch/bundle'

const raContentDir = join(raUserdataDir, 'content')
const raSystemDir = join(raUserdataDir, 'system')
const raConfigDir = join(raUserdataDir, 'config')
const raShaderDir = join(raBundleDir, 'shaders', 'shaders_glsl')

const raConfigPath = join(raUserdataDir, 'retroarch.cfg')
const raCoreConfigPath = join(raUserdataDir, 'retroarch-core-options.cfg')

type GameStatus = 'initial' | 'paused' | 'running'

interface EmulatorEmscripten {
  Module: RetroArchEmscriptenModule
  exit: (code: number) => void
  JSEvents: any
}

export class Emulator {
  emscripten: EmulatorEmscripten | undefined
  browserFS: EmscriptenFS | undefined
  private options: EmulatorOptions
  private messageQueue: [Uint8Array, number][] = []
  private gameStatus: GameStatus = 'initial'
  private canvasInitialSize = { width: 0, height: 0 }

  constructor(options: EmulatorOptions) {
    this.options = options
  }

  private get romBaseName() {
    const {
      rom: [{ fileName }],
    } = this.options
    return fileName.slice(0, fileName.lastIndexOf('.'))
  }

  private get stateFileName() {
    const { core } = this.options
    const coreFullName = coreInfoMap[core.name].corename
    if (!coreFullName) {
      throw new Error(`invalid core name: ${core.name}`)
    }
    return join(raUserdataDir, 'states', coreFullName, `${this.romBaseName}.state`)
  }

  private get stateThumbnailFileName() {
    return `${this.stateFileName}.png`
  }

  getOptions() {
    return this.options
  }

  async launch() {
    await this.setupEmscripten()
    this.checkIsAborted()

    await this.setupRaConfigFile()
    this.checkIsAborted()

    const { element, style, respondToGlobalEvents, waitForInteraction, signal } = this.options
    updateStyle(element, style)

    if (!element.isConnected) {
      document.body.append(element)
      signal?.addEventListener('abort', () => {
        element?.remove()
        this.exit()
      })
    }
    this.canvasInitialSize = this.getElementSize()

    if (respondToGlobalEvents === false) {
      if (!element.tabIndex || element.tabIndex === -1) {
        element.tabIndex = 0
      }
      const { activeElement } = document
      element.focus()
      signal?.addEventListener('abort', () => {
        if (activeElement instanceof HTMLElement) {
          activeElement.focus()
        }
      })
    }

    const { nostalgist, beforeLaunch, onLaunch } = this.options
    if (beforeLaunch) {
      await beforeLaunch(nostalgist)
    }

    const run = async () => {
      this.runMain()
      if (onLaunch) {
        await onLaunch(nostalgist)
      }
    }

    if (waitForInteraction) {
      waitForInteraction({ done: run })
    } else {
      run()
    }
  }

  sendCommand(msg: RetroArchCommand) {
    const bytes = encoder.encode(`${msg}\n`)
    this.messageQueue.push([bytes, 0])
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

    const state = new Blob([stateBuffer], { type: 'application/octet-stream' })
    const thumbnail = stateThumbnailBuffer ? new Blob([stateThumbnailBuffer], { type: 'image/png' }) : undefined
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

  async screenshot() {
    this.sendCommand('SCREENSHOT')
    const screenshotDirectory = join(raUserdataDir, 'screenshots')
    const screenshotFileName = this.guessScreenshotFileName()
    const screenshotPath = join(screenshotDirectory, screenshotFileName)
    const buffer = await this.waitForEmscriptenFile(screenshotPath)
    const { Module } = this.getEmscripten()
    const { FS } = Module
    FS.unlink(screenshotPath)
    const blobProperty = { type: 'image/png' }
    return new Blob([buffer], blobProperty)
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
    FS.mkdirTree(directory)
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
    const buffer = stringToBuffer(fileContent)
    FS.createDataFile('/', fileName, buffer, true, false)
    const encoding = 'binary'
    const data = FS.readFile(fileName, { encoding })
    FS.mkdirTree(directory)
    FS.writeFile(join(directory, fileName), data, { encoding })
    FS.unlink(fileName)
  }

  private async setupFileSystem() {
    const { Module } = this.getEmscripten()
    const { FS, PATH, ERRNO_CODES } = Module
    const { rom, bios } = this.options

    const browserFS = createEmscriptenFS({ FS, PATH, ERRNO_CODES })
    this.browserFS = browserFS
    FS.mount(browserFS, { root: '/home' }, '/home')

    if (rom.length > 0) {
      FS.mkdirTree(raContentDir)
    }
    if (bios.length > 0) {
      FS.mkdirTree(raSystemDir)
    }

    // a hack used for waiting for wasm's instantiation.
    // it's dirty but it works
    const maxWaitTime = 100
    let waitTime = 0
    // eslint-disable-next-line unicorn/consistent-destructuring
    while (!Module.asm && waitTime < maxWaitTime) {
      await delay(10)
      this.checkIsAborted()
      waitTime += 5
    }

    await Promise.all([
      ...rom.map((file) => this.writeBlobToDirectory({ ...file, directory: raContentDir })),
      ...bios.map((file) => this.writeBlobToDirectory({ ...file, directory: raSystemDir })),
    ])
    this.checkIsAborted()
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
    this.checkIsAborted()
    await this.setupFileSystem()
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
    let fileContent = ini.stringify(config, { whitespace: true, platform: 'linux' })
    fileContent = fileContent.replaceAll('__', '"')
    const fileName = basename(path)
    const directory = dirname(path)
    this.writeTextToDirectory({ fileContent, fileName, directory })
  }

  private async setupRaConfigFile() {
    this.writeConfigFile({ path: raConfigPath, config: this.options.retroarchConfig })
    this.writeConfigFile({ path: raCoreConfigPath, config: this.options.retroarchCoreConfig })
    await this.setupRaShaderFile()
  }

  private async setupRaShaderFile() {
    const { shader } = this.options
    if (shader.length === 0) {
      return
    }
    const glslFiles = shader.filter((file) => file.fileName.endsWith('.glslp'))
    if (glslFiles.length === 0) {
      return
    }
    const glslpContent = glslFiles.map((file) => `#reference "${join(raShaderDir, file.fileName)}"`).join('\n')

    this.writeTextToDirectory({ fileName: 'global.glslp', fileContent: glslpContent, directory: raConfigDir })

    await Promise.all(
      shader.map(async ({ fileName, fileContent }) => {
        const directory = fileName.endsWith('.glslp') ? raShaderDir : join(raShaderDir, 'shaders')
        await this.writeBlobToDirectory({ fileName, fileContent, directory })
      }),
    )
  }

  private runMain() {
    this.checkIsAborted()
    const { Module } = this.getEmscripten()
    const raArgs: string[] = []
    const { rom } = this.options
    if (rom.length > 0) {
      const [{ fileName }] = rom
      raArgs.push(join(raContentDir, fileName))
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

  private guessScreenshotFileName() {
    const date = new Date()
    const year = date.getFullYear() % 1000
    const month = padZero(date.getMonth() + 1)
    const day = padZero(date.getDate())
    const hour = padZero(date.getHours())
    const minute = padZero(date.getMinutes())
    const second = padZero(date.getSeconds())
    const dateString = `${year}${month}${day}-${hour}${minute}${second}`
    const baseName = this.romBaseName
    return `${baseName}-${dateString}.png`
  }

  private checkIsAborted() {
    if (this.options.signal?.aborted) {
      throw new Error('Launch aborted')
    }
  }
}

function padZero(number: number) {
  return (number < 10 ? '0' : '') + number
}
