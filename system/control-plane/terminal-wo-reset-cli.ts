/**
 * Terminal Workorder Reset CLI — Operator-Tooling (WO-governance-010 + WO-governance-015)
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
 *   clear-stale-dispatched <workorder_id> --run-id <run_id> [--older-than-minutes <N>] [--dry-run | --confirm]
 *                                                       — WO-015: evidence-gated
 *                                                         Cleanup historisch-stuck
 *                                                         dispatched-Einträge.
 *
 * Exit-Code-Schema (für ALLE Sub-Commands):
 *   0 — Erfolg / read-only OK
 *   1 — usage error / refusal / unsafe
 *   2 — no exact match found
 *
 * Sicherheits-Garantien:
 *   - Default-Modus von 'clear' und 'clear-stale-dispatched' = --dry-run (sicher).
 *   - Mutation NUR mit --confirm.
 *   - Pflicht-Argumente <workorder_id> UND --run-id <run_id>.
 *   - 'clear': Clearable Status NUR 'failed' und 'done' (WO-010, unverändert).
 *   - 'clear-stale-dispatched': Clearable Status NUR 'dispatched' MIT Evidence
 *     (WO-015, separater Sub-Command). active_run.status 'running' und
 *     'awaiting_approval' werden hart abgelehnt.
 *   - Kein --force / --all / --bypass / --skip-validator Flag.
 *   - Kein Wildcard, kein broad cleanup.
 *   - Audit-Event NUR vor erfolgreicher --confirm-Mutation; Dry-Run schreibt KEIN Audit.
 *   - 'clear-stale-dispatched' schreibt Audit-Event 'stale_dispatched_workorder_cleanup'
 *     (NICHT 'terminal_workorder_reset' — Forensic-Differenzierung).
 *   - Kein Eingriff in scope_locks, system_stop, approval queue, active_runs
 *     (read-only Lookup), Workorders.
 */

import {
  getActiveRunByRunId,
  getAllActiveWorkorders,
  getOrchestrationMode,
  evaluateExpiredAwaitingApprovalCleanup,
  removeExpiredAwaitingApprovalActiveWorkorder,
  removeStaleDispatchedActiveWorkorder,
  removeTerminalActiveWorkorder,
  type ActiveWorkorder,
  type ExpiredAwaitingApprovalCleanupResult,
  type StaleDispatchedEvidenceKind,
} from '../state/state-manager'
import {
  auditExpiredApprovalWorkorderReset,
  auditStaleDispatchedWorkorderCleanup,
  auditTerminalWorkorderReset,
} from '../state/audit-writer'

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
  terminal-wo-reset-cli clear-stale-dispatched <workorder_id> --run-id <run_id> [--older-than-minutes <N>] [--dry-run | --confirm]
  terminal-wo-reset-cli clear-expired-approval <workorder_id> --run-id <run_id> [--dry-run | --confirm]

Default for mutating commands without flag is --dry-run (safe).
Mutation requires --confirm.

clear (WO-010):
  Clearable terminal statuses: failed, done.
  Refused non-terminal statuses: queued, dispatched, running, review, awaiting_approval.
  Audit event: 'terminal_workorder_reset'.

clear-stale-dispatched (WO-015):
  Clearable status: dispatched (only) — historically-stuck entries with proof of staleness.
  Stale evidence (one of):
    1. active_runs entry for the same run_id is terminal (completed/failed/blocked).
    2. No active_runs entry for run_id AND dispatched_at older than --older-than-minutes <N>
       (default 60 min if --older-than-minutes is omitted).
    3. --older-than-minutes <N> explicitly given AND age > N min AND active_run not running/awaiting.
  Hard refusal if active_run.status is 'running' or 'awaiting_approval'.
  Audit event: 'stale_dispatched_workorder_cleanup' (separate from terminal_workorder_reset).

clear-expired-approval:
  Clearable status: awaiting_approval (only) with evidence that the dispatcher
  approval is no longer usable: expired, consumed, denied, or missing while no
  pending/granted usable runtime/queue approval remains.
  Hard refusal if a usable granted token exists, a pending approval exists, or
  scope/db_migration lock for the run is still active.
  Audit event: 'expired_approval_workorder_reset'.

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

// ─── Sub-Command: clear-stale-dispatched (WO-015) ────────────────────────────

interface ClearStaleArgs {
  workorderId:      string
  runId:            string
  mode:             'dry-run' | 'confirm'
  olderThanMinutes: number | undefined  // explicit operator threshold (optional)
}

function parseClearStaleArgs(argv: string[]): ClearStaleArgs | ParseError {
  let workorderId:      string | undefined
  let runId:            string | undefined
  let olderThanMinutes: number | undefined
  let dryRun  = false
  let confirm = false

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--run-id') {
      runId = argv[++i]
      continue
    }
    if (a === '--older-than-minutes') {
      const next = argv[++i]
      if (next === undefined) {
        return { message: '--older-than-minutes requires a numeric argument' }
      }
      const n = Number(next)
      if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
        return { message: `--older-than-minutes must be a positive integer, got: ${next}` }
      }
      olderThanMinutes = n
      continue
    }
    if (a === '--dry-run') { dryRun  = true; continue }
    if (a === '--confirm') { confirm = true; continue }
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

  const mode: 'dry-run' | 'confirm' = confirm ? 'confirm' : 'dry-run'
  return { workorderId, runId, mode, olderThanMinutes }
}

const STALE_DEFAULT_AGE_MIN = 60

interface EvidenceSelection {
  kind:        StaleDispatchedEvidenceKind
  ageMinutes?: number
  detail:      string  // human-readable description for output / audit reason
}

/**
 * Wählt die Evidence-Kind-Markierung anhand des aktuellen States. Die
 * tatsächliche Verifikation übernimmt removeStaleDispatchedActiveWorkorder
 * (state-of-the-world-Prüfung); CLI bestimmt nur die Default-Klassifikation
 * für Dry-Run-Output und Audit-Reason.
 *
 * Priorität:
 *   1. operator_threshold — falls --older-than-minutes explizit gesetzt ist.
 *   2. active_run_terminal — falls active_run mit run_id existiert UND
 *      Status terminal (completed/failed/blocked).
 *   3. no_active_run_and_age — sonst (Default-Schwelle 60 min).
 */
function selectEvidence(
  target: ActiveWorkorder,
  runId: string,
  olderThanMinutes: number | undefined,
): EvidenceSelection {
  const run = getActiveRunByRunId(runId)
  const ageMs = Date.now() - Date.parse(target.dispatched_at)
  const ageMin = Math.floor(ageMs / 60000)

  if (olderThanMinutes !== undefined) {
    return {
      kind:        'operator_threshold',
      ageMinutes:  olderThanMinutes,
      detail:      `operator_threshold: age=${ageMin}min, threshold=${olderThanMinutes}min, active_run=${run?.status ?? 'none'}`,
    }
  }
  if (run && (run.status === 'completed' || run.status === 'failed' || run.status === 'blocked')) {
    return {
      kind:   'active_run_terminal',
      detail: `active_run_terminal: run.status=${run.status}, age=${ageMin}min`,
    }
  }
  return {
    kind:        'no_active_run_and_age',
    ageMinutes:  STALE_DEFAULT_AGE_MIN,
    detail:      `no_active_run_and_age: age=${ageMin}min, threshold=${STALE_DEFAULT_AGE_MIN}min, active_run=${run?.status ?? 'none'}`,
  }
}

async function cmdClearStaleDispatched(rest: string[]): Promise<number> {
  const parsed = parseClearStaleArgs(rest)
  if ('message' in parsed) {
    console.error(`Error: ${parsed.message}`)
    printHelp()
    return 1
  }
  const { workorderId, runId, mode, olderThanMinutes } = parsed

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
  if (target.status !== 'dispatched') {
    console.error(`Refused: status is '${target.status}', not 'dispatched'.`)
    if (target.status === 'failed' || target.status === 'done') {
      console.error(`Hint: use 'clear ${workorderId} --run-id ${runId} --confirm' (WO-010 path) for failed/done entries.`)
    }
    return 1
  }

  const run = getActiveRunByRunId(runId)
  if (run && run.status === 'running') {
    console.error(`Refused: active_run is still 'running' for run_id=${runId}. Cleanup not safe.`)
    return 1
  }
  if (run && run.status === 'awaiting_approval') {
    console.error(`Refused: active_run is 'awaiting_approval' for run_id=${runId}. Cleanup not safe.`)
    return 1
  }

  const evidence = selectEvidence(target, runId, olderThanMinutes)

  if (mode === 'dry-run') {
    // Vorschau; State-Manager-Funktion wird NICHT aufgerufen → keine Mutation.
    // Die Evidence-Verifikation findet trotzdem read-only statt: wir simulieren
    // den Refusal-Pfad durch eine separate Probe-Berechnung.
    const ageMs = Date.now() - Date.parse(target.dispatched_at)
    const ageMin = Math.floor(ageMs / 60000)
    let evidenceOk = false
    let evidenceWhy = ''
    switch (evidence.kind) {
      case 'active_run_terminal':
        evidenceOk = !!run && (run.status === 'completed' || run.status === 'failed' || run.status === 'blocked')
        evidenceWhy = evidence.detail
        break
      case 'no_active_run_and_age':
        evidenceOk = !run && ageMs > (evidence.ageMinutes ?? STALE_DEFAULT_AGE_MIN) * 60 * 1000
        evidenceWhy = evidence.detail
        break
      case 'operator_threshold':
        evidenceOk = (evidence.ageMinutes !== undefined) && ageMs > evidence.ageMinutes * 60 * 1000
        evidenceWhy = evidence.detail
        break
    }
    if (!evidenceOk) {
      console.error(`[DRY-RUN] Refused: evidence insufficient — ${evidenceWhy}`)
      return 1
    }
    console.log(`[DRY-RUN] Would remove 1 stale-dispatched entry:`)
    console.log(formatEntry(target))
    console.log(`Evidence: ${evidenceWhy} (kind=${evidence.kind}, age=${ageMin}min)`)
    console.log('No state mutation performed. No audit event written.')
    console.log('Use --confirm to actually remove this entry.')
    return 0
  }

  // mode === 'confirm' — Audit BEFORE Mutation.
  const operator = process.env.LUMEOS_OPERATOR ?? 'operator'
  auditStaleDispatchedWorkorderCleanup({
    run_id:             runId,
    workorder_id:       workorderId,
    agent_id:           target.agent_id,
    orchestration_mode: getOrchestrationMode(),
    reason:             `operator-initiated cleanup of stale dispatched active_workorders entry; ${evidence.detail}`,
    approved_by:        operator,
  })

  const outcome = await removeStaleDispatchedActiveWorkorder(workorderId, runId, {
    kind:       evidence.kind,
    ageMinutes: evidence.ageMinutes,
  })

  if (outcome.removed) {
    console.log(`Removed 1 stale-dispatched active_workorders entry:`)
    console.log(formatEntry(target))
    console.log(`Evidence: ${outcome.reason ?? evidence.detail}`)
    console.log(`Audit event 'stale_dispatched_workorder_cleanup' written to system/state/audit.jsonl.`)
    return 0
  }
  if (outcome.reason === 'no match') {
    console.error(`Race: entry vanished between check and mutation (workorder_id=${workorderId} run_id=${runId})`)
    return 2
  }
  console.error(`Refused by state-manager: ${outcome.reason ?? 'unknown'}`)
  return 1
}

// ─── Main ────────────────────────────────────────────────────────────────────

function describeExpiredApprovalOutcome(outcome: ExpiredAwaitingApprovalCleanupResult): string {
  const parts = [
    outcome.approvalId ? `approval_id=${outcome.approvalId}` : 'approval_id=<none>',
    outcome.tokenStatus ? `token_status=${outcome.tokenStatus}` : undefined,
    outcome.tokenExpiresAt ? `token_expires_at=${outcome.tokenExpiresAt}` : undefined,
    outcome.reason ? `reason=${outcome.reason}` : undefined,
  ].filter(Boolean)
  return parts.join(', ')
}

async function cmdClearExpiredApproval(rest: string[]): Promise<number> {
  const parsed = parseClearArgs(rest)
  if ('message' in parsed) {
    console.error(`Error: ${parsed.message}`)
    printHelp()
    return 1
  }
  const { workorderId, runId, mode } = parsed

  const evaluation = evaluateExpiredAwaitingApprovalCleanup(workorderId, runId)
  if (!evaluation.entry && evaluation.reason === 'no match') {
    console.error(`No match for workorder_id=${workorderId} run_id=${runId}`)
    return 2
  }
  if (!evaluation.removed) {
    console.error(`Refused: ${evaluation.reason ?? 'cleanup not safe'}`)
    if (evaluation.entry) console.error(formatEntry(evaluation.entry))
    return 1
  }

  const target = evaluation.entry
  if (!target) {
    console.error(`No match for workorder_id=${workorderId} run_id=${runId}`)
    return 2
  }

  if (mode === 'dry-run') {
    console.log(`[DRY-RUN] Would remove 1 expired-approval awaiting_approval entry:`)
    console.log(formatEntry(target))
    console.log(`Evidence: ${describeExpiredApprovalOutcome(evaluation)}`)
    console.log('No state mutation performed. No audit event written.')
    console.log('Use --confirm to actually remove this entry.')
    return 0
  }

  const operator = process.env.LUMEOS_OPERATOR ?? 'operator'
  auditExpiredApprovalWorkorderReset({
    run_id:             runId,
    workorder_id:       workorderId,
    agent_id:           target.agent_id,
    orchestration_mode: getOrchestrationMode(),
    approval_id:        evaluation.approvalId,
    reason:             `operator-initiated cleanup of expired/unusable approval awaiting_approval active_workorders entry; previous_status=${target.status}; ${describeExpiredApprovalOutcome(evaluation)}`,
    approved_by:        operator,
  })

  const outcome = await removeExpiredAwaitingApprovalActiveWorkorder(workorderId, runId)
  if (outcome.removed) {
    console.log(`Removed 1 expired-approval awaiting_approval active_workorders entry:`)
    console.log(formatEntry(target))
    console.log(`Evidence: ${describeExpiredApprovalOutcome(outcome)}`)
    console.log(`Audit event 'expired_approval_workorder_reset' written to system/state/audit.jsonl.`)
    return 0
  }
  if (outcome.reason === 'no match') {
    console.error(`Race: entry vanished between check and mutation (workorder_id=${workorderId} run_id=${runId})`)
    return 2
  }
  console.error(`Refused by state-manager: ${outcome.reason ?? 'unknown'}`)
  return 1
}

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
    case 'clear-stale-dispatched': return await cmdClearStaleDispatched(rest)
    case 'clear-expired-approval': return await cmdClearExpiredApproval(rest)
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
