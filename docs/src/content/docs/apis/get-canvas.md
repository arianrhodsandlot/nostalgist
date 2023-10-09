---
title: getCanvas
---

Get the canvas DOM element that the current emulator is using.

## Usage
```js
const nostalgist = await Nostalgist.launch('flappybird.nes')
const canvas = nostalgist.getCanvas()
console.log(canvas) // a canvas element
```
