import { expect, test } from '@playwright/test'

test.describe('static methods with nightly retroarch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/test-page/nightly.html')
  })

  test('launch nes', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('nes', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('launch-nes.png')
  })

  test('launch megadrive', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('megadrive', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('launch-megadrive.png')
  })

  test('launch gbc', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('gbc', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('launch-gbc.png')
  })

  test('launch nestopia', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchNestopia', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await expect(canvas).toHaveScreenshot('launch-nestopia.png')
  })

  test('launch size', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchSize', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await expect(canvas).toHaveScreenshot('launch-size.png')
  })

  test('launch nes with a crt shader', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchShader', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('launch-shader.png')
  })
})
