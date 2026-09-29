/**
 * G-519/A5 — das Eingabefeld fuer die Zielrate
 *
 * `[cmd]` **Gemessen 2026-09-29 gegen die laufende Datenbank**, nicht
 * aus der Spec abgetippt:
 *
 *     goal_phases_zielrate_aussengrenze    >= -2.5 AND <= 1.5
 *     goal_phases_zielrate_passt_zur_art   NOT VALID
 *       fat_loss, mini_cut   NOT NULL und < 0
 *       lean_bulk            NOT NULL und > 0
 *       maintenance          NULL oder |x| <= 0.1
 *       die uebrigen fuenf   NULL
 *
 * `[cmd]` **Der CHECK ist NOT VALID** — Bestandszeilen sind
 * ungeprueft, **neue und geaenderte nicht.** Das Feld laeuft
 * dagegen, also prueft es vorher.
 *
 * `[cmd]` **Die kcal-Formel gegen `goals.kcal_delta_aus_zielrate`
 * nachgerechnet, vier von vier gleich:**
 *
 *     -1,0 % / 45 kg    -> -495,0
 *     -1,0 % / 120 kg   -> -1320,0
 *     +0,25 % / 80 kg   -> +220,0
 *     -0,5 % / 81,4 kg  -> -447,7
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  RATENPFLICHT, RATE_MIN, RATE_MAX,
  kcalDeltaAusRate, pruefeRate, PHASENARTEN,
  type Phasenart,
} from '../phase-regeln'

describe('G-519/A5 — die Rate folgt den zwei CHECKs', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.equal(Object.keys(RATENPFLICHT).length, 9,
      'nicht neun Arten — der CHECK nennt neun')
    assert.equal(RATE_MIN, -2.5, 'die Aussengrenze unten weicht ab')
    assert.equal(RATE_MAX, 1.5, 'die Aussengrenze oben weicht ab')
  })

  // ── 1 · Je Art die Pflicht aus dem CHECK ────────────────────────
  //
  // `[read]` **Ausgeschrieben, nicht aus RATENPFLICHT abgeleitet** —
  // sonst prueft sich die Tabelle gegen sich selbst.
  const AUS_DEM_CHECK: Record<Phasenart, string> = {
    fat_loss: 'negativ', mini_cut: 'negativ',
    lean_bulk: 'positiv',
    maintenance: 'nahe_null',
    recomp: 'keine', contest_prep: 'keine', reverse_diet: 'keine',
    peak_week: 'keine', expert_bb_annual: 'keine',
  }

  for (const [art, pflicht] of Object.entries(AUS_DEM_CHECK)) {
    it(`${art} — Pflicht „${pflicht}" wie im CHECK`, () => {
      assert.equal(RATENPFLICHT[art as Phasenart], pflicht,
        `${art} weicht von goal_phases_zielrate_passt_zur_art ab`)
    })
  }

  it('alle neun Arten sind abgedeckt', () => {
    for (const p of PHASENARTEN) {
      assert.ok(RATENPFLICHT[p.id], `${p.id} fehlt in RATENPFLICHT`)
    }
  })

  // ── 2 · Die Grenze von BEIDEN Seiten ────────────────────────────
  it('fat_loss: negativ geht, null und positiv nicht', () => {
    assert.deepEqual(pruefeRate('fat_loss', -0.5), [])
    assert.equal(pruefeRate('fat_loss', 0).length, 1,
      'Rate 0 wird bei fat_loss erlaubt — der CHECK verlangt < 0')
    assert.equal(pruefeRate('fat_loss', 0.5).length, 1,
      'eine positive Rate wird bei fat_loss erlaubt')
    assert.equal(pruefeRate('fat_loss', null).length, 1,
      'fat_loss ohne Rate wird erlaubt — der CHECK verlangt NOT NULL')
  })

  it('lean_bulk: positiv geht, null und negativ nicht', () => {
    assert.deepEqual(pruefeRate('lean_bulk', 0.25), [])
    assert.equal(pruefeRate('lean_bulk', 0).length, 1)
    assert.equal(pruefeRate('lean_bulk', -0.25).length, 1)
    assert.equal(pruefeRate('lean_bulk', null).length, 1)
  })

  it('maintenance: nahe null geht, weiter weg nicht', () => {
    assert.deepEqual(pruefeRate('maintenance', 0), [])
    assert.deepEqual(pruefeRate('maintenance', 0.1), [])
    assert.deepEqual(pruefeRate('maintenance', -0.1), [])
    assert.deepEqual(pruefeRate('maintenance', null), [],
      'maintenance darf auch NULL sein')
    assert.equal(pruefeRate('maintenance', 0.2).length, 1,
      '0,2 wird beim Halten erlaubt — der CHECK verlangt |x| <= 0,1')
  })

  it('die fuenf ohne Rate weisen jede Zahl ab', () => {
    for (const art of ['recomp', 'contest_prep', 'reverse_diet',
      'peak_week', 'expert_bb_annual'] as Phasenart[]) {
      assert.deepEqual(pruefeRate(art, null), [],
        `${art} ohne Rate muss durchgehen`)
      assert.equal(pruefeRate(art, -0.5).length, 1,
        `${art} nimmt eine Rate an — der CHECK verlangt NULL`)
    }
  })

  // ── 3 · Die Aussengrenze ────────────────────────────────────────
  it('die Aussengrenze gilt vor dem Vorzeichen', () => {
    assert.equal(pruefeRate('fat_loss', -2.5).length, 0,
      '-2,5 ist der erlaubte Rand')
    assert.equal(pruefeRate('fat_loss', -2.6).length, 1,
      '-2,6 liegt ausserhalb und wird erlaubt')
    assert.equal(pruefeRate('lean_bulk', 1.5).length, 0,
      '1,5 ist der erlaubte Rand')
    assert.equal(pruefeRate('lean_bulk', 1.6).length, 1,
      '1,6 liegt ausserhalb und wird erlaubt')
  })

  // ── 4 · Die kcal-Formel, gegen die Datenbank ────────────────────
  //
  // `[cmd]` **Die vier Sollwerte stammen aus
  // `goals.kcal_delta_aus_zielrate`**, nicht aus dieser Datei.
  for (const [rate, kg, soll] of [
    [-1.0, 45, -495.0], [-1.0, 120, -1320.0],
    [0.25, 80, 220.0], [-0.5, 81.4, -447.7],
  ] as Array<[number, number, number]>) {
    it(`${rate} % bei ${kg} kg sind ${soll} kcal/Tag`, () => {
      assert.equal(kcalDeltaAusRate(rate, kg), soll,
        'weicht von goals.kcal_delta_aus_zielrate ab — zwei Kopien '
        + 'derselben Rechenregel driften')
    })
  }

  it('ohne Gewicht gibt es kein Delta', () => {
    assert.equal(kcalDeltaAusRate(-0.5, null), null,
      'ohne Koerpergewicht wird ein Delta gerechnet — es waere '
      + 'erfunden')
    assert.equal(kcalDeltaAusRate(null, 80), null)
  })
})
