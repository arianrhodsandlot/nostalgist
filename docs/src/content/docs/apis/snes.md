---
title: snes
---

A shortcut method for `Nostalgist.launch` method, with some additional default options for SNES emulation.

It will use `snes9x` as the default core for emulation.

## Usage
Basic usage:
```js
await Nostalgist.snes('jetpilotrising.sfc')

// is equal to
await Nostalgist.launch({ rom: 'jetpilotrising.sfc', core: 'snes9x' })
```

## Arguments
+ ### `options`
  If the `options` is a `string`, it will be treated as `{ rom: options }` in fact.

  If the `options` is an `Object`, then it is the same as the `options` argument for `Nostalgist.launch`.

  Please refer to [launch#options](/apis/launch/#options).
