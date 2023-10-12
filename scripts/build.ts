import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, defineConfig } from 'vite'

const currentDir = fileURLToPath(import.meta.url)

const esBuildOptions = defineConfig({
  build: {
    minify: false,
    lib: {
      entry: path.resolve(currentDir, '../../src/index.ts'),
      formats: ['es'],
    },
  },
})

const umdBuildOptions = defineConfig({
  build: {
    minify: false,
    lib: {
      entry: path.resolve(currentDir, '../../src/index-umd.ts'),
      formats: ['umd'],
      name: 'Nostalgist',
      fileName(format) {
        return `nostalgist.${format}.js`
      },
    },
  },
})

await Promise.all([build(esBuildOptions), build(umdBuildOptions)])
