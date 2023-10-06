import { Nostalgist } from '../src'

async function runExample1() {
  await Nostalgist.nes('assimilate.nes')
}

async function runExample2() {
  const nostalgist = await Nostalgist.launch({
    rom: 'astroperdido.bin',
    core: 'genesis_plus_gx',
  })
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const state = await nostalgist.saveState()
  console.log(state)
}

async function runExample3() {
  await Nostalgist.gba('awerewolftale.gba')
}

function main() {
  document.body.querySelector('#run-example-1').addEventListener('click', runExample1)
  document.body.querySelector('#run-example-2').addEventListener('click', runExample2)
  document.body.querySelector('#run-example-3').addEventListener('click', runExample3)
}

main()
