'use server'

// Serveraktionen fuer den Laborimport — G-578.
//
// `[read]` Dasselbe Muster wie `medikament-aktionen.ts` (G-211) und
// `koerpermass-aktionen.ts` (G-122): durchreichen, Fehler als WERT
// zurueckgeben statt werfen — eine geworfene Ausnahme waere im Client
// eine anonyme Meldung ohne Feldbezug.

import { revalidatePath } from 'next/cache'

import {
  zeilenUebernehmen, erkennungStarten, erkennungAblegen, ImportFehler,
} from '../../../lib/medical/laborimport-write'
import type {
  ImportKopf, ImportZeile, Importergebnis,
} from '../../../lib/medical/laborimport'

export type ImportAntwort =
  | { ok: true; ergebnis: Importergebnis }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

function alsAntwort(e: unknown): ImportAntwort {
  if (e instanceof ImportFehler) {
    return { ok: false, code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    ok: false, code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e), felder: [],
  }
}

/**
 * Geprueffte Zeilen uebernehmen — A1.
 *
 * `[read]` **`revalidatePath` erst nach dem Erfolg** — sonst laedt
 * die Seite neu, obwohl nichts geschrieben wurde.
 */
export async function zeilenUebernehmenAktion(
  kopf: ImportKopf, zeilen: ImportZeile[],
): Promise<ImportAntwort> {
  try {
    const ergebnis = await zeilenUebernehmen(kopf, zeilen)
    revalidatePath('/v2/medical')
    return { ok: true, ergebnis }
  } catch (f) {
    return alsAntwort(f)
  }
}

export type OcrAntwort =
  | { ok: true; report_id: string; ocr_status: string }
  | { ok: false; code: string; text: string }

/** Die Erkennung vormerken — A2. */
export async function erkennungStartenAktion(
  berichtId: string,
): Promise<OcrAntwort> {
  try {
    const r = await erkennungStarten(berichtId)
    revalidatePath('/v2/medical')
    return { ok: true, report_id: r.report_id, ocr_status: r.ocr_status }
  } catch (f) {
    const a = alsAntwort(f)
    return { ok: false, code: a.ok ? 'WRITE_FAILED' : a.code,
      text: a.ok ? '' : a.text }
  }
}

/**
 * Das Erkennungsergebnis ablegen — A2.
 *
 * `[read]` **Kein Aufrufer in der Oberflaeche, und das ist der
 * Befund:** es gibt keinen Dienst, der ein Ergebnis erzeugt. **Der
 * Weg steht, die Quelle fehlt** — siehe den Bericht zu G-578.
 */
export async function erkennungAblegenAktion(
  berichtId: string, roh: unknown, werte: unknown[],
): Promise<OcrAntwort> {
  try {
    const r = await erkennungAblegen(berichtId, roh, werte)
    revalidatePath('/v2/medical')
    return { ok: true, report_id: r.report_id, ocr_status: r.ocr_status }
  } catch (f) {
    const a = alsAntwort(f)
    return { ok: false, code: a.ok ? 'WRITE_FAILED' : a.code,
      text: a.ok ? '' : a.text }
  }
}
