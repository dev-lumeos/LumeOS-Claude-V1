// G-351: kann ein Nutzer `other` setzen? Nur lesend.
import { chromium } from '@playwright/test'

const MARKE = process.argv[2] ?? 'vorher'
const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 1000 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

const raus = {}

// ── 1 · Quick-Add: waehlt es eine Kategorie oder eine Mahlzeit? ─────
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
await p.getByRole('button', { name: /Quick-add/i }).first().click()
await p.waitForTimeout(1500)
raus.quickadd = {
  auswahl: await p.locator('[data-probe="quick-mahlzeit"] option')
    .allTextContents(),
  werte: await p.locator('[data-probe="quick-mahlzeit"] option')
    .evaluateAll(n => n.map(e => e.value)),
}
await p.keyboard.press('Escape')
await p.waitForTimeout(800)

// ── 2 · Die freie Mahlzeit: bietet sie `other`? ─────────────────────
const frei = p.locator('[data-probe="freie-mahlzeit-oeffnen"]')
if (await frei.count()) {
  await frei.scrollIntoViewIfNeeded()
  await frei.click()
  await p.waitForTimeout(1200)
  raus.freie_mahlzeit = {
    auswahl: await p.locator('[data-probe="freie-art"] option').allTextContents(),
    werte: await p.locator('[data-probe="freie-art"] option')
      .evaluateAll(n => n.map(e => e.value)),
  }
  await p.screenshot({ path: `backup/g351-${MARKE}-freie.png`, fullPage: false })
  await p.keyboard.press('Escape')
  await p.waitForTimeout(600)
}

// ── 3 · Welche Karten hat der Tag? ─────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const t = await p.locator('body').innerText()
raus.karten = t.split(String.fromCharCode(10))
  .filter(z => /^(Frühstück|Mittagessen|Abendessen|Snack|Sonstiges|Vor dem|Nach dem|Nachmittagssnack)/.test(z.trim()))
  .slice(0, 10)
raus.sonstiges_karte = /Sonstiges/.test(t)

await p.screenshot({ path: `backup/g351-${MARKE}-diary.png`, fullPage: true })
console.log(JSON.stringify(raus, null, 2))
await b.close()
