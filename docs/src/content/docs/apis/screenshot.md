---
title: screenshot
---

Take a screenshot of the current game display and return it as a Blob.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const screenshot = await nostalgist.screenshot()
const url = URL.createObjectURL(screenshot)

const img = document.createElement('img')
img.src = url
document.body.append(img)
```

## Returns
A `Promise` of a PNG image as a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object.
