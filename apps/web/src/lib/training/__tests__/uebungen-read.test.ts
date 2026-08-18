// G-64: die Regeln, die beim Bauen zweimal falsch waren.
//
// `[read]` Beide Fehler waren still — sie zeigten eine falsche Zahl
// bzw. eine leere Liste, statt zu brechen. Genau deshalb stehen sie
// hier als Pruefung.
import test from 'node:test'
import assert from 'node:assert/strict'

import { GRENZE_IN_IDS, SEITE_GROESSE, seitenPlan } from '../uebungen-read'

test('die Seitengroesse liegt bei der PostgREST-Grenze', () => {
  // `[cmd]` PostgREST liefert hoechstens 1.000 Zeilen je Abfrage.
  // 6.588 Zuordnungen in `exercise_muscles` brauchen deshalb sieben
  // Seiten — eine einzige Abfrage zaehlte zu niedrig.
  assert.equal(SEITE_GROESSE, 1000)
})

test('6.588 Zuordnungen ergeben sieben Seiten', () => {
  const seiten = seitenPlan(6588)
  assert.equal(seiten.length, 7)
  assert.deepEqual(seiten[0], { von: 0, bis: 999 })
  assert.deepEqual(seiten[6], { von: 6000, bis: 6999 })
})

test('genau 1.000 Zeilen brauchen zwei Seiten, nicht eine', () => {
  // Der Grenzfall: bei exakt 1.000 weiss der Aufrufer nicht, ob noch
  // etwas folgt — er muss ein zweites Mal fragen.
  assert.equal(seitenPlan(1000).length, 2)
  assert.equal(seitenPlan(999).length, 1)
  assert.equal(seitenPlan(1001).length, 2)
})

test('leer bleibt leer', () => {
  assert.deepEqual(seitenPlan(0), [])
})

test('die ID-Grenze fuer .in() liegt unter 252', () => {
  // `[cmd]` Gemessen am 2026-08-18: 200 IDs gehen durch, 252 nicht —
  // PostgREST antwortet mit „URI too long". Der Fehler kam als leere
  // Liste zurueck, und „Chest, mit sekundaer" (252 Treffer) zeigte
  // null Zeilen. Deshalb filtert die Abfrage ueber einen Verbund und
  // nicht ueber eine ID-Liste.
  assert.ok(GRENZE_IN_IDS <= 200,
    `Die Grenze ist mit ${GRENZE_IN_IDS} zu hoch angesetzt; gemessen kippt es zwischen 200 und 252.`)
})

test('95 Muskelgruppen bleiben unter der ID-Grenze', () => {
  // Die Gruppen-IDs duerfen weiter per `.in()` gehen: es sind
  // hoechstens 95, und der Baum ist die kleine Seite der Beziehung.
  assert.ok(95 <= GRENZE_IN_IDS,
    'Die Muskelgruppen passen nicht mehr in eine .in()-Liste — dann muss auch dort ein Verbund her.')
})
