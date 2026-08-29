// ════════════════════════════════════════════════════════════════════
// DIE ACHT SORTIERACHSEN — G-70 (E-23)
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30.
//
// ══ DER BEFUND, DER DIESE DATEI NOETIG MACHT ════════════════════════
//
// **Der Auftrag sagt: *„`food_search` kennt seit G-245 zehn
// Sortierwerte"*** — relevance, name_asc, und je hoch/niedrig fuer
// Protein, kcal, Kohlenhydrate, Fett.
//
// `[cmd]` **Gemessen am 2026-08-29 gegen die laufende Funktion: sie
// kennt VIER.**
//
//     relevance      wird angenommen
//     name_asc       wird angenommen
//     protein_desc   wird angenommen
//     kcal_asc       wird angenommen
//     protein_asc    faellt still auf relevance
//     kcal_desc      faellt still auf relevance
//     carbs_desc     faellt still auf relevance
//     carbs_asc      faellt still auf relevance
//     fat_desc       faellt still auf relevance
//     fat_asc        faellt still auf relevance
//
// `[cmd]` **Die Bedingung steht im Quelltext:**
// `CASE WHEN p_sort IN ('relevance','protein_desc','kcal_asc','name_asc')
// THEN p_sort ELSE 'relevance' END`.
//
// `[cmd]` **Und `unsupported_sort` gibt es nicht.** Weder
// `unsupported_sort` noch `requested_sort` noch `supported_sorts`
// stehen in der Antwort; ein erfundener Wert liefert schweigend
// `sort: relevance`. **Die Rueckmeldung, die der Auftrag nutzen
// wollte, existiert nicht.**
//
// ══ WIE DIE ACHT ACHSEN TROTZDEM ENTSTEHEN ══════════════════════════
//
// `[cmd]` **Jeder Treffer traegt alle vier Makros mit** — `prot625`,
// `enercc`, `cho`, `fat`. **Damit ist die Sortierung auf der
// geladenen Seite moeglich, ohne `food_search` anzufassen** (das ist
// Codex' Bereich, G-107).
//
// `[read]` **Die Grenze davon steht in `SORTIERT_SEITE`:** was der
// Server sortiert, gilt fuer alle 7.140 Treffer; was hier sortiert
// wird, gilt fuer die geladene Seite. **Das muss dabeistehen, sonst
// hält jemand die Seitenspitze fuer die Gesamtspitze.**

/** Was die Datenbank annimmt — gemessen, nicht behauptet. */
export const SERVER_SORTS = [
  'relevance', 'name_asc', 'protein_desc', 'kcal_asc',
] as const
export type ServerSort = (typeof SERVER_SORTS)[number]

/** Die acht Achsen aus E-23, vier Naehrstoffe in zwei Richtungen. */
export const ACHSEN = [
  'protein_desc', 'protein_asc',
  'kcal_desc', 'kcal_asc',
  'carbs_desc', 'carbs_asc',
  'fat_desc', 'fat_asc',
] as const
export type Achse = (typeof ACHSEN)[number]

export type Sortierung = 'relevance' | 'name_asc' | Achse

/** Alle zehn — vier vom Server, sechs auf der Seite. */
export const ALLE_SORTIERUNGEN: readonly Sortierung[] = [
  'relevance', 'name_asc', ...ACHSEN,
]

/** Ob die Datenbank diese Sortierung selbst leistet. */
export function serverKann(s: Sortierung): boolean {
  return (SERVER_SORTS as readonly string[]).includes(s)
}

/**
 * Was an `food_search` geschickt wird.
 *
 * `[read]` **Bei einer Achse, die der Server nicht kann, geht
 * `relevance` hin** — nicht der unbekannte Wert. `[cmd]` Die Funktion
 * faellt ohnehin darauf zurueck, aber schweigend; ihn zu schicken
 * hiesse, sich auf ein Verhalten zu verlassen, das nirgends
 * zugesichert ist.
 */
export function serverSort(s: Sortierung): ServerSort {
  return serverKann(s) ? s as ServerSort : 'relevance'
}

/** Das Feld je Achse, wie es im Treffer heisst. */
const FELD: Record<Achse, 'prot625' | 'enercc' | 'cho' | 'fat'> = {
  protein_desc: 'prot625', protein_asc: 'prot625',
  kcal_desc: 'enercc', kcal_asc: 'enercc',
  carbs_desc: 'cho', carbs_asc: 'cho',
  fat_desc: 'fat', fat_asc: 'fat',
}

export function istAbsteigend(s: Achse): boolean {
  return s.endsWith('_desc')
}

export type SortierbarerTreffer = {
  prot625?: unknown
  enercc?: unknown
  cho?: unknown
  fat?: unknown
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

/**
 * Die Seite nach einer Achse ordnen.
 *
 * `[read]` **Treffer ohne Wert wandern ans Ende, in beide
 * Richtungen.** Ein fehlender Wert ist keine Null — beim Aufsteigen
 * stuende er sonst vorn und behauptete den niedrigsten Wert.
 *
 * `[read]` **Stabil bei Gleichstand:** die Reihenfolge des Servers
 * bleibt, sonst springt die Liste zwischen zwei Aufrufen.
 */
export function sortiereSeite<T extends SortierbarerTreffer>(
  treffer: readonly T[], s: Sortierung,
): T[] {
  const feld = FELD[s as Achse]
  // `[read]` **Am FELD entschieden, nicht am Namen.** `relevance` und
  // `name_asc` haben keines — die Datenbank ordnet sie, und eine
  // zweite Ordnung ueber nur einer Seite waere schlechter als keine.
  // `[cmd]` Eine Sabotage, die nur den Namen aus der Bedingung nahm,
  // kam vorher durch: ein fehlendes Feld bildete alle Werte auf
  // `null` ab und liess die Reihenfolge zufaellig stehen.
  if (!feld) return [...treffer]
  const ab = istAbsteigend(s as Achse)
  return treffer
    .map((t, i) => ({ t, i, w: zahl(t[feld]) }))
    .sort((a, b) => {
      if (a.w === null && b.w === null) return a.i - b.i
      if (a.w === null) return 1
      if (b.w === null) return -1
      if (a.w !== b.w) return ab ? b.w - a.w : a.w - b.w
      return a.i - b.i
    })
    .map(x => x.t)
}

export const SORTIERT_SEITE =
  'Diese Sortierung ordnet die geladene Seite. '
  + 'Die Datenbank sortiert nur nach Relevanz, Name, Protein (absteigend) '
  + 'und Kalorien (aufsteigend).'

/** Beschriftung je Achse — die Richtung gehoert dazu. */
export const SORT_TEXT: Record<Sortierung, string> = {
  relevance: 'Relevanz',
  name_asc: 'Name',
  protein_desc: 'Protein, hoch', protein_asc: 'Protein, niedrig',
  kcal_desc: 'Kalorien, hoch', kcal_asc: 'Kalorien, niedrig',
  carbs_desc: 'Kohlenhydrate, hoch', carbs_asc: 'Kohlenhydrate, niedrig',
  fat_desc: 'Fett, hoch', fat_asc: 'Fett, niedrig',
}

/**
 * Der naechste Zustand beim Klick auf eine Spalte.
 *
 * `[read]` **Drei Zustaende je Spalte:** aus → absteigend →
 * aufsteigend → aus. **Absteigend zuerst**, weil „am meisten Protein"
 * die haeufigere Frage ist als „am wenigsten".
 */
export function naechsteSortierung(
  aktuell: Sortierung, spalte: 'protein' | 'kcal' | 'carbs' | 'fat',
): Sortierung {
  const ab = `${spalte}_desc` as Achse
  const auf = `${spalte}_asc` as Achse
  if (aktuell === ab) return auf
  if (aktuell === auf) return 'relevance'
  return ab
}
