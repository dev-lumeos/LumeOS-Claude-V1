// G-340: der Klicknachweis — auf test-user, NICHT auf dev.
// Die Buehne legt das Skript an und raeumt sie am Ende wieder ab.
import { chromium } from '@playwright/test'

const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 1000 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'test-user@lumeos.local')
await p.fill('input[type=password]', 'LumeosTestUser2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

const raus = {}
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

// ── Eine Mahlzeit anlegen, damit Quick-Add ein Ziel hat ─────────────
const frei = p.locator('[data-probe="freie-mahlzeit-oeffnen"]')
if (await frei.count()) {
  await frei.scrollIntoViewIfNeeded()
  await frei.click()
  await p.waitForTimeout(1200)
  await p.fill('[data-probe="freie-name"]', 'G-340 Probe')
  await p.click('[data-probe="freie-anlegen"]')
  await p.waitForTimeout(3000)
}

// ── Quick-Add ───────────────────────────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
await p.getByRole('button', { name: /Quick-add/i }).first().click()
await p.waitForTimeout(1500)

raus.mahlzeiten_im_pulldown = await p.locator('[data-probe="quick-mahlzeit"] option')
  .evaluateAll(n => n.map(e => e.textContent.trim()))

await p.fill('[data-probe="quick-name"]', 'Pasta im Ristorante')
await p.fill('[data-probe="quick-kcal"]', '450')
await p.waitForTimeout(400)
raus.knopf_aktiv = await p.locator('[data-probe="quick-anlegen"]').isEnabled()
await p.screenshot({ path: 'backup/g340-nachher-ausgefuellt.png', fullPage: false })

await p.click('[data-probe="quick-anlegen"]')
await p.waitForTimeout(4000)

// ── Steht der Posten im Tagebuch? ───────────────────────────────────
const t = await p.locator('body').innerText()
raus.posten_sichtbar = t.includes('Pasta im Ristorante')
raus.kcal_sichtbar = /450/.test(t)
await p.screenshot({ path: 'backup/g340-nachher-eingetragen.png', fullPage: true })

console.log(JSON.stringify(raus, null, 2))
await b.close()
