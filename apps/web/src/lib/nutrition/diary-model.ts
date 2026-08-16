// Reines Modell für das Nutrition-Diary (C-03 / WP-02, ADR-0003).
// KEIN I/O, KEIN Import von nutrition-db — dieses Modul wird von
// Client-Komponenten und den Unit-Tests geladen; die Schreib-/Lese-IO
// liegt in diary-write.ts. Die Rechenregel existiert genau hier.
import { z } from 'zod'

/**
 * BEZUGSGRÖSSE — die tragende Regel dieses Moduls.
 *
 * Die Werte in `nutrition.food_nutrients` gelten je **100 g** essbarem
 * Anteil (BLS-Konvention). `[cmd]` 2026-08-06 aus den Daten belegt:
 * max(CHO) = max(FAT) = exakt 100.00000 g; Cornflakes gezuckert
 * (C515600) trägt CHO 88,35 / FAT 0,54 / PROT625 4,62.
 *
 * Daraus folgt der Faktor. Wer diese Konstante ändert, ändert jede
 * Nährwertberechnung des Diary.
 * Dokumentiert in docs/ssot/34-naehrwert-bezugsgroesse.md.
 */
export const NUTRIENT_REFERENCE_GRAMS = 100

/** Mahlzeittypen — deckungsgleich mit dem CHECK in 052. */
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre_workout',
  'post_workout',
  'other',
] as const
export type MealType = (typeof MEAL_TYPES)[number]

/**
 * Herkunft einer Position — deckungsgleich mit dem CHECK in 052.
 * 'custom'/'mealcam' aus SPEC_06 fehlen bewusst: die zugehörigen Tabellen
 * existieren nicht (Entscheidung Tom, 2026-08-06 — ein CHECK auf nicht
 * existierende Quellen wäre eine Behauptung ohne Deckung).
 */
export const FOOD_SOURCES = ['bls', 'manual'] as const
export type FoodSource = (typeof FOOD_SOURCES)[number]

/**
 * Die neun Schnell-Makros, die in 052 als eigene Spalten liegen.
 * Reihenfolge und Codes `[cmd]` gegen nutrition.nutrient_defs geprüft
 * (2026-08-06: alle neun vorhanden).
 * Schlüssel = Spaltenname in meal_items, Wert = Code in food_nutrients.
 */
export const QUICK_MACRO_COLUMNS = {
  enercc: 'ENERCC',
  prot625: 'PROT625',
  fat: 'FAT',
  cho: 'CHO',
  fibt: 'FIBT',
  sugar: 'SUGAR',
  fasat: 'FASAT',
  nacl: 'NACL',
  water_g: 'WATER',
} as const
export type QuickMacroColumn = keyof typeof QUICK_MACRO_COLUMNS

export const mealCreateSchema = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'entry_date muss YYYY-MM-DD sein.'),
  meal_type: z.enum(MEAL_TYPES),
  notes: z.string().max(2000).optional(),
})
export type MealCreate = z.infer<typeof mealCreateSchema>

export const mealItemCreateSchema = z.object({
  meal_id: z.string().uuid('meal_id muss eine UUID sein.'),
  food_id: z.string().uuid('food_id muss eine UUID sein.'),
  amount_g: z.number().positive('amount_g muss grösser als 0 sein.').finite(),

  // C-51: die gewählte Portion, als Schnappschuss. Entweder alle drei
  // oder keines — `[cmd]` genau so prüft es der CHECK in 058a.
  portion_name: z.string().min(1).max(200).optional(),
  portion_quantity: z.number().positive().finite().optional(),
  portion_amount_g: z.number().positive().finite().optional(),
})
  .refine(
    d => {
      const gesetzt = [d.portion_name, d.portion_quantity, d.portion_amount_g]
        .filter(v => v !== undefined).length
      return gesetzt === 0 || gesetzt === 3
    },
    { message: 'Portion braucht Name, Anzahl und Gramm je Portion — oder nichts davon.' },
  )
  .refine(
    d => d.portion_quantity === undefined || d.portion_amount_g === undefined ||
         // Der CHECK erlaubt 0,01 Abweichung; hier dieselbe Grenze,
         // damit die Meldung aus der Anwendung kommt und nicht aus
         // Postgres.
         Math.abs(d.amount_g - d.portion_quantity * d.portion_amount_g) <= 0.01,
    { message: 'amount_g muss Anzahl × Gramm je Portion sein.', path: ['amount_g'] },
  )
export type MealItemCreate = z.infer<typeof mealItemCreateSchema>

export const mealItemUpdateSchema = z.object({
  id: z.string().uuid('id muss eine UUID sein.'),
  amount_g: z.number().positive('amount_g muss grösser als 0 sein.').finite(),
})
export type MealItemUpdate = z.infer<typeof mealItemUpdateSchema>

/** Eine Zeile aus nutrition.food_nutrients, auf das Nötige reduziert. */
export type FoodNutrientRow = {
  nutrient_code: string
  value: number
}

/** Auf die Menge gerechnete Nährwerte, bereit zum Einfrieren. */
export type FrozenNutrients = {
  /** Vollständiger Schnappschuss: { CODE: wert }. */
  nutrients: Record<string, number>
  /** Die neun Schnell-Makros als Spaltenwerte (null wenn nicht vorhanden). */
  macros: Record<QuickMacroColumn, number | null>
}

/**
 * Der Faktor für eine Menge. Menge 150 g → 1,5.
 * Getrennt herausgezogen, damit die Regel an genau einer Stelle steht.
 */
export function portionFactor(amountGrams: number): number {
  return amountGrams / NUTRIENT_REFERENCE_GRAMS
}

/**
 * Rundung auf 5 Nachkommastellen — deckungsgleich mit numeric(12,5) in
 * food_nutrients. Ohne Rundung schleppt der JSONB-Schnappschuss
 * Gleitkomma-Artefakte mit (0.1 * 3 = 0.30000000000000004).
 */
function round5(value: number): number {
  return Math.round(value * 1e5) / 1e5
}

/**
 * Rechnet die Nährwerte eines Lebensmittels auf eine Menge um.
 *
 * Ein FEHLENDER Nährwert ist NICHT 0: Codes ohne Zeile in food_nutrients
 * erscheinen nicht im Schnappschuss, und die zugehörige Makro-Spalte
 * bleibt null. Das ist der Unterschied zwischen "enthält nichts davon"
 * und "wurde nie gemessen".
 */
export function computeFrozenNutrients(rows: FoodNutrientRow[], amountGrams: number): FrozenNutrients {
  const factor = portionFactor(amountGrams)
  const nutrients: Record<string, number> = {}
  for (const row of rows) {
    if (!row || typeof row.nutrient_code !== 'string' || !Number.isFinite(row.value)) continue
    nutrients[row.nutrient_code] = round5(row.value * factor)
  }
  const macros = {} as Record<QuickMacroColumn, number | null>
  for (const column of Object.keys(QUICK_MACRO_COLUMNS) as QuickMacroColumn[]) {
    const code = QUICK_MACRO_COLUMNS[column]
    macros[column] = code in nutrients ? nutrients[code] : null
  }
  return { nutrients, macros }
}

/** Insert-Payload für nutrition.meals. */
export function buildMealInsert(userId: string, input: MealCreate) {
  return {
    user_id: userId,
    entry_date: input.entry_date,
    meal_type: input.meal_type,
    notes: input.notes ?? null,
  }
}

/**
 * Insert-Payload für nutrition.meal_items — mit eingefrorenen Werten.
 *
 * `frozen_at` wird bewusst NICHT gesetzt: die Datenbank vergibt now()
 * als DEFAULT. Ein clientseitiger Zeitstempel wäre manipulierbar und
 * hinge an der Uhr des Aufrufers.
 */
export function buildMealItemInsert(
  userId: string,
  input: MealItemCreate,
  foodName: string,
  frozen: FrozenNutrients,
) {
  return {
    meal_id: input.meal_id,
    user_id: userId,
    food_id: input.food_id,
    food_source: 'bls' as const,
    food_name: foodName,
    amount_g: input.amount_g,
    // C-51: Die Gramm je Portion werden MITGESCHRIEBEN, nicht als
    // Verweis auf foods_portions. `[read]` Sonst hinge ein erfasster
    // Tag an einer Tabelle, die sich ändern kann — derselbe Grund wie
    // beim Einfrieren der Nährwerte.
    portion_name: input.portion_name ?? null,
    portion_quantity: input.portion_quantity ?? null,
    portion_amount_g: input.portion_amount_g ?? null,
    ...frozen.macros,
    nutrients: frozen.nutrients,
  }
}

/**
 * Update-Payload beim nachträglichen Ändern der Menge.
 *
 * Die Werte werden NEU eingefroren, inklusive frozen_at — sonst behauptete
 * der Zeitstempel einen Stand, gegen den nicht gerechnet wurde. Genau
 * dieser Fall ist im Dateikopf von 052 als Anwendungspflicht benannt:
 * die Datenbank rechnet NICHT nach.
 */
export function buildMealItemAmountUpdate(amountGrams: number, frozen: FrozenNutrients) {
  return {
    amount_g: amountGrams,
    ...frozen.macros,
    nutrients: frozen.nutrients,
    frozen_at: new Date().toISOString(),
  }
}

/** Zeile aus nutrition.meals, auf das UI-relevante reduziert. */
export type StoredMeal = {
  id: string
  entry_date: string
  meal_type: MealType
  notes: string | null
}

/** Zeile aus nutrition.meal_items, auf das UI-relevante reduziert. */
export type StoredMealItem = {
  id: string
  meal_id: string
  food_id: string | null
  food_name: string
  amount_g: number
  enercc: number | null
  prot625: number | null
  fat: number | null
  cho: number | null
}

function asNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  // PostgREST liefert numeric als String, damit keine Präzision verloren geht.
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null
}

/** Rohzeilen defensiv auf das Modell filtern (Muster aus preferences-model). */
export function parseStoredMeals(rows: unknown): StoredMeal[] {
  if (!Array.isArray(rows)) return []
  const types = new Set<string>(MEAL_TYPES)
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    if (
      typeof record.id !== 'string' ||
      typeof record.entry_date !== 'string' ||
      typeof record.meal_type !== 'string' ||
      !types.has(record.meal_type)
    ) {
      return []
    }
    return [
      {
        id: record.id,
        entry_date: record.entry_date,
        meal_type: record.meal_type as MealType,
        notes: typeof record.notes === 'string' ? record.notes : null,
      },
    ]
  })
}

export function parseStoredMealItems(rows: unknown): StoredMealItem[] {
  if (!Array.isArray(rows)) return []
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    if (
      typeof record.id !== 'string' ||
      typeof record.meal_id !== 'string' ||
      typeof record.food_name !== 'string'
    ) {
      return []
    }
    const amount = asNumberOrNull(record.amount_g)
    if (amount === null) return []
    return [
      {
        id: record.id,
        meal_id: record.meal_id,
        food_id: typeof record.food_id === 'string' ? record.food_id : null,
        food_name: record.food_name,
        amount_g: amount,
        enercc: asNumberOrNull(record.enercc),
        prot625: asNumberOrNull(record.prot625),
        fat: asNumberOrNull(record.fat),
        cho: asNumberOrNull(record.cho),
      },
    ]
  })
}

/**
 * Summiert Positionen für die Anzeige einer Mahlzeit.
 *
 * ACHTUNG, Abgrenzung zu C-04: das hier ist eine Anzeige-Hilfe über eine
 * bereits geladene Liste, KEIN Aggregationsweg für Tagessummen. Welche
 * Form die Tagessumme bekommt (Sicht, materialisierte Sicht,
 * Summentabelle), entscheidet C-04.
 * Null bleibt null: fehlt bei einer Position ein Wert, wird er nicht als
 * 0 mitgezählt — sonst behauptet die Summe eine Genauigkeit, die es nicht gibt.
 */
export function sumMealItemMacros(items: StoredMealItem[]): {
  enercc: number | null
  prot625: number | null
  fat: number | null
  cho: number | null
  incompleteFields: string[]
} {
  const fields = ['enercc', 'prot625', 'fat', 'cho'] as const
  const totals: Record<string, number | null> = {}
  const incompleteFields: string[] = []
  for (const field of fields) {
    let sum = 0
    let seen = 0
    let missing = false
    for (const item of items) {
      const value = item[field]
      if (value === null) missing = true
      else {
        sum += value
        seen += 1
      }
    }
    totals[field] = seen === 0 ? null : round5(sum)
    if (missing) incompleteFields.push(field)
  }
  return {
    enercc: totals.enercc,
    prot625: totals.prot625,
    fat: totals.fat,
    cho: totals.cho,
    incompleteFields,
  }
}

/** Stabile Fehlercodes des Diary-Schreibpfads (Konvention §6). */
export type DiaryWriteErrorCode =
  | 'NO_SESSION'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN_FOOD'
  | 'DUPLICATE_MEAL'
  | 'NOT_FOUND'
  | 'DB_UNAVAILABLE'
  | 'WRITE_FAILED'

export class DiaryWriteError extends Error {
  constructor(
    readonly code: DiaryWriteErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'DiaryWriteError'
  }
}

/** HTTP-Status je Fehlercode — eine Zuordnung, von Route und Tests genutzt. */
export function httpStatusForDiaryError(code: DiaryWriteErrorCode): number {
  switch (code) {
    case 'NO_SESSION':
      return 401
    case 'VALIDATION_FAILED':
    case 'UNKNOWN_FOOD':
      return 400
    case 'DUPLICATE_MEAL':
      return 409
    case 'NOT_FOUND':
      return 404
    case 'DB_UNAVAILABLE':
      return 503
    case 'WRITE_FAILED':
      return 500
  }
}
