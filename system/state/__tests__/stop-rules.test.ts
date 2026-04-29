/**
 * LUMEOS Kill-Switch / System Stop Tests — C.1
 *
 * Run:
 *   npx tsx --test system/state/__tests__/stop-rules.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  triggerSystemStop,
  clearSystemStop,
  isSystemStopped,
} from '../state-manager'

import { runPreflight, type PreflightDeps } from '../../control-plane/scheduler-preflight'
import type { Workorder } from '../../control-plane/dispatcher'

// ─── Test Isolation ────────────────────────────────────────────────────────────

let tmpDir = ''

function setupTmpDir(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-stop-'))
  fs.mkdirSync(path.join(tmpDir, 'system', 'state'), { recursive: true })
  process.chdir(tmpDir)
}

function cleanupTmpDir(): void {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
}

// ─── State-Manager Tests ───────────────────────────────────────────────────────

describe('System Stop — triggerSystemStop + isSystemStopped', () => {
  beforeEach(setupTmpDir)

  it('initial: isSystemStopped = false', () => {
    assert.equal(isSystemStopped().stopped, false)
    cleanupTmpDir()
  })

  it('nach trigger: stopped = true mit reason', async () => {
    await triggerSystemStop('Test-Stopp')
    const s = isSystemStopped()
    assert.equal(s.stopped, true)
    if (s.stopped) assert.equal(s.reason, 'Test-Stopp')
    cleanupTmpDir()
  })

  it('trigger setzt stopped_at Timestamp', async () => {
    const before = new Date().toISOString()
    await triggerSystemStop('timestamp test')
    const s = isSystemStopped()
    assert.equal(s.stopped, true)
    if (s.stopped) assert.ok(s.stopped_at >= before)
    cleanupTmpDir()
  })

  it('trigger ist idempotent — zweites trigger überschreibt reason', async () => {
    await triggerSystemStop('erster Grund')
    await triggerSystemStop('zweiter Grund')
    const s = isSystemStopped()
    assert.equal(s.stopped, true)
    if (s.stopped) assert.equal(s.reason, 'zweiter Grund')
    cleanupTmpDir()
  })
})

describe('System Stop — clearSystemStop', () => {
  beforeEach(setupTmpDir)

  it('nach clear: stopped = false', async () => {
    await triggerSystemStop('wird gecleart')
    await clearSystemStop()
    assert.equal(isSystemStopped().stopped, false)
    cleanupTmpDir()
  })

  it('clear ohne vorherigen trigger: kein Fehler', async () => {
    await assert.doesNotReject(clearSystemStop())
    assert.equal(isSystemStopped().stopped, false)
    cleanupTmpDir()
  })

  it('trigger → clear → trigger wieder möglich', async () => {
    await triggerSystemStop('erster Stop')
    await clearSystemStop()
    await triggerSystemStop('zweiter Stop')
    const s = isSystemStopped()
    assert.equal(s.stopped, true)
    if (s.stopped) assert.equal(s.reason, 'zweiter Stop')
    cleanupTmpDir()
  })
})

// ─── Preflight-Integration Tests ──────────────────────────────────────────────

const BASE_WO: Workorder = {
  workorder_id: 'WO-stop-001', agent_id: 'micro-executor',
  task: 'Add helper function to metrics.ts',
  scope_files: ['services/nutrition-api/src/utils/metrics.ts'],
  context_files: [], acceptance_files: [],
  acceptance_criteria: ['function exists', 'tests pass', 'no lint errors'],
  negative_constraints: ['no side effects', 'no new deps', 'no env access', 'no breaking changes'],
  required_skills: [], optional_skills: [], blocked_by: [],
}

function makeStopDeps(stopped: boolean, reason = 'Test-Stopp'): PreflightDeps {
  return {
    getActiveWorkorders: () => [],
    checkScopeConflict:  () => null,
    isDbMigrationLocked: () => ({ locked: false }),
    loadAgents: () => ({ 'micro-executor': { type: 'executor' } }),
    isSystemStopped: () => stopped ? { stopped: true, reason } : { stopped: false },
  }
}

describe('Preflight — System Stop Integration', () => {

  it('System Stop aktiv → Preflight HOLD', () => {
    const result = runPreflight(BASE_WO, makeStopDeps(true, 'Manueller Stop'))
    assert.equal(result.verdict, 'HOLD')
    assert.ok(result.reason?.includes('System Stop'))
    assert.ok(result.reason?.includes('Manueller Stop'))
  })

  it('System Stop aktiv → erster Check system_not_stopped ist failed', () => {
    const result = runPreflight(BASE_WO, makeStopDeps(true))
    const check = result.checks.find(c => c.name === 'system_not_stopped')
    assert.ok(check)
    assert.equal(check.passed, false)
    assert.equal(check.verdict, 'HOLD')
  })

  it('System Stop inaktiv → check system_not_stopped passed', () => {
    const result = runPreflight(BASE_WO, makeStopDeps(false))
    const check = result.checks.find(c => c.name === 'system_not_stopped')
    assert.ok(check)
    assert.equal(check.passed, true)
  })

  it('System Stop HOLD hat Vorrang vor REJECT (schlechtestes Ergebnis ist REJECT)', () => {
    // stop aktiv (HOLD) + kein Agent (REJECT) → REJECT gewinnt
    const deps = makeStopDeps(true)
    deps.loadAgents = () => ({})  // kein Agent → REJECT
    const result = runPreflight({ ...BASE_WO, agent_id: 'nonexistent' }, deps)
    assert.equal(result.verdict, 'REJECT')  // REJECT > HOLD
  })

  it('System Stop inaktiv + alles ok → GO', () => {
    const result = runPreflight(BASE_WO, makeStopDeps(false))
    assert.equal(result.verdict, 'GO')
  })

  it('checks-Array hat jetzt 11 Checks (system_not_stopped neu)', () => {
    const result = runPreflight(BASE_WO, makeStopDeps(false))
    assert.equal(result.checks.length, 11)
  })
})
