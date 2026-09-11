/**
 * G-359/3 — der Entwurf verdraengt nicht mehr (nutrition, supplements)
 *
 * **Tom, 2026-09-07:** *,,bestehendes bleibt wie es ist, wir blenden
 * nur mockup attrappen ein als referenz."*
 *
 * `[cmd]` **Gemessen 2026-09-06: `dev@lumeos.app` hat 30 Sitzungen
 * und 5 Plaene** — **also lief immer der echte Zweig.**
 *
 * `[cmd]` **Am Schirm belegt, vorher/nachher:**
 *
 *     nutrition/diary       2 Attrappen -> 5   (7 Titel -> 10)
 *     nutrition/planner     1 -> 2
 *     supplements/today     1 -> 10
 *     supplements/cost      2 -> 10
 *     supplements/inventory 1 -> 6
 *
 * `[read]` **Die Probe prueft die Bedingung VOR der Komponente**,
 * nicht die Anwesenheit des Namens — `{null && <Entwurf/>}` enthaelt
 * `<Entwurf` und kaeme sonst durch (in goals gemessen).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const V2 = join(HIER, '..', '..')

const lies = (p: string) => readFileSync(p, 'utf8')

/** Datei, Entwurf, echter Teil — je eine behobene Verdraengung. */
//
// ══ G-412: DREI FAELLE SIND ENTFALLEN — DURCH ENTSCHEIDUNG ═════════
//
// **Tom, 2026-09-08:** *„Below threshold — die angebundene Fassung
// steht direkt darueber. Doppelt: raus."*
//
// `[cmd]` **`PreWorkoutOptimizer`, `MicronutrientSnapshot` und
// `BelowThreshold` sind ENTFERNT**, nicht verdraengt:
//
//     PreWorkoutOptimizer    zeigte einen erfundenen Zeitfenster-Ring
//                            neben der echten Kachel — beide immer,
//                            nebeneinander, verschiedene Sachen
//     MicronutrientSnapshot  dieselben acht Naehrstoffe als Netz;
//                            das Netz sitzt jetzt IN der echten Kachel
//     BelowThreshold         3 von 117 erfunden neben 7 von 32 echt
//
// `[read]` **Die Zusage dieser Probe gilt weiter** — ein Entwurf darf
// nicht STILL hinter einer Bedingung verschwinden. `[read]` **Eine
// Entfernung mit Grund ist etwas anderes als eine Verdraengung**, und
// die drei Namen stehen deshalb nicht mehr in der Liste (A-59: was
// keinen Aufrufer hat, wird geloescht, nicht stehengelassen).
const FAELLE = [
  ['nutrition/ansicht.tsx', 'NutritionPlannerTab', 'PlannerEchtTab'],
  ['supplements/tabs.tsx', 'TodayAttrappe', 'TodayEcht'],
  ['supplements/tabs.tsx', 'StackMatrix', 'StackMatrixEcht'],
  ['supplements/tabs.tsx', 'StackList', 'StackListeEcht'],
  ['supplements/tabs.tsx', 'DatabaseAttrappe', 'SubstanzDatenbank'],
  ['supplements/tabs.tsx', 'CostAttrappe', 'CostEcht'],
  ['supplements/ansicht.tsx', 'ExtendedGesperrt', 'SuppExtended'],
  ['supplements/ansicht.tsx', 'SuppCompliance', 'ComplianceEcht'],
  ['supplements/ansicht.tsx', 'SuppInventory', 'InventoryEcht'],
] as const

/** Steht der Name hinter einer abschaltenden Bedingung? */
function abgeschaltet(quelle: string, name: string): string | null {
  const i = quelle.indexOf(`<${name}`)
  if (i < 0) return 'fehlt ganz'
  const vorn = quelle.slice(0, i)
  const lk = vorn.lastIndexOf('{')
  const wache = lk >= 0 ? vorn.slice(lk).trim() : ''
  // `[cmd]` **`[{(\s]` statt `\s`** — die Wache lautet `"{null && "`,
  // und `\s` traf das `{` davor nicht (in goals gemessen).
  //
  // `[cmd]` **Und die `0` braucht eine Vorbedingung:** die echte Wache
  // `{mikro && mikro.zeilen.length > 0 &&` endet auf `0 &&` und wurde
  // als abgeschaltet gelesen. **Fuenf Fehlalarme, gemessen 2026-09-06.**
  // `[read]` **Ein Vergleich davor heisst: es ist eine Datenpruefung,
  // keine Abschaltung.**
  if (/[<>=!]\s*0\s*&&\s*$/.test(wache)) return null
  if (/[{(\s](null|false|0|undefined)\s*&&\s*$/.test(wache)) return wache
  return null
}

describe('G-359/3 — der Entwurf bleibt sichtbar', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(lies(join(V2, 'nutrition/ansicht.tsx')).length > 1000,
      'nutrition/ansicht.tsx nicht gefunden — der Pfad stimmt nicht')
  })

  for (const [datei, entwurf] of FAELLE) {
    it(`${entwurf} steht in keinem Sonst-Zweig`, () => {
      const t = lies(join(V2, datei))
      assert.ok(!new RegExp(`:\\s*<${entwurf}\\b`).test(t),
        `${entwurf} steht im Sonst-Zweig eines Ternaers — `
        + 'ein Entwurf darf nicht verdraengt werden (E-68)')
    })
  }

  for (const [datei, entwurf] of FAELLE) {
    it(`${entwurf} wird unbedingt gerendert`, () => {
      const t = lies(join(V2, datei))
      const grund = abgeschaltet(t, entwurf)
      assert.equal(grund, null,
        `${entwurf} steht hinter einer abschaltenden Bedingung: `
        + `\`${grund}\``)
    })
  }

  // ── Bestehendes bleibt unangetastet ──────────────────────────────
  for (const [datei, , echt] of FAELLE) {
    it(`der echte Teil ${echt} ist unangetastet`, () => {
      // `[read]` **Toms Vorgabe.** `[cmd]` **Ein blosser Namenstest
      // liesse `{false && <Echt/>}` durch** — in training gemessen.
      const t = lies(join(V2, datei))
      const grund = abgeschaltet(t, echt)
      assert.equal(grund, null,
        `${echt} steht hinter einer abschaltenden Bedingung — `
        + `bestehendes Verhalten wurde geaendert: \`${grund}\``)
    })
  }
})
