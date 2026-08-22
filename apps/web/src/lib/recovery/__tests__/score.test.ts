// G-76: der Erholungswert — die Regeln, die eine Entscheidung tragen.
//
// `[read]` Reine Rechnung, kein Netz. Geprueft wird vor allem, was
// NICHT passiert: kein Anteil ohne Wert wird als 0 gezaehlt, keine
// fehlerhafte Quellformel nachgebaut, kein Urteilstext erzeugt.
import test from 'node:test'
import assert from 'node:assert/strict'

import { berechneScore, sorenessAnteil, GEWICHTE } from '../score'
import type { CheckinZeile } from '../checkin-read'

function zeile(teil: Partial<CheckinZeile> = {}): CheckinZeile {
  return {
    entry_date: '2026-08-20',
    checkin_time: '07:30:00',
    sleep_hours: 8,
    sleep_quality: 10,
    subjective_feeling: 10,
    mood: 'motivated',
    energy_level: 8,
    motivation: 8,
    soreness: {},
    pain_areas: [],
    stress_level: 3,
    resting_hr: null,
    hrv_rmssd: null,
    ...teil,
  }
}

test('die Gewichte sind der stabile Kern 30/15/15/10/15/10/5', () => {
  // `[cmd]` 00-schemaentwurf.md:49 — in allen drei Quellen identisch.
  assert.equal(GEWICHTE.schlafqualitaet, 30)
  assert.equal(GEWICHTE.schlafdauer, 15)
  assert.equal(GEWICHTE.gefuehl, 15)
  assert.equal(GEWICHTE.soreness, 10)
  assert.equal(GEWICHTE.trainingslast, 15)
  assert.equal(GEWICHTE.nutrition, 10)
  assert.equal(GEWICHTE.stimmung, 5)
  const summe = Object.values(GEWICHTE).reduce((a, b) => a + b, 0)
  assert.equal(summe, 100, 'Die Gewichte muessen sich zu 100 addieren.')
})

test('der Score rechnet OHNE HRV', () => {
  // `[cmd]` 43 von 170 Check-ins tragen HRV — der Normalfall ist ohne.
  const e = berechneScore(zeile({ hrv_rmssd: null }))
  assert.equal(e.hatHrv, false)
  assert.notEqual(e.score, null, 'Ohne HRV muss ein Score herauskommen.')
  assert.equal(e.score, 100, 'Bestwerte ohne HRV ergeben 100.')
})

test('ein Beispieltag ohne HRV ergibt eine nachvollziehbare Zahl', () => {
  // Schlafqualitaet 7/10, Schlaf 7 h, Gefuehl 8/10, kein Kater,
  // Stimmung good (80).
  const e = berechneScore(zeile({
    sleep_quality: 7, sleep_hours: 7, subjective_feeling: 8,
    mood: 'good', soreness: {},
  }))
  // Punkte: 0,7*30 + (7/8)*15 + 0,8*15 + 1*10 + 0,8*5 = 21 + 13,125 + 12 + 10 + 4
  // Basis: 30+15+15+10+5 = 75 (Trainingslast und Nutrition fehlen)
  const erwartet = Math.round(((21 + 13.125 + 12 + 10 + 4) / 75) * 100)
  assert.equal(e.score, erwartet)
  assert.equal(e.gewichtBasis, 75)
  assert.equal(e.fehlendeTeile, 2)
})

test('fehlende Anteile zaehlen NICHT als null Punkte', () => {
  // Der Trainingsterm und Nutrition fehlen immer. Wuerden sie als 0
  // gewertet, laege der Bestwert bei 75 statt 100.
  const e = berechneScore(zeile())
  assert.equal(e.score, 100)
  assert.equal(e.gewichtBasis, 75)
  const trainingslast = e.teile.find(t => t.code === 'trainingslast')
  assert.equal(trainingslast?.punkte, null)
})

test('eine leere Spalte senkt den Score nicht', () => {
  const voll = berechneScore(zeile())
  const ohneGefuehl = berechneScore(zeile({ subjective_feeling: null }))
  assert.equal(voll.score, 100)
  assert.equal(ohneGefuehl.score, 100,
    'Ohne Gefuehlswert bleibt der Rest bei Bestwerten 100.')
  assert.equal(ohneGefuehl.gewichtBasis, 60)
})

test('Soreness mittelt nur ueber GEMELDETE Muskeln (E2)', () => {
  // `[cmd]` Der Kern der Entscheidung: ein Muskel mit Kater 3.
  // Ueber 18 Gruppen gemittelt waere der Term fast voll (9,4/10),
  // ueber die gemeldeten ist er 0.
  assert.equal(sorenessAnteil({ chest: 3 }), 0)
  // Zwei Muskeln, Kater 1 und 3 -> Mittel 2 -> 1 - 2/3
  assert.ok(Math.abs((sorenessAnteil({ chest: 1, back: 3 }) ?? -1) - (1 - 2 / 3)) < 1e-9)
})

test('kein gemeldeter Kater ist voller Anteil, nicht unbekannt', () => {
  assert.equal(sorenessAnteil({}), 1)
  // Nullen zaehlen wie nicht gemeldet.
  assert.equal(sorenessAnteil({ chest: 0, back: 0 }), 1)
})

test('die drei fehlerhaften Quellformeln sind NICHT gebaut', () => {
  // `[cmd]` C-181: der Trainingsterm ist nicht mehr „wartend auf
  // ACWR", sondern per Evidenzregister entfernt (Safe-Zone
  // REMOVE_NUMERIC_VALUE, Praediktor DO_NOT_IMPLEMENT). Er darf
  // keine Punkte liefern — auch nicht versehentlich.
  const e = berechneScore(zeile())
  const t = e.teile.find(x => x.code === 'trainingslast')
  assert.equal(t?.punkte, null)
  assert.equal(t?.roh, 'entfaellt — C-181, ACWR ohne Beleg')
  // Nutrition steht nicht im Check-in; die Quellen setzen fest 70.
  const n = e.teile.find(x => x.code === 'nutrition')
  assert.equal(n?.punkte, null)
})

test('kein Anteil kann ueber sein Gewicht steigen', () => {
  // `[cmd]` Der Fehler der Engine-ACWR-Kurve war genau das: Faktor 1.1
  // auf ein Maximum von 1.0. Hier darf das nirgends passieren.
  const e = berechneScore(zeile({
    sleep_quality: 99, sleep_hours: 24, subjective_feeling: 99,
  }))
  for (const t of e.teile) {
    if (t.punkte === null) continue
    assert.ok(t.punkte <= t.gewicht + 1e-9,
      `${t.code} liefert ${t.punkte} bei Gewicht ${t.gewicht}`)
  }
  assert.ok((e.score ?? 0) <= 100)
})

test('ohne Check-in gibt es keinen Score, nicht null Punkte', () => {
  const e = berechneScore(null)
  assert.equal(e.score, null)
  assert.equal(e.teile.length, 0)
})

test('ein unbekannter mood-Wert erfindet keine Punkte', () => {
  const e = berechneScore(zeile({ mood: 'unbekannt' }))
  const s = e.teile.find(t => t.code === 'stimmung')
  assert.equal(s?.punkte, null)
})
