'use server'

// Serveraktionen fuer die Trainingserfassung — G-217.
//
// `[read]` **Warum Aktionen und kein Client-Zugriff:** der
// Schreibweg benutzt `createSessionClient()`, und der liest Cookies
// ueber `next/headers` — das geht nur serverseitig. Dasselbe Muster
// wie `medikament-aktionen.ts` (G-211).
//
// `[read]` **Diese Datei entscheidet nichts und schreibt nichts
// selbst.** Sie reicht durch und uebersetzt Fehler in eine Form, die
// das Formular am richtigen Feld anzeigen kann. **Die Naht ist
// `lib/training/sitzung-write.ts` (G-216) — das Formular ruft sie,
// es baut keine zweite.**

import {
  ladeOffeneSitzung, ladeSitzungsInhalt, angemeldeteNutzerin,
  type Sitzung, type SitzungsUebung, type Satz,
} from '../../../lib/training/sitzungen-read'
import {
  beginneSitzung, fuegeUebungHinzu, trageSatzEin,
  schliesseSitzungAb, verwerfeSitzung, TrainingSchreibFehler,
  type Sitzungskopf,
} from '../../../lib/training/sitzung-write'
import type { SitzungsEingabe, SatzEingabe } from '../../../lib/training/sitzung-regeln'
import { getUebungen, type Uebung } from '../../../lib/training/uebungen-read'

/**
 * Was eine Aktion zurueckgibt.
 *
 * `[read]` **Kein Werfen ueber die Serveraktionsgrenze** (G-211):
 * ein Fehler kommt als Wert zurueck, sonst ist er im Client eine
 * anonyme Meldung.
 */
export type SitzungsErgebnis =
  | { ok: true; kopf: Sitzungskopf }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

export type InhaltErgebnis =
  | { ok: true; sitzung: Sitzung | null
      uebungen: Array<SitzungsUebung & { saetze: Satz[] }> }
  | { ok: false; code: string; text: string }

function alsFehler(e: unknown): { code: string; text: string
  felder: Array<{ feld: string; text: string }> } {
  if (e instanceof TrainingSchreibFehler) {
    return { code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e),
    felder: [],
  }
}

/**
 * Der Stand beim Aufruf: offene Sitzung samt Inhalt, oder nichts.
 *
 * `[read]` **Das ist die Antwort auf „was passiert beim naechsten
 * Aufruf".** Siehe `stand-aus-sitzung.ts` fuer die Begruendung —
 * **fortsetzen, nicht fragen.**
 */
export async function standAktion(): Promise<InhaltErgebnis> {
  try {
    const uid = await angemeldeteNutzerin()
    const sitzung = await ladeOffeneSitzung(uid)
    if (!sitzung) return { ok: true, sitzung: null, uebungen: [] }
    return { ok: true, sitzung, uebungen: await ladeSitzungsInhalt(sitzung.id) }
  } catch (e) {
    const f = alsFehler(e)
    return { ok: false, code: f.code, text: f.text }
  }
}

export async function beginnenAktion(e: SitzungsEingabe): Promise<SitzungsErgebnis> {
  try {
    return { ok: true, kopf: await beginneSitzung(e) }
  } catch (f) {
    return { ok: false, ...alsFehler(f) }
  }
}

/**
 * Eine Uebung anhaengen.
 *
 * `[cmd]` **Der Name wird NICHT mitgegeben, sondern von der Naht aus
 * dem Katalog gelesen und eingefroren** (G-216). `[read]` Wer ihn
 * durch das Formular reichte, koennte einen beliebigen Namen
 * schreiben — **der Snapshot muss aus der Quelle kommen, nicht aus
 * dem Browser.**
 */
export async function uebungAnhaengenAktion(
  sitzungId: string, exerciseId: string,
): Promise<{ ok: true; id: string; name: string; nummer: number }
  | { ok: false; code: string; text: string }> {
  try {
    const u = await fuegeUebungHinzu(sitzungId, exerciseId)
    return { ok: true, id: u.id, name: u.exercise_name, nummer: u.exercise_order }
  } catch (f) {
    const x = alsFehler(f)
    return { ok: false, code: x.code, text: x.text }
  }
}

export async function satzAktion(
  uebungId: string, e: SatzEingabe,
): Promise<{ ok: true; nummer: number }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }> {
  try {
    const s = await trageSatzEin(uebungId, e)
    return { ok: true, nummer: s.set_number }
  } catch (f) {
    return { ok: false, ...alsFehler(f) }
  }
}

export async function abschliessenAktion(sitzungId: string): Promise<SitzungsErgebnis> {
  try {
    return { ok: true, kopf: await schliesseSitzungAb(sitzungId) }
  } catch (f) {
    return { ok: false, ...alsFehler(f) }
  }
}

export async function verwerfenAktion(sitzungId: string): Promise<SitzungsErgebnis> {
  try {
    return { ok: true, kopf: await verwerfeSitzung(sitzungId) }
  } catch (f) {
    return { ok: false, ...alsFehler(f) }
  }
}

/**
 * Uebungssuche fuer die Auswahl.
 *
 * `[read]` Dieselbe Aktion wie im Katalogreiter (`uebungen-aktion.ts`,
 * G-64) — hier mit kleinem Fenster, weil eine Auswahlliste im Modal
 * keine 50 Zeilen zeigt.
 */
export async function uebungssucheAktion(suche: string): Promise<{
  zeilen: Uebung[]; fehler: string | null
}> {
  try {
    const { zeilen } = await getUebungen({ suche, limit: 8 })
    return { zeilen, fehler: null }
  } catch (e) {
    return { zeilen: [], fehler: e instanceof Error ? e.message : String(e) }
  }
}
