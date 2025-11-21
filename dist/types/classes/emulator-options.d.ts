import type { NostalgistOptions } from '../types/nostalgist-options.ts';
import type { RetroArchEmscriptenModuleOptions } from '../types/retroarch-emscripten.ts';
import { ResolvableFile } from './resolvable-file.ts';
export declare class EmulatorOptions {
    static readonly cacheStorage: {
        bios: Map<NonNullable<import("./resolvable-file.ts").ResolvableFileInput | import("./resolvable-file.ts").ResolvableFileInputs | undefined>, ResolvableFile[]>;
        core: Map<NonNullable<string | import("../types/nostalgist-options.ts").NostalgistCoreDict>, {
            /** the name of core */
            name: string;
            /** the core's resolvable js file */
            js: ResolvableFile;
            /** the core's resolvable wasm file */
            wasm: ResolvableFile;
        }>;
        rom: Map<NonNullable<import("./resolvable-file.ts").ResolvableFileInput | import("./resolvable-file.ts").ResolvableFileInputs | undefined>, ResolvableFile[]>;
        shader: Map<string, ResolvableFile[]>;
        sram: Map<NonNullable<import("./resolvable-file.ts").ResolvableFileInput | undefined>, ResolvableFile | undefined>;
        state: Map<NonNullable<import("./resolvable-file.ts").ResolvableFileInput | undefined>, ResolvableFile | undefined>;
    };
    beforeLaunch?: (() => Promise<void> | void) | undefined;
    bios: ResolvableFile[];
    cache: {
        bios: boolean;
        core: boolean;
        rom: boolean;
        shader: boolean;
        sram: boolean;
        state: boolean;
    };
    core: {
        /** the name of core */
        name: string;
        /** the core's resolvable js file */
        js: ResolvableFile;
        /** the core's resolvable wasm file */
        wasm: ResolvableFile;
    };
    element: HTMLCanvasElement;
    /**
     * An option to override the `Module` object for Emscripten. See [Module object](https://emscripten.org/docs/api_reference/module.html).
     *
     * This is a low level option and not well tested, so use it at your own risk.
     */
    emscriptenModule: RetroArchEmscriptenModuleOptions;
    respondToGlobalEvents: boolean;
    rom: ResolvableFile[];
    shader: ResolvableFile[];
    signal?: AbortSignal | undefined;
    /**
     *
     * The size of the canvas element.
     * If it's `'auto'`, the canvas element will keep its original size, or it's width and height will be updated as specified.
     */
    size?: 'auto' | {
        height: number;
        width: number;
    };
    sram?: ResolvableFile | undefined;
    state?: ResolvableFile | undefined;
    waitForInteraction: ((params: {
        done: () => void;
    }) => void) | undefined;
    /**
     * RetroArch config.
     * Not all options can make effects in browser.
     */
    get retroarchConfig(): typeof this.nostalgistOptions.retroarchConfig;
    /**
     * RetroArch core config.
     * Not all options can make effects in browser.
     */
    get retroarchCoreConfig(): typeof this.nostalgistOptions.retroarchCoreConfig;
    get style(): Partial<CSSStyleDeclaration>;
    private loadPromises;
    private nostalgistOptions;
    private constructor();
    static create(options: NostalgistOptions): Promise<EmulatorOptions>;
    static resetCacheStore(): void;
    load(): Promise<void>;
    loadFromCache(): void;
    saveToCache(): void;
    updateSRAM(): Promise<void>;
    updateState(): Promise<void>;
    private getElement;
    private updateBios;
    private updateCore;
    private updateRom;
    private updateShader;
}
