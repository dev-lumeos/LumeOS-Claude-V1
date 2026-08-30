// G-272 / G-266: das Erfassungsmodal und der Weg hin und zurueck.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { mahlzeitZurZeit } from '../../../app/v2/nutrition/erfassen-modal'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const MODAL = 'src/app/v2/nutrition/erfassen-modal.tsx'
const FOODS = 'src/app/v2/nutrition/tab-foods.tsx'
const SUCHE = 'src/app/v2/nutrition/suche/ansicht.tsx'

// ── G-272: das Modal schreibt ueber den vorhandenen Weg ──────────

test('G-272: das Modal ruft den vorhandenen Schreibweg', () => {
  // `[cmd]` **Gemessen am 2026-08-30, VOR jeder Zeile Code:**
  // `diary-write.ts` fuehrt `createMeal`, `addMealItem` und fuenf
  // weitere, dazu die Route `/api/nutrition/diary`. **Nichts musste
  // gebaut werden, nur gerufen** — die Warnung aus G-138 traf zu.
  const s = ohneKommentare(MODAL)
  assert.match(s, /\/api\/nutrition\/diary/,
    'Das Modal benutzt die vorhandene Route nicht (G-272).')
  assert.match(s, /art: 'mahlzeit'/, 'Die Mahlzeit wird nicht angelegt (G-272).')
  assert.match(s, /art: 'position'/, 'Die Position wird nicht geschrieben (G-272).')
})

test('G-272: keine zweite Schreibstelle und keine zweite Suche', () => {
  // `[read]` **Das Modal ergaenzt zwei Felder, es baut nichts nach.**
  // Eine eigene Suche oder ein eigener Supabase-Aufruf waeren die
  // zweite Ansicht, die dreimal wieder ausgebaut werden musste.
  const s = ohneKommentare(MODAL)
  assert.doesNotMatch(s, /createSessionClient|\.from\(/,
    'Das Modal greift an der Route vorbei auf die Datenbank zu (G-272).')
  assert.doesNotMatch(s, /api\/nutrition\/foods/,
    'Das Modal sucht selbst — das tut bereits die Trefferliste (G-272).')
})

test('G-272: die drei Portionsfelder gehen zusammen oder gar nicht', () => {
  // `[cmd]` **Der CHECK in 058a verlangt es:** entweder alle drei
  // (`portion_name`, `portion_quantity`, `portion_amount_g`) oder
  // keines. `[read]` Bei direkter Grammeingabe bleiben sie leer.
  const s = ohneKommentare(MODAL)
  const block = /const portionsfelder = [\s\S]{0,220}?\}\s*:\s*\{\}/.exec(s)
  assert.ok(block, 'Die Portionsfelder werden nicht als Einheit gesetzt (G-272).')
  for (const feld of ['portion_name', 'portion_quantity', 'portion_amount_g']) {
    assert.ok(block[0].includes(feld), `${feld} fehlt in der Gruppe (G-272).`)
  }
})

test('G-272: ohne Tag wird nicht geschrieben', () => {
  // `[read]` **Ein Ersatzwert („heute") waere eine zweite Wahrheit**
  // neben dem Datumswaehler im Kopf. Ohne Tag bleibt der Knopf stumm.
  const s = ohneKommentare(FOODS)
  assert.match(s, /\{erfassen && datum && \(/,
    'Das Modal oeffnet auch ohne Datum (G-272).')
  assert.doesNotMatch(s, /datum\s*\?\?\s*new Date\(\)/,
    'Der Tag wird geraten statt uebergeben (G-272).')
})

test('G-272: die Mahlzeit wird vorgeschlagen, nicht festgelegt', () => {
  // `[read]` Ein Vorschlag spart den haeufigsten Klick; eine
  // Festlegung naehme die Wahl.
  assert.equal(mahlzeitZurZeit(7), 'breakfast')
  assert.equal(mahlzeitZurZeit(12), 'lunch')
  assert.equal(mahlzeitZurZeit(19), 'dinner')
  assert.equal(mahlzeitZurZeit(23), 'snack')
  // Und die Grenzen liegen dort, wo sie gemeint sind.
  assert.equal(mahlzeitZurZeit(9), 'breakfast')
  assert.equal(mahlzeitZurZeit(10), 'lunch')
  assert.equal(mahlzeitZurZeit(14), 'lunch')
  assert.equal(mahlzeitZurZeit(15), 'dinner')
  assert.equal(mahlzeitZurZeit(20), 'dinner')
  assert.equal(mahlzeitZurZeit(21), 'snack')
})

test('G-272: Add ist ein Knopf, kein Verweis', () => {
  // **Tom:** *„food db +add falsches modal"*. `[cmd]` Bis G-265 fuehrte
  // er auf eine leere Seite, seit G-265 auf eine gefuellte — **beides
  // ist nicht, was „Add" verspricht.**
  const s = ohneKommentare(FOODS)
  const zelle = /<div style=\{\{ display: 'flex', gap: 4, justifyContent: 'flex-end' \}\}>[\s\S]*?<\/div>/
    .exec(s)
  assert.ok(zelle, 'Die Aktionszelle wurde nicht gefunden (G-272).')
  // `[read]` **Wirkung, nicht Wort.** Eine erste Fassung suchte nur
  // `setErfassen(` — eine Sabotage mit `undefined && setErfassen({…})`
  // ueberlebte das: der Name stand noch da, der Aufruf lief nie.
  assert.match(zelle[0], /onClick=\{\(\) => setErfassen\(\{/,
    'Add oeffnet das Erfassungsmodal nicht direkt (G-272).')
  assert.doesNotMatch(zelle[0], /onClick=\{\(\) => (undefined|false|null|void 0)\s*&&/,
    'Der Klickgriff ist stillgelegt (G-272).')
  // Die Lupe daneben bleibt ein Verweis — sie zeigt, sie erfasst nicht.
  assert.match(zelle[0], /\/v2\/nutrition\/suche\?food=/,
    'Der Verweis auf die Naehrwerte fehlt (G-272).')
})

// ── G-266 / E-33: der Zustand wandert in beide Richtungen ────────

test('G-266: der Rueckweg existiert und nimmt den Begriff mit', () => {
  // `[cmd]` **Gemessen am 2026-08-30:** Food DB („reis", 50 Zeilen)
  // -> Lupe -> Detailseite (Feld „Reis poliert, roh") -> zurueck ->
  // **Feld „Reis poliert, roh", 3 Zeilen.**
  const s = ohneKommentare(SUCHE)
  assert.match(s, /Zurück zur Food DB/,
    'Der Rueckweg fehlt (G-266).')
  assert.match(s, /tab=foods&q=\$\{encodeURIComponent\(eingabe\.trim\(\)\)\}/,
    'Der Rueckweg nimmt den Suchbegriff nicht mit (G-266).')
})

test('G-266: ohne Begriff kein leeres q am Rueckweg', () => {
  // `[read]` `?q=` ohne Wert wuerde im Reiter eine leere Suche
  // ausloesen und die Anfangstreffer verwerfen.
  const s = ohneKommentare(SUCHE)
  assert.match(s, /eingabe\.trim\(\)\s*\n?\s*\?/,
    'Der leere Fall wird nicht unterschieden (G-266).')
  assert.match(s, /'\/v2\/nutrition\?tab=foods'/,
    'Ohne Begriff fehlt der schlichte Verweis (G-266).')
})

test('G-266: der Reiter liest den Begriff aus der Adresse', () => {
  const s = ohneKommentare(FOODS)
  assert.match(s, /new URLSearchParams\(window\.location\.search\)\.get\('q'\)/,
    'Der Reiter liest den Begriff nicht (G-266).')
})

test('G-266: mit Begriff laeuft die Suche sofort', () => {
  // `[read]` **Sonst stuende das Wort im Feld und die Liste zeigte
  // etwas anderes** — der erste Lauf wird sonst uebersprungen, weil
  // `start` die Anfangstreffer mitbringt.
  const s = ohneKommentare(FOODS)
  assert.match(s, /React\.useRef\(suche\.trim\(\)\.length === 0\)/,
    'Der erste Lauf wird auch mit Begriff uebersprungen (G-266).')
})
