import { expect, test } from '@playwright/test'

test.describe('instance methods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/test-page/index.html')
  })

  test('save state', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('nes', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.getByText('saveState', { exact: true }).click()
    const event = await page.waitForEvent('console', (consoleMessage) => consoleMessage.type() === 'info')
    const [message] = event.args()
    expect(message.toString()).toBe('{state: Blob, thumbnail: Blob}')
  })

  test('load state', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('gbc', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(canvas).toHaveScreenshot('load-state-pristine.png')

    await canvas.press('Enter', { delay: 500 })
    await expect(canvas).toHaveScreenshot('load-state-touched.png')

    await page.getByText('saveState', { exact: true }).click()
    await page.waitForEvent('console', (consoleMessage) => consoleMessage.type() === 'info')

    await page.getByText('restart', { exact: true }).click()
    await expect(canvas).toHaveScreenshot('load-state-pristine.png')

    await page.getByText('loadState', { exact: true }).click()
    await page.waitForTimeout(1000) // loading state can be slow
    await expect(canvas).toHaveScreenshot('load-state-touched.png')
  })

  test('restart', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('nes', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(canvas).toHaveScreenshot('restart-pristine.png')

    await canvas.press('Enter', { delay: 500 })
    await expect(canvas).not.toHaveScreenshot('restart-pristine.png')

    await page.getByText('restart', { exact: true }).click()

    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('restart-pristine.png')
  })

  test('pause and resume', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('megadrive', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await canvas.press('Enter', { delay: 800 })

    await page.getByText('pause', { exact: true }).click()
    await expect(canvas).toHaveScreenshot('pause-and-resume.png')
    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('pause-and-resume.png')

    await page.getByText('resume', { exact: true }).click()
    await page.waitForTimeout(1000)
    await expect(canvas).not.toHaveScreenshot('pause-and-resume.png')
  })

  test('press', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('megadrive', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(canvas).toHaveScreenshot('press-pristine.png')

    // show the game info
    await page.getByText('pressA', { exact: true }).click()
    await page.waitForTimeout(300)
    await expect(canvas).toHaveScreenshot('press-a.png')

    // hide the game info
    await page.getByText('pressA', { exact: true }).click()
    await page.waitForTimeout(300)
    await expect(canvas).toHaveScreenshot('press-pristine.png')

    // enter the game
    await page.getByText('pressStart', { exact: true }).click()
    await page.waitForTimeout(300)
    await expect(canvas).toHaveScreenshot('press-start.png')
  })
})

test.describe('instance methods with nightly retroarch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/test-page/nightly.html')
  })

  test('save state', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('nes', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.getByText('saveState', { exact: true }).click()
    const event = await page.waitForEvent('console', (consoleMessage) => consoleMessage.type() === 'info')
    const [message] = event.args()
    expect(message.toString()).toBe('{state: Blob, thumbnail: Blob}')
  })

  test('load state', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('gbc', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(canvas).toHaveScreenshot('load-state-pristine.png')

    await canvas.press('Enter', { delay: 500 })
    await expect(canvas).toHaveScreenshot('load-state-touched.png')

    await page.getByText('saveState', { exact: true }).click()
    await page.waitForEvent('console', (consoleMessage) => consoleMessage.type() === 'info')

    await page.getByText('restart', { exact: true }).click()
    await expect(canvas).toHaveScreenshot('load-state-pristine.png')

    await page.getByText('loadState', { exact: true }).click()
    await page.waitForTimeout(1000) // loading state can be slow
    await expect(canvas).toHaveScreenshot('load-state-touched.png')
  })

  test('restart', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('nes', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(canvas).toHaveScreenshot('restart-pristine.png')

    await canvas.press('Enter', { delay: 500 })
    await expect(canvas).not.toHaveScreenshot('restart-pristine.png')

    await page.getByText('restart', { exact: true }).click()

    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('restart-pristine.png')
  })

  test('pause and resume', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('megadrive', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await canvas.press('Enter', { delay: 800 })

    await page.getByText('pause', { exact: true }).click()
    await expect(canvas).toHaveScreenshot('pause-and-resume.png')
    await page.waitForTimeout(500)
    await expect(canvas).toHaveScreenshot('pause-and-resume.png')

    await page.getByText('resume', { exact: true }).click()
    await page.waitForTimeout(1000)
    await expect(canvas).not.toHaveScreenshot('pause-and-resume.png')
  })

  test('press', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('megadrive', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(canvas).toHaveScreenshot('press-pristine.png')

    // show the game info
    await page.getByText('pressA', { exact: true }).click()
    await page.waitForTimeout(300)
    await expect(canvas).toHaveScreenshot('press-a.png')

    // hide the game info
    await page.getByText('pressA', { exact: true }).click()
    await page.waitForTimeout(300)
    await expect(canvas).toHaveScreenshot('press-pristine.png')

    // enter the game
    await page.getByText('pressStart', { exact: true }).click()
    await page.waitForTimeout(300)
    await expect(canvas).toHaveScreenshot('press-start.png')
  })
})
