---
title: start
---

Start the emulator. Always use this method in combination with [`Nostalgist.prepare`](/apis/prepare/).

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
