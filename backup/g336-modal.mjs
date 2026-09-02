// G-336 Punkt 5: das Modal. Nur lesend — es wird NICHT angelegt.
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

await p.goto(`${B}/v2/nutrition?tab=diary`, { waitUntil: 'networkidle' })
await p.waitForTimeout(3000)

const knopf = p.locator('[data-probe="freie-mahlzeit-oeffnen"]')
await knopf.scrollIntoViewIfNeeded()
const vorher = await knopf.boundingBox()

await knopf.click()
await p.waitForTimeout(1200)

const raus = {
  knopf_noch_da: await p.locator('[data-probe="freie-mahlzeit-oeffnen"]').count(),
  knopf_lag_bei_y: vorher ? Math.round(vorher.y) : null,
  dialog: await p.locator('[role=dialog]').count(),
  modal_kasten: await p.locator('[data-probe="freie-mahlzeit"]').count(),
  titelleiste: await p.locator('[data-probe="titelleiste"]').count(),
  auswahl: await p.locator('[data-probe="freie-art"] option')
    .evaluateAll(n => n.map(e => e.textContent.trim())),
  freitext: await p.locator('[data-probe="freie-name"]').count(),
  hinweis: await p.locator('[data-probe="freie-hinweis"]').innerText(),
  hinweis_sichtbar: await p.locator('[data-probe="freie-hinweis"]').isVisible(),
}

// Steht das Modal im Bild? (Der Hinweis darf nicht unterhalb liegen.)
const hk = await p.locator('[data-probe="freie-hinweis"]').boundingBox()
raus.hinweis_y = hk ? Math.round(hk.y) : null
raus.fenster_hoehe = 900

await p.screenshot({ path: 'backup/g336-nachher-modal.png', fullPage: false })

// ── Der 22-Uhr-Fall ─────────────────────────────────────────────────
await p.fill('[data-probe="freie-zeit"]', '22:00')
await p.waitForTimeout(600)
raus.um22 = {
  hinweis: await p.locator('[data-probe="freie-hinweis"]').innerText(),
  anlegen_aktiv: await p.locator('[data-probe="freie-anlegen"]').isEnabled(),
}
await p.screenshot({ path: 'backup/g336-nachher-22uhr.png', fullPage: false })

// ── Eine Slotwahl setzt Zeit und Text ───────────────────────────────
const werte = await p.locator('[data-probe="freie-art"] option')
  .evaluateAll(n => n.map(e => e.value))
const slotWert = werte.find(v => v.startsWith('slot:'))
if (slotWert) {
  await p.selectOption('[data-probe="freie-art"]', slotWert)
  await p.waitForTimeout(600)
  raus.nach_slotwahl = {
    wert: slotWert,
    zeit: await p.inputValue('[data-probe="freie-zeit"]'),
    text: await p.inputValue('[data-probe="freie-name"]'),
    hinweis: await p.locator('[data-probe="freie-hinweis"]').innerText(),
  }
}

// ── Ziehbar? ────────────────────────────────────────────────────────
const kasten = p.locator('[data-probe="freie-mahlzeit"]')
const vor = await kasten.boundingBox()
const leiste = await p.locator('[data-probe="titelleiste"]').boundingBox()
if (leiste) {
  await p.mouse.move(leiste.x + 40, leiste.y + 10)
  await p.mouse.down()
  await p.mouse.move(leiste.x + 140, leiste.y + 70, { steps: 8 })
  await p.mouse.up()
  await p.waitForTimeout(500)
}
const nach = await kasten.boundingBox()
raus.ziehbar = (vor && nach)
  ? { dx: Math.round(nach.x - vor.x), dy: Math.round(nach.y - vor.y) }
  : null

console.log(JSON.stringify(raus, null, 2))
await b.close()
