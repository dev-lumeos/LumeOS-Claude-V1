// G-121: die Scope-Filter der Vorlage (`hasChildOutOfRange`).
//
// `[read]` Die Regel aus dem Auftrag: **ein Elternteil bleibt
// sichtbar, wenn ein Kind auffaellig ist** — auch ueber zwei Stufen.
// Und: Zeilen ohne Referenz (`status: null`) sind nicht auffaellig,
// sondern unbewertet; der Filter darf sie nicht einsammeln.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  fensterOderTag, karteFuerWurzel, normalisiere, pruefeAnsicht,
  sichtbar, trifftSuche, zaehleSichtbare, zeigeKind,
} from '../naehrstoff-anzeige'
import type { NaehrstoffKnoten } from '../naehrstoff-ordnung'

function k(
  code: string, status: NaehrstoffKnoten['status'],
  kinder: NaehrstoffKnoten[] = [],
): NaehrstoffKnoten {
  return {
    code, name: code, einheit: 'g', stufe: 1, sort: 0,
    eltern: null, gruppe: 'Test', suchName: code.toLowerCase(), suchText: '',
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

test('normalisiere macht „Omega 3", „Omega-3" und „OMEGA_3" gleich', () => {
  assert.equal(normalisiere('Omega 3'), 'omega3')
  assert.equal(normalisiere('Omega-3-Fettsäuren, gesamt'), 'omega3fettsaurengesamt')
  assert.equal(normalisiere('Fettsäure C20:5 n-3 (EPA)'), 'fettsaurec205n3epa')
})

test('trifftSuche: 2 Zeichen nur Code, 3 auch Name, ab 4 auch Erklaertext', () => {
  const omegaName = normalisiere('FAPUN3 Omega-3-Fettsäuren, gesamt')
  const omegaText = normalisiere('entzuendungshemmend Lachs Makrele')
  assert.ok(trifftSuche('FAPUN3', omegaName, omegaText, 'Omega 3'))
  assert.ok(trifftSuche('FAPUN3', omegaName, omegaText, 'lachs'), 'Quelle ab 4 Zeichen')
  assert.ok(trifftSuche('FE', normalisiere('FE Eisen'), '', 'FE'), 'Code trifft exakt')
  assert.equal(trifftSuche('FAT', normalisiere('FAT Fett'), '', 'FE'), false,
    'zwei Zeichen suchen nur im Code')
  const epaName = normalisiere('F20:5CN3 Fettsäure C20:5 n-3 (Eicosapentaensäure, EPA)')
  assert.ok(trifftSuche('F20:5CN3', epaName, '', 'EPA'), 'drei Zeichen treffen den Namen')
  assert.equal(
    trifftSuche('VAL', normalisiere('VAL Valin'), normalisiere('Muskelreparatur'), 'EPA'),
    false, 'drei Zeichen fallen NICHT in den Erklaertext („R-epa-ratur")')
  assert.equal(trifftSuche('FAPUN3', omegaName, omegaText, ''), false)
  assert.ok(trifftSuche('FAPUN3', omegaName, omegaText, 'omega lachs'), 'alle Teile muessen sitzen')
  assert.equal(trifftSuche('FAPUN3', omegaName, omegaText, 'omega quark'), false)
})

test('zeigeKind: unter einem selbst auffaelligen Knoten erscheinen die Kinder mit Wert', () => {
  const eltern = k('VITA', 'ueber')
  const mitWert = k('CARTB', null)          // Wert 1, keine eigene Referenz
  const ohneWert = { ...k('RETOL', null), wert: null }
  assert.ok(zeigeKind(trifftScope(eltern), mitWert, 'auffaellig'))
  assert.equal(zeigeKind(trifftScope(eltern), ohneWert, 'auffaellig'), false)
  // Ohne auffaelligen Elternknoten gilt die alte Regel weiter.
  assert.equal(zeigeKind(false, mitWert, 'auffaellig'), false)
  function trifftScope(x: NaehrstoffKnoten): boolean {
    return x.status === 'unter' || x.status === 'ueber'
  }
})

test('karteFuerWurzel: acht Karten, die Makro-Aeste getrennt', () => {
  assert.equal(karteFuerWurzel('CHO', 'Makronährstoffe'), 'Kohlenhydrate')
  assert.equal(karteFuerWurzel('FIBT', 'Makronährstoffe'), 'Kohlenhydrate')
  assert.equal(karteFuerWurzel('FAT', 'Makronährstoffe'), 'Fette')
  assert.equal(karteFuerWurzel('PROT625', 'Makronährstoffe'), 'Protein')
  assert.equal(karteFuerWurzel('WATER', 'Makronährstoffe'), 'Sonstige')
  assert.equal(karteFuerWurzel('CHORL', 'Sonstige Nährstoffe'), 'Sonstige')
  assert.equal(karteFuerWurzel('FE', 'Elemente'), 'Elemente')
  assert.equal(karteFuerWurzel('ENERCC', 'Energie'), 'Energie')
})

test('fensterOderTag klammert auf Toms Liste', () => {
  assert.equal(fensterOderTag('30'), 30)
  assert.equal(fensterOderTag('2'), 1)
  assert.equal(fensterOderTag(undefined), 1)
  assert.equal(fensterOderTag('quatsch'), 1)
})
