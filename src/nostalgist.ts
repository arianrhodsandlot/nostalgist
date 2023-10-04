import { Emulator } from './emulator'
import { http } from './http'
import { getDefaultOptions } from './options'

const systemCoreMap = {
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

  private options = {}
  private emulatorOptions = {}
  private emulator = undefined

  private constructor(options) {
    this.options = {
      ...Nostalgist.globalOptions,
      ...options,
    }
  }

  static resetToDefaultOptions() {
    Nostalgist.configure(getDefaultOptions())
  }

  static configure(options) {
    Nostalgist.globalOptions = {
      ...Nostalgist.globalOptions,
      ...options,
    }
  }

  static async launch(options) {
    const nostalgist = new Nostalgist(options)
    await nostalgist.launch()
    return nostalgist
  }

  static async arcade(options) {
    return await Nostalgist.launchSystem('arcade', options)
  }

  static async atari2600(options) {
    return await Nostalgist.launchSystem('atari2600', options)
  }

  static async atari5200(options) {
    return await Nostalgist.launchSystem('atari5200', options)
  }

  static async atari7800(options) {
    return await Nostalgist.launchSystem('atari7800', options)
  }

  static async fds(options) {
    return await Nostalgist.launchSystem('fds', options)
  }

  static async gamegear(options) {
    return await Nostalgist.launchSystem('gamegear', options)
  }

  static async gb(options) {
    return await Nostalgist.launchSystem('gb', options)
  }

  static async gba(options) {
    return await Nostalgist.launchSystem('gba', options)
  }

  static async gbc(options) {
    return await Nostalgist.launchSystem('gbc', options)
  }

  static async megadrive(options) {
    return await Nostalgist.launchSystem('megadrive', options)
  }

  static async nes(options) {
    return await Nostalgist.launchSystem('nes', options)
  }

  static async ngp(options) {
    return await Nostalgist.launchSystem('ngp', options)
  }

  static async ngpc(options) {
    return await Nostalgist.launchSystem('ngpc', options)
  }

  static async sms(options) {
    return await Nostalgist.launchSystem('sms', options)
  }

  static async snes(options) {
    return await Nostalgist.launchSystem('snes', options)
  }

  static async vb(options) {
    return await Nostalgist.launchSystem('vb', options)
  }

  static async wonderswan(options) {
    return await Nostalgist.launchSystem('wonderswan', options)
  }

  static async wonderswancolor(options) {
    return await Nostalgist.launchSystem('wonderswancolor', options)
  }

  private static getCoreForSystem(system) {
    return systemCoreMap[system]
  }

  private static async launchSystem(system, options) {
    if (typeof options === 'string') {
      options = { rom: options }
    }
    const core = await Nostalgist.getCoreForSystem(system)
    return await Nostalgist.launch({ ...options, core })
  }

  getEmulator() {
    const { emulator } = this
    if (!emulator) {
      throw new Error('emulator is not ready')
    }
    return emulator
  }

  getEmulatorOptions() {
    return this.emulatorOptions
  }

  getOptions() {
    return this.options
  }

  saveState() {
    return this.getEmulator().saveState()
  }

  loadState() {
    return this.getEmulator().loadState()
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
    let { element } = this.options
    if (typeof document === 'object') {
      if (typeof element === 'string') {
        element = document.body.querySelector(element)
      }
      if (!element) {
        element = document.createElement('canvas')
      }
    }
    return element
  }

  private async getCoreOption() {
    let { core } = this.options

    if (typeof core === 'string') {
      const { resolveCoreJs } = this.options
      const coreJs = resolveCoreJs(core)
      const { resolveCoreWasm } = this.options
      const coreWasm = resolveCoreWasm(core)
      core = { js: coreJs, wasm: coreWasm }
    }

    let { js, wasm } = core
    if (typeof js === 'string') {
      js = await http(js).text()
    }
    if (typeof wasm === 'string') {
      wasm = await http(wasm).arrayBuffer()
    }
    return { js, wasm }
  }

  private async resolveFile(file, resolveFunction) {
    let fileName = ''
    let fileContent: Blob

    if (file instanceof File) {
      fileContent = file
      fileName = file.name
    } else if (file instanceof Blob) {
      fileContent = file
    } else if (typeof file === 'string') {
      fileName = baseName(file)
      const resolvedRom = await resolveFunction(file)
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
      throw new Error('file is invalid')
    }

    fileName ||= 'rom.bin'

    return { fileName, fileContent }
  }

  private async getRomOption() {
    const { rom } = this.options
    if (!rom) {
      return []
    }
    const romFiles = Array.isArray(rom) ? rom : [rom]

    return await Promise.all(romFiles.map((romFile) => this.resolveFile(romFile, this.options.resolveRom)))
  }

  private async getBiosOption() {
    const { bios } = this.options
    if (!bios || bios.length === 0) {
      return []
    }
    const biosFiles = Array.isArray(bios) ? bios : [bios]
    return await Promise.all(biosFiles.map((romFile) => this.resolveFile(romFile, this.options.resolveBios)))
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
