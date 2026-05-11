import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  runFactory,
  validateFactoryTarget,
  type FactoryResult,
} from '../wo-factory'

let tmpDir = ''
const realCwd = process.cwd()

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-wo-factory-'))
  const schema = fs.readFileSync(path.join(realCwd, 'system/workorders/schemas/workorder.schema.json'), 'utf8')
  write('system/workorders/schemas/workorder.schema.json', schema)
  write('system/project-profiles/profiles/lumeos.json', JSON.stringify({
    profile_version: 2,
    project_id: 'lumeos',
    display_name: 'LumeOS Test',
    profile_kind: 'active',
    active: true,
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
    ignored_local_paths: ['docs/specs/Nutrition/00_raw/', 'system/reports/codex-worker/'],
    product_gate: {
      status: 'closed',
      reason: 'Product work remains blocked.',
      conditional_planning_allowed: false,
    },
    forbidden_paths: ['.env', '.env.*', 'system/state/runtime_state.json', 'system/approval/queue.json', 'docs/specs/Nutrition/00_raw/**'],
    forbidden_commands: ['supabase db reset', 'supabase db push', 'supabase migration up'],
    required_checkers: ['governance-invariant-check'],
    default_operator_batch: 'system/workorders/nutrition/batches/BATCH-test.md',
    default_governance_batch: 'system/workorders/nutrition/batches/BATCH-test.md',
    default_branch_prefix: 'goal/',
    allowed_domain_paths: ['docs/specs/Nutrition/', 'docs/project/', 'system/workorders/'],
    promotion_policy: { require_clean_worktree: true },
    codex_worker_policy: {
      enabled: true,
      allowed_agents: ['senior-coding-agent'],
      require_explicit_workorder_flag: true,
      default_timeout_ms: 120000,
    },
  }, null, 2))
  for (const file of [
    'docs/specs/Nutrition/INDEX.md',
    'docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md',
    'docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md',
    'docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql',
    'docs/specs/Nutrition/04_adrs/ADR_BLS_ONLY.md',
    'docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_V1_FINAL.md',
  ]) {
    write(file, `fixture ${file}\n`)
  }
  process.chdir(tmpDir)
})

afterEach(() => {
  process.chdir(realCwd)
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function validPlan(overrides: Record<string, unknown> = {}, workorderOverrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    plan_id: 'PLAN-test-001',
    project_id: 'lumeos',
    module: 'Nutrition',
    objective: 'Create governance planning workorders only.',
    batch_id: 'BATCH-TEST-P1-001',
    batch_title: 'Test Planning Batch',
    status: 'draft',
    source_refs: {
      module_index: 'docs/specs/Nutrition/INDEX.md',
      current_specs: [
        'docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md',
        'docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md',
      ],
      patches: [],
      sql_sources: ['docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql'],
      adrs: ['docs/specs/Nutrition/04_adrs/ADR_BLS_ONLY.md'],
      reviews: ['docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_V1_FINAL.md'],
      raw_sources: [],
      raw_sources_allowed: false,
      ssot_priority: ['module_index', 'current_specs', 'patches', 'sql_sources', 'adrs', 'reviews', 'raw_sources'],
    },
    objectives: ['Create planning report only.'],
    non_goals: ['No import execution.'],
    constraints: ['No Supabase commands.'],
    workorders: [
      {
        id: 'WO-factory-001',
        title: 'Create planning report',
        agent_id: 'docs-agent',
        risk_category: 'docs',
        task: '<analyze>Read source chain.</analyze>\n<implement>Create planning report only.</implement>\n<constraints>No product import.</constraints>\n<on_error>Stop.</on_error>',
        expected_outputs: ['docs/specs/Nutrition/06_workorder_planning/bls_import/P1-005-bls-import-planning-report.md'],
        scope_files: ['docs/specs/Nutrition/06_workorder_planning/bls_import/P1-005-bls-import-planning-report.md'],
        files_allowed: ['docs/specs/Nutrition/06_workorder_planning/bls_import/P1-005-bls-import-planning-report.md'],
        files_blocked: ['system/state/**', 'system/approval/**', 'docs/specs/Nutrition/00_raw/**', 'supabase/**'],
        acceptance_criteria: [
          'All expected_outputs exist and are complete.',
          'Report states no import execution occurred.',
        ],
        negative_constraints: [
          'Do not run Supabase commands.',
          'Do not write runtime state.',
          'Do not modify raw BLS files.',
          'Do not import BLS data.',
        ],
        blocked_by: [],
        ...workorderOverrides,
      },
    ],
    ...overrides,
  }
}

function writePlan(plan: Record<string, unknown> = validPlan()): string {
  const planFile = path.join(tmpDir, 'plan.md')
  fs.writeFileSync(planFile, ['# Plan', '', '```json', JSON.stringify(plan, null, 2), '```'].join('\n'), 'utf8')
  return planFile
}

function run(plan: Record<string, unknown> = validPlan(), writeFiles = false): FactoryResult {
  return runFactory(writePlan(plan), path.join(tmpDir, 'system/workorders/nutrition'), { write: writeFiles })
}

function finding(result: FactoryResult, id: string) {
  return result.findings.find(item => item.id === id)
}

describe('wo-factory', () => {
  it('generates valid workorders from a valid plan', () => {
    const result = run()

    assert.equal(result.status, 'READY_TO_WRITE')
    assert.equal(result.summary.high, 0)
    assert.equal(result.workorders.length, 1)
    assert.match(result.workorders[0].markdown, /source_refs:/)
    assert.match(result.workorders[0].markdown, /expected_outputs:/)
  })

  it('fails when source_refs are missing', () => {
    const plan = validPlan()
    delete (plan as { source_refs?: unknown }).source_refs

    const result = run(plan)

    assert.equal(result.status, 'FIX_REQUIRED')
    assert.equal(finding(result, 'plan.source_refs_missing')?.severity, 'high')
  })

  it('refuses invalid decomposition plans before generating workorders', () => {
    const result = run(validPlan({}, {
      expected_outputs: ['system/state/runtime_state.json'],
      scope_files: ['system/state/runtime_state.json'],
      files_allowed: ['system/state/runtime_state.json'],
    }))

    assert.equal(result.status, 'FIX_REQUIRED')
    assert.equal(result.workorders.length, 1)
    assert.equal(finding(result, 'decomposition.outputs.forbidden_path')?.severity, 'high')
  })

  it('fails when expected output is outside scope', () => {
    const result = run(validPlan({}, {
      expected_outputs: ['docs/specs/Nutrition/06_workorder_planning/output.md'],
      scope_files: ['docs/specs/Nutrition/06_workorder_planning/other.md'],
      files_allowed: ['docs/specs/Nutrition/06_workorder_planning/other.md'],
    }))

    assert.equal(finding(result, 'outputs.expected_not_in_scope')?.severity, 'high')
  })

  it('requires rollback_hint for db-migration workorders', () => {
    const result = run(validPlan({}, {
      agent_id: 'db-migration-agent',
      risk_category: 'db-migration',
      expected_outputs: ['supabase/migrations/20260505_001_test.sql'],
      scope_files: ['supabase/migrations/20260505_001_test.sql'],
      files_allowed: ['supabase/migrations/20260505_001_test.sql'],
      files_blocked: ['system/state/**', 'system/approval/**', 'docs/specs/Nutrition/00_raw/**'],
    }))

    assert.equal(finding(result, 'db_migration.rollback_hint_missing')?.severity, 'high')
  })

  it('rejects mixed-risk workorders', () => {
    const result = run(validPlan({}, {
      risk_category: 'docs,db-migration',
      mixed_risk: true,
    }))

    assert.equal(finding(result, 'risk.mixed')?.severity, 'high')
  })

  it('requires files_blocked for high-risk workorders', () => {
    const result = run(validPlan({}, {
      agent_id: 'db-migration-agent',
      risk_category: 'db-migration',
      expected_outputs: ['supabase/migrations/20260505_001_test.sql'],
      scope_files: ['supabase/migrations/20260505_001_test.sql'],
      files_allowed: ['supabase/migrations/20260505_001_test.sql'],
      files_blocked: [],
      rollback_hint: 'Rollback by reverting this migration before execution.',
    }))

    assert.equal(finding(result, 'scope.files_blocked_missing')?.severity, 'high')
  })

  it('rejects raw BLS files as commit outputs', () => {
    const result = run(validPlan({}, {
      expected_outputs: ['docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx'],
      scope_files: ['docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx'],
      files_allowed: ['docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx'],
    }))

    assert.equal(finding(result, 'outputs.forbidden_artifact')?.severity, 'high')
  })

  it('generates a batch dependency graph', () => {
    const plan = validPlan({
      workorders: [
        (validPlan().workorders as Record<string, unknown>[])[0],
        {
          ...(validPlan().workorders as Record<string, unknown>[])[0],
          id: 'WO-factory-002',
          title: 'Review planning report',
          blocked_by: ['WO-factory-001'],
        },
      ],
    })

    const result = run(plan, true)
    const batch = fs.readFileSync(path.join(tmpDir, 'system/workorders/nutrition/batches/BATCH-TEST-P1-001.md'), 'utf8')

    assert.equal(result.status, 'WROTE_FILES')
    assert.match(batch, /WO-factory-002: blocked_by WO-factory-001/)
  })

  it('dry-run does not write files', () => {
    const result = run()

    assert.equal(result.status, 'READY_TO_WRITE')
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/workorders/nutrition/drafts')), false)
  })

  it('write creates expected draft and batch files', () => {
    const result = run(validPlan(), true)

    assert.equal(result.status, 'WROTE_FILES')
    assert.equal(result.written_files.length, 2)
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/workorders/nutrition/drafts/WO-factory-001-create-planning-report.md')), true)
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/workorders/nutrition/batches/BATCH-TEST-P1-001.md')), true)
  })

  it('validation and JSON-facing result shape are stable', () => {
    const result = run(validPlan(), true)
    const validation = validateFactoryTarget(path.join(tmpDir, result.batch_file ?? ''))

    assert.equal(result.schema_version, 1)
    assert.equal(typeof result.generated_at, 'string')
    assert.equal(Array.isArray(result.validation_commands), true)
    assert.equal(validation.schema_version, 1)
    assert.equal(validation.mode, 'batch')
    assert.equal(validation.exitCode, 0)
  })
})
