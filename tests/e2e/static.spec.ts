import { expect, test } from '@playwright/test'

function tests() {
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

  test('launch size', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchSize', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await expect(canvas).toHaveScreenshot('launch-size.png')
  })

  test('launch with a crt shader', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchShader', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await canvas.click()
    await page.waitForTimeout(2000)
    await expect(canvas).toHaveScreenshot('launch-shader.png')
  })

  test('launch and cancel', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchAndCancel', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(canvas).not.toBeAttached()
  })

  test('launch with hooks', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchWithHooks', { exact: true }).click()
    const event1 = await page.waitForEvent('console')
    expect(event1.text()).toBe('object beforeLaunch')
    const event2 = await page.waitForEvent('console')
    expect(event2.text()).toBe('object onLaunch')
  })

  test('launch with an initial state', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchState', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('launch-state.png')
  })

  test('launch with an initial sram', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('launchConstantSRAM', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter', { delay: 100 })
    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('launch-sram.png')
  })

  test('launch with resolvable files', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    const buttons = ['launchURLStrings', 'launchURLs', 'launchRequests', 'launchResponses', 'launchArrayBuffers']
    for (const button of buttons) {
      await page.getByText(button, { exact: true }).click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      await expect(canvas).toHaveScreenshot('launch-nes.png')

      await page.getByText('exit', { exact: true }).click()
      await expect(canvas).not.toBeAttached()
    }
  })
}

test.describe('static methods with retroarch esm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?e2e')
  })

  tests()
})

test.describe('static methods with retroarch legacy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?e2e-legacy')
  })

  tests()
})
