import { extractValidFileName, getResult, isNil } from '../libs/utils.ts'
import { vendors } from '../libs/vendors.ts'

const { path } = vendors

function isURL(value: unknown): value is URL {
  return typeof globalThis.URL === 'object' && value instanceof globalThis.URL
}

function isRequest(value: unknown): value is Request {
  return typeof globalThis.Request === 'object' && value instanceof globalThis.Request
}

function isResponse(value: unknown): value is Response {
  return typeof globalThis.Response === 'object' && value instanceof globalThis.Response
}

function isFetchable(value: unknown): value is Request | string | URL {
  if (typeof value === 'string') {
    const prefixes = ['http://', 'https://', 'data:', 'blob:']
    return prefixes.some((absolutePrefix) => value.startsWith(absolutePrefix))
  }
  return isURL(value) || isRequest(value)
}

type ResolvablePrimitive = ArrayBuffer | Blob | Request | Response | string | Uint8Array | URL
type ResolvableObjects = { fileContent: ResolvablePrimitive; fileName: string } | ResolvablePrimitive
type ResolvableWrapped = ((...args: unknown[]) => ResolvableObjects) | Promise<ResolvableObjects>
export type ResolvableFileInput =
  | ((...args: unknown[]) => ResolvableWrapped)
  | Promise<ResolvableWrapped>
  | ResolvableObjects
  | ResolvableWrapped

interface ResolvableFileConstructorParameters {
  blobType?: string
  name?: string
  raw: ResolvableFileInput
  signal?: AbortSignal | undefined
  urlResolver?: (raw: unknown) => unknown
}

type ResolvableFileParameter =
  | ResolvableFile
  | ResolvableFileConstructorParameters
  | ResolvableFileConstructorParameters['raw']

export class ResolvableFile {
  name = ''

  /** The base name of the file, without its extension. */
  get baseName() {
    return path.parse(this.name).name
  }

  /** The extension name of the file, with a leading ".". */
  get extension() {
    return path.parse(this.name).ext
  }

  private arrayBuffer: ArrayBuffer | undefined
  private blob: Blob | undefined
  private blobType = 'application/octet-stream'
  private objectUrl?: string | undefined
  private raw: unknown
  private signal: AbortSignal | undefined
  private text: string | undefined
  private uint8Array: Uint8Array | undefined

  private urlResolver?: ((resolvable: ResolvableFile) => unknown) | undefined

  constructor({ blobType, name, raw, signal, urlResolver }: ResolvableFileConstructorParameters) {
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
      this.name = extractValidFileName(name)
    }
  }

  static async create(rawOrOption: ResolvableFileParameter) {
    if (isNil(rawOrOption)) {
      throw new Error('parameter is not valid')
    }
    if (rawOrOption instanceof ResolvableFile) {
      return rawOrOption
    }
    const option = typeof rawOrOption === 'object' && 'raw' in rawOrOption ? rawOrOption : { raw: rawOrOption }
    const resolvableFile = new ResolvableFile(option)
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
    const result = await getResult(this.urlResolver ? this.urlResolver(this) : this.raw)
    if (isFetchable(result)) {
      await this.loadFetchable(result)
    } else if (typeof result === 'string') {
      this.loadPlainText(result)
    } else if ([Blob, ArrayBuffer, Uint8Array].some((clazz) => (result as any)?.fileContent instanceof clazz)) {
      this.loadObject(result as any)
    } else if (result instanceof Blob) {
      this.loadBlob(result)
    } else if (result instanceof ArrayBuffer) {
      this.loadArrayBuffer(result)
    } else if (result instanceof Uint8Array) {
      this.loadUint8Array(result)
    } else if (result instanceof Response) {
      this.loadResponse(result)
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
      this.name = extractValidFileName(fetchableUrl)
    }

    const response = await fetch(fetchable, { signal: this.signal || null })
    this.blob = await response.blob()
  }

  private loadObject(object: ArrayBuffer | Blob | Response | Uint8Array) {
    const { fileContent, fileName } = object as any
    this.name = extractValidFileName(fileName)
    if (fileContent instanceof Blob) {
      this.loadBlob(fileContent)
    } else if (fileContent instanceof ArrayBuffer) {
      this.loadArrayBuffer(fileContent)
    } else if (fileContent instanceof Uint8Array) {
      this.loadUint8Array(fileContent)
    } else if (isResponse(fileContent)) {
      this.loadResponse(fileContent)
    }
  }

  private loadPlainText(text: string) {
    this.blob = new Blob([text], { type: this.blobType })
  }

  private async loadResponse(response: Response) {
    this.name = extractValidFileName(response.url)
    this.blob = await response.blob()
  }

  private loadUint8Array(uint8Array: Uint8Array) {
    this.uint8Array = uint8Array
    this.blob = new Blob([uint8Array], { type: this.blobType })
  }
}
