/**
 * LUMEOS Approval Queue Tests — C.2
 * Run: npx tsx --test system/approval/__tests__/approval-queue.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  validateApprovalTransition, APPROVAL_TRANSITIONS,
  enqueueApproval, getPendingApprovals, getAllApprovals, getApproval,
  grantApproval, denyApproval, consumeQueueItem, expireStaleApprovals,
  grantApprovalForDispatch,
} from '../approval-queue'
import {
  checkApproval, consumeApproval,
  findGrantedApprovalForDispatch, hasGrantedApprovalForWorkorder,
} from '../approval-gate'
import * as state from '../../state/state-manager'

let tmpDir = ''

function setupTmpDir(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-aq-'))
  fs.mkdirSync(path.join(tmpDir, 'system', 'approval'), { recursive: true })
  fs.mkdirSync(path.join(tmpDir, 'system', 'agent-registry'), { recursive: true })
  fs.mkdirSync(path.join(tmpDir, 'system', 'state'), { recursive: true })
  fs.writeFileSync(path.join(tmpDir, 'system', 'agent-registry', 'approval_operation_types.json'), JSON.stringify({
    write_migration: {
      allowed_tools: ['write'],
      allowed_paths: ['supabase/migrations/**'],
      requires_post_review: true,
      max_uses: 1,
      expires_minutes: 30,
    },
    apply_migration_local: {
      allowed_tools: ['bash'],
      exact_command_required: true,
      requires_post_review: true,
      max_uses: 1,
      expires_minutes: 15,
    },
    write_docs: {
      allowed_tools: ['write'],
      allowed_paths: ['docs/**'],
      requires_post_review: false,
      max_uses: 1,
      expires_minutes: 60,
    },
  }))
  process.chdir(tmpDir)
}
function cleanupTmpDir(): void {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
}

const BASE = {
  workorder_id:    'WO-aq-001',
  run_id:          'RUN-aq-001',
  agent_id:        'micro-executor',
  reason:          'Review-Pipeline HUMAN_NEEDED',
  risk_category:   'auth',
  affected_files:  ['services/auth/middleware.ts'],
  proposed_action: 'Add JWT expiry check',
}

const TOOL_BASE = {
  ...BASE,
  workorder_id:    'WO-aq-tool',
  run_id:          'RUN-aq-original',
  agent_id:        'db-migration-agent',
  reason:          'write_migration erfordert menschliche Genehmigung',
  risk_category:   'db-migration',
  affected_files:  ['supabase/migrations/001_test.sql'],
  proposed_action: 'write:supabase/migrations/001_test.sql',
  operation:       'write_migration',
  tool:            'write',
}

const DOCS_REVIEW_BASE = {
  ...BASE,
  workorder_id:    'WO-aq-docs',
  run_id:          'RUN-aq-docs',
  agent_id:        'micro-executor',
  reason:          'spark-d invalid_json -> Claude needed',
  risk_category:   'docs',
  affected_files:  ['docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'],
  proposed_action: 'write docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md: # Audit Report',
  tool:            'write',
}

// ─── State Machine ─────────────────────────────────────────────────────────────

describe('validateApprovalTransition — erlaubt', () => {
  it('pending → granted', () => assert.equal(validateApprovalTransition('pending', 'granted').valid, true))
  it('pending → denied',  () => assert.equal(validateApprovalTransition('pending', 'denied').valid, true))
  it('pending → expired', () => assert.equal(validateApprovalTransition('pending', 'expired').valid, true))
  it('granted → consumed',() => assert.equal(validateApprovalTransition('granted', 'consumed').valid, true))
  it('same-state idempotent', () => assert.equal(validateApprovalTransition('pending', 'pending').valid, true))
})

describe('validateApprovalTransition — blockiert (terminal)', () => {
  it('denied → granted',   () => assert.equal(validateApprovalTransition('denied', 'granted').valid, false))
  it('expired → granted',  () => assert.equal(validateApprovalTransition('expired', 'granted').valid, false))
  it('consumed → pending', () => assert.equal(validateApprovalTransition('consumed', 'pending').valid, false))
  it('granted → denied',   () => assert.equal(validateApprovalTransition('granted', 'denied').valid, false))
  it('pending → consumed (muss durch granted)', () => {
    const r = validateApprovalTransition('pending', 'consumed')
    assert.equal(r.valid, false)
    assert.ok(r.reason?.includes('pending'))
  })
})

describe('APPROVAL_TRANSITIONS Vollständigkeit', () => {
  it('alle Status in Map', () => {
    for (const s of ['pending','granted','denied','expired','consumed'])
      assert.ok(s in APPROVAL_TRANSITIONS, `${s} fehlt`)
  })
  it('terminale Zustände leer', () => {
    assert.deepEqual(APPROVAL_TRANSITIONS.denied,   [])
    assert.deepEqual(APPROVAL_TRANSITIONS.expired,  [])
    assert.deepEqual(APPROVAL_TRANSITIONS.consumed, [])
  })
})

// ─── enqueue + read ────────────────────────────────────────────────────────────

describe('enqueueApproval', () => {
  beforeEach(setupTmpDir)

  it('status = pending nach enqueue', () => {
    const item = enqueueApproval(BASE)
    assert.equal(item.status, 'pending')
    cleanupTmpDir()
  })
  it('in getPendingApprovals sichtbar', () => {
    const item = enqueueApproval(BASE)
    assert.ok(getPendingApprovals().some(p => p.approval_id === item.approval_id))
    cleanupTmpDir()
  })
  it('in getAllApprovals sichtbar', () => {
    const item = enqueueApproval(BASE)
    assert.ok(getAllApprovals().some(p => p.approval_id === item.approval_id))
    cleanupTmpDir()
  })
  it('getApproval gibt Item zurück', () => {
    const item = enqueueApproval(BASE)
    const found = getApproval(item.approval_id)
    assert.equal(found?.workorder_id, 'WO-aq-001')
    cleanupTmpDir()
  })
  it('benutzerdefinierte approval_id wird übernommen', () => {
    const item = enqueueApproval({ ...BASE, approval_id: 'APP-CUSTOM-001' })
    assert.equal(item.approval_id, 'APP-CUSTOM-001')
    cleanupTmpDir()
  })
})

// ─── grant ─────────────────────────────────────────────────────────────────────

describe('grantApproval', () => {
  beforeEach(setupTmpDir)

  it('pending → granted', () => {
    const item = enqueueApproval(BASE)
    const r = grantApproval(item.approval_id, 'tom')
    assert.equal(r.ok, true)
    if (r.ok) { assert.equal(r.item.status, 'granted'); assert.equal(r.item.decided_by, 'tom') }
    cleanupTmpDir()
  })
  it('granted nicht mehr in pending', () => {
    const item = enqueueApproval(BASE)
    grantApproval(item.approval_id)
    assert.ok(!getPendingApprovals().some(p => p.approval_id === item.approval_id))
    cleanupTmpDir()
  })
  it('granted → consumed → grant wieder blockiert', () => {
    const item = enqueueApproval(BASE)
    grantApproval(item.approval_id)
    consumeQueueItem(item.approval_id)
    const r = grantApproval(item.approval_id)
    assert.equal(r.ok, false)
    cleanupTmpDir()
  })
  it('unbekannte ID → ok: false', () => {
    const r = grantApproval('APP-UNKNOWN-999')
    assert.equal(r.ok, false)
    cleanupTmpDir()
  })
})

describe('grantApprovalForDispatch', () => {
  beforeEach(setupTmpDir)

  it('docs write queue grant ohne operation leitet write_docs ab und erzeugt Dispatcher-Token', async () => {
    const item = enqueueApproval(DOCS_REVIEW_BASE)

    const r = await grantApprovalForDispatch(item.approval_id, 'tom')
    assert.equal(r.ok, true)
    if (!r.ok) return
    assert.equal(r.item.operation, 'write_docs')

    const queueItem = getApproval(item.approval_id)
    assert.equal(queueItem?.operation, 'write_docs')

    const runtimeItem = state.getApprovalItem(item.approval_id)
    assert.equal(runtimeItem?.operation, 'write_docs')

    const token = state.readApprovalTokens()[item.approval_id]
    assert.equal(token.status, 'granted')
    assert.equal(token.operation, 'write_docs')
    assert.equal(token.approved_tool, 'write')
    assert.deepEqual(token.scope, ['docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md'])

    const gate = checkApproval({
      approvalId: item.approval_id,
      runId: 'RUN-aq-docs-next',
      workorderId: 'WO-aq-docs',
      agentId: 'micro-executor',
      tool: 'write',
      targetPath: 'docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md',
    })
    assert.equal(gate.allowed, true, gate.reason)
    cleanupTmpDir()
  })

  it('docs write queue grant blockiert falschen Scope weiterhin', async () => {
    const item = enqueueApproval(DOCS_REVIEW_BASE)
    await grantApprovalForDispatch(item.approval_id, 'tom')

    const gate = checkApproval({
      approvalId: item.approval_id,
      runId: 'RUN-aq-docs-next',
      workorderId: 'WO-aq-docs',
      agentId: 'micro-executor',
      tool: 'write',
      targetPath: 'services/nutrition-api/src/index.ts',
    })
    assert.equal(gate.allowed, false)
    assert.equal(gate.blockedBy, 'approval_gate.scope_mismatch')
    cleanupTmpDir()
  })

  it('supabase migration queue grant ohne operation wird nicht als docs write abgeleitet', async () => {
    const item = enqueueApproval({
      ...DOCS_REVIEW_BASE,
      workorder_id:   'WO-aq-missing-op',
      run_id:         'RUN-aq-missing-op',
      risk_category:  'db-migration',
      affected_files: ['supabase/migrations/001_test.sql'],
      proposed_action:'write supabase/migrations/001_test.sql: -- migration',
    })

    const r = await grantApprovalForDispatch(item.approval_id, 'tom')
    assert.equal(r.ok, false)
    if (!r.ok) assert.match(r.reason, /Operation fehlt/)
    assert.equal(getApproval(item.approval_id)?.status, 'pending')
    assert.equal(getApproval(item.approval_id)?.operation, undefined)
    cleanupTmpDir()
  })

  it('pending queue grant erzeugt granted Dispatcher-Token', async () => {
    const item = enqueueApproval(TOOL_BASE)
    await state.startWorkorder(item.workorder_id, item.agent_id, item.run_id)
    await state.updateActiveWorkorderStatusByRun(item.workorder_id, item.run_id, 'awaiting_approval')

    const r = await grantApprovalForDispatch(item.approval_id, 'tom')
    assert.equal(r.ok, true)

    const tokens = state.readApprovalTokens()
    assert.equal(tokens[item.approval_id].status, 'granted')
    assert.equal(tokens[item.approval_id].approval_source, 'queue')
    const active = state.getAllActiveWorkorders().find(w => w.workorder_id === item.workorder_id && w.run_id === item.run_id)
    assert.equal(active?.status, 'awaiting_approval')
    assert.equal(hasGrantedApprovalForWorkorder({
      workorderId: 'WO-aq-tool',
      agentId: 'db-migration-agent',
    }), true)
    assert.equal(findGrantedApprovalForDispatch({
      workorderId: 'WO-aq-tool',
      agentId: 'db-migration-agent',
      operation: 'write_migration',
      tool: 'write',
      targetPath: 'supabase/migrations/001_test.sql',
    }), item.approval_id)

    const gate = checkApproval({
      approvalId: item.approval_id,
      runId: 'RUN-aq-redisp-new',
      workorderId: 'WO-aq-tool',
      agentId: 'db-migration-agent',
      tool: 'write',
      targetPath: 'supabase/migrations/001_test.sql',
    })
    assert.equal(gate.allowed, true, gate.reason)
    cleanupTmpDir()
  })

  it('falscher Scope bleibt blockiert', async () => {
    const item = enqueueApproval(TOOL_BASE)
    await grantApprovalForDispatch(item.approval_id, 'tom')

    const gate = checkApproval({
      approvalId: item.approval_id,
      runId: 'RUN-aq-redisp-new',
      workorderId: 'WO-aq-tool',
      agentId: 'db-migration-agent',
      tool: 'write',
      targetPath: 'supabase/migrations/other.sql',
    })
    assert.equal(gate.allowed, false)
    assert.equal(gate.blockedBy, 'approval_gate.scope_mismatch')
    assert.equal(findGrantedApprovalForDispatch({
      workorderId: 'WO-aq-tool',
      agentId: 'db-migration-agent',
      operation: 'write_migration',
      tool: 'write',
      targetPath: 'supabase/migrations/other.sql',
    }), null)
    cleanupTmpDir()
  })

  it('exact_command mismatch bleibt blockiert', async () => {
    const item = enqueueApproval({
      ...TOOL_BASE,
      operation: 'apply_migration_local',
      tool: 'bash',
      affected_files: [],
      proposed_action: 'bash:supabase db push --local',
      exact_command: 'supabase db push --local',
    })
    await grantApprovalForDispatch(item.approval_id, 'tom')

    const gate = checkApproval({
      approvalId: item.approval_id,
      runId: 'RUN-aq-redisp-new',
      workorderId: 'WO-aq-tool',
      agentId: 'db-migration-agent',
      tool: 'bash',
      command: 'supabase db reset --local',
    })
    assert.equal(gate.allowed, false)
    assert.equal(gate.blockedBy, 'approval_gate.command_mismatch')
    cleanupTmpDir()
  })

  it('consumeApproval synchronisiert Token, Queue und Runtime-Referenz', async () => {
    const item = enqueueApproval(TOOL_BASE)
    await grantApprovalForDispatch(item.approval_id, 'tom')

    await consumeApproval(item.approval_id)

    assert.equal(state.readApprovalTokens()[item.approval_id].status, 'consumed')
    assert.equal(getApproval(item.approval_id)?.status, 'consumed')
    assert.equal(state.getApprovalItem(item.approval_id)?.status, 'consumed')
    assert.equal(hasGrantedApprovalForWorkorder({
      workorderId: 'WO-aq-tool',
      agentId: 'db-migration-agent',
    }), false)

    const gate = checkApproval({
      approvalId: item.approval_id,
      runId: 'RUN-aq-redisp-new',
      workorderId: 'WO-aq-tool',
      agentId: 'db-migration-agent',
      tool: 'write',
      targetPath: 'supabase/migrations/001_test.sql',
    })
    assert.equal(gate.allowed, false)
    assert.equal(gate.blockedBy, 'approval_gate.status')
    cleanupTmpDir()
  })
})

// ─── deny ──────────────────────────────────────────────────────────────────────

describe('denyApproval', () => {
  beforeEach(setupTmpDir)

  it('pending → denied', () => {
    const item = enqueueApproval(BASE)
    const r = denyApproval(item.approval_id, 'tom', 'Zu riskant')
    assert.equal(r.ok, true)
    if (r.ok) { assert.equal(r.item.status, 'denied'); assert.equal(r.item.deny_reason, 'Zu riskant') }
    cleanupTmpDir()
  })
  it('denied → grant blockiert (terminal)', () => {
    const item = enqueueApproval(BASE)
    denyApproval(item.approval_id)
    assert.equal(grantApproval(item.approval_id).ok, false)
    cleanupTmpDir()
  })
})

// ─── expire ────────────────────────────────────────────────────────────────────

describe('denyApproval runtime sync', () => {
  beforeEach(setupTmpDir)

  it('synchronisiert denied Queue-Approval in runtime_state.approvals', async () => {
    const item = enqueueApproval(TOOL_BASE)
    await state.createPendingApproval({
      workorder_id:    item.workorder_id,
      run_id:          item.run_id,
      reason:          item.reason,
      risk_category:   item.risk_category,
      affected_files:  item.affected_files,
      proposed_action: item.proposed_action,
      requested_by:    item.agent_id,
      approval_id:     item.approval_id,
      operation:       item.operation,
      tool:            item.tool,
    })

    const r = denyApproval(item.approval_id, 'tom', 'bad target')

    assert.equal(r.ok, true)
    assert.equal(getApproval(item.approval_id)?.status, 'denied')
    const runtimeItem = state.getApprovalItem(item.approval_id)
    assert.equal(runtimeItem?.status, 'denied')
    assert.equal(runtimeItem?.decided_by, 'tom')
    assert.equal(runtimeItem?.deny_reason, 'bad target')
    cleanupTmpDir()
  })

  it('deny ohne Runtime-Approval crasht nicht', () => {
    const item = enqueueApproval(BASE)

    const r = denyApproval(item.approval_id, 'tom')

    assert.equal(r.ok, true)
    assert.equal(state.getApprovalItem(item.approval_id), null)
    cleanupTmpDir()
  })
})

describe('expireStaleApprovals', () => {
  beforeEach(setupTmpDir)

  it('nicht-abgelaufene Items bleiben pending', () => {
    enqueueApproval(BASE)
    assert.equal(expireStaleApprovals(), 0)
    cleanupTmpDir()
  })
})
