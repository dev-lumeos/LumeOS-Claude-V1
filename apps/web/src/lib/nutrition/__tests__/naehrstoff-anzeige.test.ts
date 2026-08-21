// G-121: die Scope-Filter der Vorlage (`hasChildOutOfRange`).
//
// `[read]` Die Regel aus dem Auftrag: **ein Elternteil bleibt
// sichtbar, wenn ein Kind auffaellig ist** — auch ueber zwei Stufen.
// Und: Zeilen ohne Referenz (`status: null`) sind nicht auffaellig,
// sondern unbewertet; der Filter darf sie nicht einsammeln.
import test from 'node:test'
import assert from 'node:assert/strict'

import { fensterOderTag, sichtbar, zaehleSichtbare } from '../naehrstoff-anzeige'
import type { NaehrstoffKnoten } from '../naehrstoff-ordnung'

function k(
  code: string, status: NaehrstoffKnoten['status'],
  kinder: NaehrstoffKnoten[] = [],
): NaehrstoffKnoten {
  return {
    code, name: code, einheit: 'g', stufe: 1, sort: 0,
    wert: 1, summe: 1, positionen: 1, positionenMitWert: 1,
    positionenOhneWert: 0, tageErfasst: 1, tageVollstaendig: 1,
    ziel: null, zielMax: null, zielArt: null, obergrenze: null,
    prozent: null, status, kinder,
  }
}

test('ein Elternteil im Bereich bleibt sichtbar, wenn ein Enkel auffaellig ist', () => {
  const baum = k('FAT', 'im', [k('PUFA', 'im', [k('OMEGA3', 'unter')])])
  assert.ok(sichtbar(baum, 'auffaellig'))
  assert.ok(sichtbar(baum, 'unter'))
})

test('ohne auffaellige Nachkommen verschwindet die Zeile aus dem Filter', () => {
  const baum = k('SUGAR', 'im', [k('GLUS', 'im'), k('FRUS', null)])
  assert.equal(sichtbar(baum, 'auffaellig'), false)
  assert.ok(sichtbar(baum, 'alle'))
})

test('status null ist unbewertet, nicht auffaellig', () => {
  assert.equal(sichtbar(k('STARCH', null), 'auffaellig'), false)
  assert.equal(sichtbar(k('STARCH', null), 'unter'), false)
})

test('„ueber" zaehlt als auffaellig, aber nicht als „unter Ziel"', () => {
  assert.ok(sichtbar(k('NA', 'ueber'), 'auffaellig'))
  assert.equal(sichtbar(k('NA', 'ueber'), 'unter'), false)
})

test('zaehleSichtbare zaehlt Eltern und getroffene Kinder mit', () => {
  const baum = [k('FAT', 'im', [k('PUFA', 'im', [k('OMEGA3', 'unter')])]), k('CHO', 'im')]
  // FAT und PUFA bleiben wegen OMEGA3 stehen; CHO faellt raus.
  assert.equal(zaehleSichtbare(baum, 'auffaellig'), 3)
  assert.equal(zaehleSichtbare(baum, 'alle'), 4)
})

test('fensterOderTag klammert auf Toms Liste', () => {
  assert.equal(fensterOderTag('30'), 30)
  assert.equal(fensterOderTag('2'), 1)
  assert.equal(fensterOderTag(undefined), 1)
  assert.equal(fensterOderTag('quatsch'), 1)
})
