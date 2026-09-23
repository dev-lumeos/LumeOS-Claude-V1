// G-493 — das Hinzufuegen-Modal nachbessern.
//
// **Tom, 2026-09-08, nach dem Benutzen von G-492:** vier Befunde.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const SRC = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
const MESSAGES = path.resolve(SRC, '..', 'messages')

const LISTE = 'app/v2/supplements/tab-produkte.tsx'
const TAFEL = 'app/v2/supplements/produkt-tafel.tsx'
const SUBSTANZ = 'app/v2/supplements/substanz-detail.tsx'
const AKTION = 'app/v2/supplements/produkt-aktion.tsx'
const SCHREIB = 'lib/supplements/stack-write.ts'
const LESEN = 'lib/supplements/stack-read.ts'

test('G-493/A1: das Aktionswort kommt aus messages, nicht als Literal', () => {
  // **Tom:** *„in der auflistung heisst es + Add und aufgeklappt
  // + hinzufuegen"*
  //
  // `[cmd]` **Gemessen 2026-09-22: DREI Literale** (`tab-produkte`,
  // `substanz-detail`, `produkt-tafel`) — **zwei davon `Add`.**
  //
  // `[read]` **Solange das Wort abgeschrieben dasteht, laufen die
  // Orte wieder auseinander.**
  // `[cmd]` **G-493/N5: die TAFEL traegt keinen Knopf mehr** — die
  // Zeile hat ihn schon, und die Tafel klappt direkt darunter auf.
  // **Sie faellt deshalb aus dieser Aufzaehlung.**
  for (const datei of [LISTE, SUBSTANZ]) {
    const q = ohneKommentare(lies(datei))
    assert.match(q, /tA\('hinzufuegen'\)/,
      `${datei}: das Aktionswort kommt nicht aus \`messages/\`.`)
  }
})

test('G-493/N2: die Sprachdatei schreibt Hinzufuegen mit Umlaut', () => {
  // **Tom:** *„buttonbezeichnung unlogisch auf deutsch"*
  //
  // `[cmd]` **Gemessen 2026-09-22: DREI deutsche Werte ohne Umlaut**
  // — *„Supplement hinzufuegen"*, *„Zum Stack hinzufuegen"*,
  // *„Zu {slot} hinzufuegen"* — **neben `Allgemein.hinzufuegen =
  // „Hinzufügen"`.**
  //
  // `[read]` **Der SCHLUESSEL bleibt ASCII** (er steht so im Code),
  // **der angezeigte WERT bekommt den Umlaut.**
  const de = JSON.parse(readFileSync(path.join(MESSAGES, 'de.json'), 'utf8')) as
    Record<string, Record<string, string>>
  for (const [ns, key] of [
    ['Allgemein', 'hinzufuegen'],
    ['Supplements', 'supplementHinzufuegen'],
    ['Supplements', 'zumStackHinzufuegen'],
    ['Nutrition', 'hinzufuegenZu'],
  ]) {
    const wert = de[ns]?.[key]
    assert.ok(typeof wert === 'string', `${ns}.${key} fehlt`)
    assert.doesNotMatch(wert, /hinzufuegen/,
      `${ns}.${key} = \`${wert}\` — deutscher Text mit „ue" statt „ü".`)
    assert.match(wert, /[Hh]inzufügen/, `${ns}.${key} nennt die Aktion nicht`)
  }
})

test('G-493/A1: kein rohes „Add" mehr im echten Teil', () => {
  // `[cmd]` **Die Attrappe (`tabs.tsx`, `DatabaseAttrappe`) bleibt
  // englisch** — sie steht UNTER dem `ReferenzTrenner` und ist die
  // Mockup-Vorlage. `[read]` **Sie zu uebersetzen hiesse, die
  // Referenz zu faelschen.**
  for (const datei of [LISTE, TAFEL, SUBSTANZ]) {
    const q = ohneKommentare(lies(datei))
    assert.doesNotMatch(q, /className="v2-ic v2-ic-sm" \/>Add\b/,
      `${datei}: es steht wieder ein rohes „Add" im Knopf.`)
  }
})

test('G-493/A1: der Schluessel steht in BEIDEN Sprachen', () => {
  // `[read]` **Ein Schluessel ohne Uebersetzung faellt auf den
  // Schluesselnamen zurueck** — und `hinzufuegen` waere ein
  // schlechteres Wort als `Add`.
  for (const [datei, wert] of [['de.json', 'Hinzufügen'], ['en.json', 'Add']]) {
    const j = JSON.parse(readFileSync(path.join(MESSAGES, datei), 'utf8')) as
      Record<string, Record<string, string>>
    assert.equal(j.Allgemein?.hinzufuegen, wert,
      `${datei}: \`Allgemein.hinzufuegen\` fehlt oder lautet anders.`)
  }
})

test('G-493/A3: die neue Mahlzeit benutzt DENSELBEN Weg wie das Diary', () => {
  const q = ohneKommentare(lies(AKTION))
  // `[cmd]` **`mahlzeiten.tsx:583`: `POST /api/nutrition/diary` mit
  // `art: 'mahlzeit'`.** `[read]` **Nicht nachgebaut** — die Lehre
  // aus G-478: zweimal derselbe Rest heisst, den Fehler zweimal zu
  // pflegen.
  assert.match(q, /art: 'mahlzeit'/,
    'Die neue Mahlzeit laeuft nicht ueber den Diary-Weg.')
  // `[cmd]` **Und die Kategorien kommen aus `kategorieAuswahl`** —
  // derselben Funktion. **G-335 hat gemessen, was zwei eigene Listen
  // anrichten:** *„Pre-workout"* gegen *„Vor dem Training"*.
  assert.match(q, /import \{ kategorieAuswahl \}/,
    'Die Kategorien sind nachgebaut statt geteilt.')
  assert.doesNotMatch(q, /pre_workout['"]?\s*:/,
    'Die Kategorien stehen als eigene Liste im Modal.')
})

test('G-493/A2: das Formular traegt Art und Uhrzeit', () => {
  const q = ohneKommentare(lies(AKTION))
  for (const probe of ['neue-mahlzeit-oeffnen', 'neue-art', 'neue-zeit',
    'neue-anlegen']) {
    assert.ok(q.includes(`data-probe="${probe}"`),
      `Dem Formular fehlt \`${probe}\`.`)
  }
})

test('G-493/A5: der Schreibweg kennt supplier_product_id', () => {
  const q = ohneKommentare(lies(SCHREIB))
  // `[cmd]` **C-529 ist live** (gemessen 2026-09-22:
  // `stack_items.supplier_product_id uuid`, nullable).
  //
  // `[cmd]` **Der Ausdruck steht DREIMAL in der Datei**, seit G-489
  // `planVerweisAnlegen` und `planVerweisEinloesen` dazukamen.
  // `[read]` **Eine Zusicherung auf den blossen Text war deshalb zu
  // weit:** die Sabotage am Stack-Insert blieb gruen, weil die
  // Planfunktionen sie weiter erfuellten.
  //
  // `[cmd]` **Geprueft wird der INSERT in `stack_items`** — der
  // Block, um den es geht.
  const i = q.indexOf(".from('stack_items')\n    .insert({")
  assert.ok(i >= 0, 'Der Insert in `stack_items` ist nicht auffindbar.')
  const block = q.slice(i, q.indexOf('.select(', i))
  assert.match(block, /supplier_product_id: eingabe\.supplier_product_id/,
    'Der Insert in `stack_items` schreibt die Produktspalte nicht.')
})

test('G-493/A5: der Leseweg holt die Spalte', () => {
  const q = ohneKommentare(lies(LESEN))
  // `[read]` **Ein Leseweg, der die Spalte nicht holt, macht die
  // Umstellung unpruefbar** — geschrieben und nirgends sichtbar.
  assert.match(q, /supplement_id, supplier_product_id/,
    'Der Leseweg holt `supplier_product_id` nicht.')
})

test('G-493/A6: die Kruecke aus notes ist weg', () => {
  const q = ohneKommentare(lies(AKTION))
  // `[cmd]` **G-484 schrieb `notes: \`Produkt-Id ${produktId}\``** —
  // der Bericht nannte es selbst eine Kruecke.
  //
  // `[read]` **`notes` gehoert dem Nutzer.** `[cmd]` **Gemessen: 9
  // bestehende Zeilen tragen echte Notizen** (*„C-82 Szenario…"*,
  // *„Abends"*) — **und keine einzige eine Produkt-Id.**
  assert.doesNotMatch(q, /notes: `Produkt-Id/,
    'Die Produkt-Id wird wieder in `notes` geschrieben.')
  assert.match(q, /supplier_product_id: produktId/,
    'Der Aufruf setzt die Produktspalte nicht.')
})
