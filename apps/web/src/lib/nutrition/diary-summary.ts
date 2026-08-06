// Reines Modell für die Tagessumme (C-04 / WP-03).
// KEIN I/O — die Abfrage liegt in diary-summary-read.ts. Die Regeln zum
// Umgang mit Lücken existieren genau hier.
//
// GRUNDSATZ (verbindlich, wie C-03): ein fehlender Nährwert bleibt
// fehlend und wird NICHT 0. Eine Tagessumme, die Vollständigkeit
// vortäuscht, ist schlechter als eine, die ihre Lücken zeigt.
// Die Sicht nutrition.daily_summary liefert dafür je Makro zwei Angaben:
// die Summe der vorhandenen Werte und die Zahl der Positionen ohne Wert.

/** Die neun Makros, die 052 als Spalten führt und 053 summiert. */
export const SUMMARY_MACROS = [
  'enercc',
  'prot625',
  'fat',
  'cho',
  'fibt',
  'sugar',
  'fasat',
  'nacl',
  'water_g',
] as const
export type SummaryMacro = (typeof SUMMARY_MACROS)[number]

/** Eine Zeile aus nutrition.daily_summary. */
export type DailySummaryRow = {
  entry_date: string
  meal_count: number
  item_count: number
  macros: Record<SummaryMacro, MacroTotal>
}

/**
 * Ein Makro der Tagessumme.
 *
 * `value === null` heisst: für dieses Makro hat KEINE Position einen
 * gemessenen Wert. Nicht 0 — nichts gemessen ist nicht null Gramm.
 *
 * `missing > 0` heisst: einzelne Positionen hatten keinen Wert. Die
 * Summe ist dann eine Untergrenze, keine Wahrheit. `complete` fasst das
 * für die Anzeige zusammen.
 */
export type MacroTotal = {
  value: number | null
  missing: number
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

/**
 * Rohzeilen der Sicht defensiv auf das Modell abbilden.
 * Muster aus preferences-model/diary-model: unbrauchbare Zeilen fallen
 * weg, statt den ganzen Aufruf scheitern zu lassen.
 */
export function parseDailySummaryRows(rows: unknown): DailySummaryRow[] {
  if (!Array.isArray(rows)) return []
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    if (typeof record.entry_date !== 'string') return []

    const itemCount = asCount(record.item_count)
    const macros = {} as Record<SummaryMacro, MacroTotal>
    for (const macro of SUMMARY_MACROS) {
      const value = asNumberOrNull(record[macro])
      const missing = asCount(record[`${macro}_missing`])
      macros[macro] = {
        value,
        missing,
        // Vollständig ist ein Makro nur, wenn keine Position fehlt UND
        // überhaupt etwas gemessen wurde. Ein Tag ohne Positionen ist
        // nicht "vollständig 0".
        complete: missing === 0 && itemCount > 0 && value !== null,
      }
    }
    return [
      {
        entry_date: record.entry_date,
        meal_count: asCount(record.meal_count),
        item_count: itemCount,
        macros,
      },
    ]
  })
}

/**
 * Welche Makros dieses Tages sind lückenhaft?
 * Für die Oberfläche: sie muss die Lücke zeigen, nicht verschweigen.
 */
export function incompleteMacros(row: DailySummaryRow): SummaryMacro[] {
  return SUMMARY_MACROS.filter(macro => !row.macros[macro].complete)
}

/**
 * Ist die Tagessumme insgesamt belastbar?
 * Nur wenn jedes Makro vollständig ist. Ein einziges lückenhaftes Makro
 * genügt, um die Summe als Untergrenze auszuweisen.
 */
export function isSummaryComplete(row: DailySummaryRow): boolean {
  return incompleteMacros(row).length === 0
}

/**
 * Ein leerer Tag — für Tage ohne jede Mahlzeit.
 *
 * Bewusst mit `value: null`, nicht 0: an einem Tag ohne Einträge wurde
 * nichts gemessen. Eine 0 behauptete, die Nutzerin habe nichts gegessen.
 */
export function emptyDailySummary(entryDate: string): DailySummaryRow {
  const macros = {} as Record<SummaryMacro, MacroTotal>
  for (const macro of SUMMARY_MACROS) {
    macros[macro] = { value: null, missing: 0, complete: false }
  }
  return { entry_date: entryDate, meal_count: 0, item_count: 0, macros }
}
