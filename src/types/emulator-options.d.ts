export interface EmulatorOptions {
  element: HTMLCanvasElement
  core: {
    /** the name of core */
    name: string

    /** the content of core's js file */
    js: string

    /** the array buffer of core's js file */
    wasm: ArrayBuffer
  }
  rom: { fileName: string; fileContent: Blob }[]
  bios: { fileName: string; fileContent: Blob }[]
  retroarch: RetroArchConfig
  retroarchCore: any
}
