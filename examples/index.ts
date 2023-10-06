import { Nostalgist } from '../src'

Nostalgist.configure({
  resolveCoreJs({ core }) {
    return `/cores/${core}_libretro.js`
  },

  resolveCoreWasm({ core }) {
    return `/cores/${core}_libretro.wasm`
  },

  resolveRom({ options: { core }, file }) {
    const directory = {
      genesis_plus_gx: 'megadrive',
      fceumm: 'nes',
    }[`${core}`]
    if (directory && typeof file === 'string') {
      return `/roms/${encodeURIComponent(directory)}/${encodeURIComponent(file)}`
    }
  },
})

async function runExample1() {
  await Nostalgist.nes('Alter Ego.nes')
}

async function runExample2() {
  const nostalgist = await Nostalgist.launch({
    rom: '30YearsOfNintendont.zip',
    core: 'genesis_plus_gx',
  })
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const state = await nostalgist.saveState()
  console.log(state)
}

async function runExample3() {
  await Nostalgist.gba('super tile bros.nes')
}

function main() {
  document.body.querySelector('#run-example-1').addEventListener('click', runExample1)
  document.body.querySelector('#run-example-2').addEventListener('click', runExample2)
}

main()
