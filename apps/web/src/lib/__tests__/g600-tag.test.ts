// G-600: EIN „heute", ortsbezogen — uhrunabhaengig geprueft.
//
// `[read]` **Die Zeit ist fest gesetzt, nie `new Date()`** — und die
// Zone auch: `TZ` wird hier auf Bangkok gestellt, damit die Probe auf
// jeder Maschine dieselbe Frage stellt. Node liest `TZ` bei jeder
// Datumsrechnung neu.
process.env.TZ = 'Asia/Bangkok'

import test from 'node:test'
import assert from 'node:assert/strict'

import { tagIso, utcTagIso } from '@lumeos/shared/datum'
import { istZukunft } from '../training/muskelzustand'
import { imFenster, type TrendTag } from '../nutrition/insights-lage'
import { heute, alsDatum } from '../datum'

const FRUEH = new Date(2026, 9, 4, 6, 30)   // 04.10. 06:30 Bangkok = 03.10. 23:30 UTC
const SPAETER = new Date(2026, 9, 4, 8, 0)  // 04.10. 08:00 Bangkok = 04.10. 01:00 UTC

test('G-600: die Zone der Probe ist wirklich Bangkok', () => {
  // `[read]` Ohne diese Zeile koennte die Probe gruen sein, weil die
  // Maschine in UTC laeuft — dann fragt sie nichts.
  assert.equal(FRUEH.getTimezoneOffset(), -420)
})

test('G-600: 06:30 und 08:00 Ortszeit sind DERSELBE Kalendertag', () => {
  assert.equal(tagIso(FRUEH), '2026-10-04')
  assert.equal(tagIso(SPAETER), '2026-10-04')
})

test('G-600: der alte Weg lieferte um 06:30 den Vortag — der Befund', () => {
  // `[cmd]` **Genau das standen an 32 Stellen.** Die Zeile haelt fest,
  // warum `tagIso` existiert: faellt sie, ist der Grund weg.
  assert.equal(utcTagIso(FRUEH), '2026-10-03')
  assert.equal(utcTagIso(SPAETER), '2026-10-04')
})

test('G-600: utcTagIso ist zeitzonenfest auf Datumszeichenketten', () => {
  const d = new Date('2026-10-04T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 6)
  assert.equal(utcTagIso(d), '2026-09-28')
})

test('G-600: lib/datum.ts ist in tagIso aufgegangen', () => {
  assert.equal(alsDatum(FRUEH), '2026-10-04')
  assert.equal(heute(), tagIso())
})

test('G-600: istZukunft — heute um 06:30 ist nicht Zukunft', () => {
  // `[cmd]` Vorher `stichtag > jetzt.toISOString().slice(0, 10)`:
  // '2026-10-04' > '2026-10-03' — **heute galt bis 07:00 als Zukunft**,
  // und die Muskelkarte zeigte den Annahme-Hinweis.
  assert.equal(istZukunft('2026-10-04', FRUEH), false)
  assert.equal(istZukunft('2026-10-04', SPAETER), false)
  assert.equal(istZukunft('2026-10-05', FRUEH), true)
})

test('G-600: imFenster — 7 Tage sind 7 Tage, auch um 06:30', () => {
  // `[cmd]` **Der Mischfall:** Ortsmitternacht gebaut (`T00:00:00`
  // ohne Z), per UTC zurueckgelesen — in Bangkok IMMER einen Tag zu
  // frueh, unabhaengig von der Uhrzeit. Das 7-Tage-Fenster hatte 8.
  const tage: TrendTag[] = Array.from({ length: 10 }, (_, i) => ({
    datum: utcTagIso(new Date(Date.UTC(2026, 8, 25 + i))),
    kcal: 2000, protein: null, carbs: null, fett: null,
  } as TrendTag))
  const f = imFenster(tage, 7 as never, '2026-10-04')
  assert.equal(f.length, 7)
  assert.equal(f[0].datum, '2026-09-28')
})
