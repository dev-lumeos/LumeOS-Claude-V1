// Scheduler Core — Priority Queue
// packages/scheduler-core/src/priority.ts

import type { WorkOrder } from '@lumeos/wo-core'
import { getAgentById } from '@lumeos/agent-core'

/**
 * Priority order:
 * 1. Phase ascending (1 → 2 → 3)
 * 2. Model Tier (fp4_light > fp8_bulk > quality > review)
 * 3. Retry attempt (lower = higher priority)
 * 4. FIFO (created_at ascending)
 */

const TIER_PRIORITY: Record<string, number> = {
  fp4_light: 0,
  fp8_bulk: 1,
  quality: 2,
  review: 3,
  macro_executor: 4
}

function getModelTier(agentType: string): string {
  const agent = getAgentById(agentType)
  return agent?.default_model_tier ?? 'quality'
}

export function sortByPriority(wos: WorkOrder[]): WorkOrder[] {
  return [...wos].sort((a, b) => {
    // Phase
    const phaseDiff = a.dependencies.phase - b.dependencies.phase
    if (phaseDiff !== 0) return phaseDiff

    // Model Tier (resolved from agent_type)
    const tierA = TIER_PRIORITY[getModelTier(a.agent_type)] ?? 99
    const tierB = TIER_PRIORITY[getModelTier(b.agent_type)] ?? 99
    if (tierA !== tierB) return tierA - tierB

    // Retry attempt
    const retryA = a.retry_context?.attempt_number ?? 1
    const retryB = b.retry_context?.attempt_number ?? 1
    if (retryA !== retryB) return retryA - retryB

    // FIFO
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}
