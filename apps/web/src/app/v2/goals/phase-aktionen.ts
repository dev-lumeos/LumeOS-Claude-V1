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
  phaseStarten, phaseBeenden, vorschlagBeantworten,
  PhaseFehler, type PhaseFehlerCode,
} from '../../../lib/goals/phase-write'
import type { Phasenstart } from '../../../lib/goals/phase-regeln'

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

export async function phaseStartenAktion(e: Phasenstart): Promise<PhaseErgebnis> {
  try {
    const phaseId = await phaseStarten(e)
    revalidatePath('/v2/goals')
    return { ok: true, phaseId }
  } catch (f) {
    return alsFehler(f)
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

export async function vorschlagBeantwortenAktion(
  phaseId: string, antwort: 'accepted' | 'rejected', grund?: string,
): Promise<PhaseErgebnis> {
  try {
    await vorschlagBeantworten(phaseId, antwort, grund)
    revalidatePath('/v2/goals')
    return { ok: true, phaseId }
  } catch (f) {
    return alsFehler(f)
  }
}
