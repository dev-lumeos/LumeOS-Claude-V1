/**
 * LUMEOS Audit Writer V1.1
 * Schreibt alle Events in system/state/audit.jsonl (append-only).
 * Ungültige Events → system/state/audit.error.jsonl
 */

import fs   from 'node:fs'
import path from 'node:path'

export type EventType =
  | 'tool_call_requested' | 'tool_call_allowed' | 'tool_call_blocked'
  | 'tool_call_executed'  | 'tool_call_failed'
  | 'job_started' | 'job_completed' | 'job_failed' | 'job_blocked'
  | 'approval_required' | 'approval_granted' | 'approval_denied' | 'approval_expired'
  | 'mode_switch_started' | 'mode_switch_completed' | 'mode_switch_failed'
  | 'lock_acquired' | 'lock_released'
  | 'orchestrator_started' | 'orchestrator_switched'
  | 'review_pipeline_started' | 'review_pipeline_done'
  | 'review_pipeline_rewrite' | 'review_pipeline_human_needed'
  | 'review_pipeline_retry'
  | 'governance_parse_error'  | 'governance_violation'
  | 'files_scope_violation'

export type Severity         = 'info' | 'warning' | 'error' | 'critical'
export type OrchestratorMode = 'claude_code' | 'nemotron'

export interface AuditEvent {
  event:               EventType
  orchestration_mode:  OrchestratorMode
  severity?:           Severity
  run_id?:             string
  workorder_id?:       string
  agent_id?:           string
  correlation_id?:     string
  tool?:               'read' | 'write' | 'bash' | 'mcp'
  target_path?:        string
  command?:            string
  mcp_tool?:           string
  allowed?:            boolean
  blocked_by?:         string
  reason?:             string
  approval_id?:        string
  approved_by?:        string
  from_mode?:          string
  to_mode?:            string
  spark_node?:         string
  duration_ms?:        number
  error_code?:         string
  retry_attempt?:      number
  // Review pipeline (RULES.md): high-level summary, detail in pipeline-audit.jsonl
  review_tier?:        'spark-c' | 'spark-d' | 'claude'
  review_reason?:      string
}

// Lazy path resolution: resolved at call time so tests / harnesses that
// process.chdir() into a temp dir before invoking writeAuditEvent() write
// to the test fixture instead of the real repo. Eager (module-init time)
// resolution baked in the original repo cwd, defeating any later chdir.
function getLogPath(): string { return path.resolve(process.cwd(), 'system/state/audit.jsonl') }
function getErrPath(): string { return path.resolve(process.cwd(), 'system/state/audit.error.jsonl') }

const VALID_EVENTS = new Set<string>([
  'tool_call_requested', 'tool_call_allowed', 'tool_call_blocked',
  'tool_call_executed', 'tool_call_failed',
  'job_started', 'job_completed', 'job_failed', 'job_blocked',
  'approval_required', 'approval_granted', 'approval_denied', 'approval_expired',
  'mode_switch_started', 'mode_switch_completed', 'mode_switch_failed',
  'lock_acquired', 'lock_released', 'orchestrator_started', 'orchestrator_switched',
  'review_pipeline_started', 'review_pipeline_done',
  'review_pipeline_rewrite', 'review_pipeline_human_needed',
  'review_pipeline_retry',
  'governance_parse_error',  'governance_violation',
  'files_scope_violation',
])

const VALID_MODES = new Set(['claude_code', 'nemotron'])

function defaultSeverity(event: EventType): Severity {
  if (event === 'tool_call_blocked')   return 'error'
  if (event === 'approval_denied')     return 'error'
  if (event === 'mode_switch_failed')  return 'critical'
  if (event === 'job_failed')          return 'error'
  if (event.includes('failed'))        return 'warning'
  if (event.includes('blocked'))       return 'warning'
  return 'info'
}

function appendLine(filePath: string, line: string): void {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.appendFileSync(filePath, line + '\n', 'utf8')
}

export function writeAuditEvent(input: AuditEvent): void {
  const ts = new Date().toISOString()

  if (!input.event || !VALID_EVENTS.has(input.event) || !input.orchestration_mode || !VALID_MODES.has(input.orchestration_mode)) {
    appendLine(getErrPath(), JSON.stringify({ ts, audit_error: 'invalid_event', original: input }))
    return
  }

  appendLine(getLogPath(), JSON.stringify({ ts, severity: input.severity ?? defaultSeverity(input.event), ...input }))
}

// ─── Convenience Helpers ──────────────────────────────────────────────────────

type Base = Pick<AuditEvent, 'run_id' | 'workorder_id' | 'agent_id' | 'orchestration_mode'>

export const auditJobStarted    = (p: Base) => writeAuditEvent({ event: 'job_started', ...p })
export const auditJobCompleted  = (p: Base & Pick<AuditEvent, 'duration_ms'>) => writeAuditEvent({ event: 'job_completed', ...p })
export const auditJobFailed     = (p: Base & Pick<AuditEvent, 'reason' | 'error_code'>) => writeAuditEvent({ event: 'job_failed', severity: 'error', ...p })

type ToolBase = Base & Pick<AuditEvent, 'tool' | 'target_path' | 'command'>
export const auditToolAllowed   = (p: ToolBase) => writeAuditEvent({ event: 'tool_call_allowed', allowed: true, ...p })
export const auditToolBlocked   = (p: ToolBase & Pick<AuditEvent, 'blocked_by' | 'reason'>) => writeAuditEvent({ event: 'tool_call_blocked', allowed: false, severity: 'error', ...p })
export const auditToolExecuted  = (p: ToolBase & Pick<AuditEvent, 'duration_ms'>) => writeAuditEvent({ event: 'tool_call_executed', allowed: true, ...p })
export const auditToolFailed    = (p: ToolBase & Pick<AuditEvent, 'reason' | 'error_code'>) => writeAuditEvent({ event: 'tool_call_failed', allowed: false, severity: 'error', ...p })
export const auditApprovalRequired = (p: Base & Pick<AuditEvent, 'approval_id' | 'tool' | 'target_path'>) => writeAuditEvent({ event: 'approval_required', severity: 'warning', ...p })

// ─── Review Pipeline Helpers ──────────────────────────────────────────────────
// High-level Marker im audit.jsonl — Detail-Audit liegt in pipeline-audit.jsonl

type ReviewBase = Base & Pick<AuditEvent, 'review_tier' | 'review_reason'>

export const auditReviewPipelineStarted     = (p: ReviewBase) =>
  writeAuditEvent({ event: 'review_pipeline_started', ...p })

export const auditReviewPipelineDone        = (p: ReviewBase & Pick<AuditEvent, 'duration_ms'>) =>
  writeAuditEvent({ event: 'review_pipeline_done', ...p })

export const auditReviewPipelineRewrite     = (p: ReviewBase) =>
  writeAuditEvent({ event: 'review_pipeline_rewrite', severity: 'warning', ...p })

export const auditReviewPipelineHumanNeeded = (p: ReviewBase) =>
  writeAuditEvent({ event: 'review_pipeline_human_needed', severity: 'warning', ...p })

export const auditReviewPipelineRetry = (p: ReviewBase & Pick<AuditEvent, 'retry_attempt'>) =>
  writeAuditEvent({ event: 'review_pipeline_retry', severity: 'warning', ...p })

// ─── Files Scope Helpers ──────────────────────────────────────────────────────

type ScopeBase = Pick<AuditEvent, 'run_id' | 'workorder_id' | 'agent_id' | 'orchestration_mode' | 'target_path' | 'reason'>

export const auditFilesScopeViolation = (p: ScopeBase) =>
  writeAuditEvent({ event: 'files_scope_violation', severity: 'critical', blocked_by: 'files_scope_check', ...p })
