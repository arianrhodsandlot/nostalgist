---
title: sendCommand
---

Send a command to RetroArch.
The commands are listed here: https://docs.libretro.com/development/retroarch/network-control-interface/#commands .
But not all of them are supported inside a browser.

## Since
`0.9.0`

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

nostalgist.sendCommand('FAST_FORWARD')
```

## Arguments
+ ### `command`

  **type:** `string`

  The command to be sent. See https://docs.libretro.com/development/retroarch/network-control-interface/#commands .
