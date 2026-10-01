// Die Waechterschwellen, relativ — G-569. **Server-frei.**
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **G-561 hat den Katalog auf Prozent umgestellt**, die
// Anwendung blieb absolut. **Gemessen in `apps/`, 2026-10-01:**
//
//     anpassung.ts:219          weightTrend > -0.1    kg/Woche
//     anpassung.ts:223          weightTrend < -1.0    kg/Woche
//     anpassung.ts:246          weightTrend > 0.75    kg/Woche
//     anpassung.ts:251          weightTrend < 0.1     kg/Woche
//     uebergangswaechter.ts:128 weightTrend < -1.0    kg/Woche
//     uebergangswaechter.ts:146 weightTrend > -0.1    kg/Woche
//     uebergangswaechter.ts:245 weightTrend > 0.75    kg/Woche
//
// `[read]` **Zwei Maßstaebe nebeneinander:** der Katalog prueft
// relativ (1,194 %), die Anwendung absolut (1,0 kg). **Bei 83,74 kg
// ist das dieselbe Grenze — bei 60 kg nicht.** Dort greift der
// Katalog bei 0,716 kg und die Anwendung erst bei 1,0.
//
// ══ DIE UMRECHNUNG KOMMT VON CODEX, NACHGERECHNET ══════════════════
//
// `[cmd]` **G-561, selbst nachgerechnet gegen 83,74 kg:**
//
//     1,00 kg / 83,74 = 1,1942 %  ->  1,194
//     0,75 kg / 83,74 = 0,8956 %  ->  0,896
//     0,50 kg / 83,74 = 0,5971 %  ->  0,597
//     0,10 kg / 83,74 = 0,1194 %  ->  0,119
//
// `[read]` **Die Strenge aendert sich NICHT** — nur der Bezug. **Wer
// die Zahl mit umstellte, aenderte zwei Sachen gleichzeitig.**
//
// ══ DIE BEZUGSGROESSE ══════════════════════════════════════════════
//
// `[cmd]` **Das letzte gueltige Gewicht AM PRUEFSTICHTAG**, nicht das
// am Phasenbeginn — **G-561/A2, von Codex gegen die Vorgabe des
// Orchestrators entschieden und begruendet:**
//
// `[read]` **Die Zielrate beschreibt die unveraenderliche Absicht der
// Phase; der Waechter bewertet einen GEGENWAERTIGEN Vorgang.** Ein
// spaeter eingetragenes Gewicht darf nicht rueckwirkend in eine
// fruehere Pruefung einfliessen.
//
// `[read]` **Fehlt am Stichtag ein Gewicht, ist das ein Hindernis** —
// kein Rueckfall auf Profil- oder Startgewicht, keine stille Null.

import { rundeWieDb } from './zielrate-einheit'

/**
 * Die Schwellen in Prozent Koerpergewicht je Woche.
 *
 * `[cmd]` **Dieselben Zahlen wie im Katalog** (`536_..._seed.sql`):
 * `1.194` fuenfmal, `0.597` einmal. `[read]` **Eine Quelle fuer
 * beide Seiten** — zwei Listen driften.
 */
export const SCHWELLE_PCT = {
  /** `[cmd]` 1,0 kg bei 83,74 kg — „weekly_loss > 1.194% BW/week". */
  verlustZuSchnell: 1.194,
  /** `[cmd]` 0,1 kg bei 83,74 kg — das Gewicht steht. */
  verlustZuLangsam: 0.119,
  /** `[cmd]` 0,75 kg bei 83,74 kg — „gain > 1.194% BW/week" liegt
   *  hoeher; **die Anwendung prueft 0,75 kg, nicht 1,0.** */
  zunahmeZuSchnell: 0.896,
  /** `[cmd]` 0,1 kg bei 83,74 kg — die Zunahme steht. */
  zunahmeZuLangsam: 0.119,
} as const

export type Schwellenname = keyof typeof SCHWELLE_PCT

/**
 * Das Gewichtstempo als Anteil des Koerpergewichts.
 *
 * `[read]` **Das Vorzeichen bleibt** — `-1,0 kg` bei `83,74 kg` ist
 * `-1,194 %`, nicht `1,194 %`. **Die Richtung ist Teil der Aussage.**
 *
 * `[cmd]` **Drei Nachkommastellen, gerundet wie die Datenbank** —
 * `rundeWieDb` aus G-565, weil `Math.round` die Haelfte nach oben
 * rundet und Postgres von der Null weg (bei negativen Werten also
 * anders).
 *
 * @returns `null`, wenn Tempo oder Gewicht fehlt.
 */
export function tempoInProzent(
  kgProWoche: number | null | undefined,
  gewichtKg: number | null | undefined,
): number | null {
  if (kgProWoche === null || kgProWoche === undefined
      || !Number.isFinite(kgProWoche)) return null
  if (gewichtKg === null || gewichtKg === undefined
      || !Number.isFinite(gewichtKg) || gewichtKg <= 0) return null
  return rundeWieDb(kgProWoche / gewichtKg * 100, 3)
}

/**
 * Die Schwelle in Kilogramm, zum Gewicht des Nutzers.
 *
 * `[read]` **Fuer den Text, nicht fuer den Vergleich** — verglichen
 * wird relativ, damit die Strenge nicht am Gewicht haengt. **A4
 * verlangt, dass die Kilogrammfassung die Grenze ZU SEINEM Gewicht
 * nennt, nicht eine pauschale Zahl.**
 */
export function schwelleInKg(
  name: Schwellenname, gewichtKg: number | null,
): number | null {
  if (gewichtKg === null || !Number.isFinite(gewichtKg) || gewichtKg <= 0) {
    return null
  }
  return rundeWieDb(SCHWELLE_PCT[name] / 100 * gewichtKg, 3)
}

/**
 * Greift die Schwelle?
 *
 * `[read]` **Verglichen wird der BETRAG** — ob jemand zu schnell
 * verliert oder zu schnell zunimmt, entscheidet die Richtung des
 * Aufrufers, nicht das Vorzeichen hier.
 *
 * `[cmd]` **`>=`, nicht `>`** — bei 83,74 kg sind 1,194 % genau
 * 0,9999 kg; mit `>` greifte 1,000 kg nicht, und die Randprobe aus
 * A3 fiele.
 *
 * @returns `null`, wenn kein Vergleich moeglich ist.
 */
export function schwelleGreift(
  name: Schwellenname,
  kgProWoche: number | null | undefined,
  gewichtKg: number | null | undefined,
): boolean | null {
  const p = tempoInProzent(kgProWoche, gewichtKg)
  if (p === null) return null
  return Math.abs(p) >= SCHWELLE_PCT[name]
}

/**
 * Liegt das Tempo UNTER der Schwelle?
 *
 * `[read]` **Die Gegenrichtung** — „das Gewicht steht" heisst, der
 * Betrag ist klein. **Nicht `!schwelleGreift`**, weil der
 * `null`-Fall erhalten bleiben muss.
 */
export function schwelleUnterschritten(
  name: Schwellenname,
  kgProWoche: number | null | undefined,
  gewichtKg: number | null | undefined,
): boolean | null {
  const p = tempoInProzent(kgProWoche, gewichtKg)
  if (p === null) return null
  return Math.abs(p) < SCHWELLE_PCT[name]
}

/**
 * Der Satz zur Schwelle, in der gewaehlten Einheit.
 *
 * `[cmd]` **A4: beide Einheiten, nach E-83** — und die
 * Kilogrammfassung nennt die Grenze **zum Gewicht des Nutzers**.
 *
 * @param einheit  Was der Nutzer gewaehlt hat (G-565).
 */
export function schwellenText(
  name: Schwellenname, gewichtKg: number | null,
  einheit: 'prozent' | 'kcal',
): string {
  const pct = SCHWELLE_PCT[name]
  if (einheit === 'prozent') return `${pct} % KG/Woche`
  const kg = schwelleInKg(name, gewichtKg)
  // `[read]` **Ohne Gewicht keine Kilogrammgrenze** — dann steht die
  // Prozentzahl da, statt einer erfundenen (E-72).
  return kg === null
    ? `${pct} % KG/Woche`
    : `${kg} kg/Woche (${pct} % bei ${gewichtKg} kg)`
}
