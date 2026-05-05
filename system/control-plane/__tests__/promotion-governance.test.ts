import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  classifyPromotionPath,
  promoteMergeBranch,
  pushMain,
  reviewBranch,
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
          'A\tapps/web/next.config.js',
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
      'next_action',
      'product_work_gate',
      'required_checks',
      'schema_version',
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
