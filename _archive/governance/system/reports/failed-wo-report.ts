/**
 * LUMEOS Failed WO Report — B.3
 * system/reports/failed-wo-report.ts
 *
 * Aggregiert alle failed / blocked / awaiting_approval Runs und
 * erzeugt einen fokussierten Diagnose-Report.
 *
 * Output:
 *   system/reports/failed-wo-report.json
 *   system/reports/failed-wo-report.md
 *
 * CLI:
 *   npx tsx system/reports/failed-wo-report.ts
 *   npx tsx system/reports/failed-wo-report.ts --since 2026-04-29
 */

import fs   from 'node:fs'
import path from 'node:path'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FailureKind =
  | 'FAILED'              // Run mit status failed
  | 'BLOCKED_SCOPE'       // FILES_SCOPE_VIOLATION oder SCOPE_CONFLICT
  | 'BLOCKED_APPROVAL'    // HUMAN_NEEDED / awaiting_approval
  | 'BLOCKED_SYSTEM_STOP' // SYSTEM_STOP
  | 'BLOCKED_PREFLIGHT'   // PREFLIGHT_REJECT / PREFLIGHT_HOLD
  | 'BLOCKED_OTHER'

export interface FailedRunEntry {
  run_id:          string
  workorder_id:    string
  agent_id:        string
  status:          string
  failure_kind:    FailureKind
  error_summary:   string
  started_at:      string
  completed_at:    string
  scope_files:     string[]
  changed_files:   string[]
  errors:          string[]
  /** Falls BLOCKED_APPROVAL: Approval-Queue-ID wenn vorhanden */
  approval_id?:    string
  /** Empfohlene Maßnahme für Tom */
  action_required: string
}

export interface FailedWoReport {
  generated_at:   string
  since?:         string
  total_runs:     number
  failed_count:   number
  blocked_count:  number
  approval_count: number
  entries:        FailedRunEntry[]
}

// ─── Reader-Utilities ─────────────────────────────────────────────────────────

function readJsonl<T = any>(filepath: string): T[] {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return []
  return fs.readFileSync(abs, 'utf8')
    .split('\n').filter(Boolean)
    .map(line => { try { return JSON.parse(line) } catch { return null } })
    .filter(Boolean) as T[]
}

function readJson<T = any>(filepath: string): T | null {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return null
  try { return JSON.parse(fs.readFileSync(abs, 'utf8')) }
  catch { return null }
}

// ─── Failure-Kind Klassifikation ──────────────────────────────────────────────

function classifyFailure(run: any, runAuditEvents: any[]): FailureKind {
  // Scope-Verletzungen
  if (runAuditEvents.some(e => e.event === 'files_scope_violation')) return 'BLOCKED_SCOPE'
  if (runAuditEvents.some(e => e.event === 'scope_lock_conflict'))   return 'BLOCKED_SCOPE'

  // Approval / Human needed
  if (run.status === 'awaiting_approval') return 'BLOCKED_APPROVAL'
  if (runAuditEvents.some(e => e.event === 'review_pipeline_human_needed')) return 'BLOCKED_APPROVAL'

  // System Stop
  if (runAuditEvents.some(e => e.event === 'preflight_hold' && e.reason?.includes('SYSTEM_STOP')))
    return 'BLOCKED_SYSTEM_STOP'

  // Preflight REJECT / HOLD
  if (runAuditEvents.some(e => e.event === 'preflight_reject')) return 'BLOCKED_PREFLIGHT'
  if (runAuditEvents.some(e => e.event === 'preflight_hold'))   return 'BLOCKED_PREFLIGHT'

  if (run.status === 'blocked') return 'BLOCKED_OTHER'
  return 'FAILED'
}

function extractErrors(runAuditEvents: any[]): string[] {
  const errors: string[] = []
  for (const e of runAuditEvents) {
    if (e.event === 'tool_call_blocked' && e.reason)        errors.push(`BLOCKED: ${e.reason}`)
    if (e.event === 'governance_violation' && e.reason)     errors.push(`GOVERNANCE: ${e.reason}`)
    if (e.event === 'governance_parse_error' && e.reason)   errors.push(`PARSE_ERROR: ${e.reason}`)
    if (e.event === 'files_scope_violation' && e.reason)    errors.push(`SCOPE_VIOLATION: ${e.reason}`)
    if (e.event === 'scope_lock_conflict' && e.reason)      errors.push(`SCOPE_CONFLICT: ${e.reason}`)
    if (e.event === 'preflight_reject' && e.reason)         errors.push(`PREFLIGHT_REJECT: ${e.reason}`)
    if (e.event === 'preflight_hold' && e.reason)           errors.push(`PREFLIGHT_HOLD: ${e.reason}`)
    if (e.event === 'review_pipeline_human_needed' && e.review_reason)
      errors.push(`HUMAN_NEEDED: ${e.review_reason}`)
    if (e.event === 'job_failed' && e.reason && !errors.length)
      errors.push(`JOB_FAILED: ${e.reason}`)
  }
  return errors
}

function buildErrorSummary(errors: string[], kind: FailureKind, run: any): string {
  if (errors.length > 0) return errors[0]
  if (kind === 'BLOCKED_APPROVAL') return `Wartet auf Human Approval (Run ${run.run_id})`
  if (kind === 'FAILED') return `Run ${run.run_id} failed (kein Audit-Event gefunden)`
  return `${run.status} — kein Detail-Event gefunden`
}

function buildActionRequired(kind: FailureKind, entry: Partial<FailedRunEntry>): string {
  switch (kind) {
    case 'BLOCKED_APPROVAL':
      return entry.approval_id
        ? `npx tsx system/approval/approval-cli.ts show ${entry.approval_id} — dann grant oder deny`
        : `npx tsx system/approval/approval-cli.ts list — Approval prüfen und entscheiden`
    case 'BLOCKED_SCOPE':
      return `Scope-Konflikt analysieren — ggf. anderen Run beenden oder scope_files anpassen`
    case 'BLOCKED_SYSTEM_STOP':
      return `System Stop aufheben: triggerSystemStop / clearSystemStop — dann Re-Dispatch`
    case 'BLOCKED_PREFLIGHT':
      return `WO reparieren: Schema prüfen, Agent korrekt, scope_files nicht leer, rollback_hint bei db-migration`
    case 'FAILED':
      return `Fehler analysieren, WO anpassen, Re-Dispatch — Audit: system/state/audit.jsonl`
    default:
      return `Status '${entry.status}' — manuell prüfen`
  }
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export function generateFailedReport(since?: string): FailedWoReport {
  const state      = readJson<any>('system/state/runtime_state.json')
  const allAudit   = readJsonl<any>('system/state/audit.jsonl')
  const queueRaw   = readJson<any>('system/approval/queue.json') ?? {}

  const allRuns: any[] = state?.active_runs ?? []
  const failedStatuses = new Set(['failed', 'blocked', 'awaiting_approval'])

  const sinceMs = since ? new Date(since).getTime() : 0

  const failedRuns = allRuns.filter(run => {
    if (!failedStatuses.has(run.status)) return false
    if (sinceMs && new Date(run.started_at).getTime() < sinceMs) return false
    return true
  })

  // Approval-Queue: Index nach run_id für schnellen Lookup
  const approvalByRun: Record<string, string> = {}
  for (const item of Object.values(queueRaw) as any[]) {
    if (item.run_id && item.approval_id) approvalByRun[item.run_id] = item.approval_id
  }

  const entries: FailedRunEntry[] = failedRuns.map(run => {
    const runAudit = allAudit.filter(e => e.run_id === run.run_id)
    const kind     = classifyFailure(run, runAudit)
    const errors   = extractErrors(runAudit)
    const approvalId = approvalByRun[run.run_id]

    const partial: Partial<FailedRunEntry> = {
      run_id:        run.run_id,
      workorder_id:  run.workorder_id,
      agent_id:      run.agent_id,
      status:        run.status,
      failure_kind:  kind,
      started_at:    run.started_at ?? '',
      completed_at:  run.completed_at ?? '',
      scope_files:   [],
      changed_files: run.written_files ?? [],
      errors,
      approval_id:   approvalId,
    }

    return {
      ...partial,
      error_summary:   buildErrorSummary(errors, kind, run),
      action_required: buildActionRequired(kind, { ...partial, approval_id: approvalId }),
    } as FailedRunEntry
  })

  // Sortierung: awaiting_approval zuerst, dann blocked, dann failed; innerhalb nach Datum desc
  const kindOrder: Record<FailureKind, number> = {
    BLOCKED_APPROVAL: 0, BLOCKED_SCOPE: 1, BLOCKED_PREFLIGHT: 2,
    BLOCKED_SYSTEM_STOP: 3, BLOCKED_OTHER: 4, FAILED: 5,
  }
  entries.sort((a, b) => {
    const kd = (kindOrder[a.failure_kind] ?? 9) - (kindOrder[b.failure_kind] ?? 9)
    if (kd !== 0) return kd
    return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  })

  return {
    generated_at:   new Date().toISOString(),
    since,
    total_runs:     allRuns.filter(r => !since || new Date(r.started_at).getTime() >= sinceMs).length,
    failed_count:   entries.filter(e => e.failure_kind === 'FAILED').length,
    blocked_count:  entries.filter(e => e.failure_kind.startsWith('BLOCKED_') && e.failure_kind !== 'BLOCKED_APPROVAL').length,
    approval_count: entries.filter(e => e.failure_kind === 'BLOCKED_APPROVAL').length,
    entries,
  }
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

export function renderFailedReportMarkdown(report: FailedWoReport): string {
  const lines: string[] = []

  const kindIcon: Record<string, string> = {
    FAILED: '❌', BLOCKED_APPROVAL: '⏳', BLOCKED_SCOPE: '🔒',
    BLOCKED_PREFLIGHT: '🚫', BLOCKED_SYSTEM_STOP: '⛔', BLOCKED_OTHER: '⚠️',
  }

  lines.push(`# Failed WO Report`)
  lines.push(``)
  lines.push(`**Generiert:** ${report.generated_at}`)
  if (report.since) lines.push(`**Seit:** ${report.since}`)
  lines.push(`**Total Runs:** ${report.total_runs}`)
  lines.push(``)
  lines.push(`| Kategorie | Anzahl |`)
  lines.push(`|-----------|--------|`)
  lines.push(`| ❌ Failed | ${report.failed_count} |`)
  lines.push(`| 🔒 Blocked (nicht Approval) | ${report.blocked_count} |`)
  lines.push(`| ⏳ Awaiting Approval | ${report.approval_count} |`)
  lines.push(``)

  if (report.entries.length === 0) {
    lines.push(`✅ Keine failed / blocked Runs.`)
    return lines.join('\n')
  }

  for (const entry of report.entries) {
    const icon = kindIcon[entry.failure_kind] ?? '?'
    lines.push(`---`)
    lines.push(``)
    lines.push(`## ${icon} ${entry.run_id}`)
    lines.push(``)
    lines.push(`**WO:** ${entry.workorder_id} | **Agent:** ${entry.agent_id}`)
    lines.push(`**Status:** ${entry.status} | **Kind:** ${entry.failure_kind}`)
    lines.push(`**Started:** ${entry.started_at}`)
    lines.push(``)
    lines.push(`**Fehler:** ${entry.error_summary}`)
    lines.push(``)
    if (entry.changed_files.length > 0) {
      lines.push(`**Changed Files:**`)
      entry.changed_files.forEach(f => lines.push(`- \`${f}\``))
      lines.push(``)
    }
    if (entry.errors.length > 1) {
      lines.push(`**Alle Fehler:**`)
      entry.errors.forEach(e => lines.push(`- ${e}`))
      lines.push(``)
    }
    lines.push(`**Action Required:**`)
    lines.push(`\`\`\``)
    lines.push(entry.action_required)
    lines.push(`\`\`\``)
    lines.push(``)
  }

  return lines.join('\n')
}

// ─── Writer ───────────────────────────────────────────────────────────────────

export function writeFailedReport(
  report: FailedWoReport,
  outputDir = 'system/reports',
): { jsonPath: string; mdPath: string } {
  const absDir = path.resolve(process.cwd(), outputDir)
  if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true })

  const base     = path.join(absDir, 'failed-wo-report')
  const jsonPath = `${base}.json`
  const mdPath   = `${base}.md`

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8')
  fs.writeFileSync(mdPath,   renderFailedReportMarkdown(report), 'utf8')

  return { jsonPath, mdPath }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args  = process.argv.slice(2)
  const since = args.find(a => a.match(/^\d{4}-\d{2}-\d{2}/))

  const report = generateFailedReport(since)
  const { jsonPath, mdPath } = writeFailedReport(report)

  console.log(`\n✓ Failed WO Report:`)
  console.log(`  JSON: ${jsonPath}`)
  console.log(`  MD:   ${mdPath}`)
  console.log()
  console.log(renderFailedReportMarkdown(report))
}

const isMain = process.argv[1]?.includes('failed-wo-report')
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1) })
}
