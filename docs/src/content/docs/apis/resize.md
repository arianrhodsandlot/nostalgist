---
title: resize
---

Resize the canvas element of the emulator.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

nostalgist.resize({ height: 800, width: 1000 })
```

## Arguments
+ ### `size`

  **type:** `{ width: number, height: number }`

  `width` and `height` represent the size of the canvas element, in pixel.
