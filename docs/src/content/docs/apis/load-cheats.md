---
title: loadCheats
---

Replace the current cheats with the ones described by a [RetroArch cheat file](https://github.com/libretro/libretro-database/tree/master/cht).

The file can be passed as its content, or as anything else that is a [resolvable file](/apis/resolvable-file), like a url or a `File` object.

The enabled state of each cheat comes from the file, and these files tend to mark every cheat as disabled, so [`enableCheat`](/apis/enable-cheat) will likely be needed afterwards.

## Usage

```js
const nostalgist = await Nostalgist.nes('contra.nes')

// from a url
await nostalgist.loadCheats('https://example.com/cheats/Contra (USA).cht')

// from the content of the file
await nostalgist.loadCheats(`
cheats = 1

cheat0_desc = "Infinite Lives P2"
cheat0_code = "0033:09"
cheat0_enable = false
`)

// from a file the user picked
await nostalgist.loadCheats(await showFilePicker())

nostalgist.enableCheat('Infinite Lives P2')
```

Two kinds of entries are skipped: the ones RetroArch handles itself, by watching an address rather than by passing a code to the core, and the ones with an empty code, which do appear in the cheat database.

## Returns

A Promise that resolves when the cheats have been applied.
