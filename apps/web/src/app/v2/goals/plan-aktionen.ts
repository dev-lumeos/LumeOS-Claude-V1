'use server'

// G-629 — Serveraktionen des Planers. Jede Aktion holt die Seite neu.
import { revalidatePath } from 'next/cache'

import * as w from '../../../lib/goals/plan-write'
import type { Planergebnis, Positionsdaten } from '../../../lib/goals/plan-write'

const neu = (r: Planergebnis) => { if (r.ok) revalidatePath('/v2/goals'); return r }

export async function planAnlegenAktion(goalId: string, name: string) { return neu(await w.planAnlegen(goalId, name)) }
export async function planAnlegenAusAktion(goalId: string, name: string, ausgangspunkt: string, anker: string) {
  return neu(await w.planAnlegenAus(goalId, name, ausgangspunkt, anker))
}
export async function planAlsVorlageAktion(id: string, name: string) { return neu(await w.planAlsVorlage(id, name)) }
export async function positionLoeschenAktion(id: string) { return neu(await w.positionLoeschen(id)) }
export async function planUmbenennenAktion(id: string, name: string) { return neu(await w.planUmbenennen(id, name)) }
export async function planAktivierenAktion(id: string) { return neu(await w.planAktivieren(id)) }
export async function planPausierenAktion(id: string) { return neu(await w.planPausieren(id)) }
export async function planBeendenAktion(id: string) { return neu(await w.planBeenden(id)) }
export async function planLoeschenAktion(id: string) { return neu(await w.planLoeschen(id)) }
export async function positionSpeichernAktion(planId: string, positionId: string | null, d: Positionsdaten) {
  return neu(await w.positionSpeichern(planId, positionId, d))
}
export async function positionVerschiebenAktion(positionId: string, nach: number) { return neu(await w.positionVerschieben(positionId, nach)) }
export async function positionAendernAbAktion(positionId: string, d: Parameters<typeof w.positionAendernAb>[1]) {
  return neu(await w.positionAendernAb(positionId, d))
}
export async function terminSpeichernAktion(planId: string, terminId: string | null, name: string, kind: string, datum: string) {
  return neu(await w.terminSpeichern(planId, terminId, name, kind, datum))
}
export async function terminLoeschenAktion(terminId: string) { return neu(await w.terminLoeschen(terminId)) }
