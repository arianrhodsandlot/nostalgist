---
title: megadrive
---

A shortcut method for `Nostalgist.launch` method, with some additional default options for Sega Genesis / Megadrive emulation.

It will use `genesis_plus_gx` as the default core for emulation.

## Usage
Basic usage:
```js
await Nostalgist.megadrive('30yearsofnintendont.bin')

// is equal to
await Nostalgist.launch({ rom: '30yearsofnintendont.bin', core: 'genesis_plus_gx' })
```

## Arguments
+ ### `options`
  If the `options` is a `string`, it will be treated as `{ rom: options }` in fact.

  If the `options` is an `Object`, then it is the same as the `options` argument for `Nostalgist.launch`.

  Please refer to [launch#options](/apis/launch/#options).
