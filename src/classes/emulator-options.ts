import { getGlobalOptions } from '../libs/options.js'
import { merge, urlBaseName } from '../libs/utils.js'
import type {
  NostalgistOptions,
  NostalgistOptionsFile,
  NostalgistResolveFileFunction,
} from '../types/nostalgist-options.js'
import type { RetroArchEmscriptenModuleOptions } from '../types/retroarch-emscripten'

export class EmulatorOptions {
  beforeLaunch?: (() => Promise<void> | void) | undefined
  bios: { fileContent: Blob; fileName: string }[] = []
  core: {
    /** the name of core */
    name: string

    /** the content of core's js file */
    js: string

    /** the array buffer of core's wasm file */
    wasm: ArrayBuffer
  } = {} as any
  element: HTMLCanvasElement
  /**
   * An option to override the `Module` object for Emscripten. See [Module object](https://emscripten.org/docs/api_reference/module.html).
   *
   * This is a low level option and not well tested, so use it at your own risk.
   */
  emscriptenModule: RetroArchEmscriptenModuleOptions

  respondToGlobalEvents: boolean
  rom: { fileContent: Blob; fileName: string }[] = []
  shader: { fileContent: Blob; fileName: string }[] = []

  signal?: AbortSignal | undefined

  /**
   *
   * The size of the canvas element.
   * If it's `'auto'`, the canvas element will keep its original size, or it's width and height will be updated as specified.
   */
  size?: 'auto' | { height: number; width: number }

  state?: Blob | undefined

  waitForInteraction: ((params: { done: () => void }) => void) | undefined

  /**
   * RetroArch config.
   * Not all options can make effects in browser.
   */
  get retroarchConfig() {
    const options = {}
    merge(options, getGlobalOptions().retroarchConfig, this.nostalgistOptions.retroarchConfig)
    return options as typeof this.nostalgistOptions.retroarchConfig
  }

  /**
   * RetroArch core config.
   * Not all options can make effects in browser.
   */
  get retroarchCoreConfig() {
    const options = {}
    merge(options, getGlobalOptions().retroarchCoreConfig, this.nostalgistOptions.retroarchCoreConfig)
    return options as typeof this.nostalgistOptions.retroarchCoreConfig
  }

  get style() {
    const { element, style } = this.nostalgistOptions
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

  private nostalgistOptions: NostalgistOptions

  private constructor(options: NostalgistOptions) {
    this.nostalgistOptions = options

    this.emscriptenModule = options.emscriptenModule ?? {}
    this.respondToGlobalEvents = options.respondToGlobalEvents || true
    this.signal = options.signal
    this.size = options.size ?? 'auto'
    this.state = options.state
    this.waitForInteraction = options.waitForInteraction
    this.element = this.getElement()
  }

  static async create(options: NostalgistOptions) {
    const emulatorOptions = new EmulatorOptions(options)
    await emulatorOptions.load()
    return emulatorOptions
  }

  async load() {
    const [core, rom, bios, shader] = await Promise.all([
      this.getCoreOption(),
      this.getRomOption(),
      this.getBiosOption(),
      this.getShaderOption(),
    ])
    this.core = core
    this.rom = rom
    this.bios = bios
    this.shader = shader
  }

  private async fetch(input: string) {
    const { signal = null } = this.nostalgistOptions
    return await fetch(input, { signal })
  }

  private async getBiosOption() {
    const { bios, resolveBios } = this.nostalgistOptions
    if (!bios) {
      return []
    }
    const biosFiles = Array.isArray(bios) ? bios : [bios]
    return await Promise.all(biosFiles.map((biosFile) => this.resolveFile(biosFile, resolveBios)))
  }

  private async getCoreOption() {
    const { core, resolveCoreJs, resolveCoreWasm } = this.nostalgistOptions
    let coreDict
    if (typeof core === 'string') {
      const [js, wasm] = await Promise.all([
        resolveCoreJs(core, this.nostalgistOptions),
        resolveCoreWasm(core, this.nostalgistOptions),
      ])
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

  private getElement() {
    if (typeof document !== 'object') {
      throw new TypeError('document must be an object')
    }
    let { element } = this.nostalgistOptions
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

  private async getRomOption() {
    const { resolveRom, rom } = this.nostalgistOptions
    if (!rom) {
      return []
    }
    const romFiles = Array.isArray(rom) ? rom : [rom]

    return await Promise.all(romFiles.map((romFile) => this.resolveFile(romFile, resolveRom)))
  }

  private async getShaderOption() {
    const { resolveShader, shader } = this.nostalgistOptions
    if (!shader) {
      return []
    }
    const shaderFile = await resolveShader(shader, this.nostalgistOptions)
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
    const resolvedRom = resolveFunction ? await resolveFunction(file, this.nostalgistOptions) : file
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
}
