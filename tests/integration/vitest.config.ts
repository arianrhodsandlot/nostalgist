import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.spec.ts'],
    environment: 'happy-dom',
    testTimeout: 30_000,
  },
})
