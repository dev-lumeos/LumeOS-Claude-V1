// services/scheduler-api/src/routing.ts
//
// Maps WO routing (from wo-classifier) to scheduler NodeId and NODE_PROFILES.
// Single normalization point: classifier uses underscores (spark_a),
// scheduler uses hyphens (spark-a).

import { NODE_PROFILES } from '@lumeos/agent-core'
import type { SparkTarget, WorkOrder } from '@lumeos/wo-core'

export type NodeId = 'spark-a' | 'spark-b' | 'nemotron'

const SPARK_TO_NODE: Record<SparkTarget, NodeId> = {
  spark_a: 'spark-a',
  spark_b: 'spark-b',
  // Phase 2 targets — Spark C/D fall back to spark-b until deployed
  spark_c: 'spark-b',
  spark_d: 'spark-b',
}

/** Map a SparkTarget from the classifier into a scheduler NodeId. */
export function sparkTargetToNodeId(target: SparkTarget): NodeId {
  return SPARK_TO_NODE[target] ?? 'spark-b'
}

/** Resolve the NodeId for a WO from its routing metadata.
 *  Returns null if routing is absent — caller falls back to legacy logic. */
export function resolveNodeFromRouting(wo: WorkOrder): NodeId | null {
  const target = wo.routing?.assigned_spark
  if (!target) return null
  return sparkTargetToNodeId(target)
}

/** Resolve the vLLM endpoint URL for a given NodeId. */
export function getEndpointForNode(node: NodeId): string {
  const profile = NODE_PROFILES[node]
  if (!profile) {
    console.warn(`[routing] Unknown node "${node}", falling back to spark-b`)
    return NODE_PROFILES['spark-b'].endpoint
  }
  return profile.endpoint
}

/** Resolve the vLLM endpoint for a routed WO. */
export function getSparkEndpoint(wo: WorkOrder): string {
  const node = resolveNodeFromRouting(wo) ?? 'spark-b'
  return getEndpointForNode(node)
}
