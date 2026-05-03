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
  getAllActiveWorkorders,
  removeTerminalActiveWorkorder,
  type ActiveWorkorder,
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

function writeState(entries: ActiveWorkorder[]): void {
  const state = {
    orchestration_mode: 'claude_code',
    spark_mode:         'mode1',
    active_runs:        [],
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
