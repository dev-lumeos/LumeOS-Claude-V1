// G-298: die drei Knoepfe im Browser, mit gezaehltem Rueckbau.
//
// `[read]` **Nicht die Route per fetch, sondern die Oberflaeche.**
// Ein gruener Endpunkt beweist nicht, dass ein Knopf ihn erreicht —
// genau diese Luecke hat G-192 durchrutschen lassen.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
const fehler = []
seite.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
console.log(`angemeldet als ${KONTO}`)

await seite.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1200)

const zellen = seite.locator('.v2-planner-zelle')
const n = await zellen.count()
console.log(`Planner-Zellen: ${n}`)
if (n === 0) {
  console.log('KEIN RASTER — der Nutzer hat keinen Plan. Abbruch.')
  console.log((await seite.locator('body').innerText()).slice(0, 400))
  await browser.close()
  process.exit(1)
}

const zaehle = async () => {
  const t = await seite.locator('body').innerText()
  return (t.match(/Probe-Rezept/g) ?? []).length
}

console.log(`\nEintraege mit "Probe-Rezept" vorher: ${await zaehle()}`)

// ── HINZUFUEGEN ────────────────────────────────────────────────
const erste = zellen.first()
await erste.hover()
await erste.locator('button[aria-label^="Eintrag hinzufügen"]').click()
await seite.waitForTimeout(400)

const form = erste.locator('select').first()
console.log(`Formular offen: ${await form.count() > 0}`)
await erste.getByRole('button', { name: 'Hinzufügen' }).click()
await seite.waitForTimeout(2500)

const nachAnlegen = await zaehle()
console.log(`nach dem Hinzufuegen: ${nachAnlegen}`)

// ── AENDERN ────────────────────────────────────────────────────
const ziel = seite.locator('.v2-planner-zelle', { hasText: 'Probe-Rezept' }).first()
if (await ziel.count() > 0) {
  await ziel.hover()
  await ziel.locator('button[aria-label$="ändern"]').first().click()
  await seite.waitForTimeout(400)
  const mengenfeld = ziel.locator('input[type="number"]').first()
  await mengenfeld.fill('3')
  await ziel.getByRole('button', { name: 'Übernehmen' }).click()
  await seite.waitForTimeout(2500)
  const text = await seite.locator('body').innerText()
  console.log(`nach dem Aendern steht "3×" im Raster: ${text.includes('3×')}`)
}

// ── ENTFERNEN ──────────────────────────────────────────────────
const ziel2 = seite.locator('.v2-planner-zelle', { hasText: 'Probe-Rezept' }).first()
if (await ziel2.count() > 0) {
  await ziel2.hover()
  await ziel2.locator('button[aria-label="Eintrag entfernen"]').first().click()
  await seite.waitForTimeout(300)
  await ziel2.getByRole('button', { name: 'Wirklich' }).click()
  await seite.waitForTimeout(2500)
}
console.log(`nach dem Entfernen: ${await zaehle()}`)

console.log(`\nKonsolenfehler: ${fehler.length}`)
fehler.slice(0, 3).forEach(f => console.log(`  ${f.slice(0, 160)}`))

await seite.screenshot({ path: 'backup/g298-browserprobe.png', fullPage: false })
await browser.close()
