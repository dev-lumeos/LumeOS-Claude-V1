// ════════════════════════════════════════════════════════════════════
// DIE SUPPLEMENT-TAGESBILANZ — G-275
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30.
//
// ══ DIE UNTERSCHEIDUNG, DIE NICHT VERLOREN GEHEN DARF ═══════════════
//
// `[cmd]` **Gemessen am 2026-08-30 auf `dev@lumeos.app`:** 744
// Einnahmen, **564 davon ohne belegte Naehrstoffmenge** (der Auftrag
// nannte 513 — nachgemessen sind es 564; die Abweichung ist gemeldet,
// nicht angepasst).
//
// `[cmd]` **Der Nachweistag aus dem Auftrag stimmt genau:**
// `supplement_nutrient_intake_for_day(dev, 2026-08-19)` liefert
// **FAPUN3 = 2,000 g bei 4 Einnahmen — 1 belegt, 3 unbekannt.**
//
// `[read]` **Codex hat die Ehrlichkeit in die Funktion gebaut:** die
// drei unbekannten zaehlen NICHT als 0 mg, sie stehen als eigene
// Zahl daneben. **Wenn die Anzeige nur `total_amount` zeigt, ist
// genau das unterwegs verloren** — dann sieht 2 g aus wie eine
// vollstaendige Messung.
//
// ══ DIESELBE FORM WIE G-239, ANDERE QUELLE ══════════════════════════
//
// `[read]` **Die Mikronaehrstoff-Ansicht trennt seit G-239
// `unvollstaendig` von `gedeckt`.** Hier ist es dieselbe Klasse:
// **eine Summe mit unbelegten Posten ist eine Untergrenze, keine
// Menge.**
//
// ══ E-35: KEINE SUMMIERUNG MIT NUTRITION ════════════════════════════
//
// `[read]` **Diese Datei kennt `nutrition.daily_summary` nicht.**
// Was das Supplement beitraegt, steht hier; was das Essen beitraegt,
// steht dort. **Die Summe gehoert ins Dashboard und kommt spaeter.**
//
// `[cmd]` **Der bisherige Entwurf tat genau das Verbotene:** die
// Attrappe „Gap analysis" addierte `FOOD` und `SUPPS` zu `TOTAL` und
// verglich mit der RDA. **Sie wird ersetzt, nicht ergaenzt.**

/** Eine Zeile aus `supplements.supplement_nutrient_intake_for_day`. */
export type BilanzZeile = {
  nutrient_code: string
  nutrient_unit: string
  total_amount: number
  taken_log_count: number
  skipped_log_count: number
  /** Einnahmen mit belegter Menge — sie stecken in `total_amount`. */
  mapped_taken_log_count: number
  /** Einnahmen ohne belegte Menge — sie fehlen in der Summe. */
  unmapped_taken_log_count: number
}

/**
 * Wie belastbar eine Zeile ist.
 *
 * `[read]` **Drei Zustaende, nicht zwei** — dieselbe Dreiteilung wie
 * in G-239 und G-208:
 *
 *     belegt          jede genommene Einnahme traegt eine Menge
 *     untergrenze     ein Teil ist belegt, der Rest nicht
 *     unbekannt       nichts ist belegt; die Summe waere 0 und
 *                     genau das waere die falsche Aussage
 */
export type BilanzLage = 'belegt' | 'untergrenze' | 'unbekannt'

export function lageVon(z: BilanzZeile): BilanzLage {
  if (z.mapped_taken_log_count === 0) return 'unbekannt'
  return z.unmapped_taken_log_count > 0 ? 'untergrenze' : 'belegt'
}

export const LAGE_TEXT: Record<BilanzLage, string> = {
  belegt: 'belegt',
  untergrenze: 'Untergrenze',
  unbekannt: 'keine Menge hinterlegt',
}

export const LAGE_FARBE: Record<BilanzLage, string> = {
  belegt: 'var(--pos)',
  // `[read]` Eine Untergrenze ist kein Fehler und keine Warnung —
  // sie ist eine unvollstaendige Messung. Grau wie `unvollstaendig`
  // in G-249, nicht gelb.
  untergrenze: 'var(--fg-dim)',
  unbekannt: 'var(--fg-dim)',
}

/**
 * Ob die Zahl ueberhaupt gezeigt werden darf.
 *
 * `[read]` **Bei `unbekannt` ist `total_amount` null oder 0** — und
 * eine 0 zu zeigen hiesse „nichts eingenommen", obwohl genommen
 * wurde. **Dieselbe Regel wie `zeigtProzent` in G-239.**
 */
export function zeigtMenge(lage: BilanzLage): boolean {
  return lage !== 'unbekannt'
}

/**
 * Der Satz je Zeile — er nennt die Einnahmen, nicht nur die Menge.
 *
 * `[cmd]` **Der gemessene Fall:** FAPUN3, 4 genommen, 1 belegt,
 * 3 unbekannt. `[read]` **Ohne diesen Satz sieht „2 g" aus wie das
 * Ergebnis von vier Einnahmen.**
 */
export function herkunftSatz(z: BilanzZeile): string {
  const l = lageVon(z)
  if (l === 'unbekannt') {
    return z.taken_log_count === 1
      ? '1 Einnahme, für die keine Nährstoffmenge hinterlegt ist.'
      : `${z.taken_log_count} Einnahmen, für die keine Nährstoffmenge hinterlegt ist.`
  }
  if (l === 'belegt') {
    return z.mapped_taken_log_count === 1
      ? 'aus 1 belegten Einnahme'
      : `aus ${z.mapped_taken_log_count} belegten Einnahmen`
  }
  return `aus ${z.mapped_taken_log_count} von ${z.taken_log_count} Einnahmen — `
    + `für ${z.unmapped_taken_log_count} ist keine Menge hinterlegt.`
}

/**
 * Die Zusammenfassung ueber alle Zeilen eines Tages.
 *
 * `[read]` **Sie zaehlt Zeilen, nicht Mengen** — Mengen verschiedener
 * Naehrstoffe zu addieren waere sinnlos.
 */
export type BilanzUeberblick = {
  naehrstoffe: number
  belegt: number
  untergrenze: number
  unbekannt: number
  /** Einnahmen ohne belegte Menge, ueber alle Zeilen. */
  offeneEinnahmen: number
}

export function ueberblickVon(zeilen: readonly BilanzZeile[]): BilanzUeberblick {
  const u: BilanzUeberblick = {
    naehrstoffe: zeilen.length, belegt: 0, untergrenze: 0,
    unbekannt: 0, offeneEinnahmen: 0,
  }
  for (const z of zeilen) {
    u[lageVon(z)] += 1
    u.offeneEinnahmen += z.unmapped_taken_log_count
  }
  return u
}

/**
 * Der Satz ueber die Datenlage — G-275 verlangt ihn ausdruecklich.
 *
 * **Der Auftrag:** *,,`supplement_nutrients` traegt 17 Substanzen —
 * das ist wenig, und die Anzeige muss es sagen, statt eine leere
 * Tabelle zu zeigen."*
 *
 * `[cmd]` **Gemessen: 17 Zeilen in der Bruecke, 564 von 744
 * Einnahmen ohne Menge.**
 */
export function datenlageSatz(
  belegteSubstanzen: number, offeneEinnahmen: number,
): string {
  if (belegteSubstanzen === 0) {
    return 'Für keine deiner Substanzen ist eine Nährstoffmenge hinterlegt — '
      + 'deshalb bleibt diese Bilanz leer.'
  }
  if (offeneEinnahmen === 0) return ''
  return `Für ${belegteSubstanzen} Substanzen sind Nährstoffmengen hinterlegt. `
    + 'Einnahmen ohne hinterlegte Menge fehlen in den Summen — sie zählen '
    + 'nicht als null.'
}

/**
 * Der Leerzustand.
 *
 * `[read]` **Ein Tag ohne Einnahme ist etwas anderes als ein Tag
 * ohne hinterlegte Mengen** — beides waere sonst dieselbe leere
 * Flaeche.
 */
export const KEINE_EINNAHMEN_SATZ =
  'An diesem Tag ist keine Einnahme protokolliert.'
