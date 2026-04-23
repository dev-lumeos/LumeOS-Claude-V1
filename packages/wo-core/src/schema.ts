// WO Schema V1
// packages/wo-core/src/schema.ts

import type { WOType, WOState, WOPhase, FailureClass, ModelTier } from './types'

export interface WODependencies {
  phase: WOPhase
  blocked_by: string[]
  conflicts_with: string[]
}

export interface WOAcceptance {
  auto_checks: string[]
  review_checks: string[]
  human_checks: string[]
}

export interface RetryContext {
  attempt_number: number
  reason: FailureClass
  node_override: boolean
  previous_node?: string
  next_node?: string
  model_tier_override: boolean
  escalation_tier?: ModelTier
  extended_context: boolean
  stricter_scope_mode: boolean
}

export interface RetryPolicy {
  max_attempts: 3
  human_review_after: 'attempts_exhausted'
}

export interface WorkOrder {
  wo_id: string
  wo_type: WOType
  agent_type: string
  scope_files: string[]          // max 3 for micro
  task: string[]                 // 1-5 items
  acceptance: WOAcceptance
  dependencies: WODependencies
  retry_policy: RetryPolicy
  retry_context?: RetryContext
  source_subtask_id: string
  state: WOState
  failure_class?: FailureClass
  created_at: string
  updated_at: string
}

export interface WOBatch {
  batch_id: string
  feature_id: string
  generated_at: string
  wo_count: number
  workorders: WorkOrder[]
  validation_report: {
    errors: string[]
    warnings: string[]
    status: 'valid' | 'invalid' | 'valid_with_warnings'
  }
}
