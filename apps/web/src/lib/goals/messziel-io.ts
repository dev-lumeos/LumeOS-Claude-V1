// G-628 Teil 3 — Lesen und Schreiben fuer Weg B. Laeuft ausschliesslich serverseitig.
//
// `[read]` **Was waehlbar ist, sagt die Kette:** `measurement_source_options`
// (available / pending) und `measurement_circumference_sites` (13 Stellen).
// `[read]` **Den Startwert haelt der Trigger fest** — hier wird er nach dem
// Anlegen nur zurueckgelesen, nicht gerechnet. Seit G-634 liest
// `startVorschau` denselben Wert VORHER (`measurement_goal_start_preview`).
import { createSessionClient } from '@lumeos/shared/session'

import { alsVorschau, messzielSatz, type Startstand, type Vorschau } from './messziel'

const goals = () => createSessionClient().schema('goals')

export interface Messquellen {
  verfuegbar: Record<string, boolean>
  stellen: string[]
}

export async function ladeMessquellen(): Promise<Messquellen> {
  const db = goals()
  const [o, s] = await Promise.all([
    db.from('measurement_source_options').select('measurement_type, availability'),
    db.from('measurement_circumference_sites').select('site'),
  ])
  if (o.error || s.error) throw new Error(`Messquellen: ${(o.error ?? s.error)!.message}`)
  return {
    verfuegbar: Object.fromEntries((o.data ?? []).map(r => [r.measurement_type as string, r.availability === 'available'])),
    stellen: (s.data ?? []).map(r => r.site as string),
  }
}

export interface Uebung { id: string; name: string }

/** Ohne Suchtext: zuletzt trainiert. Mit Suchtext: Name enthaelt ihn. */
export async function sucheUebungen(q: string): Promise<Uebung[]> {
  const db = createSessionClient()
  const t = db.schema('training')
  if (q.trim().length < 2) {
    const { data: { user } } = await db.auth.getUser()
    if (!user) return []
    const { data } = await t.from('workout_exercises')
      .select('exercise_id, exercises!inner(name), workout_sessions!inner(user_id, status, session_date)')
      .eq('workout_sessions.user_id', user.id).eq('workout_sessions.status', 'completed')
      .order('session_date', { referencedTable: 'workout_sessions', ascending: false })
      .limit(50)
    const zeilen = (data ?? []) as unknown as Array<{ exercise_id: string; exercises: { name: string } }>
    const gesehen = new Map<string, string>()
    for (const z of zeilen) if (!gesehen.has(z.exercise_id)) gesehen.set(z.exercise_id, z.exercises.name)
    return Array.from(gesehen, ([id, name]) => ({ id, name })).slice(0, 8)
  }
  const { data } = await t.from('exercises').select('id, name')
    .eq('is_active', true).ilike('name', `%${q.trim().replace(/[%_]/g, '')}%`)
    .order('name').limit(15)
  return (data ?? []) as Uebung[]
}

export async function messzielAnlegen(p: Record<string, string | number | null>):
  Promise<{ ok: true; start: Startstand } | { ok: false; fehler: string }> {
  const db = goals()
  const { data: id, error } = await db.rpc('measurement_goal_create', p)
  if (error) return { ok: false, fehler: messzielSatz(error.message) }
  const { data, error: e2 } = await db.from('user_goals')
    .select('start_value, start_source, start_measured_at, target_unit').eq('id', id as string).single()
  if (e2 || !data) return { ok: false, fehler: `Angelegt, aber nicht lesbar: ${e2?.message ?? 'keine Zeile'}` }
  return { ok: true, start: { ...data, start_value: data.start_value === null ? null : Number(data.start_value) } as Startstand }
}

/** G-634: der Startwert, wie der Snapshot ihn beim Anlegen festhalten wuerde. */
export async function startVorschau(p: Record<string, string | number | null>):
  Promise<{ ok: true; vorschau: Vorschau } | { ok: false; fehler: string }> {
  const { data, error } = await goals().rpc('measurement_goal_start_preview', p)
  if (error) return { ok: false, fehler: messzielSatz(error.message) }
  const z = (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null
  // `[cmd]` Ohne `auth.uid()` liefert die Funktion keine Zeile (634, Zeile 20).
  if (!z) return { ok: false, fehler: 'Deine Anmeldung ist abgelaufen. Bitte neu anmelden.' }
  const v = alsVorschau(z)
  return v ? { ok: true, vorschau: v } : { ok: false, fehler: `Unbekannte Kennung „${String(z.kennung)}“.` }
}
