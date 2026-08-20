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
//
// G-13 (2026-08-20): `--klick` und `--tippe` ergaenzt. Anlass: Der
// Erfassungsdialog liegt HINTER einem Klick — ein Foto der blossen
// Seite zeigt ihn nie. Beides ist optional; ohne die Schalter
// verhaelt sich das Werkzeug wie zuvor.
//
//   node tools/schuss.mjs /v2/nutrition backup/dialog.png \
//     --klick '[aria-label="Position hinzufuegen"]' --tippe '.v2-feld' mandel

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

  await seite.goto(`${BASIS}${pfad}`, { waitUntil: 'networkidle', timeout: 60_000 })
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
    fehler: fehler.slice(0, 5),
    ...(woerter.length ? { sichtbar } : {}),
    ...(selektoren.length ? { zaehler } : {}),
    ...(klicks.length || tippen.length ? { treffer } : {}),
  }, null, 2))
} finally {
  await browser.close()
}
