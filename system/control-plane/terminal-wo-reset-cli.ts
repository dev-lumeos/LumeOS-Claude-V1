/**
 * Terminal Workorder Reset CLI — Operator-Tooling (WO-governance-010)
 *
 * Sichere CLI zum Anzeigen und gezielten Entfernen stale terminaler
 * active_workorders-Einträge aus runtime_state.json. Mutationen laufen
 * AUSSCHLIESSLICH über state-manager.ts; Audit-Events AUSSCHLIESSLICH
 * über audit-writer.ts. Kein direkter JSON/JSONL-Edit.
 *
 * Sub-Commands:
 *   list                                                — read-only Liste
 *   show <workorder_id>                                 — read-only Detail
 *   clear <workorder_id> --run-id <run_id> --dry-run    — Vorschau (default)
 *   clear <workorder_id> --run-id <run_id> --confirm    — Mutation + Audit
 *
 * Exit-Code-Schema:
 *   0 — Erfolg / read-only OK
 *   1 — usage error / refusal / unsafe
 *   2 — no exact match found
 *
 * Sicherheits-Garantien:
 *   - Default-Modus von 'clear' = --dry-run (sicher).
 *   - Mutation NUR mit --confirm.
 *   - Pflicht-Argumente <workorder_id> UND --run-id <run_id>.
 *   - Clearable Status NUR 'failed' und 'done'.
 *   - Non-terminal Status (queued/dispatched/running/review/awaiting_approval)
 *     werden refused.
 *   - Kein --force / --all / --bypass / --skip-validator Flag.
 *   - Audit-Event NUR vor erfolgreicher --confirm-Mutation; Dry-Run schreibt KEIN Audit.
 *   - Kein Eingriff in scope_locks, system_stop, approval queue, Workorders.
 */

import {
  getAllActiveWorkorders,
  getOrchestrationMode,
  removeTerminalActiveWorkorder,
  type ActiveWorkorder,
} from '../state/state-manager'
import { auditTerminalWorkorderReset } from '../state/audit-writer'

// ─── Args ────────────────────────────────────────────────────────────────────

interface ClearArgs {
  workorderId: string
  runId:       string
  mode:        'dry-run' | 'confirm'
}

interface ParseError {
  message: string
}

function parseClearArgs(argv: string[]): ClearArgs | ParseError {
  // argv: <workorder_id> [--run-id <run_id>] [--dry-run | --confirm]
  let workorderId: string | undefined
  let runId:       string | undefined
  let dryRun  = false
  let confirm = false

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--run-id') {
      runId = argv[++i]
      continue
    }
    if (a === '--dry-run')  { dryRun  = true; continue }
    if (a === '--confirm')  { confirm = true; continue }
    if (a.startsWith('--')) {
      return { message: `unknown flag: ${a}` }
    }
    if (workorderId === undefined) {
      workorderId = a
      continue
    }
    return { message: `unexpected positional argument: ${a}` }
  }

  if (!workorderId) return { message: 'missing <workorder_id>' }
  if (!runId)       return { message: 'missing --run-id <run_id>' }
  if (dryRun && confirm) return { message: 'cannot use --dry-run and --confirm together' }

  // Default sicher: ohne explizites Flag = dry-run.
  const mode: 'dry-run' | 'confirm' = confirm ? 'confirm' : 'dry-run'
  return { workorderId, runId, mode }
}

// ─── Output Helpers ──────────────────────────────────────────────────────────

function printHelp(): void {
  console.log(`Usage:
  terminal-wo-reset-cli list
  terminal-wo-reset-cli show <workorder_id>
  terminal-wo-reset-cli clear <workorder_id> --run-id <run_id> [--dry-run | --confirm]

Default for 'clear' without flag is --dry-run (safe). Mutation requires --confirm.

Clearable terminal statuses: failed, done.
Refused non-terminal statuses: queued, dispatched, running, review, awaiting_approval.

Exit codes:
  0 = success / read-only OK
  1 = usage error / refusal / unsafe request
  2 = no exact match found`)
}

function formatEntry(e: ActiveWorkorder): string {
  return `  ${e.workorder_id.padEnd(28)} run_id=${e.run_id ?? '<none>'} status=${e.status} agent=${e.agent_id} dispatched_at=${e.dispatched_at}`
}

// ─── Sub-Commands ────────────────────────────────────────────────────────────

function cmdList(): number {
  const all = getAllActiveWorkorders()
  if (all.length === 0) {
    console.log('No active_workorders entries.')
    return 0
  }
  const groups = new Map<ActiveWorkorder['status'], ActiveWorkorder[]>()
  for (const w of all) {
    const arr = groups.get(w.status) ?? []
    arr.push(w)
    groups.set(w.status, arr)
  }
  console.log(`active_workorders (${all.length} entries, grouped by status):`)
  const orderedStatuses: ActiveWorkorder['status'][] = [
    'queued', 'dispatched', 'running', 'review', 'awaiting_approval', 'done', 'failed',
  ]
  for (const s of orderedStatuses) {
    const arr = groups.get(s)
    if (!arr || arr.length === 0) continue
    const clearable = (s === 'failed' || s === 'done') ? ' [clearable]' : ' [non-terminal — refused for clear]'
    console.log(`\n[${s}] (${arr.length})${clearable}`)
    for (const e of arr) console.log(formatEntry(e))
  }
  return 0
}

function cmdShow(workorderId: string | undefined): number {
  if (!workorderId) {
    console.error('Error: missing <workorder_id> for show')
    printHelp()
    return 1
  }
  const matches = getAllActiveWorkorders().filter(w => w.workorder_id === workorderId)
  if (matches.length === 0) {
    console.error(`No active_workorders entry found for workorder_id=${workorderId}`)
    return 2
  }
  console.log(`Found ${matches.length} entry/entries for workorder_id=${workorderId}:`)
  for (const m of matches) {
    console.log(JSON.stringify(m, null, 2))
  }
  return 0
}

async function cmdClear(rest: string[]): Promise<number> {
  const parsed = parseClearArgs(rest)
  if ('message' in parsed) {
    console.error(`Error: ${parsed.message}`)
    printHelp()
    return 1
  }
  const { workorderId, runId, mode } = parsed

  const matches = getAllActiveWorkorders().filter(
    w => w.workorder_id === workorderId && w.run_id === runId,
  )

  if (matches.length === 0) {
    console.error(`No match for workorder_id=${workorderId} run_id=${runId}`)
    return 2
  }
  if (matches.length > 1) {
    console.error(`Refused: ambiguous match (${matches.length} entries) for workorder_id=${workorderId} run_id=${runId}`)
    return 1
  }

  const target = matches[0]
  const isTerminal = target.status === 'failed' || target.status === 'done'

  if (!isTerminal) {
    console.error(`Refused: non-terminal status '${target.status}' for workorder_id=${workorderId} run_id=${runId}`)
    console.error('Clearable statuses are only: failed, done')
    return 1
  }

  if (mode === 'dry-run') {
    console.log(`[DRY-RUN] Would remove 1 entry:`)
    console.log(formatEntry(target))
    console.log('No state mutation performed. No audit event written.')
    console.log('Use --confirm to actually remove this entry.')
    return 0
  }

  // mode === 'confirm' — Mutation + Audit
  // Audit-Event VOR der Mutation schreiben (so dass Audit auch dann existiert,
  // falls die Mutation atomisch fehlschlägt). audit-writer.ts schreibt über
  // appendFileSync — kein direkter JSONL-Edit hier im CLI.
  const operator = process.env.LUMEOS_OPERATOR ?? 'operator'
  auditTerminalWorkorderReset({
    run_id:             runId,
    workorder_id:       workorderId,
    agent_id:           target.agent_id,
    orchestration_mode: getOrchestrationMode(),
    reason:             `operator-initiated cleanup of terminal active_workorders entry; previous_status=${target.status}`,
    approved_by:        operator,
  })

  const outcome = await removeTerminalActiveWorkorder(workorderId, runId)
  if (outcome.removed) {
    console.log(`Removed 1 active_workorders entry:`)
    console.log(formatEntry(target))
    console.log(`Audit event 'terminal_workorder_reset' written to system/state/audit.jsonl.`)
    return 0
  }
  // Race-Condition-Schutz: wenn outcome.removed===false trotz vorigem Match,
  // ist zwischen Match-Check und Mutation etwas geändert worden.
  if (outcome.reason === 'no match') {
    console.error(`Race: entry vanished between check and mutation (workorder_id=${workorderId} run_id=${runId})`)
    return 2
  }
  console.error(`Refused by state-manager: ${outcome.reason ?? 'unknown'}`)
  return 1
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<number> {
  const argv = process.argv.slice(2)
  const sub  = argv[0]
  const rest = argv.slice(1)

  if (!sub) {
    printHelp()
    return 1
  }

  switch (sub) {
    case 'list':  return cmdList()
    case 'show':  return cmdShow(rest[0])
    case 'clear': return await cmdClear(rest)
    case '--help':
    case '-h':
    case 'help':
      printHelp()
      return 0
    default:
      console.error(`Unknown sub-command: ${sub}`)
      printHelp()
      return 1
  }
}

main()
  .then(code => process.exit(code))
  .catch(err => {
    console.error(`Unhandled error: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  })
