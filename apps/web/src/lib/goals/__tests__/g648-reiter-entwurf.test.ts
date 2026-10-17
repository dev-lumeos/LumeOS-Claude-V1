/**
 * G-648 — der Reiter Goals 1:1 nach `entwurf/Main.dc.html`.
 *
 * `[cmd]` **Gegen die Kette:** `trendgewicht_am` (631), `goal_progress_at.lage` (643).
 * **Bis in die Anzeige:** Steuerungskarte in allen Zustaenden, Diese Woche, Module,
 * Messziel-Kacheln, Abgeschlossen; „kommt" mit Punkt statt Attrappe; die
 * Mockup-Referenz ist weg; die Restbefunde aus G-645 (Namen statt Codes,
 * Zeitachse ohne eingefrorene Ziele).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { PLAN_STATUS, PROGNOSE_GRUND, ReiterGoals, messPrognose, messTempo } from '../../../app/v2/goals/reiter-goals'
import type { Ausblick, Messwoche, Modulkacheln, Wochendaten } from '../reiter-read'
import { phasenLauf, wocheText } from '../plan'
import { phaseAnzeige } from '../phase-regeln'
import { zustandAusListe, zustandAusStatus } from '../zustand'
import type { Phase, ZielFortschritt, Zielphase } from '../lesen'
import type { Zielwerte } from '../../profile/zielwerte-read'
import type { Strategie } from '../strategie-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')
const KETTE = join(SRC, '..', '..', '..', 'supabase', '_pipeline', '11_goals')
const lies = (p: string) => readFileSync(join(SRC, p), 'utf8')
const ohneKommentar = (q: string) => q.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')

describe('G-648 — gegen die Kette', () => {
  it('trendgewicht_am: Parameter wie in 631, heute und Sonntag vor der Woche', () => {
    assert.match(readFileSync(join(KETTE, '631_trendgewicht_ema.sql'), 'utf8'), /CREATE FUNCTION goals\.trendgewicht_am\(\s*p_user_id uuid,\s*p_stichtag date/)
    const r = lies('lib/goals/reiter-read.ts')
    assert.match(r, /rpc\('trendgewicht_am', \{ p_user_id: userId, p_stichtag: tag \}\)/)
    assert.match(r, /trendAm\(stichtag\), trendAm\(tagMinus\(wochenStart\(stichtag\), 1\)\)/)
  })
  it('goal_progress_at.lage (643) wird gelesen, nicht gerechnet', () => {
    assert.match(readFileSync(join(KETTE, '643_measurement_goal_lage.sql'), 'utf8'), /lage text/)
    assert.match(lies('lib/goals/lesen.ts'), /lage: text\(f\.lage\),/)
  })
})

const ST: Strategie = { code: 'lean_bulk', label: 'Lean Bulk', auswahl_gruppe: 'aufbauen', max_duration_weeks: 52, next_codes: [] } as unknown as Strategie
const AUF: Strategie = { code: 'aufbau_std', label: 'Aufbauen', auswahl_gruppe: 'aufbauen', standard: true, min_erfahrung: 'beginner' } as unknown as Strategie
const Z = (o: Partial<ZielFortschritt>): ZielFortschritt => ({
  goal_id: 'g1', goal_type: 'body_composition', subtype: null, title: 'Lean Bulk bis Dezember', target_value: 88, target_unit: 'kg',
  start_value: 85, current_value: 84.95, current_source: 'goals.body_measurements', progress_pct: 2, progress_status: 'measured', lage: null,
  measured_at: '2026-10-08', target_date: '2026-12-16', gueltig_ab: '2026-06-01', linked_modules: [], status: 'active', is_primary: true,
  priority: 1, goal_role: 'controlling', measurement_type: null, measurement_rhythm: 'once', measurement_site: null, achievement_date: null,
  zustand: zustandAusStatus(o.status ?? 'active'), ...o,
})
const PH: Phase = { phase_id: 'p1', goal_id: 'g1', phase_type: 'lean_bulk', variant: null, parameters: {}, gueltig_ab: '2026-06-01',
  projected_end_date: null, actual_end_date: null, transitioned_from: null, recommended_next: null, transition_reason: null, zielrate_pct_kg_woche: 0.25 } as Phase
const OP: Zielphase = { phase_id: 'p1', goal_id: 'g1', phase_type: 'lean_bulk', strategie_code: 'lean_bulk', gueltig_ab: '2026-06-01',
  projected_end_date: null, actual_end_date: null, zielrate_pct_kg_woche: 0.25, parameters: {} }
const ZW = (o: Partial<Zielwerte>): Zielwerte => ({ gueltig_ab: '2026-10-16', kcal: 2910, protein_g: 170, carbs_g: null, fat_g: null, fiber_g: null,
  linoleic_acid_g: null, alpha_linolenic_acid_g: null, herkunft: 'formel', tdee: 2650, nutrition_goal: null, ruhendes_ziel: null, luecke: null, eingefroren: null, ...o })
const ROUTER = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} }
const reiter = (ziele: ZielFortschritt[], zielwerte: Zielwerte = ZW({}), phasen: Phase[] = [PH], ausblick: Ausblick | null = null) => renderToStaticMarkup(
  React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(ReiterGoals, {
    ziele, phasen, offenePhasen: [OP], zielwerte, vorschlag: null, messungen: [], meilensteine: [], strategien: [ST, AUF], plaene: [],
    woche: { trainings: 3, beitraege: [], trend: { heute: 84.7, vorwoche: 84.7 }, ausblick }, stichtag: '2026-10-16',
    onZielSetzen: () => {}, onMessziel: () => {}, onPhaseEngine: () => {}, onCrossModule: () => {},
  })))

describe('G-648 — Steuerung', () => {
  it('aktiv: Start · Trend · Ziel, Fortschritt, Prognose „kommt (G-650)", Tagesziel, Phase, Module', () => {
    const h = reiter([Z({})])
    assert.match(h, /data-steuerung="laeuft"/)
    assert.match(h, />Steuerung · bestimmt Kalorien und Makros</)
    assert.match(h, /Aufbauen · Lean Bulk<\/h2>/)
    assert.match(h, /Start <\/span><span class="ge-num"[^>]*>85,0 kg/)
    assert.match(h, /Trend <\/span><span class="ge-num"[^>]*>84,7 kg/)
    assert.match(h, /Ziel <\/span><span class="ge-num"[^>]*>88,0 kg/)
    assert.match(h, /data-steuerung-fortschritt="2"/)
    assert.match(h, /nach Plan erreicht<\/div><div[^>]*><span class="ge-kommt" data-kommt="G-650">kommt \(G-650\)/)
    assert.match(h, /bei deinem Tempo<\/div><div[^>]*><span class="ge-kommt" data-kommt="G-650">/)
    assert.match(h, /white-space:nowrap">2\.910 kcal · 170 g P</, 'Tagesziel ohne Umbruch (Tom 16.10.)')
    assert.match(h, /Woche 20 von max 52/, 'offenes Ende: Hoechstdauer des Programms (Entwurf „Woche 17 von max 52")')
    assert.equal((h.match(/data-steuerung-module[\s\S]*?<\/div>/)?.[0].match(/class="ge-pill"/g) ?? []).length, 4)
    assert.ok(!/data-steuerung-chip/.test(h), 'die Lage des Steuerziels liefert erst G-650 — keine Pille ohne Quelle')
  })
  it('pausiert: Rahmen, Satz mit Datum, „Fortsetzen …" — die Phase bleibt', () => {
    const h = reiter([Z({ status: 'paused' })], ZW({ herkunft: 'kein_aktives_ziel', kcal: 2650, ruhendes_ziel: { goal_id: 'g1', title: 'x', seit: '2026-10-01' } }), [])
    assert.match(h, /data-steuerung="pausiert"/)
    assert.match(h, /<b>Pausiert seit 01\.10\.<\/b> – du läufst auf Erhaltung \(<span class="ge-num">2\.650 kcal<\/span>\)\. Die Phase bleibt gespeichert\./)
    assert.match(h, /data-steuerung-chip="true">pausiert</)
    assert.match(h, /Aufbauen · Lean Bulk/, 'die pausierte Phase kommt aus der offenen Zeile')
  })
  it('eingefroren: Frist abgelaufen mit Stand und Ziel, Neustart', () => {
    const z = Z({ zustand: zustandAusListe({ effective_status: 'eingefroren', freeze_reason: 'frist_abgelaufen', frozen_on: '2026-12-16' }), current_value: 85.2 })
    const h = reiter([z], ZW({ herkunft: 'ziel_eingefroren', kcal: 2650, eingefroren: { goal_id: 'g1', title: 'x', grund: 'frist_abgelaufen', am: '2026-12-16' } }), [])
    assert.match(h, /<b>Frist 16\.12\.2026 abgelaufen bei 85,2 kg \(von 88,0\)\.<\/b> Das Ziel ist eingefroren; seitdem gilt Erhaltung/)
    assert.match(h, /data-ziel-neu-starten="g1"[^>]*>Neustart</)
  })
  it('kein Ziel: der Satz des Entwurfs und „Ziel setzen"', () => {
    const h = reiter([], ZW({ herkunft: 'kein_aktives_ziel', kcal: 2650 }), [])
    assert.match(h, /Kein Ziel aktiv – du läufst auf Erhaltung<\/div>/)
    assert.match(h, /Ohne Ziel gibt es keinen Plan, keine Prognose und keine Anpassung\./)
    assert.match(h, /data-kein-ziel-setzen="true">Ziel setzen</)
  })
})

// G-648 Rest: Werte aus `controlling_goal_outlook` (G-650), Form wie live fuer dev am 16.10.
const AUSBLICK: Ausblick = {
  wochen: [
    { woche_ab: '2026-10-05', woche_bis: '2026-10-11', vollstaendig: true, trend_kg: 84.784, soll_kg: 89.376, trend_delta_kg: 0.11, soll_delta_kg: 0.236, durchschnitt_kcal: 2484.4, logtage: 7, anpassung_kcal: null },
    { woche_ab: '2026-10-12', woche_bis: '2026-10-16', vollstaendig: false, trend_kg: 84.817, soll_kg: 89.536, trend_delta_kg: 0.033, soll_delta_kg: 0.16, durchschnitt_kcal: 2361.7, logtage: 5, anpassung_kcal: null },
  ],
  kennzahlen: { start_kg: 85, ziel_kg: 88, trend_kg: 84.817, veraenderung_gesamt_kg: -0.183, tempo_4w_kg_pro_woche: 0.064, soll_kg_pro_woche: 0.212, verbleibend_kg: 3.183, fortschritt_pct: 0 },
  prognose: { plan_datum: '2026-09-01', status: 'datum', datum: '2027-10-01', grund: null },
}

describe('G-648/G-649 Feinschliff nach Bild (16.10., dev nach G-652)', () => {
  it('1 Tagesziel: Kennzahlen als umbrechendes Flex — kein Rasterfeld, in das der Wert hineinlaeuft', () => {
    const h = reiter([Z({})], ZW({ kcal: 2714 }), [PH], AUSBLICK)
    const k = /<div data-steuerung-kennzahlen="true" style="([^"]*)">([\s\S]*?)<div style="display:flex;gap:4px;flex-wrap:wrap" data-steuerung-module/.exec(h)
    assert.ok(k, 'Kennzahlenzeile nicht gefunden')
    assert.match(k![1]!, /display:flex;flex-wrap:wrap/)
    assert.ok(!/grid-template-columns/.test(k![1]!), 'wieder ein Raster: eine Spalte waechst nicht mit dem Text')
    assert.equal((k![2]!.match(/style="flex:1 1 170px"/g) ?? []).length, 4, 'nicht alle vier Kennzahlen sind Flex-Kinder')
    assert.match(k![2]!, /data-steuerung-kcal="true"[^>]*><div class="ge-eb">Tagesziel<\/div><div class="ge-num" style="[^"]*white-space:nowrap">2\.714 kcal · 170 g P</)
  })
  it('2 Plan-Status in Fliesstext und einzeilig, nicht in Monospace', () => {
    const o = reiter([Z({})], ZW({}), [PH], { ...AUSBLICK, prognose: { ...AUSBLICK.prognose, plan_datum: null, plan_status: 'nicht_im_plan' } })
    const z = /data-prognose-plan="true"[^>]*><div class="ge-eb">nach Plan erreicht<\/div>(<div[^>]*>)Plan endet vor dem Ziel</.exec(o)
    assert.ok(z, 'Plan-Status nicht gefunden')
    assert.ok(!/ge-num/.test(z![1]!), 'der Satz steht in Monospace')
    assert.match(z![1]!, /white-space:nowrap/)
  })
  it('3 Reiterleiste bricht um statt abzuschneiden', () => {
    assert.match(lies('app/v2/goals/ansicht.tsx'), /<div className="ge-reiter"><Tabs items=\{TABS\}/)
    assert.match(lies('app/v2/goals/goals.css'), /^\.ge-reiter \.v2-tabs-rail \{ flex-wrap: wrap; overflow-x: visible; \}$/m)
  })
  it('4 Messziel-Titel in Diese Woche: eine Zeile, ganz im title', () => {
    const lang = 'Kreuzheben 150 kg × 5 Wiederholungen sauber'
    const h = reiter([Z({}), Z({ goal_id: 'm1', goal_role: 'measurement', title: lang, measurement_type: 'e1rm' })])
    assert.match(h, new RegExp(`<span data-woche-titel="true" title="${lang}" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">${lang}</span>`))
  })
})

describe('G-648 Rest — Werte aus controlling_goal_outlook statt „kommt (G-650)"', () => {
  it('Prognose: nach Plan und bei deinem Tempo als Datum; sonst der Grund', () => {
    const h = reiter([Z({})], ZW({}), [PH], AUSBLICK)
    assert.match(h, /data-prognose-plan="true"[^>]*><div class="ge-eb">nach Plan erreicht<\/div><div class="ge-num"[^>]*>01\.09\.2026</)
    assert.match(h, /data-prognose-tempo="datum"[^>]*>[\s\S]*?<span class="ge-num">01\.10\.2027<\/span>/)
    assert.ok(!/data-kommt="G-650"/.test(h), 'mit Kette steht noch „kommt (G-650)"')
    const n = reiter([Z({})], ZW({}), [PH], { ...AUSBLICK, prognose: { plan_datum: null, status: 'nicht_absehbar', datum: null, grund: 'tempo_entgegen_ziel' } })
    assert.match(n, /data-prognose-tempo="nicht_absehbar"[^>]*>[\s\S]*?nicht absehbar – Tempo gegen das Ziel/)
    assert.match(reiter([Z({})]), /data-kommt="G-650"/, 'ohne Kette bleibt „kommt (G-650)"')
    // G-653: ohne Plandatum nennt die Kette den Grund
    const o = reiter([Z({})], ZW({}), [PH], { ...AUSBLICK, prognose: { ...AUSBLICK.prognose, plan_datum: null, plan_status: 'nicht_im_plan' } })
    assert.match(o, /data-prognose-plan="true"[^>]*>[\s\S]*?Plan endet vor dem Ziel/)
    for (const k of ['kein_aktiver_plan', 'nicht_im_plan', 'nicht_absehbar']) assert.ok(PLAN_STATUS[k], `plan_status ${k} ohne Satz`)
  })
  it('jeder Grund der Kette hat einen Satz', () => {
    const t = readFileSync(join(KETTE, '650_controlling_goal_plan_outlook.sql'), 'utf8')
    const g = /'grund',CASE([\s\S]*?)ELSE NULL END/.exec(t)![1]!
    const alle = Array.from(g.matchAll(/THEN '([a-z_]+)'/g), m => m[1]!)
    assert.equal(alle.length, 6)
    for (const k of alle) assert.ok(PROGNOSE_GRUND[k], `Grund ${k} ohne Satz`)
  })
  it('Training: Soll aus der Routine, Balken und „x / 4" (Tom 16.10.)', () => {
    const mit = renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(ReiterGoals, {
      ziele: [Z({})], phasen: [PH], offenePhasen: [OP], zielwerte: ZW({}), vorschlag: null, messungen: [], meilensteine: [], strategien: [ST, AUF], plaene: [],
      woche: { trainings: 3, trainingsSoll: 4, beitraege: [], trend: { heute: 84.7, vorwoche: 84.7 } }, stichtag: '2026-10-16',
      onZielSetzen: () => {}, onMessziel: () => {}, onPhaseEngine: () => {}, onCrossModule: () => {},
    })))
    assert.match(mit, /data-woche="trainings"[\s\S]*?width:75%[\s\S]*?>3 \/ 4</)
    assert.match(reiter([Z({})]), /data-woche="trainings"[\s\S]*?>3 \/ –</, 'ohne Soll steht eine erfundene Zahl')
  })
  it('Abgeschlossen: Chip und Knoepfe in einer Gruppe ohne Umbruch', () => {
    const q = lies('app/v2/goals/reiter-goals.tsx')
    assert.match(q, /<div data-abgeschlossen-zeile style=\{\{ display: 'flex', gap: 6, flexWrap: 'nowrap'/)
    const i = q.indexOf('data-abgeschlossen-zeile'), j = q.indexOf('data-ziel-loeschen', i)
    assert.ok(i > 0 && j > i && q.slice(i, j).includes('data-eingefroren-grund'), 'Chip steht nicht in der Gruppe')
  })
  it('Diese Woche: Soll Δ nach Plan aus der laufenden Woche', () => {
    // 84,7 − 84,7 = ±0,0 gegen Soll +0,16 → Quote 0, also nicht erreicht
    const h = reiter([Z({})], ZW({}), [PH], AUSBLICK)
    assert.match(h, /data-woche="gewicht"[\s\S]*?±0,0 kg[\s\S]*?data-woche="trainings"/)
    // Δ +0,16 gegen das Plan-Soll +0,16 → 100 %; aus der Rate (0,25 % × 84,7 = 0,21) waeren es 75 %
    const z = renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(ReiterGoals, {
      ziele: [Z({})], phasen: [PH], offenePhasen: [OP], zielwerte: ZW({}), vorschlag: null, messungen: [], meilensteine: [], strategien: [ST, AUF], plaene: [],
      woche: { trainings: 3, beitraege: [], trend: { heute: 84.86, vorwoche: 84.7 }, ausblick: AUSBLICK }, stichtag: '2026-10-16',
      onZielSetzen: () => {}, onMessziel: () => {}, onPhaseEngine: () => {}, onCrossModule: () => {},
    })))
    assert.match(z, /data-woche="gewicht"[\s\S]*?width:100%;background:var\(--pos\)[\s\S]*?\+0,2 kg/, 'das Soll kommt nicht aus dem Plan (G-650)')
  })
  it('Details: Trend- und Planlinie, Tempo 4 Wochen, Wochenzeilen (Quelltext — Details oeffnen per Klick)', () => {
    const q = ohneKommentar(lies('app/v2/goals/reiter-goals.tsx'))
    assert.match(q, /wochen\.filter\(w => w\.soll_kg !== null\)\.map\(w => `\$\{x\(w\.woche_bis\)\},\$\{y\(w\.soll_kg!\)\}`\)/)
    assert.match(q, /data-trend-linie/)
    assert.match(q, /k\.tempo_4w_kg_pro_woche !== null \? `\$\{vz\(k\.tempo_4w_kg_pro_woche, 2\)\} kg\/Wo`/)
    assert.match(q, /\[\.\.\.\(ausblick\?\.wochen \?\? \[\]\)\]\.reverse\(\)\.slice\(0, 6\)/)
    assert.ok(!/\(rate \* z\.start_value\) \/ 100/.test(q), 'das Soll wird wieder aus der Rate gerechnet')
  })
})

describe('G-648 — Diese Woche, Module, Messziele, Abgeschlossen', () => {
  it('Diese Woche: Trend Δ aus trendgewicht_am, Trainings gegen das Wochenziel', () => {
    const tr = Z({ goal_id: 'm1', goal_role: 'measurement', title: 'Training', measurement_type: 'training_sessions_week', measurement_rhythm: 'weekly',
      target_value: 4, target_unit: 'sessions_per_week', current_value: 3, progress_pct: 75 })
    const h = reiter([Z({}), tr])
    assert.match(h, /data-woche="gewicht"[\s\S]*?±0,0 kg/)
    assert.match(h, /data-woche="trainings"[\s\S]*?>3 \/ 4</)
    assert.match(h, /grau = Soll der Woche · Farbe = erreicht/)
  })
  it('Module: vier Kacheln; ohne Kachel-Leser „kommt (G-522)", keine Null', () => {
    // G-522: die Werte kommen aus `goal_module_cards_at`; ohne sie steht „kommt", keine Zahl.
    const h = reiter([Z({})])
    assert.equal((h.match(/data-modul="[a-z]+"/g) ?? []).length, 4)
    assert.equal((h.match(/Modulkacheln — kommt \(G-522\)/g) ?? []).length, 4)
    assert.equal((h.match(/data-modul-wert[^>]*>—</g) ?? []).length, 4, 'ohne Kachel-Leser steht eine Zahl statt „—“')
    assert.match(h, /<b>Engpass:<\/b> erst mit Beiträgen\./)
  })
  it('Messziel-Kacheln: Lage nur mit Istwert, Frist-Texte, Wochenziel „4× / Wo"', () => {
    const m = (o: Partial<ZielFortschritt>) => Z({ goal_role: 'measurement', measurement_type: 'body_weight', ...o })
    const h = reiter([Z({}),
      m({ goal_id: 'a', title: 'Gewicht', lage: 'hinterher' }),
      m({ goal_id: 'b', title: 'Ohne Wert', lage: 'voraus', current_value: null }),
      m({ goal_id: 'c', title: 'Ohne Frist', target_date: null, lage: 'offen' }),
      m({ goal_id: 'd', title: 'Woche', measurement_type: 'training_sessions_week', measurement_rhythm: 'weekly', target_unit: 'sessions_per_week', target_value: 4, current_value: 3, progress_pct: 75 })])
    assert.match(h, /data-messziel-kachel="a"[\s\S]*?data-lage="hinterher">hinterher</)
    assert.ok(!/data-messziel-kachel="b"[\s\S]*?data-lage=[\s\S]*?data-messziel-kachel="c"/.test(h), 'Pille ohne Istwert')
    assert.match(h, /data-messziel-kachel="c"[\s\S]*?>ohne Frist</)
    assert.match(h, /data-messziel-kachel="d"[\s\S]*?data-lage="hinterher">diese Woche offen<[\s\S]*?>wiederkehrend</)
    assert.match(h, />3 diese Woche</)
    assert.match(h, />4× \/ Wo</)
    assert.match(h, /bis 16\.12\.2026 · 61 Tage/)
  })
  it('Abgeschlossen: offen wie im Entwurf, Info je Grund', () => {
    const e = (id: string, grund: string, o: Partial<ZielFortschritt> = {}) => Z({ goal_id: id, goal_role: 'measurement', title: id,
      zustand: zustandAusListe({ effective_status: 'eingefroren', freeze_reason: grund, frozen_on: '2026-08-18' }), ...o })
    const h = reiter([Z({}), e('x1', 'frist_abgelaufen', { target_date: '2026-08-18', current_value: 99.3, target_value: 120 }), e('x2', 'erreicht', { current_value: 84 }), e('x3', 'beendet')])
    assert.match(h, /data-abgeschlossen="3" aria-expanded="true"/)
    assert.match(h, /Frist 18\.08\.2026 · 99,3 von 120 kg · eingefroren/)
    assert.match(h, /erreicht 18\.08\.2026 · 84 kg/)
    assert.match(h, />beendet 18\.08\.2026</)
    assert.match(h, />✓ erreicht</)
    // Entwurf: Details, Neustart, Löschen — Archivieren nur im Bearbeiten eines laufenden Messziels (Tom 16.10.)
    assert.equal((h.match(/data-ziel-archivieren=/g) ?? []).length, 0, 'Archivieren steht wieder in den abgeschlossenen Zeilen')
    assert.equal((h.match(/data-ziel-neu-starten=/g) ?? []).length, 3)
  })
})

describe('G-648 — Reste weg, Restbefunde', () => {
  it('Mockup-Referenz des Reiters Goals und die alten Bauteile sind weg', () => {
    assert.ok(!/GoalsGoalsReferenz/.test(lies('app/v2/goals/ansicht.tsx')))
    assert.ok(!/export function GoalsGoalsReferenz/.test(lies('app/v2/goals/mockup-referenz.tsx')))
    for (const f of ['ziel-editor.tsx', 'steuerung-ohne-ziel.tsx']) assert.ok(!existsSync(join(SRC, 'app/v2/goals', f)), `${f} steht wieder da`)
  })
  it('Namen statt Codes: Programm vor Phasenart, nie der Code', () => {
    assert.equal(phaseAnzeige('lean_bulk', 'lean_bulk', [{ code: 'lean_bulk', label: 'Lean Bulk' }]), 'Lean Bulk')
    assert.equal(phaseAnzeige('lean_bulk', null, []), 'Lean bulk')
    assert.ok(!/lean_bulk|_/.test(phaseAnzeige('reverse_diet', 'unbekannt', [])))
    const a = ohneKommentar(lies('app/v2/goals/ansicht.tsx'))
    // Tom 16.10.: keine Phasen-Pille im Kopf mehr; die Beenden-Kachel ist weg (G-649: Beenden im Bearbeiten)
    assert.ok(!/phase_type \?\? ''\)\.replace\(\/_\/g/.test(a), 'der Kopf zeigt wieder den Code')
    // G-656: phase-setzen.tsx ist geloescht; der Planer nennt Phasen ueber `phasenname`, nie den Code.
    const s = ohneKommentar(lies('app/v2/goals/plan-seite.tsx'))
    assert.ok(!/phase_transition_recommendation|\.replace\(\/_\/g/.test(s), 'Funktionsname oder Code im Planer')
    assert.match(s, /<b style=\{\{ fontSize: 13, flex: '1 1 140px' \}\}>\{phasenname\(p, strategien\)\}<\/b>/)
  })
  // G-656: „Zeitachse: eingefrorene Ziele haben kein Zeitfenster" ist mit phasen-zeitachse.tsx
  // weggefallen — der Planer zeigt Plaene, nicht Ziele; Fertiges steht unter „Abgeschlossene Pläne".
  it('Woche: eine Rechnung, mit Hoechstdauer bei offenem Ende', () => {
    const l = phasenLauf({ gueltig_ab: '2026-06-01', projected_end_date: null, actual_end_date: null }, '2026-10-16')
    assert.equal(wocheText(l, 52), 'Woche 20 von max 52')
    assert.equal(wocheText(l), 'Woche 20')
  })
})

describe('G-654 angebunden: Lage, Woche je Messziel, Tempo', () => {
  const MW = (o: Partial<Messwoche>): Messwoche => ({ delta_woche: null, soll_delta_woche: null, tempo_pro_woche: null, prognose_status: 'nicht_absehbar', prognose_datum: null, ...o })
  const KB = Z({ goal_id: 'k1', title: 'Kniebeuge 1RM 160 kg', goal_role: 'measurement', is_primary: false, measurement_type: 'e1rm', target_unit: 'kg', target_value: 160 })
  const KF = Z({ goal_id: 'f1', title: 'Körperfett 14 %', goal_role: 'measurement', is_primary: false, measurement_type: 'body_fat', target_unit: '%', target_value: 14 })
  const mit = (woche: Partial<Wochendaten>) => renderToStaticMarkup(
    React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(ReiterGoals, {
      ziele: [Z({}), KB, KF], phasen: [PH], offenePhasen: [OP], zielwerte: ZW({}), vorschlag: null, messungen: [], meilensteine: [], strategien: [ST, AUF], plaene: [],
      woche: { trainings: 3, beitraege: [], trend: { heute: 84.7, vorwoche: 84.7 }, ...woche }, stichtag: '2026-10-16',
      onZielSetzen: () => {}, onMessziel: () => {}, onPhaseEngine: () => {}, onCrossModule: () => {},
    })))
  it('Lage-Pille des Steuerziels nur mit Lage aus der Kette', () => {
    assert.match(mit({ lage: { lage: 'hinterher', abweichung_kg: -3.176, toleranz_kg: 0.3 } }), /data-steuerung-lage="hinterher"[^>]*>hinterher</)
    // ohne Lage keine Pille — gezaehlt an der Klasse, das Attribut faellt bei null ohnehin weg
    for (const h of [mit({ lage: { lage: null, abweichung_kg: null, toleranz_kg: null } }), mit({})])
      assert.doesNotMatch(h.slice(h.indexOf('aria-label="Steuerung"'), h.indexOf('data-steuerung-variante')), /ge-lage-/)
  })
  // G-522: die vier Kacheln und der Engpass aus `goal_module_cards_at` — Werte wie dev am 17.10.
  const KACHELN = (o: Partial<Modulkacheln> = {}): Modulkacheln => ({
    stand_am: '2026-10-17',
    nutrition: { wert: 84.9, tage: 7, grund: null },
    training: { wert: 3, wochenziel: 4, score: 75, grund: null },
    recovery: { wert: 66.9, tage: 7, schlaf_stunden: 7.8, grund: null },
    supplements: { wert: 88.1, tage: 7, grund: null },
    engpass: null, engpass_grund: 'kein_deutlicher_engpass', ...o,
  })
  const modul = (h: string, m: string) => { const i = h.indexOf(`data-modul="${m}"`); return h.slice(i, h.indexOf('data-modul=', i + 12) > 0 ? h.indexOf('data-modul=', i + 12) : h.indexOf('data-engpass')) }
  it('G-522: Kacheln zeigen die Werte der Kette mit dem Untertitel des Entwurfs', () => {
    const h = mit({ kacheln: KACHELN() })
    assert.match(modul(h, 'nutrition'), /data-modul-wert[^>]*>84,9 %<\/div><div[^>]*>kcal-Treue 7 Tage</)
    assert.match(modul(h, 'training'), /data-modul-wert[^>]*>3 \/ 4<\/div><div[^>]*>Einheiten diese Woche</)
    assert.match(modul(h, 'recovery'), /data-modul-wert[^>]*>66,9<\/div><div[^>]*>Score Ø 7 Tage</)
    assert.match(modul(h, 'supplements'), /data-modul-wert[^>]*>88,1 %<\/div><div[^>]*>Einnahme-Treue</)
    assert.match(h, /data-engpass="kein_deutlicher_engpass"[^]*?<b>Engpass:<\/b> kein deutlicher Engpass\./)
  })
  it('G-522: der Engpass kommt aus der Kette, auch wenn die App ein anderes Modul waehlen wuerde', () => {
    // Recovery 66,9 ist der niedrigste Wert — die Kette nennt trotzdem Ernaehrung; die App folgt ihr.
    const h = mit({ kacheln: KACHELN({ engpass: { module: 'nutrition', grund: 'Kalorien-Treue Ø 84,9 %' }, engpass_grund: null }) })
    assert.match(h, /data-engpass="nutrition"[^]*?<b>Engpass:<\/b> Ernährung – Kalorien-Treue Ø 84,9 %\./)
    assert.match(mit({ kacheln: KACHELN({ engpass_grund: 'keine_modulwerte' }) }), /<b>Engpass:<\/b> erst mit Modulwerten\./)
  })
  it('G-522: fehlt ein Wert, steht der Grund der Kette, keine Null', () => {
    const h = mit({ kacheln: KACHELN({ nutrition: { wert: null, tage: 0, grund: 'kein_kalorienlog' }, training: { wert: null, wochenziel: null, score: null, grund: 'kein_wochenziel' } }) })
    assert.match(modul(h, 'nutrition'), /data-modul-wert[^>]*>—<\/div><div[^>]*>kein Kalorienlog</)
    assert.match(modul(h, 'training'), /data-modul-wert[^>]*>—<\/div><div[^>]*>kein Wochenziel</)
    assert.match(modul(mit({ kacheln: KACHELN({ nutrition: { wert: 78, tage: 1, grund: null } }) }), 'nutrition'), />kcal-Treue 1 Tag</)
  })
  it('G-648 Abnahme: ohne aktives Steuerziel, aber mit Kacheln (eingefroren) zeigt Module die Werte', () => {
    const h = renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(ReiterGoals, {
      ziele: [Z({ zustand: zustandAusStatus('achieved') }), KB, KF], phasen: [], offenePhasen: [], zielwerte: ZW({}), vorschlag: null, messungen: [], meilensteine: [], strategien: [ST, AUF], plaene: [],
      woche: { trainings: 3, beitraege: [], trend: { heute: 84.7, vorwoche: 84.7 }, kacheln: KACHELN() }, stichtag: '2026-10-16',
      onZielSetzen: () => {}, onMessziel: () => {}, onPhaseEngine: () => {}, onCrossModule: () => {},
    })))
    assert.ok(!/data-module-leer/.test(h), 'mit Kacheln steht trotzdem „Ohne steuerndes Ziel“')
    assert.match(modul(h, 'recovery'), />66,9</)
  })
  it('G-522: die App rechnet keinen eigenen Engpass und keinen Modulschnitt', () => {
    const q = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'app', 'v2', 'goals', 'reiter-goals.tsx'), 'utf8')
    assert.ok(!/modulSchnitt|engpass\(|reduce\(\(a, b\) => \(b\.schnitt/.test(q), 'reiter-goals.tsx rechnet Schnitt oder Engpass selbst')
    const rr = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'reiter-read.ts'), 'utf8')
    assert.match(rr, /kette<Modulkacheln>\('goal_module_cards_at', steuerzielId, stichtag\)/)
    // ladeWoche gibt den gelesenen Wert zurueck — nicht nur gelesen und liegen gelassen.
    const rueck = rr.slice(rr.indexOf('  return {', rr.indexOf('export async function ladeWoche')))
    assert.match(rueck.slice(0, rueck.indexOf('\n  }')), /\n\s+kacheln,\r?\n/, 'ladeWoche reicht die Kacheln nicht durch')
  })
  it('Diese Woche: Bewegung je Messziel mit Einheit, Wertung gegen das Soll, kein „kommt (offen)"', () => {
    const h = mit({ messwochen: { k1: MW({ delta_woche: 3, soll_delta_woche: 0.942 }), f1: MW({ delta_woche: 0.93, soll_delta_woche: -0.062 }) } })
    const woche = h.slice(h.indexOf('aria-label="Diese Woche"'), h.indexOf('aria-label="Module"'))
    assert.ok(woche.length > 100 && !woche.includes('data-kommt'), 'in „Diese Woche" noch „kommt"')
    const zeile = (k: string) => h.slice(h.indexOf(`data-woche="${k}"`), h.indexOf('data-woche=', h.indexOf(`data-woche="${k}"`) + 12))
    assert.match(zeile('kraft-k1'), />\+3,0 kg</)
    assert.match(zeile('kraft-k1'), /color:var\(--pos\)/)
    assert.match(zeile('fett-f1'), />\+0,9 %</)
    assert.match(zeile('fett-f1'), /width:0%;background:var\(--warn\)/)
    assert.match(mit({ messwochen: {} }), /data-woche="kraft-k1"[\s\S]*?keine Messung vor dieser Woche/)
  })
  it('Tempo 4 Wo und voraussichtlich aus der Woche', () => {
    assert.equal(messTempo(MW({ tempo_pro_woche: 3.92 }), 'kg'), '+3,9 kg/Wo')
    assert.equal(messTempo(MW({ tempo_pro_woche: -0.2 }), '%'), '−0,2 %/Wo')
    assert.equal(messTempo(MW({}), 'kg'), '—')
    assert.equal(messTempo(undefined, 'kg'), '—')
    assert.equal(messPrognose(MW({ prognose_status: 'datum', prognose_datum: '2027-02-03' })), 'Feb 2027')
    assert.equal(messPrognose(MW({})), 'nicht absehbar')
    assert.equal(messPrognose(MW({ prognose_status: 'nicht_absehbar', prognose_datum: '2027-02-03' })), 'nicht absehbar', 'der Status entscheidet, nicht das Feld')
    assert.equal(messPrognose(null), '—')
  })
})
