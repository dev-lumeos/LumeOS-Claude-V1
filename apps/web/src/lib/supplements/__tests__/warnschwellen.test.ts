// C-107: WADA und Warnschwellen im Detail — und die JSON-Null.
//
// ── DIE FALLE, DIE DIESEN TEST NOETIG MACHT ─────────────────────────
//
// `[cmd]` **Gemessen am 2026-08-23:**
// `supplement_warnings.dose_ceiling` ist bei **290 von 290** Zeilen
// `is not null` — **258 davon tragen aber `null` als JSON-Wert.**
// Echt gefuellt sind **32**.
//
// `[read]` **Die Zeilenzahl haette hier zu einer falschen Aussage
// gefuehrt.** „290 von 290 haben eine Obergrenze" ist SQL-richtig und
// fachlich falsch. Ohne `jsonNull` stuende bei 258 Substanzen das Wort
// „null" in der Kachel — und eine hingeschriebene Null sieht aus wie
// eine gemessene.
//
// ── DIE WERTE SIND ECHT ─────────────────────────────────────────────
//
// `[cmd]` Beide Vorlagen unten stehen so in der Datenbank
// (2026-08-23), nicht ausgedacht:
//   `sub_9f9bb8c160` Creatine monohydrate — WADA not_prohibited,
//      dose_ceiling mit ISSN-Beleg (PMID 28615996)
//   `sub_906d55f873` 1-Testosterone — WADA prohibited,
//      dose_ceiling JSON-`null`, dafuer ein Konsultationshinweis
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { jsonNull } from '../substanz-luecken'

test('das JSON-Literal null faellt weg, der echte Wert bleibt', () => {
  // `[cmd]` Der Fall der 32: eine belegte Obergrenze.
  const creatin = jsonNull({
    dose_ceiling: {
      basis: 'guideline (ISSN)',
      value: '3-5 g/day maintenance (ISSN position stand)',
      source: 'ISSN 2017 (PMID 28615996)',
    },
    doctor_consult_flags: ['serum creatinine rise is EXPECTED and benign'],
    warning_de: null,
    warning_en: null,
  })
  assert.ok(creatin, 'Die Kachel entsteht.')
  assert.ok(creatin.dose_ceiling, 'Die Obergrenze bleibt.')
  assert.ok(creatin.doctor_consult_flags, 'Der Hinweis bleibt.')
  assert.equal('warning_de' in creatin, false, 'Der leere Warntext faellt weg.')
  assert.equal('warning_en' in creatin, false)
})

test('dose_ceiling als JSON-null zaehlt NICHT als Obergrenze', () => {
  // `[cmd]` Der Fall der 258 — 1-Testosterone.
  const ohne = jsonNull({
    dose_ceiling: null,
    doctor_consult_flags: ['WADA-prohibited designer/anabolic compound'],
    warning_en: null,
  })
  assert.ok(ohne, 'Der Konsultationshinweis traegt die Kachel allein.')
  assert.equal('dose_ceiling' in ohne, false,
    'Eine JSON-null darf nicht als Obergrenze erscheinen — sonst stuende '
    + 'bei 258 Substanzen „null" da, wo ein Messwert hingehoert.')
})

test('ist alles null, entsteht gar keine Kachel', () => {
  // `[read]` **Kein leerer Block, kein Strich.** Die Anzeige laesst
  // Bloecke ohne ein einziges gefuelltes Feld weg (C-224).
  assert.equal(jsonNull({ dose_ceiling: null, warning_de: null, warning_en: null }), null)
  assert.equal(jsonNull(null), null)
})

test('leeres Objekt und leeres Array sagen auch nichts', () => {
  assert.equal(jsonNull({ a: {}, b: [] }), null)
  assert.deepEqual(jsonNull({ a: {}, b: ['x'] }), { b: ['x'] })
})

test('die Null selbst bleibt, wo sie ein Messwert ist', () => {
  // `[read]` **Die Zahl 0 ist ein Wert, `null` ist keiner.** Ein
  // `detection_time_days: 0` hiesse „am selben Tag nicht mehr
  // nachweisbar" und darf nicht mit der Leerstelle verwechselt werden.
  assert.deepEqual(jsonNull({ detection_time_days: 0 }), { detection_time_days: 0 })
  assert.deepEqual(jsonNull({ x: false }), { x: false })
})
