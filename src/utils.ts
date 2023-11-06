import { BFSRequire } from 'browserfs'

const { Buffer } = BFSRequire('buffer')
export const path = BFSRequire('path')
export const { basename, extname, dirname, join } = path

export function isAbsoluteUrl(string: string) {
  if (!string) {
    return false
  }
  if (typeof string !== 'string') {
    return false
  }
  return string.startsWith('http://') || string.startsWith('https://') || string.startsWith('//')
}

export async function blobToBuffer(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export function updateStyle(element: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  if (!element) {
    return
  }
  for (const rule in style) {
    const value = style[rule]
    // @ts-expect-error null means to delete the rule
    element.style[rule] = value || null
  }
}

export function delay(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, time)
  })
}

function isGlobalScript(js: string) {
  return js.startsWith('var Module')
}

function isEsmScript(js: string) {
  return js.includes('_scriptDir = import.meta.url')
}

function patchCoreJs({ name, js }: { name: string; js: string }) {
  let jsContent = js

  if (isGlobalScript(js)) {
    jsContent = `export function getEmscripten({ Module }) {
        ${js};
        Module.FS = FS;
        Module.PATH = PATH;
        Module.ERRNO_CODES = ERRNO_CODES;
        return { JSEvents, Module, exit: _emscripten_force_exit }
      }`
  } else if (isEsmScript(js)) {
    jsContent = `${js.replace(
      'readyPromiseResolve(Module)',
      'readyPromiseResolve({ JSEvents, Module, exit: _emscripten_force_exit })',
    )};
      export function getEmscripten({ Module }) {
        return ${name}(Module)
      }
    `
  }
  return jsContent
}

export async function importCoreJsAsESM({ name, js }: { name: string; js: string }) {
  const jsContent = patchCoreJs({ name, js })
  const jsBlob = new Blob([jsContent], { type: 'application/javascript' })
  const jsBlobUrl = URL.createObjectURL(jsBlob)
  if (!jsBlobUrl) {
    throw new Error('invalid jsBlob')
  }

  try {
    return await import(/* @vite-ignore */ /* webpackIgnore: true */ jsBlobUrl)
  } catch {
    // a dirty hack for using with SystemJS, for example, in StackBlitz
    // eslint-disable-next-line no-eval
    return await eval('import(jsBlobUrl)')
  } finally {
    URL.revokeObjectURL(jsBlobUrl)
  }
}
