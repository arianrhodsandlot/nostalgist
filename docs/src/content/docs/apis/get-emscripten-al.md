---
title: getEmscriptenFS
---

Get the Emscripten `AL` object of the current running emulator.

See [FS object](https://emscripten.org/docs/api_reference/Filesystem-API.html#id2) for more information.

## Since
`0.10.0`

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const AL = nostalgist.getEmscriptenAL()
FS.readdir('/')
```
