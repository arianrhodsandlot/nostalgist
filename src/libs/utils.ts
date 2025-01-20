import { vendors } from './vendors'

const { path } = vendors

export const textEncoder = new TextEncoder()

export function urlBaseName(url: string) {
  let pathname = url
  try {
    pathname = new URL(url).pathname
  } catch {}
  const name = path.basename(pathname)
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}

export function isAbsoluteUrl(string: string) {
  if (!string) {
    return false
  }
  if (typeof string !== 'string') {
    return false
  }
  const absolutePrefixes = ['http://', 'https://', '//', 'data:', 'blob:']
  return absolutePrefixes.some((absolutePrefix) => string.startsWith(absolutePrefix))
}

export async function blobToBuffer(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer()
  return new Uint8Array(arrayBuffer)
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
  return js.includes('import.meta.url')
}

function patchCoreJs({ js, name }: { js: string; name: string }) {
  let jsContent = js

  if (isGlobalScript(js)) {
    jsContent = `export function getEmscripten({ Module }) {
        ${js};
        Module.FS = FS;
        Module.PATH = PATH;
        Module.ERRNO_CODES = ERRNO_CODES;
        return {
          AL: typeof AL === 'undefined' ? null: AL,
          Browser: typeof Browser === 'undefined' ? null: Browser,
          JSEvents,
          Module,
          exit: _emscripten_force_exit
         }
      }`
  } else if (isEsmScript(js)) {
    jsContent = `${js.replace(
      'readyPromiseResolve(Module)',
      `readyPromiseResolve({
        AL: typeof AL === 'undefined' ? null: AL,
        Browser: typeof Browser === 'undefined' ? null: Browser,
        JSEvents,
        Module,
        exit: _emscripten_force_exit
      })`,
    )};
      export function getEmscripten({ Module }) {
        return (libretro_${name} || ${name})(Module)
      }
    `
  }
  return jsContent
}

export async function importCoreJsAsESM({ js, name }: { js: string; name: string }) {
  const jsContent = patchCoreJs({ js, name })
  const jsBlob = new Blob([jsContent], { type: 'application/javascript' })
  const jsBlobUrl = URL.createObjectURL(jsBlob)
  if (!jsBlobUrl) {
    throw new Error('invalid jsBlob')
  }

  try {
    return await import(/* @vite-ignore */ /* webpackIgnore: true */ jsBlobUrl)
  } catch {
    // a dirty hack for using with SystemJS, for example, in StackBlitz
    return await new Function('return import(jsBlobUrl)')()
  } finally {
    URL.revokeObjectURL(jsBlobUrl)
  }
}

function isNil(obj: unknown) {
  return obj === undefined || obj === null
}

function isPlainObject(obj: any) {
  if (isNil(obj)) {
    return false
  }
  return obj.constructor === Object || !obj.constructor
}

function mergeSourceToTarget(target: any, source: any) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const targetValue = target[key]
      const sourceValue = source[key]
      if (isNil(targetValue)) {
        target[key] = sourceValue
      } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = [...targetValue, ...sourceValue]
      } else if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        target[key] = isPlainObject(targetValue) ? target[key] : {}
        mergeSourceToTarget(target[key], sourceValue)
      } else {
        target[key] = sourceValue
      }
    }
  }
}

export function merge(target: any, ...sources: any[]) {
  for (const source of sources) {
    mergeSourceToTarget(target, source)
  }
}

export function checkIsAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw new Error('Launch aborted')
  }
}

export function padZero(number: number) {
  return (number < 10 ? '0' : '') + number
}
