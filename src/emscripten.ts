import type { RetroArchEmscriptenModuleOptions } from './types/retroarch-emscripten'

export function getEmscriptenModuleOverrides(overrides: RetroArchEmscriptenModuleOptions) {
  let resolveRunDependenciesPromise: () => void
  const runDependenciesPromise = new Promise<void>((resolve) => {
    resolveRunDependenciesPromise = resolve
  })

  const emscriptenModuleOverrides: RetroArchEmscriptenModuleOptions = {
    noExitRuntime: false,
    noInitialRun: true,

    locateFile(file) {
      return file
    },

    // the return value of `monitorRunDependencies` seems to be misused here, but it works for now
    async monitorRunDependencies(left?: number) {
      if (left === 0) {
        resolveRunDependenciesPromise()
      }
      return await runDependenciesPromise
    },

    print(...args: unknown[]) {
      console.info(...args)
    },

    printErr(...args: unknown[]) {
      console.error(...args)
    },

    // @ts-expect-error do not throw error when exit
    quit(status: unknown, toThrow: unknown) {
      if (status) {
        console.info(status, toThrow)
      }
    },

    ...overrides,
  }
  return emscriptenModuleOverrides
}
