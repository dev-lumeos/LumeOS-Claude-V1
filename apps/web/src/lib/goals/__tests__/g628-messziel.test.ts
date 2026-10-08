/**
 * G-628 Teil 3 — Weg B „Messziel hinzufügen"
 *
 * `[cmd]` **Gegen die Kette:** `617_measurement_goal_expansion.sql` — die
 * Signatur von `measurement_goal_create`, die Einheiten im Trigger, die
 * Rhythmen im CHECK, die 13 Stellen und jede `G617_*`-Ablehnung.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  MESSARTEN, STELLEN, artenVon, messzielParameter, messzielSatz, startSatz,
  type Messart, type Messformular,
} from '../messziel'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..', '..')
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const SQL = readFileSync(join(WURZEL, 'supabase', '_pipeline', '11_goals', '617_measurement_goal_expansion.sql'), 'utf8')
const lies = (p: string) => readFileSync(p, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
const zwischen = (a: string, b: string) => { const i = SQL.indexOf(a); return SQL.slice(i, SQL.indexOf(b, i)) }

describe('G-628/3 — gegen die Kette', () => {
  it('die zwoelf Parameter in der Reihenfolge der Signatur', () => {
    const sig = zwischen('CREATE FUNCTION goals.measurement_goal_create(', ') RETURNS uuid')
    const soll = Array.from(sig.matchAll(/\b(p_[a-z_]+)\s+[a-z]/g)).map(m => m[1]!)
    assert.equal(soll.length, 12)
    const r = messzielParameter(F({ art: 'body_weight' }), '2026-10-08')
    assert.ok(r.ok)
    assert.deepEqual(Object.keys(r.p), soll)
  })
  it('die Messarten sind genau die aus dem CHECK', () => {
    const check = zwischen('ADD CONSTRAINT user_goals_measurement_type_check', ');')
    const soll = Array.from(check.matchAll(/'([a-z_0-9]+)'/g)).map(m => m[1]!)
    const nurKraftExtra = ['duration', 'distance', 'pace'] // in der Kette, im Dialog bewusst nicht (Dossier 7.2: 1RM · Gewicht bei X Wdh.)
    assert.deepEqual(Object.keys(MESSARTEN).sort(), soll.filter(a => !nurKraftExtra.includes(a)).sort())
  })
  it('Koerpereinheiten wie im Trigger (G617_UNIT)', () => {
    for (const [a, e] of [['body_weight', 'kg'], ['body_fat', '%'], ['circumference', 'cm']] as const) {
      assert.match(SQL, new RegExp(`v_type = '${a}' AND NEW\\.target_unit IS DISTINCT FROM '${e.replace('%', '%')}'`))
      assert.equal(MESSARTEN[a].einheit, e)
    }
  })
  it('Kraft- und Gewohnheitseinheiten wie im Trigger', () => {
    assert.match(SQL, /WHEN v_type IN \('e1rm','weight_reps'\) THEN 'kg'/)
    assert.equal(MESSARTEN.e1rm.einheit, 'kg'); assert.equal(MESSARTEN.weight_reps.einheit, 'kg')
    assert.match(SQL, /NEW\.target_unit IS DISTINCT FROM 'sessions_per_week'/)
    assert.equal(MESSARTEN.training_sessions_week.einheit, 'sessions_per_week')
    assert.match(SQL, /NEW\.target_unit IS DISTINCT FROM 'h\/night'/)
    assert.equal(MESSARTEN.sleep_hours_night.einheit, 'h/night')
  })
  it('fester Rhythmus wie im CHECK: Kraft einmalig, Gewohnheit woechentlich', () => {
    const check = zwischen('ADD CONSTRAINT user_goals_measurement_source_check', ');')
    assert.match(check, /\('e1rm','weight_reps','duration','distance','pace'\) OR measurement_rhythm = 'once'/)
    assert.match(check, /\('training_sessions_week','cardio_sessions_week','sleep_hours_night','steps_day'\)\s+OR measurement_rhythm = 'weekly'/)
    for (const a of artenVon('kraft')) assert.equal(MESSARTEN[a].rhythmus, 'once')
    for (const a of artenVon('gewohnheit')) assert.equal(MESSARTEN[a].rhythmus, 'weekly')
    for (const a of [...artenVon('koerper'), ...artenVon('eigenes')]) assert.equal(MESSARTEN[a].rhythmus, null, `${a} ist waehlbar`)
  })
  it('die 13 Stellen sind die aus der Sicht', () => {
    const sicht = zwischen('CREATE VIEW goals.measurement_circumference_sites', 'GRANT')
    const soll = Array.from(sicht.matchAll(/\('([a-z_]+)'\)/g)).map(m => m[1]!)
    assert.equal(soll.length, 13)
    assert.deepEqual(Object.keys(STELLEN).sort(), soll.sort())
  })
  it('jede G617-Ablehnung der Kette hat einen Satz', () => {
    const codes = Array.from(new Set(Array.from(SQL.matchAll(/'G617_([A-Z_]+):/g)).map(m => m[1]!)))
    assert.ok(codes.length >= 10, `nur ${codes.length} Codes gefunden`)
    // MANUAL / TYPE_FIXED / START_FIXED / SOURCE_ONLY trifft der Dialog nicht (Handwerte, Aenderungen).
    const imDialog = codes.filter(c => !['MANUAL', 'TYPE_FIXED', 'START_FIXED', 'SOURCE_ONLY'].includes(c))
    for (const c of imDialog) {
      const roh = `G617_${c}: x`
      assert.notEqual(messzielSatz(roh), roh, `G617_${c} kommt als Rohtext an`)
    }
    assert.match(messzielSatz('ERROR: G617_FIRST_MEASURE: erst messen'), /^Erst messen/)
  })
})

const F = (o: Partial<Messformular> & { art: Messart }): Messformular => ({
  titel: 'T', ziel: '80', frist: '', rhythmus: 'once', stelle: null, uebungId: null,
  wdh: '5', einheit: '', richtung: null, start: '', ...o,
})

describe('G-628/3 — die Parameter', () => {
  const H = '2026-10-08'
  it('Koerper: Einheit fest, Stelle nur beim Umfang', () => {
    const r = messzielParameter(F({ art: 'circumference', stelle: 'waist_cm', ziel: '82,5', rhythmus: 'weekly' }), H)
    assert.ok(r.ok)
    assert.equal(r.p.p_target_unit, 'cm'); assert.equal(r.p.p_measurement_site, 'waist_cm')
    assert.equal(r.p.p_target_value, 82.5); assert.equal(r.p.p_measurement_rhythm, 'weekly')
    assert.equal(r.p.p_start_value, null, 'den Startwert haelt die Kette fest')
    assert.equal(messzielParameter(F({ art: 'circumference' }), H).ok, false)
    const g = messzielParameter(F({ art: 'body_weight', stelle: 'waist_cm' }), H)
    assert.ok(g.ok); assert.equal(g.p.p_measurement_site, null)
  })
  it('Kraft: Uebung Pflicht, Wdh nur bei Gewicht x Wdh, immer einmalig', () => {
    assert.equal(messzielParameter(F({ art: 'e1rm' }), H).ok, false)
    const e = messzielParameter(F({ art: 'e1rm', uebungId: 'u', rhythmus: 'weekly' }), H)
    assert.ok(e.ok); assert.equal(e.p.p_measurement_reps, null); assert.equal(e.p.p_measurement_rhythm, 'once')
    const w = messzielParameter(F({ art: 'weight_reps', uebungId: 'u', wdh: '8' }), H)
    assert.ok(w.ok); assert.equal(w.p.p_measurement_reps, 8); assert.equal(w.p.p_exercise_id, 'u')
    assert.equal(messzielParameter(F({ art: 'weight_reps', uebungId: 'u', wdh: '2,5' }), H).ok, false)
  })
  it('Gewohnheit: woechentlich, Ziel ueber null', () => {
    const r = messzielParameter(F({ art: 'training_sessions_week', ziel: '4' }), H)
    assert.ok(r.ok); assert.equal(r.p.p_measurement_rhythm, 'weekly'); assert.equal(r.p.p_target_unit, 'sessions_per_week')
    assert.equal(messzielParameter(F({ art: 'sleep_hours_night', ziel: '0' }), H).ok, false)
  })
  it('Eigenes: Einheit, Richtung und Startwert getippt', () => {
    assert.equal(messzielParameter(F({ art: 'custom', einheit: 'l', start: '1,5' }), H).ok, false, 'ohne Richtung')
    const r = messzielParameter(F({ art: 'custom', einheit: ' l ', start: '1,5', richtung: 'more', ziel: '3' }), H)
    assert.ok(r.ok)
    assert.equal(r.p.p_target_unit, 'l'); assert.equal(r.p.p_start_value, 1.5); assert.equal(r.p.p_better_direction, 'more')
    const g = messzielParameter(F({ art: 'body_weight', richtung: 'less' }), H)
    assert.ok(g.ok); assert.equal(g.p.p_better_direction, null, 'nur custom traegt eine Richtung (CHECK)')
  })
  it('Frist optional, Start heute', () => {
    const r = messzielParameter(F({ art: 'body_fat', frist: '2027-01-31' }), H)
    assert.ok(r.ok); assert.equal(r.p.p_target_date, '2027-01-31'); assert.equal(r.p.p_gueltig_ab, H)
    const o = messzielParameter(F({ art: 'body_fat' }), H)
    assert.ok(o.ok); assert.equal(o.p.p_target_date, null)
  })
})

describe('G-628/3 — der Startwert, wie die Kette ihn festhaelt', () => {
  it('in Worten, mit Datum', () => {
    assert.equal(startSatz({ start_value: 81.4, start_source: 'goals.body_measurements', start_measured_at: '2026-10-08', target_unit: 'kg' }),
      'Startwert 81,4 kg festgehalten (letzte Messung am 08.10.2026).')
    assert.match(startSatz({ start_value: 0.75, start_source: 'training.workout_sessions.4week_average', start_measured_at: '2026-10-08', target_unit: 'sessions_per_week' }),
      /0,75 pro Woche .*Schnitt der letzten 4 Wochen/)
    assert.match(startSatz({ start_value: 100, start_source: 'training.workout_sets', start_measured_at: '2026-09-01', target_unit: 'kg' }), /bester Wert aus deinen Trainings/)
    assert.match(startSatz({ start_value: null, start_source: null, start_measured_at: null, target_unit: 'kg' }), /erstes Training/)
  })
})

describe('G-628/3 — die Verdrahtung', () => {
  const io = lies(join(HIER, '..', 'messziel-io.ts'))
  const dialog = lies(join(GOALS, 'messziel-setzen.tsx'))
  const aktionen = lies(join(GOALS, 'ziel-aktionen.ts'))
  it('angelegt wird nur ueber measurement_goal_create', () => {
    assert.match(io, /\.rpc\('measurement_goal_create', p\)/)
    assert.equal((io.match(/\.rpc\(/g) ?? []).length, 1)
    assert.match(aktionen, /const p = messzielParameter\(f, heute\)[\s\S]{0,80}messzielAnlegen\(p\.p\)/)
  })
  it('ein Messziel bekommt nie Phase oder Strategie', () => {
    for (const [n, t] of [['messziel-io.ts', io], ['messziel-setzen.tsx', dialog]] as const) {
      assert.ok(!/goal_phase|strategie|phasenziel|goal_program|Phasenziel/i.test(t), `${n} kennt einen Phasen-/Strategieweg`)
    }
    const block = aktionen.slice(aktionen.indexOf('export async function messzielAnlegenAktion'))
    assert.ok(!/phasenziel|strategie|goal_phase/i.test(block))
  })
  it('waehlbar ist, was die Kette verfuegbar meldet', () => {
    assert.match(io, /from\('measurement_source_options'\)/)
    assert.match(io, /from\('measurement_circumference_sites'\)/)
    assert.match(dialog, /const frei = \(a: string\) => quellen\?\.verfuegbar\[a\] === true/)
    assert.match(dialog, /aus=\{!frei\(a\)\}/)
  })
  it('der Startwert wird nach dem Anlegen zurueckgelesen, nicht gerechnet', () => {
    assert.match(io, /select\('start_value, start_source, start_measured_at, target_unit'\)/)
    assert.match(dialog, /startSatz\(r\.start\)/)
  })
  it('B1 im Ziel-setzen-Dialog oeffnet Weg B', () => {
    const z = lies(join(GOALS, 'ziel-setzen.tsx'))
    assert.match(z, /if \(schritt === 'B1'\) \{\s*return <MesszielSetzen /)
    assert.ok(!/folgt mit G-617/.test(z))
  })
})
