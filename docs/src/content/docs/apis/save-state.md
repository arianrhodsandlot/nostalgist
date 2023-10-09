---
title: saveState
---

Save the state of the current running game.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

// save the state
const { state } = await nostalgist.saveState(state)

// load the state
await nostalgist.loadState(state)
```

## Returns
+ ### `state`

  **type:** `{ state: Blob, thumbnail: Blob | undefined }`

  The state of the current running game.

  If RetroArch is launched with the option `savestate_thumbnail_enable` set to `true`, which is the default value inside Nostalgist.js, then the `thumbnail` will be a `Blob`. Otherwise the `thumbnail` will be `undefined`.
