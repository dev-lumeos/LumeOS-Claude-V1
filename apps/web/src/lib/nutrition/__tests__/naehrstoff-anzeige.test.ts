// G-121: die Scope-Filter der Vorlage (`hasChildOutOfRange`).
//
// `[read]` Die Regel aus dem Auftrag: **ein Elternteil bleibt
// sichtbar, wenn ein Kind auffaellig ist** — auch ueber zwei Stufen.
// Und: Zeilen ohne Referenz (`status: null`) sind nicht auffaellig,
// sondern unbewertet; der Filter darf sie nicht einsammeln.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  fensterOderTag, pruefeAnsicht, sichtbar, zaehleSichtbare,
} from '../naehrstoff-anzeige'
import type { NaehrstoffKnoten } from '../naehrstoff-ordnung'

function k(
  code: string, status: NaehrstoffKnoten['status'],
  kinder: NaehrstoffKnoten[] = [],
): NaehrstoffKnoten {
  return {
    code, name: code, einheit: 'g', stufe: 1, sort: 0,
    eltern: null, gruppe: 'Test',
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

test('pruefeAnsicht nimmt nur die vollstaendige, saubere Form an', () => {
  const gut = { offen: ['g:Elemente', 'SUGAR'], fenster: 30, scope: 'auffaellig' }
  assert.deepEqual(pruefeAnsicht(gut), gut)
  // Kaputtes wird verworfen, nicht repariert — dann gilt „alles zu".
  assert.equal(pruefeAnsicht(null), null)
  assert.equal(pruefeAnsicht({ offen: 'SUGAR', fenster: 30, scope: 'alle' }), null)
  assert.equal(pruefeAnsicht({ offen: [], fenster: 2, scope: 'alle' }), null)
  assert.equal(pruefeAnsicht({ offen: [], fenster: 7, scope: 'egal' }), null)
  assert.equal(pruefeAnsicht({ offen: [42], fenster: 7, scope: 'alle' }), null)
  assert.equal(
    pruefeAnsicht({ offen: Array.from({ length: 301 }, () => 'x'), fenster: 7, scope: 'alle' }),
    null,
  )
})

test('fensterOderTag klammert auf Toms Liste', () => {
  assert.equal(fensterOderTag('30'), 30)
  assert.equal(fensterOderTag('2'), 1)
  assert.equal(fensterOderTag(undefined), 1)
  assert.equal(fensterOderTag('quatsch'), 1)
})
