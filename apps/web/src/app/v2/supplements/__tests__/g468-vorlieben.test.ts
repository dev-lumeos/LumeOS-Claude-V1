// G-468 — der Vorlieben-Reiter fuer Supplements.
//
// **Tom, seit fuenf Tagen offen:**
//
// > jedes modul braucht seine preferences
// > supplement wuerde das auch sinn machen fuer: allergien nochmals
// > ausweisen, meine bevorzugten marken verwaltbar machen, etc
//
// `[read]` **Was hier geprueft wird, sind die Zusagen, die still
// kippen koennen** — nicht, dass eine Datei existiert.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  VORGABE, ausJson, gleich, umschalten, wirkungsSatz, formenZurWahl,
} from '../../../../lib/supplements/vorlieben-lage'

const HIER = join(process.cwd(), 'src', 'app', 'v2', 'supplements')
const lies = (n: string) => readFileSync(join(HIER, n), 'utf8')

// ══ DIE REGELN, SERVERFREI ══════════════════════════════════════════

test('A4: `umschalten` sortiert — wie die Datenbank', () => {
  // `[cmd]` **Gemessen im Rumpf von `supplement_preferences_write`:**
  // `SELECT COALESCE(array_agg(value ORDER BY value), '{}')`.
  // `[read]` **Wer hinten anhaengt, bekommt beim naechsten Lesen eine
  // andere Reihenfolge** — und `gleich()` meldete eine Aenderung, wo
  // keine ist. **Dann schriebe jeder Anstrich erneut.**
  assert.deepEqual(umschalten(['B'], 'A'), ['A', 'B'])
  assert.deepEqual(umschalten(['A', 'C'], 'B'), ['A', 'B', 'C'])
  // und zurueck
  assert.deepEqual(umschalten(['A', 'B'], 'A'), ['B'])
})

test('`gleich` sieht eine Reihenfolge als dieselbe Liste NICHT an', () => {
  // `[read]` **Die Zusage ist eng:** gleiche Werte in gleicher
  // Ordnung. `[cmd]` **Deshalb muss `umschalten` sortieren** — die
  // beiden Funktionen haengen zusammen, und diese Probe haelt das
  // fest.
  assert.equal(gleich(
    { ...VORGABE, preferred_brands: ['A', 'B'] },
    { ...VORGABE, preferred_brands: ['B', 'A'] }), false)
  assert.equal(gleich(
    { ...VORGABE, preferred_brands: ['A', 'B'] },
    { ...VORGABE, preferred_brands: ['A', 'B'] }), true)
})

test('`ausJson` prueft jedes Feld einzeln — die Lehre aus G-484', () => {
  // `[read]` **Die RPC gibt `jsonb`** — ein fehlendes Feld ist
  // `undefined`, kein leeres Feld.
  assert.deepEqual(ausJson(null), VORGABE)
  assert.deepEqual(ausJson({}), VORGABE)
  // falsche Typen fallen auf die Vorgabe
  const kaputt = ausJson({
    preferred_brands: 'keine Liste',
    only_on_market: 'ja',
    note: 42,
  })
  assert.deepEqual(kaputt.preferred_brands, [])
  assert.equal(kaputt.only_on_market, true)
  assert.equal(kaputt.note, '')
  // `[cmd]` **Postgres liefert `time` als `HH:MM:SS`** — gezeigt wird
  // `HH:MM`.
  assert.deepEqual(
    ausJson({ preferred_intake_times: ['08:00:00', '20:30:00'] })
      .preferred_intake_times, ['08:00', '20:30'])
  // Leerstellen fallen weg, nicht durch
  assert.deepEqual(
    ausJson({ preferred_brands: ['A', '', '  ', 'B'] }).preferred_brands,
    ['A', 'B'])
})

test('E-72: der Wirkungssatz schweigt nicht, wenn nichts gesetzt ist', () => {
  // `[read]` **Ein benannter Leerhinweis** — eine leere Flaeche sieht
  // aus wie ein Fehler.
  const leer = wirkungsSatz({ ...VORGABE, only_on_market: false })
  assert.match(leer, /Noch nichts gesetzt/)
  assert.match(leer, /zeigt alles/)
})

test('A4: der Wirkungssatz nennt, WAS wirkt — und zaehlt richtig', () => {
  // `[read]` **Eine Vorliebe, die nichts tut, ist eine Attrappe** —
  // der Satz ist die Zusage an den Nutzer, und er muss die Zahl der
  // Marken nennen, nicht „mehrere".
  const eine = wirkungsSatz({ ...VORGABE, preferred_brands: ['A'] })
  assert.match(eine, /deine Marke steht oben/)
  const drei = wirkungsSatz({
    ...VORGABE, preferred_brands: ['A', 'B', 'C'] })
  assert.match(drei, /deine 3 Marken stehen oben/)
  // `[read]` **Und der Satz nennt den ORT** — sonst weiss niemand, wo
  // er nachsehen soll.
  assert.match(drei, /Produkte-Reiter/)
})

test('G-335: die Formen kommen aus FORMEN, nicht aus einer zweiten Liste', () => {
  const f = formenZurWahl()
  assert.ok(f.length > 0, 'keine Form zur Wahl')
  // `[read]` **`Unknown` steht nicht zur Wahl** — eine Vorliebe fuer
  // *„unbekannt"* ist keine Aussage darueber, was man einnehmen will.
  assert.equal(f.some(x => x.code.startsWith('Unknown')), false)
  // `[cmd]` **Die Zahlen kommen mit** — eine eigene Liste haette
  // keine. `[read]` **Die Felder heissen `onMarket` und `alle`**
  // (`produkt-etikett.ts:183`), nicht `anzahl` — **hier stand der
  // geratene Name, und die Probe fiel zu Recht.**
  assert.ok(f.every(x => typeof x.onMarket === 'number'))
  assert.ok(f.every(x => typeof x.alle === 'number' && x.alle > 0))
})

// ══ E-84: EIN SPEICHER, ZWEI FLAECHEN ═══════════════════════════════

test('E-84/A3: die Allergien werden GEZEIGT, nicht kopiert', () => {
  const q = lies('tab-vorlieben.tsx')
  // `[read]` **Dieselbe Kachel wie in Settings** — nicht nachgebaut.
  assert.match(q, /import \{ AllergienKachel \} from '\.\.\/settings\/allergien-kachel'/,
    'die geteilte Kachel wird nicht benutzt')
  assert.match(q, /<AllergienKachel/, 'die Kachel steht nicht im Reiter')
  // `[cmd]` **Und KEIN eigener Schreibweg fuer Allergien** — sonst
  // waeren es zwei Wahrheiten.
  //
  // `[cmd]` **Hier stand `/user_allergies/` auf dem ganzen Quelltext**
  // — und die Probe fiel an den eigenen KOMMENTAREN, die die Tabelle
  // nennen (Zeile 32 und 61). `[read]` **Ein Waechter, der seine
  // eigene Begruendung liest, misst nicht die Sache.**
  //
  // `[read]` **Gemeint ist der ZUGRIFF**, nicht das Wort: ein Import
  // eines Schreibwegs oder ein eigener `.from(...)`.
  const ohneKommentare = q
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*(\/\/|\*)/.test(z)).join('\n')
  assert.equal(/user_allergies/.test(ohneKommentare), false,
    'der Reiter fasst die Allergietabelle selbst an')
  assert.equal(/allergie-aktionen/.test(ohneKommentare), false,
    'der Reiter schreibt Allergien an der Kachel vorbei')
})

test('A4: der Reiter schreibt unter der Quelle, die der CHECK erlaubt', () => {
  const q = lies('vorlieben-aktionen.ts')
  // `[cmd]` **Gemessen im Rumpf:** `IF p_source NOT IN
  // ('supplement_preferences', 'settings') THEN RAISE EXCEPTION`.
  // `[read]` **Ein anderer Wert faellt erst zur Laufzeit auf.**
  //
  // ══ WARUM OHNE KOMMENTARE ═══════════════════════════════════════
  //
  // `[cmd]` **Die Sabotageprobe blieb hier GRUEN** — der Quelltext
  // nennt beide erlaubten Quellen in seinem eigenen Kommentar, und
  // `/p_source: 'supplement_preferences'/` traf den Kommentar auch
  // dann noch, als der CODE `'settings'` schickte.
  //
  // `[read]` **Ein Waechter, der die Begruendung mitliest, misst
  // nicht die Sache** — dieselbe Falle wie bei den Allergien oben.
  const code = q
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*(\/\/|\*)/.test(z)).join('\n')
  assert.match(code, /p_source: 'supplement_preferences'/)
  assert.equal(/p_source: 'settings'/.test(code), false,
    'der Reiter schreibt unter der Quelle von Settings')
  // `[read]` **Alle sechs Felder** — die Funktion fuehrt je Feld mit
  // COALESCE zusammen, und was fehlt, bliebe auf dem alten Wert
  // stehen. `[cmd]` **Ein entfernter Eintrag muss als leere Liste
  // ankommen**, sonst laesst er sich nie loeschen.
  for (const feld of ['preferred_brands', 'avoided_ingredients',
    'only_on_market', 'preferred_forms', 'preferred_intake_times', 'note']) {
    assert.match(q, new RegExp(`${feld}: stand\\.${feld}`),
      `${feld} wird nicht mitgeschickt`)
  }
})

test('A4: die Vorlieben erreichen die Produktsuche', () => {
  const q = lies('tab-produkte.tsx')
  // `[cmd]` **Gemessen 2026-09-24: VORHER 121.959, NACHHER 8.069**
  // (zwei Marken: 4.050 + 4.019). `[read]` **Ohne diesen Leseweg
  // waere der Reiter eine Flaeche ohne Wirkung.**
  assert.match(q, /fetch\('\/api\/supplements\/vorlieben'\)/,
    'der Produkte-Reiter liest die Vorlieben nicht')
  assert.match(q, /setGewaehlteMarken\(jV\.preferred_brands\)/,
    'die bevorzugten Marken werden nicht gesetzt')
})

test('A4: der SITZUNGSFILTER schlaegt die Vorlieben — und zwar an `gespeichert`', () => {
  const q = lies('tab-produkte.tsx')
  // ══ WARUM DIESE PROBE ═══════════════════════════════════════════
  //
  // `[cmd]` **Gemessen in `ladeProduktFilter` (`produkt-filter-read.ts`):
  // ohne Zeile kommt `{ filter: VORGABE, gespeichert: false }`
  // zurueck — NIE `filter: null`.** `[read]` **Eine Pruefung auf
  // `filter != null` waere IMMER wahr**, die Vorlieben kaemen nie zum
  // Zug, **und A4 waere gebaut und unwirksam.**
  //
  // `[read]` **Genau das stand hier im ersten Anlauf.**
  assert.match(q, /jF\.gespeichert === true/,
    'die Rangfolge haengt nicht am Merkmal `gespeichert`')
})

test('E-84: eine Vorliebe wird NICHT als Sitzungsfilter gespeichert', () => {
  const q = lies('tab-produkte.tsx')
  // ══ ZWEI SPEICHER, ZWEI BEDEUTUNGEN ═════════════════════════════
  //
  //     C-504 user_display_preferences   was ich JETZT ansehe
  //     C-511 supplement_preferences     was ich ALLGEMEIN will
  //
  // `[cmd]` **Gemessen: ohne diese Sperre wurden die aus den
  // Vorlieben gesetzten Marken sofort als Filter gespeichert** — und
  // ein *„Zuruecksetzen"* loeschte danach die Wirkung der Vorlieben.
  // `[read]` **Dann waeren es wieder zwei Wahrheiten.**
  assert.match(q, /ausVorliebe\.current = true/,
    'die Vorliebe markiert ihren Lauf nicht')
  assert.match(q, /if \(ausVorliebe\.current\) \{ ausVorliebe\.current = false; return \}/,
    'der Speichereffekt ueberspringt den Vorliebenlauf nicht')
})

test('A4: die gemiedenen Stoffe aus C-511 werden GELESEN', () => {
  const q = readFileSync(join(process.cwd(), 'src', 'lib', 'supplements',
    'produkt-daumen.ts'), 'utf8')
  // `[cmd]` **Gemessen 2026-09-24: die Meidestoffe kamen NUR aus
  // `nutrition.food_preference_items`** — der Reiter schrieb
  // `avoided_ingredients` nach C-511, und niemand las das Feld.
  // `[read]` **Eine Vorliebe, die nichts tut, sieht aus wie eine
  // Zusage.**
  assert.match(q, /ladeVorlieben/, 'die C-511-Stoffe werden nicht gelesen')
  assert.match(q, /stand\.avoided_ingredients/,
    'das Feld wird nicht ausgewertet')
})

test('A1: der Reiter haengt in der Leiste und traegt seine Marke', () => {
  const a = lies('ansicht.tsx')
  assert.match(a, /id: 'prefs'/, 'der Reiter steht nicht in der Leiste')
  assert.match(a, /tab === 'prefs' && \(/, 'der Reiter wird nicht gezeigt')
  assert.match(lies('tab-vorlieben.tsx'), /data-probe="supp-vorlieben"/)
})
