import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  diagnoseOperatorDoctor,
  formatOperatorDoctorReport,
  type OperatorDoctorCheckers,
  type OperatorDoctorResult,
} from '../operator-doctor'
import type { OperatorStatus } from '../batch-operator'

function baseStatus(overrides: Partial<OperatorStatus> = {}): OperatorStatus {
  return {
    batchPath: 'system/workorders/nutrition/batches/BATCH-test.md',
    batchWorkorderIds: ['WO-test-001'],
    git: { branch: 'goal/test', short: '', entries: [] },
    systemStop: { active: false },
    stopRules: {
      anyTriggered: false,
      systemAlreadyStopped: false,
      triggeredRules: [],
      dryRunResult: 'OK',
    },
    failedRunsBaseline: { status: 'SET' },
    invalidJsonBaseline: { status: 'SET' },
    scopeLocks: [],
    dbMigrationLock: { locked: false },
    activeWorkorders: [],
    activeRuns: [],
    workorderCompletions: [{
      workorderId: 'WO-test-001',
      complete: false,
      expectedOutputs: [{ path: 'docs/project/test.md', exists: false }],
    }],
    relatedApprovals: [],
    approvalStops: [],
    cleanupSuggestions: [],
    dirtyArtifacts: [],
    unexpectedDirty: [],
    ...overrides,
  }
}

function cleanCheckers(overrides: Partial<OperatorDoctorCheckers> = {}): OperatorDoctorCheckers {
  return {
    invariant: { status: 'pass', critical: 0, high: 0, medium: 0 },
    agent_contract: { status: 'pass', critical: 0, high: 0, medium: 0 },
    model_runtime: { status: 'pass', critical: 0, high: 0, medium: 0 },
    spec_source_chain: { status: 'pass', critical: 0, high: 0, medium: 0 },
    ...overrides,
  }
}

function diagnose(status: Partial<OperatorStatus>, checkers: Partial<OperatorDoctorCheckers> = {}): OperatorDoctorResult {
  return diagnoseOperatorDoctor(baseStatus(status), {
    checkers: cleanCheckers(checkers),
    memory: {
      current_handover: true,
      learning_readme: true,
      learning_schema: true,
      current_batch_summary: true,
    },
  })
}

describe('operator doctor diagnosis', () => {
  it('reports clean ready with exactly one next action', () => {
    const result = diagnose({})

    assert.equal(result.final_diagnosis, 'CLEAN_READY')
    assert.match(result.next_action, /--dry-run/)
    assert.equal(result.next_actions.length, 1)
  })

  it('reports pending approval with review command only', () => {
    const result = diagnose({
      approvalStops: [{
        approvalId: 'APP-1',
        workorderId: 'WO-test-001',
        runId: 'RUN-1',
        agent: 'db-migration-agent',
        riskCategory: 'db-migration',
        action: 'write:supabase/migrations/test.sql',
        affectedFiles: ['supabase/migrations/test.sql'],
        classification: 'NEEDS_HUMAN_SQL_REVIEW',
        grantCommand: 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\approval\\approval-cli.ts grant APP-1',
      }],
    })

    assert.equal(result.final_diagnosis, 'NEEDS_TOM_APPROVAL')
    assert.match(result.next_action, /Review approval APP-1/)
    assert.doesNotMatch(result.next_action, /grant APP-1/)
    assert.equal(result.approvals[0]?.approval_id, 'APP-1')
  })

  it('reports safe cleanup with operator apply-safe-cleanups action', () => {
    const result = diagnose({
      cleanupSuggestions: [{
        kind: 'terminal_active_workorder',
        workorderId: 'WO-test-001',
        runId: 'RUN-1',
        safeToApply: true,
        why: 'terminal failed',
        dryRunCommand: 'dry',
        confirmCommand: 'confirm',
      }],
    })

    assert.equal(result.final_diagnosis, 'NEEDS_SAFE_CLEANUP')
    assert.match(result.next_action, /--continue --apply-safe-cleanups/)
  })

  it('reports invariant high findings as invariant blocked', () => {
    const result = diagnose({}, { invariant: { status: 'fail', critical: 0, high: 1, medium: 0 } })

    assert.equal(result.final_diagnosis, 'INVARIANT_BLOCKED')
    assert.match(result.next_action, /governance-invariant-check/)
  })

  it('reports agent contract high findings', () => {
    const result = diagnose({}, { agent_contract: { status: 'fail', critical: 0, high: 1, medium: 0 } })

    assert.equal(result.final_diagnosis, 'AGENT_CONTRACT_BLOCKED')
    assert.match(result.next_action, /agent-contract-check/)
  })

  it('reports spec source high findings', () => {
    const result = diagnose({}, { spec_source_chain: { status: 'fail', critical: 0, high: 1, medium: 0 } })

    assert.equal(result.final_diagnosis, 'SPEC_SOURCE_BLOCKED')
    assert.match(result.next_action, /spec-source-chain-check/)
  })

  it('reports dirty worktree before runtime artifact details', () => {
    const result = diagnose({
      unexpectedDirty: [{ code: 'M', path: 'system/control-plane/foo.ts', category: 'code_changes' }],
      dirtyArtifacts: [{ code: 'M', path: 'system/control-plane/foo.ts', category: 'code_changes' }],
    })

    assert.equal(result.final_diagnosis, 'DIRTY_WORKTREE')
    assert.match(result.next_action, /git status/)
  })

  it('reports product gate blocked when requested', () => {
    const result = diagnoseOperatorDoctor(baseStatus({}), {
      checkers: cleanCheckers(),
      productGate: { status: 'blocked', reason: 'Product work remains blocked.' },
      forceProductGateBlock: true,
    })

    assert.equal(result.final_diagnosis, 'PRODUCT_GATE_BLOCKED')
    assert.match(result.next_action, /Do not proceed/)
  })

  it('keeps JSON output shape stable', () => {
    const result = diagnose({})

    assert.deepEqual(Object.keys(result).sort(), [
      'approvals',
      'blockers',
      'checkers',
      'cleanups',
      'final_diagnosis',
      'generated_at',
      'git_status',
      'memory',
      'next_action',
      'next_actions',
      'product_gate',
      'safety_notes',
      'schema_version',
      'stop_rules',
    ].sort())
  })

  it('reports model runtime high findings', () => {
    const result = diagnose({}, {
      model_runtime: { status: 'fail', critical: 0, high: 1, medium: 0 },
    } as Partial<OperatorDoctorCheckers>)

    assert.equal(result.final_diagnosis, 'MODEL_RUNTIME_BLOCKED')
    assert.match(result.next_action, /model-runtime-check/)
  })

  it('doctor performs no mutations to the supplied status object', () => {
    const status = baseStatus({})
    const before = JSON.stringify(status)

    diagnoseOperatorDoctor(status, { checkers: cleanCheckers() })

    assert.equal(JSON.stringify(status), before)
  })

  it('final recommendation has exactly one action in human report', () => {
    const report = formatOperatorDoctorReport(diagnose({}))
    const actions = report.split('\n').filter(line => line.startsWith('Next action:'))

    assert.equal(actions.length, 1)
  })
})
