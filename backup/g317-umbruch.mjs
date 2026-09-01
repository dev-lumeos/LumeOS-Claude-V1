import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1700 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const t = await s.locator('body').innerText()
console.log('=== G-302: die Zielzeile ===')
for (const w of ['Kohlenhydrate', 'kcal Ziel', 'Zeilen je Tag', 'aus nutrition.meal_plans ·']) {
  console.log(`  "${w}" ${t.includes(w) ? 'NOCH DA' : 'weg'}`)
}
// Umbruch messen: Row-Beschriftung und Wert auf derselben Hoehe?
const rows = s.locator('.v2-row, [class*="row"]')
console.log(`\n=== Zeilen in Plan settings ===`)
const ps = t.indexOf('Plan settings')
console.log(t.slice(ps, t.indexOf('Lifecycle types', ps)).split('\n').filter(Boolean).map(x => `  ${x}`).join('\n'))
await b.close()
