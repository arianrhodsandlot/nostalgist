---
title: resetToDefault
---

Reset all configurations to their default values. This will undo any changes made by [`configure`](/apis/configure).

## Usage
```js
Nostalgist.configure({
  style: {
    position: 'static',
  },
})

// The canvas element will have position: static
await Nostalgist.nes('flappybird.nes')

// Reset all configurations to default
Nostalgist.resetToDefault()

// The canvas element will use the default position: fixed
await Nostalgist.nes('flappybird.nes')
```
