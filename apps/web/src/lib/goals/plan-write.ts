// G-629 — Schreibwege des Planers (G-625, live). Laeuft ausschliesslich serverseitig.
//
// `[cmd]` **Signaturen aus `625_goal_plan_runtime.sql` / `_position_revision.sql`:**
//
//   goal_plan_create(p_goal_id, p_name)                         -> uuid
//   goal_plan_activate / _pause / _complete / _delete(p_plan_id)
//   goal_plan_position_save(p_plan_id, p_position_id, p_position, p_strategie_code,
//     p_eigene_werte, p_richtung, p_phase_type, p_duration_weeks, p_gueltig_ab,
//     p_projected_end_date, p_confirmed_warnings, p_sub_phase_code, p_zielrate_pct_kg_woche)
//   goal_plan_position_move(p_position_id, p_new_position)
//   goal_plan_position_revise(p_position_id, p_strategie_code, p_eigene_werte,
//     p_duration_weeks, p_confirmed_warnings, p_stichtag, p_sub_phase_code, p_zielrate_pct_kg_woche)
//   goal_plan_event_save(p_plan_id, p_event_id, p_name, p_kind, p_event_date) / _event_delete(p_event_id)
//
// `[read]` **Die Kette prueft** (Eigentuemer, Grad, Richtung, Grenzen). G625-
// Ablehnungen kommen als Satz zurueck; G626-Meldungen roh, damit die Oberflaeche
// den Satz mit den Hinweisen der Pruefung baut (wie G-628 Teil 2).
import { createSessionClient } from '@lumeos/shared/session'

import { planFehler } from './plan'

export type Planergebnis = { ok: true; id: string | null } | { ok: false; fehler: string; roh: string; schluessel: string | null }

async function rufe(name: string, p: Record<string, unknown>): Promise<Planergebnis> {
  const { data, error } = await createSessionClient().schema('goals').rpc(name, p)
  if (!error) return { ok: true, id: typeof data === 'string' ? data : null }
  const f = planFehler(error.message)
  return { ok: false, fehler: f.satz, roh: error.message, schluessel: f.schluessel }
}

export interface Positionsdaten {
  position: number
  strategie_code: string | null
  eigene_werte: Record<string, number> | null
  richtung: 'abnehmen' | 'halten' | 'aufbauen'
  phase_type: string
  duration_weeks: number | null
  gueltig_ab: string | null
  projected_end_date: string | null
  confirmed_warnings: string[]
  zielrate_pct_kg_woche: number | null
}

export const planAnlegen = (goalId: string, name: string) => rufe('goal_plan_create', { p_goal_id: goalId, p_name: name })
// G-649 (Kette G-644): Ausgangspunkt = `goal_plan_templates.code`, Anker = Beginn bzw. A-Termin.
export const planAnlegenAus = (goalId: string, name: string, ausgangspunkt: string, anker: string) =>
  rufe('goal_plan_create', { p_goal_id: goalId, p_name: name, p_ausgangspunkt: ausgangspunkt, p_anker_datum: anker })
export const planAlsVorlage = (id: string, name: string) => rufe('goal_plan_save_as_template', { p_plan_id: id, p_name: name })
export const positionLoeschen = (id: string) => rufe('goal_plan_position_delete', { p_position_id: id })
/** Umbenennen: `goal_programs` (RLS `goal_programs_owner`); `name_is_custom` setzt der Trigger G-645. */
export async function planUmbenennen(id: string, name: string): Promise<Planergebnis> {
  const { error } = await createSessionClient().schema('goals').from('goal_programs').update({ name }).eq('id', id)
  return error ? { ok: false, fehler: planFehler(error.message).satz, roh: error.message, schluessel: null } : { ok: true, id }
}
export const planAktivieren = (id: string) => rufe('goal_plan_activate', { p_plan_id: id })
export const planPausieren = (id: string) => rufe('goal_plan_pause', { p_plan_id: id })
export const planBeenden = (id: string) => rufe('goal_plan_complete', { p_plan_id: id })
export const planLoeschen = (id: string) => rufe('goal_plan_delete', { p_plan_id: id })
/** G-644 Teil 2: abgeschlossenen Plan als neuen Entwurf ab `start`; Loeschen nur bestaetigt. */
export const planNeuStarten = (id: string, name: string, start: string) => rufe('goal_plan_restart', { p_plan_id: id, p_name: name, p_start_date: start })
/** G-644 Teil 2: Programm/Dauer einer geplanten Position aendern; die Kette rechnet alle folgenden Daten neu. */
export const positionNeuBerechnen = (id: string, code: string | null, eigene: Record<string, unknown> | null, wochen: number) =>
  rufe('goal_plan_position_recalculate', { p_position_id: id, p_strategie_code: code, p_eigene_werte: code ? null : eigene, p_duration_weeks: wochen })
export const planFertigLoeschen = (id: string) => rufe('goal_plan_delete_completed', { p_plan_id: id, p_confirm: true })

export const positionSpeichern = (planId: string, positionId: string | null, d: Positionsdaten) => rufe('goal_plan_position_save', {
  p_plan_id: planId, p_position_id: positionId, p_position: d.position,
  p_strategie_code: d.strategie_code, p_eigene_werte: d.eigene_werte, p_richtung: d.richtung,
  p_phase_type: d.phase_type, p_duration_weeks: d.duration_weeks, p_gueltig_ab: d.gueltig_ab,
  p_projected_end_date: d.projected_end_date, p_confirmed_warnings: d.confirmed_warnings,
  p_sub_phase_code: null, p_zielrate_pct_kg_woche: d.zielrate_pct_kg_woche,
})
export const positionVerschieben = (positionId: string, neu: number) =>
  rufe('goal_plan_position_move', { p_position_id: positionId, p_new_position: neu })
export const positionAendernAb = (positionId: string, d: {
  strategie_code: string | null; eigene_werte: Record<string, number> | null; duration_weeks: number | null
  confirmed_warnings: string[]; stichtag: string; zielrate_pct_kg_woche: number | null
}) => rufe('goal_plan_position_revise', {
  p_position_id: positionId, p_strategie_code: d.strategie_code, p_eigene_werte: d.eigene_werte,
  p_duration_weeks: d.duration_weeks, p_confirmed_warnings: d.confirmed_warnings, p_stichtag: d.stichtag,
  p_sub_phase_code: null, p_zielrate_pct_kg_woche: d.zielrate_pct_kg_woche,
})
export const terminSpeichern = (planId: string, terminId: string | null, name: string, kind: string, datum: string) =>
  rufe('goal_plan_event_save', { p_plan_id: planId, p_event_id: terminId, p_name: name, p_kind: kind, p_event_date: datum })
export const terminLoeschen = (terminId: string) => rufe('goal_plan_event_delete', { p_event_id: terminId })
