/**
 * Tests für Terminal Workorder Reset CLI (WO-governance-010).
 *
 * - State-Manager-Helper (getAllActiveWorkorders, removeTerminalActiveWorkorder)
 * - CLI Sub-Commands (list, show, clear --dry-run, clear --confirm)
 * - Refusal-Pfade (no match, ambiguous match, non-terminal status)
 * - Audit-Event-Verhalten (NUR bei --confirm, nicht bei --dry-run)
 * - State-Validität (runtime_state.json bleibt JSON-valide)
 *
 * Run:
 *   npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts
 */

import assert from 'node:assert/strict'
import { describe, it, before, after, beforeEach } from 'node:test'
import { spawnSync } from 'node:child_process'
import fs   from 'node:fs'
import path from 'node:path'
import os   from 'node:os'

import {
  getActiveRunByRunId,
  getAllActiveWorkorders,
  removeStaleDispatchedActiveWorkorder,
  removeTerminalActiveWorkorder,
  type ActiveWorkorder,
  type Run,
} from '../../state/state-manager'

// ─── Test Fixture ────────────────────────────────────────────────────────────

const TEST_DIR = path.join(os.tmpdir(), 'lumeos-terminal-wo-reset-cli')
const REAL_CWD = process.cwd()
const CLI_PATH = path.resolve(REAL_CWD, 'system/control-plane/terminal-wo-reset-cli.ts')

function setupFixture(): void {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true })
  fs.mkdirSync(`${TEST_DIR}/system/state`, { recursive: true })
  process.chdir(TEST_DIR)
}

function teardownFixture(): void {
  process.chdir(REAL_CWD)
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true })
}

const SAMPLE_ENTRIES: ActiveWorkorder[] = [
  { workorder_id: 'WO-test-001', run_id: 'RUN-001', agent_id: 'micro-executor',     status: 'failed',     dispatched_at: '2026-05-03T01:00:00.000Z' },
  { workorder_id: 'WO-test-002', run_id: 'RUN-002', agent_id: 'micro-executor',     status: 'done',       dispatched_at: '2026-05-03T02:00:00.000Z' },
  { workorder_id: 'WO-test-003', run_id: 'RUN-003', agent_id: 'micro-executor',     status: 'review',     dispatched_at: '2026-05-03T03:00:00.000Z' },
  { workorder_id: 'WO-test-004', run_id: 'RUN-004', agent_id: 'micro-executor',     status: 'dispatched', dispatched_at: '2026-05-03T04:00:00.000Z' },
  { workorder_id: 'WO-test-005', run_id: 'RUN-005', agent_id: 'micro-executor',     status: 'running',    dispatched_at: '2026-05-03T05:00:00.000Z' },
  { workorder_id: 'WO-test-006', run_id: 'RUN-006', agent_id: 'micro-executor',     status: 'queued',     dispatched_at: '2026-05-03T06:00:00.000Z' },
  { workorder_id: 'WO-test-007', run_id: 'RUN-007', agent_id: 'db-migration-agent', status: 'awaiting_approval', dispatched_at: '2026-05-03T07:00:00.000Z' },
]

function writeState(entries: ActiveWorkorder[], activeRuns: Run[] = []): void {
  const state = {
    orchestration_mode: 'claude_code',
    spark_mode:         'mode1',
    active_runs:        activeRuns,
    active_workorders:  entries,
    locks:              [],
    approvals:          [],
    audit_log_path:     'system/state/audit.jsonl',
    rewrite_counters:   {},
    scope_locks:        [],
    db_migration_lock:  null,
    system_stop:        null,
  }
  const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8')
}

// ─── WO-015 Test Helpers ─────────────────────────────────────────────────────

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

function makeDispatched(woId: string, runId: string, dispatchedAt: string): ActiveWorkorder {
  return {
    workorder_id:  woId,
    run_id:        runId,
    agent_id:      'micro-executor',
    status:        'dispatched',
    dispatched_at: dispatchedAt,
  }
}

function makeRun(runId: string, woId: string, status: Run['status']): Run {
  return {
    run_id:        runId,
    workorder_id:  woId,
    agent_id:      'micro-executor',
    status,
    started_at:    isoMinutesAgo(120),
    written_files: [],
  }
}

function readActiveWorkorders(): ActiveWorkorder[] {
  const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
  const s = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  return s.active_workorders
}

function readAuditLines(): any[] {
  const auditPath = path.resolve(process.cwd(), 'system/state/audit.jsonl')
  if (!fs.existsSync(auditPath)) return []
  return fs.readFileSync(auditPath, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l))
}

function runCli(args: string[]): { code: number; stdout: string; stderr: string } {
  const result = spawnSync('npx', ['tsx', CLI_PATH, ...args], {
    cwd:      TEST_DIR,
    encoding: 'utf8',
    shell:    true,
    env:      { ...process.env, LUMEOS_OPERATOR: 'test-operator' },
  })
  return {
    code:   result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}

// ─── Suite: State-Manager Helper ─────────────────────────────────────────────

describe('Terminal-WO-Reset — State-Manager-Helper', () => {
  before(setupFixture)
  after(teardownFixture)
  beforeEach(() => writeState(SAMPLE_ENTRIES))

  it('getAllActiveWorkorders liefert alle 7 Einträge', () => {
    const all = getAllActiveWorkorders()
    assert.equal(all.length, 7)
  })

  it('removeTerminalActiveWorkorder entfernt failed-Eintrag', async () => {
    const r = await removeTerminalActiveWorkorder('WO-test-001', 'RUN-001')
    assert.equal(r.removed, true)
    assert.equal(r.entry?.status, 'failed')
    const after = readActiveWorkorders()
    assert.equal(after.length, 6)
    assert.equal(after.find(w => w.workorder_id === 'WO-test-001'), undefined)
  })

  it('removeTerminalActiveWorkorder entfernt done-Eintrag', async () => {
    const r = await removeTerminalActiveWorkorder('WO-test-002', 'RUN-002')
    assert.equal(r.removed, true)
    assert.equal(r.entry?.status, 'done')
    const after = readActiveWorkorders()
    assert.equal(after.find(w => w.workorder_id === 'WO-test-002'), undefined)
  })

  it('removeTerminalActiveWorkorder ist idempotent (zweiter Aufruf → no match)', async () => {
    const r1 = await removeTerminalActiveWorkorder('WO-test-001', 'RUN-001')
    assert.equal(r1.removed, true)
    const r2 = await removeTerminalActiveWorkorder('WO-test-001', 'RUN-001')
    assert.equal(r2.removed, false)
    assert.equal(r2.reason, 'no match')
  })

  it('removeTerminalActiveWorkorder verweigert review (non-terminal)', async () => {
    const r = await removeTerminalActiveWorkorder('WO-test-003', 'RUN-003')
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /non-terminal/)
    assert.equal(r.entry?.status, 'review')
    assert.equal(readActiveWorkorders().length, 7, 'state must be unchanged')
  })

  it('removeTerminalActiveWorkorder verweigert dispatched (non-terminal)', async () => {
    const r = await removeTerminalActiveWorkorder('WO-test-004', 'RUN-004')
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /non-terminal/)
  })

  it('removeTerminalActiveWorkorder verweigert running, queued, awaiting_approval', async () => {
    for (const wo of [
      ['WO-test-005', 'RUN-005'],
      ['WO-test-006', 'RUN-006'],
      ['WO-test-007', 'RUN-007'],
    ] as const) {
      const r = await removeTerminalActiveWorkorder(wo[0], wo[1])
      assert.equal(r.removed, false, `${wo[0]} should refuse`)
      assert.match(r.reason ?? '', /non-terminal/)
    }
    assert.equal(readActiveWorkorders().length, 7, 'state must be unchanged')
  })

  it('removeTerminalActiveWorkorder bei unbekanntem (workorder_id, run_id) → no match', async () => {
    const r = await removeTerminalActiveWorkorder('WO-does-not-exist', 'RUN-999')
    assert.equal(r.removed, false)
    assert.equal(r.reason, 'no match')
  })

  it('removeTerminalActiveWorkorder bei mehrdeutigem Match → ambiguous', async () => {
    // Pre-populate mit zwei Einträgen für gleichen (wo, run)
    const ambiguous: ActiveWorkorder[] = [
      ...SAMPLE_ENTRIES,
      { workorder_id: 'WO-test-001', run_id: 'RUN-001', agent_id: 'micro-executor', status: 'failed', dispatched_at: '2026-05-03T01:30:00.000Z' },
    ]
    writeState(ambiguous)
    const r = await removeTerminalActiveWorkorder('WO-test-001', 'RUN-001')
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /ambiguous/)
    assert.equal(readActiveWorkorders().length, 8, 'state must be unchanged on ambiguous')
  })

  it('removeTerminalActiveWorkorder hält runtime_state.json JSON-valide', async () => {
    await removeTerminalActiveWorkorder('WO-test-001', 'RUN-001')
    const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
    const raw = fs.readFileSync(statePath, 'utf8')
    assert.doesNotThrow(() => JSON.parse(raw), 'state file must be valid JSON')
  })

  it('removeTerminalActiveWorkorder mutiert NUR active_workorders', async () => {
    await removeTerminalActiveWorkorder('WO-test-001', 'RUN-001')
    const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
    const s = JSON.parse(fs.readFileSync(statePath, 'utf8'))
    // Andere Felder unverändert
    assert.equal(s.system_stop, null)
    assert.deepEqual(s.scope_locks, [])
    assert.deepEqual(s.approvals, [])
    assert.deepEqual(s.locks, [])
    assert.deepEqual(s.active_runs, [])
  })
})

// ─── Suite: CLI Sub-Commands ─────────────────────────────────────────────────

describe('Terminal-WO-Reset — CLI Sub-Commands', () => {
  before(setupFixture)
  after(teardownFixture)
  beforeEach(() => {
    writeState(SAMPLE_ENTRIES)
    // Audit-Log zwischen Tests zurücksetzen, damit Audit-Events-Asserts
    // sich auf den aktuellen Test beziehen (nicht auf akkumulierte Events).
    const auditPath = path.resolve(process.cwd(), 'system/state/audit.jsonl')
    if (fs.existsSync(auditPath)) fs.unlinkSync(auditPath)
  })

  it('list zeigt active_workorders gruppiert nach status', () => {
    const r = runCli(['list'])
    assert.equal(r.code, 0, `expected exit 0, got ${r.code}; stderr=${r.stderr}`)
    assert.match(r.stdout, /\[failed\]/)
    assert.match(r.stdout, /\[done\]/)
    assert.match(r.stdout, /\[review\]/)
    assert.match(r.stdout, /WO-test-001/)
    assert.match(r.stdout, /WO-test-007/)
  })

  it('show WO-test-001 zeigt Detail, Exit 0', () => {
    const r = runCli(['show', 'WO-test-001'])
    assert.equal(r.code, 0, `expected exit 0, got ${r.code}; stderr=${r.stderr}`)
    assert.match(r.stdout, /WO-test-001/)
    assert.match(r.stdout, /"status": "failed"/)
  })

  it('show bei unbekannter workorder_id → Exit 2', () => {
    const r = runCli(['show', 'WO-does-not-exist'])
    assert.equal(r.code, 2, `expected exit 2, got ${r.code}; stdout=${r.stdout}`)
  })

  it('clear --dry-run mutiert NICHTS und schreibt KEIN Audit', () => {
    const before = readActiveWorkorders().length
    const r = runCli(['clear', 'WO-test-001', '--run-id', 'RUN-001', '--dry-run'])
    assert.equal(r.code, 0, `expected exit 0, got ${r.code}; stderr=${r.stderr}`)
    assert.match(r.stdout, /\[DRY-RUN\]/)
    assert.match(r.stdout, /Would remove 1 entry/)
    assert.equal(readActiveWorkorders().length, before, 'state must be unchanged after dry-run')
    const audit = readAuditLines()
    assert.equal(
      audit.filter(a => a.event === 'terminal_workorder_reset').length,
      0,
      'no audit event after dry-run',
    )
  })

  it('clear ohne Flag defaults auf dry-run-Verhalten (sicher)', () => {
    const before = readActiveWorkorders().length
    const r = runCli(['clear', 'WO-test-001', '--run-id', 'RUN-001'])
    assert.equal(r.code, 0)
    assert.match(r.stdout, /\[DRY-RUN\]/)
    assert.equal(readActiveWorkorders().length, before, 'state must be unchanged on default mode')
  })

  it('clear --confirm entfernt failed-Eintrag und schreibt Audit', () => {
    const r = runCli(['clear', 'WO-test-001', '--run-id', 'RUN-001', '--confirm'])
    assert.equal(r.code, 0, `expected exit 0, got ${r.code}; stderr=${r.stderr}`)
    assert.match(r.stdout, /Removed 1 active_workorders entry/)
    const after = readActiveWorkorders()
    assert.equal(after.find(w => w.workorder_id === 'WO-test-001'), undefined)
    const audit = readAuditLines().filter(a => a.event === 'terminal_workorder_reset')
    assert.equal(audit.length, 1, 'exactly one terminal_workorder_reset audit event')
    assert.equal(audit[0].workorder_id, 'WO-test-001')
    assert.equal(audit[0].run_id, 'RUN-001')
    assert.match(audit[0].reason ?? '', /previous_status=failed/)
    assert.equal(audit[0].approved_by, 'test-operator')
  })

  it('clear --confirm entfernt done-Eintrag', () => {
    const r = runCli(['clear', 'WO-test-002', '--run-id', 'RUN-002', '--confirm'])
    assert.equal(r.code, 0)
    assert.equal(readActiveWorkorders().find(w => w.workorder_id === 'WO-test-002'), undefined)
  })

  it('clear verweigert non-terminal: queued (Exit 1)', () => {
    const r = runCli(['clear', 'WO-test-006', '--run-id', 'RUN-006', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /non-terminal/)
    assert.equal(readActiveWorkorders().length, 7, 'state unchanged on refusal')
  })

  it('clear verweigert non-terminal: dispatched (Exit 1)', () => {
    const r = runCli(['clear', 'WO-test-004', '--run-id', 'RUN-004', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /non-terminal/)
  })

  it('clear verweigert non-terminal: running (Exit 1)', () => {
    const r = runCli(['clear', 'WO-test-005', '--run-id', 'RUN-005', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /non-terminal/)
  })

  it('clear verweigert non-terminal: review (Exit 1)', () => {
    const r = runCli(['clear', 'WO-test-003', '--run-id', 'RUN-003', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /non-terminal/)
  })

  it('clear verweigert non-terminal: awaiting_approval (Exit 1)', () => {
    const r = runCli(['clear', 'WO-test-007', '--run-id', 'RUN-007', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /non-terminal/)
  })

  it('clear bei unbekannter (workorder_id, run_id) → Exit 2', () => {
    const r = runCli(['clear', 'WO-does-not-exist', '--run-id', 'RUN-999', '--confirm'])
    assert.equal(r.code, 2, `expected exit 2, got ${r.code}; stdout=${r.stdout}; stderr=${r.stderr}`)
  })

  it('clear bei mehrdeutigem Match → Exit 1', () => {
    const ambiguous: ActiveWorkorder[] = [
      ...SAMPLE_ENTRIES,
      { workorder_id: 'WO-test-001', run_id: 'RUN-001', agent_id: 'micro-executor', status: 'failed', dispatched_at: '2026-05-03T01:30:00.000Z' },
    ]
    writeState(ambiguous)
    const r = runCli(['clear', 'WO-test-001', '--run-id', 'RUN-001', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /ambiguous/)
  })

  it('clear ohne --run-id → Exit 1 (usage error)', () => {
    const r = runCli(['clear', 'WO-test-001', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /missing --run-id/)
  })

  it('clear ohne workorder_id → Exit 1 (usage error)', () => {
    const r = runCli(['clear', '--run-id', 'RUN-001', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /missing <workorder_id>/)
  })

  it('Audit wird nur bei --confirm geschrieben, nicht bei --dry-run', () => {
    runCli(['clear', 'WO-test-001', '--run-id', 'RUN-001', '--dry-run'])
    let audit = readAuditLines().filter(a => a.event === 'terminal_workorder_reset')
    assert.equal(audit.length, 0, 'no audit after dry-run')

    runCli(['clear', 'WO-test-001', '--run-id', 'RUN-001', '--confirm'])
    audit = readAuditLines().filter(a => a.event === 'terminal_workorder_reset')
    assert.equal(audit.length, 1, 'audit after confirm')
  })

  it('runtime_state.json bleibt JSON-valide nach Cleanup', () => {
    runCli(['clear', 'WO-test-001', '--run-id', 'RUN-001', '--confirm'])
    const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
    const raw = fs.readFileSync(statePath, 'utf8')
    assert.doesNotThrow(() => JSON.parse(raw), 'state file must remain valid JSON')
  })

  it('unbekannter Sub-Command → Exit 1 mit Hilfe-Text', () => {
    const r = runCli(['unknown-command'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /Unknown sub-command/)
  })

  it('ohne Sub-Command → Exit 1 mit Hilfe-Text', () => {
    const r = runCli([])
    assert.equal(r.code, 1)
    assert.match(r.stdout, /Usage:/)
  })
})

// ─── Suite: WO-015 State-Manager-Helper ──────────────────────────────────────

describe('WO-015 — State-Manager-Helper (stale-dispatched)', () => {
  before(setupFixture)
  after(teardownFixture)

  it('getActiveRunByRunId liefert running-Run', () => {
    writeState(
      [makeDispatched('WO-w015-001', 'RUN-w015-001', isoMinutesAgo(10))],
      [makeRun('RUN-w015-001', 'WO-w015-001', 'running')],
    )
    const r = getActiveRunByRunId('RUN-w015-001')
    assert.ok(r, 'expected run to be found')
    assert.equal(r!.status, 'running')
  })

  it('getActiveRunByRunId liefert auch terminal-Run (completed/failed/blocked)', () => {
    writeState(
      [makeDispatched('WO-w015-002', 'RUN-w015-002', isoMinutesAgo(120))],
      [makeRun('RUN-w015-002', 'WO-w015-002', 'completed')],
    )
    const r = getActiveRunByRunId('RUN-w015-002')
    assert.ok(r)
    assert.equal(r!.status, 'completed')
  })

  it('getActiveRunByRunId liefert undefined wenn run_id nicht existiert', () => {
    writeState([], [])
    const r = getActiveRunByRunId('RUN-does-not-exist')
    assert.equal(r, undefined)
  })

  it('removeStaleDispatchedActiveWorkorder verweigert non-dispatched Status (failed)', async () => {
    writeState(
      [{ workorder_id: 'WO-w015-fail', run_id: 'RUN-fail', agent_id: 'micro-executor', status: 'failed', dispatched_at: isoMinutesAgo(120) }],
      [],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-fail', 'RUN-fail', { kind: 'no_active_run_and_age' })
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /non-dispatched status/)
  })

  it('removeStaleDispatchedActiveWorkorder verweigert dispatched mit active_run.status=running', async () => {
    writeState(
      [makeDispatched('WO-w015-run', 'RUN-run', isoMinutesAgo(120))],
      [makeRun('RUN-run', 'WO-w015-run', 'running')],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-run', 'RUN-run', { kind: 'no_active_run_and_age' })
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /active run still running/)
    assert.equal(readActiveWorkorders().length, 1, 'state must be unchanged')
  })

  it('removeStaleDispatchedActiveWorkorder verweigert dispatched mit active_run.status=awaiting_approval', async () => {
    writeState(
      [makeDispatched('WO-w015-aw', 'RUN-aw', isoMinutesAgo(120))],
      [makeRun('RUN-aw', 'WO-w015-aw', 'awaiting_approval')],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-aw', 'RUN-aw', { kind: 'active_run_terminal' })
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /active run awaiting approval/)
  })

  it('removeStaleDispatchedActiveWorkorder akzeptiert dispatched mit active_run terminal=completed', async () => {
    writeState(
      [makeDispatched('WO-w015-c', 'RUN-c', isoMinutesAgo(5))],
      [makeRun('RUN-c', 'WO-w015-c', 'completed')],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-c', 'RUN-c', { kind: 'active_run_terminal' })
    assert.equal(r.removed, true, `expected removed, got reason=${r.reason}`)
    assert.equal(readActiveWorkorders().find(w => w.workorder_id === 'WO-w015-c'), undefined)
  })

  it('removeStaleDispatchedActiveWorkorder akzeptiert dispatched mit active_run terminal=failed', async () => {
    writeState(
      [makeDispatched('WO-w015-f', 'RUN-f', isoMinutesAgo(5))],
      [makeRun('RUN-f', 'WO-w015-f', 'failed')],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-f', 'RUN-f', { kind: 'active_run_terminal' })
    assert.equal(r.removed, true)
  })

  it('removeStaleDispatchedActiveWorkorder akzeptiert dispatched ohne active_run und Default-Alter > 60 min', async () => {
    writeState(
      [makeDispatched('WO-w015-old', 'RUN-old', isoMinutesAgo(120))],
      [],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-old', 'RUN-old', { kind: 'no_active_run_and_age' })
    assert.equal(r.removed, true, `expected removed, got reason=${r.reason}`)
    assert.equal(readActiveWorkorders().length, 0)
  })

  it('removeStaleDispatchedActiveWorkorder verweigert dispatched ohne active_run aber recent (< 60 min)', async () => {
    writeState(
      [makeDispatched('WO-w015-recent', 'RUN-recent', isoMinutesAgo(5))],
      [],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-recent', 'RUN-recent', { kind: 'no_active_run_and_age' })
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /evidence insufficient/)
    assert.equal(readActiveWorkorders().length, 1, 'state unchanged')
  })

  it('removeStaleDispatchedActiveWorkorder akzeptiert mit operator_threshold ageMinutes=10 und age=30 min', async () => {
    writeState(
      [makeDispatched('WO-w015-op', 'RUN-op', isoMinutesAgo(30))],
      [],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-op', 'RUN-op', { kind: 'operator_threshold', ageMinutes: 10 })
    assert.equal(r.removed, true)
  })

  it('removeStaleDispatchedActiveWorkorder verweigert operator_threshold ohne ageMinutes', async () => {
    writeState(
      [makeDispatched('WO-w015-noth', 'RUN-noth', isoMinutesAgo(120))],
      [],
    )
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-noth', 'RUN-noth', { kind: 'operator_threshold' })
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /ageMinutes not provided/)
  })

  it('removeStaleDispatchedActiveWorkorder ist idempotent (zweiter Aufruf → no match)', async () => {
    writeState(
      [makeDispatched('WO-w015-idem', 'RUN-idem', isoMinutesAgo(120))],
      [],
    )
    const r1 = await removeStaleDispatchedActiveWorkorder('WO-w015-idem', 'RUN-idem', { kind: 'no_active_run_and_age' })
    assert.equal(r1.removed, true)
    const r2 = await removeStaleDispatchedActiveWorkorder('WO-w015-idem', 'RUN-idem', { kind: 'no_active_run_and_age' })
    assert.equal(r2.removed, false)
    assert.equal(r2.reason, 'no match')
  })

  it('removeStaleDispatchedActiveWorkorder verweigert ambiguous match', async () => {
    const dup = makeDispatched('WO-w015-dup', 'RUN-dup', isoMinutesAgo(120))
    writeState([dup, { ...dup, dispatched_at: isoMinutesAgo(100) }], [])
    const r = await removeStaleDispatchedActiveWorkorder('WO-w015-dup', 'RUN-dup', { kind: 'no_active_run_and_age' })
    assert.equal(r.removed, false)
    assert.match(r.reason ?? '', /ambiguous/)
    assert.equal(readActiveWorkorders().length, 2, 'state unchanged')
  })

  it('removeStaleDispatchedActiveWorkorder bei unbekanntem Match → no match', async () => {
    writeState([], [])
    const r = await removeStaleDispatchedActiveWorkorder('WO-nope', 'RUN-nope', { kind: 'no_active_run_and_age' })
    assert.equal(r.removed, false)
    assert.equal(r.reason, 'no match')
  })

  it('removeStaleDispatchedActiveWorkorder hält runtime_state.json JSON-valide', async () => {
    writeState(
      [makeDispatched('WO-w015-json', 'RUN-json', isoMinutesAgo(120))],
      [],
    )
    await removeStaleDispatchedActiveWorkorder('WO-w015-json', 'RUN-json', { kind: 'no_active_run_and_age' })
    const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
    const raw = fs.readFileSync(statePath, 'utf8')
    assert.doesNotThrow(() => JSON.parse(raw))
  })

  it('removeStaleDispatchedActiveWorkorder mutiert NUR active_workorders (active_runs unverändert)', async () => {
    writeState(
      [makeDispatched('WO-w015-iso', 'RUN-iso', isoMinutesAgo(120))],
      [makeRun('RUN-iso', 'WO-w015-iso', 'completed')],
    )
    await removeStaleDispatchedActiveWorkorder('WO-w015-iso', 'RUN-iso', { kind: 'active_run_terminal' })
    const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
    const s = JSON.parse(fs.readFileSync(statePath, 'utf8'))
    assert.equal(s.active_runs.length, 1, 'active_runs must be untouched')
    assert.equal(s.active_runs[0].run_id, 'RUN-iso')
    assert.equal(s.system_stop, null)
    assert.deepEqual(s.scope_locks, [])
    assert.deepEqual(s.approvals, [])
  })
})

// ─── Suite: WO-015 CLI clear-stale-dispatched ────────────────────────────────

describe('WO-015 — CLI clear-stale-dispatched', () => {
  before(setupFixture)
  after(teardownFixture)
  beforeEach(() => {
    const auditPath = path.resolve(process.cwd(), 'system/state/audit.jsonl')
    if (fs.existsSync(auditPath)) fs.unlinkSync(auditPath)
  })

  it('Hilfe-Text listet beide Sub-Commands clear und clear-stale-dispatched', () => {
    writeState([], [])
    const r = runCli([])
    assert.equal(r.code, 1)
    assert.match(r.stdout, /clear-stale-dispatched/)
  })

  it('clear-stale-dispatched ohne workorder_id → Exit 1', () => {
    writeState([], [])
    const r = runCli(['clear-stale-dispatched', '--run-id', 'RUN-001', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /missing <workorder_id>/)
  })

  it('clear-stale-dispatched ohne --run-id → Exit 1', () => {
    writeState([], [])
    const r = runCli(['clear-stale-dispatched', 'WO-w015-x', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /missing --run-id/)
  })

  it('clear-stale-dispatched mit --dry-run UND --confirm → Exit 1', () => {
    writeState([], [])
    const r = runCli(['clear-stale-dispatched', 'WO-w015-x', '--run-id', 'RUN-x', '--dry-run', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /cannot use --dry-run and --confirm/)
  })

  it('clear-stale-dispatched --older-than-minutes mit ungültigem Wert → Exit 1', () => {
    writeState([], [])
    const r = runCli(['clear-stale-dispatched', 'WO-w015-x', '--run-id', 'RUN-x', '--older-than-minutes', 'abc', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /must be a positive integer/)
  })

  it('clear-stale-dispatched --dry-run mit gültiger Evidence mutiert NICHTS und schreibt KEIN Audit', () => {
    writeState(
      [makeDispatched('WO-w015-dry', 'RUN-dry', isoMinutesAgo(120))],
      [],
    )
    const before = readActiveWorkorders().length
    const r = runCli(['clear-stale-dispatched', 'WO-w015-dry', '--run-id', 'RUN-dry', '--dry-run'])
    assert.equal(r.code, 0, `expected exit 0, got ${r.code}; stderr=${r.stderr}`)
    assert.match(r.stdout, /\[DRY-RUN\]/)
    assert.match(r.stdout, /Would remove 1 stale-dispatched entry/)
    assert.equal(readActiveWorkorders().length, before, 'state must be unchanged')
    const audit = readAuditLines()
    assert.equal(
      audit.filter(a => a.event === 'stale_dispatched_workorder_cleanup').length,
      0,
      'no stale_dispatched audit event after dry-run',
    )
  })

  it('clear-stale-dispatched ohne explizites Flag defaults auf dry-run', () => {
    writeState(
      [makeDispatched('WO-w015-def', 'RUN-def', isoMinutesAgo(120))],
      [],
    )
    const before = readActiveWorkorders().length
    const r = runCli(['clear-stale-dispatched', 'WO-w015-def', '--run-id', 'RUN-def'])
    assert.equal(r.code, 0)
    assert.match(r.stdout, /\[DRY-RUN\]/)
    assert.equal(readActiveWorkorders().length, before, 'state unchanged on default mode')
  })

  it('clear-stale-dispatched --confirm mit terminal active_run entfernt Eintrag und schreibt Audit', () => {
    writeState(
      [makeDispatched('WO-w015-conf', 'RUN-conf', isoMinutesAgo(5))],
      [makeRun('RUN-conf', 'WO-w015-conf', 'completed')],
    )
    const r = runCli(['clear-stale-dispatched', 'WO-w015-conf', '--run-id', 'RUN-conf', '--confirm'])
    assert.equal(r.code, 0, `expected exit 0, got ${r.code}; stderr=${r.stderr}`)
    assert.match(r.stdout, /Removed 1 stale-dispatched/)
    const after = readActiveWorkorders()
    assert.equal(after.find(w => w.workorder_id === 'WO-w015-conf'), undefined)
    const audit = readAuditLines().filter(a => a.event === 'stale_dispatched_workorder_cleanup')
    assert.equal(audit.length, 1, 'exactly one stale_dispatched audit event')
    assert.equal(audit[0].workorder_id, 'WO-w015-conf')
    assert.equal(audit[0].run_id, 'RUN-conf')
    assert.equal(audit[0].approved_by, 'test-operator')
    // Differenzierung: KEIN terminal_workorder_reset Event geschrieben
    const terminalAudit = readAuditLines().filter(a => a.event === 'terminal_workorder_reset')
    assert.equal(terminalAudit.length, 0, 'no terminal_workorder_reset event for stale-dispatched cleanup')
  })

  it('clear-stale-dispatched --confirm verweigert active_run.status=running → Exit 1', () => {
    writeState(
      [makeDispatched('WO-w015-running', 'RUN-running', isoMinutesAgo(120))],
      [makeRun('RUN-running', 'WO-w015-running', 'running')],
    )
    const r = runCli(['clear-stale-dispatched', 'WO-w015-running', '--run-id', 'RUN-running', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /active_run is still 'running'/)
    assert.equal(readActiveWorkorders().length, 1, 'state unchanged')
  })

  it('clear-stale-dispatched --confirm verweigert recently dispatched ohne older-than-minutes', () => {
    writeState(
      [makeDispatched('WO-w015-r', 'RUN-r', isoMinutesAgo(5))],
      [],
    )
    const r = runCli(['clear-stale-dispatched', 'WO-w015-r', '--run-id', 'RUN-r', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /evidence insufficient/)
    assert.equal(readActiveWorkorders().length, 1, 'state unchanged')
  })

  it('clear-stale-dispatched --confirm akzeptiert mit --older-than-minutes wenn Alter ausreicht', () => {
    writeState(
      [makeDispatched('WO-w015-thr', 'RUN-thr', isoMinutesAgo(30))],
      [],
    )
    const r = runCli(['clear-stale-dispatched', 'WO-w015-thr', '--run-id', 'RUN-thr', '--older-than-minutes', '10', '--confirm'])
    assert.equal(r.code, 0, `stderr=${r.stderr}`)
    assert.equal(readActiveWorkorders().length, 0)
  })

  it('clear-stale-dispatched --confirm verweigert non-dispatched Status (failed) mit Hint auf clear', () => {
    writeState(
      [{ workorder_id: 'WO-w015-fail', run_id: 'RUN-fail', agent_id: 'micro-executor', status: 'failed', dispatched_at: isoMinutesAgo(120) }],
      [],
    )
    const r = runCli(['clear-stale-dispatched', 'WO-w015-fail', '--run-id', 'RUN-fail', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /not 'dispatched'/)
    assert.match(r.stderr, /WO-010 path/)
  })

  it('clear-stale-dispatched --confirm bei unbekanntem (workorder_id, run_id) → Exit 2', () => {
    writeState([], [])
    const r = runCli(['clear-stale-dispatched', 'WO-no-such', '--run-id', 'RUN-no-such', '--confirm'])
    assert.equal(r.code, 2)
  })

  it('clear-stale-dispatched --confirm bei ambiguous match → Exit 1', () => {
    const dup = makeDispatched('WO-w015-dup', 'RUN-dup', isoMinutesAgo(120))
    writeState([dup, { ...dup, dispatched_at: isoMinutesAgo(100) }], [])
    const r = runCli(['clear-stale-dispatched', 'WO-w015-dup', '--run-id', 'RUN-dup', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /ambiguous/)
  })

  it('Audit-Differenzierung: bestehendes WO-010 clear schreibt terminal_workorder_reset, NICHT stale_dispatched_workorder_cleanup', () => {
    writeState(
      [{ workorder_id: 'WO-w015-diff', run_id: 'RUN-diff', agent_id: 'micro-executor', status: 'failed', dispatched_at: isoMinutesAgo(120) }],
      [],
    )
    const r = runCli(['clear', 'WO-w015-diff', '--run-id', 'RUN-diff', '--confirm'])
    assert.equal(r.code, 0)
    const terminal = readAuditLines().filter(a => a.event === 'terminal_workorder_reset')
    const stale    = readAuditLines().filter(a => a.event === 'stale_dispatched_workorder_cleanup')
    assert.equal(terminal.length, 1, 'WO-010 path emits terminal_workorder_reset')
    assert.equal(stale.length, 0, 'WO-010 path does NOT emit stale_dispatched_workorder_cleanup')
  })

  it('runtime_state.json bleibt JSON-valide nach clear-stale-dispatched --confirm', () => {
    writeState(
      [makeDispatched('WO-w015-jsonv', 'RUN-jsonv', isoMinutesAgo(120))],
      [],
    )
    runCli(['clear-stale-dispatched', 'WO-w015-jsonv', '--run-id', 'RUN-jsonv', '--confirm'])
    const statePath = path.resolve(process.cwd(), 'system/state/runtime_state.json')
    const raw = fs.readFileSync(statePath, 'utf8')
    assert.doesNotThrow(() => JSON.parse(raw))
  })

  it('WO-010 clear-Verhalten bleibt 1:1 unverändert: clear gegen dispatched-Eintrag → Exit 1', () => {
    writeState(
      [makeDispatched('WO-w015-w010', 'RUN-w010', isoMinutesAgo(120))],
      [],
    )
    const r = runCli(['clear', 'WO-w015-w010', '--run-id', 'RUN-w010', '--confirm'])
    assert.equal(r.code, 1)
    assert.match(r.stderr, /non-terminal/)
    assert.equal(readActiveWorkorders().length, 1, 'state unchanged on WO-010 dispatched refusal')
  })
})
