import { Emulator } from './emulator'
import { http } from './http'
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

const systemCoreMap: Record<string, string> = {
  arcade: 'fbneo',
  atari2600: 'stella2014',
  atari5200: 'a5200',
  atari7800: 'prosystem',
  fds: 'fceumm',
  gamegear: 'genesis_plus_gx',
  gb: 'mgba',
  gba: 'mgba',
  gbc: 'mgba',
  megadrive: 'genesis_plus_gx',
  nes: 'fceumm',
  ngp: 'mednafen_ngp',
  ngpc: 'mednafen_ngp',
  sms: 'genesis_plus_gx',
  snes: 'snes9x',
  vb: 'mednafen_vb',
  wonderswan: 'mednafen_wswan',
  wonderswancolor: 'mednafen_wswan',
}

function baseName(url: string) {
  let name = url.split('/').pop() || ''
  name = decodeURIComponent(name)
  return name
}

export class Nostalgist {
  static Nostalgist = Nostalgist

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
  static resetToDefaultOptions() {
    Nostalgist.configure(getDefaultOptions())
  }

  /**
   * Update the global configuation for `Nostalgist.launch` or other shortcuts, like `Nostalgist.nes`
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
   *   resolveCoreJs({ core }) {
   *     return `https://example.com/core/${core}_libretro.js`
   *   },
   *   resolveCoreWasm({ core }) {
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

  static async gb(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('gb', options)
  }

  static async gba(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('gba', options)
  }

  static async gbc(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('gbc', options)
  }

  static async megadrive(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('megadrive', options)
  }

  static async nes(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('nes', options)
  }

  static async snes(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('snes', options)
  }

  private static getCoreForSystem(system: string) {
    return systemCoreMap[system]
  }

  private static async launchSystem(system: string, options: string | NostalgistLaunchRomOptions) {
    const launchOptions = typeof options === 'string' ? { rom: options } : options
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

  getEmulatorEmscriptenModule() {
    const emulator = this.getEmulator()
    return emulator.emscripten.Module
  }

  getEmulatorEmscriptenFS() {
    const emulator = this.getEmulator()
    return emulator.emscripten.FS
  }

  getOptions() {
    return this.options
  }

  async saveState() {
    return await this.getEmulator().saveState()
  }

  async loadState(state: Blob) {
    await this.getEmulator().loadState(state)
  }

  resume() {
    this.getEmulator().resume()
  }

  pause() {
    this.getEmulator().pause()
  }

  restart() {
    this.getEmulator().restart()
  }

  exit({ removeCanvas = true }: { removeCanvas?: boolean } = {}) {
    this.getEmulator().exit()
    if (removeCanvas) {
      this.getCanvas().remove()
    }
  }

  resize(size: { width: number; height: number }) {
    return this.getEmulator().resize(size)
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
    const { waitForInteraction } = this.options
    const element = this.getElementOption()
    const size = this.getSizeOption(element)
    const retroarch = this.getRetroarchOption()
    const retroarchCore = this.getRetroarchCoreOption()
    const [core, rom, bios] = await Promise.all([this.getCoreOption(), this.getRomOption(), this.getBiosOption()])
    const emulatorOptions = { element, size, core, rom, bios, retroarch, retroarchCore, waitForInteraction }
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
      if (!element.isConnected) {
        document.body.append(element)
      }
      element.id = 'canvas'
      return element
    }

    throw new TypeError('invalid element')
  }

  private getSizeOption(element: HTMLCanvasElement) {
    const { size } = this.options
    return !size || size === 'auto' ? { width: element.offsetWidth, height: element.offsetHeight } : size
  }

  private async getCoreOption() {
    const { core, resolveCoreJs, resolveCoreWasm } = this.options
    const coreDict =
      typeof core === 'string'
        ? { name: core, js: await resolveCoreJs(core, this.options), wasm: await resolveCoreWasm(core, this.options) }
        : core

    let { name, js, wasm } = coreDict
    if (typeof js === 'string') {
      js = await http(js).text()
    }
    if (typeof wasm === 'string') {
      wasm = await http(wasm).arrayBuffer()
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
        fileContent = await http(resolvedRom).blob()
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
