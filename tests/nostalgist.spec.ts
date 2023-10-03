import { expect, test  } from "bun:test"
import { Nostalgist } from '../src'

const testNesRomUrl = 'https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/Super%20Tilt%20Bro%20%28USA%29.nes'

test('Nostalgist.nes', async () => {
  Nostalgist.configure({ runEmulatorManually: true })

  const nostalgist = await Nostalgist.nes(testNesRomUrl)

  const options = nostalgist.getOptions()
  expect(options.core).toBe('fceumm')

  const emulatorOptions = nostalgist.getEmulatorOptions()
  expect(emulatorOptions.core.js).toBeString()
  expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
  expect(emulatorOptions.rom).toHaveLength(1)
  expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
  expect(emulatorOptions.rom[0].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.bios).toEqual([])
})

test('Nostalgist.nes with custom resolveRom', async () => {
  Nostalgist.configure({ runEmulatorManually: true })

  const nostalgist = await Nostalgist.nes({
    rom: 'Super Tilt Bro (USA).nes',
    resolveRom(rom: string) {
      return `https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/${rom}`
    }
  })
  const emulatorOptions = nostalgist.getEmulatorOptions()

  expect(emulatorOptions.core.js).toBeString()
  expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
  expect(emulatorOptions.rom).toHaveLength(1)
  expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
  expect(emulatorOptions.rom[0].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.bios).toEqual([])
})

test('Nostalgist.configure with global custom resolveRom', async () => {
  Nostalgist.configure({ runEmulatorManually: true })

  Nostalgist.configure({
    resolveRom(rom: string) {
      return `https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/${rom}`
    }
  })

  const nostalgist = await Nostalgist.nes('Super Tilt Bro (USA).nes')

  const emulatorOptions = nostalgist.getEmulatorOptions()
  expect(emulatorOptions.core.js).toBeString()
  expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
  expect(emulatorOptions.rom).toHaveLength(1)
  expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
  expect(emulatorOptions.rom[0].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.bios).toEqual([])
})

test('Nostalgist.launch with custom core', async () => {
  Nostalgist.configure({ runEmulatorManually: true })

  const nostalgist = await Nostalgist.launch({ rom: testNesRomUrl, core: 'nestopia' })

  const options = nostalgist.getOptions()
  expect(options.core).toBe('nestopia')

  const emulatorOptions = nostalgist.getEmulatorOptions()
  expect(emulatorOptions.core.js).toBeString()
  expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
  expect(emulatorOptions.rom).toHaveLength(1)
  expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
  expect(emulatorOptions.rom[0].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.bios).toEqual([])
})

test('Nostalgist.launch with custom emscripten core', async () => {
  Nostalgist.configure({ runEmulatorManually: true })

  const core = {
    js: 'https://web.libretro.com/fceumm_libretro.js',
    wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
  }
  const nostalgist = await Nostalgist.launch({ rom: testNesRomUrl, core })

  const options = nostalgist.getOptions()
  expect(options.core).toBe(core)

  const emulatorOptions = nostalgist.getEmulatorOptions()
  expect(emulatorOptions.core.js).toBeString()
  expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
  expect(emulatorOptions.rom).toHaveLength(1)
  expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
  expect(emulatorOptions.rom[0].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.bios).toEqual([])
})


test('Nostalgist.launch with custom rom and custom emscripten core', async () => {
  Nostalgist.configure({ runEmulatorManually: true })

  const core = {
    js: 'https://web.libretro.com/fceumm_libretro.js',
    wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
  }
  const rom = 'Super Tilt Bro (USA).nes'

  function resolveRom(rom: string) {
    return `https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/${rom}`
  }

  const nostalgist = await Nostalgist.launch({ rom, core, resolveRom })

  const options = nostalgist.getOptions()
  expect(options.core).toBe(core)

  const emulatorOptions = nostalgist.getEmulatorOptions()
  expect(emulatorOptions.core.js).toBeString()
  expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
  expect(emulatorOptions.rom).toHaveLength(1)
  expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
  expect(emulatorOptions.rom[0].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.bios).toEqual([])
})

test('Nostalgist.launch with multiple files and bios', async () => {
  Nostalgist.configure({ runEmulatorManually: true })

  const core = {
    js: 'https://web.libretro.com/fceumm_libretro.js',
    wasm: 'https://web.libretro.com/fceumm_libretro.wasm',
  }
  const rom = ['Super Tilt Bro (USA).nes', '240p Test Suite.nes']
  const bios = ['PrBoom.zip', 'FinalBurn Neo (hiscore).zip']

  function resolveRom(rom: string) {
    return `https://buildbot.libretro.com/assets/cores/Nintendo%20-%20Nintendo%20Entertainment%20System/${rom}`
  }

  function resolveBios(bios: string) {
    return `https://buildbot.libretro.com/assets/system/${bios}`
  }

  const nostalgist = await Nostalgist.launch({ core, rom, bios, resolveRom, resolveBios })

  const options = nostalgist.getOptions()
  expect(options.core).toBe(core)

  const emulatorOptions = nostalgist.getEmulatorOptions()
  expect(emulatorOptions.core.js).toBeString()
  expect(emulatorOptions.core.wasm).toBeInstanceOf(ArrayBuffer)
  expect(emulatorOptions.rom).toHaveLength(2)
  expect(emulatorOptions.rom[0].fileName).toEqual('Super Tilt Bro (USA).nes')
  expect(emulatorOptions.rom[0].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.rom[1].fileName).toEqual('240p Test Suite.nes')
  expect(emulatorOptions.rom[1].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.bios).toHaveLength(2)
  expect(emulatorOptions.bios[0].fileName).toEqual('PrBoom.zip')
  expect(emulatorOptions.bios[0].fileContent).toBeInstanceOf(Blob)
  expect(emulatorOptions.bios[1].fileName).toEqual('FinalBurn Neo (hiscore).zip')
  expect(emulatorOptions.bios[1].fileContent).toBeInstanceOf(Blob)
})
