<h1 align="center">Nostalgist.js</h1>

<p align="center">
  <img src="docs/src/assets/logo.png" width="150" height="150">
</p>

<p align="center">
  <a href="https://nostalgist.js.org/" title="nostalgist.js.org">
    <img width="181" height="28" src="https://img.shields.io/badge/nostalgist.js.org-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black" alt="nostalgist.js.org badge" />
  </a>
  <a href="https://github.com/arianrhodsandlot/nostalgist" title="Nostalgist.js on GitHub">
    <img width="95" height="28" src="https://img.shields.io/badge/GitHub-181717.svg?style=for-the-badge&logo=GitHub&logoColor=white" alt="GitHub badge" />
  </a>
  <a href="https://www.npmjs.com/package/nostalgist" title="Nostalgist.js on NPM">
    <img width="73" height="28" src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="NPM badge" />
  </a>
</p>

Nostalgist.js is a JavaScript library that allows you to run emulators of retro consoles, like NES and Sega Genesis, within web browsers.

## A Quick Glance
<p align="center">
  <img src="docs/src/assets/console-demo.gif" alt="console demo" />
</p>

## Website
Checkout [nostalgist.js.org](https://nostalgist.js.org/) for more online examples and documentation.

## Features
+ Launch a retro game with RetroArch emulator in a browser

  ```js
  import { Nostalgist } from 'nostalgist'

  await Nostalgist.launch({
    core: 'fceumm',
    rom: 'flappybird.nes',
  })
  ```

  Related API: [`launch`](https://nostalgist.js.org/apis/launch)
+ Save the state of the game, then load it later

  ```js
  import { Nostalgist } from 'nostalgist'

  const nostalgist = await Nostalgist.nes('flappybird.nes')
  const { state } = await nostalgist.saveState()
  nostalgist.loadState(state)
  ```

  Related APIs: [`saveState`](https://nostalgist.js.org/apis/save-state), [`loadState`](https://nostalgist.js.org/apis/load-state)
+ Customize any RetroArch config before launching
  ```js
  import { Nostalgist } from 'nostalgist'

  const nostalgist = await Nostalgist.launch({
    core: 'nestopia',
    rom: 'flappybird.nes',
    retroarchConfig: {
      rewind_enable: true,
    },
    retroarchCore
  })
  ```

  Related API: [`launch#retroarchConfig`](https://nostalgist.js.org/apis/launch#retroarchconfig)
+ Access low level APIs of Emscripten

  ```js
  import { Nostalgist } from 'nostalgist'

  const rom = 'https://example.com/zelda.sfc'
  const nostalgist = await Nostalgist.snes(rom)
  const FS = nostalgist.getEmscriptenFS()
  FS.readdir('/home/web_user/retroarch/userdata/saves/Snes9x/zelda.srm')
  ```

  Related APIs: [`getEmscriptenModule`](https://nostalgist.js.org/apis/get-emscripten-module), [`getEmscriptenFS`](https://nostalgist.js.org/apis/get-emscripten-fs)

## Motivation
Nostalgist.js is built on top of RetroArch Emscripten builds. We love RetroArch to run in browsers because that's portable and convenient. Although there is already an official instance, [RetroArch web player](https://web.libretro.com/), and some third-party ones like [webretro](https://binbashbanana.github.io/webretro/), it's still not that easy to launch RetroArch in a browser programmatically.

The purpose of Nostalgist.js is to simplify the process of launching an emulator to play a game, via RetroArch, in browsers. Given a ROM and a core, the game should be launched without any additional configuration.

## APIs
Please refer to [nostalgist.js.org/apis](https://nostalgist.js.org/apis).

## Related

### Credits

+ These are the fundamental dependencies of Nostalgist.js.
  + [RetroArch](https://www.retroarch.com/) and its friends(the emulators/cores)
  + [Emscripten](https://emscripten.org/)
  + [BrowserFS](https://github.com/jvilk/BrowserFS)

+ We are using ROMs here for the purpose of demonstration.
  + [retrobrews](https://retrobrews.github.io/) and the authors of the homebrew games.

+ By default, our ROMs and cores are all loaded from this free CDN service.
  + [jsDelivr](https://www.jsdelivr.com/)

### Showcases
+ [Retro Assembly](https://github.com/arianrhodsandlot/retro-assembly)

  A web app with which you can build a custom retro gaming library inside your browser.
  Game states can be synced with cloud storage services like OneDrive/Google Drive/Dropbox

  It's built on top of Nostalgist.js.

### Alternatives
+ [EmulatorJS](https://emulatorjs.org/)

  Another JavaScript library for emulation inside browsers.

  It's more powerful and more sophisticated. It has many custom cores and has a friendly user interface. It can be used inside mobile browsers with touch support.

  It's not that friendly towards modern frontend development.


## Caveat
Nostalgist.js **DOES NOT** provide any pirated content, like copyrighted ROM files or BIOS files.

## License
[MIT](license)
