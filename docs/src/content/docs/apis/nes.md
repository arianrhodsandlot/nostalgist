---
title: nes
---

A shortcut method for `Nostalgist.launch` method, with some additional default options for NES emulation.

It will use `fceumm` as the default core for emulation.

## Usage
Basic usage:
```js
await Nostalgist.nes('flappybird.nes')

// is equal to
await Nostalgist.launch({ rom: 'flappybird.nes', core: 'fceumm' })
```

## Arguments
+ ### `options`
  If the `options` is a `string | File | { fileName: string; fileContent: Blob }`, it will be treated as `{ rom: options }` in fact.

  If the `options` is an `Object`, then it is the same as the `options` argument for `Nostalgist.launch`.

  Please refer to [launch#options](/apis/launch/#options).
