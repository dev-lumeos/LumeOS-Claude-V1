// G-494 — die Form-Nachlese aus G-492 ist entfernt.
//
// `[cmd]` **C-520 ist live** — selbst gemessen 2026-09-23:
//
//     pg_get_function_result(search_supplier_products)
//     -> TABLE(…, gtin text, produktform text, similarity real, …)
//
// `[cmd]` **BEIDE Signaturen geben sie zurueck** — auch die alte mit
// Vorgabewerten, die dieser Leseweg ruft (vier benannte Argumente).
//
// `[read]` **Die Nachlese stand mit ihrem eigenen Ablaufdatum im
// Kopf:** *„Zu entfernen, sobald C-520 `produktform` zurueckgibt."*
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const SRC = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

const LESEN = 'lib/supplements/produkte-read.ts'

test('G-494/A1: die Nachlese ist weg', () => {
  const q = ohneKommentare(lies(LESEN))
  // `[read]` **Kein Rueckfall bleibt stehen** (G-163): eine zweite
  // Quelle fuer dieselbe Spalte laedt dazu ein, die eine zu aendern
  // und die andere zu vergessen.
  assert.doesNotMatch(q, /async function formNachlesen/,
    'Die Nachlese steht wieder im Leseweg.')
  assert.doesNotMatch(q, /await formNachlesen\(/,
    'Der Leseweg ruft die Nachlese wieder.')
  assert.doesNotMatch(q, /NACHLESE_STUECK/,
    'Die Stueckelung der Nachlese steht wieder da.')
})

test('G-494: die Form kommt aus der Antwort, nicht aus einer zweiten Abfrage', () => {
  const q = ohneKommentare(lies(LESEN))
  // `[cmd]` **`zeileAus` liest `r.produktform`** — dieselbe Zeile,
  // die vor C-520 immer `null` ergab.
  assert.match(q, /produktform: s\(r\.produktform\)/,
    'Der Zeilenbauer liest `produktform` nicht aus der Antwort.')
  // `[read]` **Und es gibt KEINE zweite Abfrage auf
  // `supplier_products`, die nur die Form holt.**
  assert.doesNotMatch(q, /\.select\('id,produktform'\)/,
    'Es gibt wieder eine Extraabfrage nur fuer die Form.')
})

test('G-494: der Smartweg ruft die Funktion mit vier Argumenten', () => {
  const q = ohneKommentare(lies(LESEN))
  // `[cmd]` **Die NEUE Signatur mit `p_formen` hat KEINE
  // Vorgabewerte** — ein Aufruf mit vier Argumenten faende sie
  // nicht (*„function does not exist"*). `[read]` **Die alte
  // liefert `produktform` ebenfalls, also bleibt der Aufruf, wie er
  // ist.**
  const i = q.indexOf("rpc('search_supplier_products'")
  assert.ok(i > 0, 'Der Smartweg ruft die Suchfunktion nicht.')
  const block = q.slice(i, q.indexOf('})', i))
  assert.match(block, /p_query:/, 'Der Aufruf nennt `p_query` nicht.')
  assert.doesNotMatch(block, /p_formen:/,
    'Der Aufruf nennt `p_formen` — diese Signatur hat keine Vorgabewerte.')
})
