import { getGlobalOptions } from '../libs/options.ts'
import { merge } from '../libs/utils.ts'
import type { NostalgistOptions } from '../types/nostalgist-options.ts'
import type { RetroArchEmscriptenModuleOptions } from '../types/retroarch-emscripten.ts'
import { ResolvableFile } from './resolvable-file.ts'

export class EmulatorOptions {
  beforeLaunch?: (() => Promise<void> | void) | undefined
  bios: ResolvableFile[] = []
  core: {
    /** the name of core */
    name: string

    /** the core's resolvable js file */
    js: ResolvableFile

    /** the core's resolvable wasm file */
    wasm: ResolvableFile
  } = {} as any
  element: HTMLCanvasElement
  /**
   * An option to override the `Module` object for Emscripten. See [Module object](https://emscripten.org/docs/api_reference/module.html).
   *
   * This is a low level option and not well tested, so use it at your own risk.
   */
  emscriptenModule: RetroArchEmscriptenModuleOptions

  respondToGlobalEvents: boolean
  rom: ResolvableFile[] = []
  shader: ResolvableFile[] = []

  signal?: AbortSignal | undefined

  /**
   *
   * The size of the canvas element.
   * If it's `'auto'`, the canvas element will keep its original size, or it's width and height will be updated as specified.
   */
  size?: 'auto' | { height: number; width: number }

  sram?: ResolvableFile | undefined

  state?: ResolvableFile | undefined

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
    this.respondToGlobalEvents = options.respondToGlobalEvents ?? true
    this.signal = options.signal
    this.size = options.size ?? 'auto'
    this.waitForInteraction = options.waitForInteraction
    this.element = this.getElement()
  }

  static async create(options: NostalgistOptions) {
    const emulatorOptions = new EmulatorOptions(options)
    await emulatorOptions.load()
    return emulatorOptions
  }

  async load() {
    await Promise.all([
      this.updateCore(),
      this.updateRom(),
      this.updateBios(),
      this.updateShader(),
      this.updateState(),
      this.updateSRAM(),
    ])
  }

  async updateSRAM() {
    if (this.nostalgistOptions.sram) {
      this.sram = await ResolvableFile.create(this.nostalgistOptions.sram)
    }
  }

  async updateState() {
    if (this.nostalgistOptions.state) {
      this.state = await ResolvableFile.create(this.nostalgistOptions.state)
    }
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

  private async updateBios() {
    const { bios, resolveBios } = this.nostalgistOptions
    if (!bios) {
      return []
    }
    const biosFiles = Array.isArray(bios) ? bios : [bios]
    this.bios = await Promise.all(
      biosFiles.map((raw) =>
        ResolvableFile.create(
          typeof raw === 'string'
            ? { raw, signal: this.signal, urlResolver: () => resolveBios(raw, this.nostalgistOptions) }
            : { raw, signal: this.signal },
        ),
      ),
    )
  }

  private async updateCore() {
    const { core, resolveCoreJs, resolveCoreWasm } = this.nostalgistOptions

    if (typeof core === 'object' && 'js' in core && 'name' in core && 'wasm' in core) {
      const [js, wasm] = await Promise.all([ResolvableFile.create(core.js), ResolvableFile.create(core.wasm)])
      this.core = { js, name: core.name, wasm }
      return core
    }

    const [coreResolvable, coreWasmResolvable] = await Promise.all(
      [resolveCoreJs, resolveCoreWasm].map((resolver) =>
        ResolvableFile.create({
          raw: core,
          signal: this.signal,
          urlResolver: () => resolver(core, this.nostalgistOptions),
        }),
      ),
    )

    const name = typeof core === 'string' ? core : coreResolvable.name

    this.core = { js: coreResolvable, name, wasm: coreWasmResolvable }
  }

  private async updateRom() {
    const { resolveRom, rom } = this.nostalgistOptions
    if (!rom) {
      return []
    }
    const romFiles = Array.isArray(rom) ? rom : [rom]

    this.rom = await Promise.all(
      romFiles.map((romFile) =>
        ResolvableFile.create(
          typeof romFile === 'string'
            ? { raw: romFile, signal: this.signal, urlResolver: () => resolveRom(romFile, this.nostalgistOptions) }
            : { raw: romFile, signal: this.signal },
        ),
      ),
    )
  }

  private async updateShader() {
    const { resolveShader, shader } = this.nostalgistOptions
    if (!shader) {
      return []
    }

    const rawShaderFile = await resolveShader(shader, this.nostalgistOptions)
    if (!rawShaderFile) {
      return []
    }

    const rawShaderFiles = Array.isArray(rawShaderFile) ? rawShaderFile : [rawShaderFile]
    this.shader = await Promise.all(
      rawShaderFiles.map((rawShaderFile) => ResolvableFile.create({ raw: rawShaderFile, signal: this.signal })),
    )
  }
}
