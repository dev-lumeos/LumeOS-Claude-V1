'use server'

// Serveraktion fuer die Umfangserfassung — G-577.
//
// `[read]` Dasselbe Muster wie `koerpermass-aktionen.ts` (G-122):
// durchreichen, Fehler als WERT zurueckgeben statt werfen — eine
// geworfene Ausnahme waere im Client eine anonyme Meldung ohne
// Feldbezug.

import { umfangAnlegen, UmfangFehler } from '../../../lib/goals/umfang-write'
import type { UmfangEingabe } from '../../../lib/goals/umfang-rechnung'

export type UmfangErgebnis =
  | { ok: true; id: string }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

function alsFehler(e: unknown): UmfangErgebnis {
  if (e instanceof UmfangFehler) {
    return { ok: false, code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    ok: false, code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e), felder: [],
  }
}

export async function umfangAnlegenAktion(
  e: UmfangEingabe,
): Promise<UmfangErgebnis> {
  try {
    return { ok: true, id: await umfangAnlegen(e) }
  } catch (f) {
    return alsFehler(f)
  }
}
