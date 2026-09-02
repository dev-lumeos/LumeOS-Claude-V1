// G-335: "Neuer Plan" allein, aus frischem Laden.
import { chromium } from '@playwright/test'

const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 900 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

await p.goto(`${B}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
await p.getByRole('button', { name: 'Neuer Plan', exact: true }).first().click()
await p.waitForTimeout(2500)

await p.waitForTimeout(1500)
const inhalt = await p.locator('body').innerText()
const body = await p.locator('body').innerText()

console.log(JSON.stringify({
  inhalt: inhalt.slice(0, 1200),
  werkbank: inhalt.includes('Neuer Plan') ? inhalt.slice(inhalt.indexOf('Neuer Plan'), inhalt.indexOf('Neuer Plan')+900) : '(Karte nicht gefunden)',
  englisch: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-Workout',
    'Pre-workout', 'Post-Workout'].filter(w => body.includes(w)),
  roh: ['pre_workout', 'post_workout'].filter(w => body.includes(w)),
  selects: await p.locator('select').evaluateAll(
    n => n.map(e => [...e.options].map(o => o.text))),
  slot_zeilen: await p.locator('[data-probe="slot-zeile"]').count(),
  rollen: await p.evaluate(() => [...document.querySelectorAll('*')]
    .filter(e => e.scrollHeight > e.clientHeight + 4
      && getComputedStyle(e).overflowY !== 'visible' && e.clientHeight > 200)
    .map(e => ({ k: (e.className || '').toString().slice(0, 40),
      s: e.scrollHeight, c: e.clientHeight }))),
}, null, 2))

await p.screenshot({ path: 'backup/g335-neuer-plan.png', fullPage: true })
await b.close()
