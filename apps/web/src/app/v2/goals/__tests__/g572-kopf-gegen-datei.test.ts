/**
 * G-572 — der Dateikopf gegen die Datei halten
 *
 * `[cmd]` **Der Kopf von `ansicht.tsx` nannte fuenf Reiter als
 * Attrappe:** Timeline, Phase engine, Cross-module, Physique ratios,
 * Pose sessions. **Drei davon waren angebunden** — Timeline seit
 * G-79, Phase engine seit G-513/G-539/G-544/G-565, Physique seit
 * G-87.
 *
 * `[read]` **Die Fehlerklasse steht in den Projektregeln:** ein
 * `[cmd]` mit falscher Zahl ist schlimmer als ein `[annahme]`, **weil
 * die Marke geglaubt wird.** `[cmd]` **Und dieser stand im KOPF der
 * Hauptansicht** — wer die Datei oeffnet, liest ihn als Erstes.
 *
 * `[read]` **Dieser Waechter haelt nicht den Wortlaut fest, sondern
 * den Widerspruch:** nennt der Kopf einen Reiter als Attrappe,
 * waehrend die Datei fuer ihn ein echtes Bauteil rendert?
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')

const roh = () => readFileSync(join(GOALS, 'ansicht.tsx'), 'utf8')

/** Der Kopf: alles vor dem ersten `import`. */
function kopf(): string {
  const q = roh()
  const i = q.indexOf("\nimport * as React")
  assert.ok(i > 0, 'der Kopf laesst sich nicht abgrenzen')
  return q.slice(0, i)
}

/** Der Rumpf ohne Kommentare — was WIRKLICH rendert. */
function rumpf(): string {
  return roh()
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
}

/**
 * Die zehn Reiter und das Bauteil, das ihren ECHTEN Teil traegt.
 *
 * `[cmd]` **Gemessen am 2026-10-02**, je Reiter am Schirm und im
 * Quelltext. `[read]` **`null` heisst: dieser Reiter hat keinen
 * echten Teil** — er ist Attrappe, und der Kopf darf ihn so nennen.
 */
const REITER: Array<[string, string | null]> = [
  ['Goals', 'ZielKarten'],
  ['Phase engine', 'PhaseEcht'],
  ['Adaptive TDEE', 'GoalsTDEEView'],
  ['Cross-module', null],
  ['Timeline', 'ZeitachseTab'],
  ['Body metrics', 'KoerperMetriken'],
  ['Measurements', 'KoerperUmfaenge'],
  ['Composition', 'CompositionTab'],
  ['Physique ratios', 'PhysiqueEcht'],
  ['Pose sessions', null],
]

describe('G-572 — der Kopf widerspricht der Datei nicht', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(roh().length > 10000, 'ansicht.tsx ist verdaechtig kurz')
    assert.ok(kopf().length > 1000, 'der Kopf ist verdaechtig kurz')
  })

  // `[cmd]` **Das ist der Befund von G-572**, als Zusicherung.
  it('kein angebundener Reiter steht im Kopf als Attrappe', () => {
    const k = kopf()
    // `[read]` **Gesucht wird die alte BEHAUPTUNG**, nicht jedes
    // Vorkommen des Namens: der Kopf darf „Phase engine" nennen, er
    // darf ihn nur nicht als Attrappe auffuehren.
    const behauptung = /Was hier bleibt, ist Attrappe:([\s\S]{0,400}?)\./
    const t = behauptung.exec(k)
    assert.equal(t, null,
      'der Kopf fuehrt wieder eine pauschale Attrappenliste — sie '
      + 'veraltet mit jedem Punkt, der einen Reiter anbindet (G-572)')
  })

  for (const [name, bauteil] of REITER) {
    if (!bauteil) continue
    it(`${name}: das echte Bauteil rendert wirklich`, () => {
      // `[read]` **Der Kopf behauptet eine Anbindung** — hier wird
      // gemessen, ob sie da ist. **Faellt eine, ist der Kopf wieder
      // falsch.**
      const r = rumpf()
      assert.ok(new RegExp(`<${bauteil}\\b`).test(r),
        `${name} nennt ${bauteil} als echten Teil — die Datei rendert `
        + 'ihn nicht')
    })
  }

  it('die zwei reinen Attrappenreiter haben kein echtes Bauteil', () => {
    // `[cmd]` **Cross-module und Pose sessions, gemessen 2026-10-02.**
    // `[read]` **Die Gegenprobe zur Liste oben** — ohne sie koennte
    // der Kopf alles „echt" nennen und der Waechter bliebe gruen.
    const r = rumpf()
    for (const [name, bauteil] of REITER) {
      if (bauteil) continue
      const stelle = r.indexOf(`tab === '${name === 'Cross-module' ? 'cross' : 'poses'}'`)
      assert.ok(stelle > 0, `${name} wird nicht gerendert`)
      const block = r.slice(stelle, stelle + 400)
      assert.ok(!/Echt\b|ZielKarten|KoerperMetriken|CompositionTab/.test(block),
        `${name} hat doch einen echten Teil — dann gehoert der Kopf `
        + 'nachgezogen')
    }
  })

  it('der Kopf nennt den Stichtag und den Punkt', () => {
    // `[cmd]` **A2: ein Kopf ohne Stichtag veraltet unsichtbar.**
    // `[read]` **GO-16 war der 18.08.** — acht Punkte spaeter stand
    // dieselbe Liste noch da.
    const k = kopf()
    assert.match(k, /G-572/, 'der Kopf nennt nicht, wer gemessen hat')
    assert.match(k, /2026-08-18/,
      'der Kopf nennt nicht, von wann die GO-16-Aussagen stammen')

    // `[read]` **Nicht `assert.match` auf das Datum** — es steht
    // dreimal im Kopf, und ein `match` ist schon zufrieden, wenn
    // EINES uebrig ist. `[cmd]` **Zwei Sabotagen kamen so gruen
    // durch:** Stichtag aus der Ueberschrift gestrichen, Datum aus
    // der Messzeile gestrichen. **Gezaehlt, nicht gesucht.**
    const daten = k.match(/2026-10-02/g) ?? []
    assert.ok(daten.length >= 2,
      `nur ${daten.length} Stichtage im Kopf — jede Aussage traegt `
      + 'das Datum, unter dem sie gemessen wurde (G-572/A2)')

    // `[read]` **Und das Datum muss AN der Aussage stehen**, nicht
    // irgendwo: die Ueberschrift und die Messzeile einzeln.
    assert.match(k, /WAS ECHT IST UND WAS ATTRAPPE[^\n]*2026-10-02/,
      'die Ueberschrift traegt keinen Stichtag')
    assert.match(k, /Am 2026-10-02 je Reiter am SCHIRM gezaehlt/,
      'die Zaehlung je Reiter traegt kein Datum')
  })

  it('der Kopf verweist auf die SSOT, statt sie zu wiederholen', () => {
    // `[cmd]` **A3: zwei Orte fuer dieselbe Tatsache laufen
    // auseinander** — genau das ist hier passiert.
    const k = kopf()
    assert.match(k, /116-goals-anbindung\.md/,
      'der Kopf verweist nicht auf die Quelle')
  })

  it('der Kopf traegt keine Zeilennummern dieser Datei', () => {
    // `[read]` **Sie altern mit jedem Punkt.** `[cmd]` **Der Auftrag
    // zu G-572 ist selbst daran gestolpert:** er nannte 616 fuer den
    // Phase-engine-Trenner, gemessen waren 580.
    const k = kopf()
    // `[read]` Gesucht ist die FORM `:<Zahl>` hinter einem Dateinamen
    // oder einem Bauteilnamen — nicht jede Zahl (Daten, Punktnummern
    // und `module-goals.jsx:903` als FREMDE Datei bleiben erlaubt).
    const treffer = k.match(/ansicht\.tsx:\d+|Trenner\s*:\d+|Zeile\s+\d+/g) ?? []
    assert.deepEqual(treffer, [],
      `der Kopf nennt Zeilennummern dieser Datei: ${treffer.join(', ')} `
      + '— sie veralten beim naechsten Punkt (G-572)')
  })

  it('die zwei daten.ts-Importe gehoeren der Mockup-Fassung', () => {
    // `[cmd]` **GO-16 zaehlte zwei von neun, G-572 hat nachgeprueft:
    // gilt weiter.** `[read]` **Aber der Grund war schief:** sie
    // gehoeren `TimelineTab` UNTER dem Trenner, nicht dem Reiter —
    // der rendert `ZeitachseTab` aus echten Daten.
    const r = rumpf()
    assert.match(r, /import \{ ACTIVE_GOALS, COMPLETED_GOALS \} from '\.\/daten'/,
      'die Importe haben sich geaendert — die Zahl im Kopf gilt nicht mehr')

    // `[cmd]` **A2 gilt auch hier:** die Aussage steht im
    // Importblock, nicht im Kopf — **und traegt beide Daten**, das
    // der Messung (GO-16) und das der Nachpruefung (G-572).
    const vermerk = roh().slice(0, roh().indexOf("from './daten'"))
    const ab = vermerk.lastIndexOf('Von den neun Importen')
    assert.ok(ab > 0, 'der Importvermerk fehlt')
    const vermerkBlock = vermerk.slice(ab)
    assert.match(vermerkBlock, /2026-08-18/,
      'der Vermerk nennt nicht, wann gezaehlt wurde')
    assert.match(vermerkBlock, /2026-10-02/,
      'der Vermerk nennt nicht, wann nachgeprueft wurde — dann '
      + 'veraltet er wieder unsichtbar (G-572/A2)')
    const i = r.indexOf('function TimelineTab')
    assert.ok(i > 0, 'die Mockup-Zeitachse fehlt')
    const block = r.slice(i, i + 900)
    assert.match(block, /ACTIVE_GOALS/,
      'TimelineTab benutzt die Importe nicht mehr — dann sagt der Kopf '
      + 'das Falsche')
    // `[read]` **Und die ECHTE Zeitachse liest echte Daten.**
    assert.match(r, /<ZeitachseTab\s+ziele=\{echt\.ziele\}/,
      'die echte Zeitachse liest nicht aus echt.*')
  })
})
