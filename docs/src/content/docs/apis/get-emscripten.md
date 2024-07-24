---
title: getEmscriptenFS
---

Get the Emscripten object of the current running emulator.

## Since
`0.10.0`

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const { AL, Browser, exit, JSEvents, Module } = nostalgist.getEmscripten()
```
