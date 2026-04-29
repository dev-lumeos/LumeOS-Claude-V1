// system/control-plane/__tests__/review-pipeline.live-smoke.ts
//
// Live-Smoke-Test gegen ECHTE Spark 3 + Spark 4 Endpoints.
// Manuell zu starten — NICHT in CI.
//
// Voraussetzungen:
//   - Spark 3 (Gemma 4) läuft auf 192.168.0.99:8001
//   - Spark 4 (GPT-OSS) läuft auf 192.168.0.101:8001
//   - Beide via Healthcheck erreichbar
//
// Run:
//   cd D:\GitHub\LumeOS-Claude-V1
//   npx tsx system/control-plane/__tests__/review-pipeline.live-smoke.ts
//
// Optional ENV:
//   SPARK_C_ENDPOINT=http://192.168.0.99:8001  (default)
//   SPARK_D_ENDPOINT=http://192.168.0.101:8001 (default)
//   SPARK_C_MODEL=google/gemma-4-26B-A4B-it    (default)
//   SPARK_D_MODEL=openai/gpt-oss-120b          (default)

import {
  runReviewPipeline,
  type PipelineWorkerResult,
  type PipelineWorkorder,
} from '../review-pipeline'
import {
  createFileAuditWriter,
  createMemoryAuditWriter,
  type PipelineAuditEvent,
} from '../pipeline-audit'
import { extractContentOnly } from '../../../services/scheduler-api/src/vllm-adapter'

const SPARK_C_ENDPOINT = process.env.SPARK_C_ENDPOINT ?? 'http://192.168.0.99:8001'
const SPARK_C_MODEL    = process.env.SPARK_C_MODEL    ?? 'google/gemma-4-26B-A4B-it'

// ─── Real Spark 3 (Gemma 4) caller ────────────────────────────────────────────

async function callSpark3(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 800,
): Promise<string> {
  const response = await fetch(`${SPARK_C_ENDPOINT}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: SPARK_C_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.0,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    throw new Error(`Spark 3 API Error: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as any
  return extractContentOnly(json)
}

// ─── Healthcheck ──────────────────────────────────────────────────────────────

async function ping(label: string, endpoint: string): Promise<boolean> {
  try {
    const res = await fetch(`${endpoint}/v1/models`, { method: 'GET' })
    if (!res.ok) {
      console.log(`  ✗ ${label} (${endpoint}) — HTTP ${res.status}`)
      return false
    }
    const data = await res.json() as any
    const modelId = data?.data?.[0]?.id ?? '<unknown>'
    console.log(`  ✓ ${label} (${endpoint}) — ${modelId}`)
    return true
  } catch (err) {
    console.log(`  ✗ ${label} (${endpoint}) — ${(err as Error).message}`)
    return false
  }
}

// ─── Test Scenarios ───────────────────────────────────────────────────────────

const SCENARIO_STANDARD: { wo: PipelineWorkorder; result: PipelineWorkerResult } = {
  wo: {
    wo_id: 'WO-live-001',
    category: 'standard',
    task: 'Validate this small TypeScript helper function',
    changed_files: ['src/utils/add.ts'],
    files_allowed: ['src/utils/add.ts'],
  },
  result: {
    wo_id: 'WO-live-001',
    output: 'export function add(a: number, b: number): number { return a + b }',
  },
}

const SCENARIO_HIGH_RISK: { wo: PipelineWorkorder; result: PipelineWorkerResult } = {
  wo: {
    wo_id: 'WO-live-002',
    category: 'migration',
    task: 'Validate this migration that adds an email column to users',
    changed_files: ['supabase/migrations/0042_users_email.sql'],
    files_allowed: ['supabase/migrations/0042_users_email.sql'],
  },
  result: {
    wo_id: 'WO-live-002',
    output: 'ALTER TABLE users ADD COLUMN email text;',
  },
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function runScenario(
  label: string,
  data: { wo: PipelineWorkorder; result: PipelineWorkerResult },
): Promise<void> {
  console.log(`\n[Scenario] ${label}`)
  console.log(`  WO: ${data.wo.wo_id} (${data.wo.category})`)

  const events: PipelineAuditEvent[] = []
  const memAudit = createMemoryAuditWriter(events)
  const fileAudit = createFileAuditWriter(`system/state/pipeline-audit-live.jsonl`)

  // Multiplex audit: in-memory + file
  const multiplexAudit = (e: PipelineAuditEvent) => {
    memAudit(e)
    fileAudit(e)
  }

  const startTime = Date.now()
  const result = await runReviewPipeline(data.result, data.wo, {
    callFastReviewer: callSpark3,
    audit: multiplexAudit,
  })
  const duration = Date.now() - startTime

  console.log(`  → ${result.kind} (${duration}ms)`)
  if (result.kind === 'done') {
    console.log(`    finalTier: ${result.finalTier}`)
    console.log(`    status: ${result.review.status}, risk: ${result.review.risk}, confidence: ${result.review.confidence}`)
    if (result.review.summary) console.log(`    summary: ${result.review.summary}`)
  } else if (result.kind === 'human_needed') {
    console.log(`    lastTier: ${result.lastTier}`)
    console.log(`    reason: ${result.reason}`)
  } else if (result.kind === 'rewrite') {
    console.log(`    tier: ${result.tier}`)
    console.log(`    reason: ${result.reason}`)
  }

  console.log(`  Audit events: ${events.length}`)
  for (const e of events) {
    const fields = [
      `tier=${e.tier}`,
      e.status ? `status=${e.status}` : null,
      e.confidence !== undefined ? `conf=${e.confidence}` : null,
      e.reason ? `reason=${e.reason}` : null,
    ].filter(Boolean).join(' ')
    console.log(`    [${e.event}] ${fields}`)
  }
}

async function main() {
  console.log('══════════════════════════════════════════════')
  console.log('Review-Pipeline Live Smoke Test')
  console.log('══════════════════════════════════════════════')

  console.log('\nHealthchecks:')
  const sparkD = process.env.SPARK_D_ENDPOINT ?? 'http://192.168.0.101:8001'
  const okC = await ping('Spark 3 (Gemma 4)', SPARK_C_ENDPOINT)
  const okD = await ping('Spark 4 (GPT-OSS)', sparkD)

  if (!okC || !okD) {
    console.log('\n✗ Healthcheck failed — at least one Spark is unreachable.')
    console.log('  Aborting live smoke test.')
    process.exit(1)
  }

  await runScenario('STANDARD WO (Spark 3 first, Spark 4 if escalated)', SCENARIO_STANDARD)
  await runScenario('HIGH-RISK WO (migration → Spark 4 mandatory)',      SCENARIO_HIGH_RISK)

  console.log('\n══════════════════════════════════════════════')
  console.log('Live smoke complete.')
  console.log('Audit log: system/state/pipeline-audit-live.jsonl')
  console.log('══════════════════════════════════════════════')
}

main().catch(err => {
  console.error('Live smoke crashed:', err)
  process.exit(1)
})
