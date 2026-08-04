// packages/wo-core/src/classifier-bridge.ts
//
// Bridge between WO-Classifier output (services/wo-classifier on port 9000) and
// the persistent WorkOrder shape used by the scheduler / Supabase. Used by
// services that need to persist a classified WO or compose it with downstream
// scheduler state.

import type { WOClassifierOutput } from './classifier'
import type { WorkOrder } from './schema'

/**
 * Project a WOClassifierOutput onto the WorkOrder shape.
 *
 * - `wo_type` is heuristically derived: low complexity -> 'micro', otherwise
 *   'macro'. Callers may override via `existingWO`.
 * - `agent_type` defaults to `routing.assigned_spark` so the legacy
 *   `getTargetNode(agent_type)` fallback in the dispatch loop still resolves
 *   correctly when no `routing` block is present (e.g. older clients).
 * - `state` defaults to `'ready'` because the classifier is the entry gate
 *   for the queue; pre-existing state on `existingWO` wins if provided.
 */
export function classifierOutputToWorkOrder(
  classified: WOClassifierOutput,
  existingWO?: Partial<WorkOrder>
): Partial<WorkOrder> {
  const woType: WorkOrder['wo_type'] = classified.complexity === 'low' ? 'micro' : 'macro'

  const projected: Partial<WorkOrder> = {
    wo_id: classified.id,
    wo_type: woType,
    agent_type: classified.routing.assigned_spark,
    scope_files: classified.files_allowed,
    task: [classified.title],
    acceptance: {
      auto_checks: classified.acceptance_criteria,
      review_checks: [],
      human_checks: [],
    },
    state: 'ready',
    routing: classified.routing,

    // Classifier-extension columns added by migration 20260424_002.
    wo_category: classified.type,
    wo_module: classified.module,
    wo_complexity: classified.complexity,
    wo_risk: classified.risk,
    db_access: classified.db_access,
    files_allowed: classified.files_allowed,
    files_blocked: classified.files_blocked ?? [],
    assigned_spark: classified.routing.assigned_spark,
    routing_reason: classified.routing.routing_reason,
    needs_db_check: classified.routing.needs_db_check,
    requires_schema_change: classified.requires_schema_change,
    wo_priority: classified.routing.priority,
  }

  // existingWO wins (caller-provided values override defaults).
  return { ...projected, ...existingWO }
}
