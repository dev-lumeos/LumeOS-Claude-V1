// G-445 — ein nie trainierter Muskel ist ERHOLT, nicht unbekannt.
//
// **Tom, 2026-09-13:** *„selbst wenn es nur 6 uebungen sind, wo liegt
// die logik, dass dann nur die muskeln der uebungen gruen gezeigt
// werden? dann sollten alle nicht verwendeten muskeln zumindest
// sicher mal gruen sein und die gebrauchten anhand der daten."*
//
// WARUM ALS TEST: `[cmd]` Die drei Zustaende sehen am Bildschirm
// aehnlich aus — „100 %" steht in zweien davon. **Nur die Herkunft
// unterscheidet sie**, und die ist eine Rechnung, keine Anzeige.
// `[read]` Kippt sie zurueck, zeigt die Karte wieder grau, wo Tom
// gruen erwartet — **ohne dass eine Zahl sich aendert.**
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  muskelLage, katalogMuskeln, muskelzustaende,
  type Muskelzustand, type RohZuordnung,
} from '../muskelzustand'
import { baseRecoveryCurve, calcMuscleRecovery } from '../../../app/v2/recovery/motor'

const ZUSTAND: Muskelzustand = {
  hours: 38, sets: 14, lastSession: 'Push B', datum: '2026-09-11',
  rollen: { primary: 1, secondary: 0 },
}

test('G-445: ein Muskel MIT Saetzen ist gerechnet', () => {
  const lage = muskelLage('m1', { m1: ZUSTAND }, new Set(['m1']))
  assert.equal(lage.herkunft, 'gerechnet')
  assert.deepEqual(lage.zustand, ZUSTAND)
})

test('G-445: im Katalog, aber nie trainiert -> unbelastet', () => {
  // `[read]` **Der Kern des Punktes** — vorher fiel dieser Fall mit
  // „nicht im Katalog" in einen Topf und wurde grau.
  const lage = muskelLage('m2', { m1: ZUSTAND }, new Set(['m1', 'm2']))
  assert.equal(lage.herkunft, 'unbelastet')
  assert.equal(lage.zustand, null,
    'Es gibt keine Sitzung — hours/sets/lastSession waeren erfunden.')
})

test('G-445: nicht im Katalog bleibt ein eigener Zustand', () => {
  // `[cmd]` **Die Grenze, die BLEIBT** — 15 der 105 Muskelgruppen
  // kommen in `exercise_muscles` nicht vor (gemessen 2026-09-13).
  // `[read]` **Sie koennen nie trainiert werden** — „erholt" waere
  // dort eine Aussage ueber etwas, das nie stattfinden kann.
  const lage = muskelLage('m3', { m1: ZUSTAND }, new Set(['m1', 'm2']))
  assert.equal(lage.herkunft, 'nicht-im-katalog')
  assert.equal(lage.zustand, null)
})

test('G-445: Saetze schlagen die Katalogfrage', () => {
  // `[read]` **Wer Saetze hat, IST im Katalog** — die Reihenfolge in
  // `muskelLage` darf nicht kippen, sonst verschwindet ein
  // gerechneter Wert hinter einem Katalogbefund.
  const lage = muskelLage('m1', { m1: ZUSTAND }, new Set())
  assert.equal(lage.herkunft, 'gerechnet',
    'Ein gemessener Muskel darf nie als „nicht im Katalog" gelten.')
})

test('G-445: 100 % ist die ANTWORT DER FORMEL, kein erfundener Wert', () => {
  // `[cmd]` **Das ist die tragende Aussage des Punktes.**
  // `base(hours)` sind die Stunden seit der letzten Belastung —
  // **nie belastet heisst unendlich.**
  assert.equal(baseRecoveryCurve(Number.POSITIVE_INFINITY), 100,
    'Die Grundkurve gibt ab 96 h glatt 100 — auch bei unendlich.')

  const wert = calcMuscleRecovery({
    hours: Number.POSITIVE_INFINITY, sets: 0, sleepQuality: 7,
    proteinPct: 0.8, caloriePct: 0.9, soreness: 0,
  }).value
  assert.equal(wert, 100,
    'Unbelastet + kein Kater = 100 %. Keine Zahl wird gesetzt, '
    + 'sie faellt aus derselben Formel wie jede andere.')
})

test('G-445: ein gemeldeter Muskelkater senkt auch den Unbelasteten', () => {
  // `[read]` **Die Formel bleibt unangetastet** — wer Muskelkater
  // meldet, ist nicht erholt, auch ohne Satz im Tagebuch.
  // `[cmd]` **Das ist kein Sonderfall, sondern `sorenessMod`.**
  const wert = calcMuscleRecovery({
    hours: Number.POSITIVE_INFINITY, sets: 0, sleepQuality: 7,
    proteinPct: 0.8, caloriePct: 0.9, soreness: 2,
  }).value
  assert.ok(wert < 100,
    `Kater 2 muss unter 100 druecken, war ${wert}.`)
})

test('G-445/A6: ein Muskel MIT Saetzen zeigt NICHT unbelastet-100', () => {
  // ══ DIE GEGENPROBE ════════════════════════════════════════════
  //
  // `[read]` **Die Gefahr der Aenderung ist nicht, dass zu wenig
  // gruen wird** — sie ist, dass ein GERECHNETER Wert von der
  // Unbelastet-Regel verschluckt wird und pauschal 100 zeigt.
  //
  // `[cmd]` **Ein frisch trainierter Muskel (2 h, 20 Saetze) muss
  // deutlich unter 100 liegen** — faellt diese Zusicherung, ist die
  // Rechnung durch eine Pauschale ersetzt worden.
  const frisch: Muskelzustand = {
    hours: 2, sets: 20, lastSession: 'Legs A', datum: '2026-09-13',
    rollen: { primary: 1, secondary: 0 },
  }
  const lage = muskelLage('m1', { m1: frisch }, new Set(['m1']))
  assert.equal(lage.herkunft, 'gerechnet')
  assert.ok(lage.zustand, 'Der gerechnete Zustand muss durchgereicht werden.')

  const wert = calcMuscleRecovery({
    hours: lage.zustand.hours, sets: lage.zustand.sets, sleepQuality: 7,
    proteinPct: 0.8, caloriePct: 0.9, soreness: 0,
  }).value
  assert.ok(wert < 50,
    `2 h nach 20 Saetzen muss klar unter 50 liegen, war ${wert}. `
    + 'Steht hier 100, rechnet die Kachel nicht mehr, sondern pauschaliert.')
})

test('G-445: katalogMuskeln zaehlt jede Muskelgruppe genau einmal', () => {
  const z: RohZuordnung[] = [
    { exercise_id: 'e1', muscle_group_id: 'm1', role: 'primary' },
    { exercise_id: 'e2', muscle_group_id: 'm1', role: 'secondary' },
    { exercise_id: 'e1', muscle_group_id: 'm2', role: 'primary' },
  ]
  assert.deepEqual(katalogMuskeln(z).sort(), ['m1', 'm2'])
})

test('G-445: katalogMuskeln liefert eine LISTE, kein Set', () => {
  // `[cmd]` **Der Wert geht von `page.tsx` (Server) als Prop nach
  // `ansicht.tsx` (`'use client'`)** — **ein `Set` kaeme dort als
  // `{}` an** (die Lehre `map-ueberlebt-die-client-grenze-nicht`).
  // `[read]` **`JSON.stringify` misst genau das**: was von dem Wert
  // die Grenze ueberlebt.
  const aus = katalogMuskeln(
    [{ exercise_id: 'e1', muscle_group_id: 'm1', role: null }])
  assert.ok(Array.isArray(aus), 'Muss ein Array sein.')
  assert.equal(JSON.stringify(aus), '["m1"]',
    'Ein Set serialisiert zu {} und der Katalog waere auf der '
    + 'Client-Seite leer — dann gilt jeder Muskel als „nicht im Katalog".')
})

test('G-445: die drei Zustaende aus EINER Messreihe', () => {
  // `[read]` **Die Zustaende einzeln zu pruefen genuegt nicht** —
  // die Frage ist, ob eine echte Zuordnungsliste sie sauber trennt.
  const zuordnungen: RohZuordnung[] = [
    { exercise_id: 'e1', muscle_group_id: 'trainiert', role: 'primary' },
    { exercise_id: 'e9', muscle_group_id: 'nur-im-katalog', role: 'primary' },
  ]
  const zustaende = muskelzustaende(
    [{ workout_exercise_id: 'we1' }],
    [{ id: 'we1', exercise_id: 'e1', workout_session_id: 's1' }],
    [{ id: 's1', session_date: '2026-09-11', name: 'Push B' }],
    zuordnungen,
    new Date('2026-09-13T00:00:00Z'))
  const katalog = new Set(katalogMuskeln(zuordnungen))

  assert.equal(muskelLage('trainiert', zustaende, katalog).herkunft,
    'gerechnet')
  assert.equal(muskelLage('nur-im-katalog', zustaende, katalog).herkunft,
    'unbelastet')
  assert.equal(muskelLage('gar-nicht', zustaende, katalog).herkunft,
    'nicht-im-katalog')
})
