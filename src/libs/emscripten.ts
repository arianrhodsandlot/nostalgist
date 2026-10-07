import type { NostalgistLogEvent, NostalgistLogHandler, NostalgistLogLevel } from '../types/nostalgist-options.ts'
import type { RetroArchEmscriptenModuleOptions } from '../types/retroarch-emscripten.ts'

/**
 * RetroArch prefixes every log line with its level, and marks the lines a core emits with an extra tag.
 * See https://github.com/libretro/RetroArch/blob/master/verbosity.h and
 * https://github.com/libretro/RetroArch/blob/master/runloop.c
 */
const logTagPattern = /^\[(?<core>libretro )?(?<level>DEBUG|ERROR|INFO|WARN)\] ?/u

export function parseLogLine(raw: string, stream: 'stderr' | 'stdout'): NostalgistLogEvent {
  const tag = logTagPattern.exec(raw)
  if (!tag?.groups) {
    // An untagged line carries no level of its own. RetroArch writes all of its logs to stderr in Emscripten
    // builds, so the stream can only be used as a rough guess here.
    return { level: stream === 'stderr' ? 'error' : 'info', message: raw, source: 'frontend' }
  }
  const { core, level } = tag.groups
  return {
    level: level.toLowerCase() as NostalgistLogLevel,
    message: raw.slice(tag[0].length),
    source: core ? 'core' : 'frontend',
  }
}

/** Writes a message to the browser console at its own level, which is what happens without an `onLog` option. */
function logToConsole({ level, message, source }: NostalgistLogEvent) {
  console[level](source === 'core' ? `[libretro] ${message}` : message)
}

function emitLog(onLog: NostalgistLogHandler, args: unknown[], stream: 'stderr' | 'stdout') {
  try {
    onLog(parseLogLine(args.map(String).join(' '), stream))
  } catch (error) {
    // this is called from inside the emulator's run loop, so a throwing handler must not escape
    console.error(error)
  }
}

export function getEmscriptenModuleOverrides(
  overrides: RetroArchEmscriptenModuleOptions,
  { onLog }: { onLog?: NostalgistLogHandler } = {},
) {
  let resolveRunDependenciesPromise: () => void
  const runDependenciesPromise = new Promise<void>((resolve) => {
    resolveRunDependenciesPromise = resolve
  })
  const handleLog = onLog ?? logToConsole

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
      emitLog(handleLog, args, 'stdout')
    },

    printErr(...args: unknown[]) {
      emitLog(handleLog, args, 'stderr')
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
