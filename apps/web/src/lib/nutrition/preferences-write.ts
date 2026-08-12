// Schreib- und Lese-I/O für Food-Präferenzen (C-02, M3 erster Schreibpfad).
// RLS-konform: Session-Client mit der Identität der Nutzerin, user_id wird
// explizit auf auth.uid() gesetzt (WITH CHECK der Insert-Policy), kein
// Service-Schlüssel, kein docker exec. Reine Logik liegt in
// preferences-model.ts — hier nur der Datenbankverkehr.
// Läuft ausschliesslich serverseitig (Route mit runtime 'nodejs').

import { createSessionClient } from '@lumeos/shared/session'
import { isDbUnavailableMessage } from '@lumeos/shared/nutrition/db'
import {
  PreferenceWriteError,
  buildFoodPreferenceInsert,
  decideFoodPreferenceWrite,
  parseStoredFoodPreferenceItems,
  strengthForPreference,
  type FoodPreferenceWrite,
  type StoredFoodPreferenceItem,
} from './preferences-model'

function classifyDbError(message: string, fallback: 'WRITE_FAILED'): PreferenceWriteError {
  if (isDbUnavailableMessage(message)) {
    return new PreferenceWriteError('DB_UNAVAILABLE', `Nutrition database unavailable: ${message}`)
  }
  return new PreferenceWriteError(fallback, message)
}

async function requireSession() {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new PreferenceWriteError('NO_SESSION', 'Keine angemeldete Session.')
  }
  return { supabase, userId: user.id }
}

/** Eigene Food-Präferenzen (RLS begrenzt auf auth.uid()-Zeilen). */
export async function listOwnFoodPreferenceItems(): Promise<StoredFoodPreferenceItem[]> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('food_preference_items')
    .select('id, food_id, preference')
    .eq('target_type', 'food')
    .order('created_at', { ascending: true })
  if (error) {
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }
  return parseStoredFoodPreferenceItems(data)
}

/**
 * Favorit/Abneigung/Ausschluss setzen. Insert zuerst — die Wahrheit über
 * Duplikate ist der UNIQUE-Index uq_food_pref_items_user_food (23505),
 * nicht ein Select vorab (das wäre eine Race Condition). Erst NACH einem
 * 23505 wird gelesen und entschieden: gleiche Präferenz -> DUPLICATE,
 * andere -> Umstufung per UPDATE derselben Zeile.
 */
export async function setFoodPreference(
  input: FoodPreferenceWrite,
): Promise<{ action: 'insert' | 'update'; item: StoredFoodPreferenceItem }> {
  const { supabase, userId } = await requireSession()
  const nutrition = supabase.schema('nutrition')

  const { data, error } = await nutrition
    .from('food_preference_items')
    .insert(buildFoodPreferenceInsert(userId, input))
    .select('id, food_id, preference')
  if (!error) {
    const item = parseStoredFoodPreferenceItems(data)[0]
    if (!item) {
      throw new PreferenceWriteError('WRITE_FAILED', 'Insert lieferte keine Zeile zurück.')
    }
    return { action: 'insert', item }
  }
  if (error.code === '23503') {
    // FK auf nutrition.foods(id) — unbekannte food_id.
    throw new PreferenceWriteError('UNKNOWN_FOOD', 'Unbekannte food_id.')
  }
  if (error.code !== '23505') {
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }

  // 23505: es existiert bereits eine Zeile zu (user, food).
  const { data: existingRows, error: readError } = await nutrition
    .from('food_preference_items')
    .select('id, food_id, preference')
    .eq('target_type', 'food')
    .eq('food_id', input.food_id)
  if (readError) {
    throw classifyDbError(readError.message, 'WRITE_FAILED')
  }
  const existing = parseStoredFoodPreferenceItems(existingRows)[0]
  if (!existing) {
    // Konflikt gemeldet, aber keine eigene Zeile lesbar — unerwartet.
    throw new PreferenceWriteError('WRITE_FAILED', 'Konflikt gemeldet, aber keine eigene Zeile lesbar.')
  }
  if (decideFoodPreferenceWrite(existing, input.preference) === 'duplicate') {
    throw new PreferenceWriteError(
      'DUPLICATE_PREFERENCE',
      'Diese Präferenz ist für dieses Lebensmittel bereits gesetzt.',
    )
  }

  const { data: updated, error: updateError } = await nutrition
    .from('food_preference_items')
    .update({ preference: input.preference, strength: strengthForPreference(input.preference) })
    .eq('id', existing.id)
    .select('id, food_id, preference')
  if (updateError) {
    throw classifyDbError(updateError.message, 'WRITE_FAILED')
  }
  const item = parseStoredFoodPreferenceItems(updated)[0]
  if (!item) {
    // Zeile zwischenzeitlich gelöscht (Race mit DELETE).
    throw new PreferenceWriteError('NOT_FOUND', 'Kein eigener Präferenz-Eintrag zu diesem Lebensmittel.')
  }
  return { action: 'update', item }
}

/**
 * Präferenz zu einem Food entfernen. 0 gelöschte Zeilen -> NOT_FOUND —
 * RLS macht "existiert nicht" und "gehört jemand anderem" bewusst
 * ununterscheidbar (kein Informationsleck über fremde Zeilen).
 */
export async function removeFoodPreference(foodId: string): Promise<{ removed: number }> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('food_preference_items')
    .delete()
    .eq('target_type', 'food')
    .eq('food_id', foodId)
    .select('id')
  if (error) {
    throw classifyDbError(error.message, 'WRITE_FAILED')
  }
  const removed = Array.isArray(data) ? data.length : 0
  if (removed === 0) {
    throw new PreferenceWriteError('NOT_FOUND', 'Kein eigener Präferenz-Eintrag zu diesem Lebensmittel.')
  }
  return { removed }
}
