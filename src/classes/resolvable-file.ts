import {
  extractValidFileName,
  generateValidFileName,
  getResult,
  isNil,
  isResolvableFileContent,
  isZip,
  type Resolvable,
} from '../libs/utils.ts'
import { vendors } from '../libs/vendors.ts'

const { path } = vendors

const fileNameHeaderRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/

const urlSegmentSeparator = /[?/#]/
function isURLStringLike(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }
  const prefixes = ['http://', 'https://', 'data:', 'blob:', './', '../']
  if (prefixes.some((absolutePrefix) => value.startsWith(absolutePrefix))) {
    return true
  }
  if (['#', '{'].some((char) => value.startsWith(char))) {
    return false
  }
  if (value.includes('\n')) {
    return false
  }
  const segments = value.split(urlSegmentSeparator)
  if (segments.length < 2) {
    return false
  }
  return segments.every((segment) => segment.length < 100)
}

function isURL(value: unknown): value is URL {
  return typeof globalThis.URL === 'function' && value instanceof globalThis.URL
}

function isRequest(value: unknown): value is Request {
  return typeof globalThis.Request === 'function' && value instanceof globalThis.Request
}

function isResponse(value: unknown): value is Response {
  return typeof globalThis.Response === 'function' && value instanceof globalThis.Response
}

function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return typeof globalThis.ArrayBuffer === 'function' && value instanceof globalThis.ArrayBuffer
}

function isUint8Array(value: unknown): value is Uint8Array {
  return typeof globalThis.Uint8Array === 'function' && value instanceof globalThis.Uint8Array
}

function isBlob(value: unknown): value is Blob {
  return typeof globalThis.Blob === 'function' && value instanceof globalThis.Blob
}

function isFileSystemFileHandle(value: unknown): value is FileSystemFileHandle {
  return typeof globalThis.FileSystemFileHandle === 'function' && value instanceof globalThis.FileSystemFileHandle
}

function isFetchable(value: unknown): value is Request | string | URL {
  return isURLStringLike(value) || isURL(value) || isRequest(value)
}

type ResolvableFilePrimitive =
  | ArrayBuffer
  | Blob
  | FileSystemFileHandle
  | Request
  | Response
  | string
  | Uint8Array
  | URL
type ResolvableFileObjects =
  | { fileContent: Resolvable<ResolvableFilePrimitive>; fileName: Resolvable<string> }
  | ResolvableFilePrimitive
export type ResolvableFileInput = Resolvable<ResolvableFilePrimitive> | ResolvableFileObjects
export type ResolvableFileInputs = Resolvable<ResolvableFileInput[]>

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
    const result: any = await getResult(this.urlResolver ? this.urlResolver(this) : this.raw)
    if (typeof result === 'object' && 'fileContent' in result && 'fileName' in result) {
      const [fileName, fileContent] = await Promise.all([getResult(result.fileName), getResult(result.fileContent)])
      await this.loadContent({ fileContent, fileName })
    } else {
      await this.loadContent(result)
    }
  }

  private loadArrayBuffer(arrayBuffer: ArrayBuffer) {
    this.arrayBuffer = arrayBuffer
    this.blob = new Blob([arrayBuffer], { type: this.blobType })
  }

  private async loadContent(content: any) {
    if (isBlob(content)) {
      this.blob = content
    } else if (isFetchable(content)) {
      await this.loadFetchable(content)
    } else if (typeof content === 'string') {
      this.loadPlainText(content)
    } else if (isResolvableFileContent(content?.fileContent)) {
      await this.loadObject(content as any)
    } else if (isArrayBuffer(content)) {
      this.loadArrayBuffer(content)
    } else if (isUint8Array(content)) {
      this.loadUint8Array(content)
    } else if (isResponse(content)) {
      await this.loadResponse(content)
    } else if (isFileSystemFileHandle(content)) {
      await this.loadFileSystemFileHandle(content)
    } else {
      throw new TypeError('failed to resolve the file, file content:', content)
    }

    const uint8Array = await this.getUint8Array()
    const extention = isZip(uint8Array) ? 'zip' : 'bin'
    this.name ||= generateValidFileName(extention)
  }

  private async loadFetchable(fetchable: Request | string | URL) {
    if (isRequest(fetchable)) {
      this.name ||= extractValidFileName(fetchable.url)
    } else if (isURL(fetchable)) {
      this.name ||= extractValidFileName(fetchable.href)
    } else {
      this.name ||= extractValidFileName(fetchable)
    }

    const response = await fetch(fetchable, { signal: this.signal || null })
    await this.loadResponse(response)
  }

  private async loadFileSystemFileHandle(fileSystemFileHandle: FileSystemFileHandle) {
    const file = await fileSystemFileHandle.getFile()
    this.blob = file
    this.name = extractValidFileName(file.name)
  }

  private async loadObject(object: any) {
    let { fileContent, fileName } = object
    ;[fileName, fileContent] = await Promise.all([getResult(fileName), getResult(fileContent)])

    this.name ||= extractValidFileName(fileName)
    await this.loadContent(fileContent)
  }

  private loadPlainText(text: string) {
    this.blob = new Blob([text], { type: this.blobType })
  }

  private async loadResponse(response: Response) {
    const header = response.headers.get('Content-Disposition')
    if (header) {
      const extracted = fileNameHeaderRegex.exec(header)?.[1]?.replace(/['"]/g, '')
      if (extracted) {
        this.name ||= extractValidFileName(extracted)
      }
    }
    if (!response.ok) {
      throw new Error('Failed to load response', { cause: response })
    }
    this.blob = await response.blob()
    this.name ||= extractValidFileName(response.url)
  }

  private loadUint8Array(uint8Array: Uint8Array) {
    this.uint8Array = uint8Array
    this.blob = new Blob([uint8Array], { type: this.blobType })
  }
}
