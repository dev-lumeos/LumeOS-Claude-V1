// G-346: 15:00 Kaffee + 15:10 Keks -> ein Snack oder zwei?
// Laeuft auf test-user@lumeos.local. Buehne bleibt stehen.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 1100 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'test-user@lumeos.local')
await p.fill('input[type=password]', wortFuer('test-user@lumeos.local'))
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

const raus = { schritte: [] }

// Zwei Mal Quick-Add auf DIESELBE Mahlzeit — das ist der Fall.
for (const [n, was, kcal] of [[1, 'Kaffee', '5'], [2, 'Keks', '90']]) {
  await p.getByRole('button', { name: /Quick-add/i }).first().click()
  await p.waitForTimeout(1200)

  const opts = await p.locator('[data-probe="quick-mahlzeit"] option')
    .allTextContents()
  const werte = await p.locator('[data-probe="quick-mahlzeit"] option')
    .evaluateAll(nn => nn.map(e => e.value))

  // Den Snack waehlen, wenn es ihn gibt — sonst den ersten.
  const i = opts.findIndex(o => /Snack/i.test(o))
  const ziel = werte[i >= 0 ? i : 0]
  await p.selectOption('[data-probe="quick-mahlzeit"]', ziel)
  await p.fill('[data-probe="quick-name"]', was)
  await p.fill('[data-probe="quick-kcal"]', kcal)
  await p.waitForTimeout(400)
  await p.click('[data-probe="quick-anlegen"]')
  await p.waitForTimeout(3500)

  raus.schritte.push({ n, was, gewaehlt: opts[i >= 0 ? i : 0], meal_id: ziel })
}

await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const t = await p.locator('body').innerText()
raus.snack_karten = (t.match(/Snack/g) ?? []).length
raus.kaffee = /Kaffee/.test(t)
raus.keks = /Keks/.test(t)
raus.sonstiges = /Sonstiges/.test(t)

await p.screenshot({ path: 'backup/g351-nachher-testuser.png', fullPage: true })
console.log(JSON.stringify(raus, null, 2))
await b.close()
