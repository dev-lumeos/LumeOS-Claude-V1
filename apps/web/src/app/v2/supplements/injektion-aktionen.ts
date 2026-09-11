'use server'

// Serveraktion fuer das Erfassen einer Injektion — G-389.
//
// `[read]` Dasselbe Muster wie `zyklus-aktionen.ts` (G-423):
// durchreichen, Fehler als WERT zurueckgeben statt werfen — eine
// geworfene Ausnahme waere im Client eine anonyme Meldung ohne
// Feldbezug.

import {
  injektionAnlegen, InjektionFehler,
  type InjektionEingabe, type GeschriebeneInjektion,
} from '../../../lib/medical/injektion-write'

export type InjektionErgebnis =
  | { ok: true; zeile: GeschriebeneInjektion }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

export async function injektionAnlegenAktion(
  e: InjektionEingabe,
): Promise<InjektionErgebnis> {
  try {
    return { ok: true, zeile: await injektionAnlegen(e) }
  } catch (f) {
    if (f instanceof InjektionFehler) {
      return { ok: false, code: f.code, text: f.message, felder: f.felder ?? [] }
    }
    return {
      ok: false, code: 'WRITE_FAILED',
      text: f instanceof Error ? f.message : String(f), felder: [],
    }
  }
}
