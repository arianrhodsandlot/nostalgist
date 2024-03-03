---
title: getBrowserFS
---

Get the `BFSEmscriptenFS` object of the current running emulator.

See [BFSEmscriptenFS](https://jvilk.com/browserfs/1.4.1/classes/_generic_emscripten_fs_.bfsemscriptenfs.html) for more information.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const browserFS = await nostalgist.getBrowserFS()
const nodeFS = browserFS.getNodeFS()
nodeFS.readdirSync('/')
```
