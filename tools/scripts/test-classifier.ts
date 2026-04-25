// tools/scripts/test-classifier.ts
//
// Live integration test for services/wo-classifier (port 9000).
// Boots N requests against /classify and asserts the routing outcome.
//
// Usage:
//   1. Start the service:    pnpm --filter @lumeos/wo-classifier dev
//   2. Run this script:      WORKSPACE_ROOT=. npx tsx tools/scripts/test-classifier.ts
//
// Exit code: 0 if all tests pass, 1 otherwise.

import type {
  WOClassifierInput,
  WOClassifierOutput,
  WOClassifierReject,
  SparkTarget,
} from '@lumeos/wo-core'

const BASE_URL = process.env.WO_CLASSIFIER_URL ?? 'http://localhost:9000'

interface ExpectQueued {
  kind: 'QUEUED'
  spark: SparkTarget
  needsDbCheck?: boolean
  reasonContains?: string
}

interface ExpectRejected {
  kind: 'REJECTED'
  reasonContains: string
}

type Expectation = ExpectQueued | ExpectRejected

interface TestCase {
  name: string
  input: Partial<WOClassifierInput>
  expect: Expectation
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function uniqueId(prefix: string): string {
  // wo_id must be unique to bypass the 24h dedup in Supabase.
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

async function callClassify(
  body: Partial<WOClassifierInput>
): Promise<{ status: number; payload: WOClassifierOutput | WOClassifierReject }> {
  const res = await fetch(`${BASE_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, payload: (await res.json()) as WOClassifierOutput | WOClassifierReject }
}

function isQueued(p: WOClassifierOutput | WOClassifierReject): p is WOClassifierOutput {
  return 'routing' in p
}

interface Verdict {
  pass: boolean
  detail: string
}

function verify(actual: { status: number; payload: WOClassifierOutput | WOClassifierReject }, e: Expectation): Verdict {
  if (e.kind === 'REJECTED') {
    if (isQueued(actual.payload)) {
      return { pass: false, detail: `expected REJECT, got QUEUED → ${actual.payload.routing.assigned_spark}` }
    }
    if (!actual.payload.reason.includes(e.reasonContains)) {
      return { pass: false, detail: `reason "${actual.payload.reason}" missing "${e.reasonContains}"` }
    }
    return { pass: true, detail: `REJECT — ${actual.payload.reason}` }
  }

  // expect QUEUED
  if (!isQueued(actual.payload)) {
    return { pass: false, detail: `expected QUEUED, got REJECT — ${actual.payload.reason}` }
  }
  const r = actual.payload.routing
  if (r.assigned_spark !== e.spark) {
    return { pass: false, detail: `spark=${r.assigned_spark} (want ${e.spark})` }
  }
  if (e.needsDbCheck !== undefined && r.needs_db_check !== e.needsDbCheck) {
    return { pass: false, detail: `needs_db_check=${r.needs_db_check} (want ${e.needsDbCheck})` }
  }
  if (e.reasonContains && !r.routing_reason.includes(e.reasonContains)) {
    return { pass: false, detail: `reason "${r.routing_reason}" missing "${e.reasonContains}"` }
  }
  return {
    pass: true,
    detail: `${r.assigned_spark}${r.needs_db_check ? ' + needs_db_check' : ''} — ${r.routing_reason}`,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Test cases (mirrors WO_CLASSIFIER_V1.md)
// ────────────────────────────────────────────────────────────────────────────

const cases: TestCase[] = [
  {
    name: 'WO-001 low/low implementation → bulk → spark_b (spark_c fallback)',
    input: {
      id: uniqueId('WO-001'),
      title: 'add field to nutrition diary',
      type: 'implementation',
      module: 'nutrition',
      complexity: 'low',
      risk: 'low',
      requires_reasoning: false,
      requires_schema_change: false,
      db_access: 'none',
      files_allowed: ['packages/types/src/nutrition/index.ts'],
      acceptance_criteria: ['typecheck passes'],
      created_by: 'human',
    },
    expect: { kind: 'QUEUED', spark: 'spark_b', reasonContains: 'spark_c not yet available' },
  },
  {
    name: 'WO-002 migration + schema_change + human → spark_b + needs_db_check',
    input: {
      id: uniqueId('WO-002'),
      title: 'add column biomarker_id to lab_results',
      type: 'migration',
      module: 'medical',
      complexity: 'medium',
      risk: 'medium',
      requires_reasoning: false,
      requires_schema_change: true,
      db_access: 'migration',
      files_allowed: ['supabase/migrations/20260425_add_biomarker_id.sql'],
      acceptance_criteria: ['migration runs', 'rollback verified'],
      created_by: 'human',
    },
    expect: {
      kind: 'QUEUED',
      spark: 'spark_b',
      needsDbCheck: true,
      reasonContains: 'db_access=migration',
    },
  },
  {
    name: 'WO-003 governance → spark_a',
    input: {
      id: uniqueId('WO-003'),
      title: 'review governance artefakt schema v3',
      type: 'governance',
      module: 'infra',
      complexity: 'high',
      risk: 'medium',
      requires_reasoning: true,
      requires_schema_change: false,
      db_access: 'none',
      files_allowed: ['system/control-plane/governance_artefakt_schema_v3.md'],
      acceptance_criteria: ['ADR written'],
      created_by: 'human',
    },
    expect: { kind: 'QUEUED', spark: 'spark_a', reasonContains: 'governance' },
  },
  {
    name: 'WO-004 missing required fields → REJECT',
    input: {
      // Intentionally malformed — only id + title.
      id: uniqueId('WO-004'),
      title: 'broken WO',
    },
    expect: { kind: 'REJECTED', reasonContains: 'Missing fields' },
  },
  {
    name: 'WO-005 low impl (same shape as 001) → bulk → spark_b (spark_c fallback)',
    input: {
      id: uniqueId('WO-005'),
      title: 'rename helper in coach module',
      type: 'implementation',
      module: 'coach',
      complexity: 'low',
      risk: 'low',
      requires_reasoning: false,
      requires_schema_change: false,
      db_access: 'none',
      files_allowed: ['packages/coach-core/src/helpers.ts'],
      acceptance_criteria: ['typecheck passes'],
      created_by: 'human',
    },
    expect: { kind: 'QUEUED', spark: 'spark_b', reasonContains: 'bulk: low impl' },
  },
]

// ────────────────────────────────────────────────────────────────────────────
// Runner
// ────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Health probe first — fail fast with a useful message if service is down.
  try {
    const h = await fetch(`${BASE_URL}/health`)
    if (!h.ok) throw new Error(`health returned ${h.status}`)
  } catch (e) {
    console.error(`✗ wo-classifier not reachable at ${BASE_URL}: ${(e as Error).message}`)
    console.error(`  Start it with: pnpm --filter @lumeos/wo-classifier dev`)
    process.exit(2)
  }

  console.log(`Running ${cases.length} cases against ${BASE_URL}\n`)

  let passed = 0
  let failed = 0
  for (const c of cases) {
    const actual = await callClassify(c.input)
    const v = verify(actual, c.expect)
    const mark = v.pass ? '✅' : '❌'
    const label = c.name.padEnd(70)
    console.log(`  ${mark} ${label} ${v.detail}`)
    if (v.pass) passed++
    else failed++
  }

  console.log(`\n${passed}/${cases.length} passed${failed ? `, ${failed} failed` : ''}`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
