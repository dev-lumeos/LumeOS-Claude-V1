import test from 'node:test'
import assert from 'node:assert/strict'
import { checkinBefunde } from '../analyse'

test('unauffaelliger Check-in liefert keine Befunde', () => {
  const befunde = checkinBefunde({ gewicht_kg: 85.0, energie: 7, schlaf: 7 }, 85.4)
  assert.equal(befunde.length, 0)
})

test('Gewichtsdelta ueber 1,5 kg wird als Zahl benannt, nicht bewertet', () => {
  const befunde = checkinBefunde({ gewicht_kg: 83.0 }, 85.4)
  assert.equal(befunde.length, 1)
  assert.equal(befunde[0]!.feld, 'gewicht_kg')
  assert.match(befunde[0]!.text, /-2\.4 kg/)
  assert.doesNotMatch(befunde[0]!.text, /kritisch|bedenklich|schlecht/i)
})

test('Energie und Schlaf an der Schwelle werden gemeldet', () => {
  const befunde = checkinBefunde({ energie: 3, schlaf: 4 })
  assert.deepEqual(befunde.map(b => b.feld), ['energie', 'schlaf'])
})

test('fehlende Werte erzeugen keine Befunde — fehlend ist nicht 0', () => {
  assert.equal(checkinBefunde({}).length, 0)
  assert.equal(checkinBefunde({ gewicht_kg: 80 }).length, 0)
})
