---
title: configure
---

Configure default options for Nostalgist.js. These options will be applied to all following emulator launches.

## Usage
```js
Nostalgist.configure({
  style: {
    position: 'static',
  },
})

// The canvas element will have position: static
await Nostalgist.nes('flappybird.nes')

// The canvas element will have position: static too
await Nostalgist.nes('flappybird.nes')

// Reset all configurations to default
Nostalgist.resetToDefault()
```

## Arguments
+ ### `options`

  **type:** `Object`

  The options here are the same as the `options` argument for `Nostalgist.launch`.

  Please refer to [launch#options](/apis/launch/#options).
