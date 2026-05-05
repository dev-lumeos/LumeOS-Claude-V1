import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  formatInvariantReport,
  parseGitStatus,
  runGovernanceInvariantCheck,
  type GovernanceInvariantFinding,
} from '../governance-invariant-check'

let tmpDir = ''
const realCwd = process.cwd()

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-invariant-check-'))
  for (const dir of ['system/state', 'system/approval', 'docs/specs/Nutrition/00_raw/bls/original']) {
    fs.mkdirSync(path.join(tmpDir, dir), { recursive: true })
  }
  process.chdir(tmpDir)
  writeState()
  writeQueue({})
  writeTokens({})
}

function cleanup(): void {
  process.chdir(realCwd)
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
}

beforeEach(setup)
afterEach(cleanup)

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function isoMinutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

function writeState(extra: Record<string, unknown> = {}): void {
  const state = {
    orchestration_mode: 'claude_code',
    spark_mode: 'mode1',
    active_runs: [],
    active_workorders: [],
    locks: [],
    approvals: [],
    audit_log_path: 'system/state/audit.jsonl',
    rewrite_counters: {},
    scope_locks: [],
    db_migration_lock: null,
    system_stop: null,
    stop_rule_baselines: {
      failed_runs_threshold: {
        acknowledged_at: '2026-05-05T00:00:00.000Z',
        acknowledged_by: 'tom',
        acknowledged_failed_count: 0,
      },
      invalid_json_spike: {
        acknowledged_at: '2026-05-05T00:00:00.000Z',
        acknowledged_by: 'tom',
        acknowledged_total_samples: 0,
        acknowledged_invalid_json_samples: 0,
      },
    },
    ...extra,
  }
  fs.writeFileSync(path.join(tmpDir, 'system/state/runtime_state.json'), JSON.stringify(state, null, 2), 'utf8')
}

function writeQueue(queue: Record<string, unknown>): void {
  fs.writeFileSync(path.join(tmpDir, 'system/approval/queue.json'), JSON.stringify(queue, null, 2), 'utf8')
}

function writeTokens(tokens: Record<string, unknown>): void {
  fs.writeFileSync(path.join(tmpDir, 'system/approval/approvals.json'), JSON.stringify(tokens, null, 2), 'utf8')
}

function runCheck(gitStatus = '') {
  return runGovernanceInvariantCheck({ repoRoot: tmpDir, gitStatus })
}

function finding(result: { findings: GovernanceInvariantFinding[] }, id: string): GovernanceInvariantFinding | undefined {
  return result.findings.find(item => item.id === id)
}

describe('governance invariant checker', () => {
  it('clean empty runtime state exits 0 with no blockers', () => {
    const result = runCheck('## main...origin/main')

    assert.equal(result.exitCode, 0)
    assert.equal(result.hasHighOrCriticalFindings, false)
    assert.equal(result.summary.critical, 0)
    assert.equal(result.summary.high, 0)
  })

  it('reports active_workorder with missing run as critical', () => {
    writeState({
      active_workorders: [{
        workorder_id: 'WO-test-001',
        run_id: 'RUN-missing',
        agent_id: 'micro-executor',
        status: 'running',
        dispatched_at: isoMinutesAgo(5),
      }],
    })

    const result = runCheck()
    const item = finding(result, 'active_workorder.missing_run')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'critical')
    assert.equal(item?.blocks_product_work, true)
    assert.equal(item?.blocks_operator, true)
  })

  it('reports scope lock pointing to terminal run as high', () => {
    writeState({
      active_runs: [{
        run_id: 'RUN-done',
        workorder_id: 'WO-test-001',
        agent_id: 'micro-executor',
        status: 'completed',
        started_at: isoMinutesAgo(30),
        written_files: [],
      }],
      scope_locks: [{
        run_id: 'RUN-done',
        scope_files: ['docs/example.md'],
        locked_at: isoMinutesAgo(30),
        expires_at: isoMinutesFromNow(5),
      }],
    })

    const result = runCheck()
    const item = finding(result, 'scope_lock.terminal_run')

    assert.equal(item?.severity, 'high')
    assert.equal(item?.blocks_product_work, true)
  })

  it('allows awaiting_approval with usable granted enforcement token', () => {
    writeState({
      active_runs: [{
        run_id: 'RUN-awaiting',
        workorder_id: 'WO-test-001',
        agent_id: 'micro-executor',
        status: 'awaiting_approval',
        started_at: isoMinutesAgo(5),
        written_files: [],
      }],
      active_workorders: [{
        workorder_id: 'WO-test-001',
        run_id: 'RUN-awaiting',
        agent_id: 'micro-executor',
        status: 'awaiting_approval',
        dispatched_at: isoMinutesAgo(5),
      }],
      approvals: [{
        approval_id: 'APP-usable',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-awaiting',
        status: 'granted',
        expires_at: isoMinutesFromNow(10),
      }],
    })
    writeTokens({
      'APP-usable': {
        approval_id: 'APP-usable',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-awaiting',
        agent_id: 'micro-executor',
        operation: 'write_docs',
        status: 'granted',
        expires_at: isoMinutesFromNow(10),
        single_use: true,
        use_count: 0,
        max_uses: 1,
      },
    })

    const result = runCheck()

    assert.equal(finding(result, 'awaiting_approval.no_usable_approval'), undefined)
    assert.equal(result.exitCode, 0)
  })

  it('reports awaiting_approval with expired token as cleanup candidate', () => {
    writeState({
      active_runs: [{
        run_id: 'RUN-expired',
        workorder_id: 'WO-test-001',
        agent_id: 'micro-executor',
        status: 'awaiting_approval',
        started_at: isoMinutesAgo(30),
        written_files: [],
      }],
      active_workorders: [{
        workorder_id: 'WO-test-001',
        run_id: 'RUN-expired',
        agent_id: 'micro-executor',
        status: 'awaiting_approval',
        dispatched_at: isoMinutesAgo(30),
      }],
    })
    writeTokens({
      'APP-expired': {
        approval_id: 'APP-expired',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-expired',
        agent_id: 'micro-executor',
        operation: 'write_docs',
        status: 'granted',
        expires_at: isoMinutesAgo(5),
        single_use: true,
        use_count: 0,
        max_uses: 1,
      },
    })

    const result = runCheck()
    const item = finding(result, 'awaiting_approval.cleanup_candidate')

    assert.equal(item?.severity, 'medium')
    assert.match(item?.safe_cleanup_command ?? '', /clear-expired-approval WO-test-001 --run-id RUN-expired --dry-run/)
    assert.equal(result.exitCode, 0)
  })

  it('reports queue denied with pending runtime mirror as high divergence', () => {
    writeState({
      approvals: [{
        approval_id: 'APP-denied',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-1',
        status: 'pending',
      }],
    })
    writeQueue({
      'APP-denied': {
        approval_id: 'APP-denied',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-1',
        agent_id: 'micro-executor',
        reason: 'test',
        risk_category: 'docs',
        affected_files: ['docs/test.md'],
        proposed_action: 'write docs/test.md',
        status: 'denied',
        requested_at: isoMinutesAgo(10),
        expires_at: isoMinutesFromNow(10),
      },
    })

    const result = runCheck()
    const item = finding(result, 'approval.denied_queue_pending_runtime')

    assert.equal(item?.severity, 'high')
    assert.equal(result.exitCode, 1)
  })

  it('reports terminal active_workorder as cleanup candidate', () => {
    writeState({
      active_runs: [{
        run_id: 'RUN-failed',
        workorder_id: 'WO-test-001',
        agent_id: 'micro-executor',
        status: 'failed',
        started_at: isoMinutesAgo(30),
        written_files: [],
      }],
      active_workorders: [{
        workorder_id: 'WO-test-001',
        run_id: 'RUN-failed',
        agent_id: 'micro-executor',
        status: 'failed',
        dispatched_at: isoMinutesAgo(30),
      }],
    })

    const result = runCheck()
    const item = finding(result, 'active_workorder.terminal_cleanup_candidate')

    assert.equal(item?.severity, 'medium')
    assert.match(item?.safe_cleanup_command ?? '', /terminal-wo-reset-cli\.ts clear WO-test-001 --run-id RUN-failed --dry-run/)
  })

  it('does not suggest unsupported cleanup commands for review workorders pointing to terminal runs', () => {
    writeState({
      active_runs: [{
        run_id: 'RUN-review-failed',
        workorder_id: 'WO-test-001',
        agent_id: 'review-agent',
        status: 'failed',
        started_at: isoMinutesAgo(30),
        written_files: [],
      }],
      active_workorders: [{
        workorder_id: 'WO-test-001',
        run_id: 'RUN-review-failed',
        agent_id: 'review-agent',
        status: 'review',
        dispatched_at: isoMinutesAgo(30),
      }],
    })

    const result = runCheck()
    const item = finding(result, 'active_workorder.nonterminal_points_to_terminal_run')

    assert.equal(item?.severity, 'high')
    assert.equal(item?.safe_cleanup_command, undefined)
  })

  it('reports modified runtime artifact from git status', () => {
    const result = runCheck('## main...origin/main\n M system/state/pipeline-metrics.jsonl')
    const item = finding(result, 'artifact.runtime_modified')

    assert.equal(item?.severity, 'medium')
    assert.equal(item?.blocks_product_work, true)
  })

  it('does not report ignored runtime artifacts as modified drift', () => {
    const result = runCheck('## main...origin/main\n!! system/state/runtime_state.json')

    assert.equal(finding(result, 'artifact.runtime_modified'), undefined)
    assert.equal(result.exitCode, 0)
  })

  it('treats ignored raw BLS files as ok and unignored raw BLS as medium', () => {
    const ignored = runCheck('## main...origin/main\n!! docs/specs/Nutrition/00_raw/bls/original/BLS.xlsx')
    const unignored = runCheck('## main...origin/main\n?? docs/specs/Nutrition/00_raw/bls/original/BLS.xlsx')

    assert.equal(finding(ignored, 'artifact.raw_bls_unignored'), undefined)
    assert.equal(finding(unignored, 'artifact.raw_bls_unignored')?.severity, 'medium')
  })

  it('JSON output shape is stable', () => {
    const result = runCheck()

    assert.equal(result.schema_version, 1)
    assert.equal(typeof result.generated_at, 'string')
    assert.equal(Array.isArray(result.findings), true)
    assert.equal(result.product_work_gate.status, 'blocked')
    assert.equal(result.product_work_gate.reason, 'BLS import blocked unless Batch 003 is complete or Tom waives it.')
  })

  it('formats a markdown report', () => {
    const report = formatInvariantReport(runCheck('## main...origin/main'))

    assert.match(report, /# Governance Invariant Check/)
    assert.match(report, /Product work gate: blocked/)
  })
})

describe('parseGitStatus', () => {
  it('parses short status entries with ignored files', () => {
    const entries = parseGitStatus('## main\n M system/state/pipeline-metrics.jsonl\n?? docs/example.md\n!! docs/specs/Nutrition/00_raw/file.xlsx')

    assert.deepEqual(entries.map(e => [e.code, e.path]), [
      ['M', 'system/state/pipeline-metrics.jsonl'],
      ['??', 'docs/example.md'],
      ['!!', 'docs/specs/Nutrition/00_raw/file.xlsx'],
    ])
  })
})
