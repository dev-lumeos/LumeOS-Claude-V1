// Welche Attrappe steht noch auf dem Insights-Reiter?
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1440, height: 3000 } })

await seite.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', 'dev@lumeos.app')
await seite.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

await seite.goto('http://127.0.0.1:3200/v2/nutrition?tab=insights',
  { waitUntil: 'networkidle' })
await seite.waitForTimeout(1200)

const marken = seite.locator('.v2-attrappe')
const n = await marken.count()
console.log(`Attrappenmarken auf dem Schirm: ${n}`)
for (let i = 0; i < n; i += 1) {
  const t = (await marken.nth(i).innerText()).replace(/\s+/g, ' ').slice(0, 160)
  console.log(`  ${i + 1}. ${t}`)
}

// Und die vier neuen Kacheln: tragen sie eine Marke?
for (const titel of ['Verlauf', 'Tagesdeckung', 'Makros im Detail',
                     'Auffaellige Naehrstoffe']) {
  const k = seite.locator('.v2-card').filter({ hasText: titel }).first()
  const klasse = await k.getAttribute('class')
  console.log(`  ${titel}: ${klasse?.includes('v2-attrappe') ? 'ATTRAPPE' : 'echt'}`)
}

await browser.close()
