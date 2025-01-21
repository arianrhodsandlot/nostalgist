---
title: resume
---

Resume the current running game, if it has been paused by [`pause`](/apis/pause).

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

nostalgist.pause()
await new Promise((resolve) => setTimeout(resolve, 1000))
nostalgist.resume()
```
