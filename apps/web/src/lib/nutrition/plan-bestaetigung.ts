// ════════════════════════════════════════════════════════════════════
// DIE REGELN DES BESTAETIGENS — G-274
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30.
//
// ══ DIE FRAGE VOR DEM BAUEN, UND IHRE ANTWORT ═══════════════════════
//
// **Der Auftrag:** *,,`actual_meal_id` verweist auf
// `nutrition.meals`. Ein bestaetigter Eintrag ist eine gegessene
// Mahlzeit — also entsteht beim Bestaetigen auch ein Tagebucheintrag.
// Miss, ob das gemeint ist."*
//
// `[cmd]` **`SPEC_03_USER_FLOWS` Flow 4 sagt es woertlich**, Case 1
// Schritt 6 und 7:
//
//     6. Mahlzeit wird erstellt (Meal + MealItems mit
//        eingefrorenen Naehrstoffen)
//     7. Ghost Entry -> confirmed (oder deviated wenn dkcal > 20%)
//     8. MealPlanLog wird geschrieben
//
// `[read]` **Also ja, und in dieser Reihenfolge:** erst die Mahlzeit,
// dann das Log — das Log verweist auf die Mahlzeit, nicht umgekehrt.
// **Ein Log ohne Tagebucheintrag waere eine Zusage, die die Bilanz
// nicht kennt.**
//
// `[cmd]` **Und deshalb der Weg aus G-272**, nicht ein zweiter:
// `createMeal` und `addMealItem` schreiben die eingefrorenen
// Naehrwerte bereits — genau, was Schritt 6 verlangt.
//
// ══ DIE SCHWELLE STAMMT AUS DEM FLOW, NICHT VON MIR ═════════════════
//
// `[cmd]` **Flow 4, Case 1 Schritt 7 und Case 2 Schritt 4b:**
// *,,deviated wenn dkcal > 20%"*. `[read]` **Keine erfundene Zahl** —
// sie steht zweimal in der Spec.

/** Die vier Zustaende, wie der CHECK sie fuehrt. */
export const LOG_STATUS = ['pending', 'confirmed', 'deviated', 'skipped'] as const
export type LogStatus = (typeof LOG_STATUS)[number]

/** `mealcam` oder `manual` — der CHECK erlaubt nur diese zwei. */
export const BESTAETIGUNGSART = ['mealcam', 'manual'] as const
export type Bestaetigungsart = (typeof BESTAETIGUNGSART)[number]

/**
 * Ab wann eine Abweichung eine Abweichung ist.
 *
 * `[cmd]` **Aus `SPEC_03_USER_FLOWS` Flow 4** — dort zweimal genannt.
 * `[read]` **Nicht gerundet, nicht angepasst:** wer sie aendert,
 * aendert eine Produktentscheidung.
 */
export const ABWEICHUNG_AB_PROZENT = 20

/**
 * Welcher Zustand aus geplanter und tatsaechlicher Menge folgt.
 *
 * `[read]` **Eine Abweichung ist eine ANDERE Mahlzeit als die
 * geplante — nicht keine.** Wer nichts isst, ueberspringt; das ist
 * ein eigener Zustand.
 *
 * `[read]` **`null` bei geplant heisst: nicht vergleichbar.** Dann
 * gilt `confirmed`, weil eine Abweichung ohne Bezugsgroesse keine
 * Aussage waere.
 */
export function zustandVon(
  geplantKcal: number | null, tatsaechlichKcal: number | null,
): { status: 'confirmed' | 'deviated'; kcal: number | null; pct: number | null } {
  if (geplantKcal === null || tatsaechlichKcal === null || geplantKcal <= 0) {
    return { status: 'confirmed', kcal: null, pct: null }
  }
  const kcal = Math.round((tatsaechlichKcal - geplantKcal) * 10) / 10
  const pct = Math.round((kcal / geplantKcal) * 1000) / 10
  return {
    status: Math.abs(pct) > ABWEICHUNG_AB_PROZENT ? 'deviated' : 'confirmed',
    kcal, pct,
  }
}

/**
 * Ob die Felder zum Zustand passen — der CHECK in einer Funktion.
 *
 * `[cmd]` **Der Datenbank-CHECK verlangt es genau so:**
 *
 *     pending    actual_meal_id, confirmation_mode, confirmed_at,
 *                skipped_at  ALLE null
 *     confirmed  actual_meal_id, confirmation_mode, confirmed_at
 *                gesetzt; skipped_at null
 *     deviated   wie confirmed, ZUSAETZLICH deviation_kcal und
 *                deviation_pct
 *     skipped    nur skipped_at gesetzt
 *
 * `[read]` **Hier steht er ein zweites Mal, damit die Meldung aus der
 * Anwendung kommt und nicht als 500er aus der Datenbank.** **Das ist
 * keine zweite Wahrheit** — die Datenbank bleibt die Instanz, die
 * ablehnt; diese Pruefung erklaert nur vorher.
 */
export function felderPassen(
  status: LogStatus,
  f: {
    actual_meal_id: string | null
    confirmation_mode: string | null
    confirmed_at: string | null
    skipped_at: string | null
    deviation_kcal: number | null
    deviation_pct: number | null
  },
): boolean {
  const bestaetigt = f.actual_meal_id !== null
    && f.confirmation_mode !== null && f.confirmed_at !== null
  if (status === 'pending') {
    // Wie bei `skipped`: jedes Feld einzeln leer, nicht nur „nicht
    // vollstaendig bestaetigt".
    return f.actual_meal_id === null && f.confirmation_mode === null
      && f.confirmed_at === null && f.skipped_at === null
  }
  if (status === 'confirmed') {
    return bestaetigt && f.skipped_at === null
  }
  if (status === 'deviated') {
    return bestaetigt && f.skipped_at === null
      && f.deviation_kcal !== null && f.deviation_pct !== null
  }
  // skipped
  //
  // `[read]` **Hier stand `!bestaetigt`, und das war zu schwach:**
  // `bestaetigt` verlangt ALLE drei Felder, also kam eine Zeile mit
  // gesetzter `actual_meal_id` und leerem Rest durch. **Der
  // Datenbank-CHECK verlangt aber jedes Feld einzeln leer** — ein
  // ausgelassener Eintrag hat keine Mahlzeit, keine Art und keinen
  // Bestaetigungszeitpunkt. **Der eigene Test hat es gefunden.**
  return f.actual_meal_id === null && f.confirmation_mode === null
    && f.confirmed_at === null && f.skipped_at !== null
}

/**
 * Ob ein Tag rueckwirkend bestaetigt wird — Flow 4.
 *
 * `[cmd]` **Flow 4 kennt den Fall ausdruecklich:** *,,Bestaetigung
 * mit originalem `execution_date`, `confirmed_at` = jetzt."*
 *
 * `[read]` **Und es gibt kein Verfallsdatum:** *,,Ghost Entries haben
 * kein automatisches Expiry. User entscheidet jederzeit — auch
 * retroaktiv fuer vergangene Tage."* **Also keine Sperre fuer alte
 * Tage.**
 */
export function istRueckwirkend(ausfuehrung: string, heute: string): boolean {
  return ausfuehrung < heute
}

/**
 * Der Satz zum rueckwirkenden Bestaetigen.
 *
 * `[read]` **Er sagt, was mit dem Datum geschieht** — sonst koennte
 * jemand meinen, die Mahlzeit lande auf heute.
 */
export function rueckwirkendSatz(ausfuehrung: string): string {
  return `Wird auf den ${ausfuehrung} gebucht, nicht auf heute.`
}

/** Beschriftung je Zustand. */
export const STATUS_TEXT: Record<LogStatus, string> = {
  pending: 'offen',
  confirmed: 'bestätigt',
  deviated: 'abgewichen',
  skipped: 'ausgelassen',
}

export const STATUS_FARBE: Record<LogStatus, string> = {
  // `[read]` Offen ist kein Befund, sondern das Fehlen einer
  // Entscheidung — grau, nicht gelb.
  pending: 'var(--fg-dim)',
  confirmed: 'var(--pos)',
  // `[read]` Abgewichen ist keine Warnung: gegessen wurde, nur anders.
  deviated: 'var(--warn)',
  skipped: 'var(--fg-dim)',
}

/**
 * Der Satz zur Abweichung — mit Vorzeichen.
 *
 * `[read]` **„+380 kcal" und „-120 kcal" sind verschiedene Aussagen**,
 * und beide sind Abweichungen. Ein Betrag ohne Vorzeichen verliert
 * die Richtung.
 */
export function abweichungSatz(kcal: number | null, pct: number | null): string {
  if (kcal === null || pct === null) return ''
  const v = kcal > 0 ? '+' : ''
  return `${v}${Math.round(kcal)} kcal (${v}${pct} %) gegenüber dem Plan`
}
