import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  fullyParallel: true,
  reporter: 'html',
  retries: 5,
  snapshotPathTemplate: '{testDir}/snapshots/{testFilePath}/{testName}/{arg}{ext}',
  testMatch: 'tests/e2e/**/*.spec.ts',
  updateSnapshots: 'missing',
  use: { baseURL: 'http://localhost:5173/', headless: true },
  webServer: { command: 'vite playground', cwd: '../..', port: 5173, reuseExistingServer: true },
})
