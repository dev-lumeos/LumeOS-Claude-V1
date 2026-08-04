export type RequestedOrchestrationMode = 'auto' | 'codex_bootstrap' | 'spark1_orchestrated'

export type ActualOrchestrationMode = 'codex_bootstrap' | 'spark1_orchestrated' | 'not_run'

export type CodexRunRole = 'orchestrator' | 'worker' | 'reviewer' | 'fallback' | 'none'

export interface OrchestrationModeStatus {
  requested_orchestration_mode: RequestedOrchestrationMode
  actual_orchestration_mode: ActualOrchestrationMode
  spark1_orchestrator_used: boolean
  codex_role: CodexRunRole
  worker_assignment_result: string
  missing_integration_point: string
  reason: string
  blocks_dispatch: boolean
}

export const SPARK1_ORCHESTRATION_MISSING_INTEGRATION =
  'run-batch-operator does not yet implement a pre-dispatch orchestrator-agent handoff for worker assignment.'

export function parseRequestedOrchestrationMode(value: string | undefined): RequestedOrchestrationMode {
  if (value === undefined || value === '') return 'auto'
  if (value === 'auto' || value === 'codex_bootstrap' || value === 'spark1_orchestrated') return value
  throw new Error(`Invalid orchestration mode: ${value}`)
}

export function resolveOrchestrationMode(requested: RequestedOrchestrationMode): OrchestrationModeStatus {
  if (requested === 'spark1_orchestrated') {
    return {
      requested_orchestration_mode: requested,
      actual_orchestration_mode: 'not_run',
      spark1_orchestrator_used: false,
      codex_role: 'none',
      worker_assignment_result: 'pending Spark1 pre-dispatch handoff',
      missing_integration_point: '',
      reason: 'Spark1 orchestration was explicitly requested; the operator must run orchestrator-agent before worker dispatch.',
      blocks_dispatch: false,
    }
  }

  return {
    requested_orchestration_mode: requested,
    actual_orchestration_mode: 'codex_bootstrap',
    spark1_orchestrator_used: false,
    codex_role: 'orchestrator',
    worker_assignment_result: 'Codex bootstrap selects the existing workorder agent path.',
    missing_integration_point: '',
    reason: requested === 'auto'
      ? 'auto selected codex_bootstrap because no explicit Spark1 orchestration mode was requested.'
      : 'codex_bootstrap was explicitly requested.',
    blocks_dispatch: false,
  }
}

export function formatOrchestrationModeStatus(status: OrchestrationModeStatus): string[] {
  return [
    `requested_orchestration_mode: ${status.requested_orchestration_mode}`,
    `actual_orchestration_mode: ${status.actual_orchestration_mode}`,
    `spark1_orchestrator_used: ${status.spark1_orchestrator_used ? 'yes' : 'no'}`,
    `codex_role: ${status.codex_role}`,
    `worker_assignment_result: ${status.worker_assignment_result || '(none)'}`,
    `missing_integration_point: ${status.missing_integration_point || '(none)'}`,
    `orchestration_reason: ${status.reason}`,
  ]
}
