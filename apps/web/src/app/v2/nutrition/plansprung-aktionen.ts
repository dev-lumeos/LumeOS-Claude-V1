'use server'

// Serveraktion fuer den Plansprung — G-579.
//
// `[read]` Dasselbe Muster wie `laborimport-aktionen.ts` (G-578) und
// `koerpermass-aktionen.ts` (G-122): durchreichen, Fehler als WERT
// zurueckgeben statt werfen — eine geworfene Ausnahme waere im Client
// eine anonyme Meldung ohne Feldbezug.

import { revalidatePath } from 'next/cache'

import {
  folgeplanSetzen, SprungFehlerKlasse,
} from '../../../lib/nutrition/plansprung-write'

export type SprungAntwort =
  | { ok: true; next_plan_id: string }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

export async function folgeplanSetzenAktion(
  planId: string, folgeId: string,
): Promise<SprungAntwort> {
  try {
    const next = await folgeplanSetzen(planId, folgeId)
    // `[read]` **Erst nach dem Erfolg** — sonst laedt die Seite neu,
    // obwohl nichts geschrieben wurde.
    revalidatePath('/v2/nutrition')
    return { ok: true, next_plan_id: next }
  } catch (f) {
    if (f instanceof SprungFehlerKlasse) {
      return { ok: false, code: f.code, text: f.message, felder: f.felder ?? [] }
    }
    return {
      ok: false, code: 'WRITE_FAILED',
      text: f instanceof Error ? f.message : String(f), felder: [],
    }
  }
}
