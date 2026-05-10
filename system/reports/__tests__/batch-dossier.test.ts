import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  buildBatchDossier,
  classifyDossierPath,
  formatBatchDossierMarkdown,
  writeBatchDossier,
} from '../batch-dossier'

let tmpDir = ''
const realCwd = process.cwd()

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-batch-dossier-'))
  for (const dir of [
    'system/workorders/nutrition/batches',
    'system/workorders/nutrition/drafts',
    'system/state',
    'system/approval',
    'docs/specs/Nutrition/00_raw/bls/original',
    'docs/specs/Nutrition/06_workorder_planning',
  ]) {
    fs.mkdirSync(path.join(tmpDir, dir), { recursive: true })
  }
  writeBatch()
  writeWorkorder('WO-test-001', ['docs/specs/Nutrition/06_workorder_planning/test-report.md'])
  process.chdir(tmpDir)
}

function cleanup(): void {
  process.chdir(realCwd)
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
}

beforeEach(setup)
afterEach(cleanup)

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function writeJson(relativePath: string, value: unknown): void {
  write(relativePath, JSON.stringify(value, null, 2))
}

function writeProjectProfile(): void {
  writeJson('system/project-profiles/profiles/lumeos.json', {
    profile_version: 1,
    project_id: 'lumeos',
    display_name: 'LumeOS',
    repo_root: tmpDir.replace(/\\/g, '/'),
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
    product_gate: { status: 'closed', reason: 'Profile gate closed.', conditional_planning_allowed: false },
    forbidden_paths: ['.env', 'system/state/runtime_state.json', 'docs/specs/Nutrition/00_raw/**'],
    forbidden_commands: ['supabase db reset'],
    required_checkers: ['governance-invariant-check'],
    default_operator_batch: 'system/workorders/nutrition/batches/BATCH-test.md',
    default_branch_prefix: 'goal/',
    promotion_policy: { require_clean_worktree: true },
    codex_worker_policy: {
      enabled: true,
      allowed_agents: ['senior-coding-agent'],
      require_explicit_workorder_flag: true,
      default_timeout_ms: 120000,
    },
  })
}

function appendJsonl(relativePath: string, value: unknown): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.appendFileSync(fullPath, `${JSON.stringify(value)}\n`, 'utf8')
}

function batchPath(): string {
  return path.join(tmpDir, 'system/workorders/nutrition/batches/BATCH-test.md')
}

function writeBatch(): void {
  write('system/workorders/nutrition/batches/BATCH-test.md', [
    '# Test Batch',
    '',
    '## Status',
    'planned',
    '',
    '## Included Workorders',
    '| Order | File | Workorder ID | Title | Risk | Approval |',
    '|---|---|---|---|---|---|',
    '| 1 | WO-test-001.md | WO-test-001 | Test WO | docs | no |',
    '',
  ].join('\n'))
}

function writeWorkorder(workorderId: string, expectedOutputs: string[]): void {
  write(`system/workorders/nutrition/drafts/${workorderId}.md`, [
    `# ${workorderId}`,
    '',
    '```yaml',
    `workorder_id: ${workorderId}`,
    'agent_id: docs-agent',
    'risk_category: docs',
    'requires_approval: false',
    'task: |',
    '  Produce a planning report.',
    'expected_outputs:',
    ...expectedOutputs.map(item => `  - "${item}"`),
    'scope_files:',
    ...expectedOutputs.map(item => `  - "${item}"`),
    'acceptance_criteria:',
    '  - "All expected outputs exist"',
    '```',
  ].join('\n'))
}

function writeCleanRuntime(): void {
  writeJson('system/state/runtime_state.json', {
    active_runs: [],
    active_workorders: [],
    approvals: [],
    scope_locks: [],
    db_migration_lock: null,
    system_stop: null,
    stop_rule_baselines: {
      failed_runs_threshold: { acknowledged_at: '2026-05-05T00:00:00.000Z' },
      invalid_json_spike: { acknowledged_at: '2026-05-05T00:00:00.000Z' },
    },
  })
  writeJson('system/approval/queue.json', {})
  writeJson('system/approval/approvals.json', {})
}

describe('batch dossier reporter', () => {
  it('builds a not-run dossier without writing files', () => {
    writeCleanRuntime()
    const before = fs.existsSync(path.join(tmpDir, 'system/reports/batches'))
    const dossier = buildBatchDossier({
      batchFile: batchPath(),
      repoRoot: tmpDir,
      gitStatus: '## goal/test\n',
      generatedAt: '2026-05-05T00:00:00.000Z',
      runCheckers: false,
    })

    assert.equal(dossier.final_state, 'NOT_RUN')
    assert.equal(dossier.runs.length, 0)
    assert.equal(dossier.workorders[0]?.workorder_id, 'WO-test-001')
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/reports/batches')), before)
  })

  it('classifies a completed workorder as done when outputs exist', () => {
    writeCleanRuntime()
    write('docs/specs/Nutrition/06_workorder_planning/test-report.md', 'done\n')
    writeJson('system/state/runtime_state.json', {
      active_runs: [{
        run_id: 'RUN-1',
        workorder_id: 'WO-test-001',
        agent_id: 'docs-agent',
        status: 'completed',
        started_at: '2026-05-05T00:00:00.000Z',
        completed_at: '2026-05-05T00:01:00.000Z',
      }],
      active_workorders: [],
      approvals: [],
      scope_locks: [],
      db_migration_lock: null,
      system_stop: null,
      stop_rule_baselines: {},
    })

    const dossier = buildBatchDossier({
      batchFile: batchPath(),
      repoRoot: tmpDir,
      gitStatus: '## goal/test\n',
      generatedAt: '2026-05-05T00:00:00.000Z',
      runCheckers: false,
    })

    assert.equal(dossier.final_state, 'DONE')
    assert.equal(dossier.outputs[0]?.exists, true)
    assert.match(formatBatchDossierMarkdown(dossier), /Final Classification[\s\S]*DONE/)
  })

  it('reports pending approvals and stops for Tom approval', () => {
    writeCleanRuntime()
    writeJson('system/approval/queue.json', {
      'APP-1': {
        approval_id: 'APP-1',
        workorder_id: 'WO-test-001',
        run_id: 'RUN-1',
        agent_id: 'docs-agent',
        status: 'pending',
        operation: 'write_docs',
        proposed_action: 'write:docs/specs/Nutrition/06_workorder_planning/test-report.md',
        affected_files: ['docs/specs/Nutrition/06_workorder_planning/test-report.md'],
      },
    })

    const dossier = buildBatchDossier({
      batchFile: batchPath(),
      repoRoot: tmpDir,
      gitStatus: '## goal/test\n',
      generatedAt: '2026-05-05T00:00:00.000Z',
      runCheckers: false,
    })

    assert.equal(dossier.final_state, 'NEEDS_TOM_APPROVAL')
    assert.equal(dossier.approvals[0]?.approval_id, 'APP-1')
    assert.match(dossier.next_action, /Tom/i)
  })

  it('includes cleanup events from audit logs', () => {
    writeCleanRuntime()
    appendJsonl('system/state/audit.jsonl', {
      ts: '2026-05-05T00:00:00.000Z',
      event: 'stale_review_workorder_cleanup',
      workorder_id: 'WO-test-001',
      run_id: 'RUN-1',
      reason: 'terminal failed run',
    })

    const dossier = buildBatchDossier({
      batchFile: batchPath(),
      repoRoot: tmpDir,
      gitStatus: '## goal/test\n',
      generatedAt: '2026-05-05T00:00:00.000Z',
      runCheckers: false,
    })

    assert.equal(dossier.cleanups.length, 1)
    assert.equal(dossier.cleanups[0]?.event, 'stale_review_workorder_cleanup')
  })

  it('keeps JSON output shape stable', () => {
    writeCleanRuntime()
    const dossier = buildBatchDossier({
      batchFile: batchPath(),
      repoRoot: tmpDir,
      gitStatus: '## goal/test\n',
      generatedAt: '2026-05-05T00:00:00.000Z',
      runCheckers: false,
    })

    assert.deepEqual(Object.keys(dossier).sort(), [
      'approvals',
      'batch_file',
      'batch_id',
      'batch_status',
      'checkers',
      'cleanups',
      'codex_worker_runs',
      'dependency_graph',
      'expected_outputs',
      'final_state',
      'generated_at',
      'git_status',
      'next_action',
      'outputs',
      'reviews',
      'runs',
      'schema_version',
      'stop_rules',
      'workorders',
    ].sort())
  })

  it('includes project profile metadata when requested', () => {
    writeCleanRuntime()
    writeProjectProfile()

    const dossier = buildBatchDossier({
      batchFile: batchPath(),
      repoRoot: tmpDir,
      gitStatus: '## goal/test\n',
      generatedAt: '2026-05-05T00:00:00.000Z',
      runCheckers: false,
      projectId: 'lumeos',
    })

    assert.equal(dossier.project_profile?.project_id, 'lumeos')
    assert.match(formatBatchDossierMarkdown(dossier), /Project profile: lumeos \(LumeOS\)/)
  })

  it('writes markdown and json only when explicitly requested', () => {
    writeCleanRuntime()
    const dossier = buildBatchDossier({
      batchFile: batchPath(),
      repoRoot: tmpDir,
      gitStatus: '## goal/test\n',
      generatedAt: '2026-05-05T00:00:00.000Z',
      runCheckers: false,
    })

    assert.equal(fs.existsSync(path.join(tmpDir, 'system/reports/batches')), false)
    const result = writeBatchDossier(dossier, { repoRoot: tmpDir })
    assert.equal(fs.existsSync(result.markdownPath), true)
    assert.equal(fs.existsSync(result.jsonPath), true)
    assert.match(fs.readFileSync(result.markdownPath, 'utf8'), /# Batch Dossier/)
  })

  it('classifies runtime artifacts separately from project outputs', () => {
    assert.equal(classifyDossierPath('system/state/pipeline-metrics.jsonl'), 'runtime_artifact')
    assert.equal(classifyDossierPath('system/approval/queue.json'), 'runtime_artifact')
    assert.equal(classifyDossierPath('docs/specs/Nutrition/06_workorder_planning/report.md'), 'project_output')
  })

  it('does not treat raw BLS local-only files as project outputs', () => {
    assert.equal(classifyDossierPath('docs/specs/Nutrition/00_raw/bls/original/BLS.xlsx'), 'raw_local_only')
  })

  it('does not treat ignored dependency folders as project outputs', () => {
    assert.equal(classifyDossierPath('packages/types/node_modules/'), 'unknown')
  })

  it('includes Codex worker report metadata when present', () => {
    writeCleanRuntime()
    write('system/reports/codex-worker/2026-05-10T00-00-00-000Z-WO-test-001-report.md', [
      '# Codex Worker Execution Report',
      '',
      '## Exit Code',
      '0',
      '',
      '## Final State',
      'DONE',
      '',
      '## Duration',
      '123 ms',
      '',
      '## Stdout',
      '```',
      'Final State: DONE',
      '```',
      '',
      '## Stderr',
      '```',
      '',
      '```',
    ].join('\n'))

    const dossier = buildBatchDossier({
      batchFile: batchPath(),
      repoRoot: tmpDir,
      gitStatus: '## goal/test\n',
      generatedAt: '2026-05-05T00:00:00.000Z',
      runCheckers: false,
    })

    assert.equal(dossier.codex_worker_runs.length, 1)
    assert.equal(dossier.codex_worker_runs[0]?.workorder_id, 'WO-test-001')
    assert.equal(dossier.codex_worker_runs[0]?.final_state, 'DONE')
  })
})
