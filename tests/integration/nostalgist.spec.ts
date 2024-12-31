import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { Nostalgist } from '../../src'

const testNesRomUrl =
  'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/Super%20Tilt%20Bro%20%28USA%29.nes'

function resolveRom(rom: any) {
  return `https://buildbot.libretro.com/assets/cores/${encodeURIComponent('Nintendo - Nintendo Entertainment System')}/${encodeURIComponent(rom)}`
}

function resolveBios(bios: any) {
  return `https://buildbot.libretro.com/assets/system/${encodeURIComponent(bios)}`
}

describe.concurrent('nostalgist', () => {
  beforeEach(() => {
    Nostalgist.configure({ runEmulatorManually: true })
  })

  afterEach(() => {
    Nostalgist.resetToDefault()
  })

  test('Nostalgist.nes', async () => {
    const nostalgist = await Nostalgist.nes('flappybird.nes')

    const options = nostalgist.getOptions()
    expect(options.core).toBe('fceumm')

    const emulatorOptions = nostalgist.getEmulatorOptions()
    expect(emulatorOptions.core.name).toBe('fceumm')
    expect(emulatorOptions.core.js).toBeTypeOf('string')
    expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
    expect(emulatorOptions.rom).toHaveLength(1)
    expect(emulatorOptions.rom[0].fileName).toEqual('flappybird.nes')
    expect(emulatorOptions.rom[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios).toEqual([])
  })

  test('Nostalgist.nes with custom resolveRom', async () => {
    const nostalgist = await Nostalgist.nes({ resolveRom, rom: 'Super Tilt Bro (USA).nes' })
    const emulatorOptions = nostalgist.getEmulatorOptions()

    expect(emulatorOptions.core.name).toBe('fceumm')
    expect(emulatorOptions.core.js).toBeTypeOf('string')
    expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
    expect(emulatorOptions.rom).toHaveLength(1)
    expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
    expect(emulatorOptions.rom[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios).toEqual([])
  })

  test('Nostalgist.configure with global custom resolveRom', async () => {
    Nostalgist.configure({ resolveRom })

    const nostalgist = await Nostalgist.nes('Super Tilt Bro (USA).nes')

    const emulatorOptions = nostalgist.getEmulatorOptions()
    expect(emulatorOptions.core.name).toBe('fceumm')
    expect(emulatorOptions.core.js).toBeTypeOf('string')
    expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
    expect(emulatorOptions.rom).toHaveLength(1)
    expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
    expect(emulatorOptions.rom[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios).toEqual([])
  })

  test('Nostalgist.launch with custom core', async () => {
    const nostalgist = await Nostalgist.launch({ core: 'nestopia', rom: testNesRomUrl })

    const options = nostalgist.getOptions()
    expect(options.core).toBe('nestopia')

    const emulatorOptions = nostalgist.getEmulatorOptions()
    expect(emulatorOptions.core.name).toBe('nestopia')
    expect(emulatorOptions.core.js).toBeTypeOf('string')
    expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
    expect(emulatorOptions.rom).toHaveLength(1)
    expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
    expect(emulatorOptions.rom[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios).toEqual([])
  })

  test('Nostalgist.launch with custom size', async () => {
    const nostalgist = await Nostalgist.launch({
      core: 'nestopia',
      rom: testNesRomUrl,
      size: {
        height: 100,
        width: 100,
      },
    })

    const options = nostalgist.getOptions()
    expect(options.core).toBe('nestopia')

    const emulatorOptions = nostalgist.getEmulatorOptions()
    expect(emulatorOptions.size).toEqual({ height: 100, width: 100 })
    expect(emulatorOptions.core.js).toBeTypeOf('string')
    expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
    expect(emulatorOptions.rom).toHaveLength(1)
    expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
    expect(emulatorOptions.rom[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios).toEqual([])
  })

  test('Nostalgist.launch with custom emscripten core', async () => {
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    const nostalgist = await Nostalgist.launch({ core, rom: testNesRomUrl })

    const options = nostalgist.getOptions()
    expect(options.core).toStrictEqual(core)

    const emulatorOptions = nostalgist.getEmulatorOptions()
    expect(emulatorOptions.core.name).toBe('fceumm')
    expect(emulatorOptions.core.js).toBeTypeOf('string')
    expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
    expect(emulatorOptions.rom).toHaveLength(1)
    expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
    expect(emulatorOptions.rom[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios).toEqual([])
  })

  test('Nostalgist.launch with custom rom and custom emscripten core', async () => {
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    const rom = 'Super Tilt Bro (USA).nes'

    const nostalgist = await Nostalgist.launch({ core, resolveRom, rom })

    const options = nostalgist.getOptions()
    expect(options.core).toStrictEqual(core)

    const emulatorOptions = nostalgist.getEmulatorOptions()
    expect(emulatorOptions.core.name).toBe('fceumm')
    expect(emulatorOptions.core.js).toBeTypeOf('string')
    expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
    expect(emulatorOptions.rom).toHaveLength(1)
    expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
    expect(emulatorOptions.rom[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios).toEqual([])
  })

  test('Nostalgist.launch with multiple files and bios', async () => {
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    const rom = ['Super Tilt Bro (USA).nes', '240p Test Suite.nes']
    const bios = ['PrBoom.zip', 'FinalBurn Neo (hiscore).zip']

    const nostalgist = await Nostalgist.launch({ bios, core, resolveBios, resolveRom, rom })

    const options = nostalgist.getOptions()
    expect(options.core).toStrictEqual(core)

    const emulatorOptions = nostalgist.getEmulatorOptions()
    expect(emulatorOptions.core.name).toBe('fceumm')
    expect(emulatorOptions.core.js).toBeTypeOf('string')
    expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
    expect(emulatorOptions.rom).toHaveLength(2)
    expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
    expect(emulatorOptions.rom[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.rom[1].fileName).toEqual('240p Test Suite.nes')
    expect(emulatorOptions.rom[1].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios).toHaveLength(2)
    expect(emulatorOptions.bios[0].fileName).toEqual('PrBoom.zip')
    expect(emulatorOptions.bios[0].fileContent.constructor.name).toBe('Blob')
    expect(emulatorOptions.bios[1].fileName).toEqual('FinalBurn Neo (hiscore).zip')
    expect(emulatorOptions.bios[1].fileContent.constructor.name).toBe('Blob')
  })

  test('Nostalgist.launch with custom style and size', async () => {
    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      rom: 'flappybird.nes',
      size: { height: 100, width: 100 },
    })

    const options = nostalgist.getOptions()
    expect(options.size).toEqual({ height: 100, width: 100 })
  })

  test('Nostalgist.launch with shaders', async () => {
    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      rom: 'flappybird.nes',
      shader: 'crt/crt-easymode',
    })

    const { shader } = nostalgist.getEmulatorOptions()
    for (const file of shader) {
      expect(file.fileName).toContain('.glsl')
      expect(file.fileContent.type).toBe('application/octet-stream')
      expect(file.fileContent.size).toBeGreaterThan(0)
    }
  })

  test('Nostalgist.launch with nested options', async () => {
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
    expect(options.retroarchConfig).toMatchObject({
      input_audio_mute: 'b',
      input_max_users: 4,
      input_menu_toggle: 'nul',
      menu_driver: 'rgui',
    })
  })

  test('Nostalgist.launch overwrites the configured core', async () => {
    Nostalgist.configure({ core: 'nestopia' })
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    const nostalgist = await Nostalgist.launch({ core, rom: testNesRomUrl })

    const options = nostalgist.getOptions()
    expect(options.core).toStrictEqual(core)
  })

  test('Nostalgist.launch overwrites the configured custom emscripten core', async () => {
    const core = {
      js: 'https://web.libretro.com/fceumm_libretro.js',
      name: 'fceumm',
      wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
    }
    Nostalgist.configure({ core })
    const nostalgist = await Nostalgist.launch({ core: 'nestopia', rom: testNesRomUrl })

    const options = nostalgist.getOptions()
    expect(options.core).toStrictEqual('nestopia')
  })

  test('Nostalgist.launch with a custom element', async () => {
    const element = document.createElement('canvas')
    const nostalgist = await Nostalgist.launch({ core: 'nestopia', element, rom: 'flappybird.nes' })

    const options = nostalgist.getOptions()
    expect(options.core).toStrictEqual('nestopia')
  })

  test('Nostalgist.launch with a malformed url', async () => {
    const nostalgist = await Nostalgist.nes({ rom: 'http://example.com/a%b%c.nes?xxx=1' })

    const emulatorOptions = nostalgist.getEmulatorOptions()
    expect(emulatorOptions.rom[0].fileName).toStrictEqual('a-b-c.nes')
  })
})
