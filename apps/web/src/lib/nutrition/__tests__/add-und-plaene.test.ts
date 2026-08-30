// G-265 / G-267 / G-270: der Add-Weg und die Planluecken.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const FOODS = 'src/app/v2/nutrition/tab-foods.tsx'
const SUCHE = 'src/app/v2/nutrition/suche/ansicht.tsx'

// ── G-265: +Add nimmt den Zustand mit ────────────────────────────

test('G-265: der Add-Link traegt Kennung UND Suchbegriff', () => {
  // `[cmd]` **Gemessen am 2026-08-29:** vorher trug er nur `?food=`,
  // und die Zielseite las den Parameter nie — **leeres Feld, null
  // Treffer, das Lebensmittel nirgends genannt.**
  const s = ohneKommentare(FOODS)
  const link = /\/v2\/nutrition\/suche\?food=\$\{f\.id\}[\s\S]{0,140}?Route\}/.exec(s)
  assert.ok(link, 'Der Add-Link wurde nicht gefunden (G-265).')
  assert.match(link[0], /[&?]q=/,
    'Der Link nimmt keinen Suchbegriff mit — die Zielseite bleibt leer (G-265).')
})

test('G-265: der Suchbegriff ist der Katalogname, nicht der Anzeigename', () => {
  // `[cmd]` **Gemessen:** `name_display_de` traegt Klammerzusaetze
  // („Weisser Reis (roh)") — **0 Treffer.** `name_de` („Reis
  // poliert, roh") trifft: **3 Treffer.**
  const s = ohneKommentare(FOODS)
  const link = /\/v2\/nutrition\/suche\?food=\$\{f\.id\}[\s\S]{0,160}?Route\}/.exec(s)
  assert.ok(link)
  assert.match(link[0], /encodeURIComponent\(f\.name_de\)/,
    'Der Anzeigename wird als Suchbegriff benutzt — er findet nichts (G-265).')
  assert.doesNotMatch(link[0], /encodeURIComponent\(f\.name_display_de/,
    'name_display_de als Suchbegriff liefert 0 Treffer (G-265).')
})

test('G-265: die Zielseite liest die Adresse beim Start', () => {
  // `[read]` **Wirkung, nicht Wort:** geprueft wird, dass beide
  // Parameter gelesen UND in die Suche gegeben werden.
  const s = ohneKommentare(SUCHE)
  assert.match(s, /new URLSearchParams\(window\.location\.search\)/,
    'Die Adresse wird beim Start nicht gelesen (G-265).')
  assert.match(s, /p\.get\('food'\)/, 'Die Kennung wird nicht gelesen (G-265).')
  assert.match(s, /p\.get\('q'\)/, 'Der Suchbegriff wird nicht gelesen (G-265).')
  assert.match(s, /void suche\(q, food\)/,
    'Die gelesenen Werte laufen nicht in die Suche (G-265).')
})

test('G-265: der Starteffekt laeuft genau einmal', () => {
  // `[read]` Ohne Sperre liefe er bei jeder Aenderung von `suche`
  // erneut und ueberschriebe, was der Nutzer eingegeben hat.
  const s = ohneKommentare(SUCHE)
  assert.match(s, /startRef/,
    'Kein Schutz gegen wiederholtes Ausfuehren (G-265).')
  assert.match(s, /if \(startRef\.current\) return/,
    'Der Starteffekt ist nicht gegen Wiederholung gesperrt (G-265).')
})

test('G-265: ohne Parameter bleibt die Seite unveraendert', () => {
  // `[read]` Wer die Detailsuche direkt aufruft, soll keine leere
  // Suche ausgeloest bekommen.
  const s = ohneKommentare(SUCHE)
  assert.match(s, /if \(!food && !q\) return/,
    'Ohne Parameter wird trotzdem gesucht (G-265).')
})

// ── G-267 / G-270: was gemeldet und nicht gebaut wurde ───────────

test('G-267: New plan schreibt, seit das Schema es traegt', () => {
  // `[cmd]` **Am 2026-08-29 tat der Knopf nichts**, und dieser Test
  // verbot ihm, Spalten zu benutzen, die es nicht gab (C-239).
  //
  // `[cmd]` **Seit dem 2026-08-30 stehen sie live** — `lifecycle_type`,
  // `start_date`, `days_count`, `next_plan_id`, `rollover_count`,
  // `status`, `plan_origin`, dazu `meal_plan_logs`. **Am selben Tag
  // gegen `information_schema` nachgemessen**, nicht dem Bericht
  // geglaubt (G-273).
  //
  // `[read]` **Das Verbot dreht sich damit um:** der Knopf MUSS jetzt
  // schreiben koennen. Die Pruefung darauf steht in
  // `plan-lage.test.ts`; hier bleibt, dass er ueberhaupt da ist.
  const s = ohneKommentare('src/app/v2/nutrition/tab-plans.tsx')
  assert.match(s, /New plan/, 'Der Knopf fehlt (G-267).')
  assert.match(s, /setAnlegen\(true\)/,
    'Der Knopf oeffnet das Anlegen-Modal nicht mehr (G-267).')
})

test('G-270: die Kacheln lesen echt, statt eine Marke zu tragen', () => {
  // `[cmd]` **Am 2026-08-29 waren es fuenf Attrappen** — drei unter
  // *Active plan*, zwei unter *Shopping list*. **Am 2026-08-30 sind
  // es null** (dev, alle drei Unterreiter am Schirm gezaehlt).
  //
  // `[read]` **Die erste Fassung dieses Waechters suchte den Satz
  // „fehlen im Schema"** — der steht heute nur noch in einem
  // Dokumentationskommentar. **Ein Waechter, der einen Kommentar
  // findet, prueft nichts**; geprueft wird jetzt, dass die drei
  // Kacheln existieren und aus dem Log lesen.
  const s = ohneKommentare('src/app/v2/nutrition/plans-echt.tsx')
  for (const bauteil of [
    // G-274: `GhostEintraegeEcht` ist entfernt — sie zeigte
    // Log-Zeilen und war damit am ersten Tag leer. Ersetzt durch
    // `PlanEintraegeEcht` (eigene Datei), geprueft in
    // `plan-bestaetigung.test.ts`.
    'LebenszyklusEcht', 'EinhaltungEcht',
    'HerkunftEcht', 'EinkaufslisteEcht',
  ]) {
    assert.match(s, new RegExp(`export function ${bauteil}\\(`),
      `${bauteil} fehlt — die Kachel ist wieder Attrappe (G-270).`)
  }
  // Und der Status kommt aus dem Log, nicht vom Eintrag.
  assert.match(s, /aus meal_plan_logs/,
    'Die Kacheln nennen ihre Quelle nicht (G-270).')
})
