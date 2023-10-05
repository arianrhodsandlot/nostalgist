import { Emulator } from './emulator'
import { http } from './http'
import { getDefaultOptions } from './options'
import { EmulatorOptions } from './types/emulator-options'
import {
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

  static resetToDefaultOptions() {
    Nostalgist.configure(getDefaultOptions())
  }

  static configure(options: NostalgistOptionsPartial) {
    Nostalgist.globalOptions = {
      ...Nostalgist.globalOptions,
      ...options,
    }
  }

  static async launch(options: NostalgistLaunchOptions) {
    const nostalgist = new Nostalgist(options)
    await nostalgist.launch()
    return nostalgist
  }

  static async arcade(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('arcade', options)
  }

  static async atari2600(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('atari2600', options)
  }

  static async atari5200(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('atari5200', options)
  }

  static async atari7800(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('atari7800', options)
  }

  static async fds(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('fds', options)
  }

  static async gamegear(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('gamegear', options)
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

  static async ngp(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('ngp', options)
  }

  static async ngpc(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('ngpc', options)
  }

  static async sms(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('sms', options)
  }

  static async snes(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('snes', options)
  }

  static async vb(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('vb', options)
  }

  static async wonderswan(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('wonderswan', options)
  }

  static async wonderswancolor(options: string | NostalgistLaunchRomOptions) {
    return await Nostalgist.launchSystem('wonderswancolor', options)
  }

  private static getCoreForSystem(system: string) {
    return systemCoreMap[system]
  }

  private static async launchSystem(system: string, options: string | NostalgistLaunchRomOptions) {
    const launchOption = typeof options === 'string' ? { rom: options } : options
    const core = Nostalgist.getCoreForSystem(system)
    return await Nostalgist.launch({ ...launchOption, core })
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

  saveState() {
    return this.getEmulator().saveState()
  }

  loadState(state: Blob) {
    return this.getEmulator().loadState(state)
  }

  resume() {
    return this.getEmulator().resume()
  }

  pause() {
    return this.getEmulator().pause()
  }

  restart() {
    return this.getEmulator().restart()
  }

  exit() {
    return this.getEmulator().exit()
  }

  resize(width: number, height: number) {
    return this.getEmulator().resize(width, height)
  }

  private async launch() {
    await this.loadEmulatorOptions()
    this.loadEmulator()

    if (!this.options.runEmulatorManually) {
      await this.launchEmulator()
    }
  }

  private async loadEmulatorOptions() {
    const element = this.getElementOption()
    const retroarch = this.getRetroarchOption()
    const retroarchCore = this.getRetroarchCoreOption()
    const [core, rom, bios] = await Promise.all([this.getCoreOption(), this.getRomOption(), this.getBiosOption()])
    const emulatorOptions = { element, core, rom, bios, retroarch, retroarchCore }
    this.emulatorOptions = emulatorOptions
  }

  private getElementOption() {
    if (typeof document !== 'object') {
      throw new TypeError('document must be an object')
    }

    let { element } = this.options
    if (typeof element === 'string') {
      element = document.body.querySelector<HTMLCanvasElement>(element) || ''
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

  private async getCoreOption() {
    const { core, resolveCoreJs, resolveCoreWasm } = this.options
    const resolveParams = { core, options: this.options }
    const name = ''
    const coreDict =
      typeof core === 'string'
        ? { name: core, js: resolveCoreJs(resolveParams), wasm: resolveCoreWasm(resolveParams) }
        : core

    let { js, wasm } = coreDict
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
      const resolvedRom = resolveFunction({ file, options: this.options })
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

  private async launchEmulator() {
    return await this.getEmulator().launch()
  }
}
