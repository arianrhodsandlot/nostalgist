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
    if (style[rule]) {
      element.style.setProperty(rule, style[rule] as string)
    } else {
      element.style.removeProperty(rule)
    }
  }
}

export function delay(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, time)
  })
}
