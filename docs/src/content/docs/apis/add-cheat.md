---
title: addCheat
---

Add a cheat, and apply it if it's enabled.

The parameter can be a cheat code, or an object with a `code` property, an optional `description`, and an optional `enabled` that defaults to `true`.

## Usage

```js
const nostalgist = await Nostalgist.nes('contra.nes')

nostalgist.addCheat('SXIOPO')
nostalgist.addCheat({ code: '00AE:41', description: 'Totally Invincible P1' })

// added but not applied, until enableCheat is called
nostalgist.addCheat({ code: '0033:09', description: 'Infinite Lives P2', enabled: false })
```

## Returns

`undefined`
