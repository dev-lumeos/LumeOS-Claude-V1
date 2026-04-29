// system/control-plane/__tests__/dispatcher-negative-runs.ts
//
// Skript A.2 — Negative Real-Flow-Tests für die Dispatcher-Pipeline-Hook.
//
// Was getestet wird:
//   - Test 1 (REWRITE):       Spark 3 antwortet REWRITE → Pipeline returns kind=rewrite
//                             → Dispatcher mappt status='failed', error startet 'REWRITE_REQUIRED:'
//   - Test 2 (HUMAN_NEEDED):  Spark 3 ESCALATE + Spark 4 ESCALATE → kind=human_needed
//                             → Dispatcher mappt status='blocked', error startet 'HUMAN_NEEDED:'
//
// Wie:
//   - Lokale HTTP-Stub-Server auf 127.0.0.1:18099 (Spark 3) und 18101 (Spark 4)
//   - ENV vars SPARK_C_ENDPOINT + SPARK_D_ENDPOINT auf die Stubs umgeleitet
//   - dispatchWorkorder() echt aufgerufen (kein Mocking der Dispatcher-Logik)
//   - Stub-Server geben kontrollierte JSON-Antworten zurück
//
// Run:
//   cd D:\GitHub\LumeOS-Claude-V1
//   npx tsx system/control-plane/__tests__/dispatcher-negative-runs.ts
//
// Voraussetzungen:
//   Keine echten Sparks nötig — Stub-Server ersetzen sie komplett.

import assert from 'node:assert/strict'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import {
  dispatchWorkorder,
  type Workorder,
  type ToolRequest,
  type ToolResult,
} from '../dispatcher'
import type { ModelRoutingEntry } from '../../../services/scheduler-api/src/vllm-adapter'

// ─── Stub Server Helper ───────────────────────────────────────────────────────

interface StubServer {
  server: http.Server
  port: number
  callCount: number
}

function startStubServer(port: number, responseJson: object): Promise<StubServer> {
  return new Promise((resolve, reject) => {
    const stub: StubServer = { server: null!, port, callCount: 0 }

    const server = http.createServer((req, res) => {
      // Healthcheck
      if (req.url === '/v1/models') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ data: [{ id: 'stub-model' }] }))
        return
      }

      // Chat completion
      if (req.url === '/v1/chat/completions') {
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => {
          stub.callCount++
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            choices: [{
              message: {
                content: JSON.stringify(responseJson),
              },
            }],
          }))
        })
        return
      }

      res.writeHead(404)
      res.end()
    })

    server.on('error', reject)
    server.listen(port, '127.0.0.1', () => {
      stub.server = server
      resolve(stub)
    })
  })
}

function stopStubServer(stub: StubServer): Promise<void> {
  return new Promise((resolve) => {
    stub.server.close(() => resolve())
  })
}

// ─── Stubs für Dispatcher-Deps (callModel + executeTool) ──────────────────────

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

function makeStubIntent(woTargetPath: string, woContent: string): string {
  const intent = {
    selected_agent:  'micro-executor',
    risk_level:      'low',
    risks:           ['file write outside src — test scenario only'],
    execution_order: ['validate-input', 'write-file'],
    required_gates:  ['files-scope-gate', 'typecheck-gate', 'human-approval-gate'],
    stop_conditions: ['files_scope_violation', 'typecheck_failure', 'production_execution_without_approval_token'],
    tool:            'write',
    targetPath:      woTargetPath,
    content:         woContent,
  }
  return JSON.stringify(intent)
}

async function stubCallModel(
  _routing: ModelRoutingEntry,
  _systemPrompt: string,
  _userMessage: string,
): Promise<string> {
  return makeStubIntent(TEST_FILE_REL, TEST_FILE_CONTENT)
}

async function stubExecuteTool(req: ToolRequest): Promise<ToolResult> {
  if (req.tool !== 'write')             return { success: false, error: 'stub only handles write' }
  if (!req.targetPath)                  return { success: false, error: 'stub: targetPath required' }
  if (req.content === undefined)        return { success: false, error: 'stub: content required' }

  const fullPath = path.resolve(process.cwd(), req.targetPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, req.content, 'utf8')
  return { success: true, output: `[stub] written: ${req.targetPath}` }
}

// ─── Test Workorders ──────────────────────────────────────────────────────────

const WO_REWRITE: Workorder = {
  workorder_id:         'WO-rewrite-001',
  agent_id:             'micro-executor',
  task:                 'Add a small TypeScript helper for the rewrite test scenario.',
  scope_files:          [TEST_FILE_REL],
  context_files:        [],
  acceptance_files:     [TEST_FILE_REL],
  acceptance_criteria:  ['function returns sum'],
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

const WO_HUMAN_NEEDED: Workorder = {
  ...WO_REWRITE,
  workorder_id: 'WO-humanneeded-001',
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

function cleanupTestFile(): void {
  if (fs.existsSync(TEST_FILE_ABS)) fs.rmSync(TEST_FILE_ABS)
  fs.mkdirSync(TEST_FILE_DIR, { recursive: true })
}

// ─── Test 1: REWRITE Path ─────────────────────────────────────────────────────

async function testRewritePath() {
  console.log('\n══════════════════════════════════════════════')
  console.log('Test 1 — REWRITE Path')
  console.log('══════════════════════════════════════════════')

  cleanupTestFile()

  // Spark 3 Stub: gibt REWRITE zurück → Pipeline returns kind=rewrite at spark-c
  const sparkCStub = await startStubServer(18099, {
    status: 'REWRITE',
    risk: 'LOW',
    confidence: 0.9,
    violations: ['stub: forced REWRITE for test'],
    recommendations: ['stub: this is intentional'],
    summary: 'Forced REWRITE response from Spark-3 stub',
    requires_claude: false,
  })
  console.log(`  Stub Spark 3 listening on 127.0.0.1:${sparkCStub.port}`)

  process.env.SPARK_C_ENDPOINT = 'http://127.0.0.1:18099'
  // Spark 4 sollte NICHT aufgerufen werden bei REWRITE-pending in Standard-WO

  try {
    console.log('  Running dispatchWorkorder()...')
    const result = await dispatchWorkorder(WO_REWRITE, {
      callModel:   stubCallModel,
      executeTool: stubExecuteTool,
    })

    console.log('\n  Result:')
    console.log(`    status:        ${result.status}`)
    console.log(`    run_id:        ${result.run_id}`)
    console.log(`    error:         ${result.error ?? '(none)'}`)
    console.log(`    spark-3 calls: ${sparkCStub.callCount}`)

    // Assertions
    assert.equal(result.status, 'failed', 'expected status=failed for REWRITE')
    assert.ok(result.error, 'expected error message')
    assert.match(result.error!, /^REWRITE_REQUIRED:/, 'expected error to start with REWRITE_REQUIRED:')
    assert.equal(sparkCStub.callCount, 1, 'expected exactly 1 Spark 3 call (REWRITE-pending stops at first call)')

    console.log('  ✓ Status mapping correct: failed + REWRITE_REQUIRED:')
    console.log('  ✓ Spark 3 called once, Spark 4 not called')

  } finally {
    await stopStubServer(sparkCStub)
    delete process.env.SPARK_C_ENDPOINT
  }

  // Audit logs
  console.log('\n  Audit (last 10 of audit.jsonl):')
  tailJsonl('system/state/audit.jsonl', 10)
  console.log('\n  Pipeline-Audit (last 10):')
  tailJsonl('system/state/pipeline-audit.jsonl', 10)
}

// ─── Test 2: HUMAN_NEEDED Path ────────────────────────────────────────────────

async function testHumanNeededPath() {
  console.log('\n══════════════════════════════════════════════')
  console.log('Test 2 — HUMAN_NEEDED Path')
  console.log('══════════════════════════════════════════════')

  cleanupTestFile()

  // Spark 3 Stub: ESCALATE → forwards to Spark 4
  const sparkCStub = await startStubServer(18099, {
    status: 'ESCALATE',
    risk: 'HIGH',
    confidence: 0.9,
    violations: ['stub: complexity too high'],
    recommendations: ['needs senior review'],
    summary: 'Forced ESCALATE response from Spark-3 stub',
    requires_claude: false,
  })
  console.log(`  Stub Spark 3 listening on 127.0.0.1:${sparkCStub.port}`)

  // Spark 4 Stub: ESCALATE → triggers human_needed
  const sparkDStub = await startStubServer(18101, {
    status: 'ESCALATE',
    risk: 'HIGH',
    confidence: 0.95,
    violations: ['stub: cannot decide safely'],
    recommendations: ['claude or human review required'],
    summary: 'Forced ESCALATE response from Spark-4 stub',
    requires_claude: true,
  })
  console.log(`  Stub Spark 4 listening on 127.0.0.1:${sparkDStub.port}`)

  process.env.SPARK_C_ENDPOINT = 'http://127.0.0.1:18099'
  process.env.SPARK_D_ENDPOINT = 'http://127.0.0.1:18101'

  try {
    console.log('  Running dispatchWorkorder()...')
    const result = await dispatchWorkorder(WO_HUMAN_NEEDED, {
      callModel:   stubCallModel,
      executeTool: stubExecuteTool,
    })

    console.log('\n  Result:')
    console.log(`    status:        ${result.status}`)
    console.log(`    run_id:        ${result.run_id}`)
    console.log(`    error:         ${result.error ?? '(none)'}`)
    console.log(`    spark-3 calls: ${sparkCStub.callCount}`)
    console.log(`    spark-4 calls: ${sparkDStub.callCount}`)

    // Assertions
    assert.equal(result.status, 'blocked', 'expected status=blocked for HUMAN_NEEDED')
    assert.ok(result.error, 'expected error message')
    assert.match(result.error!, /^HUMAN_NEEDED:/, 'expected error to start with HUMAN_NEEDED:')
    assert.equal(sparkCStub.callCount, 1, 'expected exactly 1 Spark 3 call (ESCALATE on first call)')
    assert.equal(sparkDStub.callCount, 1, 'expected exactly 1 Spark 4 call (ESCALATE on first call)')

    console.log('  ✓ Status mapping correct: blocked + HUMAN_NEEDED:')
    console.log('  ✓ Spark 3 + Spark 4 each called once')

  } finally {
    await stopStubServer(sparkCStub)
    await stopStubServer(sparkDStub)
    delete process.env.SPARK_C_ENDPOINT
    delete process.env.SPARK_D_ENDPOINT
  }

  // Audit logs
  console.log('\n  Audit (last 10 of audit.jsonl):')
  tailJsonl('system/state/audit.jsonl', 10)
  console.log('\n  Pipeline-Audit (last 10):')
  tailJsonl('system/state/pipeline-audit.jsonl', 10)
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('══════════════════════════════════════════════')
  console.log('Dispatcher Negative-Path Tests')
  console.log('══════════════════════════════════════════════')

  let pass = 0
  let fail = 0
  const failures: Array<{ name: string; err: unknown }> = []

  for (const t of [
    { name: 'REWRITE Path',      fn: testRewritePath },
    { name: 'HUMAN_NEEDED Path', fn: testHumanNeededPath },
  ]) {
    try {
      await t.fn()
      pass++
    } catch (err) {
      console.log(`\n  ✗ ${t.name} FAILED`)
      console.log(`    ${(err as Error).message}`)
      if ((err as Error).stack) console.log((err as Error).stack)
      failures.push({ name: t.name, err })
      fail++
    }
  }

  console.log('\n══════════════════════════════════════════════')
  console.log(`Results: ${pass}/2 passed, ${fail} failed`)
  console.log('══════════════════════════════════════════════')

  if (fail > 0) {
    console.log('\nFailures:')
    for (const f of failures) {
      console.log(`  - ${f.name}: ${(f.err as Error).message}`)
    }
    process.exit(1)
  }
}

main().catch(err => {
  console.error('\n✗ Crash:', err)
  if (err.stack) console.error(err.stack)
  process.exit(1)
})
