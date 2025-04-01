---
title: getStatus
---

Get the current status of the emulator instance.

## Since
`0.14.0`

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

## Returns
A string representing the current status of the emulator instance. Can be one of:
+ `'initial'` - The emulator has been prepared but not yet started
+ `'running'` - The emulator is running normally
+ `'paused'` - The emulator is currently paused
+ `'terminated'` - The emulator has been exited
