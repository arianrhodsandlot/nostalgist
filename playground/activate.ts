import type { Nostalgist as Nostalgist_ } from '../src/index.ts'
import { testSRAMDataUrl, testSRAMRomUrl, testStateDataUrl } from './constants.ts'

let Nostalgist: typeof Nostalgist_
let nostalgist: Nostalgist_
let state: { state: Blob }
let sram: Blob

const cdnBaseUrl = 'https://cdn.jsdelivr.net/gh'
const useLegacyCore = location.search.includes('legacy')
const coreRepo = 'arianrhodsandlot/retroarch-emscripten-build'
const nesRomRepo = 'retrobrews/nes-games'
const coreVersion = useLegacyCore ? 'v1.16.0' : 'v1.22.0'
const coreDirectory = 'retroarch'

const handlers = {
  static: {
    async nes() {
      nostalgist = await Nostalgist.nes('pong1k.nes')
    },

    async megadrive() {
      nostalgist = await Nostalgist.megadrive('asciiwar.bin')
    },

    async gbc() {
      nostalgist = await Nostalgist.gbc('combatsoccer.gbc')
    },

    async launchSize() {
      nostalgist = await Nostalgist.gbc({ rom: 'combatsoccer.gbc', size: { height: 100, width: 100 } })
    },

    async launchShader() {
      nostalgist = await Nostalgist.launch({ core: 'genesis_plus_gx', rom: 'asciiwar.bin', shader: 'crt/crt-geom' })
    },

    async launchAndCancel() {
      const abortController = new AbortController()
      setTimeout(() => {
        abortController.abort()
      }, 500)
      nostalgist = await Nostalgist.nes({ rom: 'pong1k.nes', signal: abortController.signal })
    },

    async launchWithHooks() {
      nostalgist = await Nostalgist.nes({
        async beforeLaunch(nostalgist) {
          console.warn(typeof nostalgist, 'beforeLaunch')
          await new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
        },
        onLaunch(nostalgist) {
          console.warn(typeof nostalgist, 'onLaunch')
        },
        rom: 'pong1k.nes',
      })
    },

    async launchState() {
      nostalgist = await Nostalgist.nes({
        cache: true,
        rom: 'flappybird.nes',
        state: testStateDataUrl,
      })
    },

    async launchConstantSRAM() {
      const response = await fetch(testSRAMDataUrl)
      nostalgist = await Nostalgist.nes({
        rom: testSRAMRomUrl,
        sram: await response.blob(),
      })
    },

    async launchSavedSRAM() {
      nostalgist = await Nostalgist.nes({ rom: testSRAMRomUrl, sram })
    },

    async launchROMSupportsSRAM() {
      nostalgist = await Nostalgist.nes({ rom: testSRAMRomUrl })
    },

    async launchURLStrings() {
      nostalgist = await Nostalgist.launch({
        core: 'fceumm',
        resolveCoreJs: (core) => `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.js`,
        resolveCoreWasm: (core) => `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.wasm`,
        resolveRom: (rom) => `${cdnBaseUrl}/${nesRomRepo}@master/${rom}`,
        rom: 'pong1k.nes',
      })
    },

    async launchURLs() {
      nostalgist = await Nostalgist.launch({
        core: 'fceumm',
        resolveCoreJs: (core) =>
          new URL(`${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.js`),
        resolveCoreWasm: (core) =>
          new URL(`${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.wasm`),
        resolveRom: (rom) => new URL(`${cdnBaseUrl}/${nesRomRepo}@master/${rom}`),
        rom: 'pong1k.nes',
      })
    },

    async launchRequests() {
      nostalgist = await Nostalgist.launch({
        core: 'fceumm',
        resolveCoreJs: (core) =>
          new Request(new URL(`${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.js`)),
        resolveCoreWasm: (core) =>
          new Request(new URL(`${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.wasm`)),
        resolveRom: (rom) => new Request(new URL(`${cdnBaseUrl}/${nesRomRepo}@master/${rom}`)),
        rom: 'pong1k.nes',
      })
    },

    async launchResponses() {
      nostalgist = await Nostalgist.launch({
        core: 'fceumm',
        resolveCoreJs: (core) => fetch(`${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.js`),
        resolveCoreWasm: (core) =>
          fetch(`${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.wasm`),
        resolveRom: (rom) => fetch(`${cdnBaseUrl}/${nesRomRepo}@master/${rom}`),
        rom: 'pong1k.nes',
      })
    },

    async launchArrayBuffers() {
      nostalgist = await Nostalgist.launch({
        core: 'fceumm',
        resolveCoreJs: (core) =>
          fetchArrayBuffer(`${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.js`),
        resolveCoreWasm: (core) =>
          fetchArrayBuffer(`${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.wasm`),
        resolveRom: (rom) => fetchArrayBuffer(`${cdnBaseUrl}/${nesRomRepo}@master/${rom}`),
        rom: 'pong1k.nes',
      })
    },

    async launchWithCache() {
      nostalgist = await Nostalgist.launch({
        cache: true,
        core: 'fceumm',
        rom: 'pong1k.nes',
      })
    },
  },

  instance: {
    async saveState() {
      state = await nostalgist.saveState()
      console.info(state)
    },

    async loadState() {
      await nostalgist.loadState(state.state)
    },

    async saveSRAM() {
      sram = await nostalgist.saveSRAM()
    },

    pause() {
      nostalgist.pause()
    },

    resume() {
      nostalgist.resume()
    },

    restart() {
      nostalgist.restart()
    },

    resize() {
      nostalgist.resize({ height: 400, width: 400 })
    },

    async pressA() {
      await nostalgist.press('a')
    },

    async pressStart() {
      await nostalgist.press('start')
    },

    async screenshot() {
      const blob = await nostalgist.screenshot()
      const image = new Image()
      image.id = 'screenshot'
      image.src = URL.createObjectURL(blob)
      image.style.display = 'block'
      image.style.margin = '1em auto 0 auto'
      await new Promise((resolve) => {
        image.addEventListener('load', resolve)
      })
      document.body.append(image)
    },

    exit() {
      nostalgist.exit()
    },

    exitWithoutRemovingCanvas() {
      nostalgist.exit({ removeCanvas: false })
    },

    printStatus() {
      setTimeout(() => {
        console.info(nostalgist?.getStatus())
      }, 100)
    },
  },
}

async function fetchArrayBuffer(input) {
  const response = await fetch(input)
  return await response.arrayBuffer()
}

function renderButtons() {
  const [staticTitle, instanceTitle] = document.querySelectorAll('h3')
  staticTitle.insertAdjacentHTML(
    'afterend',
    Object.keys(handlers.static)
      .map((name) => `<button type="button">${name}</button>`)
      .join(' '),
  )
  instanceTitle.insertAdjacentHTML(
    'afterend',
    Object.keys(handlers.instance)
      .map((name) => `<button type="button">${name}</button>`)
      .join(' '),
  )
}

type NostalgistOptionsPartial = Parameters<typeof Nostalgist.configure>[0]
export function activate(mod: typeof Nostalgist_) {
  const nostalgistConfig: NostalgistOptionsPartial = {
    style: {
      backgroundColor: 'black',
      display: 'block',
      height: '600px',
      margin: '1em auto 0 auto',
      position: 'static',
      width: '800px',
    },
  }

  if (location.search.includes('legacy')) {
    Object.assign(nostalgistConfig, {
      resolveCoreJs(core) {
        return `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.js`
      },
      resolveCoreWasm(core) {
        return `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.wasm`
      },
    } satisfies NostalgistOptionsPartial)
  }

  Nostalgist = mod
  Nostalgist.configure(nostalgistConfig)

  renderButtons()

  document.body.addEventListener('click', async function listener({ target }) {
    if (!(target instanceof HTMLButtonElement && target.textContent)) {
      return
    }
    target.disabled = true
    try {
      await { ...handlers.instance, ...handlers.static }[target.textContent]()
    } catch (error) {
      console.error(error)
    }
    target.disabled = false
    target.blur()

    globalThis.nostalgist = nostalgist
  })
}
