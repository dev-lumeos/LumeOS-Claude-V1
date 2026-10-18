/**
 * G-674/2 — Entwurf Main.dc.html V57, Messziel-Details, Tabelle „Datenpunkte": die Quelle klappt eine
 * Zeile auf (Kopf, Inhalt, Link ins Modul); die Links treffen History mit Auswahl bzw. Measurements.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { einheitDetail, messungDetail, tagDe, umfangDetail, wochenZeilen } from '../datenpunkt'
import { historyAuswahl } from '../../training/auswahl'
import { Datenpunkte } from '../../../app/v2/goals/reiter-goals'
import type { Satz, Sitzung, SitzungsUebung } from '../../training/sitzungen-read'

const satz = (weight_kg: number | null, reps: number | null) => ({ weight_kg, reps, duration_seconds: null, distance_meters: null })

describe('G-674/2 — Inhalt der aufgeklappten Zeile wie im Entwurf', () => {
  it('Einheit: Kopf mit Tag, Name, Dauer; Inhalt Übung und Sätze; Link auf History mit Auswahl', () => {
    const d = einheitDetail({ id: 'e1', datum: '2026-10-05', name: 'Push/Legs', minuten: 62 },
      { name: 'Back Squat', saetze: [satz(120, 5), satz(130, 3), satz(140, 1), satz(135, 2)] })
    assert.equal(d.kopf, 'Einheit Mo 05.10. · Push/Legs · 62 min')
    assert.equal(d.inhalt, 'Back Squat · 120×5 · 130×3 · 140×1 · 135×2')
    assert.deepEqual(d.link, { text: 'Einheit in Training öffnen', href: '/v2/training?tab=history&einheit=e1&von=goals' })
    assert.equal(einheitDetail({ id: 'e2', datum: '2026-09-30', name: 'Pull', minuten: null }, { name: 'Deadlift', saetze: [satz(137.5, 5)] }).inhalt, 'Deadlift · 137,5×5')
  })
  it('Messung Navy: Hals · Bauch · Größe · Gewicht; Link auf Measurements am Tag', () => {
    const d = messungDetail({ datum: '2026-10-01', weight_kg: 84.7, body_fat_pct: 16.2, bf_method: 'navy', height_cm: 182 }, { neck_cm: 40, waist_cm: 87.5 }, true)
    assert.equal(d.kopf, 'Messung Do 01.10. · Navy-Methode')
    assert.equal(d.inhalt, 'Hals 40,0 cm · Bauch 87,5 cm · Größe 182 cm · Gewicht 84,7 kg')
    assert.deepEqual(d.link, { text: 'Messung in Measurements öffnen', href: '/v2/goals?tab=measure&am=2026-10-01' })
    // ein Gewichtsziel nennt Gewicht und Körperfett, keine Navy-Maße
    assert.equal(messungDetail({ datum: '2026-10-02', weight_kg: 84.7, body_fat_pct: 16.2, bf_method: 'navy', height_cm: 182 }, null, false).inhalt, 'Gewicht 84,7 kg · Körperfett 16,2 %')
  })
  it('Umfang: alle gemessenen Stellen des Tages', () => {
    assert.equal(umfangDetail('2026-10-02', { waist_cm: 87.5, neck_cm: 40, hip_cm: null }).inhalt, 'Hals 40,0 cm · Bauch 87,5 cm')
  })
  it('Zähl-Gewohnheit: je Woche eine Zeile „KW 40 · 4 Einheiten"', () => {
    const w = wochenZeilen([
      { tag: '2026-09-28', einheit: 'Push/Legs' }, { tag: '2026-09-29', einheit: 'Pull' },
      { tag: '2026-10-01', einheit: 'Push' }, { tag: '2026-10-03', einheit: 'Legs' }, { tag: '2026-10-05', einheit: null },
    ])
    assert.equal(w.length, 2)
    assert.equal(w[0]!.detail.kopf, 'KW 40 · 4 Einheiten')
    assert.equal(w[0]!.detail.inhalt, 'Mo Push/Legs · Di Pull · Do Push · Sa Legs')
    assert.equal(w[0]!.detail.link.href, '/v2/training?tab=history&woche=2026-09-28&von=goals')
    assert.equal(w[1]!.detail.kopf, 'KW 41 · 1 Einheit')
    assert.equal(tagDe('2026-10-05'), 'Mo 05.10.')
  })
})

describe('G-674/2 — History mit Auswahl (keine Route je Einheit)', () => {
  const s = (id: string, session_date: string, status = 'completed') => ({ id, session_date, name: id.toUpperCase(), status, duration_minutes: 50 }) as unknown as Sitzung
  const sitz = [s('a', '2026-09-29'), s('b', '2026-10-01'), s('c', '2026-10-05'), s('d', '2026-10-02', 'planned')]
  const ue = [{ id: 'u1', workout_session_id: 'a', exercise_name: 'Bench', exercise_order: 1 }] as unknown as SitzungsUebung[]
  const sa = [{ workout_exercise_id: 'u1', set_number: 2, weight_kg: 80, reps: 5 }, { workout_exercise_id: 'u1', set_number: 1, weight_kg: 60, reps: 8 }] as unknown as Satz[]
  it('einheit: genau diese, mit Übung und Sätzen in Reihenfolge', () => {
    const a = historyAuswahl(sitz, ue, sa, { einheit: 'a' })!
    assert.equal(a.einheiten.length, 1)
    assert.deepEqual(a.einheiten[0]!.uebungen, [{ name: 'Bench', saetze: ['60×8', '80×5'] }])
    assert.equal(historyAuswahl(sitz, ue, sa, { einheit: 'gibtsnicht' })!.einheiten.length, 0)
  })
  it('woche: Mo–So, nur abgeschlossene; ohne Parameter keine Auswahl', () => {
    assert.deepEqual(historyAuswahl(sitz, ue, sa, { woche: '2026-09-28' })!.einheiten.map(e => e.id), ['a', 'b'])
    assert.equal(historyAuswahl(sitz, ue, sa, {}), null)
    assert.equal(historyAuswahl(sitz, ue, sa, { woche: 'kaputt' }), null)
  })
})

describe('G-674/2 — die Tabelle: Quelle als Knopf, zugeklappt', () => {
  const router = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} }
  const zeig = (el: React.ReactElement) => renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: router as never }, el))
  const det = einheitDetail({ id: 'e1', datum: '2026-10-06', name: 'Push/Legs', minuten: 62 }, null)
  it('Punkt mit Detail: Knopf „Training Push/Legs ▾", aria-expanded=false; ohne Detail: Text', () => {
    const h = zeig(React.createElement(Datenpunkte, { g: { target_unit: 'kg' }, pkt: [
      { tag: '2026-10-05', wert: 80, quelle: 'goals.manual_goal_values' },
      { tag: '2026-10-06', wert: 140, quelle: 'training.workout_sessions', einheit: 'Push/Legs', detail: det },
    ] }))
    assert.equal((h.match(/data-punkt-quelle="/g) ?? []).length, 1)
    assert.match(h, /aria-expanded="false"[^>]*>Training Push\/Legs ▾<\/button>/)
    assert.equal((h.match(/data-punkt-quelle-text/g) ?? []).length, 1)
    assert.ok(!h.includes('data-punkt-detail'), 'zugeklappt steht keine Detailzeile da')
  })
  it('Zähl-Gewohnheit: KW-Zeilen statt Einheiten', () => {
    const h = zeig(React.createElement(Datenpunkte, { g: { target_unit: 'sessions_per_week' }, pkt: [
      { tag: '2026-09-29', wert: 1, quelle: 'training.workout_sessions', einheit: 'A' },
      { tag: '2026-09-30', wert: 1, quelle: 'training.workout_sessions', einheit: 'B' },
    ] }))
    assert.match(h, /data-details-punkte="1"/)
    assert.match(h, />KW 40<\/td><td class="ge-num">2<\/td>/)
    assert.match(h, />2 Trainings ▾<\/button>/)
  })
})
