// ════════════════════════════════════════════════════════════════════
// LESEWEG: REZEPTE UND EINKAUFSLISTEN — G-289 / G-288 / G-301
// ════════════════════════════════════════════════════════════════════
//
// **Grundlage: `SPEC_03` Flow 7, Flow 8. Entscheidung `E-39`.**
//
// `[cmd]` **Die Naehrwerte kommen aus `nutrition.recipe_nutrition`** —
// **einer FUNKTION, keiner Tabelle** (gemessen am 2026-08-31).
//
// ══ WAS `p_servings` TUT, UND WAS NICHT ═════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-31, und es war anders als vermutet:**
// der Rumpf rechnet `ri.amount_g * servings_used / recipe.servings`.
// **`p_servings` SKALIERT auf eine Zielportionszahl — es teilt
// nicht.**
//
// `[cmd]` **Der Beleg:** ein Rezept mit `servings = 1` liefert bei
// `p_servings = 1` **493,2 kcal** und bei `p_servings = 2`
// **986,4** — das Doppelte, nicht die Haelfte. **Und
// `recipe_nutrition(id, 4)` auf einem Vier-Portionen-Rezept ist ein
// Nullvorgang.**
//
// `[read]` **Daraus folgt fuer Flow 7 Schritt 3 („Gesamt + pro
// Portion"):** *je Portion* ist **Gesamt geteilt durch `servings`**,
// nicht `recipe_nutrition(id, servings)`. **Wer das verwechselt,
// zeigt bei jedem Rezept die Gesamtwerte zweimal.**
//
// `[read]` **Ein Rezept speichert seine Naehrwerte nicht.** Deshalb
// wird hier nichts zwischengespeichert: eine geaenderte Zutat
// hinterliesse sonst zwei Wahrheiten.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { quelleVon, type Quelle } from './rezept-lage'

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

export type RezeptZutat = {
  id: string
  food_id: string | null
  name: string
  amount_g: number
  sort_order: number
  // ══ G-325: die Nährwerte je 100 g ═════════════════════════════════
  //
  // **Tom, 2026-09-02:** *„die einzelpositionen sollen die makros
  // anzeigen wenn man da editiert weiss man nichts mehr."*
  //
  // `[cmd]` **Der Leseweg lieferte je Zutat nur Name und Menge** —
  // beim Bearbeiten eines bestehenden Rezepts stünden vier Striche,
  // weil die Anzeige nichts zu rechnen hätte.
  //
  // `[cmd]` **Über `food_nutrient_snapshot(…, 100)` beschafft** —
  // dieselbe Funktion, die schon die Gesamtwerte liefert. **Am
  // 2026-09-02 gegengeprüft:** Hähnchenbrust 109,0 kcal je 100 g,
  // bei 440 g 479,6 — und 109,0 × 4,4 = 479,6.
  //
  // `[read]` **`null` heisst „nicht ermittelbar", nicht 0** — die
  // Anzeige schreibt dann einen Strich (`bls-fehlend-heisst-nicht-null`).
  enercc_100: number | null
  prot625_100: number | null
  fat_100: number | null
  cho_100: number | null
}

export type RezeptNaehrwerte = {
  zutaten: number
  gramm: number | null
  kcal: number | null
  protein: number | null
  fett: number | null
  kohlenhydrate: number | null
}

export type Rezept = {
  id: string
  name_de: string
  description: string | null
  instructions: string | null
  servings: number
  prep_time_min: number | null
  cook_time_min: number | null
  cooking_skill: string
  /**
   * `[cmd]` **ABGELEITET, nicht gelesen** — `recipes` hat keine
   * `source`-Spalte (gemessen 2026-08-31, 17 Spalten).
   * `[read]` **`measurement_source` ist etwas anderes:** es sagt, WIE
   * gemessen wurde, nicht WER es erstellt hat.
   */
  quelle: Quelle
  quelle_detail: string | null
  zutaten: RezeptZutat[]
  /** Gesamt — je Portion rechnet die Anzeige. */
  naehrwerte: RezeptNaehrwerte | null
}

export type EinkaufsPosten = {
  id: string
  food_name: string
  amount_g: number | null
  unit_display: string
  is_checked: boolean
  sort_order: number
}

export type Einkaufsliste = {
  id: string
  name: string
  source_type: string
  recipe_id: string | null
  servings: number
  status: string
  posten: EinkaufsPosten[]
}

export type RezeptStand = {
  rezepte: Rezept[]
  listen: Einkaufsliste[]
  fehler: string | null
}

const LEER: RezeptStand = { rezepte: [], listen: [], fehler: null }

/**
 * Alle Rezepte des Nutzers, mit Zutaten und Naehrwerten.
 *
 * `[read]` **Die Naehrwerte werden je Rezept einzeln geholt** —
 * `recipe_nutrition` nimmt genau ein Rezept. `[cmd]` **Bei sechs
 * Rezepten sind das sechs Aufrufe; sie laufen nebeneinander**
 * (`Promise.all`), nicht in einer Schleife mit `await`.
 */
export async function ladeRezepte(): Promise<RezeptStand> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return LEER
    const db = client.schema('nutrition')

    const { data: roh, error } = await db
      .from('recipes')
      .select('id, name_de, description, instructions, servings, '
        + 'prep_time_min, cook_time_min, cooking_skill, source_detail')
      .eq('user_id', user.id)
      .order('name_de')
    if (error) return { ...LEER, fehler: error.message }

    const zeilen = (roh ?? []) as unknown as Array<Record<string, unknown>>
    const ids = zeilen.map(r => String(r.id))

    // Die Zutaten aller Rezepte in EINER Abfrage.
    const { data: zRoh } = ids.length > 0
      ? await db.from('recipe_ingredients')
        .select('id, recipe_id, food_id, amount_g, sort_order, food_name_snapshot')
        .in('recipe_id', ids).order('sort_order')
      : { data: [] }
    const zutaten = (zRoh ?? []) as unknown as Array<Record<string, unknown>>

    // Die Namen der Lebensmittel — ebenfalls in einer Abfrage.
    const foodIds = Array.from(new Set(
      zutaten.map(z => z.food_id).filter((x): x is string => typeof x === 'string'),
    ))
    const { data: fRoh } = foodIds.length > 0
      ? await db.from('foods').select('id, name_de').in('id', foodIds)
      : { data: [] }
    const namen = new Map(
      ((fRoh ?? []) as unknown as Array<{ id: string; name_de: string | null }>)
        .map(f => [f.id, f.name_de ?? '']),
    )

    // ══ G-325: die Naehrwerte je 100 g ════════════════════
    //
    // **Tom, 2026-09-02:** *,,eine saubere auflistung inkl schon
    // errechneten makros."*
    //
    // `[cmd]` **`food_nutrient_snapshot(…, 100)`** — dieselbe
    // Funktion, die die Gesamtwerte liefert. **Kein zweiter
    // Rechenweg.**
    //
    // `[read]` **Gleichzeitig ueber ALLE Lebensmittel, nicht je
    // Zutat** — sonst kostet jede Zeile eine eigene Rundreise
    // (G-252). `[cmd]` **Je Lebensmittel EINMAL**, auch wenn es in
    // mehreren Rezepten steckt: `foodIds` ist bereits entdoppelt.
    const je100Roh = await Promise.all(foodIds.map(id => db.rpc(
      'food_nutrient_snapshot',
      {
        p_food_source: 'bls', p_food_id: id,
        p_custom_food_id: null, p_amount_g: 100,
      },
    )))
    const je100 = new Map<string, {
      enercc: number | null; prot625: number | null
      fat: number | null; cho: number | null
    }>()
    foodIds.forEach((id, k) => {
      const { data, error } = je100Roh[k]
      if (error) return
      const z = (Array.isArray(data) ? data[0] : data) as
        Record<string, unknown> | null
      if (!z) return
      je100.set(id, {
        enercc: zahl(z.enercc), prot625: zahl(z.prot625),
        fat: zahl(z.fat), cho: zahl(z.cho),
      })
    })

    // `[read]` **Nebeneinander, nicht nacheinander** — sonst kostet
    // jedes Rezept eine eigene Rundreise (siehe
    // `offset-blaettern-kostet-je-seite-voll`).
    const werte = await Promise.all(ids.map(async id => {
      const { data } = await db.rpc('recipe_nutrition', { p_recipe_id: id })
      const w = (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null
      return [id, w] as const
    }))
    const naehrwerte = new Map(werte)

    const rezepte: Rezept[] = zeilen.map(r => {
      const id = String(r.id)
      const w = naehrwerte.get(id)
      return {
        id,
        name_de: String(r.name_de ?? ''),
        description: (r.description as string | null) ?? null,
        instructions: (r.instructions as string | null) ?? null,
        servings: zahl(r.servings) ?? 1,
        prep_time_min: zahl(r.prep_time_min),
        cook_time_min: zahl(r.cook_time_min),
        cooking_skill: String(r.cooking_skill ?? 'beginner'),
        // Solange die Spalte fehlt, ist alles `user` — gemessen, nicht
        // behauptet.
        quelle: quelleVon(null),
        quelle_detail: (r.source_detail as string | null) ?? null,
        zutaten: zutaten
          .filter(z => String(z.recipe_id) === id)
          .map(z => ({
            id: String(z.id),
            food_id: (z.food_id as string | null) ?? null,
            name: (typeof z.food_id === 'string' ? namen.get(z.food_id) : null)
              || (z.food_name_snapshot as string | null) || 'Unbenannt',
            amount_g: zahl(z.amount_g) ?? 0,
            sort_order: zahl(z.sort_order) ?? 0,
            // G-325: `null` heisst nicht ermittelbar, nicht 0.
            enercc_100: typeof z.food_id === 'string'
              ? (je100.get(z.food_id)?.enercc ?? null) : null,
            prot625_100: typeof z.food_id === 'string'
              ? (je100.get(z.food_id)?.prot625 ?? null) : null,
            fat_100: typeof z.food_id === 'string'
              ? (je100.get(z.food_id)?.fat ?? null) : null,
            cho_100: typeof z.food_id === 'string'
              ? (je100.get(z.food_id)?.cho ?? null) : null,
          })),
        naehrwerte: w
          ? {
            zutaten: zahl(w.ingredient_count) ?? 0,
            gramm: zahl(w.amount_g),
            kcal: zahl(w.enercc),
            protein: zahl(w.prot625),
            fett: zahl(w.fat),
            kohlenhydrate: zahl(w.cho),
          }
          : null,
      }
    })

    // ── Flow 8: die Einkaufslisten ────────────────────────────────
    const { data: lRoh } = await db
      .from('shopping_lists')
      .select('id, name, source_type, recipe_id, servings, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    const listenRoh = (lRoh ?? []) as unknown as Array<Record<string, unknown>>
    const listenIds = listenRoh.map(l => String(l.id))

    const { data: pRoh } = listenIds.length > 0
      ? await db.from('shopping_list_items')
        .select('id, shopping_list_id, food_name, amount_g, unit_display, '
          + 'is_checked, sort_order')
        .in('shopping_list_id', listenIds).order('sort_order')
      : { data: [] }
    const posten = (pRoh ?? []) as unknown as Array<Record<string, unknown>>

    const listen: Einkaufsliste[] = listenRoh.map(l => ({
      id: String(l.id),
      name: String(l.name ?? ''),
      source_type: String(l.source_type ?? ''),
      recipe_id: (l.recipe_id as string | null) ?? null,
      servings: zahl(l.servings) ?? 1,
      status: String(l.status ?? 'open'),
      posten: posten
        .filter(p => String(p.shopping_list_id) === String(l.id))
        .map(p => ({
          id: String(p.id),
          food_name: String(p.food_name ?? ''),
          amount_g: zahl(p.amount_g),
          unit_display: String(p.unit_display ?? 'g'),
          is_checked: p.is_checked === true,
          sort_order: zahl(p.sort_order) ?? 0,
        })),
    }))

    return { rezepte, listen, fehler: null }
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}
