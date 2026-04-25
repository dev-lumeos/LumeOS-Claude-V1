/**
 * tools/scripts/test-e2e-full-pipeline.ts
 *
 * Full WO Pipeline End-to-End Test (post-Pipeline-1/2)
 *
 *   1. Define a classifier-shaped WO
 *   2. POST /classify (Port 9000) → routing
 *   3. classifierOutputToWorkOrder() → WorkOrder partial
 *   4. POST /compile (Port 9003, Spark A) → GovernanceArtefaktV3
 *   5. POST /check (Port 9001) → SAT-Check
 *   6. createExecutionToken() → Ed25519 token, verify
 *   7. Supabase INSERT workorders + governance_artefacts
 *   8. vLLM call on assigned spark + triple_hash verification
 *   9. Supabase UPDATE state → done
 *
 * Usage:
 *   pnpm install
 *   # ensure all 4 services + Supabase are running
 *   WORKSPACE_ROOT=. \
 *   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   ED25519_PRIVATE_KEY=... ED25519_PUBLIC_KEY=... \
 *   npx tsx tools/scripts/test-e2e-full-pipeline.ts
 *
 *   --skip-execution   skip steps 7+8 (vLLM + triple_hash); keep steps 1-6 and a 'ready' final state.
 *
 * Exit codes:  0 = all steps passed  |  1 = at least one failure  |  2 = setup error.
 */

import * as crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createExecutionToken, verifyExecutionToken } from '@lumeos/execution-token'
import { VLLMClient } from '@lumeos/vllm-client'
import {
  classifierOutputToWorkOrder,
  type WOClassifierInput,
  type WOClassifierOutput,
  type WOClassifierReject,
  type GovernanceArtefaktV3,
} from '@lumeos/wo-core'

// ────────────────────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────────────────────

const SKIP_EXEC = process.argv.includes('--skip-execution')
const WO_ID = `WO-e2e-${Date.now()}`

const CFG = {
  classifier: process.env.WO_CLASSIFIER_URL ?? 'http://localhost:9000',
  satCheck: process.env.SAT_CHECK_URL ?? 'http://localhost:9001',
  scheduler: process.env.SCHEDULER_URL ?? 'http://localhost:9002',
  governance: process.env.GOVERNANCE_COMPILER_URL ?? 'http://localhost:9003',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321',
    key: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  spark: {
    a: process.env.SPARK_A_ENDPOINT ?? 'http://192.168.0.128:8001',
    b: process.env.SPARK_B_ENDPOINT ?? 'http://192.168.0.188:8001',
  },
  keys: {
    priv: process.env.ED25519_PRIVATE_KEY ?? '',
    pub: process.env.ED25519_PUBLIC_KEY ?? '',
  },
  workspaceRoot: process.env.WORKSPACE_ROOT ?? process.cwd(),
}

// ────────────────────────────────────────────────────────────────────────────
// Test WO (classifier-shaped, mirrors prompt example)
// ────────────────────────────────────────────────────────────────────────────

const TEST_WO: WOClassifierInput = {
  id: WO_ID,
  title: 'Add environment variable support to NODE_PROFILES',
  type: 'implementation',
  module: 'infra',
  complexity: 'low',
  risk: 'low',
  requires_reasoning: false,
  requires_schema_change: false,
  db_access: 'none',
  files_allowed: ['packages/agent-core/src/registry.ts'],
  acceptance_criteria: [
    'NODE_PROFILES nutzt process.env statt hardkodierter Strings',
    'TypeScript kompiliert ohne Fehler',
  ],
  created_by: 'human',
}

// Bridge classifier WO → governance compiler input shape.
function classifiedToMacroWO(c: WOClassifierOutput) {
  return {
    wo_id: c.id,
    task_description: [
      c.title,
      '',
      'Acceptance:',
      ...c.acceptance_criteria.map((a, i) => `  ${i + 1}. ${a}`),
    ].join('\n'),
    target_files: c.files_allowed,
    constraints: {
      // SAT-Check enforces budget <= 50% of target file size — keep tight.
      max_lines_per_file: 20,
      forbidden_imports: ['axios', 'node-fetch', 'got'],
      forbidden_patterns: ['eval', 'exec', 'Function\\('],
    },
    acceptance_criteria: c.acceptance_criteria,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

interface StepResult {
  step: number
  name: string
  pass: boolean
  detail: string
  elapsed_ms: number
}

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex')
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; elapsed_ms: number }> {
  const t = Date.now()
  const value = await fn()
  return { value, elapsed_ms: Date.now() - t }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url} :: ${text.slice(0, 300)}`)
  return JSON.parse(text) as T
}

// ────────────────────────────────────────────────────────────────────────────
// Setup probe
// ────────────────────────────────────────────────────────────────────────────

async function probeServices(): Promise<string[]> {
  const errors: string[] = []
  const checks: Array<[string, string]> = [
    ['classifier', `${CFG.classifier}/health`],
    ['sat-check', `${CFG.satCheck}/health`],
    ['scheduler', `${CFG.scheduler}/health`],
    ['governance-compiler', `${CFG.governance}/health`],
  ]
  for (const [name, url] of checks) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
      if (!res.ok) errors.push(`${name}: HTTP ${res.status} on ${url}`)
    } catch (err) {
      errors.push(`${name}: ${(err as Error).message} (${url})`)
    }
  }
  return errors
}

function checkConfigPrereqs(): string[] {
  const errors: string[] = []
  if (!CFG.supabase.key) errors.push('SUPABASE_SERVICE_ROLE_KEY not set')
  if (!CFG.keys.priv) errors.push('ED25519_PRIVATE_KEY not set')
  if (!CFG.keys.pub) errors.push('ED25519_PUBLIC_KEY not set')
  return errors
}

// ────────────────────────────────────────────────────────────────────────────
// Steps
// ────────────────────────────────────────────────────────────────────────────

let classified: WOClassifierOutput | null = null
let workOrderPartial: ReturnType<typeof classifierOutputToWorkOrder> | null = null
let artefakt: GovernanceArtefaktV3 | null = null
let satResult: { result: 'pass' | 'reject'; checks: Record<string, 'pass' | 'reject'> } | null = null
let token: string | null = null
let tripleHash: { pass: boolean; hashes: string[] } | null = null

async function step1_classify(): Promise<StepResult> {
  const { value, elapsed_ms } = await timed(async () => {
    const res = await postJson<WOClassifierOutput | WOClassifierReject>(
      `${CFG.classifier}/classify`,
      TEST_WO
    )
    if ('routing' in res && res.routing) return res
    throw new Error(`classifier rejected: ${(res as WOClassifierReject).reason}`)
  })
  classified = value
  return {
    step: 1,
    name: 'WO classified',
    pass: true,
    detail: `${value.routing.assigned_spark} (${value.routing.routing_reason})`,
    elapsed_ms,
  }
}

async function step2_bridge(): Promise<StepResult> {
  if (!classified) throw new Error('precondition: step 1 incomplete')
  const { value, elapsed_ms } = await timed(async () => classifierOutputToWorkOrder(classified!))
  workOrderPartial = value
  return {
    step: 2,
    name: 'WO mapped to WorkOrder schema',
    pass: true,
    detail: `wo_type=${value.wo_type} agent_type=${value.agent_type} state=${value.state}`,
    elapsed_ms,
  }
}

async function step3_compile(): Promise<StepResult> {
  if (!classified) throw new Error('precondition: step 1 incomplete')
  const macroWo = classifiedToMacroWO(classified)
  const { value, elapsed_ms } = await timed(async () => {
    return postJson<{ artefakt: GovernanceArtefaktV3; raw_output: string }>(
      `${CFG.governance}/compile`,
      { macro_wo: macroWo }
    )
  })
  artefakt = value.artefakt
  return {
    step: 3,
    name: 'Governance Artefakt compiled',
    pass: true,
    detail: `hash=${value.artefakt.meta.artefakt_hash.slice(0, 16)}... files=${value.artefakt.execution_context.target_files.length}`,
    elapsed_ms,
  }
}

async function step4_satCheck(): Promise<StepResult> {
  if (!artefakt) throw new Error('precondition: step 3 incomplete')
  const { value, elapsed_ms } = await timed(async () => {
    return postJson<{ result: 'pass' | 'reject'; checks: Record<string, 'pass' | 'reject'>; failure_code?: string; constraint_hint?: string }>(
      `${CFG.satCheck}/check`,
      { artefakt }
    )
  })
  satResult = value
  return {
    step: 4,
    name: 'SAT-Check',
    pass: value.result === 'pass',
    detail:
      value.result === 'pass'
        ? `pass — ${Object.entries(value.checks).map(([k, v]) => `${k}=${v}`).join(', ')}`
        : `reject — ${value.failure_code ?? 'unknown'}: ${value.constraint_hint ?? ''}`,
    elapsed_ms,
  }
}

async function step5_token(): Promise<StepResult> {
  if (!artefakt || !satResult) throw new Error('precondition: step 4 incomplete')
  const { value, elapsed_ms } = await timed(async () => {
    const t = await createExecutionToken(
      artefakt!,
      {
        type_availability: satResult!.checks.type_availability,
        scope_reachability: satResult!.checks.scope_reachability,
        constraint_satisfiability: satResult!.checks.constraint_satisfiability,
      },
      CFG.keys.priv
    )
    const verified = await verifyExecutionToken(t, CFG.keys.pub)
    if (!verified) throw new Error('token signature did not verify')
    return t
  })
  token = value
  return {
    step: 5,
    name: 'Execution Token (Ed25519)',
    pass: true,
    detail: `verified, token_id=${value.token_id.slice(0, 8)}... expires=${value.expires_at}`,
    elapsed_ms,
  }
}

async function step6_insertSupabase(): Promise<StepResult> {
  if (!classified || !workOrderPartial || !artefakt || !token) {
    throw new Error('precondition: prior steps incomplete')
  }
  const { elapsed_ms } = await timed(async () => {
    const supabase = createClient(CFG.supabase.url, CFG.supabase.key)

    // Re-run cleanup
    await supabase.from('workorders').delete().eq('wo_id', WO_ID)
    await supabase.from('governance_artefacts').delete().eq('wo_id', WO_ID)

    const { error: gaError } = await supabase.from('governance_artefacts').insert({
      wo_id: artefakt!.meta.wo_id,
      artefakt_hash: artefakt!.meta.artefakt_hash,
      source_macro: artefakt!.meta.source_macro,
      compiled_by: artefakt!.meta.compiled_by,
      compiled_at: artefakt!.meta.compiled_at,
      artefakt_json: artefakt,
    })
    if (gaError) throw new Error(`governance_artefacts insert: ${gaError.message}`)

    const { error: woError } = await supabase.from('workorders').insert({
      wo_id: WO_ID,
      batch_id: 'e2e-pipeline-test',
      wo_type: workOrderPartial!.wo_type ?? 'micro',
      agent_type: workOrderPartial!.agent_type ?? classified!.routing.assigned_spark,
      state: 'dispatched',
      phase: '1',
      scope_files: workOrderPartial!.scope_files ?? classified!.files_allowed,
      task: workOrderPartial!.task ?? [classified!.title],
      // Classifier-extension columns from migration 20260424_002:
      wo_category: workOrderPartial!.wo_category,
      wo_module: workOrderPartial!.wo_module,
      wo_complexity: workOrderPartial!.wo_complexity,
      wo_risk: workOrderPartial!.wo_risk,
      db_access: workOrderPartial!.db_access,
      files_allowed: workOrderPartial!.files_allowed,
      files_blocked: workOrderPartial!.files_blocked,
      assigned_spark: workOrderPartial!.assigned_spark,
      routing_reason: workOrderPartial!.routing_reason,
      needs_db_check: workOrderPartial!.needs_db_check,
      requires_schema_change: workOrderPartial!.requires_schema_change,
      wo_priority: workOrderPartial!.wo_priority,
      started_at: new Date().toISOString(),
    })
    if (woError) throw new Error(`workorders insert: ${woError.message}`)
  })
  return { step: 6, name: 'Supabase INSERT', pass: true, detail: `wo_id=${WO_ID}`, elapsed_ms }
}

async function step7_execute(): Promise<StepResult> {
  if (!classified || !artefakt) throw new Error('precondition: prior steps incomplete')
  if (SKIP_EXEC) {
    return { step: 7, name: 'Execution on assigned spark', pass: true, detail: 'SKIPPED (--skip-execution)', elapsed_ms: 0 }
  }

  const target = classified.routing.assigned_spark
  const endpoint = target === 'spark_a' ? CFG.spark.a : CFG.spark.b
  const model = target === 'spark_a' ? 'qwen3.6-35b-fp8' : 'qwen3-coder-30b'

  const { value, elapsed_ms } = await timed(async () => {
    const fs = await import('fs')
    const path = await import('path')
    const targetFile = artefakt!.execution_context.target_files[0].path
    const fullPath = path.resolve(CFG.workspaceRoot, targetFile)
    const currentContent = fs.readFileSync(fullPath, 'utf-8')

    const prompt = [
      'You are a deterministic code executor for LumeOS.',
      `Task: ${classified!.title}`,
      `Acceptance: ${classified!.acceptance_criteria.join(' | ')}`,
      '',
      `Target file: ${targetFile}`,
      'Current content:',
      currentContent,
      '',
      'Output ONLY the new file content inside a single ```typescript code block.',
    ].join('\n')

    const client = new VLLMClient(endpoint, model)
    const response = await client.complete(prompt, {
      temperature: artefakt!.determinism.temperature,
      seed: artefakt!.determinism.seed,
      top_p: artefakt!.determinism.top_p,
      top_k: artefakt!.determinism.top_k,
      max_tokens: 4096,
    })
    return response.choices[0]?.text ?? ''
  })

  return {
    step: 7,
    name: 'Execution on assigned spark',
    pass: value.length > 0,
    detail: `${target} via ${endpoint} :: ${value.length} chars`,
    elapsed_ms,
  }
}

async function step8_tripleHash(): Promise<StepResult> {
  if (!classified || !artefakt) throw new Error('precondition: prior steps incomplete')
  if (SKIP_EXEC) {
    return { step: 8, name: 'triple_hash verification', pass: true, detail: 'SKIPPED (--skip-execution)', elapsed_ms: 0 }
  }

  const target = classified.routing.assigned_spark
  const endpoint = target === 'spark_a' ? CFG.spark.a : CFG.spark.b
  const model = target === 'spark_a' ? 'qwen3.6-35b-fp8' : 'qwen3-coder-30b'

  const { value, elapsed_ms } = await timed(async () => {
    const fs = await import('fs')
    const path = await import('path')
    const targetFile = artefakt!.execution_context.target_files[0].path
    const fullPath = path.resolve(CFG.workspaceRoot, targetFile)
    const currentContent = fs.readFileSync(fullPath, 'utf-8')

    const prompt = [
      'You are a deterministic code executor for LumeOS.',
      `Task: ${classified!.title}`,
      'Output ONLY the new file content inside a single ```typescript code block.',
      '',
      currentContent,
    ].join('\n')

    const client = new VLLMClient(endpoint, model)
    const hashes: string[] = []
    for (let i = 0; i < 3; i++) {
      const response = await client.complete(prompt, {
        temperature: 0.0,
        seed: 42,
        top_p: 1.0,
        top_k: 1,
        max_tokens: 4096,
      })
      hashes.push(sha256(response.choices[0]?.text ?? ''))
    }
    const allMatch = hashes.every((h) => h === hashes[0])
    return { pass: allMatch, hashes }
  })

  tripleHash = value
  return {
    step: 8,
    name: 'triple_hash verification',
    pass: value.pass,
    detail: value.pass
      ? `pass (${value.hashes[0].slice(0, 16)}...)`
      : `MISMATCH: ${value.hashes.map((h) => h.slice(0, 12)).join(', ')}`,
    elapsed_ms,
  }
}

async function step9_finalize(): Promise<StepResult> {
  const { elapsed_ms } = await timed(async () => {
    const supabase = createClient(CFG.supabase.url, CFG.supabase.key)
    const finalState = SKIP_EXEC ? 'ready' : tripleHash?.pass ? 'done' : 'failed'
    const { error } = await supabase
      .from('workorders')
      .update({
        state: finalState,
        completed_at: SKIP_EXEC ? null : new Date().toISOString(),
        retry_context: tripleHash ? { e2e: { triple_hash: tripleHash } } : null,
      })
      .eq('wo_id', WO_ID)
    if (error) throw new Error(`update failed: ${error.message}`)
  })
  return {
    step: 9,
    name: 'WO state finalized',
    pass: true,
    detail: SKIP_EXEC ? 'state=ready (skipped exec)' : tripleHash?.pass ? 'state=done' : 'state=failed',
    elapsed_ms,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Runner
// ────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('='.repeat(70))
  console.log('LumeOS — Full WO Pipeline E2E Test')
  console.log('='.repeat(70))
  console.log(`WO ID:           ${WO_ID}`)
  console.log(`SKIP_EXEC:       ${SKIP_EXEC}`)
  console.log(`Workspace root:  ${CFG.workspaceRoot}`)
  console.log()

  const cfgErrs = checkConfigPrereqs()
  const svcErrs = await probeServices()
  if (cfgErrs.length > 0 || svcErrs.length > 0) {
    console.error('✗ Setup error(s):')
    for (const e of cfgErrs) console.error(`  · ${e}`)
    for (const e of svcErrs) console.error(`  · ${e}`)
    console.error('\nFix the above and re-run. Use --skip-execution to skip slow vLLM steps.')
    process.exit(2)
  }

  const steps: Array<() => Promise<StepResult>> = [
    step1_classify,
    step2_bridge,
    step3_compile,
    step4_satCheck,
    step5_token,
    step6_insertSupabase,
    step7_execute,
    step8_tripleHash,
    step9_finalize,
  ]

  const results: StepResult[] = []
  for (const fn of steps) {
    try {
      const r = await fn()
      const mark = r.pass ? '✅' : '❌'
      console.log(`[Step ${r.step}] ${mark} ${r.name.padEnd(38)} ${r.elapsed_ms}ms — ${r.detail}`)
      results.push(r)
      if (!r.pass) break
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err)
      console.log(`[Step ?] ❌ exception — ${detail}`)
      results.push({ step: results.length + 1, name: 'exception', pass: false, detail, elapsed_ms: 0 })
      break
    }
  }

  const passed = results.filter((r) => r.pass).length
  console.log()
  console.log(`${passed}/${steps.length} steps passed`)
  process.exit(passed === steps.length ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
