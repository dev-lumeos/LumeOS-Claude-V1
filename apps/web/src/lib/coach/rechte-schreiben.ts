'use server'

// Schreibpfad fuer Coach-Rechte und wartende Coach-Aktionen. Rechte bleiben
// clientseitig; die Aktionsentscheidung wird G-324 ausschliesslich durch die
// atomaren Datenbankfunktionen vollzogen.
import { revalidatePath } from 'next/cache'
import { createSessionClient } from '@lumeos/shared/session'

import { MODULE, SICHT, type Modul, type Sicht } from './rechte-modell'

export type SchreibErgebnis =
  | { ok: true }
  | { ok: false; fehler: string }

/** Setzt eine Sichtstufe oder das Aenderungsrecht eines Moduls. */
export async function setzeRecht(eingabe: {
  coachId: string
  modul: Modul
  sicht?: Sicht
  autoAendern?: boolean
}): Promise<SchreibErgebnis> {
  const { coachId, modul } = eingabe

  if (!MODULE.includes(modul)) {
    return { ok: false, fehler: `Unbekanntes Modul: ${modul}` }
  }
  if (eingabe.sicht !== undefined && !SICHT.includes(eingabe.sicht)) {
    return { ok: false, fehler: `Unbekannte Sichtstufe: ${eingabe.sicht}` }
  }
  if (eingabe.sicht === undefined && eingabe.autoAendern === undefined) {
    return { ok: false, fehler: 'Nichts zu setzen.' }
  }

  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ok: false, fehler: 'Nicht angemeldet.' }
    if (user.id === coachId) {
      return { ok: false, fehler: 'Coach und Klient sind dieselbe Person.' }
    }

    const feld: Record<string, unknown> = {}
    if (eingabe.sicht !== undefined) feld[`${modul}_visibility`] = eingabe.sicht
    if (eingabe.autoAendern !== undefined) feld[`${modul}_auto_apply`] = eingabe.autoAendern

    const { data, error } = await client
      .schema('coach')
      .from('client_permissions')
      .upsert(
        { coach_id: coachId, client_id: user.id, ...feld },
        { onConflict: 'coach_id,client_id' },
      )
      .select('id')

    if (error) return { ok: false, fehler: error.message }
    if (!data || data.length === 0) {
      return {
        ok: false,
        fehler: 'Nicht gespeichert - die Zeilenrechte haben den Schreibvorgang '
          + 'gefiltert. Rechte setzt nur der Klient selbst.',
      }
    }

    revalidatePath('/v2/coach')
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * G-324: Der Browser liefert nur die Aktions-ID. Akteur, Eigentum, Status
 * und Ablauf kommen aus der Datenbank. Die RPC-Fehler bleiben fuer fremde,
 * nicht mehr offene, abgelaufene oder nicht ausfuehrbare Aktionen erhalten.
 */
export async function entscheideAktion(
  aktionId: string, entscheidung: 'confirmed' | 'rejected',
): Promise<SchreibErgebnis> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ok: false, fehler: 'Nicht angemeldet.' }

    const { error } = entscheidung === 'confirmed'
      ? await client.schema('coach').rpc('bestaetige_aktion', { p_action_id: aktionId })
      : await client.schema('coach').rpc('lehne_aktion_ab', { p_action_id: aktionId })

    if (error) return { ok: false, fehler: error.message }
    revalidatePath('/v2/coach')
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
