/**
 * LUMEOS Night-Run-Policy Tests — C.3
 * Run: npx tsx --test system/control-plane/__tests__/night-run-policy.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  DEFAULT_POLICY, loadPolicy, savePolicy,
  isAllowedInNightRun, checkNightRunReadiness,
  activateNightRun, deactivateNightRun,
  AUTONOMOUS_CATEGORIES, REQUIRES_PRIOR_APPROVAL, CAUTIOUS_CATEGORIES,
} from '../night-run-policy'

let tmpDir = ''

function setupTmpDir(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-night-'))
  for (const d of ['system/control-plane', 'system/state', 'system/approval'])
    fs.mkdirSync(path.join(tmpDir, d), { recursive: true })
  process.chdir(tmpDir)
}
function cleanupTmpDir(): void {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
}

function writeState(opts: { running?: number; failed?: number } = {}): void {
  const runs = [
    ...Array.from({ length: opts.running ?? 0 }, (_, i) => ({ run_id: `R-r${i}`, status: 'running' })),
    ...Array.from({ length: opts.failed  ?? 0 }, (_, i) => ({ run_id: `R-f${i}`, status: 'failed'  })),
  ]
  fs.writeFileSync(
    path.join(tmpDir, 'system/state/runtime_state.json'),
    JSON.stringify({ active_runs: runs, scope_locks: [], db_migration_lock: null, system_stop: null }),
    'utf8',
  )
}
function writeQueue(pending: number): void {
  const q: Record<string, any> = {}
  for (let i = 0; i < pending; i++) q[`A${i}`] = { approval_id: `A${i}`, status: 'pending' }
  fs.writeFileSync(path.join(tmpDir, 'system/approval/queue.json'), JSON.stringify(q), 'utf8')
}

// ─── isAllowedInNightRun ──────────────────────────────────────────────────────

describe('isAllowedInNightRun — Night-Run inaktiv', () => {
  it('inaktive Policy → BLOCKED', () => {
    const r = isAllowedInNightRun('standard', { ...DEFAULT_POLICY, night_run_active: false })
    assert.equal(r.verdict, 'BLOCKED')
  })
})

describe('isAllowedInNightRun — autonomous Kategorien', () => {
  const activePolicy = { ...DEFAULT_POLICY, night_run_active: true }

  it('standard → AUTONOMOUS', () => {
    assert.equal(isAllowedInNightRun('standard', activePolicy).verdict, 'AUTONOMOUS')
  })
  it('docs → AUTONOMOUS', () => {
    assert.equal(isAllowedInNightRun('docs', activePolicy).verdict, 'AUTONOMOUS')
  })
  it('i18n → AUTONOMOUS', () => {
    assert.equal(isAllowedInNightRun('i18n', activePolicy).verdict, 'AUTONOMOUS')
  })
  it('test → AUTONOMOUS', () => {
    assert.equal(isAllowedInNightRun('test', activePolicy).verdict, 'AUTONOMOUS')
  })
})

describe('isAllowedInNightRun — REQUIRES_APPROVAL Kategorien', () => {
  const activePolicy = { ...DEFAULT_POLICY, night_run_active: true }

  it('db-migration → REQUIRES_APPROVAL', () => {
    assert.equal(isAllowedInNightRun('db-migration', activePolicy).verdict, 'REQUIRES_APPROVAL')
  })
  it('payments → REQUIRES_APPROVAL', () => {
    assert.equal(isAllowedInNightRun('payments', activePolicy).verdict, 'REQUIRES_APPROVAL')
  })
  it('medical → REQUIRES_APPROVAL', () => {
    assert.equal(isAllowedInNightRun('medical', activePolicy).verdict, 'REQUIRES_APPROVAL')
  })
  it('release → REQUIRES_APPROVAL', () => {
    assert.equal(isAllowedInNightRun('release', activePolicy).verdict, 'REQUIRES_APPROVAL')
  })
})

describe('isAllowedInNightRun — cautious Kategorien', () => {
  const activePolicy = { ...DEFAULT_POLICY, night_run_active: true }

  it('auth → CAUTIOUS', () => {
    assert.equal(isAllowedInNightRun('auth', activePolicy).verdict, 'CAUTIOUS')
  })
  it('security → CAUTIOUS', () => {
    assert.equal(isAllowedInNightRun('security', activePolicy).verdict, 'CAUTIOUS')
  })
})

// ─── checkNightRunReadiness ────────────────────────────────────────────────────

describe('checkNightRunReadiness', () => {
  beforeEach(setupTmpDir)

  it('night_run inaktiv → nicht ready', () => {
    writeState()
    writeQueue(0)
    const r = checkNightRunReadiness({ ...DEFAULT_POLICY, night_run_active: false })
    assert.equal(r.ready, false)
    assert.ok(r.checks.find(c => c.name === 'night_run_mode_enabled' && !c.passed))
    cleanupTmpDir()
  })

  it('aktiv + sauber → ready', () => {
    writeState({ running: 0, failed: 0 })
    writeQueue(0)
    const r = checkNightRunReadiness({ ...DEFAULT_POLICY, night_run_active: true })
    // Stop-Rules: keine Verletzungen, keine laufenden Runs, keine pending Approvals
    const runnersCheck = r.checks.find(c => c.name === 'no_active_runs')
    assert.equal(runnersCheck?.passed, true)
    const approvalCheck = r.checks.find(c => c.name === 'no_pending_approvals')
    assert.equal(approvalCheck?.passed, true)
    cleanupTmpDir()
  })

  it('aktiv + aktive Runs → nicht ready', () => {
    writeState({ running: 1 })
    writeQueue(0)
    const r = checkNightRunReadiness({ ...DEFAULT_POLICY, night_run_active: true })
    assert.ok(r.checks.find(c => c.name === 'no_active_runs' && !c.passed))
    cleanupTmpDir()
  })

  it('aktiv + pending Approvals → nicht ready', () => {
    writeState()
    writeQueue(2)
    const r = checkNightRunReadiness({ ...DEFAULT_POLICY, night_run_active: true })
    assert.ok(r.checks.find(c => c.name === 'no_pending_approvals' && !c.passed))
    cleanupTmpDir()
  })

  it('Readiness-Checks: genau 5 Checks', () => {
    writeState()
    writeQueue(0)
    const r = checkNightRunReadiness({ ...DEFAULT_POLICY, night_run_active: true })
    assert.equal(r.checks.length, 5)
    cleanupTmpDir()
  })
})

// ─── activate / deactivate ────────────────────────────────────────────────────

describe('activateNightRun / deactivateNightRun', () => {
  beforeEach(setupTmpDir)

  it('aktivieren → night_run_active = true', () => {
    activateNightRun()
    const p = loadPolicy()
    assert.equal(p.night_run_active, true)
    cleanupTmpDir()
  })

  it('deaktivieren → night_run_active = false', () => {
    activateNightRun()
    deactivateNightRun()
    const p = loadPolicy()
    assert.equal(p.night_run_active, false)
    cleanupTmpDir()
  })
})
