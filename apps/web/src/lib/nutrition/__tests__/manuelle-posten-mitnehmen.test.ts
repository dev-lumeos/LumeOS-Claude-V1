/**
 * G-348 / G-350 — der neue Fall und der zweite Schreibweg.
 *
 * ── Das Muster ──────────────────────────────────────────────────────
 *
 * `[read]` **Zweimal dasselbe, aus zwei Richtungen:**
 *
 *     G-348   eine ALTE Funktion kennt einen NEUEN Fall nicht
 *             — und ueberspringt ihn still
 *     G-350   ein NEUER Weg steht neben einem ALTEN
 *             — und beide schreiben dieselbe Spalte
 *
 * `[cmd]` **Der CHECK auf `meal_items` erlaubt DREI Faelle**, und
 * **zwei davon haben `food_id IS NULL`:**
 *
 *     bls      food_id NOT NULL, custom_food_id NULL
 *     custom   food_id NULL,     custom_food_id NOT NULL
 *     manual   food_id NULL,     custom_food_id NULL
 *
 * `[read]` **`if (!it.food_id) continue` traf damit zwei Faelle** —
 * und meldete keinen. **Seit G-340 ist `manual` erreichbar.**
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import { buildManualItemInsert } from '../diary-model'

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

const DIARY = 'apps/web/src/app/v2/nutrition/mahlzeiten.tsx'
const MODEL = 'apps/web/src/lib/nutrition/diary-model.ts'
const WRITE = 'apps/web/src/lib/nutrition/diary-write.ts'
const REZEPTE = 'apps/web/src/app/v2/nutrition/rezepte-echt.tsx'
const REZEPTWRITE = 'apps/web/src/lib/nutrition/rezept-write.ts'
const ROUTE = 'apps/web/src/app/api/nutrition/rezept/route.ts'
const AKTIONEN = 'apps/web/src/app/v2/nutrition/einkaufsliste-aktionen.ts'

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [DIARY, MODEL, WRITE, REZEPTE, REZEPTWRITE, ROUTE, AKTIONEN]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 400, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1 · G-348: der Leseweg kann die drei Faelle unterscheiden ════════

test('G-348: food_source kommt durch den ganzen Leseweg', () => {
  // `[read]` **Ohne sie ist `manual` von `custom` nicht zu
  // unterscheiden** — beide haben `food_id IS NULL`, und wer nur
  // darauf schaut, behandelt beide gleich falsch.
  //
  // `[cmd]` **Die Wirkung ist die Kette:** Abfrage, Parser, Typ.
  // **Fehlt ein Glied, steht dort still ein Vorgabewert.**
  const w = ohneKommentare(WRITE)
  assert.match(w, /\.select\('[^']*food_source[^']*'\)/,
    'die Abfrage holt food_source nicht')
  assert.match(w, /\.select\('[^']*custom_food_id[^']*'\)/,
    'die Abfrage holt custom_food_id nicht')

  const m = ohneKommentare(MODEL)
  assert.match(m, /food_source: typeof record\.food_source === 'string'/,
    'der Parser liest food_source nicht')
  assert.match(m, /food_source: string/, 'der Typ kennt food_source nicht')
})

test('G-348: wieGestern nimmt manuelle Posten mit', () => {
  // `[cmd]` **Hier stand `if (!it.food_id) continue`** — ein stilles
  // Ueberspringen, das seit G-340 einen echten Fall traf.
  //
  // `[read]` **Ein manueller Posten geht ueber `art: 'manuell'`**,
  // nicht ueber `position`: **seine Zahlen sind bereits absolut und
  // duerfen nicht neu eingefroren werden.**
  const d = ohneKommentare(DIARY)
  const i = d.indexOf('async function wieGestern')
  assert.ok(i > 0, 'wieGestern fehlt')
  const block = d.slice(i, d.indexOf('\n  }', d.indexOf('onGeaendert()', i)))

  assert.match(block, /it\.food_source === 'manual'/,
    'manuelle Posten werden nicht erkannt')
  assert.match(block, /art: 'manuell'/,
    'der manuelle Posten geht nicht ueber den manuellen Schreibweg')

  // `[cmd]` **Und die Makros bleiben `undefined`, nicht `0`** —
  // ein fehlendes Makro heisst „unbekannt" (C-48 Regel 1).
  assert.match(block, /prot625: it\.prot625 \?\? undefined/,
    'ein fehlendes Makro wird zu 0 — das waere erfunden')
})

test('G-348: was nicht mitkommt, wird gesagt', () => {
  // `[read]` **Der Befund war nicht das Ueberspringen, sondern das
  // STILLE Ueberspringen.** `[cmd]` **`custom` bleibt aussen vor**
  // (`foods_custom` hat 0 Zeilen, Flow 6 fehlt) — **aber jetzt
  // erfaehrt es der Nutzer.**
  const d = ohneKommentare(DIARY)
  const i = d.indexOf('async function wieGestern')
  const block = d.slice(i, d.indexOf('\n  }', d.indexOf('onGeaendert()', i)))

  assert.match(block, /uebersprungen \+= 1/,
    'uebersprungene Posten werden nicht gezaehlt')
  assert.match(block, /if \(uebersprungen > 0\)/,
    'die Zahl wird nicht gemeldet — das war der Befund')
})

test('G-348: auch das Rezept-Loggen zaehlt, was es auslaesst', () => {
  // `[cmd]` **`recipe_ingredients.food_id` ist NULL-bar** — heute
  // 0 von 22 Zeilen, **aber der Weg steht.**
  //
  // `[read]` **Mitnehmen geht nicht:** eine Zutat ohne `food_id`
  // traegt nur `food_name_snapshot`, keine Naehrwerte. **Sie zu
  // uebernehmen hiesse, Zahlen zu erfinden** (C-378).
  const r = ohneKommentare(REZEPTWRITE)
  assert.match(r, /uebersprungen \+= 1/,
    'das Rezept-Loggen ueberspringt weiter still')
  assert.match(r, /uebersprungen,\s*skalierung/,
    'die Zahl kommt nicht beim Aufrufer an')
})

// ══ 2 · G-348: der manuelle Posten bleibt CHECK-tauglich ════════════

test('G-348: ein uebernommener manueller Posten haelt den CHECK', () => {
  // `[read]` **Die Uebernahme darf keinen zweiten Bauplan haben** —
  // sie geht durch denselben wie das Anlegen (G-340).
  const z = buildManualItemInsert('u-1', {
    meal_id: '11111111-2222-3333-4444-555555555555',
    food_name: 'Pasta im Ristorante', enercc: 450,
  })
  assert.equal(z.food_source, 'manual')
  assert.equal(z.food_id, null, 'food_id gesetzt — der CHECK weist die Zeile ab')
  assert.equal(z.custom_food_id, null, 'custom_food_id gesetzt — das waere Flow 6')
})

// ══ 3 · G-350: EIN Schreibweg fuer is_checked ═══════════════════════

test('G-350: is_checked wird an GENAU EINER Stelle geschrieben', () => {
  // `[cmd]` **Zwei Wege gab es seit G-345:** die Route aus G-289 und
  // die neue Serveraktion.
  //
  // `[read]` **Dasselbe Muster wie bei den Namenslisten** (G-335):
  // **zwei Wege laufen auseinander, und die naechste Aenderung
  // trifft nur einen.**
  //
  // `[cmd]` **Gezaehlt, nicht gesucht** — ein `assert.match` faende
  // den ersten und uebersaehe einen zweiten.
  const dateien: string[] = []
  const lauf = (rel: string) => {
    for (const e of fs.readdirSync(path.join(WURZEL, rel), { withFileTypes: true })) {
      const p = `${rel}/${e.name}`
      if (e.isDirectory()) { if (e.name !== '__tests__') lauf(p) }
      else if (/\.tsx?$/.test(e.name)) dateien.push(p)
    }
  }
  lauf('apps/web/src')

  const schreiber = dateien.filter(f =>
    /\.update\(\{\s*is_checked/.test(ohneKommentare(f)))
  assert.deepEqual(schreiber,
    ['apps/web/src/app/v2/nutrition/einkaufsliste-aktionen.ts'],
    `is_checked wird an ${schreiber.length} Stellen geschrieben: `
    + `${schreiber.join(', ')} — E-64 kennt einen Weg`)
})

test('G-350: die Rezeptkarte benutzt die Serveraktion', () => {
  const r = ohneKommentare(REZEPTE)
  assert.match(r, /await postenAbhaken\(id, !jetzt\)/,
    'die Rezeptkarte schreibt nicht ueber die Serveraktion')
  assert.doesNotMatch(r, /art: 'posten_haken'/,
    'der alte Weg ist zurueck — dann gibt es wieder zwei')
})

test('G-350: der alte Weg ist entfernt, nicht nur unbenutzt', () => {
  // `[cmd]` **A-59: geloescht, nicht auskommentiert.** `[read]`
  // **Ein Schreibweg ohne Aufrufer wird beim naechsten Auftrag fuer
  // gebaut gehalten** — dieselbe Klasse wie `meal_plan_slots`
  // (G-336) und `strong_avoid` (G-337).
  const ro = ohneKommentare(ROUTE)
  assert.doesNotMatch(ro, /art === 'posten_haken'/,
    'der Routenzweig ist zurueck')
  assert.doesNotMatch(ro, /postenHaken/, 'die Route importiert ihn wieder')

  const rw = ohneKommentare(REZEPTWRITE)
  assert.doesNotMatch(rw, /export async function postenHaken/,
    'die Funktion ist zurueck')
  assert.doesNotMatch(rw, /postenHakenSchema/, 'das Schema ist zurueck')

  // `[read]` **Und die Fehlermeldung nennt nur noch die vier** —
  // sonst raet der naechste Aufrufer.
  assert.doesNotMatch(ro, /einkaufsliste, posten_haken/,
    'die Fehlermeldung nennt den entfernten Vorgang weiter')
})
