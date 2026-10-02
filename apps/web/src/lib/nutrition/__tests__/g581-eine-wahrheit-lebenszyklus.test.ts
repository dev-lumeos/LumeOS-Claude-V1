/**
 * G-581 — eine Wahrheit ueber den Lebenszyklus, nicht zwei
 *
 * `[cmd]` **`ZYKLUS_WAEHLBAR` stand zweimal im Produkt, mit
 * verschiedenen Werten:**
 *
 *     plan-detail-lage.ts:23   ['once','rollover','sequence']
 *     plan-werkbank.ts:450     ['once','rollover']
 *
 * `[cmd]` **Und zwei gruene Waechter hielten beide fest**
 * (`plan-detail-lage.test.ts:207`, `ghost-eintraege.test.ts:214`) —
 * **sie massen zwei verschiedene Wahrheiten.**
 *
 * `[read]` **Die dreiwertige Liste war die Zusage, die G-579 bewusst
 * NICHT gegeben hat:** eine feste Dreierliste bricht bei einem
 * einzigen Plan, weil es dann keinen Folgeplan geben kann.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ZYKLUS_WAEHLBAR } from '../plan-werkbank'

const HIER = dirname(fileURLToPath(import.meta.url))
// `[cmd]` **Drei Ebenen hoch: `__tests__` -> `nutrition` -> `lib` ->
// `src`.** `[read]` **Mit zweien zeigte es auf `lib/`** — dann fand
// der Waechter `app/v2/nutrition` nicht, **und drei Zusicherungen
// waren gruen, ohne etwas gesehen zu haben.**
const SRC = join(HIER, '..', '..', '..')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

function quelldateien(pfad: string, aus: string[] = []): string[] {
  for (const e of readdirSync(pfad)) {
    if (e === 'node_modules' || e.startsWith('.next')) continue
    const p = join(pfad, e)
    if (statSync(p).isDirectory()) quelldateien(p, aus)
    else if (e.endsWith('.ts') || e.endsWith('.tsx')) aus.push(p)
  }
  return aus
}

// `[read]` **Auf Modulebene, nicht im ersten `describe`** — beide
// Bloecke zaehlen denselben Heuhaufen. `[cmd]` **Der Waechter schliesst
// sich SELBST aus:** er traegt die geloeschte Definition als
// Eichzeichenkette und faende sich sonst als zweite Wahrheit.
const DATEIEN = quelldateien(SRC)
  .filter(p => !p.endsWith('g581-eine-wahrheit-lebenszyklus.test.ts'))

describe('G-581 — der Lebenszyklus hat genau eine Liste', () => {
  it('der Heuhaufen ist nicht leer', () => {
    assert.ok(DATEIEN.length > 300,
      `nur ${DATEIEN.length} Quelldateien — der Waechter laeuft ins Leere`)
  })

  // `[cmd]` **Das ist der Befund von G-581**, als Zusicherung.
  it('ZYKLUS_WAEHLBAR wird genau EINMAL definiert', () => {
    // `[read]` **Gezaehlt, nicht gesucht.** `[cmd]` **Ein
    // `assert.match` waere schon zufrieden, solange EINE Definition
    // existiert** — und genau so konnten zwei nebeneinander leben.
    const stellen = DATEIEN.filter(p =>
      /export const ZYKLUS_WAEHLBAR\s*=/.test(lies(p)))
    assert.equal(stellen.length, 1,
      `${stellen.length} Definitionen von ZYKLUS_WAEHLBAR: `
      + `${stellen.map(p => p.slice(SRC.length)).join(', ')} — zwei Orte `
      + 'fuer denselben Lebenszyklus laufen auseinander (G-529)')
    assert.match(stellen[0], /plan-werkbank\.ts$/,
      'die Liste steht nicht im lebenden Weg')
  })

  it('die eine Liste traegt zwei Werte, nicht drei', () => {
    // `[read]` **`sequence` kommt BEDINGT dazu** — `AktivierenFrage`
    // haengt es an, sobald ein zweiter Plan existiert (G-579).
    // **Eine feste Dreierliste waere eine Zusage, die bei einem
    // einzigen Plan bricht.**
    assert.deepEqual([...ZYKLUS_WAEHLBAR], ['once', 'rollover'])
  })

  it('der Waechter trifft die Form, die er sucht', () => {
    // `[read]` **An der geloeschten Zeile eichen** — sonst beweist
    // ein Nichtfund nichts.
    const geloescht = "export const ZYKLUS_WAEHLBAR = "
      + "['once', 'rollover', 'sequence'] as const"
    assert.match(geloescht, /export const ZYKLUS_WAEHLBAR\s*=/,
      'der Waechter findet die geloeschte Definition nicht')
    // `[cmd]` **Eine blosse Erwaehnung darf NICHT zaehlen** — der
    // Name steht in Kommentaren und in Importen.
    assert.ok(!/export const ZYKLUS_WAEHLBAR\s*=/.test(
      "import { ZYKLUS_WAEHLBAR } from '../plan-werkbank'"),
      'der Waechter haelt einen Import fuer eine Definition')
  })
})

describe('G-581 — der tote Pfad ist entfernt, nicht abgeschaltet', () => {
  // `[cmd]` **Gemessen 2026-10-02, vor dem Entfernen:**
  //
  //     plan-detail.tsx            3 Ausfuhren, 0 Aufrufer
  //     plan-detail-lage.ts        nur von plan-detail.tsx + Test
  //     tab-plans.tsx              `import { } from './plan-detail'`
  //                                — LEER, band nichts
  //
  // `[read]` **A-59: entfernt, nicht auskommentiert.**
  const WEG = [
    join(SRC, 'app', 'v2', 'nutrition', 'plan-detail.tsx'),
    join(SRC, 'lib', 'nutrition', 'plan-detail-lage.ts'),
  ]

  for (const p of WEG) {
    it(`${p.split(/[\\/]/).pop()} ist weg`, () => {
      assert.ok(!existsSync(p),
        'der tote Pfad ist zurueck — mit ihm die zweite Zyklusliste')
    })
  }

  it('die drei Bauteile werden nirgends mehr gerufen', () => {
    // `[cmd]` **G-319 hat sie ausgetragen, und zwar mit Grund:**
    // `MealPlanCard`/`MealPlanDetail` zeigten den aktiven Plan ein
    // drittes Mal, `MealPlanActivationModal` bekam immer den AKTIVEN
    // Plan — **ein Klick bei einem anderen oeffnete den falschen
    // Dialog.**
    //
    // `[read]` **Gesucht wird die VERWENDUNG als JSX**, nicht der
    // Name: die Begruendungen nennen ihn weiter, und das sollen sie.
    for (const k of ['MealPlanCard', 'MealPlanDetail',
      'MealPlanActivationModal']) {
      const treffer = DATEIEN.filter(p =>
        new RegExp(`<${k}\\b`).test(lies(p)))
      assert.deepEqual(treffer, [],
        `${k} wird wieder gerendert — G-319 hat es mit Grund ausgetragen`)
    }
  })

  it('kein Import zeigt mehr auf den toten Pfad', () => {
    // `[read]` **Ein leerer Import haelt eine Datei am Leben**, ohne
    // etwas zu binden — genau so hat `plan-detail.tsx` ueberlebt.
    const treffer = DATEIEN.filter(p =>
      /from '\.\/plan-detail'|plan-detail-lage/.test(lies(p)))
    assert.deepEqual(treffer.map(p => p.slice(SRC.length)), [],
      'ein Import zeigt auf den entfernten Pfad')
  })

  it('der lebende Weg steht und hat Aufrufer', () => {
    // `[read]` **Die Gegenprobe zum Entfernen:** was ersetzt hat,
    // muss da sein. **Sonst ist der Reiter leer statt aufgeraeumt.**
    const ui = join(SRC, 'app', 'v2', 'nutrition', 'plan-werkbank-ui.tsx')
    assert.ok(existsSync(ui), 'der lebende Weg fehlt')
    const q = lies(ui)
    assert.match(q, /export function AktivierenFrage/,
      'AktivierenFrage fehlt — sie hat MealPlanActivationModal ersetzt')
    // `[read]` **Beide Orte NAMENTLICH, nicht `>= 2`.** `[cmd]` **Eine
    // Untergrenze erlaubt Verlust** (G-216): die Sabotage nahm den
    // Aufruf aus der Werkbank, der aus der Bibliothek blieb — **und
    // der Waechter war zufrieden.**
    const rufer = DATEIEN.filter(p => /<AktivierenFrage\b/.test(lies(p)))
      .map(p => p.split(/[\\/]/).pop())
    for (const datei of ['plans-echt.tsx', 'plan-werkbank-ui.tsx']) {
      assert.ok(rufer.includes(datei),
        `${datei} ruft AktivierenFrage nicht mehr — G-319 nennt die `
        + `Bibliothek UND die Werkbank (gefunden: ${rufer.join(', ')})`)
    }
  })
})
