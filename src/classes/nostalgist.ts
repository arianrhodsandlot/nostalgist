import { systemCoreMap } from '../constants/system.ts'
import { getGlobalOptions, resetGlobalOptions, updateGlobalOptions } from '../libs/options.ts'
import { checkIsAborted, getResult, isResolvableFileInput, merge } from '../libs/utils.ts'
import { vendors } from '../libs/vendors.ts'
import type {
  NostalgistLaunchOptions,
  NostalgistLaunchRomOptions,
  NostalgistOptions,
  NostalgistOptionsPartial,
} from '../types/nostalgist-options'
import type { RetroArchCommand } from '../types/retroarch-command'
import { EmulatorOptions } from './emulator-options.ts'
import { Emulator } from './emulator.ts'
import { ResolvableFile, type ResolvableFileInput } from './resolvable-file.ts'

export class Nostalgist {
  static readonly Nostalgist = Nostalgist
  static readonly vendors = vendors

  private emulator: Emulator | undefined
  private emulatorOptions: EmulatorOptions | undefined
  private options: NostalgistOptions

  private constructor(options: NostalgistLaunchOptions) {
    const mergedOptions = {} as unknown as NostalgistOptions
    merge(mergedOptions, getGlobalOptions(), options)
    this.options = mergedOptions
  }

  /**
   * Update the global options for `Nostalgist`, so everytime the `Nostalgist.launch` method or shortcuts like `Nostalgist.nes` is called, the default options specified here will be used.
   *
   * You may want to specify how to resolve ROMs and RetroArch cores here.
   *
   * @see {@link https://nostalgist.js.org/apis/configure/}
   *
   * @example
   * ```js
   * Nostalgist.configure({
   *   resolveRom({ file }) {
   *     return `https://example.com/roms/${file}`
   *   },
   *   // other configuation can also be specified here
   * })
   * ```
   */
  static configure(options: NostalgistOptionsPartial) {
    updateGlobalOptions(options)
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for GB emulation.
   *
   * It will use mgba as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/gb/}
   */
  static async gb(options: NostalgistLaunchRomOptions | ResolvableFileInput) {
    return await Nostalgist.launchSystem('gb', options)
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for GBA emulation.
   *
   * It will use mgba as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/gba/}
   */
  static async gba(options: NostalgistLaunchRomOptions | ResolvableFileInput) {
    return await Nostalgist.launchSystem('gba', options)
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for GBC emulation.
   *
   * It will use mgba as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/gbc/}
   */
  static async gbc(options: NostalgistLaunchRomOptions | ResolvableFileInput) {
    return await Nostalgist.launchSystem('gbc', options)
  }

  /**
   * Launch an emulator and return a `Promise` of the instance of the emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/launch/}
   *
   * @example
   * A simple example:
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   core: 'fceumm',
   *   rom: 'flappybird.nes',
   * })
   * ```
   *
   * @example
   * A more complex one:
   * ```js
   * const nostalgist = await Nostalgist.launch({
   *   element: document.querySelector('.emulator-canvas'),
   *   core: 'fbneo',
   *   rom: ['mslug.zip'],
   *   bios: ['neogeo.zip'],
   *   retroarchConfig: {
   *     rewind_enable: true,
   *     savestate_thumbnail_enable: true,
   *   }
   *   runEmulatorManually: false,
   *   resolveCoreJs(core) {
   *     return `https://example.com/core/${core}_libretro.js`
   *   },
   *   resolveCoreWasm(core) {
   *     return `https://example.com/core/${core}_libretro.wasm`
   *   },
   *   resolveRom(file) {
   *     return `https://example.com/roms/${file}`
   *   },
   *   resolveBios(bios) {
   *     return `https://example.com/system/${bios}`
   *   },
   * })
   * ```
   */
  static async launch(options: NostalgistLaunchOptions) {
    const nostalgist = new Nostalgist(options)
    await nostalgist.load()
    return nostalgist
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for Sega Genesis / Megadrive emulation.
   *
   * It will use genesis_plus_gx as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/megadrive/}
   */
  static async megadrive(options: NostalgistLaunchRomOptions | ResolvableFileInput) {
    return await Nostalgist.launchSystem('megadrive', options)
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for NES emulation.
   *
   * It will use fceumm as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/nes/}
   */
  static async nes(options: NostalgistLaunchRomOptions | ResolvableFileInput) {
    return await Nostalgist.launchSystem('nes', options)
  }

  /**
   * Reset the global configuation set by `Nostalgist.configure` to default.
   *
   * @see {@link https://nostalgist.js.org/apis/reset-to-default/}
   */
  static resetToDefault() {
    resetGlobalOptions()
  }

  /**
   * A shortcut method for Nostalgist.launch method, with some additional default options for SNES emulation.
   *
   * It will use snes9x as the default core for emulation.
   *
   * @see {@link https://nostalgist.js.org/apis/snes/}
   */
  static async snes(options: NostalgistLaunchRomOptions | ResolvableFileInput) {
    return await Nostalgist.launchSystem('snes', options)
  }

  private static async launchSystem(system: string, options: NostalgistLaunchRomOptions | ResolvableFileInput) {
    const optionsResult = await getResult(options as any)
    const launchOptions = isResolvableFileInput(optionsResult) ? { rom: optionsResult } : optionsResult
    return await Nostalgist.launch({ ...launchOptions, core: systemCoreMap[system] })
  }

  /**
   * Exit the current running game and the emulator. Remove the canvas element used by the emulator if needed.
   *
   * @see {@link https://nostalgist.js.org/apis/exit/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.exit()
   * ```
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * // the canvas element will not be removed
   * nostalgist.exit({ removeCanvas: false })
   * ```
   */
  exit({ removeCanvas = true }: { removeCanvas?: boolean } = {}) {
    this.getEmulator().exit()
    if (removeCanvas) {
      this.getCanvas().remove()
    }
  }

  /**
   * Get the canvas DOM element that the current emulator is using.
   *
   * @see {@link https://nostalgist.js.org/apis/get-canvas/}
   */
  getCanvas() {
    return this.getEmulatorOptions().element
  }

  /**
   * Get the Emscripten object exposed by RetroArch.
   *
   * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
   */
  getEmscripten(): any {
    const emulator = this.getEmulator()
    return emulator.getEmscripten()
  }

  /**
   * Get the Emscripten AL object exposed by RetroArch.
   *
   * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
   */
  getEmscriptenAL() {
    const emulator = this.getEmulator()
    return emulator.getEmscripten().AL
  }

  /**
   * Get the Emscripten FS object of the current running emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/get-emscripten-fs/}
   */
  getEmscriptenFS() {
    const emulator = this.getEmulator()
    const emscripten = emulator.getEmscripten()
    return emscripten.Module.FS
  }

  /**
   * Get the Emscripten Module object of the current running emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
   */
  getEmscriptenModule() {
    const emulator = this.getEmulator()
    const emscripten = emulator.getEmscripten()
    return emscripten.Module
  }

  getEmulator() {
    const { emulator } = this
    if (!emulator) {
      throw new Error('emulator is not ready')
    }
    return emulator
  }

  getEmulatorOptions() {
    if (!this.emulatorOptions) {
      throw new Error('emulator options are not ready')
    }
    return this.emulatorOptions
  }

  getOptions() {
    return this.options
  }

  /**
   * Launch the emulator, if it's not launched, because of the launch option `runEmulatorManually` being set to `true`.
   *
   * @see {@link https://nostalgist.js.org/apis/launch-emulator/}
   */
  async launchEmulator() {
    return await this.getEmulator().launch()
  }

  /**
   * Load a state for the current running emulator and game.
   *
   * @see {@link https://nostalgist.js.org/apis/load-state/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * // save the state
   * const { state } = await nostalgist.saveState()
   *
   * // load the state
   * await nostalgist.loadState(state)
   * ```
   */
  async loadState(state: Blob) {
    const resolvable = await ResolvableFile.create(state)
    await this.getEmulator().loadState(resolvable)
  }

  /**
   * Pause the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/pause/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.pause()
   * ```
   */
  pause() {
    this.getEmulator().pause()
  }

  /**
   * Press a button and then release it programmatically. Analog Joysticks are not supported by now.
   *
   * @see {@link https://nostalgist.js.org/apis/press/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * await nostalgist.press('start')
   * ```
   */
  async press(options: { button: string; player?: number; time?: number } | string) {
    const emulator = this.getEmulator()
    await (typeof options === 'string'
      ? emulator.press(options)
      : emulator.press(options.button, options.player, options.time))
  }

  /**
   * Press a button programmatically. Analog Joysticks are not supported by now.
   *
   * @see {@link https://nostalgist.js.org/apis/press-down/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.pressDown('start')
   * ```
   */
  pressDown(options: { button: string; player?: number } | string) {
    const emulator = this.getEmulator()
    if (typeof options === 'string') {
      return emulator.pressDown(options)
    }
    return emulator.pressDown(options.button, options.player)
  }

  /**
   * Release it programmatically. Analog Joysticks are not supported by now.
   *
   * @see {@link https://nostalgist.js.org/apis/press-up/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.pressUp('start')
   * ```
   */
  pressUp(options: { button: string; player?: number } | string) {
    const emulator = this.getEmulator()
    if (typeof options === 'string') {
      return emulator.pressUp(options)
    }
    return emulator.pressUp(options.button, options.player)
  }

  /**
   * Resize the canvas element of the emulator.
   *
   * @see {@link https://nostalgist.js.org/apis/resize/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.resize({ width: 1000, height: 800 })
   * ```
   */
  resize(size: { height: number; width: number }) {
    return this.getEmulator().resize(size)
  }

  /**
   * Restart the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/restart/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.restart()
   * ```
   */
  restart() {
    this.getEmulator().restart()
  }

  /**
   * Resume the current running game, if it has been paused by `pause`.
   *
   * @see {@link https://nostalgist.js.org/apis/resume/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.pause()
   * await new Promise(resolve => setTimeout(resolve, 1000))
   * nostalgist.resume()
   * ```
   */
  resume() {
    this.getEmulator().resume()
  }

  /**
   * Save the SRAM of the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/save-sram/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * const sram = await nostalgist.saveSRAM()
   * ```
   */
  async saveSRAM() {
    const emulator = this.getEmulator()
    return await emulator.saveSRAM()
  }

  /**
   * Save the state of the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/save-state/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * // save the state
   * const { state } = await nostalgist.saveState()
   *
   * // load the state
   * await nostalgist.loadState(state)
   * ```
   * @returns
   * A Promise of the state of the current running game.
   *
   * Its type is like `Promise<{ state: Blob, thumbnail: Blob | undefined }>`.
   *
   * If RetroArch is launched with the option `savestate_thumbnail_enable` set to `true`, which is the default value inside Nostalgist.js, then the `thumbnail` will be a `Blob`. Otherwise the `thumbnail` will be `undefined`.
   */
  async saveState() {
    return await this.getEmulator().saveState()
  }

  /**
   * Take a screenshot for the current running game.
   *
   * @see {@link https://nostalgist.js.org/apis/screenshot/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * const blob = await nostalgist.screenshot()
   * ```
   */
  async screenshot() {
    const emulator = this.getEmulator()
    return await emulator.screenshot()
  }

  /**
   * Send a command to RetroArch.
   * The commands are listed here: https://docs.libretro.com/development/retroarch/network-control-interface/#commands .
   * But not all of them are supported inside a browser.
   *
   * @see {@link https://nostalgist.js.org/apis/send-command/}
   *
   * @example
   * ```js
   * const nostalgist = await Nostalgist.nes('flappybird.nes')
   *
   * nostalgist.sendCommand('FAST_FORWARD')
   * ```
   */
  sendCommand(command: RetroArchCommand) {
    const emulator = this.getEmulator()
    return emulator.sendCommand(command)
  }

  /**
   * Load options and then launch corresponding emulator if should
   */
  private async load(): Promise<void> {
    this.emulatorOptions = await EmulatorOptions.create(this.options)
    checkIsAborted(this.options.signal)
    this.loadEmulator()

    if (!this.options.runEmulatorManually) {
      await this.launchEmulator()
    }
  }

  private loadEmulator() {
    const emulatorOptions = this.getEmulatorOptions()
    this.emulator = new Emulator(emulatorOptions)
    this.emulator
      .on('onLaunch', () => this.options.onLaunch?.(this))
      .on('beforeLaunch', () => this.options.beforeLaunch?.(this))
  }
}
