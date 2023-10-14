import { Nostalgist } from '../src'

let nostalgist: Nostalgist
let state: Awaited<ReturnType<Nostalgist['saveState']>>

async function nes() {
  nostalgist = await Nostalgist.nes('flappybird.nes')
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
    rom: 'flappybird.nes',
    retroarchCoreConfig: {
      fceumm_turbo_enable: 'Both',
    },
  })
}

async function launchCustomRom() {
  nostalgist = await Nostalgist.launch({
    core: 'fceumm',
    rom: await showOpenFilePicker().then(([fileHandle]) => fileHandle.getFile()),
  })
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
  nostalgist.resize({ width: 400, height: 400 })
}

function exit() {
  nostalgist.exit({ removeCanvas: false })
}

function getCurrentNostalgist() {
  return nostalgist
}

Nostalgist.configure({
  style: { width: '800px', height: '600px', position: 'static' },
})

document.body.addEventListener('click', async function listener({ target }) {
  if (!(target instanceof HTMLButtonElement)) {
    return
  }
  const handlers = {
    nes,
    megadrive,
    gbc,
    launchNestopia,
    launchFceummWithCoreConfig,
    launchCustomRom,
    saveState,
    loadState,
    pause,
    resume,
    restart,
    resize,
    exit,
  }
  const textContent = target.textContent || ''
  if (textContent in handlers) {
    const handler = handlers[textContent]
    await handler()
    target.blur()
  }
})

// @ts-expect-error debug code
window.Nostalgist = Nostalgist
// @ts-expect-error debug code
window.getCurrentNostalgist = getCurrentNostalgist
