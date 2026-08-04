// services/scheduler-api/src/wo-adapter.ts
//
// Bridge wo-core's WorkOrder shape into the Dispatcher's Workorder shape.
//
// Shape differences worth noting:
//   - wo-core.task is string[]; Dispatcher.task is a single string → joined.
//   - Dispatcher distinguishes scope_files / context_files / acceptance_files;
//     wo-core only carries scope_files + the optional classifier files_allowed.
//   - Priority lives on `wo.routing.priority` (WOPriority = 0|1|2|3) when the
//     classifier ran, with a top-level `wo.wo_priority` mirror after the
//     bridge migration. We prefer routing, fall back to top-level.
//   - Risk is only persisted on the top-level `wo.wo_risk` (added by the
//     bridge migration); WORouting itself has no risk field.

import type { WorkOrder as WOCoreWorkOrder, WOPriority } from '@lumeos/wo-core'
import type { Workorder as DispatcherWorkorder } from '../../../system/control-plane/dispatcher'

const DEFAULT_NEGATIVE_CONSTRAINTS = [
  'NIEMALS Dateien außerhalb scope_files ändern',
  'NIEMALS ENV-Dateien lesen oder schreiben',
  'NIEMALS Migrations ohne Human Approval',
] as const

export function toDispatcherWorkorder(wo: WOCoreWorkOrder): DispatcherWorkorder {
  const priority = wo.routing?.priority ?? wo.wo_priority

  return {
    workorder_id:         wo.wo_id,
    agent_id:             wo.agent_type,
    task:                 Array.isArray(wo.task) ? wo.task.join('\n') : String(wo.task),
    scope_files:          wo.scope_files ?? [],
    context_files:        wo.files_allowed ?? [],
    acceptance_files:     wo.acceptance?.auto_checks ?? [],
    acceptance_criteria:  wo.acceptance?.auto_checks ?? [],
    negative_constraints: [...DEFAULT_NEGATIVE_CONSTRAINTS],
    required_skills:      [],
    optional_skills:      [],
    blocked_by:           wo.dependencies?.blocked_by ?? [],
    phase:                wo.dependencies?.phase,
    requires_approval:    wo.routing?.needs_db_check ?? false,
    quality_critical:     wo.wo_risk === 'high',
    priority:             mapPriority(priority),
    correlation_id:       wo.wo_id,
  }
}

function mapPriority(woPriority?: WOPriority): 'low' | 'normal' | 'high' | 'critical' {
  switch (woPriority) {
    case 0:  return 'critical'
    case 1:  return 'high'
    case 3:  return 'low'
    default: return 'normal'
  }
}
