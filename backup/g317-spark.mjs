import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1600 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const t = await s.locator('body').innerText()
const i = t.indexOf('7-day compliance')
console.log(i >= 0 ? t.slice(i, i + 130).split('\n').filter(Boolean).map(x => `  ${x}`).join('\n') : 'Kachel fehlt')
// Die Punkte der Kurve.
const poly = s.locator('svg polyline, svg path').last()
if (await poly.count()) {
  const d = await poly.evaluate(x => x.getAttribute('points') ?? x.getAttribute('d'))
  console.log(`\n  Kurve: ${String(d).slice(0, 220)}`)
}
await b.close()
