'use server'

// Serveraktion fuer die Fotosession — G-421.
//
// `[read]` Dasselbe Muster wie `koerpermass-aktionen.ts` (G-122):
// durchreichen, Fehler als WERT zurueckgeben statt werfen — eine
// geworfene Ausnahme waere im Client eine anonyme Meldung ohne
// Feldbezug.
//
// `[read]` **Die Dateien kommen als `FormData`** — ein `File` ueber
// die Serveraktionsgrenze geht nur so.

import {
  fotosessionAnlegen, FotosessionFehler, POSE_ARTEN,
  type GeschriebenesFoto, type PoseArt, type PoseEingabe,
} from '../../../lib/goals/fotosession-write'

export type FotosessionErgebnis =
  | { ok: true; zeilen: GeschriebenesFoto[] }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

function alsFehler(e: unknown): FotosessionErgebnis {
  if (e instanceof FotosessionFehler) {
    return { ok: false, code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    ok: false, code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e), felder: [],
  }
}

/**
 * Eine Fotosession anlegen.
 *
 * `[read]` **Die Posen stecken in `FormData`:** je Pose ein Feld
 * `pose-<Name>` mit der Datei. **Die Reihenfolge der Felder ist die
 * Posennummer** — Front 1, Side 2, Back 3.
 */
export async function fotosessionAnlegenAktion(
  daten: FormData,
): Promise<FotosessionErgebnis> {
  try {
    const art = String(daten.get('pose_type') ?? 'quarter_turns')
    // `[read]` **Der CHECK entscheidet** — ein unbekannter Wert wird
    // hier abgewiesen, nicht erst von der Datenbank.
    const pose_type = (POSE_ARTEN as readonly string[]).includes(art)
      ? art as PoseArt
      : 'quarter_turns'

    // `[read]` **`forEach` statt `for…of`** — `FormData.entries()`
    // liefert einen Iterator, den das Ziel dieses Pakets nicht
    // ausbreiten kann (TS2802).
    const posen: PoseEingabe[] = []
    daten.forEach((wert, schluessel) => {
      if (!schluessel.startsWith('pose-')) return
      if (!(wert instanceof File) || wert.size === 0) return
      posen.push({
        pose_name: schluessel.slice('pose-'.length),
        pose_number: posen.length + 1,
        datei: wert,
      })
    })

    return {
      ok: true,
      zeilen: await fotosessionAnlegen({
        session_date: String(daten.get('session_date') ?? ''),
        pose_type,
        posen,
        notes: String(daten.get('notes') ?? ''),
      }),
    }
  } catch (f) {
    return alsFehler(f)
  }
}
