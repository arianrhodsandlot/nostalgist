import { expect, test } from '@playwright/test'

test.describe('instance methods with retroarch legacy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?e2e-legacy')
  })

  tests()
})

test.describe('instance methods with retroarch esm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?e2e')
  })

  tests()
})

function tests() {
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
    await page.waitForTimeout(2000)
    await expect(canvas).not.toHaveScreenshot('pause-and-resume.png', { maxDiffPixels: 100 })
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

  test('screenshot', async ({ page }) => {
    const canvas = page.locator('#canvas')
    const screenshot = page.locator('#screenshot')
    await expect(canvas).not.toBeAttached()

    await page.getByText('megadrive', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.getByText('screenshot', { exact: true }).click()
    await expect(screenshot).toHaveScreenshot('screenshot.png')
  })

  test('exit', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('nes', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(canvas).toBeAttached()

    await page.getByText('exit', { exact: true }).click()
    await expect(canvas).not.toBeAttached()
  })

  test('exit without removing the canvas', async ({ page }) => {
    const canvas = page.locator('#canvas')
    await expect(canvas).not.toBeAttached()

    await page.getByText('nes', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await expect(canvas).toBeAttached()

    await page.getByText('exitWithoutRemovingCanvas', { exact: true }).click()
    await expect(canvas).toBeAttached()
  })

  test('save sram', async ({ page }) => {
    const canvas = page.locator('#canvas')

    async function pressAndWait(key: string) {
      await page.keyboard.press(key, { delay: 100 })
      await page.waitForTimeout(500)
    }

    await page.getByText('launchROMSupportsSRAM', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // create a new in-game save
    await pressAndWait('Enter')
    await pressAndWait('Enter')
    await pressAndWait('x')
    await pressAndWait('x')
    await pressAndWait('ShiftRight')
    await pressAndWait('ShiftRight')
    await pressAndWait('ShiftRight')
    await pressAndWait('Enter')

    await expect(canvas).toHaveScreenshot('save-sram.png')

    // export the in-game save file and exit
    await page.getByText('saveSRAM', { exact: true }).click()
    await page.waitForTimeout(500)
    await page.getByText('exit', { exact: true }).click()
    await page.waitForTimeout(500)
    await expect(canvas).not.toBeAttached()

    // launch the rom with the in-game save
    await page.getByText('launchSavedSRAM', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    await pressAndWait('Enter')
    await expect(canvas).toHaveScreenshot('save-sram.png')
  })

  test('get status', async ({ page }) => {
    await page.getByText('nes', { exact: true }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    for (const button of ['', 'pause', 'pause', 'resume', 'exit']) {
      if (button) {
        await page.getByText(button, { exact: true }).click()
      }
      await page.getByText('printStatus', { exact: true }).click()
      const msg = await page.waitForEvent('console')
      expect(msg.text()).toBe(
        {
          '': 'running',
          exit: 'terminated',
          pause: 'paused',
          resume: 'running',
        }[button],
      )
    }
  })
}
