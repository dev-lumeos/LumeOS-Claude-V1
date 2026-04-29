/**
 * LUMEOS Scheduler Preflight Tests — D.2
 *
 * Run:
 *   npx tsx --test system/control-plane/__tests__/scheduler-preflight.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runPreflight, type PreflightDeps } from '../scheduler-preflight'
import type { Workorder } from '../dispatcher'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BASE_WO: Workorder = {
  workorder_id:         'WO-pf-001',
  agent_id:             'micro-executor',
  task:                 'Add helper function to metrics.ts',
  scope_files:          ['services/nutrition-api/src/utils/metrics.ts'],
  context_files:        [],
  acceptance_files:     [],
  acceptance_criteria:  ['function exists', 'tests pass', 'no lint errors'],
  negative_constraints: ['no side effects', 'no new deps', 'no env access', 'no breaking changes'],
  required_skills:      [],
  optional_skills:      [],
  blocked_by:           [],
}

function makeDeps(overrides: Partial<PreflightDeps> = {}): PreflightDeps {
  return {
    getActiveWorkorders: () => [],
    checkScopeConflict:  () => null,
    isDbMigrationLocked: () => ({ locked: false }),
    loadAgents:          () => ({ 'micro-executor': { type: 'executor' }, 'db-migration-agent': { type: 'db_specialist' } }),
    ...overrides,
  }
}

// ─── GO Tests ─────────────────────────────────────────────────────────────────

describe('Preflight — GO (alles in Ordnung)', () => {

  it('standard WO mit korrekten Feldern → GO', () => {
    const result = runPreflight(BASE_WO, makeDeps())
    assert.equal(result.verdict, 'GO')
    assert.ok(result.checks.every(c => c.passed))
  })

  it('neue WO (noch nicht in active_workorders) → GO', () => {
    const result = runPreflight(BASE_WO, makeDeps({ getActiveWorkorders: () => [] }))
    assert.equal(result.verdict, 'GO')
  })

  it('WO mit blocked_by leer → GO', () => {
    const wo = { ...BASE_WO, blocked_by: [] }
    const result = runPreflight(wo, makeDeps())
    assert.equal(result.verdict, 'GO')
  })

  it('WO mit blocked_by alle done → GO', () => {
    const wo = { ...BASE_WO, blocked_by: ['WO-dep-001'] }
    const result = runPreflight(wo, makeDeps({
      getActiveWorkorders: () => [{ workorder_id: 'WO-dep-001', status: 'done' }],
    }))
    assert.equal(result.verdict, 'GO')
  })
})

// ─── REJECT Tests ─────────────────────────────────────────────────────────────

describe('Preflight — REJECT (permanente Bedingungen)', () => {

  it('unbekannter Agent → REJECT', () => {
    const wo = { ...BASE_WO, agent_id: 'unknown-agent-xyz' }
    const result = runPreflight(wo, makeDeps())
    assert.equal(result.verdict, 'REJECT')
    const check = result.checks.find(c => c.name === 'agent_exists')
    assert.ok(check)
    assert.equal(check.passed, false)
  })

  it('scope_files leer → REJECT', () => {
    const wo = { ...BASE_WO, scope_files: [] }
    const result = runPreflight(wo, makeDeps())
    assert.equal(result.verdict, 'REJECT')
    assert.ok(result.reason?.includes('scope_files'))
  })

  it('WO status done → REJECT', () => {
    const result = runPreflight(BASE_WO, makeDeps({
      getActiveWorkorders: () => [{ workorder_id: 'WO-pf-001', status: 'done' }],
    }))
    assert.equal(result.verdict, 'REJECT')
    assert.ok(result.reason?.includes('terminal'))
  })

  it('WO status failed → REJECT', () => {
    const result = runPreflight(BASE_WO, makeDeps({
      getActiveWorkorders: () => [{ workorder_id: 'WO-pf-001', status: 'failed' }],
    }))
    assert.equal(result.verdict, 'REJECT')
  })

  it('db-migration ohne rollback_hint → REJECT', () => {
    const wo: Workorder = { ...BASE_WO, risk_category: 'db-migration' }
    const result = runPreflight(wo, makeDeps({ loadAgents: () => ({ 'micro-executor': { type: 'executor' } }) }))
    assert.equal(result.verdict, 'REJECT')
    assert.ok(result.reason?.includes('rollback_hint'))
  })

  it('db-migration mit rollback_hint → kein REJECT wegen rollback', () => {
    const wo: Workorder = { ...BASE_WO, risk_category: 'db-migration', rollback_hint: 'DROP TABLE foo' }
    const result = runPreflight(wo, makeDeps())
    const check = result.checks.find(c => c.name === 'rollback_hint_required')
    assert.equal(check?.passed, true)
  })
})

// ─── HOLD Tests ───────────────────────────────────────────────────────────────

describe('Preflight — HOLD (temporäre Bedingungen)', () => {

  it('WO status running → HOLD', () => {
    const result = runPreflight(BASE_WO, makeDeps({
      getActiveWorkorders: () => [{ workorder_id: 'WO-pf-001', status: 'running' }],
    }))
    assert.equal(result.verdict, 'HOLD')
    assert.ok(result.reason?.includes('ausgeführt'))
  })

  it('WO status awaiting_approval → HOLD', () => {
    const result = runPreflight(BASE_WO, makeDeps({
      getActiveWorkorders: () => [{ workorder_id: 'WO-pf-001', status: 'awaiting_approval' }],
    }))
    assert.equal(result.verdict, 'HOLD')
  })

  it('blocked_by nicht in active_workorders → HOLD', () => {
    const wo = { ...BASE_WO, blocked_by: ['WO-dep-999'] }
    const result = runPreflight(wo, makeDeps({ getActiveWorkorders: () => [] }))
    assert.equal(result.verdict, 'HOLD')
    assert.ok(result.reason?.includes('WO-dep-999'))
  })

  it('blocked_by mit running dependency → HOLD', () => {
    const wo = { ...BASE_WO, blocked_by: ['WO-dep-001'] }
    const result = runPreflight(wo, makeDeps({
      getActiveWorkorders: () => [{ workorder_id: 'WO-dep-001', status: 'running' }],
    }))
    assert.equal(result.verdict, 'HOLD')
  })

  it('Scope-Lock Konflikt → HOLD', () => {
    const result = runPreflight(BASE_WO, makeDeps({
      checkScopeConflict: () => ({
        conflicting_run_id: 'RUN-concurrent',
        conflicting_files:  ['services/nutrition-api/src/utils/metrics.ts'],
      }),
    }))
    assert.equal(result.verdict, 'HOLD')
    assert.ok(result.reason?.includes('Scope-Lock'))
  })

  it('DB-Migration-Lock aktiv bei db-migration WO → HOLD', () => {
    const wo: Workorder = { ...BASE_WO, risk_category: 'db-migration', rollback_hint: 'DROP TABLE foo',
      agent_id: 'db-migration-agent' }
    const result = runPreflight(wo, makeDeps({
      isDbMigrationLocked: () => ({ locked: true, run_id: 'RUN-other-migration' }),
    }))
    assert.equal(result.verdict, 'HOLD')
    assert.ok(result.reason?.includes('DB-Migration-Lock'))
  })

  it('DB-Migration-Lock aktiv bei standard WO → GO (kein relevanter Lock)', () => {
    const result = runPreflight(BASE_WO, makeDeps({
      isDbMigrationLocked: () => ({ locked: true, run_id: 'RUN-other-migration' }),
    }))
    assert.equal(result.verdict, 'GO')
  })
})

describe('Preflight — Priorität REJECT > HOLD > GO', () => {

  it('REJECT + HOLD gleichzeitig → Ergebnis ist REJECT', () => {
    // WO ist terminal (REJECT) UND scope conflict (HOLD)
    const result = runPreflight(BASE_WO, makeDeps({
      getActiveWorkorders: () => [{ workorder_id: 'WO-pf-001', status: 'done' }],
      checkScopeConflict:  () => ({ conflicting_run_id: 'RUN-x', conflicting_files: ['services/nutrition-api/src/utils/metrics.ts'] }),
    }))
    assert.equal(result.verdict, 'REJECT')
  })

  it('checks-Array enthält alle 10 Checks', () => {
    const result = runPreflight(BASE_WO, makeDeps())
    assert.equal(result.checks.length, 10)
  })
})
