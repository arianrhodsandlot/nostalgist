---
title: disableCheat
---

Stop applying a cheat, without removing it. It stays in [`getCheats`](/apis/get-cheats) and can be enabled again later.

The cheat can be pointed at by its index, its description, or its code, in that order. If more than one cheat matches, all of them are disabled. If none matches, an error is thrown.

## Usage

```js
const nostalgist = await Nostalgist.nes({
  rom: 'contra.nes',
  cheats: [{ code: '0033:09', description: 'Infinite Lives P2' }],
})

nostalgist.disableCheat('Infinite Lives P2')
```

## Returns

`undefined`
