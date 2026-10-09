// G-618 — Lesewege fuer „Diese Woche", „Module" und die Details je Ziel.
// Laeuft ausschliesslich serverseitig.
//
// `[read]` **Nur, was die Kette liefert:** Trainingseinheiten aus
// `training.workout_sessions` (abgeschlossen), Modulbeitraege aus
// `goals.goal_contributions`, der Verlauf eines Messziels aus
// `goals.measurement_points` bzw. `goals.measurement_weeks` (G-617).
import { createSessionClient } from '@lumeos/shared/session'
import { utcTagIso } from '@lumeos/shared/datum'

import { wochenStart, type Beitrag } from './reiter'

export interface Wochendaten {
  /** Abgeschlossene Trainingseinheiten Mo–Stichtag; `null` = nicht lesbar. */
  trainings: number | null
  /** `goal_contributions` des Steuerziels, letzte 7 Tage bis Stichtag. */
  beitraege: Beitrag[]
}

const tagMinus = (tag: string, n: number) => {
  const d = new Date(`${tag}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - n); return utcTagIso(d)
}

export async function ladeWoche(userId: string, stichtag: string, steuerzielId: string | null): Promise<Wochendaten> {
  const db = createSessionClient()
  const [t, b] = await Promise.all([
    db.schema('training').from('workout_sessions').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'completed')
      .gte('session_date', wochenStart(stichtag)).lte('session_date', stichtag),
    steuerzielId
      ? db.schema('goals').from('goal_contributions').select('module, contribution_score, contribution_date')
        .eq('goal_id', steuerzielId).gt('contribution_date', tagMinus(stichtag, 7)).lte('contribution_date', stichtag)
      : Promise.resolve({ data: [], error: null }),
  ])
  return {
    trainings: t.error ? null : t.count ?? 0,
    beitraege: ((b.data ?? []) as Array<Record<string, unknown>>).map(r => ({
      module: String(r.module),
      contribution_score: r.contribution_score === null ? null : Number(r.contribution_score),
      contribution_date: String(r.contribution_date),
    })),
  }
}

export interface Verlauf {
  punkte: Array<{ tag: string; wert: number; quelle: string }>
  wochen: Array<{ woche: string; wert: number | null; quote: number | null; serie: number; erreicht: boolean }>
}

/** Details je Ziel: Datenpunkte (einmalig) oder Wochenraster (woechentlich). */
export async function ladeVerlauf(goalId: string, stichtag: string, woechentlich: boolean): Promise<Verlauf> {
  const db = createSessionClient().schema('goals')
  const [p, w] = await Promise.all([
    db.rpc('measurement_points', { p_goal_id: goalId, p_through: stichtag }),
    woechentlich ? db.rpc('measurement_weeks', { p_goal_id: goalId, p_through: stichtag }) : Promise.resolve({ data: [], error: null }),
  ])
  if (p.error) throw new Error(`measurement_points: ${p.error.message}`)
  if (w.error) throw new Error(`measurement_weeks: ${w.error.message}`)
  const zahl = (v: unknown) => (v === null || v === undefined ? null : Number(v))
  return {
    punkte: ((p.data ?? []) as Array<Record<string, unknown>>)
      .map(r => ({ tag: String(r.measured_on), wert: Number(r.value), quelle: String(r.source_name) }))
      .sort((a, b) => a.tag.localeCompare(b.tag)),
    wochen: ((w.data ?? []) as Array<Record<string, unknown>>).map(r => ({
      woche: String(r.week_start), wert: zahl(r.observed_value), quote: zahl(r.quota_pct),
      serie: Number(r.streak_weeks ?? 0), erreicht: r.target_met === true,
    })),
  }
}
