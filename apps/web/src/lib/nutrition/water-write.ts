// Schreib- und Lese-I/O für Water Tracking (C-05 / WP-04).
// RLS-konform: Session-Client mit der Identität der Nutzerin, user_id
// wird explizit auf auth.uid() gesetzt (WITH CHECK der Insert-Policy),
// kein Service-Client. Reine Logik liegt in water-model.ts.
// Die Sicht nutrition.hydration_summary läuft mit security_invoker=true —
// `[cmd]` belegt: ohne diese Option sieht eine zweite Sitzung die Zeilen
// der ersten.
// Läuft ausschliesslich serverseitig.

import { createSessionClient } from '@lumeos/shared/session'

import { isDbUnavailableMessage } from './nutrition-db'
import {
  WaterWriteError,
  buildWaterLogInsert,
  emptyHydrationSummary,
  parseHydrationSummaries,
  parseStoredWaterLogs,
  type HydrationSummary,
  type StoredWaterLog,
  type WaterLogCreate,
  type WaterLogUpdate,
} from './water-model'

const LOG_COLUMNS = 'id, entry_date, amount_ml, source, logged_at'
const SUMMARY_COLUMNS =
  'entry_date, logged_ml, log_count, food_ml, food_ml_missing, total_ml, total_complete'

function classifyDbError(message: string): WaterWriteError {
  if (isDbUnavailableMessage(message)) {
    return new WaterWriteError('DB_UNAVAILABLE', `Nutrition database unavailable: ${message}`)
  }
  return new WaterWriteError('WRITE_FAILED', message)
}

async function requireSession() {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new WaterWriteError('NO_SESSION', 'Keine angemeldete Session.')
  }
  return { supabase, userId: user.id }
}

/** Eigene Wassereinträge eines Tages (RLS begrenzt auf auth.uid()-Zeilen). */
export async function listOwnWaterLogs(entryDate: string): Promise<StoredWaterLog[]> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('water_logs')
    .select(LOG_COLUMNS)
    .eq('entry_date', entryDate)
    .order('logged_at', { ascending: true })
  if (error) {
    throw classifyDbError(error.message)
  }
  return parseStoredWaterLogs(data)
}

/**
 * Wassereintrag anlegen.
 *
 * Kein Duplikatschutz und keine Select-vor-Insert-Prüfung — anders als
 * bei den Präferenzen (C-02/C-12) gibt es hier keine Eindeutigkeit:
 * zweimal 250 ml sind zwei Gläser, kein Fehler. Es wird immer eingefügt.
 */
export async function addWaterLog(input: WaterLogCreate): Promise<StoredWaterLog> {
  const { supabase, userId } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('water_logs')
    .insert(buildWaterLogInsert(userId, input))
    .select(LOG_COLUMNS)
  if (error) {
    throw classifyDbError(error.message)
  }
  const log = parseStoredWaterLogs(data)[0]
  if (!log) {
    throw new WaterWriteError('WRITE_FAILED', 'Insert lieferte keine Zeile zurück.')
  }
  return log
}

/** Menge eines Eintrags korrigieren. */
export async function updateWaterLogAmount(input: WaterLogUpdate): Promise<StoredWaterLog> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('water_logs')
    .update({ amount_ml: input.amount_ml })
    .eq('id', input.id)
    .select(LOG_COLUMNS)
  if (error) {
    throw classifyDbError(error.message)
  }
  const log = parseStoredWaterLogs(data)[0]
  if (!log) {
    // RLS macht "existiert nicht" und "gehört jemand anderem" bewusst
    // ununterscheidbar (kein Informationsleck über fremde Zeilen).
    throw new WaterWriteError('NOT_FOUND', 'Kein eigener Wassereintrag mit dieser id.')
  }
  return log
}

/** Eintrag entfernen — die Korrektur einer Fehleingabe. */
export async function removeWaterLog(logId: string): Promise<{ removed: number }> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('water_logs')
    .delete()
    .eq('id', logId)
    .select('id')
  if (error) {
    throw classifyDbError(error.message)
  }
  const removed = Array.isArray(data) ? data.length : 0
  if (removed === 0) {
    throw new WaterWriteError('NOT_FOUND', 'Kein eigener Wassereintrag mit dieser id.')
  }
  return { removed }
}

/**
 * Gesamt-Hydration eines Tages: getrunkenes Wasser plus Wasser aus
 * Nahrung. Kein Eintrag heisst nicht „0 getrunken", sondern „nichts
 * erfasst" — deshalb ein leerer Tag mit `null`, nicht mit Nullen.
 */
export async function getHydrationSummary(entryDate: string): Promise<HydrationSummary> {
  const { supabase } = await requireSession()
  const { data, error } = await supabase
    .schema('nutrition')
    .from('hydration_summary')
    .select(SUMMARY_COLUMNS)
    .eq('entry_date', entryDate)
  if (error) {
    throw classifyDbError(error.message)
  }
  return parseHydrationSummaries(data)[0] ?? emptyHydrationSummary(entryDate)
}
