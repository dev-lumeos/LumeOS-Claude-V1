/**
 * LUMEOS Scope-Lock Tests — A.3
 *
 * Run:
 *   npx tsx --test system/state/__tests__/scope-locks.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it, beforeEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  acquireScopeLock,
  releaseScopeLock,
  checkScopeConflict,
  getActiveScopeLocks,
  acquireDbMigrationLock,
  releaseDbMigrationLock,
  isDbMigrationLocked,
} from '../state-manager'

// ─── Test Isolation ────────────────────────────────────────────────────────────

let tmpDir = ''

function setupTmpDir(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-locks-'))
  fs.mkdirSync(path.join(tmpDir, 'system', 'state'), { recursive: true })
  process.chdir(tmpDir)
}

function cleanupTmpDir(): void {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
}

// ─── Scope-Lock Tests ─────────────────────────────────────────────────────────

describe('Scope-Locks — Acquire + Release', () => {
  beforeEach(setupTmpDir)

  it('acquire returns acquired: true für neuen Lock', async () => {
    const result = await acquireScopeLock('RUN-001', ['services/foo/bar.ts'])
    assert.equal(result.acquired, true)
    cleanupTmpDir()
  })

  it('acquire → release → acquire wieder möglich', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/bar.ts'])
    await releaseScopeLock('RUN-001')
    const result = await acquireScopeLock('RUN-002', ['services/foo/bar.ts'])
    assert.equal(result.acquired, true)
    cleanupTmpDir()
  })

  it('getActiveScopeLocks enthält Lock nach acquire', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/a.ts', 'services/foo/b.ts'])
    const locks = getActiveScopeLocks()
    assert.equal(locks.length, 1)
    assert.equal(locks[0].run_id, 'RUN-001')
    assert.deepEqual(locks[0].scope_files, ['services/foo/a.ts', 'services/foo/b.ts'])
    cleanupTmpDir()
  })

  it('getActiveScopeLocks ist leer nach release', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/bar.ts'])
    await releaseScopeLock('RUN-001')
    assert.equal(getActiveScopeLocks().length, 0)
    cleanupTmpDir()
  })

  it('Idempotenz: gleicher runId kann acquire wiederholen', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/bar.ts'])
    const result = await acquireScopeLock('RUN-001', ['services/foo/bar.ts'])
    assert.equal(result.acquired, true)
    assert.equal(getActiveScopeLocks().length, 1)  // kein Duplikat
    cleanupTmpDir()
  })
})

describe('Scope-Locks — Konflikt-Erkennung', () => {
  beforeEach(setupTmpDir)

  it('Konflikt bei überlappenden scope_files', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/bar.ts'])
    const result = await acquireScopeLock('RUN-002', ['services/foo/bar.ts'])
    assert.equal(result.acquired, false)
    if (!result.acquired) {
      assert.equal(result.conflict.conflicting_run_id, 'RUN-001')
      assert.deepEqual(result.conflict.conflicting_files, ['services/foo/bar.ts'])
    }
    cleanupTmpDir()
  })

  it('Kein Konflikt bei nicht-überlappenden scope_files', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/a.ts'])
    const result = await acquireScopeLock('RUN-002', ['services/foo/b.ts'])
    assert.equal(result.acquired, true)
    cleanupTmpDir()
  })

  it('Konflikt enthält nur overlappende Dateien', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/a.ts', 'services/foo/b.ts'])
    const result = await acquireScopeLock('RUN-002', ['services/foo/b.ts', 'services/bar/c.ts'])
    assert.equal(result.acquired, false)
    if (!result.acquired) {
      assert.deepEqual(result.conflict.conflicting_files, ['services/foo/b.ts'])
    }
    cleanupTmpDir()
  })

  it('checkScopeConflict erkennt Konflikt sync', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/bar.ts'])
    const conflict = checkScopeConflict(['services/foo/bar.ts'])
    assert.ok(conflict)
    assert.equal(conflict.conflicting_run_id, 'RUN-001')
    cleanupTmpDir()
  })

  it('checkScopeConflict gibt null wenn kein Konflikt', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/a.ts'])
    const conflict = checkScopeConflict(['services/foo/b.ts'])
    assert.equal(conflict, null)
    cleanupTmpDir()
  })

  it('checkScopeConflict excludeRunId ignoriert eigenen Lock', async () => {
    await acquireScopeLock('RUN-001', ['services/foo/bar.ts'])
    const conflict = checkScopeConflict(['services/foo/bar.ts'], 'RUN-001')
    assert.equal(conflict, null)
    cleanupTmpDir()
  })
})

describe('DB-Migration-Lock', () => {
  beforeEach(setupTmpDir)

  it('acquire → isDbMigrationLocked = true', async () => {
    await acquireDbMigrationLock('RUN-001')
    const status = isDbMigrationLocked()
    assert.equal(status.locked, true)
    if (status.locked) assert.equal(status.run_id, 'RUN-001')
    cleanupTmpDir()
  })

  it('acquire → release → isDbMigrationLocked = false', async () => {
    await acquireDbMigrationLock('RUN-001')
    await releaseDbMigrationLock('RUN-001')
    assert.equal(isDbMigrationLocked().locked, false)
    cleanupTmpDir()
  })

  it('Zweites acquire während Lock aktiv → acquired: false', async () => {
    await acquireDbMigrationLock('RUN-001')
    const result = await acquireDbMigrationLock('RUN-002')
    assert.equal(result.acquired, false)
    if (!result.acquired) assert.equal(result.conflicting_run_id, 'RUN-001')
    cleanupTmpDir()
  })

  it('Gleicher runId kann Lock erneut acquiren (Idempotenz)', async () => {
    await acquireDbMigrationLock('RUN-001')
    const result = await acquireDbMigrationLock('RUN-001')
    assert.equal(result.acquired, true)
    cleanupTmpDir()
  })

  it('release ignoriert falschen runId', async () => {
    await acquireDbMigrationLock('RUN-001')
    await releaseDbMigrationLock('RUN-999')  // falscher runId
    assert.equal(isDbMigrationLocked().locked, true)  // Lock bleibt
    cleanupTmpDir()
  })
})
