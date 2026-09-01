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
// G-309: Typ und Schwellen stehen serverfrei in `plan-lage.ts`
// — die Kachel ist eine Client-Komponente (A-30).
import {
  LEERER_WECHSELSTAND, WECHSEL_AB_MAL, WECHSEL_AB_QUOTE,
  type Wechselbefund, type WechselStand,
} from './plan-lage'

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
    /**
     * Die Zutaten — G-311.
     *
     * **Tom, 2026-09-01:** *,,eingetragene recipes sind ja ok, aber
     * mindestens bei klick drauf will man sehen was darin ist an
     * lebensmittel und details."*
     *
     * `[cmd]` **Derselbe Verbund, keine zweite Runde** — die Abfrage
     * las `recipe_ingredients ( id )` bereits, nur zum Zaehlen.
     */
    posten: Array<{ id: string; name: string; amount_g: number | null }>
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

/**
 * Der Plan fuer den Planner — G-97, erweitert in G-311.
 *
 * `[cmd]` **`planId` waehlt gezielt.** `[read]` **Ohne sie gilt der
 * alte Weg:** nach `is_active` sortiert, der erste gewinnt.
 *
 * ══ WARUM DER PARAMETER ══════════════════════════════
 *
 * `[cmd]` **G-311: *In der Werkbank* tat nichts.** Der Knopf setzte
 * einen Zustand in der Liste, **aber das Raster darunter zeigte
 * weiter den aktiven Plan.**
 *
 * `[read]` **Der Kommentar in `ansicht.tsx` sagte *,,das Raster zeigt
 * dann dessen Wochen"*** — **und genau das tat es nicht.**
 *
 * `[read]` **Ueber die URL, nicht ueber einen Client-Zustand:** der
 * Plan wird serverseitig geladen, und ein Neuladen der Seite behaelt
 * die Wahl.
 */
export async function ladePlan(planId?: string | null): Promise<PlanDaten> {
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

  // `[read]` **Der gewaehlte Plan, sonst der erste.** `[cmd]` **Eine
  // unbekannte Kennung faellt auf den ersten zurueck** — sie kommt
  // aus der URL und kann veraltet sein; ein leeres Raster waere dann
  // ein Fehler, den niemand erklaert.
  const liste = Array.isArray(plaene)
    ? plaene as Array<Record<string, unknown>>
    : []
  const roh = (planId ? liste.find(p => text(p.id) === planId) : null)
    ?? liste[0] ?? null

  // Die Rezepte des Nutzers, mit Naehrwerten aus der Datenbankfunktion.
  const { data: rezepteRoh } = await db
    .from('recipes')
    // G-311: Name und Menge je Zutat — derselbe Verbund, der schon
    // fuer die Zaehlung gelesen wurde.
    .select('id, name_de, cuisine_code, cooking_skill, prep_time_min, '
      + 'cook_time_min, servings, '
      + 'recipe_ingredients ( id, amount_g, food_name_snapshot, sort_order, '
      + 'food:foods ( name_display_de, name_de ) )')
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
      // G-311: die Zutaten selbst, aus demselben Verbund.
      posten: (Array.isArray(r.recipe_ingredients)
        ? r.recipe_ingredients as Array<Record<string, unknown>>
        : [])
        .slice()
        .sort((a, b) => (zahl(a.sort_order) ?? 0) - (zahl(b.sort_order) ?? 0))
        .map(zt => {
          const f = zt.food as Record<string, unknown> | null
          return {
            id: text(zt.id) ?? '',
            // `[read]` **Der Name aus `foods`, sonst der Schnappschuss**
            // — eine Zutat ohne beides gibt es nicht, aber der Strich
            // ist ehrlicher als ein leeres Feld.
            name: text(f?.name_display_de) ?? text(f?.name_de)
              ?? text(zt.food_name_snapshot) ?? '—',
            amount_g: zahl(zt.amount_g),
          }
        }),
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


/**
 * Die Plan-Eintraege eines Tages mit ihrem Zustand — G-274.
 *
 * `[read]` **Der Eintrag ist die Vorlage, das Log die Ausfuehrung.**
 * Ein Eintrag ohne Log ist `pending` — **nicht abwesend.** Wer nur
 * Log-Zeilen laedt, saehe am ersten Tag gar nichts, und genau das war
 * der Leerzustand aus G-270.
 *
 * `[cmd]` **Zwei Abfragen, keine Schleife** — die Eintraege des Tages
 * und die Logs desselben Tages, danach im Speicher verbunden. **Ein
 * `await` je Eintrag kostet je Durchlauf voll** (G-252).
 */
export async function ladeTagesEintraege(datum: string): Promise<Array<{
  id: string
  meal_type: string
  bezeichnung: string
  kcal: number | null
  status: 'pending' | 'confirmed' | 'deviated' | 'skipped'
  confirmation_mode: string | null
  deviation_kcal: number | null
  deviation_pct: number | null
}>> {
  const db = nutritionDb()
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const [eintraegeR, logsR] = await Promise.all([
    db.from('meal_plan_entries')
      .select(`
        id, meal_type, slot_order, entry_type, amount_g, planned_servings,
        recipe:recipes ( name_de ),
        food:foods ( name_display_de, name_de ),
        day:meal_plan_days!inner ( plan_date )
      `)
      .eq('user_id', user.id)
      .eq('meal_plan_days.plan_date', datum)
      .order('slot_order', { ascending: true })
      .limit(200),
    db.from('meal_plan_logs')
      .select('plan_entry_id, status, confirmation_mode, deviation_kcal, deviation_pct')
      .eq('user_id', user.id)
      .eq('execution_date', datum)
      .limit(200),
  ])

  if (eintraegeR.error) return []

  const jeEintrag = new Map<string, Record<string, unknown>>()
  for (const l of (logsR.data ?? []) as unknown as Array<Record<string, unknown>>) {
    const k = text(l.plan_entry_id)
    if (k) jeEintrag.set(k, l)
  }

  const aus = []
  for (const roh of (eintraegeR.data ?? []) as unknown as Array<Record<string, unknown>>) {
    const id = text(roh.id)
    if (!id) continue
    const rezept = roh.recipe as Record<string, unknown> | null
    const essen = roh.food as Record<string, unknown> | null
    const log = jeEintrag.get(id)
    aus.push({
      id,
      meal_type: text(roh.meal_type) ?? 'other',
      bezeichnung: text(rezept?.name_de)
        ?? text(essen?.name_display_de) ?? text(essen?.name_de) ?? '—',
      // `[read]` Die kcal stehen erst nach dem Bestaetigen fest —
      // hier bleibt `null`, statt eine Zahl zu behaupten.
      kcal: null,
      status: (text(log?.status) ?? 'pending') as
        'pending' | 'confirmed' | 'deviated' | 'skipped',
      confirmation_mode: text(log?.confirmation_mode),
      deviation_kcal: zahl(log?.deviation_kcal),
      deviation_pct: zahl(log?.deviation_pct),
    })
  }
  return aus
}


// ════════════════════════════════════════════════════════════════════
// ALLE PLAENE — C-372 / E-41
// ════════════════════════════════════════════════════════════════════
//
// **E-41:** *,,edit oder neuer Plan bleibt beim Planner, dann brauchen
// wir da auch eine Auflistung aller Plaene."*
//
// `[cmd]` **`ladePlan` liest alle, sortiert nach `is_active` und
// nimmt `plaene[0]`** — in G-304 gemessen. `[read]` **Damit gibt es
// heute keine Liste, nur EINEN Plan.** **Flow 3, Schritt 2 verlangt
// aber eine Uebersicht.**

export type PlanKurz = {
  id: string
  name: string
  description: string | null
  status: string
  is_active: boolean
  plan_origin: string | null
  wochen: number
  tage: number
  positionen: number
  /** C-373: bestimmt den Vorschlag beim Ablauf, nicht die Handlung. */
  lifecycle_type: string | null
  /**
   * C-377: der letzte Plantag — daraus entsteht die Ablauffrage.
   *
   * `[cmd]` **`start_date` und `days_count` sind beim Bestandsplan
   * `NULL`** (G-298), **die Laufzeit steht nur in den Tageszeilen.**
   */
  letzter_tag: string | null
  /**
   * C-375/E-42: der Weiterverkaufsschutz.
   *
   * `[cmd]` **Berichtigt am 2026-09-01:** hier stand
   * `darf_bearbeiten`. **E-42: gemeint ist ein Weiterverkaufsschutz,
   * kein Editierschutz** — *,,wenn ich einen plan kaufe dann ist das
   * mein plan"*.
   *
   * `[cmd]` **Am 2026-09-01 gemessen: die Spalte steht live** —
   * `boolean NOT NULL DEFAULT true` an `meal_plans` und `recipes`
   * (Kettenschritt 371, von Codex eingespielt).
   *
   * `[read]` **Sie sperrt nichts.** Es gibt keinen Weiterverkauf zu
   * verhindern, solange kein Marktplatz existiert (E-39) — **die
   * Anzeige traegt die Einschraenkung, bevor sie greift.**
   */
  darf_weiterverkaufen: boolean | undefined
}

/**
 * Alle Plaene des Nutzers, kurz — fuer Bibliothek und Werkbank.
 *
 * `[read]` **Ohne Wochen und Positionen im Detail** — die Liste soll
 * zeigen, welche Plaene es gibt, nicht was in ihnen steht. Das Detail
 * laedt `ladePlan`.
 */
export async function ladeAllePlaene(): Promise<PlanKurz[]> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return []
    const db = client.schema('nutrition')

    const { data, error } = await db
      .from('meal_plans')
      .select('id, name, description, status, is_active, plan_origin, '
        + 'lifecycle_type, darf_weiterverkaufen, '
        + 'weeks:meal_plan_weeks(id, days:meal_plan_days(id, plan_date, '
        + 'entries:meal_plan_entries(id)))')
      .eq('user_id', user.id)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) return []

    const zeilen = (data ?? []) as unknown as Array<Record<string, unknown>>
    return zeilen.map(p => {
      const wochen = (p.weeks ?? []) as Array<Record<string, unknown>>
      const tage = wochen.flatMap(w => (w.days ?? []) as Array<Record<string, unknown>>)
      const positionen = tage.flatMap(
        d => (d.entries ?? []) as Array<Record<string, unknown>>)
      const daten = tage
        .map(d => String(d.plan_date ?? ''))
        .filter(Boolean)
        .sort()
      return {
        id: String(p.id),
        name: String(p.name ?? ''),
        lifecycle_type: (p.lifecycle_type as string | null) ?? null,
        letzter_tag: daten.length > 0 ? daten[daten.length - 1] : null,
        description: (p.description as string | null) ?? null,
        status: String(p.status ?? 'assigned'),
        is_active: p.is_active === true,
        plan_origin: (p.plan_origin as string | null) ?? null,
        wochen: wochen.length,
        tage: tage.length,
        positionen: positionen.length,
        // `[cmd]` **Die Spalte steht seit dem 2026-09-01 live**
        // (C-371/C-375, Kettenschritt 371) — `boolean NOT NULL
        // DEFAULT true` an `meal_plans` UND `recipes`.
        darf_weiterverkaufen: p.darf_weiterverkaufen === false ? false : true,
      }
    })
  } catch {
    return []
  }
}
// ════════════════════════════════════════════════════════════════════
// GHOST ENTRIES — G-309
// ════════════════════════════════════════════════════════════════════
//
// **`SPEC_03` Flow 3, Schritt 7:** *,,Ab Startdatum: Ghost Entries
// erscheinen im Diary."*
//
// ══ EIN GHOST ENTRY IST EINE ABSICHT, KEINE ERFASSUNG ═══════════════
//
// **Tom, 2026-09-01:** *,,Wer ihn als `meals` schreibt, hat gegessen,
// ohne gegessen zu haben \u2014 und die Tagesbilanz zaehlt es mit."*
//
// `[cmd]` **`nutrition.meal_plan_day_to_diary` schreibt genau das:**
// echte `meals` mit `entry_source = 'seed'`. **Ihr eigener Kommentar
// nennt es *,,als NORMALE meals/meal_items"*.** `[read]` **Sie ist
// ein Seed-Werkzeug aus C-150, kein Produktweg \u2014 der Name taeuscht.**
// **Sie wird nicht gerufen**, und ein Waechter haelt das fest.
//
// `[cmd]` **`SPEC_03` Flow 4:** *,,Ghost Entries haben kein
// automatisches Expiry. User entscheidet jederzeit \u2014 auch
// retroaktiv."* `[read]` **Ein geschriebener `meals`-Satz koennte das
// nicht** \u2014 er waere gegessen oder geloescht. **Nur eine Anzeige
// bleibt offen.**
//
// ══ UND DAS REZEPT WIRD AUFGELOEST ══════════════════════════════════
//
// `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`:** *,,Ghost Entries die aus einem
// `MealPlanItem.recipe_id` stammen zeigen immer alle Einzelzutaten \u2014
// nie das Rezept als Einheit."* **Jede Zeile hat ein editierbares
// Mengenfeld.**
//
// `[read]` **Der Rezeptname bleibt als Ueberschrift** (Flow-4-Patch),
// **die Zutaten stehen einzeln darunter.**

/** Ein Posten eines Ghost Entry \u2014 eine Zutat mit ihrer Menge. */
export type GhostPosten = {
  food_id: string
  name: string
  amount_g: number
  kcal: number | null
}

/**
 * Ein Ghost Entry \u2014 ein Plan-Slot eines Tages, noch nicht erfasst.
 *
 * `[read]` **`status` kommt aus `meal_plan_logs`**, nicht aus dem
 * Eintrag: der Eintrag ist die Vorlage, das Log die Ausfuehrung
 * (G-274). **Ohne Log ist er `pending`** \u2014 nicht abwesend.
 */
export type GhostEintrag = {
  id: string
  meal_type: string
  /** Der Rezeptname, wenn es einer ist \u2014 sonst `null`. */
  rezept: string | null
  posten: GhostPosten[]
  kcal: number | null
  status: 'pending' | 'confirmed' | 'deviated' | 'skipped'
}

/**
 * Die Ghost Entries eines Tages \u2014 G-309.
 *
 * `[cmd]` **NUR vom aktiven Plan.** `[read]` **`ladeTagesEintraege`
 * (G-274) filtert den Planstatus nicht** \u2014 sie liefert die
 * Positionen jedes Plans, der an dem Tag einen Tag hat. **Fuer die
 * Anzeige waere das falsch:** ein pausierter Plan hat keinen Anspruch
 * auf den Tag, genau deshalb wird beim Aktivieren pausiert.
 *
 * `[cmd]` **Drei Abfragen, keine Schleife** \u2014 die Eintraege, ihre
 * Logs, und die Naehrwerte gleichzeitig. **Ein `await` je Eintrag
 * kostet je Durchlauf voll** (G-252).
 */
export async function ladeGhostEintraege(datum: string): Promise<GhostEintrag[]> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []
  const db = client.schema('nutrition')

  // `[read]` **Der Weg von unten:** die Positionen des Tages, aber nur
  // die, deren Plan aktiv ist. `!inner` erzwingt den Verbund \u2014 ohne
  // ihn kaemen Positionen ohne passenden Plan mit `null` durch.
  const [eintraegeR, logsR] = await Promise.all([
    db.from('meal_plan_entries')
      .select(`
        id, meal_type, slot_order, entry_type, food_id, amount_g,
        planned_servings,
        recipe:recipes ( id, name_de, servings ),
        food:foods ( name_display_de, name_de ),
        day:meal_plan_days!inner (
          plan_date,
          week:meal_plan_weeks!inner (
            plan:meal_plans!inner ( id, status )
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('meal_plan_days.plan_date', datum)
      .eq('meal_plan_days.meal_plan_weeks.meal_plans.status', 'active')
      .order('slot_order', { ascending: true })
      .limit(200),
    db.from('meal_plan_logs')
      .select('plan_entry_id, status')
      .eq('user_id', user.id)
      .eq('execution_date', datum)
      .limit(200),
  ])
  if (eintraegeR.error) return []

  const zustand = new Map<string, string>()
  for (const l of (logsR.data ?? []) as unknown as Array<Record<string, unknown>>) {
    const k = text(l.plan_entry_id)
    const s = text(l.status)
    if (k && s) zustand.set(k, s)
  }

  const zeilen = (eintraegeR.data ?? []) as unknown as Array<Record<string, unknown>>

  // Die Rezeptzutaten aller Rezepteintraege in EINER Abfrage.
  // `Array.from` statt `[...set]` — das Ziel steht unter ES2015.
  const rezeptIds = Array.from(new Set(zeilen
    .map(r => text((r.recipe as Record<string, unknown> | null)?.id))
    .filter((v): v is string => v !== null)))
  const zutatenJeRezept = new Map<string, Array<Record<string, unknown>>>()
  if (rezeptIds.length > 0) {
    const { data: zRoh } = await db
      .from('recipe_ingredients')
      .select('recipe_id, food_id, amount_g, food_name_snapshot, sort_order, '
        + 'food:foods ( name_display_de, name_de )')
      .in('recipe_id', rezeptIds)
      .order('sort_order', { ascending: true })
      .limit(500)
    for (const z of (zRoh ?? []) as unknown as Array<Record<string, unknown>>) {
      const k = text(z.recipe_id)
      if (!k) continue
      const liste = zutatenJeRezept.get(k)
      if (liste) liste.push(z)
      else zutatenJeRezept.set(k, [z])
    }
  }

  // Die Posten je Eintrag \u2014 ein Rezept wird hier aufgeloest.
  const roh: Array<{
    id: string; meal_type: string; rezept: string | null
    posten: Array<{ food_id: string; name: string; amount_g: number }>
    status: string
  }> = []
  for (const r of zeilen) {
    const id = text(r.id)
    if (!id) continue
    const rezept = r.recipe as Record<string, unknown> | null
    const essen = r.food as Record<string, unknown> | null
    const posten: Array<{ food_id: string; name: string; amount_g: number }> = []

    const rezeptId = text(rezept?.id)
    if (rezeptId) {
      // `[cmd]` **`planned_servings / servings` skaliert** \u2014 ein
      // halbes Rezept ist die halbe Menge je Zutat. **Dieselbe
      // Rechnung wie in `plan-log-write.ts`**, damit die Vorschau
      // zeigt, was das Bestaetigen schreibt.
      const portionen = zahl(r.planned_servings) ?? 1
      const proRezept = zahl(rezept?.servings) ?? 1
      const faktor = proRezept > 0 ? portionen / proRezept : 1
      for (const z of (zutatenJeRezept.get(rezeptId) ?? [])) {
        const fid = text(z.food_id)
        const menge = zahl(z.amount_g)
        if (!fid || menge === null) continue
        const zf = z.food as Record<string, unknown> | null
        posten.push({
          food_id: fid,
          name: text(zf?.name_display_de) ?? text(zf?.name_de)
            ?? text(z.food_name_snapshot) ?? '\u2014',
          amount_g: Math.round(menge * faktor * 10) / 10,
        })
      }
    } else {
      const fid = text(r.food_id)
      const menge = zahl(r.amount_g)
      if (fid && menge !== null) {
        posten.push({
          food_id: fid,
          name: text(essen?.name_display_de) ?? text(essen?.name_de) ?? '\u2014',
          amount_g: menge,
        })
      }
    }

    roh.push({
      id,
      meal_type: text(r.meal_type) ?? 'other',
      rezept: text(rezept?.name_de),
      posten,
      status: zustand.get(id) ?? 'pending',
    })
  }

  // `[cmd]` **Die kcal ueber `food_nutrient_snapshot`** \u2014 dieselbe
  // Funktion, die der Planner und der Bestaetigungsweg benutzen
  // (C-150). **Nichts nachgerechnet.**
  //
  // `[read]` **Gleichzeitig ueber ALLE Posten aller Eintraege**, nicht
  // je Eintrag \u2014 sonst kostet jeder Slot eine eigene Runde (G-252).
  const flach = roh.flatMap((e, i) => e.posten.map((p, j) => ({ i, j, p })))
  const werte = await Promise.all(flach.map(({ p }) => db.rpc(
    'food_nutrient_snapshot',
    {
      p_food_source: 'bls', p_food_id: p.food_id,
      p_custom_food_id: null, p_amount_g: p.amount_g,
    },
  )))

  const kcalJePosten = new Map<string, number>()
  flach.forEach(({ i, j }, k) => {
    const { data, error } = werte[k]
    if (error) return
    const z = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null
    const n = zahl(z?.enercc)
    if (n !== null) kcalJePosten.set(`${i}:${j}`, n)
  })

  return roh.map((e, i) => {
    const posten: GhostPosten[] = e.posten.map((p, j) => ({
      ...p, kcal: kcalJePosten.get(`${i}:${j}`) ?? null,
    }))
    // `[read]` **`null`, wenn KEIN Posten eine Zahl hat** \u2014 eine
    // Summe aus lauter Fehlwerten waere `0` und saehe aus wie
    // *,,null Kalorien"*. Dieselbe Klasse wie die BLS-Deckung.
    const bekannt = posten.filter(p => p.kcal !== null)
    return {
      id: e.id,
      meal_type: e.meal_type,
      rezept: e.rezept,
      posten,
      kcal: bekannt.length === 0
        ? null
        : Math.round(bekannt.reduce((s, p) => s + (p.kcal ?? 0), 0) * 10) / 10,
      status: e.status as GhostEintrag['status'],
    }
  })
}
// ════════════════════════════════════════════════════════════════════
// WELCHE MAHLZEIT WIRD IMMER GEWECHSELT — G-309, Punkt 4
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-08-31:** *,,dass er seinen plan dementsprechend
// vielleicht anpassen sollte wenn er eh zb die eine mahlzeit immer
// gewechselt hat weil er es vielleicht nicht mag."*
//
// `[read]` **Das ist etwas anderes als die Einhaltungsquote aus
// G-270.** **Die Quote sagt, WIE VIEL umgesetzt wurde; das hier sagt,
// WELCHE Position stoert.** Eine Quote von 80 % kann heissen: alles
// laeuft, ausser dem Fruehstueck — und genau das soll sichtbar
// werden.
//
// `[cmd]` **Eine Abfrage ueber `status` je `plan_entry_id`** \u2014 der
// Auftrag nennt sie so. **`deviated` UND `skipped` zaehlen**: wer eine
// Position dreimal auslaesst, mag sie so wenig wie einer, der sie
// dreimal austauscht.

/**
 * Welche Planpositionen der Nutzer regelmaessig wechselt \u2014 G-309.
 *
 * `[cmd]` **Der Zeitraum ist beidseitig begrenzt** \u2014 die Seeds
 * reichen in die Zukunft, eine offene Grenze finge sie mit (A-56).
 *
 * `[read]` **Ohne Zeilen gibt es keinen Befund, keine leere Kachel
 * mit 0 %** \u2014 der Auftrag sagt es ausdruecklich: *,,wenn nicht: sag,
 * was fehlt."*
 */
export async function ladeWechselbefunde(
  bisDatum: string, tage = 28,
): Promise<WechselStand> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return LEERER_WECHSELSTAND
  const von = new Date(`${bisDatum}T00:00:00Z`)
  von.setUTCDate(von.getUTCDate() - (tage - 1))

  const { data, error } = await client
    .schema('nutrition')
    .from('meal_plan_logs')
    .select(`
      plan_entry_id, status,
      entry:meal_plan_entries (
        meal_type,
        recipe:recipes ( name_de ),
        food:foods ( name_display_de, name_de )
      )
    `)
    .eq('user_id', user.id)
    .neq('status', 'pending')
    .gte('execution_date', von.toISOString().slice(0, 10))
    .lte('execution_date', bisDatum)
    .limit(1000)
  if (error || !data) return LEERER_WECHSELSTAND

  const jePosition = new Map<string, Wechselbefund>()
  for (const roh of (data as unknown as Array<Record<string, unknown>>)) {
    const id = text(roh.plan_entry_id)
    const status = text(roh.status)
    if (!id || !status) continue
    const e = roh.entry as Record<string, unknown> | null
    const rezept = e?.recipe as Record<string, unknown> | null
    const essen = e?.food as Record<string, unknown> | null

    let b = jePosition.get(id)
    if (!b) {
      b = {
        plan_entry_id: id,
        meal_type: text(e?.meal_type) ?? 'other',
        bezeichnung: text(rezept?.name_de)
          ?? text(essen?.name_display_de) ?? text(essen?.name_de) ?? '\u2014',
        gesamt: 0, abgewichen: 0, ausgelassen: 0, quote: 0,
      }
      jePosition.set(id, b)
    }
    b.gesamt += 1
    if (status === 'deviated') b.abgewichen += 1
    if (status === 'skipped') b.ausgelassen += 1
  }

  const aus: Wechselbefund[] = []
  for (const b of Array.from(jePosition.values())) {
    const gewechselt = b.abgewichen + b.ausgelassen
    // `[read]` **Beide Schwellen, nicht eine** \u2014 2 von 2 ist ein
    // Muster, 2 von 20 nicht.
    if (gewechselt < WECHSEL_AB_MAL) continue
    const quote = gewechselt / b.gesamt
    if (quote < WECHSEL_AB_QUOTE) continue
    aus.push({ ...b, quote: Math.round(quote * 100) / 100 })
  }
  return {
    // Der staerkste Befund zuerst.
    befunde: aus.sort((a, b) => b.quote - a.quote || b.gesamt - a.gesamt),
    entschieden: (data as unknown as unknown[]).length,
  }
}

export type { Wechselbefund, WechselStand } from './plan-lage'
export { LEERER_WECHSELSTAND, WECHSEL_AB_MAL, WECHSEL_AB_QUOTE }
  from './plan-lage'
