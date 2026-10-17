'use server'

// Serveraktionen fuer die Goal-Phase — G-513.
//
// `[read]` Dasselbe Muster wie `koerpermass-aktionen.ts` und
// `fotosession-aktionen.ts`: durchreichen, Fehler als WERT
// zurueckgeben statt werfen — eine geworfene Ausnahme waere im
// Client eine anonyme Meldung ohne Feldbezug.
//
// `[cmd]` **`revalidatePath` wie in `ziel-aktionen.ts:16`** — die
// Uebersicht liest serverseitig (`page.tsx`), also sieht sie ohne
// Auffrischung die alte Phase.

import { revalidatePath } from 'next/cache'

import {
  phaseBeenden,
  PhaseFehler, type PhaseFehlerCode,
} from '../../../lib/goals/phase-write'
// G-565/A4: die Einheit gehoert dem Nutzer.
import { speichereEinheit } from '../../../lib/goals/einheit-speichern'

export type PhaseErgebnis =
  | { ok: true; phaseId: string }
  | {
      ok: false
      code: PhaseFehlerCode
      text: string
      felder: Array<{ feld: string; text: string }>
    }

function alsFehler(e: unknown): PhaseErgebnis {
  if (e instanceof PhaseFehler) {
    return { ok: false, code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    ok: false,
    code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e),
    felder: [],
  }
}

export async function phaseBeendenAktion(
  phaseId: string, grund: string, ende?: string,
): Promise<PhaseErgebnis> {
  try {
    const id = await phaseBeenden(phaseId, grund, ende)
    revalidatePath('/v2/goals')
    return { ok: true, phaseId: id }
  } catch (f) {
    return alsFehler(f)
  }
}

/**
 * Die gewaehlte Einheit festhalten — G-565/A4.
 *
 * `[read]` **Eine Darstellung, kein Datum** — sie liegt in
 * `user_display_preferences`, nicht an der Phase.
 */
export async function einheitSetzenAktion(
  einheit: 'prozent' | 'kcal',
): Promise<{ ok: boolean; fehler: string | null }> {
  try {
    await speichereEinheit(einheit)
    revalidatePath('/v2/goals')
    return { ok: true, fehler: null }
  } catch (f) {
    return {
      ok: false,
      fehler: f instanceof Error ? f.message : String(f),
    }
  }
}
