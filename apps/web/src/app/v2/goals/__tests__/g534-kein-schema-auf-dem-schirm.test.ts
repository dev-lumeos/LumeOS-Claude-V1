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

const REITER = ['phase-echt.tsx', 'phase-setzen.tsx'] as const

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

  it('der Referenztrenner und die Entwurfsansicht bleiben', () => {
    const a = sichtbar('ansicht.tsx')
    assert.match(a, /<ReferenzTrenner reiter="Phase engine"/,
      'der Trenner ist weg')
    assert.match(a, /<GoalsPhaseView \/>/,
      'die Entwurfsansicht unter der Linie ist weg')
  })
})

describe('G-534/A3 — die ueberzogene Phase ist ein Posten', () => {
  it('es gibt einen eigenen Kasten, nicht nur eine Kennzahl', () => {
    const q = sichtbar('phase-echt.tsx')
    assert.match(q, /data-phase-ueberzogen/,
      'kein eigener Posten — „73 Tage ueberzogen" steht nur als Zahl '
      + 'in der Kennzahlenreihe')
  })

  it('er nennt den Weg daneben', () => {
    const q = sichtbar('phase-echt.tsx')
    assert.match(q, /Beende sie/, 'kein Weg zum Beenden genannt')
    assert.match(q, /geplante Ende/, 'kein Weg zum Verschieben genannt')
  })

  it('er erscheint NUR bei einer laufenden, ueberzogenen Phase', () => {
    const q = sichtbar('phase-echt.tsx')
    assert.match(q, /lauf\.tageRest < 0 && !lauf\.beendet/,
      'der Posten erscheint auch bei einer beendeten oder einer '
      + 'Phase im Plan')
  })

  it('er bewertet den Nutzer nicht', () => {
    // `[cmd]` **C-108/F-02: nennen ja, bewerten nein.** `[read]`
    // **Es ist eine Aussage ueber die PHASE.**
    const q = sichtbar('phase-echt.tsx')
    const kasten = q.slice(q.indexOf('data-phase-ueberzogen'),
      q.indexOf('data-phase-ueberzogen') + 700)
    for (const wort of ['zu lange', 'versaeumt', 'du solltest',
      'vergessen', 'schlecht']) {
      assert.ok(!kasten.toLowerCase().includes(wort),
        `der Posten enthaelt „${wort}" — das bewertet den Nutzer`)
    }
  })
})
