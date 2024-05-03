import { systemCoreMap } from './constants/system'
import { Emulator } from './emulator'
import { getDefaultOptions } from './options'
import type { EmulatorOptions } from './types/emulator-options'
import type {
  NostalgistLaunchOptions,
  NostalgistLaunchRomOptions,
  NostalgistOptions,
  NostalgistOptionsFile,
  NostalgistOptionsPartial,
  NostalgistResolveFileFunction,
} from './types/nostalgist-options'
import type { RetroArchCommand } from './types/retroarch-command'
import { checkIsAborted, merge, urlBaseName } from './utils'
import { vendors } from './vendors'

export class Nostalgist {
  static Nostalgist = Nostalgist
  static vendors = vendors

  private emulator: Emulator | undefined

  private emulatorOptions: EmulatorOptions | undefined
  private static globalOptions = getDefaultOptions()
  private options: NostalgistOptions

  private constructor(options: NostalgistLaunchOptions) {
    const globalOptions: Partial<NostalgistLaunchOptions> = { ...Nostalgist.globalOptions }
    const localOptions = { ...options }
    const mergedOptions = {} as unknown as NostalgistOptions
    merge(mergedOptions, globalOptions, localOptions)
    this.options = mergedOptions
  }

  /**
   * Update the global options for `Nostalgist`, so everytime the `Nostalgist.launch` method or shortcuts like `Nostalgist.nes` is called, the default options specified here will be used.
   *
   * You may want to specify how to resolve ROMs and RetroArch cores here.
   *
   * @see {@link https://nostalgist.js.org/apis/configure/}
   *
   * @example
   * ```js
   * Nostalgist.configure({
   *   resolveRom({ file }) {
   *     return `https://example.com/roms/${file}`
   *   },
   *   // other configuation can also be specified here
   * })
   * ```
   */
  static configure(options: NostalgistOptionsPartial) {
    merge(Nostalgist.globalOptions, options)
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for GB emulation.
   *
   * It will use mgba as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/gb/}
   */
  static async gb(options: NostalgistLaunchRomOptions | NostalgistOptionsFile) {
    return await Nostalgist.launchSystem('gb', options)
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for GBA emulation.
   *
   * It will use mgba as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/gba/}
   */
  static async gba(options: NostalgistLaunchRomOptions | NostalgistOptionsFile) {
    return await Nostalgist.launchSystem('gba', options)
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for GBC emulation.
   *
   * It will use mgba as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/gbc/}
   */
  static async gbc(options: NostalgistLaunchRomOptions | NostalgistOptionsFile) {
    return await Nostalgist.launchSystem('gbc', options)
  }

  /**
   * Launch an emulator and return a `Promise` of the instance of the emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/launch/}
   *
   * @example
   * A simple example:
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   core: 'fceumm',
   *   rom: 'flappybird.nes',
   * })
   * ```
   *
   * @example
   * A more complex one:
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   element: document.querySelector('.emulator-canvas'),
   *   core: 'fbneo',
   *   rom: ['mslug.zip'],
   *   bios: ['neogeo.zip'],
   *   retroarchConfig: {
   *     rewind_enable: true,
   *     savestate_thumbnail_enable: true,
   *   }
   *   runEmulatorManually: false,
   *   resolveCoreJs(core) {
   *     return `https://example.com/core/${core}_libretro.js`
   *   },
   *   resolveCoreWasm(core) {
   *     return `https://example.com/core/${core}_libretro.wasm`
   *   },
   *   resolveRom(file) {
   *     return `https://example.com/roms/${file}`
   *   },
   *   resolveBios(bios) {
   *     return `https://example.com/system/${bios}`
   *   },
   * })
   * ```
   */
  static async launch(options: NostalgistLaunchOptions) {
    const nostalgist = new Nostalgist(options)
    await nostalgist.launch()
    return nostalgist
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for Sega Genesis / Megadrive emulation.
   *
   * It will use genesis_plus_gx as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/megadrive/}
   */
  static async megadrive(options: NostalgistLaunchRomOptions | NostalgistOptionsFile) {
    return await Nostalgist.launchSystem('megadrive', options)
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for NES emulation.
   *
   * It will use fceumm as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/nes/}
   */
  static async nes(options: NostalgistLaunchRomOptions | NostalgistOptionsFile) {
    return await Nostalgist.launchSystem('nes', options)
  }

  /**
   * Reset the global configuation set by `Nostalgist.configure` to default.
   *
   * @see {@link https://nostalgist.js.org/apis/reset-to-default/}
   */
  static resetToDefault() {
    Nostalgist.configure(getDefaultOptions())
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for SNES emulation.
   *
   * It will use snes9x as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/snes/}
   */
  static async snes(options: NostalgistLaunchRomOptions | NostalgistOptionsFile) {
    return await Nostalgist.launchSystem('snes', options)
  }

  private async fetch(input: string) {
    const { signal = null } = this.options
    return await fetch(input, { signal })
  }

  private async getBiosOption() {
    const { bios, resolveBios } = this.options
    if (!bios) {
      return []
    }
    const biosFiles = Array.isArray(bios) ? bios : [bios]
    return await Promise.all(biosFiles.map((biosFile) => this.resolveFile(biosFile, resolveBios)))
  }

  private static getCoreForSystem(system: string) {
    return systemCoreMap[system]
  }

  private async getCoreOption() {
    const { core, resolveCoreJs, resolveCoreWasm } = this.options
    let coreDict
    if (typeof core === 'string') {
      const [js, wasm] = await Promise.all([resolveCoreJs(core, this.options), resolveCoreWasm(core, this.options)])
      coreDict = { js, name: core, wasm }
    } else {
      coreDict = core
    }
    let { js, name, wasm } = coreDict

    const promises = []
    if (typeof js === 'string') {
      promises.push(
        (async () => {
          const response = await this.fetch(js)
          js = await response.text()
        })(),
      )
    }
    if (typeof wasm === 'string') {
      promises.push(
        (async () => {
          const response = await this.fetch(wasm as string)
          wasm = await response.arrayBuffer()
        })(),
      )
    }
    if (promises.length > 0) {
      await Promise.all(promises)
    }

    return { js, name, wasm: wasm as ArrayBuffer }
  }

  private getElementOption() {
    if (typeof document !== 'object') {
      throw new TypeError('document must be an object')
    }
    let { element } = this.options
    if (typeof element === 'string' && element) {
      const canvas = document.body.querySelector(element)
      if (!canvas) {
        throw new Error(`can not find element "${element}"`)
      }
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError(`element "${element}" is not a canvas element`)
      }
      element = canvas
    }
    if (!element) {
      element = document.createElement('canvas')
    }

    if (element instanceof HTMLCanvasElement) {
      element.id = 'canvas'
      return element
    }

    throw new TypeError('invalid element')
  }

  private getRetroarchCoreOption() {
    const options = {}
    merge(options, Nostalgist.globalOptions.retroarchCoreConfig, this.options.retroarchCoreConfig)
    return options as typeof this.options.retroarchCoreConfig
  }

  private getRetroarchOption() {
    const options = {}
    merge(options, Nostalgist.globalOptions.retroarchConfig, this.options.retroarchConfig)
    return options as typeof this.options.retroarchConfig
  }

  private async getRomOption() {
    const { resolveRom, rom } = this.options
    if (!rom) {
      return []
    }
    const romFiles = Array.isArray(rom) ? rom : [rom]

    return await Promise.all(romFiles.map((romFile) => this.resolveFile(romFile, resolveRom)))
  }

  private async getShaderOption() {
    const { resolveShader, shader } = this.options
    if (!shader) {
      return []
    }
    const shaderFile = await resolveShader(shader, this.options)
    if (Array.isArray(shaderFile)) {
      if (shaderFile.length > 0) {
        return await Promise.all(shaderFile.map((file) => this.resolveFile(file)))
      }
      return []
    }
    if (shaderFile) {
      return [await this.resolveFile(shaderFile)]
    }
    return []
  }

  private getStyleOption() {
    const { element, style } = this.options
    const defaultAppearanceStyle: Partial<CSSStyleDeclaration> = {
      backgroundColor: 'black',
      imageRendering: 'pixelated',
    }

    if (element) {
      merge(defaultAppearanceStyle, style)
      return defaultAppearanceStyle
    }

    const defaultLayoutStyle: Partial<CSSStyleDeclaration> = {
      height: '100%',
      left: '0',
      position: 'fixed',
      top: '0',
      width: '100%',
      zIndex: '1',
    }
    merge(defaultLayoutStyle, defaultAppearanceStyle, style)
    return defaultLayoutStyle
  }

  /**
   * Load options and then launch corresponding emulator if should
   */
  private async launch(): Promise<void> {
    await this.loadEmulatorOptions()
    checkIsAborted(this.options.signal)
    this.loadEmulator()

    if (!this.options.runEmulatorManually) {
      await this.launchEmulator()
    }
  }

  private static async launchSystem(system: string, options: NostalgistLaunchRomOptions | NostalgistOptionsFile) {
    const launchOptions =
      typeof options === 'string' || options instanceof File || ('fileName' in options && 'fileContent' in options)
        ? { rom: options }
        : options
    const core = Nostalgist.getCoreForSystem(system)
    return await Nostalgist.launch({ ...launchOptions, core })
  }

  private loadEmulator() {
    const emulatorOptions = this.getEmulatorOptions()
    const emulator = new Emulator(emulatorOptions)
    this.emulator = emulator
  }

  private async loadEmulatorOptions() {
    const {
      beforeLaunch,
      emscriptenModule = {},
      onLaunch,
      respondToGlobalEvents = true,
      signal,
      size = 'auto',
      state,
      waitForInteraction,
    } = this.options
    const element = this.getElementOption()
    const style = this.getStyleOption()
    const retroarchConfig = this.getRetroarchOption()
    const retroarchCoreConfig = this.getRetroarchCoreOption()
    const [core, rom, bios, shader] = await Promise.all([
      this.getCoreOption(),
      this.getRomOption(),
      this.getBiosOption(),
      this.getShaderOption(),
    ])

    checkIsAborted(signal)

    const emulatorOptions = {
      beforeLaunch,
      bios,
      core,
      element,
      emscriptenModule,
      nostalgist: this,
      onLaunch,
      respondToGlobalEvents,
      retroarchConfig,
      retroarchCoreConfig,
      rom,
      shader,
      signal,
      size,
      state,
      style,
      waitForInteraction,
    }
    this.emulatorOptions = emulatorOptions
  }

  private async resolveFile(file: NostalgistOptionsFile, resolveFunction?: NostalgistResolveFileFunction) {
    let fileName = ''
    let fileContent: Blob | undefined

    if (file instanceof File) {
      fileContent = file
      fileName = file.name
    } else if (file instanceof Blob) {
      fileContent = file
      fileName = 'rom.bin'
    } else if (typeof file === 'string') {
      const resolvedFile = await this.resolveStringFile(file, resolveFunction)
      fileName = resolvedFile.fileName
      fileContent = resolvedFile.fileContent
    } else {
      if (typeof file.fileName === 'string') {
        fileName = file.fileName
      }
      if (file.fileContent instanceof Blob) {
        fileContent = file.fileContent
      }
    }

    if (!fileContent) {
      throw new TypeError('file content is invalid')
    }

    fileName = fileName ? fileName.replaceAll(/["%*/:<>?\\|]/g, '-') : 'rom.bin'

    return { fileContent, fileName }
  }

  private async resolveStringFile(file: string, resolveFunction?: NostalgistResolveFileFunction) {
    let fileName = urlBaseName(file)
    let fileContent: Blob | undefined
    const resolvedRom = resolveFunction ? await resolveFunction(file, this.options) : file
    if (!resolvedRom) {
      throw new Error('file is invalid')
    }
    if (resolvedRom instanceof Blob) {
      fileContent = resolvedRom
    } else if (typeof resolvedRom === 'string') {
      fileName = urlBaseName(resolvedRom)
      const response = await this.fetch(resolvedRom)
      fileContent = await response.blob()
    }
    return { fileContent, fileName }
  }

  /**
   * Exit the current running game and the emulator. Remove the canvas element used by the emulator if needed.
   *
   * @see {@link https://nostalgist.js.org/apis/exit/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.exit()
   * ```
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * // the canvas element will not be removed
   * nostalgist.exit({ removeCanvas: false })
   * ```
   */
  exit({ removeCanvas = true }: { removeCanvas?: boolean } = {}) {
    this.getEmulator().exit()
    if (removeCanvas) {
      this.getCanvas().remove()
    }
  }

  /**
   * Get the BFSEmscriptenFS object of the current running emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/get-browser-fs/}
   */
  getBrowserFS() {
    const emulator = this.getEmulator()
    return emulator.browserFS
  }

  /**
   * Get the canvas DOM element that the current emulator is using.
   *
   * @see {@link https://nostalgist.js.org/apis/get-canvas/}
   */
  getCanvas() {
    return this.getEmulatorOptions().element
  }

  /**
   * Get the Emscripten FS object of the current running emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/get-emscripten-fs/}
   */
  getEmscriptenFS() {
    const emulator = this.getEmulator()
    const emscripten = emulator.getEmscripten()
    return emscripten.Module.FS
  }

  /**
   * Get the Emscripten Module object of the current running emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
   */
  getEmscriptenModule() {
    const emulator = this.getEmulator()
    const emscripten = emulator.getEmscripten()
    return emscripten.Module
  }

  getEmulator() {
    const { emulator } = this
    if (!emulator) {
      throw new Error('emulator is not ready')
    }
    return emulator
  }

  getEmulatorOptions() {
    if (!this.emulatorOptions) {
      throw new Error('emulator options are not ready')
    }
    return this.emulatorOptions
  }

  getOptions() {
    return this.options
  }

  /**
   * Launch the emulator, if it's not launched, because of the launch option `runEmulatorManually` being set to `true`.
   *
   * @see {@link https://nostalgist.js.org/apis/launch-emulator/}
   */
  async launchEmulator() {
    return await this.getEmulator().launch()
  }

  /**
   * Load a state for the current running emulator and game.
   *
   * @see {@link https://nostalgist.js.org/apis/load-state/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * // save the state
   * const { state } = await nostalgist.saveState(state)
   *
   * // load the state
   * await nostalgist.loadState(state)
   * ```
   */
  async loadState(state: Blob) {
    await this.getEmulator().loadState(state)
  }

  /**
   * Pause the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/pause/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.pause()
   * ```
   */
  pause() {
    this.getEmulator().pause()
  }

  /**
   * Press a button and then release it programmatically. Analog Joysticks are not supported by now.
   *
   * @see {@link https://nostalgist.js.org/apis/press/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * await nostalgist.press('start')
   * ```
   */
  async press(options: { button: string; player?: number; time?: number } | string) {
    const emulator = this.getEmulator()
    await (typeof options === 'string'
      ? emulator.press(options)
      : emulator.press(options.button, options.player, options.time))
  }

  /**
   * Press a button programmatically. Analog Joysticks are not supported by now.
   *
   * @see {@link https://nostalgist.js.org/apis/press-down/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.pressDown('start')
   * ```
   */
  pressDown(options: { button: string; player?: number } | string) {
    const emulator = this.getEmulator()
    if (typeof options === 'string') {
      return emulator.pressDown(options)
    }
    return emulator.pressDown(options.button, options.player)
  }

  /**
   * Release it programmatically. Analog Joysticks are not supported by now.
   *
   * @see {@link https://nostalgist.js.org/apis/press-up/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.pressUp('start')
   * ```
   */
  pressUp(options: { button: string; player?: number } | string) {
    const emulator = this.getEmulator()
    if (typeof options === 'string') {
      return emulator.pressUp(options)
    }
    return emulator.pressUp(options.button, options.player)
  }

  /**
   * Resize the canvas element of the emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/resize/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.resize({ width: 1000, height: 800 })
   * ```
   */
  resize(size: { height: number; width: number }) {
    return this.getEmulator().resize(size)
  }

  /**
   * Restart the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/restart/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.restart()
   * ```
   */
  restart() {
    this.getEmulator().restart()
  }

  /**
   * Resume the current running game, if it has been paused by `pause`.
   *
   * @see {@link https://nostalgist.js.org/apis/resume/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.pause()
   * await new Promise(resolve => setTimeout(resolve, 1000))
   * nostalgist.resume()
   * ```
   */
  resume() {
    this.getEmulator().resume()
  }

  /**
   * Save the state of the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/save-state/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * // save the state
   * const { state } = await nostalgist.saveState()
   *
   * // load the state
   * await nostalgist.loadState(state)
   * ```
   * @returns
   * A Promise of the state of the current running game.
   *
   * Its type is like `Promise<{ state: Blob, thumbnail: Blob | undefined }>`.
   *
   * If RetroArch is launched with the option `savestate_thumbnail_enable` set to `true`, which is the default value inside Nostalgist.js, then the `thumbnail` will be a `Blob`. Otherwise the `thumbnail` will be `undefined`.
   */
  async saveState() {
    return await this.getEmulator().saveState()
  }

  /**
   * Take a screenshot for the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/screenshot/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * const blob = await nostalgist.screenshot()
   * ```
   */
  async screenshot() {
    const emulator = this.getEmulator()
    return await emulator.screenshot()
  }

  /**
   * Send a command to RetroArch.
   * The commands are listed here: https://docs.libretro.com/development/retroarch/network-control-interface/#commands .
   * But not all of them are supported inside a browser.
   *
   * @see {@link https://nostalgist.js.org/apis/send-command/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.sendCommand('FAST_FORWARD')
   * ```
   */
  sendCommand(command: RetroArchCommand) {
    const emulator = this.getEmulator()
    return emulator.sendCommand(command)
  }
}
