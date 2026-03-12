import { ResolvableFile } from '../classes/resolvable-file.ts'

function isGlobalScript(js: string) {
  return js.startsWith('var Module')
}

function isEsmScript(js: string) {
  return js.includes('import.meta.url')
}

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
          exit: _emscripten_force_exit
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
          exit: _emscripten_force_exit
        })`,
      )
      .replace(
        'return moduleRtn;',
        `return moduleRtn.then((Module) => ({
          AL: typeof AL === 'undefined' ? null: AL,
          Browser: typeof Browser === 'undefined' ? null: Browser,
          JSEvents,
          exit: _emscripten_force_exit,
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
