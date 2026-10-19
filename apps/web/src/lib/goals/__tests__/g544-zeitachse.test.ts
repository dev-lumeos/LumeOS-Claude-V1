/**
 * G-544 — der Phase-Reiter zeigt eine Zeitachse
 *
 * **Tom, 2026-09-29:** *„subnav phase engine: user kann seine goals
 * planen, terminieren, editieren."*
 *
 * `[cmd]` **Der Reiter zeigte neun Phasentypen und NULL Ziele.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  ankerplan, minusWochen, wochenAusAngabe, gesamtWochen,
} from '../anker'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

// ════════════════════════════════════════════════════════════════
// A2 — die Ankerrechnung, gegen den Entwurf gehalten
// ════════════════════════════════════════════════════════════════

describe('G-544/A2 — rueckwaerts vom Ankerdatum', () => {
  /**
   * **Die Tafel des Entwurfs, `module-goals-editor.jsx:313-319`,
   * mit `anchorDate = '2026-11-14'` (`:61`):**
   *
   *     Prep start        2026-05-30   24 wk out
   *     Mid phase start   2026-07-25   16 wk out
   *     Late phase start  2026-09-19    8 wk out
   *     Peak week start   2026-11-07    1 wk out
   *     Show day          2026-11-14    0
   *
   * `[read]` **Im Entwurf sind die Daten eingetippt** — hier werden
   * sie gerechnet und muessen dieselben ergeben.
   */
  const ANKER = '2026-11-14'

  it('jede Zeile des Entwurfs wird nachgerechnet', () => {
    const soll: Array<[number, string]> = [
      [24, '2026-05-30'],
      [16, '2026-07-25'],
      [8, '2026-09-19'],
      [1, '2026-11-07'],
    ]
    for (const [wochen, datum] of soll) {
      assert.equal(minusWochen(ANKER, wochen), datum,
        `${wochen} Wochen vor ${ANKER} ist nicht ${datum}`)
    }
  })

  it('null Wochen ist der Anker selbst', () => {
    assert.equal(minusWochen(ANKER, 0), ANKER)
  })

  it('ein unlesbares Datum gibt null, nicht heute', () => {
    // `[read]` **Kein Rueckfall auf `Date.now()`** — ein erfundenes
    // Datum saehe aus wie ein gerechnetes.
    assert.equal(minusWochen('14.11.2026', 4), null)
    assert.equal(minusWochen('', 4), null)
  })

  // ── Die Wochenangabe aus dem Katalog ────────────────────────────
  it('eine Spanne zaehlt ab ihrem ANFANG', () => {
    // `[cmd]` **`goal_strategies.sub_phases` fuehrt `"24–16"`** —
    // gemessen 2026-09-30, Trenner ist **U+2013**, nicht der
    // Bindestrich und nicht der Pfeil.
    assert.equal(wochenAusAngabe('24–16'), 24,
      'der Gedankenstrich wird nicht erkannt — dann steht die Achse '
      + 'leer, ohne dass es auffaellt')
    assert.equal(wochenAusAngabe('16–8'), 16)
    assert.equal(wochenAusAngabe('8–2'), 8)
  })

  it('auch Bindestrich und Pfeil werden gelesen', () => {
    // `[read]` **Eine spaetere Katalogzeile koennte sie tragen.**
    assert.equal(wochenAusAngabe('24-16'), 24)
    assert.equal(wochenAusAngabe('24→16'), 24)
  })

  it('eine blosse Zahl gilt', () => {
    // `[cmd]` **`peak_week` fuehrt `1` als NUMBER**, nicht als Text.
    assert.equal(wochenAusAngabe(1), 1)
    assert.equal(wochenAusAngabe('1'), 1)
  })

  it('unlesbar gibt null, nicht 0', () => {
    // `[read]` **`0` waere der Anker selbst** — eine Teilphase ohne
    // Zahl landete auf dem Zieltag.
    assert.equal(wochenAusAngabe('bald'), null)
    assert.equal(wochenAusAngabe(null), null)
    assert.equal(wochenAusAngabe({}), null)
  })

  // ── Der ganze Plan ──────────────────────────────────────────────
  it('der Plan des Katalogs ergibt die Daten des Entwurfs', () => {
    // `[cmd]` **`contest_prep.sub_phases`, wortwoertlich aus der
    // Datenbank** (die einzige der 17 Zeilen mit Teilphasen).
    const plan = ankerplan(ANKER, [
      { name: 'early', weeks: '24–16' },
      { name: 'mid', weeks: '16–8' },
      { name: 'late', weeks: '8–2' },
      { name: 'peak_week', weeks: 1 },
    ], 'Wettkampf')

    assert.deepEqual(plan.map(z => [z.name, z.datum, z.wochenVorher]), [
      ['early', '2026-05-30', 24],
      ['mid', '2026-07-25', 16],
      ['late', '2026-09-19', 8],
      ['peak_week', '2026-11-07', 1],
      ['Wettkampf', '2026-11-14', 0],
    ])
  })

  it('der Anker steht zuletzt und ist markiert', () => {
    const plan = ankerplan(ANKER, [{ name: 'a', weeks: 4 }], 'Ziel')
    assert.equal(plan[plan.length - 1]?.anker, true,
      'die Ankerzeile ist nicht als solche erkennbar')
    assert.equal(plan.filter(z => z.anker).length, 1,
      'mehr als eine Ankerzeile')
  })

  it('absteigend nach Wochen, wie im Entwurf', () => {
    // `[read]` **Das Frueheste oben** — auch wenn die Spalte eine
    // andere Reihenfolge fuehrt.
    const plan = ankerplan(ANKER, [
      { name: 'spaet', weeks: 2 },
      { name: 'frueh', weeks: 20 },
      { name: 'mitte', weeks: 10 },
    ])
    assert.deepEqual(plan.map(z => z.name),
      ['frueh', 'mitte', 'spaet', 'Zieltag'])
  })

  it('eine Teilphase ohne Zahl faellt heraus', () => {
    // `[read]` **Statt auf dem Anker zu landen** — ein Datum, das nur
    // dasteht, weil eine Zahl fehlte, ist schlimmer als eine
    // fehlende Zeile.
    const plan = ankerplan(ANKER, [
      { name: 'gut', weeks: 8 },
      { name: 'kaputt', weeks: 'irgendwann' },
    ])
    assert.deepEqual(plan.map(z => z.name), ['gut', 'Zieltag'],
      '„kaputt" steht im Plan — mit welchem Datum?')
  })

  it('ohne Anker kein Plan', () => {
    assert.deepEqual(ankerplan('', [{ name: 'a', weeks: 4 }]), [])
    assert.deepEqual(ankerplan('morgen', [{ name: 'a', weeks: 4 }]), [])
  })

  it('die Gesamtdauer ist die groesste Wochenzahl', () => {
    // `[cmd]` **Der Entwurf zeigt „Total prep length: 24 wk"**
    // (`:305`). `[read]` **Keine eigene Eingabe** — sonst gingen
    // beide auseinander.
    const plan = ankerplan(ANKER, [
      { name: 'a', weeks: 24 }, { name: 'b', weeks: 8 },
    ])
    assert.equal(gesamtWochen(plan), 24)
    assert.equal(gesamtWochen([]), null)
  })

  it('die Rechnung ist server-frei', () => {
    // `[read]` **Der Auftrag: „Die Rechnung gehoert server-frei nach
    // `lib/goals/` — sie wird vom Editor (G-539) erneut gebraucht."**
    const q = lies(join(HIER, '..', 'anker.ts'))
    assert.ok(!/from '@lumeos\/shared\/session'|next\/headers/.test(q),
      'anker.ts zieht den Server-Baum — dann kann der Editor sie '
      + 'nicht aus einer Client-Datei benutzen (A-30)')
    assert.ok(!/Date\.now\(\)|new Date\(\)\s*[;.)]/.test(q),
      'anker.ts holt sich die Zeit selbst — der Anker kommt von aussen')
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — der Reiter zeigt Ziele, mehrere parallel
// ════════════════════════════════════════════════════════════════

describe('G-544/A1 — Ziele statt Phasentypen', () => {
  // G-656: phasen-zeitachse.tsx ist geloescht; die Phase Engine ist seit G-649 die
  // Plan-Seite (`plan-seite.tsx`), die Steuerung zeigt das Ziel (`reiter-goals.tsx`).
  const Z = () => lies(join(GOALS, 'plan-seite.tsx'))
  const R = () => lies(join(GOALS, 'reiter-goals.tsx'))

  it('kein Raster aus Phasenarten', () => {
    const q = Z()
    assert.ok(q.length > 1000, 'plan-seite.tsx nicht gefunden')
    assert.ok(!/PHASENARTEN\.map/.test(q) && !/PHASENARTEN\.map/.test(R()), 'es gibt wieder ein Raster aus Phasenarten')
  })

  it('mehrere offene Phasen werden je Ziel zugeordnet', () => {
    // `[cmd]` **`uq_goal_phases_one_open` steht auf `goal_id`** — die Steuerung
    // nimmt die Phase IHRES Ziels, nicht die erste.
    assert.match(R(), /phasen\.find\(x => x\.goal_id === goalId\)/,
      'die Phase wird nicht je Ziel zugeordnet — dann zeigten alle Ziele dieselbe')
  })

  it('der Leseweg holt ALLE offenen Phasen, nicht eine', () => {
    const q = lies(join(HIER, '..', 'lesen.ts'))
    const i = q.indexOf('export async function ladeOffenePhasen')
    assert.ok(i > 0, 'ladeOffenePhasen gibt es nicht')
    const rumpf = q.slice(i, i + 1200)
    assert.match(rumpf, /\.from\('goal_phases'\)/, 'der Leseweg ruft eine Funktion statt die Tabelle')
    assert.ok(!/phase_am/.test(rumpf), 'der Leseweg nutzt phase_am — die kann nur eine Phase liefern')
    assert.match(rumpf, /\.is\('actual_end_date', null\)/, 'es werden auch beendete Phasen geholt')
  })

  it('kein Plan ist kein leerer Reiter', () => {
    // `[read]` **Gemessen wird die BEDINGUNG** (der Waechter war einmal blind,
    // weil nur die Marke gesucht wurde).
    const q = Z()
    const i = q.search(/\) : \(\s*<section data-kein-aktiver-plan/)
    assert.ok(i > 0 && q.lastIndexOf('{aktiv ? (', i) > 0, 'der Leerfall haengt nicht mehr am aktiven Plan')
    assert.match(q.slice(i, i + 600), /Aktiviere einen Plan unten, lege einen neuen an oder setze in Goals eine Richtung/,
      'der Leerfall nennt keinen Weg')
  })

  it('ein Ziel ohne Phase sagt das', () => {
    assert.match(R(), /herkunft="ziel_ohne_laufende_phase"/, 'ein Ziel ohne Phase sieht aus wie eines mit')
  })

  it('die Seite rechnet gegen den Stichtag', () => {
    const q = Z()
    assert.ok(!/Date\.now\(\)|new Date\(\)/.test(q), 'die Seite holt sich die Zeit selbst')
    assert.match(q, /stichtag: string/, 'der Stichtag kommt nicht von aussen')
  })
})

// ════════════════════════════════════════════════════════════════
// A3 / A4 — Reihenfolge nennen, nichts selbst schreiben
// ════════════════════════════════════════════════════════════════

describe('G-544/A3 — planen heisst Reihenfolge', () => {
  it('die Empfehlung kommt aus der Kette, nicht aus einer Liste (G-669)', () => {
    const q = lies(join(GOALS, 'plan-seite.tsx'))
    // Vorher: „Danach empfohlen: …" aus `next_codes`. Nachtrag 18.10.: die Liste der moeglichen Programme ist
    // keine Empfehlung — Programm, Datum, Dauer und Grund liefert `goal_als_naechstes`.
    assert.ok(!/naechsteNamen|data-plan-danach/.test(q), 'die Liste aus next_codes steht wieder unter „Als nächstes"')
    assert.match(q, /phasenname\(\{ strategie_code: alsNaechstes\.programm/, 'das Programm wird nicht ueber den Katalog benannt')
    for (const code of ['lose', 'maintain', 'gain', 'aggressive_cut',
      'moderate_cut', 'conservative_cut', 'mini_cut', 'lean_bulk',
      'clean_bulk', 'aggressive_bulk', 'body_recomp', 'reverse_diet',
      'contest_prep', 'peak_week', 'expert_bb_annual',
      'maintenance_diet_break']) {
      assert.ok(!new RegExp(`[>\s]${code}[\s<·]`).test(q),
        `„${code}" steht als Text in der Seite — dann haengt sie an einer Zeile statt am Katalog`)
    }
  })
})

describe('G-544/A4 — die Seite selbst startet keine Phase', () => {
  // G-656: Editorknopf, „nur mit Strategie UND Phase" und „eigene Vorlagen nicht
  // versprechen" hingen am geloeschten Override-Editor; Vorlagen gibt es seit G-644.
  it('kein eigener Startweg', () => {
    const q = lies(join(GOALS, 'plan-seite.tsx'))
    assert.ok(q.length > 1000 && !/goal_phase_start|phaseStarten\(/.test(q),
      'die Seite startet Phasen selbst — Phasen entstehen ueber den Plan (goal_plan_activate)')
  })
})

describe('G-544 — die Kopfmarke verschweigt keine Phase', () => {
  it('sie zaehlt die offenen Phasen, statt eine zu nennen', () => {
    // `[cmd]` **Am BILD gefunden** (2026-09-30): bei zwei offenen
    // Phasen stand *„Phase lean bulk"* — die Marke las `echt.phase`
    // aus `phase_am()`, und deren Rumpf endet auf `LIMIT 1`.
    //
    // `[read]` **Eine von zwei zu nennen heisst, die andere zu
    // verschweigen.**
    // `[cmd]` **G-636 (2026-10-09): die Quelle ist jetzt `phase_am`** — ohne
    // `LIMIT 1` und nur Phasen AKTIVER Ziele (Rumpf live gelesen). Die
    // Tabelle (`offenePhasen`) zaehlte die Phase eines pausierten Ziels mit.
    const q = lies(join(GOALS, 'ansicht.tsx'))
    // Tom 16.10. (G-648/G-649): der Kopf traegt nur noch die Hauptaktion — die
    // Kopfmarke entfaellt. Damit kann sie auch keine Phase verschweigen.
    assert.ok(!/data-kopf-phasen|\} Phasen laufen`/.test(q), 'die Kopfmarke steht wieder im Kopf')
  })
})
