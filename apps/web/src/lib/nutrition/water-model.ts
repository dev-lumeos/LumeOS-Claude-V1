// Reines Modell für Water Tracking (C-05 / WP-04).
// KEIN I/O — die Abfragen liegen in water-write.ts. Die Regeln zu
// Einheit und Lücken existieren genau hier.
import { z } from 'zod'

import { DiaryWriteError, type DiaryWriteErrorCode } from './diary-model'

/**
 * EINHEIT — die tragende Festlegung dieses Moduls.
 *
 * Alle Mengen sind **Milliliter**. Es gibt bewusst keine Einheitsspalte:
 * `[read]` SPEC_06 nennt `amount_ml`, SPEC_04 die Quick-Add-Mengen in ml.
 * Eine Einheitsspalte lädt dazu ein, sie beim Summieren zu vergessen —
 * dann addiert jemand Liter und Milliliter. Umrechnung gehört in die
 * Anzeige, nicht in die Ablage.
 */
export const WATER_UNIT = 'ml' as const

/**
 * Für Wasser gilt 1 g = 1 ml (Dichte 1 g/cm³). Das Nahrungswasser kommt
 * aus `meal_items.water_g` — `[cmd]` Einheit `g` laut `nutrient_defs`.
 * Der Faktor steht als Konstante, damit die physikalische Annahme
 * sichtbar ist statt stillschweigend.
 */
export const GRAMS_TO_ML = 1

/** Herkunft eines Eintrags — deckungsgleich mit dem CHECK in 055. */
export const WATER_SOURCES = ['manual', 'quick_add'] as const
export type WaterSource = (typeof WATER_SOURCES)[number]

/**
 * Quick-Add-Mengen. `[read]` SPEC_04 Feature 8: 250/500/750/1000 ml,
 * laut Spezifikation über Settings konfigurierbar — diese Liste ist der
 * Standard, bis es Settings dafür gibt.
 */
export const WATER_QUICK_AMOUNTS_ML = [250, 500, 750, 1000] as const

export const waterLogCreateSchema = z.object({
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'entry_date muss YYYY-MM-DD sein.'),
  amount_ml: z.number().positive('amount_ml muss grösser als 0 sein.').finite(),
  source: z.enum(WATER_SOURCES).default('manual'),
})
export type WaterLogCreate = z.infer<typeof waterLogCreateSchema>

export const waterLogUpdateSchema = z.object({
  id: z.string().uuid('id muss eine UUID sein.'),
  amount_ml: z.number().positive('amount_ml muss grösser als 0 sein.').finite(),
})
export type WaterLogUpdate = z.infer<typeof waterLogUpdateSchema>

/** Zeile aus nutrition.water_logs, auf das UI-Relevante reduziert. */
export type StoredWaterLog = {
  id: string
  entry_date: string
  amount_ml: number
  source: WaterSource
  logged_at: string | null
}

/**
 * Eine Zeile aus nutrition.hydration_summary.
 *
 * `logged_ml === null` heisst: an diesem Tag wurde nichts eingetragen.
 * `food_ml === null` heisst: keine Position trug einen Wasserwert —
 * nicht 0. `foodMissing > 0` macht `total_ml` zur **Untergrenze**;
 * `complete` fasst das zusammen.
 */
export type HydrationSummary = {
  entry_date: string
  loggedMl: number | null
  logCount: number
  foodMl: number | null
  foodMissing: number
  totalMl: number | null
  complete: boolean
}

function asNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  // PostgREST liefert numeric als String, damit keine Präzision verloren geht.
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null
}

function asCount(value: unknown): number {
  const parsed = asNumberOrNull(value)
  return parsed === null ? 0 : parsed
}

export function parseStoredWaterLogs(rows: unknown): StoredWaterLog[] {
  if (!Array.isArray(rows)) return []
  const sources = new Set<string>(WATER_SOURCES)
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    const amount = asNumberOrNull(record.amount_ml)
    if (
      typeof record.id !== 'string' ||
      typeof record.entry_date !== 'string' ||
      amount === null ||
      typeof record.source !== 'string' ||
      !sources.has(record.source)
    ) {
      return []
    }
    return [
      {
        id: record.id,
        entry_date: record.entry_date,
        amount_ml: amount,
        source: record.source as WaterSource,
        logged_at: typeof record.logged_at === 'string' ? record.logged_at : null,
      },
    ]
  })
}

export function parseHydrationSummaries(rows: unknown): HydrationSummary[] {
  if (!Array.isArray(rows)) return []
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    if (typeof record.entry_date !== 'string') return []
    const foodMissing = asCount(record.food_ml_missing)
    return [
      {
        entry_date: record.entry_date,
        loggedMl: asNumberOrNull(record.logged_ml),
        logCount: asCount(record.log_count),
        foodMl: asNumberOrNull(record.food_ml),
        foodMissing,
        totalMl: asNumberOrNull(record.total_ml),
        // Die Datenbank rechnet total_complete bereits; hier defensiv
        // nachvollzogen, damit ein fehlendes Feld nicht als "vollständig"
        // durchgeht.
        complete: record.total_complete === true && foodMissing === 0,
      },
    ]
  })
}

/** Insert-Payload für nutrition.water_logs. */
export function buildWaterLogInsert(userId: string, input: WaterLogCreate) {
  return {
    user_id: userId,
    entry_date: input.entry_date,
    amount_ml: input.amount_ml,
    source: input.source,
  }
}

/**
 * Ein leerer Tag — für Tage ohne jeden Eintrag.
 * Bewusst `null` statt 0: an einem Tag ohne Erfassung wurde nichts
 * gemessen. Eine 0 behauptete, die Nutzerin habe nichts getrunken.
 */
export function emptyHydrationSummary(entryDate: string): HydrationSummary {
  return {
    entry_date: entryDate,
    loggedMl: null,
    logCount: 0,
    foodMl: null,
    foodMissing: 0,
    totalMl: null,
    complete: false,
  }
}

/**
 * Zielerreichung in Prozent.
 *
 * Das Ziel kommt NICHT aus diesem Modul — `[read]`
 * ADR_WATER_TOTAL_HYDRATION: es liegt in `nutrition_targets`, geliefert
 * von Goals. `[cmd]` Diese Tabelle existiert noch nicht (C-06).
 * Deshalb nimmt diese Funktion das Ziel als Parameter entgegen, statt es
 * zu erfinden. Ohne Ziel: null, nicht 0 % und nicht 100 %.
 */
export function hydrationPercent(summary: HydrationSummary, targetMl: number | null): number | null {
  if (targetMl === null || !Number.isFinite(targetMl) || targetMl <= 0) return null
  if (summary.totalMl === null) return null
  return Math.round((summary.totalMl / targetMl) * 1000) / 10
}

/**
 * Fehlercodes des Wasser-Schreibpfads.
 * Bewusst dieselbe Klasse wie beim Diary — beide sind Nutzerdaten im
 * selben Schema, zwei Fehlerklassen für dasselbe Muster wären Ballast.
 */
export type WaterWriteErrorCode = DiaryWriteErrorCode
export { DiaryWriteError as WaterWriteError }
