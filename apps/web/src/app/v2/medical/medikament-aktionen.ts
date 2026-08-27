'use server'

// Serveraktionen fuer den Medikamenten-Erfassungsweg — G-211.
//
// `[read]` **Warum Aktionen und kein Client-Zugriff:** der Schreibweg
// benutzt `createSessionClient()`, und der liest Cookies ueber
// `next/headers` — das geht nur serverseitig. Dasselbe Muster wie
// `aktionen.ts` daneben.
//
// `[read]` **Diese Datei entscheidet nichts.** Sie reicht durch und
// uebersetzt Fehler in eine Form, die das Formular anzeigen kann.
// **Die Regeln stehen in `medikament-eingabe.ts`, das Schreiben in
// `medikament-write.ts`** — dort steht auch, warum es genau eine
// Stelle ist (SICHERHEIT.md, C-285).

import {
  medikamentAnlegen, medikamentAendern, medikamentAbsetzen,
  medikamentFortsetzen, MedikamentSchreibFehler,
  type GeschriebenesMedikament,
} from '../../../lib/medical/medikament-write'
import type { MedikamentEingabe } from '../../../lib/medical/medikament-eingabe'

/**
 * Was eine Aktion zurueckgibt.
 *
 * `[read]` **Kein Werfen ueber die Serveraktionsgrenze.** Ein Fehler
 * kommt als Wert zurueck, damit das Formular ihn am richtigen Feld
 * zeigen kann — eine geworfene Ausnahme waere im Client eine
 * anonyme Meldung.
 */
export type SchreibErgebnis =
  | { ok: true; zeile: GeschriebenesMedikament }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

function alsFehler(e: unknown): SchreibErgebnis {
  if (e instanceof MedikamentSchreibFehler) {
    return { ok: false, code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    ok: false, code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e), felder: [],
  }
}

export async function anlegenAktion(e: MedikamentEingabe): Promise<SchreibErgebnis> {
  try {
    return { ok: true, zeile: await medikamentAnlegen(e) }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function aendernAktion(
  id: string, e: MedikamentEingabe,
): Promise<SchreibErgebnis> {
  try {
    return { ok: true, zeile: await medikamentAendern(id, e) }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function absetzenAktion(
  id: string, start_date: string, end_date: string,
): Promise<SchreibErgebnis> {
  try {
    return { ok: true, zeile: await medikamentAbsetzen(id, start_date, end_date) }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function fortsetzenAktion(id: string): Promise<SchreibErgebnis> {
  try {
    return { ok: true, zeile: await medikamentFortsetzen(id) }
  } catch (f) {
    return alsFehler(f)
  }
}
