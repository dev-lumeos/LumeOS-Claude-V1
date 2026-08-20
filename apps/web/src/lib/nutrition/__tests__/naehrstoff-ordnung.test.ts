// G-101: aus `display_tier` einen Baum bauen.
//
// `[read]` Die Falle steht in den Daten: bei den Kohlenhydraten hat
// `SUGAR` die Stufe 1, aber `sort_index` **73** — seine Kinder stehen
// ab 65, also DAVOR. Ein einzelner Durchlauf nach dem Muster „der
// letzte flachere Knoten ist der Vater" wuerde die ersten sechs Kinder
// verlieren.
import test from 'node:test'
import assert from 'node:assert/strict'

import { baueBaum, type NaehrstoffKnoten } from '../naehrstoff-ordnung'

function k(code: string, stufe: number, sort: number): NaehrstoffKnoten {
  return {
    code, name: code, einheit: 'g', stufe, sort,
    wert: null, referenz: null, referenz_art: null, kinder: [],
  }
}

/** Die elf Kohlenhydrate, mit den gemessenen Stufen und sort_index. */
function kohlenhydrate(): NaehrstoffKnoten[] {
  return [
    k('MNSAC', 2, 65), k('GLUS', 2, 66), k('FRUS', 2, 67),
    k('GALS', 3, 68), k('DISAC', 2, 69), k('SUCS', 2, 70),
    k('MALS', 3, 71), k('LACS', 2, 72), k('SUGAR', 1, 73),
    k('OLSAC', 3, 74), k('STARCH', 2, 75),
  ]
}

test('die Kohlenhydrate haengen alle unter `SUGAR`', () => {
  const baum = baueBaum(kohlenhydrate())
  assert.equal(baum.length, 1, 'genau eine Wurzel')
  assert.equal(baum[0].code, 'SUGAR')

  // `[cmd]` Elf Eintraege insgesamt: die Wurzel plus zehn darunter.
  const zaehle = (n: NaehrstoffKnoten): number =>
    1 + n.kinder.reduce((s, x) => s + zaehle(x), 0)
  assert.equal(zaehle(baum[0]), 11)
})

test('der Elternknoten wird auch gefunden, wenn er NACH den Kindern steht', () => {
  const baum = baueBaum(kohlenhydrate())
  const kinder = baum[0].kinder.map(x => x.code)
  // MNSAC steht an 65, SUGAR erst an 73 — trotzdem haengt es daran.
  assert.ok(kinder.includes('MNSAC'), 'MNSAC gehoert unter SUGAR')
  assert.ok(kinder.includes('STARCH'), 'STARCH steht danach und gehoert auch darunter')
})

test('Stufe 3 haengt an der zuletzt gesehenen Stufe 2', () => {
  const baum = baueBaum(kohlenhydrate())
  const finde = (code: string): NaehrstoffKnoten | undefined =>
    baum[0].kinder.find(x => x.code === code)
  // GALS (68) folgt auf FRUS (67).
  assert.ok(finde('FRUS')?.kinder.some(x => x.code === 'GALS'))
  // MALS (71) folgt auf SUCS (70).
  assert.ok(finde('SUCS')?.kinder.some(x => x.code === 'MALS'))
})

test('eine Gruppe ohne Stufe 1 bleibt flach', () => {
  // `[cmd]` Ballaststoffe, Zuckeralkohole und Organische Saeuren haben
  // NUR Stufe 3 — es gibt keinen Sammelbegriff dafuer, und einer wird
  // hier auch nicht erfunden.
  const flach = [k('FIBINS', 3, 10), k('FIBSOL', 3, 11)]
  const baum = baueBaum(flach)
  assert.equal(baum.length, 2)
  assert.equal(baum[0].kinder.length, 0)
})

test('eine leere Gruppe ergibt einen leeren Baum', () => {
  assert.deepEqual(baueBaum([]), [])
})
