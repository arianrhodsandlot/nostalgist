import { RetroArchConfig } from './retroarch-config'

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
  element: string | HTMLCanvasElement
  rom?: NostalgistOptionsFiles
  bios?: NostalgistOptionsFiles
  core: string | NostalgistCoreDict
  retroarchConfig: RetroArchConfig
  retroarchCoreConfig: any
  runEmulatorManually: boolean
  resolveCoreJs: (params: { core: NostalgistOptions['core']; options: NostalgistOptions }) => string
  resolveCoreWasm: (params: { core: NostalgistOptions['core']; options: NostalgistOptions }) => string | ArrayBuffer
  resolveRom: NostalgistResolveFileFunction
  resolveBios: NostalgistResolveFileFunction
}

export type NostalgistOptionsPartial = Partial<NostalgistOptions>

export interface NostalgistLaunchOptions extends Pick<NostalgistOptions, 'core'>, NostalgistOptionsPartial {}
export interface NostalgistLaunchRomOptions extends Omit<NostalgistOptionsPartial, 'core'> {
  rom: NostalgistOptionsFiles
}
