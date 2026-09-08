'use server'

// Die drei Schreibwege des Coach-Moduls (C-225): Antworten, Einladen,
// Als-gelesen. Muster wie `rechte-schreiben.ts` (G-90): Session-Client,
// `.select()`-Pflicht gegen stille Nullzeilen-Updates (G-79),
// `revalidatePath`, damit Kopf und Liste dieselbe RLS-Sicht zeigen.
//
// `[cmd]` **Die Zeilenrechte tragen die Regeln, nicht diese Datei:**
//   messages_insert   sender = uid UND uid ∈ {coach_id, client_id}
//   messages_update   uid ∈ Beziehung UND uid ≠ sender  (nur FREMDE
//                     Nachrichten lassen sich als gelesen markieren)
//   relationships_insert  uid ∈ {coach_id, client_id} UND invited_by = uid
//
// `[read]` **Eingeladen wird per Kennung (UUID), nicht per Name oder
// E-Mail.** Es gibt keine Namensquelle (coach_profiles fehlt — im
// Punkt geklaert), und `auth.users` ist fuer Clients bewusst nicht
// lesbar. Eine E-Mail-Aufloesung braeuchte eine DB-Funktion — gemeldet,
// nicht danebengebaut.
import { revalidatePath } from 'next/cache'
import { createSessionClient } from '@lumeos/shared/session'

export type SchreibErgebnis =
  | { ok: true }
  | { ok: false; fehler: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function sitzung() {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { client, userId: null as string | null }
  return { client, userId: user.id }
}

/** Eine Antwort in eine eigene Beziehung schreiben. */
export async function sendeNachricht(eingabe: {
  coachId: string
  clientId: string
  text: string
}): Promise<SchreibErgebnis> {
  const text = eingabe.text.trim()
  if (!text) return { ok: false, fehler: 'Die Nachricht ist leer.' }
  if (text.length > 4000) return { ok: false, fehler: 'Die Nachricht ist zu lang (max. 4000).' }

  const { client, userId } = await sitzung()
  if (!userId) return { ok: false, fehler: 'Keine angemeldete Session.' }

  const { data, error } = await client.schema('coach')
    .from('messages')
    .insert({
      coach_id: eingabe.coachId,
      client_id: eingabe.clientId,
      sender_id: userId,
      body: text,
    })
    .select('id')
  if (error) return { ok: false, fehler: error.message }
  if (!data?.length) {
    return { ok: false, fehler: 'Nicht geschrieben — die Beziehung gehört dir nicht (Zeilenschutz).' }
  }
  revalidatePath('/v2/coach/human')
  return { ok: true }
}

/**
 * Einen Coach einladen — `relationships` mit `status='invited'`.
 * Der Klient laedt ein: `client_id` = eigene Kennung, `invited_by`
 * setzt die Policy-Bedingung durch.
 */
export async function ladeCoachEin(eingabe: {
  coachId: string
  note?: string | null
}): Promise<SchreibErgebnis> {
  if (!UUID.test(eingabe.coachId)) {
    return { ok: false, fehler: 'Die Coach-Kennung ist keine gültige UUID.' }
  }

  const { client, userId } = await sitzung()
  if (!userId) return { ok: false, fehler: 'Keine angemeldete Session.' }
  if (eingabe.coachId === userId) {
    return { ok: false, fehler: 'Sich selbst einladen geht nicht.' }
  }

  const { data, error } = await client.schema('coach')
    .from('relationships')
    .insert({
      coach_id: eingabe.coachId,
      client_id: userId,
      invited_by: userId,
      status: 'invited',
      invite_note: eingabe.note?.trim() || null,
    })
    .select('id')
  if (error) return { ok: false, fehler: error.message }
  if (!data?.length) return { ok: false, fehler: 'Nicht geschrieben (Zeilenschutz).' }
  revalidatePath('/v2/coach/human')
  return { ok: true }
}

/**
 * Eine eigene, noch offene Einladung zuruecknehmen. C-269 ist ein
 * Statuswechsel mit Auditspur, nie ein DELETE. Fremde, fehlende und bereits
 * entschiedene Einladungen liefern gleichermassen false und legen damit keine
 * Beziehung offen.
 */
export async function nehmeEinladungZurueck(
  beziehungsId: string,
  grund?: string | null,
): Promise<SchreibErgebnis> {
  if (!UUID.test(beziehungsId)) {
    return { ok: false, fehler: 'Die Einladungskennung ist keine gueltige UUID.' }
  }

  const { client, userId } = await sitzung()
  if (!userId) return { ok: false, fehler: 'Keine angemeldete Session.' }

  const { data, error } = await client.schema('coach')
    .rpc('withdraw_relationship_invite', {
      p_relationship_id: beziehungsId,
      p_reason: grund?.trim() || null,
    })
  if (error) return { ok: false, fehler: error.message }
  if (!data) return { ok: false, fehler: 'Die offene Einladung wurde nicht gefunden.' }

  revalidatePath('/v2/coach/human')
  return { ok: true }
}

/**
 * Eine FREMDE Nachricht als gelesen markieren. `[read]` Die eigene
 * laesst die Policy nicht zu — wer es versucht, bekommt null Zeilen,
 * und genau das wird hier gemeldet statt verschluckt (G-79).
 */
export async function markiereGelesen(nachrichtId: string): Promise<SchreibErgebnis> {
  const { client, userId } = await sitzung()
  if (!userId) return { ok: false, fehler: 'Keine angemeldete Session.' }

  const { data, error } = await client.schema('coach')
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', nachrichtId)
    .is('read_at', null)
    .select('id')
  if (error) return { ok: false, fehler: error.message }
  if (!data?.length) {
    return { ok: false, fehler: 'Nichts markiert — fremde ungelesene Nachricht nicht gefunden.' }
  }
  revalidatePath('/v2/coach/human')
  return { ok: true }
}
