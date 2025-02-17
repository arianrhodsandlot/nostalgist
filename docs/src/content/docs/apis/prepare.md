---
title: prepare
---

Load all required files for launching the emulator, then wait for [`<instance>.start`](/apis/start/) to be called to launch the emulator.

Sometimes browsers require interactions from users to launch a games. If it takes too long to fetch files related to emulation, the emulator may failed to launch.

Related links:
+ https://github.com/arianrhodsandlot/nostalgist/discussions/41
+ https://github.com/arianrhodsandlot/nostalgist/issues/18
+ https://developer.chrome.com/blog/autoplay

With `prepare` and [`<instance>.start`](/apis/start/), we can separate the file loading process and the starting process.

## Since
`0.13.0`

## Usage
```js
// This may take a long time 🥱
const nostalgist = await Nostalgist.prepare({
  core: 'fceumm',
  rom: 'flappybird.nes',
})

const startButton = document.querySelector('.start-button')
startButton.addEventListener('click', async () => {
  // The emulator will be launched in no time 🚀
  await nostalgist.start()
})
```

## Arguments
+ ### `options`
  The options argument here is the same as the `options` argument for `Nostalgist.launch`.

  Please refer to [launch#options](/apis/launch/#options).

## Returns
A `Promise` of the instance of the emulator.
