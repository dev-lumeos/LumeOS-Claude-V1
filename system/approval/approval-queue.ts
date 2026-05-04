/**
 * LUMEOS Approval Queue — C.2
 * system/approval/approval-queue.ts
 *
 * Formalisierte Approval-Queue für menschliche Entscheidungen.
 * Storage: system/approval/queue.json (eigene Datei, unabhängig von runtime_state)
 *
 * Status-Übergänge (State Machine):
 *   pending  → granted | denied | expired
 *   granted  → consumed
 *   denied / expired / consumed → terminal
 *
 * CLI: npx tsx system/approval/approval-cli.ts list|grant|deny|show|expire
 */

import fs   from 'node:fs'
import path from 'node:path'
import * as state from '../state/state-manager'
import * as audit from '../state/audit-writer'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'granted' | 'denied' | 'expired' | 'consumed'

export interface ApprovalQueueItem {
  approval_id:     string
  workorder_id:    string
  run_id:          string
  agent_id:        string
  /** Warum menschliche Genehmigung nötig ist */
  reason:          string
  /** Aus risk-categories.ts */
  risk_category:   string
  /** Welche Dateien betroffen sind */
  affected_files:  string[]
  /** Was der Agent konkret tun will */
  proposed_action: string
  /** Approval operation used by approval-gate.ts. */
  operation?:       string
  /** Tool constrained by the human grant. */
  tool?:            'read' | 'write' | 'bash' | 'mcp' | string
  /** Exact command for command approvals. */
  exact_command?:   string
  status:          ApprovalStatus
  requested_at:    string
  expires_at:      string   // TTL: APPROVAL_TTL_MS nach requested_at
  decided_at?:     string
  decided_by?:     string
  deny_reason?:    string
}

// ─── State Machine ────────────────────────────────────────────────────────────

export const APPROVAL_TRANSITIONS: Record<ApprovalStatus, ApprovalStatus[]> = {
  pending:  ['granted', 'denied', 'expired'],
  granted:  ['consumed'],
  denied:   [],
  expired:  [],
  consumed: [],
}

export interface ApprovalTransitionResult { valid: boolean; reason?: string }

/** Prüft ob ein Statusübergang erlaubt ist. */
export function validateApprovalTransition(from: ApprovalStatus, to: ApprovalStatus): ApprovalTransitionResult {
  if (from === to) return { valid: true }
  const allowed = APPROVAL_TRANSITIONS[from]
  if (!allowed) return { valid: false, reason: `Unbekannter Status: ${from}` }
  if (!allowed.includes(to))
    return { valid: false, reason: `Illegaler Übergang: ${from} → ${to}. Erlaubt: [${allowed.join(', ') || 'none'}]` }
  return { valid: true }
}

// ─── Config + I/O ─────────────────────────────────────────────────────────────

const APPROVAL_TTL_MS = 24 * 60 * 60 * 1000   // 24 Stunden

function getOpTypesPath(): string {
  return path.resolve(process.cwd(), 'system/agent-registry/approval_operation_types.json')
}

function loadOpTypes(): Record<string, any> {
  const p = getOpTypesPath()
  if (!fs.existsSync(p)) return {}
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) }
  catch { return {} }
}

function tokenExpiryFor(item: ApprovalQueueItem, opType: any): string {
  if (typeof opType?.expires_minutes === 'number')
    return new Date(Date.now() + opType.expires_minutes * 60_000).toISOString()
  return item.expires_at
}

function normalizeQueuePath(input: string): string | null {
  const forward = input.replace(/\\/g, '/')
  if (/^[A-Za-z]:\//.test(forward) || forward.startsWith('/')) return null
  const normalized = path.posix.normalize(forward)
  if (normalized === '..' || normalized.startsWith('../')) return null
  return normalized
}

function inferApprovalOperation(item: ApprovalQueueItem): string | null {
  if (item.operation) return item.operation
  const affected = item.affected_files.map(normalizeQueuePath)
  const allDocs = affected.length > 0 && affected.every(p => p !== null && (p === 'docs' || p.startsWith('docs/')))
  const looksLikeWrite = item.tool === 'write' || /^\s*write\b/i.test(item.proposed_action)
  if (item.risk_category === 'docs' && looksLikeWrite && allDocs) return 'write_docs'
  return null
}

function runtimeItemFromQueue(item: ApprovalQueueItem): state.ApprovalItem {
  return {
    approval_id:     item.approval_id,
    workorder_id:    item.workorder_id,
    run_id:          item.run_id,
    status:          item.status,
    reason:          item.reason,
    risk_category:   item.risk_category,
    affected_files:  item.affected_files,
    proposed_action: item.proposed_action,
    requested_by:    item.agent_id,
    requested_at:    item.requested_at,
    expires_at:      item.expires_at,
    decided_at:      item.decided_at,
    decided_by:      item.decided_by,
    deny_reason:     item.deny_reason,
    operation:       item.operation,
    tool:            item.tool,
    exact_command:   item.exact_command,
  }
}

function getQueuePath(): string {
  return path.resolve(process.cwd(), 'system/approval/queue.json')
}

export function readQueue(): Record<string, ApprovalQueueItem> {
  const p = getQueuePath()
  if (!fs.existsSync(p)) return {}
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) }
  catch { return {} }
}

function writeQueue(queue: Record<string, ApprovalQueueItem>): void {
  const p   = getQueuePath()
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const tmp = p + '.tmp'
  const fd  = fs.openSync(tmp, 'w')
  fs.writeSync(fd, JSON.stringify(queue, null, 2))
  fs.fsyncSync(fd)
  fs.closeSync(fd)
  fs.renameSync(tmp, p)
}

export function generateApprovalId(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `APP-${stamp}-${String(Date.now()).slice(-6)}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Legt ein neues Approval-Item mit Status 'pending' in die Queue. */
export function enqueueApproval(
  params: Omit<ApprovalQueueItem, 'approval_id' | 'status' | 'requested_at' | 'expires_at'> & { approval_id?: string }
): ApprovalQueueItem {
  const queue      = readQueue()
  const approvalId = params.approval_id ?? generateApprovalId()
  const now        = new Date()
  const item: ApprovalQueueItem = {
    ...params,
    approval_id:  approvalId,
    status:       'pending',
    requested_at: now.toISOString(),
    expires_at:   new Date(now.getTime() + APPROVAL_TTL_MS).toISOString(),
  }
  queue[approvalId] = item
  writeQueue(queue)
  return item
}

/** Alle pending Items (nicht abgelaufen). */
export function getPendingApprovals(): ApprovalQueueItem[] {
  const now = Date.now()
  return Object.values(readQueue()).filter(
    i => i.status === 'pending' && new Date(i.expires_at).getTime() > now
  )
}

/** Alle Items (alle Statuswerte). */
export function getAllApprovals(): ApprovalQueueItem[] {
  return Object.values(readQueue())
}

/** Item nach ID. */
export function getApproval(approvalId: string): ApprovalQueueItem | null {
  return readQueue()[approvalId] ?? null
}

/** pending → granted */
export function grantApproval(
  approvalId: string, decidedBy = 'human'
): { ok: true; item: ApprovalQueueItem } | { ok: false; reason: string } {
  const queue = readQueue()
  const item  = queue[approvalId]
  if (!item) return { ok: false, reason: `Nicht gefunden: ${approvalId}` }
  if (new Date(item.expires_at).getTime() <= Date.now()) {
    item.status = 'expired'; writeQueue(queue)
    return { ok: false, reason: `Approval abgelaufen: ${approvalId}` }
  }
  const v = validateApprovalTransition(item.status, 'granted')
  if (!v.valid) return { ok: false, reason: v.reason! }
  item.status = 'granted'; item.decided_at = new Date().toISOString(); item.decided_by = decidedBy
  writeQueue(queue)
  return { ok: true, item }
}

export async function grantApprovalForDispatch(
  approvalId: string, decidedBy = 'human'
): Promise<{ ok: true; item: ApprovalQueueItem } | { ok: false; reason: string }> {
  const queue = readQueue()
  const item  = queue[approvalId]
  if (!item) return { ok: false, reason: `Nicht gefunden: ${approvalId}` }
  if (new Date(item.expires_at).getTime() <= Date.now()) {
    item.status = 'expired'; writeQueue(queue)
    await state.upsertApprovalItem(runtimeItemFromQueue(item))
    return { ok: false, reason: `Approval abgelaufen: ${approvalId}` }
  }
  const operation = inferApprovalOperation(item)
  if (!operation) return { ok: false, reason: `Operation fehlt: ${approvalId}` }
  item.operation = operation

  const opTypes = loadOpTypes()
  const opType = opTypes[item.operation]
  if (!opType) return { ok: false, reason: `Unbekannte Operation: ${item.operation}` }
  if (opType.exact_command_required && !item.exact_command)
    return { ok: false, reason: `exact_command fehlt: ${approvalId}` }

  const v = validateApprovalTransition(item.status, 'granted')
  if (!v.valid) return { ok: false, reason: v.reason! }

  item.status = 'granted'
  item.decided_at = new Date().toISOString()
  item.decided_by = decidedBy
  writeQueue(queue)

  const maxUses = typeof opType.max_uses === 'number' ? opType.max_uses : 1
  await state.writeApprovalToken(approvalId, {
    approval_id:          approvalId,
    run_id:               item.run_id,
    workorder_id:         item.workorder_id,
    agent_id:             item.agent_id,
    operation:            item.operation,
    scope:                item.affected_files,
    exact_command:        item.exact_command,
    approved_by:          decidedBy,
    approved_at:          item.decided_at,
    expires_at:           tokenExpiryFor(item, opType),
    single_use:           maxUses === 1,
    use_count:            0,
    max_uses:             maxUses,
    requires_post_review: Boolean(opType.requires_post_review),
    status:               'granted',
    correlation_id:       item.workorder_id,
    approval_source:      'queue',
    approved_tool:        item.tool,
  })
  await state.upsertApprovalItem(runtimeItemFromQueue(item))
  audit.writeAuditEvent({
    event: 'approval_queue_granted',
    orchestration_mode: 'claude_code',
    approval_id: approvalId,
    workorder_id: item.workorder_id,
    agent_id: item.agent_id,
    approved_by: decidedBy,
    reason: 'queue grant created dispatcher token',
  })
  return { ok: true, item }
}

/** pending → denied */
export function denyApproval(
  approvalId: string, decidedBy = 'human', denyReason?: string
): { ok: true; item: ApprovalQueueItem } | { ok: false; reason: string } {
  const queue = readQueue()
  const item  = queue[approvalId]
  if (!item) return { ok: false, reason: `Nicht gefunden: ${approvalId}` }
  const v = validateApprovalTransition(item.status, 'denied')
  if (!v.valid) return { ok: false, reason: v.reason! }
  item.status = 'denied'; item.decided_at = new Date().toISOString()
  item.decided_by = decidedBy; item.deny_reason = denyReason
  writeQueue(queue)
  const runtimeSync = state.syncDeniedApprovalItem(approvalId, decidedBy, denyReason)
  if (!runtimeSync.ok) return { ok: false, reason: runtimeSync.reason }
  return { ok: true, item }
}

/** granted → consumed (nach Token-Nutzung). */
export function consumeQueueItem(approvalId: string): void {
  const queue = readQueue()
  const item  = queue[approvalId]
  if (!item) return
  const v = validateApprovalTransition(item.status, 'consumed')
  if (v.valid) { item.status = 'consumed'; writeQueue(queue) }
}

/** Setzt abgelaufene pending Items auf expired. Gibt Anzahl zurück. */
export function expireStaleApprovals(): number {
  const queue = readQueue()
  const now   = Date.now()
  let count   = 0
  for (const item of Object.values(queue)) {
    if (item.status === 'pending' && new Date(item.expires_at).getTime() <= now) {
      item.status = 'expired'; count++
    }
  }
  if (count > 0) writeQueue(queue)
  return count
}
