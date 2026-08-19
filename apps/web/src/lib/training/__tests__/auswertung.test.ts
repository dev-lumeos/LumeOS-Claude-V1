// Die Rechnungen ueber Sitzungen, Uebungen und Saetze — geprueft.
//
// `[read]` Warum hier und nicht im Browser: `volumenJeMuskel`, `serie`,
// `kraftverlauf` und `kennzahlen` sind reine Rechnungen ohne Datenbank
// und ohne React. Ein Fehler faellt hier auf, bevor er als falsche
// Zahl in einer Kachel steht.
//
// **Der Fall, um den es geht:** `[cmd]` von 30 Sitzungen liegen 15 in
// der Zukunft (gemessen 2026-08-18, Datenstand nach C-78). Alle 30
// tragen `status = 'completed'` — auch die kuenftigen. Wer nach
// `status` filtert, summiert Leistung, die nicht erbracht wurde.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  kennzahlen, kraftverlauf, kraftVerhaeltnis, serie, volumenJeMuskel,
  wochenanfang,
} from '../auswertung'
import type { Satz, Sitzung, SitzungsUebung } from '../sitzungen-read'

const HEUTE = '2026-08-18'

function sitzung(teil: Partial<Sitzung> & { id: string; session_date: string }): Sitzung {
  return {
    name: 'Push A',
    // `[cmd]` ABSICHTLICH `completed`, auch fuer kuenftige Termine —
    // genau so steht es in der Datenbank.
    status: 'completed',
    absolviert: teil.session_date <= HEUTE,
    location: 'Gym',
    duration_minutes: 75,
    total_volume_kg: 3000,
    total_sets: 6,
    total_reps: 48,
    started_time: '17:30:00',
    ended_time: '18:45:00',
    ...teil,
  }
}

function uebung(
  teil: Partial<SitzungsUebung> & { id: string; workout_session_id: string },
): SitzungsUebung {
  return {
    exercise_id: 'ex-1',
    exercise_name: 'Barbell Bench Press',
    exercise_order: 1,
    actual_sets: 3,
    actual_volume_kg: 1500,
    max_weight_kg: 80,
    total_reps: 24,
    best_estimated_1rm: 95,
    ...teil,
  }
}

function satz(teil: Partial<Satz> & { id: string; workout_exercise_id: string }): Satz {
  return {
    set_number: 1, reps: 8, weight_kg: 80, volume_kg: 640,
    estimated_1rm: 95, is_pr: false, set_type: 'working',
    rpe: 8, rir: null, rest_seconds: null, logged_via: 'manual',
    ...teil,
  }
}

test('geplante Sitzungen zaehlen nicht als Leistung — trotz status completed', () => {
  const sitzungen = [
    sitzung({ id: 's1', session_date: '2026-08-03' }),
    sitzung({ id: 's2', session_date: '2026-08-17' }),
    // Zukunft. `status` sagt trotzdem `completed`.
    sitzung({ id: 's3', session_date: '2026-08-20' }),
    sitzung({ id: 's4', session_date: '2026-09-06' }),
  ]
  assert.equal(sitzungen.filter(s => s.status === 'completed').length, 4,
    'Vorbedingung: alle vier tragen completed.')

  const uebungen = sitzungen.map((s, i) => uebung({ id: `u${i}`, workout_session_id: s.id }))
  const saetze = uebungen.map((u, i) => satz({ id: `x${i}`, workout_exercise_id: u.id }))

  const k = kennzahlen(sitzungen, uebungen, saetze)
  assert.equal(k.sitzungen_absolviert, 2, 'Nur die zwei bis heute sind absolviert.')
  assert.equal(k.sitzungen_geplant, 2)
  assert.equal(k.volumen_kg, 6000, 'Volumen summiert nur die absolvierten.')
  assert.equal(k.saetze, 2, 'Saetze kuenftiger Sitzungen zaehlen nicht mit.')
})

test('Volumen je Muskel zaehlt eine Uebung jeder Gruppe voll zu', () => {
  // `[cmd]` Die Kniebeuge hat drei Primaermuskeln. Ein Satz Kniebeugen
  // ist ein Satz fuer jede beteiligte Gruppe, kein Drittel — so zaehlt
  // die Vorlage und so zaehlt die Trainingsliteratur.
  const sitzungen = [sitzung({ id: 's1', session_date: '2026-08-03' })]
  const uebungen = [uebung({
    id: 'u1', workout_session_id: 's1', exercise_id: 'squat',
    actual_sets: 3, actual_volume_kg: 2000, total_reps: 15,
  })]
  const muskeln = new Map([['squat', ['Legs', 'Glutes', 'Core']]])

  const v = volumenJeMuskel(sitzungen, uebungen, muskeln)
  assert.equal(v.length, 3)
  for (const m of v) {
    assert.equal(m.volumen_kg, 2000, `${m.muskel}: volles Volumen, nicht geteilt.`)
    assert.equal(m.saetze, 3)
  }
  // Und die Folge, die in der Anzeige stehen muss:
  const summe = v.reduce((n, m) => n + m.volumen_kg, 0)
  assert.equal(summe, 6000, 'Die Summe ueber Gruppen ist groesser als das Gesamtvolumen.')
})

test('Volumen je Muskel laesst geplante Sitzungen aus', () => {
  const sitzungen = [
    sitzung({ id: 's1', session_date: '2026-08-03' }),
    sitzung({ id: 's2', session_date: '2026-09-06' }),
  ]
  const uebungen = [
    uebung({ id: 'u1', workout_session_id: 's1', exercise_id: 'bench', actual_volume_kg: 1000 }),
    uebung({ id: 'u2', workout_session_id: 's2', exercise_id: 'bench', actual_volume_kg: 1000 }),
  ]
  const muskeln = new Map([['bench', ['Chest']]])
  const v = volumenJeMuskel(sitzungen, uebungen, muskeln)
  assert.equal(v[0].volumen_kg, 1000, 'Nur die absolvierte Sitzung zaehlt.')
})

test('die Woche faengt am Montag an', () => {
  // 2026-08-18 ist ein Dienstag; die Woche beginnt am 17.
  assert.equal(wochenanfang('2026-08-18'), '2026-08-17')
  assert.equal(wochenanfang('2026-08-17'), '2026-08-17', 'Montag bleibt Montag.')
  // Sonntag gehoert zur Woche davor, nicht zur naechsten.
  assert.equal(wochenanfang('2026-08-23'), '2026-08-17')
  assert.equal(wochenanfang('2026-08-24'), '2026-08-24')
})

test('die Serie zaehlt Wochen, und geplante zaehlen nicht mit', () => {
  // Drei Wochen in Folge bis zur Woche des Stichtags.
  const sitzungen = [
    sitzung({ id: 's1', session_date: '2026-08-03' }), // KW ab 03.08.
    sitzung({ id: 's2', session_date: '2026-08-10' }), // KW ab 10.08.
    sitzung({ id: 's3', session_date: '2026-08-17' }), // KW ab 17.08. = Stichtagswoche
    // Zukunft — darf die Serie nicht verlaengern.
    sitzung({ id: 's4', session_date: '2026-08-24' }),
    sitzung({ id: 's5', session_date: '2026-08-31' }),
  ]
  const s = serie(sitzungen, HEUTE, 12)
  assert.equal(s.wochen, 3, 'Drei absolvierte Wochen in Folge.')
  assert.equal(s.laengste, 3, 'Die laengste Folge zaehlt ebenfalls nur absolvierte.')
  assert.equal(s.wochenreihe.length, 12)
  assert.equal(s.wochenreihe[s.wochenreihe.length - 1].woche, '2026-08-17',
    'Die Reihe endet in der Woche des Stichtags.')
})

test('eine Luecke setzt die Serie zurueck', () => {
  const sitzungen = [
    sitzung({ id: 's1', session_date: '2026-07-20' }),
    // Woche ab 27.07. fehlt.
    sitzung({ id: 's2', session_date: '2026-08-10' }),
    sitzung({ id: 's3', session_date: '2026-08-17' }),
  ]
  const s = serie(sitzungen, HEUTE, 12)
  assert.equal(s.wochen, 2, 'Nur die zwei zusammenhaengenden am Ende.')
})

test('der Kraftverlauf zeigt nur Uebungen mit absolvierten Saetzen', () => {
  // `[read]` Der offene Punkt aus G-64: e1RM deckte 6 von 1.416
  // Katalogeintraegen. Hier faellt er weg, weil nur gezeigt wird, was
  // Verlauf hat.
  const sitzungen = [
    sitzung({ id: 's1', session_date: '2026-08-03' }),
    sitzung({ id: 's2', session_date: '2026-08-10' }),
    sitzung({ id: 's3', session_date: '2026-09-06' }), // Zukunft
  ]
  const uebungen = [
    uebung({ id: 'u1', workout_session_id: 's1', exercise_id: 'bench', best_estimated_1rm: 90 }),
    uebung({ id: 'u2', workout_session_id: 's2', exercise_id: 'bench', best_estimated_1rm: 99 }),
    // Nur in der kuenftigen Sitzung — darf keinen Verlauf ergeben.
    uebung({ id: 'u3', workout_session_id: 's3', exercise_id: 'squat', best_estimated_1rm: 126 }),
  ]
  const k = kraftverlauf(sitzungen, uebungen, [])
  assert.equal(k.length, 1, 'Die nur geplante Uebung erscheint nicht.')
  assert.equal(k[0].exercise_id, 'bench')
  assert.deepEqual(k[0].punkte.map(p => p.e1rm), [90, 99], 'Punkte alt nach neu.')
  assert.equal(k[0].bestes_e1rm, 99)
  assert.equal(k[0].trend_pct, 10, '90 auf 99 sind +10 %.')
})

test('ein einzelner Punkt ergibt keinen Trend', () => {
  const sitzungen = [sitzung({ id: 's1', session_date: '2026-08-03' })]
  const uebungen = [uebung({ id: 'u1', workout_session_id: 's1', best_estimated_1rm: 90 })]
  const k = kraftverlauf(sitzungen, uebungen, [])
  assert.equal(k[0].trend_pct, null)
})

test('das Kraftverhaeltnis faengt fehlende Werte ab', () => {
  assert.equal(kraftVerhaeltnis(170, 85), 2)
  assert.equal(kraftVerhaeltnis(99.33, 84.18), 1.18)
  assert.equal(kraftVerhaeltnis(null, 85), null)
  assert.equal(kraftVerhaeltnis(170, null), null)
  // Ein Gewicht von 0 waere eine Division durch null — nicht Infinity.
  assert.equal(kraftVerhaeltnis(170, 0), null)
})
