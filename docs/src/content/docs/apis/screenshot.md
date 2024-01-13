---
title: screenshot
---

Take a screenshot for the current running game.

## Since
`0.6.0`

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const blob = await nostalgist.screenshot()
```

## Returns
A `Promise` of the `Blob` of the screenshot.
