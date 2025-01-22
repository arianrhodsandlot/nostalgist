import { test } from '@playwright/test'
import { tests } from './instance-ra-common'

test.describe('instance methods with retroarch esm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/test-page')
  })

  test('tests', tests)
})
