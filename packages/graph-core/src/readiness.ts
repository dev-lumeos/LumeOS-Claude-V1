// Graph Core — Readiness Calculator
// packages/graph-core/src/readiness.ts

import type { WOGraph, GraphNode } from './types'

export function computeReadyNodes(graph: WOGraph): string[] {
  const ready: string[] = []

  for (const [id, node] of Object.entries(graph.nodes)) {
    if (node.state !== 'blocked' && node.state !== 'pending') continue
    if (isReady(id, graph)) ready.push(id)
  }

  return ready
}

export function isReady(woId: string, graph: WOGraph): boolean {
  const node = graph.nodes[woId]
  if (!node) return false

  // All blocked_by must be done or closed
  for (const dep of node.blocked_by) {
    const depNode = graph.nodes[dep]
    if (!depNode) return false
    if (depNode.state !== 'done' && depNode.state !== 'cancelled') return false
  }

  // No active conflicts
  for (const conf of node.conflicts_with) {
    const confNode = graph.nodes[conf]
    if (!confNode) continue
    if (confNode.state === 'running' || confNode.state === 'pending') return false
  }

  return true
}
