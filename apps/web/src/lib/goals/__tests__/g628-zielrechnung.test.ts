/**
 * G-628 — „Ziel setzen", Weg A: drei Groessen, eine Rechnung
 *
 * `[cmd]` **Regeln: Dossier Kap. 8.2** (`docs/spezifikation/goals-ziel-setzen/`).
 * Fixture = Live-Katalog 2026-10-08, Richtung Abnehmen / Halten.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  datumNach, letzteGewichtsmessung, rechneZiel, tageskcal, wochenBis, type Zieleingabe,
} from '../zielrechnung'
import type { Strategie } from '../strategie-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const lies = (p: string) => readFileSync(p, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

const v = (code: string, grad: string, std: boolean, rate: number | null, max: number | null, p: number) => ({
  code, label: code, min_erfahrung: grad, standard: std, weight_change_target_percent: rate,
  max_duration_weeks: max, protein_per_kg: p, auswahl_gruppe: 'x', next_codes: [],
}) as unknown as Strategie
const AB = [
  v('lose', 'beginner', true, -0.5, null, 2.2),
  v('conservative_cut', 'advanced', false, -0.4, null, 2.0),
  v('mini_cut', 'advanced', false, -1.0, 4, 2.5),
  v('moderate_cut', 'advanced', false, -0.75, 20, 2.2),
  v('aggressive_cut', 'pro', false, -1.0, 8, 2.5),
]
const HALTEN = [v('maintain', 'beginner', true, null, null, 2.0), v('body_recomp', 'advanced', false, null, null, 2.2)]
const E = (p: Partial<Zieleingabe>): Zieleingabe => ({
  varianten: AB, startKg: 100, heute: '2026-10-08', fest: [], ziel: null, datum: null,
  programm: null, grad: 'pro', tdee: 2800, ...p,
})

describe('G-628 — nur eine Groesse festgelegt', () => {
  it('Zielgewicht: Standard rechnet das Datum', () => {
    const r = rechneZiel(E({ fest: ['ziel'], ziel: 95 }))   // 5 kg / 0,5 kg/Wo = 10 Wo
    assert.equal(r.programm?.code, 'lose')
    assert.equal(r.wochen, 10)
    assert.equal(r.datum, '2026-12-17')
    assert.deepEqual([r.quelle.ziel, r.quelle.datum, r.quelle.programm], ['festgelegt', 'berechnet', 'berechnet'])
  })
  it('Zieldatum: Standard rechnet das erreichbare Ziel', () => {
    const r = rechneZiel(E({ fest: ['datum'], datum: '2026-12-17' }))
    assert.equal(r.ziel, 95)
  })
  it('Programm mit Maximaldauer: Datum und Ziel aus der Dauer', () => {
    const r = rechneZiel(E({ fest: ['programm'], programm: 'mini_cut' }))  // 4 Wo × 1 kg
    assert.equal(r.wochen, 4)
    assert.equal(r.ziel, 96)
  })
  it('Programm ohne Maximaldauer: fragt nach Ziel oder Datum', () => {
    assert.match(rechneZiel(E({ fest: ['programm'], programm: 'lose' })).fehler ?? '', /fehlt noch ein Zielgewicht oder ein Zieldatum/)
  })
})

describe('G-628 — Ziel + Datum: noetiges Tempo, mildestes freies Programm', () => {
  it('7,5 kg in 10 Wochen = 0,75 %/Wo → Moderate Cut, das Tempo ist das noetige', () => {
    const r = rechneZiel(E({ fest: ['ziel', 'datum'], ziel: 92.5, datum: '2026-12-17' }))
    assert.equal(r.programm?.code, 'moderate_cut')
    assert.equal(r.noetigPct, 0.75)
    assert.equal(r.tempoPct, -0.75)
    assert.equal(r.kgProWoche, -0.75)
  })
  it('0,45 %/Wo noetig → Abnehmen (0,5) ist das mildeste, das es schafft', () => {
    const r = rechneZiel(E({ fest: ['ziel', 'datum'], ziel: 95.5, datum: '2026-12-17' }))
    assert.equal(r.programm?.code, 'lose')
    assert.ok(Math.abs(r.tempoPct! + 0.45) < 1e-9)
  })
  it('beginner: Moderate Cut ist gesperrt → „Dafür braucht es …"', () => {
    const r = rechneZiel(E({ fest: ['ziel', 'datum'], ziel: 92.5, datum: '2026-12-17', grad: 'beginner' }))
    assert.equal(r.programm, null)
    assert.match(r.fehler ?? '', /Dafür braucht es moderate_cut \(ab advanced\)/)
  })
  it('kein Programm schafft es → Satz und Planer', () => {
    const r = rechneZiel(E({ fest: ['ziel', 'datum'], ziel: 80, datum: '2026-12-17' }))
    assert.match(r.fehler ?? '', /Kein Programm schafft das bis zu diesem Datum/)
    assert.equal(r.planer, true)
  })
  it('die Liste nennt je Programm den Grund', () => {
    const r = rechneZiel(E({ fest: ['ziel', 'datum'], ziel: 92.5, datum: '2026-12-17', grad: 'advanced' }))
    const l = Object.fromEntries(r.lagen.map(x => [x.code, x.status]))
    assert.deepEqual(l, { lose: 'zu langsam', conservative_cut: 'zu langsam', mini_cut: 'zu lange',
      moderate_cut: 'gewaehlt', aggressive_cut: 'gesperrt' })
  })
})

describe('G-628 — Programm + eine Groesse', () => {
  it('Programm + Ziel ueber der Maximaldauer → Hinweis und Planer', () => {
    const r = rechneZiel(E({ fest: ['programm', 'ziel'], programm: 'mini_cut', ziel: 90 }))  // 10 Wo > 4
    assert.equal(r.planer, true)
    assert.match(r.hinweis ?? '', /auf 4 Wochen ausgelegt/)
  })
  it('Programm + Datum → Zielgewicht', () => {
    assert.equal(rechneZiel(E({ fest: ['programm', 'datum'], programm: 'conservative_cut', datum: '2026-12-17' })).ziel, 96)
  })
})

describe('G-628 — Grenzfaelle', () => {
  it('Zielgewicht in der falschen Richtung ist ein Logikfehler', () => {
    assert.match(rechneZiel(E({ fest: ['ziel'], ziel: 105 })).fehler ?? '', /falschen Richtung/)
  })
  it('Halten: kein Ziel, kein Tempo, Wohlfuehlbereich ±1 kg, kcal = TDEE', () => {
    const r = rechneZiel(E({ varianten: HALTEN }))
    assert.equal(r.ziel, null)
    assert.equal(r.tempoPct, 0)
    assert.deepEqual(r.halten, { von: 99, bis: 101 })
    assert.equal(r.kcal, 2800)
    assert.equal(r.proteinG, 200)
  })
  it('kcal: TDEE plus E-1-Differenz, auf 10 gerundet; ohne TDEE keine Zahl', () => {
    assert.equal(tageskcal(2800, -0.5, 100), 2250)   // 11 × −0,5 × 100 = −550
    assert.equal(tageskcal(null, -0.5, 100), null)
  })
  it('Protein aus dem Katalog, nie gekuerzt', () => {
    assert.equal(rechneZiel(E({ fest: ['ziel'], ziel: 95 })).proteinG, 220)
  })
  it('Wochen und Datum sind Kehrwerte', () => {
    assert.equal(wochenBis('2026-10-08', datumNach('2026-10-08', 12)), 12)
  })
})

describe('G-628 — der Start ist gemessen (A1)', () => {
  const m = (d: string, kg: number | null) => ({ measurement_date: d, weight_kg: kg })
  it('die juengste Messung der letzten 14 Tage', () => {
    assert.deepEqual(letzteGewichtsmessung([m('2026-09-30', 84), m('2026-10-05', 83.5)], '2026-10-08'), m('2026-10-05', 83.5))
  })
  it('aelter als 14 Tage, ohne Gewicht oder in der Zukunft: keine', () => {
    assert.equal(letzteGewichtsmessung([m('2026-09-23', 84)], '2026-10-08'), null)
    assert.deepEqual(letzteGewichtsmessung([m('2026-09-24', 84)], '2026-10-08'), m('2026-09-24', 84))
    assert.equal(letzteGewichtsmessung([m('2026-10-07', null)], '2026-10-08'), null)
    assert.equal(letzteGewichtsmessung([m('2026-10-09', 84)], '2026-10-08'), null)
  })
})

describe('G-628 — Verdrahtung', () => {
  const Z = () => lies(join(GOALS, 'ziel-setzen.tsx'))
  it('„New goal" oeffnet „Ziel setzen", „+ Messziel" springt zu B1', () => {
    const a = lies(join(GOALS, 'ansicht.tsx'))
    assert.match(a, /kontext\.open\(\{ typ: 'newGoal', start: 'B1' \}\)/)
    assert.match(lies(join(GOALS, 'modale.tsx')), /<ZielSetzen onClose=\{onClose\}/)
    assert.match(Z(), /React\.useState<Schritt>\(start \?\? 's0'\)/)
  })
  it('A1 fragt nach „Gewicht heute", wenn keine Messung der letzten 14 Tage da ist', () => {
    assert.match(Z(), /letzteGewichtsmessung\(messungen, heute\)/)
    assert.match(Z(), /data-zielfeld="gewicht-heute"/)
    assert.match(Z(), /messungAnlegenAktion\(\{/)
    assert.match(Z(), /disabled=\{!gruppe \|\| startKg === null\}/)
  })
  it('laeuft eine Steuerung, ist die Wahl pausieren/beenden Pflicht', () => {
    assert.match(Z(), /disabled=\{laeuft \|\| \(!!steuerung && !wahl\)\}/)
    assert.match(Z(), /status: wahl === 'pausieren' \? 'on_hold' : 'abandoned'/)
  })
  it('die Fertig-Meldung nennt das ALTE Ziel, festgehalten beim Start', () => {
    assert.match(Z(), /setFertigSatz\(steuerung/)
    assert.ok(!/Ziel gestartet\. \{steuerung/.test(Z()), 'die Meldung liest steuerung nach dem Neuladen')
  })
  it('scheitert das Anlegen, wird die Steuerung zurueckgesetzt', () => {
    assert.match(Z(), /if \(steuerung\) await zielSpeichern\(steuerung\.goal_id, \{ status: 'active' \}\)/)
  })
})
