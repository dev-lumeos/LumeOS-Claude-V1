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
await s.waitForTimeout(2600)
const k = s.getByRole('button', { name: 'Aktivieren' })
console.log(`Aktivieren-Knoepfe unten: ${await k.count()}`)
if (await k.count()) {
  await k.first().click()
  await s.waitForTimeout(700)
  const t = await s.locator('body').innerText()
  console.log(`Frage geoeffnet: ${t.includes('Plan aktivieren') ? 'ja' : 'NEIN'}`)
  console.log(`  Startdatum-Feld: ${await s.getByLabel('Startdatum').count()}`)
  console.log(`  wird pausiert: ${t.includes('wird pausiert') ? 'da' : 'fehlt'}`)
  // Welcher Plan? Der Name muss ueber der Frage stehen.
  const i = t.indexOf('Plan aktivieren')
  console.log(`  Umgebung: ${JSON.stringify(t.slice(Math.max(0, i - 90), i).trim().split('\n').slice(-3).join(' | '))}`)
}
await s.screenshot({ path: 'backup/g319-mealplans.png', fullPage: false })
await b.close()
