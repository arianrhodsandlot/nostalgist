import type { Nostalgist } from '..'
import type { ResolvableFileInput, ResolvableFileInputs } from '../classes/resolvable-file'
import type { RetroArchConfig } from './retroarch-config'
import type { RetroArchEmscriptenModuleOptions } from './retroarch-emscripten'

export interface NostalgistCoreDict {
  /** the name of core */
  name: string

  /** the resolvable file of core's js file */
  js: ResolvableFileInput

  /** the resolvable file of core's wasm file */
  wasm: ResolvableFileInput
}

export type NostalgistResolveFileFunction = (file: string, options: NostalgistOptions) => ResolvableFileInput

export interface NostalgistCheat {
  /** The cheat code, in whatever format the core expects, like `"SXIOPO"` or `"00AE:41"`. */
  code: string

  /**
   * A label for the cheat. It's never sent to RetroArch, which has no way to receive it, but it can be
   * passed to `enableCheat` and `disableCheat` to avoid having to keep track of indices.
   */
  description?: string

  /**
   * Whether the cheat should be applied. Cheats are added disabled, so that a whole cheat file can be loaded
   * and then picked from.
   * @defaultValue false
   */
  enabled?: boolean
}

/** A cheat, or just its code. */
export type NostalgistCheatInput = NostalgistCheat | string

/**
 * A way to point at one or more of the cheats that have been added.
 * A number is an index, and a string is matched against descriptions first, then against codes.
 */
export type NostalgistCheatTarget = number | string

export type NostalgistLogLevel = 'debug' | 'error' | 'info' | 'warn'

export interface NostalgistLogEvent {
  /**
   * The level of the message, parsed from the tag RetroArch puts at the start of every log line.
   * A line that arrives without a tag is reported as `'info'` if it was written to standard output,
   * or as `'error'` if it was written to standard error.
   */
  level: NostalgistLogLevel

  /** The message, with its level tag removed. */
  message: string

  /**
   * Whether the message was emitted by the libretro core, or by RetroArch itself.
   * Core messages are the ones RetroArch tags with `"[libretro ...]"`.
   */
  source: 'core' | 'frontend'
}

export type NostalgistLogHandler = (event: NostalgistLogEvent) => void

export interface NostalgistOptions {
  /**
   * The canvas element to use.
   * @defaultValue '' an empty string
   */
  element: HTMLCanvasElement | string

  /**
   * The style of the canvas element.
   *
   * The CSS rule name should be "camelCase" instead of "kebab-case". For example, `{ backgroundColor: 'black' }` is valid, but `{ background-color: '' }` is not.
   *
   * If the canvas element is created automatically, the style will be
   * ```js
   * {
   *   position: 'fixed',
   *   top: '0',
   *   left: '0',
   *   width: '100%',
   *   height: '100%',
   *   backgroundColor: 'black',
   *   zIndex: '1',
   * }
   * ```
   * otherwise it will be `undefined`.
   */
  style?: Partial<CSSStyleDeclaration>

  /**
   *
   * The size of the canvas element.
   * If it's `'auto'`, the canvas element will keep its original size, or it's width and height will be updated as specified.
   */
  size?: 'auto' | { height: number; width: number }

  core: NostalgistCoreDict | string

  /**
   * The rom needs to be launched.
   *
   * This property can be:
   * + a string.
   * + a [File object](https://developer.mozilla.org/en-US/docs/Web/API/File).
   * + a plain object, with a fileName property and a fileContent property.
   * + an array of above.
   *
   * @example
   * If it's a url, that's saying, it starts with `"http://"` or `"https://"`, a request will be sent to grab its content.
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   rom: 'https://example.com/contra.nes'
   * })
   * ```
   *
   * @example
   * If it's a normal string, it will be passed to `options.resolveRom`, another function option that should return a [resolvable file](https://nostalgist.js.org/apis/resolvable-file).
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   rom: 'contra.nes',
   *   resolveRom({ file }) {
   *     return `https://example.com/roms/${file}`
   *   },
   * })
   * ```
   *
   * Bear in mind if you want to load your ROM via url, you should make sure you can access that url by CORS.
   *
   * @example
   * If it's a `File` object, its content and file name will be directly used for emulation.
   * ```js
   * const rom = await showFilePicker()
   * const nostalgist = await Nostalgist.launch({
   *   rom,
   * })
   *
   * ```
   *
   * @example
   * If it's an plain object, here is an example.
   * ```js
   * const fileContent = await fetch('http://example.com/contra.nes')
   * const nostalgist = await Nostalgist.launch({
   *   rom: {
   *     fileName: 'contra.nes',
   *     fileContent,
   *   }
   * })
   * ```
   *
   * @example
   * For some situations, we may need multiple files for emulation. Then we need to pass an array here.
   * ```js
   * const blob = await showFilePicker()
   * const fileContent = await fetch('http://example.com/contra.nes')
   * const nostalgist = await Nostalgist.launch({
   *   rom: ['rom1.bin', blob, {
   *     fileName: 'rom2.bin',
   *     fileContent,
   *   }]
   * })
   * ```
   *
   *  * @example
   * In case of a multidisc game we need to pass an array that includes a playlist file (.m3u) as the first element following all roms in their logical order.
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   rom: ['game.m3u', 'game_cd1.chd', 'game_cd2.chd']
   * })
   * ```
   */
  rom?: ResolvableFileInput | ResolvableFileInputs

  /**
   * The name of the shader to be used.
   * By default, shaders will be loaded from https://github.com/libretro/glsl-shaders in a loose way, while this can be changed by customizing the `resolveShader` option.
   */
  shader?: string

  /**
   * The BIOS files needed to be launched with roms.
   *
   * This property can be:
   * + a string
   * + a [File object](https://developer.mozilla.org/en-US/docs/Web/API/File)
   * + an object, with a fileName property and a fileContent property. for example: `{ filename: 'xx.nes', fileContent: someBlob }`
   * + an array of above
   */
  bios?: ResolvableFileInput | ResolvableFileInputs

  /**
   * The initial state to be loaded after launching.
   */
  state?: ResolvableFileInput

  /**
   * The initial SRAM to be loaded after launching.
   */
  sram?: ResolvableFileInput

  /**
   * The type of battery save the core generates.
   */
  sramType?: 'sav' | 'srm'

  /**
   * The cheats to be added after launching. Each one can be a cheat code, or an object describing a cheat.
   *
   * Cheats are added disabled, so `enabled` needs to be set for a cheat to be applied, or `enableCheat`
   * needs to be called later.
   *
   * Cheats are only supported by cores built from RetroArch v1.21.0 or later, and only by cores that
   * implement cheats themselves.
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   core: 'fceumm',
   *   rom: 'contra.nes',
   *   cheats: [
   *     { code: '00AE:41', description: 'Totally Invincible P1', enabled: true },
   *     { code: '0033:09', description: 'Infinite Lives P2' },
   *   ],
   * })
   * ```
   */
  cheats?: NostalgistCheatInput[]

  respondToGlobalEvents?: boolean

  /**
   * RetroArch config.
   * Not all options can make effects in browser.
   */
  retroarchConfig: RetroArchConfig

  /**
   * RetroArch core config.
   * Not all options can make effects in browser.
   */
  retroarchCoreConfig: Record<string, string>

  /**
   * DO NOT use this option. It's for CI testing purposes only.
   * @internal
   */
  setupEmulatorManually: boolean

  /**
   * If this is set to true, emulator will not run automatically.
   * To run the emulator, `nostalgist.launchEmulator` should be called later.
   * Default value is `false`.
   */
  runEmulatorManually: boolean

  /**
   * An option to override the `Module` object for Emscripten. See [Module object](https://emscripten.org/docs/api_reference/module.html).
   *
   * This is a low level option and not well tested, so use it at your own risk.
   */
  emscriptenModule?: RetroArchEmscriptenModuleOptions

  /**
   * The `AbortSignal` object used for cancelling a launch.
   */
  signal?: AbortSignal

  cache?: { bios?: boolean; core?: boolean; rom?: boolean; shader?: boolean; sram?: boolean; state?: boolean } | boolean

  beforeLaunch?: (nostalgist: Nostalgist) => Promise<void> | void
  onLaunch?: (nostalgist: Nostalgist) => Promise<void> | void

  /**
   * A function called for every message logged by RetroArch and the libretro core.
   *
   * Specifying this option replaces the default behavior, which is to write messages to the browser console,
   * so a handler that does not log anything will silence the emulator's output.
   *
   * Bear in mind that RetroArch only emits most of its messages when verbose logging is enabled, so
   * `retroarchConfig` likely needs `{ log_verbosity: true }` for this to report much of anything.
   *
   * `emscriptenModule.print` and `emscriptenModule.printErr` take precedence over this option, since those are
   * the lower level version of the same hook. Specifying either of them hides the corresponding messages from here.
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   core: 'fceumm',
   *   rom: 'flappybird.nes',
   *   retroarchConfig: { log_verbosity: true },
   *   onLog({ level, message, source }) {
   *     console.log(`[${source}] [${level}] ${message}`)
   *   },
   * })
   * ```
   */
  onLog?: NostalgistLogHandler

  resolveBios: NostalgistResolveFileFunction
  resolveCoreJs: (core: NostalgistOptions['core'], options: NostalgistOptions) => ResolvableFileInput
  resolveCoreWasm: (core: NostalgistOptions['core'], options: NostalgistOptions) => ResolvableFileInput
  resolveRom: NostalgistResolveFileFunction
  resolveShader: (
    shader: NostalgistOptions['shader'],
    options: NostalgistOptions,
  ) => ResolvableFileInput | ResolvableFileInputs

  /**
   * @deprecated Use `Nostalgist.prepare` instead.
   */
  waitForInteraction?: (params: { done: () => void }) => void
}

export type NostalgistOptionsPartial = Partial<NostalgistOptions>

export type NostalgistLaunchOptions = NostalgistOptionsPartial & Pick<NostalgistOptions, 'core'>
interface NostalgistLaunchRomObjectOptions extends Omit<NostalgistOptionsPartial, 'core'> {
  rom: ResolvableFileInput | ResolvableFileInputs
}
export type NostalgistLaunchRomOptions = NostalgistLaunchRomObjectOptions | ResolvableFileInput | ResolvableFileInputs
