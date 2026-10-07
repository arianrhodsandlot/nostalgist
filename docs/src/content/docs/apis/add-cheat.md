---
title: addCheat
---

Add a cheat.

The parameter can be a cheat code, or an object with a `code` property, an optional `description`, and an optional `enabled`.

Cheats are added disabled, so `enabled` needs to be set for the cheat to be applied right away, or [`enableCheat`](/apis/enable-cheat) needs to be called later.

## Usage

```js
const nostalgist = await Nostalgist.nes('contra.nes')

// added, but not applied yet
nostalgist.addCheat('SXIOPO')
nostalgist.addCheat({ code: '00AE:41', description: 'Totally Invincible P1' })

// added and applied
nostalgist.addCheat({ code: '0033:09', description: 'Infinite Lives P2', enabled: true })
```

## Returns

`undefined`
