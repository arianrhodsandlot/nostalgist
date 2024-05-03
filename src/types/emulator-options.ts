import type { Nostalgist } from '..'
import type { RetroArchConfig } from './retroarch-config'
import type { RetroArchEmscriptenModuleOptions } from './retroarch-emscripten'

export interface EmulatorOptions {
  element: HTMLCanvasElement
  nostalgist: Nostalgist

  style: Partial<CSSStyleDeclaration>

  /**
   *
   * The size of the canvas element.
   * If it's `'auto'`, the canvas element will keep its original size, or it's width and height will be updated as specified.
   */
  size?: 'auto' | { height: number; width: number }

  bios: { fileContent: Blob; fileName: string }[]
  core: {
    /** the name of core */
    name: string

    /** the content of core's js file */
    js: string

    /** the array buffer of core's js file */
    wasm: ArrayBuffer
  }
  rom: { fileContent: Blob; fileName: string }[]
  shader: { fileContent: Blob; fileName: string }[]
  state?: Blob | undefined

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

  beforeLaunch?: ((nostalgist: Nostalgist) => Promise<void> | void) | undefined
  onLaunch?: ((nostalgist: Nostalgist) => Promise<void> | void) | undefined
  signal?: AbortSignal | undefined
}
