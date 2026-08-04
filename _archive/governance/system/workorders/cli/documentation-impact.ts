import fs from 'node:fs'
import path from 'node:path'

import { runSsotSyncCheck } from '../../control-plane/ssot-sync-check'

export const DOCUMENTATION_DOMAINS = new Set([
  'runtime',
  'model_routing',
  'workflow',
  'governance',
  'product_gate',
  'infra_runtime',
  'todo_state',
  'product',
  'none',
  'historical_workorder',
])

const DOC_AGENT_DOMAINS = new Set([
  'runtime',
  'model_routing',
  'workflow',
  'governance',
  'product_gate',
  'infra_runtime',
  'todo_state',
])

const GENERIC_NA_RE = /^(n\/a|na|none|not applicable|no docs?|no impact)$/i

export interface DocumentationImpact {
  required: boolean
  domains: string[]
  ssot_files: string[]
  documentation_agent_required: boolean
  na_reason: string | null
}

export interface DocumentationImpactValidation {
  valid: boolean
  errors: string[]
  impact?: DocumentationImpact
}

export interface DocumentationAuditEvent {
  ts?: string
  event: 'documentation_started' | 'documentation_completed' | 'documentation_skipped_with_na' | 'documentation_blocked'
  workorder_id?: string
  wo_id?: string
  run_id?: string
  domains?: string[]
  ssot_files?: string[]
  status?: string
  reason?: string
}

export interface DocumentationHandlingStatus {
  workorderId: string
  required: boolean
  domains: string[]
  ssotFiles: string[]
  documentationAgentRequired: boolean
  documentationAgentUsed: boolean
  naReason?: string
  status: 'pass' | 'blocked' | 'skipped_na' | 'invalid'
  ssotSyncStatus: 'pass' | 'fail' | 'not_run'
  detail: string
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : []
}

function isSpecificNaReason(reason: string | null | undefined): boolean {
  const value = String(reason ?? '').trim()
  return value.length >= 24 && !GENERIC_NA_RE.test(value)
}

export function normalizeDocumentationImpact(value: unknown): DocumentationImpact | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  return {
    required: record.required === true,
    domains: asStringArray(record.domains),
    ssot_files: asStringArray(record.ssot_files),
    documentation_agent_required: record.documentation_agent_required === true,
    na_reason: typeof record.na_reason === 'string' ? record.na_reason : null,
  }
}

export function validateDocumentationImpact(wo: Record<string, unknown>): DocumentationImpactValidation {
  const impact = normalizeDocumentationImpact(wo.documentation_impact)
  const errors: string[] = []
  if (!impact) {
    return {
      valid: false,
      errors: ['documentation_impact.missing: every governed workorder must declare documentation impact'],
    }
  }

  const domainSet = new Set(impact.domains)
  if (impact.domains.length === 0) {
    errors.push('documentation_impact.invalid: domains must include at least one declared domain')
  }
  for (const domain of impact.domains) {
    if (!DOCUMENTATION_DOMAINS.has(domain)) {
      errors.push(`documentation_impact.invalid: unknown domain ${domain}`)
    }
  }

  if (domainSet.has('none')) {
    if (impact.required) errors.push('documentation_impact.invalid: domain none requires required=false')
    if (impact.documentation_agent_required) errors.push('documentation_impact.invalid: domain none cannot require documentation_agent')
    if (impact.domains.length !== 1) errors.push('documentation_impact.invalid: domain none cannot be mixed with other domains')
    if (!isSpecificNaReason(impact.na_reason)) errors.push('documentation_impact.invalid: domain none requires a specific auditable na_reason')
  }

  if (domainSet.has('historical_workorder')) {
    const expected = /pre-existing archived workorder before documentation-impact gate/i
    if (impact.required) errors.push('documentation_impact.invalid: historical_workorder requires required=false')
    if (!expected.test(impact.na_reason ?? '')) {
      errors.push('documentation_impact.invalid: historical_workorder requires the pre-existing archived workorder N/A reason')
    }
  }

  const docAgentDomain = impact.domains.find(domain => DOC_AGENT_DOMAINS.has(domain))
  if (docAgentDomain && impact.required && !impact.documentation_agent_required) {
    errors.push(`documentation_agent.required_not_configured: ${docAgentDomain} documentation impact requires documentation_agent_required=true`)
  }
  if (docAgentDomain && !impact.required && !isSpecificNaReason(impact.na_reason)) {
    errors.push(`documentation_impact.invalid: ${docAgentDomain} N/A exemption requires a specific auditable na_reason`)
  }
  if (impact.required && impact.ssot_files.length === 0) {
    errors.push('documentation_impact.invalid: required documentation impact must declare ssot_files')
  }
  if (impact.required && impact.domains.includes('none')) {
    errors.push('documentation_impact.invalid: required documentation impact cannot use domain none')
  }

  return { valid: errors.length === 0, errors, impact }
}

function readJsonl(repoRoot: string, relativePath: string): DocumentationAuditEvent[] {
  const filePath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(filePath)) return []
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line) as DocumentationAuditEvent } catch { return null }
    })
    .filter((item): item is DocumentationAuditEvent => !!item)
}

export function documentationAuditEvents(repoRoot: string, workorderId: string): DocumentationAuditEvent[] {
  return readJsonl(repoRoot, 'system/state/pipeline-audit.jsonl')
    .filter(item => (item.workorder_id ?? item.wo_id) === workorderId)
    .filter(item => /^documentation_/.test(String(item.event)))
}

function pathExists(repoRoot: string, relativePath: string): boolean {
  return fs.existsSync(path.join(repoRoot, relativePath))
}

export function evaluateDocumentationHandling(
  wo: Record<string, unknown>,
  repoRoot = process.cwd(),
): DocumentationHandlingStatus {
  const workorderId = typeof wo.workorder_id === 'string' ? wo.workorder_id : '(unknown)'
  const validation = validateDocumentationImpact(wo)
  if (!validation.valid || !validation.impact) {
    return {
      workorderId,
      required: false,
      domains: [],
      ssotFiles: [],
      documentationAgentRequired: false,
      documentationAgentUsed: false,
      status: 'invalid',
      ssotSyncStatus: 'not_run',
      detail: validation.errors.join('; '),
    }
  }

  const impact = validation.impact
  const events = documentationAuditEvents(repoRoot, workorderId)
  const completed = events.find(item => item.event === 'documentation_completed')
  const skipped = events.find(item => item.event === 'documentation_skipped_with_na')
  const blocked = events.find(item => item.event === 'documentation_blocked')

  if (!impact.required) {
    return {
      workorderId,
      required: false,
      domains: impact.domains,
      ssotFiles: impact.ssot_files,
      documentationAgentRequired: impact.documentation_agent_required,
      documentationAgentUsed: false,
      naReason: impact.na_reason ?? undefined,
      status: skipped || impact.domains.includes('none') || impact.domains.includes('historical_workorder') ? 'skipped_na' : 'pass',
      ssotSyncStatus: 'not_run',
      detail: impact.na_reason ?? 'Documentation impact marked not applicable.',
    }
  }

  if (blocked) {
    return {
      workorderId,
      required: true,
      domains: impact.domains,
      ssotFiles: impact.ssot_files,
      documentationAgentRequired: impact.documentation_agent_required,
      documentationAgentUsed: false,
      status: 'blocked',
      ssotSyncStatus: 'fail',
      detail: blocked.reason ?? 'Documentation phase blocked.',
    }
  }
  if (!completed) {
    return {
      workorderId,
      required: true,
      domains: impact.domains,
      ssotFiles: impact.ssot_files,
      documentationAgentRequired: impact.documentation_agent_required,
      documentationAgentUsed: false,
      status: 'blocked',
      ssotSyncStatus: 'not_run',
      detail: 'documentation_agent required but documentation_completed audit event is missing',
    }
  }

  const missingSsot = impact.ssot_files.filter(file => !pathExists(repoRoot, file))
  if (missingSsot.length > 0) {
    return {
      workorderId,
      required: true,
      domains: impact.domains,
      ssotFiles: impact.ssot_files,
      documentationAgentRequired: impact.documentation_agent_required,
      documentationAgentUsed: true,
      status: 'blocked',
      ssotSyncStatus: 'fail',
      detail: `Declared SSOT file(s) missing: ${missingSsot.join(', ')}`,
    }
  }

  const ssot = runSsotSyncCheck({ repoRoot })
  if (ssot.hasHighOrCriticalFindings) {
    return {
      workorderId,
      required: true,
      domains: impact.domains,
      ssotFiles: impact.ssot_files,
      documentationAgentRequired: impact.documentation_agent_required,
      documentationAgentUsed: true,
      status: 'blocked',
      ssotSyncStatus: 'fail',
      detail: `SSOT_SYNC_CHECK blocked documentation completion: critical=${ssot.summary.critical}, high=${ssot.summary.high}`,
    }
  }

  return {
    workorderId,
    required: true,
    domains: impact.domains,
    ssotFiles: impact.ssot_files,
    documentationAgentRequired: impact.documentation_agent_required,
    documentationAgentUsed: true,
    status: 'pass',
    ssotSyncStatus: 'pass',
    detail: 'documentation_completed audit event exists and SSOT_SYNC_CHECK is clean',
  }
}

export function writeDocumentationAuditEvent(
  event: DocumentationAuditEvent,
  repoRoot = process.cwd(),
): void {
  const filePath = path.join(repoRoot, 'system/state/pipeline-audit.jsonl')
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.appendFileSync(filePath, JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n', 'utf8')
}
