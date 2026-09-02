// G-294/G-232/G-234: der Schirmbefund. Nur lesend, nichts wird angelegt.
import { chromium } from '@playwright/test'

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

// ── G-294: taucht ein Nutrition-Score irgendwo auf? ─────────────────
await p.goto(`${B}/v2/nutrition?tab=insights`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const it = await p.locator('body').innerText()
raus.insights = {
  nennt_score: /Nutrition Score|NRF/i.test(it),
  unvollstaendig: /unvollst|incomplete|keine Daten|—/i.test(it),
}
await p.screenshot({ path: 'backup/g294-insights.png', fullPage: true })

// ── G-294: die Goals-Seite und ihr Nutrition-Beitrag ────────────────
await p.goto(`${B}/v2/goals`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const gt = await p.locator('body').innerText()
raus.goals = {
  nennt_nutrition: /Nutrition/i.test(gt),
  // Die harte 88 aus daten.ts:327 — steht sie am Schirm?
  zeigt_88: /\b88\b/.test(gt),
  attrappen: await p.locator('[data-probe*="entwicklung"], .v2-attrappe')
    .count(),
}
await p.screenshot({ path: 'backup/g294-goals.png', fullPage: true })

// ── G-232: der Quick-add-Dialog ─────────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const qa = p.getByRole('button', { name: /Quick-add/i }).first()
raus.quickadd = { knopf_da: await qa.count() }
if (await qa.count()) {
  await qa.click()
  await p.waitForTimeout(1500)
  const dt = await p.locator('[role=dialog], .v2-modal').first()
    .innerText().catch(() => '(kein Dialog)')
  raus.quickadd.inhalt = dt.slice(0, 500)
  // Schreibt der Add-Knopf, oder ist er "in Entwicklung"?
  const add = p.getByRole('button', { name: /^Add$/ }).first()
  raus.quickadd.add_knopf = await add.count()
  raus.quickadd.in_entwicklung = /in Entwicklung|noch nicht/i.test(dt)
  raus.quickadd.auswahl = await p.locator('select option')
    .evaluateAll(n => n.map(e => e.textContent.trim()).slice(0, 10))
  await p.screenshot({ path: 'backup/g232-quickadd.png', fullPage: false })
  await p.keyboard.press('Escape')
  await p.waitForTimeout(600)
}

// ── G-234: die zwei Selektoren, unter anderen Namen ─────────────────
await p.goto(`${B}/v2/nutrition?tab=prefs`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const pt = await p.locator('body').innerText()
raus.prefs = {
  unvertraeglichkeit_stufe: /Sensibel/i.test(pt),
  allergie_stufe: /Allergie/i.test(pt),
  halal_kosher: /halal|kosher/i.test(pt),
  religioes_gruppe: /Religiös/i.test(pt),
  persoenlich_gruppe: /Persönlich/i.test(pt),
}
await p.screenshot({ path: 'backup/g234-prefs.png', fullPage: true })

console.log(JSON.stringify(raus, null, 2))
await b.close()
