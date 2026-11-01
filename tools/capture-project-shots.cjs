const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const root = path.resolve(__dirname, '..')
const assets = path.join(root, 'assets', 'projects')

function dataUrl(fileName, mime = 'image/jpeg') {
  return `data:${mime};base64,${fs.readFileSync(path.join(assets, fileName)).toString('base64')}`
}

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  })

  try {
  const storePage = await browser.newPage({
    viewport: { width: 1440, height: 980 },
    deviceScaleFactor: 1
  })

  const storeProducts = [
    {
      id: 1,
      name: '极简桌面蓝牙音箱',
      description: '小体积，也有清晰饱满的声场',
      price: 399,
      originalPrice: 499,
      image: dataUrl('store-product-1.jpg')
    },
    {
      id: 2,
      name: '轻量通勤托特包',
      description: '日常收纳与利落轮廓兼顾',
      price: 259,
      originalPrice: 329,
      image: dataUrl('store-product-2.jpg')
    },
    {
      id: 3,
      name: '自然质感生活器物',
      description: '让日常空间多一点安静秩序',
      price: 189,
      image: dataUrl('store-product-3.jpg')
    },
    {
      id: 4,
      name: '桌面工作灯',
      description: '柔和照明，适合长时间专注',
      price: 329,
      image: dataUrl('store-product-1.jpg')
    }
  ]

  const categories = [
    { id: 1, name: '电子产品' },
    { id: 2, name: '服装鞋帽' },
    { id: 3, name: '食品饮料' },
    { id: 4, name: '家居生活' },
    { id: 5, name: '图书文具' }
  ]

  await storePage.route('http://127.0.0.1:5173/api/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/products')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: storeProducts, categories })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] })
    })
  })

  await storePage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await storePage.screenshot({
    path: path.join(assets, 'store-home.png'),
    fullPage: false
  })

  const campusPage = await browser.newPage({
    viewport: { width: 430, height: 900 },
    deviceScaleFactor: 1,
    isMobile: true
  })
  campusPage.on('console', (message) => console.log(`[campus] ${message.type()}: ${message.text()}`))
  campusPage.on('pageerror', (error) => console.error(`[campus] page error: ${error.message}`))

  const campusProducts = [
    {
      id: 11,
      title: '九成新机械键盘，宿舍自提',
      price: '128.00',
      first_image: dataUrl('campus-product-1.jpg'),
      seller_avatar: dataUrl('campus-product-2.jpg'),
      seller_name: '林同学',
      tags: [{ id: 1, name: '数码' }, { id: 2, name: '可小刀' }]
    },
    {
      id: 12,
      title: '毕业季闲置收纳箱两只',
      price: '35.00',
      first_image: dataUrl('campus-product-2.jpg'),
      seller_avatar: dataUrl('campus-product-2.jpg'),
      seller_name: '小景',
      tags: [{ id: 3, name: '生活' }]
    },
    {
      id: 13,
      title: '专业教材与课堂笔记打包',
      price: '46.00',
      first_image: dataUrl('campus-product-1.jpg'),
      seller_avatar: dataUrl('campus-product-2.jpg'),
      seller_name: '阿禾',
      tags: [{ id: 4, name: '教材' }, { id: 5, name: '学霸笔记' }]
    },
    {
      id: 14,
      title: '宿舍小台灯，暖光护眼',
      price: '29.00',
      first_image: dataUrl('campus-product-2.jpg'),
      seller_avatar: dataUrl('campus-product-2.jpg'),
      seller_name: '木木',
      tags: [{ id: 6, name: '好物' }]
    }
  ]

  await campusPage.route('http://127.0.0.1:8000/api/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/products/') && !url.includes('/categories/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: campusProducts })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] })
    })
  })

  await campusPage.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' })
  await campusPage.waitForTimeout(1500)
  console.log(`[campus] body text: ${(await campusPage.locator('body').innerText()).slice(0, 300)}`)
  await campusPage.screenshot({
    path: path.join(assets, 'campus-home.png'),
    fullPage: false
  })
  } finally {
    await browser.close()
  }
}

capture().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
