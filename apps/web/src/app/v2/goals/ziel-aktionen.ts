'use server'

// Serveraktionen fuer Ziele (G-79).
import { revalidatePath } from 'next/cache'

import { zielAendern, reihenfolgeSetzen } from '../../../lib/goals/schreiben'
import type { ZielAenderung } from '../../../lib/goals/ziel-regeln'

export async function zielSpeichern(zielId: string, aenderung: ZielAenderung): Promise<{
  ok: boolean
  fehler: string | null
}> {
  const e = await zielAendern(zielId, aenderung)
  // Die Uebersicht liest serverseitig — nach dem Schreiben neu holen,
  // sonst steht die alte Reihenfolge bis zum naechsten Laden.
  if (e.ok) revalidatePath('/v2/goals')
  return e.ok ? { ok: true, fehler: null } : { ok: false, fehler: e.fehler }
}

export async function prioritaetenSpeichern(
  paare: Array<{ id: string; priority: number }>,
): Promise<{ ok: boolean; fehler: string | null }> {
  const e = await reihenfolgeSetzen(paare)
  if (e.ok) revalidatePath('/v2/goals')
  return e.ok ? { ok: true, fehler: null } : { ok: false, fehler: e.fehler }
}
