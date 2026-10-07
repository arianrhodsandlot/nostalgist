---
title: enableCheat
---

Apply a cheat that has been added. Cheats are added disabled, so this is how most of them end up being applied.

The cheat can be pointed at by its index, its description, or its code, in that order. If more than one cheat matches, all of them are enabled. If none matches, an error is thrown.

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

This is most useful together with [`loadCheats`](/apis/load-cheats), which can add a whole cheat file at once:

```js
await nostalgist.loadCheats('https://example.com/cheats/Contra (USA).cht')
nostalgist.enableCheat('Infinite Lives P2')
```

## Returns

`undefined`
