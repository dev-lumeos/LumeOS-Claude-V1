// Reines Modell für Food-Präferenzen (C-02, M3 erster Schreibpfad).
// KEIN I/O, KEIN Import von nutrition-db — dieses Modul wird von
// Client-Komponenten und den Unit-Tests geladen; die Schreib-/Lese-IO
// liegt in preferences-write.ts. Ableitungsregeln existieren genau hier.
import { z } from 'zod'

export const FOOD_PREFERENCE_KINDS = ['liked', 'disliked', 'hard_exclude'] as const
export type FoodPreferenceKind = (typeof FOOD_PREFERENCE_KINDS)[number]

export const foodPreferenceWriteSchema = z.object({
  food_id: z.string().uuid('food_id muss eine UUID sein.'),
  preference: z.enum(FOOD_PREFERENCE_KINDS),
})
export type FoodPreferenceWrite = z.infer<typeof foodPreferenceWriteSchema>

export const foodPreferenceDeleteSchema = z.object({
  food_id: z.string().uuid('food_id muss eine UUID sein.'),
})
export type FoodPreferenceDelete = z.infer<typeof foodPreferenceDeleteSchema>

/** Zeile aus nutrition.food_preference_items, auf das UI-relevante reduziert. */
export type StoredFoodPreferenceItem = {
  id: string
  food_id: string
  preference: FoodPreferenceKind
}

/** strength je Präferenzart — deckungsgleich mit dem CHECK in 050. */
export function strengthForPreference(kind: FoodPreferenceKind): 'like' | 'soft_dislike' | 'hard_exclude' {
  switch (kind) {
    case 'liked':
      return 'like'
    case 'disliked':
      return 'soft_dislike'
    case 'hard_exclude':
      return 'hard_exclude'
  }
}

/** Insert-Payload für nutrition.food_preference_items (target_type food). */
export function buildFoodPreferenceInsert(userId: string, input: FoodPreferenceWrite) {
  return {
    user_id: userId,
    preference: input.preference,
    strength: strengthForPreference(input.preference),
    target_type: 'food' as const,
    food_id: input.food_id,
    source: 'user' as const,
  }
}

/**
 * Entscheidung für den Schreibpfad: neue Zeile, Umstufung einer bestehenden,
 * oder Duplikat (gleiche Präferenz existiert bereits → 409 in der Route).
 */
export function decideFoodPreferenceWrite(
  existing: StoredFoodPreferenceItem | undefined,
  wanted: FoodPreferenceKind,
): 'insert' | 'update' | 'duplicate' {
  if (!existing) return 'insert'
  if (existing.preference === wanted) return 'duplicate'
  return 'update'
}

/** Gruppiert gespeicherte Food-Items für die Preview-RPC-Argumente. */
export function summarizeFoodPreferenceItems(items: StoredFoodPreferenceItem[]): {
  likedFoodIds: string[]
  dislikedFoodIds: string[]
  excludedFoodIds: string[]
} {
  const likedFoodIds: string[] = []
  const dislikedFoodIds: string[] = []
  const excludedFoodIds: string[] = []
  for (const item of items) {
    if (item.preference === 'liked') likedFoodIds.push(item.food_id)
    else if (item.preference === 'disliked') dislikedFoodIds.push(item.food_id)
    else excludedFoodIds.push(item.food_id)
  }
  return { likedFoodIds, dislikedFoodIds, excludedFoodIds }
}

/** Rohzeilen (z. B. aus PostgREST) defensiv auf das Modell filtern. */
export function parseStoredFoodPreferenceItems(rows: unknown): StoredFoodPreferenceItem[] {
  if (!Array.isArray(rows)) return []
  const kinds = new Set<string>(FOOD_PREFERENCE_KINDS)
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    if (
      typeof record.id !== 'string' ||
      typeof record.food_id !== 'string' ||
      typeof record.preference !== 'string' ||
      !kinds.has(record.preference)
    ) {
      return []
    }
    return [{ id: record.id, food_id: record.food_id, preference: record.preference as FoodPreferenceKind }]
  })
}

/** Stabile Fehlercodes des Schreibpfads (Konvention §6: Code ist Vertrag). */
export type PreferenceWriteErrorCode =
  | 'NO_SESSION'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN_FOOD'
  | 'DUPLICATE_PREFERENCE'
  | 'NOT_FOUND'
  | 'DB_UNAVAILABLE'
  | 'WRITE_FAILED'

export class PreferenceWriteError extends Error {
  constructor(
    readonly code: PreferenceWriteErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'PreferenceWriteError'
  }
}

/** HTTP-Status je Fehlercode — eine Zuordnung, von Route und Tests genutzt. */
export function httpStatusForPreferenceError(code: PreferenceWriteErrorCode): number {
  switch (code) {
    case 'NO_SESSION':
      return 401
    case 'VALIDATION_FAILED':
    case 'UNKNOWN_FOOD':
      return 400
    case 'DUPLICATE_PREFERENCE':
      return 409
    case 'NOT_FOUND':
      return 404
    case 'DB_UNAVAILABLE':
      return 503
    case 'WRITE_FAILED':
      return 500
  }
}
