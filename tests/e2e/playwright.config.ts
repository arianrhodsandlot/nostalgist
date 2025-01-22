import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: { toHaveScreenshot: { maxDiffPixels: 250 } },
  fullyParallel: true,
  reporter: 'html',
  retries: 5,
  snapshotPathTemplate: '{testDir}/snapshots/{testFilePath}/{testName}/{arg}{ext}',
  testMatch: 'tests/e2e/**/*.spec.ts',
  updateSnapshots: 'missing',
  use: { baseURL: 'http://localhost:8000/', headless: true },
  webServer: { command: 'python3 -m http.server', cwd: '../..', port: 8000, reuseExistingServer: false },
})
