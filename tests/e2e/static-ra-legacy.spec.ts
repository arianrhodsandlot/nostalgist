import { test } from '@playwright/test'
import { tests } from './static-ra-common'

test.describe('static methods with retroarch legacy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?e2e-legacy')
  })

  tests()
})
