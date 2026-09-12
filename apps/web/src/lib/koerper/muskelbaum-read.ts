// G-432/A6 — der Leseweg fuer `training.muscle_groups`.
//
// **Tom:** *„per muscle detail bildet ALLE muskelgruppen und deren
// childs ab."*
//
// `[read]` **Nicht eine Liste der gefaerbten Flaechen** — die
// vollstaendige Hierarchie, **Luecken eingeschlossen.**
//
// ══ NUR DAS LESEN STEHT HIER ════════════════════════════════════════
//
// `[cmd]` **Die Rechnung liegt in `muskelbaum.ts`, ohne Importe** —
// diese Datei zieht `next/headers` ueber `createSessionClient`, und
// ein Wert-Import daraus in eine `'use client'`-Komponente ergab in
// G-430 **HTTP 500 auf jeder Route**, waehrend `tsc` gruen blieb.
import { createSessionClient } from '@lumeos/shared/session'

import type { MuskelKnoten, MuskelbaumStand } from './muskelbaum'

export type { MuskelKnoten, MuskelbaumStand } from './muskelbaum'

const LEER: MuskelbaumStand = { knoten: [], fehler: null }

/**
 * Alle Muskelgruppen, einmal gelesen.
 *
 * `[cmd]` **95 Namen in vier Ebenen** — gemessen 2026-09-12.
 * `[read]` **Stammdaten, kein Nutzerbezug** — aber derselbe ruhige
 * Weg wie die uebrigen Abfragen: faellt sie aus, bleibt der Rest.
 */
export async function ladeMuskelbaum(): Promise<MuskelbaumStand> {
  try {
    const s = createSessionClient()
    const { data, error } = await s
      .schema('training')
      .from('muscle_groups')
      .select('id,name,parent_id')
      .order('name', { ascending: true })
    if (error) return { ...LEER, fehler: error.message }
    return { knoten: (data ?? []) as MuskelKnoten[], fehler: null }
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}
