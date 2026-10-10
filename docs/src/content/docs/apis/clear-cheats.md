---
title: clearCheats
---

Remove every cheat, and stop applying them.

## Since

`0.23.0`

## Usage

```js
const nostalgist = await Nostalgist.nes('contra.nes')

nostalgist.clearCheats()
nostalgist.getCheats() // []
```

## Returns

A boolean for whether the cheats could be applied. It's `false` when the core does not support cheats.
