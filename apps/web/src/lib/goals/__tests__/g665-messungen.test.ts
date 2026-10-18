/**
 * G-665 — „Ziel setzen" verlangte auf dev ein Gewicht, obwohl am selben Tag gemessen war.
 *
 * `[cmd]` **Ursache:** `ladeMessungen` las aufsteigend mit `limit 120` — die ÄLTESTEN
 * 120 Zeilen. dev hatte bis 17.10. 152 Messungen, die Reihe endete am 16.09.; A1
 * (`letzteGewichtsmessung`, 14 Tage) fand nichts und zeigte „Gewicht heute". Die 88 kg
 * (Toms Zielgewicht) landeten so als Messung vom 17.10. und froren das Ziel ein (G-663).
 *
 * Die Wirkung belegt die Schirmprobe auf test-user (Zählung vorher/nachher); dieser
 * Wächter hält den Leseweg fest.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { utcTagIso } from '@lumeos/shared/datum'

import { letzteGewichtsmessung } from '../zielrechnung'

const lesen = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'lesen.ts'), 'utf8')
const block = /export async function ladeMessungen[\s\S]*?\n\}/.exec(lesen)![0]

test('G-665: ladeMessungen holt die jüngsten Zeilen und gibt sie aufsteigend zurück', () => {
  assert.match(block, /\.order\('measurement_date', \{ ascending: false \}\)/)
  assert.match(block, /\.order\('measurement_time', \{ ascending: false \}\)/)
  assert.match(block, /\.reverse\(\)\.map\(/, 'ohne Umdrehen stünde die jüngste Messung vorn')
  assert.doesNotMatch(block, /ascending: true/)
})

test('G-665: mit der jüngsten Messung braucht A1 kein „Gewicht heute"', () => {
  // dieselbe Form wie dev am 17.10.: 152 Tage, die letzten 120 davon geladen
  const tage = Array.from({ length: 152 }, (_, i) => {
    const d = utcTagIso(new Date(Date.UTC(2026, 4, 19 + i)))
    return { measurement_date: d, weight_kg: 84.6 }
  })
  assert.equal(tage.at(-1)!.measurement_date, '2026-10-17')
  assert.equal(letzteGewichtsmessung(tage.slice(0, 120), '2026-10-17'), null, 'alter Weg: älteste 120 — keine Messung gefunden')
  assert.equal(letzteGewichtsmessung(tage.slice(-120), '2026-10-17')?.measurement_date, '2026-10-17')
})
