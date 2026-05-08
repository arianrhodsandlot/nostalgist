/// <reference types="emscripten" />

export interface RetroArchEmscriptenModule extends EmscriptenModule {
  asm: any
  callMain: (args: string[]) => void
  canvas: HTMLCanvasElement
  EmscriptenSendCommand?: (command: string) => void
  ERRNO_CODES: any
  FS: any
  mainScriptUrlOrBlob: Blob | string
  monitorRunDependencies: (left?: number) => Promise<void> | void
  PATH: any
  preRun: ((...args: any) => void)[]
  setCanvasSize: (width: number, height: number) => void
}

export type RetroArchEmscriptenModuleOptions = Partial<RetroArchEmscriptenModule>
