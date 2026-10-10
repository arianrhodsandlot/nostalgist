---
title: enableCheat
---

Apply a cheat that has been added. Cheats are added disabled, so this is how most of them end up being applied.

The cheat can be pointed at by its index, its description, or its code, in that order. If more than one cheat matches, all of them are enabled. If none matches, an error is thrown.

## Since

`0.23.0`

## Usage

```js
const nostalgist = await Nostalgist.nes({
  rom: 'contra.nes',
  cheats: [{ code: '0033:09', description: 'Infinite Lives P2' }],
})

// by description
nostalgist.enableCheat('Infinite Lives P2')

// by code
nostalgist.enableCheat('0033:09')

// by index
nostalgist.enableCheat(0)
```

The return value says whether it worked, so a missing cheat does not need to be guarded against beforehand:

```js
if (!nostalgist.enableCheat('Infinite Lives P2')) {
  // there is no such cheat, or this core does not support cheats
}
```

This is most useful together with [`loadCheats`](/apis/load-cheats), which can add a whole cheat file at once:

```js
await nostalgist.loadCheats('https://example.com/cheats/Contra (USA).cht')
nostalgist.enableCheat('Infinite Lives P2')
```

## Returns

A boolean for whether the cheats could be applied. It's `false` when no cheat matches the target, or when
the core does not support cheats.
