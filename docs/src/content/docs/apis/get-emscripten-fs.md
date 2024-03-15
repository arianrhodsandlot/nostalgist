---
title: getEmscriptenFS
---

Get the Emscripten `FS` object of the current running emulator.

See [FS object](https://emscripten.org/docs/api_reference/Filesystem-API.html#id2) for more information.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const FS = nostalgist.getEmscriptenFS()
FS.readdir('/')
```
