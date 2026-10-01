// Die Zielrate in zwei Einheiten — G-565, E-83. **Server-frei.**
//
// ══ WAS E-83 ENTSCHIEDEN HAT ═══════════════════════════════════════
//
// **Tom, 2026-09-30, 17:45:** *„das soll doch ein user entscheiden,
// manchmal ist es klarer mit prozenten zu arbeiten und manchmal
// easier mit direkt kcal."*
//
// `[read]` **Es ist keine Entscheidung ueber DIE Einheit, sondern
// ueber die Zustaendigkeit** — beide stehen offen, der Nutzer waehlt.
//
// `[cmd]` **Gespeichert wird die RATE**
// (`goal_phases.zielrate_pct_kg_woche numeric(5,3)`), nicht der
// Kilokalorienbetrag:
//
//     0,25 %/Woche  bei 83,74 kg  =  +230,3 kcal/Tag
//     0,25 %/Woche  bei 60,00 kg  =  +165,0 kcal/Tag
//
// `[read]` **Dieselbe Absicht, zwei Zahlen.** Eine gespeicherte
// Kilokalorienzahl waere beim naechsten Wiegen falsch, ohne dass sich
// die Absicht geaendert haette.
//
// ══ DIE RUNDUNG MUSS DER DATENBANK FOLGEN ══════════════════════════
//
// `[cmd]` **`goals.kcal_delta_aus_zielrate` lautet** (aus `prosrc`
// gelesen, 2026-10-01):
//
//     SELECT round((11 * p_zielrate_pct_kg_woche
//                      * p_body_weight_kg)::numeric, 1);
//
// `[cmd]` **`Math.round` und Postgres `round` sind NICHT gleich.**
// **Gemessen an acht Faellen — einer wich ab:**
//
//     Rate -2,5 bei 55,5 kg  ->  roh -1526,25
//       Postgres round(…, 1)   = -1526,3   (von Null WEG)
//       Math.round(-15262,5)/10 = -1526,2   (nach +unendlich)
//
// `[read]` **Postgres rundet die Haelfte von der Null weg, JavaScript
// nach oben** — bei negativen Werten, also beim Abnehmen, laufen sie
// auseinander. `[cmd]` **Solche Faelle gibt es reichlich** (z. B.
// -2,5 bei 40,1 kg, -2,499 bei 50,0 kg), **nur nicht bei den drei
// Testgewichten, mit denen die Formel bisher geprueft wurde.**
//
// `[read]` **Deshalb rundet diese Datei wie die Datenbank**, und eine
// Zusicherung haelt beide Wege gegeneinander.

/** Die zwei Einheiten, zwischen denen der Nutzer waehlt. */
export const EINHEITEN = ['prozent', 'kcal'] as const
export type Rateneinheit = typeof EINHEITEN[number]

/** `[cmd]` **Der Faktor aus E-1** — 7700 kcal/kg, auf die Woche. */
export const E1_FAKTOR = 11

/** `[cmd]` **`numeric(5,3)`** — drei Nachkommastellen, die Grenze. */
export const RATE_STELLEN = 3
/** `[cmd]` **`round(…, 1)` im Rumpf der Datenbankfunktion.** */
export const KCAL_STELLEN = 1

/**
 * Kaufmaennisch runden, wie Postgres.
 *
 * `[read]` **Die Haelfte geht von der Null WEG** — `-0,5` wird `-1`,
 * nicht `0`. **`Math.round` macht daraus `0`**, und genau da gingen
 * die zwei Wege auseinander.
 */
export function rundeWieDb(wert: number, stellen: number): number {
  if (!Number.isFinite(wert)) return NaN
  const f = 10 ** stellen
  const x = wert * f
  // `[read]` **Ueber den Betrag runden, Vorzeichen danach** — so
  // landet die Haelfte immer aussen.
  //
  // `[read]` **Das `Number.EPSILON`-Glied faengt die Binaerdarstellung
  // ab:** `11 * 0.271 * 83.74` ergibt in `double` nicht genau
  // `249,6…`, und ohne den Zuschlag kippt ein Wert, der mathematisch
  // genau auf der Haelfte liegt, nach unten.
  const gerundet = Math.round(Math.abs(x) + Number.EPSILON * Math.abs(x))
  return (x < 0 ? -gerundet : gerundet) / f
}

/**
 * Kilokalorien je Tag aus der Rate — E-1, Hinrichtung.
 *
 *     kcal/Tag = 11 × Rate(% KG/Woche) × Gewicht(kg)
 *
 * `[cmd]` **Dieselbe Zahl wie `goals.kcal_delta_aus_zielrate`** —
 * eine Zusicherung haelt beide gegeneinander.
 *
 * @returns `null`, wenn Rate oder Gewicht fehlt.
 */
export function kcalAusRate(
  rate: number | null | undefined,
  gewichtKg: number | null | undefined,
): number | null {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) return null
  if (gewichtKg === null || gewichtKg === undefined
      || !Number.isFinite(gewichtKg)) return null
  return rundeWieDb(E1_FAKTOR * rate * gewichtKg, KCAL_STELLEN)
}

/**
 * Die Rate aus Kilokalorien — E-1, Rueckrichtung.
 *
 *     Rate = kcal/Tag / (11 × Gewicht(kg))
 *
 * `[read]` **Auf `numeric(5,3)` gerundet** — mehr nimmt die Spalte
 * nicht an, und eine ungerundete Zahl wuerde beim Schreiben still
 * gekuerzt. **Lieber hier sichtbar runden als dort unsichtbar.**
 *
 * `[read]` **Ohne Gewicht keine Rate** — kcal allein sagt nichts
 * ueber die Absicht.
 */
export function rateAusKcal(
  kcal: number | null | undefined,
  gewichtKg: number | null | undefined,
): number | null {
  if (kcal === null || kcal === undefined || !Number.isFinite(kcal)) return null
  if (gewichtKg === null || gewichtKg === undefined
      || !Number.isFinite(gewichtKg) || gewichtKg === 0) return null
  return rundeWieDb(kcal / (E1_FAKTOR * gewichtKg), RATE_STELLEN)
}

/**
 * Wie weit driftet ein Hin- und Rueckweg?
 *
 * `[read]` **Der Auftrag A3: „kcal eingeben, Rate lesen, wieder
 * anzeigen — dieselbe Kilokalorienzahl, kein Rundungsverlust, der
 * sich aufschaukelt."**
 *
 * `[cmd]` **Ein Verlust ist unvermeidlich** — `numeric(5,3)` kann
 * nicht jede Kilokalorienzahl darstellen. **Messbar ist, ob er
 * BEGRENZT bleibt:** eine Rate hat drei Stellen, ein Schritt von
 * `0,001` sind `11 × 0,001 × Gewicht` kcal. **Bei 80 kg: 0,88 kcal.**
 *
 * `[read]` **Deshalb ist die Grenze die halbe Schrittweite**, und
 * der zweite Durchgang aendert nichts mehr — das ist die eigentliche
 * Zusage.
 */
export function kcalRueckweg(
  kcal: number, gewichtKg: number,
): { rate: number | null; zurueck: number | null; abweichung: number | null } {
  const rate = rateAusKcal(kcal, gewichtKg)
  const zurueck = kcalAusRate(rate, gewichtKg)
  return {
    rate,
    zurueck,
    abweichung: zurueck === null ? null : rundeWieDb(zurueck - kcal, 4),
  }
}

/**
 * Die groesste Abweichung, die der Rueckweg haben kann.
 *
 * `[cmd]` **Eine halbe Rateneinheit, in kcal umgerechnet:**
 * `11 × 0,0005 × Gewicht`. `[read]` **Mehr waere ein Fehler, weniger
 * ist Glueck.**
 */
export function maxAbweichungKcal(gewichtKg: number): number {
  return rundeWieDb(E1_FAKTOR * 0.5 * 10 ** -RATE_STELLEN * gewichtKg, 4)
}

/** Der Wert in der gewaehlten Einheit — zum Anzeigen. */
export function inEinheit(
  rate: number | null, gewichtKg: number | null, einheit: Rateneinheit,
): number | null {
  return einheit === 'prozent' ? rate : kcalAusRate(rate, gewichtKg)
}

/** Was der Nutzer eingibt, zurueck auf die gespeicherte Rate. */
export function ausEinheit(
  wert: number | null, gewichtKg: number | null, einheit: Rateneinheit,
): number | null {
  if (einheit === 'prozent') {
    return wert === null || !Number.isFinite(wert)
      ? null
      : rundeWieDb(wert, RATE_STELLEN)
  }
  return rateAusKcal(wert, gewichtKg)
}

/** Das Einheitenzeichen. */
export const EINHEIT_ZEICHEN: Record<Rateneinheit, string> = {
  prozent: '% KG/Woche',
  kcal: 'kcal/Tag',
}
