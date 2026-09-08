'use server'

// Die Serveraktionen des Dokumentteils — G-376.
//
// `[cmd]` **`dokumente-write.ts` zieht `next/headers` mit** — ein
// Wert-Import aus einer Client-Komponente braechte HTTP 500 bei
// gruenem Typecheck (G-74, G-79, G-97). **Deshalb der dynamische
// Import im Rumpf.**

import { revalidatePath } from 'next/cache'

export type MedAntwort = {
  ok: boolean
  fehler?: string
  id?: string
  /** Bei `hochladen`: der Pfad im Bucket und die Groesse. */
  pfad?: string
  groesse?: number
  /** Bei `oeffnen`: die zeitlich begrenzte URL. */
  url?: string
}

function satz(f: unknown): string {
  return f instanceof Error ? f.message : 'Unbekannter Fehler.'
}

/** Ein Ereignis erfassen — Diagnose, Behandlung, Operation. */
export async function ereignisAnlegen(e: {
  art: string; datum: string; titel: string; details?: string | null
  herkunftArt: string; herkunftWer: string; belegId?: string | null
}): Promise<MedAntwort> {
  try {
    const { legeEreignisAn } = await import('../../../lib/medical/dokumente-write')
    const r = await legeEreignisAn(e)
    revalidatePath('/v2/medical')
    return { ok: true, id: r.id }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}

/** Einen Termin anlegen. */
export async function terminAnlegen(t: {
  art: string; beginn: string; titel?: string | null; notiz?: string | null
}): Promise<MedAntwort> {
  try {
    const { legeTerminAn } = await import('../../../lib/medical/dokumente-write')
    const r = await legeTerminAn(t)
    revalidatePath('/v2/medical')
    return { ok: true, id: r.id }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}

/**
 * Einen Termin aendern oder absagen.
 *
 * `[read]` **Absagen ist ein Zustand, kein Loeschen** — der Termin
 * bleibt lesbar.
 */
export async function terminAendern(
  id: string,
  aenderung: { beginn?: string; status?: string; titel?: string | null; notiz?: string | null },
): Promise<MedAntwort> {
  try {
    const { aendereTermin } = await import('../../../lib/medical/dokumente-write')
    const r = await aendereTermin(id, aenderung)
    revalidatePath('/v2/medical')
    return { ok: true, id: r.id }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}

/**
 * Ein Original ablegen — E-75.
 *
 * `[read]` **Die Datei kommt als `FormData`** — ein `File` laesst
 * sich nicht als gewoehnliches Argument an eine Serveraktion reichen.
 */
export async function originalHochladen(form: FormData): Promise<MedAntwort> {
  try {
    const berichtId = String(form.get('berichtId') ?? '')
    const datei = form.get('datei')
    if (!berichtId) return { ok: false, fehler: 'Kein Befund gewaehlt.' }
    if (!(datei instanceof File) || datei.size === 0) {
      return { ok: false, fehler: 'Keine Datei gewaehlt.' }
    }
    const { legeOriginalAb } = await import('../../../lib/medical/dokumente-write')
    const r = await legeOriginalAb(berichtId, datei)
    revalidatePath('/v2/medical')
    return { ok: true, pfad: r.pfad, groesse: r.groesse }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}

/**
 * Eine zeitlich begrenzte URL zu einem Original holen — E-75.
 *
 * `[read]` **Sie entsteht beim Lesen und laeuft ab** — sie wird
 * nirgends gespeichert.
 */
export async function originalOeffnen(pfad: string): Promise<MedAntwort> {
  try {
    const { signierteUrl } = await import('../../../lib/medical/dokumente-read')
    const r = await signierteUrl(pfad)
    if (r.fehler) return { ok: false, fehler: r.fehler }
    return { ok: true, url: r.url ?? undefined }
  } catch (f) {
    return { ok: false, fehler: satz(f) }
  }
}
