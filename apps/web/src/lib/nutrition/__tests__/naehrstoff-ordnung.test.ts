// G-122: aus `parent_code` einen Wald bauen (C-161).
//
// `[read]` Der fruehere Zwei-Pass-Bau riet die Eltern aus Stufe und
// Sortierung; seit C-161 steht die Beziehung in der Tabelle. Diese
// Tests halten fest, was der Bau garantiert: Reihenfolge egal,
// Geschwister nach `sort_index`, Waisen werden Wurzeln statt zu
// verschwinden.
import test from 'node:test'
import assert from 'node:assert/strict'

import { baueWald, type NaehrstoffKnoten } from '../naehrstoff-ordnung'

function k(code: string, eltern: string | null, sort: number): NaehrstoffKnoten {
  return {
    code, name: code, einheit: 'g', stufe: 1, sort, eltern,
    gruppe: 'Test', suchName: code.toLowerCase(), suchText: '',
    wert: null, summe: null, positionen: 0, positionenMitWert: 0,
    positionenOhneWert: 0, tageErfasst: 0, tageVollstaendig: 0,
    ziel: null, zielMax: null, zielArt: null, obergrenze: null,
    prozent: null, status: null, kinder: [],
  }
}

/** Der Kohlenhydrat-Ast, wie C-161 ihn fuehrt: CHO → SUGAR → MNSAC →
 *  GLUS, vier Ebenen — das Maximum im Bestand. */
function kohlenhydrate(): NaehrstoffKnoten[] {
  return [
    k('GLUS', 'MNSAC', 66),
    k('MNSAC', 'SUGAR', 65),
    k('SUGAR', 'CHO', 73),
    k('STARCH', 'CHO', 75),
    k('CHO', null, 60),
  ]
}

test('vier Ebenen haengen richtig: CHO → SUGAR → MNSAC → GLUS', () => {
  const wald = baueWald(kohlenhydrate())
  assert.equal(wald.length, 1)
  assert.equal(wald[0].code, 'CHO')
  const sugar = wald[0].kinder.find(x => x.code === 'SUGAR')
  const mnsac = sugar?.kinder.find(x => x.code === 'MNSAC')
  assert.ok(mnsac?.kinder.some(x => x.code === 'GLUS'))
})

test('die Reihenfolge der Eingabe ist egal — das Kind darf vor dem Elternteil stehen', () => {
  // GLUS steht in der Liste VOR MNSAC und MNSAC vor SUGAR.
  const wald = baueWald(kohlenhydrate())
  const zaehle = (n: NaehrstoffKnoten): number =>
    1 + n.kinder.reduce((s, x) => s + zaehle(x), 0)
  assert.equal(zaehle(wald[0]), 5, 'kein Knoten geht verloren')
})

test('Geschwister stehen nach sort_index', () => {
  const wald = baueWald(kohlenhydrate())
  assert.deepEqual(wald[0].kinder.map(x => x.code), ['SUGAR', 'STARCH'])
})

test('ein Eintrag mit unbekanntem Elterncode wird Wurzel, nicht verschluckt', () => {
  const wald = baueWald([k('A', null, 1), k('WAISE', 'FEHLT', 2)])
  assert.deepEqual(wald.map(x => x.code), ['A', 'WAISE'])
})

test('mehrere Wurzeln bleiben nebeneinander, nach sort_index', () => {
  const wald = baueWald([k('B', null, 2), k('A', null, 1), k('B1', 'B', 3)])
  assert.deepEqual(wald.map(x => x.code), ['A', 'B'])
  assert.equal(wald[1].kinder[0]?.code, 'B1')
})

test('eine leere Liste ergibt einen leeren Wald', () => {
  assert.deepEqual(baueWald([]), [])
})
