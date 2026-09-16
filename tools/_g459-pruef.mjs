// G-459 — die Allergiekachel: Vorschlaege, Tabellenform, Reichweite.
//
// Aufruf:  node tools/_g459-pruef.mjs <art> <begriff> <foto|->
//
// [read] Misst die WIRKUNG, nicht die Klassennamen: was im Pulldown
// steht, in welcher Spalte die Felder beginnen, und welchen Satz die
// Kachel zur Reichweite sagt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const ART = process.argv[2] ?? 'nahrung'
const BEGRIFF = process.argv[3] ?? 'laktose'
const FOTO = process.argv[4] && process.argv[4] !== '-' ? process.argv[4] : null
// G-455: EIN Baustein, ZWEI Orte — beide muessen pruefbar sein.
const ZIEL = '/' + (process.argv[5] ?? 'v2/settings').replace(/^\/+/, '')

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
const fehler = []
s.on('pageerror', e => fehler.push('PAGEERROR: ' + e.message.slice(0, 200)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}
const r = await s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2200)

const form = s.locator('.v2-allergie-form').first()
await form.scrollIntoViewIfNeeded({ timeout: 15000 }).catch(() => {})

// Die Art zuerst — sie entscheidet, welcher Katalog gefragt wird.
await form.locator('select[aria-label="Art"]').selectOption(ART)
const feld = form.locator('input[aria-label="Stoff"]')
await feld.click()
if (BEGRIFF && BEGRIFF !== '-') await feld.fill(BEGRIFF)

// [read] Auf die ANTWORT warten, nicht auf eine feste Frist — sonst
// misst man die Entprellzeit statt der Liste. Eine leere Antwort ist
// aber auch ein Ergebnis (A9), deshalb mit Auffanglinie.
await s.waitForFunction(
  () => document.querySelector('.v2-allergie-vorschlaege')
    || document.querySelector('.v2-allergie-katalogluecke'),
  { timeout: 6000 },
).catch(() => {})
await s.waitForTimeout(900)

const m = await s.evaluate(() => {
  const q = (x) => document.querySelector(x)
  const liste = q('.v2-allergie-vorschlaege')
  const zeilen = Array.from(
    document.querySelectorAll('.v2-allergie-vorschlag'))
  // Wo beginnt jedes Eingabefeld? Gleiche Kante = „dieselbe Spalte".
  const kanten = Array.from(document.querySelectorAll(
    '.v2-allergie-form .v2-allergie-zeile-neu'))
    .map(z => {
      const f = z.querySelector('select, input, button, .v2-allergie-reichweite')
      return f ? Math.round(f.getBoundingClientRect().left) : null
    })
    .filter(x => x !== null)
  const reich = q('.v2-allergie-reichweite')
  return {
    listeOffen: !!liste,
    vorschlaege: zeilen.map(z => ({
      name: z.querySelector('.v2-allergie-vorschlag-name')?.textContent.trim(),
      treffer: z.querySelector('.v2-allergie-vorschlag-zahl')?.textContent.trim(),
      grund: z.querySelector('.v2-allergie-vorschlag-grund')?.textContent.trim() ?? null,
    })),
    katalogluecke: q('.v2-allergie-katalogluecke')?.textContent.trim() ?? null,
    feldkanten: kanten,
    eineSpalte: new Set(kanten).size === 1,
    reichweite: reich?.textContent.trim() ?? null,
    reichweiteGeprueft: !!reich?.classList.contains('ist-geprueft'),
  }
})

if (FOTO) { await s.waitForTimeout(400); await s.screenshot({ path: FOTO }) }
console.log(JSON.stringify(
  { art: ART, begriff: BEGRIFF, status: r?.status(), ...m, fehler }, null, 2))
await b.close()
