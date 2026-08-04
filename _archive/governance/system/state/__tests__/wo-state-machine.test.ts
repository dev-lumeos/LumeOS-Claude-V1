/**
 * LUMEOS WO-State-Machine Tests — D.1
 *
 * Run:
 *   npx tsx --test system/state/__tests__/wo-state-machine.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  validateWoStatusTransition,
  WO_TRANSITIONS,
  startWorkorder,
  updateWorkorderStatus,
} from '../state-manager'

// ─── Test Isolation ────────────────────────────────────────────────────────────

let tmpDir = ''

function setupTmpDir(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-statemachine-'))
  fs.mkdirSync(path.join(tmpDir, 'system', 'state'), { recursive: true })
  process.chdir(tmpDir)
}

function cleanupTmpDir(): void {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
}

function readStateRaw(): any {
  const p = path.join(tmpDir, 'system', 'state', 'runtime_state.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function getErrorLog(): string {
  const p = path.join(tmpDir, 'system', 'state', 'audit.error.jsonl')
  if (!fs.existsSync(p)) return ''
  return fs.readFileSync(p, 'utf8')
}

// ─── validateWoStatusTransition Tests ────────────────────────────────────────

describe('validateWoStatusTransition — erlaubte Übergänge', () => {

  it('queued → dispatched: erlaubt', () => {
    assert.equal(validateWoStatusTransition('queued', 'dispatched').valid, true)
  })

  it('dispatched → done: erlaubt', () => {
    assert.equal(validateWoStatusTransition('dispatched', 'done').valid, true)
  })

  it('dispatched → failed: erlaubt', () => {
    assert.equal(validateWoStatusTransition('dispatched', 'failed').valid, true)
  })

  it('dispatched → review: erlaubt', () => {
    assert.equal(validateWoStatusTransition('dispatched', 'review').valid, true)
  })

  it('dispatched → awaiting_approval: erlaubt', () => {
    assert.equal(validateWoStatusTransition('dispatched', 'awaiting_approval').valid, true)
  })

  it('dispatched → running: erlaubt', () => {
    assert.equal(validateWoStatusTransition('dispatched', 'running').valid, true)
  })

  it('running → done: erlaubt', () => {
    assert.equal(validateWoStatusTransition('running', 'done').valid, true)
  })

  it('running → failed: erlaubt', () => {
    assert.equal(validateWoStatusTransition('running', 'failed').valid, true)
  })

  it('running → review: erlaubt', () => {
    assert.equal(validateWoStatusTransition('running', 'review').valid, true)
  })

  it('review → dispatched: erlaubt (Auto-Retry)', () => {
    assert.equal(validateWoStatusTransition('review', 'dispatched').valid, true)
  })

  it('review → failed: erlaubt (kein Retry mehr)', () => {
    assert.equal(validateWoStatusTransition('review', 'failed').valid, true)
  })

  it('awaiting_approval → dispatched: erlaubt (Approval granted)', () => {
    assert.equal(validateWoStatusTransition('awaiting_approval', 'dispatched').valid, true)
  })

  it('awaiting_approval → failed: erlaubt (denied/expired)', () => {
    assert.equal(validateWoStatusTransition('awaiting_approval', 'failed').valid, true)
  })

  it('same-state idempotent: dispatched → dispatched: erlaubt', () => {
    assert.equal(validateWoStatusTransition('dispatched', 'dispatched').valid, true)
  })
})

describe('validateWoStatusTransition — illegale Übergänge', () => {

  it('done → failed: blockiert (terminal)', () => {
    const r = validateWoStatusTransition('done', 'failed')
    assert.equal(r.valid, false)
    assert.ok(r.reason?.includes('done'))
  })

  it('done → dispatched: blockiert (terminal)', () => {
    assert.equal(validateWoStatusTransition('done', 'dispatched').valid, false)
  })

  it('failed → done: blockiert (terminal)', () => {
    assert.equal(validateWoStatusTransition('failed', 'done').valid, false)
  })

  it('failed → running: blockiert (terminal)', () => {
    assert.equal(validateWoStatusTransition('failed', 'running').valid, false)
  })

  it('queued → done: blockiert (muss durch dispatched)', () => {
    const r = validateWoStatusTransition('queued', 'done')
    assert.equal(r.valid, false)
    assert.ok(r.reason?.includes('queued'))
  })

  it('queued → running: blockiert', () => {
    assert.equal(validateWoStatusTransition('queued', 'running').valid, false)
  })

  it('review → done: blockiert (erst re-dispatch nötig)', () => {
    assert.equal(validateWoStatusTransition('review', 'done').valid, false)
  })

  it('awaiting_approval → done: blockiert', () => {
    assert.equal(validateWoStatusTransition('awaiting_approval', 'done').valid, false)
  })

  it('Reason-Text enthält erlaubte Übergänge', () => {
    const r = validateWoStatusTransition('review', 'done')
    assert.ok(r.reason?.includes('dispatched'))  // erlaubte Übergänge im Fehlertext
  })
})

describe('WO_TRANSITIONS Vollständigkeit', () => {

  it('alle WoStatus-Werte im TRANSITIONS-Objekt', () => {
    const allStatuses = ['queued', 'dispatched', 'running', 'review', 'awaiting_approval', 'done', 'failed']
    for (const s of allStatuses) {
      assert.ok(s in WO_TRANSITIONS, `${s} fehlt in WO_TRANSITIONS`)
    }
  })

  it('terminale Zustände haben leere Transition-Liste', () => {
    assert.deepEqual(WO_TRANSITIONS.done,   [])
    assert.deepEqual(WO_TRANSITIONS.failed, [])
  })
})

describe('updateWorkorderStatus — State-Machine Enforcement (Integration)', () => {
  beforeEach(setupTmpDir)

  it('erlaubter Übergang dispatched → done wird angewendet', async () => {
    await startWorkorder('WO-test-001', 'micro-executor', 'RUN-001')
    await updateWorkorderStatus('WO-test-001', 'done')
    const s = readStateRaw()
    const wo = s.active_workorders.find((w: any) => w.workorder_id === 'WO-test-001')
    assert.equal(wo.status, 'done')
    cleanupTmpDir()
  })

  it('erlaubter Übergang dispatched → review wird angewendet', async () => {
    await startWorkorder('WO-test-002', 'micro-executor', 'RUN-002')
    await updateWorkorderStatus('WO-test-002', 'review')
    const s = readStateRaw()
    const wo = s.active_workorders.find((w: any) => w.workorder_id === 'WO-test-002')
    assert.equal(wo.status, 'review')
    cleanupTmpDir()
  })

  it('illegaler Übergang done → failed: Status bleibt done', async () => {
    await startWorkorder('WO-test-003', 'micro-executor', 'RUN-003')
    await updateWorkorderStatus('WO-test-003', 'done')
    await updateWorkorderStatus('WO-test-003', 'failed')  // illegal — sollte ignoriert werden
    const s = readStateRaw()
    const wo = s.active_workorders.find((w: any) => w.workorder_id === 'WO-test-003')
    assert.equal(wo.status, 'done', 'Status muss done bleiben')
    cleanupTmpDir()
  })

  it('illegaler Übergang → audit.error.jsonl enthält Event', async () => {
    await startWorkorder('WO-test-004', 'micro-executor', 'RUN-004')
    await updateWorkorderStatus('WO-test-004', 'done')
    await updateWorkorderStatus('WO-test-004', 'running')  // illegal
    const log = getErrorLog()
    assert.ok(log.includes('wo_status_invalid_transition'), 'error log muss Event enthalten')
    assert.ok(log.includes('WO-test-004'))
    cleanupTmpDir()
  })

  it('erlaubte Kette dispatched → review → dispatched → done', async () => {
    await startWorkorder('WO-test-005', 'micro-executor', 'RUN-005')
    await updateWorkorderStatus('WO-test-005', 'review')
    await updateWorkorderStatus('WO-test-005', 'dispatched')
    await updateWorkorderStatus('WO-test-005', 'done')
    const s = readStateRaw()
    const wo = s.active_workorders.find((w: any) => w.workorder_id === 'WO-test-005')
    assert.equal(wo.status, 'done')
    cleanupTmpDir()
  })
})
