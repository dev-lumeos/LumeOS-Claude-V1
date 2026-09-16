'use server'

// Serveraktion fuer den Produktdaumen — G-455.
//
// `[read]` **Eigene Datei, wie in nutrition** (`daumen-aktion.ts`,
// G-67) — der Reiter ist `'use client'` und kann den Schreibweg nicht
// selbst rufen.
import {
  produktDaumenSetzen,
} from '../../../lib/supplements/produkt-daumen'
import type { Daumen } from '../../../lib/supplements/produkt-daumen-lage'

export async function produktDaumenSpeichern(
  produktId: string, zustand: Daumen,
): Promise<{ ok: boolean; zustand: Daumen; fehler: string | null }> {
  const e = await produktDaumenSetzen(produktId, zustand)
  return e.ok
    ? { ok: true, zustand: e.zustand, fehler: null }
    : { ok: false, zustand: 'neutral', fehler: e.fehler }
}
