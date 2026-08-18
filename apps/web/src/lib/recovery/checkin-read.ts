// Lese-I/O fuer die Morgen-Check-ins (G-55).
//
// `[cmd]` `recovery.checkins` liegt seit Kettenschritt 120
// (`supabase/_pipeline/12_recovery/120_recovery_checkins.sql`).
//
// `[read]` Der Auftrag: „Anbinden heisst hier: die erfassten Werte
// zeigen, keine Kennzahl daraus rechnen. Der Erholungswert ist
// `SPEC_09` und hat dieselbe offene Frage wie C-49."
//
// **Deshalb rechnet diese Datei nichts.** Sie liest, was erfasst
// wurde, und gibt es unveraendert weiter. Der Score der Vorlage bleibt
// Attrappe — er braucht eine Gewichtung, die niemand beschlossen hat.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/** Eine Zeile aus `recovery.checkins`, so wie sie erfasst wurde. */
export type CheckinZeile = {
  entry_date: string
  checkin_time: string | null
  sleep_hours: number | null
  sleep_quality: number | null
  subjective_feeling: number | null
  mood: string
  energy_level: number | null
  motivation: number | null
  /** Muskelkater je Recovery-Kuerzel, Stufen 0-3. */
  soreness: Record<string, number>
  pain_areas: string[]
  stress_level: number | null
  resting_hr: number | null
  hrv_rmssd: number | null
}

export type CheckinStand = {
  zeilen: CheckinZeile[]
  /** Der juengste Eintrag, oder `null`. */
  neuster: CheckinZeile | null
  /** Wieviele davon einen HRV-Wert tragen. */
  mitHrv: number
  fehler: string | null
}

const SPALTEN = [
  'entry_date', 'checkin_time', 'sleep_hours', 'sleep_quality',
  'subjective_feeling', 'mood', 'energy_level', 'motivation',
  'soreness', 'pain_areas', 'stress_level', 'resting_hr', 'hrv_rmssd',
].join(', ')

/**
 * Die letzten Check-ins des angemeldeten Nutzers.
 *
 * `[cmd]` Kein Service-Client — die Sitzung liest ihre eigenen Zeilen,
 * die Zeilenrechte der Tabelle greifen.
 */
export async function ladeCheckins(grenze = 30): Promise<CheckinStand> {
  const leer: CheckinStand = { zeilen: [], neuster: null, mitHrv: 0, fehler: null }
  try {
    const client = await createSessionClient()
    const { data, error } = await client
      .schema('recovery')
      .from('checkins')
      .select(SPALTEN)
      .order('entry_date', { ascending: false })
      .limit(grenze)

    if (error) return { ...leer, fehler: error.message }

    const zeilen = (data ?? []) as unknown as CheckinZeile[]
    return {
      zeilen,
      neuster: zeilen[0] ?? null,
      mitHrv: zeilen.filter(z => z.hrv_rmssd != null).length,
      fehler: null,
    }
  } catch (e) {
    // Kein Schema, keine Sitzung, keine Verbindung — die Oberflaeche
    // zeigt dann den Attrappenstand und sagt warum.
    return { ...leer, fehler: e instanceof Error ? e.message : String(e) }
  }
}
