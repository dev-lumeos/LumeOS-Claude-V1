// G-339: Quick-Add und Nutrition-settings am Schirm. Nur lesend.
import { chromium } from '@playwright/test'

const MARKE = process.argv[2] ?? 'vorher'
const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 950 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

const raus = {}
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

// ── Quick-add ───────────────────────────────────────────────────────
await p.getByRole('button', { name: /Quick-add/i }).first().click()
await p.waitForTimeout(1500)
raus.quickadd = {
  auswahl: await p.locator('select option')
    .evaluateAll(n => n.map(e => e.textContent.trim())),
  werte: await p.locator('select option')
    .evaluateAll(n => n.map(e => e.value)),
}
await p.screenshot({ path: `backup/g339-${MARKE}-quickadd.png`, fullPage: false })
await p.keyboard.press('Escape')
await p.waitForTimeout(800)

// ── Nutrition settings (meal_schedule) ──────────────────────────────
const set = p.getByRole('button', { name: /Nutrition settings|settings/i }).first()
if (await set.count()) {
  await set.click()
  await p.waitForTimeout(1500)
  raus.settings = {
    zeilen: await p.locator('input.v2-feld-klein:not([type=time])')
      .evaluateAll(n => n.map(e => e.value)),
    zeiten: await p.locator('input[type=time]')
      .evaluateAll(n => n.map(e => e.value)),
  }
  await p.screenshot({ path: `backup/g339-${MARKE}-settings.png`, fullPage: false })
  await p.keyboard.press('Escape')
}

console.log(JSON.stringify(raus, null, 2))
await b.close()
