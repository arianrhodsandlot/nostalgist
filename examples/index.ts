import { Nostalgist } from "../src";

async function runExample1() {
  await Nostalgist.nes('super tile bros.nes')
}

async function runExample2() {
  const nostalgist = await Nostalgist.megadrive({
    rom: 'super tile bros.md',
    core: 'genesis_plus_gx,'
  })
  const emulatorOptions = nostalgist.getEmulatorOptions()
  const state = await nostalgist.saveState()
  console.log(state)
}

async function runExample3() {
  await Nostalgist.gba('super tile bros.nes')
}

function main() {
  document.body.getElementById('run-example-1').addEventListener('click', runExample1)
  document.body.getElementById('run-example-2').addEventListener('click', runExample2)
}

main()
