// WO Core Types V1
// packages/wo-core/src/types.ts

export type WOType = 'micro' | 'macro'

export type WOState =
  | 'wo_generated'
  | 'graph_validated'
  | 'queue_released'
  | 'blocked'
  | 'ready'
  | 'dispatched'
  | 'running'
  | 'done'
  | 'failed'
  | 'reviewed'
  | 'retry_scheduled'
  | 'closed'
  | 'cancelled'
  | 'graph_repair_pending'

export type FailureClass =
  | 'technical_transient'
  | 'technical_persistent'
  | 'semantic_output'
  | 'scope_violation'
  | 'dependency_invalid'
  | 'guardrail_violation'

export type WOPhase = 1 | 2 | 3

export type ModelTier =
  | 'fp4_light'
  | 'fp8_bulk'
  | 'quality'
  | 'review'
  | 'macro_executor'
  | 'escalation_1'
  | 'escalation_2'
  | 'escalation_3'
  | 'escalation_4'
  | 'escalation_5'
