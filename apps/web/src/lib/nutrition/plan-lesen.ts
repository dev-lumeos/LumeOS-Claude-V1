// Lesepfad fuer den Planner-Tab (G-97).
//
// **DIE TABELLEN KOMMEN AUS C-150** (`058b_recipes_meal_plans.sql`):
// `meal_plans` -> `meal_plan_weeks` -> `meal_plan_days` ->
// `meal_plan_entries`, dazu `recipes` und `recipe_ingredients`.
// `[read]` Diese Datei aendert nichts daran und legt keine zweite
// Wahrheit an — sie liest und ordnet fuer die Anzeige.
//
// **VIER TABELLEN, EINE ABFRAGE.** `[cmd]` PostgREST kann eingebettet
// lesen (`weeks(days(entries))`), und der Zeilenschutz greift auf jeder
// Ebene: alle vier Tabellen tragen `user_id` und eigene Policies.
// Deshalb steht hier kein `user_id`-Filter — die Sitzung entscheidet,
// was zurueckkommt. Ein eigener Filter waere eine zweite, schwaechere
// Absicherung neben der echten.
//
// **DIE NAEHRWERTE RECHNET DIE DATENBANK.** `nutrition.recipe_nutrition`
// (C-150) summiert die Zutaten; hier wird nichts nachgerechnet. `[read]`
// Ein Rezept fuehrt bewusst keine gespeicherten Naehrwerte — sonst
// haette man zwei Wahrheiten, sobald jemand eine Zutat aendert.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

function nutritionDb() {
  return createSessionClient().schema('nutrition')
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

// Begriffe und Zeilenlogik stehen in `plan-model.ts` — ohne
// Serverbezug, damit Client-Komponenten sie holen koennen, ohne
// `next/headers` mitzuziehen. Begruendung dort.
import { SLOTS, rasterZeilen, type Slot } from './plan-model'

export { SLOTS, SLOT_LABEL, rasterZeilen } from './plan-model'
export type { Slot } from './plan-model'

export type PlanEintrag = {
  id: string
  meal_type: Slot
  slot_order: number
  /** `recipe`, `bls` oder `custom` — bestimmt, woher der Name kommt. */
  entry_type: string
  recipe_id: string | null
  food_id: string | null
  /** Was in der Zelle steht. */
  bezeichnung: string
  amount_g: number | null
  planned_servings: number | null
  note: string | null
  /**
   * kcal des Eintrags — aus `recipe_nutrition` (Rezept) oder aus den
   * Naehrwerten des Lebensmittels (BLS), auf die Menge gerechnet.
   *
   * `null` heisst: nicht ermittelbar, NICHT null Kalorien. Die
   * Anzeige schreibt dann einen Strich.
   */
  kcal: number | null
}

export type PlanTag = {
  id: string
  plan_date: string
  day_index: number
  eintraege: PlanEintrag[]
}

export type PlanWoche = {
  id: string
  week_start: string
  name: string | null
  /** Kopierte Wochen tragen ihre Herkunft (C-150, `copy_meal_plan_week`). */
  kopiert_von: string | null
  tage: PlanTag[]
}

export type PlanDaten = {
  plan: {
    id: string
    name: string
    description: string | null
    target_kcal: number | null
    target_protein_g: number | null
    target_carbs_g: number | null
    target_fat_g: number | null
    is_active: boolean
    // ══ G-267: der Lebenszyklus, seit 2026-08-30 im Schema ═════════
    //
    // `[cmd]` **Gemessen am 2026-08-30, nach dem Einspielen:** alle
    // sechs Spalten stehen live, `status` als einziges NOT NULL mit
    // Vorgabe `'assigned'`.
    //
    // `[read]` **`null` ist hier eine Aussage, kein Fehler.** Die
    // beiden Bestandsplaene tragen `plan_origin = NULL` und
    // `lifecycle_type = NULL`, **weil die Herkunft nicht belegbar
    // war** — das gehoert gezeigt, nicht gefuellt.
    /** `once` · `rollover` · `sequence` — oder `null`. */
    lifecycle_type: string | null
    start_date: string | null
    days_count: number | null
    next_plan_id: string | null
    rollover_count: number | null
    /** `assigned` · `active` · `completed` · `paused` · `archived`. */
    status: string
    /** `self_created` · `coach_created` · `marketplace` — oder `null`. */
    plan_origin: string | null
  } | null
  wochen: PlanWoche[]
  /**
   * Die Zeilen des Rasters. `[cmd]` `meals_per_day` und
   * `snacks_per_day` aus `food_preferences` (G-72) bestimmen sie —
   * siehe `rasterZeilen`.
   */
  zeilen: Slot[]
  /** Woher die Zeilenzahl kommt, im Klartext fuer die Anzeige. */
  zeilenGrund: string
  /** Rezepte des Nutzers, fuer „New recipe" und die Zellenauswahl. */
  rezepte: Array<{
    id: string
    name_de: string
    cuisine_code: string | null
    cooking_skill: string | null
    prep_time_min: number | null
    cook_time_min: number | null
    servings: number | null
    zutaten: number
    kcal: number | null
    protein_g: number | null
  }>
  ladefehler: string | null
}

/** Was PostgREST je Eintrag mitliefert. */
type RohEintrag = Record<string, unknown>

/**
 * kcal eines BLS-Eintrags — aus `nutrition.food_nutrient_snapshot`.
 *
 * `[cmd]` **`nutrition.foods` fuehrt KEINE Naehrwertspalten.** Die
 * Werte liegen in `food_nutrients` im Langformat (eine Zeile je
 * Naehrstoff); `enercc` gibt es nur auf `meal_items`, `foods_custom`
 * und `daily_summary`. C-150 hat die Funktion genau dafuer gebaut.
 *
 * `[cmd]` **Sie bricht bei `amount_g <= 0` ab** („amount_g muss > 0
 * sein"), deshalb die Pruefung davor. Gemessen: Lachs geduenstet,
 * 180 g -> 293,4 kcal.
 */
async function kcalAusLebensmittel(
  db: ReturnType<typeof nutritionDb>,
  foodId: string | null,
  amountG: number | null,
): Promise<number | null> {
  if (!foodId || amountG === null || amountG <= 0) return null
  try {
    const { data, error } = await db.rpc('food_nutrient_snapshot', {
      p_food_source: 'bls', p_food_id: foodId,
      p_custom_food_id: null, p_amount_g: amountG,
    })
    if (error) return null
    const zeile = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null
    const kcal = zahl(zeile?.enercc)
    return kcal === null ? null : Math.round(kcal)
  } catch {
    return null
  }
}

export async function ladePlan(): Promise<PlanDaten> {
  const db = nutritionDb()

  // Die Zeilen des Rasters aus den Vorlieben (G-72). `[read]` Faellt
  // die Abfrage aus, bleibt es bei den vier Reihen des Entwurfs — der
  // Planner soll daran nicht scheitern.
  let zeilen: Slot[] = [...SLOTS]
  let zeilenGrund = 'Vier Reihen wie im Entwurf — Vorlieben nicht gelesen.'
  try {
    const { data } = await db
      .from('food_preferences')
      .select('meals_per_day, snacks_per_day')
      .maybeSingle()
    const p = (data ?? null) as Record<string, unknown> | null
    const r = rasterZeilen(zahl(p?.meals_per_day), zahl(p?.snacks_per_day))
    zeilen = r.zeilen
    zeilenGrund = r.grund
  } catch {
    // Vorgabe bleibt stehen.
  }

  // Der aktive Plan mit Wochen, Tagen und Eintraegen. Die Namen der
  // Lebensmittel kommen eingebettet mit; die der Rezepte ebenso.
  const { data: plaene, error } = await db
    .from('meal_plans')
    .select(`
      id, name, description, target_kcal, target_protein_g,
      target_carbs_g, target_fat_g, is_active,
      lifecycle_type, start_date, days_count, next_plan_id,
      rollover_count, status, plan_origin,
      weeks:meal_plan_weeks (
        id, week_start, name, copied_from_week_id,
        days:meal_plan_days (
          id, plan_date, day_index,
          entries:meal_plan_entries (
            id, meal_type, slot_order, entry_type, recipe_id, food_id,
            amount_g, planned_servings, note,
            recipe:recipes ( id, name_de ),
            food:foods ( id, name_display_de, name_de )
          )
        )
      )
    `)
    .order('is_active', { ascending: false })

  if (error) {
    return {
      plan: null, wochen: [], zeilen, zeilenGrund,
      rezepte: [], ladefehler: error.message,
    }
  }

  const roh = Array.isArray(plaene) && plaene.length > 0
    ? plaene[0] as Record<string, unknown>
    : null

  // Die Rezepte des Nutzers, mit Naehrwerten aus der Datenbankfunktion.
  const { data: rezepteRoh } = await db
    .from('recipes')
    .select('id, name_de, cuisine_code, cooking_skill, prep_time_min, '
      + 'cook_time_min, servings, recipe_ingredients ( id )')
    .order('name_de')

  const rezepte: PlanDaten['rezepte'] = []
  // `[read]` Je Rezept ein Aufruf: `recipe_nutrition` nimmt genau eine
  // Kennung. Bei drei Rezepten ist das drei Aufrufe — bei dreissig
  // waere eine Sammelfunktion faellig, und die gehoert dann in die
  // Datenbank, nicht hierher.
  const naehrwerte = new Map<string, { kcal: number | null; protein: number | null }>()
  // `[read]` Ueber `unknown`, weil supabase-js eingebettete Relationen
  // als „Zeile ODER Fehlerobjekt" typisiert — ein direkter Cast waere
  // ein Typfehler, kein Laufzeitproblem.
  for (const r of (rezepteRoh ?? []) as unknown as Array<Record<string, unknown>>) {
    const id = text(r.id)
    if (!id) continue
    try {
      const { data } = await db.rpc('recipe_nutrition', {
        p_recipe_id: id, p_servings: 1,
      })
      const n = Array.isArray(data) ? data[0] : data
      const rec = (n ?? {}) as Record<string, unknown>
      naehrwerte.set(id, {
        kcal: zahl(rec.enercc), protein: zahl(rec.prot625),
      })
    } catch {
      naehrwerte.set(id, { kcal: null, protein: null })
    }
  }

  for (const r of (rezepteRoh ?? []) as unknown as Array<Record<string, unknown>>) {
    const id = text(r.id)
    if (!id) continue
    const n = naehrwerte.get(id)
    rezepte.push({
      id,
      name_de: text(r.name_de) ?? '(ohne Namen)',
      cuisine_code: text(r.cuisine_code),
      cooking_skill: text(r.cooking_skill),
      prep_time_min: zahl(r.prep_time_min),
      cook_time_min: zahl(r.cook_time_min),
      servings: zahl(r.servings),
      zutaten: Array.isArray(r.recipe_ingredients) ? r.recipe_ingredients.length : 0,
      kcal: n?.kcal ?? null,
      protein_g: n?.protein ?? null,
    })
  }

  const kcalJeRezept = new Map(rezepte.map(r => [r.id, r.kcal]))

  const wochen: PlanWoche[] = []
  for (const w of (roh?.weeks ?? []) as Array<Record<string, unknown>>) {
    const tage: PlanTag[] = []
    for (const d of (w.days ?? []) as Array<Record<string, unknown>>) {
      const eintraege: PlanEintrag[] = []
      for (const e of (d.entries ?? []) as RohEintrag[]) {
        const typ = text(e.meal_type)
        if (!typ || !SLOTS.includes(typ as Slot)) continue
        const rezept = (e.recipe ?? null) as Record<string, unknown> | null
        const essen = (e.food ?? null) as Record<string, unknown> | null
        const rezeptId = text(e.recipe_id)
        const portionen = zahl(e.planned_servings)
        // Rezept-kcal skalieren mit den geplanten Portionen; ein
        // BLS-Eintrag rechnet ueber die Menge.
        const rezeptKcal = rezeptId ? kcalJeRezept.get(rezeptId) ?? null : null
        const essenKcal = rezeptKcal === null
          ? await kcalAusLebensmittel(db, text(e.food_id), zahl(e.amount_g))
          : null
        eintraege.push({
          id: text(e.id) ?? '',
          meal_type: typ as Slot,
          slot_order: zahl(e.slot_order) ?? 1,
          entry_type: text(e.entry_type) ?? 'bls',
          recipe_id: rezeptId,
          food_id: text(e.food_id),
          bezeichnung: text(rezept?.name_de)
            ?? text(essen?.name_display_de)
            ?? text(essen?.name_de)
            ?? '(ohne Namen)',
          amount_g: zahl(e.amount_g),
          planned_servings: portionen,
          note: text(e.note),
          kcal: rezeptKcal !== null
            ? Math.round(rezeptKcal * (portionen ?? 1))
            : essenKcal,
        })
      }
      eintraege.sort((a, b) => a.slot_order - b.slot_order)
      tage.push({
        id: text(d.id) ?? '',
        plan_date: text(d.plan_date) ?? '',
        day_index: zahl(d.day_index) ?? 0,
        eintraege,
      })
    }
    tage.sort((a, b) => a.plan_date.localeCompare(b.plan_date))
    wochen.push({
      id: text(w.id) ?? '',
      week_start: text(w.week_start) ?? '',
      name: text(w.name),
      kopiert_von: text(w.copied_from_week_id),
      tage,
    })
  }
  wochen.sort((a, b) => a.week_start.localeCompare(b.week_start))

  return {
    plan: roh
      ? {
          id: text(roh.id) ?? '',
          name: text(roh.name) ?? '(ohne Namen)',
          description: text(roh.description),
          target_kcal: zahl(roh.target_kcal),
          target_protein_g: zahl(roh.target_protein_g),
          target_carbs_g: zahl(roh.target_carbs_g),
          target_fat_g: zahl(roh.target_fat_g),
          is_active: roh.is_active === true,
          // G-267: `text()` liefert `null` bei leer — genau richtig,
          // denn `null` ist hier die Aussage „nicht belegbar".
          lifecycle_type: text(roh.lifecycle_type),
          start_date: text(roh.start_date),
          days_count: zahl(roh.days_count),
          next_plan_id: text(roh.next_plan_id),
          rollover_count: zahl(roh.rollover_count),
          status: text(roh.status) ?? 'assigned',
          plan_origin: text(roh.plan_origin),
        }
      : null,
    wochen,
    zeilen,
    zeilenGrund,
    rezepte,
    ladefehler: null,
  }
}


// ══ G-267 ff.: die Ausfuehrung und das Bearbeitungsrecht ═══════════

/**
 * Die Log-Zeilen eines Zeitraums — G-270.
 *
 * `[cmd]` **`meal_plan_logs` steht seit dem 2026-08-30 live und ist
 * LEER** (0 Zeilen, jeder Nutzer). `[read]` **Die Kacheln zeigen
 * deshalb einen Leerzustand, keine erfundenen Zahlen** — und sobald
 * protokolliert wird, fuellen sie sich ohne weitere Aenderung.
 *
 * `[cmd]` **Der Zeitraum ist beidseitig begrenzt** — die Seeds
 * reichen in die Zukunft, eine offene Grenze finge sie mit.
 */
export async function ladePlanLogs(
  bisDatum: string, tage = 7,
): Promise<Array<{
  execution_date: string
  status: 'pending' | 'confirmed' | 'deviated' | 'skipped'
  confirmation_mode: string | null
  deviation_kcal: number | null
}>> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []
  const von = new Date(`${bisDatum}T00:00:00Z`)
  von.setUTCDate(von.getUTCDate() - (tage - 1))
  const { data, error } = await client
    .schema('nutrition')
    .from('meal_plan_logs')
    .select('execution_date, status, confirmation_mode, deviation_kcal')
    .eq('user_id', user.id)
    .gte('execution_date', von.toISOString().slice(0, 10))
    .lte('execution_date', bisDatum)
    .order('execution_date', { ascending: true })
    .limit(1000)
  if (error || !data) return []
  return (data as unknown as Array<Record<string, unknown>>).map(r => ({
    execution_date: text(r.execution_date) ?? '',
    status: (text(r.status) ?? 'pending') as 'pending' | 'confirmed' | 'deviated' | 'skipped',
    confirmation_mode: text(r.confirmation_mode),
    deviation_kcal: zahl(r.deviation_kcal),
  }))
}

/**
 * Ob der Nutzer seinen Plan aendern darf — G-269.
 *
 * `[cmd]` **E-29: ueber `coach.darf_nutrition_plan_aendern`, nicht
 * ueber `coach.client_autonomy`.** Die Funktion prueft volle Sicht,
 * `nutrition_auto_apply` UND Stufe 5.
 *
 * `[cmd]` **Gemessen am 2026-08-30: `dev` steht auf Stufe 3 und
 * bekommt `false`.**
 */
export async function ladeCoachFreigabe(): Promise<boolean> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return false
  const { data, error } = await client
    .schema('coach')
    .rpc('darf_nutrition_plan_aendern', { p_client: user.id })
  if (error) return false
  return data === true
}

/**
 * Wie viele Einkaufslisten der Nutzer hat — G-270.
 *
 * `[cmd]` **`nutrition.shopping_lists` EXISTIERT** (1 Zeile, 6
 * Positionen im Bestand). `[read]` **Der Quelltext nannte bis heute
 * eine fehlende Tabelle als Grund fuer die Attrappe** — das war schon
 * in G-271 falsch. **Null Listen ist ein Leerzustand.**
 */
export async function ladeEinkaufslistenZahl(): Promise<number> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return 0
  const { count, error } = await client
    .schema('nutrition')
    .from('shopping_lists')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if (error || count === null) return 0
  return count
}
