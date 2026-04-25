// services/scheduler-api/src/routing.ts
//
// Maps WO routing produced by services/wo-classifier (Port 9000) to the
// scheduler's internal NodeId namespace and to NODE_PROFILES.
//
// Naming note: classifier emits SparkTarget values ('spark_a', 'spark_b',
// 'spark_c', 'spark_d') with underscores. The scheduler/agent-core uses
// NodeId values ('spark-a', 'spark-b') with hyphens. This module is the
// single point of normalization between the two.

import { NODE_PROFILES } from '@lumeos/agent-core'
import type { SparkTarget, WorkOrder } from '@lumeos/wo-core'

export type NodeId = 'spark-a' | 'spark-b'

const SPARK_TO_NODE: Record<SparkTarget, NodeId> = {
  spark_a: 'spark-a',
  spark_b: 'spark-b',
  // Spark C/D not yet deployed — the classifier is supposed to have already
  // applied this fallback before we get here, but defend in depth anyway.
  spark_c: 'spark-b',
  spark_d: 'spark-b',
}

/** Map a SparkTarget from the classifier into a scheduler NodeId. */
export function sparkTargetToNodeId(target: SparkTarget): NodeId {
  return SPARK_TO_NODE[target] ?? 'spark-b'
}

/** Resolve the NodeId for a WO, preferring routing over legacy heuristics.
 *  Returns null if routing is absent — caller falls back to legacy logic. */
export function resolveNodeFromRouting(wo: WorkOrder): NodeId | null {
  const target = wo.routing?.assigned_spark
  if (!target) return null
  return sparkTargetToNodeId(target)
}

/** Resolve the vLLM endpoint URL for a routed WO. Mirrors the helper described
 *  in docs/prompts/opus_pipeline_gaps.md but uses the correct hyphenated keys. */
export function getSparkEndpoint(wo: WorkOrder): string {
  const node = resolveNodeFromRouting(wo) ?? 'spark-b'
  const profile = NODE_PROFILES[node]
  if (!profile) {
    console.warn(`[routing] Unknown node ${node} for ${wo.wo_id}, falling back to spark-b`)
    return NODE_PROFILES['spark-b'].endpoint
  }
  return profile.endpoint
}
