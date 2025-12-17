import { getGlobalOptions } from '../libs/options.ts'
import { generateValidFileName, getResult, merge } from '../libs/utils.ts'
import type { NostalgistOptions } from '../types/nostalgist-options.ts'
import type { RetroArchEmscriptenModuleOptions } from '../types/retroarch-emscripten.ts'
import { ResolvableFile } from './resolvable-file.ts'

// Copied from https://github.com/sindresorhus/is-plain-obj/blob/main/index.js
function isPlainObject(value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return (
    (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  )
}

function isValidCacheKey(cacheKey: unknown) {
  return typeof cacheKey === 'string' || isPlainObject(cacheKey)
}

function getCacheStore() {
  return {
    bios: new Map<NonNullable<NostalgistOptions['bios']>, EmulatorOptions['bios']>(),
    core: new Map<NonNullable<NostalgistOptions['core']>, EmulatorOptions['core']>(),
    rom: new Map<NonNullable<NostalgistOptions['rom']>, EmulatorOptions['rom']>(),
    shader: new Map<NonNullable<NostalgistOptions['shader']>, EmulatorOptions['shader']>(),
    sram: new Map<NonNullable<NostalgistOptions['sram']>, EmulatorOptions['sram']>(),
    state: new Map<NonNullable<NostalgistOptions['state']>, EmulatorOptions['state']>(),
  }
}

export class EmulatorOptions {
  static readonly cacheStorage = getCacheStore()
  beforeLaunch?: (() => Promise<void> | void) | undefined
  bios: ResolvableFile[] = []
  cache = { bios: false, core: false, rom: false, shader: false, sram: false, state: false }
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

  private loadPromises: Promise<void>[] = []

  private nostalgistOptions: NostalgistOptions

  private constructor(options: NostalgistOptions) {
    this.nostalgistOptions = options

    this.emscriptenModule = options.emscriptenModule ?? {}
    this.respondToGlobalEvents = options.respondToGlobalEvents ?? true
    this.signal = options.signal
    this.size = options.size ?? 'auto'
    // eslint-disable-next-line sonarjs/deprecation
    this.waitForInteraction = options.waitForInteraction
    this.element = this.getElement()

    if (typeof options.cache === 'boolean') {
      for (const key in this.cache) {
        this.cache[key as keyof typeof this.cache] = options.cache
      }
    } else {
      Object.assign(this.cache, options.cache)
    }
  }

  static async create(options: NostalgistOptions) {
    const emulatorOptions = new EmulatorOptions(options)
    await emulatorOptions.load()
    return emulatorOptions
  }

  static resetCacheStore() {
    Object.assign(EmulatorOptions.cacheStorage, getCacheStore())
  }

  async load() {
    this.loadFromCache()
    await Promise.all(this.loadPromises)
    this.saveToCache()
  }

  loadFromCache() {
    const loadPromises: Promise<void>[] = []
    const loadMethodMap = {
      bios: this.updateBios,
      core: this.updateCore,
      rom: this.updateRom,
      shader: this.updateShader,
      sram: this.updateSRAM,
      state: this.updateState,
    }
    for (const key in this.cache) {
      const field = key as keyof typeof this.cache
      if (this.cache[field]) {
        const cache = EmulatorOptions.cacheStorage[field]
        const cacheKey: any = this.nostalgistOptions[field]
        if (isValidCacheKey(cacheKey)) {
          const cacheValue = cache.get(cacheKey)
          if (cacheValue) {
            this[field] = cacheValue as any
            continue
          }
        }
      }
      const method = loadMethodMap[field]
      const promise = method.call(this)
      loadPromises.push(promise)
    }
    this.loadPromises = loadPromises
  }

  saveToCache() {
    for (const key in this.cache) {
      const field = key as keyof typeof this.cache
      if (this.cache[field]) {
        const cache = EmulatorOptions.cacheStorage[field]
        const cacheKey: any = this.nostalgistOptions[field]
        const cacheValue: any = this[field]
        if (isValidCacheKey(cacheKey) && cacheValue) {
          cache.set(cacheKey, cacheValue)
        }
      }
    }
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
    let { bios, resolveBios } = this.nostalgistOptions
    if (!bios) {
      return
    }
    bios = await getResult(bios)
    if (!bios) {
      return
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
      return
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
    let { resolveRom, rom } = this.nostalgistOptions
    if (!rom) {
      return
    }
    rom = await getResult(rom)
    if (!rom) {
      return
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
    for (const resolvable of this.rom) {
      resolvable.name ||= generateValidFileName()
    }
  }

  private async updateShader() {
    let { resolveShader, shader } = this.nostalgistOptions
    if (!shader) {
      return
    }
    shader = await getResult(shader)
    if (!shader) {
      return
    }

    let rawShaderFile = await resolveShader(shader, this.nostalgistOptions)
    if (!rawShaderFile) {
      return
    }
    rawShaderFile = await getResult(rawShaderFile)
    if (!rawShaderFile) {
      return
    }

    const rawShaderFiles = Array.isArray(rawShaderFile) ? rawShaderFile : [rawShaderFile]
    this.shader = await Promise.all(
      rawShaderFiles.map((rawShaderFile) => ResolvableFile.create({ raw: rawShaderFile, signal: this.signal })),
    )
  }
}
