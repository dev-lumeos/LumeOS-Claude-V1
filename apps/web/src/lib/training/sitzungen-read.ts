// Lese-I/O fuer Sitzungen, Uebungen und Saetze (G-69).
//
// MUSTER: `uebungen-read.ts` (G-64) — Session-Client, serverseitig,
// Abfragefehler werfen. **Die zwei Fallen von dort gelten hier
// genauso**, und bei 200 Saetzen naeher als bei 60:
//
//   `[cmd]` PostgREST deckelt bei 1.000 Zeilen. Jede Abfrage hier
//   traegt deshalb ein ausdrueckliches `limit`, und wo gezaehlt wird,
//   wird ueber `count: 'exact', head: true` gezaehlt, nicht ueber die
//   Laenge einer geholten Liste.
//
//   `[cmd]` `.in(...)` kippt ueber rund 200 IDs und schweigt — leere
//   Liste statt Fehler. **Deshalb kein `.in()` mit Satz- oder
//   Uebungs-IDs**, sondern ein Verbund ueber `workout_session_id`.
//   Bei 30 Sitzungen mit 60 Uebungen waere die ID-Liste heute noch
//   klein; nach dem naechsten Seedlauf nicht mehr.
//
// **GEPLANT GEGEN ABSOLVIERT — und warum es am Datum haengt.**
// `[read]` Tom zu G-69: *„Volumen, Streak, 1RM und Fortschritt zaehlen
// nur bis heute — sonst behauptet die Anzeige Leistung, die nicht
// erbracht wurde. Kalender und Plan zeigen alle. Pruef, ob die
// Datenbank das traegt: wenn es einen Status gibt, nimm ihn; wenn
// nicht, melde es."*
//
// `[cmd]` **Zu G-69 gab es einen `status`, und er trug es NICHT.**
// Die Pruefbedingung erlaubt `planned | active | completed |
// cancelled`, aber **alle 30 Sitzungen standen auf `completed`, auch
// die 15 in der Zukunft** (gemessen 2026-08-18).
//
// `[cmd]` **Seit G-86 traegt er es** — gemessen am 2026-08-20: 15
// `completed`, 14 `planned` (bis 2026-11-11), 1 `cancelled`. Der Seed
// hat sich dazwischen geaendert.
//
// `[read]` **`absolviert` bleibt trotzdem am Datum.** Beides sagt
// etwas anderes: der Status sagt, was die Sitzung sein soll, das
// Datum sagt, ob ihr Tag vorbei ist. Eine `planned`-Sitzung in der
// Vergangenheit ist ausgefallen und darf nicht als Leistung zaehlen —
// genau das verhindert der Datumsschnitt.
//
// `[read]` Deshalb fuehrt `Sitzung` BEIDES: `status` unveraendert aus
// der Tabelle und `absolviert` aus dem Datum. Wer sie vergleicht,
// sieht die Abweichung — sie zu verschweigen waere die schlechtere
// Loesung.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/** Obergrenze je Abfrage. PostgREST deckelt ohnehin bei 1.000. */
const SEITE = 1000

export class TrainingLeseFehler extends Error {
  constructor(public code: 'NO_SESSION' | 'READ_FAILED', message: string) {
    super(message)
    this.name = 'TrainingLeseFehler'
  }
}

function trainingDb() {
  return createSessionClient().schema('training')
}

export async function angemeldeteNutzerin(): Promise<string> {
  const { data: { user } } = await createSessionClient().auth.getUser()
  if (!user) throw new TrainingLeseFehler('NO_SESSION', 'Keine angemeldete Session.')
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

// ── Sitzungen ───────────────────────────────────────────────────

export type Sitzung = {
  id: string
  session_date: string
  name: string | null
  /** Wie die Tabelle es fuehrt. Heute bei ALLEN `completed`. */
  status: string | null
  /**
   * Ob die Sitzung am Stichtag bereits stattgefunden hat — **aus dem
   * Datum**, nicht aus `status`. Siehe Kopf.
   */
  absolviert: boolean
  location: string | null
  duration_minutes: number | null
  total_volume_kg: number | null
  total_sets: number | null
  total_reps: number | null
  started_time: string | null
  ended_time: string | null
}

/**
 * Alle Sitzungen der Nutzerin, aelteste zuerst.
 *
 * `[read]` **Ohne Datumsschnitt** — Kalender und Plan zeigen alle neun
 * bzw. dreissig. Wer nur die absolvierten will, filtert auf
 * `absolviert`; die Kacheln, die Leistung zeigen, tun genau das.
 */
export async function ladeSitzungen(userId: string, stichtag: string): Promise<Sitzung[]> {
  const { data, error } = await trainingDb()
    .from('workout_sessions')
    .select('id, session_date, name, status, location, duration_minutes, '
      + 'total_volume_kg, total_sets, total_reps, started_time, ended_time')
    .eq('user_id', userId)
    .order('session_date', { ascending: true })
    .limit(SEITE)
  if (error) throw new TrainingLeseFehler('READ_FAILED', `workout_sessions: ${error.message}`)

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => {
    const datum = text(z.session_date) ?? ''
    return {
      id: String(z.id),
      session_date: datum,
      name: text(z.name),
      status: text(z.status),
      absolviert: datum !== '' && datum <= stichtag,
      location: text(z.location),
      duration_minutes: zahl(z.duration_minutes),
      total_volume_kg: zahl(z.total_volume_kg),
      total_sets: zahl(z.total_sets),
      total_reps: zahl(z.total_reps),
      started_time: text(z.started_time),
      ended_time: text(z.ended_time),
    }
  })
}

/**
 * Die offene Sitzung, falls es eine gibt — G-217.
 *
 * `[cmd]` **`active` mit `ended_time IS NULL` ist der offene
 * Zustand** (`workout_sessions_status_check`, gemessen in G-216).
 * `[cmd]` Im Bestand war er unbenutzt, 0 von 66 — **er entsteht erst
 * durch das Erfassungsformular.**
 *
 * `[read]` **Warum das Datum hier NICHT filtert:** wer abends um elf
 * anfaengt und um Mitternacht weitermacht, hat dieselbe Sitzung.
 * Ein Schnitt auf `session_date = heute` wuerde sie verlieren, und
 * das Formular boete das Fortsetzen genau dann nicht an, wenn es am
 * meisten gebraucht wird.
 *
 * `[read]` **Die juengste gewinnt.** Mehr als eine offene Sitzung
 * soll es nicht geben — das Formular verhindert es, indem es eine
 * vorhandene fortsetzt statt eine zweite anzulegen. **Sollten doch
 * zwei existieren, ist die juengste die gemeinte**, und die aeltere
 * bleibt sichtbar, statt still zu verschwinden.
 */
export async function ladeOffeneSitzung(userId: string): Promise<Sitzung | null> {
  const { data, error } = await trainingDb()
    .from('workout_sessions')
    .select('id, session_date, name, status, location, duration_minutes, '
      + 'total_volume_kg, total_sets, total_reps, started_time, ended_time')
    .eq('user_id', userId)
    .eq('status', 'active')
    .is('ended_time', null)
    .order('session_date', { ascending: false })
    .order('started_time', { ascending: false })
    .limit(1)
  if (error) throw new TrainingLeseFehler('READ_FAILED', `workout_sessions: ${error.message}`)

  const z = ((data ?? []) as unknown as Array<Record<string, unknown>>)[0]
  if (!z) return null
  const datum = text(z.session_date) ?? ''
  return {
    id: String(z.id),
    session_date: datum,
    name: text(z.name),
    status: text(z.status),
    // `[read]` Eine offene Sitzung ist nie „absolviert" — sie laeuft.
    absolviert: false,
    location: text(z.location),
    duration_minutes: zahl(z.duration_minutes),
    total_volume_kg: zahl(z.total_volume_kg),
    total_sets: zahl(z.total_sets),
    total_reps: zahl(z.total_reps),
    started_time: text(z.started_time),
    ended_time: text(z.ended_time),
  }
}

// ── Uebungen einer Sitzung ──────────────────────────────────────

export type SitzungsUebung = {
  id: string
  workout_session_id: string
  exercise_id: string | null
  exercise_name: string
  exercise_order: number | null
  actual_sets: number | null
  actual_volume_kg: number | null
  max_weight_kg: number | null
  total_reps: number | null
  best_estimated_1rm: number | null
}

/**
 * Alle Uebungen aller Sitzungen der Nutzerin.
 *
 * `[cmd]` **Verbund statt ID-Liste** — `workout_sessions!inner` filtert
 * ueber `user_id`, ohne dass eine Liste von Sitzungs-UUIDs in die URL
 * muss. Genau die Falle aus G-64: ueber rund 200 IDs antwortet
 * PostgREST mit „URI too long", und der Fehler kam als leere Liste
 * zurueck.
 */
export async function ladeSitzungsUebungen(userId: string): Promise<SitzungsUebung[]> {
  const { data, error } = await trainingDb()
    .from('workout_exercises')
    .select('id, workout_session_id, exercise_id, exercise_name, exercise_order, '
      + 'actual_sets, actual_volume_kg, max_weight_kg, total_reps, best_estimated_1rm, '
      + 'workout_sessions!inner(user_id)')
    .eq('workout_sessions.user_id', userId)
    .order('exercise_order', { ascending: true })
    .limit(SEITE)
  if (error) throw new TrainingLeseFehler('READ_FAILED', `workout_exercises: ${error.message}`)

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
    id: String(z.id),
    workout_session_id: String(z.workout_session_id),
    exercise_id: text(z.exercise_id),
    exercise_name: text(z.exercise_name) ?? '—',
    exercise_order: zahl(z.exercise_order),
    actual_sets: zahl(z.actual_sets),
    actual_volume_kg: zahl(z.actual_volume_kg),
    max_weight_kg: zahl(z.max_weight_kg),
    total_reps: zahl(z.total_reps),
    best_estimated_1rm: zahl(z.best_estimated_1rm),
  }))
}

/**
 * Die Uebungen EINER Sitzung, mit ihren Saetzen — G-217.
 *
 * `[read]` **Warum eine eigene Funktion neben
 * `ladeSitzungsUebungen`:** die laedt alles fuer die Auswertung. Das
 * Erfassungsformular braucht genau eine Sitzung, und zwar nach jedem
 * eingetragenen Satz erneut. **Alles zu laden, um eines anzuzeigen,
 * waere die teure Variante derselben Antwort.**
 */
export async function ladeSitzungsInhalt(sitzungId: string): Promise<Array<
  SitzungsUebung & { saetze: Satz[] }
>> {
  const t = trainingDb()
  const { data: uebungen, error } = await t
    .from('workout_exercises')
    .select('id, workout_session_id, exercise_id, exercise_name, exercise_order, '
      + 'actual_sets, actual_volume_kg, max_weight_kg, total_reps, best_estimated_1rm')
    .eq('workout_session_id', sitzungId)
    .order('exercise_order', { ascending: true })
    .limit(SEITE)
  if (error) throw new TrainingLeseFehler('READ_FAILED', `workout_exercises: ${error.message}`)

  const zeilen = (uebungen ?? []) as unknown as Array<Record<string, unknown>>
  if (zeilen.length === 0) return []

  // `[cmd]` Verbund statt ID-Liste — dieselbe Falle aus G-64. Hier
  // waeren es zwar wenige IDs, aber der Verbund kostet nichts.
  const { data: saetze, error: sFehler } = await t
    .from('workout_sets')
    .select('id, workout_exercise_id, set_number, reps, weight_kg, volume_kg, '
      + 'estimated_1rm, is_pr, set_type, rpe, rir, rest_seconds, logged_via, '
      + 'workout_exercises!inner(workout_session_id)')
    .eq('workout_exercises.workout_session_id', sitzungId)
    .order('set_number', { ascending: true })
    .limit(SEITE)
  if (sFehler) throw new TrainingLeseFehler('READ_FAILED', `workout_sets: ${sFehler.message}`)

  const jeUebung = new Map<string, Satz[]>()
  for (const z of (saetze ?? []) as unknown as Array<Record<string, unknown>>) {
    const k = String(z.workout_exercise_id)
    const liste = jeUebung.get(k) ?? []
    liste.push({
      id: String(z.id),
      workout_exercise_id: k,
      set_number: zahl(z.set_number),
      reps: zahl(z.reps),
      weight_kg: zahl(z.weight_kg),
      volume_kg: zahl(z.volume_kg),
      estimated_1rm: zahl(z.estimated_1rm),
      is_pr: z.is_pr === true,
      set_type: text(z.set_type),
      rpe: zahl(z.rpe),
      rir: zahl(z.rir),
      rest_seconds: zahl(z.rest_seconds),
      logged_via: text(z.logged_via),
    })
    jeUebung.set(k, liste)
  }

  return zeilen.map(z => ({
    id: String(z.id),
    workout_session_id: String(z.workout_session_id),
    exercise_id: text(z.exercise_id),
    exercise_name: text(z.exercise_name) ?? '—',
    exercise_order: zahl(z.exercise_order),
    actual_sets: zahl(z.actual_sets),
    actual_volume_kg: zahl(z.actual_volume_kg),
    max_weight_kg: zahl(z.max_weight_kg),
    total_reps: zahl(z.total_reps),
    best_estimated_1rm: zahl(z.best_estimated_1rm),
    saetze: jeUebung.get(String(z.id)) ?? [],
  }))
}

// ── Saetze ──────────────────────────────────────────────────────

export type Satz = {
  id: string
  workout_exercise_id: string
  set_number: number | null
  reps: number | null
  weight_kg: number | null
  volume_kg: number | null
  estimated_1rm: number | null
  is_pr: boolean
  set_type: string | null
  rpe: number | null
  rir: number | null
  rest_seconds: number | null
  logged_via: string | null
}

/**
 * Alle Saetze der Nutzerin.
 *
 * `[cmd]` Wieder ein Verbund ueber zwei Ebenen statt einer ID-Liste —
 * bei 200 Saetzen ueber 60 Uebungen waere `.in()` schon jetzt an der
 * Grenze, und der naechste Seedlauf schiebt sie darueber.
 *
 * `[cmd]` **`estimated_1rm` fehlt genau bei den Aufwaermsaetzen** —
 * 180 von 200 tragen einen Wert, die uebrigen 20 sind `set_type =
 * 'warmup'`. Das ist richtig so und keine Luecke: ein Aufwaermsatz
 * sagt ueber die Maximalkraft nichts.
 */
export async function ladeSaetze(userId: string): Promise<Satz[]> {
  const { data, error } = await trainingDb()
    .from('workout_sets')
    .select('id, workout_exercise_id, set_number, reps, weight_kg, volume_kg, '
      + 'estimated_1rm, is_pr, set_type, rpe, rir, rest_seconds, logged_via, '
      + 'workout_exercises!inner(workout_sessions!inner(user_id))')
    .eq('workout_exercises.workout_sessions.user_id', userId)
    .order('set_number', { ascending: true })
    .limit(SEITE)
  if (error) throw new TrainingLeseFehler('READ_FAILED', `workout_sets: ${error.message}`)

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map(z => ({
    id: String(z.id),
    workout_exercise_id: String(z.workout_exercise_id),
    set_number: zahl(z.set_number),
    reps: zahl(z.reps),
    weight_kg: zahl(z.weight_kg),
    volume_kg: zahl(z.volume_kg),
    estimated_1rm: zahl(z.estimated_1rm),
    is_pr: z.is_pr === true,
    set_type: text(z.set_type),
    rpe: zahl(z.rpe),
    rir: zahl(z.rir),
    rest_seconds: zahl(z.rest_seconds),
    logged_via: text(z.logged_via),
  }))
}

// ── Muskelzuordnung der trainierten Uebungen ────────────────────

/**
 * Primaermuskel-Wurzelgruppen je Katalog-Uebung.
 *
 * `[cmd]` Nur fuer die Uebungen, die tatsaechlich trainiert wurden —
 * heute sechs verschiedene. **Zusammengefasst auf die Wurzelgruppe**,
 * wie in `uebungen-read.ts`: die Tabelle fuehrt 95 Gruppen, davon
 * sieben Wurzeln. „Semimembranosus" ist als Zeile in einer
 * Volumenuebersicht unbrauchbar, „Legs" nicht.
 */
export async function ladeMuskelWurzeln(
  exerciseIds: string[],
): Promise<Map<string, string[]>> {
  const ergebnis = new Map<string, string[]>()
  if (exerciseIds.length === 0) return ergebnis

  const t = trainingDb()
  const { data: gruppen, error: gFehler } = await t
    .from('muscle_groups').select('id, name, parent_id').limit(SEITE)
  if (gFehler) throw new TrainingLeseFehler('READ_FAILED', `muscle_groups: ${gFehler.message}`)

  const knoten = new Map<string, { name: string; parent: string | null }>()
  for (const g of (gruppen ?? []) as unknown as Array<Record<string, unknown>>) {
    knoten.set(String(g.id), {
      name: String(g.name),
      parent: g.parent_id ? String(g.parent_id) : null,
    })
  }
  const wurzelName = (id: string) => {
    let lauf = knoten.get(id)
    while (lauf?.parent) lauf = knoten.get(lauf.parent)
    return lauf?.name ?? null
  }

  // `[cmd]` HIER ist `.in()` vertretbar: sechs IDs, und die Zahl ist
  // durch die trainierten Uebungen begrenzt, nicht durch den Katalog.
  // Die Grenze aus G-64 liegt bei rund 200.
  const { data: zuord, error } = await t
    .from('exercise_muscles')
    .select('exercise_id, muscle_group_id, role')
    .in('exercise_id', exerciseIds.slice(0, 150))
    .eq('role', 'primary')
    .limit(SEITE)
  if (error) throw new TrainingLeseFehler('READ_FAILED', `exercise_muscles: ${error.message}`)

  for (const z of (zuord ?? []) as unknown as Array<Record<string, unknown>>) {
    const ex = String(z.exercise_id)
    const name = wurzelName(String(z.muscle_group_id))
    if (!name) continue
    const bisher = ergebnis.get(ex) ?? []
    if (!bisher.includes(name)) bisher.push(name)
    ergebnis.set(ex, bisher)
  }
  for (const [k, v] of Array.from(ergebnis.entries())) {
    ergebnis.set(k, v.slice().sort())
  }
  return ergebnis
}

// ── Koerpergewicht zum Stichtag ─────────────────────────────────

/**
 * Das Koerpergewicht, das an einem Tag galt.
 *
 * `[read]` Tom zu G-69: *„Standards braucht das Koerpergewicht mit
 * Stichtag. 85 kg ist ein Wert vom `body_measurements`-Verlauf — nimm
 * den zum Sitzungsdatum, nicht den heutigen. Sonst verschiebt sich das
 * Verhaeltnis rueckwirkend, wenn sich das Gewicht aendert."*
 *
 * `[cmd]` Genommen wird die juengste Messung **am oder vor** dem
 * Stichtag. `public.profiles.body_weight_kg` (85,000) waere der
 * einfachere Weg — aber es ist ein Profilstand ohne Datum, und genau
 * dann verschoebe sich das Verhaeltnis rueckwirkend.
 */
export async function ladeGewichtAm(
  userId: string, stichtag: string,
): Promise<{ weight_kg: number; measurement_date: string } | null> {
  const { data, error } = await createSessionClient()
    .schema('goals')
    .from('body_measurements')
    .select('weight_kg, measurement_date')
    .eq('user_id', userId)
    .lte('measurement_date', stichtag)
    .order('measurement_date', { ascending: false })
    .limit(1)
  if (error) throw new TrainingLeseFehler('READ_FAILED', `body_measurements: ${error.message}`)

  const r = (data ?? [])[0] as Record<string, unknown> | undefined
  const g = zahl(r?.weight_kg)
  if (!r || g == null) return null
  return { weight_kg: g, measurement_date: text(r.measurement_date) ?? stichtag }
}
