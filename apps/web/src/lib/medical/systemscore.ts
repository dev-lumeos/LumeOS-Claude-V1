// Die fünf System-Scores und der Gesamtwert (G-135).
//
// **Reine Rechnung** — ohne Datenbank und ohne React, wie
// `lagezaehlung.ts` (G-84) und `lib/training/auswertung.ts` (G-69).
//
// ── Woher die Regeln stammen ────────────────────────────────────
//
// `[cmd]` **`docs/specs/Medical/SPEC_09_SCORING.md`**, 408 Zeilen, führt
// `SYSTEM_MARKERS`, `FLAG_SCORE` und `WEIGHTS`. G-84 hatte beides als
// „zwei Unbekannte" offengelassen — **sie standen die ganze Zeit da.**
//
// **ZWEI ABWEICHUNGEN VON DER SPEC, beide gemessen:**
//
// `[cmd]` **1. Zugeordnet wird über LOINC, nicht über den Namen.** Die
// Spec vergleicht drei Namensfelder (`biomarker_name`,
// `biomarker_common_name`, `biomarker_abbreviation`). **Damit fällt
// `Total Testosterone` durch** — unser Bestand nennt ihn
// `Testosterone, Total`, **bei identischem LOINC 2986-8.** Über den
// Code trifft er. `medical.biomarker_spec_enrichment.system_groups`
// trägt die Gruppen bereits je Code.
//
// `[cmd]` **2. Kein `current_flag`.** Die Spec setzt eine Spalte
// voraus, die es bei uns nicht gibt. Unsere Entsprechung sind `lage`
// (Laborbereich) und `optimalLage` (Optimalband) aus `reihe.ts` —
// **beide getrennt geführt, seit G-84 aus gutem Grund.**
//
// ── Was hier NICHT geurteilt wird ───────────────────────────────
//
// `[read]` **Die Spec kennt `status: optimal | normal | warn |
// critical`.** `warn` und `critical` sind Urteile über eine Lage, und
// G-60 hat schon „Optimal" entschärft: *„benennt keine Lage"*. **Diese
// Datei liefert deshalb keinen Status, sondern die Zahl, ihre Herkunft
// und ihre Vollständigkeit.** Wer sie anzeigt, schreibt die Schwelle
// daneben — nicht das Wort.
//
// `[read]` Und die Kopfzeile des Moduls gilt unverändert: *„no
// diagnosis, no therapy advice."*

import type { MarkerReihe } from './reihe'

/** Die fünf Systeme der Spec, in der Reihenfolge ihres Gewichts. */
export const SYSTEME = [
  'cardiovascular', 'metabolic', 'hormonal', 'liver', 'kidney',
] as const
export type System = (typeof SYSTEME)[number]

/**
 * `WEIGHTS` aus SPEC_09, Summe 1,00.
 *
 * `[cmd]` Nachgerechnet: 0,25 + 0,25 + 0,20 + 0,15 + 0,15 = 1,00.
 */
export const GEWICHT: Record<System, number> = {
  cardiovascular: 0.25,
  metabolic: 0.25,
  hormonal: 0.20,
  liver: 0.15,
  kidney: 0.15,
}

/**
 * Ob ein Zeichenkettenwert eines der fünf Systeme benennt.
 *
 * `[cmd]` **`system_groups` führt nur diese fünf** (gemessen: 27 Zeilen,
 * keine anderen Werte). Der Wächter schützt trotzdem — die Spalte ist
 * ein freies Textarray, kein Aufzählungstyp.
 */
export function istSystem(wert: string): wert is System {
  return (SYSTEME as readonly string[]).includes(wert)
}

export const SYSTEM_LABEL: Record<System, string> = {
  cardiovascular: 'Herz-Kreislauf',
  metabolic: 'Stoffwechsel',
  hormonal: 'Hormone',
  liver: 'Leber',
  kidney: 'Niere',
}

/**
 * `FLAG_SCORE` aus SPEC_09, übersetzt auf unsere zwei Lagen.
 *
 * `[read]` **Die Spec kennt sechs Flags, wir zwei Bereiche.** Die
 * Übersetzung hält Toms Trennung ein (G-84): *„Ein Laborbereich ist
 * die Referenz des Labors. Ein Optimalband ist eine Empfehlung aus der
 * Literatur."* Der Laborbereich wiegt deshalb schwerer — ausserhalb
 * seiner Grenzen zu liegen ist eine Messung, ausserhalb des
 * Optimalbands eine Einordnung.
 */
export const PUNKTE = {
  /** Im Laborbereich UND im Optimalband — `optimal` der Spec. */
  optimal: 100,
  /** Im Laborbereich, ausserhalb des Optimalbands — `normal`. */
  normal: 75,
  /** Ausserhalb des Laborbereichs — `low`/`high`. */
  ausserhalb: 40,
} as const

/**
 * Der Punktwert einer Zeile — oder `null`, wenn sie nicht zählbar ist.
 *
 * `[read]` **Ohne Laborbereich gibt es keinen Punktwert.** Die Spec
 * setzt `?? 50` für unbekannte Flags; das wäre hier eine erfundene
 * Zahl. **Eine Zeile ohne Bereich wird nicht bewertet, sondern
 * gezählt** — sie erscheint in `ohne_bereich`.
 */
export function punkteFuer(r: MarkerReihe): number | null {
  if (r.lage === 'unbekannt') return null
  if (r.lage === 'darueber' || r.lage === 'darunter') return PUNKTE.ausserhalb
  // Ab hier: im Laborbereich.
  if (r.optimalLage === 'darueber' || r.optimalLage === 'darunter') return PUNKTE.normal
  // `unbekannt` heisst: kein Optimalband hinterlegt. Dann ist „im
  // Laborbereich" alles, was die Daten hergeben — und das ist `normal`,
  // nicht `optimal`. Sonst hätte ein Marker ohne Optimalband einen
  // besseren Wert als einer mit.
  return r.optimalLage === 'im_bereich' ? PUNKTE.optimal : PUNKTE.normal
}

export type Systemwert = {
  system: System
  /** Der Schnitt über die zählbaren Marker, gerundet. `null` bei keinem. */
  score: number | null
  /** Wie viele Marker in die Zahl eingegangen sind. */
  marker_count: number
  /**
   * Wie viele Marker des Systems der Nutzer NICHT hat.
   *
   * `[read]` **Bezugsgrösse ist der Bestand, nicht die Spec.** Die Spec
   * nennt je System sechs bis vier Marker; wie viele davon überhaupt
   * zuzuordnen sind, steht in `erwartet`.
   */
  missing: number
  /** Wie viele Marker dieses System laut Zuordnung führen könnte. */
  erwartet: number
  /** Marker mit Wert, aber ohne Laborbereich — nicht bewertbar. */
  ohne_bereich: number
  /** Die Namen der eingegangenen Marker, für den Nachweis. */
  namen: string[]
}

/**
 * Ein System rechnen.
 *
 * `erwartet` kommt von aussen, weil nur der Aufrufer weiss, wie viele
 * Marker die Zuordnung dem System zuschreibt — diese Datei kennt keine
 * Datenbank.
 */
export function rechneSystem(
  system: System,
  reihen: MarkerReihe[],
  erwartet: number,
): Systemwert {
  const punkte: number[] = []
  const namen: string[] = []
  let ohneBereich = 0

  // `[cmd]` **Eine Substanz zählt einmal, auch mit zwei LOINC-Codes.**
  // Fünf Grössen stehen in `biomarker_spec_enrichment` doppelt (LDL,
  // Glukose, Hämatokrit, Magnesium, Vitamin D). **Heute führt der
  // Bestand je Substanz nur einen der beiden Codes** — käme ein zweites
  // Labor mit dem anderen, zählte sie sonst doppelt und zöge den
  // Schnitt in ihre Richtung.
  const gesehen = new Set<string>()

  for (const r of reihen) {
    const schluessel = r.kurz ?? r.name
    if (gesehen.has(schluessel)) continue
    gesehen.add(schluessel)
    const p = punkteFuer(r)
    if (p === null) { ohneBereich++; continue }
    punkte.push(p)
    namen.push(schluessel)
  }

  if (punkte.length === 0) {
    return {
      system, score: null, marker_count: 0,
      missing: Math.max(erwartet - reihen.length, 0) + ohneBereich,
      erwartet, ohne_bereich: ohneBereich, namen: [],
    }
  }

  const schnitt = punkte.reduce((s, v) => s + v, 0) / punkte.length
  return {
    system,
    score: Math.round(schnitt),
    marker_count: punkte.length,
    missing: Math.max(erwartet - punkte.length, 0),
    erwartet,
    ohne_bereich: ohneBereich,
    namen: namen.sort(),
  }
}

export type Gesamtwert = {
  /** Der gewichtete Schnitt. `null`, wenn kein System eine Zahl hat. */
  score: number | null
  /**
   * Die Summe der Gewichte, die eingegangen sind — `data_completeness`
   * der Spec, hier als Anteil von 1,00.
   *
   * `[read]` **Das ist die ehrliche Zahl neben dem Score.** Ein Wert
   * aus zwei von fünf Systemen ist etwas anderes als einer aus fünf,
   * auch wenn beide 82 heissen.
   */
  gewicht_erfasst: number
  /** Wie viele der fünf Systeme eine Zahl beigetragen haben. */
  systeme_mit_wert: number
  /** Alle fünf, auch die ohne Wert — die Anzeige zeigt sie mit. */
  systeme: Systemwert[]
}

/**
 * Der Gesamtwert nach `calcOverallHealthScore`.
 *
 * `[cmd]` **Die Normalisierung über `totalW` ist aus der Spec
 * übernommen** — fehlt ein System, verteilt sich sein Gewicht auf die
 * übrigen, statt die Zahl nach unten zu ziehen.
 *
 * `[read]` **Ein Unterschied zur Spec:** sie liefert `score: 0`, wenn
 * gar nichts da ist. **Null wäre hier eine Aussage** („alles schlecht")
 * statt einer Leerstelle. Diese Funktion gibt `null`.
 */
export function rechneGesamt(systeme: Systemwert[]): Gesamtwert {
  let summe = 0
  let gewicht = 0
  let mitWert = 0

  for (const s of systeme) {
    if (s.score === null) continue
    const w = GEWICHT[s.system]
    summe += s.score * w
    gewicht += w
    mitWert++
  }

  return {
    score: gewicht > 0 ? Math.round(summe / gewicht) : null,
    // Auf drei Stellen — 0,15 + 0,25 ergibt sonst 0,4000000000000001.
    gewicht_erfasst: Math.round(gewicht * 1000) / 1000,
    systeme_mit_wert: mitWert,
    systeme,
  }
}

/**
 * Der ganze Weg: Reihen nach Systemen aufteilen und rechnen.
 *
 * `gruppenJeCode` bildet LOINC → Systeme ab; ein Marker kann in mehr
 * als einem System stehen (`system_groups` ist ein Array).
 */
export function rechneScores(
  reihen: MarkerReihe[],
  gruppenJeCode: Map<string, System[]>,
  erwartetJeSystem: Map<System, number>,
): Gesamtwert {
  const jeSystem = new Map<System, MarkerReihe[]>()
  for (const s of SYSTEME) jeSystem.set(s, [])

  for (const r of reihen) {
    if (!r.loinc_code) continue
    for (const s of gruppenJeCode.get(r.loinc_code) ?? []) {
      jeSystem.get(s)?.push(r)
    }
  }

  return rechneGesamt(SYSTEME.map(s => rechneSystem(
    s, jeSystem.get(s) ?? [], erwartetJeSystem.get(s) ?? 0,
  )))
}
