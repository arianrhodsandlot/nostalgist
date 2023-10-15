import { EmscriptenFS, FileSystem, initialize } from 'browserfs'
import type { RetroArchEmscriptenModuleOptions } from './types/retroarch-emscripten'

const raUserdataDir = '/home/web_user/retroarch/userdata'

export function createEmscriptenFS({ FS, PATH, ERRNO_CODES }: any) {
  const inMemoryFS = new FileSystem.InMemory()
  const mountableFS = new FileSystem.MountableFileSystem()
  try {
    mountableFS.umount(raUserdataDir)
  } catch {}
  mountableFS.mount(raUserdataDir, inMemoryFS)

  initialize(mountableFS)

  return new EmscriptenFS(FS, PATH, ERRNO_CODES)
}

export function getEmscriptenModuleOverrides(overrides: RetroArchEmscriptenModuleOptions) {
  let resolveRunDependenciesPromise: () => void
  const runDependenciesPromise = new Promise<void>((resolve) => {
    resolveRunDependenciesPromise = resolve
  })

  const emscriptenModuleOverrides: RetroArchEmscriptenModuleOptions = {
    noInitialRun: true,
    noExitRuntime: false,

    print(...args: unknown[]) {
      console.info(...args)
    },

    printErr(...args: unknown[]) {
      console.error(...args)
    },

    async monitorRunDependencies(left: number) {
      if (left === 0) {
        resolveRunDependenciesPromise()
      }
      return await runDependenciesPromise
    },
    ...overrides,
  }
  return emscriptenModuleOverrides
}
