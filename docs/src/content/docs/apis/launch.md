---
title: launch
---

Launch an emulator and return a `Promise` of the instance of the emulator.

## Usage
Here is an example of its basic usage:
```js
const nostalgist = await Nostalgist.launch({
  core: 'fceumm',
  rom: 'flappybird.nes',
})
```

A more complex example:

```js
const nostalgist = await Nostalgist.launch({
  element: document.querySelector('.emulator-canvas'),

  // Will load https://example.com/core/fbneo_libretro.js and https://example.com/core/fbneo_libretro.wasm as the launching core
  // Because of the custom `resolveCoreJs` and `resolveCoreWasm` options
  core: 'fbneo',

  // Will load https://example.com/roms/mslug.zip as the ROM
  // Because of the custom `resolveRom` option
  rom: ['mslug.zip'],

  // Will load https://example.com/roms/mslug.zip as the ROM
  // Because of the custom `resolveRom` option
  bios: ['neogeo.zip'],

  // Custom configuration for RetroArch
  retroarchConfig: {
    rewind_enable: true,
    savestate_thumbnail_enable: true,
  }

  // Specify where to load the core files
  resolveCoreJs({ core }) {
    return `https://example.com/core/${core}_libretro.js`
  },
  resolveCoreWasm({ core }) {
    return `https://example.com/core/${core}_libretro.wasm`
  },

  // Specify where to load the ROM files
  resolveRom({ file }) {
    return `https://example.com/roms/${file}`
  },

  // Specify where to load the BIOS files
  resolveBios({ file }) {
    return `https://example.com/system/${file}`
  },
})
```

## Arguments
+ ### `options`

  **type:** `Object`

  This argument describes how will the emulator and the game be launched.
  + #### `element`

    **type:** `string | HTMLCanvasElement` **default:** an empty string `''`

    Use this option to specify the canvas element you want to launch the emulator with. If it's an `string`, we will look up the element by `documen.querySelector`

    If it's an empty string, a canvas element will be created automaticlly and this canvas element will be append to `document.body`.

    For example,
    ```js
    await Nostalgist.launch({
      e
      rom: 'flappybird.nes',
      core: 'fceumm'
    })
    ```

  + #### `style`

    **type:** `Object`

    If the canvas element is created automatically, the style will be

    ```js
    {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      zIndex: '1',
    }
    ```

    otherwise it will be `undefined`.

    The CSS rule name should be "camelCase" instead of "kebab-case". For example, `{ backgroundColor: 'black' }` is valid, but `{ background-color: '' }` is not.

  + #### `size`

    **type:** `'auto' | { width: number, height: number }` **default:** `'auto'`

    The size of the canvas element.
    If it's `'auto'`, the canvas element will keep its original size, or it's width and height will be updated as specified.

  + #### `core`

    **type:** `string | { name: string, js: string, wasm: string | ArrayBuffer }`

    The core represent the emulator we are going to use. Since we are using RetroArch compiled by Emscripten under the hood, we need to pass the compiled js file and wasm file here.

    If you pass a `string` here, by default, we will lookup the corresponding core at this GitHub repository [retroarch-emscripten-build](https://github.com/arianrhodsandlot/retroarch-emscripten-build), which contains the official build cores from [libretro buildbot](https://buildbot.libretro.com/stable/) , and then the core will be loaded via jsDelivr, a public free CDN that can load files from GitHub with CORS support.

    For example, if you pass `snes9x` here, these 2 files will be loaded:
    + [snes9x_libretro.js](https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/snes9x_libretro.js)
    + [snes9x_libretro.wasm](https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/snes9x_libretro.wasm)

    That's because there is a default `resolveCoreJs` option that can resolve `string`s like `snes9x` to links above. By default, we support these cores from [retroarch-emscripten-build](https://github.com/arianrhodsandlot/retroarch-emscripten-build):
    > 2048, arduous, bk, bluemsx, chailove, craft, ecwolf, fbalpha2012_cps1, fbalpha2012_cps2, fbalpha2012, fbalpha2012_neogeo, fceumm, freechaf, galaksija, gambatte, gearboy, gearcoleco, gearsystem, genesis_plus_gx, genesis_plus_gx_wide, gme, gong, gw, handy, jaxe, jumpnbump, lowresnx, lutro, mame2000, mame2003, mame2003_plus, mednafen_lynx, mednafen_ngp, mednafen_pce_fast, mednafen_vb, mednafen_wswan, mgba, minivmac, mrboom, mu, neocd, nestopia, numero, nxengine, o2em, opera, pcsx_rearmed, picodrive, pocketcdg, prboom, quasi88, quicknes, retro8, snes9x2002, snes9x2005, snes9x2010, snes9x, squirreljme, tgbdual, theodore, tic80, tyrquake, uw8, uzem, vaporspec, vba_next, vecx, vice_x128, vice_x64, vice_x64sc, vice_xcbm2, vice_xcbm5x0, vice_xpet, vice_xplus4, vice_xscpu64, vice_xvic, virtualxt, vitaquake2-rogue, vitaquake2-xatrix, vitaquake2-zaero, vitaquake2, wasm4, x1, xrick

    If you want to specify how to use your custom cores, a custom `resolveCoreJs` can be implemented by your self to achive this.

    You can also pass an `Object` instead of a `string` to use a loaded a custom url as the core. Here's an example.
    ```js
    await Nostalgist.launch({
      rom: 'https://example.com/roms/super metriod.sfc',
      core: {
        name: 'snes9x',
        core: 'https://example.com/cores/snes9x.js',
        wasm: 'https://example.com/cores/snes9x.wasm',
      }
    })
    ```
    The `core.wasm` option can be an `ArrayBuffer` as well.

  + #### `rom`

    **type:** `string | File | { fileName: string; fileContent: Blob } | Array`

    The game ROM file.

    If it's a `string` and starts with `https://` or `http://` or `//`, it will be treated as a URL, and a request will be made to load the ROM from that url.
    Otherwise it will be passed to `resolveRom` option to load the ROM.

    There is a default `resolveRom` mechanism that can load free ROMs from [retrobrews](https://retrobrews.github.io/), a project hosting lots of free homebrew ROMs. For example,
    ```js
    await Nostalgist.launch({
      rom: 'flappybird.nes',
      core: 'fceumm'
    })
    ```
    This will load `flappybird.nes` from the repository [retrobrews/nes-games](https://github.com/retrobrews/nes-games).

    We will use the extension name of the `rom` option to determine which repository to load ROM from. Here is the related code implementation:
    ```js
    if (file.endsWith('.nes')) {
      romRepo = 'retrobrews/nes-games'
    } else if (file.endsWith('.sfc')) {
      romRepo = 'retrobrews/snes-games'
    } else if (file.endsWith('.gb') || file.endsWith('.gbc')) {
      romRepo = 'retrobrews/gbc-games'
    } else if (file.endsWith('.gba')) {
      romRepo = 'retrobrews/gba-games'
    } else if (file.endsWith('.sms')) {
      romRepo = 'retrobrews/sms-games'
    } else if (file.endsWith('.md') || file.endsWith('.bin')) {
      romRepo = 'retrobrews/md-games'
    }
    ```

    You can also pass a [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) object or an object with `fileName` and `fileContent` properties. The file name will be preserved when being loaded at the file system of Emulator.

    In some circumstances, you may want to launch multiple ROMs simultaneously, for example, for some arcade games with a "parent" ROM. Then you can pass an Array of any of above.

  + #### `bios`

    **type:** `string | File | { fileName: string; fileContent: Blob } | Array`

    Basicly it's the same as the `rom` option. Files passed here will be write to RetroArch's `system` directory.

  + #### `retroarchConfig`
    **type:** `Object`

    The content you want to specify in `retroarch.cfg`, custom stuff like key mappings can be set using this option. Refer to [libretro/RetroArch/retroarch.cfg](https://github.com/libretro/RetroArch/blob/master/retroarch.cfg) for more information about how to config RetroArch.

    Keep in mind that not all options can take effects since we are launching RetroArch in a browser, not a native environment. And setting `stdin_cmd_enable` to `false` can cause Nostalgist.js saving or loading broken.

  + #### `retroarchCoreConfig`
    **type:** `Object`

    The content you want to specify in the core option file.

    For example,
    ```js
    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      rom: 'flappybird.nes',
      retroarchCoreConfig: {
        fceumm_turbo_enable: 'Both',
      },
    })
    ```

  + #### `runEmulatorManually`
    **type:** `boolean` **default:** `false`

    If set to `true`, `Nostalgist.launch(options)` will still return a emulator instance, but will not start it automatically.

    The emulator will start only when `<instance>.launchEmulator` is called later.

    For example,
    ```js
    const nostalgist = await Nostalgist.launch(options) // will not launch the emulator
    await nostalgist.launchEmulator() // the emulator will be started
    ```

  + #### `emscriptenModule`
    **type:** `boolean` **default:** `{}`

    An option to override the `Module` object for Emscripten. See [Module object](https://emscripten.org/docs/api_reference/module.html).

    This is a low level option and not well tested, so use it at your own risk.

    ```js
    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      rom: 'flappybird.nes',
      emscriptenModule: {
        printErr(str) {
          yourLogger.error(str)
        }
      }
    })
    ```

  + #### `resolveCoreJs`
    **type:** `Function`

    A custom function used for resolving a RetroArch core. The return value of this function can be a URL string, like `'https://example.com/core-name.js'`.

    The function can also be asynchronous and returning a `Promise` of URL string.

    The original `core` options and the whole `options` will be passed to the function.

    Here is an example,
    ```js
    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      rom: 'flappybird.nes',

      resolveCoreJs(core, options) {
        // will print 'fceumm'
        console.log(core)

        // will print the whole options object: { core: 'fceumm', rom: 'flappybird.nes', ... }
        console.log(options)

        return `https://example.com/${core}.js`
      }
    })
    ```

  + #### `resolveCoreWasm`
    **type:** `Function`

    A custom function used for resolving a RetroArch core. The return value of this function can be a URL string or `ArrayBuffer`.

    The function can also be asynchronous and returning a `Promise` of URL string or `ArrayBuffer`.

    Here is an example,
    ```js
    const nostalgist = await Nostalgist.launch({
      core: 'fceumm',
      rom: 'flappybird.nes',

      resolveCoreWasm(core, options) {
        // will print 'fceumm'
        console.log(core)

        // will print the whole options object: { core: 'fceumm', rom: 'flappybird.nes', ... }
        console.log(options)

        return `https://example.com/${core}.wasm`
      }
    })
    ```

  + #### `resolveRom`
    **type:** `Function`

    A custom function used for resolving a ROM. The return value of this function can be a `string | File | { fileName: string; fileContent: Blob } | Array` or a `Promise` of above.

  + #### `resolveBios`
    **type:** `Function`

    A custom function used for resolving a BIOS. The return value of this function can be a `string | File | { fileName: string; fileContent: Blob } | Array` or a `Promise` of above.

## Returns
A `Promise` of the instance of the emulator.
