// Agent Core Types V1
// packages/agent-core/src/types.ts

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

export type NodeId = 'spark-a' | 'spark-b' | 'openrouter' | 'external'

export type WOLayer =
  | 'types'
  | 'service'
  | 'ui'
  | 'tests'
  | 'docs'
  | 'config'
  | 'db'
  | 'meta'
  | 'infra'

export type FailureClassPolicy =
  | 'auto_retry'
  | 'retry_attempt2_then_escalate'
  | 'retry_stricter_scope'
  | 'immediate_review'
  | 'graph_repair'

export interface AgentProfile {
  agent_id: string
  role: string
  allowed_layers: WOLayer[]
  allowed_wo_types: string[]
  default_model_tier: ModelTier
  escalation_model_tier: ModelTier
  node: NodeId
  hard_limits: Record<string, boolean | number | string>
  allowed_retry_modes: string[]
  failure_class_policy: Record<string, FailureClassPolicy>
  scheduler_controlled: boolean
}

export interface NodeProfile {
  node_id: NodeId
  max_slots: number
  current_slots: number
  reserved_slots: number
  endpoint: string
  tiers: ModelTier[]
}
