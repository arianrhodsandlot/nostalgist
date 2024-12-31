---
title: Under the hood
tableOfContents: true
---

How does Nostalgist.js work? There are several steps while launching an Emulator.

### Step one
Load the emulator and the ROM.

Nostalgist.js itself doesn't contain any emulators, but it has a resonable default options, so official emulators built with Emscripten and provided by [RetroArch's buildbot](https://buildbot.libretro.com/). It can also load some homebrew games from
[retrobrews](https://retrobrews.github.io/) project without additional configuration.

By default, cores will be loaded via [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) from [retroarch-emscripten-build](https://github.com/arianrhodsandlot/retroarch-emscripten-build) through [jsDelivr](https://www.jsdelivr.com). For example, the fceumm core, an NES emulator, will be loaded from these URLs:
+ https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.19.1/retroarch/fceumm_libretro.js
+ https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.19.1/retroarch/fceumm_libretro.wasm

Games from [retrobrews](https://retrobrews.github.io/) are loaded in a similar way too. And of course you can also load all the nessasary contents by yourself.

If you own a server and your ROM files are hosted there, you can also load them by something like:
```js
await Nostalgist.nes('https://your-server.com/roms/super-mario-bros.nes')
```

Make sure your server have configured the CORS headers properly.

### Step two
Prepare a virtual file system. The files loaded by step one will be written here as well.

### Step three
Launch RetroArch with the virtual file system and the canvas element we specified in the code.

After launching, Nostalgist.js can comunicate with RetroArch in these ways:
+ Read or write files to the virtual file system.
+ Call functions exported by Emscripten. If the official builds are being used, the functions are listed in [the `Makefile` for theses builds](https://github.com/libretro/RetroArch/blob/1e572aaa7a32807159d809e29f04a9aa52ed8917/Makefile.emscripten#L83).
+ Send commands to the process of RetroArch. All available commands are listed in [the document of RetroArch](https://docs.libretro.com/development/retroarch/network-control-interface/#commands).
