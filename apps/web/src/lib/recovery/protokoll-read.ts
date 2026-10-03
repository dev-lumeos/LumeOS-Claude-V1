// Lese-I/O fuer `recovery.recovery_protocols` — G-593.
//
// `[read]` **Die Tabelle ist der Verlauf:** jede Zeile ein gestartetes
// Protokoll, mit Zustand und Fortschritt. Diese Datei rechnet nichts.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

export type ProtokollZeile = {
  id: string
  protocol_key: string
  name: string
  target_condition: string
  started_on: string
  duration_days: number
  daily_activities: string[]
  status: string
  completed_days: number
}

export type ProtokollStand = {
  zeilen: ProtokollZeile[]
  /** Die mit `status = 'active'` — es koennen mehrere sein (G-593/A3). */
  aktiv: ProtokollZeile[]
  fehler: string | null
}

const SPALTEN = 'id, protocol_key, name, target_condition, started_on, '
  + 'duration_days, daily_activities, status, completed_days'

/** Die Protokolle des angemeldeten Nutzers, juengste zuerst. */
export async function ladeProtokolle(): Promise<ProtokollStand> {
  const leer: ProtokollStand = { zeilen: [], aktiv: [], fehler: null }
  try {
    const { data, error } = await createSessionClient()
      .schema('recovery')
      .from('recovery_protocols')
      .select(SPALTEN)
      .order('started_on', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) return { ...leer, fehler: error.message }
    const zeilen = (data ?? []) as unknown as ProtokollZeile[]
    return { zeilen, aktiv: zeilen.filter(z => z.status === 'active'), fehler: null }
  } catch (e) {
    return { ...leer, fehler: e instanceof Error ? e.message : String(e) }
  }
}
