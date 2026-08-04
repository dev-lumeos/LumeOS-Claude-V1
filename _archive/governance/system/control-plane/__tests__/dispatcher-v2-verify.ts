// system/control-plane/__tests__/dispatcher-v2-verify.ts
//
// Block 6 Verification — V2 Features real testen
//
// Was getestet wird:
//   6.1 State-persisted Rewrite Counter — direkt via state-manager
//   6.2 Auto-Retry + High-Risk Guard — via runReviewPipeline mit mock reviewer
//
// Run:
//   cd D:\GitHub\LumeOS-Claude-V1
//   npx tsx system/control-plane/__tests__/dispatcher-v2-verify.ts

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  getRewriteCount,
  incrementRewriteCount,
  clearRewriteCounters,
} from '../../state/state-manager'
import {
  runReviewPipeline,
  type PipelineDeps,
  type PipelineWorkerResult,
  type PipelineWorkorder,
} from '../review-pipeline'
import { createMemoryAuditWriter } from '../pipeline-audit'
import { createMemoryMetricsWriter, type PipelineMetricEvent } from '../pipeline-metrics'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReviewer(response: object) {
  return async () => JSON.stringify(response)
}

const REWRITE_RESPONSE = {
  status: 'REWRITE', risk: 'LOW', confidence: 0.9,
  violations: ['missing return type'], recommendations: [], summary: 'fix needed',
  requires_claude: false,
}

const PASS_RESPONSE = {
  status: 'PASS', risk: 'LOW', confidence: 0.95,
  violations: [], recommendations: [], summary: 'all good',
  requires_claude: false,
}

const WORKER_RESULT: PipelineWorkerResult = {
  wo_id: 'WO-v2-test',
  run_id: 'RUN-v2-verify',
  output: 'export function add(a: number, b: number) { return a + b }',
}

const STANDARD_WO: PipelineWorkorder = {
  wo_id: 'WO-v2-test', category: 'standard', task: 'add helper',
}

const HIGH_RISK_WO: PipelineWorkorder = {
  wo_id: 'WO-v2-test', category: 'db-migration', task: 'add migration',
}

function makeDeps(
  reviewer: PipelineDeps['callFastReviewer'],
  metrics: PipelineMetricEvent[],
  counts: Record<string, number> = {},
): PipelineDeps {
  return {
    callFastReviewer: reviewer,
    audit: createMemoryAuditWriter([]),
    writeMetric: createMemoryMetricsWriter(metrics),
    getRewriteCount: (_runId, tier) => counts[tier] ?? 0,
    incrementRewriteCount: async (_runId, tier) => {
      counts[tier] = (counts[tier] ?? 0) + 1
    },
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test_6_1_counter_persist() {
  console.log('\n[6.1a] State counter — increment + read + clear')

  // Temp dir damit wir nicht den echten State anfassen
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-v2-'))
  const origCwd = process.cwd()
  process.chdir(tmpDir)
  fs.mkdirSync('system/state', { recursive: true })

  try {
    assert.equal(getRewriteCount('RUN-001', 'spark-c'), 0)

    await incrementRewriteCount('RUN-001', 'spark-c')
    assert.equal(getRewriteCount('RUN-001', 'spark-c'), 1)

    await incrementRewriteCount('RUN-001', 'spark-c')
    assert.equal(getRewriteCount('RUN-001', 'spark-c'), 2)

    await incrementRewriteCount('RUN-001', 'spark-d')
    assert.equal(getRewriteCount('RUN-001', 'spark-d'), 1)
    assert.equal(getRewriteCount('RUN-001', 'spark-c'), 2, 'spark-c unaffected by spark-d increment')

    await clearRewriteCounters('RUN-001')
    assert.equal(getRewriteCount('RUN-001', 'spark-c'), 0, 'cleared')
    assert.equal(getRewriteCount('RUN-001', 'spark-d'), 0, 'cleared')

    console.log('  ✓ increment + read + clear korrekt')
  } finally {
    process.chdir(origCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

async function test_6_1_counter_cross_run() {
  console.log('\n[6.1b] State counter — cross-run loop detection via pipeline')

  const metrics: PipelineMetricEvent[] = []
  // Counter für spark-c ist bereits 2 (von vorherigen Worker-Re-Runs)
  const deps = makeDeps(makeReviewer(PASS_RESPONSE), metrics, { 'spark-c': 2 })

  // Spark D fetch stubben damit kein echter Netzwerk-Call
  const origFetch = globalThis.fetch
  globalThis.fetch = (async () => ({
    ok: false, status: 503, statusText: 'unavailable',
    json: async () => ({}),
  })) as any

  const result = await runReviewPipeline(WORKER_RESULT, STANDARD_WO, deps)

  globalThis.fetch = origFetch

  assert.equal(result.kind, 'human_needed', 'counter am Limit → sofort escalate, kein PASS trotz PASS_RESPONSE')

  // Metric soll geschrieben worden sein
  const sparkCMetric = metrics.find(m => m.tier === 'spark-c')
  assert.ok(sparkCMetric, 'metric für spark-c vorhanden')
  assert.equal(sparkCMetric?.outcome, 'rewrite_limit_exceeded')
  assert.equal(sparkCMetric?.rewrite_count, 2)
  assert.equal(sparkCMetric?.escalated, true)

  console.log('  ✓ counter=2 → sofortiges rewrite_limit_exceeded, kein Reviewer-Call')
}

async function test_6_2_rewrite_increments_counter() {
  console.log('\n[6.2a] Auto-Retry — REWRITE inkrementiert Counter, bleibt unter Limit')

  const metrics: PipelineMetricEvent[] = []
  const counts: Record<string, number> = { 'spark-c': 0 }
  const deps = makeDeps(makeReviewer(REWRITE_RESPONSE), metrics, counts)

  const result = await runReviewPipeline(WORKER_RESULT, STANDARD_WO, deps)

  assert.equal(result.kind, 'rewrite')
  assert.equal(counts['spark-c'], 1, 'Counter nach REWRITE auf 1')

  const metric = metrics.find(m => m.tier === 'spark-c')
  assert.ok(metric)
  assert.equal(metric?.outcome, 'REWRITE')
  assert.equal(metric?.rewrite_count, 1, 'rewrite_count im Metric = 1 nach Increment')

  console.log('  ✓ REWRITE → counter=1, metric korrekt')
}

async function test_6_2_rewrite_at_limit_escalates() {
  console.log('\n[6.2b] Auto-Retry — Counter bei 1 + REWRITE → Limit erreicht → rewrite_limit_exceeded')

  const metrics: PipelineMetricEvent[] = []
  const counts: Record<string, number> = { 'spark-c': 1 }  // bereits 1 voriger REWRITE

  // Spark D stubben (Escalation-Pfad)
  const origFetch = globalThis.fetch
  globalThis.fetch = (async () => ({
    ok: false, status: 503, statusText: 'unavailable',
    json: async () => ({}),
  })) as any

  const deps = makeDeps(makeReviewer(REWRITE_RESPONSE), metrics, counts)
  const result = await runReviewPipeline(WORKER_RESULT, STANDARD_WO, deps)

  globalThis.fetch = origFetch

  assert.equal(result.kind, 'human_needed', 'nach 2. REWRITE → rewrite_limit_exceeded → human_needed')
  assert.equal(counts['spark-c'], 2, 'Counter auf 2 nach Increment')

  const metric = metrics.find(m => m.tier === 'spark-c' && m.outcome === 'rewrite_limit_exceeded')
  assert.ok(metric, 'rewrite_limit_exceeded metric vorhanden')
  assert.equal(metric?.escalated, true)

  console.log('  ✓ counter 1→2 = Limit → rewrite_limit_exceeded → human_needed')
}

async function test_6_2_high_risk_no_auto_retry() {
  console.log('\n[6.2c] High-Risk Guard — migration-WO läuft immer durch Spark D (non-blocking Spark C)')

  const metrics: PipelineMetricEvent[] = []
  const counts: Record<string, number> = { 'spark-c': 0 }

  // Spark D stubben → schlägt fehl
  const origFetch = globalThis.fetch
  globalThis.fetch = (async () => ({
    ok: false, status: 503, statusText: 'unavailable',
    json: async () => ({}),
  })) as any

  const deps = makeDeps(makeReviewer(REWRITE_RESPONSE), metrics, counts)
  const result = await runReviewPipeline(WORKER_RESULT, HIGH_RISK_WO, deps)

  globalThis.fetch = origFetch

  // Bei High-Risk: Spark C läuft non-blocking, Spark D läuft immer.
  // Spark D schlägt fehl (503) → human_needed.
  // Pipeline gibt NIEMALS 'rewrite' bei High-Risk direkt zurück —
  // deshalb trifft dispatcher.ts die canRetry=false-Entscheidung nicht mal.
  assert.equal(result.kind, 'human_needed', 'High-Risk → Spark D mandatory → human_needed (kein rewrite)')

  // Counter kann inkrementiert sein (Spark C lief non-blocking) — das ist OK.
  // Entscheidend: Pipeline gibt 'human_needed' zurück, nicht 'rewrite'.
  // Damit trifft der Dispatcher dispatcher.ts nie die canRetry-Entscheidung.
  assert.notEqual(result.kind, 'rewrite', 'Pipeline gibt bei High-Risk nie rewrite zurück')

  // Metrics: spark-c REWRITE non-blocking vorhanden
  const sparkCMetric = metrics.find(m => m.tier === 'spark-c')
  assert.ok(sparkCMetric, 'spark-c metric vorhanden')
  assert.equal(sparkCMetric?.outcome, 'REWRITE')

  console.log('  ✓ High-Risk → spark-c non-blocking → spark-d mandatory → human_needed')
  console.log('    Kein Auto-Retry möglich da Pipeline nie "rewrite" zurückgibt')
}

async function test_6_3_metrics_written() {
  console.log('\n[6.3] Metrics — PASS schreibt Metric mit latency + confidence')

  const metrics: PipelineMetricEvent[] = []
  const deps = makeDeps(makeReviewer(PASS_RESPONSE), metrics)

  const result = await runReviewPipeline(WORKER_RESULT, STANDARD_WO, deps)

  assert.equal(result.kind, 'done')
  assert.equal(metrics.length, 1)
  const m = metrics[0]
  assert.equal(m.tier, 'spark-c')
  assert.equal(m.outcome, 'PASS')
  assert.equal(m.escalated, false)
  assert.equal(m.confidence, 0.95)
  assert.ok(m.latency_ms >= 0, 'latency_ms gesetzt')
  assert.ok(m.timestamp, 'timestamp gesetzt')
  assert.equal(m.wo_id, 'WO-v2-test')

  console.log(`  ✓ Metric korrekt: outcome=PASS conf=${m.confidence} latency=${m.latency_ms}ms`)
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function runAll() {
  console.log('══════════════════════════════════════════════')
  console.log('LUMEOS Block 6 V2 Verification')
  console.log('══════════════════════════════════════════════')

  const tests = [
    test_6_1_counter_persist,
    test_6_1_counter_cross_run,
    test_6_2_rewrite_increments_counter,
    test_6_2_rewrite_at_limit_escalates,
    test_6_2_high_risk_no_auto_retry,
    test_6_3_metrics_written,
  ]

  let pass = 0, fail = 0
  const failures: Array<{ name: string; err: unknown }> = []

  for (const t of tests) {
    try {
      await t()
      pass++
    } catch (err) {
      console.log(`  ✗ ${t.name}: ${(err as Error).message}`)
      failures.push({ name: t.name, err })
      fail++
    }
  }

  console.log('\n══════════════════════════════════════════════')
  console.log(`Results: ${pass}/${tests.length} passed, ${fail} failed`)
  console.log('══════════════════════════════════════════════')

  if (fail > 0) {
    for (const f of failures) console.log(`  - ${f.name}: ${(f.err as Error).message}`)
    process.exit(1)
  }
}

runAll().catch(err => {
  console.error('Crash:', err)
  process.exit(1)
})
