// G-640 — Archivieren, Loeschen, Neu starten (G-611). Laeuft ausschliesslich serverseitig.
//
// `[cmd]` **Drei Funktionen der Kette** (`611_goal_freeze_archive_delete.sql`):
//
//     goal_archive(p_goal_id uuid)                                  -> void
//     goal_delete(p_goal_id uuid, p_confirm_history boolean)        -> void
//     goal_restart(p_goal_id uuid, p_start_date date, p_target_date date) -> uuid
//
// `[read]` **Sie pruefen selbst** (Eigentuemer, eingefroren, Verlauf) — die App
// rechnet nichts davon vor. Ein Fehler kommt als Satz zurueck (`kettenfehler`),
// eine fehlende Funktion als eigener Zustand.
import { createSessionClient } from '@lumeos/shared/session'

import { kettenfehler, nichtEingespielt } from './zustand'

export type Lebenszyklus =
  | { ok: true; neu?: string | null }
  | { ok: false; art: 'confirm' | 'block' | 'fehler' | 'nicht_eingespielt'; satz: string; schluessel: string | null }

const goals = () => createSessionClient().schema('goals')

async function rufe(name: string, p: Record<string, unknown>): Promise<Lebenszyklus> {
  const { data, error } = await goals().rpc(name, p)
  if (!error) return { ok: true, neu: typeof data === 'string' ? data : null }
  if (nichtEingespielt(error)) {
    return { ok: false, art: 'nicht_eingespielt', schluessel: null, satz: 'Diese Funktion ist noch nicht eingespielt (G-611).' }
  }
  const k = kettenfehler(error.message)
  return k ? { ok: false, art: k.art, schluessel: k.schluessel, satz: k.satz }
    : { ok: false, art: 'fehler', schluessel: null, satz: error.message }
}

export const zielArchivieren = (id: string) => rufe('goal_archive', { p_goal_id: id })
export const zielLoeschen = (id: string, verlaufBestaetigt: boolean) =>
  rufe('goal_delete', { p_goal_id: id, p_confirm_history: verlaufBestaetigt })
export const zielNeuStarten = (id: string, start: string, ende: string) =>
  rufe('goal_restart', { p_goal_id: id, p_start_date: start, p_target_date: ende })
