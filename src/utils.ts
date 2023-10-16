import { BFSRequire } from 'browserfs'

const { Buffer } = BFSRequire('buffer')

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

export async function importCoreJsAsESM(js: string) {
  const jsContent = js.startsWith('var Module')
    ? `export function getEmscripten({ Module }) {
        ${js};
        return { PATH, FS, ERRNO_CODES, JSEvents, ENV, Module, exit: _emscripten_force_exit }
      }`
    : js

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
