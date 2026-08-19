'use server'

// Serveraktion fuer den Daumen (G-67).
//
// `[read]` Eigene Datei, damit G-65 (`vorlieben-aktionen.ts`)
// unberuehrt bleibt — dort arbeitet ein anderer Agent.
import {
  daumenSetzen, daumenStand, type Daumen,
} from '../../../lib/nutrition/daumen-schreiben'

export async function daumenSpeichern(foodId: string, zustand: Daumen): Promise<{
  ok: boolean
  zustand: Daumen
  fehler: string | null
}> {
  const e = await daumenSetzen(foodId, zustand)
  return e.ok
    ? { ok: true, zustand: e.zustand, fehler: null }
    : { ok: false, zustand: 'neutral', fehler: e.fehler }
}

export async function daumenLesen(foodIds: string[]): Promise<Record<string, Daumen>> {
  try {
    return await daumenStand(foodIds)
  } catch {
    return {}
  }
}
