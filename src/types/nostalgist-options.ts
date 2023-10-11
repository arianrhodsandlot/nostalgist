import type { RetroArchConfig } from './retroarch-config'

type MaybePromise<T> = T | Promise<T>

export type NostalgistOptionsFile = string | File | { fileName: string; fileContent: Blob }
type NostalgistOptionsFiles = NostalgistOptionsFile | NostalgistOptionsFile[]

export interface NostalgistCoreDict {
  /** the name of core */
  name: string

  /** the url of core's js file */
  js: string

  /** the url or array buffer of core's js file */
  wasm: string | ArrayBuffer
}

export type NostalgistResolveFileFunction = (
  file: NostalgistOptionsFiles,
  options: NostalgistOptions,
) => MaybePromise<NostalgistOptionsFiles | undefined>

export interface NostalgistOptions {
  /**
   * The canvas element to use.
   * @default '' an empty string
   */
  element: string | HTMLCanvasElement

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
  size: 'auto' | { width: number; height: number }

  core: string | NostalgistCoreDict

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
   * If it's a normal string, it will be passed to `options.resolveRom`, another function option that should return a url string or a `Blob`.
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
   */
  rom?: NostalgistOptionsFiles

  /**
   * The BIOS files needed to be launched with roms.
   *
   * This property can be:
   * + a string
   * + a [File object](https://developer.mozilla.org/en-US/docs/Web/API/File)
   * + an object, with a fileName property and a fileContent property. for example: { filename: 'xx.nes', fileContent: someBlob }
   * + an array of above
   */
  bios?: NostalgistOptionsFiles

  respondToGlobalEvents?: boolean

  /**
   * RetroArch config.
   * Not all options can make effects in browser.
   */
  retroarchConfig: RetroArchConfig

  /**
   * WIP, do not use this property
   */
  retroarchCoreConfig: any

  /**
   * If this is set to true, emulator will not run automatically.
   * To run the emulator, `nostalgist.launchEmulator` should be called later.
   * Default value is `false`.
   */
  runEmulatorManually: boolean
  resolveCoreJs: (core: NostalgistOptions['core'], options: NostalgistOptions) => MaybePromise<string>
  resolveCoreWasm: (core: NostalgistOptions['core'], options: NostalgistOptions) => MaybePromise<string | ArrayBuffer>
  resolveRom: NostalgistResolveFileFunction
  resolveBios: NostalgistResolveFileFunction
  waitForInteraction?: (params: { done: () => void }) => void
}

export type NostalgistOptionsPartial = Partial<NostalgistOptions>

export type NostalgistLaunchOptions = Pick<NostalgistOptions, 'core'> & NostalgistOptionsPartial
export interface NostalgistLaunchRomOptions extends Omit<NostalgistOptionsPartial, 'core'> {
  rom: NostalgistOptionsFiles
}
