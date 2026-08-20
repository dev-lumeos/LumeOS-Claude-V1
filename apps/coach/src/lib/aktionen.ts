'use server'

// Schreibweg des Portals. Jede Aktion laeuft ueber den Session-Client —
// die RLS aus 150-154 entscheidet, nicht der Anwendungscode (ein
// Durchsetzungspunkt, F-06 4.3). Fehler kommen als Text zurueck und
// werden angezeigt, nie verschluckt.
//
// BEWUSST KEIN direktes Schreiben in Modultabellen: eine fachliche
// Aenderung entsteht ausschliesslich als pending_action und wartet auf
// die Bestaetigung des Klienten. Der Ausfuehrer (Anwenden eines
// bestaetigten payload auf das Zielmodul) fehlt weiterhin — wie in
// ssot/139 benannt; hier nur Vorschlaege, keine Wirkung.
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSessionClient } from '@lumeos/shared/session'
import { MODULE } from './daten'

function zurueck(pfad: string, fehler?: string): never {
  const ziel = fehler ? `${pfad}${pfad.includes('?') ? '&' : '?'}fehler=${encodeURIComponent(fehler)}` : pfad
  revalidatePath('/')
  redirect(ziel)
}

async function angemeldet() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')
  return { supabase, uid: user.id }
}

export async function checkinReviewen(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  const feedback = String(formData.get('feedback') ?? '').trim()
  const notizen = String(formData.get('notizen') ?? '').trim()
  const pfad = String(formData.get('pfad') ?? '/?tab=workflows')
  if (!id || !feedback) zurueck(pfad, 'Feedback fehlt')

  const { supabase } = await angemeldet()
  const { error } = await supabase.schema('coach').from('checkins')
    .update({
      coach_feedback: feedback,
      coach_notes: notizen || null,
      status: 'reviewed',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
  zurueck(pfad, error?.message)
}

export async function checkinAnlegen(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const templateId = String(formData.get('template_id') ?? '') || null
  const faelligIn = Number(formData.get('faellig_in') ?? 7)
  const pfad = String(formData.get('pfad') ?? '/?tab=workflows')
  if (!clientId) zurueck(pfad, 'Klient fehlt')

  const { supabase, uid } = await angemeldet()
  const due = new Date()
  due.setDate(due.getDate() + (Number.isFinite(faelligIn) ? faelligIn : 7))
  const { error } = await supabase.schema('coach').from('checkins').insert({
    coach_id: uid,
    client_id: clientId,
    template_id: templateId,
    due_date: due.toISOString().slice(0, 10),
    status: 'pending',
  })
  zurueck(pfad, error?.message)
}

export async function nachrichtSenden(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const body = String(formData.get('body') ?? '').trim()
  const pfad = String(formData.get('pfad') ?? '/?tab=messages')
  if (!clientId || !body) zurueck(pfad, 'Nachricht ist leer')

  const { supabase, uid } = await angemeldet()
  const { error } = await supabase.schema('coach').from('messages').insert({
    coach_id: uid,
    client_id: clientId,
    sender_id: uid,
    body,
  })
  zurueck(pfad, error?.message)
}

export async function alertStatusSetzen(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const pfad = String(formData.get('pfad') ?? '/?tab=alerts')
  if (!id || !['read', 'done'].includes(status)) zurueck(pfad, 'Ungueltiger Status')

  const { supabase } = await angemeldet()
  const jetzt = new Date().toISOString()
  const { error } = await supabase.schema('coach').from('alerts')
    .update(status === 'done'
      ? { status, done_at: jetzt, read_at: jetzt }
      : { status, read_at: jetzt })
    .eq('id', id)
  zurueck(pfad, error?.message)
}

export async function autonomieSetzen(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const pfad = String(formData.get('pfad') ?? '/?tab=autonomy')
  if (!clientId) zurueck(pfad, 'Klient fehlt')

  const werte: Record<string, number> = {}
  for (const modul of MODULE) {
    const wert = Number(formData.get(`${modul}_level`))
    if (!Number.isInteger(wert) || wert < 1 || wert > 5) zurueck(pfad, `Ungueltige Stufe fuer ${modul}`)
    werte[`${modul}_level`] = wert
  }
  const safety = Number(formData.get('safety_level'))
  if (!Number.isInteger(safety) || safety < 1 || safety > 3) zurueck(pfad, 'Ungueltiges Safety-Level')

  const notiz = String(formData.get('coach_note') ?? '').trim()
  const { supabase, uid } = await angemeldet()
  const { error } = await supabase.schema('coach').from('client_autonomy')
    .update({ ...werte, safety_level: safety, coach_note: notiz || null })
    .eq('coach_id', uid)
    .eq('client_id', clientId)
  zurueck(pfad, error?.message)
}

export async function vorschlagSenden(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const modul = String(formData.get('module') ?? '')
  const titel = String(formData.get('titel') ?? '').trim()
  const beschreibung = String(formData.get('beschreibung') ?? '').trim()
  const pfad = String(formData.get('pfad') ?? '/')
  if (!clientId || !titel) zurueck(pfad, 'Titel fehlt')
  if (!(MODULE as readonly string[]).includes(modul)) zurueck(pfad, 'Ungueltiges Modul')

  const { supabase, uid } = await angemeldet()
  const { error } = await supabase.schema('coach').from('pending_actions').insert({
    coach_id: uid,
    client_id: clientId,
    module: modul,
    action_type: 'coach_vorschlag',
    preview: { title: titel, summary: beschreibung },
    payload: { note: beschreibung },
    status: 'pending',
  })
  zurueck(pfad, error?.message)
}
