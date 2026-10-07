// G-608 — die Stufenwochen des Nutzers speichern.
//
// `[cmd]` **E-85, Tom 2026-10-01:** *„ein user erwartet einen vorschlag,
// der soll aber individuell von ihm editiert werden koennen"* — der
// Vorschlag kommt aus `stufenwochen` (G-607), die editierten Wochen
// liegen in `goals.goal_program_positions.duration_weeks`.
//
// `[cmd]` **Gemessen live 2026-10-07:** `goal_programs (goal_id, name)`,
// `goal_program_positions (program_id, position, strategie_code,
// sub_phase_code, duration_weeks, goal_phase_id)`; `UNIQUE (program_id,
// position)`, `CHECK duration_weeks > 0`; der Trigger
// `goal_program_position_validate` weist eine Unterphase ab, die nicht
// in `sub_phases` der Strategie steht (23514). Zeilenschutz ueber
// `user_goals.user_id`.
//
// `[read]` **`goal_phase_id` bleibt leer:** es ist `UNIQUE` — eine Phase
// gehoert hoechstens EINER Position, die Stufen teilen sich aber eine.
import { createSessionClient } from '@lumeos/shared/session'

export type Stufenwoche = { sub_phase_code: string; duration_weeks: number }
export type ProgrammErgebnis = { ok: true; zeilen: number } | { ok: false; fehler: string }

function db() {
  return createSessionClient().schema('goals')
}

/**
 * Die Wochen je Stufe speichern — legt das Programm an, wenn das Ziel
 * noch keines hat. **Alle Stufen in einem Aufruf**, Position = Reihenfolge.
 */
export async function stufenwochenSpeichern(
  goalId: string, strategieCode: string, stufen: Stufenwoche[],
): Promise<ProgrammErgebnis> {
  // `[read]` **Nur, was das Schema verlangt** — ganze Zahl, > 0, smallint.
  const falsch = stufen.find(s => !Number.isInteger(s.duration_weeks)
    || s.duration_weeks < 1 || s.duration_weeks > 32767)
  if (falsch) return { ok: false, fehler: `${falsch.sub_phase_code}: ganze Wochen, mindestens eine.` }
  if (stufen.length === 0) return { ok: false, fehler: 'Keine Stufe zum Speichern.' }

  const { data: vorhanden, error: le } = await db()
    .from('goal_programs').select('id').eq('goal_id', goalId)
    .order('created_at', { ascending: true }).limit(1)
  if (le) return { ok: false, fehler: le.message }

  let programId = vorhanden?.[0]?.id as string | undefined
  if (!programId) {
    const { data: neu, error } = await db()
      .from('goal_programs').insert({ goal_id: goalId, name: strategieCode })
      .select('id')
    if (error) return { ok: false, fehler: error.message }
    programId = neu?.[0]?.id as string | undefined
    // `[read]` **G-79: null Zeilen ist ein Fehler** — der Zeilenschutz
    // filtert still, wenn das Ziel nicht dieser Sitzung gehoert.
    if (!programId) return { ok: false, fehler: 'Das Programm wurde nicht angelegt — gehoert das Ziel dieser Sitzung?' }
  }

  const { data, error } = await db()
    .from('goal_program_positions')
    .upsert(stufen.map((s, i) => ({
      program_id: programId, position: i + 1, strategie_code: strategieCode,
      sub_phase_code: s.sub_phase_code, duration_weeks: s.duration_weeks,
    })), { onConflict: 'program_id,position' })
    .select('id')
  if (error) return { ok: false, fehler: error.message }
  const zeilen = data?.length ?? 0
  if (zeilen !== stufen.length) {
    return { ok: false, fehler: `${zeilen} von ${stufen.length} Stufen gespeichert.` }
  }
  return { ok: true, zeilen }
}

/**
 * Zurueck zum Vorschlag: das Programm des Ziels loeschen (die Positionen
 * gehen per `ON DELETE CASCADE` mit).
 *
 * `[read]` **Hart, nicht weich:** die Tabelle hat kein `deleted_at`, und
 * ein Programm ohne Positionen waere ein leerer Datensatz, der „ich habe
 * etwas eingestellt" behauptet.
 */
export async function stufenwochenZuruecksetzen(goalId: string): Promise<ProgrammErgebnis> {
  const { data, error } = await db()
    .from('goal_programs').delete().eq('goal_id', goalId).select('id')
  if (error) return { ok: false, fehler: error.message }
  return { ok: true, zeilen: data?.length ?? 0 }
}
