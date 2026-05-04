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
import { acknowledgeInvalidJsonSpikeBaseline } from '../../state/state-manager'

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

function writeState(runs: Array<Record<string, any>>, extra: Record<string, any> = {}): void {
  fs.writeFileSync(
    path.join(tmpDir, 'system/state/runtime_state.json'),
    JSON.stringify({ active_runs: runs, active_workorders: [], locks: [], approvals: [], scope_locks: [], db_migration_lock: null, system_stop: null, ...extra }),
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

  it('Baseline ignoriert historische failed Runs vor acknowledged_at', () => {
    writeState(
      Array.from({ length: 9 }, (_, i) => ({
        run_id: `R${i + 1}`,
        status: 'failed',
        completed_at: '2026-05-04T01:00:00.000Z',
      })),
      {
        stop_rule_baselines: {
          failed_runs_threshold: {
            acknowledged_at: '2026-05-04T02:00:00.000Z',
            acknowledged_by: 'tom',
            acknowledged_failed_count: 9,
          },
        },
      },
    )
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, failed_runs_threshold: 5 })
    const rule = r.all_rules.find(x => x.rule === 'FAILED_RUNS_THRESHOLD')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 0)
    assert.equal(rule.total_failed, 9)
    assert.equal(rule.ignored_historical_failed, 9)
    assert.equal(rule.baseline_at, '2026-05-04T02:00:00.000Z')
    cleanupTmpDir()
  })

  it('Baseline triggert bei 5 neuen failed Runs nach acknowledged_at', () => {
    writeState(
      [
        ...Array.from({ length: 9 }, (_, i) => ({
          run_id: `R-old-${i + 1}`,
          status: 'failed',
          completed_at: '2026-05-04T01:00:00.000Z',
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          run_id: `R-new-${i + 1}`,
          status: 'failed',
          completed_at: '2026-05-04T03:00:00.000Z',
        })),
      ],
      {
        stop_rule_baselines: {
          failed_runs_threshold: {
            acknowledged_at: '2026-05-04T02:00:00.000Z',
            acknowledged_by: 'tom',
            acknowledged_failed_count: 9,
          },
        },
      },
    )
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, failed_runs_threshold: 5 })
    const rule = r.all_rules.find(x => x.rule === 'FAILED_RUNS_THRESHOLD')!
    assert.equal(rule.triggered, true)
    assert.equal(rule.value, 5)
    assert.equal(rule.total_failed, 14)
    assert.equal(rule.ignored_historical_failed, 9)
    cleanupTmpDir()
  })

  it('Baseline triggert nicht bei 4 neuen failed Runs nach acknowledged_at', () => {
    writeState(
      Array.from({ length: 4 }, (_, i) => ({
        run_id: `R-new-${i + 1}`,
        status: 'failed',
        completed_at: '2026-05-04T03:00:00.000Z',
      })),
      {
        stop_rule_baselines: {
          failed_runs_threshold: {
            acknowledged_at: '2026-05-04T02:00:00.000Z',
            acknowledged_by: 'tom',
            acknowledged_failed_count: 9,
          },
        },
      },
    )
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, failed_runs_threshold: 5 })
    const rule = r.all_rules.find(x => x.rule === 'FAILED_RUNS_THRESHOLD')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 4)
    cleanupTmpDir()
  })

  it('zaehlt Run als neu, wenn er vor Baseline startete aber nach Baseline fehlschlug', () => {
    writeState(
      [
        {
          run_id: 'R-crossing',
          status: 'failed',
          started_at: '2026-05-04T01:00:00.000Z',
          completed_at: '2026-05-04T03:00:00.000Z',
        },
      ],
      {
        stop_rule_baselines: {
          failed_runs_threshold: {
            acknowledged_at: '2026-05-04T02:00:00.000Z',
            acknowledged_by: 'tom',
            acknowledged_failed_count: 0,
          },
        },
      },
    )
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, failed_runs_threshold: 2 })
    const rule = r.all_rules.find(x => x.rule === 'FAILED_RUNS_THRESHOLD')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 1)
    assert.equal(rule.ignored_historical_failed, 0)
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

describe('INVALID_JSON_SPIKE baseline', () => {
  beforeEach(setupTmpDir)

  it('Baseline ignoriert historische invalid_json Samples vor acknowledged_at', () => {
    writeState([], {
      stop_rule_baselines: {
        invalid_json_spike: {
          acknowledged_at: '2026-05-04T02:00:00.000Z',
          acknowledged_by: 'tom',
          acknowledged_total_samples: 3,
          acknowledged_invalid_json_samples: 3,
        },
      },
    })
    writePipelineMetrics([
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:00:00.000Z' },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:01:00.000Z' },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:02:00.000Z' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, invalid_json_rate_max: 0.5, invalid_json_min_samples: 3 })
    const rule = r.all_rules.find(x => x.rule === 'INVALID_JSON_SPIKE')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 0)
    assert.equal(rule.total_samples, 3)
    assert.equal(rule.total_invalid_json, 3)
    assert.equal(rule.ignored_historical_samples, 3)
    assert.equal(rule.counted_samples, 0)
    assert.equal(rule.baseline_at, '2026-05-04T02:00:00.000Z')
    cleanupTmpDir()
  })

  it('Baseline triggert nicht bei neuen valid Samples nach acknowledged_at', () => {
    writeState([], {
      stop_rule_baselines: {
        invalid_json_spike: {
          acknowledged_at: '2026-05-04T02:00:00.000Z',
          acknowledged_by: 'tom',
          acknowledged_total_samples: 3,
          acknowledged_invalid_json_samples: 3,
        },
      },
    })
    writePipelineMetrics([
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:00:00.000Z' },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:01:00.000Z' },
      { tier: 'spark-c', outcome: 'PASS', timestamp: '2026-05-04T03:00:00.000Z' },
      { tier: 'spark-c', outcome: 'PASS', timestamp: '2026-05-04T03:01:00.000Z' },
      { tier: 'spark-c', outcome: 'PASS', timestamp: '2026-05-04T03:02:00.000Z' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, invalid_json_rate_max: 0.5, invalid_json_min_samples: 3 })
    const rule = r.all_rules.find(x => x.rule === 'INVALID_JSON_SPIKE')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 0)
    assert.equal(rule.counted_samples, 3)
    assert.equal(rule.ignored_historical_samples, 2)
    cleanupTmpDir()
  })

  it('Baseline triggert bei neuer invalid_json Spike nach acknowledged_at', () => {
    writeState([], {
      stop_rule_baselines: {
        invalid_json_spike: {
          acknowledged_at: '2026-05-04T02:00:00.000Z',
          acknowledged_by: 'tom',
          acknowledged_total_samples: 3,
          acknowledged_invalid_json_samples: 3,
        },
      },
    })
    writePipelineMetrics([
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:00:00.000Z' },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T03:00:00.000Z' },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T03:01:00.000Z' },
      { tier: 'spark-c', outcome: 'PASS', timestamp: '2026-05-04T03:02:00.000Z' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, invalid_json_rate_max: 0.5, invalid_json_min_samples: 3 })
    const rule = r.all_rules.find(x => x.rule === 'INVALID_JSON_SPIKE')!
    assert.equal(rule.triggered, true)
    assert.equal(rule.value, 67)
    assert.equal(rule.counted_samples, 3)
    assert.equal(rule.ignored_historical_samples, 1)
    cleanupTmpDir()
  })

  it('Baseline respektiert min_samples nach acknowledged_at', () => {
    writeState([], {
      stop_rule_baselines: {
        invalid_json_spike: {
          acknowledged_at: '2026-05-04T02:00:00.000Z',
          acknowledged_by: 'tom',
          acknowledged_total_samples: 3,
          acknowledged_invalid_json_samples: 3,
        },
      },
    })
    writePipelineMetrics([
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:00:00.000Z' },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T03:00:00.000Z' },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T03:01:00.000Z' },
    ])
    const r = evaluateStopRules({ ...DEFAULT_CONFIG, invalid_json_rate_max: 0.5, invalid_json_min_samples: 3 })
    const rule = r.all_rules.find(x => x.rule === 'INVALID_JSON_SPIKE')!
    assert.equal(rule.triggered, false)
    assert.equal(rule.value, 0)
    assert.equal(rule.counted_samples, 2)
    cleanupTmpDir()
  })

  it('acknowledge invalid_json baseline setzt Marker und cleared system_stop nicht', async () => {
    writeState([], {
      system_stop: {
        active: true,
        reason: 'existing stop',
        stopped_at: '2026-05-04T01:00:00.000Z',
        stopped_by: 'test',
      },
    })
    writePipelineMetrics([
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:00:00.000Z' },
      { tier: 'spark-c', outcome: 'invalid_json', timestamp: '2026-05-04T01:01:00.000Z' },
      { tier: 'spark-d', outcome: 'PASS', timestamp: '2026-05-04T01:02:00.000Z' },
    ])

    await acknowledgeInvalidJsonSpikeBaseline('tom', 'historical reviewer invalid_json acknowledged')

    const state = JSON.parse(fs.readFileSync(path.join(tmpDir, 'system/state/runtime_state.json'), 'utf8'))
    assert.equal(state.system_stop?.active, true)
    assert.equal(state.stop_rule_baselines.invalid_json_spike.acknowledged_by, 'tom')
    assert.equal(state.stop_rule_baselines.invalid_json_spike.acknowledged_total_samples, 3)
    assert.equal(state.stop_rule_baselines.invalid_json_spike.acknowledged_invalid_json_samples, 2)
    assert.equal(state.stop_rule_baselines.invalid_json_spike.reason, 'historical reviewer invalid_json acknowledged')
    cleanupTmpDir()
  })
})
