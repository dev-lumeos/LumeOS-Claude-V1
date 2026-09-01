import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1500, height: 1400 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'test-user@lumeos.local')
await s.fill('input[type="password"]', wortFuer('test-user@lumeos.local'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
// Ohne ?plan= — der aktive Plan traegt das Rezept.
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=planner', { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const k = s.locator('button[aria-label$="— Zutaten"]')
const n = await k.count()
console.log(`klickbare Rezepte: ${n}`)
if (n > 0) {
  const label = await k.first().getAttribute('aria-label')
  console.log(`  ${label}`)
  await k.first().click()
  await s.waitForTimeout(700)
  console.log(`  aria-expanded: ${await k.first().getAttribute('aria-expanded')}`)
  const t = await s.locator('body').innerText()
  console.log('  Zutaten am Schirm:')
  for (const z of ['Grillh', 'Reis', 'Broccoli', 'Brokkoli']) {
    const m = t.match(new RegExp(`${z}[^\n]{0,42}`))
    if (m) console.log(`    ${m[0].trim()}`)
  }
  const zeile = t.match(/\d+ Zutaten[^\n]*/)
  if (zeile) console.log(`  ${zeile[0]}`)
}
await s.screenshot({ path: 'backup/g311-rezept.png', fullPage: false })
await b.close()
