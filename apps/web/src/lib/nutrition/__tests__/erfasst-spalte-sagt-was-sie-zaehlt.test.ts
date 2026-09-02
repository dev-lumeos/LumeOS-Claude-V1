/**
 * G-341 — die Erfasst-Spalte sagt, was sie zaehlt.
 *
 * **Tom, 2026-09-02:** *„der naechste schwachsinn der mich alles
 * hinterfragen laesst was ich hier an daten sehe."*
 *
 * `[cmd]` **Gemessen am 2026-09-02, VOR dem Bau** — `dev@lumeos.app`,
 * 60-Tage-Fenster, am Schirm ausgelesen:
 *
 *     CAROTPAXB   1.088,6 µg    0/60 Tg. vollst.
 *     CARTB      15.329,3 µg   18/60 Tg. vollst.
 *     VITA        3.038,5 µg   60/60 Tg. vollst.
 *
 * `[cmd]` **18 solche Zeilen standen gleichzeitig auf dem Schirm.**
 *
 * `[read]` **Die Zahl sagte *null*, das Wort sagte *vollstaendig* —
 * und dazwischen stand ein Wert.** `[cmd]` **Es ist kein Fehler:**
 * bei `CAROTPAXB` tragen ALLE 60 Tage einen Wert, 539 von 780 Posten
 * sind belegt. **`complete_day_count` zaehlt Tage OHNE jede Luecke.**
 *
 * `[cmd]` **Codex hat es unabhaengig gemessen und ich nachgemessen:**
 * von 138 Codes zeigt **keiner** einen Schnitt bei `value_count = 0`
 * — **47 zeigen einen begruendeten Teilschnitt bei null
 * vollstaendigen Tagen.**
 *
 * `[read]` **Keine Zahl wurde geaendert** (der Auftrag sagt es).
 * **Geaendert hat sich, WELCHE gezeigt wird.**
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

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

const TAB = 'apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx'
const ORDNUNG = 'apps/web/src/lib/nutrition/naehrstoff-ordnung.ts'

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [TAB, ORDNUNG]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 1000, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

test('G-341: die Spalte zeigt Tage MIT WERT, nicht vollstaendige', () => {
  // `[cmd]` **Hier stand `${k.tageVollstaendig}/${k.tageErfasst} Tg.
  // vollst.`** — die Zahl, die bei einer einzigen Luecke je Tag auf
  // null faellt.
  //
  // `[read]` **Die Wirkung, nicht das Wort:** der Zaehler MUSS
  // `tageMitWert` sein. **Stuende dort wieder `tageVollstaendig`,
  // waere der Befund zurueck** — auch wenn das Wort *vollst.*
  // verschwunden ist.
  const t = ohneKommentare(TAB)
  assert.match(t, /\{k\.tageMitWert\}\/\{k\.tageErfasst\} Tg\. mit Wert/,
    'die Spalte zeigt nicht die Tage mit Wert')

  // `[cmd]` **Und das irrefuehrende Wort ist weg.**
  assert.doesNotMatch(t, /Tg\. vollst\./,
    'die Beschriftung „Tg. vollst." ist zurueck')
  assert.doesNotMatch(t, /\{k\.tageVollstaendig\}\/\{k\.tageErfasst\}/,
    'der Zaehler ist wieder tageVollstaendig — dann faellt er bei einer Luecke auf null')
})

test('G-341: die Luecke steht daneben, aber nur wenn es eine gibt', () => {
  // `[read]` **Bei `60/60` waere der Zusatz Rauschen** — VITA hat
  // keine Luecke, und ein Hinweis darauf waere eine Aussage ueber
  // nichts.
  const t = ohneKommentare(TAB)
  assert.match(t, /k\.tageMitWert > k\.tageVollstaendig &&/,
    'der Luecken-Hinweis haengt nicht an der Bedingung')
  assert.match(t, /\{k\.positionenOhneWert\} Pos\. ohne Wert/,
    'die Zahl der fehlenden Posten fehlt')
})

test('G-341: der Tooltip nennt beide Zahlen und ihre Bedeutung', () => {
  // `[read]` **Wer genauer hinsieht, bekommt den ganzen Satz** —
  // Posten, Tage mit Wert, Tage ohne Luecke.
  const t = ohneKommentare(TAB)
  const i = t.indexOf('von ${k.positionen} Posten')
  assert.ok(i > 0, 'der Tooltip nennt die Posten nicht')
  const block = t.slice(Math.max(0, i - 300), i + 400)
  assert.match(block, /\$\{k\.positionenOhneWert\} fehlen/,
    'der Tooltip sagt nicht, wie viele Posten fehlen')
  assert.match(block, /Der Schnitt beruht auf \$\{k\.tageMitWert\} Tagen/,
    'der Tooltip nennt die Grundlage des Schnitts nicht')
  assert.match(block, /\$\{k\.tageVollstaendig\} davon sind l/,
    'der Tooltip erklaert die vollstaendigen Tage nicht')
})

test('G-341: tageMitWert wird gelesen, nicht erfunden', () => {
  // `[cmd]` **`days_with_value` lag in `nutrient_summary_window`
  // bereit und wurde nicht gelesen** — die Anzeige kannte nur
  // `logged_day_count` und `complete_day_count`.
  //
  // `[read]` **Die Wirkung ist die Kette:** Rueckgabetyp, Zuweisung,
  // Knoten. **Fehlt ein Glied, steht dort still eine Null.**
  const o = ohneKommentare(ORDNUNG)
  assert.match(o, /days_with_value: number/,
    'der Rohtyp kennt days_with_value nicht')
  assert.match(o, /days_with_value: zahl\(r\.days_with_value\) \?\? 0/,
    'days_with_value wird nicht aus der Zeile gelesen')
  assert.match(o, /tageMitWert: z\?\.days_with_value \?\? 0/,
    'der Knoten bekommt tageMitWert nicht')
})

test('G-341: keine Zahl ist umgerechnet worden', () => {
  // **Der Auftrag:** *„Keine Zahl aendern — die Rechnung stimmt."*
  //
  // `[read]` **Die Wirkung ist eine Abwesenheit:** in der Spalte
  // steht keine Arithmetik. **Ein `Math.round`, ein `/` oder ein `*`
  // waere eine neue Rechnung** — und genau das war verboten.
  const t = ohneKommentare(TAB)
  const i = t.indexOf('Tg. mit Wert')
  assert.ok(i > 0, 'die Spalte fehlt')
  const block = t.slice(Math.max(0, i - 900), i + 300)
  for (const verboten of ['Math.round(', 'Math.floor(', 'toFixed(']) {
    assert.ok(!block.includes(verboten),
      `${verboten} steht in der Spalte — die Zahlen sollten unveraendert bleiben`)
  }
})
