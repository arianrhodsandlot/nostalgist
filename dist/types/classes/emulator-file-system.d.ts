import type { RetroArchEmscriptenModule } from '../types/retroarch-emscripten';
import { ResolvableFile } from './resolvable-file.ts';
export declare class EmulatorFileSystem {
    static readonly bundleDirectory = "/home/web_user/retroarch/bundle";
    static readonly configDirectory: string;
    static readonly configPath: string;
    static readonly contentDirectory: string;
    static readonly coreConfigPath: string;
    static readonly screenshotsDirectory: string;
    static readonly shaderDirectory: string;
    static readonly systemDirectory: string;
    static readonly userdataDirectory = "/home/web_user/retroarch/userdata";
    private emscriptenModule;
    private signal;
    private get FS();
    constructor({ emscriptenModule, signal, }: {
        emscriptenModule: RetroArchEmscriptenModule;
        signal?: AbortSignal | undefined;
    });
    static create(...args: ConstructorParameters<typeof EmulatorFileSystem>): Promise<EmulatorFileSystem>;
    mkdirTree(directory: string): void;
    readFile(path: string, encoding?: 'binary' | 'utf8'): any;
    unlink(path: string): void;
    waitForFile(fileName: string): Promise<ArrayBufferView<ArrayBuffer>>;
    writeFile(filePath: string, fileContent: Parameters<typeof ResolvableFile.create>[0]): Promise<void>;
    writeIni(path: string, config: Record<string, any>): Promise<void>;
    private prepare;
}
