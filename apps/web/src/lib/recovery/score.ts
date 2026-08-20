// Der Erholungswert aus einem Check-in (G-76).
//
// `[read]` **Die Zahl darf gezeigt werden, das Urteil nicht.**
// `SPEC_09` liefert sechs Readiness-Texte („Optimal", „Vorsicht" …)
// und einen Arzt-Hinweis; der Schemaentwurf fuehrt sie als
// Entscheidungspunkt, weil sie Urteilssprache sind. **Diese Datei
// rechnet den Score und benennt keine Lage** — dieselbe Regel wie bei
// Medical: „Im Bereich / Ueber / Unter" ja, „Optimal" nein.
//
// `[cmd]` **Gebaut ist NUR der Manual-Modus.** Der Schemaentwurf nennt
// die Gewichte 30/15/15/10/15/10/5 als „stabilen Kern, in allen drei
// Quellen identisch". Auf `dev@lumeos.app` tragen **43 von 170**
// Check-ins einen HRV-Wert — der Score muss ohne rechnen koennen, und
// tut es.
//
// DREI FORMELN AUS DEN QUELLEN SIND NICHT UEBERNOMMEN, weil der
// Schemaentwurf sie als fehlerhaft gemessen hat:
//   1. Der SQL-Trigger der SPEC_06 — sein Trainingsterm ergibt fuer
//      jede nennenswerte Last rund volle Punkte.
//   2. Die ACWR-Kurve des Mockup-Motors — Faktor 1.1 bei ACWR 1.4:
//      erhoehtes Verletzungsrisiko verbessert den Score.
//   3. Die gedruckten HRV-Anker widersprechen der eigenen Formel.
// Keine davon wird hier nachgebaut. Was sie braeuchten, bleibt
// Attrappe.
import type { CheckinZeile } from './checkin-read'

/** Ein Anteil am Score, wie ihn die Anzeige zeigt. */
export type ScoreTeil = {
  code: string
  label: string
  /** Das Gewicht in Punkten — die Obergrenze dieses Anteils. */
  gewicht: number
  /** Erreichte Punkte, oder `null`, wenn die Spalte leer ist. */
  punkte: number | null
  /** Der Rohwert, den die Anzeige nennen kann. */
  roh: string
}

export type ScoreErgebnis = {
  /** 0–100, gerundet. `null`, wenn kein Anteil rechenbar war. */
  score: number | null
  teile: ScoreTeil[]
  /** Summe der Gewichte, die tatsaechlich gerechnet haben. */
  gewichtBasis: number
  /**
   * Wieviele Anteile leer blieben. `[read]` Die Anzeige nennt das —
   * ein Score aus vier von sieben Anteilen ist eine andere Aussage
   * als einer aus sieben.
   */
  fehlendeTeile: number
  /** `true`, sobald ein HRV-Wert vorlag (heute nur zur Anzeige). */
  hatHrv: boolean
}

/**
 * Die Gewichte des Manual-Modus.
 *
 * `[cmd]` `00-schemaentwurf.md:49` — „der stabile Kern, in allen drei
 * Quellen identisch": 30/15/15/10/15/10/5 fuer Schlafqualitaet,
 * Schlafdauer, Gefuehl, Soreness, Trainingslast, Nutrition, Stimmung.
 */
export const GEWICHTE = {
  schlafqualitaet: 30,
  schlafdauer: 15,
  gefuehl: 15,
  soreness: 10,
  trainingslast: 15,
  nutrition: 10,
  stimmung: 5,
} as const

/**
 * Die Mood-Werte, ebenfalls aus dem stabilen Kern.
 *
 * `[cmd]` „die Mood-Werte (motivated 100 … sick 10)". Die Zwischen-
 * stufen stehen im Entwurf; hier stehen die, die vorkommen, plus die
 * benannten Endpunkte.
 */
const MOOD_WERT: Record<string, number> = {
  motivated: 100,
  good: 80,
  neutral: 60,
  tired: 40,
  stressed: 30,
  sick: 10,
}

/** Eine 1–10-Skala auf 0–1. */
function skala10(v: number | null): number | null {
  if (v === null || !Number.isFinite(v)) return null
  return Math.min(1, Math.max(0, v / 10))
}

/**
 * Schlafdauer auf 0–1.
 *
 * `[read]` Keine erfundene Schwelle: 8 h gilt als voll, darunter
 * linear, darueber kein Bonus. **Das ist eine Normierung, keine
 * Empfehlung** — die Anzeige sagt „7,5 h", nicht „zu wenig".
 */
function schlafdauerAnteil(h: number | null): number | null {
  if (h === null || !Number.isFinite(h)) return null
  return Math.min(1, Math.max(0, h / 8))
}

/**
 * Der Soreness-Anteil.
 *
 * **DIE MITTELUNG IST EINE ENTSCHEIDUNG — E2, und Tom muss sie
 * treffen.** `[cmd]` Der Schemaentwurf misst drei Lesarten fuer
 * dieselben Daten: Mittel ueber alle 18 Gruppen (Engine), Mittel nur
 * ueber gemeldete Muskeln > 0 (V), Mittel ueber die im JSONB
 * genannten (S). „Ein einziger Muskel mit Kater 3 ergibt je nach
 * Quelle 9,4/10 oder 0/10 Punkte."
 *
 * `[cmd]` **Genommen ist V/S — nur die gemeldeten Muskeln.** Zwei
 * Gruende, beide gemessen:
 *   1. Der Entwurf empfiehlt es: „sonst ist der Term bei 18 Gruppen
 *      praktisch konstant".
 *   2. **Die Daten stuetzen es:** das JSONB fuehrt hoechstens fuenf
 *      Muskeln (`chest`, `back`, `quadriceps`, `glutes`,
 *      `lower_back`), nie 18 und nie ein leeres Objekt. Ueber 18 zu
 *      mitteln hiesse, 13 Nullen zu erfinden, die niemand erfasst
 *      hat.
 *
 * `[read]` Der Entwurf nennt als Gegenargument, dass der Check-in-Tab
 * die Karte mit allen 18 Gruppen vorbelegt. **Das ist eine Aussage
 * ueber die Oberflaeche, nicht ueber die Daten** — und die Daten
 * zeigen fuenf.
 */
export function sorenessAnteil(soreness: Record<string, number>): number | null {
  const werte = Object.values(soreness).filter(v => Number.isFinite(v) && v > 0)
  // Kein gemeldeter Kater heisst voller Anteil — nicht „unbekannt".
  if (werte.length === 0) return 1
  const mittel = werte.reduce((s, v) => s + v, 0) / werte.length
  // Die Skala ist 0-3; 3 heisst kein Punkt.
  return Math.min(1, Math.max(0, 1 - mittel / 3))
}

/**
 * Der Erholungswert eines Check-ins.
 *
 * `[read]` **Anteile ohne Wert zaehlen nicht mit** — weder als 0 noch
 * als voll. Der Score wird auf die Gewichte normiert, die wirklich
 * gerechnet haben, und `fehlendeTeile` sagt, wie viele fehlten. Eine
 * leere Spalte als 0 zu werten waere eine Behauptung; sie als voll zu
 * werten waere Schoenrechnen.
 */
export function berechneScore(z: CheckinZeile | null): ScoreErgebnis {
  const leer: ScoreErgebnis = {
    score: null, teile: [], gewichtBasis: 0, fehlendeTeile: 0, hatHrv: false,
  }
  if (!z) return leer

  const sorenessWert = sorenessAnteil(z.soreness)
  const sorenessRoh = Object.entries(z.soreness)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ')

  const moodWert = MOOD_WERT[z.mood] ?? null

  const teile: ScoreTeil[] = [
    {
      code: 'schlafqualitaet', label: 'Schlafqualität',
      gewicht: GEWICHTE.schlafqualitaet,
      punkte: anteilPunkte(skala10(z.sleep_quality), GEWICHTE.schlafqualitaet),
      roh: z.sleep_quality === null ? '—' : `${z.sleep_quality}/10`,
    },
    {
      code: 'schlafdauer', label: 'Schlafdauer',
      gewicht: GEWICHTE.schlafdauer,
      punkte: anteilPunkte(schlafdauerAnteil(z.sleep_hours), GEWICHTE.schlafdauer),
      roh: z.sleep_hours === null ? '—' : `${z.sleep_hours} h`,
    },
    {
      code: 'gefuehl', label: 'Gefühl',
      gewicht: GEWICHTE.gefuehl,
      punkte: anteilPunkte(skala10(z.subjective_feeling), GEWICHTE.gefuehl),
      roh: z.subjective_feeling === null ? '—' : `${z.subjective_feeling}/10`,
    },
    {
      code: 'soreness', label: 'Muskelkater',
      gewicht: GEWICHTE.soreness,
      punkte: anteilPunkte(sorenessWert, GEWICHTE.soreness),
      roh: sorenessRoh || 'kein Kater gemeldet',
    },
    {
      // `[cmd]` NICHT gerechnet: der Trainingsterm braucht ACWR, und
      // alle drei Quellenkurven sind laut Entwurf entweder fehlerhaft
      // (Engine: Faktor 1.1 bei ACWR 1.4) oder nicht umgesetzt.
      code: 'trainingslast', label: 'Trainingslast',
      gewicht: GEWICHTE.trainingslast,
      punkte: null,
      roh: 'braucht ACWR',
    },
    {
      // `[cmd]` NICHT gerechnet: `checkins` fuehrt keine Nutrition;
      // die Quellen setzen sie fest auf 70, was eine erfundene Zahl
      // waere.
      code: 'nutrition', label: 'Ernährung',
      gewicht: GEWICHTE.nutrition,
      punkte: null,
      roh: 'nicht im Check-in',
    },
    {
      code: 'stimmung', label: 'Stimmung',
      gewicht: GEWICHTE.stimmung,
      punkte: moodWert === null ? null : (moodWert / 100) * GEWICHTE.stimmung,
      roh: z.mood,
    },
  ]

  const gerechnet = teile.filter(t => t.punkte !== null)
  const gewichtBasis = gerechnet.reduce((s, t) => s + t.gewicht, 0)
  const punkte = gerechnet.reduce((s, t) => s + (t.punkte ?? 0), 0)

  return {
    score: gewichtBasis > 0 ? Math.round((punkte / gewichtBasis) * 100) : null,
    teile,
    gewichtBasis,
    fehlendeTeile: teile.length - gerechnet.length,
    hatHrv: z.hrv_rmssd !== null,
  }
}

function anteilPunkte(anteil: number | null, gewicht: number): number | null {
  return anteil === null ? null : anteil * gewicht
}
