import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  classifyPromotionPath,
  promoteMergeBranch,
  pushMain,
  reviewBranch,
  statusPromotionGovernance,
  type PromotionCommandResult,
  type PromotionCommandRunner,
} from '../promotion-governance'

function runner(outputs: Record<string, PromotionCommandResult>, calls: string[] = []): PromotionCommandRunner {
  return (args) => {
    const key = args.join(' ')
    calls.push(key)
    return outputs[key] ?? { code: 0, stdout: '', stderr: '' }
  }
}

const cleanReviewOutputs: Record<string, PromotionCommandResult> = {
  'rev-parse --abbrev-ref HEAD': { code: 0, stdout: 'goal/test\n', stderr: '' },
  'status --short': { code: 0, stdout: '', stderr: '' },
  'show-ref --verify --quiet refs/heads/main': { code: 0, stdout: '', stderr: '' },
  'show-ref --verify --quiet refs/heads/goal/test': { code: 0, stdout: '', stderr: '' },
  'rev-list --count main..goal/test': { code: 0, stdout: '1\n', stderr: '' },
  'merge-base --is-ancestor goal/test main': { code: 1, stdout: '', stderr: '' },
  'merge-tree main goal/test': { code: 0, stdout: '', stderr: '' },
  'diff --name-status main..goal/test': { code: 0, stdout: 'A\tdocs/project/test.md\nA\tsystem/control-plane/__tests__/test.test.ts\n', stderr: '' },
  'diff --stat main..goal/test': { code: 0, stdout: ' docs/project/test.md | 1 +\n', stderr: '' },
}

function writeProfile(repoRoot: string): void {
  const dir = path.join(repoRoot, 'system/project-profiles/profiles')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'lumeos.json'), JSON.stringify({
    profile_version: 1,
    project_id: 'lumeos',
    display_name: 'LumeOS',
    repo_root: repoRoot.replace(/\\/g, '/'),
    governance_root: 'system',
    specs_root: 'docs/specs',
    workorders_root: 'system/workorders',
    reports_root: 'system/reports',
    memory_root: 'system/memory',
    learning_root: 'docs/project/governance-learning',
    runtime_state_root: 'system/state',
    approval_root: 'system/approval',
    raw_data_paths: ['private/raw/'],
    ignored_local_paths: ['private/raw/'],
    product_gate: { status: 'closed', reason: 'Profile gate closed.', conditional_planning_allowed: false },
    forbidden_paths: ['.env', 'system/state/runtime_state.json', 'private/raw/**'],
    forbidden_commands: ['supabase db reset'],
    required_checkers: ['governance-invariant-check'],
    default_operator_batch: 'system/workorders/batches/BATCH-test.md',
    default_branch_prefix: 'goal/',
    promotion_policy: { require_clean_worktree: true },
    codex_worker_policy: {
      enabled: true,
      allowed_agents: ['senior-coding-agent'],
      require_explicit_workorder_flag: true,
      default_timeout_ms: 120000,
    },
  }), 'utf8')
}

describe('promotion governance review', () => {
  it('marks a clean docs-only branch merge ready', () => {
    const result = reviewBranch('goal/test', { runner: runner(cleanReviewOutputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.decision, 'MERGE_READY')
    assert.equal(result.summary.critical, 0)
    assert.equal(result.summary.high, 0)
    assert.equal(result.changed_files.some(item => item.category === 'docs'), true)
  })

  it('blocks a dirty worktree', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'status --short': { code: 0, stdout: ' M system/control-plane/foo.ts\n', stderr: '' },
    }

    const result = reviewBranch('goal/test', { runner: runner(outputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.decision, 'DO_NOT_MERGE')
    assert.equal(result.findings.some(item => item.id === 'git.dirty_worktree' && item.blocks_merge), true)
  })

  it('blocks runtime artifacts in branch diff', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'diff --name-status main..goal/test': { code: 0, stdout: 'M\tsystem/state/runtime_state.json\n', stderr: '' },
    }

    const result = reviewBranch('goal/test', { runner: runner(outputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.decision, 'DO_NOT_MERGE')
    assert.equal(result.changed_files[0]?.category, 'runtime_artifact')
  })

  it('blocks raw BLS files in branch diff', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'diff --name-status main..goal/test': { code: 0, stdout: 'A\tdocs/specs/Nutrition/00_raw/bls/original/BLS.xlsx\n', stderr: '' },
    }

    const result = reviewBranch('goal/test', { runner: runner(outputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.decision, 'DO_NOT_MERGE')
    assert.equal(result.findings.some(item => item.id === 'artifact.raw_local_data'), true)
  })

  it('uses project profile raw local paths when classifying promotion diffs', () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-promotion-profile-'))
    try {
      writeProfile(repoRoot)
      const outputs = {
        ...cleanReviewOutputs,
        'diff --name-status main..goal/test': { code: 0, stdout: 'A\tprivate/raw/source.csv\n', stderr: '' },
      }

      const result = reviewBranch('goal/test', { runner: runner(outputs), repoRoot, runChecks: false, projectId: 'lumeos' })

      assert.equal(result.decision, 'DO_NOT_MERGE')
      assert.equal(result.changed_files[0]?.category, 'raw_local_data')
      assert.match(result.product_work_gate.reason, /Profile gate closed/)
    } finally {
      fs.rmSync(repoRoot, { recursive: true, force: true })
    }
  })

  it('requires Tom waiver for product work while the gate is closed', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'diff --name-status main..goal/test': { code: 0, stdout: 'A\tservices/nutrition-api/src/import.ts\n', stderr: '' },
    }

    const result = reviewBranch('goal/test', { runner: runner(outputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.decision, 'NEEDS_TOM_WAIVER')
    assert.equal(result.findings.some(item => item.requires_tom), true)
  })

  it('does not require Tom waiver for governance UI tooling paths', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'diff --name-status main..goal/test': {
        code: 0,
        stdout: [
          'A\tapps/web/src/app/governance/page.tsx',
          'A\tapps/web/src/app/api/governance/command/route.ts',
          'A\tapps/web/src/lib/governance/command-runner.ts',
          'M\tapps/web/src/app/globals.css',
          'A\tapps/web/next.config.js',
          'A\tapps/web/postcss.config.js',
        ].join('\n') + '\n',
        stderr: '',
      },
    }

    const result = reviewBranch('goal/test', { runner: runner(outputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.decision, 'MERGE_READY')
    assert.equal(result.findings.some(item => item.id === 'product.gate_closed'), false)
  })

  it('reports migration guard requirement for migration diffs', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'diff --name-status main..goal/test': { code: 0, stdout: 'A\tsupabase/migrations/20240522_003_test.sql\n', stderr: '' },
    }

    const result = reviewBranch('goal/test', { runner: runner(outputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.required_checks.some(item => item.id === 'migration_guard'), true)
  })

  it('reports spec-source-chain requirement for workorder diffs', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'diff --name-status main..goal/test': { code: 0, stdout: 'A\tsystem/workorders/nutrition/drafts/WO-test.md\n', stderr: '' },
    }

    const result = reviewBranch('goal/test', { runner: runner(outputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.required_checks.some(item => item.id === 'spec_source_chain'), true)
  })

  it('keeps JSON shape stable', () => {
    const result = reviewBranch('goal/test', { runner: runner(cleanReviewOutputs), repoRoot: 'D:/repo', runChecks: false })

    assert.deepEqual(Object.keys(result).sort(), [
      'branch',
      'changed_files',
      'current_branch',
      'decision',
      'diff_stat',
      'findings',
      'generated_at',
      'git',
      'mode',
      'next_action',
      'product_work_gate',
      'required_checks',
      'schema_version',
      'summary',
    ].sort())
  })

  it('keeps review mode strict for main no-op reviews', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'rev-parse --abbrev-ref HEAD': { code: 0, stdout: 'main\n', stderr: '' },
      'show-ref --verify --quiet refs/heads/goal/test': { code: 1, stdout: '', stderr: '' },
      'show-ref --verify --quiet refs/heads/main': { code: 0, stdout: '', stderr: '' },
      'rev-list --count main..main': { code: 0, stdout: '0\n', stderr: '' },
      'merge-base --is-ancestor main main': { code: 0, stdout: '', stderr: '' },
      'merge-tree main main': { code: 0, stdout: '', stderr: '' },
      'diff --name-status main..main': { code: 0, stdout: '', stderr: '' },
      'diff --stat main..main': { code: 0, stdout: '', stderr: '' },
    }

    const result = reviewBranch('main', { runner: runner(outputs), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.mode, 'review')
    assert.equal(result.decision, 'NEEDS_FIX')
    assert.equal(result.findings.some(item => item.id === 'git.branch_not_ahead' && item.severity === 'high'), true)
  })
})

describe('promotion governance status', () => {
  it('reports main health without high branch_not_ahead finding', () => {
    const result = statusPromotionGovernance({
      runner: runner({
        'rev-parse --abbrev-ref HEAD': { code: 0, stdout: 'main\n', stderr: '' },
        'status --short': { code: 0, stdout: '', stderr: '' },
        'rev-parse --abbrev-ref --symbolic-full-name @{u}': { code: 0, stdout: 'origin/main\n', stderr: '' },
        'rev-list --left-right --count main...origin/main': { code: 0, stdout: '0\t0\n', stderr: '' },
      }),
      repoRoot: 'D:/repo',
      generatedAt: '2026-05-11T00:00:00.000Z',
    })

    assert.equal(result.mode, 'status')
    assert.equal(result.status, 'OK')
    assert.equal(result.is_main, true)
    assert.equal(result.promotion_applicable, false)
    assert.equal(result.summary.high, 0)
    assert.equal(result.findings.some(item => item.id === 'git.branch_not_ahead'), false)
    assert.match(result.recommended_next_action, /feature branch/)
  })

  it('reports feature branch promotion applicability and upstream counts', () => {
    const result = statusPromotionGovernance({
      runner: runner({
        'rev-parse --abbrev-ref HEAD': { code: 0, stdout: 'goal/test\n', stderr: '' },
        'status --short': { code: 0, stdout: '', stderr: '' },
        'rev-parse --abbrev-ref --symbolic-full-name @{u}': { code: 0, stdout: 'origin/goal/test\n', stderr: '' },
        'rev-list --left-right --count goal/test...origin/goal/test': { code: 0, stdout: '2\t1\n', stderr: '' },
      }),
      repoRoot: 'D:/repo',
    })

    assert.equal(result.is_main, false)
    assert.equal(result.promotion_applicable, true)
    assert.equal(result.git.ahead_of_upstream, 2)
    assert.equal(result.git.behind_upstream, 1)
  })

  it('keeps dirty worktree blocking in status mode', () => {
    const result = statusPromotionGovernance({
      runner: runner({
        'rev-parse --abbrev-ref HEAD': { code: 0, stdout: 'main\n', stderr: '' },
        'status --short': { code: 0, stdout: ' M docs/project/test.md\n', stderr: '' },
        'rev-parse --abbrev-ref --symbolic-full-name @{u}': { code: 1, stdout: '', stderr: 'no upstream' },
      }),
      repoRoot: 'D:/repo',
    })

    assert.equal(result.status, 'BLOCKED')
    assert.equal(result.findings.some(item => item.id === 'git.dirty_worktree' && item.blocks_merge), true)
  })

  it('keeps runtime artifacts blocking in status mode', () => {
    const result = statusPromotionGovernance({
      runner: runner({
        'rev-parse --abbrev-ref HEAD': { code: 0, stdout: 'goal/test\n', stderr: '' },
        'status --short': { code: 0, stdout: ' M system/state/runtime_state.json\n', stderr: '' },
        'rev-parse --abbrev-ref --symbolic-full-name @{u}': { code: 1, stdout: '', stderr: 'no upstream' },
      }),
      repoRoot: 'D:/repo',
    })

    assert.equal(result.status, 'BLOCKED')
    assert.equal(result.findings.some(item => item.id === 'artifact.runtime'), true)
  })

  it('status JSON contract includes mode/status/recommended_next_action', () => {
    const result = statusPromotionGovernance({
      runner: runner({
        'rev-parse --abbrev-ref HEAD': { code: 0, stdout: 'main\n', stderr: '' },
        'status --short': { code: 0, stdout: '', stderr: '' },
        'rev-parse --abbrev-ref --symbolic-full-name @{u}': { code: 1, stdout: '', stderr: 'no upstream' },
      }),
      repoRoot: 'D:/repo',
    })

    assert.deepEqual(Object.keys(result).sort(), [
      'branch',
      'findings',
      'generated_at',
      'git',
      'is_main',
      'mode',
      'product_work_gate',
      'promotion_applicable',
      'recommended_next_action',
      'schema_version',
      'status',
      'summary',
    ].sort())
  })
})

describe('promotion governance actions', () => {
  it('merge refuses when review is not ready', () => {
    const outputs = {
      ...cleanReviewOutputs,
      'status --short': { code: 0, stdout: ' M docs/project/test.md\n', stderr: '' },
    }
    const calls: string[] = []

    const result = promoteMergeBranch('goal/test', { runner: runner(outputs, calls), repoRoot: 'D:/repo', runChecks: false })

    assert.equal(result.success, false)
    assert.equal(result.review.decision, 'DO_NOT_MERGE')
    assert.equal(calls.includes('merge goal/test'), false)
  })

  it('push refuses when not on main', () => {
    const result = pushMain({
      runner: runner({
        'rev-parse --abbrev-ref HEAD': { code: 0, stdout: 'goal/test\n', stderr: '' },
        'status --short': { code: 0, stdout: '', stderr: '' },
        'rev-list --count origin/main..main': { code: 0, stdout: '1\n', stderr: '' },
      }),
      repoRoot: 'D:/repo',
    })

    assert.equal(result.success, false)
    assert.equal(result.findings.some(item => item.id === 'push.not_main'), true)
  })

  it('classifies changed paths', () => {
    assert.equal(classifyPromotionPath('system/state/pipeline-metrics.jsonl'), 'runtime_artifact')
    assert.equal(classifyPromotionPath('docs/specs/Nutrition/00_raw/bls/original/BLS.xlsx'), 'raw_local_data')
    assert.equal(classifyPromotionPath('system/workorders/nutrition/drafts/WO-test.md'), 'workorders')
    assert.equal(classifyPromotionPath('supabase/migrations/001.sql'), 'migrations')
  })
})
