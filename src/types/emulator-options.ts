import type { RetroArchConfig } from './retroarch-config'

export interface EmulatorOptions {
  element: HTMLCanvasElement

  style: Partial<CSSStyleDeclaration>

  /**
   *
   * The size of the canvas element.
   * If it's `'auto'`, the canvas element will keep its original size, or it's width and height will be updated as specified.
   */
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

  respondToGlobalEvents: boolean

  retroarch: RetroArchConfig
  retroarchCore: any
  waitForInteraction: ((params: { done: () => void }) => void) | undefined
}
