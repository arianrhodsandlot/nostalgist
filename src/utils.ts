// eslint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from 'buffer/index'
import { kebabCase } from 'lodash-es'

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
      element.style.setProperty(kebabCase(rule), style[rule] as string)
    } else {
      element.style.removeProperty(rule)
    }
  }
}
