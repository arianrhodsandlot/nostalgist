---
title: loadState
---

Load a state for the current running emulator and game.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

// save the state
const { state } = await nostalgist.saveState(state)

// load the state
await nostalgist.loadState(state)
```

## Arguments
+ ### `state`

  **type:** `Blob`

  The state file to be loaded.
