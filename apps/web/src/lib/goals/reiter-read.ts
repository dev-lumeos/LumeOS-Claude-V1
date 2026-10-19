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
import { einheitDetail, messungDetail, punkteAusKette, sollwegKg, umfangDetail, UMFANG_NAME, type Punktdetail } from './datenpunkt'

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
  /** G-654: `goals.controlling_goal_lage_at` — Lage des Steuerziels; `null` = keine Lage (z. B. kein EMA-Trend). */
  lage?: { lage: 'voraus' | 'im_plan' | 'hinterher' | null; abweichung_kg: number | null; toleranz_kg: number | null } | null
  /** G-654: `goals.measurement_goal_week_at` je aktivem Messziel (goal_id → Woche). */
  messwochen?: Record<string, Messwoche>
  /** G-644 Teil 2: `goals.goal_phase_guards_at` — die Wachen der laufenden Phase; `null` = keine laufende Phase. */
  wachen?: Wache[] | null
  /** G-522: `goals.goal_module_cards_at` — vier Kacheln und der Engpass; `null` = kein Steuerziel oder Kette nicht live. */
  kacheln?: Modulkacheln | null
  /**
   * G-678 (Nachtrag 19.10.): `goals.planlinien_am(goal, tag).historisch_kg` — der Sollweg vom Zielstart bis
   * zur Frist (Entwurf Main.dc.html: graue Planlinie 85 → 88 kg). Der Abstand zum Trend ist die Lage.
   * `vorwaerts_kg` wird nicht gezeichnet; das Wochensoll kommt aus `controlling_goal_outlook` (gleiche Rate).
   */
  planHistorisch?: Array<{ tag: string; kg: number }>
  /** G-669: `goals.goal_als_naechstes` — die gespeicherte Empfehlung; `null` = keine (G-677 regelt den Text). */
  alsNaechstes?: { startdatum: string; programm: string; dauer_wochen: number; grund: string } | null
}

/**
 * Felder wie in `522_goal_module_cards.sql`. `[read]` **Die Kette rechnet Werte und Engpass**
 * (`goal_bottleneck`, SCORING.md); die App zeigt nur. `grund` ist gesetzt, wenn `wert` fehlt.
 */
export interface Modulkacheln {
  stand_am: string
  nutrition: { wert: number | null; tage: number; grund: string | null }
  training: { wert: number | null; wochenziel: number | null; score: number | null; grund: string | null }
  recovery: { wert: number | null; tage: number; schlaf_stunden: number | null; grund: string | null }
  supplements: { wert: number | null; tage: number; grund: string | null }
  engpass: { module: string; grund: string } | null
  engpass_grund: 'kein_deutlicher_engpass' | 'keine_modulwerte' | null
}

/** Eine Zeile aus `goal_phase_guards_at` — Felder wie in `644_plan_guards_target_cap.sql`. */
export interface Wache {
  key: 'kraftverlust_4w' | 'trend_3w' | 'koerperfett_grenze'
  status: 'ok' | 'ausgeloest' | 'keine_daten' | 'nicht_anwendbar'
  wert_pct?: number | null; grenze_pct?: number | null; richtung?: 'min' | 'max' | null
  wochen_neben_soll?: number | null; grenze_wochen?: number | null; stand_am: string
}

/** Felder wie in `654_goal_lage_measurement_week.sql`. */
export interface Messwoche {
  delta_woche: number | null; soll_delta_woche: number | null; tempo_pro_woche: number | null
  prognose_status: 'datum' | 'nicht_absehbar'; prognose_datum: string | null
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
async function kette<T>(fn: string, goalId: string, stichtag: string): Promise<T | null> {
  const { data, error } = await createSessionClient().schema('goals').rpc(fn, { p_goal_id: goalId, p_stichtag: stichtag })
  if (error) {
    if (error.code === 'PGRST202') return null
    throw new Error(`${fn}: ${error.message}`)
  }
  return data as T | null
}

/** jsonb liefert numeric als Zahl; zur Sicherheit auch Text annehmen. */
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v))

const tagMinus = (tag: string, n: number) => {
  const d = new Date(`${tag}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - n); return utcTagIso(d)
}

export async function ladeWoche(userId: string, stichtag: string, steuerzielId: string | null, messzielIds: string[] = [], zielDatum: string | null = null, zielStart: string | null = null): Promise<Wochendaten> {
  const db = createSessionClient()
  const trendAm = (tag: string) => db.schema('goals').rpc('trendgewicht_am', { p_user_id: userId, p_stichtag: tag })
  const [t, b, th, tv, ausblick, routine, lage, mw, wachen, kacheln, naechstes] = await Promise.all([
    db.schema('training').from('workout_sessions').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'completed')
      .gte('session_date', wochenStart(stichtag)).lte('session_date', stichtag),
    steuerzielId
      ? db.schema('goals').from('goal_contributions').select('module, contribution_score, contribution_date')
        .eq('goal_id', steuerzielId).gt('contribution_date', tagMinus(stichtag, 7)).lte('contribution_date', stichtag)
      : Promise.resolve({ data: [], error: null }),
    trendAm(stichtag), trendAm(tagMinus(wochenStart(stichtag), 1)),
    steuerzielId ? kette<Ausblick>('controlling_goal_outlook', steuerzielId, stichtag) : Promise.resolve(null),
    db.schema('training').from('routines').select('days_per_week').eq('user_id', userId).eq('is_active', true).not('days_per_week', 'is', null)
      .order('updated_at', { ascending: false }).limit(1),
    steuerzielId ? kette<Record<string, unknown>>('controlling_goal_lage_at', steuerzielId, stichtag) : Promise.resolve(null),
    Promise.all(messzielIds.map(id => kette<Record<string, unknown>>('measurement_goal_week_at', id, stichtag).then(w => [id, w] as const))),
    steuerzielId ? kette<Wache[]>('goal_phase_guards_at', steuerzielId, stichtag) : Promise.resolve(null),
    steuerzielId ? kette<Modulkacheln>('goal_module_cards_at', steuerzielId, stichtag) : Promise.resolve(null),
    steuerzielId ? kette<Record<string, unknown>>('goal_als_naechstes', steuerzielId, stichtag) : Promise.resolve(null),
  ])
  // G-678: Sollweg vom Zielstart bis zur Achse (Frist, sonst Prognose) — je Woche; ponytail: ab 80 Wochen groebere Schritte
  const achse = zielDatum ?? (ausblick?.prognose.status === 'datum' ? ausblick.prognose.datum : null)
  const tage: string[] = []
  if (steuerzielId && zielStart && achse && zielStart < achse) {
    const schritt = 7 * Math.max(1, Math.ceil((Date.parse(achse) - Date.parse(zielStart)) / (80 * 7 * 86400000)))
    for (let d = zielStart; d < achse; d = tagMinus(d, -schritt)) tage.push(d)
    tage.push(achse)
  }
  const linien = await Promise.all(tage.map(tag => db.schema('goals').rpc('planlinien_am', { p_goal_id: steuerzielId!, p_tag: tag })
    .then(r => { if (r.error && r.error.code !== 'PGRST202') throw new Error(`planlinien_am: ${r.error.message}`); return { tag, kg: sollwegKg(r.data as Record<string, unknown> | null) } })))
  const l = lage?.lage
  const messwochen: Record<string, Messwoche> = {}
  for (const [id, w] of mw) {
    if (!w) continue
    messwochen[id] = {
      delta_woche: num(w.delta_woche), soll_delta_woche: num(w.soll_delta_woche), tempo_pro_woche: num(w.tempo_pro_woche),
      prognose_status: w.prognose_status === 'datum' ? 'datum' : 'nicht_absehbar', prognose_datum: (w.prognose_datum as string | null) ?? null,
    }
  }
  const wert = (r: { data: unknown; error: unknown }) => {
    const z = !r.error && Array.isArray(r.data) ? r.data[0] as Record<string, unknown> | undefined : undefined
    return z && z.wert !== null && z.wert !== undefined ? Number(z.wert) : null
  }
  return {
    trend: { heute: wert(th), vorwoche: wert(tv) },
    ausblick,
    lage: lage ? { lage: l === 'voraus' || l === 'im_plan' || l === 'hinterher' ? l : null, abweichung_kg: num(lage.abweichung_kg), toleranz_kg: num(lage.toleranz_kg) } : null,
    messwochen,
    wachen,
    kacheln,
    planHistorisch: linien.filter((p): p is { tag: string; kg: number } => p.kg !== null),
    alsNaechstes: naechstes && naechstes.programm ? {
      startdatum: String(naechstes.startdatum), programm: String(naechstes.programm),
      dauer_wochen: Number(naechstes.dauer_wochen), grund: String(naechstes.grund),
    } : null,
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
  /**
   * `einheit`: Name der Trainingseinheit (Entwurf: „Training Push/Legs“). `detail`: die aufklappbare
   * Zeile (G-674/2) — nur fuer die juengsten `DETAIL_PUNKTE` Punkte, die die Tabelle zeigt.
   */
  punkte: Array<{ tag: string; wert: number; quelle: string; einheit?: string | null; detail?: Punktdetail | null }>
  wochen: Array<{ woche: string; wert: number | null; quote: number | null; serie: number; erreicht: boolean }>
}

/** Details je Ziel: Datenpunkte (einmalig) oder Wochenraster (woechentlich). */
/** So viele juengste Punkte bekommen ihre aufklappbare Zeile (G-674/2). */
export const DETAIL_PUNKTE = 60

export async function ladeVerlauf(goalId: string, stichtag: string, woechentlich: boolean): Promise<Verlauf> {
  const db = createSessionClient().schema('goals')
  const [p, w] = await Promise.all([
    db.rpc('measurement_points', { p_goal_id: goalId, p_through: stichtag }),
    woechentlich ? db.rpc('measurement_weeks', { p_goal_id: goalId, p_through: stichtag }) : Promise.resolve({ data: [], error: null }),
  ])
  if (p.error) throw new Error(`measurement_points: ${p.error.message}`)
  if (w.error) throw new Error(`measurement_weeks: ${w.error.message}`)
  const zahl = (v: unknown) => (v === null || v === undefined ? null : Number(v))
  const zeilen = (p.data ?? []) as Array<Record<string, unknown>>
  // G-667: ein Punkt je Einheit (`training.workout_sessions`, `source_id` = Einheit), nicht je Satz.
  // G-674/2: Kopf, Inhalt und Link der juengsten Punkte — je Quelle ein Zugriff.
  const punkte = punkteAusKette(zeilen)
  // ponytail: die juengsten 60 reichen fuer 8 Tabellenzeilen bzw. 12 Wochen; mehr, wenn die Tabelle blaettert
  const juengste = punkte.slice(-DETAIL_PUNKTE)
  const ids = (vorn: string) => Array.from(new Set(juengste.filter(p => p.quelle.startsWith(vorn) && p.id).map(p => p.id)))
  const training = createSessionClient().schema('training'), goals = createSessionClient().schema('goals')
  const einheitIds = ids('training.workout_sessions'), messIds = ids('goals.body_measurements'), umfangIds = ids('goals.body_circumferences.')
  const [es, ziel, ms, us] = await Promise.all([
    einheitIds.length ? training.from('workout_sessions').select('id, session_date, name, duration_minutes').in('id', einheitIds) : null,
    einheitIds.length ? goals.from('user_goals').select('exercise_id').eq('id', goalId).maybeSingle() : null,
    messIds.length ? goals.from('body_measurements').select('id, measurement_date, weight_kg, body_fat_pct, bf_method, height_cm_snapshot').in('id', messIds) : null,
    umfangIds.length ? goals.from('body_circumferences').select(`id, measurement_date, ${Object.keys(UMFANG_NAME).join(', ')}`).in('id', umfangIds) : null,
  ])
  const uebungId = (ziel?.data as { exercise_id: string | null } | null)?.exercise_id ?? null
  const ue = uebungId && einheitIds.length
    ? await training.from('workout_exercises').select('workout_session_id, exercise_name, workout_sets(set_number, weight_kg, reps, duration_seconds, distance_meters)')
      .in('workout_session_id', einheitIds).eq('exercise_id', uebungId)
    : null
  type Satz = { set_number: number | null; weight_kg: number | null; reps: number | null; duration_seconds: number | null; distance_meters: number | null }
  const uebungJe = new Map<string, { name: string; saetze: Satz[] }>()
  for (const u of (ue?.data ?? []) as unknown as Array<{ workout_session_id: string; exercise_name: string | null; workout_sets: Satz[] }>) {
    const alt = uebungJe.get(u.workout_session_id)
    const saetze = (alt?.saetze ?? []).concat(u.workout_sets.map(x => ({ ...x, weight_kg: zahl(x.weight_kg), distance_meters: zahl(x.distance_meters) })))
    uebungJe.set(u.workout_session_id, { name: u.exercise_name ?? 'Übung', saetze: saetze.sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0)) })
  }
  const einheitJe = new Map(((es?.data ?? []) as Array<Record<string, unknown>>).map(e => [String(e.id), e]))
  const messJe = new Map(((ms?.data ?? []) as Array<Record<string, unknown>>).map(m => [String(m.id), m]))
  const umfangJe = new Map(((us?.data ?? []) as unknown as Array<Record<string, unknown>>).map(u => [String(u.id), u]))
  // Hals und Bauch zur KFA-Messung desselben Tages (Navy rechnet aus ihnen)
  const tageKfa = Array.from(new Set(Array.from(messJe.values()).filter(m => m.bf_method === 'navy').map(m => String(m.measurement_date))))
  const navy = tageKfa.length ? await goals.from('body_circumferences').select('measurement_date, neck_cm, waist_cm').in('measurement_date', tageKfa) : null
  const umfangAm = new Map(((navy?.data ?? []) as Array<Record<string, unknown>>).map(u => [String(u.measurement_date), { neck_cm: zahl(u.neck_cm), waist_cm: zahl(u.waist_cm) }]))
  for (const p of juengste) {
    const e = einheitJe.get(p.id), m = messJe.get(p.id), u = umfangJe.get(p.id)
    if (e) {
      p.einheit = (e.name as string | null) ?? null
      p.detail = einheitDetail({ id: p.id, datum: String(e.session_date), name: p.einheit, minuten: zahl(e.duration_minutes) }, uebungJe.get(p.id) ?? null)
    } else if (m) {
      p.detail = messungDetail({ datum: String(m.measurement_date), weight_kg: zahl(m.weight_kg), body_fat_pct: zahl(m.body_fat_pct), bf_method: (m.bf_method as string | null) ?? null, height_cm: zahl(m.height_cm_snapshot) },
        umfangAm.get(String(m.measurement_date)) ?? null, p.quelle.endsWith('.body_fat_pct'))
    } else if (u) {
      p.detail = umfangDetail(String(u.measurement_date), Object.fromEntries(Object.keys(UMFANG_NAME).map(k => [k, zahl(u[k])])))
    }
  }
  return {
    punkte: punkte.map(({ id: _id, ...p }) => p),
    wochen: ((w.data ?? []) as Array<Record<string, unknown>>).map(r => ({
      woche: String(r.week_start), wert: zahl(r.observed_value), quote: zahl(r.quota_pct),
      serie: Number(r.streak_weeks ?? 0), erreicht: r.target_met === true,
    })),
  }
}
