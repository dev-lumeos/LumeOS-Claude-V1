// ════════════════════════════════════════════════════════════════════
// DIE EINE SCHREIBSTELLE FUER `recovery.recovery_protocols` — G-593
// ════════════════════════════════════════════════════════════════════
//
// `[read]` **Eine Naht je ZIEL** (G-122): Check-in und Anwendung liegen
// in `checkin-write.ts`, ein Protokoll ist ein drittes Ziel. Fehlerklasse
// und Sitzungspruefung kommen von dort — **eine Klasse, nicht zwei.**
//
// `[cmd]` **Kein Trigger fuer `updated_at`** auf dieser Tabelle
// (gemessen 2026-10-03) — beim Anlegen setzt die Vorgabe `now()`.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { RecoverySchreibFehler } from './checkin-write'
import { pruefeProtokoll, protokollZeile, type ProtokollEingabe } from './protokoll-regeln'

export type GestartetesProtokoll = {
  id: string
  protocol_key: string
  target_condition: string
  started_on: string
  status: string
}

/**
 * Ein Protokoll starten — `insert`, nie `upsert`.
 *
 * `[read]` **Die Tabelle ist der Verlauf**, kein Katalog: dasselbe
 * Protokoll zweimal zu laufen ist zwei Zeilen.
 */
export async function protokollStarten(
  e: ProtokollEingabe,
): Promise<GestartetesProtokoll> {
  const felder = pruefeProtokoll(e)
  if (felder.length > 0) {
    throw new RecoverySchreibFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new RecoverySchreibFehler('NO_SESSION', 'Keine angemeldete Sitzung.')

  const { data, error } = await supabase
    .schema('recovery')
    .from('recovery_protocols')
    .insert({ user_id: user.id, ...protokollZeile(e) })
    .select('id, protocol_key, target_condition, started_on, status')
  if (error) throw new RecoverySchreibFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  // G-79: PostgREST meldet Erfolg, wenn RLS leerfiltert.
  if (zeilen.length === 0) {
    throw new RecoverySchreibFehler('NOT_FOUND', 'Nicht angelegt.')
  }
  const z = zeilen[0] as Record<string, unknown>
  return {
    id: String(z.id),
    protocol_key: String(z.protocol_key),
    target_condition: String(z.target_condition),
    started_on: String(z.started_on),
    status: String(z.status),
  }
}
