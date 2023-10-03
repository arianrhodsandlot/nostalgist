# Nostalgist.js

## Overview
Nostalgist.js is a library used for running emulators of retro consoles inside browsers.

Here is an basic examples showing what does it look like:

```js
import { Nostalgist } from 'nostalgist'

await Nostalgist.nes('supertiltbros.nes')
```
You can try this in stackblitz.

## APIs
### Nostalgist.nes
Shortcuts for launching a NES game.
#### example
```js
await Nostalgist.launch('https://example.com/game.zip')

await Nostalgist.launch({
  core: 'fceumm',
  rom: 'https://example.com/game.zip'
})
```

### Nostalgist.arcade / Nostalgist.atari2600 / Nostalgist.atari5200 / Nostalgist.atari7800 / Nostalgist.fds / Nostalgist.gamegear / Nostalgist.gb / Nostalgist.gba / Nostalgist.gbc / Nostalgist.megadrive / Nostalgist.ngp / Nostalgist.ngpc / Nostalgist.sms / Nostalgist.snes / Nostalgist.vb / Nostalgist.wonderswan / Nostalgist.wonderswancolor
Shortcuts for launching a game for various platforms. Their parameters are  basically same as `Nostalgist.nes`, except they will use their certain emulators instead of a NES emulator.

see `Nostalgist.nes`.

### Nostalgist.launch
Launch a game
#### example
```js
await Nostalgist.launch({ core: 'fceumm', rom: 'https://example.com/game.zip' })

await Nostalgist.launch({
  core: {
    js: 'https://example.com/fceumm.js',
    wasm: 'https://example.com/fceumm.wasm',
  },
  rom: 'https://example.com/game.zip'
})

await Nostalgist.launch({
  element: '#canvas',
  core: 'nestopia',
  rom: ['xxx.zip'],
  bios: ['xxx.zip', 'xxx.zip'],
  retroarchConfig: {
    asdf: '1',
  },
  coreConfig: {
    asdf: '1',
  },
})
```

### Nostalgist.configure
change the global configuration for every Nostalgist instance.
#### example
```js
Nostalgist.config({
  resolveCoreJs(core) {
    return `https://web.libretro.com/${core}_libretro.js`
  },
  resolveCoreWasm(wasmBinary) {
    return `https://web.libretro.com/${wasmBinary}_libretro.wasm`
  },
  resolveRom(rom) {
    return rom,
  },
  resolveBios(bios) {
    return bios,
  },
  retroarchConfig: {}
})
```

### nostalgist.saveState
save the state of current game.
#### example
```js
const nostalgist = await Nostalgist.nes('https://example.com/game.nes')
const { state, thumbnail } = await nostalgist.saveState()
console.log(state) // game state
console.log(thumbnail) // game thumbnail when game state is saved
```

### nostalgist.loadState
load the state of current game.
#### example
```js
const nostalgist = await Nostalgist.nes('https://example.com/game.nes')
const state = await (await fetch('game.state')).blob()
const state = await nostalgist.loadState(state)
```

### nostalgist.pause
pause current game.
#### example
```js
const nostalgist = await Nostalgist.nes('https://example.com/game.nes')
nostalgist.pause() // the game is paused
```

### nostalgist.resume
resume current game if it has been paused.
#### example
```js
const nostalgist = await Nostalgist.nes('https://example.com/game.nes')
nostalgist.pause() // the game is paused
nostalgist.resume() // the game is resumed
```

### nostalgist.restart
restart current game.
#### example
```js
const nostalgist = await Nostalgist.nes('https://example.com/game.nes')
await new Promise((resolve) => setTimeout(resolve, 5000)) // wait for 5 seconds
nostalgist.restart() // the game goes to title screen
```

### nostalgist.exit
exit the emulator, remove the related canvas element if it has been attached to document
#### example
```js
const nostalgist = await Nostalgist.nes('https://example.com/game.nes')
await new Promise((resolve) => setTimeout(resolve, 5000)) // wait for 5 seconds
nostalgist.exit() // the game stop running
```

<!-- ## Related projects
+ [Retro Assembly](https://github.com/arianrhodsandlot/retro-assembly): Emulators running in this web app are powered by Nostalgist.js. -->

## License
MIT
