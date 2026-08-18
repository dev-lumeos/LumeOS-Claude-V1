// Die Altersrechnung des Goals-Lesepfads — geprüft.
//
// `[read]` Warum überhaupt gerechnet wird: die Attrappe zeigt
// `36 years` als feste Zahl. Das Profil führt `birth_date`
// (`[cmd]` 1995-03-15) — daraus ist das Alter ableitbar, und zwar
// **ohne `Date.now()`**: der Stichtag kommt von aussen. Das ist
// dieselbe Regel wie in `lib/datum.ts` und der Grund, warum G-28 das
// feste „Heute" übernommen hatte.
//
// `[cmd]` Der Fall, der eine Rechnung nötig macht: am 2026-03-14 ist
// dieselbe Person 30, am 2026-03-15 ist sie 31. Eine Subtraktion der
// Jahreszahlen allein liefert an 74 von 365 Tagen einen Wert zu viel.
import test from 'node:test'
import assert from 'node:assert/strict'

import { alterAm } from '../lesen'

test('das Alter kippt am Geburtstag, nicht am Jahreswechsel', () => {
  const geburt = '1995-03-15'

  // Der Tag davor, der Tag selbst, der Tag danach.
  assert.equal(alterAm(geburt, '2026-03-14'), 30, 'einen Tag vor dem Geburtstag')
  assert.equal(alterAm(geburt, '2026-03-15'), 31, 'am Geburtstag selbst')
  assert.equal(alterAm(geburt, '2026-03-16'), 31, 'einen Tag danach')

  // Jahresraender: der 1. Januar liegt VOR dem Geburtstag.
  assert.equal(alterAm(geburt, '2026-01-01'), 30)
  assert.equal(alterAm(geburt, '2026-12-31'), 31)

  // `[cmd]` Der Stichtag des Auftrags.
  assert.equal(alterAm(geburt, '2026-08-18'), 31)
})

test('ohne Geburtsdatum kommt keine erfundene Zahl', () => {
  assert.equal(alterAm(null, '2026-08-18'), null)
  assert.equal(alterAm('', '2026-08-18'), null)
  // Unlesbares Datum ergibt `null`, nicht NaN — eine NaN-Zahl waere in
  // der Anzeige „NaN years".
  assert.equal(alterAm('nicht-ein-datum', '2026-08-18'), null)
  assert.equal(alterAm('1995-03-15', 'kaputt'), null)
})

test('ein Stichtag vor der Geburt ergibt kein negatives Alter', () => {
  // Kein realer Fall, aber die Funktion darf nicht `-3 years` liefern.
  assert.equal(alterAm('1995-03-15', '1992-01-01'), null)
})

test('der 29. Februar kippt am 1. Maerz eines Nicht-Schaltjahres', () => {
  // `[annahme]` Die uebliche Auslegung: wer am 29.02. geboren ist,
  // wird in Nicht-Schaltjahren am 1. Maerz ein Jahr aelter. Die
  // Monats/Tages-Vergleichung liefert das ohne Sonderfall.
  assert.equal(alterAm('2000-02-29', '2026-02-28'), 25)
  assert.equal(alterAm('2000-02-29', '2026-03-01'), 26)
})
