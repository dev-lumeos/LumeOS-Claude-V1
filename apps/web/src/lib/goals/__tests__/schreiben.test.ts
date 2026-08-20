// G-79: die Regeln, die vor dem Schreiben greifen.
//
// `[cmd]` Sie stehen in `ziel-regeln.ts`, nicht in
// `schreiben.ts` — sonst zieht ein Wert-Import aus einer
// `'use client'`-Datei das Server-I/O ins Browserbuendel.
// Gemessen: HTTP 500 auf jeder Seite.
//
// `[read]` Reine Pruefung, kein Netz. Sie bildet die CHECK-Bedingungen
// der Tabelle ab — ein Fehler hier faellt sonst erst als
// Postgres-Meldung in der Oberflaeche auf.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  pruefeAenderung, STATUS_WERTE, ABGESCHLOSSEN,
  PRIO_MIN_AKTIV, PRIO_MAX_AKTIV, PRIO_MAX,
} from '../ziel-regeln'

test('die fuenf Status sind die der CHECK-Bedingung', () => {
  // `[cmd]` user_goals_status_check.
  assert.deepEqual([...STATUS_WERTE].sort(),
    ['abandoned', 'achieved', 'active', 'on_hold', 'paused'])
})

test('erreicht und abgebrochen gelten als abgeschlossen', () => {
  assert.ok(ABGESCHLOSSEN.includes('achieved'))
  assert.ok(ABGESCHLOSSEN.includes('abandoned'))
  assert.ok(!ABGESCHLOSSEN.includes('active'))
  // `paused` ist NICHT abgeschlossen — ein pausiertes Ziel laeuft
  // weiter, es ruht nur.
  assert.ok(!ABGESCHLOSSEN.includes('paused'))
})

test('ein aktives Ziel traegt Prioritaet 1 bis 3', () => {
  // `[cmd]` user_goals_check1: status <> 'active' OR priority BETWEEN 1 AND 3.
  assert.equal(pruefeAenderung({ priority: 1 }), null)
  assert.equal(pruefeAenderung({ priority: 3 }), null)
  assert.ok(pruefeAenderung({ priority: 4 }),
    'Prioritaet 4 muss bei einem aktiven Ziel abgelehnt werden.')
  assert.ok(pruefeAenderung({ priority: 5 }))
})

test('ein abgeschlossenes Ziel darf bis 10 tragen', () => {
  // `user_goals_priority_check` erlaubt 1-10; die Enge auf 1-3 gilt
  // nur fuer aktive.
  assert.equal(pruefeAenderung({ priority: 7, status: 'achieved' }), null)
  assert.equal(pruefeAenderung({ priority: PRIO_MAX, status: 'abandoned' }), null)
  assert.ok(pruefeAenderung({ priority: 11, status: 'achieved' }),
    'Ueber 10 verletzt user_goals_priority_check.')
})

test('die Prioritaetsgrenzen stimmen mit der Tabelle ueberein', () => {
  assert.equal(PRIO_MIN_AKTIV, 1)
  assert.equal(PRIO_MAX_AKTIV, 3)
  assert.equal(PRIO_MAX, 10)
})

test('ein leerer Titel wird abgelehnt', () => {
  // `[cmd]` user_goals_title_check: btrim(title) <> ''.
  assert.ok(pruefeAenderung({ title: '' }))
  assert.ok(pruefeAenderung({ title: '   ' }))
  assert.equal(pruefeAenderung({ title: 'Lean Bulk' }), null)
})

test('eine gebrochene Prioritaet wird abgelehnt', () => {
  assert.ok(pruefeAenderung({ priority: 1.5 }))
})

test('ein unbekannter Status wird abgelehnt', () => {
  assert.ok(pruefeAenderung({ status: 'fertig' as never }))
})

test('ein Zielwert muss eine Zahl sein — null ist erlaubt', () => {
  assert.equal(pruefeAenderung({ target_value: null }), null)
  assert.equal(pruefeAenderung({ target_value: 86.5 }), null)
  assert.ok(pruefeAenderung({ target_value: Number.NaN }))
})

test('eine leere Aenderung ist gueltig', () => {
  // Wer nur den Titel aendert, soll nicht ueber die Prioritaet
  // stolpern.
  assert.equal(pruefeAenderung({}), null)
})
