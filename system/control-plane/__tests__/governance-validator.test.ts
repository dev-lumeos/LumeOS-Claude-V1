import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  validateOrchestratorIntent,
  type OrchestratorIntent,
} from '../governance-validator'

function baseIntent(overrides: Partial<OrchestratorIntent> = {}): OrchestratorIntent {
  return {
    selected_agent: 'micro-executor',
    risk_level: 'low',
    risks: ['docs-only change'],
    execution_order: ['write docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'],
    required_gates: ['review-gate', 'files-scope-gate'],
    stop_conditions: ['scope_violation'],
    ...overrides,
  }
}

describe('Governance validator agent binding', () => {
  it('rewrites valid-but-wrong selected_agent before DB migration gates can cascade', () => {
    const result = validateOrchestratorIntent(
      baseIntent({
        selected_agent: 'db-migration-agent',
        risk_level: 'high',
        required_gates: ['review-gate', 'files-scope-gate'],
      }),
      {
        approvalTokenPresent: true,
        filesAllowed: ['docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'],
        workorderType: 'standard',
        expectedAgent: 'micro-executor',
      },
    )

    assert.equal(result.status, 'REWRITE')
    assert.equal(result.field, 'selected_agent')
    assert.match(result.reason ?? '', /selected_agent mismatch/)
    assert.doesNotMatch(result.reason ?? '', /DB-Migration/)
  })

  it('passes docs workorder intent without DB migration gates', () => {
    const result = validateOrchestratorIntent(
      baseIntent(),
      {
        approvalTokenPresent: true,
        filesAllowed: ['docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'],
        workorderType: 'standard',
        expectedAgent: 'micro-executor',
      },
    )

    assert.deepEqual(result, { status: 'PASS' })
  })

  it('still requires DB migration gates for real db-migration workorders', () => {
    const result = validateOrchestratorIntent(
      baseIntent({
        selected_agent: 'db-migration-agent',
        risk_level: 'high',
        execution_order: ['create migration file'],
        required_gates: [
          'human-approval-gate',
          'review-gate',
          'db-migration-gate',
          'rollback-gate',
          'typecheck-gate',
          'files-scope-gate',
        ],
        stop_conditions: ['production_execution_without_approval_token'],
      }),
      {
        approvalTokenPresent: true,
        filesAllowed: ['supabase/migrations/001_test.sql'],
        workorderType: 'db-migration',
        expectedAgent: 'db-migration-agent',
      },
    )

    assert.equal(result.status, 'REWRITE')
    assert.equal(result.field, 'required_gates')
    assert.match(result.reason ?? '', /DB-Migration: Pflicht-Gate fehlt: test-gate/)
  })

  it('passes complete DB migration workorder intent', () => {
    const result = validateOrchestratorIntent(
      baseIntent({
        selected_agent: 'db-migration-agent',
        risk_level: 'high',
        execution_order: ['create migration file'],
        required_gates: [
          'human-approval-gate',
          'review-gate',
          'db-migration-gate',
          'rollback-gate',
          'typecheck-gate',
          'test-gate',
          'files-scope-gate',
        ],
        stop_conditions: ['production_execution_without_approval_token'],
      }),
      {
        approvalTokenPresent: true,
        filesAllowed: ['supabase/migrations/001_test.sql'],
        workorderType: 'db-migration',
        expectedAgent: 'db-migration-agent',
      },
    )

    assert.deepEqual(result, { status: 'PASS' })
  })
})
