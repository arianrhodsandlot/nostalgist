---
title: setCheats
---

Replace every cheat with the given ones, and apply the enabled ones.

Each one can be a cheat code, or an object with a `code` property, an optional `description`, and an optional `enabled` that defaults to `true`.

## Usage

```js
const nostalgist = await Nostalgist.nes('contra.nes')

nostalgist.setCheats(['SXIOPO', { code: '0033:09', description: 'Infinite Lives P2' }])
```

Since this replaces the whole list, it can be used to add a cheat while keeping the existing ones:

```js
nostalgist.setCheats([...nostalgist.getCheats(), 'PEUZUGAA'])
```

## Returns

`undefined`
