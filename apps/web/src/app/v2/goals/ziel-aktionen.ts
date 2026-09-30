'use server'

// Serveraktionen fuer Ziele (G-79).
import { revalidatePath } from 'next/cache'

import {
  zielAendern, reihenfolgeSetzen, zielAnlegen,
} from '../../../lib/goals/schreiben'
import type { ZielAenderung, ZielNeu } from '../../../lib/goals/ziel-regeln'
import {
  phasenzielAnlegen, type PhasenzielNeu, type PhasenzielErgebnis,
} from '../../../lib/goals/phasenziel-write'

/**
 * Ein neues Ziel anlegen — G-537.
 *
 * `[read]` **Dieselbe Form wie `zielSpeichern`:** Fehler als WERT,
 * nicht als Ausnahme, und `revalidatePath` nach dem Erfolg — die
 * Uebersicht liest serverseitig.
 */
export async function zielAnlegenAktion(z: ZielNeu): Promise<{
  ok: boolean
  fehler: string | null
}> {
  const e = await zielAnlegen(z)
  if (e.ok) revalidatePath('/v2/goals')
  return e.ok ? { ok: true, fehler: null } : { ok: false, fehler: e.fehler }
}

/**
 * Ein Phasenziel anlegen — G-554/A2. **Ziel und Phase in einem
 * Schritt, beides oder keines.**
 *
 * `[read]` **Ein Aufruf, serverseitig gekoppelt** — so hat es auch
 * der Vorgaenger gemacht (`GoalSetupDialog` -> ein `POST`). **Zwei
 * Aufrufe aus dem Browser koennten zwischen den Schritten
 * abbrechen.**
 */
export async function phasenzielAnlegenAktion(
  n: PhasenzielNeu,
): Promise<PhasenzielErgebnis> {
  const e = await phasenzielAnlegen(n)
  if (e.ok) revalidatePath('/v2/goals')
  return e
}

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
