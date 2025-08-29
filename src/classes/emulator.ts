import { coreInfoMap } from '../constants/core-info.ts'
import { keyboardCodeMap } from '../constants/keyboard-code-map.ts'
import { getEmscriptenModuleOverrides } from '../libs/emscripten.ts'
import {
  checkIsAborted,
  delay,
  importCoreJsAsESM,
  installSetImmediatePolyfill,
  padZero,
  textEncoder,
  uninstallSetImmediatePolyfill,
  updateStyle,
} from '../libs/utils.ts'
import { vendors } from '../libs/vendors.ts'
import type { RetroArchCommand } from '../types/retroarch-command.ts'
import type { RetroArchEmscriptenModule } from '../types/retroarch-emscripten'
import { EmulatorFileSystem } from './emulator-file-system.ts'
import type { EmulatorOptions } from './emulator-options'
import type { ResolvableFile } from './resolvable-file.ts'

const { ini, path } = vendors

type GameStatus = 'initial' | 'paused' | 'running' | 'terminated'
type EmulatorEvent = 'beforeLaunch' | 'onLaunch'

interface EmulatorEmscripten {
  AL: any
  Browser: any
  exit: (code: number) => void
  JSEvents: any
  Module: RetroArchEmscriptenModule
}

export class Emulator {
  private canvasInitialSize = { height: 0, width: 0 }
  private emscripten: EmulatorEmscripten | undefined
  private eventListeners: Record<EmulatorEvent, ((...args: unknown[]) => unknown)[]> = {
    beforeLaunch: [],
    onLaunch: [],
  }
  private fileSystem: EmulatorFileSystem | undefined
  private gameStatus: GameStatus = 'initial'
  private messageQueue: [Uint8Array, number][] = []

  private options: EmulatorOptions

  private get coreFullName() {
    const { core } = this.options
    const coreFullName = coreInfoMap[core.name].corename || core.name
    if (!coreFullName) {
      throw new Error(`invalid core name: ${core.name}`)
    }
    return coreFullName
  }

  private get fs() {
    if (!this.fileSystem) {
      throw new Error('fileSystem is not ready')
    }
    return this.fileSystem
  }

  private get romBaseName() {
    const {
      rom: [{ baseName }],
    } = this.options
    return baseName
  }

  private get sramFileDirectory() {
    return path.join(EmulatorFileSystem.userdataDirectory, 'saves', this.coreFullName)
  }

  private get sramFilePath() {
    return path.join(this.sramFileDirectory, `${this.romBaseName}.srm`)
  }

  private get stateFileDirectory() {
    return path.join(EmulatorFileSystem.userdataDirectory, 'states', this.coreFullName)
  }

  private get stateFilePath() {
    return path.join(this.stateFileDirectory, `${this.romBaseName}.state`)
  }

  private get stateThumbnailFilePath() {
    return `${this.stateFilePath}.png`
  }

  constructor(options: EmulatorOptions) {
    this.options = options
  }

  callCommand(command: string) {
    const { Module } = this.getEmscripten()
    // @ts-expect-error command may be an arbitrary string here
    Module[command]?.()
  }

  exit(statusCode = 0) {
    try {
      const { exit, JSEvents } = this.getEmscripten()
      exit(statusCode)
      JSEvents.removeAllEventListeners()
    } catch {}
    uninstallSetImmediatePolyfill()
    this.gameStatus = 'terminated'
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

  getStatus() {
    return this.gameStatus
  }

  async launch() {
    const { element, respondToGlobalEvents, signal, style, waitForInteraction } = this.options
    updateStyle(element, style)

    // a workaround for avoiding width and height to be deleted by these lines:
    // https://github.com/emscripten-core/emscripten/blob/5b489fcde78f596d0b3a28f655a8d88a9bfde34a/src/lib/libglfw.js#L1262-L1263
    const removeProperty = element.style.removeProperty.bind(element.style)
    element.style.removeProperty = (property: string) => {
      if (property !== 'width' && property !== 'height') {
        return removeProperty(property)
      }
      return element.style[property]
    }

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

    await this.runEventListeners('beforeLaunch')

    if (waitForInteraction) {
      waitForInteraction({
        done: async () => {
          this.runMain()
          await this.runEventListeners('onLaunch')
        },
      })
    } else {
      this.runMain()
      await this.runEventListeners('onLaunch')
    }
  }

  async loadState(state: ResolvableFile) {
    this.clearStateFile()
    await this.fs.writeFile(this.stateFilePath, state)
    await this.fs.waitForFile(this.stateFilePath)
    this.sendCommand('LOAD_STATE')
  }

  on(event: EmulatorEvent, callback: (...args: unknown[]) => unknown) {
    this.eventListeners[event].push(callback)
    return this
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

  async saveSRAM() {
    this.fs.unlink(this.sramFilePath)
    this.callCommand('_cmd_savefiles')
    const buffer = await this.fs.waitForFile(this.sramFilePath)
    const blob = new Blob([buffer], { type: 'application/octet-stream' })
    return blob
  }

  async saveState() {
    this.clearStateFile()
    this.sendCommand('SAVE_STATE')
    const savestateThumbnailEnable = this.options.retroarchConfig.savestate_thumbnail_enable
    let stateBuffer: ArrayBufferView<ArrayBuffer>
    let stateThumbnailBuffer: ArrayBufferView<ArrayBuffer> | undefined
    if (savestateThumbnailEnable) {
      ;[stateBuffer, stateThumbnailBuffer] = await Promise.all([
        this.fs.waitForFile(this.stateFilePath),
        this.fs.waitForFile(this.stateThumbnailFilePath),
      ])
    } else {
      stateBuffer = await this.fs.waitForFile(this.stateFilePath)
    }
    this.clearStateFile()

    const state = new Blob([stateBuffer], { type: 'application/octet-stream' })
    const thumbnail = stateThumbnailBuffer ? new Blob([stateThumbnailBuffer], { type: 'image/png' }) : undefined
    return { state, thumbnail }
  }

  async screenshot() {
    this.sendCommand('SCREENSHOT')
    const screenshotFileName = this.guessScreenshotFileName()
    const screenshotPath = path.join(EmulatorFileSystem.screenshotsDirectory, screenshotFileName)
    const buffer = await this.fs.waitForFile(screenshotPath)
    this.fs.unlink(screenshotPath)
    return new Blob([buffer], { type: 'image/png' })
  }

  sendCommand(msg: RetroArchCommand) {
    const exportedCommand: Partial<Record<RetroArchCommand, string>> = {
      LOAD_STATE: '_cmd_load_state',
      PAUSE_TOGGLE: '_cmd_toggle_pause',
      RESET: '_cmd_reset',
      SAVE_STATE: '_cmd_save_state',
      SCREENSHOT: '_cmd_take_screenshot',
    }
    const { Module } = this.getEmscripten()
    if (exportedCommand[msg] && exportedCommand[msg] in Module) {
      this.callCommand(exportedCommand[msg])
    } else {
      const bytes = textEncoder.encode(`${msg}\n`)
      this.messageQueue.push([bytes, 0])
    }
  }

  async setup() {
    await this.setupEmscripten()
    await this.setupFileSystem()
  }

  private clearStateFile() {
    try {
      this.fs.unlink(this.stateFilePath)
      this.fs.unlink(this.stateThumbnailFilePath)
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
    const configContent = this.fs.readFile(EmulatorFileSystem.configPath)
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

  private async runEventListeners(event: EmulatorEvent) {
    const { [event]: eventListeners } = this.eventListeners
    for (const eventListener of eventListeners) {
      await eventListener()
    }
  }

  private runMain() {
    checkIsAborted(this.options.signal)
    const { Module } = this.getEmscripten()
    const { arguments: raArgs = [] } = Module
    const { rom, signal } = this.options
    if (!Module.arguments && rom.length > 0) {
      const [{ name }] = rom
      raArgs.push(path.join(EmulatorFileSystem.contentDirectory, name))
    }

    raArgs.push('-c', EmulatorFileSystem.configPath)

    installSetImmediatePolyfill()
    Module.callMain(raArgs)
    signal?.addEventListener('abort', () => {
      this.exit()
    })
    this.gameStatus = 'running'
    this.postRun()
  }

  private async setupEmscripten() {
    const { core, element, emscriptenModule } = this.options
    const { wasm } = core
    const moduleOptions = { canvas: element, preRun: [], wasmBinary: await wasm.getArrayBuffer(), ...emscriptenModule }
    const initialModule = getEmscriptenModuleOverrides(moduleOptions)
    initialModule.preRun?.push(() => initialModule.FS.init(() => this.stdin()))

    const { getEmscripten } = await importCoreJsAsESM(core)
    checkIsAborted(this.options.signal)
    const emscripten: EmulatorEmscripten = await getEmscripten({ Module: initialModule })
    checkIsAborted(this.options.signal)
    this.emscripten = emscripten
    const { Module } = emscripten
    await Module.monitorRunDependencies()
    checkIsAborted(this.options.signal)
  }

  private async setupFileSystem() {
    const { Module } = this.getEmscripten()
    const { bios, rom, signal, sram, state } = this.options

    for (const { name } of bios) {
      if (!name) {
        throw new Error('file name is required for bios')
      }
    }

    const fileSystem = await EmulatorFileSystem.create({ emscriptenModule: Module, signal })
    this.fileSystem = fileSystem
    if (state) {
      this.fs.mkdirTree(this.stateFileDirectory)
    }
    if (sram) {
      this.fs.mkdirTree(this.sramFileDirectory)
    }

    const filePromises: Promise<void>[] = []
    filePromises.push(
      ...rom.map((file) => this.fs.writeFile(path.join(EmulatorFileSystem.contentDirectory, file.name), file)),
      ...bios.map((file) => this.fs.writeFile(path.join(EmulatorFileSystem.systemDirectory, file.name), file)),
    )
    if (state) {
      filePromises.push(this.fs.writeFile(`${this.stateFilePath}.auto`, state))
    }
    if (sram) {
      filePromises.push(this.fs.writeFile(this.sramFilePath, sram))
    }
    await Promise.all(filePromises)
    checkIsAborted(signal)

    await this.setupRaConfigFiles()
    checkIsAborted(this.options.signal)
  }

  private async setupRaConfigFiles() {
    await this.fs.writeIni(EmulatorFileSystem.configPath, this.options.retroarchConfig)
    await this.fs.writeIni(EmulatorFileSystem.coreConfigPath, this.options.retroarchCoreConfig)
    await this.setupRaShaderFiles()
  }

  private async setupRaShaderFiles() {
    const { shader } = this.options
    if (shader.length === 0) {
      return
    }
    const glslpFiles = shader.filter((file) => file.name.endsWith('.glslp'))
    if (glslpFiles.length === 0) {
      return
    }

    for (const { name } of shader) {
      if (!name) {
        throw new Error('file name is required for shader')
      }
    }

    const globalGlslpContent = glslpFiles
      .map((file) => `#reference "${path.join(EmulatorFileSystem.shaderDirectory, file.name)}"`)
      .join('\n')

    await this.fs.writeFile(path.join(EmulatorFileSystem.configDirectory, 'global.glslp'), globalGlslpContent)

    await Promise.all(
      shader.map(async (resolvable) => {
        const directory =
          resolvable.extension === '.glslp'
            ? EmulatorFileSystem.shaderDirectory
            : path.join(EmulatorFileSystem.shaderDirectory, 'shaders')
        await this.fs.writeFile(path.join(directory, resolvable.name), resolvable)
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
}
