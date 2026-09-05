/**
 * G-340 — Quick-Add: eine Zahl ohne Lebensmittel.
 *
 * **Tom, 2026-09-02:** *„Quick-Add bauen."*
 *
 * `[cmd]` **Gemessen vor dem Bau, 2026-09-05:** alle 9.051
 * `meal_items` tragen `food_source = 'bls'`. **`manual` sieht das
 * Schema vor und niemand bediente es.**
 *
 * `[cmd]` **Und der Knopf schrieb nicht** — er war ein
 * `InEntwicklungKnopf`.
 *
 * ── Die zwei Fragen, die der Auftrag zu MESSEN gab ──────────────────
 *
 * `[cmd]` **`amount_g`:** die Spalte ist NOT NULL, der CHECK verlangt
 * `> 0`. **Sie wird NICHT zum Hochrechnen benutzt** — `059b` liest die
 * eingefrorenen Spalten direkt. **Aber sie faellt in die Grammsumme
 * des Tages** (`mahlzeiten.tsx:725`), und Tom zu dieser Zeile (G-330):
 * *„eine Angabe, die man direkt nachwiegen kann."*
 * **Also: Eingabefeld, und ohne Angabe `1`** — der kleinste erlaubte
 * Wert, die kleinste Verschiebung. **Geraten wird nichts.**
 *
 * `[cmd]` **`nutrients`:** `059b` Zeile 94-96 schliesst die neun
 * Spaltencodes aus dem jsonb-Zweig AUSDRUECKLICH aus
 * (`WHERE kv.key NOT IN ('ENERCC','PROT625',…)`). **Die Eingaben
 * gehoeren in die Spalten; im jsonb wuerden sie ignoriert.**
 * **Also: `{}`** — und das heisst genau das Richtige: fuer die
 * uebrigen Codes gibt es keine Messung.
 *
 * ── Am lebenden Schema geprueft ─────────────────────────────────────
 *
 * `[cmd]` **Buehne auf `test-user@lumeos.local`** (leer, 0/0), **nicht
 * auf dev** — der Auftrag verbietet es. **Gezaehlt zurueckgebaut:
 * 1 Posten, 1 Mahlzeit, Endstand wieder 0 | 0.**
 *
 *     geschrieben    food_source 'manual', amount_g 1, nutrients {}
 *     CHECK          'manual' MIT food_id  -> abgewiesen
 *     CHECK          amount_g = 0          -> abgewiesen
 *     Tagessumme     ENERCC 450
 *     Ehrlichkeit    PROT625 missing_count 1, days_with_value 0
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import {
  buildManualItemInsert, manualItemCreateSchema,
} from '../diary-model'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// gruen aus der Wurzel und rot im Gate (G-291, A-63).
const WURZEL = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const MODALE = 'apps/web/src/app/v2/nutrition/modale.tsx'
const ROUTE = 'apps/web/src/app/api/nutrition/diary/route.ts'
const WRITE = 'apps/web/src/lib/nutrition/diary-write.ts'

const MAHLZEIT = '11111111-2222-3333-4444-555555555555'

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [MODALE, ROUTE, WRITE]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1 · Der CHECK, in der Anwendung nachgebaut ═══════════════════════

test('G-340: ein manueller Posten traegt WEDER food_id NOCH custom_food_id', () => {
  // `[cmd]` **`meal_items_source_target_check`:**
  //     food_source = 'manual' AND food_id IS NULL
  //                            AND custom_food_id IS NULL
  //
  // `[read]` **Die Wirkung, nicht das Wort:** beide Felder MUESSEN
  // `null` sein. **Stuende dort etwas, wiese die Datenbank die Zeile
  // ab** — gemessen am 2026-09-05 auf `test-user`.
  const z = buildManualItemInsert('u-1', {
    meal_id: MAHLZEIT, food_name: 'Pasta im Ristorante', enercc: 450,
  })
  assert.equal(z.food_source, 'manual')
  assert.equal(z.food_id, null, 'food_id ist gesetzt — der CHECK weist die Zeile ab')
  assert.equal(z.custom_food_id, null,
    'custom_food_id ist gesetzt — das waere Flow 6, nicht Quick-Add')
  assert.equal(z.measurement_source, 'manual')
})

// ══ 2 · amount_g: gemessen, nicht geraten ════════════════════════════

test('G-340: ohne Gewichtsangabe steht 1 — der kleinste erlaubte Wert', () => {
  // `[cmd]` **Der CHECK verlangt `amount_g > 0`** — 0 ist unmoeglich,
  // `null` auch (NOT NULL).
  //
  // `[read]` **Und geraten wird nicht:** ein Restaurantteller mit
  // „450 kcal" wiegt weder 450 g noch 100 g. **Jede erfundene Zahl
  // waere eine Behauptung ueber etwas Ungewogenes** — und sie faellt
  // in die Grammsumme, die man laut Tom „direkt nachwiegen" koennen
  // soll.
  const ohne = buildManualItemInsert('u-1', {
    meal_id: MAHLZEIT, food_name: 'Pasta', enercc: 450,
  })
  assert.equal(ohne.amount_g, 1,
    'ohne Angabe steht nicht 1 — dann ist eine Zahl geraten oder der CHECK bricht')

  // `[read]` **Wer das Gewicht kennt, gibt es an** — dann gilt es.
  const mit = buildManualItemInsert('u-1', {
    meal_id: MAHLZEIT, food_name: 'Pasta', enercc: 450, amount_g: 380,
  })
  assert.equal(mit.amount_g, 380, 'die Angabe des Nutzers wird ueberschrieben')

  // `[cmd]` **Und die Eingabe ist gegen den CHECK gesichert.**
  assert.ok(!manualItemCreateSchema.safeParse({
    meal_id: MAHLZEIT, food_name: 'x', enercc: 1, amount_g: 0,
  }).success, 'amount_g = 0 kommt durch — die Datenbank weist es ab')
})

// ══ 3 · nutrients: leer, und das ist die Aussage ═════════════════════

test('G-340: nutrients bleibt leer — die Eingaben stehen in den Spalten', () => {
  // `[cmd]` **`059b` liest den jsonb NUR fuer Codes ausserhalb der
  // neun Spalten** (Zeile 94-96). **Die Makros dort einzutragen
  // waere wirkungslos** — und ein Wert, den niemand liest, ist eine
  // zweite Wahrheit.
  const z = buildManualItemInsert('u-1', {
    meal_id: MAHLZEIT, food_name: 'Pasta', enercc: 450,
    prot625: 20, fat: 12, cho: 55,
  })
  assert.deepEqual(z.nutrients, {},
    'nutrients traegt Werte — 059b liest sie fuer diese Codes nicht')
  // Die Wirkung: die Zahlen stehen in den SPALTEN.
  assert.equal(z.enercc, 450)
  assert.equal(z.prot625, 20)
  assert.equal(z.fat, 12)
  assert.equal(z.cho, 55)
})

test('G-340: ein nicht angegebenes Makro wird null, nicht 0', () => {
  // `[read]` **C-48 Regel 1:** wer kein Protein angibt, sagt nicht
  // „null Gramm", sondern „ich weiss es nicht".
  //
  // `[cmd]` **Der Unterschied ist messbar:** `0` zaehlt als Wert und
  // machte den Tag *vollstaendig*; `null` laesst ihn unvollstaendig —
  // **gemessen auf test-user: `PROT625 missing_count 1`,
  // `days_with_value 0`.**
  const z = buildManualItemInsert('u-1', {
    meal_id: MAHLZEIT, food_name: 'Pasta', enercc: 450,
  })
  assert.equal(z.prot625, null, 'ein fehlendes Makro wird zu 0 — das waere erfunden')
  assert.equal(z.fat, null)
  assert.equal(z.cho, null)

  // `[read]` **Eine echte Null bleibt aber eine Null** — wer 0 g Fett
  // eintraegt, sagt etwas.
  const null_g = buildManualItemInsert('u-1', {
    meal_id: MAHLZEIT, food_name: 'Pasta', enercc: 450, fat: 0,
  })
  assert.equal(null_g.fat, 0, 'eine eingegebene Null wird verworfen')
})

// ══ 4 · Der Vertrag ══════════════════════════════════════════════════

test('G-340: Name und Kalorien sind Pflicht, die Makros nicht', () => {
  const gut = manualItemCreateSchema.safeParse({
    meal_id: MAHLZEIT, food_name: 'Pasta', enercc: 450,
  })
  assert.ok(gut.success, 'der Mindestfall wird abgewiesen')

  for (const [was, eingabe] of [
    ['ohne Namen', { meal_id: MAHLZEIT, food_name: '', enercc: 450 }],
    ['ohne kcal', { meal_id: MAHLZEIT, food_name: 'Pasta' }],
    ['negative kcal', { meal_id: MAHLZEIT, food_name: 'Pasta', enercc: -1 }],
    ['meal_id keine UUID', { meal_id: 'x', food_name: 'Pasta', enercc: 1 }],
  ] as const) {
    assert.ok(!manualItemCreateSchema.safeParse(eingabe).success,
      `${was} kommt durch`)
  }

  // `[cmd]` **Kein `food_id` im Vertrag** — genau das unterscheidet
  // ihn von `mealItemCreateSchema`.
  assert.ok(!('food_id' in (gut.success ? gut.data : {})),
    'der Vertrag kennt food_id — dann ist es kein manueller Posten')
})

// ══ 5 · Die Verdrahtung ══════════════════════════════════════════════

test('G-340: die Route kennt die dritte art', () => {
  const r = ohneKommentare(ROUTE)
  assert.match(r, /if \(art === 'manuell'\)/, 'die Route kennt `manuell` nicht')
  assert.match(r, /manualItemCreateSchema\.safeParse\(roh\)/,
    'die Eingabe wird nicht gegen den Vertrag geprueft')
  assert.match(r, /addManualItem\(geprueft\.data\)/,
    'die Route ruft den Schreibweg nicht')

  // `[read]` **Die Fehlermeldung nennt alle drei** — sonst raet der
  // naechste Aufrufer.
  assert.match(r, /"mahlzeit", "position" oder "manuell"/,
    'die Fehlermeldung nennt die dritte art nicht')
})

test('G-340: der Schreibweg friert NICHT ein', () => {
  // `[cmd]` **`computeFrozenNutrients` rechnet je 100 g hoch** — ein
  // Restaurantteller hat keine Naehrwerte je 100 g.
  //
  // `[read]` **Die Zahlen kommen vom Nutzer und sind bereits
  // absolut.** **Sie zu skalieren waere eine Erfindung.**
  const w = ohneKommentare(WRITE)
  const i = w.indexOf('export async function addManualItem')
  assert.ok(i > 0, 'addManualItem fehlt')
  const block = w.slice(i, w.indexOf('\n}', i))
  assert.doesNotMatch(block, /computeFrozenNutrients/,
    'der manuelle Weg friert ein — dann werden die Zahlen skaliert')
  assert.doesNotMatch(block, /loadFoodForFreezing/,
    'der manuelle Weg liest den Katalog — es gibt kein Lebensmittel')
  assert.match(block, /buildManualItemInsert\(userId, input\)/,
    'der Schreibweg benutzt den manuellen Bauplan nicht')
})

test('G-340: das Modal schreibt und steht auf der gemeinsamen Huelle', () => {
  // `[cmd]` **Der Knopf war ein `InEntwicklungKnopf`** — er oeffnete
  // einen Hinweis statt zu speichern.
  const m = ohneKommentare(MODALE)
  const i = m.indexOf('function QuickAddModal')
  assert.ok(i > 0, 'QuickAddModal fehlt')
  const block = m.slice(i, m.indexOf('\n}\n', i))

  assert.match(block, /art: 'manuell'/, 'das Modal schickt die falsche art')
  assert.doesNotMatch(block, /InEntwicklungKnopf/,
    'der Knopf ist wieder eine Attrappe')

  // `[read]` **Dieselbe Machart** — der Auftrag sagt es.
  assert.match(block, /<ZiehModal/,
    'Quick-Add haelt wieder eine eigene Huelle')

  // `[cmd]` **Und es braucht eine echte Mahlzeit** — `meal_id` ist
  // eine Zeile, kein Wort.
  assert.match(block, /meal_id: mahlzeitId/,
    'das Modal schickt keine meal_id')
  assert.match(block, /api\/nutrition\/diary\?datum=/,
    'das Modal laedt die Mahlzeiten des Tages nicht')
})

test('G-340: das Modal sagt, was der Posten NICHT kann', () => {
  // `[read]` **C-378: wenn die Daten nicht da sind, erfinden wir sie
  // nicht** — **und die Anzeige muss es sagen koennen.**
  const m = lies(MODALE)
  const i = m.indexOf('function QuickAddModal')
  const block = m.slice(i, m.indexOf('\n}\n', i))
  assert.match(block, /keine Mikronährstoffe/,
    'der Hinweis auf die fehlenden Mikros ist weg')
  assert.match(block, /unvollständig/,
    'das Modal sagt nicht, dass der Tag unvollstaendig bleibt')

  // `[cmd]` **Und der Gewichtssatz erklaert die 1 g** — sonst sieht
  // sie aus wie ein Fehler (G-341: dieselbe Klasse).
  assert.match(block, /1 g<\/strong> in\n {18}die Tagessumme/,
    'der Satz zur Gewichtsvorgabe fehlt')
})
