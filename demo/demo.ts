import { Nostalgist } from '../src'

let nostalgist: Nostalgist
let state: Awaited<ReturnType<Nostalgist['saveState']>>

async function nes() {
  nostalgist = await Nostalgist.nes('pong1k.nes')
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

document.body.addEventListener('click', async function listener({ target }) {
  if (!(target instanceof HTMLButtonElement)) {
    return
  }
  const handlers = {
    nes,
    megadrive,
    gbc,
    launchNestopia,
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
