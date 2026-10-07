---
title: getCheats
---

Get the cheats that have been added, in the order they were added.

The index of a cheat here is the index that [`enableCheat`](/apis/enable-cheat) and [`disableCheat`](/apis/disable-cheat) accept. It's not related to the index RetroArch uses internally, which only counts the enabled ones.

## Usage

```js
const nostalgist = await Nostalgist.nes({
  rom: 'contra.nes',
  cheats: ['SXIOPO', { code: '0033:09', description: 'Infinite Lives P2', enabled: false }],
})

nostalgist.getCheats()
// [
//   { code: 'SXIOPO', enabled: true },
//   { code: '0033:09', description: 'Infinite Lives P2', enabled: false },
// ]
```

## Returns

An Array of cheats, each with a `code`, an `enabled`, and a `description` if one was given.
