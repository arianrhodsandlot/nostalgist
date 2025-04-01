---
title: getCanvas
---

Get the canvas element used by the emulator.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const canvas = nostalgist.getCanvas()
console.log(canvas.width, canvas.height)
```
