import type { NostalgistLaunchOptions, NostalgistLaunchRomOptions, NostalgistOptions, NostalgistOptionsPartial } from '../types/nostalgist-options';
import type { RetroArchCommand } from '../types/retroarch-command';
import { EmulatorOptions } from './emulator-options.ts';
import { Emulator } from './emulator.ts';
import { type ResolvableFileInput } from './resolvable-file.ts';
export declare class Nostalgist {
    static readonly Nostalgist: typeof Nostalgist;
    static readonly vendors: {
        ini: typeof import("ini");
        path: import("path-browserify").Path;
    };
    private emulator;
    private emulatorOptions;
    private options;
    private constructor();
    static clearCache(): void;
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
    static configure(options: NostalgistOptionsPartial): void;
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for GB emulation.
     *
     * It will use mgba as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/gb/}
     */
    static gb(options: NostalgistLaunchRomOptions): Promise<Nostalgist>;
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for GBA emulation.
     *
     * It will use mgba as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/gba/}
     */
    static gba(options: NostalgistLaunchRomOptions): Promise<Nostalgist>;
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for GBC emulation.
     *
     * It will use mgba as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/gbc/}
     */
    static gbc(options: NostalgistLaunchRomOptions): Promise<Nostalgist>;
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
    static launch(options: NostalgistLaunchOptions): Promise<Nostalgist>;
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for Sega Genesis / Megadrive emulation.
     *
     * It will use genesis_plus_gx as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/megadrive/}
     */
    static megadrive(options: NostalgistLaunchRomOptions): Promise<Nostalgist>;
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for NES emulation.
     *
     * It will use fceumm as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/nes/}
     */
    static nes(options: NostalgistLaunchRomOptions): Promise<Nostalgist>;
    static prepare(options: NostalgistLaunchOptions): Promise<Nostalgist>;
    /**
     * Reset the global configuation set by `Nostalgist.configure` to default.
     *
     * @see {@link https://nostalgist.js.org/apis/reset-to-default/}
     */
    static resetToDefault(): void;
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for SNES emulation.
     *
     * It will use snes9x as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/snes/}
     */
    static snes(options: NostalgistLaunchRomOptions): Promise<Nostalgist>;
    private static launchSystem;
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
    exit({ removeCanvas }?: {
        removeCanvas?: boolean;
    }): void;
    /**
     * Get the canvas DOM element that the current emulator is using.
     *
     * @see {@link https://nostalgist.js.org/apis/get-canvas/}
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * Get the Emscripten object exposed by RetroArch.
     *
     * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
     */
    getEmscripten(): any;
    /**
     * Get the Emscripten AL object exposed by RetroArch.
     *
     * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
     */
    getEmscriptenAL(): any;
    /**
     * Get the Emscripten FS object of the current running emulator.
     *
     * @see {@link https://nostalgist.js.org/apis/get-emscripten-fs/}
     */
    getEmscriptenFS(): any;
    /**
     * Get the Emscripten Module object of the current running emulator.
     *
     * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
     */
    getEmscriptenModule(): import("../types/retroarch-emscripten.ts").RetroArchEmscriptenModule;
    getEmulator(): Emulator;
    getEmulatorOptions(): EmulatorOptions;
    getOptions(): NostalgistOptions;
    /**
     * Get the status of current emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/get-status/}
     *
     * @returns One of 'initial' | 'paused' | 'running' | 'terminated'
     * @example
     * ```js
     * const nostalgist = await Nostalgist.prepare('flappybird.nes')
     * console.log(nostalgist.getStatus()) // 'initial'
  
     * await nostalgist.launch()
     * console.log(nostalgist.getStatus()) // 'running'
  
     * await nostalgist.pause()
     * console.log(nostalgist.getStatus()) // 'paused'
  
     * nostalgist.exit()
     * console.log(nostalgist.getStatus()) // 'terminated'
     * ```
     */
    getStatus(): "initial" | "paused" | "running" | "terminated";
    /**
     * Launch the emulator, if it's not launched, because of the launch option `runEmulatorManually` being set to `true`.
     * @deprecated Use the `start` method instead.
     * @see {@link https://nostalgist.js.org/apis/launch-emulator/}
     */
    launchEmulator(): Promise<void>;
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
    loadState(state: ResolvableFileInput): Promise<void>;
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
    pause(): void;
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
    press(options: {
        button: string;
        player?: number;
        time?: number;
    } | string): Promise<void>;
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
    pressDown(options: {
        button: string;
        player?: number;
    } | string): void;
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
    pressUp(options: {
        button: string;
        player?: number;
    } | string): void;
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
    resize(size: {
        height: number;
        width: number;
    }): void;
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
    restart(): void;
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
    resume(): void;
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
    saveSRAM(): Promise<Blob>;
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
    saveState(): Promise<{
        state: Blob;
        thumbnail: Blob | undefined;
    }>;
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
    screenshot(): Promise<Blob>;
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
    sendCommand(command: RetroArchCommand): void;
    /**
     * Start the emulator if it's not started because of the instance is returned by `Nostalgist.prepare` rather than `Nostalgist.launch`, or the option `runEmulatorManually` for `Nostalgist.launch` being set to `true`.
     *
     * @see {@link https://nostalgist.js.org/apis/start/}
     */
    start(): Promise<void>;
    /**
     * Load options and then launch corresponding emulator if should
     */
    private load;
    private setupEmulator;
}
