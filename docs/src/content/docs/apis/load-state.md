---
title: loadState
---

Load a state for the current running emulator and game.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

// save the state
const { state } = await nostalgist.saveState()

// load the state
await nostalgist.loadState(state)
```

## Arguments
+ ### `state`

  **type:**
  <code>
    [resolvable file](/apis/resolvable-file)
  </code>

  The state file to be loaded.
