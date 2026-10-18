/**
 * Abnahme G-648/G-649 (18.10.) — Abweichungen gegen `Main.dc.html` / `PhaseEngine.dc.html`,
 * die ohne neue Kettenfunktion behoben sind. Gezeichnet bzw. gerufen, nicht im Quelltext gesucht —
 * ausser dort, wo die Anzeige erst per Klick aufgeht (Details).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { AnpassungZelle, ReiterGoals, balken, besterPunkt, messArtKurz, messWert, prognoseEnde } from '../../../app/v2/goals/reiter-goals'
import { anpassungZeile, zeitraumDe } from '../../../app/v2/goals/plan-seite'
import type { Ausblick } from '../reiter-read'
import { zustandAusStatus } from '../zustand'
import type { Phase, ZielFortschritt, Zielphase } from '../lesen'
import type { Strategie } from '../strategie-read'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const lies = (p: string) => readFileSync(join(SRC, p), 'utf8')

const ST = { code: 'lean_bulk', label: 'Lean Bulk', auswahl_gruppe: 'aufbauen', max_duration_weeks: 52, next_codes: [] } as unknown as Strategie
const Z = (o: Partial<ZielFortschritt>): ZielFortschritt => ({
  goal_id: 'g1', goal_type: 'body_composition', subtype: null, title: 'Lean Bulk auf 88 kg', target_value: 88, target_unit: 'kg',
  start_value: 85, current_value: 84.76, current_source: 'goals.body_measurements', progress_pct: 0, progress_status: 'measured', lage: null,
  measured_at: '2026-10-18', target_date: '2027-01-17', gueltig_ab: '2026-05-21', linked_modules: [], status: 'active', is_primary: true,
  priority: 1, goal_role: 'controlling', measurement_type: null, measurement_rhythm: 'once', measurement_site: null, achievement_date: null,
  zustand: zustandAusStatus(o.status ?? 'active'), ...o,
})
const PH = { phase_id: 'p1', goal_id: 'g1', phase_type: 'lean_bulk', variant: null, parameters: {}, gueltig_ab: '2026-10-10',
  projected_end_date: '2027-01-17', actual_end_date: null, transitioned_from: null, recommended_next: null, transition_reason: null, zielrate_pct_kg_woche: 0.25 } as Phase
const OP: Zielphase = { phase_id: 'p1', goal_id: 'g1', phase_type: 'lean_bulk', strategie_code: 'lean_bulk', gueltig_ab: '2026-10-10',
  projected_end_date: '2027-01-17', actual_end_date: null, zielrate_pct_kg_woche: 0.25, parameters: {} }
// Form wie live fuer dev am 18.10. (controlling_goal_outlook)
const AUSBLICK: Ausblick = {
  wochen: [
    { woche_ab: '2026-10-05', woche_bis: '2026-10-11', vollstaendig: true, trend_kg: 84.784, soll_kg: 88, trend_delta_kg: 0.11, soll_delta_kg: 0.212, durchschnitt_kcal: 2484, logtage: 7, anpassung_kcal: null },
    { woche_ab: '2026-10-12', woche_bis: '2026-10-18', vollstaendig: true, trend_kg: 84.762, soll_kg: 88, trend_delta_kg: -0.022, soll_delta_kg: 0.212, durchschnitt_kcal: 2449, logtage: 7, anpassung_kcal: null },
  ],
  kennzahlen: { start_kg: 85, ziel_kg: 88, trend_kg: 84.762, veraenderung_gesamt_kg: -0.238, tempo_4w_kg_pro_woche: 0.039, soll_kg_pro_woche: 0.212, verbleibend_kg: 3.238, fortschritt_pct: 0 },
  prognose: { plan_datum: null, plan_status: 'nicht_im_plan', status: 'datum', datum: '2028-05-22', grund: null },
}
const ROUTER = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} }
const reiter = (ziele: ZielFortschritt[], ausblick: Ausblick | null, trend = { heute: 84.762, vorwoche: 84.784 }) => renderToStaticMarkup(
  React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(ReiterGoals, {
    ziele, phasen: [PH], offenePhasen: [OP], zielwerte: null, vorschlag: null, messungen: [], meilensteine: [], strategien: [ST], plaene: [],
    woche: { trainings: 3, trainingsSoll: 4, beitraege: [], trend, ausblick }, stichtag: '2026-10-18',
    onZielSetzen: () => {}, onMessziel: () => {}, onPhaseEngine: () => {}, onCrossModule: () => {},
  })))

describe('Steuerung', () => {
  it('bei deinem Tempo: Datum bzw. Grund, dazu das Tempo der letzten 4 Wochen (Entwurf „nicht absehbar · −0,1 kg/Wo")', () => {
    assert.match(reiter([Z({})], AUSBLICK), /22\.05\.2028<\/span><span class="ge-num" data-prognose-tempo-wert="true"[^>]*> · \+0,04 kg\/Wo/, 'zwei Stellen wie in den Details')
    const n = reiter([Z({})], { ...AUSBLICK, kennzahlen: { ...AUSBLICK.kennzahlen, tempo_4w_kg_pro_woche: -0.1 }, prognose: { ...AUSBLICK.prognose, status: 'nicht_absehbar', datum: null, grund: 'tempo_entgegen_ziel' } })
    assert.match(n, /color:var\(--warn\)">nicht absehbar – Tempo gegen das Ziel<\/span><span class="ge-num" data-prognose-tempo-wert="true" style="color:var\(--warn\)"> · −0,10 kg\/Wo/)
    assert.ok(!/data-prognose-tempo-wert/.test(reiter([Z({})], { ...AUSBLICK, kennzahlen: { ...AUSBLICK.kennzahlen, tempo_4w_kg_pro_woche: null } })), 'ohne Tempo kein Anhang')
  })
  it('Balken bei 0 %: ein Ansatz wie im Entwurf (2 %), ohne Messwert keiner', () => {
    assert.match(reiter([Z({})], AUSBLICK), /data-steuerung-fortschritt="0"[^>]*><div class="ge-bar"[^>]*><div style="width:2%/)
    assert.match(reiter([Z({ progress_status: 'no_measurement', progress_pct: null })], AUSBLICK), /data-steuerung-fortschritt=""[^>]*><div class="ge-bar"[^>]*><div style="width:0/)
  })
  it('Prognoselinie endet am Achsenende (Frist), auf der Geraden zum Ziel', () => {
    assert.deepEqual(prognoseEnde('2026-10-18', 84, '2026-12-01', 88, '2027-01-17'), { tag: '2026-12-01', kg: 88 })
    const e = prognoseEnde('2026-10-18', 84, '2027-04-16', 88, '2027-01-17')
    assert.equal(e.tag, '2027-01-17')
    // 91 von 180 Tagen bis zur Prognose → knapp die Haelfte des Weges 84 → 88
    assert.ok(Math.abs(e.kg - (84 + 4 * 91 / 180)) < 0.001, `Anteil der Strecke falsch: ${e.kg}`)
    assert.match(lies('app/v2/goals/reiter-goals.tsx'), /const bis = \[stichtag, z\.target_date \?\? prognose\]/, 'die Achse reicht wieder bis zur Prognose')
  })
  it('Wochen in den Details: Anpassung aus dem Protokoll, Trend mit zwei Stellen', () => {
    const q = lies('app/v2/goals/reiter-goals.tsx')
    assert.match(q, /anpassungen=\{plan\?\.anpassungen\} stichtag=\{p\.stichtag\}/)
    assert.match(q, /<AnpassungZelle a=\{anpassungZeile\(anpassungen, w\.woche_ab, w\.vollstaendig, w\.woche_ab === ausblick\?\.wochen\.at\(-1\)\?\.woche_ab\)\} \/>/)
    assert.match(q, /\{w\.trend_kg !== null \? zahl\(w\.trend_kg, 2\) : '—'\}/)
    const zelle = (a: ReturnType<typeof anpassungZeile>) => renderToStaticMarkup(React.createElement('table', null, React.createElement('tbody', null, React.createElement('tr', null, React.createElement(AnpassungZelle, { a })))))
      .replace(/<[^>]+>/g, '')
    const P = [{ week_start: 'a', kcal_delta: 100, protein_delta_g: 0, reason: 'Wache: 3 Wochen hinter Soll', rule_key: 'r' },
      { week_start: 'b', kcal_delta: 0, protein_delta_g: 0, reason: 'zu wenig Logtage (mind. 5)', rule_key: 'r' }]
    assert.equal(zelle(anpassungZeile(P, 'a', true)), '+100 kcal')
    assert.equal(zelle(anpassungZeile(P, 'b', true)), 'keine (zu wenig Logtage (mind. 5))')
    assert.equal(zelle(anpassungZeile(P, 'c', false)), 'läuft')
    assert.equal(zelle(anpassungZeile(P, 'c', true, true)), 'läuft', 'die Woche bis heute schreibt der Tageslauf erst nach Mitternacht')
    assert.equal(zelle(anpassungZeile(P, 'c', true)), '—')
    assert.equal(zelle(anpassungZeile(null, 'a', true)), 'kommt (G-627)')
    assert.equal(anpassungZeile(P, 'c', true, true).grund, 'Protokoll folgt nach dem Tageslauf')
  })
})

describe('Diese Woche', () => {
  it('Soll und Erreicht haben eigene Breiten — ein Ueberschiessen ist sichtbar', () => {
    assert.deepEqual(balken(0), { soll: 100, ist: 0 })
    assert.deepEqual(balken(75), { soll: 100, ist: 75 })
    assert.deepEqual(balken(175), { soll: 57, ist: 100 })
    // Gewicht: +0,37 gegen Soll +0,21 → 175 %
    const h = reiter([Z({})], AUSBLICK, { heute: 85.154, vorwoche: 84.784 })
    assert.match(h, /data-woche="gewicht"[\s\S]*?data-woche-soll-breite="57"[^>]*width:57%[\s\S]*?data-woche-ist-breite="100"/)
  })
})

describe('Messziele', () => {
  const K = (o: Partial<ZielFortschritt>) => Z({ goal_id: 'm1', goal_role: 'measurement', goal_type: 'performance', title: 'Kreuzheben 150 kg × 5', target_value: 150,
    current_value: 140, start_value: 135, target_date: null, measurement_type: 'weight_reps', measurement_reps: 5, uebung: 'Barbell deadlift',
    current_source: 'training.workout_sets.weight_kg', progress_pct: 33, ...o })
  it('Kopf „Kraft · 5 Wdh.", Wert „140,0 kg × 5", die Übung als Quelle', () => {
    const h = reiter([Z({}), K({})], AUSBLICK)
    const kachel = h.slice(h.indexOf('data-messziel-kachel="m1"'))
    assert.match(kachel, /class="ge-typ">Kraft · 5 Wdh\.</)
    assert.match(kachel, /aktuell <\/span><span class="ge-num"[^>]*>140,0 kg × 5</)
    assert.match(kachel, /data-messziel-quelle="true">Barbell deadlift</)
  })
  it('messArtKurz / messWert', () => {
    assert.equal(messArtKurz({ measurement_type: 'e1rm', measurement_rhythm: 'once', measurement_reps: null }), '1RM')
    assert.equal(messArtKurz({ measurement_type: 'weight_reps', measurement_rhythm: 'once', measurement_reps: null }), 'Gewicht × Wdh.')
    assert.equal(messArtKurz({ measurement_type: 'training_sessions_week', measurement_rhythm: 'weekly', measurement_reps: null }), 'wöchentlich')
    assert.equal(messWert(16.18, { target_unit: '%', measurement_type: 'body_fat', measurement_reps: null }), '16,2 %')
    assert.equal(messWert(3, { target_unit: 'sessions_per_week', measurement_type: 'training_sessions_week', measurement_reps: null }), '3 pro Woche')
    assert.equal(messWert(null, { target_unit: 'kg', measurement_type: 'e1rm', measurement_reps: null }), '—')
  })
  it('bester Wert in Richtung des Ziels; Übung und Reps werden gelesen', () => {
    const pkt = [{ tag: 'a', wert: 99 }, { tag: 'b', wert: 104 }, { tag: 'c', wert: 98 }]
    assert.equal(besterPunkt(pkt, { start_value: 105, target_value: 120 })?.tag, 'b')
    assert.equal(besterPunkt(pkt, { start_value: 105, target_value: 90 })?.tag, 'c')
    assert.equal(besterPunkt([], { start_value: 1, target_value: 2 }), null)
    const l = lies('lib/goals/lesen.ts')
    assert.match(l, /achievement_date, exercise_id, measurement_reps'\)/)
    assert.match(l, /\.schema\('training'\)\.from\('exercises'\)\.select\('id, name'\)\.in\('id', uebungIds\)/)
    assert.match(lies('lib/goals/reiter-read.ts'), /\.select\('id, workout_exercises\(workout_sessions\(name\)\)'\)\.in\('id', satzIds\)/)
  })
})

describe('Phase engine', () => {
  it('Zeitraum wie im Entwurf: „06.01.–25.03.2026"', () => {
    assert.equal(zeitraumDe('2026-01-06', '2026-03-25'), '06.01.–25.03.2026')
    assert.equal(zeitraumDe('2025-11-03', '2026-02-01'), '03.11.2025–01.02.2026')
    assert.equal(zeitraumDe(null, '2026-02-01'), '— – 01.02.26')
  })
  it('Abschluss mit A-Termin: „✓ Termin gehalten" und Bühnengewicht (Quelltext — Kachel braucht die Plan-Requisiten)', () => {
    const q = lies('app/v2/goals/plan-seite.tsx')
    assert.match(q, /const gehalten = !!termin && !!ende\(plan\) && ende\(plan\)! <= termin/)
    assert.match(q, /\{gehalten \? '✓ Termin gehalten' : erreicht \? '✓ erreicht' : 'beendet'\}/)
    assert.match(q, /gehalten && plan\.ziel\?\.current_value != null \? `Bühnengewicht \$\{kg1\(plan\.ziel\.current_value\)\} kg`/)
  })
})
