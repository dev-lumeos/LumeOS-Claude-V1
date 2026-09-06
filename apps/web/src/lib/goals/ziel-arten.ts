/**
 * Die Zielarten — eine Quelle, G-354.
 *
 * ## Warum es diese Datei gibt
 *
 * `[cmd]` **Gemessen am 2026-09-06: das *New goal*-Modal fuehrte eine
 * eigene Liste** (`modale.tsx:117`), **uebernommen aus dem Altrepo**
 * (`module-goals.jsx:694-744`):
 *
 *     body_comp · weight · strength · performance · habit · custom
 *
 * `[cmd]` **`body_comp` kennt die Datenbank nicht.** **Der CHECK
 * `user_goals_goal_type_check` laesst vier Werte zu:**
 * `body_composition`, `performance`, `health`, `lifestyle`.
 *
 * `[read]` **Dieselbe Klasse wie G-339** — eine Liste, die niemand
 * mitzaehlt, weil sie in einem Fenster steht. **Und wie dort ein
 * Wert, den der CHECK ablehnen wuerde.**
 *
 * `[read]` **Deshalb steht sie hier und nicht im Modal:** wer eine
 * Auswahl braucht, holt sie von hier. **Keine siebte Liste.**
 *
 * ## Die zweite Ebene
 *
 * `[cmd]` **`user_goals.subtype` hat KEINEN CHECK**, traegt aber
 * fuenf gelebte Werte, keinen davon `null` (G-352, 11 Zeilen):
 * `cut`, `gain_muscle` unter `body_composition`; `strength`,
 * `training_capacity` unter `performance`; `cardio_frequency`
 * unter `lifestyle`.
 *
 * `[read]` **Sie stehen hier als gemessener Bestand, nicht als
 * Vorschrift** — ob `subtype` einen CHECK bekommt, ist offen
 * (G-352). **Bis dahin ist diese Zuordnung eine Anzeigehilfe.**
 */

/**
 * Die vier `goal_type`-Werte.
 *
 * `[cmd]` **Genau die des CHECK `user_goals_goal_type_check`**,
 * gemessen am 2026-09-06.
 */
export const ZIEL_ARTEN = [
  'body_composition', 'performance', 'health', 'lifestyle',
] as const

export type ZielArt = (typeof ZIEL_ARTEN)[number]

/** Die deutschen Namen — die Kategorie, nicht das einzelne Ziel. */
export const ZIEL_ART_TEXT: Record<ZielArt, string> = {
  body_composition: 'Körperzusammensetzung',
  performance: 'Leistung',
  health: 'Gesundheit',
  lifestyle: 'Lebensstil',
}

/**
 * Die Unterarten je Zielart — der gemessene Bestand.
 *
 * `[read]` **Kein CHECK dahinter.** `[cmd]` **Was hier steht, wurde
 * am 2026-09-06 in `goals.user_goals` gezaehlt** — nicht erfunden
 * und nicht aus einer Spec uebernommen.
 */
export const ZIEL_UNTERARTEN: Record<ZielArt, readonly string[]> = {
  body_composition: ['cut', 'gain_muscle'],
  performance: ['strength', 'training_capacity'],
  lifestyle: ['cardio_frequency'],
  // `[cmd]` **`health` traegt heute keine Unterart** — null Zeilen.
  // `[read]` **Eine leere Liste ist ehrlicher als ein erfundener
  // Wert** (C-378).
  health: [],
}

/** Die Auswahlliste fuer ein Pulldown oder eine Knopfreihe. */
export function zielArtAuswahl(): Array<{ code: ZielArt; label: string }> {
  return ZIEL_ARTEN.map(code => ({ code, label: ZIEL_ART_TEXT[code] }))
}

/**
 * Die aktiven Plaetze — G-354.
 *
 * `[cmd]` **Die Drei steht im CHECK, nicht in einer Annahme:**
 * `user_goals_check1` = `status <> 'active' OR (priority >= 1 AND
 * priority <= 3)`, **durchgesetzt vom eindeutigen Index
 * `uq_user_goals_active_slot` auf `(user_id, priority) WHERE status
 * = 'active'`.**
 *
 * `[read]` **Sie ist damit entschieden, nicht offen** — was fehlt,
 * ist die Oberflaeche, die einen freien Platz waehlt.
 */
export const AKTIVE_PLAETZE = 3

/** `1..10` — der zweite CHECK, fuer nicht aktive Ziele. */
export const PRIORITAET_MAX = 10
