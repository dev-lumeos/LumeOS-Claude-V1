// Woche und Restdauer der Phase — geprüft (G-87).
//
// `[read]` **Warum das eine Prüfung wert ist:** die Zahlen sind
// *gerechnet*, nicht gespeichert. `goals.goal_phases` führt weder
// Woche noch Fortschritt — die Regel aus C-119 verlangt, dass klar
// ist, welcher Wert gilt, und hier gibt es nur einen. Damit trägt die
// Rechnung allein, und ein Fehler fiele sonst niemandem auf.
//
// `[cmd]` DER FALL STAMMT AUS DEN ECHTEN DATEN, gemessen am
// 2026-08-20: die geltende Phase ist `lean_bulk` / `moderate`,
// `gueltig_ab` 2026-06-04, `projected_end_date` 2026-07-18,
// `actual_end_date` leer.
import test from 'node:test'
import assert from 'node:assert/strict'

import { phasenLauf } from '../phase-echt'
import type { Phase } from '../../../../lib/goals/lesen'

function phase(teil: Partial<Phase>): Phase {
  return {
    phase_id: 'p-1', goal_id: null, phase_type: 'lean_bulk',
    variant: 'moderate', parameters: {},
    gueltig_ab: null, projected_end_date: null, actual_end_date: null,
    transitioned_from: null, recommended_next: null, transition_reason: null,
    ...teil,
  }
}

test('Woche 1 ist die erste — Tag 0 zählt nicht als Woche 0', () => {
  const l = phasenLauf(
    phase({ gueltig_ab: '2026-06-04' }), '2026-06-04')
  assert.equal(l.tageBisher, 0)
  assert.equal(l.woche, 1)
})

test('der Wochenwechsel liegt nach sieben Tagen', () => {
  assert.equal(phasenLauf(phase({ gueltig_ab: '2026-06-04' }), '2026-06-10').woche, 1)
  assert.equal(phasenLauf(phase({ gueltig_ab: '2026-06-04' }), '2026-06-11').woche, 2)
})

test('die echte Phase am Stichtag 2026-08-20', () => {
  // 2026-06-04 bis 2026-08-20 sind 77 Tage; geplantes Ende 2026-07-18
  // liegt 44 Tage nach dem Start — die Phase ist überfällig.
  const l = phasenLauf(phase({
    gueltig_ab: '2026-06-04', projected_end_date: '2026-07-18',
  }), '2026-08-20')
  assert.equal(l.tageBisher, 77)
  assert.equal(l.tageGesamt, 44)
  assert.equal(l.woche, 12)
  assert.equal(l.wochenGesamt, 7)
  assert.equal(l.tageRest, -33, 'überfällig bleibt negativ, statt bei null zu klemmen')
  assert.equal(l.beendet, false)
})

test('das tatsächliche Ende schlägt das geplante', () => {
  const l = phasenLauf(phase({
    gueltig_ab: '2026-05-21',
    projected_end_date: '2026-06-30',
    actual_end_date: '2026-06-03',
  }), '2026-08-20')
  assert.equal(l.tageGesamt, 13, 'gerechnet gegen actual_end_date')
  assert.equal(l.beendet, true)
})

test('ohne Enddatum gibt es keine Restdauer — und keine erfundene', () => {
  const l = phasenLauf(phase({ gueltig_ab: '2026-06-04' }), '2026-08-20')
  assert.equal(l.tageBisher, 77)
  assert.equal(l.tageGesamt, null)
  assert.equal(l.wochenGesamt, null)
  assert.equal(l.tageRest, null)
})

test('ohne Startdatum bleibt alles leer', () => {
  const l = phasenLauf(phase({ projected_end_date: '2026-07-18' }), '2026-08-20')
  assert.equal(l.tageBisher, null)
  assert.equal(l.woche, null)
})

test('eine künftig beginnende Phase ergibt keine Woche', () => {
  // `[read]` Dieselbe Regel wie bei Training (G-69): eine künftige
  // Sitzung ist ein Plan. Woche 0 oder −1 wäre eine Falschaussage.
  const l = phasenLauf(phase({ gueltig_ab: '2026-09-01' }), '2026-08-20')
  assert.equal(l.tageBisher, -12)
  assert.equal(l.woche, null)
})

test('der Monatswechsel wird nicht verzählt', () => {
  // Über Mitternacht und Monatsgrenze — die Rechnung läuft über
  // 12 Uhr UTC, damit keine Zeitzone einen Tag frisst.
  assert.equal(phasenLauf(phase({ gueltig_ab: '2026-01-31' }), '2026-02-01').tageBisher, 1)
  assert.equal(phasenLauf(phase({ gueltig_ab: '2026-02-28' }), '2026-03-01').tageBisher, 1)
})
