// Graph Core — Validation
// packages/graph-core/src/validate.ts

import type {
  WOGraph,
  CycleDetectionResult,
  GraphValidationResult
} from './types'

export function detectCycles(graph: WOGraph): CycleDetectionResult {
  const visited = new Set<string>()
  const stack = new Set<string>()

  function dfs(nodeId: string, path: string[]): string[] | null {
    if (stack.has(nodeId)) return [...path, nodeId]
    if (visited.has(nodeId)) return null

    visited.add(nodeId)
    stack.add(nodeId)

    const node = graph.nodes[nodeId]
    if (node) {
      for (const dep of node.blocked_by) {
        const cycle = dfs(dep, [...path, nodeId])
        if (cycle) return cycle
      }
    }

    stack.delete(nodeId)
    return null
  }

  for (const nodeId of Object.keys(graph.nodes)) {
    const cycle = dfs(nodeId, [])
    if (cycle) return { hasCycle: true, cycle }
  }

  return { hasCycle: false }
}

export function validateGraph(graph: WOGraph): GraphValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const nodeIds = new Set(Object.keys(graph.nodes))

  // Check all blocked_by references exist
  for (const [id, node] of Object.entries(graph.nodes)) {
    for (const dep of node.blocked_by) {
      if (!nodeIds.has(dep)) {
        errors.push(`WO ${id}: blocked_by references unknown WO ${dep}`)
      }
    }
    for (const conf of node.conflicts_with) {
      if (!nodeIds.has(conf)) {
        errors.push(`WO ${id}: conflicts_with references unknown WO ${conf}`)
      }
    }
  }

  // Check for cycles
  const cycleResult = detectCycles(graph)
  if (cycleResult.hasCycle) {
    errors.push(`Cycle detected: ${cycleResult.cycle.join(' → ')}`)
  }

  return { valid: errors.length === 0, errors, warnings }
}
