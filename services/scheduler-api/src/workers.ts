// Scheduler — Worker Pool
// services/scheduler-api/src/workers.ts
// Manages connections to Spark A/B vLLM endpoints

import {
  VLLMClient,
  createSparkAClient,
  createSparkBClient,
  generateWithVerification,
  TripleHashMismatchError
} from '@lumeos/vllm-client'
import type { WorkOrder } from '@lumeos/wo-core'
import { getServiceClient } from '@lumeos/supabase-clients'

export type NodeId = 'spark-a' | 'spark-b'

export interface WorkerResult {
  success: boolean
  wo_id: string
  node: NodeId
  output?: string
  error?: string
  duration_ms: number
  deterministic?: boolean
}

// Worker clients
const workers: Record<NodeId, VLLMClient> = {
  'spark-a': createSparkAClient(),
  'spark-b': createSparkBClient()
}

/**
 * Execute a Work Order on the specified node.
 */
export async function executeWorkOrder(
  wo: WorkOrder,
  node: NodeId
): Promise<WorkerResult> {
  const startTime = Date.now()
  const client = workers[node]

  if (!client) {
    return {
      success: false,
      wo_id: wo.wo_id,
      node,
      error: `Unknown node: ${node}`,
      duration_ms: Date.now() - startTime
    }
  }

  try {
    // Build prompt from WO task
    const systemPrompt = buildSystemPrompt(wo)
    const userPrompt = buildUserPrompt(wo)

    // For Spark B (execution): use triple_hash verification
    if (node === 'spark-b') {
      const output = await generateWithVerification(client, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ])

      // Log success to Supabase
      await logExecution(wo, node, 'success', Date.now() - startTime)

      return {
        success: true,
        wo_id: wo.wo_id,
        node,
        output,
        duration_ms: Date.now() - startTime,
        deterministic: true
      }
    }

    // For Spark A (governance): no triple_hash required
    const response = await client.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    const output = response.choices[0]?.message?.content ?? ''

    await logExecution(wo, node, 'success', Date.now() - startTime)

    return {
      success: true,
      wo_id: wo.wo_id,
      node,
      output,
      duration_ms: Date.now() - startTime
    }

  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    const deterministic = !(err instanceof TripleHashMismatchError)

    await logExecution(wo, node, 'failure', Date.now() - startTime, error)

    return {
      success: false,
      wo_id: wo.wo_id,
      node,
      error,
      duration_ms: Date.now() - startTime,
      deterministic
    }
  }
}

/**
 * Check health of all worker nodes.
 */
export async function checkWorkerHealth(): Promise<Record<NodeId, boolean>> {
  const results: Record<NodeId, boolean> = {
    'spark-a': false,
    'spark-b': false
  }

  await Promise.all(
    Object.entries(workers).map(async ([node, client]) => {
      results[node as NodeId] = await client.health()
    })
  )

  return results
}

/**
 * Build system prompt for WO execution.
 */
function buildSystemPrompt(wo: WorkOrder): string {
  return `You are a code generation agent executing Work Order ${wo.wo_id}.
Agent type: ${wo.agent_type}
Scope files: ${wo.scope_files.join(', ')}

Rules:
- Only modify files in scope_files
- Follow GSD v2: minimal diff, no scope explosion
- No breaking changes without explicit task
- Output valid TypeScript code only`
}

/**
 * Build user prompt from WO task.
 */
function buildUserPrompt(wo: WorkOrder): string {
  const tasks = wo.task.map((t, i) => `${i + 1}. ${t}`).join('\n')
  return `Execute the following tasks:\n\n${tasks}\n\nGenerate the code changes needed.`
}

/**
 * Log execution to Supabase for monitoring.
 */
async function logExecution(
  wo: WorkOrder,
  node: NodeId,
  status: 'success' | 'failure',
  durationMs: number,
  error?: string
): Promise<void> {
  try {
    const supabase = getServiceClient()

    if (status === 'failure' && wo.failure_class) {
      await supabase.from('wo_failure_events').insert({
        wo_id: wo.wo_id,
        batch_id: wo.wo_id.split('-').slice(0, -1).join('-'),
        failure_class: wo.failure_class,
        attempt_number: wo.retry_context?.attempt_number ?? 1,
        node,
        agent_type: wo.agent_type,
        error_message: error
      })
    }
  } catch (err) {
    console.error('[Workers] Failed to log execution:', err)
  }
}
