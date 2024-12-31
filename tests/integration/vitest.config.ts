import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/integration/**/*.spec.ts'],
    testTimeout: 30_000,
  },
})
