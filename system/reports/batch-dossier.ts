import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

import {
  extractFirstYamlBlock,
  parseBatchMd,
  parseSimpleYaml,
} from '../workorders/cli/batch-loader'
import {
  formatInvariantReport,
  runGovernanceInvariantCheck,
  type GovernanceInvariantResult,
} from '../control-plane/governance-invariant-check'
import {
  formatAgentContractReport,
  runAgentContractCheck,
  type AgentContractCheckResult,
} from '../control-plane/agent-contract-check'
import {
  formatSpecSourceChainReport,
  runSpecSourceChainCheck,
  type SpecSourceChainResult,
} from '../workorders/cli/spec-source-chain-check'

export type BatchDossierFinalState =
  | 'DONE'
  | 'NEEDS_TOM_APPROVAL'
  | 'FIX_REQUIRED'
  | 'NEEDS_SAFE_CLEANUP'
  | 'STOP_RULE_BLOCKED'
  | 'NOT_RUN'
  | 'PARTIAL'

export type DossierPathCategory =
  | 'project_output'
  | 'runtime_artifact'
  | 'raw_local_only'
  | 'report_output'
  | 'code_change'
  | 'unknown'

export interface BatchDossierWorkorder {
  workorder_id: string
  file: string
  agent_id: string
  risk_category: string
  requires_approval: boolean
  expected_outputs: string[]
  blocked_by: string[]
  validation_errors: string[]
}

export interface BatchDossierRun {
  run_id: string
  workorder_id: string
  status: string
  agent_id: string
  model?: string
  started_at?: string
  completed_at?: string
  duration_ms?: number
}

export interface BatchDossierApproval {
  approval_id: string
  workorder_id: string
  run_id?: string
  agent_id?: string
  status: string
  operation?: string
  tool?: string
  scope?: string
  action?: string
  affected_files: string[]
  requested_at?: string
  decided_at?: string
  decided_by?: string
}

export interface BatchDossierReview {
  ts?: string
  workorder_id?: string
  run_id?: string
  tier?: string
  event: string
  status?: string
  confidence?: number
  escalation?: string
}

export interface BatchDossierCleanup {
  ts?: string
  event: string
  workorder_id?: string
  run_id?: string
  reason?: string
}

export interface BatchDossierOutput {
  path: string
  expected: boolean
  exists: boolean
  git_code?: string
  git_status?: string
  category: DossierPathCategory
  safe_to_commit: boolean
}

export interface BatchDossierGitStatus {
  branch: string
  dirty: boolean
  entries: Array<{
    code: string
    path: string
    category: DossierPathCategory
  }>
  commits_since_base: string[]
  raw_data_warnings: string[]
  runtime_artifact_warnings: string[]
}

export interface BatchDossierCheckerSummary {
  status: 'pass' | 'warn' | 'fail' | 'not_run' | 'error'
  summary?: Record<string, number>
  findings?: number
  detail?: string
}

export interface BatchDossier {
  schema_version: 1
  generated_at: string
  batch_id: string
  batch_file: string
  batch_status: string
  workorders: BatchDossierWorkorder[]
  dependency_graph: Array<{ workorder_id: string; blocked_by: string[] }>
  expected_outputs: string[]
  runs: BatchDossierRun[]
  approvals: BatchDossierApproval[]
  reviews: BatchDossierReview[]
  cleanups: BatchDossierCleanup[]
  stop_rules: {
    system_stop_active: boolean
    system_stop?: unknown
    baselines: Record<string, unknown>
    dry_run_result: BatchDossierCheckerSummary
  }
  checkers: {
    invariant: BatchDossierCheckerSummary
    agent_contract: BatchDossierCheckerSummary
    spec_source_chain: BatchDossierCheckerSummary
    migration_guard: BatchDossierCheckerSummary
  }
  outputs: BatchDossierOutput[]
  git_status: BatchDossierGitStatus
  final_state: BatchDossierFinalState
  next_action: string
}

export interface BuildBatchDossierOptions {
  batchFile: string
  repoRoot?: string
  generatedAt?: string
  gitStatus?: string
  commitsSinceBase?: string[]
  runCheckers?: boolean
}

interface RuntimeStateFile {
  active_runs?: any[]
  active_workorders?: any[]
  approvals?: any[]
  scope_locks?: any[]
  db_migration_lock?: any
  system_stop?: any
  stop_rule_baselines?: Record<string, unknown>
}

const TSX = 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs'
const DOSSIER_CLI = 'system\\reports\\batch-dossier.ts'

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

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function normalizeRelative(repoRoot: string, filePath: string): string {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath)
  return toPosix(path.relative(repoRoot, absolute))
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function classifyDossierPath(filePath: string): DossierPathCategory {
  const p = toPosix(filePath)
  if (p.includes('/node_modules/') || p.endsWith('/node_modules/')) return 'unknown'
  if (p.startsWith('docs/specs/Nutrition/00_raw/')) return 'raw_local_only'
  if (
    p.startsWith('system/state/') ||
    p === 'system/approval/queue.json' ||
    p === 'system/approval/approvals.json' ||
    /^system\/state\/.*\.lock$/.test(p)
  ) return 'runtime_artifact'
  if (p.startsWith('system/reports/batches/') || p.startsWith('system/reports/runs/') || p.startsWith('system/reports/dossiers/')) {
    return 'report_output'
  }
  if (
    p.startsWith('docs/specs/') ||
    p.startsWith('docs/project/') ||
    p.startsWith('supabase/migrations/') ||
    p.startsWith('packages/types/')
  ) return 'project_output'
  if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.json') || p.endsWith('.md')) return 'code_change'
  return 'unknown'
}

function parseGitStatus(raw: string): BatchDossierGitStatus {
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const branchLine = lines.find(line => line.startsWith('## ')) ?? '## (unknown)'
  const branch = branchLine.replace(/^##\s+/, '').split('...')[0].trim()
  const entries = lines
    .filter(line => !line.startsWith('## '))
    .map(line => {
      const code = line.slice(0, 2).trim() || '??'
      const filePath = line.slice(3).trim()
      return { code, path: filePath, category: classifyDossierPath(filePath) }
    })
  return {
    branch,
    dirty: entries.some(entry => entry.code !== '!!'),
    entries,
    commits_since_base: [],
    raw_data_warnings: entries
      .filter(entry => entry.category === 'raw_local_only' && entry.code !== '!!')
      .map(entry => `${entry.path} is local-only raw data and must not be committed.`),
    runtime_artifact_warnings: entries
      .filter(entry => entry.category === 'runtime_artifact' && entry.code !== '!!')
      .map(entry => `${entry.path} is a runtime artifact and must not be committed.`),
  }
}

function readGitStatus(repoRoot: string, injected?: string): BatchDossierGitStatus {
  if (typeof injected === 'string') return parseGitStatus(injected)
  const result = spawnSync('git', ['status', '--short', '--branch', '--ignored=matching'], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  })
  return parseGitStatus(result.stdout ?? '')
}

function readCommitsSinceBase(repoRoot: string, injected?: string[]): string[] {
  if (injected) return injected
  const result = spawnSync('git', ['log', '--oneline', 'main..HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  })
  if (result.status !== 0) return []
  return (result.stdout ?? '').split(/\r?\n/).filter(Boolean)
}

function loadBatchWorkorders(repoRoot: string, batchFile: string): Pick<BatchDossier, 'batch_file' | 'batch_status' | 'batch_id' | 'workorders' | 'dependency_graph' | 'expected_outputs'> {
  const absoluteBatch = path.isAbsolute(batchFile) ? batchFile : path.join(repoRoot, batchFile)
  const parsedBatch = parseBatchMd(absoluteBatch)
  const draftsDir = path.resolve(path.dirname(absoluteBatch), '..', 'drafts')
  const workorders: BatchDossierWorkorder[] = []
  const expectedOutputs = new Set<string>()

  for (const entry of parsedBatch.entries) {
    const filepath = path.join(draftsDir, entry.filename)
    const validationErrors: string[] = []
    let parsed: Record<string, unknown> = {}

    if (!fs.existsSync(filepath)) {
      validationErrors.push(`File not found: ${filepath}`)
    } else {
      const raw = fs.readFileSync(filepath, 'utf8')
      const yaml = extractFirstYamlBlock(raw)
      if (!yaml) {
        validationErrors.push('No ```yaml block found in draft')
      } else {
        parsed = parseSimpleYaml(yaml)
      }
    }

    const woExpected = asStringArray(parsed.expected_outputs)
    for (const output of woExpected) expectedOutputs.add(output)
    workorders.push({
      workorder_id: getString(parsed.workorder_id, entry.workorder_id),
      file: normalizeRelative(repoRoot, filepath),
      agent_id: getString(parsed.agent_id),
      risk_category: getString(parsed.risk_category, entry.risk),
      requires_approval: parsed.requires_approval === true || entry.approval.toLowerCase() === 'yes',
      expected_outputs: woExpected,
      blocked_by: asStringArray(parsed.blocked_by),
      validation_errors: validationErrors,
    })
  }

  const batchRel = normalizeRelative(repoRoot, absoluteBatch)
  return {
    batch_file: batchRel,
    batch_status: parsedBatch.status || '(no status)',
    batch_id: path.basename(batchRel, path.extname(batchRel)),
    workorders,
    dependency_graph: workorders.map(item => ({ workorder_id: item.workorder_id, blocked_by: item.blocked_by })),
    expected_outputs: [...expectedOutputs],
  }
}

function queueItems(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') return Object.values(raw as Record<string, unknown>)
  return []
}

function isRelated(item: any, workorderIds: Set<string>, runIds: Set<string>): boolean {
  return workorderIds.has(item?.workorder_id) || (!!item?.run_id && runIds.has(item.run_id))
}

function collectRuns(state: RuntimeStateFile, workorderIds: Set<string>): BatchDossierRun[] {
  return (state.active_runs ?? [])
    .filter(run => workorderIds.has(run.workorder_id))
    .map(run => {
      const started = run.started_at
      const completed = run.completed_at ?? run.ended_at ?? run.failed_at
      const startMs = started ? new Date(started).getTime() : NaN
      const endMs = completed ? new Date(completed).getTime() : NaN
      return {
        run_id: run.run_id,
        workorder_id: run.workorder_id,
        status: run.status,
        agent_id: run.agent_id ?? '',
        model: run.model,
        started_at: started,
        completed_at: completed,
        duration_ms: Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs ? endMs - startMs : undefined,
      }
    })
}

function collectApprovals(repoRoot: string, state: RuntimeStateFile, workorderIds: Set<string>, runIds: Set<string>): BatchDossierApproval[] {
  const queue = queueItems(readJson<unknown>(repoRoot, 'system/approval/queue.json', {}))
  const approvalsFile = queueItems(readJson<unknown>(repoRoot, 'system/approval/approvals.json', {}))
  const runtime = state.approvals ?? []
  const byId = new Map<string, any>()
  for (const item of [...runtime, ...approvalsFile, ...queue]) {
    if (isRelated(item, workorderIds, runIds) && item.approval_id) {
      byId.set(item.approval_id, { ...(byId.get(item.approval_id) ?? {}), ...item })
    }
  }
  return [...byId.values()].map(item => ({
    approval_id: item.approval_id,
    workorder_id: item.workorder_id,
    run_id: item.run_id,
    agent_id: item.agent_id ?? item.requested_by,
    status: item.status ?? 'unknown',
    operation: item.operation,
    tool: item.tool,
    scope: item.scope ?? item.targetPath,
    action: item.proposed_action ?? item.action,
    affected_files: asStringArray(item.affected_files),
    requested_at: item.requested_at,
    decided_at: item.decided_at,
    decided_by: item.decided_by,
  }))
}

function collectReviews(repoRoot: string, workorderIds: Set<string>, runIds: Set<string>): BatchDossierReview[] {
  const events = [
    ...readJsonl(repoRoot, 'system/state/pipeline-audit.jsonl'),
    ...readJsonl(repoRoot, 'system/state/pipeline-metrics.jsonl'),
  ]
  return events
    .filter(item => /review|invalid_json|human_needed|rewrite|escalate/i.test(String(item.event ?? item.status ?? item.outcome ?? '')))
    .filter(item => isRelated({ workorder_id: item.workorder_id ?? item.wo_id, run_id: item.run_id }, workorderIds, runIds))
    .map(item => ({
      ts: item.ts ?? item.timestamp,
      workorder_id: item.workorder_id ?? item.wo_id,
      run_id: item.run_id,
      tier: item.tier ?? item.reviewer_tier,
      event: item.event ?? item.status ?? item.outcome ?? 'review_event',
      status: item.status ?? item.outcome,
      confidence: item.confidence,
      escalation: item.escalation,
    }))
}

function collectCleanups(repoRoot: string, workorderIds: Set<string>, runIds: Set<string>): BatchDossierCleanup[] {
  return readJsonl(repoRoot, 'system/state/audit.jsonl')
    .filter(item => /cleanup|reset|stale|expired|terminal/i.test(String(item.event ?? '')))
    .filter(item => isRelated(item, workorderIds, runIds))
    .map(item => ({
      ts: item.ts ?? item.timestamp,
      event: item.event,
      workorder_id: item.workorder_id,
      run_id: item.run_id,
      reason: item.reason ?? item.detail,
    }))
}

function checkerSummary(result: { summary?: Record<string, number>; hasHighOrCriticalFindings?: boolean; findings?: unknown[] } | null, error?: unknown): BatchDossierCheckerSummary {
  if (error) return { status: 'error', detail: (error as Error).message }
  if (!result) return { status: 'not_run' }
  const critical = result.summary?.critical ?? 0
  const high = result.summary?.high ?? 0
  const medium = result.summary?.medium ?? 0
  return {
    status: critical > 0 || high > 0 ? 'fail' : medium > 0 ? 'warn' : 'pass',
    summary: result.summary,
    findings: Array.isArray(result.findings) ? result.findings.length : undefined,
  }
}

function collectCheckers(repoRoot: string, batchFile: string, runCheckers: boolean): BatchDossier['checkers'] {
  if (!runCheckers) {
    return {
      invariant: { status: 'not_run' },
      agent_contract: { status: 'not_run' },
      spec_source_chain: { status: 'not_run' },
      migration_guard: { status: 'not_run', detail: 'Migration guard is not executed by the read-only dossier reporter.' },
    }
  }

  let invariant: GovernanceInvariantResult | null = null
  let invariantError: unknown
  let agentContract: AgentContractCheckResult | null = null
  let agentContractError: unknown
  let specSource: SpecSourceChainResult | null = null
  let specSourceError: unknown

  try { invariant = runGovernanceInvariantCheck({ repoRoot }) } catch (error) { invariantError = error }
  try { agentContract = runAgentContractCheck({ repoRoot }) } catch (error) { agentContractError = error }
  try { specSource = runSpecSourceChainCheck({ repoRoot, batchFile }) } catch (error) { specSourceError = error }

  return {
    invariant: checkerSummary(invariant, invariantError),
    agent_contract: checkerSummary(agentContract, agentContractError),
    spec_source_chain: checkerSummary(specSource, specSourceError),
    migration_guard: { status: 'not_run', detail: 'Migration guard is reported separately by migration validation tools; dossier does not execute migrations.' },
  }
}

function collectOutputs(repoRoot: string, expectedOutputs: string[], git: BatchDossierGitStatus): BatchDossierOutput[] {
  const outputPaths = new Set(expectedOutputs)
  for (const entry of git.entries) {
    if (['project_output', 'runtime_artifact', 'raw_local_only', 'report_output'].includes(entry.category)) {
      outputPaths.add(entry.path)
    }
  }

  return [...outputPaths].sort().map(outputPath => {
    const gitEntry = git.entries.find(entry => toPosix(entry.path) === toPosix(outputPath))
    const category = classifyDossierPath(outputPath)
    return {
      path: outputPath,
      expected: expectedOutputs.includes(outputPath),
      exists: fs.existsSync(path.join(repoRoot, outputPath)),
      git_code: gitEntry?.code,
      git_status: gitEntry ? `${gitEntry.code} ${gitEntry.path}` : undefined,
      category,
      safe_to_commit: category === 'project_output',
    }
  })
}

function hasPendingApproval(approvals: BatchDossierApproval[]): boolean {
  return approvals.some(item => item.status === 'pending')
}

function hasCleanupCandidate(state: RuntimeStateFile, workorderIds: Set<string>): boolean {
  return (state.active_workorders ?? []).some(item =>
    workorderIds.has(item.workorder_id) &&
    ['done', 'failed', 'dispatched', 'review', 'awaiting_approval'].includes(item.status),
  )
}

function classifyFinalState(params: {
  state: RuntimeStateFile
  workorderIds: Set<string>
  runs: BatchDossierRun[]
  approvals: BatchDossierApproval[]
  outputs: BatchDossierOutput[]
  checkers: BatchDossier['checkers']
}): BatchDossierFinalState {
  if (params.state.system_stop?.active) return 'STOP_RULE_BLOCKED'
  if (hasPendingApproval(params.approvals)) return 'NEEDS_TOM_APPROVAL'
  if (hasCleanupCandidate(params.state, params.workorderIds)) return 'NEEDS_SAFE_CLEANUP'
  if (Object.values(params.checkers).some(item => item.status === 'fail' || item.status === 'error')) return 'FIX_REQUIRED'
  if (params.runs.length === 0) return 'NOT_RUN'

  const expected = params.outputs.filter(output => output.expected)
  const allExpectedExist = expected.length > 0 && expected.every(output => output.exists)
  const allRunsCompleted = params.workorderIds.size > 0 &&
    [...params.workorderIds].every(id => params.runs.some(run => run.workorder_id === id && run.status === 'completed'))

  if (allExpectedExist && allRunsCompleted) return 'DONE'
  if (params.outputs.some(output => output.expected && !output.exists)) return 'FIX_REQUIRED'
  return 'PARTIAL'
}

function nextActionFor(finalState: BatchDossierFinalState, batchFile: string): string {
  switch (finalState) {
    case 'DONE':
      return 'Tom reviews the dossier and merge readiness report before promotion.'
    case 'NEEDS_TOM_APPROVAL':
      return 'Tom reviews the pending approval details before granting or denying.'
    case 'NEEDS_SAFE_CLEANUP':
      return `Run the Governance Operator with safe cleanup only: ${TSX} system\\workorders\\cli\\run-batch-operator.ts ${batchFile} --continue --apply-safe-cleanups`
    case 'STOP_RULE_BLOCKED':
      return 'Run stop-rules dry-run and resolve or acknowledge the active stop through official governance CLI.'
    case 'FIX_REQUIRED':
      return 'Fix the reported governance or output blocker, then regenerate this dossier.'
    case 'NOT_RUN':
      return `Run an operator dry-run before execution: ${TSX} system\\workorders\\cli\\run-batch-operator.ts ${batchFile} --dry-run`
    case 'PARTIAL':
      return `Continue through the Governance Operator: ${TSX} system\\workorders\\cli\\run-batch-operator.ts ${batchFile} --continue`
  }
}

export function buildBatchDossier(options: BuildBatchDossierOptions): BatchDossier {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const generatedAt = options.generatedAt ?? new Date().toISOString()
  const batch = loadBatchWorkorders(repoRoot, options.batchFile)
  const workorderIds = new Set(batch.workorders.map(item => item.workorder_id).filter(Boolean))
  const state = readJson<RuntimeStateFile>(repoRoot, 'system/state/runtime_state.json', {})
  const runs = collectRuns(state, workorderIds)
  const runIds = new Set(runs.map(run => run.run_id))
  const approvals = collectApprovals(repoRoot, state, workorderIds, runIds)
  const reviews = collectReviews(repoRoot, workorderIds, runIds)
  const cleanups = collectCleanups(repoRoot, workorderIds, runIds)
  const git = readGitStatus(repoRoot, options.gitStatus)
  git.commits_since_base = readCommitsSinceBase(repoRoot, options.commitsSinceBase)
  const checkers = collectCheckers(repoRoot, batch.batch_file, options.runCheckers ?? true)
  const outputs = collectOutputs(repoRoot, batch.expected_outputs, git)
  const finalState = classifyFinalState({ state, workorderIds, runs, approvals, outputs, checkers })

  return {
    schema_version: 1,
    generated_at: generatedAt,
    ...batch,
    runs,
    approvals,
    reviews,
    cleanups,
    stop_rules: {
      system_stop_active: !!state.system_stop?.active,
      system_stop: state.system_stop,
      baselines: state.stop_rule_baselines ?? {},
      dry_run_result: checkers.invariant,
    },
    checkers,
    outputs,
    git_status: git,
    final_state: finalState,
    next_action: nextActionFor(finalState, batch.batch_file),
  }
}

function table(rows: string[][]): string[] {
  if (rows.length === 0) return ['(none)']
  const header = rows[0]
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.slice(1).map(row => `| ${row.map(cell => String(cell ?? '').replace(/\n/g, ' ')).join(' | ')} |`),
  ]
}

export function formatBatchDossierMarkdown(dossier: BatchDossier): string {
  const lines: string[] = []
  lines.push(`# Batch Dossier — ${dossier.batch_id}`)
  lines.push('')
  lines.push(`Generated: ${dossier.generated_at}`)
  lines.push(`Batch file: ${dossier.batch_file}`)
  lines.push(`Batch status: ${dossier.batch_status}`)
  lines.push('')
  lines.push('## Batch Identity')
  lines.push(...table([
    ['WO-ID', 'Agent', 'Risk', 'Expected Outputs', 'Blocked By'],
    ...dossier.workorders.map(wo => [
      wo.workorder_id,
      wo.agent_id,
      wo.risk_category,
      String(wo.expected_outputs.length),
      wo.blocked_by.join(', '),
    ]),
  ]))
  lines.push('')
  lines.push('## Execution Timeline')
  lines.push(...table([
    ['WO-ID', 'Run-ID', 'Status', 'Agent', 'Duration ms'],
    ...dossier.runs.map(run => [
      run.workorder_id,
      run.run_id,
      run.status,
      run.agent_id,
      String(run.duration_ms ?? ''),
    ]),
  ]))
  lines.push('')
  lines.push('## Approval Timeline')
  lines.push(...table([
    ['Approval-ID', 'WO-ID', 'Run-ID', 'Status', 'Operation', 'Action'],
    ...dossier.approvals.map(approval => [
      approval.approval_id,
      approval.workorder_id,
      approval.run_id ?? '',
      approval.status,
      approval.operation ?? '',
      approval.action ?? '',
    ]),
  ]))
  lines.push('')
  lines.push('## Review Timeline')
  lines.push(...table([
    ['Time', 'WO-ID', 'Run-ID', 'Tier', 'Event', 'Status'],
    ...dossier.reviews.map(review => [
      review.ts ?? '',
      review.workorder_id ?? '',
      review.run_id ?? '',
      review.tier ?? '',
      review.event,
      review.status ?? '',
    ]),
  ]))
  lines.push('')
  lines.push('## Cleanup Timeline')
  lines.push(...table([
    ['Time', 'Event', 'WO-ID', 'Run-ID', 'Reason'],
    ...dossier.cleanups.map(cleanup => [
      cleanup.ts ?? '',
      cleanup.event,
      cleanup.workorder_id ?? '',
      cleanup.run_id ?? '',
      cleanup.reason ?? '',
    ]),
  ]))
  lines.push('')
  lines.push('## Stop Rules')
  lines.push(`system_stop: ${dossier.stop_rules.system_stop_active ? 'active' : 'inactive'}`)
  lines.push(`baselines: ${Object.keys(dossier.stop_rules.baselines).join(', ') || '(none)'}`)
  lines.push('')
  lines.push('## Guard / Checker Results')
  lines.push(...table([
    ['Checker', 'Status', 'Critical', 'High', 'Medium'],
    ...Object.entries(dossier.checkers).map(([name, result]) => [
      name,
      result.status,
      String(result.summary?.critical ?? ''),
      String(result.summary?.high ?? ''),
      String(result.summary?.medium ?? ''),
    ]),
  ]))
  lines.push('')
  lines.push('## Outputs')
  lines.push(...table([
    ['Path', 'Expected', 'Exists', 'Git', 'Category', 'Safe To Commit'],
    ...dossier.outputs.map(output => [
      output.path,
      output.expected ? 'yes' : 'no',
      output.exists ? 'yes' : 'no',
      output.git_status ?? '',
      output.category,
      output.safe_to_commit ? 'yes' : 'no',
    ]),
  ]))
  lines.push('')
  lines.push('## Git State')
  lines.push(`branch: ${dossier.git_status.branch}`)
  lines.push(`dirty: ${dossier.git_status.dirty ? 'yes' : 'no'}`)
  lines.push(...table([
    ['Code', 'Path', 'Category'],
    ...dossier.git_status.entries.map(entry => [entry.code, entry.path, entry.category]),
  ]))
  lines.push('')
  lines.push('## Final Classification')
  lines.push(dossier.final_state)
  lines.push('')
  lines.push('## Exact Next Action')
  lines.push(dossier.next_action)
  lines.push('')
  return `${lines.join('\n')}\n`
}

export function writeBatchDossier(dossier: BatchDossier, options: { repoRoot?: string; outputDir?: string } = {}): { markdownPath: string; jsonPath: string } {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const outDir = options.outputDir ? path.resolve(repoRoot, options.outputDir) : path.join(repoRoot, 'system/reports/batches')
  fs.mkdirSync(outDir, { recursive: true })
  const stamp = dossier.generated_at.replace(/[:.]/g, '-')
  const base = `${dossier.batch_id}-${stamp}`
  const markdownPath = path.join(outDir, `${base}.md`)
  const jsonPath = path.join(outDir, `${base}.json`)
  fs.writeFileSync(markdownPath, formatBatchDossierMarkdown(dossier), 'utf8')
  fs.writeFileSync(jsonPath, JSON.stringify(dossier, null, 2), 'utf8')
  return { markdownPath, jsonPath }
}

function usage(): string {
  return [
    'Usage:',
    `  ${TSX} ${DOSSIER_CLI} --batch <batch-file> [--json] [--write]`,
    `  ${TSX} ${DOSSIER_CLI} --workorder <WO-ID> [--json]`,
  ].join('\n')
}

function parseArgs(argv: string[]): { batch?: string; workorder?: string; json: boolean; write: boolean } {
  const args = [...argv]
  const json = args.includes('--json')
  const write = args.includes('--write')
  const batchIndex = args.indexOf('--batch')
  const workorderIndex = args.indexOf('--workorder')
  const batch = batchIndex !== -1 ? args[batchIndex + 1] : undefined
  const workorder = workorderIndex !== -1 ? args[workorderIndex + 1] : undefined
  return { batch, workorder, json, write }
}

function main(): number {
  const args = parseArgs(process.argv.slice(2))
  if (args.workorder && !args.batch) {
    console.error('--workorder lookup is planned, but Batch 006 supports --batch as the stable entry point.')
    return 2
  }
  if (!args.batch) {
    console.error(usage())
    return 2
  }

  try {
    const dossier = buildBatchDossier({ batchFile: args.batch })
    if (args.write) {
      const written = writeBatchDossier(dossier)
      if (!args.json) {
        console.log(`Wrote Markdown: ${written.markdownPath}`)
        console.log(`Wrote JSON: ${written.jsonPath}`)
      }
    }
    if (args.json) {
      console.log(JSON.stringify(dossier, null, 2))
    } else {
      console.log(formatBatchDossierMarkdown(dossier))
    }
    return dossier.final_state === 'FIX_REQUIRED' || dossier.final_state === 'STOP_RULE_BLOCKED' ? 1 : 0
  } catch (error) {
    console.error(`batch-dossier failed: ${(error as Error).message}`)
    return 2
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main()
}
