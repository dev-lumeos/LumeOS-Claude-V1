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

// ══ G-582: der Alarm bekommt seinen Aufrufer ══════════════════════
//
// `[cmd]` **`coach.raise_alert` hatte null Aufrufer** in `apps/` und
// `packages/` — gezaehlt am 2026-10-02, der vierte und letzte Weg aus
// G-571. **Der Reiter zeigte Alarme, erzeugen konnte sie niemand.**
//
// ══ DIE SIGNATUR, GEMESSEN STATT ANGENOMMEN ═══════════════════════
//
// `[cmd]` **Aus `pg_proc` mit `prokind = 'f'`, 2026-10-02:**
//
//     coach.raise_alert(p_client uuid, p_kind text, p_severity text,
//                       p_title text, p_detail text,
//                       p_metric jsonb DEFAULT '{}')
//     RETURNS uuid · LANGUAGE plpgsql · SECURITY INVOKER
//
// ══ WAS DIE FUNKTION SELBST TUT ═══════════════════════════════════
//
// `[read]` **1. Sie entdoppelt.** Gibt es zu `coach + client + kind`
// einen Alarm aus den letzten 24 Stunden, der nicht `done` ist,
// **gibt sie dessen Id zurueck und schreibt NICHTS.** `[read]` **Die
// zurueckgegebene Id ist also nicht zwangslaeufig eine neue** — wer
// „angelegt" meldet, ohne nachzusehen, behauptet etwas.
//
// `[read]` **2. Sie setzt `module = 'general'` selbst** — es gibt
// keinen Parameter dafuer. **Ein Alarm aus diesem Weg traegt nie ein
// Fachmodul**, obwohl `alerts_module_check` acht Werte zulaesst.
//
// `[read]` **3. `coach_id` und `created_by` kommen aus `auth.uid()`**,
// nie vom Aufrufer — und sie verlangt eine **aktive eigene Beziehung**
// zum Klienten (`coach.relationships`, `status = 'active'`), sonst
// `42501`.
//
// `[cmd]` **Drei Fehlerfaelle, zwei SQLSTATEs:** `42501` ohne aktive
// Beziehung, `23514` fuer eine unbekannte Alarmart und fuer
// Schweregrad/Metrik.
//
// `[read]` **Die Texte stehen HIER und nicht in
// `apps/web/src/lib/fehler/ladefehler.ts`:** `apps/coach` teilt mit
// `apps/web` nur `@lumeos/shared` und `@lumeos/ui` — **gemessen
// 2026-10-02, kein Pfad nach `apps/web/src`.** **Einen zweiten Ort
// fuer Fehlertexte habe ich nicht erfunden** (G-582/A3); die Meldung
// reist wie bei allen Aktionen hier ueber `zurueck(pfad, fehler)`.

/** Die fuenf Alarmarten aus dem Rumpf und `alerts_kind_ck`. */
const ALARMARTEN = [
  'checkin_overdue', 'inactivity', 'adherence_low',
  'progress_stagnation', 'engagement_low',
] as const

/** Die fuenf Schweregrade aus dem Rumpf und `alerts_severity_ck`. */
const SCHWEREGRADE = ['info', 'low', 'medium', 'high', 'critical'] as const

/**
 * Einen Alarm ausloesen — G-582.
 *
 * `[read]` **Die Pruefung kommt der Funktion zuvor**, damit der Coach
 * einen Satz sieht und keine englische Postgres-Meldung. **Sie
 * ersetzt sie nicht:** die Beziehung prueft nur die Datenbank, und
 * das ist richtig so (ein Durchsetzungspunkt, F-06 4.3).
 */
export async function alarmAusloesen(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const art = String(formData.get('kind') ?? '')
  const grad = String(formData.get('severity') ?? '')
  const titel = String(formData.get('titel') ?? '').trim()
  const detail = String(formData.get('detail') ?? '').trim()
  const pfad = String(formData.get('pfad') ?? '/?tab=alerts')

  if (!clientId) zurueck(pfad, 'Kein Athlet gewaehlt')
  if (!titel) zurueck(pfad, 'Der Alarm braucht einen Sachverhalt')
  if (!(ALARMARTEN as readonly string[]).includes(art)) {
    zurueck(pfad, 'Unbekannte Alarmart')
  }
  if (!(SCHWEREGRADE as readonly string[]).includes(grad)) {
    zurueck(pfad, 'Unbekannter Schweregrad')
  }

  const { supabase } = await angemeldet()
  const { data, error } = await supabase.schema('coach')
    .rpc('raise_alert', {
      p_client: clientId,
      p_kind: art,
      p_severity: grad,
      p_title: titel,
      p_detail: detail || null,
      // `[read]` **Leer heisst leer** — `alerts_metric_check` verlangt
      // ein Objekt, und erfundene Zahlen waeren schlimmer als keine.
      p_metric: {},
    })

  if (error) {
    // `[cmd]` **`42501` wirft der Rumpf ohne aktive Beziehung.**
    // `[read]` **Kein Sitzungsfehler** — der Coach ist angemeldet, er
    // betreut diesen Athleten nur nicht. **Zur Anmeldung zu schicken
    // waere die falsche Suche.**
    if (error.code === '42501') {
      zurueck(pfad, 'Fuer diesen Athleten besteht keine aktive '
        + 'Betreuung — ein Alarm laesst sich nur fuer eigene Klienten '
        + 'ausloesen.')
    }
    if (error.code === '23514') {
      zurueck(pfad, 'Die Datenbank hat den Alarm abgelehnt: '
        + 'Alarmart oder Schweregrad sind nicht zugelassen.')
    }
    zurueck(pfad, error.message)
  }
  // `[read]` **G-79: die Rueckgabe pruefen.** `[cmd]` **Kommt keine
  // Kennung, wurde nichts geschrieben** — auch ohne Fehler.
  if (!data) zurueck(pfad, 'Der Alarm wurde nicht angelegt')
  zurueck(pfad)
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
