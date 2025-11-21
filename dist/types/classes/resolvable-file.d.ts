import { type Resolvable } from '../libs/utils.ts';
type ResolvableFilePrimitive = ArrayBuffer | Blob | FileSystemFileHandle | Request | Response | string | Uint8Array | URL;
type ResolvableFileObjects = {
    fileContent: Resolvable<ResolvableFilePrimitive>;
    fileName: Resolvable<string>;
} | ResolvableFilePrimitive;
export type ResolvableFileInput = Resolvable<ResolvableFilePrimitive> | ResolvableFileObjects;
export type ResolvableFileInputs = Resolvable<ResolvableFileInput[]>;
interface ResolvableFileConstructorParameters {
    blobType?: string;
    name?: string;
    raw: ResolvableFileInput;
    signal?: AbortSignal | undefined;
    urlResolver?: (raw: unknown) => unknown;
}
type ResolvableFileParameter = ResolvableFile | ResolvableFileConstructorParameters | ResolvableFileConstructorParameters['raw'];
export declare class ResolvableFile {
    name: string;
    /** The base name of the file, without its extension. */
    get baseName(): string;
    /** The extension name of the file, with a leading ".". */
    get extension(): string;
    private arrayBuffer;
    private blob;
    private blobType;
    private objectUrl?;
    private raw;
    private signal;
    private text;
    private uint8Array;
    private urlResolver?;
    constructor({ blobType, name, raw, signal, urlResolver }: ResolvableFileConstructorParameters);
    static create(rawOrOption: ResolvableFileParameter): Promise<ResolvableFile>;
    dispose(): void;
    getArrayBuffer(): Promise<ArrayBuffer>;
    getBlob(): Blob;
    getObjectUrl(): string;
    getText(): Promise<string>;
    getUint8Array(): Promise<Uint8Array<ArrayBufferLike>>;
    private load;
    private loadArrayBuffer;
    private loadContent;
    private loadFetchable;
    private loadFileSystemFileHandle;
    private loadObject;
    private loadPlainText;
    private loadResponse;
    private loadUint8Array;
}
export {};
