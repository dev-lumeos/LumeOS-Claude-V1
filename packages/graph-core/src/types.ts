// Graph Core Types V1
// packages/graph-core/src/types.ts

export type GraphRelation = 'blocked_by' | 'conflicts_with' | 'enables'

export type GraphNodeState =
  | 'pending'
  | 'ready'
  | 'blocked'
  | 'running'
  | 'done'
  | 'failed'
  | 'cancelled'

export interface GraphNode {
  wo_id: string
  state: GraphNodeState
  phase: 1 | 2 | 3
  blocked_by: string[]
  conflicts_with: string[]
}

export interface GraphEdge {
  from: string
  to: string
  relation: GraphRelation
}

export interface WOGraph {
  batch_id: string
  feature_id: string
  nodes: Record<string, GraphNode>
  edges: GraphEdge[]
  created_at: string
}

export type CycleDetectionResult =
  | { hasCycle: false }
  | { hasCycle: true; cycle: string[] }

export type GraphValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}
