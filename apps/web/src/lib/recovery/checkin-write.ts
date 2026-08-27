// ════════════════════════════════════════════════════════════════════
// DIE EINE SCHREIBSTELLE FUER `recovery.checkins` UND
// `recovery.modality_log` — G-122
// ════════════════════════════════════════════════════════════════════
//
// ══ WARUM BEIDE IN EINER DATEI ══════════════════════════════════════
//
// `[read]` **Eine Naht je ZIEL, nicht je Tabelle** — der Auftrag
// fragt nach der Form. Beide Tabellen liegen im selben Schema, tragen
// denselben Zeilenschutz und werden von derselben Seite bedient.
// **Zwei Dateien waeren zwei Orte fuer dieselbe Zusage.**
//
// `[read]` **Der Waechter zaehlt trotzdem je Tabelle** — wer eine
// dritte Datei aufmacht, faellt auf, egal welche der beiden sie
// schreibt.
//
// ══ ZWEI TABELLEN, ZWEI VERSCHIEDENE FACHREGELN ═════════════════════
//
// `[cmd]` **`checkins_user_id_entry_date_key` ist EINDEUTIG** — ein
// Check-in je Nutzerin und Tag. `[cmd]` **`modality_log` hat keinen
// solchen Schluessel**, und im Bestand liegen **32 Tage mit mehr als
// einer Anwendung** (gemessen 2026-08-27).
//
// `[read]` **Das ist kein Schemafehler, sondern die Sache selbst:**
// man hat einen Zustand pro Tag, aber kann zweimal in die Sauna.
// **Deshalb `upsert` fuer das eine, `insert` fuer das andere.**
//
// ══ KEIN SNAPSHOT — UND WARUM DAS EIN BEFUND IST ════════════════════
//
// **Auftrag: *„Pruef, ob eine der drei so etwas braucht: ein Check-in
// von gestern darf sich nicht aendern, wenn heute eine Skala
// angepasst wird."***
//
// `[cmd]` **`recovery.checkins` fuehrt keine Snapshot-Spalte** — alle
// 29 Spalten sind entweder Messwerte, Zeitstempel oder Herkunft
// (gegen `information_schema` geprueft).
//
// `[read]` **Und sie braucht auch keine:** die Skalen stehen als
// CHECK-Constraint im Schema (`1..10`), nicht in einer Tabelle, die
// jemand aendern koennte. **Wer die Skala aendert, aendert eine
// Migration** — dann sind die alten Werte ohnehin neu zu deuten, und
// ein Snapshot je Zeile haette das nicht verhindert.
//
// `[read]` **Der Snapshot-Fall dieses Auftrags liegt woanders:**
// `goals.body_measurements.height_cm_snapshot`. Siehe
// `lib/goals/koerpermass-write.ts`.
//
// MUSTER: `lib/goals/schreiben.ts` (G-79). Laeuft ausschliesslich
// serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import {
  pruefeCheckin, pruefeModalitaet, zahl,
  type CheckinEingabe, type ModalitaetEingabe, type Feldfehler,
} from './checkin-regeln'

export class RecoverySchreibFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED' | 'WRITE_FAILED',
    message: string,
    public felder?: Feldfehler[],
  ) {
    super(message)
    this.name = 'RecoverySchreibFehler'
  }
}

function db() {
  return createSessionClient().schema('recovery')
}

async function sitzung() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new RecoverySchreibFehler('NO_SESSION', 'Keine angemeldete Sitzung.')
  return { userId: user.id }
}

/** Ganze Zahl oder `null` — die Skalen sind `smallint`. */
function ganz(roh: string): number | null {
  const n = zahl(roh)
  return n === null || Number.isNaN(n) ? null : Math.round(n)
}

function dezimal(roh: string): number | null {
  const n = zahl(roh)
  return n === null || Number.isNaN(n) ? null : n
}

/**
 * `checkin_time` und `logged_time` brauchen Sekunden = 0.
 *
 * `[cmd]` `checkins_checkin_time_check` und
 * `modality_log_logged_time_check` verlangen beide
 * `EXTRACT(second FROM …) = 0`. `[read]` Ein `<input type="time">`
 * liefert `HH:MM` — **aber manche Browser haengen `:SS` an.**
 * Dieselbe Falle wie in `stack-write.ts` (G-148).
 */
function zeitOderNull(roh: string): string | null {
  const t = String(roh ?? '').trim()
  if (!t) return null
  const m = /^(\d{2}):(\d{2})/.exec(t)
  if (!m) {
    throw new RecoverySchreibFehler(
      'VALIDATION_FAILED', `Ungueltige Zeit: ${roh}`,
      [{ feld: 'zeit', text: 'Uhrzeit als HH:MM.' }])
  }
  return `${m[1]}:${m[2]}:00`
}

export type GeschriebenerCheckin = {
  id: string
  entry_date: string
  mood: string
  sleep_hours: number | null
  subjective_feeling: number | null
}

export type GeschriebeneModalitaet = {
  id: string
  entry_date: string
  modality_type: string
  duration_min: number | null
  bonus_value: number
  bonus_source: string
}

/**
 * Einen Check-in schreiben — anlegen ODER ueberschreiben.
 *
 * `[cmd]` **`upsert` auf `(user_id, entry_date)`**, weil der
 * Eindeutigkeitsschluessel das erzwingt. `[read]` **Ein zweiter
 * Check-in am selben Tag ist eine Korrektur, kein Fehler** — wer
 * morgens eintraegt und abends genauer weiss, wie er geschlafen hat,
 * soll nicht auf eine Fehlermeldung stossen.
 *
 * `[read]` **Das ist zugleich das „Aendern" dieser Tabelle.** Eine
 * eigene Aenderungsfunktion waere ein zweiter Weg zum selben Ziel.
 */
export async function checkinSchreiben(
  e: CheckinEingabe,
): Promise<GeschriebenerCheckin> {
  const felder = pruefeCheckin(e)
  if (felder.length > 0) {
    throw new RecoverySchreibFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()

  const { data, error } = await db()
    .from('checkins')
    .upsert({
      user_id: userId,
      entry_date: e.entry_date.trim(),
      checkin_time: zeitOderNull(e.checkin_time),
      sleep_hours: dezimal(e.sleep_hours),
      sleep_quality: ganz(e.sleep_quality),
      subjective_feeling: ganz(e.subjective_feeling),
      mood: e.mood.trim(),
      energy_level: ganz(e.energy_level),
      motivation: ganz(e.motivation),
      stress_level: ganz(e.stress_level),
      notes: e.notes.trim() || null,
      measurement_source: 'manual',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,entry_date' })
    .select('id, entry_date, mood, sleep_hours, subjective_feeling')
  if (error) throw new RecoverySchreibFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  // G-79: PostgREST meldet Erfolg, wenn RLS leerfiltert.
  if (zeilen.length === 0) {
    throw new RecoverySchreibFehler('NOT_FOUND', 'Nicht geschrieben.')
  }
  const z = zeilen[0] as Record<string, unknown>
  return {
    id: String(z.id),
    entry_date: String(z.entry_date),
    mood: String(z.mood),
    sleep_hours: z.sleep_hours == null ? null : Number(z.sleep_hours),
    subjective_feeling: z.subjective_feeling == null
      ? null : Number(z.subjective_feeling),
  }
}

/**
 * Eine Erholungsanwendung eintragen.
 *
 * ══ `bonus_value` UND `bonus_source` WERDEN NICHT GESETZT ═══════════
 *
 * `[cmd]` **Die Spaltenvorgaben sind `0` und `'pending_c124_e5'`** —
 * und **alle 178 Bestandszeilen tragen genau das** (gemessen
 * 2026-08-27).
 *
 * `[read]` **Die Tabelle sagt selbst, dass ihr Bonus nicht
 * entschieden ist.** Wer hier `bonus_value: 0` schriebe, behauptete
 * *„geprueft, kein Effekt"* — **das ist etwas anderes als *„noch
 * nicht entschieden"***, und der Unterschied ist derselbe wie in
 * G-208 zwischen *begruendet leer* und *nicht bearbeitet*.
 */
export async function modalitaetAnlegen(
  e: ModalitaetEingabe,
): Promise<GeschriebeneModalitaet> {
  const felder = pruefeModalitaet(e)
  if (felder.length > 0) {
    throw new RecoverySchreibFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()

  const { data, error } = await db()
    .from('modality_log')
    .insert({
      user_id: userId,
      entry_date: e.entry_date.trim(),
      logged_time: zeitOderNull(e.logged_time),
      modality_type: e.modality_type.trim(),
      duration_min: ganz(e.duration_min),
      detail: e.detail.trim() || null,
      immediate_effect: ganz(e.immediate_effect),
      notes: e.notes.trim() || null,
      measurement_source: 'manual',
      // bonus_value / bonus_source: NICHT gesetzt — siehe Kopf.
    })
    .select('id, entry_date, modality_type, duration_min, bonus_value, bonus_source')
  if (error) throw new RecoverySchreibFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) {
    throw new RecoverySchreibFehler('NOT_FOUND', 'Nicht angelegt.')
  }
  const z = zeilen[0] as Record<string, unknown>
  return {
    id: String(z.id),
    entry_date: String(z.entry_date),
    modality_type: String(z.modality_type),
    duration_min: z.duration_min == null ? null : Number(z.duration_min),
    bonus_value: Number(z.bonus_value),
    bonus_source: String(z.bonus_source),
  }
}

/**
 * Eine Anwendung aendern.
 *
 * `[read]` **`bonus_*` bleibt auch hier unberuehrt** — eine
 * Korrektur der Dauer darf nicht dazu fuehren, dass ein
 * unentschiedener Bonus als entschieden dasteht.
 */
export async function modalitaetAendern(
  id: string, e: ModalitaetEingabe,
): Promise<GeschriebeneModalitaet> {
  const felder = pruefeModalitaet(e)
  if (felder.length > 0) {
    throw new RecoverySchreibFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()
  const { data, error } = await db()
    .from('modality_log')
    .update({
      entry_date: e.entry_date.trim(),
      logged_time: zeitOderNull(e.logged_time),
      modality_type: e.modality_type.trim(),
      duration_min: ganz(e.duration_min),
      detail: e.detail.trim() || null,
      immediate_effect: ganz(e.immediate_effect),
      notes: e.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, entry_date, modality_type, duration_min, bonus_value, bonus_source')
  if (error) throw new RecoverySchreibFehler('WRITE_FAILED', error.message)
  const zeilen = (data ?? []) as unknown[]
  if (zeilen.length === 0) {
    throw new RecoverySchreibFehler('NOT_FOUND', 'Nicht gefunden.')
  }
  const z = zeilen[0] as Record<string, unknown>
  return {
    id: String(z.id),
    entry_date: String(z.entry_date),
    modality_type: String(z.modality_type),
    duration_min: z.duration_min == null ? null : Number(z.duration_min),
    bonus_value: Number(z.bonus_value),
    bonus_source: String(z.bonus_source),
  }
}
