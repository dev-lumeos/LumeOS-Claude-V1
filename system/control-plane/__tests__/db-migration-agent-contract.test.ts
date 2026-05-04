import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'

import {
  validateToolRequestAgainstWorkorder,
  type ToolRequest,
  type Workorder,
} from '../dispatcher'
import { validateOrchestratorIntent, type OrchestratorIntent } from '../governance-validator'

const AGENT_SPEC = path.resolve(process.cwd(), '.claude/agents/db-migration-agent.md')
const DISPATCHER = path.resolve(process.cwd(), 'system/control-plane/dispatcher.ts')
const ORCHESTRATOR_CONTRACT = path.resolve(process.cwd(), 'system/prompts/orchestration/orchestrator_intent_contract.md')
const WO_003 = path.resolve(process.cwd(), 'system/workorders/nutrition/drafts/WO-NUTRITION-P1-003-food-core-tables.md')

function dbMigrationIntent(overrides: Partial<OrchestratorIntent> = {}): OrchestratorIntent {
  return {
    selected_agent: 'db-migration-agent',
    risk_level: 'high',
    risks: ['db schema change', 'rollback required', 'data integrity risk'],
    execution_order: ['validate_scope', 'create_migration_file', 'run_typecheck', 'run_tests', 'request_review'],
    required_gates: [
      'human-approval-gate',
      'db-migration-gate',
      'rollback-gate',
      'typecheck-gate',
      'test-gate',
      'review-gate',
      'files-scope-gate',
    ],
    stop_conditions: [
      'missing_rollback_hint',
      'scope_violation',
      'production_db_command_requested',
      'test_failure',
      'review_failure',
      'production_execution_without_approval_token',
    ],
    ...overrides,
  }
}

function woNutrition003(): Workorder {
  return {
    workorder_id: 'WO-nutrition-003',
    agent_id: 'db-migration-agent',
    task: fs.readFileSync(WO_003, 'utf8'),
    scope_files: [
      'supabase/migrations/',
      'packages/types/src/nutrition/foods.ts',
      'packages/types/src/nutrition/index.ts',
    ],
    context_files: [],
    acceptance_files: [],
    acceptance_criteria: [
      'Neue Migration unter supabase/migrations/ erstellt (future path to be decided - YYYYMMDD_NNN_nutrition_food_core_tables.sql)',
      'TypeScript-Types in packages/types/src/nutrition/foods.ts spiegeln DB-Tabellen',
      'packages/types/src/nutrition/index.ts re-exportiert die neuen Interfaces',
    ],
    negative_constraints: [],
    required_skills: [],
    optional_skills: [],
    blocked_by: [],
    requires_approval: true,
    risk_category: 'db-migration',
  }
}

function migrationWrite(targetPath: string): ToolRequest {
  return {
    tool: 'write',
    targetPath,
    content: '-- migration SQL here',
  }
}

describe('db-migration-agent runtime contract', () => {
  it('agent spec requires OrchestratorIntent as the only Dispatcher runtime output', () => {
    const spec = fs.readFileSync(AGENT_SPEC, 'utf8')
    assert.match(spec, /einzige erlaubte Top-Level-Outputformat/i)
    assert.match(spec, /OrchestratorIntent JSON/i)
    assert.doesNotMatch(spec, /"status": "PASS\|FAIL\|BLOCKED\|ESCALATE\|STOP"/)
    assert.match(spec, /Rewrite-Regel/i)
  })

  it('valid DB migration OrchestratorIntent with all gates passes validation', () => {
    const validation = validateOrchestratorIntent(dbMigrationIntent(), {
      approvalTokenPresent: false,
      filesAllowed: ['supabase/migrations/'],
      workorderType: 'db-migration',
    })
    assert.equal(validation.status, 'PASS')
  })

  it('DB migration OrchestratorIntent without test-gate remains a rewrite', () => {
    const validation = validateOrchestratorIntent(dbMigrationIntent({
      required_gates: [
        'human-approval-gate',
        'db-migration-gate',
        'rollback-gate',
        'typecheck-gate',
        'review-gate',
        'files-scope-gate',
      ],
    }), {
      approvalTokenPresent: false,
      filesAllowed: ['supabase/migrations/'],
      workorderType: 'db-migration',
    })
    assert.equal(validation.status, 'REWRITE')
    assert.equal(validation.field, 'required_gates')
    assert.match(validation.reason ?? '', /test-gate/)
  })

  it('orchestrator contract states the full DB migration gate set', () => {
    const contract = fs.readFileSync(ORCHESTRATOR_CONTRACT, 'utf8')
    for (const gate of [
      'db-migration-gate',
      'rollback-gate',
      'typecheck-gate',
      'test-gate',
      'review-gate',
      'files-scope-gate',
      'human-approval-gate',
    ]) {
      assert.match(contract, new RegExp(gate))
    }
  })

  it('default model caller disables thinking for Qwen3.6 routes', () => {
    const dispatcher = fs.readFileSync(DISPATCHER, 'utf8')
    assert.match(dispatcher, /qwen3\.6/)
    assert.match(dispatcher, /enable_thinking\s*=\s*false/)
  })

  it('agent spec does not present the example migration path as a usable targetPath', () => {
    const spec = fs.readFileSync(AGENT_SPEC, 'utf8')
    assert.doesNotMatch(spec, /"targetPath"\s*:\s*"[^"]*example\.sql"/)
    assert.match(spec, /WORKORDER_DERIVED_MIGRATION_PATH/)
    assert.match(spec, /never use/i)
  })

  it('rewrites real tool requests that leak example migration filenames', () => {
    const validation = validateToolRequestAgainstWorkorder(
      woNutrition003(),
      migrationWrite('supabase/migrations/20240101_001_example.sql'),
    )

    assert.equal(validation.status, 'REWRITE')
    assert.equal(validation.field, 'targetPath')
    assert.match(validation.reason ?? '', /example/i)
  })

  it('passes WO-003 migration writes only when targetPath matches the workorder output stem', () => {
    const valid = validateToolRequestAgainstWorkorder(
      woNutrition003(),
      migrationWrite('supabase/migrations/20240522_003_nutrition_food_core_tables.sql'),
    )
    const wrongStem = validateToolRequestAgainstWorkorder(
      woNutrition003(),
      migrationWrite('supabase/migrations/20240522_003_unrelated.sql'),
    )

    assert.equal(valid.status, 'PASS')
    assert.equal(wrongStem.status, 'REWRITE')
    assert.match(wrongStem.reason ?? '', /nutrition_food_core_tables\.sql/)
  })

  it('WO-003 exposes expected migration and type outputs to the contract', () => {
    const wo = fs.readFileSync(WO_003, 'utf8')
    assert.match(wo, /YYYYMMDD_NNN_nutrition_food_core_tables\.sql/)
    assert.match(wo, /packages\/types\/src\/nutrition\/foods\.ts/)
    assert.match(wo, /packages\/types\/src\/nutrition\/index\.ts/)
  })
})
