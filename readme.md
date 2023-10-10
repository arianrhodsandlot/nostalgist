<p align="center">
  <img src="docs/src/assets/logo.png" width="150" height="150">

</p>

<h1 align="center">Nostalgist.js</h1>

## Overview
Nostalgist.js is a JavaScript library that allows you to run emulators of retro consoles, like NES and Sega Genesis, within web browsers.

## Features
+ Launch a retro game with RetroArch emulator in a browser

  ```js
  await Nostalgist.launch({
    core: 'fceumm',
    rom: 'flappybird.nes',
  })
  ```

  Related API: [`launch`](https://nostalgist.js.org/apis/launch)
+ Save the state of the game, then load it later

  ```js
  const nostalgist = await Nostalgist.nes('flappybird.nes')
  const { state } = await nostalgist.saveState()
  nostalgist.loadState(state)
  ```

  Related APIs: [`saveState`](https://nostalgist.js.org/apis/save-state), [`loadState`](https://nostalgist.js.org/apis/load-state)
+ Customize any RetroArch config before launching
  ```js
  const nostalgist = await Nostalgist.launch({
    core: 'nestopia',
    rom: 'flappybird.nes',
    retroarchConfig: {
      rewind: true
    }
  })
  ```

  Related API: [`launch#retroarchConfig`](https://nostalgist.js.org/apis/launch#retroarchConfig)
+ Access low level APIs of Emscripten

  ```js
  const rom = 'https://example.com/zelda.sfc'
  const nostalgist = await Nostalgist.snes(rom)
  const FS = nostalgist.getEmscriptenFS()
  FS.readFile('/xx/xx/xx.srm')
  ```

  Related APIs: [`getEmscriptenModule`](https://nostalgist.js.org/apis/get-emscripten-module), [`getEmscriptenFS`](https://nostalgist.js.org/apis/get-emscripten-fs)

## Motivation
Nostalgist.js is built on top of RetroArch Emscripten builds. We love RetroArch to run in browsers because that's portable and convenient. Although there is already an official instance, [RetroArch web player](https://web.libretro.com/), and some third-party ones like [webretro](https://binbashbanana.github.io/webretro/), it's still not that easy to launch RetroArch in a browser programmatically.

The purpose of Nostalgist.js is to simplify the process of launching an emulator  to play a game, via RetroArch, in browsers. Given a ROM and a core, the game should be launched without any additional configuration.

## APIs
Please refer to [nostalgist.js.org](https://nostalgist.js.org/).

## Related projects
### Credit
+ RetroArch
+ Emscripen
+ BrowserFS
### Showcases
+ [Retro Assembly](https://github.com/arianrhodsandlot/retro-assembly): Emulators running in this web app are powered by Nostalgist.js.
### Alternatives
+ EmulatorJS

## Caveat
Nostalgist.js **DO NOT** privide any pirated content, like copyrighted ROM files or BIOS files.

## License
MIT
