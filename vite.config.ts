import { createConfig } from '@arianrhodsandlot/vite-plus-config'

export default createConfig({
  pack: {
    fixedExtension: false,
    format: {
      esm: { entry: { nostalgist: 'src/index.ts' } },
      umd: { entry: { nostalgist: 'src/index-umd.ts' } },
    },
    globalName: 'Nostalgist',
  },
})
