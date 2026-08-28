// ════════════════════════════════════════════════════════════════════
// DIE EINE SCHREIBSTELLE FUER `training.workout_sessions`,
// `workout_exercises` UND `workout_sets` — G-216
// ════════════════════════════════════════════════════════════════════
//
// ══ DIE FORM DER NAHT: EINE, MIT DREI EBENEN ════════════════════════
//
// **Auftrag: *„In G-122 war es eine einfache, kein zweites Ende, in
// G-138 eine Naht mit zwei Enden. Pruef, welche Form hier passt, und
// sag es."***
//
// `[read]` **Keine von beiden — hier ist es eine Naht ueber einen
// BAUM.** Der Unterschied ist nicht die Zahl der Dateien, sondern
// dass die drei Tabellen **nicht gleichrangig** sind:
//
//   `[cmd]` `workout_sessions` traegt als einzige `user_id`.
//   `workout_exercises` haengt per FK daran (`ON DELETE CASCADE`),
//   `workout_sets` an der Uebung (ebenfalls CASCADE).
//
// `[read]` **Damit ist die Sitzung der einzige Ort, an dem
// Eigentuemerschaft entsteht.** Eine Uebung ohne Sitzung kann es
// nicht geben, ein Satz ohne Uebung auch nicht — **das ist keine
// Konvention dieser Datei, sondern steht im Schema.**
//
// ══ DER ZEILENSCHUTZ ERZWINGT ES, NICHT DIESE DATEI ═════════════════
//
// **Auftrag: *„Negativprobe: einen Satz an eine Uebung schreiben, die
// nicht zur Sitzung gehoert. Pruef, ob ein Fremdschluessel das
// erzwingt."***
//
// `[cmd]` **Es ist kein Fremdschluessel, es ist der Zeilenschutz — und
// der ist strenger.** `workout_sets_insert` traegt als `WITH CHECK`:
//
//     EXISTS (SELECT 1 FROM workout_exercises we
//             JOIN workout_sessions s ON s.id = we.workout_session_id
//             WHERE we.id = workout_sets.workout_exercise_id
//               AND s.user_id = auth.uid())
//
// `[read]` **Ein Fremdschluessel wuerde nur pruefen, dass die Uebung
// existiert.** Diese Bedingung prueft, dass sie ueber die Sitzung der
// angemeldeten Nutzerin gehoert. **Ein Satz an eine fremde Uebung ist
// damit strukturell ausgeschlossen** — nicht durch Code, der zu
// vergessen waere.
//
// `[read]` **Deshalb wird hier kein Constraint geloest, um es zu
// zeigen.** Das Ergebnis IST „strukturell ausgeschlossen".
//
// ══ DER SNAPSHOT: `exercise_name` ══════════════════════════════════
//
// **Auftrag: *„Wenn eine Uebung im Katalog umbenannt wird, aendert
// sich dann ein Trainingsprotokoll von letzter Woche?"***
//
// `[cmd]` **Nein — und die Spalte dafuer gibt es schon.**
// `workout_exercises.exercise_name` ist `NOT NULL` und **keine
// Fremdschluesselspalte**; daneben steht `exercise_id` als Verweis
// auf `training.exercises`.
//
// `[cmd]` **Im Bestand sind alle 132 Zeilen namensgleich mit dem
// Katalog** (gemessen 2026-08-28) — **das beweist nichts**, es heisst
// nur, dass seit dem Seed niemand umbenannt hat.
//
// `[read]` **Die Spalte ist der Snapshot, und sie wird beim Schreiben
// eingefroren** — dieselbe Regel wie `dose_snapshot` (G-138) und
// `height_cm_snapshot` (G-122): **zum Zeitpunkt des Schreibens aus
// dem Katalog kopiert, danach nie wieder nachgeschlagen.**
//
// `[read]` **`exercise_id` bleibt trotzdem stehen** — wer die heutige
// Katalogfassung sehen will, folgt dem Verweis. **Beides nebeneinander
// zeigt, was damals galt und was heute gilt.**
//
// ══ WAS NICHT FORTGESCHRIEBEN WIRD ══════════════════════════════════
//
// `[cmd]` **Die Aggregatspalten werden nach jeder Aenderung neu
// gerechnet, nicht hochgezaehlt.** Begruendung mit Messung in
// `sitzung-regeln.ts` → `aggregat()`: im Bestand stimmen nur 14 von
// 36 Zaehlern.
//
// MUSTER: `lib/recovery/checkin-write.ts` (G-122),
// `lib/medical/medikament-write.ts` (G-211). Laeuft ausschliesslich
// serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import {
  pruefeSitzung, pruefeSatz, aggregat, volumen, epley, dauerMinuten,
  text, zahl,
  type SitzungsEingabe, type SatzEingabe, type Feldfehler, type SatzZahl,
} from './sitzung-regeln'

export class TrainingSchreibFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'WRITE_FAILED',
    message: string,
    public felder?: Feldfehler[],
  ) {
    super(message)
    this.name = 'TrainingSchreibFehler'
  }
}

function db() {
  return createSessionClient().schema('training')
}

async function nutzerin(): Promise<string> {
  const { data: { user } } = await createSessionClient().auth.getUser()
  if (!user) throw new TrainingSchreibFehler('NO_SESSION', 'Keine angemeldete Session.')
  return user.id
}

/** `[cmd]` G-79: PostgREST meldet `ok`, wenn der Zeilenschutz leer filtert. */
function ersteZeile<T>(zeilen: T[] | null, was: string): T {
  const z = zeilen ?? []
  if (z.length === 0) {
    throw new TrainingSchreibFehler('NOT_FOUND', `${was} — nicht geschrieben.`)
  }
  return z[0]
}

function uhrzeit(d: Date): string {
  return d.toTimeString().slice(0, 8)
}

// ── 1. Die Sitzung beginnen ──────────────────────────────────────

export type Sitzungskopf = {
  id: string
  session_date: string
  status: string
  started_time: string
  ended_time: string | null
}

/**
 * Eine Sitzung anlegen — **offen.**
 *
 * `[read]` **`status: 'active'`, `ended_time: null`.** Der
 * Vorgabewert der Spalte ist `'completed'`; wer ihn stehen liesse,
 * haette eine Sitzung, die als absolviert gilt, bevor der erste Satz
 * steht. **Deshalb wird er hier ausdruecklich ueberschrieben.**
 */
export async function beginneSitzung(e: SitzungsEingabe): Promise<Sitzungskopf> {
  const fehler = pruefeSitzung(e)
  if (fehler.length > 0) {
    throw new TrainingSchreibFehler('VALIDATION_FAILED', 'Eingabe unvollstaendig.', fehler)
  }
  const uid = await nutzerin()

  const { data, error } = await db()
    .from('workout_sessions')
    .insert({
      user_id: uid,
      session_date: e.session_date,
      started_time: uhrzeit(new Date()),
      // `[read]` Offen heisst offen — kein Ende, keine Dauer.
      ended_time: null,
      duration_minutes: null,
      status: 'active',
      name: text(e.name),
      location: text(e.location),
      notes: text(e.notes),
      measurement_source: 'manual',
    })
    .select('id, session_date, status, started_time, ended_time')
  if (error) throw new TrainingSchreibFehler('WRITE_FAILED', `workout_sessions: ${error.message}`)

  const z = ersteZeile(data as unknown as Array<Record<string, unknown>>, 'Sitzung')
  return {
    id: String(z.id),
    session_date: String(z.session_date),
    status: String(z.status),
    started_time: String(z.started_time),
    ended_time: z.ended_time ? String(z.ended_time) : null,
  }
}

// ── 2. Eine Uebung hinzufuegen ───────────────────────────────────

export type SitzungsUebungKopf = {
  id: string
  exercise_id: string
  exercise_name: string
  exercise_order: number
}

/**
 * Eine Katalog-Uebung an die Sitzung haengen.
 *
 * `[cmd]` **Hier faellt der Snapshot:** `exercise_name` wird aus
 * `training.exercises` gelesen und in die Zeile geschrieben. **Danach
 * wird er nie wieder nachgeschlagen** — auch nicht beim Aendern.
 *
 * `[read]` **`exercise_order` wird gezaehlt, nicht uebergeben.**
 * `workout_exercises_exercise_order_check` verlangt `> 0`, und wer
 * die Nummer von aussen setzen laesst, bekommt Luecken und Dubletten.
 */
export async function fuegeUebungHinzu(
  sitzungId: string, exerciseId: string,
): Promise<SitzungsUebungKopf> {
  if (!/^[0-9a-f-]{36}$/i.test(sitzungId) || !/^[0-9a-f-]{36}$/i.test(exerciseId)) {
    throw new TrainingSchreibFehler('VALIDATION_FAILED', 'Ungueltige Kennung.', [
      { feld: 'exercise_id', text: 'Keine gueltige Uebungskennung.' },
    ])
  }
  const t = db()

  // Der Katalogname, EINMAL — das ist der Snapshot.
  const { data: kat, error: kFehler } = await t
    .from('exercises').select('id, name').eq('id', exerciseId).limit(1)
  if (kFehler) throw new TrainingSchreibFehler('WRITE_FAILED', `exercises: ${kFehler.message}`)
  const uebung = ersteZeile(kat as unknown as Array<Record<string, unknown>>, 'Uebung')

  // `[cmd]` Die naechste Nummer aus dem Bestand der Sitzung. Der
  // Zeilenschutz filtert fremde Sitzungen hier bereits weg.
  const { data: bisher, error: bFehler } = await t
    .from('workout_exercises')
    .select('exercise_order')
    .eq('workout_session_id', sitzungId)
    .order('exercise_order', { ascending: false })
    .limit(1)
  if (bFehler) {
    throw new TrainingSchreibFehler('WRITE_FAILED', `workout_exercises: ${bFehler.message}`)
  }
  const vorige = (bisher ?? [])[0] as Record<string, unknown> | undefined
  const naechste = Number(vorige?.exercise_order ?? 0) + 1

  const { data, error } = await t
    .from('workout_exercises')
    .insert({
      workout_session_id: sitzungId,
      exercise_id: exerciseId,
      // ── der Snapshot ──
      exercise_name: String(uebung.name),
      exercise_order: naechste,
    })
    .select('id, exercise_id, exercise_name, exercise_order')
  if (error) throw new TrainingSchreibFehler('WRITE_FAILED', `workout_exercises: ${error.message}`)

  const z = ersteZeile(data as unknown as Array<Record<string, unknown>>, 'Uebung')
  return {
    id: String(z.id),
    exercise_id: String(z.exercise_id),
    exercise_name: String(z.exercise_name),
    exercise_order: Number(z.exercise_order),
  }
}

// ── 3. Einen Satz eintragen ──────────────────────────────────────

export type SatzKopf = {
  id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  volume_kg: number | null
  estimated_1rm: number | null
}

/**
 * Einen Satz an eine Uebung schreiben und die Aggregate nachziehen.
 *
 * `[read]` **Der Satz zuerst, die Aggregate danach** — schlaegt das
 * Nachziehen fehl, steht der Satz trotzdem. Das ist die richtige
 * Reihenfolge: **die Messung ist die Wahrheit, das Aggregat ihre
 * Zusammenfassung.** Umgekehrt haette man eine Zahl ohne Beleg.
 */
export async function trageSatzEin(
  uebungId: string, e: SatzEingabe,
): Promise<SatzKopf> {
  const fehler = pruefeSatz(e)
  if (fehler.length > 0) {
    throw new TrainingSchreibFehler('VALIDATION_FAILED', 'Satz unvollstaendig.', fehler)
  }
  if (!/^[0-9a-f-]{36}$/i.test(uebungId)) {
    throw new TrainingSchreibFehler('VALIDATION_FAILED', 'Ungueltige Kennung.', [
      { feld: 'workout_exercise_id', text: 'Keine gueltige Uebungskennung.' },
    ])
  }
  const t = db()

  const { data: bisher, error: bFehler } = await t
    .from('workout_sets')
    .select('set_number')
    .eq('workout_exercise_id', uebungId)
    .order('set_number', { ascending: false })
    .limit(1)
  if (bFehler) throw new TrainingSchreibFehler('WRITE_FAILED', `workout_sets: ${bFehler.message}`)
  const vorig = (bisher ?? [])[0] as Record<string, unknown> | undefined
  const nummer = Number(vorig?.set_number ?? 0) + 1

  const reps = (zahl(e.reps) ?? null) as number | null
  const gewicht = (zahl(e.weight_kg) ?? null) as number | null

  const { data, error } = await t
    .from('workout_sets')
    .insert({
      workout_exercise_id: uebungId,
      set_number: nummer,
      reps,
      weight_kg: gewicht,
      rpe: zahl(e.rpe) ?? null,
      rir: zahl(e.rir) ?? null,
      rest_seconds: zahl(e.rest_seconds) ?? null,
      set_type: e.set_type,
      volume_kg: volumen(reps, gewicht),
      estimated_1rm: epley(reps, gewicht, e.set_type),
      logged_via: 'manual',
      measurement_source: 'manual',
    })
    .select('id, set_number, reps, weight_kg, volume_kg, estimated_1rm')
  if (error) throw new TrainingSchreibFehler('WRITE_FAILED', `workout_sets: ${error.message}`)

  const z = ersteZeile(data as unknown as Array<Record<string, unknown>>, 'Satz')
  await zieheAggregateNach(uebungId)

  return {
    id: String(z.id),
    set_number: Number(z.set_number),
    reps: z.reps === null ? null : Number(z.reps),
    weight_kg: z.weight_kg === null ? null : Number(z.weight_kg),
    volume_kg: z.volume_kg === null ? null : Number(z.volume_kg),
    estimated_1rm: z.estimated_1rm === null ? null : Number(z.estimated_1rm),
  }
}

/**
 * Uebungs- und Sitzungsaggregate aus den Saetzen neu rechnen.
 *
 * `[read]` **Nicht hochzaehlen, sondern nachlesen** — Begruendung in
 * `sitzung-regeln.ts`. Ein Zaehler, der bei jedem Schritt um eins
 * steigt, ist nach dem ersten Fehlschlag dauerhaft falsch.
 */
async function zieheAggregateNach(uebungId: string): Promise<void> {
  const t = db()

  const { data: saetze, error } = await t
    .from('workout_sets')
    .select('reps, volume_kg, weight_kg, estimated_1rm')
    .eq('workout_exercise_id', uebungId)
    .limit(1000)
  if (error) throw new TrainingSchreibFehler('WRITE_FAILED', `workout_sets: ${error.message}`)

  const liste: SatzZahl[] = ((saetze ?? []) as unknown as Array<Record<string, unknown>>)
    .map(s => ({
      reps: s.reps === null ? null : Number(s.reps),
      volume_kg: s.volume_kg === null ? null : Number(s.volume_kg),
      weight_kg: s.weight_kg === null ? null : Number(s.weight_kg),
      estimated_1rm: s.estimated_1rm === null ? null : Number(s.estimated_1rm),
    }))
  const a = aggregat(liste)

  const { data: ue, error: uFehler } = await t
    .from('workout_exercises')
    .update({
      actual_sets: a.total_sets,
      actual_volume_kg: a.total_volume_kg,
      total_reps: a.total_reps,
      max_weight_kg: a.max_weight_kg,
      best_estimated_1rm: a.best_estimated_1rm,
    })
    .eq('id', uebungId)
    .select('id, workout_session_id')
  if (uFehler) {
    throw new TrainingSchreibFehler('WRITE_FAILED', `workout_exercises: ${uFehler.message}`)
  }
  const zeile = ersteZeile(ue as unknown as Array<Record<string, unknown>>, 'Uebung')
  await zieheSitzungNach(String(zeile.workout_session_id))
}

async function zieheSitzungNach(sitzungId: string): Promise<void> {
  const t = db()

  const { data: uebungen, error } = await t
    .from('workout_exercises')
    .select('actual_sets, actual_volume_kg, total_reps')
    .eq('workout_session_id', sitzungId)
    .limit(1000)
  if (error) {
    throw new TrainingSchreibFehler('WRITE_FAILED', `workout_exercises: ${error.message}`)
  }

  let sets = 0
  let reps = 0
  let vol = 0
  for (const u of (uebungen ?? []) as unknown as Array<Record<string, unknown>>) {
    sets += Number(u.actual_sets ?? 0)
    reps += Number(u.total_reps ?? 0)
    vol += Number(u.actual_volume_kg ?? 0)
  }

  const { error: sFehler } = await t
    .from('workout_sessions')
    .update({
      total_sets: sets,
      total_reps: reps,
      total_volume_kg: Number(vol.toFixed(3)),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sitzungId)
    .select('id')
  if (sFehler) {
    throw new TrainingSchreibFehler('WRITE_FAILED', `workout_sessions: ${sFehler.message}`)
  }
}

// ── 4. Abschliessen — oder offen lassen ──────────────────────────

/**
 * Die Sitzung abschliessen.
 *
 * `[read]` **Erst hier entsteht `ended_time`**, und damit die Dauer.
 * `[cmd]` Alle 28 `planned`-Sitzungen im Seed tragen eine
 * `ended_time`, obwohl sie nicht stattgefunden haben — **dieser Weg
 * erzeugt das nicht.**
 */
export async function schliesseSitzungAb(sitzungId: string): Promise<Sitzungskopf> {
  const t = db()

  const { data: vorher, error: vFehler } = await t
    .from('workout_sessions')
    .select('id, started_time')
    .eq('id', sitzungId)
    .limit(1)
  if (vFehler) {
    throw new TrainingSchreibFehler('WRITE_FAILED', `workout_sessions: ${vFehler.message}`)
  }
  const alt = ersteZeile(vorher as unknown as Array<Record<string, unknown>>, 'Sitzung')

  const ende = uhrzeit(new Date())
  const { data, error } = await t
    .from('workout_sessions')
    .update({
      status: 'completed',
      ended_time: ende,
      duration_minutes: dauerMinuten(String(alt.started_time), ende),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sitzungId)
    .select('id, session_date, status, started_time, ended_time')
  if (error) throw new TrainingSchreibFehler('WRITE_FAILED', `workout_sessions: ${error.message}`)

  const z = ersteZeile(data as unknown as Array<Record<string, unknown>>, 'Sitzung')
  return {
    id: String(z.id),
    session_date: String(z.session_date),
    status: String(z.status),
    started_time: String(z.started_time),
    ended_time: z.ended_time ? String(z.ended_time) : null,
  }
}

/**
 * Die Sitzung verwerfen — **ohne sie zu loeschen.**
 *
 * `[read]` **Dieselbe Entscheidung wie „Absetzen ist kein Loeschen"
 * bei den Medikamenten (G-211):** `cancelled` ist ein Zustand des
 * Schemas, und ein abgebrochenes Training ist eine Tatsache ueber den
 * Tag. **Wer loescht, verliert die Auskunft, dass jemand angefangen
 * hat.**
 */
export async function verwerfeSitzung(sitzungId: string): Promise<Sitzungskopf> {
  const { data, error } = await db()
    .from('workout_sessions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', sitzungId)
    .select('id, session_date, status, started_time, ended_time')
  if (error) throw new TrainingSchreibFehler('WRITE_FAILED', `workout_sessions: ${error.message}`)

  const z = ersteZeile(data as unknown as Array<Record<string, unknown>>, 'Sitzung')
  return {
    id: String(z.id),
    session_date: String(z.session_date),
    status: String(z.status),
    started_time: String(z.started_time),
    ended_time: z.ended_time ? String(z.ended_time) : null,
  }
}
