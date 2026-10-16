/**
 * G-618 + G-636 — der Reiter Goals nach dem Entwurf (`entwurf/Main.dc.html`,
 * Dossier 8.4–8.6).
 *
 * `[cmd]` **Gegen die Kette:** jede Quellbezeichnung aus
 * `617_measurement_goal_expansion.sql` hat einen lesbaren Namen; jede
 * Herkunft aus G-622/G-637 fuehrt zu einem Zustand der Steuerung;
 * `phase_am` (die Quelle fuer „laufend", G-636) traegt kein `LIMIT` und
 * liefert nur Phasen aktiver Ziele. **Bis in die Anzeige:** der Reiter wird
 * gerendert — kein Tabellenname, keine Rohkennung, kein Loeschen-Knopf.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import {
  ABSCHLUSS, engpass, gewichtWoche, kalenderwoche, kategorieVon, lageVon, modulSchnitt,
  quelleLesbar, steuerZustand, wertMitEinheit, wochenStart, type ReiterZiel,
} from '../reiter'
import { MESSARTEN } from '../messziel'
import { zustandAusStatus } from '../zustand'
import { ReiterGoals } from '../../../app/v2/goals/reiter-goals'
import type { Phase, ZielFortschritt, Zielphase } from '../lesen'
import type { Zielwerte } from '../../profile/zielwerte-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')
const WURZEL = join(SRC, '..', '..', '..')
const KETTE = join(WURZEL, 'supabase', '_pipeline', '11_goals')
const SQL = (f: string) => readFileSync(join(KETTE, f), 'utf8')
const lies = (p: string) => readFileSync(join(SRC, p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

// ── gegen die Kette ──────────────────────────────────────────────

describe('G-618 — gegen die Kette', () => {
  const g617 = SQL('617_measurement_goal_expansion.sql')
  it('jede Quellbezeichnung der Kette ist lesbar, keine bleibt Tabellenname', () => {
    const quellen = new Set(Array.from(g617.matchAll(/'((?:goals|training|recovery)\.[a-z_0-9./]+)'(?:::text)?/g)).map(m => m[1]!)
      .filter(q => !/^goals\.(user_goals|body_measurements|body_circumferences|manual_goal_values|measurement_[a-z_]+)$/.test(q) || q === 'goals.body_measurements' || q === 'goals.manual_goal_values'))
    // die Umfangsquelle wird zusammengesetzt: 'goals.body_circumferences.' || site
    assert.match(g617, /'goals\.body_circumferences\.' \|\| g\.measurement_site/)
    quellen.add('goals.body_circumferences.waist_cm')
    assert.ok(quellen.size >= 14, `nur ${quellen.size} Quellen gefunden — Muster falsch?`)
    for (const q of Array.from(quellen)) {
      if (/^(training|recovery)\.[a-z_]+$/.test(q) && q !== 'training.workout_sessions' && q !== 'training.workout_sets') continue // Tabellennamen in FROM/JOIN
      const l = quelleLesbar(q)
      assert.ok(l, `Quelle „${q}" hat keinen lesbaren Namen`)
      assert.ok(!/[._]/.test(l!.replace(/\d/g, '')), `„${l}" sieht aus wie ein Bezeichner`)
    }
    assert.equal(quelleLesbar('goals.body_circumferences.waist_cm'), 'Umfangmessung · Taille')
    assert.equal(quelleLesbar('etwas.neues'), null, 'Unbekanntes wird nicht erfunden')
  })
  it('jede Messart der Kette hat eine Kategorie', () => {
    const check = g617.slice(g617.indexOf('ADD CONSTRAINT user_goals_measurement_type_check'))
    const arten = Array.from(check.slice(0, check.indexOf(');')).matchAll(/'([a-z_0-9]+)'/g)).map(m => m[1]!)
    for (const a of arten) {
      const k = kategorieVon({ measurement_type: a, goal_type: null })
      const soll = a in MESSARTEN ? MESSARTEN[a as keyof typeof MESSARTEN].kategorie : 'eigenes'
      assert.equal(k, soll, a)
    }
    assert.equal(kategorieVon({ measurement_type: null, goal_type: 'performance' }), 'kraft', 'Altziel ohne Messart')
  })
  it('jede Herkunft aus G-622/G-637 fuehrt zu einem Zustand der Steuerung', () => {
    const g622 = SQL('622_goal_free_maintenance.sql')
    const g637 = SQL('637_active_goal_phase_gap.sql')
    assert.match(g622, /'kein_aktives_ziel'::text/)
    assert.match(g622, /'erhaltung_nicht_berechenbar'::text/)
    assert.match(g637, /THEN 'ziel_ohne_laufende_phase'/)
    const S = (herkunft: Zielwerte['herkunft'] | null, ruhend = false, ziel = false, phase = false) =>
      steuerZustand({ herkunft, ruhend, steuerziel: ziel ? Z({}) : null, laufendePhaseZumZiel: phase })
    assert.equal(S('ziel_ohne_laufende_phase', false, true), 'ohne_phase')
    assert.equal(S('kein_aktives_ziel'), 'kein_ziel')
    assert.equal(S('kein_aktives_ziel', true), 'pausiert')
    assert.equal(S('erhaltung_nicht_berechenbar'), 'kein_ziel')
    assert.equal(S(null, false, true, true), 'laeuft', 'aktive Phase ohne gespeichertes Tagesziel')
    assert.equal(S('formel', false, true, true), 'laeuft')
    assert.equal(S(null, false, true, false), 'ohne_phase')
  })
  it('G-636: phase_am — die Quelle fuer „laufend" — ohne LIMIT, nur aktive Ziele', () => {
    // `[read]` **Die juengste Definition in der Kette** (Dateien nach Nummer).
    const dateien = readdirSync(KETTE).filter(f => f.endsWith('.sql')).sort()
    // `[cmd]` **Verankert auf CREATE** — `COMMENT ON FUNCTION goals.phase_am(`
    // steht am Dateiende und waere sonst der letzte Treffer (2026-10-09 gemessen).
    const DEF = /CREATE (?:OR REPLACE )?FUNCTION goals\.phase_am\(/g
    const mit = dateien.filter(f => DEF.test(SQL(f)) && (DEF.lastIndex = 0, true))
    assert.ok(mit.length > 0, 'keine Definition von phase_am in der Kette')
    const q = SQL(mit.at(-1)!)
    const treffer = Array.from(q.matchAll(DEF))
    const rumpf = q.slice(treffer.at(-1)!.index!)
    const bis = rumpf.slice(0, rumpf.indexOf('$$;', rumpf.indexOf('$$') + 2))
    assert.ok(!/\bLIMIT\b/i.test(bis), `${mit.at(-1)}: phase_am traegt ein LIMIT`)
    assert.match(bis, /ug\.status = 'active'/, `${mit.at(-1)}: phase_am liefert auch Phasen ruhender Ziele`)
    // und der Kopf zaehlt genau diese Menge
    const a = lies('app/v2/goals/ansicht.tsx')
    assert.match(a, /const laufendePhasen = echt\.phasen\b/)
    // Tom 16.10.: die Phasen-Pille im Kopf entfaellt — die Menge zeigt die Phase engine
    assert.ok(!/data-kopf-phasen/.test(a), 'die Phasen-Pille steht wieder im Kopf')
  })
})

describe('G-618 — die Lesewege gegen ihre Signaturen', () => {
  const read = lies('lib/goals/reiter-read.ts')
  it('measurement_points / measurement_weeks: Parameter wie in 617', () => {
    const g617 = SQL('617_measurement_goal_expansion.sql')
    for (const f of ['measurement_points', 'measurement_weeks']) {
      assert.match(g617, new RegExp(`CREATE FUNCTION goals\\.${f}\\(p_goal_id uuid, p_through date`))
      assert.match(read, new RegExp(`rpc\\('${f}', \\{ p_goal_id: goalId, p_through: stichtag \\}\\)`))
    }
    // die gelesenen Rueckgabespalten stehen in der Signatur
    assert.match(g617, /RETURNS TABLE\(measured_on date, value numeric, source_name text,/)
    assert.match(read, /r\.measured_on[\s\S]{0,40}r\.value[\s\S]{0,60}r\.source_name/)
    assert.match(g617, /RETURNS TABLE\(week_start date, observed_value numeric, quota_pct numeric,\s*streak_weeks integer, target_met boolean\)/)
  })
  it('goal_contributions: Spalten und Module wie in G-514', () => {
    const ddl = readFileSync(join(WURZEL, 'supabase', 'migrations', '20260929081000_g514_goal_contributions.sql'), 'utf8')
    for (const s of ['goal_id uuid', 'contribution_date date', 'module text', 'contribution_score numeric']) assert.ok(ddl.includes(s), s)
    assert.match(read, /\.from\('goal_contributions'\)\.select\('module, contribution_score, contribution_date'\)/)
    assert.match(read, /\.eq\('goal_id', steuerzielId\)/)
    const check = /module IN \(([^)]*)\)/.exec(ddl)![1]!
    for (const m of ['nutrition', 'training', 'recovery', 'supplements']) assert.ok(check.includes(`'${m}'`), m)
    assert.match(lies('app/v2/goals/reiter-goals.tsx'), /MODULE_DER_KETTE = \['nutrition', 'training', 'recovery', 'supplements'\]/)
  })
  it('ziel_ohne_laufende_phase_am: Parameter und Spalten wie in 637', () => {
    const g637 = SQL('637_active_goal_phase_gap.sql')
    assert.match(g637, /CREATE FUNCTION goals\.ziel_ohne_laufende_phase_am\(\s*p_user_id uuid, p_stichtag date/)
    assert.match(g637, /goal_id uuid, letzte_phase_id uuid, letzte_phase_ende date,\s*recommended_next text/)
    const zw = lies('lib/profile/zielwerte-read.ts')
    assert.match(zw, /rpc\('ziel_ohne_laufende_phase_am', \{ p_user_id: userId, p_stichtag: stichtag \}\)/)
    assert.match(zw, /letzte_phase_ende: text\(z\.letzte_phase_ende\), recommended_next: text\(z\.recommended_next\)/)
  })
})

// ── reine Bausteine ──────────────────────────────────────────────

const Z = (o: Partial<ZielFortschritt>): ZielFortschritt => ({
  goal_id: 'g1', goal_type: 'body_composition', subtype: null, title: 'Ziel', target_value: 76,
  target_unit: 'kg', start_value: 81.4, current_value: 80, current_source: 'goals.body_measurements',
  progress_pct: 25, progress_status: 'measured', lage: null, measured_at: '2026-10-08', target_date: '2026-12-31',
  gueltig_ab: '2026-10-01', linked_modules: [], status: 'active', is_primary: false, priority: 1,
  goal_role: 'controlling', measurement_type: null, measurement_rhythm: 'once', measurement_site: null,
  achievement_date: null, ...o,
  // G-640: ohne Angabe der Rueckfall — der Zustand folgt dem gespeicherten Status.
  zustand: o.zustand ?? zustandAusStatus(o.status ?? 'active'),
})

describe('G-618 — die Bausteine', () => {
  it('Woche: Montag und Kalenderwoche', () => {
    assert.equal(wochenStart('2026-10-09'), '2026-10-05')
    assert.equal(wochenStart('2026-10-05'), '2026-10-05')
    assert.equal(wochenStart('2026-10-11'), '2026-10-05')
    assert.equal(kalenderwoche('2026-10-09'), 41)
    assert.equal(kalenderwoche('2027-01-01'), 53)
  })
  it('Gewicht der Woche: juengste gegen davor, Soll aus dem Tempo', () => {
    const m = [{ measurement_date: '2026-10-01', weight_kg: 81.4 }, { measurement_date: '2026-10-07', weight_kg: 81.0 },
      { measurement_date: '2026-10-08', weight_kg: 80.9 }, { measurement_date: '2026-10-20', weight_kg: 70 }]
    const r = gewichtWoche(m, '2026-10-09', -0.5)
    assert.equal(r.delta, -0.5)
    assert.equal(r.soll, -0.41)
    assert.equal(gewichtWoche(m.slice(0, 1), '2026-10-09', null).grund, 'diese Woche noch nicht gewogen')
    assert.equal(gewichtWoche(m.slice(1, 2), '2026-10-09', null).grund, 'keine Messung vor dieser Woche')
  })
  it('Module: ohne Zeile „kommt" (null), nicht 0; Engpass nur unter gemessenen', () => {
    const s = modulSchnitt([
      { module: 'recovery', contribution_score: 70, contribution_date: '2026-10-08' },
      { module: 'recovery', contribution_score: 60, contribution_date: '2026-10-07' },
      { module: 'supplements', contribution_score: 90, contribution_date: '2026-10-08' },
    ], ['nutrition', 'recovery', 'supplements'])
    assert.deepEqual(s.map(x => x.schnitt), [null, 65, 90])
    assert.equal(engpass(s)?.module, 'recovery')
    assert.equal(engpass(modulSchnitt([], ['nutrition'])), null)
  })
  it('Lage: nur aus goal_progress_at — einmalig aus `lage` (G-643), Woche aus der Quote; ohne Istwert keine Pille', () => {
    const r = (o: Partial<ZielFortschritt>) => lageVon(Z(o) as ReiterZiel)
    const keine = { lage: null, text: null }
    // `[cmd]` **G-648: einmalig liest die Kette selbst** (`goal_progress_at.lage`, G-643).
    assert.deepEqual(r({ lage: 'hinterher' }), { lage: 'hinterher', text: 'hinterher' })
    assert.deepEqual(r({ lage: 'im_plan' }), { lage: 'im_plan', text: 'im Plan' })
    assert.deepEqual(r({ lage: 'offen' }), keine, '„offen" heisst: die Kette kann nicht werten')
    assert.deepEqual(r({ lage: null }), keine, 'keine eigene Rechnung, wo die Kette schweigt')
    assert.deepEqual(r({ lage: 'voraus', current_value: null }), keine, 'keine Pille ohne Istwert (Schirm G-640)')
    assert.deepEqual(r({ measurement_rhythm: 'weekly', progress_pct: 100 }), { lage: 'voraus', text: 'diese Woche erreicht' })
    assert.deepEqual(r({ measurement_rhythm: 'weekly', progress_pct: 50 }), { lage: 'hinterher', text: 'diese Woche offen' })
    assert.deepEqual(r({ measurement_rhythm: 'weekly', progress_pct: 50, current_value: null }), keine)
    assert.deepEqual(r({ measurement_rhythm: 'weekly', progress_pct: 50, status: 'achieved' }), keine, 'eingefroren: keine Wertung')
    assert.deepEqual(r({ measurement_rhythm: 'weekly', progress_pct: 50, progress_status: 'frozen' }), keine)
  })
  it('Einheit lesbar', () => {
    assert.equal(wertMitEinheit(3, 'sessions_per_week'), '3 pro Woche')
    assert.equal(wertMitEinheit(7.5, 'h/night'), '7,5 h')
    assert.equal(wertMitEinheit(null, 'kg'), '—')
  })
  it('Abgeschlossen: erreicht / verfehlt / beendet', () => {
    assert.deepEqual(ABSCHLUSS, { achieved: 'erreicht', missed: 'verfehlt', abandoned: 'beendet' })
  })
})

// ── bis in die Anzeige ───────────────────────────────────────────

const ZW = (o: Partial<Zielwerte>): Zielwerte => ({
  gueltig_ab: '2026-10-09', kcal: 2753.6, protein_g: 162.8, carbs_g: null, fat_g: null, fiber_g: null,
  linoleic_acid_g: null, alpha_linolenic_acid_g: null, herkunft: 'formel', tdee: 2753.6,
  nutrition_goal: 'cut', ruhendes_ziel: null, luecke: null, eingefroren: null, ...o,
})
const PH = (o: Partial<Phase>): Phase => ({
  phase_id: 'p1', goal_id: 'g1', phase_type: 'fat_loss', variant: null, parameters: {},
  gueltig_ab: '2026-10-01', projected_end_date: '2026-12-24', actual_end_date: null,
  transitioned_from: null, recommended_next: null, transition_reason: null, zielrate_pct_kg_woche: -0.5, ...o,
})
const OP: Zielphase = {
  phase_id: 'p1', goal_id: 'g1', phase_type: 'fat_loss', strategie_code: null, gueltig_ab: '2026-10-01',
  projected_end_date: null, actual_end_date: null, zielrate_pct_kg_woche: -0.5, parameters: {},
}
const MESS = [
  Z({ goal_id: 'm1', goal_role: 'measurement', goal_type: 'lifestyle', title: 'Trainings 3', measurement_type: 'training_sessions_week',
    measurement_rhythm: 'weekly', target_value: 3, target_unit: 'sessions_per_week', current_value: 1, start_value: 0,
    current_source: 'training.workout_sessions', progress_pct: 33.3 }),
  Z({ goal_id: 'm2', goal_role: 'measurement', goal_type: 'performance', title: 'Bank 120', measurement_type: 'e1rm',
    target_value: 120, start_value: 105.41, current_value: 105.41, current_source: 'training.workout_sets.estimated_1rm', target_date: null }),
  Z({ goal_id: 'm3', goal_role: 'measurement', title: 'Taille 80', measurement_type: 'circumference', target_unit: 'cm',
    current_source: 'goals.body_circumferences.waist_cm' }),
  Z({ goal_id: 'a1', goal_role: 'measurement', status: 'achieved', title: 'Alt erreicht' }),
  Z({ goal_id: 'a2', goal_role: 'measurement', status: 'missed', title: 'Alt verfehlt' }),
  Z({ goal_id: 'a3', goal_role: 'measurement', status: 'abandoned', title: 'Alt beendet' }),
]

// `SteuerungOhneZiel` ruft `useRouter` — ohne den App-Router-Kontext wirft es.
const ROUTER = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} }
const reiter = (o: { ziele?: ZielFortschritt[]; phasen?: Phase[]; zielwerte?: Zielwerte | null }) => renderToStaticMarkup(
  React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(ReiterGoals, {
    ziele: o.ziele ?? [Z({}), ...MESS], phasen: o.phasen ?? [PH({})], offenePhasen: [OP],
    zielwerte: o.zielwerte === undefined ? ZW({}) : o.zielwerte, vorschlag: null, messungen: [], meilensteine: [],
    strategien: [], woche: { trainings: 2, beitraege: [], trend: { heute: 80.2, vorwoche: null } }, stichtag: '2026-10-09',
    onZielSetzen: () => {}, onMessziel: () => {}, onPhaseEngine: () => {},
  })))

describe('G-618 — bis in die Anzeige', () => {
  it('laeuft: Ziel, Phase, Tempo, Tagesziel', () => {
    const h = reiter({})
    assert.match(h, /data-steuerung="laeuft"/)
    // G-648: Entwurf — Start · Trend · Ziel, Tagesziel „kcal · g P"; das Tempo steht als Soll in den Details
    assert.match(h, /Trend <\/span><span class="ge-num"[^>]*>80,2 kg/)
    assert.match(h, /white-space:nowrap">2\.754 kcal · 163 g P</, 'Tagesziel ohne Umbruch (Tom 16.10.)')
    assert.match(h, /Woche 2 von 12/)
    assert.match(h, /ohne Variante/, 'die fehlende Variante steht da')
  })
  it('kein Ziel / pausiert / ohne laufende Phase', () => {
    const kein = reiter({ ziele: MESS, phasen: [], zielwerte: ZW({ herkunft: 'kein_aktives_ziel' }) })
    assert.match(kein, /data-steuerung="kein_ziel"/)
    assert.match(kein, /Kein Ziel aktiv – du läufst auf Erhaltung/)
    const ruht = reiter({ ziele: [Z({ status: 'paused' }), ...MESS], phasen: [],
      zielwerte: ZW({ herkunft: 'kein_aktives_ziel', ruhendes_ziel: { goal_id: 'g1', title: 'Abbau', seit: '2026-10-01' } }) })
    assert.match(ruht, /data-steuerung="pausiert"/)
    assert.match(ruht, /Pausiert seit 01\.10\.<\/b> – du läufst auf Erhaltung/)
    assert.match(ruht, /data-fortsetzen[^>]*>Fortsetzen …/, 'Fortsetzen fragt zuerst „Wie fortsetzen?" (Entwurf)')
    const luecke = reiter({ phasen: [], zielwerte: ZW({ herkunft: 'ziel_ohne_laufende_phase',
      luecke: { goal_id: 'g1', title: 'Lean Bulk bis September', letzte_phase_ende: '2026-09-29', recommended_next: 'maintenance' } }) })
    assert.match(luecke, /data-steuerung="ohne_phase"/)
    assert.match(luecke, /„Lean Bulk bis September“ ist aktiv, hat aber seit 29\.09\.2026 keine laufende Phase – du läufst auf Erhaltung\./)
    assert.match(luecke, /Empfohlen als nächste Phase: Maintenance/)
    assert.match(luecke, /data-steuerung-phase[^>]*>Nächste Phase wählen/)
  })
  it('Messziele: je Kategorie, lesbare Einheit und Quelle, Details und Bearbeiten; Loeschen erst im Bearbeiten', () => {
    const h = reiter({})
    assert.match(h, /data-messziel-gruppe="kraft"[\s\S]*data-messziel-gruppe="koerper"[\s\S]*data-messziel-gruppe="gewohnheit"/)
    assert.equal((h.match(/data-messziel-kachel=/g) ?? []).length, 3, 'abgeschlossene stehen nicht bei den offenen')
    assert.match(h, /3× \/ Wo/, 'Entwurf: „4× \/ Wo"')
    assert.match(h, /Training · geschätztes 1RM/)
    assert.match(h, /Umfangmessung · Taille/)
    assert.equal((h.match(/data-messziel-details=/g) ?? []).length, 3)
    assert.equal((h.match(/data-messziel-bearbeiten=/g) ?? []).length, 3)
    for (const roh of ['sessions_per_week', 'goals.body_measurements', 'training.workout_sets', 'goals.body_circumferences', 'h/night']) {
      assert.ok(!h.includes(roh), `Rohkennung „${roh}" am Schirm`)
    }
    const kacheln = h.slice(h.indexOf('data-messziel-kachel='), h.indexOf('aria-label="Abgeschlossen"'))
    assert.ok(!/Löschen|data-[a-z-]*loeschen/i.test(kacheln), 'Loeschen steht im Entwurf erst im Bearbeiten der Kachel')
    assert.match(h, /data-lage="hinterher"/, 'die Gewohnheit 1 von 3 liegt hinterher')
  })
  it('Diese Woche und Module: nur Daten, was fehlt „kommt"', () => {
    const h = reiter({})
    assert.match(h, /Diese Woche · KW 41/)
    assert.match(h, /data-woche="trainings"[^]*?>2 \/ 3</, 'Trainings gegen das Wochenziel')
    assert.match(h, /keine Messung vor dieser Woche/, 'Trend ohne Vorwoche: Grund statt Zahl')
    assert.match(h, /data-kommt/)
    assert.equal((h.match(/data-modul="[a-z]+"/g) ?? []).length, 4)
    assert.match(h, /noch keine Beiträge — kommt/)
    assert.ok(!/\d+ \/ 100/.test(h), 'eine Modulzahl ohne Beitrag')
  })
  it('Abgeschlossen: mit Zahl, offen wie im Entwurf', () => {
    assert.match(reiter({}), /Abgeschlossen · 3/)
  })
})

describe('G-618 — das Drei-Plaetze-Modell ist raus', () => {
  it('kein Platz 1–3 begrenzt das Anlegen', () => {
    for (const f of ['app/v2/goals/planer.tsx', 'app/v2/goals/ziel-setzen.tsx']) {
      const q = lies(f)
      assert.ok(!/\[1, 2, 3\]\.find/.test(q), `${f}: sucht einen freien Platz 1–3`)
      assert.ok(!/platz === null/.test(q), `${f}: sperrt bei vollen Plaetzen`)
    }
  })
  it('steuernd heisst goal_role', () => {
    assert.ok(!/is_primary/.test(lies('app/v2/goals/planer.tsx').replace(/data-[a-z-]+/g, '')))
    // G-640: wirksam aktiv (goal_state_at), nicht der gespeicherte Status.
    assert.match(lies('lib/goals/reiter.ts'), /g\.goal_role === 'controlling' && g\.zustand\.zustand === 'active'/)
  })
  it('das Bearbeiten fuehrt keine Prioritaet mehr', () => {
    // G-648: Bearbeiten steht in der Karte (Entwurf), `ziel-editor.tsx` ist weg.
    const q = lies('app/v2/goals/reiter-goals.tsx')
    assert.ok(!/priority|Priorität|PRIO_/.test(q))
  })
})
