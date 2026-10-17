/**
 * G-629 — die Phase Engine als Planer.
 *
 * `[cmd]` **Gegen die Kette (G-625, live):** jede `goal_plan_*`-Signatur in
 * `625_goal_plan_runtime.sql` / `_position_revision.sql`, jeder
 * `G625_BLOCK`-Schluessel, die CHECKs fuer Terminart und Planstatus, die
 * Schluessel der eigenen Werte und die Richtungszuordnung des Triggers.
 * **Bis in die Anzeige:** Sperre unter Pro, Zeitachse, „keine Vorgabe", „kommt".
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  EIGENE_WERTE, PLAN_STATUS_TEXT, TERMIN_ART, abPro, katalogwerte, naechstePosition, planFehler,
  positionszustand, refeedRhythmus, richtungFuer, zeitachse,
} from '../plan'
import { PlanSeite } from '../../../app/v2/goals/plan-seite'
import type { Plan } from '../plan-read'
import type { Strategie } from '../strategie-read'
import { zustandAusStatus } from '../zustand'
import type { ZielFortschritt } from '../lesen'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')
const KETTE = join(SRC, '..', '..', '..', 'supabase', '_pipeline', '11_goals')
const SQL = (f: string) => readFileSync(join(KETTE, f), 'utf8')
const ALLE625 = readdirSync(KETTE).filter(f => /^625_goal_(plan|strategy)_.*\.sql$/.test(f)).map(SQL).join('\n')
const lies = (p: string) => readFileSync(join(SRC, p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

/** Die Parameternamen einer Funktion der Kette, in Reihenfolge. */
function parameter(name: string): string[] {
  const i = ALLE625.indexOf(`CREATE FUNCTION goals.${name}(`)
  assert.ok(i >= 0, `${name} fehlt in der Kette`)
  const kopf = ALLE625.slice(i, ALLE625.indexOf('RETURNS', i))
  return Array.from(kopf.matchAll(/\b(p_[a-z_]+)\s+[a-z]/g)).map(m => m[1]!)
}
/** Die Parameternamen, die der Schreibweg einer Funktion schickt. */
function gesendet(name: string): string[] {
  const w = lies('lib/goals/plan-write.ts')
  const i = w.indexOf(`rufe('${name}', {`)
  assert.ok(i >= 0, `${name} wird nicht gerufen`)
  const block = w.slice(i, w.indexOf('})', i))
  return Array.from(block.matchAll(/\b(p_[a-z_]+):/g)).map(m => m[1]!)
}

describe('G-629 — gegen die Signaturen', () => {
  for (const f of ['goal_plan_create', 'goal_plan_activate', 'goal_plan_pause', 'goal_plan_complete', 'goal_plan_delete',
    'goal_plan_position_save', 'goal_plan_position_move', 'goal_plan_position_revise', 'goal_plan_event_save', 'goal_plan_event_delete']) {
    it(`${f}: alle Parameter in der Reihenfolge der Kette`, () => assert.deepEqual(gesendet(f), parameter(f)))
  }
  it('der Leser fragt goal_program_events nach den Spalten der Kette', () => {
    const ddl = SQL('625_goal_plan_model.sql')
    const t = ddl.slice(ddl.indexOf('CREATE TABLE goals.goal_program_events'), ddl.indexOf(');', ddl.indexOf('CREATE TABLE goals.goal_program_events')))
    for (const s of ['program_id uuid', 'name text', 'kind text', 'event_date date']) assert.ok(t.includes(s), s)
    assert.match(lies('lib/goals/plan-read.ts'), /from\('goal_program_events'\)\.select\('id, program_id, name, kind, event_date'\)/)
  })
  it('Terminarten und Planstatus wie die CHECKs', () => {
    const art = /kind text NOT NULL CHECK \(kind IN \(([^)]*)\)\)/.exec(ALLE625)![1]!
    assert.deepEqual(Object.keys(TERMIN_ART).sort(), Array.from(art.matchAll(/'([A-Z])'/g)).map(m => m[1]).sort())
    const st = /CHECK \(status IN \(([^)]*)\)\)/.exec(ALLE625)![1]!
    assert.deepEqual(Object.keys(PLAN_STATUS_TEXT).sort(), Array.from(st.matchAll(/'([a-z]+)'/g)).map(m => m[1]).sort())
  })
  it('eigene Werte: genau die Schluessel, die goal_program_position_validate prueft', () => {
    const v = SQL('625_goal_plan_model.sql')
    const soll = new Set(Array.from(v.matchAll(/'(tempo_pct_kg_woche|kcal_pct_erhaltung|protein_g_kg|fett_g_kg|cardio_pro_woche|refeed_pro_woche|max_duration_weeks)'/g)).map(m => m[1]!))
    assert.equal(soll.size, 7)
    assert.deepEqual(EIGENE_WERTE.map(e => e.key).sort(), Array.from(soll).sort())
  })
  it('jeder G625_BLOCK-Schluessel der Kette wird ein Satz', () => {
    const keys = new Set(Array.from(ALLE625.matchAll(/'G625_BLOCK:([a-z_%]+)'/g)).map(m => m[1]!))
    // `eigene_werte_%` setzt die Kette mit dem Feldnamen zusammen
    for (const k of Array.from(keys).flatMap(k => k === 'eigene_werte_%' ? ['eigene_werte_protein_g_kg', 'eigene_werte_fett_g_kg', 'eigene_werte_cardio_pro_woche', 'eigene_werte_refeed_pro_woche'] : [k])) {
      const f = planFehler(`ERROR: G625_BLOCK:${k}`)
      assert.equal(f.schluessel, k)
      assert.notEqual(f.satz, 'Die Datenbank hat das abgelehnt.', `${k} hat keinen Satz`)
      assert.ok(!/G625_/.test(f.satz))
    }
    assert.ok(keys.size >= 30, `nur ${keys.size} Schluessel gefunden`)
  })
  it('Richtung wie der Trigger g625_phase_to_plan', () => {
    const t = SQL('625_goal_plan_runtime.sql')
    assert.match(t, /WHEN 'fat_loss' THEN 'abnehmen'\s+WHEN 'mini_cut' THEN 'abnehmen'\s+WHEN 'lean_bulk' THEN 'aufbauen'\s+ELSE 'halten' END/)
    assert.equal(richtungFuer('plan', 'fat_loss'), 'abnehmen')
    assert.equal(richtungFuer('uebergang', 'reverse_diet'), 'halten')
    assert.equal(richtungFuer('aufbauen', 'lean_bulk'), 'aufbauen')
  })
  it('Grenzen nur aus ziel_grenzen_pruefen — mit eigenen Werten (625_goal_plan_limits)', () => {
    assert.match(SQL('625_goal_plan_limits.sql'), /p_programm_code text DEFAULT NULL,\s*p_eigene_werte jsonb DEFAULT NULL/)
    assert.match(lies('lib/goals/zielpruefung-read.ts'), /p_eigene_werte: e\.eigeneWerte \?\? null,/)
    assert.match(lies('app/v2/goals/plan-seite.tsx'), /zielPruefenAktion\(\{[\s\S]{0,300}eigeneWerte: d\.eigene_werte,/)
  })
  // G-656: phasen-zeitachse.tsx ist geloescht — die Regel gilt fuer die Plan-Seite.
  it('die Plan-Seite bewertet nicht selbst (kein berechnePace)', () => {
    const z = lies('app/v2/goals/plan-seite.tsx')
    assert.ok(z.length > 1000 && !/berechnePace|lageVon|PACE_TEXT/.test(z))
  })
})

describe('G-629 — die Bausteine', () => {
  it('ab Pro', () => {
    for (const [g, soll] of [['beginner', false], ['advanced', false], ['pro', true], ['elite', true], [null, false]] as const) assert.equal(abPro(g), soll, String(g))
  })
  it('Positionszustand aus der Kette', () => {
    const laufend = new Set(['ph1'])
    assert.equal(positionszustand({ goal_phase_id: null }, null, laufend, '2026-10-10'), 'geplant')
    assert.equal(positionszustand({ goal_phase_id: 'ph1' }, { actual_end_date: null }, laufend, '2026-10-10'), 'laufend')
    assert.equal(positionszustand({ goal_phase_id: 'ph2' }, { actual_end_date: '2026-10-01' }, laufend, '2026-10-10'), 'abgeschlossen')
    assert.equal(positionszustand({ goal_phase_id: 'ph3' }, { actual_end_date: null }, laufend, '2026-10-10'), 'ruht')
    assert.equal(positionszustand({ goal_phase_id: 'ph4', gueltig_ab: '2026-10-11' }, { actual_end_date: null }, laufend, '2026-10-10'), 'geplant', 'ab morgen geaendert: beginnt erst')
  })
  it('Programmwerte: NULL heisst „keine Vorgabe"', () => {
    const z = katalogwerte({ weight_change_target_percent: -0.75, protein_per_kg: 2.2, fat_percent: 0.25, fett_g_kg: null,
      cardio_pro_woche: null, refeed_pro_woche: null, max_duration_weeks: 20, refeeds: { every_weeks: 8, duration_weeks: 1 } }, null)
    const w = Object.fromEntries(z.map(x => [x.label, x.wert]))
    assert.equal(w.Tempo, '-0,75 % Körpergewicht/Woche')
    assert.equal(w.Protein, '2,2 g/kg')
    assert.equal(w.Fett, '25 % der kcal')
    assert.equal(w['Fett g/kg'], null)
    assert.equal(w.Cardio, null)
    assert.equal(w.Refeed, 'alle 8 Wochen · 1 Woche')
    assert.equal(refeedRhythmus(null), null)
    assert.equal(katalogwerte({ ...{ weight_change_target_percent: null, protein_per_kg: null, fat_percent: null, fett_g_kg: null, cardio_pro_woche: null, refeed_pro_woche: null, max_duration_weeks: null, refeeds: null } }, -0.4)[0]!.wert,
      '-0,4 % Körpergewicht/Woche', 'die gespeicherte Rate geht vor')
  })
  it('naechste Position und Zeitachse', () => {
    assert.deepEqual(naechstePosition([{ position: 1, gueltig_ab: '2026-10-01', projected_end_date: '2026-11-25' }], '2026-10-10'),
      { position: 2, gueltig_ab: '2026-11-26', offenesEnde: false })
    assert.equal(naechstePosition([{ position: 1, gueltig_ab: '2026-05-19', projected_end_date: null }], '2026-10-10').offenesEnde, true)
    const a = zeitachse([{ id: 'a', gueltig_ab: '2026-10-01', projected_end_date: '2026-10-31', zustand: 'laufend' }], [{ event_date: '2026-12-01' }], '2026-10-10')
    assert.equal(a.von, '2026-10-01'); assert.equal(a.bis, '2026-12-01')
    assert.equal(Math.round(a.marke('2026-12-01')), 100)
  })
})

// ── bis in die Anzeige ───────────────────────────────────────────

const ST = (o: Partial<Strategie>): Strategie => ({
  code: 'moderate_cut', label: 'Moderate Cut', description: '', icon: '', category: 'fat_loss', tier: 'advanced',
  auswahl_gruppe: 'abnehmen', min_erfahrung: 'advanced', standard: false, tdee_modifier: null, weight_change_target_percent: -0.75,
  max_duration_weeks: 20, protein_per_kg: 2.2, fat_percent: 0.25, fett_g_kg: null, cardio_pro_woche: null, refeed_pro_woche: null,
  macro_cycling: false, refeed_schedule: false, auto_adjust: false, peak_week: false, badge: null, warnings: [], requirements: {},
  guards: [], next_codes: [], exits: [], success: [], best_for: [], purpose: [], editor_modes: [],
  refeeds: { every_weeks: 8, duration_weeks: 1 }, peak_week_details: null, sub_phases: [], annual: [], ...o,
} as Strategie)
const PLAN: Plan = {
  id: 'p1', goal_id: 'g1', name: 'Abbau Herbst', status: 'aktiv',
  ziel: { title: 'Abbau', status: 'active', target_value: 76, target_date: '2026-12-31' },
  positionen: [
    { id: 'a', position: 1, strategie_code: 'moderate_cut', eigene_werte: null, richtung: 'abnehmen', phase_type: 'fat_loss', duration_weeks: 8,
      gueltig_ab: '2026-10-01', projected_end_date: '2026-11-25', goal_phase_id: 'ph1', zielrate_pct_kg_woche: -0.5, sub_phase_code: null, confirmed_warnings: [], zustand: 'laufend', woche: 'Woche 2 von 8' },
    { id: 'b', position: 2, strategie_code: null, eigene_werte: { kcal_pct_erhaltung: 0, protein_g_kg: 2, fett_g_kg: 1, cardio_pro_woche: 0, refeed_pro_woche: 0 },
      richtung: 'halten', phase_type: 'maintenance', duration_weeks: 4, gueltig_ab: '2026-11-26', projected_end_date: '2026-12-23',
      goal_phase_id: null, zielrate_pct_kg_woche: null, sub_phase_code: null, confirmed_warnings: [], zustand: 'geplant', woche: null },
  ],
  termine: [{ id: 't1', name: 'Landesmeisterschaft', kind: 'A', event_date: '2026-12-20' }],
}
const ZIEL = { goal_id: 'g1', title: 'Abbau', goal_role: 'controlling', zustand: zustandAusStatus('active') } as unknown as ZielFortschritt
const seite = (grad: string | null, plaene: Plan[] = [PLAN]) => renderToStaticMarkup(React.createElement(PlanSeite, {
  plaene, strategien: [ST({})], grad, ziele: [ZIEL], stichtag: '2026-10-10', startKg: 81.4, onZuGoals: () => {},
}))

describe('G-629 — bis in die Anzeige', () => {
  it('unter Pro gesperrt — kein Plan, kein Bearbeiten', () => {
    const h = seite('advanced')
    assert.match(h, /data-plan-gesperrt="advanced"/)
    assert.match(h, /Die Phase engine ist ab Grad Pro frei/)
    assert.ok(!/data-aktiver-plan|data-neuer-plan-oeffnen|data-plan-zeitachse/.test(h))
  })
  it('ab Pro: aktiver Plan mit Zeitachse, Termin, aktueller Phase', () => {
    const h = seite('pro')
    assert.match(h, /data-aktiver-plan="p1"/)
    // G-649: Entwurf „Aktuelle Phase: <b>…</b> · Woche x von y · steuert dein Ziel in Goals"
    assert.match(h, /Aktuelle Phase: <b>Moderate Cut<\/b> · <span data-plan-woche="true">Woche 2 von 8<\/span> · steuert dein Ziel in/)
    assert.equal((h.match(/data-segment=/g) ?? []).length, 2)
    assert.match(h, /data-segment="laufend"/); assert.match(h, /data-segment="geplant"/)
    assert.match(h, /data-termin-marke="A"[^>]*>▲ A Landesmeisterschaft/)
  })
  it('was der Kette fehlt, steht als „kommt" — keine Attrappe', () => {
    const h = seite('elite')
    assert.match(h, /data-vorlagen="kommt"[\s\S]*?data-kommt="G-644"/, 'ohne Tabelle (G-644 nicht live) stehen die Vorlagen als „kommt"')
    assert.ok(!/attrappe|Attrappe/.test(h))
  })
  it('kein aktiver Plan: Erhaltung', () => {
    assert.match(seite('pro', [{ ...PLAN, status: 'pausiert' }]), /Kein Plan aktiv – du läufst auf Erhaltung/)
  })
  it('Details zeigen Programmwerte und „keine Vorgabe" (Quelltext der Details)', () => {
    const q = lies('app/v2/goals/plan-seite.tsx')
    assert.match(q, /z\.wert === null \? <i data-keine-vorgabe>keine Vorgabe<\/i>/)
    // G-649: „kommt" nennt den Punkt — Wachen/Neu berechnen/Coach G-644, Wochenwerte G-650, Anpassung G-627
    // G-644 Teil 2 (live 16.10.): „Speichern und neu berechnen" ruft goal_plan_position_recalculate
    assert.match(q, /data-plan-neu-berechnen disabled=\{Object\.keys\(aend\)\.length === 0\}/)
    assert.ok(!q.includes('<Kommt was="Speichern und neu berechnen"'), 'neu berechnen steht wieder als kommt')
    assert.ok(!q.includes('<Kommt was="Regeln mit Stand"'), 'die Wachen stehen wieder als kommt')
    for (const [was, punkt] of [['Freigabe durch den Coach', 'G-644'], ['Wochenwerte', 'G-650']])
      assert.match(q, new RegExp(`<Kommt was="${was}" punkt="${punkt}" />`), `kommt-Marke ${was} fehlt`)
    // G-627 (live 17.10.): Anpassung und Grund kommen aus dem Protokoll — die Sammelmarke ist weg
    assert.ok(!q.includes('<Kommt was="Anpassung mit Protokoll"'), 'die Anpassung steht wieder als kommt')
    assert.match(q, /anpassungZeile\(plan\.anpassungen, w\.woche_ab, w\.vollstaendig\)/)
  })
})
