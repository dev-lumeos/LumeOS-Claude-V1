import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  validateDecompositionPlan,
  validateDecompositionPlanFile,
} from '../decomposition-plan-validator'

function validPlan(overrides: Record<string, unknown> = {}, taskOverrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    plan_id: 'PLAN-governance-001',
    project_id: 'lumeos',
    module: 'Governance',
    objective: 'Create governance documentation only.',
    source_refs: {
      module_index: 'docs/project/PROJECT_PROFILES.md',
      current_specs: ['docs/project/GOVERNANCE_DEEP_SYSTEM_ANALYSIS.md'],
      ssot_priority: ['module_index', 'current_specs'],
    },
    constraints: ['No product work.', 'No Supabase commands.'],
    non_goals: ['No runtime state edits.', 'No queue edits.'],
    workorders: [
      {
        id: 'WO-governance-001',
        title: 'Document governance validator',
        agent_id: 'docs-agent',
        risk_category: 'docs',
        task: 'Write governance documentation.',
        expected_outputs: ['docs/project/decomposition-validator-test.md'],
        scope_files: ['docs/project/decomposition-validator-test.md'],
        files_allowed: ['docs/project/decomposition-validator-test.md'],
        files_blocked: ['system/state/**', 'system/approval/**', 'supabase/**'],
        acceptance_criteria: ['Expected outputs are complete.'],
        ...taskOverrides,
      },
    ],
    ...overrides,
  }
}

function finding(result: ReturnType<typeof validateDecompositionPlan>, id: string) {
  return result.findings.find(item => item.id === id)
}

describe('decomposition plan validator', () => {
  it('accepts a valid LumeOS governance decomposition plan', () => {
    const result = validateDecompositionPlan(validPlan(), { projectId: 'lumeos' })

    assert.equal(result.valid, true)
    assert.equal(result.profile_id, 'lumeos')
    assert.equal(result.summary.high, 0)
  })

  it('accepts a valid non-Nutrition fixture profile plan', () => {
    const result = validateDecompositionPlan(validPlan({
      plan_id: 'PLAN-beauty-fixture-001',
      project_id: 'fixture-beauty-club',
      module: 'BeautyClub',
      objective: 'Document fixture governance only.',
      source_refs: {
        module_index: 'docs/specs/BeautyClub/INDEX.md',
        current_specs: ['docs/specs/BeautyClub/01_current_specs/SPEC_FIXTURE.md'],
        ssot_priority: ['module_index', 'current_specs'],
      },
    }, {
      id: 'WO-fixture-001',
      expected_outputs: ['docs/project/fixture-beauty-club-validator-test.md'],
      scope_files: ['docs/project/fixture-beauty-club-validator-test.md'],
      files_allowed: ['docs/project/fixture-beauty-club-validator-test.md'],
    }), { projectId: 'fixture-beauty-club' })

    assert.equal(result.valid, true)
    assert.equal(result.profile_id, 'fixture-beauty-club')
    assert.equal(result.summary.high, 0)
  })

  it('fails when source_refs are missing', () => {
    const plan = validPlan()
    delete (plan as { source_refs?: unknown }).source_refs

    const result = validateDecompositionPlan(plan, { projectId: 'lumeos' })

    assert.equal(result.valid, false)
    assert.equal(finding(result, 'plan.source_refs_missing')?.severity, 'high')
  })

  it('fails broad wildcard scopes', () => {
    const result = validateDecompositionPlan(validPlan({}, {
      scope_files: ['**/*'],
      files_allowed: ['**/*'],
    }), { projectId: 'lumeos' })

    assert.equal(finding(result, 'scope.broad_wildcard')?.severity, 'high')
  })

  it('allows broad wildcard scope only for explicit discovery-only tasks with no commit outputs', () => {
    const result = validateDecompositionPlan(validPlan({}, {
      discovery_only: true,
      scope_files: ['**/*'],
      files_allowed: ['**/*'],
      expected_outputs: [],
    }), { projectId: 'lumeos' })

    assert.equal(finding(result, 'scope.broad_wildcard'), undefined)
    assert.equal(result.valid, true)
  })

  it('fails forbidden runtime and queue paths', () => {
    const runtime = validateDecompositionPlan(validPlan({}, {
      expected_outputs: ['system/state/runtime_state.json'],
      scope_files: ['system/state/runtime_state.json'],
      files_allowed: ['system/state/runtime_state.json'],
    }), { projectId: 'lumeos' })
    const queue = validateDecompositionPlan(validPlan({}, {
      expected_outputs: ['system/approval/queue.json'],
      scope_files: ['system/approval/queue.json'],
      files_allowed: ['system/approval/queue.json'],
    }), { projectId: 'lumeos' })

    assert.equal(finding(runtime, 'outputs.forbidden_path')?.severity, 'high')
    assert.equal(finding(queue, 'outputs.forbidden_path')?.severity, 'high')
  })

  it('fails runtime report/history artifact outputs', () => {
    const result = validateDecompositionPlan(validPlan({}, {
      expected_outputs: ['system/reports/model-runtime-history/latest.json'],
      scope_files: ['system/reports/model-runtime-history/latest.json'],
      files_allowed: ['system/reports/model-runtime-history/latest.json'],
    }), { projectId: 'lumeos' })

    assert.equal(finding(result, 'outputs.runtime_artifact')?.severity, 'high')
  })

  it('fails raw BLS output paths', () => {
    const result = validateDecompositionPlan(validPlan({}, {
      expected_outputs: ['docs/specs/Nutrition/00_raw/bls/BLS.xlsx'],
      scope_files: ['docs/specs/Nutrition/00_raw/bls/BLS.xlsx'],
      files_allowed: ['docs/specs/Nutrition/00_raw/bls/BLS.xlsx'],
    }), { projectId: 'lumeos' })

    assert.equal(finding(result, 'outputs.raw_data_forbidden')?.severity, 'high')
  })

  it('blocks product implementation while product gate is closed', () => {
    const result = validateDecompositionPlan(validPlan({}, {
      task: 'Product implementation: implement Nutrition feature and execute BLS import.',
    }), { projectId: 'lumeos' })

    assert.equal(result.blocked_by_product_gate, true)
    assert.equal(finding(result, 'product_gate.blocked')?.severity, 'high')
  })

  it('blocks DB/Supabase/migration work while product gate is closed', () => {
    const result = validateDecompositionPlan(validPlan({}, {
      task: 'Create Supabase migration and run migration.',
      expected_outputs: ['supabase/migrations/20260511_test.sql'],
      scope_files: ['supabase/migrations/20260511_test.sql'],
      files_allowed: ['supabase/migrations/20260511_test.sql'],
      requires_approval: true,
    }), { projectId: 'lumeos' })

    assert.equal(finding(result, 'db_or_migration.blocked')?.severity, 'high')
  })

  it('blocks approval grant tasks', () => {
    const result = validateDecompositionPlan(validPlan({}, {
      task: 'Grant approval token automatically after review.',
    }), { projectId: 'lumeos' })

    assert.equal(finding(result, 'approval_grant.forbidden')?.severity, 'critical')
  })

  it('validates JSON plan files through the CLI-facing helper', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'decomposition-plan-validator-'))
    try {
      const planPath = path.join(tmpDir, 'plan.md')
      fs.writeFileSync(planPath, ['# Plan', '', '```json', JSON.stringify(validPlan(), null, 2), '```'].join('\n'), 'utf8')
      const result = validateDecompositionPlanFile(planPath, { projectId: 'lumeos' })

      assert.equal(result.valid, true)
      assert.match(result.plan_file ?? '', /plan\.md$/)
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
