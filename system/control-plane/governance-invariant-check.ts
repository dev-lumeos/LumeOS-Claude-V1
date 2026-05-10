import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import {
  getProjectProfile,
  isRawLocalPath,
  isRuntimeArtifactPath,
  type ProjectProfile,
} from '../project-profiles/project-profile-loader'

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface GovernanceInvariantFinding {
  id: string
  severity: FindingSeverity
  layer: string
  message: string
  evidence: string
  suggested_action: string
  safe_cleanup_command?: string
  blocks_product_work: boolean
  blocks_operator: boolean
}

export interface GovernanceInvariantSummary {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export interface ProductWorkGate {
  status: 'blocked'
  reason: string
}

export interface GovernanceInvariantResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  project_profile?: {
    project_id: string
    display_name: string
  }
  hasHighOrCriticalFindings: boolean
  exitCode: 0 | 1 | 2
  summary: GovernanceInvariantSummary
  product_work_gate: ProductWorkGate
  findings: GovernanceInvariantFinding[]
}

export interface GitStatusEntry {
  code: string
  path: string
}

interface RuntimeStateFile {
  active_runs?: RunItem[]
  active_workorders?: ActiveWorkorderItem[]
  approvals?: ApprovalItem[]
  scope_locks?: ScopeLockItem[]
  db_migration_lock?: DbMigrationLockItem | null
  system_stop?: { active?: boolean; reason?: string; stopped_at?: string; stopped_by?: string } | null
  stop_rule_baselines?: {
    failed_runs_threshold?: { acknowledged_at?: string; acknowledged_by?: string }
    invalid_json_spike?: { acknowledged_at?: string; acknowledged_by?: string }
  }
}

interface RunItem {
  run_id: string
  workorder_id: string
  agent_id: string
  status: 'running' | 'completed' | 'failed' | 'blocked' | 'awaiting_approval'
  started_at?: string
  completed_at?: string
  ended_at?: string
  failed_at?: string
}

interface ActiveWorkorderItem {
  workorder_id: string
  run_id?: string
  agent_id: string
  status: 'queued' | 'dispatched' | 'running' | 'review' | 'awaiting_approval' | 'done' | 'failed'
  dispatched_at: string
}

interface ApprovalItem {
  approval_id: string
  workorder_id: string
  run_id?: string
  agent_id?: string
  requested_by?: string
  status: 'pending' | 'granted' | 'denied' | 'expired' | 'consumed'
  expires_at?: string
}

interface ApprovalToken {
  approval_id: string
  workorder_id: string
  run_id?: string
  agent_id?: string
  status: 'pending' | 'granted' | 'denied' | 'expired' | 'consumed'
  expires_at?: string
  single_use?: boolean
  use_count?: number
  max_uses?: number
}

interface ScopeLockItem {
  run_id: string
  scope_files?: string[]
  locked_at: string
  expires_at: string
}

interface DbMigrationLockItem {
  run_id: string
  locked_at: string
  expires_at: string
}

const PRODUCT_GATE_REASON = 'BLS import blocked until Governance Batch 005 is complete or Tom waives it.'
const TSX = 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs'
const RESET_CLI = 'system\\control-plane\\terminal-wo-reset-cli.ts'

function readJson<T>(repoRoot: string, relativePath: string, fallback: T): T {
  const filePath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
  } catch {
    return fallback
  }
}

function readJsonl(repoRoot: string, relativePath: string): any[] {
  const filePath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(filePath)) return []
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line) } catch { return null }
    })
    .filter(Boolean)
}

function isTerminalRun(run: RunItem | undefined): boolean {
  return !!run && ['completed', 'failed', 'blocked'].includes(run.status)
}

function isNonTerminalRun(run: RunItem | undefined): boolean {
  return !!run && ['running', 'awaiting_approval'].includes(run.status)
}

function isExpired(expiresAt: string | undefined): boolean {
  return !!expiresAt && new Date(expiresAt).getTime() <= Date.now()
}

function isTokenUsable(token: ApprovalToken | undefined): boolean {
  if (!token || token.status !== 'granted') return false
  if (isExpired(token.expires_at)) return false
  if (token.single_use && typeof token.max_uses === 'number' && (token.use_count ?? 0) >= token.max_uses) return false
  return true
}

function isApprovalUsable(approval: ApprovalItem | undefined): boolean {
  if (!approval || (approval.status !== 'pending' && approval.status !== 'granted')) return false
  if (isExpired(approval.expires_at)) return false
  return true
}

function cleanupCommand(subcommand: string, workorderId: string, runId: string): string {
  return `${TSX} ${RESET_CLI} ${subcommand} ${workorderId} --run-id ${runId} --dry-run`
}

function finding(params: GovernanceInvariantFinding): GovernanceInvariantFinding {
  return params
}

export function parseGitStatus(shortStatus: string): GitStatusEntry[] {
  return shortStatus
    .split(/\r?\n/)
    .filter(line => line && !line.startsWith('## '))
    .map(line => {
      const rawCode = line.slice(0, 2)
      const code = rawCode.trim() || rawCode
      return { code, path: line.slice(3).trim() }
    })
}

function gitStatus(repoRoot: string): string {
  const result = spawnSync('git', ['status', '--short', '--branch', '--ignored'], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  })
  return result.stdout ?? ''
}

function summarize(findings: GovernanceInvariantFinding[]): GovernanceInvariantSummary {
  return {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  }
}

function checkActiveWorkorders(state: RuntimeStateFile): GovernanceInvariantFinding[] {
  const findings: GovernanceInvariantFinding[] = []
  const runs = new Map((state.active_runs ?? []).map(run => [run.run_id, run]))

  for (const wo of state.active_workorders ?? []) {
    const run = wo.run_id ? runs.get(wo.run_id) : undefined
    if (wo.run_id && !run && ['dispatched', 'running', 'awaiting_approval', 'review'].includes(wo.status)) {
      findings.push(finding({
        id: 'active_workorder.missing_run',
        severity: 'critical',
        layer: 'runtime_state',
        message: `active_workorder ${wo.workorder_id} points to missing run ${wo.run_id}`,
        evidence: JSON.stringify(wo),
        suggested_action: 'Inspect runtime state and use official cleanup only if the entry is proven stale.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }

    if (run && ['dispatched', 'running', 'awaiting_approval', 'review'].includes(wo.status) && isTerminalRun(run)) {
      const safeCleanupCommand = wo.status === 'dispatched'
        ? cleanupCommand('clear-stale-dispatched', wo.workorder_id, wo.run_id ?? '')
        : wo.status === 'review'
          ? cleanupCommand('clear-stale-review', wo.workorder_id, wo.run_id ?? '')
          : undefined
      findings.push(finding({
        id: 'active_workorder.nonterminal_points_to_terminal_run',
        severity: 'high',
        layer: 'runtime_state',
        message: `active_workorder ${wo.workorder_id} status=${wo.status} points to terminal run status=${run.status}`,
        evidence: `workorder=${wo.workorder_id} run=${wo.run_id}`,
        suggested_action: safeCleanupCommand
          ? 'Run the official stale cleanup dry-run and confirm only if it targets exactly one entry.'
          : 'Inspect with operator status; no supported cleanup command is advertised for this nonterminal state.',
        safe_cleanup_command: safeCleanupCommand,
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }

    if ((wo.status === 'done' || wo.status === 'failed') && wo.run_id) {
      findings.push(finding({
        id: 'active_workorder.terminal_cleanup_candidate',
        severity: 'medium',
        layer: 'cleanup_lifecycle',
        message: `terminal active_workorder ${wo.workorder_id} remains in runtime state`,
        evidence: `status=${wo.status} run=${wo.run_id}`,
        suggested_action: 'Use official terminal cleanup dry-run; do not edit runtime_state.json manually.',
        safe_cleanup_command: cleanupCommand('clear', wo.workorder_id, wo.run_id),
        blocks_product_work: false,
        blocks_operator: false,
      }))
    }
  }

  return findings
}

function checkLocks(state: RuntimeStateFile): GovernanceInvariantFinding[] {
  const findings: GovernanceInvariantFinding[] = []
  const runs = new Map((state.active_runs ?? []).map(run => [run.run_id, run]))

  for (const lock of state.scope_locks ?? []) {
    const run = runs.get(lock.run_id)
    if (!run) {
      findings.push(finding({
        id: 'scope_lock.missing_run',
        severity: 'critical',
        layer: 'locks',
        message: `scope_lock points to missing run ${lock.run_id}`,
        evidence: JSON.stringify(lock),
        suggested_action: 'Do not delete the lock manually; run operator status and use official lifecycle tooling.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    } else if (!isNonTerminalRun(run)) {
      findings.push(finding({
        id: 'scope_lock.terminal_run',
        severity: 'high',
        layer: 'locks',
        message: `scope_lock points to terminal run ${lock.run_id} status=${run.status}`,
        evidence: JSON.stringify(lock),
        suggested_action: 'Run operator status; stale lock cleanup needs an official path before product work.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
    if (isExpired(lock.expires_at)) {
      findings.push(finding({
        id: 'scope_lock.expired',
        severity: 'medium',
        layer: 'locks',
        message: `scope_lock for run ${lock.run_id} is expired`,
        evidence: `expires_at=${lock.expires_at}`,
        suggested_action: 'Use official operator/checker follow-up; do not delete lock files manually.',
        blocks_product_work: false,
        blocks_operator: true,
      }))
    }
  }

  const dbLock = state.db_migration_lock
  if (dbLock) {
    const run = runs.get(dbLock.run_id)
    if (!run) {
      findings.push(finding({
        id: 'db_migration_lock.missing_run',
        severity: 'critical',
        layer: 'locks',
        message: `db_migration_lock points to missing run ${dbLock.run_id}`,
        evidence: JSON.stringify(dbLock),
        suggested_action: 'Do not clear manually; use official operator lifecycle tooling.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    } else if (!isNonTerminalRun(run)) {
      findings.push(finding({
        id: 'db_migration_lock.terminal_run',
        severity: 'high',
        layer: 'locks',
        message: `db_migration_lock points to terminal run ${dbLock.run_id} status=${run.status}`,
        evidence: JSON.stringify(dbLock),
        suggested_action: 'Run operator status; stale lock cleanup needs an official path before product work.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
    if (isExpired(dbLock.expires_at)) {
      findings.push(finding({
        id: 'db_migration_lock.expired',
        severity: 'medium',
        layer: 'locks',
        message: `db_migration_lock for run ${dbLock.run_id} is expired`,
        evidence: `expires_at=${dbLock.expires_at}`,
        suggested_action: 'Use official operator/checker follow-up; do not edit runtime_state.json manually.',
        blocks_product_work: false,
        blocks_operator: true,
      }))
    }
  }

  return findings
}

function approvalsForRun(approvals: ApprovalItem[], workorderId: string, runId: string): ApprovalItem[] {
  return approvals.filter(item => item.workorder_id === workorderId && item.run_id === runId)
}

function tokensForRun(tokens: Record<string, ApprovalToken>, workorderId: string, runId: string): ApprovalToken[] {
  return Object.values(tokens).filter(item => item.workorder_id === workorderId && item.run_id === runId)
}

function checkApprovals(
  state: RuntimeStateFile,
  queue: Record<string, ApprovalItem>,
  tokens: Record<string, ApprovalToken>,
): GovernanceInvariantFinding[] {
  const findings: GovernanceInvariantFinding[] = []
  const runtimeApprovals = state.approvals ?? []
  const queueApprovals = Object.values(queue)

  for (const wo of state.active_workorders ?? []) {
    if (wo.status !== 'awaiting_approval' || !wo.run_id) continue
    const relatedApprovals = [
      ...approvalsForRun(runtimeApprovals, wo.workorder_id, wo.run_id),
      ...approvalsForRun(queueApprovals, wo.workorder_id, wo.run_id),
    ]
    const relatedTokens = tokensForRun(tokens, wo.workorder_id, wo.run_id)
    const hasPendingApproval = relatedApprovals.some(item => item.status === 'pending' && !isExpired(item.expires_at))
    const hasUsableApproval = relatedApprovals.some(isApprovalUsable) || relatedTokens.some(isTokenUsable)
    const hasTerminalApprovalEvidence = relatedApprovals.some(item => ['denied', 'expired', 'consumed'].includes(item.status)) ||
      relatedTokens.some(item => ['denied', 'expired', 'consumed'].includes(item.status) || !isTokenUsable(item))

    if (!hasPendingApproval && !hasUsableApproval && hasTerminalApprovalEvidence) {
      findings.push(finding({
        id: 'awaiting_approval.cleanup_candidate',
        severity: 'medium',
        layer: 'approval_lifecycle',
        message: `awaiting_approval ${wo.workorder_id}/${wo.run_id} has only terminal or unusable approval evidence`,
        evidence: `approvals=${relatedApprovals.map(a => `${a.approval_id}:${a.status}`).join(',') || '<none>'}; tokens=${relatedTokens.map(t => `${t.approval_id}:${t.status}`).join(',') || '<none>'}`,
        suggested_action: 'Run official expired approval cleanup dry-run; confirm only if exactly one target is shown.',
        safe_cleanup_command: cleanupCommand('clear-expired-approval', wo.workorder_id, wo.run_id),
        blocks_product_work: false,
        blocks_operator: false,
      }))
      continue
    }

    if (!hasUsableApproval) {
      findings.push(finding({
        id: 'awaiting_approval.no_usable_approval',
        severity: 'high',
        layer: 'approval_lifecycle',
        message: `awaiting_approval ${wo.workorder_id}/${wo.run_id} has no pending approval or usable granted token`,
        evidence: `approvals=${relatedApprovals.map(a => `${a.approval_id}:${a.status}`).join(',') || '<none>'}; tokens=${relatedTokens.map(t => `${t.approval_id}:${t.status}`).join(',') || '<none>'}`,
        suggested_action: 'Inspect approval queue/runtime/token state read-only; do not grant automatically.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  for (const queueItem of queueApprovals) {
    const runtime = runtimeApprovals.find(item => item.approval_id === queueItem.approval_id)
    const token = tokens[queueItem.approval_id]
    if (queueItem.status === 'denied' && runtime?.status === 'pending') {
      findings.push(finding({
        id: 'approval.denied_queue_pending_runtime',
        severity: 'high',
        layer: 'approval_lifecycle',
        message: `approval ${queueItem.approval_id} is denied in queue but pending in runtime state`,
        evidence: `queue=denied runtime=pending run=${queueItem.run_id}`,
        suggested_action: 'Fix approval sync through official approval/state-manager code; do not edit runtime_state.json manually.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
    if (queueItem.status === 'granted' && token && !isTokenUsable(token)) {
      findings.push(finding({
        id: 'approval.granted_queue_unusable_token',
        severity: 'high',
        layer: 'approval_lifecycle',
        message: `approval ${queueItem.approval_id} is granted in queue but enforcement token is unusable`,
        evidence: `token_status=${token.status} token_expires_at=${token.expires_at ?? '<none>'}`,
        suggested_action: 'Use operator status; rerun or cleanup only through official lifecycle tools.',
        blocks_product_work: true,
        blocks_operator: true,
      }))
    }
  }

  for (const token of Object.values(tokens)) {
    if (token.status === 'consumed') {
      const awaiting = (state.active_workorders ?? []).find(wo =>
        wo.workorder_id === token.workorder_id &&
        wo.run_id === token.run_id &&
        wo.status === 'awaiting_approval',
      )
      if (awaiting) {
        findings.push(finding({
          id: 'approval.consumed_token_awaiting_workorder',
          severity: 'high',
          layer: 'approval_lifecycle',
          message: `consumed token ${token.approval_id} still has active awaiting_approval workorder`,
          evidence: `WO=${awaiting.workorder_id} run=${awaiting.run_id}`,
          suggested_action: 'Run official expired approval cleanup dry-run if no pending approval exists.',
          safe_cleanup_command: cleanupCommand('clear-expired-approval', awaiting.workorder_id, awaiting.run_id ?? ''),
          blocks_product_work: true,
          blocks_operator: true,
        }))
      }
    }
  }

  return findings
}

function runFailureAnchor(run: RunItem): string | undefined {
  return run.completed_at ?? run.ended_at ?? run.failed_at ?? run.started_at
}

function failedRunsSinceBaseline(state: RuntimeStateFile): { counted: number; total: number } {
  const failedRuns = (state.active_runs ?? []).filter(run => run.status === 'failed')
  const baselineAt = state.stop_rule_baselines?.failed_runs_threshold?.acknowledged_at
  if (!baselineAt) return { counted: failedRuns.length, total: failedRuns.length }

  const baselineTime = new Date(baselineAt).getTime()
  if (!Number.isFinite(baselineTime)) return { counted: failedRuns.length, total: failedRuns.length }

  const counted = failedRuns.filter(run => {
    const anchor = runFailureAnchor(run)
    if (!anchor) return true
    const anchorTime = new Date(anchor).getTime()
    if (!Number.isFinite(anchorTime)) return true
    return anchorTime > baselineTime
  }).length

  return { counted, total: failedRuns.length }
}

function checkStopRules(state: RuntimeStateFile, repoRoot: string): GovernanceInvariantFinding[] {
  const findings: GovernanceInvariantFinding[] = []
  if (state.system_stop?.active) {
    findings.push(finding({
      id: 'stop_rules.system_stop_active',
      severity: 'critical',
      layer: 'stop_rules',
      message: 'system_stop is active',
      evidence: JSON.stringify(state.system_stop),
      suggested_action: 'Tom must review and clear system_stop through the official path.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  if (!state.stop_rule_baselines?.failed_runs_threshold?.acknowledged_at) {
    findings.push(finding({
      id: 'stop_rules.failed_runs_baseline_missing',
      severity: 'low',
      layer: 'stop_rules',
      message: 'failed-runs baseline is missing',
      evidence: 'stop_rule_baselines.failed_runs_threshold',
      suggested_action: 'Acknowledge historical baseline only after Tom reviews failed runs.',
      blocks_product_work: false,
      blocks_operator: false,
    }))
  }

  if (!state.stop_rule_baselines?.invalid_json_spike?.acknowledged_at) {
    findings.push(finding({
      id: 'stop_rules.invalid_json_baseline_missing',
      severity: 'low',
      layer: 'stop_rules',
      message: 'invalid-json baseline is missing',
      evidence: 'stop_rule_baselines.invalid_json_spike',
      suggested_action: 'Acknowledge historical baseline only after Tom reviews invalid_json metrics.',
      blocks_product_work: false,
      blocks_operator: false,
    }))
  }

  const failedRuns = failedRunsSinceBaseline(state)
  if (failedRuns.counted >= 5) {
    findings.push(finding({
      id: 'stop_rules.failed_runs_would_retrigger',
      severity: 'high',
      layer: 'stop_rules',
      message: 'failed-runs stop rule would retrigger',
      evidence: `${failedRuns.counted} failed active_runs since baseline; total=${failedRuns.total}`,
      suggested_action: 'Run stop-rules dry-run and review baseline; do not raise thresholds blindly.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  const metrics = readJsonl(repoRoot, 'system/state/pipeline-metrics.jsonl')
  const invalidJson = metrics.filter(item => String(item.outcome ?? '').toLowerCase() === 'invalid_json').length
  if (metrics.length >= 3 && invalidJson / metrics.length >= 0.5 && !state.stop_rule_baselines?.invalid_json_spike?.acknowledged_at) {
    findings.push(finding({
      id: 'stop_rules.invalid_json_would_retrigger',
      severity: 'high',
      layer: 'stop_rules',
      message: 'invalid-json stop rule would retrigger without a baseline',
      evidence: `${invalidJson}/${metrics.length} invalid_json metrics`,
      suggested_action: 'Run stop-rules dry-run and review baseline; do not disable stop rules.',
      blocks_product_work: true,
      blocks_operator: true,
    }))
  }

  return findings
}

function checkArtifacts(entries: GitStatusEntry[], profile?: ProjectProfile): GovernanceInvariantFinding[] {
  const findings: GovernanceInvariantFinding[] = []
  const runtimeArtifacts = [
    'system/state/pipeline-metrics.jsonl',
    'system/approval/queue.json',
    'system/state/runtime_state.json',
  ]

  for (const entry of entries) {
    const normalized = entry.path.replace(/\\/g, '/')
    const runtimeArtifact = profile
      ? isRuntimeArtifactPath(profile, normalized)
      : runtimeArtifacts.includes(normalized) || /^system\/state\/.*\.lock$/.test(normalized)
    if (entry.code !== '!!' && runtimeArtifact) {
      findings.push(finding({
        id: 'artifact.runtime_modified',
        severity: 'medium',
        layer: 'runtime_artifact_policy',
        message: `runtime artifact is visible in git status: ${normalized}`,
        evidence: `${entry.code} ${normalized}`,
        suggested_action: 'Do not commit runtime artifacts; restore tracked runtime files or keep generated files ignored.',
        blocks_product_work: true,
        blocks_operator: false,
      }))
    }

    const rawLocalPath = profile ? isRawLocalPath(profile, normalized) : normalized.startsWith('docs/specs/Nutrition/00_raw/')
    if (rawLocalPath && entry.code !== '!!') {
      findings.push(finding({
        id: 'artifact.raw_bls_unignored',
        severity: 'medium',
        layer: 'runtime_artifact_policy',
        message: `raw BLS artifact is not ignored: ${normalized}`,
        evidence: `${entry.code} ${normalized}`,
        suggested_action: 'Keep raw BLS files local-only and ignored; do not commit them.',
        blocks_product_work: true,
        blocks_operator: false,
      }))
    }
  }

  return findings
}

export function runGovernanceInvariantCheck(opts: { repoRoot?: string; gitStatus?: string; projectId?: string } = {}): GovernanceInvariantResult {
  const repoRoot = opts.repoRoot ?? process.cwd()
  const profile = opts.projectId ? getProjectProfile(opts.projectId, { repoRoot }) : undefined
  const state = readJson<RuntimeStateFile>(repoRoot, 'system/state/runtime_state.json', {})
  const queue = readJson<Record<string, ApprovalItem>>(repoRoot, 'system/approval/queue.json', {})
  const tokens = readJson<Record<string, ApprovalToken>>(repoRoot, 'system/approval/approvals.json', {})
  const gitEntries = parseGitStatus(opts.gitStatus ?? gitStatus(repoRoot))

  const findings = [
    ...checkActiveWorkorders(state),
    ...checkLocks(state),
    ...checkApprovals(state, queue, tokens),
    ...checkStopRules(state, repoRoot),
    ...checkArtifacts(gitEntries, profile),
  ]
  const summary = summarize(findings)
  const hasHighOrCriticalFindings = summary.critical > 0 || summary.high > 0

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    repo_root: repoRoot,
    ...(profile ? { project_profile: {
      project_id: profile.project_id,
      display_name: profile.display_name,
    } } : {}),
    hasHighOrCriticalFindings,
    exitCode: hasHighOrCriticalFindings ? 1 : 0,
    summary,
    product_work_gate: {
      status: 'blocked',
      reason: profile?.product_gate.reason ?? PRODUCT_GATE_REASON,
    },
    findings,
  }
}

export function formatInvariantReport(result: GovernanceInvariantResult): string {
  const lines = [
    '# Governance Invariant Check',
    '',
    `Generated: ${result.generated_at}`,
    `Repo: ${result.repo_root}`,
    ...(result.project_profile ? [`Project profile: ${result.project_profile.project_id} (${result.project_profile.display_name})`] : []),
    `Product work gate: ${result.product_work_gate.status}`,
    `Product work gate reason: ${result.product_work_gate.reason}`,
    '',
    '## Summary',
    '',
    `critical: ${result.summary.critical}`,
    `high: ${result.summary.high}`,
    `medium: ${result.summary.medium}`,
    `low: ${result.summary.low}`,
    `info: ${result.summary.info}`,
    '',
    '## Findings',
  ]

  if (result.findings.length === 0) {
    lines.push('')
    lines.push('(none)')
    return lines.join('\n')
  }

  for (const item of result.findings) {
    lines.push('')
    lines.push(`- ${item.id} [${item.severity}] ${item.layer}`)
    lines.push(`  message: ${item.message}`)
    lines.push(`  evidence: ${item.evidence}`)
    lines.push(`  suggested_action: ${item.suggested_action}`)
    lines.push(`  blocks_product_work: ${item.blocks_product_work ? 'yes' : 'no'}`)
    lines.push(`  blocks_operator: ${item.blocks_operator ? 'yes' : 'no'}`)
    if (item.safe_cleanup_command) lines.push(`  safe_cleanup_command: ${item.safe_cleanup_command}`)
  }

  return lines.join('\n')
}

function main(): number {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const projectIndex = args.indexOf('--project')
  const projectId = projectIndex !== -1 ? args[projectIndex + 1] : undefined
  const unknown = args.filter((arg, index) => arg !== '--json' && arg !== '--project' && index !== projectIndex + 1)
  if (unknown.length > 0) {
    console.error(`Unknown flag(s): ${unknown.join(', ')}`)
    return 2
  }

  const result = runGovernanceInvariantCheck({ projectId })
  if (json) console.log(JSON.stringify(result, null, 2))
  else console.log(formatInvariantReport(result))
  return result.exitCode
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main())
}
