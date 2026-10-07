/// <reference types="emscripten" />

export interface RetroArchEmscriptenModule extends EmscriptenModule {
  asm: any
  callMain: (args: string[]) => void
  canvas: HTMLCanvasElement

  /**
   * The cheat related functions RetroArch exports, which are only available in cores built from
   * RetroArch v1.21.0 or later.
   * See https://github.com/libretro/RetroArch/blob/master/frontend/drivers/platform_emscripten.c
   */
  _cmd_cheat_apply_cheats: () => void
  _cmd_cheat_get_code: (index: number) => number
  _cmd_cheat_get_code_state: (index: number) => boolean
  _cmd_cheat_get_size: () => number
  _cmd_cheat_realloc: (newSize: number) => boolean
  _cmd_cheat_set_code: (index: number, code: number) => void
  _cmd_cheat_toggle_index: (applyCheatsAfterToggle: boolean, index: number) => void

  EmscriptenSendCommand?: (command: string) => void
  ERRNO_CODES: any
  FS: any
  mainScriptUrlOrBlob: Blob | string
  monitorRunDependencies: (left?: number) => Promise<void> | void
  PATH: any
  preRun: ((...args: any) => void)[]
  setCanvasSize: (width: number, height: number) => void
  stringToNewUTF8: (string: string) => number
  UTF8ToString: (pointer: number) => string
}

export type RetroArchEmscriptenModuleOptions = Partial<RetroArchEmscriptenModule>
