---
title: resize
---

Resize the canvas element used by the emulator.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

// Resize to 800x600
await nostalgist.resize({ height: 600, width: 800 })
```

## Arguments
+ ### `size`

  **type:** `{ width: number, height: number }`

  The new size to set for the canvas.
