---
title: Resolvable File
---

Since **v0.12.0**, we introduced a new general way of passing files to Nostalgist.js, called **resolvable file**.

### Supported Formats

A **resolvable file** can be in various formats and will eventually be parsed and loaded by Nostalgist.js. Below are all the formats we support:

+ **URL string / [URL object](https://developer.mozilla.org/en-US/docs/Web/API/URL) / [Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request)**

  We will use [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) to load the file and infer its name by parsing the URL.

  Examples:
  ```js
  // URL strings
  'http://www.example.com/roms/contra.nes'
  'https://www.example.com/roms/contra.nes'
  'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000'
  'data:application/octet-stream;base64,abcdefghijkl....'

  // a URL object
  new URL('/roms/contra.nes', 'http://www.example.com')

  // a Request Object
  new Request('http://www.example.com/roms/contra.nes')
  ```
+ **String Representing File Content**

  This is typically used for the JavaScript file of the emulator core.

  Example:
  ```js
  // copied from https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroarch-emscripten-build@v1.16.0/retroarch/snes9x_libretro.js
  'var Module=typeof Module!=="undefined"?Module:{};var moduleOverrides={};var key;...'
  ```
+ **[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object**
+ **[Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object**
+ **[ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) object**
+ **[Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) object**
+ **Object with `fileName` and `fileContent` Properties**

  The fileContent property can be in any of the above formats.

  Example:
  ```js
  {
    fileName: 'contra.nes',
    fileContent: 'http://www.example.com/roms/contra.nes'
  }
  ```
+ **Functions and Promises**

  If a function or promise is provided, we will invoke it to get its return value or wrapped value. The value is expected to be in one of the formats listed above.

  Examples:
  ```js
  // a function returning a URL string
  function () {
    return 'http://www.example.com/roms/contra.nes'
  }

  // a promise wrapping a Blob object
  (async function() {
    const response = await fetch('http://www.example.com/roms/contra.nes')
    return await response.blob()
  })()
  ```

  Functions or promises can be nested, and we will unwrap them recursively. For example:
  + Given `fetch('http://www.example.com/roms/contra.nes')`, we will resolve it as a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.
  + Given `() => () => fetch('http://www.example.com/roms/contra.nes').then(response => response.blob())`, we will resolve it as a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object.

### Internal `name` Property
Each resolvable file has an internal `name` property, which will be inferred automatically.

+ If the resolvable file is loaded via [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch), the name will be inferred from its URL path.
+ If it's a `File` object, the `name` property will be inferred as the `name` of the resolvable file.
+ If it's an object with a `fileName` property and a `fileContent` property is passed as the resolvable file, the `fileName` property will be used as its name.

This property is required when using the file as a [`rom`](/apis/launch#rom) or [`bios`](/apis/launch#bios) passed to [`Nostalgist.launch`](/apis/launch).
