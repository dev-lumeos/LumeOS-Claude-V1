// G-177: die Gewichtung im Detailfenster — vorher/nachher.
//
// `[cmd]` Gemessen wird, wieviel Text der INHALT belegt und wieviel
// der Schemabericht. Genau das war Toms Befund: der Bericht war
// laenger als alles zusammen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const SLUG = process.env.LUMEOS_SLUG ?? 'sub_b30d752d32'   // Bromocriptine

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const seite = await ctx.newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
await seite.fill('input[type=email]', KONTO)
await seite.fill('input[type=password]', wortFuer(KONTO))
await Promise.all([
  seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
  seite.click('button[type=submit]'),
])

await seite.goto(`${BASIS}/v2/supplements?tab=database`,
  { waitUntil: 'networkidle', timeout: 60_000 })
await seite.waitForTimeout(1200)

// Die Zeile finden und oeffnen — ueber den Namen, wie ein Nutzer.
const name = process.env.LUMEOS_NAME ?? 'Bromocriptine'
const zeile = seite.locator(`.v2-tbl tbody tr:has-text("${name}")`).first()
if (!await zeile.count()) {
  console.log(`FEHLER: keine Zeile mit "${name}" — steht sie im Katalog?`)
  await browser.close()
  process.exit(1)
}
await zeile.click()
await seite.waitForSelector('[role=dialog]', { timeout: 30_000 })
await seite.waitForTimeout(900)

const d = await seite.evaluate(() => {
  const dlg = document.querySelector('[role=dialog]')
  if (!dlg) return null
  const t = (dlg.textContent ?? '').replace(/\s+/g, ' ')
  // Die Anrisse der Klappen — das ist die Stelle, um die es geht.
  const klappen = [...dlg.querySelectorAll('button')]
    .map(b => (b.textContent ?? '').replace(/\s+/g, ' ').trim())
    .filter(s => s && s.length > 3 && !/^(Zum Stack hinzuf|Schlie)/i.test(s))
  // Der Kopfbereich: alles VOR der ersten Klappe. `[read]` Die erste
  // `button` im Dialog ist der Schliessen-Knopf — nach ihm zu teilen
  // ergab „1 Zeichen". Geteilt wird an der ersten Klappe im Rumpf.
  const rumpf = dlg.querySelector('.v2-modal-body')
  const ersteKlappe = rumpf?.querySelector('button')
  const kopf = ersteKlappe && rumpf
    ? (rumpf.textContent ?? '').split(ersteKlappe.textContent ?? '')[0]
    : (rumpf?.textContent ?? '')
  return {
    laenge: t.length,
    kopfLaenge: kopf.replace(/\s+/g, ' ').trim().length,
    evidenzOben: /Evidenz/.test(kopf),
    schemabericht: /Ohne Quelle im neuen Katalog/.test(t),
    alteBegruendung: /Breittabelle|jsonb|keine Spalte/.test(t),
    slugSichtbar: /sub_[0-9a-f]{10}/.test(t),
    ohneAngabe: (t.match(/Ohne Angabe: [^.]+\./) ?? ['(keine)'])[0],
    klappen: klappen.slice(0, 8),
  }
})

if (!d) { console.log('Kein Dialog geoeffnet.'); await browser.close(); process.exit(1) }

console.log(`=== ${name} (${SLUG}) ===`)
console.log(`Textlaenge im Fenster : ${d.laenge} Zeichen`)
console.log(`davon Kopf (Inhalt)   : ${d.kopfLaenge} Zeichen`
  + `   Evidenz oben: ${d.evidenzOben ? 'ja' : 'NEIN'}`)
console.log(`Schemabericht sichtbar: ${d.schemabericht ? 'JA (Fehler)' : 'nein'}`)
console.log(`„Breittabelle/jsonb"  : ${d.alteBegruendung ? 'JA (Fehler)' : 'nein'}`)
console.log(`Slug unter dem Namen  : ${d.slugSichtbar ? 'JA (Fehler)' : 'nein'}`)
console.log(`Fehlende Bloecke      : ${d.ohneAngabe}`)
console.log('Anrisse der Klappen:')
for (const k of d.klappen) console.log(`  ${k}`)

await browser.close()
