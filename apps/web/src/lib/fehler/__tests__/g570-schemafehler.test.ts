// G-570/A4: `PGRST202` ist ein eigener Zustand, kein Datenfehler.
import test from 'node:test'
import assert from 'node:assert/strict'

import { fehlerart, fehlertexte } from '../ladefehler'

// `[cmd]` **Woertlich von PostgREST 14.3**, 2026-10-03 im Docker-Netz
// mit einem Wegwerf-Parameter gerufen (`p_g570_wegwerf`) — kein
// Eingriff in die Datenbank.
const ECHT = 'Could not find the function goals.berechne_zielwerte'
  + '(p_g570_wegwerf, p_user_id) in the schema cache'
// `[cmd]` **Toms Meldung vom 2026-10-03, 11:43** — veralteter Cache.
const TOM = 'Could not find the function goals.berechne_zielwerte'
  + '(p_stichtag, p_user_id) in the schema cache'

test('G-570: die PostgREST-Meldung ist ein Schemafehler', () => {
  assert.equal(fehlerart(ECHT), 'schema')
  assert.equal(fehlerart(TOM), 'schema')
  assert.equal(fehlerart(null, 'PGRST202'), 'schema')
})

test('G-570: der Satz nennt beide Ursachen — Einspielen und Cache', () => {
  const t = fehlertexte('schema', 'Goals')
  assert.equal(t.titel, 'Goals')
  assert.match(t.satz, /nicht eingespielt/)
  assert.match(t.satz, /Schema-Cache/)
  assert.doesNotMatch(t.satz, /Daten konnten nicht geladen/,
    'der Satz schickt wieder auf die Suche nach den Daten')
})

test('G-570: nur die PostgREST-Form, nicht jede aehnliche Meldung', () => {
  // `[read]` **Im Zweifel Datenfehler** (G-553) — ein eigener Text mit
  // „could not find the function" ohne Cache bleibt ein Datenfehler.
  assert.equal(fehlerart('could not find the function foo'), 'daten')
  assert.equal(fehlerart('relation goals.x does not exist'), 'daten')
  // Die bestehenden Arten bleiben, wie sie waren.
  assert.equal(fehlerart('JWT issued at future'), 'sitzung')
  assert.equal(fehlerart('irgendwas', 'NO_SESSION'), 'sitzung')
})

test('G-570: ein Funktionsname mit Sitzungswort bleibt ein Schemafehler', () => {
  // `[read]` Die Pruefung steht VOR den Sitzungsmerkmalen.
  assert.equal(fehlerart('Could not find the function auth.refresh_token_x(p) '
    + 'in the schema cache'), 'schema')
})
