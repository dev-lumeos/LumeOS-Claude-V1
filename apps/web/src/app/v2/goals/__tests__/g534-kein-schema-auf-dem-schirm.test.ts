/**
 * G-534/A1+A3 — der Phase-Reiter erklaert sein Schema nicht mehr
 *
 * `[read]` **Tom, 2026-09-29:** *,,phase engine ist so nicht
 * brauchbar … also erzaehl mir nicht das sei umgesetzt."*
 *
 * `[cmd]` **Gemessen: sechs Kacheln, fuenf endeten mit einem Absatz
 * darueber, was die Tabelle NICHT kann** — *,,goal_phases fuehrt
 * weder Woche noch Fortschritt"*, *,,recommended_next ist ein
 * gespeicherter Text"*, *,,Aus parameters, einem freien
 * JSON-Feld"*, *,,phase_am() waehlt die Zeile …"*, *,,parameters
 * bleibt leer"*.
 *
 * `[read]` **Die Saetze sind RICHTIG und gehoeren nicht auf den
 * Schirm.** `[cmd]` **`ansicht.tsx:106` gibt die Form vor:**
 * `attrappeAus(quelle, wartet)` — **eine Marke ist EINE Zeile,
 * Quelle und Grund.** **Ein Absatz ueber fehlende Spalten ist eine
 * Entwicklernotiz.**
 *
 * `[read]` **Nichts wird geloescht, was E-68 sichtbar haben will** —
 * die markierten Kacheln bleiben, der Trenner bleibt. **Nur die
 * Fussnoten gehen.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')

/**
 * Nur der ANGEZEIGTE Text — Kommentare raus.
 *
 * `[read]` **Sonst liest der Waechter seine eigene Begruendung**
 * (die Lehre aus G-512): die Kommentare hier NENNEN die entfernten
 * Saetze, damit nachvollziehbar bleibt, was wegfiel.
 */
function sichtbar(datei: string): string {
  return readFileSync(join(GOALS, datei), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
}

// G-656: phase-echt.tsx und phase-setzen.tsx sind geloescht; der Reiter ist jetzt die Plan-Seite (G-649).
const REITER = ['plan-seite.tsx'] as const

/**
 * Begriffe, die nur wir kennen.
 *
 * `[read]` **Tabellen, Spalten, Funktionen, CHECK-Namen und
 * Punktnummern** — sie erklaeren dem Nutzer unsere Ablage.
 */
const SCHEMABEGRIFFE = [
  'goal_phases', 'phase_am', 'berechne_zielwerte',
  'phase_rate_rules', 'phasenparameter_fehlt',
  'goal_phases_zielrate', 'nutrition_targets',
  'calorie_surplus_kcal', 'JSON-Feld',
]

describe('G-534/A1 — kein Schema auf dem Schirm', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    for (const d of REITER) {
      assert.ok(sichtbar(d).length > 1000, `${d} nicht gefunden`)
    }
  })

  for (const datei of REITER) {
    it(`${datei} nennt keinen Schemabegriff im angezeigten Text`, () => {
      const q = sichtbar(datei)
      for (const begriff of SCHEMABEGRIFFE) {
        // `[read]` **Nur im ANGEZEIGTEN Text** — ein Feldzugriff wie
        // `phase.phase_id` ist Code, kein Satz an den Nutzer.
        const inText = new RegExp(
          `(>|\\s)[^<>{}]{0,80}${begriff.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
        const treffer = q.split('\n').filter(z =>
          inText.test(z) && !/^\s*(import|export|const|function|type|\})/.test(z)
          // Zeilen, die den Begriff nur als Bezeichner tragen
          && !/\bphase\.\w+|\bvorschlag\.\w+|from '/.test(z))
        assert.deepEqual(treffer, [],
          `${datei} zeigt „${begriff}" im Text:\n  ${treffer.join('\n  ')}`)
      }
    })
  }

  // ── Die fuenf Fussnoten, namentlich ─────────────────────────────
  //
  // `[cmd]` **Jede einzeln geprueft** — ein Sammelmuster wuerde
  // gruen bleiben, wenn vier verschwinden und eine bleibt.
  const FUSSNOTEN = [
    'weder Woche noch Fortschritt',
    'keine Ableitung aus dem Verlauf',
    'einem freien',
    'waehlt die Zeile',
    'bleibt leer',
  ]
  for (const satz of FUSSNOTEN) {
    it(`die Fussnote „${satz}" ist weg`, () => {
      for (const d of REITER) {
        assert.ok(!sichtbar(d).includes(satz),
          `${d} traegt die Fussnote wieder`)
      }
    })
  }

  // ── Was BLEIBEN muss (E-68) ─────────────────────────────────────
  it('die Marken nach attrappeAus() bleiben', () => {
    // `[read]` **E-68 und G-365 wollen Unangebundenes SICHTBAR** —
    // der Auftrag sagt ausdruecklich: nichts davon loeschen.
    const f = sichtbar('fehlende-kacheln.tsx')
    assert.match(f, /attrappe=\{marke\(/,
      'die Attrappenmarken sind verschwunden — E-68 verlangt sie')
  })

  // G-671 (Freigabe Tom 18.10.): Trenner und `GoalsPhaseView` unter dem Planer sind entfernt —
  // PhaseEngine.dc.html kennt sie nicht. Die Gegenrichtung prueft `g666-phase-attrappen.test.ts`.
  it('der Referenztrenner und die Entwurfsansicht sind weg (G-671)', () => {
    const a = sichtbar('ansicht.tsx')
    assert.ok(!/<ReferenzTrenner reiter="Phase engine"/.test(a), 'der Trenner steht wieder da')
    assert.ok(!/<GoalsPhaseView \/>/.test(a), 'die Referenz unter dem Planer steht wieder da')
  })
})

describe('G-534/A3 — die ueberzogene Phase ist ein Posten', () => {
  // G-656: der eigene Kasten (`data-phase-ueberzogen` in phase-echt.tsx) ist mit der
  // Datei geloescht — der Entwurf hat keinen. Die Ueberziehung steht seit G-645/2 in
  // der Wochenzeile (`wocheText`), Beenden im Bearbeiten an der laufenden Phase.
  const plan = readFileSync(join(GOALS, '..', '..', '..', 'lib', 'goals', 'plan.ts'), 'utf8')
  const zeile = plan.slice(plan.indexOf('export function wocheText'), plan.indexOf('export function wocheText') + 600)

  it('die Wochenzeile nennt die Ueberziehung in Tagen', () => {
    assert.match(zeile, /l\.tageRest >= 0 \? `Woche \$\{l\.woche\} von \$\{l\.wochenGesamt\}` : `Woche \$\{l\.woche\} · \$\{Math\.abs\(l\.tageRest\)\} Tage über das geplante Ende`/)
  })

  it('der Weg daneben: Beenden an der laufenden Phase', () => {
    assert.match(sichtbar('plan-seite.tsx'), /p\.zustand === 'laufend' && plan\.status === 'aktiv'[\s\S]{0,400}data-phase-beenden-oeffnen/)
  })

  it('sie bewertet den Nutzer nicht', () => {
    for (const wort of ['zu lange', 'versaeumt', 'du solltest', 'vergessen', 'schlecht'])
      assert.ok(!zeile.toLowerCase().includes(wort), `die Wochenzeile enthaelt „${wort}"`)
  })
})
