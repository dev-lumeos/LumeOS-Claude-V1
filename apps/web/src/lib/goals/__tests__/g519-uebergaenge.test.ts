/**
 * G-519/A3 — die Uebergaenge als Regel
 *
 * `[cmd]` **Quelle: `docs/specs/Goals/PHASE_MODELS.md`**, am
 * 2026-09-28 gegen die Datei selbst gemessen. **Sechs Phasen tragen
 * `transitions_to`** (`:53, :73, :87, :110, :143, :163`), **drei
 * nicht** (`mini_cut`, `peak_week`, `expert_bb_annual`).
 *
 * `[read]` **Die Regel liegt in `phase-regeln.ts`, nicht in der
 * Ansicht** — dort hat sie kein Server-I/O und ueberlebt, waehrend
 * die Ansicht wechselt (G-519/B4: die Ansicht bleibt unangetastet,
 * bis A5 dran ist).
 *
 * `[read]` **Diese Datei trifft die Grenze von BEIDEN Seiten:** je
 * Phase eine erlaubte Folgephase gruen UND eine unerlaubte rot.
 * **Eine Probe, die nur das Erlaubte prueft, bliebe gruen, wenn die
 * Funktion einfach alles durchliesse.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  PHASENARTEN, UEBERGAENGE, UEBERGANG_UNBEKANNT,
  erlaubteFolgephasen, uebergangErlaubt, type Phasenart,
} from '../phase-regeln'

describe('G-519/A3 — die Uebergaenge folgen der Spec', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.equal(PHASENARTEN.length, 9,
      'nicht neun Phasenarten — der CHECK erlaubt neun')
  })

  // ── 1 · Die sechs belegten Saetze, Wort fuer Wort ───────────────
  //
  // `[read]` **Die Erwartung steht HIER ausgeschrieben, nicht aus
  // `UEBERGAENGE` abgeleitet** — sonst prueft sich die Tabelle
  // gegen sich selbst und kann nicht falsch werden.
  const AUS_DER_SPEC: Record<string, Phasenart[]> = {
    fat_loss: ['reverse_diet', 'maintenance', 'lean_bulk'],
    lean_bulk: ['mini_cut', 'maintenance', 'contest_prep'],
    maintenance: ['fat_loss', 'lean_bulk', 'recomp', 'contest_prep'],
    reverse_diet: ['maintenance', 'lean_bulk', 'fat_loss'],
    contest_prep: ['reverse_diet'],
    recomp: ['lean_bulk', 'fat_loss'],
  }

  for (const [phase, erwartet] of Object.entries(AUS_DER_SPEC)) {
    it(`${phase} — die Ziele stehen so in PHASE_MODELS.md`, () => {
      assert.deepEqual(
        [...UEBERGAENGE[phase as Phasenart]].sort(),
        [...erwartet].sort(),
        `${phase} weicht von der Spec ab`)
    })
  }

  // ── 2 · Die Grenze von BEIDEN Seiten ────────────────────────────
  //
  // `[cmd]` Je Phase ein Paar: ein Ziel, das die Spec nennt, und
  // eines, das sie NICHT nennt.
  const PAARE: Array<[Phasenart, Phasenart, Phasenart]> = [
    // [laufend, erlaubt, verboten]
    ['fat_loss', 'reverse_diet', 'contest_prep'],
    ['lean_bulk', 'mini_cut', 'fat_loss'],
    ['maintenance', 'recomp', 'reverse_diet'],
    ['reverse_diet', 'maintenance', 'contest_prep'],
    ['contest_prep', 'reverse_diet', 'lean_bulk'],
    ['recomp', 'lean_bulk', 'maintenance'],
  ]

  for (const [laufend, erlaubt, verboten] of PAARE) {
    it(`${laufend} -> ${erlaubt} erlaubt, -> ${verboten} nicht`, () => {
      assert.equal(uebergangErlaubt(laufend, erlaubt), true,
        `${laufend} -> ${erlaubt} steht in der Spec, wird aber abgewiesen`)
      assert.equal(uebergangErlaubt(laufend, verboten), false,
        `${laufend} -> ${verboten} steht NICHT in der Spec, wird aber `
        + 'erlaubt — die Regel laesst alles durch')
    })
  }

  // ── 3 · mini_cut ist abgeleitet, nicht belegt ───────────────────
  it('mini_cut fuehrt zurueck, nicht in reverse_diet', () => {
    // `[annahme]` **G-528:** vier Wochen unterdruecken nichts, was
    // hochgefahren werden muesste.
    assert.deepEqual([...UEBERGAENGE.mini_cut].sort(),
      ['lean_bulk', 'maintenance'],
      'mini_cut weicht von der G-528-Ableitung ab')
    assert.equal(uebergangErlaubt('mini_cut', 'reverse_diet'), false,
      'mini_cut -> reverse_diet ist erlaubt — genau das schliesst '
      + 'G-528 aus')
  })

  // ── 4 · Leer heisst nicht dasselbe wie unbekannt ────────────────
  it('die zwei Arten ohne Spec-Angabe sind als solche gekennzeichnet', () => {
    for (const p of ['peak_week', 'expert_bb_annual'] as Phasenart[]) {
      assert.equal(UEBERGAENGE[p].length, 0, `${p} traegt Ziele`)
      assert.ok(UEBERGANG_UNBEKANNT.has(p),
        `${p} ist leer, aber nicht als unbekannt gekennzeichnet — `
        + 'ein Aufrufer kann Luecke und Ende nicht unterscheiden')
    }
    // `[read]` **mini_cut ist NICHT unbekannt** — es hat eine
    // begruendete Ableitung.
    assert.ok(!UEBERGANG_UNBEKANNT.has('mini_cut'),
      'mini_cut gilt als unbekannt, obwohl G-528 es ableitet')
  })

  // ── 5 · Ohne laufende Phase ist jeder Anfang erlaubt ────────────
  it('ohne laufende Phase stehen alle neun offen', () => {
    assert.equal(erlaubteFolgephasen(null).length, 9,
      'ohne Phase wird eingeschraenkt — die Datenbank sperrt nur, '
      + 'solange eine LAEUFT (23505)')
  })

  // ── 6 · Kein Ziel ausserhalb der neun ───────────────────────────
  it('jedes genannte Ziel ist eine gueltige Phasenart', () => {
    const gueltig = new Set(PHASENARTEN.map(p => p.id))
    for (const [von, ziele] of Object.entries(UEBERGAENGE)) {
      for (const z of ziele) {
        assert.ok(gueltig.has(z),
          `${von} -> ${z}: diese Art gibt es im CHECK nicht`)
      }
    }
  })

  // ── 7 · Keine Phase zeigt auf sich selbst ───────────────────────
  it('keine Phase ist ihre eigene Folgephase', () => {
    for (const [von, ziele] of Object.entries(UEBERGAENGE)) {
      assert.ok(!ziele.includes(von as Phasenart),
        `${von} zeigt auf sich selbst — ein Wechsel auf dieselbe Art `
        + 'ist kein Wechsel')
    }
  })
})
