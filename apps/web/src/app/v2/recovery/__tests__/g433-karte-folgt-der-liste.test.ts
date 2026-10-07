/**
 * G-433 — Per-muscle detail und Karte zeigen dieselben Muskeln mit
 * denselben Werten
 *
 * `[cmd]` **Gemessen 2026-10-07 auf test-user, vorher:** an 2 von 31
 * benannten Flaechen (`deltoids`, `tibialis`) stand in der Liste 97 %,
 * die Karte war grau. Die Liste faerbte mit eigenen Schwellen (80/50),
 * die Karte mit 75/40 — auf test-user ohne sichtbare Folge (alle 97 %),
 * aber ein Wert von 76–79 haette zwei Farben gehabt. **Tom, 2026-10-07:
 * die Karte folgt der Liste.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { kartendaten, knotenwert, muskelzeilen } from '../muskelwerte'
import { EBENEN } from '../../../../lib/koerper/ebenen'
import { SCHLUESSEL_ZU_GRUPPE } from '../../../../lib/koerper/schluessel-gruppe'

const HIER = dirname(fileURLToPath(import.meta.url))
const lies = (f: string) => readFileSync(join(HIER, '..', f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

// Jeder Name, den die Karte oder ein Kuerzel kennt, als Wurzel im Baum;
// alle im Katalog, nur `Chest` trainiert.
const namen = Array.from(new Set([
  ...Object.values(EBENEN).map(e => e.name).filter((n): n is string => !!n),
  ...Object.values(SCHLUESSEL_ZU_GRUPPE).filter((n): n is string => !!n),
].map(n => n.toLowerCase())))
const knoten = namen.map((n, i) => ({ id: `m${i}`, name: n, parent_id: null }))
const idVon = (n: string) => knoten.find(k => k.name === n.toLowerCase())!.id
const eingabe = {
  kater: null, schlafguete: null,
  muskelbaum: { fehler: null, knoten },
  muskelzustand: {
    zustaende: { [idVon('Chest')]: { hours: 10, sets: 14, lastSession: 'Push', datum: '2026-10-06' } },
    imKatalog: knoten.map(k => k.id),
    deckung: { gemessen: 1, gesamt: knoten.length, rollenUngewichtet: false },
  } as unknown as Parameters<typeof muskelzeilen>[0]['muskelzustand'],
}
const zahl = (w: ReturnType<ReturnType<typeof knotenwert>>) =>
  typeof w === 'number' ? w : w?.wert ?? null

describe('G-433 — die Karte zeigt, was die Liste zeigt', () => {
  const karte = Object.fromEntries(kartendaten(eingabe).map(d => [d.id, 100 - d.fatigue]))
  const wertVon = knotenwert(eingabe)

  it('jede benannte Flaeche traegt den Wert ihres Muskels aus der Liste', () => {
    let geprueft = 0
    for (const [code, e] of Object.entries(EBENEN)) {
      if (!e.name) continue
      assert.equal(karte[code] ?? null, zahl(wertVon({ name: e.name, flaeche: code })), code)
      geprueft++
    }
    assert.equal(geprueft, 31, 'die Zahl der benannten Flaechen hat sich geaendert')
  })

  it('die zwei gemessenen Faelle: deltoids und tibialis sind gefaerbt', () => {
    assert.equal(typeof karte.deltoids, 'number')
    assert.equal(typeof karte.tibialis, 'number')
  })

  it('der trainierte Muskel ist schwaecher als die unbelasteten', () => {
    assert.ok(karte.chest! < karte.tibialis!, `${karte.chest} < ${karte.tibialis}`)
  })

  it('ein Kind ohne eigene Saetze leiht vom Elternteil — und sagt es (G-438/G-446)', () => {
    // `[cmd]` **Die Textprobe in g438-geliehen.test.ts sucht
    // `vonGruppe:\s*\w`** — und trifft seit G-433 auch die Typzeile
    // `vonGruppe: string`. Sabotage 2026-10-07: die Herkunft entfernt,
    // jene Probe blieb gruen. **Deshalb hier gerufen, nicht gesucht.**
    const baum = [
      { id: 'p', name: 'Triceps', parent_id: null },
      { id: 'k', name: 'Triceps Brachii Long Head', parent_id: 'p' },
    ]
    const w = knotenwert({
      kater: null, schlafguete: null, muskelbaum: { fehler: null, knoten: baum },
      muskelzustand: {
        zustaende: { p: { hours: 10, sets: 14, lastSession: 'Push', datum: '2026-10-06' } },
        imKatalog: ['p', 'k'], deckung: { gemessen: 1, gesamt: 2, rollenUngewichtet: false },
      } as unknown as Parameters<typeof muskelzeilen>[0]['muskelzustand'],
    })({ name: 'Triceps Brachii Long Head', flaeche: 'triceps-longum' })
    assert.equal(typeof w, 'object', `kein geliehener Wert: ${JSON.stringify(w)}`)
    assert.equal((w as { vonGruppe: string }).vonGruppe, 'Triceps')
  })

  it('unbenannte Flaechen behalten den Kuerzelwert — die Liste kennt sie nicht', () => {
    for (const code of ['flanke', 'nacken']) {
      assert.ok(!EBENEN[code]?.name, `${code} hat jetzt einen Namen — dann gehoert es zur Liste`)
      assert.equal(typeof karte[code], 'number', code)
    }
  })
})

describe('G-433 — eine Rechnung, eine Farbe', () => {
  it('die Liste ruft knotenwert(), die Karte kartendaten()', () => {
    const q = lies('tab-messwerte.tsx')
    assert.match(q, /mitWerten\(baueBaum\(knoten, zeigt\), wertVon\)/)
    assert.match(q, /const wertVon = React\.useMemo\(\(\) => knotenwert\(eingabe\)/)
    assert.match(q, /daten=\{karte\}/)
    assert.ok(!/calcMuscleRecovery\(/.test(q), 'die Liste rechnet wieder selbst')
  })

  it('die Zeilenfarbe kommt aus ermuedungsFarbe — wie die Karte', () => {
    const q = lies('tab-messwerte.tsx')
    assert.match(q, /ermuedungsFarbe\(100 - a\.wert\)\[0\]/)
    assert.ok(!/a\.wert >= 80/.test(q), 'eigene Schwellen sind zurueck')
  })

  it('Today faerbt aus kartendaten()', () => {
    assert.match(lies('ansicht.tsx'), /daten=\{karte\}/)
  })
})
