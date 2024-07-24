---
title: getEmscriptenAL
---

Get the Emscripten `AL` object of the current running emulator.

## Since
`0.10.0`

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const AL = nostalgist.getEmscriptenAL()
console.log(AL.currentCtx)
```
