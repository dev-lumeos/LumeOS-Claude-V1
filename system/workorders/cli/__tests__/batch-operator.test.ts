import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  applySafeCleanups,
  buildOperatorReport,
  collectOperatorStatus,
  decideEndState,
  type CommandRunner,
} from '../batch-operator'

let tmpDir = ''
const realCwd = process.cwd()

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-batch-operator-'))
  for (const dir of [
    'system/workorders/nutrition/batches',
    'system/workorders/nutrition/drafts',
    'system/workorders/schemas',
    'system/state',
    'system/approval',
    'system/agent-registry',
  ]) {
    fs.mkdirSync(path.join(tmpDir, dir), { recursive: true })
  }
  fs.writeFileSync(path.join(tmpDir, 'system/agent-registry/approval_operation_types.json'), JSON.stringify({
    write_docs: {
      allowed_tools: ['write'],
      allowed_paths: ['docs/**'],
      requires_post_review: false,
      max_uses: 1,
      expires_minutes: 60,
    },
    write_migration: {
      allowed_tools: ['write'],
      allowed_paths: ['supabase/migrations/**'],
      requires_post_review: true,
      max_uses: 1,
      expires_minutes: 30,
    },
  }, null, 2))
  fs.writeFileSync(path.join(tmpDir, 'system/workorders/schemas/workorder.schema.json'), JSON.stringify({
    type: 'object',
    required: ['workorder_id', 'agent_id', 'task', 'scope_files', 'acceptance_criteria', 'negative_constraints'],
    properties: {
      workorder_id: { type: 'string' },
      agent_id: { type: 'string' },
      task: { type: 'string' },
      scope_files: { type: 'array', items: { type: 'string' } },
      acceptance_criteria: { type: 'array', items: { type: 'string' } },
      negative_constraints: { type: 'array', items: { type: 'string' } },
      risk_category: { type: 'string' },
      requires_approval: { type: 'boolean' },
      blocked_by: { type: 'array', items: { type: 'string' } },
      rollback_hint: { type: 'string' },
    },
  }, null, 2), 'utf8')
  process.chdir(tmpDir)
  writeBatch()
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

function batchPath(): string {
  return path.join(tmpDir, 'system/workorders/nutrition/batches/BATCH-test.md')
}

function writeBatch(): void {
  fs.writeFileSync(batchPath(), [
    '# Batch',
    '',
    '## Status',
    'approved',
    '',
    '## Included Workorders',
    '| Order | File | Workorder ID | Title | Risk | Approval |',
    '|---|---|---|---|---|---|',
    '| 1 | WO-test-001.md | WO-test-001 | Docs | docs | no |',
    '| 2 | WO-test-002.md | WO-test-002 | Migration | db-migration | yes |',
  ].join('\n'), 'utf8')

  fs.writeFileSync(path.join(tmpDir, 'system/workorders/nutrition/drafts/WO-test-001.md'), [
    '```yaml',
    'workorder_id: WO-test-001',
    'agent_id: micro-executor',
    'task: Write docs example',
    'risk_category: docs',
    'requires_approval: false',
    'blocked_by: []',
    'scope_files: ["docs/example.md"]',
    'acceptance_criteria: ["docs updated"]',
    'negative_constraints: ["no supabase db push", "no supabase db reset", "no approval grant", "no runtime edit"]',
    '```',
  ].join('\n'), 'utf8')

  fs.writeFileSync(path.join(tmpDir, 'system/workorders/nutrition/drafts/WO-test-002.md'), [
    '```yaml',
    'workorder_id: WO-test-002',
    'agent_id: db-migration-agent',
    'task: Write migration file',
    'risk_category: db-migration',
    'requires_approval: true',
    'blocked_by: ["WO-test-001"]',
    'scope_files: ["supabase/migrations/001_test.sql"]',
    'acceptance_criteria: ["migration file written"]',
    'negative_constraints: ["no supabase db push", "no supabase db reset", "no approval grant", "no runtime edit"]',
    'rollback_hint: revert migration file',
    '```',
  ].join('\n'), 'utf8')
}

function writeState(extra: Record<string, unknown> = {}): void {
  fs.writeFileSync(path.join(tmpDir, 'system/state/runtime_state.json'), JSON.stringify({
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
        acknowledged_at: '2026-05-04T00:00:00.000Z',
        acknowledged_by: 'tom',
        acknowledged_failed_count: 0,
      },
      invalid_json_spike: {
        acknowledged_at: '2026-05-04T00:00:00.000Z',
        acknowledged_by: 'tom',
        acknowledged_total_samples: 0,
        acknowledged_invalid_json_samples: 0,
      },
    },
    ...extra,
  }, null, 2), 'utf8')
}

function writeQueue(queue: Record<string, unknown>): void {
  fs.writeFileSync(path.join(tmpDir, 'system/approval/queue.json'), JSON.stringify(queue, null, 2), 'utf8')
}

function writeTokens(tokens: Record<string, unknown>): void {
  fs.writeFileSync(path.join(tmpDir, 'system/approval/approvals.json'), JSON.stringify(tokens, null, 2), 'utf8')
}

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

const cleanGit = {
  branch: 'goal/governance-operator-loop',
  short: '',
  entries: [],
}

describe('batch operator status', () => {
  it('reports clean status without mutations', () => {
    const before = fs.readFileSync(path.join(tmpDir, 'system/state/runtime_state.json'), 'utf8')

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.git.branch, 'goal/governance-operator-loop')
    assert.equal(status.systemStop.active, false)
    assert.equal(status.stopRules.anyTriggered, false)
    assert.equal(status.failedRunsBaseline.status, 'SET')
    assert.equal(status.invalidJsonBaseline.status, 'SET')
    assert.deepEqual(status.scopeLocks, [])
    assert.equal(status.dbMigrationLock.locked, false)
    assert.equal(status.activeWorkorders.length, 0)
    assert.equal(status.activeRuns.length, 0)
    assert.equal(status.relatedApprovals.length, 0)
    assert.equal(fs.readFileSync(path.join(tmpDir, 'system/state/runtime_state.json'), 'utf8'), before)
  })

  it('reports active approval and exact grant command', () => {
    writeQueue({
      'APP-test-001': {
        approval_id: 'APP-test-001',
        workorder_id: 'WO-test-002',
        run_id: 'RUN-test-002',
        agent_id: 'db-migration-agent',
        reason: 'write_migration requires approval',
        risk_category: 'db-migration',
        affected_files: ['supabase/migrations/001_test.sql'],
        proposed_action: 'write:supabase/migrations/001_test.sql',
        operation: 'write_migration',
        tool: 'write',
        status: 'pending',
        requested_at: isoMinutesAgo(5),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    const report = buildOperatorReport(status)

    assert.equal(status.approvalStops.length, 1)
    assert.equal(status.approvalStops[0].classification, 'NEEDS_HUMAN_SQL_REVIEW')
    assert.match(report, /APP-test-001/)
    assert.match(report, /cmd\.exe \/c node node_modules\\tsx\\dist\\cli\.mjs system\\approval\\approval-cli\.ts grant APP-test-001/)
    assert.match(report, /grant only allows file write, not db push\/reset/)
  })

  it('suggests expired approval cleanup with exact commands', () => {
    writeState({
      active_runs: [{ run_id: 'RUN-expired', workorder_id: 'WO-test-001', agent_id: 'micro-executor', status: 'awaiting_approval', started_at: isoMinutesAgo(80), written_files: [] }],
      active_workorders: [{ workorder_id: 'WO-test-001', run_id: 'RUN-expired', agent_id: 'micro-executor', status: 'awaiting_approval', dispatched_at: isoMinutesAgo(80) }],
      approvals: [{ approval_id: 'APP-expired', workorder_id: 'WO-test-001', run_id: 'RUN-expired', status: 'granted', expires_at: new Date(Date.now() + 60_000).toISOString() }],
    })
    writeQueue({
      'APP-expired': {
        approval_id: 'APP-expired',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-expired',
        agent_id: 'micro-executor',
        reason: 'docs write',
        risk_category: 'docs',
        affected_files: ['docs/example.md'],
        proposed_action: 'write docs/example.md',
        status: 'granted',
        requested_at: isoMinutesAgo(90),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    })
    writeTokens({
      'APP-expired': {
        approval_id: 'APP-expired',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-expired',
        agent_id: 'micro-executor',
        status: 'granted',
        expires_at: isoMinutesAgo(5),
      },
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.cleanupSuggestions.length, 1)
    assert.equal(status.cleanupSuggestions[0].kind, 'expired_approval')
    assert.equal(status.cleanupSuggestions[0].safeToApply, true)
    assert.match(status.cleanupSuggestions[0].dryRunCommand, /clear-expired-approval WO-test-001 --run-id RUN-expired --dry-run/)
    assert.match(status.cleanupSuggestions[0].confirmCommand, /clear-expired-approval WO-test-001 --run-id RUN-expired --confirm/)
  })

  it('suggests terminal failed cleanup', () => {
    writeState({
      active_runs: [{ run_id: 'RUN-failed', workorder_id: 'WO-test-001', agent_id: 'micro-executor', status: 'failed', started_at: isoMinutesAgo(10), completed_at: isoMinutesAgo(5), written_files: [] }],
      active_workorders: [{ workorder_id: 'WO-test-001', run_id: 'RUN-failed', agent_id: 'micro-executor', status: 'failed', dispatched_at: isoMinutesAgo(10) }],
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.cleanupSuggestions.length, 1)
    assert.equal(status.cleanupSuggestions[0].kind, 'terminal_active_workorder')
    assert.match(status.cleanupSuggestions[0].dryRunCommand, /terminal-wo-reset-cli\.ts clear WO-test-001 --run-id RUN-failed --dry-run/)
  })

  it('reports stop-rule block', () => {
    writeState({
      active_runs: Array.from({ length: 5 }, (_, i) => ({
        run_id: `RUN-fail-${i}`,
        workorder_id: 'WO-test-001',
        agent_id: 'micro-executor',
        status: 'failed',
        started_at: '2026-05-04T01:00:00.000Z',
        completed_at: '2026-05-04T01:10:00.000Z',
        written_files: [],
      })),
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.stopRules.anyTriggered, true)
    assert.equal(decideEndState(status), 'STOP_RULE_BLOCKED')
  })

  it('approval stop behavior returns NEEDS_TOM_APPROVAL and never grants', () => {
    writeQueue({
      'APP-pending': {
        approval_id: 'APP-pending',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-pending',
        agent_id: 'micro-executor',
        reason: 'docs write',
        risk_category: 'docs',
        affected_files: ['docs/example.md'],
        proposed_action: 'write docs/example.md',
        operation: 'write_docs',
        tool: 'write',
        status: 'pending',
        requested_at: isoMinutesAgo(5),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    const report = buildOperatorReport(status)

    assert.equal(decideEndState(status), 'NEEDS_TOM_APPROVAL')
    assert.doesNotMatch(report, /approval-cli\.ts grant APP-pending --confirm/)
    assert.equal(JSON.parse(fs.readFileSync(path.join(tmpDir, 'system/approval/queue.json'), 'utf8'))['APP-pending'].status, 'pending')
  })

  it('operator report never contains Supabase execution commands', () => {
    const report = buildOperatorReport(collectOperatorStatus(batchPath(), { gitStatus: cleanGit }))

    assert.doesNotMatch(report, /supabase db push/)
    assert.doesNotMatch(report, /supabase db reset/)
  })

  it('blocks ambiguous cleanup suggestions', () => {
    writeState({
      active_workorders: [
        { workorder_id: 'WO-test-001', run_id: 'RUN-dup', agent_id: 'micro-executor', status: 'failed', dispatched_at: isoMinutesAgo(10) },
        { workorder_id: 'WO-test-001', run_id: 'RUN-dup', agent_id: 'micro-executor', status: 'failed', dispatched_at: isoMinutesAgo(9) },
      ],
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.cleanupSuggestions.length, 1)
    assert.equal(status.cleanupSuggestions[0].safeToApply, false)
    assert.match(status.cleanupSuggestions[0].why, /ambiguous/)
  })
})

describe('apply safe cleanups', () => {
  it('only uses official cleanup paths after dry-run confirms one target', async () => {
    const calls: string[] = []
    const runner: CommandRunner = (command) => {
      calls.push(command)
      return { code: 0, stdout: '[DRY-RUN] Would remove 1 entry:', stderr: '' }
    }
    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    status.cleanupSuggestions = [{
      kind: 'terminal_active_workorder',
      workorderId: 'WO-test-001',
      runId: 'RUN-1',
      approvalId: undefined,
      safeToApply: true,
      why: 'terminal failed',
      dryRunCommand: 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\terminal-wo-reset-cli.ts clear WO-test-001 --run-id RUN-1 --dry-run',
      confirmCommand: 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\terminal-wo-reset-cli.ts clear WO-test-001 --run-id RUN-1 --confirm',
    }]

    const result = await applySafeCleanups(status, runner)

    assert.equal(result.applied.length, 1)
    assert.equal(calls.length, 2)
    assert.ok(calls.every(c => c.includes('system\\control-plane\\terminal-wo-reset-cli.ts')))
    assert.ok(calls.every(c => !c.includes('approval-cli.ts grant')))
  })

  it('does not confirm cleanup when dry-run is ambiguous', async () => {
    const calls: string[] = []
    const runner: CommandRunner = (command) => {
      calls.push(command)
      return { code: 1, stdout: '', stderr: 'Refused: ambiguous match' }
    }
    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    status.cleanupSuggestions = [{
      kind: 'terminal_active_workorder',
      workorderId: 'WO-test-001',
      runId: 'RUN-1',
      approvalId: undefined,
      safeToApply: true,
      why: 'terminal failed',
      dryRunCommand: 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\terminal-wo-reset-cli.ts clear WO-test-001 --run-id RUN-1 --dry-run',
      confirmCommand: 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\terminal-wo-reset-cli.ts clear WO-test-001 --run-id RUN-1 --confirm',
    }]

    const result = await applySafeCleanups(status, runner)

    assert.equal(result.applied.length, 0)
    assert.equal(result.refused.length, 1)
    assert.equal(calls.length, 1)
  })

  it('report output contains exact next command', () => {
    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    const report = buildOperatorReport(status)

    assert.match(report, /Exact next command:/)
    assert.match(report, /run-batch-operator\.ts .*--continue/)
  })
})
