import type { RetroArchConfig } from './retroarch-config'

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

export type NostalgistResolveFileFunction = (params: {
  file: NostalgistOptionsFiles
  options: NostalgistOptions
}) => NostalgistOptionsFiles | undefined

export interface NostalgistOptions {
  /**
   * The canvas element to use.
   * @default '' an empty string
   */
  element: string | HTMLCanvasElement

  /**
   * The rom needs to be launched.
   *
   * This property can be:
   * + a string
   * + a [File object](https://developer.mozilla.org/en-US/docs/Web/API/File)
   * + an object, with a fileName property and a fileContent property. for example: { filename: 'xx.nes', fileContent: someBlob }
   * + an array of above
   */
  rom?: NostalgistOptionsFiles

  /**
   * The bios files needs to be launched with roms.
   *
   * This property can be:
   * + a string
   * + a [File object](https://developer.mozilla.org/en-US/docs/Web/API/File)
   * + an object, with a fileName property and a fileContent property. for example: { filename: 'xx.nes', fileContent: someBlob }
   * + an array of above
   */
  bios?: NostalgistOptionsFiles

  core: string | NostalgistCoreDict

  /**
   * RetroArch config.
   * Not all options can make effects in browser.
   */
  retroarchConfig: RetroArchConfig

  /**
   * RetroArch core config.
   * Not all options can make effects in browser.
   */
  retroarchCoreConfig: any

  /**
   * If this is set to true, emulator will not run automatically.
   * To run the emulator, `nostalgist.launchEmulator` should be called later.
   */
  runEmulatorManually: boolean
  resolveCoreJs: (params: { core: NostalgistOptions['core']; options: NostalgistOptions }) => string
  resolveCoreWasm: (params: { core: NostalgistOptions['core']; options: NostalgistOptions }) => string | ArrayBuffer
  resolveRom: NostalgistResolveFileFunction
  resolveBios: NostalgistResolveFileFunction
  waitForInteraction?: (params: { done: () => void }) => void
}

export type NostalgistOptionsPartial = Partial<NostalgistOptions>

export type NostalgistLaunchOptions = Pick<NostalgistOptions, 'core'> & NostalgistOptionsPartial
export interface NostalgistLaunchRomOptions extends Omit<NostalgistOptionsPartial, 'core'> {
  rom: NostalgistOptionsFiles
}
