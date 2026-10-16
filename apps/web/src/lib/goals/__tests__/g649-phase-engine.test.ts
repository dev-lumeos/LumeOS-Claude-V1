/**
 * G-649 — die Phase Engine 1:1 nach `entwurf/PhaseEngine.dc.html`, und der Rest
 * von G-648: „kommt (G-650)" durch die Werte aus `controlling_goal_outlook`.
 *
 * `[cmd]` **Gegen die Kette (Commit 107da592, live 16.10.):** `goal_plan_templates`,
 * `goal_plan_create(p_goal_id, p_name, p_ausgangspunkt, p_anker_datum)`,
 * `goal_plan_save_as_template`, `goal_plan_position_delete`, jeder
 * `G644_BLOCK`-Schluessel; `controlling_goal_outlook` mit seinen Feldern.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { SAETZE_644, cardioText, defizitText, monatsachse, phasenname, planFehler } from '../plan'
import { PlanSeite } from '../../../app/v2/goals/plan-seite'
import type { Plan, Vorlage } from '../plan-read'
import type { Ausblick } from '../reiter-read'
import type { Strategie } from '../strategie-read'
import { zustandAusStatus } from '../zustand'
import type { ZielFortschritt } from '../lesen'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')
const KETTE = join(SRC, '..', '..', '..', 'supabase', '_pipeline', '11_goals')
const lies = (p: string) => readFileSync(join(SRC, p), 'utf8')
const kette = (f: string) => readFileSync(join(KETTE, f), 'utf8')

describe('G-649 — gegen die Kette', () => {
  it('goal_plan_templates: der Leser waehlt die Spalten der Tabelle', () => {
    const t = kette('644_goal_plan_templates.sql')
    const spalten = /CREATE TABLE goals\.goal_plan_templates \(([\s\S]*?)\n\);/.exec(t)![1]!
    const r = lies('lib/goals/plan-read.ts')
    const sel = /\.from\('goal_plan_templates'\)\s*\.select\('([^']+)'\)/.exec(r)
    assert.ok(sel, 'goal_plan_templates wird nicht gelesen')
    for (const c of sel![1]!.split(',').map(x => x.trim())) assert.match(spalten, new RegExp(`\\n\\s+${c} `), `Spalte ${c} gibt es nicht`)
    // nur „Tabelle fehlt" heisst „noch nicht live"; alles andere wirft
    assert.match(r, /if \(error\.code === 'PGRST205' \|\| error\.code === '42P01'\) return null\r?\n\s+throw new Error/)
  })
  it('Schreibwege: Name und Parameter wie in 644', () => {
    const t = kette('644_goal_plan_templates.sql')
    const w = lies('lib/goals/plan-write.ts')
    const faelle: Array<[string, string[]]> = [
      ['goal_plan_create', ['p_goal_id', 'p_name', 'p_ausgangspunkt', 'p_anker_datum']],
      ['goal_plan_save_as_template', ['p_plan_id', 'p_name']],
      ['goal_plan_position_delete', ['p_position_id']],
    ]
    for (const [fn, params] of faelle) {
      const sig = new RegExp(`CREATE FUNCTION goals\\.${fn}\\(\\s*${params.map(p => `${p} [a-z]+`).join(',\\s*')}\\)`)
      assert.match(t, sig, `${fn}: Signatur in 644 anders`)
      assert.match(w, new RegExp(`rufe\\('${fn}', \\{ ${params.map(p => `${p}: [a-zA-Z]+`).join(', ')} \\}\\)`), `${fn}: App ruft andere Parameter`)
    }
  })
  it('jeder G644_BLOCK-Schluessel hat einen Satz', () => {
    const alle = Array.from(new Set(readdirSync(KETTE).filter(f => f.startsWith('644_')).flatMap(f => Array.from(kette(f).matchAll(/G644_BLOCK:([a-z_]+)/g), m => m[1]!))))
    assert.ok(alle.length >= 10, `nur ${alle.length} Schluessel gefunden`)
    for (const k of alle) assert.ok(SAETZE_644[k], `G644_BLOCK:${k} ohne Satz`)
    assert.equal(planFehler('ERROR: G644_BLOCK:nur_geplante_position').satz, SAETZE_644.nur_geplante_position)
  })
  it('controlling_goal_outlook: die gelesenen Felder liefert die Funktion', () => {
    const t = kette('650_controlling_goal_plan_outlook.sql')
    for (const f of ['plan_datum', 'status', 'datum', 'grund', 'tempo_4w_kg_pro_woche', 'soll_kg_pro_woche', 'verbleibend_kg', 'veraenderung_gesamt_kg',
      'trend_kg', 'soll_kg', 'trend_delta_kg', 'soll_delta_kg', 'durchschnitt_kcal', 'logtage', 'woche_ab', 'woche_bis', 'vollstaendig'])
      assert.match(t, new RegExp(`'${f}',`), `Feld ${f} fehlt in der Kette`)
    assert.match(lies('lib/goals/reiter-read.ts'), /rpc\('controlling_goal_outlook', \{ p_goal_id: goalId, p_stichtag: stichtag \}\)/)
  })
})

describe('Nachtrag Tom 16.10. 15:32', () => {
  it('Kopf: Titel und die eine Aktion je Reiter; keine Zahl am Reiter', () => {
    const a = lies('app/v2/goals/ansicht.tsx')
    const tabs = a.slice(a.indexOf('const TABS: TabItem[] = ['), a.indexOf(']', a.indexOf('const TABS: TabItem[] = [') + 26))
    assert.equal((tabs.match(/id: '/g) ?? []).length, 10)
    assert.ok(!/count:/.test(tabs), 'am Reiter steht wieder eine Zahl')
    assert.match(a, /\{TITEL\[tab\] \?\? 'Ziele'\}<\/h1>/)
    assert.match(a, /\{HAUPTAKTION\[tab\] && \(tab !== 'phase' \|\| proFrei\) && \(/)
    for (const weg of ['data-messziel-neu', 'Log weight', 'Koerpermessungen', '<Pill variant="acc">'])
      assert.ok(!a.includes(weg), `im Kopf steht wieder „${weg}"`)
  })
  it('Bearbeiten steht unter dem jeweiligen Plan', () => {
    const q = lies('app/v2/goals/plan-seite.tsx')
    assert.match(q, /\{aktiv && imBearbeiten\?\.id === aktiv\.id && bearbeiten\(aktiv\)\}/)
    assert.match(q, /\{imBearbeiten\?\.id === p\.id && <div style=\{\{ gridColumn: '1 \/ -1' \}\}>\{bearbeiten\(p\)\}<\/div>\}/)
    assert.equal((q.match(/bearbeiten\(/g) ?? []).length, 2, 'Bearbeiten steht noch an einem dritten Ort')
  })
  it('Umlaute: kein ae/oe/ue-Ersatz in sichtbaren Saetzen der Goals-Dateien', () => {
    const ersatz = /\b(Koerper\w*|fuer|ueber|laesst|laeuft|moeglich|Hoechstdauer|geprueft|Waehle|Ergaenze|Vergleichsgroesse|traegt|waere|zurueck)\b/
    const dir = (d: string) => readdirSync(join(SRC, d)).filter(f => /\.tsx?$/.test(f) && f !== 'mockup-referenz.tsx').map(f => join(d, f))
    const treffer: string[] = []
    for (const f of [...dir('app/v2/goals'), ...dir('lib/goals')]) {
      const q = lies(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
      for (const m of Array.from(q.matchAll(/'([^'\n]* [^'\n]*)'|"([^"\n]* [^"\n]*)"/g)))
        if (ersatz.test(m[1] ?? m[2] ?? '') && !/^\s*import /m.test(m[0])) treffer.push(`${f}: ${(m[1] ?? m[2])!.slice(0, 60)}`)
    }
    assert.deepEqual(treffer, [])
  })
})

describe('G-649 — Spalten des Entwurfs aus dem Katalog', () => {
  const K = [
    { code: 'lean_bulk', label: 'Lean Bulk', tdee_modifier: 0.1, cardio_pro_woche: null, sub_phases: [] },
    { code: 'contest_prep', label: 'Contest Prep', tdee_modifier: -0.25, cardio_pro_woche: null,
      sub_phases: [{ name: 'early', roh: { tdee_multiplier: 0.85, cardio: { sessions_per_week: [3, 4] } } }] },
  ]
  const P = (o: Partial<{ strategie_code: string | null; sub_phase_code: string | null; eigene_werte: Record<string, unknown> | null }>) =>
    ({ strategie_code: null, sub_phase_code: null, eigene_werte: null, phase_type: 'lean_bulk', ...o })
  it('Defizit / Überschuss: tdee_modifier, Stufe, eigene Werte, sonst „–"', () => {
    assert.equal(defizitText(P({ strategie_code: 'lean_bulk' }), K), '+10 %')
    assert.equal(defizitText(P({ strategie_code: 'contest_prep', sub_phase_code: 'early' }), K), '−15 %')
    assert.equal(defizitText(P({ eigene_werte: { kcal_pct_erhaltung: -10 } }), K), '−10 % · eigene')
    assert.equal(defizitText(P({ strategie_code: 'unbekannt' }), K), '–')
  })
  it('Cardio und Name: Stufe vor Programm', () => {
    assert.equal(cardioText(P({ strategie_code: 'contest_prep', sub_phase_code: 'early' }), K), '3–4×')
    assert.equal(cardioText(P({ strategie_code: 'lean_bulk' }), K), '–')
    assert.equal(phasenname(P({ strategie_code: 'contest_prep', sub_phase_code: 'early' }), K), 'early')
    assert.equal(phasenname(P({ strategie_code: 'lean_bulk' }), K), 'Lean Bulk')
  })
  it('Monatsachse: ganze Monate, Jahr ab dem Wechsel', () => {
    const m = monatsachse('2026-06-12', '2027-01-20')
    assert.deepEqual(m.monate, ['Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan 27'])
    assert.equal(m.pos('2026-06-01'), 0)
    assert.equal(m.pos('2027-02-01'), 100)
  })
})

const ST = { code: 'lean_bulk', label: 'Lean Bulk', category: 'lean_bulk', auswahl_gruppe: 'aufbauen', tdee_modifier: 0.1, cardio_pro_woche: null,
  weight_change_target_percent: 0.25, protein_per_kg: 2, fat_percent: 0.25, fett_g_kg: null, refeed_pro_woche: null, max_duration_weeks: 52,
  refeeds: null, sub_phases: [], next_codes: [] } as unknown as Strategie
const POS = (id: string, o: Partial<Plan['positionen'][number]>): Plan['positionen'][number] => ({
  id, position: 1, strategie_code: 'lean_bulk', eigene_werte: null, richtung: 'aufbauen', phase_type: 'lean_bulk', duration_weeks: 20,
  gueltig_ab: '2026-06-12', projected_end_date: '2026-10-29', goal_phase_id: null, zielrate_pct_kg_woche: 0.25, sub_phase_code: null,
  confirmed_warnings: [], zustand: 'geplant', woche: null, ...o,
})
const AKTIV: Plan = { id: 'pa', goal_id: 'g1', name: 'Lean Bulk auf 88 kg', status: 'aktiv', ziel: null, termine: [],
  positionen: [POS('a1', { goal_phase_id: 'ph', zustand: 'laufend', woche: 'Woche 18 von 20' })] }
const ENTWURF: Plan = { id: 'pe', goal_id: 'g1', name: 'Contest Prep 2027', status: 'entwurf', ziel: null,
  termine: [{ id: 't', name: 'Hauptwettkampf', kind: 'A', event_date: '2027-02-04' }], positionen: [POS('e1', { gueltig_ab: '2026-10-15', duration_weeks: 16 })] }
const FERTIG: Plan = { id: 'pf', goal_id: 'g1', name: 'Frühjahrs-Cut', status: 'abgeschlossen', ziel: { title: 'Cut', status: 'achieved', target_value: 84, target_date: '2026-03-25' },
  termine: [], positionen: [POS('f1', { zustand: 'abgeschlossen', goal_phase_id: 'x' })] }
const VORLAGEN: Vorlage[] = [
  { code: 'prep', name: 'Contest Prep 16 Wochen', quelle: 'lumeos', anker_art: 'A', positionen: [{ strategie_code: 'contest_prep', dauer_wochen: 16 }] },
  { code: 'mini', name: 'Mini-Cut-Block', quelle: 'lumeos', anker_art: 'start', positionen: [{ strategie_code: 'mini_cut', dauer_wochen: 4 }] },
  { code: 'f0e1d2c3-0000-0000-0000-000000000000', name: 'Meine Off-Season', quelle: 'eigen', anker_art: 'start', positionen: [{ strategie_code: 'lean_bulk', dauer_wochen: 12 }] },
]
const AUSBLICK: Ausblick = {
  wochen: [
    { woche_ab: '2026-10-05', woche_bis: '2026-10-11', vollstaendig: true, trend_kg: 84.78, soll_kg: 89.38, trend_delta_kg: 0.11, soll_delta_kg: 0.236, durchschnitt_kcal: 2484.4, logtage: 7, anpassung_kcal: null },
    { woche_ab: '2026-10-12', woche_bis: '2026-10-16', vollstaendig: false, trend_kg: 84.82, soll_kg: 89.54, trend_delta_kg: 0.033, soll_delta_kg: 0.16, durchschnitt_kcal: 2361.7, logtage: 5, anpassung_kcal: null },
  ],
  kennzahlen: { start_kg: 85, ziel_kg: 88, trend_kg: 84.817, veraenderung_gesamt_kg: -0.183, tempo_4w_kg_pro_woche: 0.064, soll_kg_pro_woche: 0.212, verbleibend_kg: 3.183, fortschritt_pct: 0 },
  prognose: { plan_datum: '2026-09-01', status: 'datum', datum: '2027-10-01', grund: null },
}
const ZIEL = { goal_id: 'g1', title: 'Lean Bulk auf 88 kg', goal_role: 'controlling', zustand: zustandAusStatus('active') } as unknown as ZielFortschritt
const ROUTER = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} }
const seite = (o: { vorlagen?: Vorlage[] | null; ausblick?: Ausblick | null; plaene?: Plan[] } = {}) => renderToStaticMarkup(
  React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, React.createElement(PlanSeite, {
    plaene: o.plaene ?? [AKTIV, ENTWURF, FERTIG], vorlagen: o.vorlagen === undefined ? VORLAGEN : o.vorlagen, ausblick: o.ausblick ?? null,
    strategien: [ST], grad: 'pro', ziele: [ZIEL], stichtag: '2026-10-16', startKg: 84.8, onZuGoals: () => {},
  })))

describe('G-649 — die Abschnitte des Entwurfs', () => {
  it('Aktiver Plan: Kopf, Zeitraum, Monatsachse, Phasentabelle mit Defizit und Cardio', () => {
    const h = seite()
    assert.match(h, /<span class="ge-typ">Aktiver Plan · 1 Phase<\/span><span class="ge-chip ge-lage-voraus">● läuft<\/span>/)
    assert.match(h, /data-plan-zeitraum="true"[^>]*>12\.06\.26 – 29\.10\.26 · 20 Wochen/)
    assert.match(h, /data-plan-monate="6"[^>]*><span>Jun<\/span><span>Jul<\/span><span>Aug<\/span><span>Sep<\/span><span>Okt<\/span><span>Nov<\/span><\/div>/, 'Jun bis Nov: Plan 12.06.–29.10., Achse bis heute + 4 Wochen')
    assert.match(h, /<th>Phase<\/th><th>Wochen<\/th><th>Beginn<\/th><th>Ende<\/th><th>Defizit \/ Überschuss<\/th><th>Cardio<\/th><th>Status<\/th>/)
    assert.match(h, /data-defizit="true">\+10 %<\/td><td class="ge-num" data-cardio="true">–<\/td><td>● läuft</)
  })
  it('Wochenanpassung: Trend Δ, Soll Δ, Logtage aus der Kette — Anpassung „kommt (G-627)"', () => {
    const h = seite({ ausblick: AUSBLICK })
    assert.equal((h.match(/data-anpassung-woche=/g) ?? []).length, 2)
    assert.match(h, /data-anpassung-woche="2026-10-12"><td>KW 42<\/td><td class="ge-num">\+0,03<\/td><td class="ge-num">\+0,16<\/td><td class="ge-num">5\/7<\/td>[\s\S]*?kommt \(G-627\)/)
    assert.ok(!/data-anpassung-kommt/.test(h), 'mit Kette steht trotzdem „kommt (G-650)"')
    assert.match(seite({ ausblick: null }), /data-anpassung-kommt="true"/)
  })
  it('Neuer Plan: Ausgangspunkte aus goal_plan_templates, eigene, Vom Coach gesperrt', () => {
    // Der Dialog oeffnet per Klick — hier die Bausteine, die er rendert
    const q = lies('app/v2/goals/plan-seite.tsx')
    assert.match(q, /vorlagen\.filter\(x => x\.quelle === 'lumeos'\)\.map\(x => knopf\(/)
    assert.match(q, /knopf\(\{ code: '__eigen', n: 'Eigene Vorlage', i: 'noch keine gespeichert', aus: true \}\)/)
    assert.match(q, /knopf\(\{ code: '__coach', n: 'Vom Coach', i: 'kommt mit dem Coach-Modul', aus: true \}\)/)
    assert.match(q, /planAnlegenAusAktion\(steuer\.goal_id, name\.trim\(\), v\.code, v\.anker_art === 'A' \? anker\.A : anker\.start\)/)
  })
  it('Weitere Pläne: Entwurf mit A-Termin, Aktivieren, Löschen nur am Entwurf', () => {
    const h = seite()
    assert.match(h, /data-plan-kachel="entwurf"[\s\S]*?Contest Prep 2027[\s\S]*?A 04\.02\.27 · Start 15\.10\.26 · 16 Wochen/)
    assert.match(h, /data-plan-aktivieren="pe"/)
    assert.match(h, /data-plan-loeschen="pe"/)
  })
  it('Abgeschlossene: ✓ erreicht, Als Vorlage nur mit Tabelle', () => {
    assert.match(seite(), /Abgeschlossene Pläne · 1[\s\S]*?✓ erreicht[\s\S]*?Frühjahrs-Cut[\s\S]*?data-plan-als-vorlage="pf"/)
    assert.ok(!/data-plan-als-vorlage="pf"/.test(seite({ vorlagen: null })))
  })
  it('Vorlagen: LumeOS, Eigene, Vom Coach — ohne Tabelle „kommt (G-644)"', () => {
    const h = seite()
    assert.match(h, /data-vorlagen="3"[\s\S]*?Contest Prep 16 Wochen[\s\S]*?16 Wochen[\s\S]*?Mini-Cut-Block[\s\S]*?Meine Off-Season[\s\S]*?kommt mit dem Coach-Modul/)
    assert.match(seite({ vorlagen: null }), /data-vorlagen="kommt"[\s\S]*?kommt \(G-644\)/)
  })
})
