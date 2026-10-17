// Zielrate und Kilokalorien — E-1, G-565. **Server-frei.**
//
// ══ G-659: KEINE WAHL MEHR ════════════════════════════════════════
//
// `[read]` **Tom, 2026-10-17 (Variante b):** die Zielrate bleibt in Prozent wie im
// Entwurf; die %/kcal-Wahl aus E-83 faellt weg (Schalter, `inEinheit`/`ausEinheit`,
// Rueckweg, Schreibweg). Die Umrechnung selbst bleibt — `kcalAusRate` und
// `rateAusKcal` rechnen fuer Phasenregeln, Zielrechnung und Anpassung.
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
 *
 * `[cmd]` **G-573: `<= 0`, nicht `=== 0`.** Die zweite Fassung in
 * `anpassung.ts` prueft seit G-520 auf `<= 0`; **diese prueft nur auf
 * `0`, und ein negatives Gewicht dreht das Vorzeichen** — `-100 kcal`
 * bei `-80 kg` ergab `+0,114`. **Beim Zusammenlegen wandert die
 * schaerfere Pruefung hierher**, sonst verliert der Umbau still eine
 * Zusicherung.
 */
export function rateAusKcal(
  kcal: number | null | undefined,
  gewichtKg: number | null | undefined,
): number | null {
  if (kcal === null || kcal === undefined || !Number.isFinite(kcal)) return null
  if (gewichtKg === null || gewichtKg === undefined
      || !Number.isFinite(gewichtKg) || gewichtKg <= 0) return null
  return rundeWieDb(kcal / (E1_FAKTOR * gewichtKg), RATE_STELLEN)
}

// ponytail: G-659 — nur noch fuer `einheiten-schalter.tsx` und `einheit-speichern.ts`, die beide
// ohne Aufrufer sind und auf Toms Loeschung warten (Sperre). Faellt mit ihnen weg.
export const EINHEITEN = ['prozent', 'kcal'] as const
export type Rateneinheit = typeof EINHEITEN[number]
export const EINHEIT_ZEICHEN: Record<Rateneinheit, string> = { prozent: '% KG/Woche', kcal: 'kcal/Tag' }
