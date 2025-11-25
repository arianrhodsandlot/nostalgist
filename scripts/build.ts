import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, defineConfig } from 'vite'

const currentDir = fileURLToPath(import.meta.url)

const esBuildOptions = defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(currentDir, '../../src/index.ts'),
      formats: ['es'],
    },
    minify: false,
  },
  clearScreen: false,
})

const umdBuildOptions = defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(currentDir, '../../src/index-umd.ts'),
      fileName(format) {
        return `nostalgist.${format}.js`
      },
      formats: ['umd'],
      name: 'Nostalgist',
    },
    minify: false,
  },
  clearScreen: false,
})

await Promise.all([build(esBuildOptions), build(umdBuildOptions)])
