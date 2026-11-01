const path = require('path')
const { chromium } = require('playwright')

const root = path.resolve(__dirname, '..')
const artifacts = path.join(root, 'artifacts')

async function assertPage(page, label) {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto'
    document.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager'
    })
    const step = Math.max(window.innerHeight * 0.8, 600)
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
    window.scrollTo(0, 0)
    await new Promise((resolve) => setTimeout(resolve, 300))
  })
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.reveal')].every((item) =>
      item.classList.contains('is-visible')
    )
  )
  await page.waitForFunction(() =>
    [...document.images]
      .filter((image) => image.getAttribute('src'))
      .every((image) => image.complete && image.naturalWidth > 0)
  )

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    failedImages: [...document.images]
      .filter(
        (image) =>
          image.getAttribute('src') && (!image.complete || image.naturalWidth === 0)
      )
      .map((image) => image.src),
    title: document.title
  }))

  if (metrics.scrollWidth > metrics.clientWidth + 1) {
    throw new Error(`${label}: horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`)
  }
  if (metrics.failedImages.length) {
    throw new Error(`${label}: failed images ${metrics.failedImages.join(', ')}`)
  }
  if (errors.length) {
    throw new Error(`${label}: browser errors\n${errors.join('\n')}`)
  }

  return metrics
}

async function verify() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  })

  try {
    const desktop = await browser.newPage({
      viewport: { width: 1440, height: 960 },
      deviceScaleFactor: 1
    })
    await assertPage(desktop, 'desktop')
    await desktop.screenshot({ path: path.join(artifacts, 'desktop-hero.png') })

    await desktop.locator('[data-lightbox]').first().click()
    await desktop.locator('#lightbox[open]').waitFor()
    await desktop.screenshot({ path: path.join(artifacts, 'desktop-lightbox.png') })
    await desktop.locator('.lightbox-close').click()

    await desktop.locator('#campus').scrollIntoViewIfNeeded()
    await desktop.waitForTimeout(1000)
    await desktop.locator('#campus').screenshot({
      path: path.join(artifacts, 'desktop-campus-section.png')
    })
    await desktop.screenshot({ path: path.join(artifacts, 'desktop-campus.png') })

    await desktop.locator('#deep-signal').scrollIntoViewIfNeeded()
    await desktop.waitForTimeout(1000)
    await desktop.locator('#deep-signal').screenshot({
      path: path.join(artifacts, 'desktop-game-section.png')
    })
    await desktop.screenshot({ path: path.join(artifacts, 'desktop-game.png') })

    await desktop.screenshot({
      path: path.join(artifacts, 'desktop-full.png'),
      fullPage: true
    })

    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true
    })
    await assertPage(mobile, 'mobile')
    await mobile.screenshot({ path: path.join(artifacts, 'mobile-hero.png') })

    await mobile.locator('.menu-toggle').click()
    if (!(await mobile.locator('.mobile-menu').isVisible())) {
      throw new Error('mobile: menu did not open')
    }
    await mobile.screenshot({ path: path.join(artifacts, 'mobile-menu.png') })
    await mobile.locator('.mobile-menu a[href="#work"]').click()
    if (await mobile.locator('.mobile-menu').isVisible()) {
      throw new Error('mobile: menu did not close')
    }

    await mobile.locator('#campus').scrollIntoViewIfNeeded()
    await mobile.waitForTimeout(1000)
    await mobile.locator('#campus').screenshot({
      path: path.join(artifacts, 'mobile-campus-section.png')
    })
    await mobile.screenshot({ path: path.join(artifacts, 'mobile-campus.png') })
    await mobile.screenshot({
      path: path.join(artifacts, 'mobile-full.png'),
      fullPage: true
    })
  } finally {
    await browser.close()
  }
}

verify()
  .then(() => console.log('Portfolio verification passed.'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
