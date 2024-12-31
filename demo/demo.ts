import { Nostalgist } from '../src'

let nostalgist: Nostalgist
let state: Awaited<ReturnType<Nostalgist['saveState']>>

async function nes() {
  nostalgist = await Nostalgist.nes({ rom: 'flappybird.nes' })
}

async function megadrive() {
  nostalgist = await Nostalgist.megadrive('asciiwar.bin')
}

async function gbc() {
  nostalgist = await Nostalgist.gbc('combatsoccer.gbc')
}

async function launchNestopia() {
  nostalgist = await Nostalgist.launch({
    core: 'nestopia',
    rom: 'pong1k.nes',
  })
}

async function launchFceummWithCoreConfig() {
  nostalgist = await Nostalgist.launch({
    core: 'fceumm',
    retroarchCoreConfig: {
      fceumm_turbo_enable: 'Both',
    },
    rom: 'flappybird.nes',
    shader: 'crt/crt-easymode',
  })
}

async function launchFceummWithRaLegacy() {
  nostalgist = await Nostalgist.launch({
    core: 'fceumm',
    resolveCoreJs(core) {
      return `https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/${core}_libretro.js`
    },
    resolveCoreWasm(core) {
      return `https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/${core}_libretro.wasm`
    },
    rom: 'flappybird.nes',
  })
}

async function launchCustomRom() {
  nostalgist = await Nostalgist.launch({
    core: 'fceumm',
    rom: await showOpenFilePicker().then(([fileHandle]) => fileHandle.getFile()),
  })
}

async function launchState() {
  const stateDataUrl =
    'data:application/octet-stream;base64,I1JaSVB2ASMAAAIAuDUAAAAAAABBBAAAeJztmt9rHEUcwL+7cxe3PZqNtUnR1usd1DaxFfYuOSw2kuztj9wl92Ozu3fXi7VULPEn5MUfsc1DJEEsTUKgYJGIlEBfqmgrItXH/gUB9clnqW8W8uKDMn5ndjc9o01LYwzF+ZC5+cyPnf3uzh07s8TVPV/3LalslVOf5gBsw6MLmNcOAUcqKACOASBjYd+MzqowOSdCgWYkXih/OKEcNvOB/O7qZQA2DkxLwbCTyyrLemAxWYJk3wc/fD1/BctT3bDG44NHe2A3dKAO7mcVZ67z+m4cSOqELUS5wbNbV4D8uwNfC7IB0O5fHpjJZYpD4N/0avy2BN/DMxpI2o8Aq3EtAbdgb9CKaNJ9DplO9R9Nq0f60+qzXWn16eOgdnaA2p3CdAzUwz3r+988f/P88uSv7wPEn/pu9sjlLyQY/5zIpz6TpZe/jJHTX8XlF1Nt0lR3lzRFWbLJSTpEztACeZMWyVt0mEzRETJLS2SONrE8huUXsHwSy8/JU/S4PEv75Tk6Lp+jr8gz9FX5An1Nvkhfl5foG/LHtI71Dax/h5yj75IZOkku0PfIRXqWLFGMhWIsFGOhGAvFWCjGvJVpvp0sqGS+kyx0kQ+/pXT+QJAlyVyapCi9TFd+Of0AU/0XbmySzZ5fIBAI1rOnOynbmA/r5TJ/4BRHS/kYE1xaFI2Jl5izBvS3mV+jlPpe3sPnPfx8Sm1jXcsTEw5fW5BLOwAqvu6ydYVge0lIMonF29S75YqyY2dC2dWOufJPeceju7s2So/t6dy7Udq3/8knNkrJh5zUPdju+DbLvb5ftXVcDdkZ8l98xwV3R/z+txbx+9/49++4ejkFf9+fDuD+dAD3p5iODeD+1MOObInxf9+HOk7NZSusxeQgjFSrI3w5Zlq6ycXxnBKXE1XbZiLV/aGgxtVNk70Iiit+ZFDP13ivpDNkVZgsxg7g53DTzbMOCgxXm14snMmS53t8pPhBAmAXjAprWVkiYBsVn5/M8Yb4Sx9NCdI0rMZvgyRZFaPAOqjFUTtYQFZca4idYvl53y3yKgnF4G2W5jmBZCLJRqKVq0yIlYkkG4lmZvg4ViaSbCSaWWeiYFM9PCqQRMmqaOwy2HMIPdPi2RbvjdxrWJbMb4fh2pno1qBnI/cahs96SJJXdEfZSQZzumGw5iaWcvkiv1fxHM5CdEzOK47d8QKfE8jVzXIo4dXnvLFgLvHYUOyyH8xuw9SDV3m6wcM6lPiJoPOwPvJXZNcwef0jrLNhZqMVO951PsO7mIdxJs9egkron7S3g5E37lxq3si2eG+L97V4bu12VPy1b5DvVe3IG6VwTIV7tsV7o9jQ+6J6G6+LbxfGv+G7CSxnWVn6jXJ8o1pjfVljQ69b07D9dCgpDIa9QcWcCgQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgeOgBsCpmiv1bwJ+v4hVL'
  const response = await fetch(stateDataUrl)
  const state = await response.blob()
  nostalgist = await Nostalgist.nes({ rom: 'flappybird.nes', state })
}

async function saveState() {
  state = await nostalgist.saveState()
}

async function loadState() {
  await nostalgist.loadState(state.state)
}

function pause() {
  nostalgist.pause()
}

function resume() {
  nostalgist.resume()
}

function restart() {
  nostalgist.restart()
}

function resize() {
  nostalgist.resize({ height: 400, width: 400 })
}

async function screenshot() {
  const blob = await nostalgist.screenshot()
  const img = new Image()
  img.src = URL.createObjectURL(blob)
  document.body.append(img)
  console.info(blob)
}

function exit() {
  nostalgist.exit({ removeCanvas: false })
}

function getCurrentNostalgist() {
  return nostalgist
}

Nostalgist.configure({
  style: { height: '600px', position: 'static', width: '800px' },

  onLaunch(instance) {
    // @ts-expect-error for debug usage
    globalThis.nostalgist = instance
  },
})

document.body.addEventListener('click', async function listener({ target }) {
  if (!(target instanceof HTMLButtonElement)) {
    return
  }
  const handlers = {
    exit,
    gbc,
    launchCustomRom,
    launchFceummWithCoreConfig,
    launchFceummWithRaLegacy,
    launchNestopia,
    launchState,
    loadState,
    megadrive,
    nes,
    pause,
    resize,
    restart,
    resume,
    saveState,
    screenshot,
  }
  const textContent = target.textContent || ''
  if (textContent in handlers) {
    const handler = handlers[textContent]
    await handler()
    target.blur()
  }
  Object.assign(globalThis, { nostalgist })
})

// @ts-expect-error debug code
globalThis.Nostalgist = Nostalgist
// @ts-expect-error debug code
globalThis.getCurrentNostalgist = getCurrentNostalgist
