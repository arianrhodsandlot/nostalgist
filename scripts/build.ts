import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, defineConfig } from 'vite'

const currentDir = fileURLToPath(import.meta.url)

const esBuildOptions = defineConfig({
  build: {
    lib: {
      entry: path.resolve(currentDir, '../../src/index.ts'),
      formats: ['es'],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      minify: true,
      minifyWhitespace: true,
    },
  },
})

const umdBuildOptions = defineConfig({
  build: {
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
