import { checkIsAborted, delay } from '../libs/utils.ts'
import { vendors } from '../libs/vendors.ts'
import type { RetroArchEmscriptenModule } from '../types/retroarch-emscripten'
import { ResolvableFile } from './resolvable-file.ts'

const { ini, path } = vendors

const userdataDirectory = '/home/web_user/retroarch/userdata'
const bundleDirectory = '/home/web_user/retroarch/bundle'

const contentDirectory = path.join(userdataDirectory, 'content')
const systemDirectory = path.join(userdataDirectory, 'system')
const configDirectory = path.join(userdataDirectory, 'config')
const screenshotsDirectory = path.join(userdataDirectory, 'screenshots')
const shaderDirectory = path.join(bundleDirectory, 'shaders', 'shaders_glsl')
const shaderAssetsDirectory = path.join(shaderDirectory, 'shaders')

const configPath = path.join(userdataDirectory, 'retroarch.cfg')
const coreConfigPath = path.join(userdataDirectory, 'retroarch-core-options.cfg')

export class EmulatorFileSystem {
  static readonly bundleDirectory = bundleDirectory
  static readonly configDirectory = configDirectory
  static readonly configPath = configPath
  static readonly contentDirectory = contentDirectory
  static readonly coreConfigPath = coreConfigPath
  static readonly screenshotsDirectory = screenshotsDirectory
  static readonly shaderDirectory = shaderDirectory
  static readonly systemDirectory = systemDirectory
  static readonly userdataDirectory = userdataDirectory

  private emscriptenModule: RetroArchEmscriptenModule
  private signal: AbortSignal | undefined
  private get FS() {
    return this.emscriptenModule.FS
  }
  constructor({
    emscriptenModule,
    signal,
  }: {
    emscriptenModule: RetroArchEmscriptenModule
    signal?: AbortSignal | undefined
  }) {
    this.emscriptenModule = emscriptenModule
    this.signal = signal
  }

  static async create(...args: ConstructorParameters<typeof EmulatorFileSystem>) {
    const emulatorFileSystem = new EmulatorFileSystem(...args)
    await emulatorFileSystem.prepare()
    return emulatorFileSystem
  }

  mkdirTree(directory: string) {
    const { FS } = this
    FS.mkdirTree(directory)
  }

  readFile(path: string, encoding: 'binary' | 'utf8' = 'utf8') {
    const { FS } = this
    return FS.readFile(path, { encoding })
  }

  stat(path: string) {
    const { FS } = this
    try {
      return FS.stat(path)
    } catch {
      return null
    }
  }

  unlink(path: string) {
    const { FS } = this
    try {
      FS.unlink(path)
    } catch {}
  }

  async waitForFile(fileName: string) {
    const maxRetries = 120
    let lastSize = -1
    let isFinished = false
    let retryTimes = 0
    while (retryTimes <= maxRetries && !isFinished) {
      const delayTime = Math.min(50 * 2 ** retryTimes, 500)
      await delay(delayTime)
      checkIsAborted(this.signal)
      const stats = this.stat(fileName)
      if (stats) {
        const currentSize = stats.size
        if (lastSize > 0 && currentSize === lastSize) {
          isFinished = true
        }
        lastSize = currentSize
      }
      retryTimes += 1
    }
    if (!isFinished) {
      throw new Error('fs timeout')
    }
    return this.readFile(fileName, 'binary').buffer
  }

  async writeFile(filePath: string, fileContent: Parameters<typeof ResolvableFile.create>[0]) {
    const { FS } = this
    const directory = path.dirname(filePath)
    const fileName = path.basename(filePath)
    const resolvable = await ResolvableFile.create(fileContent)
    const buffer = await resolvable.getUint8Array()
    FS.createDataFile('/', fileName, buffer, true, false)
    const encoding = 'binary'
    const data = this.readFile(fileName, encoding)
    this.mkdirTree(directory)
    FS.writeFile(filePath, data, { encoding })
    this.unlink(fileName)
  }

  async writeIni(path: string, config: Record<string, any>) {
    if (!config) {
      return
    }

    const clonedConfig: typeof config = {}
    for (const key in config) {
      clonedConfig[key] = `__${config[key]}__`
    }
    const fileContent = ini.stringify(clonedConfig, { platform: 'linux', whitespace: true }).replaceAll('__', '"')
    await this.writeFile(path, fileContent)
  }

  private async prepare() {
    const directories = [configDirectory, contentDirectory, shaderDirectory, shaderAssetsDirectory, systemDirectory]
    for (const directory of directories) {
      this.mkdirTree(directory)
    }

    // a hack used for waiting for wasm's instantiation.
    // it's dirty but it works
    const maxWaitTime = 100
    let waitTime = 0

    while (!this.emscriptenModule.asm && waitTime < maxWaitTime) {
      await delay(10)
      checkIsAborted(this.signal)
      waitTime += 5
    }
  }
}
