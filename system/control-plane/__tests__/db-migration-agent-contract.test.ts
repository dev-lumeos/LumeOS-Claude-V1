import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'

import { validateOrchestratorIntent, type OrchestratorIntent } from '../governance-validator'

const AGENT_SPEC = path.resolve(process.cwd(), '.claude/agents/db-migration-agent.md')
const DISPATCHER = path.resolve(process.cwd(), 'system/control-plane/dispatcher.ts')

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

  it('default model caller disables thinking for Qwen3.6 routes', () => {
    const dispatcher = fs.readFileSync(DISPATCHER, 'utf8')
    assert.match(dispatcher, /qwen3\.6/)
    assert.match(dispatcher, /enable_thinking\s*=\s*false/)
  })
})
