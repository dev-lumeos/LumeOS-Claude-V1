/**
 * G-610 — „Ziel setzen" in zwei Ebenen im Anlegemodal des Reiters Goals
 *
 * **Tom, 2026-10-07:** *„reiter Goals mit den simplen zielen die schon
 * drin anlegbar sind, da muss es nur noch zusaetzlich in das modal zum
 * anlegen verbaut werden und danach grafisch eingebunden werden."*
 *
 * `[cmd]` **Fixture = Live-Katalog 2026-10-07** (G-614): 17 Zeilen mit
 * `auswahl_gruppe`, `min_erfahrung`, `standard`.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  empfohlenDanach, gesperrt, planStrategien, richtungen, varianten,
} from '../zielwahl'
import { planende } from '../anker'
import type { Strategie } from '../strategie-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const lies = (p: string) => readFileSync(p, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

type Z = [code: string, gruppe: string, grad: string, standard: boolean, rate: number | null, next: string[]]
const KATALOG: Z[] = [
  ['lose', 'abnehmen', 'beginner', true, -0.5, ['reverse_diet', 'maintenance', 'lean_bulk']],
  ['aggressive_cut', 'abnehmen', 'pro', false, -1.0, ['reverse_diet']],
  ['conservative_cut', 'abnehmen', 'advanced', false, -0.4, ['reverse_diet']],
  ['mini_cut', 'abnehmen', 'advanced', false, -1.0, []],
  ['moderate_cut', 'abnehmen', 'advanced', false, -0.75, ['reverse_diet', 'maintenance', 'lean_bulk']],
  ['gain', 'aufbauen', 'beginner', true, 0.3, []],
  ['aggressive_bulk', 'aufbauen', 'pro', false, 0.75, []],
  ['clean_bulk', 'aufbauen', 'advanced', false, 0.4, []],
  ['lean_bulk', 'aufbauen', 'advanced', false, 0.25, ['mini_cut', 'maintenance', 'contest_prep']],
  ['maintain', 'halten', 'beginner', true, null, []],
  ['body_recomp', 'halten', 'advanced', false, null, []],
  ['maintenance_diet_break', 'halten', 'pro', false, null, []],
  ['contest_prep', 'plan', 'pro', false, null, ['reverse_diet']],
  ['custom', 'plan', 'pro', false, null, []],
  ['expert_bb_annual', 'plan', 'pro', false, null, []],
  ['peak_week', 'plan', 'pro', false, null, []],
  ['reverse_diet', 'uebergang', 'advanced', false, null, ['maintenance', 'lean_bulk', 'fat_loss']],
]
const ALLE = KATALOG.map(([code, gruppe, grad, standard, rate, next]) => ({
  code, label: code, description: `Zweck von ${code}`, icon: '', category: '',
  tier: standard ? 'simple' : 'advanced', auswahl_gruppe: gruppe, min_erfahrung: grad, standard,
  weight_change_target_percent: rate, next_codes: next,
}) as unknown as Strategie)
const S = (c: string) => ALLE.find(x => x.code === c)!

describe('G-610 — Ebene 1: drei Richtungen aus dem Katalog', () => {
  it('Abnehmen · Halten · Aufbauen, je mit ihrem Standard', () => {
    assert.deepEqual(richtungen(ALLE).map(r => [r.gruppe, r.standard.code]),
      [['abnehmen', 'lose'], ['halten', 'maintain'], ['aufbauen', 'gain']])
  })
  it('uebergang und plan sind keine Richtung', () => {
    const g = richtungen(ALLE).map(r => r.gruppe)
    assert.ok(!g.includes('uebergang') && !g.includes('plan'))
  })
})

describe('G-610 — Ebene 2: Varianten und Gradsperre', () => {
  it('Standard zuerst, dann nach Grad', () => {
    assert.deepEqual(varianten(ALLE, 'abnehmen').map(s => s.code),
      ['lose', 'conservative_cut', 'mini_cut', 'moderate_cut', 'aggressive_cut'])
  })
  const frei = (grad: string | null) => ALLE
    .filter(s => ['abnehmen', 'halten', 'aufbauen'].includes(s.auswahl_gruppe!))
    .filter(s => !gesperrt(s, grad)).map(s => s.code).sort()
  it('beginner: nur die drei Standards', () => {
    assert.deepEqual(frei('beginner'), ['gain', 'lose', 'maintain'])
  })
  it('kein Grad im Profil zaehlt wie beginner', () => {
    assert.deepEqual(frei(null), frei('beginner'))
  })
  it('advanced: Standards und advanced, nicht pro', () => {
    assert.equal(frei('advanced').length, 9)
    assert.ok(!frei('advanced').includes('aggressive_cut'))
  })
  it('pro und elite: alle zwoelf', () => {
    assert.equal(frei('pro').length, 12)
    assert.equal(frei('elite').length, 12)
  })
})

describe('G-610 — Uebergang und Planer', () => {
  it('nach einem Abnehmziel ist Reverse Diet empfohlen — aus next_codes, nur uebergang', () => {
    assert.deepEqual(empfohlenDanach(S('lose'), ALLE).map(s => s.code), ['reverse_diet'])
    assert.deepEqual(empfohlenDanach(S('mini_cut'), ALLE), [])
    assert.deepEqual(empfohlenDanach(S('lean_bulk'), ALLE), [], 'contest_prep ist plan, kein Uebergang')
  })
  it('plan: vier Strategien fuer den Hinweis auf den Planer', () => {
    assert.deepEqual(planStrategien(ALLE).map(s => s.code).sort(),
      ['contest_prep', 'custom', 'expert_bb_annual', 'peak_week'])
  })
})

describe('G-610 — Zeitachse: nie vor dem Zielbeginn', () => {
  it('17 Wochen ab 2026-10-07 reichen ueber den 2027-01-27 hinaus — das Ende verschiebt sich', () => {
    assert.deepEqual(planende('2026-10-07', '2027-01-27', 17), { ende: '2027-02-03', verschoben: true })
  })
  it('passt der Plan ins Fenster, bleibt das Zieldatum', () => {
    assert.deepEqual(planende('2026-10-07', '2027-01-27', 16), { ende: '2027-01-27', verschoben: false })
    assert.deepEqual(planende(null, '2027-01-27', 40), { ende: '2027-01-27', verschoben: false })
  })
})

describe('G-610 — Verdrahtung', () => {
  const M = () => lies(join(GOALS, 'modale.tsx'))
  it('kein tier-Filter, keine Gradliste im Modal', () => {
    assert.ok(!/tier === 'simple'/.test(M()), 'der alte Filter aus G-554 ist zurueck')
    assert.ok(!/\['beginner'/.test(M()), 'eine eigene Gradliste im Modal')
  })
  // G-628: das Modal ist jetzt „Ziel setzen" (ziel-setzen.tsx); die Sperre
  // kommt aus der Rechnung (`lagen`, die `gesperrt` aus zielwahl.ts ruft).
  const Z = () => lies(join(GOALS, 'ziel-setzen.tsx'))
  it('Varianten sind gesperrt, aber sichtbar', () => {
    assert.match(Z(), /const zu = lage\?\.status === 'gesperrt'/)
    assert.match(Z(), /data-zielvariante=\{v\.code\} disabled=\{zu\}/)
    assert.match(lies(join(HIER, '..', 'zielrechnung.ts')), /if \(gesperrt\(v, e\.grad\)\)/)
  })
  it('das Tempo aus der Rechnung geht in die Phase', () => {
    assert.match(Z(), /zielrate_pct_kg_woche: vz === 0 \? null : tempo/)
  })
  it('der Grad kommt vom Profil ins Modal', () => {
    assert.match(lies(join(GOALS, 'ansicht.tsx')), /erfahrung=\{echt\.strategieProfil\.experience\}/)
  })
  it('die Steuerungskarte zeigt Richtung und Variante aus der Phase', () => {
    // `[cmd]` **G-618: die Zielkarte ist in der Steuerungskarte aufgegangen**
    // (`reiter-goals.tsx`). Die Regel bleibt: Variante aus
    // `goal_phases.strategie_code`, Richtung und „danach empfohlen" sichtbar.
    const q = lies(join(GOALS, 'reiter-goals.tsx'))
    // G-648: die Phase des Ziels — laufend aus `phase_am`, die Variante aus der offenen Zeile
    // (`goal_phases.strategie_code`), auch fuer ein pausiertes Ziel.
    assert.match(q, /const o = offene\.find\(x => x\.goal_id === goalId\) \?\? null/)
    assert.match(q, /strategie_code: o\?\.strategie_code \?\? null/)
    assert.match(q, /const variante = ph\?\.strategie_code \? p\.strategien\.find\(s => s\.code === ph\.strategie_code\)/)
    assert.match(q, /data-ziel-richtung/)
    // „danach empfohlen" steht seit G-645 im aktiven Plan der Phase engine — die
    // Steuerungskarte des Entwurfs (`Main.dc.html`) fuehrt es nicht.
    assert.match(lies(join(GOALS, 'plan-seite.tsx')), /data-plan-danach[^>]*>Danach empfohlen:/)
  })
  it('die Zeitachse rechnet das Ende ueber planende', () => {
    assert.match(lies(join(GOALS, 'phasen-zeitachse.tsx')), /planende\(g\.gueltig_ab, g\.target_date, stufen\.summe\)/)
  })
})
