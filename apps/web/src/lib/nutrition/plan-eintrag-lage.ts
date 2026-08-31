// ════════════════════════════════════════════════════════════════════
// EINEN PLANEINTRAG BEARBEITEN — G-298
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// **Tom, 2026-08-31:** *,,meal plans sehe ich noch nichts
// brauchbares."* `[read]` **Ein Plan, den man nur ansehen kann, ist
// ein Ausdruck.**

// ══ DER CONSTRAINT, DER ALLES BESTIMMT ══════════════════════════════
//
// `[cmd]` **`meal_plan_entries_target_check`, am 2026-08-31 aus
// `pg_constraint` gelesen — nicht ausgedacht:**
//
//     recipe   recipe_id NOT NULL, planned_servings NOT NULL,
//              amount_g NULL, food_id NULL, custom_food_id NULL
//     bls      food_id NOT NULL, amount_g NOT NULL,
//              planned_servings NULL, recipe_id NULL
//     custom   custom_food_id NOT NULL, amount_g NOT NULL,
//              planned_servings NULL, recipe_id NULL
//
// `[read]` **Ein Formular, das Menge UND Portionen schickt, wird
// abgewiesen** — die Datenbank laesst die Mischung nicht zu. **Deshalb
// entscheidet der Typ, welches Feld ueberhaupt erscheint**, und
// `feldFuer()` ist die eine Stelle, die das weiss.

/** Die drei Eintragsarten, wie der CHECK sie fuehrt. */
export const EINTRAG_TYPEN = ['recipe', 'bls', 'custom'] as const
export type EintragTyp = (typeof EINTRAG_TYPEN)[number]

/**
 * `[cmd]` **`meal_plan_entries_meal_type_check` kennt sieben Werte**;
 * `[cmd]` **in den Daten kommen vier vor** (breakfast, lunch, dinner,
 * snack).
 *
 * `[read]` **Gezeigt werden alle sieben** — der Plan darf ein
 * Pre-Workout-Slot bekommen, auch wenn heute keiner existiert.
 */
export const MAHLZEIT_TYPEN = [
  'breakfast', 'lunch', 'dinner', 'snack',
  'pre_workout', 'post_workout', 'other',
] as const
export type MahlzeitTyp = (typeof MAHLZEIT_TYPEN)[number]

/**
 * Welches Mengenfeld der Typ verlangt.
 *
 * `[read]` **Das ist keine Anzeigefrage, sondern die Uebersetzung des
 * CHECKs.** Wer hier das falsche Feld zeigt, baut ein Formular, das
 * die Datenbank ablehnt — und der Fehler erschiene als *„WRITE_FAILED"*
 * ohne Hinweis auf die Ursache.
 */
export type Mengenfeld = 'planned_servings' | 'amount_g'

export function feldFuer(typ: EintragTyp): Mengenfeld {
  return typ === 'recipe' ? 'planned_servings' : 'amount_g'
}

export const FELD_LABEL: Record<Mengenfeld, string> = {
  planned_servings: 'Portionen',
  amount_g: 'Menge',
}

export const FELD_EINHEIT: Record<Mengenfeld, string> = {
  planned_servings: '×',
  amount_g: 'g',
}

/**
 * Der Bausatz fuer einen Eintrag — was an die Route geht.
 *
 * `[read]` **Nur EIN Mengenfeld ist gesetzt**, und zwar das, das
 * `feldFuer()` nennt. Die Gegenprobe steht in `bauEintrag()`.
 */
export type EintragEntwurf = {
  typ: EintragTyp
  quelleId: string
  mahlzeit: MahlzeitTyp
  menge: number
  notiz?: string | null
}

export type EintragFelder = {
  entry_type: EintragTyp
  meal_type: MahlzeitTyp
  recipe_id: string | null
  food_id: string | null
  custom_food_id: string | null
  planned_servings: number | null
  amount_g: number | null
  note: string | null
}

/**
 * Aus dem Entwurf die Felder, die der CHECK verlangt.
 *
 * `[read]` **Die drei nicht zutreffenden Kennungen werden auf `null`
 * gesetzt, nicht weggelassen.** Beim Aendern eines Eintrags, der
 * seinen Typ wechselt, bliebe die alte Kennung sonst stehen — und
 * `recipe_id` UND `food_id` zusammen verletzen den CHECK.
 */
export function bauEintrag(e: EintragEntwurf): EintragFelder {
  const feld = feldFuer(e.typ)
  return {
    entry_type: e.typ,
    meal_type: e.mahlzeit,
    recipe_id: e.typ === 'recipe' ? e.quelleId : null,
    food_id: e.typ === 'bls' ? e.quelleId : null,
    custom_food_id: e.typ === 'custom' ? e.quelleId : null,
    planned_servings: feld === 'planned_servings' ? e.menge : null,
    amount_g: feld === 'amount_g' ? e.menge : null,
    note: e.notiz ?? null,
  }
}

/**
 * Haelt der Bausatz den CHECK ein?
 *
 * `[read]` **Die Probe steht hier, nicht nur im Test** — sie ist die
 * Erklaerung des CHECKs in ausfuehrbarer Form. `[cmd]` **Sie prueft
 * genau die drei Zeilen von `meal_plan_entries_target_check`.**
 */
export function verletztCheck(f: EintragFelder): string | null {
  const kennungen = [f.recipe_id, f.food_id, f.custom_food_id]
  const gesetzt = kennungen.filter(k => k !== null).length
  if (gesetzt !== 1) {
    return `Genau eine Quelle muss gesetzt sein, gesetzt sind ${gesetzt}.`
  }
  if (f.entry_type === 'recipe') {
    if (f.recipe_id === null) return 'Ein Rezepteintrag braucht recipe_id.'
    if (f.planned_servings === null) return 'Ein Rezepteintrag braucht Portionen.'
    if (f.amount_g !== null) return 'Ein Rezepteintrag darf keine Menge in g tragen.'
    return null
  }
  // bls und custom verhalten sich gleich - nur die Kennung wechselt.
  if (f.entry_type === 'bls' && f.food_id === null) {
    return 'Ein BLS-Eintrag braucht food_id.'
  }
  if (f.entry_type === 'custom' && f.custom_food_id === null) {
    return 'Ein eigener Eintrag braucht custom_food_id.'
  }
  if (f.amount_g === null) return 'Dieser Eintrag braucht eine Menge in g.'
  if (f.planned_servings !== null) return 'Nur Rezepte tragen Portionen.'
  return null
}

/**
 * Die naechste freie Position innerhalb eines Slots.
 *
 * `[cmd]` **`meal_plan_entries_slot_order_check`: `>= 0`.** `[cmd]`
 * **Im Bestand traegt jeder Slot genau einen Eintrag mit
 * `slot_order = 1`** — es gibt also keinen gewachsenen Gebrauch, an
 * dem man sich orientieren koennte.
 *
 * `[read]` **Deshalb: das Maximum plus eins, und bei leerem Slot 0.**
 * Nicht `laenge + 1` — nach dem Loeschen der Mitte gaebe das eine
 * Position doppelt.
 */
export function naechstePosition(vorhandene: readonly number[]): number {
  if (vorhandene.length === 0) return 0
  return Math.max(...vorhandene) + 1
}

// ══ DER ABGELAUFENE PLAN — der zweite Befund von G-298 ══════════════
//
// **Tom, 2026-08-31:** *,,der Plan laeuft vom 18.06. bis 08.07., heute
// ist der 31.08., und die Karte sagt aktiv."*
//
// `[cmd]` **Gemessen am 2026-08-31:** der Plan `Aufbau-Wochenplan`
// traegt `is_active = true`, `status = 'active'`, **und seine Tage
// enden am 2026-07-15 — 47 Tage vor heute.**
//
// `[cmd]` **`start_date`, `days_count` und `lifecycle_type` sind alle
// `NULL`** — die Laufzeit steht also NICHT in `meal_plans`, sondern
// nur in den Tageszeilen.
//
// `[read]` **Deshalb wird sie aus den Tagen gelesen und nicht aus
// `start_date` gerechnet.** Eine Rechnung aus `NULL` ergaebe `NULL`,
// und die Karte sagte weiter nur *„aktiv"*.

export type Laufzeit =
  | { art: 'laeuft'; von: string; bis: string }
  | { art: 'kuenftig'; von: string; bis: string; tage: number }
  | { art: 'abgelaufen'; von: string; bis: string; tage: number }
  | { art: 'unbekannt' }

/**
 * Die Laufzeit aus den Plantagen.
 *
 * `[read]` **`heute` kommt als Argument, nie aus `new Date()`** —
 * sonst rechnet der Server eine andere Grenze als der Browser.
 */
export function laufzeitVon(
  plantage: readonly string[], heute: string,
): Laufzeit {
  const sortiert = [...plantage].filter(Boolean).sort()
  if (sortiert.length === 0) return { art: 'unbekannt' }
  const von = sortiert[0]
  const bis = sortiert[sortiert.length - 1]
  if (bis < heute) {
    return { art: 'abgelaufen', von, bis, tage: tageZwischen(bis, heute) }
  }
  if (von > heute) {
    return { art: 'kuenftig', von, bis, tage: tageZwischen(heute, von) }
  }
  return { art: 'laeuft', von, bis }
}

/** Ganze Tage zwischen zwei ISO-Daten. */
export function tageZwischen(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}

/**
 * Was die Karte sagt — und warum nicht einfach „aktiv".
 *
 * `[read]` **Ein Plan, dessen Laufzeit vorbei ist, ist nicht aktiv.**
 * `[cmd]` **Der Zustand in der Datenbank bleibt trotzdem `active`** —
 * ihn hier umzuschreiben waere ein Schreibvorgang beim Lesen. **Also
 * wird er gezeigt UND eingeordnet.**
 */
export function laufzeitSatz(l: Laufzeit): string {
  if (l.art === 'unbekannt') {
    return 'Der Plan trägt keine Tage — eine Laufzeit lässt sich nicht ablesen.'
  }
  if (l.art === 'abgelaufen') {
    return `Die letzte Planwoche endete am ${deutsch(l.bis)} — vor ${l.tage} Tagen. `
      + 'Der Plan steht weiterhin auf „aktiv“, führt für heute aber keine Einträge.'
  }
  if (l.art === 'kuenftig') {
    return `Der Plan beginnt am ${deutsch(l.von)}, in ${l.tage} Tagen.`
  }
  return `Läuft vom ${deutsch(l.von)} bis ${deutsch(l.bis)}.`
}

/** Die Marke neben dem Namen — kurz, weil sie neben dem Status steht. */
export const LAUFZEIT_MARKE: Record<Laufzeit['art'], string | null> = {
  laeuft: null,
  abgelaufen: 'abgelaufen',
  kuenftig: 'beginnt später',
  unbekannt: 'ohne Tage',
}

export function deutsch(iso: string): string {
  const [j, m, t] = iso.split('-')
  return t && m && j ? `${Number(t)}.${Number(m)}.${j}` : iso
}
