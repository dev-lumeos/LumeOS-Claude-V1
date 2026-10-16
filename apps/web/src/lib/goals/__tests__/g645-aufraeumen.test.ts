/**
 * G-645 (App-Teil) — Punkte 2, 3, 5 aus `docs/punkte/todos/goals-g-0645-*.md`.
 *
 * `[cmd]` **Am Schirm 10.10. (dev):** Steuerungskarte „Woche 1 von 14", Phase
 * engine „Woche 1 von 15"; unter dem Planer die alten Phasen-Bauteile, teils
 * englisch; im Kopf „2 active goals".
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { phasenLauf, wocheText } from '../plan'
import { zustandAusListe } from '../zustand'
import { PlanSeite } from '../../../app/v2/goals/plan-seite'
import type { Plan } from '../plan-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const roh = (f: string) => readFileSync(join(GOALS, f), 'utf8')
/** Ohne Kommentare — `//`, `/* *\/` und `{/* *\/}`. */
const sichtbar = (f: string) => roh(f).replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')

describe('G-645/2 — „Woche x von y" aus EINER Rechnung', () => {
  it('100 Tage sind 15 Wochen (aufgerundet), nicht 14 (gerundet)', () => {
    // 2026-10-10 bis 2027-01-18 = 100 Tage: 100/7 = 14,29 — genau der Fall, an
    // dem `Math.round` (Steuerungskarte) und `Math.ceil` (Phase engine) auseinanderfielen.
    const l = phasenLauf({ gueltig_ab: '2026-10-10', projected_end_date: '2027-01-18', actual_end_date: null }, '2026-10-10')
    assert.equal(l.tageGesamt, 100)
    assert.equal(wocheText(l), 'Woche 1 von 15')
  })
  it('offenes Ende: nur die Woche; ueberzogen: kein „von"', () => {
    assert.equal(wocheText(phasenLauf({ gueltig_ab: '2026-05-19', projected_end_date: null, actual_end_date: null }, '2026-10-16')), 'Woche 22')
    assert.equal(wocheText(phasenLauf({ gueltig_ab: '2026-09-01', projected_end_date: '2026-10-01', actual_end_date: null }, '2026-10-16')),
      'Woche 7 · 15 Tage über das geplante Ende')
    assert.equal(wocheText(phasenLauf({ gueltig_ab: '2026-11-01', projected_end_date: null, actual_end_date: null }, '2026-10-16')), null)
  })
  it('Steuerungskarte und Planer rufen dieselbe Funktion — keine zweite Formel', () => {
    assert.match(sichtbar('reiter-goals.tsx'), /const woche = ph \? wocheText\(phasenLauf\(ph, p\.stichtag\), variante\?\.max_duration_weeks \?\? null\) : null/)
    assert.match(readFileSync(join(HIER, '..', 'plan-read.ts'), 'utf8'), /woche: phaseId && ende\.get\(phaseId\) \? wocheText\(phasenLauf\(ende\.get\(phaseId\)!, stichtag\)\)/)
    for (const f of ['reiter-goals.tsx', 'plan-seite.tsx', 'phase-echt.tsx'])
      assert.ok(!/7 \* 86_?400_?000|\/ 7\)/.test(sichtbar(f)), `${f} rechnet Wochen selbst`)
  })
})

const PLAN: Plan = {
  id: 'p1', goal_id: 'g1', name: 'Abbau', status: 'aktiv', ziel: null, termine: [],
  positionen: [{ id: 'a', position: 1, strategie_code: null, eigene_werte: null, richtung: 'abnehmen', phase_type: 'fat_loss',
    duration_weeks: 15, gueltig_ab: '2026-10-10', projected_end_date: '2027-01-18', goal_phase_id: 'ph1', zielrate_pct_kg_woche: -0.5,
    sub_phase_code: null, confirmed_warnings: [], zustand: 'laufend', woche: 'Woche 1 von 15' }],
}
const seite = (grad: string) => renderToStaticMarkup(React.createElement(PlanSeite, {
  plaene: [PLAN], strategien: [], grad, ziele: [], stichtag: '2026-10-10', startKg: null, onZuGoals: () => {},
  vomTermin: React.createElement('div', { 'data-probe-werkzeug': '' }),
}))

describe('G-645/3 — die alten Phasen-Bauteile sind im Planer', () => {
  it('der Planer zeigt die Woche der laufenden Phase', () => {
    assert.match(seite('pro'), /<span data-plan-woche="true">Woche 1 von 15<\/span>/)
  })
  it('unter Pro erscheint kein Einschub (Sperre)', () => {
    assert.ok(!seite('advanced').includes('data-probe-werkzeug'), 'unter Pro erscheinen die Einschuebe trotz Sperre')
  })
  it('G-649 (Tom 16.10.): die alten Bauteile unter dem aktiven Plan fallen weg', () => {
    const a = sichtbar('ansicht.tsx')
    for (const b of ['PhaseEcht', 'PhaseBeenden', 'PhaseVorschlag', 'PhasenZeitachse', 'PhasenZustand'])
      assert.ok(!new RegExp(`<${b}\\b`).test(a), `<${b}> steht wieder im Reiter`)
    assert.ok(!/werkzeuge/.test(sichtbar('plan-seite.tsx')), 'PlanSeite nimmt wieder einen Werkzeug-Einschub')
    // „vom Termin aus" bleibt als Einschub im Planer — nur solange die Vorlagen fehlen
    assert.equal((a.match(/<Planer\b/g) ?? []).length, 1)
    assert.match(a, /<PlanSeite vomTermin=\{<Planer /)
  })
  it('doppelt Gezeigtes ist weg: Kopf, Start/Ende, Strich-Werte, Zustandsanzeige', () => {
    const e = sichtbar('phase-echt.tsx')
    for (const weg of ['Phase parameters', "'Start'", "'Geplantes Ende'", 'Hoechstdauer', 'noch nicht hinterlegt', 'Woche ${'])
      assert.ok(!e.includes(weg), `phase-echt.tsx zeigt wieder „${weg}"`)
    assert.ok(!/export function PhasenZustand/.test(roh('planer.tsx')))
  })
  it('deutsch, mit Umlauten — in allem, was der Planer jetzt traegt', () => {
    const ersatz = /\b(Hoechstdauer|Koerpergewicht|[Rr]ueckwaerts|fuer|fuehrt|moeglich|laesst|Waechter|ueberfaellig|[Uu]ebernehmen|Uebernommen|Aenderung|waehlst|haette|Verhaeltnis|laenger|primaeres|naechsten|zurueckzurechnen|Zurueck)\b|Phase parameters|Phase state machine/
    for (const f of ['plan-seite.tsx', 'phase-echt.tsx', 'planer.tsx', 'phase-setzen.tsx', 'phasen-zeitachse.tsx', 'phasen-editor-echt.tsx']) {
      const m = ersatz.exec(sichtbar(f))
      assert.equal(m, null, `${f}: „${m?.[0]}" steht sichtbar ohne Umlaut / englisch`)
    }
  })
})

describe('G-645/5 — der Kopf zaehlt nach Rolle (ersetzt durch Tom 16.10.)', () => {
  it('der Kopf traegt keinen Zaehl-Chip mehr — nur die Hauptaktion des Reiters', () => {
    const a = sichtbar('ansicht.tsx')
    assert.ok(!/kopfZiele|active goals|<Pill variant="acc">/.test(a))
    assert.match(a, /goals: '\+ Ziel setzen', phase: '\+ Neuer Plan', metrics: 'Gewicht eintragen', measure: 'Messung eintragen'/)
  })
  it('die Mockup-Referenz ist unberuehrt (wartet auf Toms Abnahme)', () => {
    assert.match(roh('mockup-referenz.tsx'), /active goals|Mockup/)
  })
})
