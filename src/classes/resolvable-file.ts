import { getResult, urlBaseName } from '../libs/utils'

function isURL(value: unknown): value is URL {
  return typeof globalThis.URL === 'object' && value instanceof globalThis.URL
}

function isRequest(value: unknown): value is Request {
  return typeof globalThis.Request === 'object' && value instanceof globalThis.Request
}

function isFetchable(value: unknown): value is Request | string | URL {
  if (typeof value === 'string') {
    const prefixes = ['http://', 'https://', '/', './', '../', 'data:', 'blob:']
    return prefixes.some((absolutePrefix) => value.startsWith(absolutePrefix))
  }
  return isURL(value) || isRequest(value)
}

export class ResolvableFile {
  name = ''
  private arrayBuffer: ArrayBuffer | undefined
  private blob: Blob | undefined
  private blobType = 'application/octet-stream'
  private objectUrl?: string | undefined
  private raw: unknown
  private signal: AbortSignal | undefined
  private text: string | undefined
  private uint8Array: Uint8Array | undefined
  private urlResolver?: ((raw: unknown) => unknown) | undefined

  constructor({
    blobType,
    name,
    raw,
    signal,
    urlResolver,
  }: {
    blobType?: string
    name?: string
    raw: unknown
    signal?: AbortSignal
    urlResolver?: (raw: unknown) => unknown
  }) {
    this.raw = raw
    if (signal) {
      this.signal = signal
    }
    if (urlResolver) {
      this.urlResolver = urlResolver
    }
    if (blobType) {
      this.blobType = blobType
    }
    if (name) {
      this.name = name.replaceAll(/["%*/:<>?\\|]/g, '-')
    }
  }

  static async create(...args: ConstructorParameters<typeof ResolvableFile>) {
    const resolvableFile = new ResolvableFile(...args)
    await resolvableFile.load()
    return resolvableFile
  }

  dispose() {
    if (typeof this.objectUrl === 'string') {
      URL.revokeObjectURL(this.objectUrl)
    }
  }

  async getArrayBuffer() {
    if (this.arrayBuffer) {
      return this.arrayBuffer
    }

    this.arrayBuffer = await this.getBlob().arrayBuffer()
    return this.arrayBuffer
  }

  getBlob() {
    if (!this.blob) {
      throw new Error('blob is not available')
    }
    return this.blob
  }

  getObjectUrl() {
    if (this.objectUrl) {
      return this.objectUrl
    }
    this.objectUrl = URL.createObjectURL(this.getBlob())
    return this.objectUrl
  }

  async getText() {
    if (this.text !== undefined) {
      return this.text
    }
    this.text = await this.getBlob().text()
    return this.text
  }

  async getUint8Array() {
    if (this.uint8Array) {
      return this.uint8Array
    }
    const arrayBuffer = await this.getArrayBuffer()
    this.uint8Array = new Uint8Array(arrayBuffer)
    return this.uint8Array
  }

  private async load() {
    const result = await getResult(this.urlResolver ? this.urlResolver(this.raw) : this.raw)
    if (isFetchable(result)) {
      await this.loadFetchable(result)
    } else if (typeof result === 'string') {
      this.loadPlainText(result)
    } else if (result instanceof Blob) {
      this.loadBlob(result)
    } else if (result instanceof ArrayBuffer) {
      this.loadArrayBuffer(result)
    } else if (result instanceof Uint8Array) {
      this.loadUint8Array(result)
    }
  }

  private loadArrayBuffer(arrayBuffer: ArrayBuffer) {
    this.arrayBuffer = arrayBuffer
    this.blob = new Blob([arrayBuffer], { type: this.blobType })
  }

  private loadBlob(blob: Blob) {
    this.blob = blob
  }

  private async loadFetchable(fetchable: Request | string | URL) {
    if (!this.name) {
      let fetchableUrl: string
      if (isURL(fetchable)) {
        fetchableUrl = fetchable.href
      } else if (isRequest(fetchable)) {
        fetchableUrl = fetchable.url
      } else {
        fetchableUrl = `${fetchable}`
      }
      this.name = urlBaseName(fetchableUrl).replaceAll(/["%*/:<>?\\|]/g, '-')
    }

    const response = await fetch(fetchable, this.signal ? { signal: this.signal } : undefined)
    this.blob = await response.blob()
  }

  private loadPlainText(text: string) {
    this.blob = new Blob([text], { type: this.blobType })
  }

  private loadUint8Array(uint8Array: Uint8Array) {
    this.uint8Array = uint8Array
    this.blob = new Blob([uint8Array], { type: this.blobType })
  }
}
