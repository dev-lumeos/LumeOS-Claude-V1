/**
 * LUMEOS State Manager V1.4.0
 * Atomic Write + File Lock (pid + created_at + expires_at)
 * Stale Lock Threshold: 90 Sekunden
 * V1.3: Scope-Locks + DB-Migration-Lock (A.3)
 * V1.4: WO-State-Machine (D.1) + System Stop / Kill-Switch (C.1)
 */

import fs   from 'node:fs'
import path from 'node:path'

// ─── Typen ───────────────────────────────────────────────────────────────────

export type SparkMode        = 'mode1' | 'mode2' | 'transitioning'
export type OrchestratorMode = 'claude_code' | 'nemotron'

export interface Run {
  run_id:          string
  workorder_id:    string
  agent_id:        string
  status:          'running' | 'completed' | 'failed' | 'blocked' | 'awaiting_approval'
  started_at:      string
  completed_at?:   string
  written_files:   string[]
  correlation_id?: string
}

export interface ActiveWorkorder {
  workorder_id:  string
  agent_id:      string
  run_id?:       string
  status:        'queued' | 'dispatched' | 'running' | 'review' | 'awaiting_approval' | 'done' | 'failed'
  dispatched_at: string
}

export interface Lock {
  node:       string
  reason:     string
  locked_at:  string
  locked_by?: string
}

export type ApprovalStatus = 'pending' | 'granted' | 'denied' | 'expired' | 'consumed'

/**
 * C.2: ApprovalItem — vollständiges Approval-Objekt im RuntimeState.
 * Enthält Kontext für pending Requests (reason, risk_category, affected_files, etc.)
 * Ersetzt ApprovalRef als primäre Storage-Einheit in runtime_state.approvals[].
 */
export interface ApprovalItem {
  approval_id:      string
  workorder_id:     string
  run_id?:          string
  status:           ApprovalStatus
  /** C.2: Warum menschliche Genehmigung nötig ist */
  reason?:          string
  /** C.2: Aus risk-categories.ts */
  risk_category?:   string
  /** C.2: Betroffene Dateien */
  affected_files?:  string[]
  /** C.2: Was der Agent konkret tun will */
  proposed_action?: string
  /** C.2: Welcher Agent die Approval angefordert hat */
  requested_by?:    string
  requested_at?:    string
  /** C.2: TTL — default 24h nach requested_at */
  expires_at?:      string
  decided_at?:      string
  decided_by?:      string
  deny_reason?:     string
}

/** @deprecated Verwende ApprovalItem */
export type ApprovalRef = ApprovalItem

/** A.3: Scope-Lock — verhindert parallele WOs auf denselben Dateien. */
export interface ScopeLock {
  run_id:      string
  scope_files: string[]
  locked_at:   string
  expires_at:  string   // TTL: SCOPE_LOCK_TTL_MS ab locked_at
}

/** A.3: DB-Migration-Lock — globaler Exklusiv-Lock, max. eine Migration gleichzeitig. */
export interface DbMigrationLock {
  run_id:     string
  locked_at:  string
  expires_at: string
}

/**
 * C.1: System Stop — globale Notbremse.
 * Wenn aktiv: Dispatcher + Preflight blockieren alle neuen Runs.
 * Nur manuell durch Tom oder explizite clearSystemStop() auflösbar.
 */
export interface SystemStop {
  active:     true
  reason:     string
  stopped_at: string
  stopped_by: string   // 'human' | 'auto' | beliebiger String
}

export interface RuntimeState {
  orchestration_mode: OrchestratorMode
  spark_mode:         SparkMode
  active_runs:        Run[]
  active_workorders:  ActiveWorkorder[]
  locks:              Lock[]
  approvals:          ApprovalItem[]
  audit_log_path:     string
  /** V2: Persistierter Rewrite-Counter pro run_id + tier. */
  rewrite_counters?:  Record<string, Record<string, number>>
  /** A.3: Scope-Locks — verhindert parallele WOs auf denselben Dateien. */
  scope_locks?:       ScopeLock[]
  /** A.3: DB-Migration-Lock — globaler Exklusiv-Lock. */
  db_migration_lock?: DbMigrationLock | null
  /** C.1: System Stop — globale Notbremse. null = kein Stop aktiv. */
  system_stop?:       SystemStop | null
}

interface LockMeta {
  pid:        number
  created_at: string
  expires_at: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

// Lazy path resolution: tests use process.chdir() into a temp dir; eager
// resolution at module-init would bake the real repo path into the test run.
function getStatePath():     string { return path.resolve(process.cwd(), 'system/state/runtime_state.json') }
function getLockPath():      string { return path.resolve(process.cwd(), 'system/state/runtime_state.lock') }
function getApprovalsPath(): string { return path.resolve(process.cwd(), 'system/approval/approvals.json') }
const LOCK_ACQUIRE_MS = 5_000
const LOCK_STALE_MS   = 90_000
const LOCK_RETRY_MS   = 50
/** A.3: TTL für Scope-Locks und DB-Migration-Lock — 10 Minuten. */
const SCOPE_LOCK_TTL_MS = 600_000
/** C.2: TTL für Approval-Items — 24 Stunden. */
export const DEFAULT_APPROVAL_TTL_MS = 24 * 60 * 60 * 1_000

const DEFAULT_STATE: RuntimeState = {
  orchestration_mode: 'claude_code',
  spark_mode:         'mode1',
  active_runs:        [],
  active_workorders:  [],
  locks:              [],
  approvals:          [],
  audit_log_path:     'system/state/audit.jsonl',
  rewrite_counters:   {},
  scope_locks:        [],
  db_migration_lock:  null,
  system_stop:        null,
}

// ─── File Lock ────────────────────────────────────────────────────────────────

function isLockStale(): boolean {
  if (!fs.existsSync(getLockPath())) return false
  try {
    const meta: LockMeta = JSON.parse(fs.readFileSync(getLockPath(), 'utf8'))
    return Date.now() > new Date(meta.expires_at).getTime()
  } catch { return true }
}

function writeLock(): void {
  const now = Date.now()
  const meta: LockMeta = {
    pid:        process.pid,
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + LOCK_STALE_MS).toISOString(),
  }
  fs.writeFileSync(getLockPath(), JSON.stringify(meta), { flag: 'wx' })
}

async function acquireLock(): Promise<void> {
  const deadline = Date.now() + LOCK_ACQUIRE_MS
  while (Date.now() < deadline) {
    try { writeLock(); return }
    catch {
      if (isLockStale()) { try { fs.unlinkSync(getLockPath()) } catch {}; continue }
      await new Promise(r => setTimeout(r, LOCK_RETRY_MS))
    }
  }
  throw new Error(`State lock acquire timeout nach ${LOCK_ACQUIRE_MS}ms — PID ${process.pid}`)
}

function releaseLock(): void { try { fs.unlinkSync(getLockPath()) } catch {} }

// ─── Atomic Read/Write ────────────────────────────────────────────────────────

function readState(): RuntimeState {
  if (!fs.existsSync(getStatePath())) return { ...DEFAULT_STATE }
  try { return JSON.parse(fs.readFileSync(getStatePath(), 'utf8')) }
  catch { return { ...DEFAULT_STATE } }
}

function writeState(state: RuntimeState): void {
  const dir = path.dirname(getStatePath())
  const tmp = getStatePath() + '.tmp'
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const fd = fs.openSync(tmp, 'w')
  fs.writeSync(fd, JSON.stringify(state, null, 2))
  fs.fsyncSync(fd)
  fs.closeSync(fd)
  fs.renameSync(tmp, getStatePath())
}

async function mutate(fn: (state: RuntimeState) => void): Promise<void> {
  await acquireLock()
  try { const s = readState(); fn(s); writeState(s) }
  finally { releaseLock() }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getOrchestrationMode(): OrchestratorMode { return readState().orchestration_mode }
export function getSparkMode(): SparkMode { return readState().spark_mode }
export async function setSparkMode(mode: SparkMode): Promise<void> { await mutate(s => { s.spark_mode = mode }) }

export async function startRun(runId: string, workorderId: string, agentId: string, correlationId?: string): Promise<void> {
  await mutate(s => { s.active_runs.push({ run_id: runId, workorder_id: workorderId, agent_id: agentId, status: 'running', started_at: new Date().toISOString(), written_files: [], correlation_id: correlationId }) })
}

export async function endRun(runId: string, status: Run['status']): Promise<void> {
  await mutate(s => { const r = s.active_runs.find(r => r.run_id === runId); if (r) { r.status = status; r.completed_at = new Date().toISOString() } })
}

export async function addWrittenFile(runId: string, filePath: string): Promise<void> {
  await mutate(s => { const r = s.active_runs.find(r => r.run_id === runId); if (r && !r.written_files.includes(filePath)) r.written_files.push(filePath) })
}

export function getWrittenFiles(runId: string): string[] {
  return readState().active_runs.find(r => r.run_id === runId)?.written_files ?? []
}

export function getActiveRuns(): Run[] { return readState().active_runs.filter(r => r.status === 'running') }

export async function startWorkorder(workorderId: string, agentId: string, runId?: string): Promise<void> {
  await mutate(s => { s.active_workorders.push({ workorder_id: workorderId, agent_id: agentId, run_id: runId, status: 'dispatched', dispatched_at: new Date().toISOString() }) })
}

// ─── WO-State-Machine (D.1) ───────────────────────────────────────────────────
// Erlaubte Statusübergänge für ActiveWorkorder.status.
// Terminale Zustände: done, failed — keine weiteren Übergänge erlaubt.
// Illegal transitions werden blockiert und in audit.error.jsonl protokolliert.

type WoStatus = ActiveWorkorder['status']

export const WO_TRANSITIONS: Record<WoStatus, WoStatus[]> = {
  queued:            ['dispatched'],
  dispatched:        ['running', 'done', 'failed', 'review', 'awaiting_approval'],
  running:           ['done', 'failed', 'review', 'awaiting_approval'],
  review:            ['dispatched', 'failed'],
  awaiting_approval: ['dispatched', 'failed'],
  done:              [],   // terminal
  failed:            [],   // terminal
}

export interface WoTransitionResult {
  valid:   boolean
  reason?: string
}

/** Prüft ob ein Statusübergang erlaubt ist. Gibt { valid, reason? } zurück. */
export function validateWoStatusTransition(from: WoStatus, to: WoStatus): WoTransitionResult {
  if (from === to) return { valid: true }  // same-state idempotent
  const allowed = WO_TRANSITIONS[from]
  if (!allowed) return { valid: false, reason: `Unbekannter Ausgangsstatus: ${from}` }
  if (!allowed.includes(to)) {
    return {
      valid:  false,
      reason: `Illegaler Übergang: ${from} → ${to}. Erlaubt: [${allowed.join(', ') || 'none'}]`,
    }
  }
  return { valid: true }
}

/** Protokolliert ungültige Übergänge in audit.error.jsonl. Kein State-Lock nötig (append-only). */
function appendInvalidTransition(workorderId: string, from: WoStatus, to: WoStatus, reason?: string): void {
  const errPath = path.resolve(process.cwd(), 'system/state/audit.error.jsonl')
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    event: 'wo_status_invalid_transition',
    workorder_id: workorderId,
    from_status: from,
    to_status: to,
    reason: reason ?? `Illegaler Übergang: ${from} → ${to}`,
  })
  try {
    const dir = path.dirname(errPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.appendFileSync(errPath, line + '\n', 'utf8')
  } catch { /* non-fatal — state update still proceeds */ }
}

export async function updateWorkorderStatus(workorderId: string, status: ActiveWorkorder['status']): Promise<void> {
  await mutate(s => {
    const wo = s.active_workorders.find(w => w.workorder_id === workorderId)
    if (!wo) return

    // D.1: State-Machine Enforcement — illegale Übergänge werden blockiert + protokolliert
    const validation = validateWoStatusTransition(wo.status, status)
    if (!validation.valid) {
      appendInvalidTransition(workorderId, wo.status, status, validation.reason)
      return  // Status NICHT ändern
    }

    wo.status = status
  })
}

export async function lockSpark(node: string, reason: string, lockedBy?: string): Promise<void> {
  await mutate(s => { if (!s.locks.find(l => l.node === node)) s.locks.push({ node, reason, locked_at: new Date().toISOString(), locked_by: lockedBy }) })
}

export async function releaseSpark(node: string): Promise<void> { await mutate(s => { s.locks = s.locks.filter(l => l.node !== node) }) }
export function isSparkLocked(node: string): boolean { return readState().locks.some(l => l.node === node) }

// ─── Approval State Machine (C.2) ─────────────────────────────────────────────

export const APPROVAL_TRANSITIONS: Record<ApprovalStatus, ApprovalStatus[]> = {
  pending:  ['granted', 'denied', 'expired'],
  granted:  ['consumed'],
  denied:   [],   // terminal
  expired:  [],   // terminal
  consumed: [],   // terminal
}

export interface ApprovalTransitionResult {
  valid:   boolean
  reason?: string
}

/** Prüft ob ein Approval-Statusübergang erlaubt ist. */
export function validateApprovalTransition(from: ApprovalStatus, to: ApprovalStatus): ApprovalTransitionResult {
  if (from === to) return { valid: true }
  const allowed = APPROVAL_TRANSITIONS[from]
  if (!allowed) return { valid: false, reason: `Unbekannter Status: ${from}` }
  if (!allowed.includes(to))
    return { valid: false, reason: `Illegaler Übergang: ${from} → ${to}. Erlaubt: [${allowed.join(', ') || 'none'}]` }
  return { valid: true }
}

/** Protokolliert ungültige Approval-Übergänge in audit.error.jsonl. Kein Lock nötig (append-only). */
function appendInvalidApprovalTransition(approvalId: string, from: ApprovalStatus, to: ApprovalStatus, reason?: string): void {
  const errPath = path.resolve(process.cwd(), 'system/state/audit.error.jsonl')
  const line = JSON.stringify({
    ts: new Date().toISOString(), event: 'approval_invalid_transition',
    approval_id: approvalId, from_status: from, to_status: to,
    reason: reason ?? `Illegaler Übergang: ${from} → ${to}`,
  })
  try { const dir = path.dirname(errPath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.appendFileSync(errPath, line + '\n', 'utf8') } catch {}
}

export async function addApprovalRef(ref: ApprovalItem): Promise<void> { await mutate(s => { s.approvals.push(ref) }) }

/** C.2: updateApprovalStatus mit State-Machine-Enforcement. Illegale Übergänge werden blockiert + auditiert. */
export async function updateApprovalStatus(approvalId: string, status: ApprovalStatus): Promise<void> {
  await mutate(s => {
    const r = s.approvals.find(a => a.approval_id === approvalId)
    if (!r) return
    const v = validateApprovalTransition(r.status, status)
    if (!v.valid) { appendInvalidApprovalTransition(approvalId, r.status, status, v.reason); return }
    r.status = status
    if (status === 'granted' || status === 'denied' || status === 'expired' || status === 'consumed')
      r.decided_at = new Date().toISOString()
  })
}

// ─── C.2 Approval Queue Operationen ───────────────────────────────────────────

export interface CreatePendingApprovalParams {
  workorder_id:    string
  run_id?:         string
  reason:          string
  risk_category:   string
  affected_files:  string[]
  proposed_action: string
  requested_by:    string
  approval_id?:    string
}

/** Erzeugt ein neues pending ApprovalItem in runtime_state.approvals[]. TTL = 24h. */
export async function createPendingApproval(params: CreatePendingApprovalParams): Promise<ApprovalItem> {
  const now = new Date()
  const approval_id = params.approval_id
    ?? `APP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`
  const item: ApprovalItem = {
    approval_id, workorder_id: params.workorder_id, run_id: params.run_id, status: 'pending',
    reason: params.reason, risk_category: params.risk_category, affected_files: params.affected_files,
    proposed_action: params.proposed_action, requested_by: params.requested_by,
    requested_at: now.toISOString(), expires_at: new Date(now.getTime() + DEFAULT_APPROVAL_TTL_MS).toISOString(),
  }
  await mutate(s => { s.approvals.push(item) })
  return item
}

/** Alle pending, nicht-abgelaufenen ApprovalItems. */
export function getPendingApprovals(): ApprovalItem[] {
  const now = Date.now()
  return readState().approvals.filter(
    a => a.status === 'pending' && (!a.expires_at || new Date(a.expires_at).getTime() > now)
  )
}

/** Alle ApprovalItems (alle Statuswerte). */
export function getAllApprovalItems(): ApprovalItem[] {
  return readState().approvals
}

/** Einzelnes ApprovalItem per ID. */
export function getApprovalItem(approvalId: string): ApprovalItem | null {
  return readState().approvals.find(a => a.approval_id === approvalId) ?? null
}

/**
 * Setzt abgelaufene `pending` Items auf `expired`.
 * Sollte periodisch aufgerufen werden (z.B. vor jedem Preflight-Run).
 * Gibt Anzahl der expirierten Items zurück.
 */
export async function expireStaleApprovals(): Promise<number> {
  let count = 0
  await mutate(s => {
    const now = Date.now()
    for (const item of s.approvals) {
      if (item.status === 'pending' && item.expires_at && new Date(item.expires_at).getTime() <= now) {
        const v = validateApprovalTransition(item.status, 'expired')
        if (v.valid) { item.status = 'expired'; item.decided_at = new Date().toISOString(); count++ }
      }
    }
  })
  return count
}

/** pending → granted. Gibt { ok, item } zurück. Blockiert bei abgelaufenem oder illegalem Übergang. */
export async function grantApprovalItem(
  approvalId: string,
  decidedBy = 'human',
): Promise<{ ok: true; item: ApprovalItem } | { ok: false; reason: string }> {
  let result: { ok: true; item: ApprovalItem } | { ok: false; reason: string } =
    { ok: false, reason: `Approval nicht gefunden: ${approvalId}` }
  await mutate(s => {
    const item = s.approvals.find(a => a.approval_id === approvalId)
    if (!item) return
    if (item.expires_at && new Date(item.expires_at).getTime() <= Date.now()) {
      item.status = 'expired'; item.decided_at = new Date().toISOString()
      result = { ok: false, reason: `Approval abgelaufen: ${approvalId}` }; return
    }
    const v = validateApprovalTransition(item.status, 'granted')
    if (!v.valid) { appendInvalidApprovalTransition(approvalId, item.status, 'granted', v.reason); result = { ok: false, reason: v.reason! }; return }
    item.status = 'granted'; item.decided_at = new Date().toISOString(); item.decided_by = decidedBy
    result = { ok: true, item: { ...item } }
  })
  return result
}

/** pending → denied. Gibt { ok, item } zurück. */
export async function denyApprovalItem(
  approvalId: string,
  decidedBy = 'human',
  denyReason?: string,
): Promise<{ ok: true; item: ApprovalItem } | { ok: false; reason: string }> {
  let result: { ok: true; item: ApprovalItem } | { ok: false; reason: string } =
    { ok: false, reason: `Approval nicht gefunden: ${approvalId}` }
  await mutate(s => {
    const item = s.approvals.find(a => a.approval_id === approvalId)
    if (!item) return
    const v = validateApprovalTransition(item.status, 'denied')
    if (!v.valid) { appendInvalidApprovalTransition(approvalId, item.status, 'denied', v.reason); result = { ok: false, reason: v.reason! }; return }
    item.status = 'denied'; item.decided_at = new Date().toISOString(); item.decided_by = decidedBy; item.deny_reason = denyReason
    result = { ok: true, item: { ...item } }
  })
  return result
}

/** granted → consumed. Blockiert bei illegalem Übergang. */
export async function consumeApprovalItem(approvalId: string): Promise<void> {
  await mutate(s => {
    const item = s.approvals.find(a => a.approval_id === approvalId)
    if (!item) return
    const v = validateApprovalTransition(item.status, 'consumed')
    if (!v.valid) { appendInvalidApprovalTransition(approvalId, item.status, 'consumed', v.reason); return }
    item.status = 'consumed'; item.decided_at = new Date().toISOString()
  })
}

// Approval Token Store — via state-manager Lock gesichert
export function readApprovalTokens(): Record<string, any> {
  if (!fs.existsSync(getApprovalsPath())) return {}
  try { return JSON.parse(fs.readFileSync(getApprovalsPath(), 'utf8')) }
  catch { return {} }
}

// ─── Rewrite Counter (V2) ─────────────────────────────────────────────────────
// Persistierter Counter pro run_id + tier.
// Ermöglicht Loop-Erkennung über mehrere Worker-Re-Runs hinweg.
// Sicherer Zugriff via state-manager Lock (mutate).

/** Liest aktuellen Rewrite-Count für einen Run + Tier. Sync. */
export function getRewriteCount(runId: string, tier: string): number {
  return readState().rewrite_counters?.[runId]?.[tier] ?? 0
}

/** Inkrementiert Rewrite-Count für einen Run + Tier. Atomic via Lock. */
export async function incrementRewriteCount(runId: string, tier: string): Promise<void> {
  await mutate(s => {
    if (!s.rewrite_counters) s.rewrite_counters = {}
    if (!s.rewrite_counters[runId]) s.rewrite_counters[runId] = {}
    s.rewrite_counters[runId][tier] = (s.rewrite_counters[runId][tier] ?? 0) + 1
  })
}

/** Löscht alle Counter für einen Run (z.B. bei run.completed oder run.failed). */
export async function clearRewriteCounters(runId: string): Promise<void> {
  await mutate(s => {
    if (s.rewrite_counters) delete s.rewrite_counters[runId]
  })
}

// ─── Scope-Locks (A.3) ───────────────────────────────────────────────────────
// Verhindert parallele WOs auf denselben Dateien.
// Scope-Level Lock pro run_id, TTL = SCOPE_LOCK_TTL_MS.
// Abgelaufene Locks werden vor jedem Konflikt-Check automatisch bereinigt.

export interface ScopeConflict {
  conflicting_run_id: string
  conflicting_files:  string[]
}

/** Bereinigt abgelaufene Scope-Locks (intern, läuft inside mutate). */
function cleanupStaleScopeLocks(s: RuntimeState): void {
  const now = Date.now()
  s.scope_locks = (s.scope_locks ?? []).filter(
    l => new Date(l.expires_at).getTime() > now
  )
}

/**
 * Prüft ob scope_files mit einem aktiven Scope-Lock überlappen.
 * Sync — ruft readState() ohne Lock.
 */
export function checkScopeConflict(
  scopeFiles: string[],
  excludeRunId?: string,
): ScopeConflict | null {
  const state = readState()
  const now   = Date.now()
  const active = (state.scope_locks ?? []).filter(l =>
    l.run_id !== excludeRunId &&
    new Date(l.expires_at).getTime() > now
  )
  for (const lock of active) {
    const overlap = scopeFiles.filter(f => lock.scope_files.includes(f))
    if (overlap.length > 0) {
      return { conflicting_run_id: lock.run_id, conflicting_files: overlap }
    }
  }
  return null
}

/**
 * Versucht einen Scope-Lock für runId + scopeFiles zu erwerben.
 * Atomic via state-manager Lock.
 * Gibt { acquired: true } oder { acquired: false, conflict } zurück.
 */
export async function acquireScopeLock(
  runId: string,
  scopeFiles: string[],
): Promise<{ acquired: true } | { acquired: false; conflict: ScopeConflict }> {
  let result: { acquired: true } | { acquired: false; conflict: ScopeConflict } = { acquired: true }

  await mutate(s => {
    cleanupStaleScopeLocks(s)

    // Konflikt-Check innerhalb von mutate (atomarer Lese-Schreib-Zyklus)
    const existing = (s.scope_locks ?? []).filter(l => l.run_id !== runId)
    for (const lock of existing) {
      const overlap = scopeFiles.filter(f => lock.scope_files.includes(f))
      if (overlap.length > 0) {
        result = { acquired: false, conflict: { conflicting_run_id: lock.run_id, conflicting_files: overlap } }
        return  // kein Lock setzen
      }
    }

    // Kein Konflikt → Lock setzen
    if (!s.scope_locks) s.scope_locks = []
    // Bestehenden Lock für denselben Run updaten (Idempotenz)
    s.scope_locks = s.scope_locks.filter(l => l.run_id !== runId)
    s.scope_locks.push({
      run_id:      runId,
      scope_files: scopeFiles,
      locked_at:   new Date().toISOString(),
      expires_at:  new Date(Date.now() + SCOPE_LOCK_TTL_MS).toISOString(),
    })
  })

  return result
}

/**
 * Gibt den Scope-Lock für runId frei.
 *
 * Idempotent: Wenn kein Lock für die runId existiert (bereits released oder
 * nie acquired), bleibt scope_locks unverändert. Doppelte Aufrufe sind sicher.
 * Genutzt vom Dispatcher in finally-Cleanup-Pfaden (siehe dispatcher.ts V1.2.4).
 */
export async function releaseScopeLock(runId: string): Promise<void> {
  await mutate(s => {
    s.scope_locks = (s.scope_locks ?? []).filter(l => l.run_id !== runId)
  })
}

/** Alle aktiven (nicht-abgelaufenen) Scope-Locks. */
export function getActiveScopeLocks(): ScopeLock[] {
  const now = Date.now()
  return (readState().scope_locks ?? []).filter(
    l => new Date(l.expires_at).getTime() > now
  )
}

// ─── DB-Migration-Lock (A.3) ─────────────────────────────────────────────────
// Globaler Exklusiv-Lock — max. eine Migration gleichzeitig.

/**
 * Prüft ob ein aktiver DB-Migration-Lock existiert.
 * Sync — ruft readState() ohne Lock.
 */
export function isDbMigrationLocked(): { locked: false } | { locked: true; run_id: string } {
  const state = readState()
  const lock  = state.db_migration_lock
  if (!lock) return { locked: false }
  if (new Date(lock.expires_at).getTime() <= Date.now()) return { locked: false }
  return { locked: true, run_id: lock.run_id }
}

/**
 * Versucht den globalen DB-Migration-Lock zu erwerben.
 * Gibt { acquired: true } oder { acquired: false, conflicting_run_id } zurück.
 */
export async function acquireDbMigrationLock(
  runId: string,
): Promise<{ acquired: true } | { acquired: false; conflicting_run_id: string }> {
  let result: { acquired: true } | { acquired: false; conflicting_run_id: string } = { acquired: true }

  await mutate(s => {
    const existing = s.db_migration_lock
    if (existing && new Date(existing.expires_at).getTime() > Date.now() && existing.run_id !== runId) {
      result = { acquired: false, conflicting_run_id: existing.run_id }
      return
    }
    s.db_migration_lock = {
      run_id:     runId,
      locked_at:  new Date().toISOString(),
      expires_at: new Date(Date.now() + SCOPE_LOCK_TTL_MS).toISOString(),
    }
  })

  return result
}

/**
 * Gibt den DB-Migration-Lock für runId frei.
 *
 * Idempotent: Setzt nur dann null, wenn der aktuelle Lock zur runId gehört.
 * Wenn bereits released oder ein anderer Run den Lock hält, bleibt der State
 * unverändert. Doppelte Aufrufe sind sicher. Genutzt vom Dispatcher in
 * finally-Cleanup-Pfaden (siehe dispatcher.ts V1.2.4).
 */
export async function releaseDbMigrationLock(runId: string): Promise<void> {
  await mutate(s => {
    if (s.db_migration_lock?.run_id === runId) s.db_migration_lock = null
  })
}

// ─── System Stop / Kill-Switch (C.1) ─────────────────────────────────────────
// Globale Notbremse — blockiert alle neuen Runs.
// Nur durch clearSystemStop() auflösbar.
// Dispatcher und Preflight prüfen isSystemStopped() vor jedem neuen Run.

/**
 * Prüft ob System Stop aktiv ist.
 * Sync — liest direkt, kein Lock nötig (read-only).
 */
export function isSystemStopped(): { stopped: false } | { stopped: true; reason: string; stopped_at: string } {
  const s = readState()
  const stop = s.system_stop
  if (!stop?.active) return { stopped: false }
  return { stopped: true, reason: stop.reason, stopped_at: stop.stopped_at }
}

/**
 * Aktiviert den System Stop. Atomic via Lock.
 * Idempotent — zweites trigger() mit anderem reason überschreibt.
 */
export async function triggerSystemStop(reason: string, stoppedBy = 'human'): Promise<void> {
  await mutate(s => {
    s.system_stop = { active: true, reason, stopped_at: new Date().toISOString(), stopped_by: stoppedBy }
  })
}

/**
 * Hebt den System Stop auf. Atomic via Lock.
 * Idempotent — clearSystemStop() wenn kein Stop aktiv: no-op.
 */
export async function clearSystemStop(): Promise<void> {
  await mutate(s => { s.system_stop = null })
}

export async function writeApprovalToken(approvalId: string, token: any): Promise<void> {
  await mutate(_s => {
    const tokens = readApprovalTokens()
    tokens[approvalId] = token
    const dir = path.dirname(getApprovalsPath())
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const tmp = getApprovalsPath() + '.tmp'
    const fd  = fs.openSync(tmp, 'w')
    fs.writeSync(fd, JSON.stringify(tokens, null, 2))
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fs.renameSync(tmp, getApprovalsPath())
  })
}
