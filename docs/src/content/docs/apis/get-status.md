---
title: getStatus
---

Get the status of current emulation.

## Usage
```js
const nostalgist = await Nostalgist.prepare('flappybird.nes')
console.log(nostalgist.getStatus()) // 'initial'

await nostalgist.launch()
console.log(nostalgist.getStatus()) // 'running'

await nostalgist.pause()
console.log(nostalgist.getStatus()) // 'paused'

nostalgist.exit()
console.log(nostalgist.getStatus()) // 'terminated'
```

## Arguments
+ ### `options`

  **type:** `{ removeCanvas: boolean }`

  #### `removeCanvas`
  **type:** `boolean` **default:** `true`

  If it is `true`, the canvas element will be removed. Otherwise it will be preserved.
