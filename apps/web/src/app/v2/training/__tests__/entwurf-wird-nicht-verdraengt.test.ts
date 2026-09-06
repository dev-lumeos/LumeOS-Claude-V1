/**
 * G-359/2 — der Entwurf verdraengt nicht mehr (training)
 *
 * **Tom, 2026-09-07:** *,,bestehendes bleibt wie es ist, wir blenden
 * nur mockup attrappen ein als referenz."*
 *
 * `[cmd]` **Gemessen 2026-09-06: `dev@lumeos.app` hat 30 Sitzungen
 * und 1.416 Uebungen** — **also lief immer der echte Zweig, und
 * fuenf Entwuerfe waren nie zu sehen.**
 *
 * `[cmd]` **Am Schirm belegt, vorher/nachher je Reiter:**
 *
 *     history    1 Attrappe -> 5      standards  1 -> 3
 *     library    1 Attrappe -> 2      calendar   1 -> 5
 *     progress   1 Attrappe -> 5
 *
 * `[read]` **Dieselbe Probe wie in `v2/goals`** — sie prueft die
 * Bedingung VOR der Komponente, nicht die Anwesenheit des Namens:
 * `{null && <Entwurf/>}` enthaelt `<Entwurf` und kam sonst durch.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const TRAINING = join(HIER, '..')

const lies = (p: string) => readFileSync(p, 'utf8')

/** Reiter und der Entwurf, der darunter stehen muss. */
const PAARE = [
  ['history', 'TrainingHistory'],
  ['library', 'TrainingLibrary'],
  ['progress', 'TrainingProgressionView'],
  ['standards', 'TrainingStandardsView'],
  ['calendar', 'TrainingCalendarView'],
] as const

describe('G-359/2 — der Entwurf bleibt sichtbar (training)', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(lies(join(TRAINING, 'ansicht.tsx')).length > 1000,
      'training/ansicht.tsx nicht gefunden — der Pfad stimmt nicht')
  })

  for (const [, entwurf] of PAARE) {
    it(`${entwurf} steht in keinem Sonst-Zweig`, () => {
      const t = lies(join(TRAINING, 'ansicht.tsx'))
      assert.ok(!new RegExp(`:\\s*<${entwurf}\\b`).test(t),
        `${entwurf} steht im Sonst-Zweig eines Ternaers — `
        + 'ein Entwurf darf nicht verdraengt werden (E-68)')
    })
  }

  for (const [reiter, entwurf] of PAARE) {
    it(`Reiter \`${reiter}\` rendert ${entwurf} unbedingt`, () => {
      const t = lies(join(TRAINING, 'ansicht.tsx'))
      const i = t.indexOf(`tab === '${reiter}'`)
      assert.ok(i > 0, `der Zweig fuer \`${reiter}\` fehlt`)
      const block = t.slice(i, i + 900)
      assert.ok(block.includes(`<${entwurf}`),
        `${entwurf} wird im Reiter \`${reiter}\` nicht gerendert`)

      // `[read]` **Die Bedingung DAVOR, nicht der Name** — sonst
      // kommt `{null && <Entwurf/>}` durch (in goals gemessen).
      const vorn = block.slice(0, block.indexOf(`<${entwurf}`))
      const lk = vorn.lastIndexOf('{')
      const wache = lk >= 0 ? vorn.slice(lk).trim() : ''
      assert.ok(
        !/[{(\s](null|false|0|undefined)\s*&&\s*$/.test(wache)
        && !/\?\s*$/.test(wache),
        `${entwurf} steht hinter einer abschaltenden Bedingung: `
        + `\`${wache.slice(0, 40)}\``,
      )
    })
  }

  it('der echte Teil ist unangetastet — alle fuenf stehen noch', () => {
    // `[read]` **Toms Vorgabe: bestehendes bleibt wie es ist.**
    //
    // `[cmd]` **Die Sabotageprobe fand die Luecke:** ein blosser
    // Namenstest liess `{false && <TrainingStandards …/>}` durch —
    // **der echte Teil waere weg gewesen und der Waechter gruen.**
    // `[read]` **Also auch hier die Bedingung DAVOR pruefen.**
    const t = lies(join(TRAINING, 'ansicht.tsx'))
    for (const echt of ['TrainingVerlauf', 'TrainingUebungen',
      'TrainingKraftverlauf', 'TrainingStandards', 'TrainingKalender']) {
      const i = t.indexOf(`<${echt}`)
      assert.ok(i > 0, `${echt} fehlt — der echte Teil wurde angetastet`)
      const vorn = t.slice(0, i)
      const lk = vorn.lastIndexOf('{')
      const wache = lk >= 0 ? vorn.slice(lk).trim() : ''
      assert.ok(
        !/[{(\s](null|false|0|undefined)\s*&&\s*$/.test(wache),
        `${echt} steht hinter einer abschaltenden Bedingung `
        + `— bestehendes Verhalten wurde geaendert: \`${wache.slice(0, 40)}\``,
      )
    }
  })
})
