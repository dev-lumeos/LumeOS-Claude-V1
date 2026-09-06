// G-354: zeigt das Modal jetzt die vier echten Arten? Nur lesend.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const MARKE = process.argv[2] ?? 'nachher'
const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 1100 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

await p.goto(`${B}/v2/goals`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2800)
await p.getByRole('button', { name: /New goal/i }).first().click()
await p.waitForTimeout(1500)

// Die Bauform ist eine Knopfreihe mit aria-pressed (G-352-Lehre:
// nicht nach `select` suchen).
const knoepfe = await p.locator('button[aria-pressed]').allTextContents()
const txt = await p.locator('body').innerText()

console.log(JSON.stringify({
  arten: knoepfe.map(k => k.trim()).filter(Boolean),
  anzahl: knoepfe.length,
  weight_habit_custom: /\bWeight\b|\bHabit\b|\bCustom\b/.test(txt),
  create_knopf: /Create goal/.test(txt),
}, null, 2))

await p.screenshot({ path: `backup/g354-${MARKE}-modal.png` })
await b.close()
