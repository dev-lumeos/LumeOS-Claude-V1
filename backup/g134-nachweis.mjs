import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2000 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=foods', { waitUntil: 'networkidle' })
await s.waitForTimeout(2800)
const f = s.getByRole('button', { name: /Filter/ }).first()
if (await f.count()) { await f.click(); await s.waitForTimeout(900) }
const t = await s.locator('body').innerText()
const z = t.split('\n').map(x => x.trim()).filter(Boolean)
for (const g of ['Ernährungsform', 'Nährwert', 'Verarbeitung']) {
  const i = z.findIndex(x => x === g)
  console.log(`${g}: ${i < 0 ? '— nicht da' : z.slice(i+1, i+8).join(' · ')}`)
}
console.log(`\nHalal-Knopf: ${await s.getByRole('button', { name: 'Halal' }).count()}`)
console.log(`Koscher:     ${await s.getByRole('button', { name: 'Koscher' }).count()}`)
console.log(`Thai geparkt:${await s.getByRole('button', { name: /Thai/ }).count()}`)
// Wirkt Halal?
const vorher = z.find(x => /Treffer|von \d/.test(x)) ?? '—'
await s.getByRole('button', { name: 'Halal' }).first().click()
await s.waitForTimeout(2400)
const t2 = await s.locator('body').innerText()
const nachher = t2.split('\n').map(x=>x.trim()).find(x => /Treffer|von \d/.test(x)) ?? '—'
console.log(`\nTreffer vorher:  ${JSON.stringify(vorher)}`)
console.log(`Treffer nachher: ${JSON.stringify(nachher)}`)
console.log(`Filter wirkt: ${vorher !== nachher ? 'JA' : 'unklar'}`)
await s.screenshot({ path: 'backup/g134-nachher.png' })
await b.close()
