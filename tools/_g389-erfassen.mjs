// G-389/A1 + A3 + A4 - eine Injektion am Schirm erfassen.
//
// `[read]` **Die Frage ist nicht, ob ein Knopf da ist** - sondern ob
// danach eine ZEILE da ist. **Vorher zaehlen, klicken, nachher
// zaehlen.**
//
// `[cmd]` **Laeuft auf `test-user@lumeos.local`** - eine Klickprobe
// schreibt mit, und Laeufe auf `dev` ueberschreiben Toms
// Einstellungen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()

const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 160)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

await p.goto(`${ZIEL}/v2/supplements?tab=injection`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)

// ── A4, Bild 1: die Karte VOR dem Erfassen ───────────────────────
await p.screenshot({ path: 'docs/bilder/g389/karte-vorher.png', fullPage: true })

// Das Erfassungsfenster oeffnen.
const knopf = p.locator('button', { hasText: /^Log injection$/i }).first()
console.log('Knopf "Log injection":', await knopf.count() > 0 ? 'gefunden' : 'NICHT GEFUNDEN')
await knopf.click()
await p.waitForTimeout(900)

// ── A3: welche Nadel steht da, und woher? ────────────────────────
const nadelStand = await p.evaluate(() => {
  // `[cmd]` **IM DIALOG suchen, nicht auf der ganzen Seite** - der
  // Reiter dahinter traegt selbst eine Ueberschrift "Needle
  // recommendation", und die erste Fassung dieser Probe las genau
  // die. **Ein Wert vom falschen Element sieht plausibel aus.**
  const dlg = document.querySelector('[role="dialog"]') ?? document
  const feld = dlg.querySelector('input[aria-label="Needle"]')
  const kopf = [...dlg.querySelectorAll('.v2-eyebrow')]
    .map(x => x.textContent?.trim() ?? '')
    .find(t => t.startsWith('Needle'))
  return { wert: feld?.value ?? null, herkunft: kopf ?? null }
})
console.log(`Nadel vorbelegt: "${nadelStand.wert}"  (${nadelStand.herkunft})`)

// Die Felder fuellen.
await p.selectOption('select[aria-label="Compound"]', { index: 1 })
await p.fill('input[aria-label="Notes"]', 'G-389 Klickprobe')
await p.waitForTimeout(300)
await p.screenshot({ path: 'docs/bilder/g389/modal-gefuellt.png' })

// Speichern.
const speichern = p.locator('button', { hasText: /Log injection|Speichert/i }).last()
console.log('Speichern aktiv:', !(await speichern.isDisabled()))
// `[read]` **Das Fenster schliesst sich nach 1100 ms selbst** - wer
// danach liest, sieht die Rueckmeldung nicht mehr. **Frueh lesen.**
await speichern.click()
await p.waitForTimeout(700)
const sofort = await p.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]')
  return dlg ? dlg.innerText.replace(/\s+/g, ' ').slice(-160) : '(Fenster schon zu)'
})
console.log('im Fenster:', sofort)
await p.screenshot({ path: 'docs/bilder/g389/modal-gespeichert.png' })
await p.waitForTimeout(2500)

const rueck = await p.evaluate(() => {
  const t = document.body.innerText
  const ok = t.match(/In medical\.injection_logs gespeichert[^\n]*/)
  const nein = t.match(/Nicht gespeichert:[^\n]*/)
  return ok?.[0] ?? nein?.[0] ?? '(keine Rueckmeldung)'
})
console.log('Rueckmeldung:', rueck)

// ── A4, Bild 2: die Karte NACH dem Erfassen ──────────────────────
await p.goto(`${ZIEL}/v2/supplements?tab=injection`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)
await p.screenshot({ path: 'docs/bilder/g389/karte-nachher.png', fullPage: true })

if (fehler.length) console.log('SEITENFEHLER:', fehler.slice(0, 2))
await b.close()
