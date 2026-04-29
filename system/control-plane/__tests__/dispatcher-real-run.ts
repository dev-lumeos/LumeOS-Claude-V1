// system/control-plane/__tests__/dispatcher-real-run.ts
//
// Skript A — Pipeline-Hook im Dispatcher echt testen.
//
// Was getestet wird:
//   - dispatchWorkorder() direkt aufrufen
//   - Echter Code-Pfad: Schema, Agent-Registry, Skills, Governance-Validator,
//     Approval-Gate, Permission-Gateway, Tool-Execution, Pipeline-Gate, Finalize
//   - Echte Spark 3 + Spark 4 Reviewer-Calls
//   - Echte Audit-Writes (audit.jsonl + pipeline-audit.jsonl)
//
// Was NICHT getestet wird:
//   - Echter Spark 1 Orchestrator (gestubbed mit valid Intent-JSON)
//   - Echter Spark 2 Worker (gestubbed mit minimaler write-Operation)
//   - Supabase, Scheduler-Loop, Slot-Manager
//
// Run:
//   cd D:\GitHub\LumeOS-Claude-V1
//   npx tsx system/control-plane/__tests__/dispatcher-real-run.ts
//
// Voraussetzungen:
//   - Spark 3 (Gemma 4)  läuft auf 192.168.0.99:8001
//   - Spark 4 (GPT-OSS)  läuft auf 192.168.0.101:8001
//
// Output:
//   Run-Result (status, error)
//   tail von audit.jsonl + pipeline-audit.jsonl
//
// Test-Datei wird geschrieben nach:
//   tmp/review-pipeline-test/add.ts
// (Außerhalb von src/ — sicher, gitignoriert via tmp/)

import fs from 'node:fs'
import path from 'node:path'
import {
  dispatchWorkorder,
  type Workorder,
  type ToolRequest,
  type ToolResult,
} from '../dispatcher'
import type { ModelRoutingEntry } from '../../../services/scheduler-api/src/vllm-adapter'

// ─── Test Configuration ───────────────────────────────────────────────────────

const TEST_FILE_REL  = 'tmp/review-pipeline-test/add.ts'
const TEST_FILE_ABS  = path.resolve(process.cwd(), TEST_FILE_REL)
const TEST_FILE_DIR  = path.dirname(TEST_FILE_ABS)

const TEST_FILE_CONTENT = [
  '/**',
  ' * Adds two numbers.',
  ' * @example add(1, 2) // => 3',
  ' */',
  'export function add(a: number, b: number): number {',
  '  return a + b',
  '}',
  '',
].join('\n')

// ─── Stub: Orchestrator (Spark 1) ─────────────────────────────────────────────
//
// In echtem Run würde Spark 1 (Qwen3.6) das WO + System-Prompt bekommen und
// einen valid OrchestratorIntent JSON zurückgeben. Wir stubben das mit einem
// hardcoded Intent der von validateOrchestratorIntent akzeptiert wird.

function makeStubIntent(woTargetPath: string, woContent: string): string {
  // KRITISCH: Der dispatcher.ts ruft callModel EINMAL und parst den Output
  // doppelt:
  //   1. parseOrchestratorIntent  → erwartet selected_agent, risk_level, etc.
  //   2. parseToolRequest         → erwartet tool als Top-Level-Property
  //
  // Damit BEIDE Parser greifen, muss das JSON beide Felder gleichzeitig
  // tragen — als Flach-Objekt mit allen Properties auf Top-Level.

  const intent = {
    // Orchestrator-Intent Felder (für parseOrchestratorIntent + Validator)
    selected_agent:  'micro-executor',
    risk_level:      'low',
    risks:           ['file write outside src — test scenario only'],
    execution_order: ['validate-input', 'write-file'],
    required_gates:  ['files-scope-gate', 'typecheck-gate', 'human-approval-gate'],
    stop_conditions: ['files_scope_violation', 'typecheck_failure', 'production_execution_without_approval_token'],

    // Tool-Request Felder (für parseToolRequest — tool als Top-Level)
    tool:        'write',
    targetPath:  woTargetPath,
    content:     woContent,
  }

  return JSON.stringify(intent)
}

// ─── Stub: Tool Executor ──────────────────────────────────────────────────────
//
// In echtem Run würde Spark 2 (Coder-Next) den Code generieren und der echte
// defaultExecuteTool würde ihn schreiben. Wir kürzen das ab: der Stub schreibt
// die TEST_FILE_CONTENT direkt nach TEST_FILE_REL.

async function stubExecuteTool(req: ToolRequest): Promise<ToolResult> {
  console.log(`  [executeTool stub] tool=${req.tool} target=${req.targetPath}`)

  if (req.tool !== 'write') {
    return { success: false, error: 'stub only handles write' }
  }

  if (!req.targetPath || req.content === undefined) {
    return { success: false, error: 'stub: targetPath/content required' }
  }

  const fullPath = path.resolve(process.cwd(), req.targetPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, req.content, 'utf8')

  return { success: true, output: `[stub] written: ${req.targetPath}` }
}

// ─── Stub: Model Caller ───────────────────────────────────────────────────────
//
// Wird von dispatchWorkorder.Step 5 aufgerufen für den Orchestrator.
// Returnt unseren Stub-Intent.

async function stubCallModel(
  _routing: ModelRoutingEntry,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  console.log(`  [callModel stub] sysPrompt=${systemPrompt.length}ch userMsg=${userMessage.length}ch`)
  return makeStubIntent(TEST_FILE_REL, TEST_FILE_CONTENT)
}

// ─── Test Workorder ───────────────────────────────────────────────────────────

const TEST_WORKORDER: Workorder = {
  workorder_id:         'WO-realrun-001',
  agent_id:             'micro-executor',
  task:                 'Add a small TypeScript helper function `add(a, b)` to a test file. Pure utility, no side effects.',
  scope_files:          [TEST_FILE_REL],
  context_files:        [],
  acceptance_files:     [TEST_FILE_REL],
  acceptance_criteria:  [
    'function add returns a + b',
    'JSDoc with @example',
    'TypeScript types explicit',
  ],
  negative_constraints: [
    'NIEMALS außerhalb scope_files schreiben',
    'NIEMALS Side-Effects',
    'NIEMALS dynamic imports',
    'NIEMALS console.log',
  ],
  required_skills:      [],
  optional_skills:      [],
  blocked_by:           [],
  phase:                1,
}

// ─── Audit Tail Helper ────────────────────────────────────────────────────────

function tailJsonl(filepath: string, n: number): void {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) {
    console.log(`  (${filepath} does not exist yet)`)
    return
  }
  const content = fs.readFileSync(abs, 'utf8')
  const lines = content.trim().split('\n').filter(Boolean)
  const last = lines.slice(-n)
  console.log(`  ── ${filepath} (last ${last.length} of ${lines.length}) ──`)
  for (const line of last) {
    try {
      const obj = JSON.parse(line)
      const summary = [
        obj.ts?.replace(/T/, ' ').replace(/\.\d+Z$/, ''),
        obj.event,
        obj.tier ? `tier=${obj.tier}` : null,
        obj.review_tier ? `rev=${obj.review_tier}` : null,
        obj.status ? `status=${obj.status}` : null,
        obj.confidence !== undefined ? `conf=${obj.confidence}` : null,
        obj.reason ? `reason=${obj.reason}` : null,
        obj.review_reason ? `rev_reason=${obj.review_reason}` : null,
      ].filter(Boolean).join(' ')
      console.log(`    ${summary}`)
    } catch {
      console.log(`    ${line}`)
    }
  }
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

// ─── Runner ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('══════════════════════════════════════════════')
  console.log('Dispatcher Real-Run — Skript A')
  console.log('══════════════════════════════════════════════')

  // 1. Healthcheck Spark 3 + Spark 4 (Pipeline)
  console.log('\nHealthchecks:')
  const sparkC = process.env.SPARK_C_ENDPOINT ?? 'http://192.168.0.99:8001'
  const sparkD = process.env.SPARK_D_ENDPOINT ?? 'http://192.168.0.101:8001'
  const okC = await ping('Spark 3 (Gemma 4)',  sparkC)
  const okD = await ping('Spark 4 (GPT-OSS)',  sparkD)
  if (!okC || !okD) {
    console.log('\n✗ Healthcheck failed — Pipeline-Reviewer unreachable.')
    process.exit(1)
  }

  // 2. Cleanup test file vor dem Run
  if (fs.existsSync(TEST_FILE_ABS)) {
    fs.rmSync(TEST_FILE_ABS)
    console.log(`\nCleaned: ${TEST_FILE_REL}`)
  }
  fs.mkdirSync(TEST_FILE_DIR, { recursive: true })

  // 3. Dispatcher Run
  console.log('\nRunning dispatchWorkorder()...')
  const t0 = Date.now()

  const result = await dispatchWorkorder(TEST_WORKORDER, {
    callModel:   stubCallModel,
    executeTool: stubExecuteTool,
  })

  const duration = Date.now() - t0

  // 4. Result
  console.log('\n══════════════════════════════════════════════')
  console.log('Run Result')
  console.log('══════════════════════════════════════════════')
  console.log(`  status:        ${result.status}`)
  console.log(`  run_id:        ${result.run_id}`)
  console.log(`  workorder_id:  ${result.workorder_id}`)
  if (result.error) console.log(`  error:         ${result.error}`)
  console.log(`  duration:      ${duration}ms`)

  // 5. File geschrieben?
  if (fs.existsSync(TEST_FILE_ABS)) {
    const stat = fs.statSync(TEST_FILE_ABS)
    console.log(`  test file:     ${TEST_FILE_REL} (${stat.size} bytes)`)
  } else {
    console.log(`  test file:     NOT written`)
  }

  // 6. Audit Tails
  console.log('\nAudit Logs:')
  tailJsonl('system/state/audit.jsonl', 20)
  tailJsonl('system/state/pipeline-audit.jsonl', 20)

  console.log('\n══════════════════════════════════════════════')
  console.log('Done.')
  console.log('══════════════════════════════════════════════')
}

main().catch(err => {
  console.error('\n✗ Crash:', err)
  if (err.stack) console.error(err.stack)
  process.exit(1)
})
