import { ResolvableFile } from '../classes/resolvable-file.ts'
import { vendors } from './vendors.ts'

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

let i = 0
function id() {
  i += 1
  return i
}

export function generateValidFileName() {
  return `data${id()}.bin`
}

export function extractValidFileName(url: string) {
  return urlBaseName(url).replaceAll(/["%*/:<>?\\|]/g, '-') || generateValidFileName()
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

async function patchCoreJs({ js, name }: { js: ResolvableFile; name: string }) {
  let jsContent = await js.getText()

  if (isGlobalScript(jsContent)) {
    jsContent = `export function getEmscripten({ Module }) {
        ${jsContent};
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
  } else if (isEsmScript(jsContent)) {
    jsContent = `${jsContent.replace(
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

export async function importCoreJsAsESM({ js, name }: { js: ResolvableFile; name: string }) {
  const jsContent = await patchCoreJs({ js, name })
  const jsResolvable = await ResolvableFile.create({ blobType: 'application/javascript', raw: jsContent })
  const jsObjectUrl = jsResolvable.getObjectUrl()

  try {
    return await import(/* @vite-ignore */ /* webpackIgnore: true */ jsObjectUrl)
  } catch {
    // a dirty hack for using with SystemJS, for example, in StackBlitz
    return await new Function(`return import('${jsObjectUrl}')`)()
  } finally {
    jsResolvable.dispose()
  }
}

export function isNil(obj: unknown): obj is null | undefined {
  return obj === undefined || obj === null
}

function isPlainObject(obj: any) {
  if (isNil(obj)) {
    return false
  }
  return obj.constructor === Object || !obj.constructor
}

function mergeProperty(target: any, source: any, key: string) {
  const targetValue = target[key]
  const sourceValue = source[key]
  if (isNil(targetValue)) {
    target[key] = sourceValue
  } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
    target[key] = [...targetValue, ...sourceValue]
  } else if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
    target[key] = isPlainObject(targetValue) ? target[key] : {}
    merge(target[key], sourceValue)
  } else {
    target[key] = sourceValue
  }
}

export function merge(target: any, ...sources: any[]) {
  if (sources.length === 1) {
    const [source] = sources
    for (const key in source) {
      mergeProperty(target, source, key)
    }
  } else {
    for (const source of sources) {
      merge(target, source)
    }
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

export async function getResult<T = any>(value: ((...args: unknown[]) => T) | Promise<T> | T): Promise<T> {
  if (!value) {
    return value
  }

  // @ts-expect-error it's safe here
  if (typeof value?.then === 'function') {
    return getResult(await value)
  }

  if (typeof value === 'function') {
    // @ts-expect-error it's safe here
    return getResult(value())
  }

  return value
}

export function isResolvableFileInput(value: any) {
  if (typeof value === 'string') {
    return true
  }
  if ('fileContent' in value) {
    return true
  }
  const classes = [globalThis.Response, globalThis.Uint8Array, globalThis.URL, globalThis.Request, globalThis.Response]
  return classes.some((clazz) => clazz && value instanceof clazz)
}
