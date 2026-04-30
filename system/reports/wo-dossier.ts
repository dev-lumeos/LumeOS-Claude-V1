/**
 * LUMEOS Completed WO Dossier — E.1
 * system/reports/wo-dossier.ts
 *
 * Persistente Archivierung einer abgeschlossenen Workorder.
 * Aggregiert alle Informationen zu einer WO aus allen Quellen.
 *
 * Quellen:
 *   - system/workorders/         (Original-WO wenn vorhanden)
 *   - system/state/runtime_state.json (Runs)
 *   - system/reports/runs/       (Run Summaries)
 *   - system/state/audit.jsonl   (Audit-Events)
 *   - system/state/pipeline-audit.jsonl (Review-Events)
 *   - system/state/pipeline-metrics.jsonl (Metriken)
 *   - system/approval/queue.json (Approvals)
 *
 * Output:
 *   system/reports/dossiers/<workorder_id>-dossier.json
 *   system/reports/dossiers/<workorder_id>-dossier.md
 *
 * CLI:
 *   npx tsx system/reports/wo-dossier.ts <workorder_id>
 *   npx tsx system/reports/wo-dossier.ts --all-completed
 */

import fs   from 'node:fs'
import path from 'node:path'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WoDossierRun {
  run_id:        string
  status:        string
  started_at:    string
  completed_at:  string
  duration_ms:   number
  changed_files: string[]
  errors:        string[]
  review_results: Array<{ tier: string; outcome: string; confidence?: number; latency_ms?: number }>
  retry_count:   number
  escalation_count: number
}

export interface WoDossierApproval {
  approval_id:     string
  status:          string
  reason:          string
  risk_category:   string
  proposed_action: string
  affected_files:  string[]
  requested_at:    string
  decided_at?:     string
  decided_by?:     string
}

export interface WoDossierFollowUp {
  type:   'retry_recommended' | 'investigate_error' | 'human_approval_required' | 'none'
  detail: string
}

export interface WoDossier {
  workorder_id:    string
  dossier_version: 1
  generated_at:    string

  /** Vollständige WO-Definition wenn Quelldatei gefunden */
  workorder?:       Record<string, any>

  /** Alle Runs dieser WO */
  runs:             WoDossierRun[]

  /** Aggregierte Statistiken */
  stats: {
    total_runs:       number
    completed_runs:   number
    failed_runs:      number
    blocked_runs:     number
    total_duration_ms: number
    all_changed_files: string[]
    total_escalations: number
    total_retries:     number
  }

  /** Approval-History */
  approvals:        WoDossierApproval[]

  /** Audit-Events (ohne Noise) */
  key_audit_events: Array<{ ts: string; event: string; detail?: string }>

  /** Review-Events aus pipeline-audit.jsonl */
  review_events:    Array<{ ts: string; tier: string; event: string; status?: string; confidence?: number }>

  /** Empfehlung nach Abschluss */
  follow_up:        WoDossierFollowUp
}

// ─── Reader-Utilities ─────────────────────────────────────────────────────────

function readJsonl<T = any>(filepath: string): T[] {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return []
  return fs.readFileSync(abs, 'utf8')
    .split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l) } catch { return null } })
    .filter(Boolean) as T[]
}

function readJson<T = any>(filepath: string): T | null {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return null
  try { return JSON.parse(fs.readFileSync(abs, 'utf8')) }
  catch { return null }
}

function loadRunSummary(runId: string): any | null {
  const dir = path.resolve(process.cwd(), 'system/reports/runs')
  if (!fs.existsSync(dir)) return null
  const file = path.join(dir, `${runId}-summary.json`)
  if (!fs.existsSync(file)) return null
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch { return null }
}

function findOriginalWo(workorderId: string): Record<string, any> | undefined {
  // Suche in bekannten Pfaden
  const searchDirs = [
    'system/workorders/examples',
    'system/workorders/adhoc',
    'system/workorders/batches',
    'system/workorders',
  ]
  for (const dir of searchDirs) {
    const abs = path.resolve(process.cwd(), dir)
    if (!fs.existsSync(abs)) continue
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.json')) continue
      try {
        const data = JSON.parse(fs.readFileSync(path.join(abs, f), 'utf8'))
        if (data.workorder_id === workorderId) return data
      } catch {}
    }
  }
  return undefined
}

// ─── Key-Events Filter ────────────────────────────────────────────────────────

const KEY_EVENTS = new Set([
  'job_started', 'job_completed', 'job_failed', 'job_blocked',
  'tool_call_blocked', 'governance_violation', 'governance_parse_error',
  'files_scope_violation', 'scope_lock_conflict',
  'preflight_go', 'preflight_hold', 'preflight_reject',
  'approval_required', 'approval_granted', 'approval_denied',
  'review_pipeline_human_needed',
  'scope_lock_acquired', 'scope_lock_released',
  'wo_status_invalid_transition',
])

// ─── Dossier-Generator ────────────────────────────────────────────────────────

export function generateWoDossier(workorderId: string): WoDossier | null {
  const state      = readJson<any>('system/state/runtime_state.json')
  const allAudit   = readJsonl<any>('system/state/audit.jsonl')
  const pAudit     = readJsonl<any>('system/state/pipeline-audit.jsonl')
  const metrics    = readJsonl<any>('system/state/pipeline-metrics.jsonl')
  const queueRaw   = readJson<any>('system/approval/queue.json') ?? {}

  // Alle Runs dieser WO aus runtime_state
  const woRuns = (state?.active_runs ?? [])
    .filter((r: any) => r.workorder_id === workorderId)

  if (woRuns.length === 0) return null

  // Runs aufbauen
  const runs: WoDossierRun[] = woRuns.map((run: any) => {
    const summary = loadRunSummary(run.run_id)
    const runAudit = allAudit.filter(e => e.run_id === run.run_id)

    const errors: string[] = []
    for (const e of runAudit) {
      if (e.event === 'tool_call_blocked' && e.reason)      errors.push(`BLOCKED: ${e.reason}`)
      if (e.event === 'governance_violation' && e.reason)   errors.push(`GOVERNANCE: ${e.reason}`)
      if (e.event === 'files_scope_violation' && e.reason)  errors.push(`SCOPE: ${e.reason}`)
      if (e.event === 'preflight_reject' && e.reason)       errors.push(`PREFLIGHT_REJECT: ${e.reason}`)
    }

    const startMs    = new Date(run.started_at ?? 0).getTime()
    const endMs      = new Date(run.completed_at ?? run.started_at ?? 0).getTime()
    const durationMs = endMs > startMs ? endMs - startMs : 0

    return {
      run_id:           run.run_id,
      status:           run.status,
      started_at:       run.started_at ?? '',
      completed_at:     run.completed_at ?? '',
      duration_ms:      durationMs,
      changed_files:    run.written_files ?? [],
      errors,
      review_results:   summary?.review_results ?? [],
      retry_count:      summary?.retry_count ?? 0,
      escalation_count: summary?.escalation_count ?? 0,
    }
  })

  // Statistiken
  const allChangedFiles = [...new Set(runs.flatMap(r => r.changed_files))]
  const stats = {
    total_runs:        runs.length,
    completed_runs:    runs.filter(r => r.status === 'completed').length,
    failed_runs:       runs.filter(r => r.status === 'failed').length,
    blocked_runs:      runs.filter(r => r.status === 'blocked').length,
    total_duration_ms: runs.reduce((a, r) => a + r.duration_ms, 0),
    all_changed_files: allChangedFiles,
    total_escalations: runs.reduce((a, r) => a + r.escalation_count, 0),
    total_retries:     runs.reduce((a, r) => a + r.retry_count, 0),
  }

  // Approvals (nach workorder_id filtern)
  const approvals: WoDossierApproval[] = Object.values(queueRaw)
    .filter((i: any) => i.workorder_id === workorderId)
    .map((i: any) => ({
      approval_id:     i.approval_id,
      status:          i.status,
      reason:          i.reason ?? '',
      risk_category:   i.risk_category ?? 'standard',
      proposed_action: i.proposed_action ?? '',
      affected_files:  i.affected_files ?? [],
      requested_at:    i.requested_at,
      decided_at:      i.decided_at,
      decided_by:      i.decided_by,
    }))

  // Key-Audit-Events
  const woRunIds = new Set(woRuns.map((r: any) => r.run_id))
  const keyAuditEvents = allAudit
    .filter(e => woRunIds.has(e.run_id) && KEY_EVENTS.has(e.event))
    .map(e => ({
      ts:     e.ts ?? e.timestamp ?? '',
      event:  e.event,
      detail: e.reason ?? e.review_reason ?? e.error_code ?? undefined,
    }))

  // Review-Events aus pipeline-audit (nach wo_id filtern)
  const reviewEvents = pAudit
    .filter(e => e.wo_id === workorderId)
    .map(e => ({
      ts:         e.ts ?? '',
      tier:       e.tier ?? '',
      event:      e.event,
      status:     e.status,
      confidence: e.confidence,
    }))

  // Follow-Up bestimmen
  const lastRun = runs[runs.length - 1]
  let followUp: WoDossierFollowUp
  if (stats.completed_runs > 0) {
    followUp = { type: 'none', detail: 'WO erfolgreich abgeschlossen.' }
  } else if (approvals.some(a => a.status === 'pending')) {
    followUp = { type: 'human_approval_required',
      detail: `Pending Approval: ${approvals.find(a => a.status === 'pending')?.approval_id}` }
  } else if (lastRun?.errors.length > 0) {
    const hasRewrite = keyAuditEvents.some(e => e.event === 'review_pipeline_rewrite')
    followUp = hasRewrite
      ? { type: 'retry_recommended', detail: `Letzter Fehler: ${lastRun.errors[0]}` }
      : { type: 'investigate_error', detail: `Letzter Fehler: ${lastRun.errors[0]}` }
  } else {
    followUp = { type: 'investigate_error', detail: `Status: ${lastRun?.status ?? 'unbekannt'}` }
  }

  return {
    workorder_id:    workorderId,
    dossier_version: 1,
    generated_at:    new Date().toISOString(),
    workorder:       findOriginalWo(workorderId),
    runs,
    stats,
    approvals,
    key_audit_events: keyAuditEvents,
    review_events:    reviewEvents,
    follow_up:        followUp,
  }
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

export function renderWoDossierMarkdown(d: WoDossier): string {
  const lines: string[] = []
  const statusIcon: Record<string, string> = {
    completed: '✅', failed: '❌', blocked: '⚠️', awaiting_approval: '⏳', running: '🔄',
  }

  lines.push(`# WO Dossier — ${d.workorder_id}`)
  lines.push(``)
  lines.push(`**Erstellt:** ${d.generated_at}`)
  lines.push(``)

  // Übersicht
  lines.push(`## Übersicht`)
  lines.push(``)
  lines.push(`| | |`)
  lines.push(`|---|---|`)
  lines.push(`| Runs gesamt | ${d.stats.total_runs} |`)
  lines.push(`| Completed | ${d.stats.completed_runs} |`)
  lines.push(`| Failed | ${d.stats.failed_runs} |`)
  lines.push(`| Blocked | ${d.stats.blocked_runs} |`)
  lines.push(`| Gesamtdauer | ${d.stats.total_duration_ms}ms |`)
  lines.push(`| Escalations | ${d.stats.total_escalations} |`)
  lines.push(`| Retries | ${d.stats.total_retries} |`)
  lines.push(``)
  if (d.stats.all_changed_files.length > 0) {
    lines.push(`**Changed Files:**`)
    d.stats.all_changed_files.forEach(f => lines.push(`- \`${f}\``))
    lines.push(``)
  }

  // Follow-Up
  if (d.follow_up.type !== 'none') {
    const fuIcon: Record<string, string> = {
      human_approval_required: '⏳', retry_recommended: '🔄', investigate_error: '🔴',
    }
    lines.push(`## Follow-Up`)
    lines.push(``)
    lines.push(`${fuIcon[d.follow_up.type] ?? '?'} **${d.follow_up.type}**`)
    lines.push(`${d.follow_up.detail}`)
    lines.push(``)
  }

  // Original WO
  if (d.workorder) {
    lines.push(`## Original Workorder`)
    lines.push(``)
    lines.push(`- **Agent:** ${d.workorder.agent_id}`)
    lines.push(`- **Risk:** ${d.workorder.risk_category ?? 'standard'}`)
    lines.push(`- **Task:** ${d.workorder.task}`)
    if (d.workorder.scope_files?.length)
      lines.push(`- **Scope:** ${d.workorder.scope_files.join(', ')}`)
    lines.push(``)
  }

  // Runs
  lines.push(`## Runs (${d.stats.total_runs})`)
  lines.push(``)
  for (const run of d.runs) {
    const icon = statusIcon[run.status] ?? '❓'
    lines.push(`### ${icon} ${run.run_id} — ${run.status}`)
    lines.push(`- **Dauer:** ${run.duration_ms}ms | **Started:** ${run.started_at}`)
    if (run.changed_files.length > 0)
      lines.push(`- **Changed:** ${run.changed_files.join(', ')}`)
    if (run.review_results.length > 0) {
      const reviews = run.review_results.map(r =>
        `${r.tier}: ${r.outcome}${r.confidence ? ` (${r.confidence})` : ''}${r.latency_ms ? ` ${r.latency_ms}ms` : ''}`
      ).join(' → ')
      lines.push(`- **Reviews:** ${reviews}`)
    }
    if (run.errors.length > 0)
      lines.push(`- **Errors:** ${run.errors[0]}`)
    lines.push(``)
  }

  // Approvals
  if (d.approvals.length > 0) {
    lines.push(`## Approvals`)
    lines.push(``)
    for (const a of d.approvals) {
      const ai: Record<string, string> = { pending: '⏳', granted: '✅', denied: '❌', expired: '⏰', consumed: '✔' }
      lines.push(`- ${ai[a.status] ?? '?'} \`${a.approval_id}\` — ${a.status}`)
      lines.push(`  ${a.reason}`)
      if (a.decided_at) lines.push(`  Entschieden: ${a.decided_at} von ${a.decided_by}`)
    }
    lines.push(``)
  }

  // Key Audit Events
  if (d.key_audit_events.length > 0) {
    lines.push(`## Key Events`)
    lines.push(``)
    for (const e of d.key_audit_events) {
      const detail = e.detail ? ` — ${e.detail}` : ''
      lines.push(`- \`${e.event}\`${detail}`)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

// ─── Writer ───────────────────────────────────────────────────────────────────

export function writeWoDossier(
  dossier: WoDossier,
  outputDir = 'system/reports/dossiers',
): { jsonPath: string; mdPath: string } {
  const absDir = path.resolve(process.cwd(), outputDir)
  if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true })

  const base     = path.join(absDir, `${dossier.workorder_id}-dossier`)
  const jsonPath = `${base}.json`
  const mdPath   = `${base}.md`

  fs.writeFileSync(jsonPath, JSON.stringify(dossier, null, 2), 'utf8')
  fs.writeFileSync(mdPath,   renderWoDossierMarkdown(dossier), 'utf8')
  return { jsonPath, mdPath }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage:\n  npx tsx system/reports/wo-dossier.ts <workorder_id>')
    console.log('         npx tsx system/reports/wo-dossier.ts --all-completed')
    process.exit(0)
  }

  if (args[0] === '--all-completed') {
    const state = readJson<any>('system/state/runtime_state.json')
    const woIds = [...new Set(
      (state?.active_runs ?? [])
        .filter((r: any) => r.status === 'completed')
        .map((r: any) => r.workorder_id as string)
    )]
    console.log(`\nGenerating dossiers for ${woIds.length} completed WOs...`)
    let n = 0
    for (const woId of woIds) {
      const d = generateWoDossier(woId)
      if (!d) { console.log(`  SKIP ${woId} — no data`); continue }
      const { jsonPath } = writeWoDossier(d)
      console.log(`  ✓ ${woId} → ${path.basename(jsonPath)}`)
      n++
    }
    console.log(`\nDone. ${n}/${woIds.length} dossiers generated.\n`)
    return
  }

  const woId   = args[0]
  const dossier = generateWoDossier(woId)
  if (!dossier) {
    console.error(`WO nicht gefunden in runtime_state: ${woId}`)
    process.exit(1)
  }

  const { jsonPath, mdPath } = writeWoDossier(dossier)
  console.log(`\n✓ Dossier written:`)
  console.log(`  JSON: ${jsonPath}`)
  console.log(`  MD:   ${mdPath}`)
  console.log()
  console.log(renderWoDossierMarkdown(dossier))
}

const isMain = process.argv[1]?.includes('wo-dossier')
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1) })
}
