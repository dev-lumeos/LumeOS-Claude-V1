'use server'

// G-608 — die Stufenwochen aus dem Editor speichern oder zuruecksetzen.
import { revalidatePath } from 'next/cache'

import {
  stufenwochenSpeichern, stufenwochenZuruecksetzen,
  type ProgrammErgebnis, type Stufenwoche,
} from '../../../lib/goals/programm-write'

export async function stufenwochenSpeichernAktion(
  goalId: string, strategieCode: string, stufen: Stufenwoche[],
): Promise<ProgrammErgebnis> {
  const r = await stufenwochenSpeichern(goalId, strategieCode, stufen)
  if (r.ok) revalidatePath('/v2/goals')
  return r
}

export async function stufenwochenZuruecksetzenAktion(goalId: string): Promise<ProgrammErgebnis> {
  const r = await stufenwochenZuruecksetzen(goalId)
  if (r.ok) revalidatePath('/v2/goals')
  return r
}
