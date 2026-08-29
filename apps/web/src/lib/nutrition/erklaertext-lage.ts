// ════════════════════════════════════════════════════════════════════
// DIE ERKLAERTEXTE, EINGEORDNET — G-246
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Nur Typen kommen von dort.
//
// **Diese Datei schreibt keine Texte.** `[read]` Sie entscheidet nur,
// **welcher der drei Zustaende vorliegt** — dieselbe Unterscheidung
// wie *begruendet leer* gegen *nicht bearbeitet* (G-208) und
// *ohne Referenz* gegen *unvollstaendig* (G-239).
//
// ══ ZUSTAND 1: KEIN DETAILTEXT ══════════════════════════════════════
//
// `[cmd]` **28 der 138 Naehrstoffe haben keine Zeile in
// `nutrition.nutrient_details`** (gemessen 2026-08-29, Bestand
// nutzerunabhaengig): **27 Einzelfettsaeuren** (`F10:0` … `F24:0`)
// **und `OLSAC`.**
//
// `[read]` **Sachlich harmlos:** `F18:1CN9` braucht keinen Text ueber
// Mangelerscheinungen — die Fettsaeure wird als Bestandteil gemessen,
// nicht als Naehrstoff mit eigenem Bedarf. **Aber die Kachel darf
// nicht leer erscheinen**, sonst liest sich das Fehlen wie ein
// Versaeumnis.
//
// `[cmd]` **Kein Detailtext haengt in der Luft** — 0 Zeilen ohne
// Eintrag in `nutrient_defs`.
//
// ══ ZUSTAND 2: KEIN UEBERDOSIERUNGSTEXT ═════════════════════════════
//
// `[cmd]` **`excess_de` steht bei 41 von 110 Zeilen.** `[read]` Der
// Auftrag fragt, ob die 41 die richtigen sind — **die Probe ist das
// `UL`:** ein Naehrstoff mit Obergrenze und ohne
// Ueberdosierungstext ist eine Luecke, einer ohne Obergrenze nicht.
//
// `[cmd]` **Gemessen: 17 Naehrstoffe fuehren ein `UL`, 15 davon
// haben `excess_de`.** **Zwei fehlen: `FD` (Fluorid) und `FOLAC`
// (Folsaeure, synthetisch).**
//
// `[cmd]` **Umgekehrt tragen 26 einen `excess_de` OHNE `UL`** — das
// ist kein Fehler: ein Text ueber zu viel Koffein ist nuetzlich, auch
// wenn EFSA keine Obergrenze fuehrt.
//
// `[read]` **Deshalb unterscheidet die Anzeige zwei Faelle:** „keine
// Obergrenze bekannt" (kein `UL`) und „Text fehlt" (`UL` vorhanden,
// `excess_de` leer). **Der zweite ist ein Befund, der erste nicht.**

import type { Erklaertext } from './reference-assessment-read'

/** Was die Erklaerkachel zeigt. */
export type Erklaerlage =
  | 'text_da'
  /** Kein Eintrag in `nutrient_details` — 27 Fettsaeuren und OLSAC. */
  | 'kein_eintrag'

export function erklaerlageVon(e: Erklaertext | undefined): Erklaerlage {
  return e ? 'text_da' : 'kein_eintrag'
}

/**
 * Der Satz, wenn es keinen Detailtext gibt.
 *
 * `[read]` **Er sagt, WARUM** — nicht bloss dass etwas fehlt.
 * `[cmd]` Die 28 sind fast ausschliesslich Einzelfettsaeuren; die
 * Unterscheidung steht am Code, nicht an einer Liste, damit ein
 * neuer Fettsaeurecode sie mitbekommt.
 */
export function ohneEintragSatz(code: string): string {
  if (istEinzelfettsaeure(code)) {
    return 'Für einzelne Fettsäuren gibt es keinen eigenen Erklärtext — '
      + 'sie werden als Bestandteil des Fettprofils gemessen, '
      + 'nicht als Nährstoff mit eigenem Bedarf.'
  }
  return 'Für diesen Nährstoff ist kein Erklärtext hinterlegt. '
    + 'Das ist keine Aussage über seine Bedeutung.'
}

/**
 * `[cmd]` Die 27 Codes folgen alle dem Muster `F<Zahl>` — `F4:0`,
 * `F18:1CN9`, `F22:5CN3`. `[read]` **Am Muster erkannt, nicht an
 * einer Liste:** eine Liste veraltet beim naechsten Import.
 */
export function istEinzelfettsaeure(code: string): boolean {
  return /^F\d/.test(code)
}

// ── Die Ueberdosierung ───────────────────────────────────────────

export type UeberdosisLage =
  /** Text vorhanden. */
  | 'text_da'
  /** Kein `UL` gefuehrt — kein Text noetig. */
  | 'keine_obergrenze'
  /** `UL` vorhanden, Text fehlt — das ist eine Luecke. */
  | 'text_fehlt'

/**
 * `[read]` **Die Probe ist das `UL`, nicht die Anwesenheit des
 * Textes.** Wer nur auf `excess_de === null` prueft, meldet 69
 * Luecken statt zwei.
 */
export function ueberdosisLageVon(
  text: string | null, hatObergrenze: boolean,
): UeberdosisLage {
  if (text) return 'text_da'
  return hatObergrenze ? 'text_fehlt' : 'keine_obergrenze'
}

export const UEBERDOSIS_SATZ: Record<Exclude<UeberdosisLage, 'text_da'>, string> = {
  keine_obergrenze:
    'Für diesen Nährstoff ist keine Obergrenze hinterlegt. '
    + 'Das heißt nicht, dass beliebig viel unbedenklich ist.',
  text_fehlt:
    'Es gibt eine Obergrenze, aber keinen Text dazu. '
    + 'Die Zahl steht oben bei den Referenzen.',
}

// ── Die Tagesdosis-Angaben ───────────────────────────────────────

/**
 * Ob der Sportlerwert eine eigene Aussage traegt.
 *
 * `[cmd]` **`rda_athlete_text` steht bei allen 110 Zeilen** — aber
 * oft als `Standard`. `[read]` **Dann ist er kein zweiter Wert,
 * sondern die Auskunft, dass es keinen gibt.** Ihn danebenzustellen
 * wie eine eigene Empfehlung waere irrefuehrend.
 *
 * `[cmd]` Bei Vitamin A steht `Standard`, bei Niacin `20mg` gegen
 * `16mg (M), 14mg (F)`.
 */
export function athletWertEigen(
  athlet: string | null, standard: string | null,
): boolean {
  if (!athlet) return false
  const a = athlet.trim().toLowerCase()
  if (a === 'standard' || a === 'n/a' || a === '-') return false
  return a !== (standard ?? '').trim().toLowerCase()
}

export const ATHLET_GLEICH_SATZ =
  'Für Sportler gilt derselbe Wert.'

/**
 * Die Kacheln in ihrer Reihenfolge.
 *
 * `[cmd]` **Uebernommen aus dem Mockup**
 * (`module-nutrition-nutrients.jsx:780-800`): erst was es tut, dann
 * die zwei Karten „zu wenig" und „zu viel" nebeneinander, dann die
 * Quellen als nummerierte Liste.
 *
 * `[read]` **Die Reihenfolge ist nicht beliebig:** wer eine Zeile
 * aufklappt, will zuerst wissen, wofuer der Naehrstoff gut ist —
 * die Warnungen danach.
 */
export const KACHEL_ORDNUNG = [
  'funktion', 'mangel_ueberschuss', 'dosis', 'quellen',
  'wechselwirkungen', 'tipp', 'detail', 'beleg',
] as const
