// G-345: die Einkaufsliste am Schirm. Buehne auf test-user? Nein —
// der Planner-Knopf ERZEUGT eine Liste. Deshalb nur LESEN und den
// Knopf pruefen, nicht klicken.
import { chromium } from '@playwright/test'

const MARKE = process.argv[2] ?? 'vorher'
const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1500, height: 1000 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

await p.goto(`${B}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await p.waitForTimeout(3500)

const t = await p.locator('body').innerText()
const raus = {
  knopf_da: await p.locator('[data-probe="wochenliste"]').count(),
  knopf_text: await p.locator('[data-probe="wochenliste"]')
    .allInnerTexts().catch(() => []),
  // Die Wochenzeile: steht der Knopf neben Copy week?
  zeile: t.includes('Copy week')
    ? t.slice(Math.max(0, t.indexOf('Copy week') - 60),
      t.indexOf('Copy week') + 60).split(String.fromCharCode(10))
      .filter(Boolean)
    : [],
  konsole: [],
}

p.on('console', m => { if (m.type() === 'error') raus.konsole.push(m.text().slice(0, 80)) })
await p.screenshot({ path: `backup/g345-${MARKE}-planner.png`, fullPage: false })

// ── Der eigene Reiter ───────────────────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=einkauf`, { waitUntil: 'networkidle' })
await p.waitForTimeout(3000)
raus.reiter = {
  zeilen: await p.locator('[data-probe="listen-zeile"]').count(),
  namen: await p.locator('[data-probe="listen-zeile"]')
    .allInnerTexts().then(a => a.map(x => x.split(String.fromCharCode(10))[0])),
  archivknopf: await p.locator('[data-probe="archiv-umschalten"]').count(),
}
await p.screenshot({ path: `backup/g345-${MARKE}-reiter.png`, fullPage: true })

// ── Eine Liste oeffnen (nur lesen, nichts aendern) ──────────────────
if (raus.reiter.zeilen > 0) {
  await p.locator('[data-probe="listen-zeile"]').first().click()
  await p.waitForTimeout(2000)
  raus.modal = {
    da: await p.locator('[data-probe="einkaufsliste"]').count(),
    posten: await p.locator('[data-probe="listen-posten"]').count(),
    haken: await p.locator('[data-probe="posten-haken"]').count(),
    archivieren: await p.locator('[data-probe="liste-archivieren"]').count(),
    teilen: await p.locator('[data-probe="liste-teilen"]').count(),
    ziehbar: await p.locator('[data-probe="titelleiste"]').count(),
  }
  await p.screenshot({ path: `backup/g345-${MARKE}-modal.png`, fullPage: false })
}

console.log(JSON.stringify(raus, null, 2))
await b.close()
