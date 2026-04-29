// system/control-plane/__tests__/review-pipeline.test.ts
//
// Mock-only Unit-Test für runReviewPipeline().
// Kein Netzwerk, deterministisch, alle Branches.
//
// Run:
//   cd D:\GitHub\LumeOS-Claude-V1
//   npx tsx system/control-plane/__tests__/review-pipeline.test.ts
//
// Live-Smoke (echte Spark 3 + Spark 4 Calls) liegt separat:
//   system/control-plane/__tests__/review-pipeline.live-smoke.ts

import assert from 'node:assert/strict'
import {
  runReviewPipeline,
  type PipelineDeps,
  type PipelineResult,
  type PipelineWorkerResult,
  type PipelineWorkorder,
} from '../review-pipeline'
import type { ReviewOutput } from '../governance-validator'
import {
  createMemoryAuditWriter,
  type PipelineAuditEvent,
} from '../pipeline-audit'

// ─── Test Helpers ─────────────────────────────────────────────────────────────

const PASS_LOW: ReviewOutput = {
  status: 'PASS',
  risk: 'LOW',
  confidence: 0.95,
  violations: [],
  recommendations: [],
  summary: 'all good',
  requires_claude: false,
}

const PASS_LOW_CONFIDENCE: ReviewOutput = {
  ...PASS_LOW,
  confidence: 0.6,
}

const PASS_REQUIRES_CLAUDE: ReviewOutput = {
  ...PASS_LOW,
  requires_claude: true,
  summary: 'PASS but flagged for senior review',
}

const REWRITE_LOW: ReviewOutput = {
  status: 'REWRITE',
  risk: 'LOW',
  confidence: 0.9,
  violations: ['missing return type'],
  recommendations: ['add explicit return type'],
  summary: 'small fix needed',
  requires_claude: false,
}

const ESCALATE_HIGH: ReviewOutput = {
  status: 'ESCALATE',
  risk: 'HIGH',
  confidence: 0.85,
  violations: ['unclear architecture'],
  recommendations: [],
  summary: 'needs senior review',
  requires_claude: false,
}

const FAIL_HIGH: ReviewOutput = {
  status: 'FAIL',
  risk: 'HIGH',
  confidence: 0.9,
  violations: ['unrecoverable'],
  recommendations: [],
  summary: 'cannot complete',
  requires_claude: false,
}

const SCHEMA_VIOLATION_LOWERCASE_RISK = {
  status: 'PASS',
  risk: 'low',  // lowercase — schema violation
  confidence: 0.95,
  violations: [],
  recommendations: [],
  summary: 'looks fine',
  requires_claude: false,
}

const STANDARD_WO: PipelineWorkorder = {
  wo_id: 'WO-test-001',
  category: 'standard',
  task: 'Add a helper function',
  changed_files: ['src/utils/helper.ts'],
  files_allowed: ['src/utils/helper.ts'],
}

const HIGH_RISK_WO: PipelineWorkorder = {
  wo_id: 'WO-test-002',
  category: 'migration',
  task: 'Add migration for users table',
  changed_files: ['supabase/migrations/0042_users.sql'],
  files_allowed: ['supabase/migrations/0042_users.sql'],
}

const WORKER_OUTPUT: PipelineWorkerResult = {
  wo_id: 'WO-test-001',
  output: 'export function add(a: number, b: number) { return a + b }',
}

/**
 * Build a mock callFastReviewer that returns canned responses in order.
 * Each call to the mock returns the next response from the queue.
 * Useful for testing rewrite-loops where the same reviewer is called multiple times.
 */
function mockReviewer(...responses: Array<string | (() => string)>) {
  let i = 0
  return async () => {
    const r = responses[i++ % responses.length]
    return typeof r === 'function' ? r() : r
  }
}

function asJson(r: ReviewOutput): string {
  return JSON.stringify(r)
}

let originalFetch: typeof globalThis.fetch

/**
 * Stub global fetch (Spark 4 calls go through callGPTOSSReviewer which uses fetch).
 * The stub returns a canned chat-completions response.
 * Each call advances the queue.
 */
function stubFetch(...payloads: Array<string | { error: string }>) {
  let i = 0
  globalThis.fetch = (async (_url: string, _init?: any) => {
    const p = payloads[i++ % payloads.length]
    if (typeof p === 'object' && 'error' in p) {
      return {
        ok: false,
        status: 500,
        statusText: p.error,
        json: async () => ({}),
      } as unknown as Response
    }
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        choices: [{ message: { content: p } }],
      }),
    } as unknown as Response
  }) as typeof globalThis.fetch
}

function restoreFetch() {
  globalThis.fetch = originalFetch
}

function makeDeps(
  spark3Reviewer: PipelineDeps['callFastReviewer'],
  events: PipelineAuditEvent[] = [],
): PipelineDeps {
  return {
    callFastReviewer: spark3Reviewer,
    audit: createMemoryAuditWriter(events),
  }
}

function findEvent(
  events: PipelineAuditEvent[],
  predicate: (e: PipelineAuditEvent) => boolean,
): PipelineAuditEvent | undefined {
  return events.find(predicate)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test01_spark3_pass_low_risk() {
  console.log('\n[01] Spark 3 PASS, low risk → done@spark-c')
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(PASS_LOW)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') {
    assert.equal(result.finalTier, 'spark-c')
    assert.equal(result.review.status, 'PASS')
  }
  assert.ok(findEvent(events, e => e.tier === 'spark-c' && e.event === 'review_completed'))
  console.log('  ✓')
}

async function test02_spark3_pass_low_confidence() {
  console.log('\n[02] Spark 3 PASS, confidence=0.6 → ESCALATE forced → Spark 4 PASS')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(PASS_LOW_CONFIDENCE)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')
  restoreFetch()
  console.log('  ✓')
}

async function test03_spark3_rewrite_pending() {
  console.log('\n[03] Spark 3 REWRITE (1×) → rewrite-pending')
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(REWRITE_LOW)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'rewrite')
  if (result.kind === 'rewrite') assert.equal(result.tier, 'spark-c')
  assert.ok(findEvent(events, e => e.event === 'review_rewrite_loop'))
  console.log('  ✓')
}

async function test04_spark3_invalid_json() {
  console.log('\n[04] Spark 3 invalid JSON → ESCALATE → Spark 4 PASS')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer('not-json-at-all{{{'), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')
  assert.ok(findEvent(events, e =>
    e.event === 'review_escalated' && e.tier === 'spark-c' && e.reason === 'invalid_json'))
  restoreFetch()
  console.log('  ✓')
}

async function test05_spark3_escalate_status() {
  console.log('\n[05] Spark 3 ESCALATE status → Spark 4 PASS')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(ESCALATE_HIGH)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')
  restoreFetch()
  console.log('  ✓')
}

async function test06_spark3_schema_violation() {
  console.log('\n[06] Spark 3 schema violation (lowercase risk) → ESCALATE → Spark 4 PASS')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(
    mockReviewer(JSON.stringify(SCHEMA_VIOLATION_LOWERCASE_RISK)),
    events,
  )

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')
  restoreFetch()
  console.log('  ✓')
}

async function test07_high_risk_spark3_pass_does_not_short_circuit() {
  console.log('\n[07] High-Risk + Spark 3 PASS → Spark 4 läuft trotzdem, done@spark-d')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(PASS_LOW)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, HIGH_RISK_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')

  const nonBlockingEvent = findEvent(events, e => e.tier === 'spark-c-non-blocking')
  assert.ok(nonBlockingEvent, 'expected spark-c-non-blocking audit event')
  restoreFetch()
  console.log('  ✓')
}

async function test08_high_risk_spark3_invalid() {
  console.log('\n[08] High-Risk + Spark 3 invalid → Spark 4 läuft, findings undefined, done@spark-d')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer('{{{ kaputt'), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, HIGH_RISK_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')
  restoreFetch()
  console.log('  ✓')
}

async function test09_high_risk_spark4_pass() {
  console.log('\n[09] High-Risk + Spark 4 PASS → done@spark-d')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(PASS_LOW)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, HIGH_RISK_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') {
    assert.equal(result.finalTier, 'spark-d')
    assert.equal(result.review.status, 'PASS')
  }
  restoreFetch()
  console.log('  ✓')
}

async function test10_spark4_pass_high_confidence() {
  console.log('\n[10] Spark 4 PASS confidence=0.85 → done@spark-d')
  const sparkD: ReviewOutput = { ...PASS_LOW, confidence: 0.85 }
  stubFetch(asJson(sparkD))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(ESCALATE_HIGH)), events)  // forces -> Spark 4

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')
  restoreFetch()
  console.log('  ✓')
}

async function test11_spark4_pass_low_confidence() {
  console.log('\n[11] Spark 4 PASS confidence=0.7 → ESCALATE forced → human_needed')
  const sparkD: ReviewOutput = { ...PASS_LOW, confidence: 0.7 }
  stubFetch(asJson(sparkD))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(ESCALATE_HIGH)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'human_needed')
  assert.ok(findEvent(events, e => e.event === 'human_review_required'))
  restoreFetch()
  console.log('  ✓')
}

async function test12_spark4_invalid_json() {
  console.log('\n[12] Spark 4 invalid JSON → human_needed')
  stubFetch('totally not json {{{')
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(ESCALATE_HIGH)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'human_needed')
  if (result.kind === 'human_needed') {
    assert.equal(result.lastTier, 'spark-d')
    assert.match(result.reason, /invalid_json/)
  }
  restoreFetch()
  console.log('  ✓')
}

async function test13_spark4_rewrite() {
  console.log('\n[13] Spark 4 REWRITE → rewrite@spark-d')
  stubFetch(asJson(REWRITE_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(ESCALATE_HIGH)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'rewrite')
  if (result.kind === 'rewrite') assert.equal(result.tier, 'spark-d')
  restoreFetch()
  console.log('  ✓')
}

async function test14_spark4_escalate() {
  console.log('\n[14] Spark 4 ESCALATE → human_needed')
  stubFetch(asJson(ESCALATE_HIGH))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(ESCALATE_HIGH)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'human_needed')
  restoreFetch()
  console.log('  ✓')
}

async function test15_spark4_fail() {
  console.log('\n[15] Spark 4 FAIL → human_needed')
  stubFetch(asJson(FAIL_HIGH))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(ESCALATE_HIGH)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'human_needed')
  restoreFetch()
  console.log('  ✓')
}

async function test16_spark3_requires_claude_override() {
  console.log('\n[16] Spark 3 status=PASS + requires_claude=true → ESCALATE → Spark 4 PASS')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(PASS_REQUIRES_CLAUDE)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')
  restoreFetch()
  console.log('  ✓')
}

async function test17_spark3_empty_response() {
  console.log('\n[17] Spark 3 empty content → ESCALATE → Spark 4 PASS')
  stubFetch(asJson(PASS_LOW))
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(''), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  if (result.kind === 'done') assert.equal(result.finalTier, 'spark-d')
  assert.ok(findEvent(events, e =>
    e.event === 'review_escalated' && e.tier === 'spark-c' && e.reason === 'invalid_json'))
  restoreFetch()
  console.log('  ✓')
}

async function test18_spark4_empty_response() {
  console.log('\n[18] Spark 4 empty content → human_needed')
  stubFetch('')  // empty content from GPT-OSS → callGPTOSSReviewer throws
  const events: PipelineAuditEvent[] = []
  const deps = makeDeps(mockReviewer(asJson(ESCALATE_HIGH)), events)

  const result = await runReviewPipeline(WORKER_OUTPUT, STANDARD_WO, deps)

  assert.equal(result.kind, 'human_needed')
  if (result.kind === 'human_needed') {
    assert.match(result.reason, /invalid_json/)
  }
  restoreFetch()
  console.log('  ✓')
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function runAll() {
  console.log('══════════════════════════════════════════════')
  console.log('LUMEOS Review-Pipeline Mock Tests V1.0')
  console.log('══════════════════════════════════════════════')

  originalFetch = globalThis.fetch

  const tests = [
    { name: 'Spark 3 PASS low risk',                   fn: test01_spark3_pass_low_risk },
    { name: 'Spark 3 PASS low confidence',             fn: test02_spark3_pass_low_confidence },
    { name: 'Spark 3 REWRITE pending',                 fn: test03_spark3_rewrite_pending },
    { name: 'Spark 3 invalid JSON',                    fn: test04_spark3_invalid_json },
    { name: 'Spark 3 ESCALATE status',                 fn: test05_spark3_escalate_status },
    { name: 'Spark 3 schema violation',                fn: test06_spark3_schema_violation },
    { name: 'High-Risk + Spark 3 PASS no shortcut',    fn: test07_high_risk_spark3_pass_does_not_short_circuit },
    { name: 'High-Risk + Spark 3 invalid',             fn: test08_high_risk_spark3_invalid },
    { name: 'High-Risk + Spark 4 PASS',                fn: test09_high_risk_spark4_pass },
    { name: 'Spark 4 PASS high confidence',            fn: test10_spark4_pass_high_confidence },
    { name: 'Spark 4 PASS low confidence',             fn: test11_spark4_pass_low_confidence },
    { name: 'Spark 4 invalid JSON',                    fn: test12_spark4_invalid_json },
    { name: 'Spark 4 REWRITE',                         fn: test13_spark4_rewrite },
    { name: 'Spark 4 ESCALATE',                        fn: test14_spark4_escalate },
    { name: 'Spark 4 FAIL',                            fn: test15_spark4_fail },
    { name: 'Spark 3 requires_claude override',        fn: test16_spark3_requires_claude_override },
    { name: 'Spark 3 empty response',                  fn: test17_spark3_empty_response },
    { name: 'Spark 4 empty response',                  fn: test18_spark4_empty_response },
  ]

  let pass = 0
  let fail = 0
  const failures: Array<{ name: string; err: unknown }> = []

  for (const t of tests) {
    try {
      await t.fn()
      pass++
    } catch (err) {
      console.log(`  ✗ ${t.name}`)
      console.log(`    ${(err as Error).message}`)
      failures.push({ name: t.name, err })
      fail++
      restoreFetch()
    }
  }

  console.log('\n══════════════════════════════════════════════')
  console.log(`Results: ${pass}/${tests.length} passed, ${fail} failed`)
  console.log('══════════════════════════════════════════════')

  if (fail > 0) {
    console.log('\nFailures:')
    for (const f of failures) {
      console.log(`  - ${f.name}: ${(f.err as Error).message}`)
    }
    process.exit(1)
  }
}

runAll().catch(err => {
  console.error('Test runner crashed:', err)
  process.exit(1)
})
