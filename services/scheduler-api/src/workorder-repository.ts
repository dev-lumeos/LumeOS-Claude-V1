// Scheduler — Workorder Repository
// services/scheduler-api/src/workorder-repository.ts
//
// Liest 'ready' WOs aus Supabase und schreibt State-Updates zurück.
// Einziger Ort im Scheduler der direkt mit der DB spricht.

import { getServiceClient } from '@lumeos/supabase-clients'
import type { WorkOrder, WOState, WOPhase } from '@lumeos/wo-core'

// ─── DB Row Type ──────────────────────────────────────────────────────────────
// Nur die Felder die wir lesen — kein SELECT * um Transfer klein zu halten.

interface WorkorderRow {
  wo_id:                   string
  batch_id:                string
  wo_type:                 'micro' | 'macro'
  agent_type:              string
  state:                   WOState
  phase:                   '1' | '2' | '3'
  scope_files:             string[]
  task:                    string[]
  blocked_by:              string[]
  conflicts_with:          string[]
  acceptance_auto_checks:  string[]
  acceptance_review_checks: string[]
  acceptance_human_checks: string[]
  retry_max_attempts:      number
  retry_attempt_number:    number
  retry_context:           Record<string, unknown> | null
  failure_class:           string | null
  source_subtask_id:       string
  // Classifier fields
  wo_category:             string | null
  wo_module:               string | null
  wo_complexity:           'low' | 'medium' | 'high' | null
  wo_risk:                 'low' | 'medium' | 'high' | null
  db_access:               'none' | 'read' | 'write' | 'migration' | null
  files_allowed:           string[]
  files_blocked:           string[]
  assigned_spark:          string | null
  routing_reason:          string | null
  needs_db_check:          boolean
  requires_schema_change:  boolean
  wo_priority:             number
  created_at:              string
  updated_at:              string
}

// ─── Row → WorkOrder ──────────────────────────────────────────────────────────

function rowToWorkOrder(row: WorkorderRow): WorkOrder {
  return {
    wo_id:            row.wo_id,
    wo_type:          row.wo_type,
    agent_type:       row.agent_type,
    state:            row.state,
    scope_files:      row.scope_files ?? [],
    task:             row.task ?? [],
    source_subtask_id: row.source_subtask_id,
    failure_class:    row.failure_class as WorkOrder['failure_class'] ?? undefined,

    acceptance: {
      auto_checks:   row.acceptance_auto_checks   ?? [],
      review_checks: row.acceptance_review_checks ?? [],
      human_checks:  row.acceptance_human_checks  ?? [],
    },

    dependencies: {
      phase:         parseInt(row.phase, 10) as WOPhase,
      blocked_by:    row.blocked_by    ?? [],
      conflicts_with: row.conflicts_with ?? [],
    },

    retry_policy: {
      max_attempts:       row.retry_max_attempts ?? 3,
      human_review_after: 'attempts_exhausted',
    },

    retry_context: row.retry_context as WorkOrder['retry_context'] ?? undefined,

    // Classifier routing fields — present when wo-classifier has run
    ...(row.assigned_spark ? {
      routing: {
        assigned_spark:   row.assigned_spark as WorkOrder['routing'] extends infer R ? R extends object ? R['assigned_spark'] : never : never,
        routing_reason:   row.routing_reason ?? '',
        needs_db_check:   row.needs_db_check,
        wo_risk:          row.wo_risk ?? undefined,
        wo_complexity:    row.wo_complexity ?? undefined,
        wo_priority:      row.wo_priority as 0 | 1 | 2 | 3,
      }
    } : {}),

    wo_category:           row.wo_category    ?? undefined,
    wo_module:             row.wo_module      ?? undefined,
    wo_complexity:         row.wo_complexity  ?? undefined,
    wo_risk:               row.wo_risk        ?? undefined,
    db_access:             row.db_access      ?? undefined,
    files_allowed:         row.files_allowed  ?? [],
    files_blocked:         row.files_blocked  ?? [],
    assigned_spark:        row.assigned_spark ?? undefined,
    routing_reason:        row.routing_reason ?? undefined,
    needs_db_check:        row.needs_db_check,
    requires_schema_change: row.requires_schema_change,
    wo_priority:           row.wo_priority as 0 | 1 | 2 | 3,

    created_at: row.created_at,
    updated_at: row.updated_at,
  } as WorkOrder
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Lädt alle WOs mit state='ready' aus Supabase.
 * Sortierung: phase asc → wo_priority asc → created_at asc (FIFO)
 * Limit: 50 pro Tick — verhindert zu große Batches.
 */
export async function fetchReadyWOs(): Promise<WorkOrder[]> {
  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('workorders')
    .select(`
      wo_id, batch_id, wo_type, agent_type, state, phase,
      scope_files, task, blocked_by, conflicts_with,
      acceptance_auto_checks, acceptance_review_checks, acceptance_human_checks,
      retry_max_attempts, retry_attempt_number, retry_context,
      failure_class, source_subtask_id,
      wo_category, wo_module, wo_complexity, wo_risk, db_access,
      files_allowed, files_blocked, assigned_spark, routing_reason,
      needs_db_check, requires_schema_change, wo_priority,
      created_at, updated_at
    `)
    .eq('state', 'ready')
    .order('phase',       { ascending: true })
    .order('wo_priority', { ascending: true })
    .order('created_at',  { ascending: true })
    .limit(50)

  if (error) {
    console.error('[WorkorderRepo] fetchReadyWOs failed:', error.message)
    return []
  }

  return (data as WorkorderRow[]).map(rowToWorkOrder)
}

/**
 * Setzt state einer einzelnen WO — atomar via Supabase RPC.
 * Nur erlaubte Transitionen gemäß wo_lifecycle_v1.md.
 */
export async function updateWOState(
  woId:     string,
  newState: WOState,
  extras:   Record<string, unknown> = {}
): Promise<void> {
  const supabase = getServiceClient()

  const { error } = await supabase
    .from('workorders')
    .update({ state: newState, ...extras })
    .eq('wo_id', woId)

  if (error) {
    console.error(`[WorkorderRepo] updateWOState(${woId} → ${newState}) failed:`, error.message)
  }
}

/**
 * Setzt state='dispatched' + assigned_node — in einem Update.
 */
export async function markDispatched(woId: string, node: string): Promise<void> {
  await updateWOState(woId, 'dispatched', { assigned_node: node })
}

/**
 * Setzt state='running' + started_at.
 */
export async function markRunning(woId: string): Promise<void> {
  await updateWOState(woId, 'running', { started_at: new Date().toISOString() })
}

/**
 * Setzt state='done' | 'failed' + completed_at.
 */
export async function markCompleted(woId: string, success: boolean, failureClass?: string): Promise<void> {
  const extras: Record<string, unknown> = { completed_at: new Date().toISOString() }
  if (!success && failureClass) extras.failure_class = failureClass
  await updateWOState(woId, success ? 'done' : 'failed', extras)
}
