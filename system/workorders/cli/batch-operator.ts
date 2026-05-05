import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

import {
  formatDryRunReport,
  loadBatch,
  runDispatch,
  type LoadedBatch,
  type LoadedWorkorder,
  type DispatchOutcome,
} from './batch-loader'
import { evaluateStopRules } from '../../control-plane/stop-rules'
import type {
  ActiveWorkorder,
  ApprovalItem,
  DbMigrationLock,
  Run,
  ScopeLock,
  SystemStop,
} from '../../state/state-manager'
import { getAllApprovals, type ApprovalQueueItem } from '../../approval/approval-queue'

export type OperatorEndState =
  | 'READY_TO_RUN'
  | 'NEEDS_TOM_APPROVAL'
  | 'NEEDS_SAFE_CLEANUP'
  | 'FIX_REQUIRED'
  | 'STOP_RULE_BLOCKED'
  | 'DONE'

export type ApprovalClassification =
  | 'SAFE_TO_REVIEW'
  | 'NEEDS_HUMAN_SQL_REVIEW'
  | 'DO_NOT_GRANT'
  | 'CONTENT_NOT_VISIBLE'

export interface GitStatusEntry {
  code: string
  path: string
  category: 'code_changes' | 'workorder_outputs' | 'runtime_audit_artifacts' | 'ignored_state_artifacts' | 'report_outputs'
}

export interface GitStatusSummary {
  branch: string
  short: string
  entries: GitStatusEntry[]
}

export interface CleanupSuggestion {
  kind: 'terminal_active_workorder' | 'stale_dispatched' | 'expired_approval'
  workorderId: string
  runId: string
  approvalId?: string
  safeToApply: boolean
  why: string
  dryRunCommand: string
  confirmCommand: string
}

export interface ApprovalStop {
  approvalId: string
  workorderId: string
  runId: string
  agent: string
  riskCategory: string
  action: string
  affectedFiles: string[]
  operation?: string
  classification: ApprovalClassification
  grantCommand: string
}

export interface ExpectedOutputStatus {
  path: string
  exists: boolean
}

export interface WorkorderCompletion {
  workorderId: string
  complete: boolean
  expectedOutputs: ExpectedOutputStatus[]
}

export interface OperatorStatus {
  batchPath: string
  batchWorkorderIds: string[]
  git: GitStatusSummary
  systemStop: { active: boolean; detail?: SystemStop }
  stopRules: {
    anyTriggered: boolean
    systemAlreadyStopped: boolean
    triggeredRules: string[]
    dryRunResult: string
  }
  failedRunsBaseline: { status: 'SET' | 'MISSING'; detail?: string }
  invalidJsonBaseline: { status: 'SET' | 'MISSING'; detail?: string }
  scopeLocks: ScopeLock[]
  dbMigrationLock: { locked: boolean; detail?: DbMigrationLock }
  activeWorkorders: ActiveWorkorder[]
  activeRuns: Run[]
  workorderCompletions: WorkorderCompletion[]
  relatedApprovals: Array<ApprovalQueueItem | ApprovalItem>
  approvalStops: ApprovalStop[]
  cleanupSuggestions: CleanupSuggestion[]
  dirtyArtifacts: GitStatusEntry[]
  unexpectedDirty: GitStatusEntry[]
  dispatchOutcomes?: DispatchOutcome[]
}

export interface CommandResult {
  code: number
  stdout: string
  stderr: string
}

export type CommandRunner = (command: string) => CommandResult | Promise<CommandResult>

interface RuntimeStateFile {
  active_runs?: Run[]
  active_workorders?: ActiveWorkorder[]
  approvals?: ApprovalItem[]
  scope_locks?: ScopeLock[]
  db_migration_lock?: DbMigrationLock | null
  system_stop?: SystemStop | null
  stop_rule_baselines?: {
    failed_runs_threshold?: { acknowledged_at?: string; acknowledged_by?: string }
    invalid_json_spike?: { acknowledged_at?: string; acknowledged_by?: string }
  }
}

const TSX = 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs'
const RESET_CLI = 'system\\control-plane\\terminal-wo-reset-cli.ts'
const APPROVAL_CLI = 'system\\approval\\approval-cli.ts'
const BATCH_CLI = 'system\\workorders\\cli\\run-batch.ts'
const OPERATOR_CLI = 'system\\workorders\\cli\\run-batch-operator.ts'
const DOSSIER_CLI = 'system\\reports\\batch-dossier.ts'

function readJson<T>(relativePath: string, fallback: T): T {
  const absolute = path.resolve(process.cwd(), relativePath)
  if (!fs.existsSync(absolute)) return fallback
  try {
    return JSON.parse(fs.readFileSync(absolute, 'utf8')) as T
  } catch {
    return fallback
  }
}

function commandFor(script: string, args: string): string {
  return `${TSX} ${script} ${args}`.trim()
}

export function readGitStatus(): GitStatusSummary {
  const result = spawnSync('git', ['status', '--short', '--branch'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
  })
  const stdout = result.stdout ?? ''
  const lines = stdout.split(/\r?\n/).filter(Boolean)
  const branchLine = lines.find(line => line.startsWith('## ')) ?? '## (unknown)'
  const branch = branchLine.replace(/^##\s+/, '').split('...')[0].trim()
  const entries = lines
    .filter(line => !line.startsWith('## '))
    .map(parseGitEntry)
  return { branch, short: stdout.trim(), entries }
}

function parseGitEntry(line: string): GitStatusEntry {
  const code = line.slice(0, 2).trim() || '??'
  const filePath = line.slice(3).trim()
  return { code, path: filePath, category: categorizeArtifact(filePath) }
}

function categorizeArtifact(filePath: string): GitStatusEntry['category'] {
  const p = filePath.replace(/\\/g, '/')
  if (p.startsWith('system/state/') || p === 'system/approval/queue.json' || p === 'system/approval/approvals.json') {
    return 'ignored_state_artifacts'
  }
  if (p.includes('/audit/') || p.startsWith('system/reports/runs/') || p.startsWith('system/reports/dossiers/')) {
    return 'runtime_audit_artifacts'
  }
  if (p.startsWith('system/reports/')) return 'report_outputs'
  if (p.startsWith('docs/specs/') || p.startsWith('supabase/migrations/')) return 'workorder_outputs'
  return 'code_changes'
}

function batchWorkorderIds(batch: LoadedBatch): string[] {
  return batch.workorders
    .map(w => w.parsed.workorder_id)
    .filter((id): id is string => typeof id === 'string')
}

function isRelatedToBatch(item: { workorder_id?: string }, ids: Set<string>): boolean {
  return typeof item.workorder_id === 'string' && ids.has(item.workorder_id)
}

function isApprovalUsable(item: { status?: string; expires_at?: string }): boolean {
  if (item.status !== 'pending' && item.status !== 'granted') return false
  if (!item.expires_at) return true
  return new Date(item.expires_at).getTime() > Date.now()
}

function hasAnyActiveLockForRun(state: RuntimeStateFile, runId: string): boolean {
  const scopeLocked = (state.scope_locks ?? []).some(lock => lock.run_id === runId && new Date(lock.expires_at).getTime() > Date.now())
  const dbLocked = state.db_migration_lock?.run_id === runId && new Date(state.db_migration_lock.expires_at).getTime() > Date.now()
  return scopeLocked || dbLocked
}

function hasPendingApprovalForRun(approvals: Array<ApprovalQueueItem | ApprovalItem>, workorderId: string, runId: string): boolean {
  return approvals.some(a =>
    a.workorder_id === workorderId &&
    a.run_id === runId &&
    a.status === 'pending' &&
    isApprovalUsable(a),
  )
}

function findApprovalId(approvals: Array<ApprovalQueueItem | ApprovalItem>, workorderId: string, runId: string): string | undefined {
  return approvals.find(a => a.workorder_id === workorderId && a.run_id === runId)?.approval_id
}

function cleanupCommands(kind: CleanupSuggestion['kind'], workorderId: string, runId: string): Pick<CleanupSuggestion, 'dryRunCommand' | 'confirmCommand'> {
  const subcommand =
    kind === 'terminal_active_workorder'
      ? 'clear'
      : kind === 'stale_dispatched'
        ? 'clear-stale-dispatched'
        : 'clear-expired-approval'
  return {
    dryRunCommand: commandFor(RESET_CLI, `${subcommand} ${workorderId} --run-id ${runId} --dry-run`),
    confirmCommand: commandFor(RESET_CLI, `${subcommand} ${workorderId} --run-id ${runId} --confirm`),
  }
}

function buildCleanupSuggestions(
  state: RuntimeStateFile,
  ids: Set<string>,
  relatedApprovals: Array<ApprovalQueueItem | ApprovalItem>,
): CleanupSuggestion[] {
  const suggestions: CleanupSuggestion[] = []
  const relatedActive = (state.active_workorders ?? []).filter(w => ids.has(w.workorder_id))
  const counts = new Map<string, number>()
  for (const w of relatedActive) {
    const key = `${w.workorder_id}\0${w.run_id ?? ''}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const emitted = new Set<string>()
  for (const w of relatedActive) {
    const runId = w.run_id ?? ''
    const key = `${w.workorder_id}\0${runId}`
    if (emitted.has(key)) continue
    emitted.add(key)
    const ambiguous = (counts.get(key) ?? 0) > 1
    const run = (state.active_runs ?? []).find(r => r.run_id === runId)
    const pendingApproval = hasPendingApprovalForRun(relatedApprovals, w.workorder_id, runId)
    const lockActive = hasAnyActiveLockForRun(state, runId)
    const baseSafe = Boolean(runId) && !ambiguous && !pendingApproval && !lockActive

    if (w.status === 'failed' || w.status === 'done') {
      suggestions.push({
        kind: 'terminal_active_workorder',
        workorderId: w.workorder_id,
        runId,
        approvalId: findApprovalId(relatedApprovals, w.workorder_id, runId),
        safeToApply: baseSafe,
        why: ambiguous
          ? `unsafe: ambiguous active_workorders matches for ${w.workorder_id}/${runId}`
          : pendingApproval
            ? 'unsafe: pending approval exists'
            : lockActive
              ? 'unsafe: active scope/db migration lock exists'
              : `safe: active_workorder is terminal (${w.status}) and exact WO/run match exists`,
        ...cleanupCommands('terminal_active_workorder', w.workorder_id, runId),
      })
      continue
    }

    if (w.status === 'dispatched') {
      const runTerminal = run && (run.status === 'completed' || run.status === 'failed' || run.status === 'blocked')
      const missingRunOld = !run && Date.now() - Date.parse(w.dispatched_at) > 60 * 60_000
      if (runTerminal || missingRunOld || ambiguous) {
        suggestions.push({
          kind: 'stale_dispatched',
          workorderId: w.workorder_id,
          runId,
          approvalId: findApprovalId(relatedApprovals, w.workorder_id, runId),
          safeToApply: baseSafe && Boolean(runTerminal || missingRunOld),
          why: ambiguous
            ? `unsafe: ambiguous active_workorders matches for ${w.workorder_id}/${runId}`
            : pendingApproval
              ? 'unsafe: pending approval exists'
              : lockActive
                ? 'unsafe: active scope/db migration lock exists'
                : runTerminal
                  ? `safe: dispatched entry has terminal active_run status ${run.status}`
                  : 'safe: dispatched entry has no active_run and is older than 60 minutes',
          ...cleanupCommands('stale_dispatched', w.workorder_id, runId),
        })
      }
      continue
    }

    if (w.status === 'awaiting_approval') {
      const token = Object.values(readJson<Record<string, any>>('system/approval/approvals.json', {}))
        .find(t => t.workorder_id === w.workorder_id && t.run_id === runId)
      const tokenExpired = token?.expires_at && new Date(token.expires_at).getTime() <= Date.now()
      const tokenUnusable = token && token.status !== 'granted'
      const noTokenButNoUsableApproval = !token && !relatedApprovals.some(a => a.workorder_id === w.workorder_id && a.run_id === runId && isApprovalUsable(a))
      if (tokenExpired || tokenUnusable || noTokenButNoUsableApproval || ambiguous) {
        suggestions.push({
          kind: 'expired_approval',
          workorderId: w.workorder_id,
          runId,
          approvalId: findApprovalId(relatedApprovals, w.workorder_id, runId) ?? token?.approval_id,
          safeToApply: baseSafe && Boolean(tokenExpired || tokenUnusable || noTokenButNoUsableApproval),
          why: ambiguous
            ? `unsafe: ambiguous active_workorders matches for ${w.workorder_id}/${runId}`
            : pendingApproval
              ? 'unsafe: pending approval exists'
              : lockActive
                ? 'unsafe: active scope/db migration lock exists'
                : tokenExpired
                  ? 'safe: granted enforcement token is expired'
                  : tokenUnusable
                    ? `safe: enforcement token status is ${token.status}`
                    : 'safe: no usable approval token, runtime approval, or queue approval remains',
          ...cleanupCommands('expired_approval', w.workorder_id, runId),
        })
      }
    }
  }

  return suggestions
}

function classifyApproval(item: ApprovalQueueItem | ApprovalItem): ApprovalClassification {
  if (!item.proposed_action || item.proposed_action.length > 500) return 'CONTENT_NOT_VISIBLE'
  if (item.risk_category === 'db-migration' || item.operation === 'write_migration') return 'NEEDS_HUMAN_SQL_REVIEW'
  if (item.exact_command && /supabase\s+db\s+(push|reset)/i.test(item.exact_command)) return 'DO_NOT_GRANT'
  return 'SAFE_TO_REVIEW'
}

function buildApprovalStops(approvals: Array<ApprovalQueueItem | ApprovalItem>): ApprovalStop[] {
  return approvals
    .filter(item => item.status === 'pending' && isApprovalUsable(item))
    .map(item => ({
      approvalId: item.approval_id,
      workorderId: item.workorder_id,
      runId: item.run_id ?? '<missing>',
      agent: 'agent_id' in item ? item.agent_id : item.requested_by ?? '<unknown>',
      riskCategory: item.risk_category ?? '<unknown>',
      action: item.proposed_action ?? '<not visible>',
      affectedFiles: item.affected_files ?? [],
      operation: item.operation,
      classification: classifyApproval(item),
      grantCommand: commandFor(APPROVAL_CLI, `grant ${item.approval_id}`),
    }))
}

function baselineStatus(
  baseline: { acknowledged_at?: string; acknowledged_by?: string } | undefined,
): { status: 'SET' | 'MISSING'; detail?: string } {
  if (!baseline?.acknowledged_at) return { status: 'MISSING' }
  return { status: 'SET', detail: `${baseline.acknowledged_at} by ${baseline.acknowledged_by ?? 'unknown'}` }
}

function normalizeRepoPath(input: string): string {
  return input.replace(/\\/g, '/').replace(/^\.\//, '')
}

function pathExistsWithGlob(pattern: string): boolean {
  const normalized = normalizeRepoPath(pattern)
  if (!normalized.includes('*')) return fs.existsSync(path.resolve(process.cwd(), normalized))
  const slash = normalized.lastIndexOf('/')
  const dir = slash >= 0 ? normalized.slice(0, slash) : '.'
  const filePattern = slash >= 0 ? normalized.slice(slash + 1) : normalized
  const regex = new RegExp(`^${filePattern.split('*').map(escapeRegExp).join('.*')}$`)
  const absoluteDir = path.resolve(process.cwd(), dir)
  if (!fs.existsSync(absoluteDir)) return false
  return fs.readdirSync(absoluteDir).some(name => regex.test(name))
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function collectText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(collectText).join('\n')
  if (value && typeof value === 'object') return Object.values(value).map(collectText).join('\n')
  return ''
}

function inferExpectedOutputs(workorder: LoadedWorkorder): string[] {
  const parsed = workorder.parsed as Record<string, unknown>
  const scopeFiles = Array.isArray(parsed.scope_files)
    ? parsed.scope_files.filter((item): item is string => typeof item === 'string')
    : []
  const text = collectText(parsed)
  const outputs = new Set<string>()

  for (const scopeFile of scopeFiles) {
    const normalized = normalizeRepoPath(scopeFile)
    if (/\.(md|sql|ts)$/.test(normalized)) outputs.add(normalized)
  }

  const explicitPathPattern = /\b(?:docs|supabase|packages)\/[A-Za-z0-9_./-]+\.(?:md|sql|ts)\b/g
  for (const match of text.matchAll(explicitPathPattern)) {
    outputs.add(normalizeRepoPath(match[0]))
  }

  const hasMigrationScope = scopeFiles.some(scope => normalizeRepoPath(scope).replace(/\/$/, '') === 'supabase/migrations')
  if (hasMigrationScope) {
    if (text.includes('nutrition_schema_foundation.sql')) {
      outputs.add('supabase/migrations/*nutrition_schema_foundation.sql')
    }
    if (text.includes('nutrition_food_core_tables.sql')) {
      outputs.add('supabase/migrations/*nutrition_food_core_tables.sql')
    }
  }

  return [...outputs]
}

export function evaluateWorkorderCompletions(batch: LoadedBatch): WorkorderCompletion[] {
  return batch.workorders.map(workorder => {
    const workorderId = typeof workorder.parsed.workorder_id === 'string'
      ? workorder.parsed.workorder_id
      : workorder.filename
    const expectedOutputs = inferExpectedOutputs(workorder).map(outputPath => ({
      path: outputPath,
      exists: pathExistsWithGlob(outputPath),
    }))
    return {
      workorderId,
      expectedOutputs,
      complete: expectedOutputs.length > 0 && expectedOutputs.every(output => output.exists),
    }
  })
}

export function collectOperatorStatus(
  batchPathInput: string,
  opts: { gitStatus?: GitStatusSummary } = {},
): OperatorStatus {
  const absoluteBatchPath = path.resolve(batchPathInput)
  const batch = loadBatch(absoluteBatchPath)
  const ids = new Set(batchWorkorderIds(batch))
  const state = readJson<RuntimeStateFile>('system/state/runtime_state.json', {})
  const queueApprovals = getAllApprovals().filter(a => isRelatedToBatch(a, ids))
  const runtimeApprovals = (state.approvals ?? []).filter(a => isRelatedToBatch(a, ids))
  const relatedApprovals = dedupeApprovals([...queueApprovals, ...runtimeApprovals])
  const stopRules = evaluateStopRules()
  const git = opts.gitStatus ?? readGitStatus()

  const activeWorkorders = (state.active_workorders ?? []).filter(w => ids.has(w.workorder_id))
  const activeRuns = (state.active_runs ?? []).filter(r => ids.has(r.workorder_id))
  const workorderCompletions = evaluateWorkorderCompletions(batch)
  const expectedOutputPatterns = workorderCompletions.flatMap(w => w.expectedOutputs.map(o => o.path))
  const cleanupSuggestions = buildCleanupSuggestions(state, ids, relatedApprovals)

  return {
    batchPath: absoluteBatchPath,
    batchWorkorderIds: [...ids],
    git,
    systemStop: state.system_stop?.active ? { active: true, detail: state.system_stop } : { active: false },
    stopRules: {
      anyTriggered: stopRules.any_triggered,
      systemAlreadyStopped: stopRules.system_already_stopped,
      triggeredRules: stopRules.triggered_rules.map(r => r.rule),
      dryRunResult: stopRules.any_triggered ? `TRIGGERED: ${stopRules.triggered_rules.map(r => r.rule).join(', ')}` : 'OK',
    },
    failedRunsBaseline: baselineStatus(state.stop_rule_baselines?.failed_runs_threshold),
    invalidJsonBaseline: baselineStatus(state.stop_rule_baselines?.invalid_json_spike),
    scopeLocks: state.scope_locks ?? [],
    dbMigrationLock: state.db_migration_lock ? { locked: true, detail: state.db_migration_lock } : { locked: false },
    activeWorkorders,
    activeRuns,
    workorderCompletions,
    relatedApprovals,
    approvalStops: buildApprovalStops(relatedApprovals),
    cleanupSuggestions,
    dirtyArtifacts: git.entries,
    unexpectedDirty: git.entries.filter(e =>
      e.category === 'code_changes' &&
      !expectedOutputPatterns.some(pattern => matchesOutputPattern(e.path, pattern)),
    ),
  }
}

function matchesOutputPattern(filePath: string, pattern: string): boolean {
  const normalizedPath = normalizeRepoPath(filePath)
  const normalizedPattern = normalizeRepoPath(pattern)
  if (!normalizedPattern.includes('*')) return normalizedPath === normalizedPattern
  const regex = new RegExp(`^${normalizedPattern.split('*').map(escapeRegExp).join('.*')}$`)
  return regex.test(normalizedPath)
}

function dedupeApprovals<T extends ApprovalQueueItem | ApprovalItem>(approvals: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const approval of approvals) {
    const key = approval.approval_id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(approval)
  }
  return out
}

export function decideEndState(status: OperatorStatus): OperatorEndState {
  if (status.systemStop.active || status.stopRules.anyTriggered) return 'STOP_RULE_BLOCKED'
  if (status.approvalStops.length > 0) return 'NEEDS_TOM_APPROVAL'
  if (status.cleanupSuggestions.some(s => s.safeToApply)) return 'NEEDS_SAFE_CLEANUP'
  if (status.unexpectedDirty.length > 0) return 'FIX_REQUIRED'
  if (
    status.activeWorkorders.length === 0 &&
    status.workorderCompletions.length > 0 &&
    status.workorderCompletions.every(w => w.complete)
  ) return 'DONE'
  return 'READY_TO_RUN'
}

function formatJsonLine(value: unknown): string {
  return JSON.stringify(value)
}

function formatList<T>(items: T[], mapper: (item: T) => string): string[] {
  return items.length === 0 ? ['  (none)'] : items.map(item => `  ${mapper(item)}`)
}

export function buildOperatorReport(status: OperatorStatus): string {
  const endState = decideEndState(status)
  const lines: string[] = []
  lines.push('# Governance Batch Operator')
  lines.push(`Batch: ${status.batchPath}`)
  lines.push(`End state: ${endState}`)
  lines.push('')
  lines.push('## Status')
  lines.push(`current_branch: ${status.git.branch}`)
  lines.push(`git_status: ${status.git.short || '(clean)'}`)
  lines.push(`system_stop: ${status.systemStop.active ? formatJsonLine(status.systemStop.detail) : 'none'}`)
  lines.push(`stop-rules dry-run result: ${status.stopRules.dryRunResult}`)
  lines.push(`failed-runs baseline status: ${status.failedRunsBaseline.status}${status.failedRunsBaseline.detail ? ` (${status.failedRunsBaseline.detail})` : ''}`)
  lines.push(`invalid-json baseline status: ${status.invalidJsonBaseline.status}${status.invalidJsonBaseline.detail ? ` (${status.invalidJsonBaseline.detail})` : ''}`)
  lines.push(`scope_locks: ${status.scopeLocks.length}`)
  lines.push(`db_migration_lock: ${status.dbMigrationLock.locked ? formatJsonLine(status.dbMigrationLock.detail) : 'none'}`)
  lines.push('')
  lines.push('## Batch Runtime')
  lines.push('active_workorders related to batch:')
  lines.push(...formatList(status.activeWorkorders, w => `${w.workorder_id} run=${w.run_id ?? '<none>'} status=${w.status} agent=${w.agent_id}`))
  lines.push('active_runs related to batch:')
  lines.push(...formatList(status.activeRuns, r => `${r.workorder_id} run=${r.run_id} status=${r.status} agent=${r.agent_id}`))
  lines.push('pending/granted/consumed approvals related to batch:')
  lines.push(...formatList(status.relatedApprovals, a => `${a.approval_id} WO=${a.workorder_id} run=${a.run_id ?? '<none>'} status=${a.status} risk=${a.risk_category ?? '<unknown>'}`))
  lines.push('workorder output completion:')
  lines.push(...formatList(status.workorderCompletions, w => {
    const outputs = w.expectedOutputs.map(o => `${o.path}:${o.exists ? 'yes' : 'no'}`).join(', ')
    return `${w.workorderId} complete=${w.complete ? 'yes' : 'no'} outputs=[${outputs || 'none'}]`
  }))
  lines.push('')
  lines.push('## Modified/Untracked Artifacts')
  lines.push(...formatList(status.dirtyArtifacts, e => `${e.code} ${e.path} [${e.category}]`))

  lines.push('')
  lines.push('## Cleanup Suggestions')
  if (status.cleanupSuggestions.length === 0) {
    lines.push('  (none)')
  } else {
    for (const s of status.cleanupSuggestions) {
      lines.push(`- ${s.kind}: WO=${s.workorderId} run=${s.runId} approval=${s.approvalId ?? '<none>'}`)
      lines.push(`  why: ${s.why}`)
      lines.push(`  safe: ${s.safeToApply ? 'yes' : 'no'}`)
      lines.push(`  dry-run: ${s.dryRunCommand}`)
      lines.push(`  confirm: ${s.confirmCommand}`)
    }
  }

  lines.push('')
  lines.push('## Approval Stops')
  if (status.approvalStops.length === 0) {
    lines.push('  (none)')
  } else {
    for (const a of status.approvalStops) {
      lines.push(`- approval id: ${a.approvalId}`)
      lines.push(`  workorder id: ${a.workorderId}`)
      lines.push(`  run id: ${a.runId}`)
      lines.push(`  agent: ${a.agent}`)
      lines.push(`  risk category: ${a.riskCategory}`)
      lines.push(`  action: ${a.action}`)
      lines.push(`  affected files: ${a.affectedFiles.join(', ') || '(none)'}`)
      lines.push(`  classification: ${a.classification}`)
      lines.push(`  exact grant command: ${a.grantCommand}`)
      if (a.operation === 'write_migration') {
        lines.push('  write_migration note: grant only allows file write, not db push/reset; require post-write guard/review.')
      }
    }
  }

  lines.push('')
  lines.push('## Next')
  lines.push(`Exact next command: ${nextCommand(status, endState)}`)
  lines.push(`Doctor command: ${commandFor(OPERATOR_CLI, `${status.batchPath} --doctor`)}`)
  lines.push(`Suggested dossier: ${dossierCommand(status.batchPath)}`)
  return lines.join('\n')
}

function dossierCommand(batchPath: string): string {
  return commandFor(DOSSIER_CLI, `--batch ${batchPath}`)
}

function nextCommand(status: OperatorStatus, endState: OperatorEndState): string {
  if (endState === 'NEEDS_TOM_APPROVAL') return status.approvalStops[0]?.grantCommand ?? commandFor(APPROVAL_CLI, 'list')
  if (endState === 'NEEDS_SAFE_CLEANUP') return `${commandFor(OPERATOR_CLI, `${status.batchPath} --continue --apply-safe-cleanups`)}`
  if (endState === 'STOP_RULE_BLOCKED') return commandFor('system\\control-plane\\stop-rules.ts', '--dry-run')
  if (endState === 'FIX_REQUIRED') return 'git status --short --branch'
  if (endState === 'DONE') return commandFor(OPERATOR_CLI, `${status.batchPath} --status`)
  return commandFor(OPERATOR_CLI, `${status.batchPath} --continue`)
}

function isOfficialCleanupCommand(command: string): boolean {
  return command.includes(RESET_CLI) &&
    !command.includes(APPROVAL_CLI) &&
    !/supabase\s+db\s+(push|reset)/i.test(command)
}

export async function applySafeCleanups(
  status: OperatorStatus,
  runner: CommandRunner = runShellCommand,
): Promise<{ applied: CleanupSuggestion[]; refused: Array<{ suggestion: CleanupSuggestion; reason: string }> }> {
  const applied: CleanupSuggestion[] = []
  const refused: Array<{ suggestion: CleanupSuggestion; reason: string }> = []

  for (const suggestion of status.cleanupSuggestions) {
    if (!suggestion.safeToApply) {
      refused.push({ suggestion, reason: suggestion.why })
      continue
    }
    if (!isOfficialCleanupCommand(suggestion.dryRunCommand) || !isOfficialCleanupCommand(suggestion.confirmCommand)) {
      refused.push({ suggestion, reason: 'not an official cleanup command' })
      continue
    }
    const dry = await runner(suggestion.dryRunCommand)
    const combined = `${dry.stdout}\n${dry.stderr}`
    if (dry.code !== 0 || !/Would remove 1/.test(combined)) {
      refused.push({ suggestion, reason: `dry-run did not confirm exactly one target: ${combined.trim()}` })
      continue
    }
    const confirm = await runner(suggestion.confirmCommand)
    if (confirm.code !== 0) {
      refused.push({ suggestion, reason: `confirm failed: ${confirm.stderr || confirm.stdout}` })
      continue
    }
    applied.push(suggestion)
  }

  return { applied, refused }
}

export function runShellCommand(command: string): CommandResult {
  const result = spawnSync(command, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: true,
  })
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}

export async function runDryRun(batchPathInput: string): Promise<{ report: string; exitCode: number }> {
  const batch = loadBatch(batchPathInput)
  const hasSchemaErrors = batch.workorders.some(w => w.validationErrors.length > 0)
  return {
    report: formatDryRunReport(batch),
    exitCode: hasSchemaErrors ? 1 : 0,
  }
}

export function selectRunnableBatch(batchPathInput: string, status: OperatorStatus): LoadedBatch | null {
  const batch = loadBatch(batchPathInput)
  const incomplete = status.workorderCompletions.find(w => !w.complete)
  if (!incomplete) return null
  const workorder = batch.workorders.find(w => w.parsed.workorder_id === incomplete.workorderId)
  if (!workorder) return null
  const completed = new Set(
    status.workorderCompletions
      .filter(w => w.complete)
      .map(w => w.workorderId),
  )
  const blockedBy = Array.isArray(workorder.parsed.blocked_by)
    ? workorder.parsed.blocked_by.filter((blocker): blocker is string => typeof blocker === 'string')
    : []
  const unresolvedBlockers = blockedBy.filter(blocker => !completed.has(blocker))
  const runnableWorkorder: LoadedWorkorder = {
    ...workorder,
    parsed: {
      ...workorder.parsed,
      blocked_by: unresolvedBlockers,
    },
  }
  return {
    ...batch,
    entries: batch.entries.filter(entry => entry.workorder_id === incomplete.workorderId),
    workorders: [runnableWorkorder],
  }
}

export async function continueBatch(
  batchPathInput: string,
  opts: { applySafeCleanups?: boolean; runner?: CommandRunner } = {},
): Promise<{ status: OperatorStatus; report: string; exitCode: number }> {
  let status = collectOperatorStatus(batchPathInput)
  let endState = decideEndState(status)

  if (endState === 'NEEDS_SAFE_CLEANUP' && opts.applySafeCleanups) {
    const cleanup = await applySafeCleanups(status, opts.runner)
    status = collectOperatorStatus(batchPathInput)
    endState = decideEndState(status)
    const report = [
      `Applied safe cleanups: ${cleanup.applied.length}`,
      `Refused cleanups: ${cleanup.refused.length}`,
      buildOperatorReport(status),
    ].join('\n\n')
    return { status, report, exitCode: cleanup.refused.length > 0 ? 2 : endStateToExitCode(endState) }
  }

  if (endState !== 'READY_TO_RUN') {
    return { status, report: buildOperatorReport(status), exitCode: endStateToExitCode(endState) }
  }

  const runnableBatch = selectRunnableBatch(batchPathInput, status)
  if (!runnableBatch) {
    return { status, report: buildOperatorReport(status), exitCode: endStateToExitCode(decideEndState(status)) }
  }
  const outcomes = await runDispatch(runnableBatch)
  status = collectOperatorStatus(batchPathInput)
  status.dispatchOutcomes = outcomes
  const paused = outcomes.some(o => o.status === 'paused_for_approval')
  const failed = outcomes.some(o => o.status === 'failed' || o.status === 'preflight_blocked' || o.status === 'system_stopped')
  const report = [
    buildOperatorReport(status),
    '',
    '## Dispatch Outcomes',
    ...outcomes.map(o => `  ${o.workorder_id} [${o.status}] ${o.detail ?? ''}`),
  ].join('\n')
  return { status, report, exitCode: paused ? 3 : failed ? 2 : 0 }
}

function endStateToExitCode(endState: OperatorEndState): number {
  switch (endState) {
    case 'READY_TO_RUN':
    case 'DONE':
      return 0
    case 'NEEDS_TOM_APPROVAL':
      return 3
    case 'STOP_RULE_BLOCKED':
    case 'NEEDS_SAFE_CLEANUP':
    case 'FIX_REQUIRED':
      return 2
  }
}
