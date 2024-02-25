import type { RetroArchConfig } from './retroarch-config'
import type { RetroArchEmscriptenModuleOptions } from './retroarch-emscripten'

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
  shader: { fileName: string; fileContent: Blob }[]

  respondToGlobalEvents: boolean

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
   * An option to override the `Module` object for Emscripten. See [Module object](https://emscripten.org/docs/api_reference/module.html).
   *
   * This is a low level option and not well tested, so use it at your own risk.
   */
  emscriptenModule: RetroArchEmscriptenModuleOptions

  waitForInteraction: ((params: { done: () => void }) => void) | undefined

  signal?: AbortSignal | undefined
}
