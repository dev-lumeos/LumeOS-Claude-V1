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

// ══ G-554/A3: die SECHS Knoepfe des Entwurfs ═══════════════════════
//
// **Tom, 2026-09-29:** *,,konzentriere dich nun zuerst auf die subnav
// Goals dass das nach vorgabe ist."*
//
// `[cmd]` **Der Entwurf zeigt sechs Knoepfe**
// (`module-goals.jsx:696-703`), **der CHECK kennt vier Werte.**
// `[cmd]` **G-537 nahm die vier und meldete die Abweichung** — das
// war richtig, **loest aber ,,nach Vorgabe" nicht ein.**
//
// `[read]` **Die Bruecke ist `subtype`** — die Spalte hat KEINEN
// CHECK (gemessen 2026-09-30) und traegt fuenf gelebte Werte.
// **Jeder Entwurfsknopf ist damit ein PAAR aus Art und Unterart.**
//
// ── Die Zuordnung, und wo sie unsicher ist ────────────────────────
//
// `[cmd]` **Vier Knoepfe sind eindeutig**, weil der Seed den
// Untertyp schon so fuehrt:
//
//     body_comp    -> body_composition            (kein subtype:
//                                                  die Art SELBST)
//     strength     -> performance / strength      2 Zeilen im Seed
//     performance  -> performance / training_capacity  1 Zeile
//     habit        -> lifestyle / cardio_frequency     2 Zeilen
//
// `[cmd]` **Zwei sind es NICHT** — und der Auftrag verlangt, sie zu
// melden statt still zu waehlen:
//
//     weight   Gewicht ist eine MESSGROESSE, keine Absicht. Sowohl
//              `cut` als auch `gain_muscle` sind Gewichtsziele, und
//              beide liegen unter `body_composition`. **Hier
//              vorgeschlagen als `body_composition` ohne
//              vorbelegten Untertyp** — die Richtung ergibt sich
//              erst aus Ist- und Zielwert.
//              **Offen: soll `weight` ein eigener `subtype` sein?**
//
//     custom   ,,Custom" ist die Abwesenheit einer Einordnung. Der
//              CHECK erlaubt keinen freien `goal_type`.
//              **Hier vorgeschlagen als `lifestyle` ohne Untertyp**,
//              weil das die weiteste der vier Arten ist.
//              **Offen: ist das die richtige Art, oder braucht
//              `custom` einen eigenen CHECK-Wert?**
//
// `[read]` **Beide Vorschlaege sind als solche gekennzeichnet**
// (`unsicher: true`) — **eine Anzeige, die eine offene Frage als
// entschieden darstellt, ist eine Falschaussage.**

/** Ein Knopf des Entwurfs, uebersetzt in die Datenbank. */
export type Zielknopf = {
  /** Die Kennung des Entwurfs — `module-goals.jsx:696-703`. */
  id: string
  label: string
  /** Was in `goal_type` landet. */
  art: ZielArt
  /** Was in `subtype` landet, oder `null`. */
  unterart: string | null
  /**
   * `true`, wenn die Zuordnung ein Vorschlag ist und keine
   * gemessene Entsprechung hat.
   */
  unsicher: boolean
}

/**
 * Die sechs Knoepfe, in der Reihenfolge des Entwurfs.
 *
 * `[cmd]` **`module-goals.jsx:696-703`**, dieselbe Folge, dieselben
 * Beschriftungen.
 */
export const ZIELKNOEPFE: readonly Zielknopf[] = [
  { id: 'body_comp', label: 'Body composition',
    art: 'body_composition', unterart: null, unsicher: false },
  { id: 'weight', label: 'Weight',
    art: 'body_composition', unterart: null, unsicher: true },
  { id: 'strength', label: 'Strength PR',
    art: 'performance', unterart: 'strength', unsicher: false },
  { id: 'performance', label: 'Performance',
    art: 'performance', unterart: 'training_capacity', unsicher: false },
  { id: 'habit', label: 'Habit',
    art: 'lifestyle', unterart: 'cardio_frequency', unsicher: false },
  { id: 'custom', label: 'Custom',
    art: 'lifestyle', unterart: null, unsicher: true },
] as const

/** Der Knopf zu einer Kennung. */
export function zielknopf(id: string): Zielknopf | null {
  return ZIELKNOEPFE.find(k => k.id === id) ?? null
}

/**
 * Traegt dieser Knopf eine Ernaehrungsstrategie? — G-554/A1.
 *
 * `[read]` **Nur `body_composition`.** `[cmd]` **Der Katalog
 * `goal_strategies` fuehrt TDEE-Faktor, Zielrate und Makros** — ein
 * Bankdrueck-Ziel hat davon nichts. **Die Wahl erscheint deshalb
 * genau dort, wo sie etwas bedeutet.**
 */
export function traegtStrategie(k: Zielknopf | null): boolean {
  return k?.art === 'body_composition'
}
