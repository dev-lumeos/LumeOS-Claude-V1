// G-485 — kein Leseweg fragt eine entfernte Spalte ab.
//
// **Tom, 2026-09-19:** *„wieso sehe ich keine meals mehr in diary?
// Tagebuch nicht lesbar — column meal_items.supplement_serving_size
// does not exist"*
//
// ══ WARUM DAS EIN EIGENER WAECHTER IST ══════════════════════════════
//
// `[read]` **Ein `.select()`, das EINE entfernte Spalte nennt, laesst
// JEDE Zeile scheitern** — nicht nur die betroffene. **Das Tagebuch
// war komplett leer, obwohl nur ein Posten von vier ein Supplement
// war.**
//
// `[cmd]` **Der Kommentar im Code wusste es:** *„C-519 entfernt
// `supplement_serving_size` …"* — **und die Abfrage stand zwei Zeilen
// darunter.** `[read]` **Ein Waechter liest keine Kommentare.**
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const SRC = path.resolve(__dirname, '..', '..', '..')

/**
 * Die Spalten, die C-519 aus `nutrition.meal_items` entfernt hat.
 *
 * `[cmd]` **Gemessen am 2026-09-19:** `information_schema.columns`
 * kennt fuer `meal_items` nur noch `supplement_intake_log_id`.
 */
const ENTFERNT = [
  'supplement_product_id',
  'supplement_serving_size',
  'supplement_serving_quantity',
  'supplement_nutrient_status',
] as const

/** Alle .ts/.tsx unter apps/web/src, ohne Tests. */
function alleQuellen(verzeichnis: string): string[] {
  const aus: string[] = []
  for (const e of readdirSync(verzeichnis, { withFileTypes: true })) {
    const p = path.join(verzeichnis, e.name)
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue
      aus.push(...alleQuellen(p))
    } else if (/\.tsx?$/.test(e.name)) {
      aus.push(p)
    }
  }
  return aus
}

/**
 * Die Spaltenliste eines `.select('…')` — nur der Inhalt der
 * Zeichenkette.
 *
 * `[read]` **Nur `.select()` und `.in()`/`.eq()` zaehlen** — ein
 * Feldname in einem TypeScript-Objekt ist harmlos, er wird nie zur
 * Adresse. **Der Unterschied ist der ganze Punkt:** `mahlzeiten.tsx`
 * darf `it.supplement_serving_size` lesen, solange der Leseweg das
 * Feld fuellt.
 */
function abfragen(quelle: string): string[] {
  const aus: string[] = []
  for (const m of Array.from(quelle.matchAll(/\.select\(\s*(['"`])([\s\S]*?)\1/g))) {
    aus.push(m[2])
  }
  for (const m of Array.from(quelle.matchAll(/\.(?:eq|in|order|filter)\(\s*(['"`])([^'"`]*)\1/g))) {
    aus.push(m[2])
  }
  // ══ Die Luecke, die die Sabotageprobe gefunden hat ═══════════════
  //
  // `[cmd]` **Der erste Entwurf las nur `.select('…')` mit einer
  // Zeichenkette IM Aufruf.** `[read]` **Die Spaltenliste steht hier
  // aber in einer KONSTANTEN** (`const SPALTEN = '…'`), und
  // `.select(SPALTEN)` traegt kein Literal.
  //
  // `[cmd]` **Drei Sabotagen blieben deshalb gruen — darunter genau
  // die, die Tom getroffen hat.** `[read]` **Ein Waechter, der den
  // einen Fall nicht faengt, fuer den er geschrieben wurde, ist
  // schlimmer als keiner.**
  //
  // `[read]` **Deshalb zaehlt JEDE einfache Zeichenkette der Datei**
  // — eine Spaltenliste ist eine, egal ob sie im Aufruf steht oder in
  // einer Konstanten. `[cmd]` **Ein engeres Muster hat die Liste
  // `const SPALTEN = '…'` nicht erwischt** (gemessen: null Treffer),
  // und damit blieb die Sabotage gruen.
  for (const m of Array.from(quelle.matchAll(/'([^'\n]{20,})'/g))) {
    aus.push(m[1])
  }
  return aus
}

test('G-485/A5: keine Abfrage nennt eine entfernte Spalte', () => {
  const treffer: string[] = []
  for (const datei of alleQuellen(SRC)) {
    const quelle = readFileSync(datei, 'utf8')
    for (const a of abfragen(quelle)) {
      for (const spalte of ENTFERNT) {
        // `[cmd]` **Wortgrenze** — `supplement_product_id` kommt in
        // `food_preference_items` weiterhin vor (C-497), dort ist die
        // Spalte NICHT entfernt. `[read]` **Deshalb zaehlt nur, wer
        // `meal_items` abfragt.**
        if (!a.includes(spalte)) continue
        if (!/meal_items/.test(quelle)) continue
        treffer.push(`${path.relative(SRC, datei)}: ${spalte}`)
      }
    }
  }
  assert.deepEqual(treffer, [],
    'diese Abfragen nennen eine Spalte, die C-519 entfernt hat — '
    + 'eine einzige laesst JEDE Zeile scheitern')
})

test('G-485/A4: der Leseweg nimmt den Verweis', () => {
  const w = readFileSync(path.join(SRC, 'lib', 'nutrition', 'diary-write.ts'), 'utf8')
  // `[cmd]` **Der Verweis muss in der SPALTENLISTE stehen**, nicht
  // nur irgendwo in der Datei — sonst zaehlt ein Kommentar mit.
  const liste = (w.match(/\.select\('([^']*supplement_intake_log_id[^']*)'\)/) ?? [])[1] ?? ''
  assert.match(liste, /supplement_intake_log_id/,
    'der Verweis fehlt in der Spaltenliste — dann findet der Leseweg '
    + 'die Einnahme nie, und die Supplementzeile bleibt ohne Portion')
  // `[cmd]` **G-485/G-138: der Zugriff liegt in `stack-write.ts`** —
  // genau EINE Datei fasst `intake_logs` an, und der Waechter dort
  // prueft die Datei, nicht die Zeile.
  assert.match(w, /einnahmenZuPosten/,
    'die Einnahmen werden nicht nachgelesen')
  const sw = readFileSync(
    path.join(SRC, 'lib', 'supplements', 'stack-write.ts'), 'utf8')
  assert.match(sw, /supplement_name_snapshot/,
    'der Nachleseweg holt den Namen nicht — dann faellt die '
    + 'Supplementzeile aus dem Tagebuch')
  // `[cmd]` **Keine Einbettung** — der Fremdschluessel zeigt nach
  // `supplements.intake_logs`, und PostgREST bettet nur innerhalb des
  // angefragten Schemas ein (gemessen 2026-09-19).
  assert.doesNotMatch(w, /intake_logs!left|intake_logs!inner/,
    'eine schema-uebergreifende Einbettung kann PostgREST nicht aufloesen')
})

test('G-485: der Leser verwirft keine Zeile ohne food_name', () => {
  // `[cmd]` **C-519 hat `food_name` nullable gemacht** — der Name
  // steht in `intake_logs.supplement_name_snapshot`.
  //
  // `[read]` **Die Pflichtpruefung warf die Zeile weg, BEVOR der Name
  // aus der Einnahme gelesen wurde** — 438 statt 557,5 kcal, ohne
  // Meldung.
  const m = readFileSync(path.join(SRC, 'lib', 'nutrition', 'diary-model.ts'), 'utf8')
  assert.doesNotMatch(m, /typeof record\.food_name !== 'string' *\n? *\) *\{/,
    'ein NULL-Name verwirft die Supplementzeile wieder')
  assert.match(m, /supplement_name_snapshot/,
    'der Name wird nicht aus der Einnahme gelesen')
  assert.match(m, /ausSchnappschuss/,
    'die Naehrwerte werden nicht aus dem Schnappschuss gelesen')
})

test('G-485: kein Rueckfall auf das alte Schema mehr', () => {
  // `[read]` **Der Rueckfall aus G-481 hat den Fehler nicht
  // abgefedert, sondern verdeckt** — die Meldung beim Nutzer kam vom
  // ALTEN Weg. `[cmd]` **C-519 ist eingespielt; es gibt kein Zurueck.**
  // `[cmd]` **Ohne Kommentare pruefen** — die Begruendung DARF den
  // alten Namen nennen, der Code nicht. `[read]` **Sonst prueft der
  // Waechter die Erzaehlung statt der Sache** (G-472).
  const ohneKommentare = (q: string) => q
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
  const w = ohneKommentare(
    readFileSync(path.join(SRC, 'lib', 'nutrition', 'diary-write.ts'), 'utf8'))
  assert.doesNotMatch(w, /SPALTEN_ALT|ohneC519/,
    'der Leseweg haelt noch einen Weg auf das alte Schema offen')
  const r = ohneKommentare(
    readFileSync(path.join(SRC, 'lib', 'nutrition', 'supplement-posten-read.ts'), 'utf8'))
  assert.doesNotMatch(r, /legeAltenPostenAn/,
    'der Schreibweg haelt noch einen Weg auf das alte Schema offen')
})
