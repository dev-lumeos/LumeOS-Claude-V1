/**
 * G-678 — Kraftkurve, Sollinie und „Als nächstes" an den Lesern der Kette (07f91713), Entwurf V57.
 *
 * Kraftkurve: je Zeile aus `goals.measurement_points` ein Punkt (eine Einheit), nichts zusammengefasst.
 * Sollinie:   die eine graue Planlinie ist der Sollweg seit Zielbeginn (`planlinien_am.historisch_kg`, Nachtrag 19.10.);
 *             `vorwaerts_kg` ist keine Planlinie. Das Wochensoll kommt aus der Kette, nicht aus der Linie.
 * Als nächstes (PhaseEngine.dc.html `naechstes`): Leser → Empfehlung; sonst „Nächste Stufe laut Plan"; sonst G-677.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { punkteAusKette, sollwegKg } from '../datenpunkt'
import { SteuerDetails } from '../../../app/v2/goals/reiter-goals'
import { PlanSeite } from '../../../app/v2/goals/plan-seite'
import type { Plan } from '../plan-read'
import type { Ausblick } from '../reiter-read'
import type { Strategie } from '../strategie-read'
import type { ZielFortschritt } from '../lesen'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const lies = (p: string) => readFileSync(join(SRC, p), 'utf8')
const ROUTER = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} }
const zeig = (el: React.ReactElement) => renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: ROUTER as never }, el))

describe('G-678/1 — Kraftkurve: ein Punkt je Einheit', () => {
  const zeile = (id: string, tag: string, wert: number) => ({ measured_on: tag, value: wert, source_name: 'training.workout_sessions', source_id: id })
  it('zwei Einheiten am selben Tag sind zwei Punkte; sortiert nach Tag', () => {
    const p = punkteAusKette([zeile('s3', '2026-10-07', 141), zeile('s1', '2026-10-05', 140), zeile('s2', '2026-10-05', 142)])
    assert.deepEqual(p.map(x => [x.tag, x.id, x.wert]), [['2026-10-05', 's1', 140], ['2026-10-05', 's2', 142], ['2026-10-07', 's3', 141]])
  })
  it('der Leseweg nimmt die Zeilen 1:1, die Kurve zeichnet jeden Punkt', () => {
    assert.match(lies('lib/goals/reiter-read.ts'), /const punkte = punkteAusKette\(zeilen\)/)
    assert.match(lies('app/v2/goals/reiter-goals.tsx'), /<polyline points=\{pkt\.map\(p => `\$\{x\(p\.tag\)\},\$\{y\(p\.wert\)\}`\)\.join\(' '\)\}/)
  })
})

describe('G-678/2 — Sollinie: der Sollweg seit Zielbeginn (historisch_kg)', () => {
  it('aus der Antwort von planlinien_am wird historisch_kg gelesen, nicht vorwaerts_kg', () => {
    assert.equal(sollwegKg({ tag: '2026-10-19', historisch_kg: 86.801, vorwaerts_kg: 84.762 }), 86.801)
    assert.equal(sollwegKg({ historisch_kg: null, vorwaerts_kg: 84.762 }), null)
    assert.match(lies('lib/goals/reiter-read.ts'), /return \{ tag, kg: sollwegKg\(r\.data as Record<string, unknown> \| null\) \}/)
  })
  const z = { goal_id: 'g1', start_value: 85, target_value: 88, target_date: '2027-01-17', gueltig_ab: '2026-05-21' } as unknown as ZielFortschritt
  const ausblick = {
    wochen: [
      { woche_ab: '2026-10-05', woche_bis: '2026-10-11', vollstaendig: true, trend_kg: 84.78, soll_kg: 86.6, trend_delta_kg: 0.1, soll_delta_kg: 0.212, durchschnitt_kcal: 2400, logtage: 7, anpassung_kcal: null },
      { woche_ab: '2026-10-12', woche_bis: '2026-10-18', vollstaendig: true, trend_kg: 84.76, soll_kg: 86.8, trend_delta_kg: -0.02, soll_delta_kg: 0.212, durchschnitt_kcal: 2300, logtage: 6, anpassung_kcal: null },
    ],
    kennzahlen: { start_kg: 85, ziel_kg: 88, trend_kg: 84.762, veraenderung_gesamt_kg: -0.238, tempo_4w_kg_pro_woche: 0.028, soll_kg_pro_woche: 0.212, verbleibend_kg: 3.238, fortschritt_pct: 0 },
    prognose: { plan_datum: null, status: 'datum', datum: '2029-01-21', grund: null },
  } as unknown as Ausblick
  const messungen = [{ measurement_date: '2026-10-10', weight_kg: 84.9 }, { measurement_date: '2026-10-18', weight_kg: 84.7 }] as never
  const bild = (planHistorisch: Array<{ tag: string; kg: number }>) => zeig(React.createElement(SteuerDetails, {
    z, ausblick, trend: 84.762, messungen, meilensteine: [], planHistorisch, stichtag: '2026-10-19', onPhaseEngine: () => {},
  }))
  const planlinien = (h: string) => Array.from(h.matchAll(/<polyline points="([^"]*)"[^>]*stroke-dasharray="5 4"[^>]*>/g)).map(m => m[1]!.split(' '))
  // dev 19.10. (gemessen): 86,492 Plateau, heute 86,801, ab 03.12. 88,000 — im 3-Monats-Fenster ab 20.07.
  const H = [{ tag: '2026-07-30', kg: 86.492 }, { tag: '2026-10-19', kg: 86.801 }, { tag: '2026-12-03', kg: 88 }, { tag: '2027-01-17', kg: 88 }]
  it('genau eine graue Planlinie, ein Punkt je Sollweg-Wert', () => {
    const l = planlinien(bild(H))
    assert.equal(l.length, 1)
    assert.equal(l[0]!.length, 4)
  })
  it('die Linie folgt dem Sollweg: ein anderer Wert verschiebt genau diesen Punkt', () => {
    const a = planlinien(bild(H))[0]!, b = planlinien(bild(H.map((v, i) => (i === 1 ? { ...v, kg: 87.2 } : v))))[0]!
    assert.deepEqual(a.map((p, i) => p === b[i]), [true, false, true, true])
  })
  it('der Abstand zum Trend bleibt sichtbar: die Linie liegt heute ueber dem Trend (86,8 gegen 84,8)', () => {
    const h = bild(H)
    const heute = Number(planlinien(h)[0]![1]!.split(',')[1])
    const trend = /<polyline points="([^"]*)"[^>]*data-trend-linie/.exec(h)![1]!.split(' ').at(-1)!.split(',').map(Number)[1]!
    assert.ok(heute < trend - 20, `Planlinie y=${heute}, Trend y=${trend}`)
  })
  it('das Wochensoll kommt aus der Kette, nicht aus der Linie: ohne Sollweg steht es trotzdem', () => {
    assert.match(bild([]), /data-kennzahl="soll"><div class="ge-eb">Soll<\/div><div class="ge-num"[^>]*>\+0,21 kg\/Wo/)
    assert.equal(planlinien(bild([])).length, 0)
  })
})

describe('G-678/3 — „Als nächstes"', () => {
  const ST = { code: 'lean_bulk', label: 'Lean Bulk', category: 'lean_bulk', auswahl_gruppe: 'aufbauen', tdee_modifier: 0.1, cardio_pro_woche: null,
    weight_change_target_percent: 0.25, protein_per_kg: 2, fat_percent: 0.25, fett_g_kg: null, refeed_pro_woche: null, max_duration_weeks: 52,
    refeeds: null, sub_phases: [], next_codes: ['mini_cut', 'maintenance'] } as unknown as Strategie
  const POS = (id: string, o: Partial<Plan['positionen'][number]>): Plan['positionen'][number] => ({
    id, position: 1, strategie_code: 'lean_bulk', eigene_werte: null, richtung: 'aufbauen', phase_type: 'lean_bulk', duration_weeks: 20,
    gueltig_ab: '2026-06-12', projected_end_date: '2026-10-29', goal_phase_id: 'ph', zielrate_pct_kg_woche: 0.25, sub_phase_code: null,
    confirmed_warnings: [], zustand: 'laufend', woche: 'Woche 18 von 20', ...o,
  })
  const plan = (positionen: Plan['positionen']): Plan => ({ id: 'pa', goal_id: 'g1', name: 'Lean Bulk auf 88 kg', status: 'aktiv', ziel: null, termine: [], positionen })
  const seite = (p: Plan, alsNaechstes: { startdatum: string; programm: string; dauer_wochen: number; grund: string } | null = null) => zeig(React.createElement(PlanSeite, {
    plaene: [p], vorlagen: null, ausblick: null, alsNaechstes, strategien: [ST], grad: 'pro', ziele: [], stichtag: '2026-10-19', startKg: 84.8, onZuGoals: () => {},
  }))
  const block = (h: string) => /<div data-als-naechstes="true"[^>]*>([\s\S]*?)<\/div>/.exec(h)?.[1] ?? null
  const ohneFolge = plan([POS('a1', {})])
  it('Leser liefert: Datum, Programm, Dauer, Grund wie im Entwurf — auch wenn der Plan eine Folgephase hat', () => {
    const n = { startdatum: '2026-10-30', programm: 'lean_bulk', dauer_wochen: 4, grund: 'Körperfett steigt' }
    const b = block(seite(plan([POS('a1', {}), POS('n', { zustand: 'geplant', gueltig_ab: '2026-10-30' })]), n))
    assert.equal(b, '<span data-plan-empfohlen="true">Empfohlen ab 30.10.26: <b>Lean Bulk</b> 4 Wochen. Grund: Körperfett steigt. Übernehmen = Phase im Plan ergänzen (✎).</span>')
  })
  it('ohne Leser mit Folgephase: „Nächste Stufe laut Plan: …"', () => {
    const b = block(seite(plan([POS('a1', {}), POS('n', { zustand: 'geplant', gueltig_ab: '2026-10-30' })])))
    assert.equal(b, '<span data-plan-naechste="true">Nächste Stufe laut Plan: <b>Lean Bulk</b>.</span>')
  })
  it('ohne Leser, ohne Folgephase (G-677): der Satz mit Stift — nie leer', () => {
    const b = block(seite(ohneFolge))
    assert.ok(b, 'der Leerfall zeigt keinen Text')
    assert.match(b!, /^<span data-plan-ohne-folge="true">Nach Planende ohne Folgephase: Erhaltung\. Phase ergänzen \(<button type="button" data-als-naechstes-bearbeiten="true" aria-label="Plan bearbeiten"[^>]*>✎<\/button>\)<\/span>$/)
  })
  it('keine erfundene Empfehlung: ohne Leser weder „Empfohlen" noch ein Programm aus next_codes', () => {
    const h = seite(ohneFolge)
    assert.ok(!/Empfohlen|Grund:|Mini Cut|mini_cut|Danach empfohlen/.test(block(h)!), 'ohne Leser steht eine Empfehlung da')
  })
  it('der Stift öffnet das Bearbeiten dieses Plans', () => {
    assert.match(lies('app/v2/goals/plan-seite.tsx'), /data-als-naechstes-bearbeiten aria-label="Plan bearbeiten" onClick=\{\(\) => setBearbeitet\(aktiv\.id\)\}/)
  })
})
