/**
 * LUMEOS Morning Report — B.2
 * system/reports/morning-report.ts
 *
 * Tages-/Night-Run-Überblick. Aggregiert aus:
 *   - system/reports/runs/RUN-*-summary.json   (Run Summaries)
 *   - system/reports/failed-wo-report.ts       (Failed/Blocked Runs)
 *   - system/approval/queue.json               (Approval Queue)
 *   - system/state/pipeline-metrics.jsonl      (Pipeline Metrics)
 *   - system/state/runtime_state.json          (System-Status)
 *
 * Output:
 *   system/reports/morning-report-YYYY-MM-DD.md
 *
 * CLI:
 *   npx tsx system/reports/morning-report.ts
 *   npx tsx system/reports/morning-report.ts --since 2026-04-29
 */

import fs   from 'node:fs'
import path from 'node:path'
import { generateFailedReport } from './failed-wo-report'

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

function loadRunSummaries(since?: string): any[] {
  const dir = path.resolve(process.cwd(), 'system/reports/runs')
  if (!fs.existsSync(dir)) return []
  const sinceMs = since ? new Date(since).getTime() : 0
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('-summary.json'))
    .map(f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) } catch { return null } })
    .filter(Boolean)
    .filter(s => !sinceMs || new Date(s.started_at ?? s.completed_at ?? 0).getTime() >= sinceMs)
}

// ─── Metrics Aggregation ──────────────────────────────────────────────────────

interface MetricsSnapshot {
  total_reviews:  number
  pass_count:     number
  fail_count:     number
  escalation_count: number
  avg_latency_ms: number
  pass_rate_pct:  number
}

function buildMetricsSnapshot(since?: string): MetricsSnapshot {
  const all    = readJsonl<any>('system/state/pipeline-metrics.jsonl')
  const sinceMs = since ? new Date(since).getTime() : 0
  const metrics = all.filter(m => !sinceMs || new Date(m.timestamp).getTime() >= sinceMs)

  const passOutcomes   = new Set(['PASS', 'pass'])
  const failOutcomes   = new Set(['FAIL', 'fail', 'REWRITE', 'rewrite', 'invalid_json', 'ESCALATE', 'escalate'])

  const pass       = metrics.filter(m => passOutcomes.has(m.outcome)).length
  const fail       = metrics.filter(m => failOutcomes.has(m.outcome)).length
  const escalated  = metrics.filter(m => m.escalated).length
  const latencies  = metrics.map(m => m.latency_ms).filter(n => typeof n === 'number')
  const avgLat     = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0
  const passRate   = metrics.length ? Math.round((pass / metrics.length) * 100) : 0

  return { total_reviews: metrics.length, pass_count: pass, fail_count: fail,
    escalation_count: escalated, avg_latency_ms: avgLat, pass_rate_pct: passRate }
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

export function renderMorningReport(since?: string): string {
  const now   = new Date()
  const today = now.toISOString().slice(0, 10)

  const summaries   = loadRunSummaries(since)
  const failedRpt   = generateFailedReport(since)
  const queue       = readJson<any>('system/approval/queue.json') ?? {}
  const state       = readJson<any>('system/state/runtime_state.json')
  const metrics     = buildMetricsSnapshot(since)

  const completed   = summaries.filter(s => s.final_status === 'completed')
  const failed      = summaries.filter(s => s.final_status === 'failed')
  const blocked     = summaries.filter(s => s.final_status === 'blocked')
  const pending     = Object.values(queue).filter((i: any) => i.status === 'pending')
  const systemStop  = state?.system_stop?.active ? state.system_stop : null

  const lines: string[] = []

  // ── Header ──────────────────────────────────────────────────────────────────
  lines.push(`# Morning Report — ${today}`)
  lines.push(``)
  lines.push(`**Generiert:** ${now.toISOString()}`)
  if (since) lines.push(`**Zeitraum:** seit ${since}`)
  lines.push(``)

  // ── System-Status ──────────────────────────────────────────────────────────
  if (systemStop) {
    lines.push(`> ⛔ **SYSTEM STOP AKTIV:** ${systemStop.reason}`)
    lines.push(`> Gestoppt: ${systemStop.stopped_at} | Von: ${systemStop.stopped_by}`)
    lines.push(`> Aufheben: \`triggerSystemStop / clearSystemStop()\``)
    lines.push(``)
  }

  // ── Zusammenfassung ────────────────────────────────────────────────────────
  lines.push(`## Zusammenfassung`)
  lines.push(``)
  lines.push(`| | |`)
  lines.push(`|---|---|`)
  lines.push(`| ✅ Completed | ${completed.length} |`)
  lines.push(`| ❌ Failed | ${failed.length} |`)
  lines.push(`| 🔒 Blocked | ${blocked.length} |`)
  lines.push(`| ⏳ Pending Approvals | ${pending.length} |`)
  lines.push(`| 📊 Reviews gesamt | ${metrics.total_reviews} |`)
  lines.push(`| 📈 Pass-Rate | ${metrics.pass_rate_pct}% |`)
  lines.push(``)

  // ── Action Required ────────────────────────────────────────────────────────
  const actionItems: string[] = []
  if (systemStop)
    actionItems.push(`⛔ System Stop aufheben`)
  pending.forEach((i: any) => {
    actionItems.push(`⏳ Approval entscheiden: \`${i.approval_id}\` — WO ${i.workorder_id} (${i.risk_category})`)
  })
  failedRpt.entries
    .filter(e => e.failure_kind === 'BLOCKED_PREFLIGHT')
    .forEach(e => actionItems.push(`🚫 WO reparieren: ${e.workorder_id} (${e.error_summary})`))
  failedRpt.entries
    .filter(e => e.failure_kind === 'BLOCKED_SCOPE')
    .forEach(e => actionItems.push(`🔒 Scope-Konflikt auflösen: ${e.workorder_id}`))

  if (actionItems.length > 0) {
    lines.push(`## Action Required`)
    lines.push(``)
    actionItems.forEach(a => lines.push(`- ${a}`))
    lines.push(``)
  }

  // ── Pending Approvals ──────────────────────────────────────────────────────
  if (pending.length > 0) {
    lines.push(`## ⏳ Pending Approvals (${pending.length})`)
    lines.push(``)
    ;(pending as any[]).forEach(i => {
      lines.push(`### ${i.approval_id}`)
      lines.push(`- **WO:** ${i.workorder_id} | **Agent:** ${i.agent_id} | **Risk:** ${i.risk_category}`)
      lines.push(`- **Reason:** ${i.reason}`)
      lines.push(`- **Action:** ${i.proposed_action}`)
      if (i.affected_files?.length)
        lines.push(`- **Files:** ${i.affected_files.join(', ')}`)
      lines.push(`- **Expires:** ${i.expires_at}`)
      lines.push(`\`\`\``)
      lines.push(`npx tsx system/approval/approval-cli.ts grant ${i.approval_id}`)
      lines.push(`npx tsx system/approval/approval-cli.ts deny  ${i.approval_id}`)
      lines.push(`\`\`\``)
      lines.push(``)
    })
  }

  // ── Failed / Blocked Runs ──────────────────────────────────────────────────
  if (failedRpt.entries.length > 0) {
    lines.push(`## ❌ Failed / Blocked Runs (${failedRpt.entries.length})`)
    lines.push(``)
    for (const e of failedRpt.entries.slice(0, 10)) {
      const icon = e.failure_kind === 'BLOCKED_APPROVAL' ? '⏳'
                 : e.failure_kind === 'BLOCKED_SCOPE'    ? '🔒'
                 : e.failure_kind === 'BLOCKED_PREFLIGHT'? '🚫'
                 : e.failure_kind.startsWith('BLOCKED')  ? '⚠️' : '❌'
      lines.push(`- ${icon} \`${e.run_id}\` — ${e.workorder_id} | ${e.failure_kind}`)
      lines.push(`  ${e.error_summary}`)
    }
    if (failedRpt.entries.length > 10)
      lines.push(`  _(+ ${failedRpt.entries.length - 10} weitere — see failed-wo-report.md)_`)
    lines.push(``)
    lines.push(`Details: \`npx tsx system/reports/failed-wo-report.ts\``)
    lines.push(``)
  }

  // ── Completed Runs ─────────────────────────────────────────────────────────
  if (completed.length > 0) {
    lines.push(`## ✅ Completed Runs (${completed.length})`)
    lines.push(``)
    completed.slice(0, 8).forEach(s => {
      const files = s.changed_files?.length ? ` → ${s.changed_files.join(', ')}` : ''
      const ms    = s.duration_ms ? ` (${s.duration_ms}ms)` : ''
      lines.push(`- \`${s.run_id}\` — ${s.workorder_id}${ms}${files}`)
    })
    if (completed.length > 8)
      lines.push(`  _(+ ${completed.length - 8} weitere)_`)
    lines.push(``)
  }

  // ── Metrics Snapshot ───────────────────────────────────────────────────────
  if (metrics.total_reviews > 0) {
    lines.push(`## 📊 Pipeline Metrics`)
    lines.push(``)
    lines.push(`| Metrik | Wert |`)
    lines.push(`|--------|------|`)
    lines.push(`| Reviews gesamt | ${metrics.total_reviews} |`)
    lines.push(`| PASS | ${metrics.pass_count} |`)
    lines.push(`| FAIL/REWRITE | ${metrics.fail_count} |`)
    lines.push(`| Escalations | ${metrics.escalation_count} |`)
    lines.push(`| Pass-Rate | ${metrics.pass_rate_pct}% |`)
    lines.push(`| Ø Latenz | ${metrics.avg_latency_ms}ms |`)
    lines.push(``)
  }

  // ── Next Actions ───────────────────────────────────────────────────────────
  lines.push(`## Next Actions`)
  lines.push(``)
  if (actionItems.length === 0 && failedRpt.entries.length === 0) {
    lines.push(`✅ Keine offenen Aktionen. System läuft sauber.`)
  } else {
    if (pending.length > 0)
      lines.push(`1. Approvals entscheiden: \`npx tsx system/approval/approval-cli.ts list\``)
    if (failedRpt.entries.length > 0)
      lines.push(`${pending.length > 0 ? 2 : 1}. Failed Runs analysieren: \`npx tsx system/reports/failed-wo-report.ts\``)
    if (systemStop)
      lines.push(`→ System Stop aufheben wenn bereit: \`clearSystemStop()\``)
  }
  lines.push(``)

  return lines.join('\n')
}

// ─── Writer ───────────────────────────────────────────────────────────────────

export function writeMorningReport(since?: string): { mdPath: string } {
  const today  = new Date().toISOString().slice(0, 10)
  const absDir = path.resolve(process.cwd(), 'system/reports')
  if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true })

  const mdPath = path.join(absDir, `morning-report-${today}.md`)
  fs.writeFileSync(mdPath, renderMorningReport(since), 'utf8')
  return { mdPath }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args  = process.argv.slice(2)
  const since = args.find(a => /^\d{4}-\d{2}-\d{2}/.test(a))

  const { mdPath } = writeMorningReport(since)
  console.log(`\n✓ Morning Report: ${mdPath}\n`)
  console.log(renderMorningReport(since))
}

const isMain = process.argv[1]?.includes('morning-report')
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1) })
}
