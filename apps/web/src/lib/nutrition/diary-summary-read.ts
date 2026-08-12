// Lese-I/O für die Tagessumme (C-04 / WP-03).
// RLS-konform: Session-Client mit der Identität der Nutzerin. Die Sicht
// nutrition.daily_summary läuft mit security_invoker=true, damit die
// Policies von meals/meal_items greifen — `[cmd]` belegt: ohne diese
// Option sieht eine zweite Sitzung die Tagessummen der ersten.
// Kein Service-Client. Reine Logik liegt in diary-summary.ts.
// Läuft ausschliesslich serverseitig.

import { createSessionClient } from '@lumeos/shared/session'

import { DiaryWriteError } from './diary-model'
import {
  emptyDailySummary,
  parseDailySummaryRows,
  type DailySummaryRow,
} from './diary-summary'
import { isDbUnavailableMessage } from '@lumeos/shared/nutrition/db'

/** Spaltenliste der Sicht — Summen und Lückenzähler je Makro. */
const SUMMARY_COLUMNS = [
  'entry_date',
  'meal_count',
  'item_count',
  'enercc',
  'prot625',
  'fat',
  'cho',
  'fibt',
  'sugar',
  'fasat',
  'nacl',
  'water_g',
  'enercc_missing',
  'prot625_missing',
  'fat_missing',
  'cho_missing',
  'fibt_missing',
  'sugar_missing',
  'fasat_missing',
  'nacl_missing',
  'water_g_missing',
].join(', ')

function classifyDbError(message: string): DiaryWriteError {
  if (isDbUnavailableMessage(message)) {
    return new DiaryWriteError('DB_UNAVAILABLE', `Nutrition database unavailable: ${message}`)
  }
  return new DiaryWriteError('WRITE_FAILED', message)
}

async function requireSession() {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new DiaryWriteError('NO_SESSION', 'Keine angemeldete Session.')
  }
  return supabase
}

/**
 * Tagessumme eines einzelnen Tages.
 *
 * Kein Eintrag heisst nicht "0 gegessen", sondern "nichts erfasst" —
 * deshalb ein leerer Tag mit `value: null` je Makro, nicht mit Nullen.
 */
export async function getDailySummary(entryDate: string): Promise<DailySummaryRow> {
  const supabase = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('daily_summary')
    .select(SUMMARY_COLUMNS)
    .eq('entry_date', entryDate)
  if (error) {
    throw classifyDbError(error.message)
  }
  return parseDailySummaryRows(data)[0] ?? emptyDailySummary(entryDate)
}

/**
 * Tagessummen über einen Zeitraum, aufsteigend nach Datum.
 * Tage ohne Einträge fehlen in der Liste — die Sicht kennt nur Tage mit
 * mindestens einer Mahlzeit. Wer eine lückenlose Reihe braucht, füllt
 * sie mit emptyDailySummary() auf; das ist Sache der Anzeige.
 */
export async function listDailySummaries(fromDate: string, toDate: string): Promise<DailySummaryRow[]> {
  const supabase = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('daily_summary')
    .select(SUMMARY_COLUMNS)
    .gte('entry_date', fromDate)
    .lte('entry_date', toDate)
    .order('entry_date', { ascending: true })
  if (error) {
    throw classifyDbError(error.message)
  }
  return parseDailySummaryRows(data)
}
