import { coreInfoMap } from './constants/core-info'
import { keyboardCodeMap } from './constants/keyboard-code-map'
import { getEmscriptenModuleOverrides } from './emscripten'
import type { EmulatorOptions } from './types/emulator-options'
import type { RetroArchCommand } from './types/retroarch-command'
import type { RetroArchEmscriptenModule } from './types/retroarch-emscripten'
import { blobToBuffer, checkIsAborted, delay, importCoreJsAsESM, padZero, textEncoder, updateStyle } from './utils'
import { vendors } from './vendors'

const { ini, path } = vendors

const raUserdataDir = '/home/web_user/retroarch/userdata'
const raBundleDir = '/home/web_user/retroarch/bundle'

const raContentDir = path.join(raUserdataDir, 'content')
const raSystemDir = path.join(raUserdataDir, 'system')
const raConfigDir = path.join(raUserdataDir, 'config')
const raShaderDir = path.join(raBundleDir, 'shaders', 'shaders_glsl')

const raConfigPath = path.join(raUserdataDir, 'retroarch.cfg')
const raCoreConfigPath = path.join(raUserdataDir, 'retroarch-core-options.cfg')

type GameStatus = 'initial' | 'paused' | 'running'

interface EmulatorEmscripten {
  AL: any
  Browser: any
  exit: (code: number) => void
  JSEvents: any
  Module: RetroArchEmscriptenModule
}

export class Emulator {
  emscripten: EmulatorEmscripten | undefined
  private canvasInitialSize = { height: 0, width: 0 }
  private gameStatus: GameStatus = 'initial'
  private messageQueue: [Uint8Array, number][] = []
  private options: EmulatorOptions

  private get romBaseName() {
    const {
      rom: [{ fileName }],
    } = this.options
    return fileName.slice(0, fileName.lastIndexOf('.'))
  }

  private get stateFileDirectory() {
    const { core } = this.options
    const coreFullName = coreInfoMap[core.name].corename || core.name
    if (!coreFullName) {
      throw new Error(`invalid core name: ${core.name}`)
    }
    return path.join(raUserdataDir, 'states', coreFullName)
  }

  private get stateFileName() {
    return path.join(this.stateFileDirectory, `${this.romBaseName}.state`)
  }

  private get stateThumbnailFileName() {
    return `${this.stateFileName}.png`
  }

  constructor(options: EmulatorOptions) {
    this.options = options
  }

  exit(statusCode = 0) {
    const { emscripten } = this
    if (emscripten) {
      const { exit, JSEvents, Module } = this.getEmscripten()
      const { FS } = Module
      exit(statusCode)
      FS.unmount('/home')
      JSEvents.removeAllEventListeners()
    }
  }

  getEmscripten() {
    if (!this.emscripten) {
      throw new Error('emulator is not ready')
    }
    return this.emscripten
  }

  getOptions() {
    return this.options
  }

  async launch() {
    await this.setupEmscripten()
    checkIsAborted(this.options.signal)

    await this.setupRaConfigFile()
    checkIsAborted(this.options.signal)

    const { element, respondToGlobalEvents, signal, style, waitForInteraction } = this.options
    updateStyle(element, style)

    if (!element.isConnected) {
      document.body.append(element)
      signal?.addEventListener('abort', () => {
        element?.remove()
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

    const { beforeLaunch, nostalgist, onLaunch } = this.options
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

  async loadState(blob: Blob) {
    this.clearStateFile()
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const buffer = await blobToBuffer(blob)
    FS.writeFile(this.stateFileName, buffer)
    await this.waitForEmscriptenFile(this.stateFileName)
    this.sendCommand('LOAD_STATE')
  }

  pause() {
    if (this.gameStatus === 'running') {
      this.sendCommand('PAUSE_TOGGLE')
    }
    this.gameStatus = 'paused'
  }

  async press(button: string, player = 1, time = 100) {
    const code = this.getKeyboardCode(button, player)
    if (code) {
      await this.keyboardPress(code, time)
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

  resize({ height, width }: { height: number; width: number }) {
    const { Module } = this.getEmscripten()
    if (typeof width === 'number' && typeof height === 'number') {
      Module.setCanvasSize(width, height)
    }
  }

  restart() {
    this.sendCommand('RESET')
    this.resume()
  }

  resume() {
    if (this.gameStatus === 'paused') {
      this.sendCommand('PAUSE_TOGGLE')
    }
    this.gameStatus = 'running'
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

  async screenshot() {
    this.sendCommand('SCREENSHOT')
    const screenshotDirectory = path.join(raUserdataDir, 'screenshots')
    const screenshotFileName = this.guessScreenshotFileName()
    const screenshotPath = path.join(screenshotDirectory, screenshotFileName)
    const buffer = await this.waitForEmscriptenFile(screenshotPath)
    const { Module } = this.getEmscripten()
    const { FS } = Module
    FS.unlink(screenshotPath)
    const blobProperty = { type: 'image/png' }
    return new Blob([buffer], blobProperty)
  }

  sendCommand(msg: RetroArchCommand) {
    const bytes = textEncoder.encode(`${msg}\n`)
    this.messageQueue.push([bytes, 0])
  }

  private clearStateFile() {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    try {
      FS.unlink(this.stateFileName)
      FS.unlink(this.stateThumbnailFileName)
    } catch {}
  }

  private fireKeyboardEvent(type: 'keydown' | 'keyup', code: string) {
    const { JSEvents } = this.getEmscripten()
    for (const { eventListenerFunc, eventTypeString } of JSEvents.eventHandlers) {
      if (eventTypeString === type) {
        try {
          eventListenerFunc({ code, target: this.options.element })
        } catch {}
      }
    }
  }

  private getCurrentRetroarchConfig() {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const configContent = FS.readFile(raConfigPath, { encoding: 'utf8' })
    return ini.parse(configContent)
  }

  private getElementSize() {
    const { element, size } = this.options
    return !size || size === 'auto' ? { height: element.offsetHeight, width: element.offsetWidth } : size
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

  private keyboardDown(code: string) {
    this.fireKeyboardEvent('keydown', code)
  }

  private async keyboardPress(code: string, time = 100) {
    this.keyboardDown(code)
    await delay(time)
    this.keyboardUp(code)
  }

  private keyboardUp(code: string) {
    this.fireKeyboardEvent('keyup', code)
  }

  private postRun() {
    this.resize(this.canvasInitialSize)

    // tell retroarch that controllers are connected
    for (const gamepad of navigator.getGamepads?.() ?? []) {
      if (gamepad) {
        globalThis.dispatchEvent(new GamepadEvent('gamepadconnected', { gamepad }))
      }
    }

    this.updateKeyboardEventHandlers()
  }

  private runMain() {
    checkIsAborted(this.options.signal)
    const { Module } = this.getEmscripten()
    const { arguments: raArgs = [] } = Module
    const { rom, signal } = this.options
    if (!Module.arguments && rom.length > 0) {
      const [{ fileName }] = rom
      raArgs.push(path.join(raContentDir, fileName))
    }

    Module.callMain(raArgs)
    signal?.addEventListener('abort', () => {
      this.exit()
    })
    this.gameStatus = 'running'
    this.postRun()
  }

  private async setupEmscripten() {
    if (typeof globalThis === 'object') {
      // @ts-expect-error for retroarch fast forward
      globalThis.setImmediate ??= globalThis.setTimeout
    }

    const { core, element, emscriptenModule, signal } = this.options
    const { wasm } = core
    const moduleOptions = { canvas: element, preRun: [], wasmBinary: wasm, ...emscriptenModule }
    const initialModule = getEmscriptenModuleOverrides(moduleOptions)
    initialModule.preRun?.push(() => initialModule.FS.init(() => this.stdin()))

    const { getEmscripten } = await importCoreJsAsESM(core)
    const emscripten: EmulatorEmscripten = await getEmscripten({ Module: initialModule })
    this.emscripten = emscripten
    const { Module } = emscripten
    await Module.monitorRunDependencies()
    checkIsAborted(signal)
    await this.setupFileSystem()
  }

  private async setupFileSystem() {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const { bios, rom, signal, state } = this.options

    if (rom.length > 0) {
      FS.mkdirTree(raContentDir)
    }
    if (bios.length > 0) {
      FS.mkdirTree(raSystemDir)
    }
    if (state) {
      FS.mkdirTree(this.stateFileDirectory)
    }

    // a hack used for waiting for wasm's instantiation.
    // it's dirty but it works
    const maxWaitTime = 100
    let waitTime = 0

    while (!Module.asm && waitTime < maxWaitTime) {
      await delay(10)
      checkIsAborted(signal)
      waitTime += 5
    }

    const filePromises: Promise<void>[] = []
    filePromises.push(
      ...rom.map((file) => this.writeBlobToDirectory({ ...file, directory: raContentDir })),
      ...bios.map((file) => this.writeBlobToDirectory({ ...file, directory: raSystemDir })),
    )
    if (state) {
      const statePromise = this.writeBlobToDirectory({
        directory: this.stateFileDirectory,
        fileContent: state,
        fileName: `${this.romBaseName}.state.auto`,
      })
      filePromises.push(statePromise)
    }
    await Promise.all(filePromises)

    checkIsAborted(signal)
  }

  private async setupRaConfigFile() {
    this.writeConfigFile({ config: this.options.retroarchConfig, path: raConfigPath })
    this.writeConfigFile({ config: this.options.retroarchCoreConfig, path: raCoreConfigPath })
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
    const glslpContent = glslFiles.map((file) => `#reference "${path.join(raShaderDir, file.fileName)}"`).join('\n')

    this.writeTextToDirectory({ directory: raConfigDir, fileContent: glslpContent, fileName: 'global.glslp' })

    await Promise.all(
      shader.map(async ({ fileContent, fileName }) => {
        const directory = fileName.endsWith('.glslp') ? raShaderDir : path.join(raShaderDir, 'shaders')
        await this.writeBlobToDirectory({ directory, fileContent, fileName })
      }),
    )
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

  private updateKeyboardEventHandlers() {
    const { JSEvents } = this.getEmscripten()
    const { element, respondToGlobalEvents } = this.options
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
    const keyboardEvents = new Set(['keydown', 'keypress', 'keyup'])
    const globalKeyboardEventHandlers = JSEvents.eventHandlers.filter(
      ({ eventTypeString, target }: { eventTypeString: string; target: Document | Element }) =>
        keyboardEvents.has(eventTypeString) && (target === document || target === element),
    )
    for (const globalKeyboardEventHandler of globalKeyboardEventHandlers) {
      const { eventTypeString, handlerFunc, target } = globalKeyboardEventHandler
      JSEvents.registerOrRemoveHandler({ eventTypeString, target })
      JSEvents.registerOrRemoveHandler({
        ...globalKeyboardEventHandler,
        handlerFunc: (...args: [Event]) => {
          const [event] = args
          if (respondToGlobalEvents || event?.target === element) {
            handlerFunc(...args)
          }
        },
        target: respondToGlobalEvents ? document : element,
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

  private async writeBlobToDirectory({
    directory,
    fileContent,
    fileName,
  }: {
    directory: string
    fileContent: Blob
    fileName: string
  }) {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const buffer = await blobToBuffer(fileContent)
    FS.createDataFile('/', fileName, buffer, true, false)
    const encoding = 'binary'
    const data = FS.readFile(fileName, { encoding })
    FS.mkdirTree(directory)
    FS.writeFile(path.join(directory, fileName), data, { encoding })
    FS.unlink(fileName)
  }

  private writeConfigFile({ config, path }: { config: Record<string, any>; path: string }) {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const dir = path.slice(0, path.lastIndexOf('/'))
    FS.mkdirTree(dir)
    for (const key in config) {
      config[key] = `__${config[key]}__`
    }
    let fileContent = ini.stringify(config, { platform: 'linux', whitespace: true })
    fileContent = fileContent.replaceAll('__', '"')
    const fileName = vendors.path.basename(path)
    const directory = vendors.path.dirname(path)
    this.writeTextToDirectory({ directory, fileContent, fileName })
  }

  private writeTextToDirectory({
    directory,
    fileContent,
    fileName,
  }: {
    directory: string
    fileContent: string
    fileName: string
  }) {
    const { Module } = this.getEmscripten()
    const { FS } = Module
    const buffer = textEncoder.encode(fileContent)
    FS.createDataFile('/', fileName, buffer, true, false)
    const encoding = 'binary'
    const data = FS.readFile(fileName, { encoding })
    FS.mkdirTree(directory)
    FS.writeFile(path.join(directory, fileName), data, { encoding })
    FS.unlink(fileName)
  }
}
