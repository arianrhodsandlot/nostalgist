---
title: getEmscriptenModule
---

Get the Emscripten Module object of the current running emulator.

See [Module object](https://emscripten.org/docs/api_reference/module.html) for more information.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const Module = await nostalgist.getEmscriptenModule()
Module._cmd_take_screenshot()
```
