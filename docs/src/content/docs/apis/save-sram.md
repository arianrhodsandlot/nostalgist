---
title: saveSRAM
---

Save the SRAM of the current running game.

## Since
`0.12.0`

## Usage
```js
const nostalgist = await Nostalgist.nes('zelda.nes')

// save the SRAM
const sram = await nostalgist.saveSRAM()

// launch with the SRAM
await nostalgist.nes({
  rom: 'zelda.nes',
  sram,
})
```

## Returns
+ ### `state`

  **type:** `Blob`

  The SRAM of the current running game.
