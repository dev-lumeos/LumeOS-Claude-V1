import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1500, height: 1800 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'test-user@lumeos.local')
await s.fill('input[type="password"]', wortFuer('test-user@lumeos.local'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const t = await s.locator('body').innerText()
console.log('=== Welche Plannamen erscheinen? ===')
for (const n of ['Recomp 5-Meal', 'Lean Bulk 12', 'Buddy AI', 'Eigener Plan']) {
  console.log(`  ${n.padEnd(18)} ${t.includes(n) ? 'da' : 'FEHLT'}`)
}
console.log('\n=== Lebenszyklus-Kachel: wie heisst sie heute? ===')
for (const n of ['Lifecycle types', 'Lebenszyklus', 'Zyklus']) {
  console.log(`  ${n.padEnd(18)} ${t.includes(n) ? 'da' : 'fehlt'}`)
}
console.log('\n=== Ghost entries ===')
for (const n of ["Today's ghost entries", 'Plan des Tages', 'Bestätigen', 'Auslassen']) {
  console.log(`  ${n.padEnd(24)} ${t.includes(n) ? 'da' : 'fehlt'}`)
}
await b.close()
