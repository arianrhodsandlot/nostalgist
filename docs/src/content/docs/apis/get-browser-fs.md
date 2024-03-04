---
title: getBrowserFS
---

Get the `BFSEmscriptenFS` object of the current running emulator.

See [BFSEmscriptenFS](https://jvilk.com/browserfs/1.4.1/classes/_generic_emscripten_fs_.bfsemscriptenfs.html) for more information.

## Since
`0.9.0`

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const browserFS = nostalgist.getBrowserFS()
const nodeFS = browserFS.getNodeFS()
nodeFS.readdirSync('/')
```
