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
  const Z = () => lies(join(GOALS, 'phasen-zeitachse.tsx'))

  it('die Achse liest die ZIELE, nicht die Phasenarten', () => {
    const q = Z()
    assert.match(q, /data-zielzeile=\{g\.goal_id\}/,
      'es gibt keine Zeile je Ziel')
    assert.ok(!/PHASENARTEN\.map/.test(q),
      'die Achse baut wieder ein Raster aus Phasenarten')
  })

  it('mehrere offene Phasen werden je Ziel zugeordnet', () => {
    // `[cmd]` **`uq_goal_phases_one_open` steht auf `goal_id`** —
    // zwei Ziele mit je einer offenen Phase sind erlaubt.
    const q = Z()
    assert.match(q, /phasen\.find\(x => x\.goal_id === z\.goal_id\)/,
      'die Phase wird nicht je Ziel zugeordnet — dann zeigten alle '
      + 'Ziele dieselbe')
  })

  it('der Leseweg holt ALLE offenen Phasen, nicht eine', () => {
    // `[cmd]` **`phase_am()` endet auf `LIMIT 1`** — gemessen an
    // `prosrc`. `[read]` **Deshalb liest `ladeOffenePhasen` die
    // Tabelle.**
    const q = lies(join(HIER, '..', 'lesen.ts'))
    const i = q.indexOf('export async function ladeOffenePhasen')
    assert.ok(i > 0, 'ladeOffenePhasen gibt es nicht')
    const rumpf = q.slice(i, i + 1200)
    assert.match(rumpf, /\.from\('goal_phases'\)/,
      'der Leseweg ruft eine Funktion statt die Tabelle')
    assert.ok(!/phase_am/.test(rumpf),
      'der Leseweg nutzt phase_am — die kann nur eine Phase liefern')
    assert.match(rumpf, /\.is\('actual_end_date', null\)/,
      'es werden auch beendete Phasen geholt — die sind Verlauf, '
      + 'nicht Gegenwart')
  })

  it('kein Ziel ist kein leerer Reiter', () => {
    // `[read]` **A1: „Kein Ziel ist kein leerer Reiter, sondern der
    // Weg zum Anlegen (G-537)."**
    //
    // `[read]` **Dieser Waechter war zuerst blind.** Er suchte die
    // MARKEN `data-zeitachse-leer` und `data-zeitachse-neu`
    // irgendwo in der Datei — **die Sabotage ersetzte die
    // Bedingung durch `false` und blieb gruen**, weil beide
    // Marken im Quelltext stehen blieben, nur unerreichbar.
    //
    // `[read]` **Gemessen wird jetzt die BEDINGUNG**, an der der
    // Leerfall haengt.
    const q = Z()
    assert.match(q, /\{zeilen\.length === 0 \? \(/,
      'der Leerfall haengt nicht mehr an der Zahl der Ziele — dann '
      + 'ist er entweder immer oder nie da')
    const i = q.indexOf('zeilen.length === 0')
    const zweig = q.slice(i, i + 900)
    assert.match(zweig, /data-zeitachse-leer/,
      'der Leerfall hat keine Marke')
    assert.match(zweig, /data-zeitachse-neu/,
      'der Leerfall bietet keinen Weg zum Anlegen')
    assert.match(zweig, /onClick=\{onNeuesZiel\}/,
      'der Knopf ruft nichts — ein Weg, der nirgends hinfuehrt')
  })

  it('ein Ziel ohne Phase sagt das', () => {
    const q = Z()
    assert.match(q, /keine laufende Phase/,
      'ein Ziel ohne Phase sieht aus wie eines mit — der Unterschied '
      + 'muss dastehen')
  })

  it('die Achse rechnet gegen den Stichtag', () => {
    const q = Z()
    assert.ok(!/Date\.now\(\)|new Date\(\)/.test(q),
      'die Achse holt sich die Zeit selbst')
    assert.match(q, /heute=\{echt\.stichtag\}|heute: string/,
      'der Stichtag kommt nicht von aussen')
  })
})

// ════════════════════════════════════════════════════════════════
// A3 / A4 — Reihenfolge nennen, Editor nicht versprechen
// ════════════════════════════════════════════════════════════════

describe('G-544/A3 — planen heisst Reihenfolge', () => {
  it('die Folgephasen kommen aus next_codes', () => {
    // `[cmd]` **8 der 17 Katalogzeilen fuehren `next_codes`** —
    // gemessen 2026-09-30.
    // `[read]` **Dieser Waechter war zuerst blind:** er suchte
    // `next_codes` irgendwo in der Datei — **die Sabotage tippte die
    // Codes daneben fest ein und blieb gruen**, weil der Bezeichner
    // im Kommentar weiterstand.
    //
    // `[read]` **Gemessen wird die AUSGABE**, und dass kein Code als
    // Literal danebensteht.
    const q = lies(join(GOALS, 'phasen-zeitachse.tsx'))
    assert.match(q, /\{z\.strategie\.next_codes\.join\(/,
      'die Folgephasen werden nicht aus der Katalogzeile ausgegeben')
    assert.match(q, /data-zielfolge/, 'sie tragen keine Marke')
    // `[cmd]` **Die 17 Codes, gemessen 2026-09-30** — keiner davon
    // darf als Literal in der Achse stehen.
    for (const code of ['lose', 'maintain', 'gain', 'aggressive_cut',
      'moderate_cut', 'conservative_cut', 'mini_cut', 'lean_bulk',
      'clean_bulk', 'aggressive_bulk', 'body_recomp', 'reverse_diet',
      'contest_prep', 'peak_week', 'expert_bb_annual',
      'maintenance_diet_break']) {
      assert.ok(!new RegExp(`[>\s]${code}[\s<·]`).test(q),
        `„${code}" steht als Text in der Achse — dann haengt sie an `
        + 'einer Zeile statt am Katalog')
    }
  })
})

describe('G-544/A4 — der Editor wird nicht versprochen', () => {
  const Z = () => lies(join(GOALS, 'phasen-zeitachse.tsx'))

  it('kein Knopf in den Editor', () => {
    // `[read]` **A4: „Kein Knopf, der dorthin zeigt, solange er
    // nicht existiert."**
    const q = Z()
    assert.ok(!/PhaseEditorModal|editorOeffnen|Editor oeffnen/.test(q),
      'ein Knopf zeigt auf den Editor — den gibt es erst mit G-539')
  })

  it('die Grenze steht als Satz da', () => {
    assert.match(Z(), /data-zeitachse-grenze/,
      'es steht nicht da, was die Achse NICHT kann — dann sieht sie '
      + 'aus wie ein fertiger Editor')
    assert.match(Z(), /G-539/,
      'der Satz nennt den Punkt nicht, auf den er wartet')
  })

  it('die Achse schreibt nicht', () => {
    const q = Z()
    assert.ok(!/goal_phase_start|phaseStarten|Aktion\(/.test(q),
      'die Achse schreibt — sie zeigt und plant, mehr nicht')
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
    const q = lies(join(GOALS, 'ansicht.tsx'))
    assert.match(q, /echt\.offenePhasen\.length > 0 && \(/,
      'die Kopfmarke haengt nicht an der Zahl der offenen Phasen')
    assert.match(q, /Phasen laufen/,
      'bei mehreren Phasen wird immer noch EINE genannt')
    assert.match(q, /data-kopf-phasen=\{echt\.offenePhasen\.length\}/,
      'die Zahl ist nicht am Schirm nachzaehlbar')
  })
})
