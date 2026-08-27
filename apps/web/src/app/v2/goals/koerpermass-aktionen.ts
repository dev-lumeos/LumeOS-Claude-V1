'use server'

// Serveraktionen fuer die Koerpermessung — G-122.
//
// `[read]` Dasselbe Muster wie `v2/recovery/erfassen-aktionen.ts` und
// `v2/medical/medikament-aktionen.ts` (G-211): durchreichen, Fehler
// als WERT zurueckgeben statt werfen — eine geworfene Ausnahme waere
// im Client eine anonyme Meldung ohne Feldbezug.

import {
  messungAnlegen, messungAendern, KoerpermassFehler,
  type GeschriebeneMessung,
} from '../../../lib/goals/koerpermass-write'
import type { KoerpermassEingabe } from '../../../lib/goals/koerpermass-rechnung'

export type MessungErgebnis =
  | { ok: true; zeile: GeschriebeneMessung }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

function alsFehler(e: unknown): MessungErgebnis {
  if (e instanceof KoerpermassFehler) {
    return { ok: false, code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    ok: false, code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e), felder: [],
  }
}

export async function messungAnlegenAktion(
  e: KoerpermassEingabe,
): Promise<MessungErgebnis> {
  try {
    return { ok: true, zeile: await messungAnlegen(e) }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function messungAendernAktion(
  id: string, e: KoerpermassEingabe,
): Promise<MessungErgebnis> {
  try {
    return { ok: true, zeile: await messungAendern(id, e) }
  } catch (f) {
    return alsFehler(f)
  }
}
