import { defineConfig } from '@playwright/test'
import isCi from 'is-ci'

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000/',
    headless: true,
  },
  testMatch: 'tests/e2e/**/*.spec.ts',
  updateSnapshots: 'missing',
  fullyParallel: true,
  snapshotPathTemplate: '{testDir}/snapshots/{testFilePath}/{testName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixels: 100 },
  },
  webServer: {
    command: 'pnpm serve -n',
    port: 3000,
    reuseExistingServer: !isCi,
  },
})
