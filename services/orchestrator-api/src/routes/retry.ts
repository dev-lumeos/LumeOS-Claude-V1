// Retry Routes
// services/orchestrator-api/src/routes/retry.ts

import { Hono } from 'hono'
import type { FailureClass } from '@lumeos/wo-core'

export const retryRoutes = new Hono()

type RetryDecisionInput = {
  wo_id: string
  attempt_number: number
  failure_class: FailureClass
  previous_node: string
}

// POST /retry/decide — decide retry strategy
retryRoutes.post('/decide', async (c) => {
  const input = await c.req.json<RetryDecisionInput>()
  const { failure_class, attempt_number } = input

  // dependency_invalid → graph repair, never retry
  if (failure_class === 'dependency_invalid') {
    return c.json({ action: 'graph_repair_pending', wo_id: input.wo_id })
  }

  // guardrail_violation → immediate human review
  if (failure_class === 'guardrail_violation') {
    return c.json({ action: 'reviewed', wo_id: input.wo_id })
  }

  // max attempts exhausted → human review
  if (attempt_number >= 3) {
    return c.json({ action: 'reviewed', wo_id: input.wo_id })
  }

  // technical_persistent → node override
  if (failure_class === 'technical_persistent') {
    return c.json({
      action: 'retry_scheduled',
      wo_id: input.wo_id,
      retry_context: {
        attempt_number: attempt_number + 1,
        reason: failure_class,
        node_override: true,
        previous_node: input.previous_node,
        next_node: input.previous_node === 'spark-a' ? 'spark-b' : 'spark-a',
        model_tier_override: false
      }
    })
  }

  // default: retry with extended context
  return c.json({
    action: 'retry_scheduled',
    wo_id: input.wo_id,
    retry_context: {
      attempt_number: attempt_number + 1,
      reason: failure_class,
      node_override: false,
      model_tier_override: attempt_number >= 2,
      extended_context: true
    }
  })
})
