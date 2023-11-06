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
import { vendors } from './vendors'

function baseName(url: string) {
  let name = url.split('/').pop() || ''
  name = decodeURIComponent(name)
  return name
}

export class Nostalgist {
  static Nostalgist = Nostalgist
  static vendors = vendors

  private static globalOptions = getDefaultOptions()

  private options: NostalgistOptions
  private emulatorOptions: EmulatorOptions | undefined
  private emulator: Emulator | undefined

  private constructor(options: NostalgistLaunchOptions) {
    const mergedOptions = {
      ...Nostalgist.globalOptions,
      ...options,
    }
    this.options = mergedOptions
  }

  /**
   * Reset the global configuation set by `Nostalgist.configure` to default.
   */
  static resetToDefault() {
    Nostalgist.configure(getDefaultOptions())
  }

  /**
   * Update the global options for `Nostalgist`, so everytime the `Nostalgist.launch` method or shortcuts like `Nostalgist.nes` is called, the default options specified here will be used.
   *
   * You may want to specify how to resolve ROMs and RetroArch cores here.
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
    Nostalgist.globalOptions = {
      ...Nostalgist.globalOptions,
      ...options,
    }
  }

  /**
   * Launch an emulator and return a `Promise` of the instance of the emulator.
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
   *   resolveRom({ file }) {
   *     return `https://example.com/roms/${file}`
   *   },
   *   resolveBios({ file }) {
   *     return `https://example.com/system/${file}`
   *   },
   * })
   * ```
   */
  static async launch(options: NostalgistLaunchOptions) {
    const nostalgist = new Nostalgist(options)
    await nostalgist.launch()
    return nostalgist
  }

  static async gb(options: NostalgistOptionsFile | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('gb', options)
  }

  static async gba(options: NostalgistOptionsFile | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('gba', options)
  }

  static async gbc(options: NostalgistOptionsFile | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('gbc', options)
  }

  static async megadrive(options: NostalgistOptionsFile | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('megadrive', options)
  }

  static async nes(options: NostalgistOptionsFile | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('nes', options)
  }

  static async snes(options: NostalgistOptionsFile | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('snes', options)
  }

  private static getCoreForSystem(system: string) {
    return systemCoreMap[system]
  }

  private static async launchSystem(system: string, options: NostalgistOptionsFile | NostalgistLaunchRomOptions) {
    const launchOptions =
      typeof options === 'string' || options instanceof File || ('fileName' in options && 'fileContent' in options)
        ? { rom: options }
        : options
    const core = Nostalgist.getCoreForSystem(system)
    return await Nostalgist.launch({ ...launchOptions, core })
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

  getCanvas() {
    return this.getEmulatorOptions().element
  }

  async launchEmulator() {
    return await this.getEmulator().launch()
  }

  getEmscriptenModule() {
    const emulator = this.getEmulator()
    const emscripten = emulator.getEmscripten()
    return emscripten.Module
  }

  getEmscriptenFS() {
    const emulator = this.getEmulator()
    const emscripten = emulator.getEmscripten()
    return emscripten.Module.FS
  }

  getOptions() {
    return this.options
  }

  /**
   * Save the state of the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/save-state}
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
   * @returns
   * The state of the current running game.
   *
   * Its type is like `{ state: Blob, thumbnail: Blob | undefined }`.
   *
   * If RetroArch is launched with the option `savestate_thumbnail_enable` set to `true`, which is the default value inside Nostalgist.js, then the `thumbnail` will be a `Blob`. Otherwise the `thumbnail` will be `undefined`.
   */
  async saveState() {
    return await this.getEmulator().saveState()
  }

  /**
   * Load a state for the current running emulator and game.
   *
   * @see {@link https://nostalgist.js.org/apis/load-state}
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
   * Resume the current running game, if it has been paused by `pause`.
   *
   * @see {@link https://nostalgist.js.org/apis/resume}
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
   * Pause the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/pause}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * await nostalgist.pause()
   * ```
   */
  pause() {
    this.getEmulator().pause()
  }

  /**
   * Restart the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/restart}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * await nostalgist.restart()
   * ```
   */
  restart() {
    this.getEmulator().restart()
  }

  /**
   * Exit the current running game and the emulator. Remove the canvas element used by the emulator if needed.
   *
   * @see {@link https://nostalgist.js.org/apis/exit}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * await nostalgist.exit()
   * ```
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * // the canvas element will not be removed
   * await nostalgist.exit({ removeCanvas: false })
   * ```
   */
  exit({ removeCanvas = true }: { removeCanvas?: boolean } = {}) {
    this.getEmulator().exit()
    if (removeCanvas) {
      this.getCanvas().remove()
    }
  }

  /**
   * Resize the canvas element of the emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/resize}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * await nostalgist.resize({ width: 1000, height: 800 })
   * ```
   */
  resize(size: { width: number; height: number }) {
    return this.getEmulator().resize(size)
  }

  pressDown(options: string | { button: string; player?: number }) {
    const emulator = this.getEmulator()
    if (typeof options === 'string') {
      return emulator.pressDown(options)
    }
    return emulator.pressDown(options.button, options.player)
  }

  pressUp(options: string | { button: string; player?: number }) {
    const emulator = this.getEmulator()
    if (typeof options === 'string') {
      return emulator.pressUp(options)
    }
    return emulator.pressUp(options.button, options.player)
  }

  press(options: string | { button: string; player?: number; time?: number }) {
    const emulator = this.getEmulator()
    if (typeof options === 'string') {
      return emulator.press(options)
    }
    return emulator.press(options.button, options.player, options.time)
  }

  /**
   * Load options and then launch corresponding emulator if should
   */
  private async launch(): Promise<void> {
    await this.loadEmulatorOptions()
    this.loadEmulator()

    if (!this.options.runEmulatorManually) {
      await this.launchEmulator()
    }
  }

  private async loadEmulatorOptions() {
    const { size = 'auto', respondToGlobalEvents = true, waitForInteraction, emscriptenModule = {} } = this.options
    const element = this.getElementOption()
    const style = this.getStyleOption()
    const retroarchConfig = this.getRetroarchOption()
    const retroarchCoreConfig = this.getRetroarchCoreOption()
    const [core, rom, bios] = await Promise.all([this.getCoreOption(), this.getRomOption(), this.getBiosOption()])
    const emulatorOptions = {
      element,
      style,
      size,
      core,
      rom,
      bios,
      respondToGlobalEvents,
      retroarchConfig,
      retroarchCoreConfig,
      waitForInteraction,
      emscriptenModule,
    }
    this.emulatorOptions = emulatorOptions
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

  private getStyleOption() {
    const { element, style } = this.options
    const defaultAppearanceStyle: Partial<CSSStyleDeclaration> = {
      backgroundColor: 'black',
      imageRendering: 'pixelated',
    }

    if (element) {
      return {
        ...defaultAppearanceStyle,
        ...style,
      }
    }

    const defaultLayoutStyle: Partial<CSSStyleDeclaration> = {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '1',
    }
    return {
      ...defaultLayoutStyle,
      ...defaultAppearanceStyle,
      ...style,
    }
  }

  private async getCoreOption() {
    const { core, resolveCoreJs, resolveCoreWasm } = this.options
    const coreDict =
      typeof core === 'string'
        ? { name: core, js: await resolveCoreJs(core, this.options), wasm: await resolveCoreWasm(core, this.options) }
        : core

    let { name, js, wasm } = coreDict
    if (typeof js === 'string') {
      const response = await fetch(js)
      js = await response.text()
    }
    if (typeof wasm === 'string') {
      const response = await fetch(wasm)
      wasm = await response.arrayBuffer()
    }
    return { name, js, wasm }
  }

  private async resolveFile(file: NostalgistOptionsFile, resolveFunction: NostalgistResolveFileFunction) {
    let fileName = ''
    let fileContent: Blob | false = false

    if (file instanceof File) {
      fileContent = file
      fileName = file.name
    } else if (file instanceof Blob) {
      fileContent = file
    } else if (typeof file === 'string') {
      fileName = baseName(file)
      const resolvedRom = await resolveFunction(file, this.options)
      if (resolvedRom instanceof Blob) {
        fileContent = resolvedRom
      } else if (typeof resolvedRom === 'string') {
        fileName = baseName(resolvedRom)
        const response = await fetch(resolvedRom)
        fileContent = await response.blob()
      }
    } else {
      if (typeof file.fileName === 'string') {
        fileName = file.fileName
      }
      if (file.fileContent instanceof Blob) {
        fileContent = file.fileContent
      }
    }

    if (!fileContent) {
      throw new TypeError('file is invalid')
    }

    fileName ||= 'rom.bin'

    return { fileName, fileContent }
  }

  private async getRomOption() {
    const { rom, resolveRom } = this.options
    if (!rom) {
      return []
    }
    const romFiles = Array.isArray(rom) ? rom : [rom]

    return await Promise.all(romFiles.map((romFile) => this.resolveFile(romFile, resolveRom)))
  }

  private async getBiosOption() {
    const { bios, resolveBios } = this.options
    if (!bios) {
      return []
    }
    const biosFiles = Array.isArray(bios) ? bios : [bios]
    return await Promise.all(biosFiles.map((biosFile) => this.resolveFile(biosFile, resolveBios)))
  }

  private getRetroarchOption() {
    return {
      ...Nostalgist.globalOptions.retroarchConfig,
      ...this.options.retroarchConfig,
    }
  }

  private getRetroarchCoreOption() {
    return {
      ...Nostalgist.globalOptions.retroarchCoreConfig,
      ...this.options.retroarchCoreConfig,
    }
  }

  private loadEmulator() {
    const emulatorOptions = this.getEmulatorOptions()
    const emulator = new Emulator(emulatorOptions)
    this.emulator = emulator
  }
}
