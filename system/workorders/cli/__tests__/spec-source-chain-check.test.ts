import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  formatSpecSourceChainReport,
  runSpecSourceChainCheck,
  type SpecSourceChainFinding,
} from '../spec-source-chain-check'

let tmpDir = ''
const realCwd = process.cwd()

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-source-chain-check-'))
  for (const dir of [
    'docs/specs/Nutrition/01_current_specs',
    'docs/specs/Nutrition/02_patches',
    'docs/specs/Nutrition/03_sql',
    'docs/specs/Nutrition/04_adrs',
    'docs/specs/Nutrition/05_reviews',
    'docs/specs/Nutrition/00_raw/bls/original',
    'system/workorders/nutrition/drafts',
    'system/workorders/nutrition/batches',
  ]) {
    fs.mkdirSync(path.join(tmpDir, dir), { recursive: true })
  }

  for (const file of [
    'docs/specs/Nutrition/INDEX.md',
    'docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md',
    'docs/specs/Nutrition/02_patches/SPEC_06_RECALCULATE_PATCH.md',
    'docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql',
    'docs/specs/Nutrition/04_adrs/ADR_NUTRITION_SOURCE_PRIORITY.md',
    'docs/specs/Nutrition/05_reviews/REVIEW_NUTRITION_SCHEMA.md',
    'docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx',
  ]) {
    write(file, `fixture for ${file}\n`)
  }

  writeWorkorder()
  writeBatch()
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

function workorderPath(name = 'WO-test-source-chain.md'): string {
  return path.join(tmpDir, 'system/workorders/nutrition/drafts', name)
}

function writeWorkorder(overrides: string[] = [], name = 'WO-test-source-chain.md'): void {
  if (overrides.some(line => line === '```yaml')) {
    write(`system/workorders/nutrition/drafts/${name}`, ['# WO test', '', ...overrides].join('\n'))
    return
  }

  const lines = [
    '# WO test',
    '',
    '```yaml',
    'workorder_id: WO-test-001',
    'agent_id: db-migration-agent',
    'risk_category: db-migration',
    'requires_approval: true',
    'task: |',
    '  Create nutrition schema output from the current spec. Do not use placeholder seeds.',
    'source_refs:',
    '  module_index: "docs/specs/Nutrition/INDEX.md"',
    '  current_specs:',
    '    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"',
    '  patches:',
    '    - "docs/specs/Nutrition/02_patches/SPEC_06_RECALCULATE_PATCH.md"',
    '  sql_sources:',
    '    - "docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql"',
    '  adrs:',
    '    - "docs/specs/Nutrition/04_adrs/ADR_NUTRITION_SOURCE_PRIORITY.md"',
    '  reviews:',
    '    - "docs/specs/Nutrition/05_reviews/REVIEW_NUTRITION_SCHEMA.md"',
    '  raw_sources_allowed: false',
    '  ssot_priority:',
    '    - module_index',
    '    - current_specs',
    '    - patches',
    '    - sql_sources',
    '    - adrs',
    '    - reviews',
    '    - raw_sources',
    'expected_outputs:',
    '  - "supabase/migrations/20240522_003_test.sql"',
    'scope_files:',
    '  - "supabase/migrations/20240522_003_test.sql"',
    'files_allowed:',
    '  - "supabase/migrations/20240522_003_test.sql"',
    'files_blocked:',
    '  - "docs/specs/Nutrition/00_raw/**"',
    'acceptance_criteria:',
    '  - "All expected_outputs exist and are complete"',
    'negative_constraints:',
    '  - "No placeholder seeds"',
    '  - "No example paths"',
    '```',
    ...overrides,
  ]
  write(`system/workorders/nutrition/drafts/${name}`, lines.join('\n'))
}

function writeBatch(): void {
  write('system/workorders/nutrition/batches/BATCH-test.md', [
    '# Batch',
    '',
    '## Included Workorders',
    '| Order | Filename | workorder_id | Title | Risk | Approval |',
    '|---|---|---|---|---|---|',
    '| 1 | `WO-test-source-chain.md` | `WO-test-001` | Test | db-migration | yes |',
  ].join('\n'))
}

function writeFixtureProfile(): void {
  write('system/project-profiles/profiles/fixture-beauty-club.json', JSON.stringify({
    profile_version: 2,
    project_id: 'fixture-beauty-club',
    display_name: 'Beauty Club Fixture',
    profile_kind: 'fixture',
    active: false,
    repo_root: tmpDir.replace(/\\/g, '/'),
    governance_root: 'system',
    specs_root: 'docs/specs',
    workorders_root: 'system/workorders',
    reports_root: 'system/reports',
    memory_root: 'system/memory',
    learning_root: 'docs/project/governance-learning',
    runtime_state_root: 'system/state',
    approval_root: 'system/approval',
    raw_data_paths: [],
    ignored_local_paths: ['system/reports/codex-worker/'],
    product_gate: {
      status: 'closed',
      reason: 'Fixture product work remains blocked.',
      conditional_planning_allowed: false,
    },
    forbidden_paths: ['.env', '.env.*', 'system/state/runtime_state.json', 'system/approval/queue.json'],
    forbidden_commands: ['supabase db reset', 'supabase db push', 'supabase migration up'],
    required_checkers: ['governance-invariant-check'],
    default_operator_batch: 'system/workorders/fixture-beauty-club/batches/BATCH-fixture.md',
    default_governance_batch: 'system/workorders/fixture-beauty-club/batches/BATCH-fixture.md',
    default_branch_prefix: 'goal/',
    promotion_policy: { require_clean_worktree: true },
    codex_worker_policy: {
      enabled: false,
      allowed_agents: ['senior-coding-agent'],
      require_explicit_workorder_flag: true,
      default_timeout_ms: 120000,
    },
    source_chain_policy: {
      module_index_required: true,
      nutrition_priority_required: false,
    },
    allowed_domain_paths: ['docs/specs/BeautyClub/'],
    runtime_policy: { require_live_hardware: false },
    docs_entrypoints: ['docs/specs/BeautyClub/INDEX.md'],
    ui_settings: { selectable: false },
  }, null, 2))
}

function runCheck(file = workorderPath()) {
  return runSpecSourceChainCheck({ repoRoot: tmpDir, workorderFile: file })
}

function finding(result: { findings: SpecSourceChainFinding[] }, id: string): SpecSourceChainFinding | undefined {
  return result.findings.find(item => item.id === id)
}

describe('spec source chain checker', () => {
  it('valid Nutrition WO with module index and current spec passes', () => {
    const result = runCheck()

    assert.equal(result.exitCode, 0)
    assert.equal(result.summary.critical, 0)
    assert.equal(result.summary.high, 0)
  })

  it('reports missing module INDEX as high', () => {
    fs.rmSync(path.join(tmpDir, 'docs/specs/Nutrition/INDEX.md'))

    const result = runCheck()
    const item = finding(result, 'source_refs.module_index_missing')

    assert.equal(result.exitCode, 1)
    assert.equal(item?.severity, 'high')
  })

  it('reports raw source used as primary while current spec exists as high', () => {
    writeWorkorder([
      '```yaml',
      'source_refs:',
      '  module_index: "docs/specs/Nutrition/INDEX.md"',
      '  current_specs:',
      '    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"',
      '  raw_sources:',
      '    - "docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx"',
      '  raw_sources_allowed: true',
      '  ssot_priority:',
      '    - raw_sources',
      '    - current_specs',
      'expected_outputs:',
      '  - "supabase/migrations/20240522_003_test.sql"',
      'scope_files:',
      '  - "supabase/migrations/20240522_003_test.sql"',
      'acceptance_criteria:',
      '  - "All expected_outputs exist"',
      'negative_constraints:',
      '  - "No placeholder seeds"',
      '```',
    ], 'WO-raw-primary.md')

    const result = runCheck(workorderPath('WO-raw-primary.md'))
    const item = finding(result, 'source_refs.raw_primary_over_spec')

    assert.equal(item?.severity, 'high')
  })

  it('reports expected output not in scope_files or files_allowed as high', () => {
    writeWorkorder([
      '```yaml',
      'expected_outputs:',
      '  - "packages/types/src/nutrition/foods.ts"',
      'scope_files:',
      '  - "supabase/migrations/20240522_003_test.sql"',
      'files_allowed:',
      '  - "supabase/migrations/20240522_003_test.sql"',
      '```',
    ], 'WO-output-mismatch.md')

    const result = runCheck(workorderPath('WO-output-mismatch.md'))
    const item = finding(result, 'outputs.expected_not_in_scope')

    assert.equal(item?.severity, 'high')
  })

  it('reports placeholder seed phrase for nutrition db seed work as high', () => {
    writeWorkorder(['<!-- few examples only for nutrient_defs seed -->'], 'WO-placeholder.md')

    const result = runCheck(workorderPath('WO-placeholder.md'))
    const item = finding(result, 'content.placeholder_seed_phrase')

    assert.equal(item?.severity, 'high')
  })

  it('reports example path phrase as high', () => {
    writeWorkorder(['<!-- targetPath: supabase/migrations/20240101_001_example.sql -->'], 'WO-example-path.md')

    const result = runCheck(workorderPath('WO-example-path.md'))
    const item = finding(result, 'content.example_path_phrase')

    assert.equal(item?.severity, 'high')
  })

  it('legacy WO without source_refs gets medium warning', () => {
    write('system/workorders/nutrition/drafts/WO-legacy.md', [
      '```yaml',
      'workorder_id: WO-legacy-001',
      'agent_id: micro-executor',
      'task: Legacy docs work',
      'scope_files:',
      '  - "docs/example.md"',
      'acceptance_criteria:',
      '  - "docs updated"',
      'negative_constraints:',
      '  - "no runtime edits"',
      '```',
    ].join('\n'))

    const result = runCheck(workorderPath('WO-legacy.md'))
    const item = finding(result, 'source_refs.legacy_missing')

    assert.equal(result.exitCode, 0)
    assert.equal(item?.severity, 'medium')
  })

  it('batch mode aggregates findings', () => {
    writeBatch()
    writeWorkorder(['<!-- targetPath: supabase/migrations/20240101_001_example.sql -->'])

    const result = runSpecSourceChainCheck({
      repoRoot: tmpDir,
      batchFile: path.join(tmpDir, 'system/workorders/nutrition/batches/BATCH-test.md'),
    })

    assert.equal(result.workorders.length, 1)
    assert.equal(result.exitCode, 1)
    assert.equal(finding(result, 'content.example_path_phrase')?.severity, 'high')
  })

  it('JSON output shape and human report are stable', () => {
    const result = runCheck()
    const report = formatSpecSourceChainReport(result)

    assert.equal(result.schema_version, 1)
    assert.equal(typeof result.generated_at, 'string')
    assert.equal(typeof result.summary.info, 'number')
    assert.ok(Array.isArray(result.findings))
    assert.match(report, /Spec Source Chain Check/)
  })

  it('represents a non-Nutrition fixture source chain with a selected project profile', () => {
    writeFixtureProfile()
    write('docs/specs/BeautyClub/INDEX.md', 'Beauty Club fixture index\n')
    write('docs/specs/BeautyClub/01_current_specs/SPEC_FIXTURE_PROFILE.md', 'Fixture spec\n')
    write('system/workorders/fixture-beauty-club/drafts/WO-fixture-profile.md', [
      '# Fixture WO',
      '',
      '```yaml',
      'workorder_id: WO-fixture-001',
      'agent_id: docs-agent',
      'risk_category: docs',
      'task: |',
      '  Validate fixture source chain representation only.',
      'source_refs:',
      '  module_index: "docs/specs/BeautyClub/INDEX.md"',
      '  current_specs:',
      '    - "docs/specs/BeautyClub/01_current_specs/SPEC_FIXTURE_PROFILE.md"',
      '  ssot_priority:',
      '    - module_index',
      '    - current_specs',
      'expected_outputs:',
      '  - "docs/project/fixture-beauty-club-profile-test.md"',
      'scope_files:',
      '  - "docs/project/fixture-beauty-club-profile-test.md"',
      'files_allowed:',
      '  - "docs/project/fixture-beauty-club-profile-test.md"',
      'files_blocked:',
      '  - "system/state/**"',
      '  - "system/approval/**"',
      '  - "supabase/**"',
      'acceptance_criteria:',
      '  - "Expected outputs are complete"',
      '```',
    ].join('\n'))

    const result = runSpecSourceChainCheck({
      repoRoot: tmpDir,
      workorderFile: path.join(tmpDir, 'system/workorders/fixture-beauty-club/drafts/WO-fixture-profile.md'),
      projectId: 'fixture-beauty-club',
    })

    assert.equal(result.project_profile?.project_id, 'fixture-beauty-club')
    assert.equal(result.exitCode, 0)
    assert.equal(result.summary.high, 0)
    assert.equal(finding(result, 'source_refs.nutrition_module_index_wrong'), undefined)
  })
})
