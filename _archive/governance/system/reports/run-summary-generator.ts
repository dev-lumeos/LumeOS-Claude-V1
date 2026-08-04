/**
 * LUMEOS Run Summary Generator
 * system/reports/run-summary-generator.ts
 *
 * Liest audit.jsonl, pipeline-audit.jsonl, pipeline-metrics.jsonl und
 * runtime_state.json und schreibt für einen Run:
 *   system/reports/runs/RUN-<id>-summary.json
 *   system/reports/runs/RUN-<id>-summary.md
 *
 * CLI:
 *   npx tsx system/reports/run-summary-generator.ts <run_id>
 *   npx tsx system/reports/run-summary-generator.ts --all
 *
 * Kann auch programmatisch importiert werden:
 *   import { generateRunSummary } from './run-summary-generator'
 */

import fs   from 'node:fs'
import path from 'node:path'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NextAction =
  | 'none'
  | 'human_approval_required'
  | 'retry_recommended'
  | 'investigate_error'

export interface ReviewTierResult {
  tier:        string
  outcome:     string
  confidence?: number
  latency_ms?: number
  escalated?:  boolean
}

export interface RunSummaryJson {
  run_id:                     string
  workorder_id:               string
  agent_id:                   string
  final_status:               string
  started_at:                 string
  completed_at:               string
  duration_ms:                number
  changed_files:              string[]
  bash_commands_executed:     string[]
  review_results:             ReviewTierResult[]
  retry_count:                number
  escalation_count:           number
  human_approval_required:    boolean
  errors:                     string[]
  next_action:                NextAction
  generated_at:               string
}

// ─── JSONL Parser ─────────────────────────────────────────────────────────────

function readJsonl<T = any>(filepath: string): T[] {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return []
  return fs.readFileSync(abs, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => { try { return JSON.parse(line) } catch { return null } })
    .filter(Boolean) as T[]
}

function readJson<T = any>(filepath: string): T | null {
  const abs = path.resolve(process.cwd(), filepath)
  if (!fs.existsSync(abs)) return null
  try { return JSON.parse(fs.readFileSync(abs, 'utf8')) }
  catch { return null }
}

// ─── Core Generator ───────────────────────────────────────────────────────────

export function generateRunSummary(runId: string): RunSummaryJson | null {
  // 1. runtime_state.json
  const state = readJson<any>('system/state/runtime_state.json')
  const run = state?.active_runs?.find((r: any) => r.run_id === runId)
  if (!run) return null

  const woId    = run.workorder_id as string
  const agentId = run.agent_id     as string

  // 2. audit.jsonl — filter by run_id
  const allAudit = readJsonl<any>('system/state/audit.jsonl')
  const runAudit = allAudit.filter(e => e.run_id === runId)

  const errors: string[] = []
  const bashCommands: string[] = []

  for (const e of runAudit) {
    if (e.event === 'tool_call_executed' && e.tool === 'bash' && e.command)
      bashCommands.push(e.command)
    if (e.event === 'tool_call_blocked' && e.reason)
      errors.push(`BLOCKED: ${e.reason}`)
    if (e.event === 'governance_violation' && e.reason)
      errors.push(`GOVERNANCE: ${e.reason}`)
    if (e.event === 'governance_parse_error' && e.reason)
      errors.push(`PARSE_ERROR: ${e.reason}`)
    if (e.event === 'files_scope_violation' && e.reason)
      errors.push(`SCOPE_VIOLATION: ${e.reason}`)
    if (e.event === 'job_failed' && e.reason && !errors.length)
      errors.push(`JOB_FAILED: ${e.reason}`)
  }

  const retryCount     = runAudit.filter(e => e.event === 'review_pipeline_retry').length
  const humanNeeded    = runAudit.some(e => e.event === 'review_pipeline_human_needed')

  // 3. pipeline-audit.jsonl — filter by wo_id
  const pipelineAudit = readJsonl<any>('system/state/pipeline-audit.jsonl')
  const woAudit       = pipelineAudit.filter(e => e.wo_id === woId)
  const escalationCount = woAudit.filter(e => e.event === 'review_escalated').length

  // 4. pipeline-metrics.jsonl — filter by run_id
  const metrics    = readJsonl<any>('system/state/pipeline-metrics.jsonl')
  const runMetrics = metrics.filter(e => e.run_id === runId)

  const reviewResults: ReviewTierResult[] = runMetrics.map(m => ({
    tier:        m.tier,
    outcome:     m.outcome,
    confidence:  m.confidence,
    latency_ms:  m.latency_ms,
    escalated:   m.escalated,
  }))

  // 5. Zeiten
  const startedAt   = run.started_at   ?? ''
  const completedAt = run.completed_at ?? ''
  const durationMs  = (startedAt && completedAt)
    ? new Date(completedAt).getTime() - new Date(startedAt).getTime()
    : 0

  // 6. next_action
  const finalStatus = run.status as string
  let nextAction: NextAction = 'none'
  if (humanNeeded || finalStatus === 'blocked') {
    nextAction = 'human_approval_required'
  } else if (finalStatus === 'failed') {
    const hasRewrite = runAudit.some(e => e.event === 'review_pipeline_rewrite')
    nextAction = hasRewrite ? 'retry_recommended' : 'investigate_error'
  }

  return {
    run_id:                  runId,
    workorder_id:            woId,
    agent_id:                agentId,
    final_status:            finalStatus,
    started_at:              startedAt,
    completed_at:            completedAt,
    duration_ms:             durationMs,
    changed_files:           run.written_files ?? [],
    bash_commands_executed:  bashCommands,
    review_results:          reviewResults,
    retry_count:             retryCount,
    escalation_count:        escalationCount,
    human_approval_required: humanNeeded || finalStatus === 'blocked',
    errors,
    next_action:             nextAction,
    generated_at:            new Date().toISOString(),
  }
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

export function renderMarkdown(s: RunSummaryJson): string {
  const statusEmoji: Record<string, string> = {
    completed: '✅', failed: '❌', blocked: '⚠️', awaiting_approval: '⏳', running: '🔄',
  }
  const em = statusEmoji[s.final_status] ?? '❓'

  const lines: string[] = []

  lines.push(`# Run Summary — ${s.run_id}`)
  lines.push('')
  lines.push(`**Status:** ${em} ${s.final_status}`)
  lines.push(`**Workorder:** ${s.workorder_id}`)
  lines.push(`**Agent:** ${s.agent_id}`)
  lines.push(`**Started:** ${s.started_at}`)
  lines.push(`**Completed:** ${s.completed_at}`)
  lines.push(`**Duration:** ${s.duration_ms}ms`)
  lines.push(`**Generated:** ${s.generated_at}`)
  lines.push('')

  // Action Required
  if (s.next_action !== 'none') {
    const actionLabel: Record<string, string> = {
      human_approval_required: '🔴 Human Approval Required',
      retry_recommended:       '🟡 Retry Recommended',
      investigate_error:       '🔴 Error — Investigate',
    }
    lines.push(`## Action Required`)
    lines.push('')
    lines.push(`**${actionLabel[s.next_action] ?? s.next_action}**`)
    lines.push('')
  }

  // Changed Files
  lines.push(`## Changed Files`)
  lines.push('')
  if (s.changed_files.length > 0) {
    for (const f of s.changed_files) lines.push(`- \`${f}\``)
  } else {
    lines.push('_(none)_')
  }
  lines.push('')

  // Review Results
  if (s.review_results.length > 0) {
    lines.push(`## Review Results`)
    lines.push('')
    lines.push('| Tier | Outcome | Confidence | Latency | Escalated |')
    lines.push('|------|---------|------------|---------|-----------|')
    for (const r of s.review_results) {
      const conf = r.confidence !== undefined ? r.confidence.toFixed(2) : '—'
      const lat  = r.latency_ms !== undefined ? `${r.latency_ms}ms` : '—'
      const esc  = r.escalated ? 'yes' : 'no'
      lines.push(`| ${r.tier} | ${r.outcome} | ${conf} | ${lat} | ${esc} |`)
    }
    lines.push('')
  }

  // Bash Commands
  if (s.bash_commands_executed.length > 0) {
    lines.push(`## Validation Commands Executed`)
    lines.push('')
    for (const c of s.bash_commands_executed) lines.push(`- \`${c}\``)
    lines.push('')
  }

  // Stats
  lines.push(`## Stats`)
  lines.push('')
  lines.push(`- Retries: ${s.retry_count}`)
  lines.push(`- Escalations: ${s.escalation_count}`)
  lines.push(`- Human Approval Required: ${s.human_approval_required ? 'yes' : 'no'}`)
  lines.push('')

  // Errors
  if (s.errors.length > 0) {
    lines.push(`## Errors`)
    lines.push('')
    for (const e of s.errors) lines.push(`- ${e}`)
    lines.push('')
  }

  // Next Action
  lines.push(`## Next Action`)
  lines.push('')
  lines.push(`\`${s.next_action}\``)
  lines.push('')

  return lines.join('\n')
}

// ─── Writer ───────────────────────────────────────────────────────────────────

export function writeRunSummary(
  summary: RunSummaryJson,
  outputDir = 'system/reports/runs',
): { jsonPath: string; mdPath: string } {
  const absDir = path.resolve(process.cwd(), outputDir)
  if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true })

  const base     = path.join(absDir, summary.run_id)
  const jsonPath = `${base}-summary.json`
  const mdPath   = `${base}-summary.md`

  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8')
  fs.writeFileSync(mdPath,   renderMarkdown(summary),           'utf8')

  return { jsonPath, mdPath }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage:')
    console.log('  npx tsx system/reports/run-summary-generator.ts <run_id>')
    console.log('  npx tsx system/reports/run-summary-generator.ts --all')
    process.exit(0)
  }

  if (args[0] === '--all') {
    const state = readJson<any>('system/state/runtime_state.json')
    const runIds: string[] = (state?.active_runs ?? [])
      .filter((r: any) => r.status !== 'running')
      .map((r: any) => r.run_id as string)

    console.log(`Generating summaries for ${runIds.length} runs...`)
    let generated = 0
    for (const runId of runIds) {
      const summary = generateRunSummary(runId)
      if (!summary) { console.log(`  SKIP ${runId} — not found`); continue }
      const { jsonPath, mdPath } = writeRunSummary(summary)
      console.log(`  ✓ ${runId} → ${path.basename(jsonPath)}, ${path.basename(mdPath)}`)
      generated++
    }
    console.log(`\nDone. ${generated}/${runIds.length} summaries generated.`)
    return
  }

  const runId = args[0]
  const summary = generateRunSummary(runId)
  if (!summary) {
    console.error(`Run not found in runtime_state.json: ${runId}`)
    process.exit(1)
  }

  const { jsonPath, mdPath } = writeRunSummary(summary)
  console.log(`✓ Summary written:`)
  console.log(`  JSON: ${jsonPath}`)
  console.log(`  MD:   ${mdPath}`)
  console.log()
  console.log(renderMarkdown(summary))
}

// Nur als CLI ausführen wenn direkt aufgerufen
const isMain = process.argv[1]?.includes('run-summary-generator')
if (isMain) {
  main().catch(err => { console.error(err); process.exit(1) })
}
