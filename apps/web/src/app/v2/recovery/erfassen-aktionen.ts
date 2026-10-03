'use server'

// Serveraktionen fuer Check-in und Erholungsanwendung — G-122.
//
// `[read]` **Warum Aktionen und keine HTTP-Route:** der Schreibweg
// benutzt `createSessionClient()`, und der liest Cookies ueber
// `next/headers` — das geht nur serverseitig. **Eine Route waere ein
// zweites Ende der Naht**, das niemand aufruft; dieselbe Ueberlegung
// wie in G-211.
//
// `[read]` **Diese Datei entscheidet nichts.** Sie reicht durch und
// uebersetzt Fehler in eine Form, die das Formular am Feld anzeigen
// kann.

import {
  checkinSchreiben, modalitaetAnlegen, modalitaetAendern,
  RecoverySchreibFehler,
  type GeschriebenerCheckin, type GeschriebeneModalitaet,
} from '../../../lib/recovery/checkin-write'
import type {
  CheckinEingabe, ModalitaetEingabe,
} from '../../../lib/recovery/checkin-regeln'
// G-593: das dritte Ziel — ein Protokoll starten.
import {
  protokollStarten, type GestartetesProtokoll,
} from '../../../lib/recovery/protokoll-write'
import type { ProtokollEingabe } from '../../../lib/recovery/protokoll-regeln'

export type CheckinErgebnis =
  | { ok: true; zeile: GeschriebenerCheckin }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

export type ModalitaetErgebnis =
  | { ok: true; zeile: GeschriebeneModalitaet }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

function alsFehler(e: unknown) {
  if (e instanceof RecoverySchreibFehler) {
    return { ok: false as const, code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    ok: false as const, code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e), felder: [],
  }
}

export async function checkinAktion(e: CheckinEingabe): Promise<CheckinErgebnis> {
  try {
    return { ok: true, zeile: await checkinSchreiben(e) }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function modalitaetAnlegenAktion(
  e: ModalitaetEingabe,
): Promise<ModalitaetErgebnis> {
  try {
    return { ok: true, zeile: await modalitaetAnlegen(e) }
  } catch (f) {
    return alsFehler(f)
  }
}

// ══ G-590: OHNE AUFRUFER — UND DAS IST DER BEFUND ═══════════════════
//
// `[cmd]` **Die Vorlage fuehrt keinen Bearbeiten-Griff fuer eine
// Anwendung** (`module-recovery-v2.jsx`, `-modals2.jsx` gelesen
// 2026-10-03). `ModalitaetenKachel` zeigt die Zeilen ohne Griff.
// `[read]` **Der einzige vorgesehene Aenderungsweg ist `Rate now`** im
// `Effectiveness log` (`tab-protokolle.tsx`, `InEntwicklungKnopf`) —
// und der setzt `next_day_effect`, das diese Aktion NICHT schreibt
// (`ModalitaetEingabe` fuehrt es nicht). Ausserdem liest
// `ladeModalitaeten` keine `id` (`MOD_SPALTEN`), ohne die sich keine
// Zeile adressieren laesst. **Nicht gebaut — gemeldet.**
export async function modalitaetAendernAktion(
  id: string, e: ModalitaetEingabe,
): Promise<ModalitaetErgebnis> {
  try {
    return { ok: true, zeile: await modalitaetAendern(id, e) }
  } catch (f) {
    return alsFehler(f)
  }
}

export type ProtokollErgebnis =
  | { ok: true; zeile: GestartetesProtokoll }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

export async function protokollStartenAktion(
  e: ProtokollEingabe,
): Promise<ProtokollErgebnis> {
  try {
    return { ok: true, zeile: await protokollStarten(e) }
  } catch (f) {
    return alsFehler(f)
  }
}
