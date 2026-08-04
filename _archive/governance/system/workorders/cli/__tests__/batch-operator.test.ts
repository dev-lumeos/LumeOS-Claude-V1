import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  applySafeCleanups,
  buildAutonomyHandoff,
  buildOperatorReport,
  collectOperatorStatus,
  decideEndState,
  runConfiguredOutputReview,
  runDocumentationImpactStep,
  selectRunnableBatch,
  type CommandRunner,
} from '../batch-operator'
import { loadBatch, type LoadedBatch } from '../batch-loader'

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
      documentation_impact: { type: 'object' },
    },
  }, null, 2), 'utf8')
  process.chdir(tmpDir)
  writeBatch()
  writeProfile()
  writeState()
  writeQueue({})
  writeTokens({})
}

function writeProfile(): void {
  const profilePath = path.join(tmpDir, 'system/project-profiles/profiles/lumeos.json')
  fs.mkdirSync(path.dirname(profilePath), { recursive: true })
  fs.writeFileSync(profilePath, JSON.stringify({
    profile_version: 1,
    project_id: 'lumeos',
    display_name: 'LumeOS Test',
    repo_root: tmpDir,
    governance_root: 'system',
    specs_root: 'docs/specs',
    workorders_root: 'system/workorders',
    reports_root: 'system/reports',
    memory_root: 'system/memory',
    learning_root: 'docs/project/governance-learning',
    runtime_state_root: 'system/state',
    approval_root: 'system/approval',
    raw_data_paths: ['docs/specs/Nutrition/00_raw/'],
    ignored_local_paths: ['docs/specs/Nutrition/00_raw/'],
    product_gate: { status: 'closed', reason: 'Test product gate closed.', conditional_planning_allowed: false },
    forbidden_paths: ['system/state/runtime_state.json', 'system/approval/queue.json', 'docs/specs/Nutrition/00_raw/**'],
    forbidden_commands: ['supabase db reset', 'supabase db push'],
    required_checkers: ['governance-invariant-check'],
    default_operator_batch: 'system/workorders/nutrition/batches/BATCH-test.md',
    default_branch_prefix: 'goal/',
    promotion_policy: {},
    codex_worker_policy: {
      enabled: true,
      allowed_agents: ['senior-coding-agent'],
      require_explicit_workorder_flag: true,
      default_timeout_ms: 120000,
    },
  }, null, 2), 'utf8')
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
    '| 2 | WO-test-002.md | WO-test-002 | Schema Foundation | db-migration | yes |',
    '| 3 | WO-test-003.md | WO-test-003 | Food Core Tables | db-migration | yes |',
  ].join('\n'), 'utf8')

  fs.writeFileSync(path.join(tmpDir, 'system/workorders/nutrition/drafts/WO-test-001.md'), [
    '```yaml',
    'workorder_id: WO-test-001',
    'agent_id: micro-executor',
    'task: Write audit report at docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md',
    'risk_category: docs',
    'requires_approval: false',
    'blocked_by: []',
    'scope_files: ["docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md"]',
    'documentation_impact:',
    '  required: false',
    '  domains:',
    '    - "none"',
    '  ssot_files: []',
    '  documentation_agent_required: false',
    '  na_reason: "Test fixture has no SSOT documentation impact beyond its expected output assertion."',
    'acceptance_criteria: ["docs updated"]',
    'negative_constraints: ["no supabase db push", "no supabase db reset", "no approval grant", "no runtime edit"]',
    '```',
  ].join('\n'), 'utf8')

  fs.writeFileSync(path.join(tmpDir, 'system/workorders/nutrition/drafts/WO-test-002.md'), [
    '```yaml',
    'workorder_id: WO-test-002',
    'agent_id: db-migration-agent',
    'task: Write migration file named YYYYMMDD_NNN_nutrition_schema_foundation.sql',
    'risk_category: db-migration',
    'requires_approval: true',
    'blocked_by: ["WO-test-001"]',
    'scope_files: ["supabase/migrations/"]',
    'documentation_impact:',
    '  required: false',
    '  domains:',
    '    - "historical_workorder"',
    '  ssot_files: []',
    '  documentation_agent_required: false',
    '  na_reason: "pre-existing archived workorder before documentation-impact gate"',
    'acceptance_criteria: ["migration file written"]',
    'negative_constraints: ["no supabase db push", "no supabase db reset", "no approval grant", "no runtime edit"]',
    'rollback_hint: revert migration file',
    '```',
  ].join('\n'), 'utf8')

  fs.writeFileSync(path.join(tmpDir, 'system/workorders/nutrition/drafts/WO-test-003.md'), [
    '```yaml',
    'workorder_id: WO-test-003',
    'agent_id: db-migration-agent',
    'task: Write YYYYMMDD_NNN_nutrition_food_core_tables.sql and packages/types/src/nutrition/foods.ts plus packages/types/src/nutrition/index.ts',
    'risk_category: db-migration',
    'requires_approval: true',
    'blocked_by: ["WO-test-002"]',
    'scope_files: ["supabase/migrations/", "packages/types/src/nutrition/foods.ts", "packages/types/src/nutrition/index.ts"]',
    'documentation_impact:',
    '  required: false',
    '  domains:',
    '    - "historical_workorder"',
    '  ssot_files: []',
    '  documentation_agent_required: false',
    '  na_reason: "pre-existing archived workorder before documentation-impact gate"',
    'acceptance_criteria: ["food core migration and type files written"]',
    'negative_constraints: ["no supabase db push", "no supabase db reset", "no approval grant", "no runtime edit"]',
    'rollback_hint: revert food core migration',
    '```',
  ].join('\n'), 'utf8')
}

function writeExpectedOutput(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function rewriteWo001DocumentationImpact(required: boolean): void {
  const filePath = path.join(tmpDir, 'system/workorders/nutrition/drafts/WO-test-001.md')
  const content = fs.readFileSync(filePath, 'utf8')
  const replacement = required
    ? [
      'documentation_impact:',
      '  required: true',
      '  domains:',
      '    - "workflow"',
      '  ssot_files:',
      '    - "docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md"',
      '  documentation_agent_required: true',
      '  na_reason: null',
    ].join('\n')
    : [
      'documentation_impact:',
      '  required: false',
      '  domains:',
      '    - "none"',
      '  ssot_files: []',
      '  documentation_agent_required: false',
      '  na_reason: "Test fixture has no SSOT documentation impact beyond its expected output assertion."',
    ].join('\n')
  const updated = content.replace(/documentation_impact:\n[\s\S]*?(?=acceptance_criteria:)/, replacement + '\n')
  fs.writeFileSync(filePath, updated, 'utf8')
}

function writeSingleWoBatch(): void {
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
  ].join('\n'), 'utf8')
}

const meaningfulDoc = [
  '# Audit Report',
  '',
  '## Summary',
  '',
  'This audit report captures a meaningful governance output for operator completion checks.',
  '',
  '## Details',
  '',
  'The body is intentionally long enough to satisfy the markdown quality gate and prove that the output is not a stub artifact.',
].join('\n')

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

  it('defaults to auto orchestration and reports codex bootstrap as actual path', () => {
    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    const report = buildOperatorReport(status)

    assert.equal(status.orchestration.requested_orchestration_mode, 'auto')
    assert.equal(status.orchestration.actual_orchestration_mode, 'codex_bootstrap')
    assert.equal(status.orchestration.codex_role, 'orchestrator')
    assert.match(report, /requested_orchestration_mode: auto/)
    assert.match(report, /actual_orchestration_mode: codex_bootstrap/)
  })

  it('marks Spark1 orchestration as pending pre-dispatch handoff during status collection', () => {
    const status = collectOperatorStatus(batchPath(), {
      gitStatus: cleanGit,
      orchestrationMode: 'spark1_orchestrated',
    })

    assert.equal(decideEndState(status), 'READY_TO_RUN')
    assert.equal(status.orchestration.actual_orchestration_mode, 'not_run')
    assert.equal(status.orchestration.spark1_orchestrator_used, false)
    assert.match(status.orchestration.worker_assignment_result, /pending Spark1/)
    assert.match(buildOperatorReport(status), /operator must run orchestrator-agent before worker dispatch/)
  })

  it('includes project profile information when requested', () => {
    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit, projectId: 'lumeos' })
    const report = buildOperatorReport(status)

    assert.equal(status.projectProfile?.project_id, 'lumeos')
    assert.match(report, /Project profile: lumeos \(LumeOS Test\)/)
    assert.match(report, /Product gate: closed - Test product gate closed/)
    assert.match(report, /--project lumeos/)
  })

  it('classifies stub markdown approvals as DO_NOT_GRANT and incomplete outputs as not complete', () => {
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', '# Title\n\n## Purpose\n\nThis doc\n')
    writeState({
      active_runs: [{ run_id: 'RUN-stub', workorder_id: 'WO-test-001', agent_id: 'micro-executor', status: 'blocked', started_at: isoMinutesAgo(5), completed_at: isoMinutesAgo(4), written_files: ['docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'] }],
      active_workorders: [{ workorder_id: 'WO-test-001', run_id: 'RUN-stub', agent_id: 'micro-executor', status: 'awaiting_approval', dispatched_at: isoMinutesAgo(5) }],
    })
    writeQueue({
      'APP-stub-001': {
        approval_id: 'APP-stub-001',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-stub',
        agent_id: 'micro-executor',
        reason: 'docs write',
        risk_category: 'docs',
        affected_files: ['docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'],
        proposed_action: 'write docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md',
        status: 'pending',
        requested_at: isoMinutesAgo(5),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    const approval = status.approvalStops.find(item => item.approvalId === 'APP-stub-001')
    const completion = status.workorderCompletions.find(item => item.workorderId === 'WO-test-001')

    assert.equal(approval?.classification, 'DO_NOT_GRANT')
    assert.equal(completion?.complete, false)
    assert.match(completion?.expectedOutputs[0]?.reason ?? '', /headings|meaningful body lines|body is too short|stub phrase/)
  })

  it('does not treat missing expected workorder outputs as DONE', () => {
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', meaningfulDoc)
    writeExpectedOutput('supabase/migrations/20240522_001_nutrition_schema_foundation.sql', '-- schema')

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(decideEndState(status), 'READY_TO_RUN')
    assert.equal(status.workorderCompletions.find(w => w.workorderId === 'WO-test-001')?.complete, true)
    assert.equal(status.workorderCompletions.find(w => w.workorderId === 'WO-test-002')?.complete, true)
    assert.equal(status.workorderCompletions.find(w => w.workorderId === 'WO-test-003')?.complete, false)
  })

  it('reports DONE only when every expected output exists', () => {
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', meaningfulDoc)
    writeExpectedOutput('supabase/migrations/20240522_001_nutrition_schema_foundation.sql', '-- schema')
    writeExpectedOutput('supabase/migrations/20240522_002_nutrition_food_core_tables.sql', '-- food core')
    writeExpectedOutput('packages/types/src/nutrition/foods.ts', 'export interface NutritionFood {}')
    writeExpectedOutput('packages/types/src/nutrition/index.ts', 'export * from "./foods"')

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(decideEndState(status), 'DONE')
    assert.ok(status.workorderCompletions.every(w => w.complete))
  })

  it('blocks DONE when required documentation handling has not run', () => {
    writeSingleWoBatch()
    rewriteWo001DocumentationImpact(true)
    fs.mkdirSync(path.join(tmpDir, 'docs/project'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md'), '# Runbook\n', 'utf8')
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', meaningfulDoc)

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.workorderCompletions.every(w => w.complete), true)
    assert.equal(decideEndState(status), 'FIX_REQUIRED')
    assert.match(status.documentationHandling[0]?.detail ?? '', /documentation_completed audit event is missing/)
  })

  it('allows DONE after required documentation step and SSOT_SYNC_CHECK pass', async () => {
    writeSingleWoBatch()
    rewriteWo001DocumentationImpact(true)
    fs.mkdirSync(path.join(tmpDir, 'docs/project'), { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md'), '# Runbook\n', 'utf8')
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', meaningfulDoc)

    const outcomes = await runDocumentationImpactStep(loadBatch(batchPath()))
    assert.equal(outcomes.some(item => item.status === 'failed'), false)
    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.documentationHandling[0]?.status, 'pass')
    assert.equal(decideEndState(status), 'DONE')
  })

  it('selects only the first incomplete workorder for dispatch', () => {
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', meaningfulDoc)

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    const runnable = selectRunnableBatch(batchPath(), status)

    assert.equal(runnable?.workorders.length, 1)
    assert.equal(runnable?.workorders[0].parsed.workorder_id, 'WO-test-002')
  })

  it('removes completed blockers from selected incomplete workorder', () => {
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', meaningfulDoc)
    writeExpectedOutput('supabase/migrations/20240522_001_nutrition_schema_foundation.sql', '-- schema')

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })
    const runnable = selectRunnableBatch(batchPath(), status)

    assert.equal(runnable?.workorders.length, 1)
    assert.equal(runnable?.workorders[0].parsed.workorder_id, 'WO-test-003')
    assert.deepEqual(runnable?.workorders[0].parsed.blocked_by, [])
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

  it('does not block DONE on unplanned project output artifacts', () => {
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', meaningfulDoc)
    writeExpectedOutput('supabase/migrations/20240522_001_nutrition_schema_foundation.sql', '-- schema')
    writeExpectedOutput('supabase/migrations/20240520_001_nutrition_food_core_tables.sql', '-- food core')
    writeExpectedOutput('packages/types/src/nutrition/foods.ts', 'export interface NutritionFood {}')
    writeExpectedOutput('packages/types/src/nutrition/index.ts', 'export * from "./foods"')

    const status = collectOperatorStatus(batchPath(), {
      gitStatus: {
        branch: 'goal/governance-operator-loop',
        short: '## goal/governance-operator-loop\n?? docs/specs/Nutrition/00_raw/',
        entries: [{ code: '??', path: 'docs/specs/Nutrition/00_raw/', category: 'workorder_outputs' }],
      },
    })

    assert.equal(status.unexpectedDirty.length, 0)
    assert.equal(decideEndState(status), 'DONE')
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

  it('suggests resolved approval cleanup for granted docs approval on terminal blocked run', () => {
    writeExpectedOutput('docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md', '# done')
    writeState({
      active_runs: [{ run_id: 'RUN-resolved', workorder_id: 'WO-test-001', agent_id: 'micro-executor', status: 'blocked', started_at: isoMinutesAgo(30), completed_at: isoMinutesAgo(25), written_files: ['docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'] }],
      active_workorders: [{ workorder_id: 'WO-test-001', run_id: 'RUN-resolved', agent_id: 'micro-executor', status: 'awaiting_approval', dispatched_at: isoMinutesAgo(30) }],
      approvals: [{ approval_id: 'APP-resolved', workorder_id: 'WO-test-001', run_id: 'RUN-resolved', status: 'granted', expires_at: new Date(Date.now() + 60_000).toISOString() }],
    })
    writeQueue({
      'APP-resolved': {
        approval_id: 'APP-resolved',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-resolved',
        agent_id: 'micro-executor',
        reason: 'docs write',
        risk_category: 'docs',
        affected_files: ['docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'],
        proposed_action: 'write docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md',
        status: 'granted',
        requested_at: isoMinutesAgo(35),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    })
    writeTokens({
      'APP-resolved': {
        approval_id: 'APP-resolved',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-resolved',
        agent_id: 'micro-executor',
        status: 'granted',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.cleanupSuggestions.length, 1)
    assert.equal(status.cleanupSuggestions[0].kind, 'resolved_approval')
    assert.equal(status.cleanupSuggestions[0].safeToApply, true)
    assert.match(status.cleanupSuggestions[0].dryRunCommand, /clear-resolved-approval WO-test-001 --run-id RUN-resolved --dry-run/)
    assert.match(status.cleanupSuggestions[0].confirmCommand, /clear-resolved-approval WO-test-001 --run-id RUN-resolved --confirm/)
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

  it('treats a terminal workorder with missing expected outputs as cleanup-needed, not complete', () => {
    writeState({
      active_runs: [{
        run_id: 'RUN-missing-output',
        workorder_id: 'WO-test-001',
        agent_id: 'micro-executor',
        status: 'completed',
        started_at: isoMinutesAgo(10),
        completed_at: isoMinutesAgo(5),
        written_files: [],
      }],
      active_workorders: [{
        workorder_id: 'WO-test-001',
        run_id: 'RUN-missing-output',
        agent_id: 'micro-executor',
        status: 'failed',
        dispatched_at: isoMinutesAgo(10),
      }],
    })

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit })

    assert.equal(status.workorderCompletions.find(w => w.workorderId === 'WO-test-001')?.complete, false)
    assert.equal(status.cleanupSuggestions.some(item =>
      item.kind === 'terminal_active_workorder' &&
      item.workorderId === 'WO-test-001' &&
      item.runId === 'RUN-missing-output' &&
      item.safeToApply,
    ), true)
    assert.equal(decideEndState(status), 'NEEDS_SAFE_CLEANUP')
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

    assert.match(report, /## Autonomy Handoff/)
    assert.match(report, /final_state:/)
    assert.match(report, /blocker_type:/)
    assert.match(report, /dossier_command:/)
    assert.match(report, /learning_recommended:/)
    assert.match(report, /codex_worker_candidate:/)
    assert.match(report, /Exact next command:/)
    assert.match(report, /run-batch-operator\.ts .*--continue/)
    assert.match(report, /Doctor command:/)
    assert.match(report, /run-batch-operator\.ts .*--doctor/)
    assert.match(report, /Suggested dossier:/)
    assert.match(report, /system\\reports\\batch-dossier\.ts --batch/)
  })

  it('builds stable autonomy handoff for approval stops', () => {
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

    const status = collectOperatorStatus(batchPath(), { gitStatus: cleanGit, projectId: 'lumeos' })
    const handoff = buildAutonomyHandoff(status)

    assert.equal(handoff.final_state, 'NEEDS_TOM_APPROVAL')
    assert.equal(handoff.tom_action_required, true)
    assert.equal(handoff.dossier_recommended, true)
    assert.equal(handoff.learning_recommended, false)
    assert.match(handoff.next_action, /Review pending approval/)
    assert.match(handoff.dossier_command, /batch-dossier\.ts --batch/)
    assert.equal(handoff.product_gate_status.status, 'closed')
    assert.deepEqual(Object.keys(handoff).sort(), [
      'blocker_type',
      'blockers',
      'codex_worker_candidate',
      'codex_worker_reason',
      'diagnosis',
      'dossier_command',
      'dossier_recommended',
      'doctor_command',
      'final_state',
      'forbidden_actions',
      'learning_recommended',
      'learning_record_suggestion',
      'next_action',
      'product_gate_status',
      'safe_cleanup_available',
      'safe_cleanup_command',
      'tom_action_required',
    ].sort())
  })

  it('builds safe cleanup handoff with dry-run command first', () => {
    writeState({
      active_runs: [{ run_id: 'RUN-failed', workorder_id: 'WO-test-001', agent_id: 'micro-executor', status: 'failed', started_at: isoMinutesAgo(10), completed_at: isoMinutesAgo(5), written_files: [] }],
      active_workorders: [{ workorder_id: 'WO-test-001', run_id: 'RUN-failed', agent_id: 'micro-executor', status: 'failed', dispatched_at: isoMinutesAgo(10) }],
    })

    const handoff = buildAutonomyHandoff(collectOperatorStatus(batchPath(), { gitStatus: cleanGit }))

    assert.equal(handoff.final_state, 'NEEDS_SAFE_CLEANUP')
    assert.equal(handoff.safe_cleanup_available, true)
    assert.match(handoff.safe_cleanup_command ?? '', /--dry-run/)
    assert.doesNotMatch(handoff.safe_cleanup_command ?? '', /--confirm/)
  })

  it('runs configured reviewer for already output-complete workorders', async () => {
    writeExpectedOutput('docs/project/reviewed-output.md', [
      '# Reviewed Output',
      '',
      '## Summary',
      '',
      'This output is complete enough for configured reviewer handoff validation.',
      '',
      '## Details',
      '',
      'The operator must not silently skip review just because the workorder output already exists.',
    ].join('\n'))

    const batch: LoadedBatch = {
      batchPath: batchPath(),
      status: 'ready_to_run',
      entries: [],
      workorders: [{
        filename: 'WO-review.md',
        filepath: path.join(tmpDir, 'WO-review.md'),
        validationErrors: [],
        needsApproval: false,
        parsed: {
          workorder_id: 'WO-review',
          agent_id: 'senior-coding-agent',
          task: 'Review existing local-only UI output.',
          risk_category: 'standard',
          scope_files: ['docs/project/reviewed-output.md'],
          expected_outputs: ['docs/project/reviewed-output.md'],
        },
      }],
    }

    let reviewCalls = 0
    const outcomes = await runConfiguredOutputReview(batch, {
      force: true,
      callFastReviewer: async () => {
        reviewCalls++
        return JSON.stringify({
          status: 'PASS',
          risk: 'LOW',
          confidence: 0.99,
          violations: [],
          recommendations: [],
          summary: 'review ok',
          requires_claude: false,
        })
      },
    })

    assert.equal(reviewCalls, 1)
    assert.deepEqual(outcomes, [{
      workorder_id: 'WO-review',
      status: 'dispatched',
      detail: 'Configured reviewer passed via spark-c',
    }])
    const audit = fs.readFileSync(path.join(tmpDir, 'system/state/pipeline-audit.jsonl'), 'utf8')
    assert.match(audit, /"wo_id":"WO-review"/)
    assert.match(audit, /"event":"review_completed"/)
    assert.match(audit, /"run_id":"REVIEW-/)
  })

  it('uses bounded review payloads for large expected output files', async () => {
    writeExpectedOutput('docs/project/large-reviewed-output.md', [
      '# Large Reviewed Output',
      '',
      '## Summary',
      '',
      'A'.repeat(9000),
      '',
      '## Tail',
      '',
      'The end of the file remains visible to the reviewer.',
    ].join('\n'))

    const batch: LoadedBatch = {
      batchPath: batchPath(),
      status: 'ready_to_run',
      entries: [],
      workorders: [{
        filename: 'WO-large-review.md',
        filepath: path.join(tmpDir, 'WO-large-review.md'),
        validationErrors: [],
        needsApproval: false,
        parsed: {
          workorder_id: 'WO-large-review',
          agent_id: 'senior-coding-agent',
          task: 'Review large output without overloading reviewer context.',
          risk_category: 'standard',
          scope_files: ['docs/project/large-reviewed-output.md'],
          expected_outputs: ['docs/project/large-reviewed-output.md'],
        },
      }],
    }

    let capturedUserMessage = ''
    const outcomes = await runConfiguredOutputReview(batch, {
      force: true,
      callFastReviewer: async (_systemPrompt, userMessage) => {
        capturedUserMessage = userMessage
        return JSON.stringify({
          status: 'PASS',
          risk: 'LOW',
          confidence: 0.99,
          violations: [],
          recommendations: [],
          summary: 'review ok',
          requires_claude: false,
        })
      },
    })

    assert.equal(outcomes[0]?.status, 'dispatched')
    assert.match(capturedUserMessage, /review-payload-truncated/)
    assert.match(capturedUserMessage, /The end of the file remains visible/)
  })
})
