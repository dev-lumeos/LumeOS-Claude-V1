'use server'

// Serveraktionen fuer Zyklen, Protokolle und die Injektionskonfiguration
// — G-423.
//
// `[read]` Dasselbe Muster wie `koerpermass-aktionen.ts` (G-122):
// durchreichen, Fehler als WERT zurueckgeben statt werfen — eine
// geworfene Ausnahme waere im Client eine anonyme Meldung ohne
// Feldbezug.

import {
  konfigAnlegen, konfigEntfernen, KonfigFehler,
  type KonfigEingabe, type GeschriebeneKonfig,
} from '../../../lib/medical/injektion-konfig-write'
import {
  zyklusStarten, zyklusStatusSetzen, protokollAusVorlage, ZyklusFehler,
  type ZyklusStatus,
} from '../../../lib/supplements/zyklus-write'

export type AktionsErgebnis<T> =
  | { ok: true; wert: T }
  | { ok: false; code: string; text: string
      felder: Array<{ feld: string; text: string }> }

function alsFehler(e: unknown): AktionsErgebnis<never> {
  if (e instanceof ZyklusFehler || e instanceof KonfigFehler) {
    return { ok: false, code: e.code, text: e.message, felder: e.felder ?? [] }
  }
  return {
    ok: false, code: 'WRITE_FAILED',
    text: e instanceof Error ? e.message : String(e), felder: [],
  }
}

export async function zyklusStartenAktion(
  supplementId: string, notiz = '',
): Promise<AktionsErgebnis<string>> {
  try {
    return { ok: true, wert: await zyklusStarten(supplementId, notiz) }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function zyklusStatusAktion(
  zyklusId: string, status: ZyklusStatus, notiz = '',
): Promise<AktionsErgebnis<string>> {
  try {
    return { ok: true, wert: await zyklusStatusSetzen(zyklusId, status, notiz) }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function protokollAusVorlageAktion(
  vorlageCode: string, ankerSupplementId: string, startDatum?: string,
): Promise<AktionsErgebnis<string>> {
  try {
    return {
      ok: true,
      wert: await protokollAusVorlage(vorlageCode, ankerSupplementId, startDatum),
    }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function konfigAnlegenAktion(
  e: KonfigEingabe,
): Promise<AktionsErgebnis<GeschriebeneKonfig>> {
  try {
    return { ok: true, wert: await konfigAnlegen(e) }
  } catch (f) {
    return alsFehler(f)
  }
}

export async function konfigEntfernenAktion(
  id: string,
): Promise<AktionsErgebnis<null>> {
  try {
    await konfigEntfernen(id)
    return { ok: true, wert: null }
  } catch (f) {
    return alsFehler(f)
  }
}
