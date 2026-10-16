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
  /** Tom 16.10.: Soll der Woche aus der aktiven Routine (`training.routines.days_per_week`); `null` = keine. */
  trainingsSoll?: number | null
  /** `goal_contributions` des Steuerziels, letzte 7 Tage bis Stichtag. */
  beitraege: Beitrag[]
  /**
   * G-648: das Trendgewicht (`goals.trendgewicht_am`, G-631) — heute und am
   * Sonntag vor dieser Woche. `[read]` **Die Kette rechnet den Trend**, die
   * App liest ihn nur; `null` = keine Messung bis dahin.
   */
  trend: { heute: number | null; vorwoche: number | null }
  /** G-648 Rest: `goals.controlling_goal_outlook` (G-650); `null` = kein Steuerziel oder Kette nicht live. */
  ausblick?: Ausblick | null
}

/** Eine Woche aus `controlling_goal_outlook.wochen` — Felder wie in `650_controlling_goal_plan_outlook.sql`. */
export interface Ausblickwoche {
  woche_ab: string; woche_bis: string; vollstaendig: boolean
  trend_kg: number | null; soll_kg: number | null; trend_delta_kg: number | null; soll_delta_kg: number | null
  durchschnitt_kcal: number | null; logtage: number; anpassung_kcal: number | null
}
export interface Ausblick {
  wochen: Ausblickwoche[]
  kennzahlen: { start_kg: number | null; ziel_kg: number | null; trend_kg: number | null; veraenderung_gesamt_kg: number | null
    tempo_4w_kg_pro_woche: number | null; soll_kg_pro_woche: number | null; verbleibend_kg: number | null; fortschritt_pct: number | null }
  /** `plan_status` seit G-653 (live 16.10.): datum | kein_aktiver_plan | nicht_im_plan | nicht_absehbar. */
  prognose: { plan_datum: string | null; plan_status?: string | null; status: 'datum' | 'nicht_absehbar'; datum: string | null; grund: string | null }
}

/**
 * `[cmd]` **Die Kette rechnet Soll, Tempo und Prognose** (G-650, live 16.10.); die
 * App liest nur. Fehlt die Funktion (PGRST202, vor dem Einspielen), bleibt „kommt".
 */
async function ladeAusblick(goalId: string, stichtag: string): Promise<Ausblick | null> {
  const { data, error } = await createSessionClient().schema('goals').rpc('controlling_goal_outlook', { p_goal_id: goalId, p_stichtag: stichtag })
  if (error) {
    if (error.code === 'PGRST202') return null
    throw new Error(`controlling_goal_outlook: ${error.message}`)
  }
  return data as Ausblick | null
}

const tagMinus = (tag: string, n: number) => {
  const d = new Date(`${tag}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - n); return utcTagIso(d)
}

export async function ladeWoche(userId: string, stichtag: string, steuerzielId: string | null): Promise<Wochendaten> {
  const db = createSessionClient()
  const trendAm = (tag: string) => db.schema('goals').rpc('trendgewicht_am', { p_user_id: userId, p_stichtag: tag })
  const [t, b, th, tv, ausblick, routine] = await Promise.all([
    db.schema('training').from('workout_sessions').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'completed')
      .gte('session_date', wochenStart(stichtag)).lte('session_date', stichtag),
    steuerzielId
      ? db.schema('goals').from('goal_contributions').select('module, contribution_score, contribution_date')
        .eq('goal_id', steuerzielId).gt('contribution_date', tagMinus(stichtag, 7)).lte('contribution_date', stichtag)
      : Promise.resolve({ data: [], error: null }),
    trendAm(stichtag), trendAm(tagMinus(wochenStart(stichtag), 1)),
    steuerzielId ? ladeAusblick(steuerzielId, stichtag) : Promise.resolve(null),
    db.schema('training').from('routines').select('days_per_week').eq('user_id', userId).eq('is_active', true).not('days_per_week', 'is', null)
      .order('updated_at', { ascending: false }).limit(1),
  ])
  const wert = (r: { data: unknown; error: unknown }) => {
    const z = !r.error && Array.isArray(r.data) ? r.data[0] as Record<string, unknown> | undefined : undefined
    return z && z.wert !== null && z.wert !== undefined ? Number(z.wert) : null
  }
  return {
    trend: { heute: wert(th), vorwoche: wert(tv) },
    ausblick,
    trainingsSoll: routine.error || !routine.data?.[0] ? null : Number(routine.data[0].days_per_week),
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
