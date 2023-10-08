import type { RetroArchConfig } from './retroarch-config'

export interface EmulatorOptions {
  element: HTMLCanvasElement
  size?: 'auto' | { width: number; height: number }
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
  waitForInteraction: ((params: { done: () => void }) => void) | undefined
}
