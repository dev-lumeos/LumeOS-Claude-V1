// G-629 — die Plaene der angemeldeten Nutzerin (G-625). Laeuft ausschliesslich serverseitig.
//
// `[cmd]` **Drei Tabellen, eine Phase-Lesung:** `goal_programs` (RLS ueber
// `user_id`), `goal_program_positions`, `goal_program_events`; dazu das
// Phasenende aus `goal_phases` fuer gestartete Positionen. `[read]` **Ob eine
// Position laeuft, entscheidet `phase_am`** — die Menge kommt vom Aufrufer
// (`echt.phasen`), nicht aus einer zweiten Regel hier.
import { createSessionClient } from '@lumeos/shared/session'

import { phasenLauf, positionszustand, wocheText, type Planstatus, type Positionszustand, type Terminart } from './plan'

export interface Planposition {
  id: string
  position: number
  strategie_code: string | null
  eigene_werte: Record<string, unknown> | null
  richtung: 'abnehmen' | 'halten' | 'aufbauen'
  phase_type: string
  duration_weeks: number | null
  gueltig_ab: string | null
  projected_end_date: string | null
  goal_phase_id: string | null
  zielrate_pct_kg_woche: number | null
  sub_phase_code: string | null
  confirmed_warnings: string[]
  zustand: Positionszustand
  /** G-645/2: „Woche x von y" aus der Phase — dieselbe Rechnung wie die Steuerungskarte. */
  woche: string | null
  /** G-649: Wechselvorschlag der Phase (`goal_phases.recommended_next`) — steht unter „Als nächstes". */
  empfohlen?: { next: string; grund: string | null } | null
}
export interface Plantermin { id: string; name: string; kind: Terminart; event_date: string }
export interface Plan {
  id: string
  goal_id: string
  name: string
  status: Planstatus
  /** G-644 Teil 2: `goal_programs.ausgangspunkt_name` ("Einfacher Plan · aus Goals", "Contest Prep 16 Wochen"). */
  typ?: string | null
  ziel: { title: string; status: string | null; target_value: number | null; target_date: string | null; start_value?: number | null; current_value?: number | null } | null
  positionen: Planposition[]
  termine: Plantermin[]
}

/** G-649: eine Zeile aus `goals.goal_plan_templates` (Kette G-644). */
export interface Vorlage {
  code: string
  name: string
  quelle: 'lumeos' | 'eigen' | 'coach'
  anker_art: 'start' | 'A'
  positionen: Array<{ strategie_code?: string; unterphase?: string; dauer_wochen: number; eigene_werte?: Record<string, unknown>; phase_type?: string }>
}

/**
 * `null` heisst: die Tabelle ist noch nicht eingespielt (G-644 nicht live) — dann
 * steht „Ausgangspunkt" als „kommt". **Nur dieser Fehler**; jeder andere wirft.
 */
export async function ladeVorlagen(): Promise<Vorlage[] | null> {
  const { data, error } = await createSessionClient().schema('goals').from('goal_plan_templates')
    .select('code, name, quelle, anker_art, positionen').order('created_at', { ascending: true })
  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return null
    throw new Error(`goal_plan_templates: ${error.message}`)
  }
  return (data ?? []) as Vorlage[]
}

const zahl = (v: unknown) => (v === null || v === undefined ? null : Number(v))
const text = (v: unknown) => (typeof v === 'string' && v !== '' ? v : null)

export async function ladePlaene(userId: string, stichtag: string, laufendePhasen: string[]): Promise<Plan[]> {
  const db = createSessionClient().schema('goals')
  const { data: plaene, error } = await db.from('goal_programs')
    .select('id, goal_id, name, status, ausgangspunkt_name').eq('user_id', userId).order('created_at', { ascending: true })
  if (error) throw new Error(`goal_programs: ${error.message}`)
  const ids = (plaene ?? []).map(p => p.id as string)
  if (ids.length === 0) return []
  const zielIds = (plaene ?? []).map(p => p.goal_id as string)
  const [pos, ter, ziele] = await Promise.all([
    db.from('goal_program_positions').select('*').in('program_id', ids).order('position', { ascending: true }),
    db.from('goal_program_events').select('id, program_id, name, kind, event_date').in('program_id', ids).order('event_date', { ascending: true }),
    db.from('user_goals').select('id, title, status, target_value, target_date, start_value, current_value').in('id', zielIds),
  ])
  for (const r of [pos, ter, ziele]) if (r.error) throw new Error(`Plan lesen: ${r.error.message}`)
  const phasenIds = ((pos.data ?? []) as Array<Record<string, unknown>>).map(p => text(p.goal_phase_id)).filter((x): x is string => !!x)
  const phasen = phasenIds.length
    ? await db.from('goal_phases').select('id, gueltig_ab, projected_end_date, actual_end_date, zielrate_pct_kg_woche, recommended_next, transition_reason').in('id', phasenIds)
    : { data: [], error: null }
  if (phasen.error) throw new Error(`goal_phases: ${phasen.error.message}`)
  // `[read]` **Die Rate einer gestarteten Position steht in ihrer Phase** — Positionen
  // aus dem Backfill (G-625) tragen sie nicht; ohne diesen Rueckgriff stuende der
  // Katalogwert (z. B. -0,75) statt der gespeicherten Rate (-0,4) da.
  const ende = new Map(((phasen.data ?? []) as Array<Record<string, unknown>>).map(p => [String(p.id), { gueltig_ab: text(p.gueltig_ab), projected_end_date: text(p.projected_end_date), actual_end_date: text(p.actual_end_date), zielrate: zahl(p.zielrate_pct_kg_woche), next: text(p.recommended_next), grund: text(p.transition_reason) }]))
  const laufend = new Set(laufendePhasen)

  return (plaene ?? []).map(p => {
    const z = ((ziele.data ?? []) as Array<Record<string, unknown>>).find(g => g.id === p.goal_id)
    return {
      id: p.id as string, goal_id: p.goal_id as string, name: String(p.name), status: p.status as Planstatus, typ: text(p.ausgangspunkt_name),
      ziel: z ? { title: String(z.title), status: text(z.status), target_value: zahl(z.target_value), target_date: text(z.target_date), start_value: zahl(z.start_value), current_value: zahl(z.current_value) } : null,
      positionen: ((pos.data ?? []) as Array<Record<string, unknown>>).filter(x => x.program_id === p.id).map(x => {
        const phaseId = text(x.goal_phase_id)
        return {
          id: String(x.id), position: Number(x.position), strategie_code: text(x.strategie_code),
          eigene_werte: x.eigene_werte && typeof x.eigene_werte === 'object' ? x.eigene_werte as Record<string, unknown> : null,
          richtung: x.richtung as Planposition['richtung'], phase_type: String(x.phase_type),
          duration_weeks: zahl(x.duration_weeks), gueltig_ab: text(x.gueltig_ab), projected_end_date: text(x.projected_end_date),
          goal_phase_id: phaseId, zielrate_pct_kg_woche: zahl(x.zielrate_pct_kg_woche) ?? (phaseId ? ende.get(phaseId)?.zielrate ?? null : null), sub_phase_code: text(x.sub_phase_code),
          confirmed_warnings: Array.isArray(x.confirmed_warnings) ? (x.confirmed_warnings as unknown[]).map(String) : [],
          zustand: positionszustand({ goal_phase_id: phaseId, gueltig_ab: text(x.gueltig_ab) }, phaseId ? ende.get(phaseId) ?? null : null, laufend, stichtag),
          woche: phaseId && ende.get(phaseId) ? wocheText(phasenLauf(ende.get(phaseId)!, stichtag)) : null,
          empfohlen: phaseId && ende.get(phaseId)?.next ? { next: ende.get(phaseId)!.next!, grund: ende.get(phaseId)!.grund } : null,
        }
      }),
      termine: ((ter.data ?? []) as Array<Record<string, unknown>>).filter(t => t.program_id === p.id)
        .map(t => ({ id: String(t.id), name: String(t.name), kind: t.kind as Terminart, event_date: String(t.event_date) })),
    }
  })
}
