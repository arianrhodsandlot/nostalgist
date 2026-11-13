import { ResolvableFile } from '../classes/resolvable-file.ts'

function isGlobalScript(js: string) {
  return js.startsWith('var Module')
}

function isEsmScript(js: string) {
  return js.includes('import.meta.url')
}

// RetroArch's own clean-up of its sound and of what it set up in the page (listeners, observers and timers), which the
// emulator calls when it exits. Shutting RetroArch down with `_emscripten_force_exit` skips them, and whatever they
// would have removed keeps the emulator, and the game in its memory, alive
const cleanupFunctions = `freeAudio: typeof _RWebAudioFree === 'function' ? _RWebAudioFree : null,
          freeBrowser: typeof PlatformEmscriptenFreeBrowser === 'function' ? PlatformEmscriptenFreeBrowser : null,`

async function patchCoreJs({ js, name }: { js: ResolvableFile; name: string }) {
  let jsContent = await js.getText()
  name = name.replaceAll('-', '_')

  if (isGlobalScript(jsContent)) {
    jsContent = `export function getEmscripten({ Module }) {
        ${jsContent};
        Module.FS = FS;
        Module.PATH = PATH;
        Module.ERRNO_CODES = ERRNO_CODES;
        return {
          AL: typeof AL === 'undefined' ? null: AL,
          Browser: typeof Browser === 'undefined' ? null: Browser,
          JSEvents,
          Module,
          exit: _emscripten_force_exit,
          ${cleanupFunctions}
         }
      }`
  } else if (isEsmScript(jsContent)) {
    jsContent = `${jsContent
      .replace('var setImmediate', '')
      .replace(
        'readyPromiseResolve(Module)',
        `readyPromiseResolve({
          AL: typeof AL === 'undefined' ? null: AL,
          Browser: typeof Browser === 'undefined' ? null: Browser,
          JSEvents,
          Module,
          exit: _emscripten_force_exit,
          ${cleanupFunctions}
        })`,
      )
      .replace(
        'return moduleRtn;',
        `return moduleRtn.then((Module) => ({
          AL: typeof AL === 'undefined' ? null: AL,
          Browser: typeof Browser === 'undefined' ? null: Browser,
          JSEvents,
          exit: _emscripten_force_exit,
          ${cleanupFunctions}
          ...Module,
        }));`,
      )};
    export function getEmscripten({ Module }) {
      const fnA = (typeof libretro_${name} === "function") ? libretro_${name} : null;
      const fnB = (typeof ${name} === "function") ? ${name} : null;

      const factory = fnA || fnB;

      return factory ? factory(Module) : null;
    }
    `
  }
  return jsContent
}

export async function importCoreJsAsESM({ js, name }: { js: ResolvableFile; name: string }) {
  const jsContent = await patchCoreJs({ js, name })
  const jsResolvable = await ResolvableFile.create({ blobType: 'application/javascript', raw: jsContent })
  const jsObjectUrl = jsResolvable.getObjectUrl()

  try {
    return await import(/* @vite-ignore */ /* webpackIgnore: true */ jsObjectUrl)
  } catch {
    // a dirty hack for using with SystemJS, for example, in StackBlitz
    return await new Function(`return import('${jsObjectUrl}')`)()
  } finally {
    jsResolvable.dispose()
  }
}
