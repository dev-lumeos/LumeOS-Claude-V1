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
} from '../approval-queue'

let tmpDir = ''

function setupTmpDir(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-aq-'))
  fs.mkdirSync(path.join(tmpDir, 'system', 'approval'), { recursive: true })
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

describe('expireStaleApprovals', () => {
  beforeEach(setupTmpDir)

  it('nicht-abgelaufene Items bleiben pending', () => {
    enqueueApproval(BASE)
    assert.equal(expireStaleApprovals(), 0)
    cleanupTmpDir()
  })
})
