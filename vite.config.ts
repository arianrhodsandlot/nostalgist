import { createConfig } from '@arianrhodsandlot/vite-plus-config'
import pkg from './package.json' with { type: 'json' }

export default createConfig({
  pack: {
    deps: { onlyBundle: false },
    fixedExtension: false,
    format: {
      esm: { entry: { [pkg.name]: 'src/index.ts' } },
      umd: { entry: { [pkg.name]: 'src/index-umd.ts' } },
    },
    globalName: 'Nostalgist',
  },
})
