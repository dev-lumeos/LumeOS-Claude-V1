import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2400 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

console.log('══ Preferences: die Kachel ═════════════════')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=prefs', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
for (const p of ['meals-per-day','snacks-per-day','meal-prep-ok','planner-notes','struktur-wirkung']) {
  const e = s.locator(`[data-probe="${p}"]`)
  const n = await e.count()
  let wert = ''
  if (n) wert = await e.first().evaluate(x => x.tagName === 'INPUT'
    ? (x.type === 'checkbox' ? String(x.checked) : x.value)
    : x.innerText.slice(0, 80))
  console.log(`  ${p.padEnd(18)} ${n} · ${JSON.stringify(wert)}`)
}
await s.screenshot({ path: 'backup/g72-prefs.png', fullPage: true })

console.log('\n══ Tagebuch: wie viele Slots? ══════════════')
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=diary', { waitUntil: 'networkidle' })
await s.waitForTimeout(3000)
const t = await s.locator('body').innerText()
const slots = ['Breakfast','Lunch','Dinner','Snack','Post-workout']
  .filter(x => t.includes(x))
console.log(`  sichtbare Slots: ${JSON.stringify(slots)}`)
console.log(`  (dev: meals_per_day=4, snacks_per_day=1 → 3 Haupt + Snack)`)
await s.screenshot({ path: 'backup/g72-diary.png', fullPage: true })
await b.close()
