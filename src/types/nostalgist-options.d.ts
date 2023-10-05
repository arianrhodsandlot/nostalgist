import { RetroArchConfig } from './retroarch-config'

export type NostalgistOptionsFile = string | File | { fileName: string; fileContent: Blob }
type NostalgistOptionsFiles = NostalgistOptionsFile | NostalgistOptionsFile[]

interface NostalgistCoreObject {
  /** the name of core */
  name: string

  /** the url of core's js file */
  js: string

  /** the url or array buffer of core's js file */
  wasm: string | ArrayBuffer
}

export type NostalgistResolveFileFunction = (options: NostalgistOptions) => NostalgistOptionsFiles | undefined

export interface NostalgistOptions {
  element: string | HTMLCanvasElement
  rom?: NostalgistOptionsFiles
  bios?: NostalgistOptionsFiles
  core: string | NostalgistCoreObject
  retroarchConfig: RetroArchConfig
  retroarchCoreConfig: any
  runEmulatorManually: false
  resolveCoreJs: (options: NostalgistOptions) => string
  resolveCoreWasm: (options: NostalgistOptions) => string
  resolveRom: NostalgistResolveFileFunction
  resolveBios: NostalgistResolveFileFunction
}

export type NostalgistOptionsPartial = Partial<NostalgistOptions>

export interface NostalgistLaunchOptions extends Pick<NostalgistOptions, 'core'>, NostalgistOptionsPartial {}
export interface NostalgistLaunchRomOptions extends Pick<NostalgistOptions, 'core' | 'rom'>, NostalgistOptionsPartial {}
