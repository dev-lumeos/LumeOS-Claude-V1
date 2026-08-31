// G-304: was zeigt der Planner bei einem Plan OHNE Wochen?
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1500, height: 1200 } })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

await seite.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1300)

const t = await seite.locator('body').innerText()
const ab = t.indexOf('Rezepte') + 8
console.log('=== Planner bei einem Plan ohne Wochen ===')
console.log(t.slice(ab, ab + 700).split('\n').filter(Boolean)
  .map(s => `  ${s}`).join('\n'))

console.log('\n=== Knoepfe im Planner ===')
const k = seite.locator('button:visible')
for (let i = 0; i < await k.count(); i += 1) {
  const n = ((await k.nth(i).innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  if (n && !/^(DE|Commands|Ask|View memory|Diary|Insights|Nutrients|Food DB|Meal plans|Preferences|Planner|Rezepte|Quick-add|Recalc|MealCam|Heute)/.test(n)) {
    console.log(`  ${n.slice(0, 50)}`)
  }
}

await seite.screenshot({ path: 'backup/g304-leerplan.png' })
await browser.close()
