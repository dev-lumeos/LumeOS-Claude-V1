/**
 * LUMEOS Stop Rules Tests — C.1b
 * Run: npx tsx --test system/control-plane/__tests__/stop-rules.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { evaluateStopRules, runStopRules, DEFAULT_CONFIG, type StopRulesConfig } from '../stop-rules'

let tmpDir = ''

function setupTmpDir(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-stop-rules-'))
  for (const d of ['system/state', 'system/approval', 'system/control-plane'])
    fs.mkdirSync(path.join(tmpDir, d), { recursive: true })
  process.chdir(tmpDir)
}
function cleanupTmpDir(): void {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
}

function writeState(runs: Array<{ run_id: string; status: string }>): void {
  fs.writeFileSync(
    path.join(tmpDir, 'system/state/runtime_state.json'),
    JSON.stringify({ active_runs: runs, active_workorders: [], locks: [], approvals: [], scope_locks: [], db_migration_lock: null, system_stop: null }),
    'utf8',
  )
}

function writeAudit(events: any[]): void {
  fs.writeFileSync(
    path.join(tmpDir, 'system/state/audit.jsonl'),
    events.map(e => JSON.stringify(e)).join('\n'),
    'utf8',
  )
}

function writePipelineAudit(events: any[]): void {
  fs.writeFileSync(
    path.join(tmpDir, 'system/state/pipeline-audit.jsonl'),
    events.map(e => JSON.stringify(e)).join('\n'),
    'utf8',
  )
}

function writePipelineMetrics(rows: any[]): void {
  fs.writeFileSync(
    path.join(tmpDir, 'system/state/pipeline-metrics.jsonl'),
    rows.map(r => JSON.stringify(r)).join('\n'),
    'utf8',
  )
}

function writeQueue(items: any[]): void {
  const q: Record<string, any> = {}
  items.forEach(i => { q[i.approval_id] = i })
  fs.writeFileSync(path.join(tmpDir, 'system/approval/queue.json'), JSON.stringify(q), 'utf8')
}

// ─── FAILED_RUNS_THRESHOLD ────────────────────────────────────────────────────

describe('FAILED_RUNS_THRESHOLD', () => {
  beforeEach(setupTmpDir)

  it('unter Schwellwert → nicht ausgelöst', () => {
    writeState([
      { run_id: 'R1', status: 'failed' },
      { run_id: 'R2', status: 'completed' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, failed_runs_threshold: 3 })
    const rule = r.all_rules.find(x => x.rule === 'FAILED_RUNS_THRESHOLD')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 1)
    cleanupTmpDir()
  })

  it('Schwellwert erreicht → ausgelöst', () => {
    writeState([
      { run_id: 'R1', status: 'failed' },
      { run_id: 'R2', status: 'failed' },
      { run_id: 'R3', status: 'failed' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, failed_runs_threshold: 3 })
    const rule = r.all_rules.find(x => x.rule === 'FAILED_RUNS_THRESHOLD')!
    assert.equal(rule.triggered, true)
    assert.equal(rule.value, 3)
    cleanupTmpDir()
  })
})

// ─── HUMAN_NEEDED_PENDING_MAX ─────────────────────────────────────────────────

describe('HUMAN_NEEDED_PENDING_MAX', () => {
  beforeEach(setupTmpDir)

  it('unter Schwellwert → nicht ausgelöst', () => {
    writeState([])
    writeQueue([{ approval_id: 'A1', status: 'pending' }])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, human_needed_pending_max: 3 })
    const rule = r.all_rules.find(x => x.rule === 'HUMAN_NEEDED_PENDING_MAX')!
    assert.equal(rule.triggered, false)
    cleanupTmpDir()
  })

  it('Schwellwert erreicht → ausgelöst', () => {
    writeState([])
    writeQueue([
      { approval_id: 'A1', status: 'pending' },
      { approval_id: 'A2', status: 'pending' },
      { approval_id: 'A3', status: 'pending' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, human_needed_pending_max: 3 })
    const rule = r.all_rules.find(x => x.rule === 'HUMAN_NEEDED_PENDING_MAX')!
    assert.equal(rule.triggered, true)
    assert.equal(rule.value, 3)
    cleanupTmpDir()
  })

  it('granted/consumed Approvals zählen nicht', () => {
    writeState([])
    writeQueue([
      { approval_id: 'A1', status: 'granted' },
      { approval_id: 'A2', status: 'consumed' },
      { approval_id: 'A3', status: 'pending' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, human_needed_pending_max: 3 })
    const rule = r.all_rules.find(x => x.rule === 'HUMAN_NEEDED_PENDING_MAX')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 1)
    cleanupTmpDir()
  })
})

// ─── INVALID_JSON_SPIKE ───────────────────────────────────────────────────────

describe('INVALID_JSON_SPIKE', () => {
  beforeEach(setupTmpDir)

  it('unter Schwellwert → nicht ausgelöst', () => {
    writeState([])
    writePipelineMetrics([
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: new Date().toISOString() },
      { tier: 'spark-c', outcome: 'PASS', timestamp: new Date().toISOString() },
      { tier: 'spark-c', outcome: 'PASS', timestamp: new Date().toISOString() },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, invalid_json_rate_max: 0.5, invalid_json_min_samples: 3 })
    const rule = r.all_rules.find(x => x.rule === 'INVALID_JSON_SPIKE')!
    assert.equal(rule.triggered, false)  // 33% < 50%
    cleanupTmpDir()
  })

  it('Schwellwert überschritten → ausgelöst', () => {
    writeState([])
    writePipelineMetrics([
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: new Date().toISOString() },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: new Date().toISOString() },
      { tier: 'spark-c', outcome: 'PASS', timestamp: new Date().toISOString() },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, invalid_json_rate_max: 0.5, invalid_json_min_samples: 3 })
    const rule = r.all_rules.find(x => x.rule === 'INVALID_JSON_SPIKE')!
    assert.equal(rule.triggered, true)   // 67% > 50%
    cleanupTmpDir()
  })

  it('zu wenige Samples → nicht ausgelöst (min_samples nicht erreicht)', () => {
    writeState([])
    writePipelineMetrics([
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: new Date().toISOString() },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: new Date().toISOString() },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, invalid_json_rate_max: 0.5, invalid_json_min_samples: 5 })
    const rule = r.all_rules.find(x => x.rule === 'INVALID_JSON_SPIKE')!
    assert.equal(rule.triggered, false)
    cleanupTmpDir()
  })
})

// ─── FILES_SCOPE_VIOLATIONS ───────────────────────────────────────────────────

describe('FILES_SCOPE_VIOLATIONS', () => {
  beforeEach(setupTmpDir)

  it('unter Schwellwert → nicht ausgelöst', () => {
    writeState([])
    writeAudit([
      { event: 'files_scope_violation', reason: 'test' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, scope_violation_max: 2 })
    const rule = r.all_rules.find(x => x.rule === 'FILES_SCOPE_VIOLATIONS')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 1)
    cleanupTmpDir()
  })

  it('Schwellwert erreicht → ausgelöst', () => {
    writeState([])
    writeAudit([
      { event: 'files_scope_violation', reason: 'test1' },
      { event: 'scope_lock_conflict', reason: 'test2' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, scope_violation_max: 2 })
    const rule = r.all_rules.find(x => x.rule === 'FILES_SCOPE_VIOLATIONS')!
    assert.equal(rule.triggered, true)
    assert.equal(rule.value, 2)
    cleanupTmpDir()
  })
})

// ─── ESCALATION_RATE_SPIKE ────────────────────────────────────────────────────

describe('ESCALATION_RATE_SPIKE', () => {
  beforeEach(setupTmpDir)

  it('unter min_samples → nicht ausgelöst', () => {
    writeState([])
    writePipelineAudit([
      { event: 'review_completed', tier: 'spark-c', ts: new Date().toISOString() },
      { event: 'review_escalated', tier: 'spark-c', ts: new Date().toISOString() },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, escalation_min_samples: 5 })
    const rule = r.all_rules.find(x => x.rule === 'ESCALATION_RATE_SPIKE')!
    assert.equal(rule.triggered, false)
    cleanupTmpDir()
  })

  it('Schwellwert überschritten → ausgelöst', () => {
    writeState([])
    const completions = Array.from({ length: 5 }, (_, i) => ({
      event: 'review_completed', tier: 'spark-c', ts: new Date().toISOString(),
    }))
    const escalations = Array.from({ length: 5 }, (_, i) => ({
      event: 'review_escalated', tier: 'spark-c', ts: new Date().toISOString(),
    }))
    writePipelineAudit([...completions, ...escalations])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, escalation_rate_max: 0.8, escalation_min_samples: 5 })
    const rule = r.all_rules.find(x => x.rule === 'ESCALATION_RATE_SPIKE')!
    assert.equal(rule.triggered, true)   // 100% > 80%
    cleanupTmpDir()
  })
})

// ─── any_triggered + runStopRules dry-run ─────────────────────────────────────

describe('evaluateStopRules — any_triggered', () => {
  beforeEach(setupTmpDir)

  it('keine Verletzungen → any_triggered false', () => {
    writeState([{ run_id: 'R1', status: 'completed' }])
    const r = evaluateStopRules()
    assert.equal(r.any_triggered, false)
    assert.equal(r.triggered_rules.length, 0)
    cleanupTmpDir()
  })

  it('Verletzung → any_triggered true + triggered_rules befüllt', () => {
    writeState([
      { run_id: 'R1', status: 'failed' },
      { run_id: 'R2', status: 'failed' },
      { run_id: 'R3', status: 'failed' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, failed_runs_threshold: 3 })
    assert.equal(r.any_triggered, true)
    assert.ok(r.triggered_rules.some(x => x.rule === 'FAILED_RUNS_THRESHOLD'))
    cleanupTmpDir()
  })
})

describe('runStopRules dry-run', () => {
  beforeEach(setupTmpDir)

  it('dry-run mit Verletzung → stopped: false', async () => {
    writeState([
      { run_id: 'R1', status: 'failed' },
      { run_id: 'R2', status: 'failed' },
      { run_id: 'R3', status: 'failed' },
    ])
    const { evaluation, stopped } = await runStopRules(
      { ...DEFAULT_CONFIG, failed_runs_threshold: 3 }, true
    )
    assert.equal(evaluation.any_triggered, true)
    assert.equal(stopped, false)  // dry-run: kein echter Stop
    cleanupTmpDir()
  })
})
