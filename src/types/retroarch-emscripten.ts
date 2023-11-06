export interface RetroArchEmscriptenModule extends EmscriptenModule {
  asm: any
  FS: any
  PATH: any
  ERRNO_CODES: any
  canvas: HTMLCanvasElement
  setCanvasSize: (width: number, height: number) => void
  preRun: ((...args: any) => void)[]
  monitorRunDependencies: (left?: number) => void | Promise<void>
  callMain: (args: string[]) => void
}

export type RetroArchEmscriptenModuleOptions = Partial<RetroArchEmscriptenModule>
