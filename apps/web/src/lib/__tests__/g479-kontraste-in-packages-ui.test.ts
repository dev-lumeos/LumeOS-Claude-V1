// G-479 — drei Klassen mit 2,88:1 in `packages/ui`.
// G-498 — die vierte, `.v2-hinweis`, mit denselben Zahlen.
//
// **Zweimal selbst gemeldet und beide Male nicht behoben:**
//
//   G-478: *„`.v2-dim` und `.v2-eyebrow` messen 2,88:1 und liegen in
//   `packages/ui`, 1.565-fach ueber v2 benutzt — sie zu aendern
//   haette A7 gebrochen, also habe ich sie nur im Modal
//   ueberschrieben."*
//
//   G-480: *„Der Tabellenkopf misst 2,88:1 — belegt als ALTBEFUND
//   … Die Regel liegt in `packages/ui` und betrifft 57 Dateien."*
//
// `[cmd]` **Gemessen 2026-09-23 am Schirm, BEIDE Themen**
// (`tools/_g479-kontrast.mjs`, 1x1-Canvas):
//
//                vorher hell  vorher dunkel  nachher
//     v2-dim        2,88:1       2,12:1      9,19 / 7,2
//     v2-eyebrow    2,88:1       2,12:1      9,19 / 7,2
//     v2-tbl th     2,88:1       2,12:1      9,19 / 7,2
//
// `[cmd]` **G-498, 2026-09-24 — dieselbe Zahl, vierte Klasse**
// (`tools/_g498-kontrast.mjs`, 32 Messungen ueber drei Module):
//
//     v2-hinweis    2,88:1       2,12:1      9,19 / 7,2
//
// `[read]` **42 Verwendungen, alle in `apps/web/src`, alle
// Fliesstext** — Fehlermeldungen, Leerhinweise, Erklaersaetze.
//
// `[read]` **WCAG AA verlangt 4,5:1 fuer Fliesstext** — und alle
// vier tragen Text: Beschreibungen, Werte, Abschnittstitel,
// Spaltenkoepfe, Hinweissaetze.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

// `[read]` **Der Pfad kommt aus der Lage DIESER Datei**, nicht aus
// `process.cwd()` — sonst ist die Probe aus der Wurzel gruen und
// faellt im Gate (G-291).
const WURZEL = path.resolve(__dirname, '..', '..', '..', '..', '..')
const V2 = readFileSync(
  path.join(WURZEL, 'packages/ui/src/styles/v2.css'), 'utf8')
const THEMA = readFileSync(
  path.join(WURZEL, 'apps/web/src/styles/themes/lume.css'), 'utf8')

/**
 * Der Kontrast zweier oklch-Helligkeiten.
 *
 * `[read]` **Gerechnet, nicht geschaetzt** — und nur ueber die
 * Helligkeit: bei einer Buntheit von 0,005 traegt der Farbanteil
 * nichts bei.
 *
 * `[cmd]` **Gegen die Canvas-Messung gehalten** (die Wahrheit steht
 * in `tools/_g479-kontrast.mjs`, gemessen am Schirm):
 *
 *                     gerechnet   gemessen
 *     fg-dim hell        2,88       2,88
 *     fg-muted hell      9,21       9,19
 *     fg-subtle hell     4,85       4,87
 *     fg-dim dunkel      2,29       2,12
 *     fg-muted dunkel    7,82       7,20
 *     fg-subtle dunkel   4,00       3,98
 *
 * `[read]` **Im Hellen auf zwei Stellen genau, im Dunklen leicht zu
 * GUENSTIG** (2,29 gegen 2,12; 7,82 gegen 7,20). `[read]` **Die
 * Abweichung geht in die sichere Richtung fuer eine Untergrenze:**
 * sie laesst nie einen zu dunklen Wert als gut durchgehen. `[cmd]`
 * **Die harte Messung bleibt die Canvas-Probe** — dieser Waechter
 * faengt den Rueckfall im Quelltext, bevor jemand den Schirm
 * aufmacht.
 */
function kontrast(lA: number, lB: number): number {
  // oklch-L ist wahrgenommene Helligkeit; die Umrechnung auf die
  // relative Leuchtdichte der WCAG-Formel ist naeherungsweise L^3.
  const y = (l: number) => Math.pow(l, 3)
  const a = y(lA), b = y(lB)
  return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100
}

/** Die Helligkeit eines Tokens je Thema. */
function tokenL(name: string): { hell: number; dunkel: number } {
  // `[cmd]` **Zwei Bloecke in `lume.css`:** der dunkle zuerst
  // (Zeile 14 ff.), der helle darunter (87 ff.).
  // `[read]` **`match` mit `g` statt `matchAll`** — das Ziel dieser
  // Anwendung steht unter ES2015, und ein Spread ueber den Iterator
  // von `matchAll` faellt dort (TS2802).
  const roh = THEMA.match(
    new RegExp(`--${name}:\\s*oklch\\([0-9.]+`, 'g')) ?? []
  const treffer = roh.map(t => Number(t.replace(/^.*oklch\(/, '')))
  assert.equal(treffer.length, 2,
    `--${name} steht nicht genau zweimal in lume.css (${treffer.length}).`)
  return { dunkel: treffer[0], hell: treffer[1] }
}

/** Welches Token eine Klasse benutzt. */
function tokenVon(regel: RegExp): string {
  const m = V2.match(regel)
  assert.ok(m, `Die Regel ${regel} steht nicht in v2.css.`)
  return m![1]
}

const KLASSEN: Array<[string, RegExp]> = [
  ['.v2-eyebrow', /\.v2-eyebrow\s*\{[^}]*color:\s*var\(--([a-z-]+)\)/],
  ['.v2-tbl th', /\.v2-tbl th\s*\{[^}]*color:\s*var\(--([a-z-]+)\)/],
  ['.v2-dim', /\.v2-dim\s*\{\s*color:\s*var\(--([a-z-]+)\)/],
  // ══ G-498: DIE VIERTE KLASSE ═══════════════════════════════════
  //
  // `[cmd]` **Gemessen 2026-09-24 am Schirm: 2,88:1 hell, 2,12:1
  // dunkel** — dieselben Zahlen wie die drei darueber, gefunden in
  // G-468 und dort nur OERTLICH ueberschrieben.
  //
  // `[read]` **Hier dazugestellt, statt einen zweiten Waechter zu
  // bauen** — es ist dieselbe Frage an dieselbe Datei, und zwei
  // Waechter fuer eine Sache laufen irgendwann auseinander.
  ['.v2-hinweis', /\.v2-hinweis\s*\{[^}]*color:\s*var\(--([a-z-]+)\)/],
]

test('G-479/A3+A6 + G-498: jede Klasse traegt ein lesbares Token', () => {
  // `[cmd]` **Die Grundfarben, gemessen:** hell `oklch(1 0 0)`,
  // dunkel `oklch(0.16 0.004 270)`.
  const GRUND = { hell: 1.0, dunkel: 0.16 }
  for (const [name, regel] of KLASSEN) {
    const token = tokenVon(regel)
    const l = tokenL(token)
    const kHell = kontrast(l.hell, GRUND.hell)
    const kDunkel = kontrast(l.dunkel, GRUND.dunkel)
    // `[read]` **BEIDE Themen** — `--fg-dim` ist 0,680 hell und
    // 0,420 dunkel, und nur eine Messung sagt nichts ueber die
    // andere. `[cmd]` **`--fg-subtle` faellt genau daran:** 4,87
    // hell, aber 3,98 dunkel.
    assert.ok(kHell >= 4.5,
      `${name} nutzt --${token}: ${kHell}:1 im Hellen, Soll 4,5.`)
    assert.ok(kDunkel >= 4.5,
      `${name} nutzt --${token}: ${kDunkel}:1 im Dunklen, Soll 4,5.`)
  }
})

test('G-479: `--fg-dim` bleibt der Dekoration', () => {
  // `[read]` **Der Wert wird NICHT geaendert** — er traegt vier
  // Dekorationen, und dort ist 2,88:1 richtig: `.v2-dot`, der
  // Akzentpunkt der Navigation, eine 1-px-Linie und ein
  // 7-%-Schraffurverlauf.
  //
  // `[cmd]` **Gemessen: vier Stellen mit `background`, keine davon
  // Text.**
  const hintergruende = (V2.match(/background:[^;]*var\(--fg-dim\)/g) ?? []).length
  assert.ok(hintergruende >= 2,
    'Die Dekorationen nutzen `--fg-dim` nicht mehr — dann ist der '
    + 'Wert womoeglich geaendert worden statt der Klassen.')
  const l = tokenL('fg-dim')
  assert.equal(l.hell, 0.68,
    '`--fg-dim` wurde geaendert — das haette auch die Dekoration getroffen.')
  assert.equal(l.dunkel, 0.42, '`--fg-dim` (dunkel) wurde geaendert.')
})

test('G-479 + G-498: keine der Klassen faellt auf --fg-dim zurueck', () => {
  // `[read]` **Die eigentliche Rueckfallprobe** — wer eine der
  // Regeln auf `--fg-dim` zuruecksetzt, faellt hier auf.
  //
  // `[cmd]` **G-498 hat `.v2-hinweis` dazugestellt** — sie kam am
  // 2026-08-16 herein (`abffc77f`) und wurde dreimal OERTLICH
  // umgangen (G-453, G-479, G-468), bevor sie jemand anhob.
  // `[read]` **Ein Waechter ist billiger als die vierte Umgehung.**
  for (const [name, regel] of KLASSEN) {
    assert.notEqual(tokenVon(regel), 'fg-dim',
      `${name} steht wieder auf --fg-dim (2,88:1 hell, 2,12:1 dunkel).`)
  }
})
