// ════════════════════════════════════════════════════════════════════
// DIE DREI HERKUNFTS-FILTER — G-251, GEMESSEN STATT GEBAUT
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// `[read]` **Diese Datei baut die Filter NICHT.** Sie haelt fest, was
// am 2026-08-30 gemessen wurde, damit der naechste Auftrag nicht
// dieselbe Messung wiederholt — und damit niemand einen Filter baut,
// der aussieht, als waere er kaputt.
//
// ══ WORAUS JEDER KAEME, UND WAS FEHLT ═══════════════════════════════
//
//     Favoriten      `food_preference_items`, `preference = 'liked'`
//                    `[cmd]` **dev hat GENAU EINEN** ("Reis poliert,
//                    roh"). `[cmd]` **`food_search` kennt `liked`
//                    nur als Rangschub** (`constraint_level =
//                    'boost'`, +100/+50/+30) — **`p_filters` hat
//                    keinen Schluessel dafuer.**
//
//     wie gestern    `meals` + `meal_items` des Vortags.
//                    `[cmd]` **dev: 180 Tage mit Posten ueber eine
//                    Spanne von 181 — also EINE Luecke.** **Der Fall
//                    ohne Vortag ist real, nicht theoretisch.**
//
//     eigene Foods   `nutrition.foods_custom`.
//                    `[cmd]` **Die Tabelle existiert mit 45 Spalten
//                    und 0 Zeilen** — und **`food_search` liest sie
//                    ueberhaupt nicht** (`prosrc` geprueft).
//
// ══ WARUM KEINER GEBAUT WURDE ═══════════════════════════════════════
//
// `[cmd]` **`p_filters` kennt sechs Schluessel:** `tag_groups`,
// `include_tag_groups`, `exclude_tags`, `exclude_tag_codes`,
// `processing_levels`, `exclude_processing_levels`. **Keiner davon
// trifft eine Herkunft.**
//
// `[read]` **Client-seitig ginge nur die geladene Seite** — und das
// waere schlimmer als nichts: `[cmd]` **7.140 Lebensmittel, 50 je
// Seite, ein Favorit.** **Ein Filter, der fast immer nichts findet,
// sieht kaputt aus, nicht leer.**
//
// `[read]` **Also gemeldet.** Was fehlt, ist eine Datenbankaenderung
// (Codex), nicht eine Oberflaeche.

/** Die drei Filter, wie G-251 sie nennt. */
export type HerkunftFilter = 'favoriten' | 'wie_gestern' | 'eigene'

/** Was jedem Filter heute fehlt — je einer, nicht gesammelt. */
export const FILTER_LAGE: Record<HerkunftFilter, {
  quelle: string
  fehlt: string
}> = {
  favoriten: {
    quelle: 'nutrition.food_preference_items (preference = liked)',
    fehlt: 'food_search kennt liked nur als Rangschub, p_filters hat '
      + 'keinen Schlüssel dafür.',
  },
  wie_gestern: {
    quelle: 'nutrition.meals + meal_items des Vortags',
    fehlt: 'Kein Suchfilter — das ist eine eigene Liste, keine '
      + 'Verfeinerung der Katalogsuche.',
  },
  eigene: {
    quelle: 'nutrition.foods_custom',
    fehlt: 'food_search liest die Tabelle nicht; sie hat 0 Zeilen.',
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
