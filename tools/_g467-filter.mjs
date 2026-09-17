// G-467 — ueberleben die Filter einen Neuaufbau?
//
// Aufruf:  node tools/_g467-filter.mjs [foto-vorher] [foto-nachher]
//
// [read] Gemessen wird der SCHIRM nach einem echten Neuladen, nicht
// der Zustand im Speicher. „Ueberlebt Strg-F5" heisst: die Seite wird
// neu gebaut, und der Filter steht wieder da.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const FOTO_V = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : null
const FOTO_N = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1200 } })
const s = await k.newPage()
const fehler = []
s.on('pageerror', e => fehler.push('PAGEERROR: ' + e.message.slice(0, 160)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}

async function oeffne() {
  await s.goto(`${BASIS}/v2/supplements?tab=produkte`,
    { waitUntil: 'domcontentloaded' })
  await s.waitForFunction(
    () => document.querySelectorAll('.v2-tbl tbody tr').length > 0,
    { timeout: 60000 }).catch(() => {})
  await s.waitForTimeout(1800)
}

/** Was steht auf dem Schirm? */
async function lage() {
  return await s.evaluate(() => {
    const t = document.body.textContent ?? ''
    // Die Leiste gilt als offen, wenn die Kategorienpillen stehen.
    const leiste = !!document.querySelector('.v2-supp-prod-filter, [data-filterleiste]')
      || /KATEGORIE/i.test(t)
    const knopf = Array.from(document.querySelectorAll('button'))
      .find(x => /Filter/i.test(x.textContent ?? ''))
    // Die gewaehlten Pillen tragen `ist-an`/`aktiv` — sonst ueber den
    // Text der Fusszeile gehen.
    const statusPille = Array.from(document.querySelectorAll('button'))
      .filter(x => /On Market|Off Market|Alle/i.test(x.textContent ?? ''))
      .map(x => ({ text: x.textContent.trim().slice(0, 22),
                   an: x.className.includes('ist-an') || x.getAttribute('aria-pressed') === 'true' }))
    return {
      leisteOffen: leiste,
      knopfText: knopf?.textContent?.trim().slice(0, 40) ?? null,
      statusPillen: statusPille,
      suchfeld: document.querySelector('input[aria-label="Produkt suchen"]')?.value ?? null,
      // A4: der erklaerende Satz — aus der Fusszeile GELESEN, nicht
      // per Muster geraten. [cmd] Ein erster Entwurf suchte drei
      // feste Formulierungen und fand keine: der Satz enthaelt ein
      // Anfuehrungszeichen, das kein `[^·]*` mehr passieren liess.
      // A4: der erklaerende Satz. [cmd] Ueber `querySelectorAll
      // ('span')` gefunden -> null: der Satz steht in einem span,
      // dessen Text aus mehreren Kindern zusammenfaellt. [read]
      // Deshalb aus dem Seitentext geschnitten.
      trefferSatz: (t.match(/[\d.]+ geladen · [^K]{0,80}/)
        ?? t.match(/Alle [\d.]+ Treffer geladen\.?/)
        ?? t.match(/Kein Produkt passt zu diesen Filtern\./)
        ?? [])[0]?.trim() ?? null,
      katalogSatz: (t.match(/Katalog: [\d.]+ Produkte/) ?? [])[0] ?? null,
      // Der Rohtext der Fusszeile — damit ein Fehlschlag oben
      // sichtbar wird, statt als `null` durchzugehen.
      fusszeile: (t.match(/.{0,90}(geladen|Kein Produkt passt).{0,90}/) ?? [])[0] ?? '(nichts)',
      zeilen: document.querySelectorAll('.v2-tbl tbody tr').length,
    }
  })
}

// ══ 0 — ERST ZURUECKSETZEN, UEBER DIE OBERFLAECHE ════════════════
//
// [cmd] Ein PUT auf die Route reichte NICHT: der Reiter speichert
// entprellt seinen EIGENEN Zustand 400 ms spaeter und ueberschrieb
// die Zuruecksetzung sofort wieder. Das Foto zeigte weiter vitamin,
// NOW Foods und „Alle 214.780".
//
// [read] Die Probe darf nicht gegen die Anwendung schreiben. Wer
// zuruecksetzen will, klickt „Zuruecksetzen" — dann ist die
// Anwendung der einzige Schreiber, und gemessen wird, was ein
// Nutzer bekaeme.
await oeffne()
const zuruecksetzen = s.locator('button', { hasText: /^Zurücksetzen$/ })
if (await zuruecksetzen.count() > 0) {
  await zuruecksetzen.first().click()
  await s.waitForTimeout(2000)
}
// Der Allergiefilter geht bewusst NICHT mit zurueck (G-455) — und
// der Marktstatus ist nach dem Zuruecksetzen wieder die Vorgabe.
const geloescht = await s.evaluate(async () => {
  const w = await fetch('/api/supplements/filter')
  return { danach: await w.json() }
})

// ══ 1 — der Ausgangszustand (A5: Vorgabe) ════════════════════════
await oeffne()
const start = await lage()
if (FOTO_V) await s.screenshot({ path: FOTO_V })

// ══ 2 — einen Filter setzen, UEBER DIE OBERFLAECHE ═══════════════
//
// [read] Geklickt, nicht geschrieben — so wird derselbe Weg
// gemessen, den ein Nutzer geht.
const katVitamin = s.locator('button', { hasText: /^vitamin/ })
if (await katVitamin.count() > 0) {
  await katVitamin.first().click()
  await s.waitForTimeout(1500)
}
const gesetzt = await s.evaluate(async () => {
  const w = await fetch('/api/supplements/filter')
  return await w.json()
})
// [read] Warten, bis das entprellte Speichern (400 ms) durch ist.
await s.waitForTimeout(1500)

// ══ 3 — NEU LADEN und nachsehen ══════════════════════════════════
await oeffne()
const nachher = await lage()
if (FOTO_N) await s.screenshot({ path: FOTO_N })

// ══ 4 — A3: die Sucheingabe darf NICHT gespeichert sein ══════════
const feld = s.locator('input[aria-label="Produkt suchen"]')
await feld.click()
await feld.type('whey', { delay: 50 })
await s.waitForTimeout(2500)
const gespeichert = await s.evaluate(async () => {
  const a = await fetch('/api/supplements/filter')
  return await a.json()
})
await oeffne()
const nachTippen = await lage()

console.log(JSON.stringify({
  geloescht, start, gesetzt, nachher,
  sucheNachNeuladen: nachTippen.suchfeld,
  gespeicherterStand: gespeichert.filter ?? null,
  // A3: steht die Frage irgendwo im gespeicherten Objekt?
  frageGespeichert: JSON.stringify(gespeichert.filter ?? {}).includes('whey'),
  fehler,
}, null, 2))
await b.close()
