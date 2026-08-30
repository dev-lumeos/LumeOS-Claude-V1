// ════════════════════════════════════════════════════════════════════
// DIE DREI HERKUNFTS-FILTER — G-251
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// `[read]` **Sie sind etwas anderes als die Tag-Filter aus G-112** —
// die filtern nach Eigenschaften des Lebensmittels, **diese nach der
// Beziehung des Nutzers dazu.**
//
// ══ STAND 2026-08-30, NACH C-355 ════════════════════════════════════
//
// `[cmd]` **Zwei der drei laufen jetzt ueber `food_search`**, der
// dritte nicht — und das ist kein Rueckstand, sondern seine Natur.
//
//     bevorzugt     p_filters {"favorites": true}
//                   `[cmd]` dev: total 4.098 von 4.970
//                   ACHTUNG: NICHT die Favoritenliste. Siehe unten.
//
//     eigene        p_filters {"sources": ["custom"]}
//                   `[cmd]` dev: total 0 — `foods_custom` hat
//                   0 Zeilen. Der erwartete Leerzustand.
//
//     wie gestern   KEIN Suchfilter. `meals` + `meal_items` des
//                   Vortags sind eine eigene Liste, keine
//                   Verfeinerung der Katalogsuche.
//
// ══ WARUM „BEVORZUGT" UND NICHT „FAVORITEN" ═════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-30 fuer `dev@lumeos.app`:**
//
//     food_preference_items      1x liked|food, 3x liked|tag
//     food_preference_search_    1 boost|food
//       targets                  5.557 boost|tag
//     food_search favorites      total 4.098 (ohne Filter: 4.970)
//
// `[cmd]` **Die Funktion setzt `is_favorite = bool_or(constraint_level
// = 'boost')`** (075, Zeile 945). **Ein `boost` entsteht auch aus
// einem gemochten TAG.** Wer drei Tags mag, bekommt vier Fuenftel des
// Katalogs.
//
// `[read]` **Der Auftrag nannte „genau 1 Treffer"** — das ist die Zahl
// der `boost|food`-Zeilen, also der ausdruecklich gemochten
// Lebensmittel. **Der Filter zeigt etwas anderes**, und das ist die
// Funktion, wie sie gebaut ist, kein Fehler.
//
// `[read]` **Also heisst die Pille „Bevorzugt", nicht „Favoriten".**
// Eine Beschriftung, die 1 verspricht und 4.098 zeigt, waere die
// Falschaussage — nicht die Zahl.

/** Die drei Filter, wie G-251 sie nennt. */
export type HerkunftFilter = 'bevorzugt' | 'wie_gestern' | 'eigene'

/**
 * Die zwei, die `food_search` seit C-355 kann.
 *
 * `[read]` **`wie_gestern` steht bewusst nicht darin** — der Reiter
 * darf ihn nicht als Suchfilter schicken, sonst kaeme eine Anfrage
 * heraus, die die Funktion ignoriert, und die Liste bliebe
 * unveraendert stehen. **Ein Filter, der nichts tut, sieht aus wie
 * ein defekter.**
 */
export type SuchHerkunft = Extract<HerkunftFilter, 'bevorzugt' | 'eigene'>

export const SUCH_HERKUNFT: readonly SuchHerkunft[] = ['bevorzugt', 'eigene']

export function istSuchHerkunft(f: HerkunftFilter | null): f is SuchHerkunft {
  return f === 'bevorzugt' || f === 'eigene'
}

/** Beschriftung und Erklaerung je Filter. */
export const FILTER_LAGE: Record<HerkunftFilter, {
  label: string
  quelle: string
  hinweis: string
}> = {
  bevorzugt: {
    label: 'Bevorzugt',
    quelle: 'food_search, p_filters {"favorites": true}',
    hinweis: 'Alles, was zu einer gemochten Zutat oder einem gemochten '
      + 'Merkmal passt — nicht nur ausdrücklich markierte Favoriten.',
  },
  wie_gestern: {
    label: 'Wie gestern',
    quelle: 'nutrition.meals + meal_items des Vortags',
    hinweis: 'Was am Vortag protokolliert wurde.',
  },
  eigene: {
    label: 'Eigene',
    quelle: 'food_search, p_filters {"sources": ["custom"]}',
    hinweis: 'Selbst angelegte Lebensmittel.',
  },
}

/**
 * Was „wie gestern" an einem Tag ohne Vortag zeigt.
 *
 * **Der Auftrag fragt danach ausdruecklich.** `[cmd]` **Der Fall ist
 * real:** dev hat 180 Tage mit Posten ueber eine Spanne von 181 —
 * **eine Luecke.**
 *
 * `[read]` **Drei Zustaende, nicht zwei** — dieselbe Dreiteilung wie
 * in C-48 und G-239:
 *
 *     posten     der Vortag traegt Eintraege
 *     leer       der Vortag existiert, hat aber nichts
 *     kein_tag   es gibt keinen Vortag (erster Tag)
 *
 * `[read]` **„Gestern war nichts" und „es gibt kein Gestern" sind
 * zwei Aussagen.** Wer sie zusammenwirft, zeigt am ersten Tag eine
 * leere Liste und behauptet damit, der Nutzer habe gefastet.
 */
export type VortagLage = 'posten' | 'leer' | 'kein_tag'

export function vortagLageVon(
  vortagVorhanden: boolean, posten: number,
): VortagLage {
  if (!vortagVorhanden) return 'kein_tag'
  return posten > 0 ? 'posten' : 'leer'
}

export const VORTAG_SATZ: Record<VortagLage, string> = {
  posten: '',
  leer: 'Am Vortag wurde nichts erfasst — die Liste ist leer, weil nichts '
    + 'protokolliert wurde.',
  kein_tag: 'Es gibt keinen Vortag mit Protokoll. „Wie gestern" braucht '
    + 'einen Tag, von dem es übernehmen kann.',
}

/**
 * Der Satz, wenn ein Herkunfts-Filter nichts findet.
 *
 * `[read]` **Leer ist nicht gleich leer.** `[cmd]` `foods_custom` hat
 * 0 Zeilen — wer „Eigene" waehlt, bekommt garantiert nichts, und das
 * liegt nicht an seiner Suche. **Ein allgemeines „keine Treffer"
 * liesse ihn den Suchbegriff aendern, was nichts aendern wuerde.**
 */
export const LEER_SATZ: Record<SuchHerkunft, string> = {
  bevorzugt: 'Keine Treffer unter den bevorzugten Lebensmitteln. '
    + 'Vorlieben werden unter Preferences gepflegt.',
  eigene: 'Es gibt noch keine eigenen Lebensmittel. Was hier erscheint, '
    + 'legst du selbst an — der BLS-Katalog bleibt davon unberührt.',
}
