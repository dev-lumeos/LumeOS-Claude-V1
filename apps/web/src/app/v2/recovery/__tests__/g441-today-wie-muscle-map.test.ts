/**
 * G-441 — die Today-Kachel liest dieselbe Quelle wie Muscle map
 *
 * `[cmd]` **Gemessen 2026-10-06 auf test-user@lumeos.local, vor dem
 * Umbau:** 29 von 43 Kartenflaechen auf Today anders gefaerbt als auf
 * Muscle map — Today rechnete aus `MUSCLE_STATE`, Muscle map seit G-440
 * aus `workout_sets`. Nachher: 0.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { muskelwerte, muskelzeilen } from '../muskelwerte'
import { MUSCLE_GROUPS_BODYMAP } from '../motor'

const HIER = dirname(fileURLToPath(import.meta.url))
const lies = (f: string) => readFileSync(join(HIER, '..', f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

// Drei Knoten: Chest wurde trainiert, Biceps nie (aber im Katalog),
// Triceps gibt es im Baum, aber keine Uebung trifft ihn.
const BAUM = { fehler: null, knoten: [
  { id: 'm-chest', name: 'Chest', parent_id: null },
  { id: 'm-biceps', name: 'Biceps', parent_id: null },
  { id: 'm-triceps', name: 'Triceps', parent_id: null },
] }
const ZUSTAND = {
  zustaende: { 'm-chest': { hours: 12, sets: 12, lastSession: 'Push', datum: '2026-10-05' } },
  imKatalog: ['m-chest', 'm-biceps'],
  deckung: { gemessen: 1, gesamt: 3, rollenUngewichtet: false },
} as unknown as Parameters<typeof muskelzeilen>[0]['muskelzustand']

const eingabe = { kater: null, schlafguete: null, muskelbaum: BAUM, muskelzustand: ZUSTAND }

describe('G-441 — die Rechnung aus G-440, einmal', () => {
  it('trainiert < nie belastet, nicht im Katalog = grau', () => {
    const w = muskelwerte(eingabe)
    // `[read]` **Nie belastet ist nicht glatt 100** — Schlaf und
    // Ernaehrung kommen aus dem Entwurf und druecken jeden Wert.
    assert.ok(w.biceps !== null, 'nie belastet ist grau statt erholt (G-445)')
    assert.ok(w.chest !== null && w.chest! < w.biceps!, `chest ${w.chest} < biceps ${w.biceps}`)
    assert.equal(w.triceps, null, 'nicht im Katalog bleibt grau')
  })

  it('jedes Kuerzel der Karte bekommt eine Zeile', () => {
    assert.deepEqual(Object.keys(muskelwerte(eingabe)).sort(), [...MUSCLE_GROUPS_BODYMAP].sort())
  })

  it('der Muskelkater aus dem Check-in senkt den Wert', () => {
    const ohne = muskelwerte(eingabe).chest!
    const mit = muskelwerte({ ...eingabe, kater: { chest: 3 } }).chest!
    assert.ok(mit < ohne, `${mit} < ${ohne}`)
  })

  it('muskelwerte ist muskelzeilen als Abbildung — keine zweite Rechnung', () => {
    assert.deepEqual(muskelwerte(eingabe),
      Object.fromEntries(muskelzeilen(eingabe).map(r => [r.slug, r.value])))
  })
})

describe('G-441 — beide Kacheln rufen sie', () => {
  it('Today ruft muskelwerte() und liest MUSCLE_STATE nicht mehr', () => {
    const a = lies('ansicht.tsx')
    const i = a.indexOf('function RecToday(')
    const rumpf = a.slice(i, a.indexOf('\nfunction ', i + 1))
    assert.match(rumpf, /muskelwerte\(\{\s*kater, schlafguete, muskelbaum, muskelzustand,?\s*\}\)/)
    assert.ok(!/MUSCLE_STATE/.test(rumpf), 'Today rechnet wieder aus der Attrappe')
    assert.match(rumpf, /datenEtikett\(muskelzustand\?\.deckung/, 'die Kopfzeile ist nicht die der Muscle map')
    assert.ok(!/18 (groups|Gruppen)/.test(rumpf), 'die Kopfzeile zaehlt wieder Kuerzel')
  })

  it('Today bekommt dieselben Eingaben wie Muscle map', () => {
    assert.match(lies('ansicht.tsx'),
      /<RecToday [^>]*muskelbaum=\{muskelbaum\} muskelzustand=\{muskelzustand\}/)
  })

  it('Muscle map ruft muskelzeilen()', () => {
    assert.match(lies('tab-messwerte.tsx'), /const rows = React\.useMemo\(\(\) => muskelzeilen\(\{/)
  })

  it('die tote muskelwerte() in ansicht.tsx ist weg', () => {
    assert.ok(!/export function muskelwerte/.test(lies('ansicht.tsx')))
  })
})
