import { afterEach, beforeEach, describe, test, type TestContext } from 'node:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { Nostalgist } from '../../src/index.ts'

const testNesRomUrl =
  'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/Super%20Tilt%20Bro%20%28USA%29.nes'

function resolveRom(rom: any) {
  return `https://buildbot.libretro.com/assets/cores/${encodeURIComponent('Nintendo - Nintendo Entertainment System')}/${encodeURIComponent(rom)}`
}

function resolveBios(bios: any) {
  return `https://buildbot.libretro.com/assets/system/${encodeURIComponent(bios)}`
}

GlobalRegistrator.register({ settings: { fetch: { disableSameOriginPolicy: true } } })

describe('nostalgist', () => {
  beforeEach(() => {
    Nostalgist.configure({ runEmulatorManually: true })
  })

  afterEach(() => {
    Nostalgist.resetToDefault()
  })

  test('Nostalgist.nes', async (t: TestContext) => {
    const nostalgist = await Nostalgist.nes('flappybird.nes')

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, 'fceumm')

    const emulatorOptions = nostalgist.getEmulatorOptions()
    t.assert.strictEqual(emulatorOptions.core.name, 'fceumm')
    t.assert.strictEqual(typeof emulatorOptions.core.js, 'string')
    t.assert.ok(emulatorOptions.core.wasm instanceof ArrayBuffer)
    t.assert.strictEqual(emulatorOptions.rom.length, 1)
    t.assert.strictEqual(emulatorOptions.rom[0].fileName, 'flappybird.nes')
    t.assert.ok(emulatorOptions.rom[0].fileContent instanceof Blob)
    t.assert.deepStrictEqual(emulatorOptions.bios, [])
  })

  test('Nostalgist.nes with custom resolveRom', async (t: TestContext) => {
    const nostalgist = await Nostalgist.nes({ resolveRom, rom: 'Super Tilt Bro (USA).nes' })
    const emulatorOptions = nostalgist.getEmulatorOptions()

    t.assert.strictEqual(emulatorOptions.core.name, 'fceumm')
    t.assert.strictEqual(typeof emulatorOptions.core.js, 'string')
    t.assert.ok(emulatorOptions.core.wasm instanceof ArrayBuffer)
    t.assert.strictEqual(emulatorOptions.rom.length, 1)
    t.assert.deepStrictEqual(emulatorOptions.rom[0].fileName, 'Super Tilt Bro (USA).nes')
    t.assert.strictEqual(emulatorOptions.rom[0].fileContent.constructor.name, 'Blob')
    t.assert.deepStrictEqual(emulatorOptions.bios, [])
  })

  test('Nostalgist.configure with global custom resolveRom', async (t: TestContext) => {
    Nostalgist.configure({ resolveRom })

    const nostalgist = await Nostalgist.nes('Super Tilt Bro (USA).nes')

    const emulatorOptions = nostalgist.getEmulatorOptions()
    t.assert.strictEqual(emulatorOptions.core.name, 'fceumm')
    t.assert.strictEqual(typeof emulatorOptions.core.js, 'string')
    t.assert.ok(emulatorOptions.core.wasm instanceof ArrayBuffer)
    t.assert.strictEqual(emulatorOptions.rom.length, 1)
    t.assert.deepStrictEqual(emulatorOptions.rom[0].fileName, 'Super Tilt Bro (USA).nes')
    t.assert.strictEqual(emulatorOptions.rom[0].fileContent.constructor.name, 'Blob')
    t.assert.deepStrictEqual(emulatorOptions.bios, [])
  })

  test('Nostalgist.launch with custom core', async (t: TestContext) => {
    const nostalgist = await Nostalgist.launch({ core: 'nestopia', rom: testNesRomUrl })

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, 'nestopia')

    const emulatorOptions = nostalgist.getEmulatorOptions()
    t.assert.strictEqual(emulatorOptions.core.name, 'nestopia')
    t.assert.strictEqual(typeof emulatorOptions.core.js, 'string')
    t.assert.ok(emulatorOptions.core.wasm instanceof ArrayBuffer)
    t.assert.strictEqual(emulatorOptions.rom.length, 1)
    t.assert.deepStrictEqual(emulatorOptions.rom[0].fileName, 'Super Tilt Bro (USA).nes')
    t.assert.strictEqual(emulatorOptions.rom[0].fileContent.constructor.name, 'Blob')
    t.assert.deepStrictEqual(emulatorOptions.bios, [])
  })

  test('Nostalgist.launch with custom size', async (t: TestContext) => {
    const nostalgist = await Nostalgist.launch({
      core: 'nestopia',
      rom: testNesRomUrl,
      size: {
        height: 100,
        width: 100,
      },
    })

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, 'nestopia')

    const emulatorOptions = nostalgist.getEmulatorOptions()
    t.assert.deepStrictEqual(emulatorOptions.size, { height: 100, width: 100 })
    t.assert.strictEqual(typeof emulatorOptions.core.js, 'string')
    t.assert.ok(emulatorOptions.core.wasm instanceof ArrayBuffer)
    t.assert.strictEqual(emulatorOptions.rom.length, 1)
    t.assert.deepStrictEqual(emulatorOptions.rom[0].fileName, 'Super Tilt Bro (USA).nes')
    t.assert.strictEqual(emulatorOptions.rom[0].fileContent.constructor.name, 'Blob')
    t.assert.deepStrictEqual(emulatorOptions.bios, [])
  })

  test('Nostalgist.launch with custom emscripten core', async (t: TestContext) => {
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    const nostalgist = await Nostalgist.launch({ core, rom: testNesRomUrl })

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, core)

    const emulatorOptions = nostalgist.getEmulatorOptions()
    t.assert.strictEqual(emulatorOptions.core.name, 'fceumm')
    t.assert.strictEqual(typeof emulatorOptions.core.js, 'string')
    t.assert.ok(emulatorOptions.core.wasm instanceof ArrayBuffer)
    t.assert.strictEqual(emulatorOptions.rom.length, 1)
    t.assert.deepStrictEqual(emulatorOptions.rom[0].fileName, 'Super Tilt Bro (USA).nes')
    t.assert.strictEqual(emulatorOptions.rom[0].fileContent.constructor.name, 'Blob')
    t.assert.deepStrictEqual(emulatorOptions.bios, [])
  })

  test('Nostalgist.launch with custom rom and custom emscripten core', async (t: TestContext) => {
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    const rom = 'Super Tilt Bro (USA).nes'

    const nostalgist = await Nostalgist.launch({ core, resolveRom, rom })

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, core)

    const emulatorOptions = nostalgist.getEmulatorOptions()
    t.assert.strictEqual(emulatorOptions.core.name, 'fceumm')
    t.assert.strictEqual(typeof emulatorOptions.core.js, 'string')
    t.assert.ok(emulatorOptions.core.wasm instanceof ArrayBuffer)
    t.assert.strictEqual(emulatorOptions.rom.length, 1)
    t.assert.deepStrictEqual(emulatorOptions.rom[0].fileName, 'Super Tilt Bro (USA).nes')
    t.assert.strictEqual(emulatorOptions.rom[0].fileContent.constructor.name, 'Blob')
    t.assert.deepStrictEqual(emulatorOptions.bios, [])
  })

  test('Nostalgist.launch with multiple files and bios', async (t: TestContext) => {
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    const rom = ['Super Tilt Bro (USA).nes', '240p Test Suite.nes']
    const bios = ['PrBoom.zip', 'FinalBurn Neo (hiscore).zip']

    const nostalgist = await Nostalgist.launch({ bios, core, resolveBios, resolveRom, rom })

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, core)

    const emulatorOptions = nostalgist.getEmulatorOptions()
    t.assert.strictEqual(emulatorOptions.core.name, 'fceumm')
    t.assert.strictEqual(typeof emulatorOptions.core.js, 'string')
    t.assert.ok(emulatorOptions.core.wasm instanceof ArrayBuffer)
    t.assert.strictEqual(emulatorOptions.rom.length, 2)
    t.assert.deepStrictEqual(emulatorOptions.rom[0].fileName, 'Super Tilt Bro (USA).nes')
    t.assert.strictEqual(emulatorOptions.rom[0].fileContent.constructor.name, 'Blob')
    t.assert.deepStrictEqual(emulatorOptions.rom[1].fileName, '240p Test Suite.nes')
    t.assert.strictEqual(emulatorOptions.rom[1].fileContent.constructor.name, 'Blob')
    t.assert.strictEqual(emulatorOptions.bios.length, 2)
    t.assert.deepStrictEqual(emulatorOptions.bios[0].fileName, 'PrBoom.zip')
    t.assert.strictEqual(emulatorOptions.bios[0].fileContent.constructor.name, 'Blob')
    t.assert.deepStrictEqual(emulatorOptions.bios[1].fileName, 'FinalBurn Neo (hiscore).zip')
    t.assert.strictEqual(emulatorOptions.bios[1].fileContent.constructor.name, 'Blob')
  })

  test('Nostalgist.launch with custom style and size', async (t: TestContext) => {
    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      rom: 'flappybird.nes',
      size: { height: 100, width: 100 },
    })

    const options = nostalgist.getOptions()
    t.assert.deepStrictEqual(options.size, { height: 100, width: 100 })
  })

  test('Nostalgist.launch with shaders', async (t: TestContext) => {
    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      rom: 'flappybird.nes',
      shader: 'crt/crt-easymode',
    })

    const { shader } = nostalgist.getEmulatorOptions()
    t.assert.ok(shader[0].fileName.endsWith('.glslp'))
    t.assert.ok(shader[1].fileName.endsWith('.glsl'))
    for (const file of shader) {
      t.assert.strictEqual(file.fileContent.type, 'application/octet-stream')
      t.assert.ok(file.fileContent.size > 0)
    }
  })

  test('Nostalgist.launch with nested options', async (t: TestContext) => {
    Nostalgist.configure({
      retroarchConfig: {
        input_audio_mute: 'a',
        input_menu_toggle: 'nul',
      },
    })

    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      retroarchConfig: {
        input_audio_mute: 'b',
        input_max_users: 4,
      },
      rom: 'flappybird.nes',
    })

    const options = nostalgist.getOptions()
    // @ts-expect-error this method is still not typed. see https://nodejs.org/api/assert.html#assertpartialdeepstrictequalactual-expected-message
    t.assert.partialDeepStrictEqual(options.retroarchConfig, {
      input_audio_mute: 'b',
      input_max_users: 4,
      input_menu_toggle: 'nul',
      menu_driver: 'rgui',
    })
  })

  test('Nostalgist.launch overwrites the configured core', async (t: TestContext) => {
    Nostalgist.configure({ core: 'nestopia' })
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    const nostalgist = await Nostalgist.launch({ core, rom: testNesRomUrl })

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, core)
  })

  test('Nostalgist.launch overwrites the configured custom emscripten core', async (t: TestContext) => {
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    Nostalgist.configure({ core })
    const nostalgist = await Nostalgist.launch({ core: 'nestopia', rom: testNesRomUrl })

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, 'nestopia')
  })

  test('Nostalgist.launch with a custom element', async (t: TestContext) => {
    const element = document.createElement('canvas')
    const nostalgist = await Nostalgist.launch({ core: 'nestopia', element, rom: 'flappybird.nes' })

    const options = nostalgist.getOptions()
    t.assert.strictEqual(options.core, 'nestopia')
  })

  test('Nostalgist.launch with a malformed url', async (t: TestContext) => {
    const nostalgist = await Nostalgist.nes({ rom: 'http://example.com/a%b%c.nes?xxx=1' })

    const emulatorOptions = nostalgist.getEmulatorOptions()
    t.assert.strictEqual(emulatorOptions.rom[0].fileName, 'a-b-c.nes')
  })
})
