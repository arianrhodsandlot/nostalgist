---
title: configure
---

Update the global options for `Nostalgist`, so everytime the `Nostalgist.launch` method or shortcuts like `Nostalgist.nes` is called, the default options specified here will be used.

## Usage
```js
// set global options
Nostalgist.configure({
  element: '.emulator-canvas',
  resolveRom(rom) {
    return `https://example.com/roms/${rom}`
  }
})

// emulator will use `document.querySelector('.emulator-canvas')` as the default DOM element for emulating
// and will load the ROM from `https://example.com/roms/my-nes-game.nes`
await Nostalgist.launch({
  core: 'fceumm',
  rom: 'my-nes-game.nes',
})
```

## Arguments
+ ### `options`
  The options argument here is the same as the `options` argument for `Nostalgist.launch`.

  Please refer to [launch#options](/apis/launch/#options).
