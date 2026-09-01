/**
 * G-327 — `?plan=` gilt nur im Planner.
 *
 * **Tom, 2026-09-02:** *„wenn ich im planer einen anderen plan
 * anwaehle und anschaue wechselt der plan in meal plans zumindest die
 * obere beschreibung wo die compliance drin ist und unten die
 * auflistung der plaene wechselt auch und die plan setting und
 * lifecycletypes auch denke ich."*
 *
 * `[cmd]` **Alle vier Vermutungen bestätigt** — am 2026-09-02 auf
 * `dev@lumeos.app` gemessen:
 *
 *     Kopfkarte        Tag 1 von 28   ->  Tag 2 von 7
 *     Plan settings    Days count 21  ->  Days count 7
 *     Lifecycle types  aktiv          ->  zugewiesen
 *     Bibliothek       ohne Aufbau-Wochenplan -> ohne Buddy
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// grün aus der Wurzel und rot im Gate (G-291, A-63).
const WURZEL = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const SEITE = 'apps/web/src/app/v2/nutrition/page.tsx'
const LESEN = 'apps/web/src/lib/nutrition/plan-lesen.ts'

test('die Dateiproben finden ihre Dateien — unabhängig vom Startort', () => {
  for (const f of [SEITE, LESEN]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 500, `${f} ist verdächtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

test('G-327: `?plan=` wirkt nur im Planner-Reiter', () => {
  // `[read]` **Die Wirkung, nicht das Wort:** die Bedingung selbst
  // muss den Reiter prüfen. **Ein `?plan=` ohne Reiterprüfung ist
  // genau der Fehler** — die Adresse gilt sonst für beide.
  const s = ohneKommentare(SEITE)
  assert.match(s, /ladePlan\(tab === 'planner' && typeof searchParams\?\.plan === 'string'/,
    '`?plan=` wird ohne Reiterprüfung gelesen — Meal plans wechselt mit')

  // `[cmd]` **Genau EINE Stelle liest `searchParams.plan`** —
  // gezählt, nicht gesucht. **Eine zweite wäre eine zweite Wahrheit
  // darüber, welcher Plan gemeint ist.**
  const stellen = (s.match(/searchParams\?\.plan/g) ?? []).length
  assert.equal(stellen, 1,
    `${stellen} Stellen lesen searchParams.plan — es darf eine geben`)
})

test('G-327: ohne Argument nimmt ladePlan den AKTIVEN Plan', () => {
  // `[cmd]` **Das ist die Zusage, auf der die Behebung steht.**
  // `[read]` **Ohne sie zeigte Meal plans irgendeinen Plan** — und
  // die Reiterprüfung oben wäre wirkungslos.
  const l = ohneKommentare(LESEN)

  // ══ ERST SCHNEIDEN, DANN SUCHEN ═══════════════════════════════
  //
  // `[cmd]` **In der Sabotageprobe kamen S4 und S5 durch:**
  // `.order('is_active', …)` steht ZWEIMAL in der Datei — in
  // `ladePlan` (Z. 255) und in `ladeAllePlaene` (Z. 841).
  //
  // `[read]` **Der Wächter fand das zweite und blieb grün**, während
  // die Sortierung in `ladePlan` kaputt war. **Genau der Fehler aus
  // `pruefung-sucht-im-zu-grossen-heuhaufen`.**
  const a = l.indexOf('export async function ladePlan(')
  assert.ok(a > 0, 'ladePlan nicht gefunden')
  const b = l.indexOf('export async function ', a + 30)
  const rumpf = l.slice(a, b > a ? b : undefined)

  // Die Sortierung: aktiv zuerst — IN ladePlan.
  assert.match(rumpf, /\.order\('is_active', \{ ascending: false \}\)/,
    'ladePlan sortiert nicht nach is_active — dann ist liste[0] beliebig')

  // Und der Rückfall auf das erste Element.
  assert.match(rumpf, /\(planId \? liste\.find\(p => text\(p\.id\) === planId\) : null\)\s*\n?\s*\?\? liste\[0\]/,
    'ohne planId wird nicht der erste (= aktive) Plan genommen')
})

test('G-327: beide Reiter teilen sich EIN plan-Objekt', () => {
  // `[read]` **Das ist der Grund, warum die Reiterprüfung reicht** —
  // gäbe es zwei Ladewege, müsste man beide anfassen.
  //
  // `[cmd]` **Wird das je getrennt, fällt dieser Wächter** und
  // erinnert daran, dass die Bedingung dann nicht mehr genügt.
  const s = ohneKommentare(SEITE)
  const rufe = (s.match(/ladePlan\(/g) ?? []).length
  assert.equal(rufe, 1,
    `${rufe} Aufrufe von ladePlan — bei mehreren genügt die Reiterprüfung nicht`)

  // `[cmd]` **Und der Ladeblock gilt für beide Reiter** — sonst wäre
  // Meal plans ohne Daten.
  //
  // `[cmd]` **In der Sabotageprobe kam S8 durch:** die Bedingung steht
  // ZWEIMAL (Z. 264 und 406). **Gezählt statt gesucht** — fällt eine
  // weg, fällt der Wächter.
  const bloecke = (s.match(/if \(tab === 'planner' \|\| tab === 'plans'\)/g) ?? []).length
  assert.equal(bloecke, 2,
    `${bloecke} von 2 Ladeblöcken decken beide Reiter ab`)

  // `[read]` **Und der Block MIT `ladePlan` ist einer davon** — sonst
  // könnten beide woanders stehen.
  const i = s.indexOf('ladePlan(')
  const davor = s.lastIndexOf("if (tab === 'planner' || tab === 'plans')", i)
  assert.ok(davor > 0 && i - davor < 900,
    'ladePlan steht nicht in einem Block, der beide Reiter deckt')
})
