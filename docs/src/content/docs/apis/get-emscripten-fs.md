---
title: getEmscriptenFS
---

Get the Emscripten FS object of the currently running emulator to access its virtual file system.

See [Emscripten File System API](https://emscripten.org/docs/api_reference/Filesystem-API.html) for more information.

## Usage
```js
const nostalgist = await Nostalgist.nes('flappybird.nes')

const FS = nostalgist.getEmscriptenFS()
const files = FS.readdir('/home/web_user/retroarch/userdata')
```
