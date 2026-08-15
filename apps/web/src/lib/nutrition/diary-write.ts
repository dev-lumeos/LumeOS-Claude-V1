// Schreib- und Lese-I/O für das Nutrition-Diary (C-03 / WP-02, ADR-0003).
// RLS-konform: Session-Client mit der Identität der Nutzerin, user_id wird
// explizit auf auth.uid() gesetzt (WITH CHECK der Insert-Policies), kein
// Service-Schlüssel, kein docker exec. Reine Logik liegt in
// diary-model.ts — hier nur der Datenbankverkehr.
// Läuft ausschliesslich serverseitig (Route mit runtime 'nodejs').

import { createSessionClient } from '@lumeos/shared/session'
import { isDbUnavailableMessage } from '@lumeos/shared/nutrition/db'
import {
  DiaryWriteError,
  buildMealInsert,
  buildMealItemAmountUpdate,
  buildMealItemInsert,
  computeFrozenNutrients,
  parseStoredMealItems,
  parseStoredMeals,
  type FoodNutrientRow,
  type MealCreate,
  type MealItemCreate,
  type MealItemUpdate,
  type StoredMeal,
  type StoredMealItem,
} from './diary-model'

function classifyDbError(message: string, fallback: 'WRITE_FAILED'): DiaryWriteError {
  if (isDbUnavailableMessage(message)) {
    return new DiaryWriteError('DB_UNAVAILABLE', `Nutrition database unavailable: ${message}`)
  }
  return new DiaryWriteError(fallback, message)
}

async function requireSession() {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new DiaryWriteError('NO_SESSION', 'Keine angemeldete Session.')
  }
  return { supabase, userId: user.id }
}

/** Eigene Mahlzeiten eines Tages (RLS begrenzt auf auth.uid()-Zeilen). */
export async function listOwnMeals(entryDate: string): Promise<StoredMeal[]> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('meals')
    .select('id, entry_date, meal_type, notes')
    .eq('entry_date', entryDate)
    .order('created_at', { ascending: true })
  if (error) {
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }
  return parseStoredMeals(data)
}

/** Positionen einer eigenen Mahlzeit. */
export async function listOwnMealItems(mealId: string): Promise<StoredMealItem[]> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('meal_items')
    .select('id, meal_id, food_id, food_name, amount_g, enercc, prot625, fat, cho')
    .eq('meal_id', mealId)
    .order('created_at', { ascending: true })
  if (error) {
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }
  return parseStoredMealItems(data)
}

/**
 * Mahlzeit anlegen. Insert zuerst — die Wahrheit über Duplikate ist der
 * UNIQUE-Index uq_meals_user_date_type (23505), nicht ein Select vorab
 * (das wäre eine Race Condition, siehe C-02/C-12).
 */
export async function createMeal(input: MealCreate): Promise<StoredMeal> {
  const { supabase, userId } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('meals')
    .insert(buildMealInsert(userId, input))
    .select('id, entry_date, meal_type, notes')
  if (error) {
    if (error.code === '23505') {
      throw new DiaryWriteError(
        'DUPLICATE_MEAL',
        'Für diesen Tag und Mahlzeittyp existiert bereits ein Eintrag.',
      )
    }
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }
  const meal = parseStoredMeals(data)[0]
  if (!meal) {
    throw new DiaryWriteError('WRITE_FAILED', 'Insert lieferte keine Zeile zurück.')
  }
  return meal
}

/**
 * Nährwerte eines Lebensmittels laden — Grundlage des Einfrierens.
 * Liest über den Session-Client: food_nutrients trägt eine SELECT-Policy
 * für authenticated (060), ein Service-Schlüssel ist nicht nötig.
 */
async function loadFoodForFreezing(
  supabase: ReturnType<typeof createSessionClient>,
  foodId: string,
): Promise<{ name: string; rows: FoodNutrientRow[] }> {
  const nutrition = supabase.schema('nutrition')

  const { data: foodRows, error: foodError } = await nutrition
    .from('foods')
    .select('id, name_de, name_display_de')
    .eq('id', foodId)
    .limit(1)
  if (foodError) {
    throw classifyDbError(foodError.message, 'WRITE_FAILED')
  }
  const food = Array.isArray(foodRows) ? foodRows[0] : undefined
  if (!food) {
    throw new DiaryWriteError('UNKNOWN_FOOD', 'Unbekannte food_id.')
  }

  const { data: nutrientRows, error: nutrientError } = await nutrition
    .from('food_nutrients')
    .select('nutrient_code, value')
    .eq('food_id', foodId)
  if (nutrientError) {
    throw classifyDbError(nutrientError.message, 'WRITE_FAILED')
  }

  const rows: FoodNutrientRow[] = Array.isArray(nutrientRows)
    ? nutrientRows.flatMap(row => {
        if (!row || typeof row !== 'object') return []
        const record = row as Record<string, unknown>
        if (typeof record.nutrient_code !== 'string') return []
        // PostgREST liefert numeric als String.
        const value = typeof record.value === 'string' ? Number(record.value) : record.value
        if (typeof value !== 'number' || !Number.isFinite(value)) return []
        return [{ nutrient_code: record.nutrient_code, value }]
      })
    : []

  const record = food as Record<string, unknown>
  const name =
    (typeof record.name_display_de === 'string' && record.name_display_de) ||
    (typeof record.name_de === 'string' && record.name_de) ||
    'Unbenannt'
  return { name, rows }
}

/**
 * Position zu einer Mahlzeit hinzufügen — Nährwerte werden hier
 * EINGEFROREN (ADR-0003). Die Berechnung selbst liegt in diary-model
 * (computeFrozenNutrients); hier nur Laden und Schreiben.
 */
export async function addMealItem(input: MealItemCreate): Promise<StoredMealItem> {
  const { supabase, userId } = await requireSession()
  const { name, rows } = await loadFoodForFreezing(supabase, input.food_id)
  const frozen = computeFrozenNutrients(rows, input.amount_g)

  const { data, error } = await supabase
    .schema('nutrition')
    .from('meal_items')
    .insert(buildMealItemInsert(userId, input, name, frozen))
    .select('id, meal_id, food_id, food_name, amount_g, enercc, prot625, fat, cho')
  if (error) {
    if (error.code === '23503') {
      // FK auf meals(id) oder foods(id) — bzw. der Wachhund-Trigger.
      throw new DiaryWriteError('UNKNOWN_FOOD', 'Unbekannte meal_id oder food_id.')
    }
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }
  const item = parseStoredMealItems(data)[0]
  if (!item) {
    throw new DiaryWriteError('WRITE_FAILED', 'Insert lieferte keine Zeile zurück.')
  }
  return item
}

/**
 * Menge einer Position ändern. Die eingefrorenen Werte werden NEU
 * berechnet — die Datenbank rechnet bewusst nicht nach (Dateikopf 052:
 * zwei Kopien derselben Rechenregel driften). Wer hier nur amount_g
 * schriebe, hinterliesse Werte, die zur Menge nicht passen.
 */
export async function updateMealItemAmount(input: MealItemUpdate): Promise<StoredMealItem> {
  const { supabase } = await requireSession()
  const nutrition = supabase.schema('nutrition')

  const { data: existingRows, error: readError } = await nutrition
    .from('meal_items')
    .select('id, food_id')
    .eq('id', input.id)
    .limit(1)
  if (readError) {
    throw classifyDbError(readError.message, 'WRITE_FAILED')
  }
  const existing = Array.isArray(existingRows) ? existingRows[0] : undefined
  if (!existing) {
    // RLS macht "existiert nicht" und "gehört jemand anderem" bewusst
    // ununterscheidbar (kein Informationsleck über fremde Zeilen).
    throw new DiaryWriteError('NOT_FOUND', 'Keine eigene Position mit dieser id.')
  }
  const foodId = (existing as Record<string, unknown>).food_id
  if (typeof foodId !== 'string') {
    throw new DiaryWriteError('WRITE_FAILED', 'Position ohne food_id lässt sich nicht neu berechnen.')
  }

  const { rows } = await loadFoodForFreezing(supabase, foodId)
  const frozen = computeFrozenNutrients(rows, input.amount_g)

  const { data, error } = await nutrition
    .from('meal_items')
    .update(buildMealItemAmountUpdate(input.amount_g, frozen))
    .eq('id', input.id)
    .select('id, meal_id, food_id, food_name, amount_g, enercc, prot625, fat, cho')
  if (error) {
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }
  const item = parseStoredMealItems(data)[0]
  if (!item) {
    throw new DiaryWriteError('NOT_FOUND', 'Keine eigene Position mit dieser id.')
  }
  return item
}

/**
 * Position entfernen. 0 gelöschte Zeilen -> NOT_FOUND — RLS macht
 * "existiert nicht" und "gehört jemand anderem" ununterscheidbar.
 */
export async function removeMealItem(itemId: string): Promise<{ removed: number }> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('meal_items')
    .delete()
    .eq('id', itemId)
    .select('id')
  if (error) {
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }
  const removed = Array.isArray(data) ? data.length : 0
  if (removed === 0) {
    throw new DiaryWriteError('NOT_FOUND', 'Keine eigene Position mit dieser id.')
  }
  return { removed }
}
