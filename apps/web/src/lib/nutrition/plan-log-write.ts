// Der Bestaetigungsweg fuer Plan-Eintraege — G-274.
//
// `[cmd]` **112 Plan-Eintraege ueber 42 Tage, 0 Zeilen im Log** —
// gemessen am 2026-08-30. **Das war die Ursache aller drei Attrappen
// aus G-270.**
//
// ══ DIE REIHENFOLGE STAMMT AUS FLOW 4 ═══════════════════════════════
//
// `[cmd]` **`SPEC_03_USER_FLOWS` Flow 4, Case 1:**
//
//     6. Mahlzeit wird erstellt (Meal + MealItems mit
//        eingefrorenen Naehrstoffen)
//     7. Ghost Entry -> confirmed (oder deviated wenn dkcal > 20%)
//     8. MealPlanLog wird geschrieben
//
// `[read]` **Erst die Mahlzeit, dann das Log.** Das Log verweist auf
// die Mahlzeit (`actual_meal_id` -> `nutrition.meals`), nicht
// umgekehrt — die andere Reihenfolge ginge nicht.
//
// ══ KEIN ZWEITER SCHREIBWEG ═════════════════════════════════════════
//
// `[cmd]` **`createMeal` und `addMealItem` aus G-272 werden gerufen,
// nicht nachgebaut.** Sie frieren die Naehrwerte bereits ein — genau
// das, was Schritt 6 verlangt.
//
// `[cmd]` **Und der Bestand macht es noetig, beide Eintragsarten zu
// koennen:** 72 der 112 Eintraege sind `recipe`, 40 sind `bls`.
// `[read]` **Ein Rezept wird zu seinen Zutaten aufgeloest** — alle
// tragen ein `food_id` (gemessen: 4 von 4, 3 von 3). **`addMealItem`
// verlangt eines; ein Rezept als Ganzes kann es nicht.**
//
// Laeuft ausschliesslich serverseitig.
import { z } from 'zod'

import { createSessionClient } from '@lumeos/shared/session'
import { DiaryWriteError } from './diary-model'
import { addMealItem, createMeal } from './diary-write'
import { zustandVon, type Bestaetigungsart } from './plan-bestaetigung'

export const bestaetigenSchema = z.object({
  art: z.literal('bestaetigen'),
  plan_entry_id: z.string().uuid(),
  /** Flow 4: rueckwirkend erlaubt — das Datum kommt vom Eintrag. */
  execution_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  confirmation_mode: z.enum(['mealcam', 'manual']),
  /**
   * Die tatsaechlichen Mengen, falls abgewichen wurde.
   *
   * `[read]` **Leer heisst „stimmt so"** — Flow 4 Case 2 Schritt 4a.
   * Dann gelten die Planmengen.
   */
  mengen: z.array(z.object({
    food_id: z.string().uuid(),
    amount_g: z.number().positive().finite(),
  })).optional(),
})

export const ueberspringenSchema = z.object({
  art: z.literal('ueberspringen'),
  plan_entry_id: z.string().uuid(),
  execution_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type Bestaetigen = z.infer<typeof bestaetigenSchema>
export type Ueberspringen = z.infer<typeof ueberspringenSchema>

export type LogErgebnis = {
  id: string
  status: string
  actual_meal_id: string | null
  deviation_kcal: number | null
  deviation_pct: number | null
}

/** Ein Posten, der ins Tagebuch geschrieben wird. */
type Posten = { food_id: string; amount_g: number }

async function sitzung() {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new DiaryWriteError('NO_SESSION', 'Keine angemeldete Session.')
  return { client, db: client.schema('nutrition'), user }
}

/**
 * Der Eintrag mit seinem Plan und seinen Posten.
 *
 * `[read]` **Ein Rezepteintrag wird hier aufgeloest**, ein
 * BLS-Eintrag traegt seinen Posten selbst. **Beides endet in
 * derselben Liste**, damit der Schreibweg nur eine Form kennt.
 */
async function eintragLesen(planEntryId: string) {
  const { db } = await sitzung()
  const { data, error } = await db
    .from('meal_plan_entries')
    .select(`
      id, meal_type, entry_type, food_id, recipe_id, amount_g,
      planned_servings,
      recipe:recipes ( servings ),
      day:meal_plan_days ( id, plan_date, week:meal_plan_weeks ( plan_id ) )
    `)
    .eq('id', planEntryId)
    .single()
  if (error) throw new DiaryWriteError('NOT_FOUND', 'Plan-Eintrag nicht gefunden.')

  const e = data as unknown as Record<string, unknown>
  const tag = e.day as Record<string, unknown> | null
  const woche = tag?.week as Record<string, unknown> | null
  const planId = woche?.plan_id
  if (typeof planId !== 'string') {
    throw new DiaryWriteError('NOT_FOUND', 'Der Eintrag hängt an keinem Plan.')
  }

  // G-309: die Portionszahl des Rezepts — sie ist der Nenner.
  //
  // `[cmd]` **`servings` ist `numeric`** — PostgREST liefert das als
  // Zeichenkette. `[read]` **Ein `typeof x === 'number'` waere hier
  // immer falsch gewesen**, und der Nenner still 1 geblieben.
  const rohPortionen = (e.recipe as Record<string, unknown> | null)?.servings
  const rezeptPortionen = typeof rohPortionen === 'string'
    ? Number(rohPortionen) : rohPortionen
  const posten: Posten[] = []
  if (typeof e.food_id === 'string' && typeof e.amount_g === 'number') {
    posten.push({ food_id: e.food_id, amount_g: e.amount_g })
  } else if (typeof e.recipe_id === 'string') {
    // ══ G-309: BERICHTIGT — hier fehlte der Nenner ════════════════
    //
    // `[cmd]` **Hier stand `faktor = planned_servings`**, ohne
    // Division durch `recipes.servings`. `[read]` **Ein Rezept fuer
    // ZWEI Portionen fuehrt die Menge fuer zwei** — wer eine Portion
    // plant, bekommt die Haelfte, nicht das Doppelte.
    //
    // `[cmd]` **Am 2026-09-01 gemessen, Rezept mit `servings = 2`,
    // `planned_servings = 1`:** 400 g Zutat ergaben 400 g statt 200 g.
    //
    // `[read]` **Sichtbar wurde es am Zustand, nicht an der Menge:**
    // eine Bestaetigung mit 600 statt 200 g wurde `confirmed` statt
    // `deviated` — der Vergleichswert war doppelt so gross wie der
    // Plan, und damit sah die Verdreifachung wie eine Unterschreitung
    // aus.
    //
    // `[cmd]` **Zwei andere Stellen rechnen es richtig** und waren der
    // Massstab: `nutrition.meal_plan_day_to_diary` (`ri.amount_g *
    // e.planned_servings / r.servings`) und `ladeGhostEintraege`.
    const portionen = typeof e.planned_servings === 'number' && e.planned_servings > 0
      ? e.planned_servings : 1
    const proRezept = typeof rezeptPortionen === 'number' && rezeptPortionen > 0
      ? rezeptPortionen : 1
    const faktor = portionen / proRezept
    const { data: zutaten } = await db
      .from('recipe_ingredients')
      .select('food_id, amount_g')
      .eq('recipe_id', e.recipe_id)
      .limit(200)
    for (const z of (zutaten ?? []) as unknown as Array<Record<string, unknown>>) {
      if (typeof z.food_id === 'string' && typeof z.amount_g === 'number') {
        posten.push({
          food_id: z.food_id,
          amount_g: Math.round(z.amount_g * faktor * 10) / 10,
        })
      }
    }
  }

  return {
    planId,
    mealType: String(e.meal_type ?? 'other'),
    planDate: typeof tag?.plan_date === 'string' ? tag.plan_date : null,
    posten,
  }
}

/**
 * Die kcal einer Postenliste — fuer den Abweichungsvergleich.
 *
 * `[cmd]` **Ueber `food_nutrient_snapshot`**, dieselbe Funktion, die
 * der Planner benutzt (C-150). **Nicht nachgerechnet.**
 */
async function kcalVon(posten: readonly Posten[]): Promise<number | null> {
  if (posten.length === 0) return null
  const { db } = await sitzung()
  let summe = 0
  let gezaehlt = 0
  // `[read]` **Gleichzeitig, nicht nacheinander** — ein `await` je
  // Posten kostet je Durchlauf voll (G-252).
  const werte = await Promise.all(posten.map(p => db.rpc('food_nutrient_snapshot', {
    p_food_source: 'bls', p_food_id: p.food_id,
    p_custom_food_id: null, p_amount_g: p.amount_g,
  })))
  for (const { data, error } of werte) {
    if (error) continue
    const z = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null
    const k = z?.enercc
    const n = typeof k === 'string' ? Number(k) : k
    if (typeof n === 'number' && Number.isFinite(n)) { summe += n; gezaehlt += 1 }
  }
  return gezaehlt === 0 ? null : Math.round(summe * 10) / 10
}

/**
 * Die Mahlzeit des Tages — vorhandene wiederverwenden.
 *
 * `[cmd]` **`createMeal` wirft `DUPLICATE_MEAL`**, wenn es Tag und
 * Mahlzeitart schon gibt. `[read]` **Bestaetigen darf daran nicht
 * scheitern:** wer mittags schon etwas erfasst hat und dann den
 * Plan bestaetigt, bekommt Posten in dieselbe Mahlzeit.
 */
async function mahlzeitSicherstellen(
  entryDate: string, mealType: string,
): Promise<string> {
  const { db } = await sitzung()
  const { data } = await db
    .from('meals')
    .select('id')
    .eq('entry_date', entryDate)
    .eq('meal_type', mealType)
    .maybeSingle()
  const vorhanden = (data as unknown as { id?: string } | null)?.id
  if (typeof vorhanden === 'string') return vorhanden

  const neu = await createMeal({
    entry_date: entryDate,
    meal_type: mealType as Parameters<typeof createMeal>[0]['meal_type'],
  })
  return neu.id
}

/**
 * Einen Plan-Eintrag bestaetigen — Flow 4, Case 1 und 2.
 *
 * `[read]` **Die Reihenfolge ist die des Flows:** Mahlzeit, Posten,
 * Zustand, Log.
 */
export async function planEintragBestaetigen(
  eingabe: Bestaetigen,
): Promise<LogErgebnis> {
  const { db, user } = await sitzung()
  const eintrag = await eintragLesen(eingabe.plan_entry_id)
  if (eintrag.posten.length === 0) {
    throw new DiaryWriteError(
      'VALIDATION_FAILED',
      'Für diesen Eintrag sind keine Lebensmittel hinterlegt.',
    )
  }

  // Schritt 6: die Mahlzeit mit ihren Posten.
  const geplant = eintrag.posten
  const tatsaechlich: Posten[] = eingabe.mengen && eingabe.mengen.length > 0
    ? eingabe.mengen
    : geplant

  const mealId = await mahlzeitSicherstellen(eingabe.execution_date, eintrag.mealType)
  for (const p of tatsaechlich) {
    await addMealItem({ meal_id: mealId, food_id: p.food_id, amount_g: p.amount_g })
  }

  // Schritt 7: der Zustand aus dem Vergleich.
  const [kcalGeplant, kcalEcht] = await Promise.all([
    kcalVon(geplant),
    eingabe.mengen && eingabe.mengen.length > 0 ? kcalVon(tatsaechlich) : kcalVon(geplant),
  ])
  const z = zustandVon(kcalGeplant, kcalEcht)

  // Schritt 8: das Log. `[cmd]` `UNIQUE (plan_entry_id,
  // execution_date)` — ein Eintrag je Tag, deshalb `upsert`.
  const jetzt = new Date().toISOString()
  const { data, error } = await db
    .from('meal_plan_logs')
    .upsert({
      plan_id: eintrag.planId,
      plan_entry_id: eingabe.plan_entry_id,
      user_id: user.id,
      execution_date: eingabe.execution_date,
      status: z.status,
      actual_meal_id: mealId,
      confirmation_mode: eingabe.confirmation_mode satisfies Bestaetigungsart,
      deviation_kcal: z.status === 'deviated' ? z.kcal : null,
      deviation_pct: z.status === 'deviated' ? z.pct : null,
      confirmed_at: jetzt,
      skipped_at: null,
    }, { onConflict: 'plan_entry_id,execution_date' })
    .select('id, status, actual_meal_id, deviation_kcal, deviation_pct')
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  return data as unknown as LogErgebnis
}

/**
 * Einen Plan-Eintrag ueberspringen — Flow 4.
 *
 * `[cmd]` **Kein Tagebucheintrag:** *,,Status -> skipped, Ghost Entry
 * ausgegraut."* `[read]` **Wer nichts isst, hat nichts gegessen** —
 * eine Mahlzeit anzulegen waere hier falsch.
 */
export async function planEintragUeberspringen(
  eingabe: Ueberspringen,
): Promise<LogErgebnis> {
  const { db, user } = await sitzung()
  const eintrag = await eintragLesen(eingabe.plan_entry_id)
  const { data, error } = await db
    .from('meal_plan_logs')
    .upsert({
      plan_id: eintrag.planId,
      plan_entry_id: eingabe.plan_entry_id,
      user_id: user.id,
      execution_date: eingabe.execution_date,
      status: 'skipped',
      actual_meal_id: null,
      confirmation_mode: null,
      deviation_kcal: null,
      deviation_pct: null,
      confirmed_at: null,
      skipped_at: new Date().toISOString(),
    }, { onConflict: 'plan_entry_id,execution_date' })
    .select('id, status, actual_meal_id, deviation_kcal, deviation_pct')
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  return data as unknown as LogErgebnis
}
