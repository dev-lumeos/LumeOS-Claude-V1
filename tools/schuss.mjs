// Bildschirmfoto ohne Fenster, ueber das installierte Playwright.
//
// Anlass (Tom, 2026-08-20): Agenten starteten einen Bun-Browser fuer
// Bildschirmfotos, der auf jedem Aufruf ein Konsolenfenster oeffnete.
// Playwright liegt seit jeher im Repo (@playwright/test 1.41.2) samt
// chromium_headless_shell \u2014 es wurde nur nie benutzt.
//
// Aufruf:
//   node tools/schuss.mjs <pfad> <ziel.png> [--breite 1440] [--dunkel]
//                         [--klick <selektor>]... [--tippe <selektor> <text>]
//
// Beispiel:
//   node tools/schuss.mjs /v2/nutrition backup/nutrition-1440.png
//   node tools/schuss.mjs /v2/nutrition backup/nutrition-375.png --breite 375 --dunkel
//
// Meldet sich selbst an (dev@lumeos.app) und wartet, bis die Seite steht.
// **Misst dabei die Laufzeit** (A-45) — zwei Laeufe, ohne Schalter.
//
// G-13 (2026-08-20): `--klick` und `--tippe` ergaenzt. Anlass: Der
// Erfassungsdialog liegt HINTER einem Klick — ein Foto der blossen
// Seite zeigt ihn nie. Beides ist optional; ohne die Schalter
// verhaelt sich das Werkzeug wie zuvor.
//
//   node tools/schuss.mjs /v2/nutrition backup/dialog.png \
//     --klick '[aria-label="Position hinzufuegen"]' --tippe '.v2-feld' mandel
//
// ── A-45 (2026-08-21): die Laufzeit gehoert dazu ────────────────
//
// `[cmd]` **Anlass C-189:** Der Supplements-Tab war seit C-133 neun
// Sekunden langsam. **Fuenf Auftraege haben ihn angefasst, keiner hat
// es gemessen.** Der Orchestrator mass zweimal falsch — erst ohne
// Anmeldung (122 ms gegen die Anmeldeseite), dann als Kaltstart
// abgetan. **Tom hat widersprochen und hatte recht:** ein Aufruf in
// einer Schleife, 64 Mal dieselbe Unterfunktion, 7.641 ms -> 144 ms.
//
// Gemessen wird deshalb bei jedem Aufruf, ohne Schalter:
//   `zeit.gesamt_ms`      vom `goto` bis `networkidle`
//   `zeit.dokument_ms`    `responseEnd` der Hauptanfrage
//   `zeit.langsamste`     Anfragen ueber 300 ms, die drei groessten
//   `zeit.zweiter_lauf`   dieselbe Seite noch einmal, gleiche Sitzung
//
// `[read]` **Zwei Laeufe, weil ein einzelner Wert nichts sagt:** Der
// erste Aufruf einer Route uebersetzt im Entwicklungsmodus. **Ist der
// zweite genauso langsam, ist es kein Kaltstart** — genau das war
// Toms Argument.
//
// `[read]` **Keine Schwelle, kein Rot.** Das Werkzeug misst, es
// urteilt nicht: Eine Sekunde ist im Dev-Modus normal, neun nicht —
// aber wo die Grenze liegt, weiss niemand.

import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const args = process.argv.slice(2)
const pfad = args[0] ?? '/v2/nutrition'
const ziel = resolve(args[1] ?? 'backup/schuss.png')
const breite = Number(args[args.indexOf('--breite') + 1]) || 1440
const dunkel = args.includes('--dunkel')

/** Alle Vorkommen eines Schalters, in der Reihenfolge des Aufrufs. */
function alle(schalter, felder = 1) {
  const raus = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === schalter) raus.push(args.slice(i + 1, i + 1 + felder))
  }
  return raus
}

const klicks = alle('--klick').map(([sel]) => sel).filter(Boolean)
const tippen = alle('--tippe', 2).filter(([sel, text]) => sel && text)
// G-101: was nachgezaehlt werden soll — Text bzw. Elemente.
const woerter = alle('--zaehle').map(([w]) => w).filter(Boolean)
const selektoren = alle('--zaehleSel').map(([s]) => s).filter(Boolean)

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const WORT = process.env.LUMEOS_WORT ?? 'LumeosDev2026'

const browser = await chromium.launch({ headless: true })
const kontext = await browser.newContext({
  viewport: { width: breite, height: 900 },
  colorScheme: dunkel ? 'dark' : 'light',
})
const seite = await kontext.newPage()

const fehler = []
seite.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })

// A-45: Anfragen sammeln — aber nur waehrend eines Laufs. `sammler`
// zeigt auf die Liste des laufenden Durchgangs oder ist `null`; die
// Anmeldung faellt damit heraus.
let sammler = null
const SCHWELLE_MS = 300

seite.on('requestfinished', async anfrage => {
  if (!sammler) return
  const liste = sammler
  try {
    const t = anfrage.timing()
    // `responseEnd` ist -1, solange nichts ankam (abgebrochen, Cache).
    if (!t || t.responseEnd < 0) return
    liste.push({
      url: anfrage.url(),
      ms: Math.round(t.responseEnd),
      typ: anfrage.resourceType(),
    })
  } catch {
    // Eine Anfrage, deren Timing nicht mehr abfragbar ist, faellt weg.
    // Sie zu erfinden waere schlimmer als sie zu verlieren.
  }
})

/**
 * Eine Seite laden und dabei messen.
 *
 * `[read]` Die Zeit wird um das `goto` gelegt, nicht um den ganzen
 * Durchgang — Klicks und Tippen kommen danach und gehoeren nicht in
 * die Ladezeit.
 */
async function ladenUndMessen(url) {
  const anfragen = []
  sammler = anfragen
  const start = Date.now()
  const antwort = await seite.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
  const gesamt = Date.now() - start
  sammler = null

  // Die Hauptanfrage ist die des Dokuments selbst.
  let dokument = null
  try {
    const t = antwort?.request().timing()
    if (t && t.responseEnd >= 0) dokument = Math.round(t.responseEnd)
  } catch { /* siehe oben */ }

  const langsamste = anfragen
    .filter(a => a.ms > SCHWELLE_MS)
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 3)
    // Der Ursprung ist bei jeder Zeile derselbe und kostet nur Breite.
    .map(a => ({ ...a, url: a.url.replace(BASIS, '') }))

  return {
    gesamt_ms: gesamt,
    dokument_ms: dokument,
    anfragen: anfragen.length,
    ueber_schwelle: anfragen.filter(a => a.ms > SCHWELLE_MS).length,
    langsamste,
  }
}

try {
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })

  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', KONTO)
    await seite.fill('input[type=password]', WORT)
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }

  // A-45: erster Lauf — der uebersetzt im Dev-Modus mit.
  const zeit = await ladenUndMessen(`${BASIS}${pfad}`)

  // A-45: zweiter Lauf, dieselbe Sitzung, dieselbe Seite. `[read]`
  // **Ist er genauso langsam, ist es kein Kaltstart.** Er laeuft VOR
  // Klicks und Tippen, damit beide Zahlen dasselbe messen.
  // `[cmd]` **Die Meldungen des ersten Laufs werden VOR dem zweiten
  // verworfen** — sonst zaehlte jede doppelt.
  //
  // `[cmd]` **Dabei ist ein alter Zaehlfehler aufgefallen:** Die
  // Fassung vor A-45 zaehlte die Meldungen der ANMELDESEITE mit.
  // Gemessen am 2026-08-21 auf `/v2/medical?tab=dashboard`:
  // **ein Laden = 1 Meldung, die alte Fassung meldete 2.**
  // `[read]` Die „2 je Seite" aus G-105/G-123/G-135/G-148 sind also
  // eine der Anmeldung plus eine der Seite. **Der Zaehler nennt nur
  // die der gemessenen Seite.**
  //
  // A-46 (2026-08-21): `konsolenfehler_mit_anmeldung` hat die alte
  // Zaehlweise eine Zeit lang mitgetragen, damit sich die vier
  // Altberichte zuordnen lassen. `[read]` **Ein gepflegter
  // Doppelzaehler ist eine zweite Wahrheit** — dasselbe Muster wie
  // die zwei Zaehler im TODO-Kopf. Die Zuordnung gehoert in die vier
  // Berichte, nicht in jeden kuenftigen. Feld entfernt.
  fehler.length = 0
  zeit.zweiter_lauf = await ladenUndMessen(`${BASIS}${pfad}`)

  await seite.waitForTimeout(1200)

  // Erst klicken, dann tippen — in der Reihenfolge des Aufrufs. Ein
  // Selektor, der mehrfach trifft, nimmt den ersten sichtbaren.
  for (const sel of klicks) {
    await seite.locator(sel).first().click({ timeout: 15_000 })
    await seite.waitForTimeout(500)
  }
  for (const [sel, text] of tippen) {
    await seite.locator(sel).first().fill(text, { timeout: 15_000 })
    // Die Suche laeuft mit 250 ms Verzoegerung und muss antworten.
    await seite.waitForTimeout(1500)
  }

  mkdirSync(dirname(ziel), { recursive: true })
  await seite.screenshot({ path: ziel, fullPage: true })

  const marken = await seite.locator('text=/Attrappe/i').count()
  const titel = await seite.title()

  // G-13: was im Bild wirklich zu sehen ist — sonst belegt ein Foto
  // nur, dass etwas gerendert wurde, nicht was.
  //
  // G-101: die feste Wortliste ist durch `--zaehle` ersetzt. `[read]`
  // Sie stammte aus einem einzelnen Auftrag und stand jedem anderen im
  // Weg; jetzt sagt der Aufrufer, was er nachgezaehlt haben will.
  const sichtbar = {}
  for (const wort of woerter) {
    sichtbar[wort] = await seite.getByText(wort, { exact: false }).count()
  }
  // `--zaehleSel` zaehlt Elemente statt Text — z. B. Tabellenzeilen.
  const zaehler = {}
  for (const sel of selektoren) {
    zaehler[sel] = await seite.locator(sel).count()
  }
  const treffer = await seite.locator('.v2-wahl').count()

  console.log(JSON.stringify({
    ziel, pfad, breite, modus: dunkel ? 'dunkel' : 'hell',
    titel, attrappen: marken, konsolenfehler: fehler.length,
    // A-45: immer dabei, ohne Schalter — was nicht gemessen wird,
    // faellt niemandem auf (C-189: fuenf Auftraege, neun Sekunden).
    zeit,
    fehler: fehler.slice(0, 5),
    ...(woerter.length ? { sichtbar } : {}),
    ...(selektoren.length ? { zaehler } : {}),
    ...(klicks.length || tippen.length ? { treffer } : {}),
  }, null, 2))
} finally {
  await browser.close()
}
