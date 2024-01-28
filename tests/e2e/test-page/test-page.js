// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

let nostalgist
let state

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
  nostalgist = await Nostalgist.nes({ core: 'nestopia', rom: 'pong1k.nes' })
}

async function launchSize() {
  nostalgist = await Nostalgist.nes({ rom: 'pong1k.nes', size: { width: 100, height: 100 } })
}

async function launchShader() {
  nostalgist = await Nostalgist.launch({ core: 'fceumm', rom: 'pong1k.nes', shader: 'crt/crt-geom' })
}

async function saveState() {
  state = await nostalgist.saveState()
  console.info(state)
}

async function loadState() {
  await nostalgist.loadState(state.state)
}

async function pause() {
  await nostalgist.pause()
}

async function resume() {
  await nostalgist.resume()
}

async function restart() {
  await nostalgist.restart()
}

async function resize() {
  await nostalgist.resize(400, 400)
}

async function pressA() {
  await nostalgist.press('a')
}

async function pressStart() {
  await nostalgist.press('start')
}

async function screenshot() {
  const blob = await nostalgist.screenshot()
  const image = new Image()
  image.id = 'screenshot'
  image.src = URL.createObjectURL(blob)
  await new Promise((resolve) => image.addEventListener('load', resolve))
  document.body.append(image)
}

Nostalgist.configure({
  style: {
    width: '800px',
    height: '600px',
    position: 'static',
    backgroundColor: 'transparent',
  },
  ...window.nostalgistConfig,
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
    launchSize,
    launchShader,
    saveState,
    loadState,
    pause,
    resume,
    restart,
    resize,
    pressA,
    pressStart,
    screenshot,
  }
  const textContent = target.textContent || ''
  if (textContent in handlers) {
    const handler = handlers[textContent]
    await handler()
    target.blur()
  }
})
