/**
 * LUMEOS State Manager V1.2.3
 * Atomic Write + File Lock (pid + created_at + expires_at)
 * Stale Lock Threshold: 90 Sekunden
 * Approval Tokens laufen über state-manager (gemeinsamer Lock)
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

export interface ApprovalRef {
  approval_id:  string
  workorder_id: string
  run_id?:      string
  status:       'pending' | 'granted' | 'denied' | 'expired' | 'consumed'
}

export interface RuntimeState {
  orchestration_mode: OrchestratorMode
  spark_mode:         SparkMode
  active_runs:        Run[]
  active_workorders:  ActiveWorkorder[]
  locks:              Lock[]
  approvals:          ApprovalRef[]
  audit_log_path:     string
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

const DEFAULT_STATE: RuntimeState = {
  orchestration_mode: 'claude_code',
  spark_mode:         'mode1',
  active_runs:        [],
  active_workorders:  [],
  locks:              [],
  approvals:          [],
  audit_log_path:     'system/state/audit.jsonl',
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

export async function updateWorkorderStatus(workorderId: string, status: ActiveWorkorder['status']): Promise<void> {
  await mutate(s => { const wo = s.active_workorders.find(w => w.workorder_id === workorderId); if (wo) wo.status = status })
}

export async function lockSpark(node: string, reason: string, lockedBy?: string): Promise<void> {
  await mutate(s => { if (!s.locks.find(l => l.node === node)) s.locks.push({ node, reason, locked_at: new Date().toISOString(), locked_by: lockedBy }) })
}

export async function releaseSpark(node: string): Promise<void> { await mutate(s => { s.locks = s.locks.filter(l => l.node !== node) }) }
export function isSparkLocked(node: string): boolean { return readState().locks.some(l => l.node === node) }

export async function addApprovalRef(ref: ApprovalRef): Promise<void> { await mutate(s => { s.approvals.push(ref) }) }

export async function updateApprovalStatus(approvalId: string, status: ApprovalRef['status']): Promise<void> {
  await mutate(s => { const r = s.approvals.find(a => a.approval_id === approvalId); if (r) r.status = status })
}

// Approval Token Store — via state-manager Lock gesichert
export function readApprovalTokens(): Record<string, any> {
  if (!fs.existsSync(getApprovalsPath())) return {}
  try { return JSON.parse(fs.readFileSync(getApprovalsPath(), 'utf8')) }
  catch { return {} }
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
