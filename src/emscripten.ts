import { EmscriptenFS, FileSystem, initialize } from 'browserfs'

const userdataDir = '/home/web_user/retroarch/userdata'

export function createEmscriptenFS({ FS, PATH, ERRNO_CODES }: any) {
  const inMemoryFS = new FileSystem.InMemory()
  const mountableFS = new FileSystem.MountableFileSystem()
  try {
    mountableFS.umount(userdataDir)
  } catch {}
  mountableFS.mount(userdataDir, inMemoryFS)

  initialize(mountableFS)

  return new EmscriptenFS(FS, PATH, ERRNO_CODES)
}

export function getEmscriptenModuleOverrides(overrides: any) {
  let resolveRunDependenciesPromise: () => void
  const runDependenciesPromise = new Promise<void>((resolve) => {
    resolveRunDependenciesPromise = resolve
  })

  return {
    noInitialRun: true,
    noExitRuntime: false,

    print(...args: unknown[]) {
      console.info(...args)
    },

    printErr(...args: unknown[]) {
      console.error(...args)
    },

    quit(status: unknown, toThrow: unknown) {
      if (status) {
        console.info(status, toThrow)
      }
    },

    async monitorRunDependencies(left: number) {
      if (left === 0) {
        resolveRunDependenciesPromise()
      }
      return await runDependenciesPromise
    },
    ...overrides,
  }
}
