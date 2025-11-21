import type { NostalgistOptions, NostalgistOptionsPartial } from '../types/nostalgist-options.ts';
export declare function getDefaultOptions(): Omit<NostalgistOptions, "core">;
export declare function getGlobalOptions(): Partial<NostalgistOptions>;
export declare function updateGlobalOptions(options: NostalgistOptionsPartial): void;
export declare function resetGlobalOptions(): void;
