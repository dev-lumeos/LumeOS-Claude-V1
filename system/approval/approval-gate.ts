/**
 * LUMEOS Approval Gate V1.2.3
 * checkApproval() nur prüfen — consumeApproval() erst nach Tool-Erfolg.
 * Approval Token Store läuft über state-manager (gemeinsamer Lock).
 */

import path      from 'node:path'
import micromatch from 'micromatch'
import * as state from '../state/state-manager'

export interface ApprovalToken {
  approval_id:          string
  run_id:               string
  workorder_id:         string
  agent_id:             string
  operation:            string
  scope?:               string[]
  exact_command?:       string
  approved_by:          string
  approved_at:          string
  expires_at:           string
  single_use:           boolean
  use_count:            number
  max_uses:             number
  requires_post_review: boolean
  status:               'pending' | 'granted' | 'denied' | 'expired' | 'consumed'
  correlation_id?:      string
}

export interface GateResult {
  allowed:    boolean
  reason?:    string
  blockedBy?: string
}

interface CheckParams {
  approvalId:   string
  runId:        string
  workorderId:  string
  agentId:      string
  tool:         string
  targetPath?:  string
  command?:     string
}

const OP_TYPES_PATH = path.resolve(process.cwd(), 'system/agent-registry/approval_operation_types.json')

function normalizeRepoPath(input: string): string {
  const forward = input.replace(/\\/g, '/')
  if (/^[A-Za-z]:\//.test(forward)) throw new Error(`Windows absolute path blocked: ${input}`)
  if (forward.startsWith('/'))       throw new Error(`Absolute path blocked: ${input}`)
  const normalized = path.posix.normalize(forward)
  if (normalized.startsWith('../') || normalized === '..') throw new Error(`Path traversal blocked: ${input}`)
  return normalized
}

function pathMatchesPatterns(targetPath: string, patterns: string[], emptyMeansAllow: boolean): boolean {
  if (!patterns.length) return emptyMeansAllow
  const target = normalizeRepoPath(targetPath)
  return patterns.some(p => p === target || micromatch.isMatch(target, p))
}

function loadOpTypes(): Record<string, any> {
  const fs = require('node:fs')
  if (!fs.existsSync(OP_TYPES_PATH)) return {}
  try { return JSON.parse(fs.readFileSync(OP_TYPES_PATH, 'utf8')) }
  catch { return {} }
}

// ─── checkApproval — NUR PRÜFEN, nicht konsumieren ───────────────────────────

export function checkApproval(params: CheckParams): GateResult {
  const tokens = state.readApprovalTokens()
  const token  = tokens[params.approvalId] as ApprovalToken | undefined

  if (!token)        return { allowed: false, reason: `Token nicht gefunden: ${params.approvalId}`, blockedBy: 'approval_gate.not_found' }
  if (token.status !== 'granted') return { allowed: false, reason: `Token Status: ${token.status}`, blockedBy: 'approval_gate.status' }
  if (new Date() > new Date(token.expires_at)) return { allowed: false, reason: 'Token abgelaufen', blockedBy: 'approval_gate.expired' }
  if (token.single_use && token.use_count >= token.max_uses) return { allowed: false, reason: 'Token verbraucht', blockedBy: 'approval_gate.consumed' }
  if (token.run_id !== params.runId)             return { allowed: false, reason: 'run_id mismatch', blockedBy: 'approval_gate.run_mismatch' }
  if (token.workorder_id !== params.workorderId) return { allowed: false, reason: 'workorder_id mismatch', blockedBy: 'approval_gate.wo_mismatch' }
  if (token.agent_id !== params.agentId)         return { allowed: false, reason: 'agent_id mismatch', blockedBy: 'approval_gate.agent_mismatch' }

  const opTypes = loadOpTypes()
  const opType  = opTypes[token.operation]
  if (!opType)       return { allowed: false, reason: `Unbekannte Operation: ${token.operation}`, blockedBy: 'approval_gate.unknown_op' }
  if (opType.manual_only) return { allowed: false, reason: 'Nur manuell erlaubt', blockedBy: 'approval_gate.manual_only' }
  if (opType.allowed_tools?.length && !opType.allowed_tools.includes(params.tool))
    return { allowed: false, reason: `Tool ${params.tool} nicht erlaubt`, blockedBy: 'approval_gate.tool_mismatch' }

  // exact_command_required: Token MUSS Command enthalten
  if (opType.exact_command_required && !token.exact_command)
    return { allowed: false, reason: 'exact_command fehlt im Token', blockedBy: 'approval_gate.exact_command_missing' }
  if (opType.exact_command_required && token.exact_command && params.command?.trim() !== token.exact_command.trim())
    return { allowed: false, reason: `Command mismatch: "${params.command}" ≠ "${token.exact_command}"`, blockedBy: 'approval_gate.command_mismatch' }

  // Pfad gegen token.scope UND opType.allowed_paths
  if (params.targetPath) {
    try {
      const isWriteOp = params.tool === 'write'
      if (!pathMatchesPatterns(params.targetPath, token.scope ?? [], !isWriteOp))
        return { allowed: false, reason: token.scope?.length ? `Pfad nicht in Token-Scope: ${params.targetPath}` : 'Kein Scope für Write-Op', blockedBy: 'approval_gate.scope_mismatch' }

      if (opType.allowed_paths?.length && !pathMatchesPatterns(params.targetPath, opType.allowed_paths, false))
        return { allowed: false, reason: `Pfad nicht in Op-Allowed-Paths: ${params.targetPath}`, blockedBy: 'approval_gate.op_path_mismatch' }
    } catch (e: any) {
      return { allowed: false, reason: e.message, blockedBy: 'approval_gate.path_security' }
    }
  }

  return { allowed: true }
}

// ─── consumeApproval — erst nach erfolgreicher Tool-Ausführung ────────────────

export async function consumeApproval(approvalId: string): Promise<void> {
  const tokens = state.readApprovalTokens()
  const token  = tokens[approvalId] as ApprovalToken | undefined
  if (!token) return

  token.use_count += 1
  token.status     = token.use_count >= token.max_uses ? 'consumed' : 'granted'
  await state.writeApprovalToken(approvalId, token)
  await state.updateApprovalStatus(approvalId, token.status)
}

// ─── Token erstellen ─────────────────────────────────────────────────────────

export async function createApprovalToken(token: Omit<ApprovalToken, 'use_count' | 'status'>): Promise<ApprovalToken> {
  const full: ApprovalToken = { ...token, use_count: 0, status: 'granted' }
  await state.writeApprovalToken(token.approval_id, full)
  await state.addApprovalRef({ approval_id: token.approval_id, workorder_id: token.workorder_id, run_id: token.run_id, status: 'granted' })
  return full
}

/** @deprecated Dispatcher nutzt approval_operation_types.json direkt */
export function operationMayRequireApproval(agentId: string, tool: string, targetPath?: string): boolean {
  if (agentId === 'db-migration-agent') return true
  if (tool === 'write' && targetPath) {
    const norm = targetPath.replace(/\\/g, '/')
    if (norm.startsWith('supabase/migrations/') || norm.startsWith('db/migrations/')) return true
  }
  return false
}
