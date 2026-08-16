// Lese-I/O fuer den Wasserhaushalt eines Tages.
//
// Ruft `nutrition.hydration_day(user, datum)` auf — von Codex gebaut,
// hier nur gelesen. Die Funktion laeuft mit den Rechten der Sitzung,
// kein Service-Client.
//
// WAS HIER NICHT PASSIERT: rechnen. Prozentwert, Glaeser und der
// Vierzehntageschnitt kommen fertig aus der Datenbank. Eine zweite
// Rechnung in der Oberflaeche waere eine zweite Wahrheit.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { DiaryWriteError } from './diary-model'

/**
 * Der Wasserhaushalt eines Tages, aus zwei Herkuenften.
 *
 * `logged_ml` ist getrunken, `food_ml` steckt in Lebensmitteln.
 * Die Trennung ist der Grund, warum die Kachel zwei Farben hat: `[cmd]`
 * am 16.08. sind 1.242,7 ml komplett aus Lebensmitteln und 0 ml
 * getrunken — ein einzelner Balken wuerde das verschweigen.
 */
export type HydrationDay = {
  entry_date: string
  /** Getrunken, aus `water_logs`. */
  logged_ml: number
  log_count: number
  /** Aus Lebensmitteln, aus `daily_summary.water_g`. */
  food_ml: number
  /** Positionen ohne Wasserwert. Ueber null heisst: Anteil unvollstaendig. */
  food_ml_missing: number
  total_ml: number
  total_complete: boolean
  /** `null` heisst: kein Ziel ableitbar (Profil unvollstaendig). */
  target_ml: number | null
  target_source: string | null
  target_available: boolean
  /** `null`, wenn es kein Ziel gibt — NICHT 0. */
  progress_pct: number | null
  glass_size_ml: number
  glasses_total: number
  glasses_target: number | null
  avg_14d_total_ml: number | null
  avg_14d_days: number
  delta_vs_14d_ml: number | null
  behind_14d_avg_pct: number | null
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function zahlOder0(v: unknown): number {
  return zahl(v) ?? 0
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

export function parseHydrationDay(rows: unknown, entryDate: string): HydrationDay | null {
  const zeile = Array.isArray(rows) ? rows[0] : rows
  if (!zeile || typeof zeile !== 'object') return null
  const r = zeile as Record<string, unknown>
  return {
    entry_date: text(r.entry_date) ?? entryDate,
    logged_ml: zahlOder0(r.logged_ml),
    log_count: Math.trunc(zahlOder0(r.log_count)),
    food_ml: zahlOder0(r.food_ml),
    food_ml_missing: Math.trunc(zahlOder0(r.food_ml_missing)),
    total_ml: zahlOder0(r.total_ml),
    total_complete: r.total_complete !== false,
    target_ml: zahl(r.target_ml),
    target_source: text(r.target_source),
    target_available: r.target_available === true,
    // Ohne Ziel bleibt der Prozentwert leer. `0 %` hiesse „nichts
    // getrunken", und das ist eine andere Aussage als „kein Ziel".
    progress_pct: r.target_available === true ? zahl(r.progress_pct) : null,
    glass_size_ml: zahlOder0(r.glass_size_ml) || 250,
    glasses_total: Math.trunc(zahlOder0(r.glasses_total)),
    glasses_target: zahl(r.glasses_target) === null ? null : Math.trunc(zahlOder0(r.glasses_target)),
    avg_14d_total_ml: zahl(r.avg_14d_total_ml),
    avg_14d_days: Math.trunc(zahlOder0(r.avg_14d_days)),
    delta_vs_14d_ml: zahl(r.delta_vs_14d_ml),
    behind_14d_avg_pct: zahl(r.behind_14d_avg_pct),
  }
}

/** Der Wasserhaushalt eines Tages. `null` heisst: keine Zeile. */
export async function getHydrationDay(entryDate: string): Promise<HydrationDay | null> {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new DiaryWriteError('NO_SESSION', 'Keine angemeldete Session.')
  }

  // `.schema('nutrition')` ist noetig, sonst sucht PostgREST in `public`.
  const { data, error } = await supabase
    .schema('nutrition')
    .rpc('hydration_day', { p_user_id: user.id, p_entry_date: entryDate })

  if (error) {
    throw new DiaryWriteError('WRITE_FAILED', error.message)
  }
  return parseHydrationDay(data, entryDate)
}
