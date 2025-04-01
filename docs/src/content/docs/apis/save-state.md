---
title: saveState
---

Save the current state of the running game.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

// Save the state
const { state } = await nostalgist.saveState()

// Load the state
await nostalgist.loadState(state)
```

## Returns
+ ### `state`

  **type:** `{ state: Blob, thumbnail: Blob | undefined }`

  The state of the current running game.

  If RetroArch is launched with `savestate_thumbnail_enable` set to `true` (which is the default in Nostalgist.js), then `thumbnail` will be a `Blob`. Otherwise, `thumbnail` will be `undefined`.
