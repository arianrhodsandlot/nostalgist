import { describe, test, type TestContext } from 'node:test'
import { getEmscriptenModuleOverrides, parseLogLine } from '../../src/libs/emscripten.ts'
import type { NostalgistLogEvent } from '../../src/types/nostalgist-options.ts'

function collectLogs() {
  const logs: NostalgistLogEvent[] = []
  return { logs, onLog: (event: NostalgistLogEvent) => logs.push(event) }
}

await describe('emscripten', async () => {
  await describe('parseLogLine', async () => {
    await test('parses the levels RetroArch tags its own messages with', (t: TestContext) => {
      t.assert.partialDeepStrictEqual(parseLogLine('[INFO] [Config]: loading config', 'stderr'), {
        level: 'info',
        message: '[Config]: loading config',
        source: 'frontend',
      })
      t.assert.partialDeepStrictEqual(parseLogLine('[WARN] [Audio]: no audio', 'stderr'), { level: 'warn' })
      t.assert.partialDeepStrictEqual(parseLogLine('[ERROR] [Core]: failed', 'stderr'), { level: 'error' })
      t.assert.partialDeepStrictEqual(parseLogLine('[DEBUG] [Environ]: GET_VARIABLE', 'stderr'), { level: 'debug' })
    })

    await test('marks the messages a core emits as such', (t: TestContext) => {
      t.assert.deepStrictEqual(parseLogLine('[libretro INFO] starting fceumm', 'stderr'), {
        level: 'info',
        message: 'starting fceumm',
        source: 'core',
      })
      t.assert.partialDeepStrictEqual(parseLogLine('[libretro ERROR] rom is invalid', 'stderr'), {
        level: 'error',
        message: 'rom is invalid',
        source: 'core',
      })
    })

    await test('falls back to the stream for untagged messages', (t: TestContext) => {
      t.assert.partialDeepStrictEqual(parseLogLine('a message without a tag', 'stdout'), {
        level: 'info',
        message: 'a message without a tag',
        source: 'frontend',
      })
      t.assert.partialDeepStrictEqual(parseLogLine('a message without a tag', 'stderr'), { level: 'error' })
      t.assert.partialDeepStrictEqual(parseLogLine('', 'stderr'), { level: 'error', message: '' })
    })

    await test('does not treat an unknown tag as a level', (t: TestContext) => {
      t.assert.partialDeepStrictEqual(parseLogLine('[Config] not a level', 'stderr'), {
        level: 'error',
        message: '[Config] not a level',
      })
    })
  })

  await describe('getEmscriptenModuleOverrides', async () => {
    await test('routes stdout and stderr to onLog', (t: TestContext) => {
      const { logs, onLog } = collectLogs()
      const overrides = getEmscriptenModuleOverrides({}, { onLog })

      overrides.print?.('[INFO] from stdout')
      overrides.printErr?.('[libretro WARN] from stderr')
      // an untagged line is the only case where the stream it arrived on decides its level
      overrides.print?.('untagged on stdout')
      overrides.printErr?.('untagged on stderr')

      t.assert.strictEqual(logs.length, 4)
      t.assert.partialDeepStrictEqual(logs[0], { level: 'info', message: 'from stdout', source: 'frontend' })
      t.assert.partialDeepStrictEqual(logs[1], { level: 'warn', message: 'from stderr', source: 'core' })
      t.assert.partialDeepStrictEqual(logs[2], { level: 'info', message: 'untagged on stdout' })
      t.assert.partialDeepStrictEqual(logs[3], { level: 'error', message: 'untagged on stderr' })
    })

    await test('writes to the console at the level of the message when there is no onLog', (t: TestContext) => {
      const info: unknown[] = []
      const error: unknown[] = []
      t.mock.method(console, 'info', (message: unknown) => info.push(message))
      t.mock.method(console, 'error', (message: unknown) => error.push(message))
      const overrides = getEmscriptenModuleOverrides({})

      // RetroArch writes all of its logs to stderr, so the level has to come from the tag rather than the stream
      overrides.printErr?.('[INFO] [Config]: loading config')
      overrides.printErr?.('[libretro ERROR] rom is invalid')

      t.assert.deepStrictEqual(info, ['[Config]: loading config'])
      t.assert.deepStrictEqual(error, ['[libretro] rom is invalid'])
    })

    await test('does not let a throwing onLog escape', (t: TestContext) => {
      const reported: unknown[] = []
      t.mock.method(console, 'error', (error: unknown) => {
        reported.push(error)
      })
      const overrides = getEmscriptenModuleOverrides(
        {},
        {
          onLog() {
            throw new Error('from onLog')
          },
        },
      )

      t.assert.doesNotThrow(() => overrides.printErr?.('[ERROR] boom'))
      t.assert.strictEqual(reported.length, 1)
    })

    await test('lets emscriptenModule.print take precedence over onLog', (t: TestContext) => {
      const { logs, onLog } = collectLogs()
      const printed: string[] = []
      const overrides = getEmscriptenModuleOverrides({ print: (str: string) => printed.push(str) }, { onLog })

      overrides.print?.('[INFO] a message')

      t.assert.deepStrictEqual(printed, ['[INFO] a message'])
      t.assert.strictEqual(logs.length, 0)
    })
  })
})
