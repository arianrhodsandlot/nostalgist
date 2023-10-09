---
title: launchEmulator
---

Launch the emulator, if it's not launched, because of the launch option `runEmulatorManually` being set to `true`.

## Usage
```js
// the emulator will not be launched
const nostalgist = await Nostalgist.nes({ rom: 'flappybird.nes', runEmulatorManually: true })

// the emulator is going to be launched
await nostalgist.launchEmulator()
```
