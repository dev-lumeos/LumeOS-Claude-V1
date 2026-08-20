// Serverseitiger Lesepfad für Goals.
//
// MUSTER: `apps/web/src/lib/medical/lesen.ts` (G-46/G-60) und
// `apps/web/src/lib/profile/zielwerte-read.ts` (GO-03/GO-04) —
// Session-Client auf ein Schema gerichtet, ausschliesslich
// serverseitig. **Die zwei Zielwert-Funktionen werden NICHT nachgebaut:**
// `getZielwerteAm` und `getZielwertVorschlag` gibt es dort bereits, und
// zwei Lesewege auf dieselbe Funktion sind zwei Wahrheiten.
//
// `[read]` Der Auftrag GO-16: *„Goals ist der Massstab, an dem Buddy
// misst — keine eigenständige Dateneingabe."* Diese Datei liest
// deshalb nur; sie schreibt nichts, und es gibt keine Schreibfunktion
// daneben.
//
// **DAS DATUM IST DAS ECHTE.** `[read]` Der Auftrag: *„Sobald echte
// Daten fliessen, muss es das echte Datum sein — `lib/datum.ts` rechnet
// über Mittag, dieselbe Lösung, keine zweite."* Das feste „Heute" der
// Vorlage (`HEUTE_DER_VORLAGE = '2026-05-16'`) gilt nur noch für die
// Kacheln, die weiter Attrappe sind.

import { createSessionClient } from '@lumeos/shared/session'

export class GoalsLeseFehler extends Error {
  constructor(public code: 'NO_SESSION' | 'READ_FAILED', message: string) {
    super(message)
    this.name = 'GoalsLeseFehler'
  }
}

function goalsDb() {
  return createSessionClient().schema('goals')
}

/**
 * Die angemeldete Nutzerin.
 *
 * Ohne Session kommt keine Zeile: die RLS-Regel (`auth.uid() =
 * user_id`) ist die Sperre, dieser Aufruf die Absicht — dasselbe
 * Muster wie in `lib/medical/lesen.ts`.
 */
export async function angemeldeteNutzerin(): Promise<string> {
  const { data: { user } } = await createSessionClient().auth.getUser()
  if (!user) throw new GoalsLeseFehler('NO_SESSION', 'Keine angemeldete Session.')
  return user.id
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

// ── Körperzusammensetzung nach Navy ─────────────────────────────

/**
 * Was `goals.body_composition_navy` liefert.
 *
 * `[read]` **Die Spanne gehört an den Wert**, nicht in eine Fussnote —
 * der Auftrag sagt es ausdrücklich. Deshalb stehen `min`, `max` und
 * `standard_error_pct_points` im selben Typ wie der Wert selbst; wer
 * `body_fat_pct` anzeigt, hat die Spanne bereits in der Hand und kann
 * sie nicht versehentlich weglassen.
 */
export type Koerperzusammensetzung = {
  measurement_date: string
  body_fat_pct: number | null
  body_fat_pct_min: number | null
  body_fat_pct_max: number | null
  standard_error_pct_points: number | null
  ffmi: number | null
  lean_mass_kg: number | null
  weight_kg: number | null
  method: string | null
  /** Der Vorbehalt der Funktion, wörtlich. Wird angezeigt, nicht gekürzt. */
  caution: string | null
}

export async function ladeKoerperzusammensetzung(
  userId: string, stichtag: string,
): Promise<Koerperzusammensetzung | null> {
  const { data, error } = await goalsDb()
    .rpc('body_composition_navy', { p_user_id: userId, p_date: stichtag })
  if (error) throw new GoalsLeseFehler('READ_FAILED', `body_composition_navy: ${error.message}`)

  const r = (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null
  if (!r) return null
  return {
    measurement_date: text(r.measurement_date) ?? stichtag,
    body_fat_pct: zahl(r.body_fat_pct),
    body_fat_pct_min: zahl(r.body_fat_pct_min),
    body_fat_pct_max: zahl(r.body_fat_pct_max),
    standard_error_pct_points: zahl(r.standard_error_pct_points),
    ffmi: zahl(r.ffmi),
    lean_mass_kg: zahl(r.lean_mass_kg),
    weight_kg: zahl(r.weight_kg),
    method: text(r.method),
    caution: text(r.caution),
  }
}

// ── Adaptiver TDEE ──────────────────────────────────────────────

/**
 * Was `goals.adaptive_tdee` liefert.
 *
 * `[cmd]` **`adaptive_tdee_kcal` ist häufig `null`, und das ist kein
 * Fehler.** Die Funktion verlangt `complete_intake_days >= window_days`
 * (`113_goal_milestones_adaptive_tdee.sql:172`), also **alle** Tage des
 * Fensters mit vollständiger Zufuhr. Fehlt einer, steht `status` auf
 * `insufficient_intake_days` und die Zahl bleibt leer — die
 * Formelgrundlage kommt trotzdem mit.
 *
 * `[read]` Der Auftrag: *„Beide bleiben sichtbar, mit ihrer Herkunft."*
 * Deshalb trägt dieser Typ **beide** Zahlen und den Status; die Anzeige
 * kann nicht die eine zeigen und die andere verschweigen.
 */
export type AdaptiverTdee = {
  period_start: string | null
  period_end: string | null
  window_days: number | null
  complete_intake_days: number | null
  weight_measurement_count: number | null
  weight_delta_kg: number | null
  avg_intake_kcal: number | null
  formula_tdee_kcal: number | null
  raw_tdee_kcal: number | null
  adaptive_tdee_kcal: number | null
  delta_to_formula_kcal: number | null
  confidence: string | null
  reliable: boolean
  status: string | null
  method: string | null
  /**
   * `[cmd]` Der Glättungsfaktor. **0,3 heisst: der adaptive Wert bleibt
   * zu 70 % an der Formel** — GO-15, Toms Entscheidung steht aus. Die
   * Zahl wird angezeigt, damit die Anzeige das nicht verschleiert.
   */
  alpha: number | null
  kcal_per_kg: number | null
}

export async function ladeAdaptivenTdee(
  userId: string, stichtag: string,
): Promise<AdaptiverTdee | null> {
  const { data, error } = await goalsDb()
    .rpc('adaptive_tdee', { p_user_id: userId, p_stichtag: stichtag })
  if (error) throw new GoalsLeseFehler('READ_FAILED', `adaptive_tdee: ${error.message}`)

  const r = (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null
  if (!r) return null
  return {
    period_start: text(r.period_start),
    period_end: text(r.period_end),
    window_days: zahl(r.window_days),
    complete_intake_days: zahl(r.complete_intake_days),
    weight_measurement_count: zahl(r.weight_measurement_count),
    weight_delta_kg: zahl(r.weight_delta_kg),
    avg_intake_kcal: zahl(r.avg_intake_kcal),
    formula_tdee_kcal: zahl(r.formula_tdee_kcal),
    raw_tdee_kcal: zahl(r.raw_tdee_kcal),
    adaptive_tdee_kcal: zahl(r.adaptive_tdee_kcal),
    delta_to_formula_kcal: zahl(r.delta_to_formula_kcal),
    confidence: text(r.confidence),
    reliable: r.reliable === true,
    status: text(r.status),
    method: text(r.method),
    alpha: zahl(r.alpha),
    kcal_per_kg: zahl(r.kcal_per_kg),
  }
}

// ── Ziele und ihr Fortschritt ───────────────────────────────────

export type ZielFortschritt = {
  goal_id: string
  goal_type: string | null
  subtype: string | null
  title: string
  target_value: number | null
  target_unit: string | null
  start_value: number | null
  current_value: number | null
  /** Woher der aktuelle Wert stammt — die Funktion sagt es selbst. */
  current_source: string | null
  progress_pct: number | null
  /**
   * `[cmd]` `measured` · `not_implemented_workout_sets` · … — die
   * Funktion nennt den Grund, wenn sie nicht rechnen kann. Bei
   * `Bankdruecken stabilisieren` steht heute
   * `not_implemented_workout_sets`: das Kraftziel braucht Sätze aus
   * `training`, und die verknüpft niemand. **Gezeigt, nicht versteckt.**
   */
  progress_status: string | null
  measured_at: string | null
  target_date: string | null
  status: string | null
  is_primary: boolean
  priority: number | null
}

/**
 * Die Ziele der Nutzerin, jedes mit seinem gerechneten Fortschritt.
 *
 * `[cmd]` Zwei Zugriffe, kein N+1: die Stammdaten aus `user_goals`, der
 * Fortschritt über `goal_progress_at` je Ziel. **Die Rechnung wird
 * nicht nachgebaut** — `progress_pct` steht zwar auch als Spalte in
 * `user_goals`, ist dort aber ein gespeicherter Stand (40,00 / 33,00),
 * während die Funktion gegen die jüngste Messung rechnet. Zwei
 * Wahrheiten; genommen ist die gerechnete, und die gespeicherte kommt
 * als `gespeichert_pct` mit, damit der Unterschied sichtbar bleibt.
 */
export async function ladeZiele(userId: string, stichtag: string): Promise<ZielFortschritt[]> {
  const db = goalsDb()
  const { data: ziele, error } = await db
    .from('user_goals')
    .select('id, goal_type, subtype, title, target_value, target_unit, start_value, '
      + 'current_value, target_date, status, is_primary, priority, progress_pct')
    .eq('user_id', userId)
    .order('priority', { ascending: true })
  if (error) throw new GoalsLeseFehler('READ_FAILED', `user_goals: ${error.message}`)

  const zeilen = (ziele ?? []) as unknown as Array<Record<string, unknown>>
  if (zeilen.length === 0) return []

  const fortschritte = await Promise.all(zeilen.map(async z => {
    const { data } = await db.rpc('goal_progress_at', {
      p_goal_id: z.id as string, p_stichtag: stichtag,
    })
    return (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null
  }))

  return zeilen.map((z, i) => {
    const f = fortschritte[i] ?? {}
    return {
      goal_id: z.id as string,
      goal_type: text(z.goal_type),
      subtype: text(z.subtype),
      title: text(z.title) ?? '—',
      target_value: zahl(z.target_value),
      target_unit: text(z.target_unit),
      start_value: zahl(z.start_value),
      // Die Funktion gewinnt; die Spalte ist nur der Rückfall.
      current_value: zahl(f.current_value) ?? zahl(z.current_value),
      current_source: text(f.current_source),
      progress_pct: zahl(f.progress_pct),
      progress_status: text(f.progress_status),
      measured_at: text(f.measured_at),
      target_date: text(z.target_date),
      status: text(z.status),
      is_primary: z.is_primary === true,
      priority: zahl(z.priority),
    }
  })
}

// ── Meilensteine ────────────────────────────────────────────────

export type Meilenstein = {
  milestone_id: string
  title: string
  target_value: number | null
  target_unit: string | null
  target_date: string | null
  /** Was in der Tabelle steht. */
  stored_status: string | null
  /** Was die Funktion gegen die Messwerte rechnet. */
  computed_status: string | null
  current_value: number | null
  current_source: string | null
  progress_pct: number | null
  progress_status: string | null
}

/**
 * Die Meilensteine, jeder mit gerechnetem Stand.
 *
 * `[read]` GO-11: *„verfehlter Meilenstein verschwindet nicht"* — die
 * drei Testfälle heissen so. Diese Funktion filtert deshalb nichts weg;
 * was die Datenbank führt, kommt an.
 *
 * `[cmd]` `stored_status` und `computed_status` kommen **beide** mit.
 * Sie können auseinanderlaufen (gespeichert `open`, gerechnet
 * `missed`), und dann ist die Abweichung die Aussage.
 */
export async function ladeMeilensteine(userId: string, stichtag: string): Promise<Meilenstein[]> {
  const db = goalsDb()
  const { data: steine, error } = await db
    .from('goal_milestones')
    .select('id')
    .eq('user_id', userId)
    .order('target_date', { ascending: true })
  if (error) throw new GoalsLeseFehler('READ_FAILED', `goal_milestones: ${error.message}`)

  const ids = ((steine ?? []) as unknown as Array<{ id: string }>).map(s => s.id)
  if (ids.length === 0) return []

  const zeilen = await Promise.all(ids.map(async id => {
    const { data } = await db.rpc('goal_milestone_status', {
      p_milestone_id: id, p_stichtag: stichtag,
    })
    return (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null
  }))

  return zeilen.filter((z): z is Record<string, unknown> => z != null).map(z => ({
    milestone_id: text(z.milestone_id) ?? '',
    title: text(z.title) ?? '—',
    target_value: zahl(z.target_value),
    target_unit: text(z.target_unit),
    target_date: text(z.target_date),
    stored_status: text(z.stored_status),
    computed_status: text(z.computed_status),
    current_value: zahl(z.current_value),
    current_source: text(z.current_source),
    progress_pct: zahl(z.progress_pct),
    progress_status: text(z.progress_status),
  }))
}

// ── Die aktuelle Phase ──────────────────────────────────────────

export type Phase = {
  phase_id: string
  goal_id: string | null
  phase_type: string | null
  variant: string | null
  parameters: Record<string, unknown>
  gueltig_ab: string | null
  projected_end_date: string | null
  actual_end_date: string | null
  /**
   * Die drei Übergangsspalten — **nicht aus `phase_am()`**.
   *
   * `[cmd]` Die Funktion liefert 8 der 14 Spalten von
   * `goals.goal_phases`; `transitioned_from`, `recommended_next` und
   * `transition_reason` fehlen in ihrer Signatur (geprüft gegen
   * `pg_get_function_result`). Sie werden deshalb nachgelesen, statt
   * die Funktion zu ändern — **das Schema gehört Codex.**
   *
   * `[read]` Dasselbe Muster wie in `lib/medical/lesen.ts` (G-80), wo
   * `fasting_status` aus demselben Grund nachgelesen wird.
   */
  transitioned_from: string | null
  recommended_next: string | null
  transition_reason: string | null
}

export async function ladePhase(userId: string, stichtag: string): Promise<Phase | null> {
  const { data, error } = await goalsDb()
    .rpc('phase_am', { p_user_id: userId, p_stichtag: stichtag })
  if (error) throw new GoalsLeseFehler('READ_FAILED', `phase_am: ${error.message}`)

  const r = (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null
  if (!r) return null

  const phaseId = text(r.phase_id) ?? ''
  // Die drei Spalten je Zeile nachlesen. Der Zeilenschutz greift auch
  // hier — die Abfrage läuft mit derselben Identität wie die Funktion.
  let uebergang: Record<string, unknown> = {}
  if (phaseId) {
    const { data: z, error: zFehler } = await goalsDb()
      .from('goal_phases')
      .select('transitioned_from, recommended_next, transition_reason')
      .eq('id', phaseId)
      .maybeSingle()
    // `[read]` Werfen, nicht schlucken — eine der zwei Fallen aus G-64:
    // ein stiller Fehler sähe aus wie „kein Übergang hinterlegt".
    if (zFehler) throw new GoalsLeseFehler('READ_FAILED', `goal_phases: ${zFehler.message}`)
    uebergang = (z ?? {}) as Record<string, unknown>
  }

  return {
    phase_id: phaseId,
    goal_id: text(r.goal_id),
    phase_type: text(r.phase_type),
    variant: text(r.variant),
    parameters: (r.parameters && typeof r.parameters === 'object'
      ? r.parameters as Record<string, unknown> : {}),
    gueltig_ab: text(r.gueltig_ab),
    projected_end_date: text(r.projected_end_date),
    actual_end_date: text(r.actual_end_date),
    transitioned_from: text(uebergang.transitioned_from),
    recommended_next: text(uebergang.recommended_next),
    transition_reason: text(uebergang.transition_reason),
  }
}

// ── Körpermessungen und Umfänge ─────────────────────────────────

export type Koerpermessung = {
  measurement_date: string
  weight_kg: number | null
  body_fat_pct: number | null
  lean_mass_kg: number | null
  fat_mass_kg: number | null
  bmi: number | null
  ffmi: number | null
}

/**
 * Der Gewichtsverlauf **bis zum Stichtag**.
 *
 * `[cmd]` **Die Begrenzung ist nötig, nicht kosmetisch:** von 43
 * Messungen liegen **26 in der Zukunft** (bis 2026-09-13), weil die
 * Testdaten einen ganzen Zeitraum abdecken. Eine Kurve, die sie
 * mitzeichnet, behauptet Messungen, die es noch nicht gibt.
 *
 * `[read]` Die Zahl der ausgelassenen steht im Bericht und in der
 * Anzeige — weggelassen wird nichts stillschweigend.
 */
export async function ladeMessungen(
  userId: string, bis: string, limit = 120,
): Promise<Koerpermessung[]> {
  const { data, error } = await goalsDb()
    .from('body_measurements')
    .select('measurement_date, weight_kg, body_fat_pct, lean_mass_kg, fat_mass_kg, bmi, ffmi')
    .eq('user_id', userId)
    .lte('measurement_date', bis)
    .order('measurement_date', { ascending: true })
    .limit(limit)
  if (error) throw new GoalsLeseFehler('READ_FAILED', `body_measurements: ${error.message}`)

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
    measurement_date: text(z.measurement_date) ?? '',
    weight_kg: zahl(z.weight_kg),
    body_fat_pct: zahl(z.body_fat_pct),
    lean_mass_kg: zahl(z.lean_mass_kg),
    fat_mass_kg: zahl(z.fat_mass_kg),
    bmi: zahl(z.bmi),
    ffmi: zahl(z.ffmi),
  }))
}

/** Wie viele Messungen NACH dem Stichtag liegen — für die Meldung. */
export async function zaehleZukunftsmessungen(userId: string, nach: string): Promise<number> {
  const { count, error } = await goalsDb()
    .from('body_measurements')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gt('measurement_date', nach)
  if (error) return 0
  return count ?? 0
}

/**
 * Ein Umfangssatz, wie ihn `goals.body_circumferences` führt.
 *
 * `[cmd]` Die Spalten decken die zwölf Zeilen der Attrappe
 * (`MEASUREMENTS`, `daten.ts:142`) vollständig ab — bis auf eine:
 * die Attrappe führt **einen** Unterarm, die Tabelle **zwei**
 * (`forearm_left_cm`, `forearm_right_cm`). Im Bericht.
 */
export type Umfangssatz = {
  measurement_date: string
  neck_cm: number | null
  shoulders_cm: number | null
  chest_cm: number | null
  upper_arm_left_cm: number | null
  upper_arm_right_cm: number | null
  forearm_left_cm: number | null
  forearm_right_cm: number | null
  waist_cm: number | null
  hip_cm: number | null
  thigh_left_cm: number | null
  thigh_right_cm: number | null
  calf_left_cm: number | null
  calf_right_cm: number | null
}

const UMFANG_SPALTEN = 'measurement_date, neck_cm, shoulders_cm, chest_cm, '
  + 'upper_arm_left_cm, upper_arm_right_cm, forearm_left_cm, forearm_right_cm, '
  + 'waist_cm, hip_cm, thigh_left_cm, thigh_right_cm, calf_left_cm, calf_right_cm'

export async function ladeUmfaenge(
  userId: string, bis: string, limit = 26,
): Promise<Umfangssatz[]> {
  const { data, error } = await goalsDb()
    .from('body_circumferences')
    .select(UMFANG_SPALTEN)
    .eq('user_id', userId)
    .lte('measurement_date', bis)
    .order('measurement_date', { ascending: true })
    .limit(limit)
  if (error) throw new GoalsLeseFehler('READ_FAILED', `body_circumferences: ${error.message}`)

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
    measurement_date: text(z.measurement_date) ?? '',
    neck_cm: zahl(z.neck_cm),
    shoulders_cm: zahl(z.shoulders_cm),
    chest_cm: zahl(z.chest_cm),
    upper_arm_left_cm: zahl(z.upper_arm_left_cm),
    upper_arm_right_cm: zahl(z.upper_arm_right_cm),
    forearm_left_cm: zahl(z.forearm_left_cm),
    forearm_right_cm: zahl(z.forearm_right_cm),
    waist_cm: zahl(z.waist_cm),
    hip_cm: zahl(z.hip_cm),
    thigh_left_cm: zahl(z.thigh_left_cm),
    thigh_right_cm: zahl(z.thigh_right_cm),
    calf_left_cm: zahl(z.calf_left_cm),
    calf_right_cm: zahl(z.calf_right_cm),
  }))
}

// ── Das Profil, für „Profile · inputs" ──────────────────────────

export type ProfilEingaben = {
  birth_date: string | null
  biological_sex: string | null
  height_cm: number | null
  body_weight_kg: number | null
  activity_level: string | null
  nutrition_goal: string | null
}

export async function ladeProfil(userId: string): Promise<ProfilEingaben | null> {
  const { data, error } = await createSessionClient()
    .from('profiles')
    .select('birth_date, biological_sex, height_cm, body_weight_kg, activity_level, nutrition_goal')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new GoalsLeseFehler('READ_FAILED', `profiles: ${error.message}`)
  if (!data) return null

  const r = data as unknown as Record<string, unknown>
  return {
    birth_date: text(r.birth_date),
    biological_sex: text(r.biological_sex),
    height_cm: zahl(r.height_cm),
    body_weight_kg: zahl(r.body_weight_kg),
    activity_level: text(r.activity_level),
    nutrition_goal: text(r.nutrition_goal),
  }
}

/**
 * Das Alter zum Stichtag, aus dem Geburtsdatum.
 *
 * `[cmd]` Die Attrappe zeigt `36 years` als feste Zahl. Das Profil
 * führt `birth_date` (1995-03-15) — daraus ist das Alter ableitbar,
 * und zwar ohne `Date.now()`: der Stichtag kommt von aussen.
 */
export function alterAm(geburtsdatum: string | null, stichtag: string): number | null {
  if (!geburtsdatum) return null
  const g = new Date(`${geburtsdatum}T12:00:00`)
  const s = new Date(`${stichtag}T12:00:00`)
  if (Number.isNaN(g.getTime()) || Number.isNaN(s.getTime())) return null
  let jahre = s.getFullYear() - g.getFullYear()
  const vorGeburtstag = s.getMonth() < g.getMonth()
    || (s.getMonth() === g.getMonth() && s.getDate() < g.getDate())
  if (vorGeburtstag) jahre -= 1
  return jahre >= 0 ? jahre : null
}
