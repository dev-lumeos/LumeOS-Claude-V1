/**
 * G-343 — eine Zusage haengt an der Sache, nicht an der Zeile.
 *
 * ── Der Anlass ──────────────────────────────────────────────────────
 *
 * `[cmd]` **Dreimal in vier Tagen dasselbe Muster:**
 *
 *     G-342   v2-attrappen.test.ts verlangte vier Modale — eines war
 *             seit E-58 ueberholt und wurde geloescht.
 *     G-340   zwei G-339-Waechter fielen, weil ein Umbau ihnen die
 *             Anker nahm (`aria-label="Meal"`, `MEAL_TYPES`).
 *     G-343   zwei Tests pruefen `karteFuerWurzel('CHORL', 'Sonstige
 *             Naehrstoffe')` — die Gruppe gibt es live nicht mehr.
 *
 * `[read]` **Der dritte ist der gefaehrlichste:** **er war gruen.**
 * Er reichte die abgeschaffte Gruppe als Argument selbst hinein
 * und prueft damit seine eigene Annahme, nicht den Bestand.
 *
 * ── Woran man es erkennt ────────────────────────────────────────────
 *
 * `[read]` **Eine Zusage ist gefaehrdet, wenn ihr Gegenstand aus dem
 * Test selbst kommt** statt aus dem Bestand:
 *
 *     gefaehrdet   f('CHORL', 'Sonstige Naehrstoffe') === 'Sonstige'
 *                  der Test liefert die Gruppe und prueft die
 *                  Abbildung seiner eigenen Eingabe
 *
 *     traegt       jeder Code aus `nutrient_defs` landet auf einer
 *                  Karte aus `KARTEN_REIHENFOLGE`
 *                  der Bestand liefert die Eingabe
 *
 * `[read]` **Und die zweite Form:** eine Zusage, die einen NAMEN
 * sucht (`aria-label="Meal"`, `MEAL_TYPES`), faellt beim naechsten
 * Umbau. **Eine, die eine WIRKUNG misst, ueberlebt ihn.**
 *
 * `[read]` **Dieser Waechter prueft die erste Form fuer die
 * Naehrstoffkarten** — stellvertretend, weil dort dreimal etwas
 * verschoben wurde (E-48, E-63).
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

import { KARTEN_REIHENFOLGE, karteFuerWurzel } from '../naehrstoff-anzeige'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// gruen aus der Wurzel und rot im Gate (G-291, A-63).
const WURZEL = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../../../../..',
)

/**
 * Die Wurzeln, wie sie am 2026-09-05 live standen.
 *
 * `[cmd]` **Gemessen:** `select group_de, code from nutrient_defs
 * where parent_code is null` — 41 Wurzeln in sechs Gruppen.
 *
 * `[read]` **Als Festwert, nicht als Abfrage:** ein Unit-Test ohne
 * Datenbank. **Weicht der Bestand ab, faellt der Waechter** — und
 * genau das soll er.
 */
const WURZELN: Array<{ code: string; gruppe: string }> = [
  // Makronaehrstoffe — neun, darunter die vier aus E-48 und NT
  { code: 'CHO', gruppe: 'Makronährstoffe' },
  { code: 'FAT', gruppe: 'Makronährstoffe' },
  { code: 'PROT625', gruppe: 'Makronährstoffe' },
  { code: 'FIBT', gruppe: 'Makronährstoffe' },
  { code: 'WATER', gruppe: 'Makronährstoffe' },
  { code: 'ALC', gruppe: 'Makronährstoffe' },
  { code: 'OA', gruppe: 'Makronährstoffe' },
  { code: 'ASH', gruppe: 'Makronährstoffe' },
  { code: 'NT', gruppe: 'Makronährstoffe' },
  // Fettbegleitstoffe — E-63, seit dem 02.09.
  { code: 'CHORL', gruppe: 'Fettbegleitstoffe' },
  // Stellvertreter der uebrigen vier Gruppen
  { code: 'FE', gruppe: 'Elemente' },
  { code: 'VITC', gruppe: 'Wasserlösliche Vitamine' },
  { code: 'VITA', gruppe: 'Fettlösliche Vitamine' },
  { code: 'ENERCC', gruppe: 'Energie' },
]

test('die Dateiprobe findet ihre Datei — unabhaengig vom Startort', () => {
  const f = 'apps/web/src/lib/nutrition/naehrstoff-anzeige.ts'
  assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

test('G-343/E-63: KEINE Wurzel faellt mehr auf *Sonstige*', () => {
  // **Tom, 2026-09-02:** *„dann faellt naemlich das sonstige weg, das
  // sieht unprofessionell aus denn die sind alle zuteilbar."*
  //
  // `[cmd]` **Vor G-343 fiel genau eine hinein:** `NT`. **Am Schirm
  // eine Karte mit einem einzigen Eintrag** (gemessen 2026-09-05:
  // *„Sonstige · 1 Eintrag · Stickstoff, gesamt NT"*).
  //
  // `[read]` **Die Wirkung, nicht das Wort:** jede Wurzel wird durch
  // die Funktion geschickt. **Kein Aufruf mit erfundener Gruppe.**
  const gelandet = WURZELN.map(w => ({
    ...w, karte: karteFuerWurzel(w.code, w.gruppe),
  }))
  const rest = gelandet.filter(g => g.karte === 'Sonstige')
  assert.deepEqual(rest, [],
    `${rest.length} Wurzeln fallen in *Sonstige*: `
    + `${rest.map(r => r.code).join(', ')} — E-63 sagt, alle sind zuteilbar`)
})

test('G-343/E-63: NT gehoert zu Protein, CHORL zu den Fettbegleitstoffen', () => {
  // `[cmd]` **`PROT625` heisst so, weil es `NT × 6,25` ist.**
  // `[read]` **Als Karte, nicht als `parent_code`** — E-63:
  // *„Stickstoff ist kein Bestandteil von Protein, sondern seine
  // Quelle."*
  assert.equal(karteFuerWurzel('NT', 'Makronährstoffe'), 'Protein')
  assert.equal(karteFuerWurzel('CHORL', 'Fettbegleitstoffe'),
    'Fettbegleitstoffe')

  // `[cmd]` **Und die Hierarchie bleibt unberuehrt** — die Karte
  // ordnet ein, sie haengt nichts um.
  const a = fs.readFileSync(path.join(WURZEL,
    'apps/web/src/lib/nutrition/naehrstoff-anzeige.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
  const i = a.indexOf('export function karteFuerWurzel')
  const block = a.slice(i, a.indexOf('\n}', i))
  assert.doesNotMatch(block, /parent_code/,
    'die Kartenzuordnung fasst die Hierarchie an')
})

test('G-343: jede Wurzel landet auf einer Karte, die es gibt', () => {
  // `[read]` **Die eigentliche Zusage:** eine Karte, die
  // `KARTEN_REIHENFOLGE` nicht kennt, wird nie gezeichnet — **der
  // Naehrstoff verschwindet dann stumm.**
  //
  // `[cmd]` **Genau das faengt kein Test, der einzelne Codes
  // aufzaehlt** — er prueft die, an die jemand gedacht hat.
  for (const w of WURZELN) {
    const karte = karteFuerWurzel(w.code, w.gruppe)
    assert.ok((KARTEN_REIHENFOLGE as readonly string[]).includes(karte),
      `${w.code} landet auf "${karte}" — die Karte steht nicht in `
      + 'KARTEN_REIHENFOLGE und wird nie gezeichnet')
  }
})

test('G-343: der Rueckfall bleibt stehen — als Waechter, nicht als Karte', () => {
  // `[read]` **Er faengt heute nichts** (kein Bestandscode landet
  // dort). **Aber eine stumm weggelassene Wurzel waere derselbe
  // Fehler wie eine Null statt eines Fehlzaehlers.**
  //
  // `[cmd]` **Ein erfundener Code beweist es** — er ist NICHT im
  // Bestand und soll es auch nicht sein.
  assert.equal(karteFuerWurzel('XYZ_NEU', 'Makronährstoffe'), 'Sonstige',
    'ein unbekannter Code verschwindet stumm — dann fehlt der Rueckfall')

  // `[cmd]` **Und *Sonstige* steht am Ende der Reihenfolge** — die
  // Sammelkarte ist das Ende, nicht die Mitte.
  assert.equal(KARTEN_REIHENFOLGE[KARTEN_REIHENFOLGE.length - 1], 'Sonstige',
    '*Sonstige* steht nicht am Ende')
})
