import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1800 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)
// Die API direkt fragen.
const roh = await s.evaluate(async () => {
  const r = await fetch(`/api/nutrition/plan?datum=${new Date().toISOString().slice(0,10)}`)
  return r.ok ? await r.json() : { fehler: r.status }
})
console.log('=== Ghost-API (Tagebuch) ===')
console.log(`  Eintraege: ${(roh.eintraege ?? []).length}`)
// Und was der Reiter zeigt.
const t = await s.locator('body').innerText()
const i = t.indexOf("Today's ghost entries")
if (i >= 0) {
  const block = t.slice(i, t.indexOf('Plan settings', i) > 0 ? t.indexOf('Plan settings', i) : i + 900)
  const zeilen = block.split('\n').filter(Boolean)
  console.log(`\n=== "Today's ghost entries" am Schirm: ${zeilen.length} Zeilen ===`)
  zeilen.slice(0, 30).forEach(z => console.log(`  ${z}`))
}
await b.close()
