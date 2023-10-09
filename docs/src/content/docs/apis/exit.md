---
title: exit
---

Exit the current running game and the emulator. Remove the canvas element used by the emulator if needed.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

await nostalgist.exit()
```
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

// the canvas element will not be removed
await nostalgist.exit({ removeCanvas: false })
```

## Arguments
+ ### `options`

  **type:** `{ removeCanvas: boolean }`

  #### `removeCanvas`
  **type:** `boolean` **default:** `true`

  If it is `true`, the canvas element will be removed. Otherwise it will be preserved.
