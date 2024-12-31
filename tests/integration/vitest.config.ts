import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/integration/**/*.spec.ts'],
    testTimeout: 30_000,
  },
})
