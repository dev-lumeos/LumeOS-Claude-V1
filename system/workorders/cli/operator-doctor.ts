import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { OperatorStatus, ApprovalStop, CleanupSuggestion } from './batch-operator'
import { collectOperatorStatus } from './batch-operator'
import { runGovernanceInvariantCheck } from '../../control-plane/governance-invariant-check'
import { runAgentContractCheck } from '../../control-plane/agent-contract-check'
import { runModelRuntimeCheck } from '../../control-plane/model-runtime-check'
import { runSpecSourceChainCheck } from './spec-source-chain-check'
import { loadCodexWorkerConfig, type CodexWorkerConfig } from '../../workers/codex-worker'

export type OperatorDoctorDiagnosis =
  | 'CLEAN_READY'
  | 'NEEDS_TOM_APPROVAL'
  | 'NEEDS_SAFE_CLEANUP'
  | 'STOP_RULE_BLOCKED'
  | 'INVARIANT_BLOCKED'
  | 'AGENT_CONTRACT_BLOCKED'
  | 'MODEL_RUNTIME_BLOCKED'
  | 'MODEL_CONFIG_WARNING'
  | 'MODEL_ENDPOINT_UNREACHABLE'
  | 'MODEL_MISSING'
  | 'JSON_MODE_POLICY_MISSING'
  | 'QWEN_THINKING_POLICY_MISSING'
  | 'SPEC_SOURCE_BLOCKED'
  | 'DIRTY_WORKTREE'
  | 'RUNTIME_ARTIFACTS_PRESENT'
  | 'PRODUCT_GATE_BLOCKED'
  | 'FIX_REQUIRED'
  | 'UNKNOWN'

export interface OperatorDoctorCheckerSummary {
  status: 'pass' | 'warn' | 'fail' | 'not_run' | 'error'
  critical: number
  high: number
  medium: number
  detail?: string
}

export interface OperatorDoctorCheckers {
  invariant: OperatorDoctorCheckerSummary
  agent_contract: OperatorDoctorCheckerSummary
  model_runtime: OperatorDoctorCheckerSummary
  spec_source_chain: OperatorDoctorCheckerSummary
}

export interface OperatorDoctorMemoryStatus {
  current_handover: boolean
  learning_readme: boolean
  learning_schema: boolean
  current_batch_summary: boolean
  warnings?: string[]
}

export interface OperatorDoctorResult {
  schema_version: 1
  generated_at: string
  final_diagnosis: OperatorDoctorDiagnosis
  next_action: string
  next_actions: string[]
  blockers: Array<{ category: OperatorDoctorDiagnosis; message: string; evidence: string; gate: string }>
  approvals: Array<{
    approval_id: string
    workorder_id: string
    run_id: string
    agent: string
    risk_category: string
    action: string
    affected_files: string[]
    classification: string
    review_command: string
  }>
  cleanups: Array<{
    kind: CleanupSuggestion['kind']
    workorder_id: string
    run_id: string
    safe: boolean
    dry_run_command: string
    confirm_command: string
  }>
  checkers: OperatorDoctorCheckers
  codex_worker: {
    status: 'CODEX_WORKER_READY' | 'CODEX_WORKER_DISABLED' | 'CODEX_WORKER_CONFIG_ERROR'
    codex_worker_enabled: boolean
    allow_dispatcher_integration: boolean
    allowed_agents: string[]
    default_timeout_ms: number
  }
  git_status: OperatorStatus['git']
  stop_rules: OperatorStatus['stopRules']
  product_gate: { status: 'blocked' | 'allowed'; reason: string }
  memory: OperatorDoctorMemoryStatus
  safety_notes: string[]
}

interface DiagnoseOptions {
  checkers?: OperatorDoctorCheckers
  memory?: OperatorDoctorMemoryStatus
  productGate?: { status: 'blocked' | 'allowed'; reason: string }
  forceProductGateBlock?: boolean
  generatedAt?: string
}

const TSX = 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs'
const OPERATOR_CLI = 'system\\workorders\\cli\\run-batch-operator.ts'
const INVARIANT_CLI = 'system\\control-plane\\governance-invariant-check.ts'
const AGENT_CONTRACT_CLI = 'system\\control-plane\\agent-contract-check.ts'
const MODEL_RUNTIME_CLI = 'system\\control-plane\\model-runtime-check.ts'
const SPEC_SOURCE_CLI = 'system\\workorders\\cli\\spec-source-chain-check.ts'
const APPROVAL_CLI = 'system\\approval\\approval-cli.ts'

function commandFor(script: string, args = ''): string {
  return `${TSX} ${script}${args ? ` ${args}` : ''}`
}

function defaultChecker(): OperatorDoctorCheckerSummary {
  return { status: 'not_run', critical: 0, high: 0, medium: 0 }
}

function normalizeChecker(result: { summary?: { critical?: number; high?: number; medium?: number }; hasHighOrCriticalFindings?: boolean } | null, error?: unknown): OperatorDoctorCheckerSummary {
  if (error) return { status: 'error', critical: 1, high: 0, medium: 0, detail: (error as Error).message }
  if (!result) return defaultChecker()
  const critical = result.summary?.critical ?? 0
  const high = result.summary?.high ?? 0
  const medium = result.summary?.medium ?? 0
  return {
    status: critical > 0 || high > 0 ? 'fail' : medium > 0 ? 'warn' : 'pass',
    critical,
    high,
    medium,
  }
}

export function collectOperatorDoctorCheckers(batchPath: string): OperatorDoctorCheckers {
  let invariant: OperatorDoctorCheckerSummary
  let agent: OperatorDoctorCheckerSummary
  let spec: OperatorDoctorCheckerSummary
  let modelRuntime: OperatorDoctorCheckerSummary
  try { invariant = normalizeChecker(runGovernanceInvariantCheck()) } catch (error) { invariant = normalizeChecker(null, error) }
  try { agent = normalizeChecker(runAgentContractCheck()) } catch (error) { agent = normalizeChecker(null, error) }
  try { modelRuntime = normalizeChecker(runModelRuntimeCheck({ checkEndpoints: false })) } catch (error) { modelRuntime = normalizeChecker(null, error) }
  try { spec = normalizeChecker(runSpecSourceChainCheck({ batchFile: batchPath })) } catch (error) { spec = normalizeChecker(null, error) }
  return { invariant, agent_contract: agent, model_runtime: modelRuntime, spec_source_chain: spec }
}

export function collectOperatorDoctorMemoryStatus(repoRoot = process.cwd(), batchPath?: string): OperatorDoctorMemoryStatus {
  const currentBatchId = batchPath ? path.basename(batchPath, path.extname(batchPath)).toLowerCase() : ''
  const summaryFiles = fs.existsSync(path.join(repoRoot, 'docs/project/governance-learning'))
    ? fs.readdirSync(path.join(repoRoot, 'docs/project/governance-learning')).filter(name => name.endsWith('.md'))
    : []
  const status: OperatorDoctorMemoryStatus = {
    current_handover: fs.existsSync(path.join(repoRoot, 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md')),
    learning_readme: fs.existsSync(path.join(repoRoot, 'docs/project/governance-learning/README.md')),
    learning_schema: fs.existsSync(path.join(repoRoot, 'docs/project/governance-learning/INCIDENT_LEARNING_SCHEMA.md')),
    current_batch_summary: currentBatchId
      ? summaryFiles.some(name => name.toLowerCase().includes(currentBatchId) || name.toLowerCase().includes('governance-batch-008'))
      : summaryFiles.length > 0,
  }
  const warnings: string[] = []
  if (!status.current_handover) warnings.push('CURRENT_GOVERNANCE_HANDOVER.md is missing.')
  if (!status.learning_readme) warnings.push('governance-learning README is missing.')
  if (!status.learning_schema) warnings.push('incident learning schema is missing.')
  if (!status.current_batch_summary) warnings.push('No current governance batch summary was found.')
  return { ...status, warnings }
}

function checkerBlocks(checker: OperatorDoctorCheckerSummary): boolean {
  return checker.status === 'fail' || checker.status === 'error' || checker.critical > 0 || checker.high > 0
}

function approvalSummary(approval: ApprovalStop): OperatorDoctorResult['approvals'][number] {
  return {
    approval_id: approval.approvalId,
    workorder_id: approval.workorderId,
    run_id: approval.runId,
    agent: approval.agent,
    risk_category: approval.riskCategory,
    action: approval.action,
    affected_files: approval.affectedFiles,
    classification: approval.classification,
    review_command: commandFor(APPROVAL_CLI, `list`),
  }
}

function cleanupSummary(cleanup: CleanupSuggestion): OperatorDoctorResult['cleanups'][number] {
  return {
    kind: cleanup.kind,
    workorder_id: cleanup.workorderId,
    run_id: cleanup.runId,
    safe: cleanup.safeToApply,
    dry_run_command: cleanup.dryRunCommand,
    confirm_command: cleanup.confirmCommand,
  }
}

function runtimeArtifacts(status: OperatorStatus): boolean {
  return status.dirtyArtifacts.some(item =>
    item.category === 'ignored_state_artifacts' ||
    item.category === 'runtime_audit_artifacts',
  )
}

function dirtyWorktree(status: OperatorStatus): boolean {
  return status.unexpectedDirty.length > 0
}

function addBlock(blockers: OperatorDoctorResult['blockers'], category: OperatorDoctorDiagnosis, message: string, evidence: string, gate: string): void {
  blockers.push({ category, message, evidence, gate })
}

function summarizeCodexWorker(config: CodexWorkerConfig): OperatorDoctorResult['codex_worker'] {
  const enabled = config.codex_worker_enabled && config.allow_dispatcher_integration
  return {
    status: enabled ? 'CODEX_WORKER_READY' : 'CODEX_WORKER_DISABLED',
    codex_worker_enabled: config.codex_worker_enabled,
    allow_dispatcher_integration: config.allow_dispatcher_integration,
    allowed_agents: config.allowed_agents,
    default_timeout_ms: config.default_timeout_ms,
  }
}

export function diagnoseOperatorDoctor(status: OperatorStatus, options: DiagnoseOptions = {}): OperatorDoctorResult {
  const checkers = options.checkers ?? {
    invariant: defaultChecker(),
    agent_contract: defaultChecker(),
    model_runtime: defaultChecker(),
    spec_source_chain: defaultChecker(),
  }
  const memory = options.memory ?? collectOperatorDoctorMemoryStatus(process.cwd(), status.batchPath)
  const productGate = options.productGate ?? {
    status: 'blocked',
    reason: 'Product work remains blocked unless Tom explicitly opens it.',
  }
  const blockers: OperatorDoctorResult['blockers'] = []
  let finalDiagnosis: OperatorDoctorDiagnosis = 'UNKNOWN'
  let nextAction = ''

  if (options.forceProductGateBlock) {
    finalDiagnosis = 'PRODUCT_GATE_BLOCKED'
    addBlock(blockers, finalDiagnosis, 'Product work gate is closed.', productGate.reason, 'product_gate')
    nextAction = 'Do not proceed: product gate blocked until Tom explicitly opens or waives it.'
  } else if (status.approvalStops.length > 0) {
    const approval = status.approvalStops[0]
    finalDiagnosis = 'NEEDS_TOM_APPROVAL'
    addBlock(blockers, finalDiagnosis, `Approval ${approval.approvalId} requires Tom review.`, approval.action, 'approval_lifecycle')
    nextAction = `Review approval ${approval.approvalId} for ${approval.workorderId}; do not grant automatically.`
  } else if (status.cleanupSuggestions.some(item => item.safeToApply)) {
    finalDiagnosis = 'NEEDS_SAFE_CLEANUP'
    addBlock(blockers, finalDiagnosis, 'Safe cleanup candidates exist.', `${status.cleanupSuggestions.filter(item => item.safeToApply).length} safe cleanup(s)`, 'cleanup_lifecycle')
    nextAction = commandFor(OPERATOR_CLI, `${status.batchPath} --continue --apply-safe-cleanups`)
  } else if (status.systemStop.active || status.stopRules.anyTriggered) {
    finalDiagnosis = 'STOP_RULE_BLOCKED'
    addBlock(blockers, finalDiagnosis, 'Stop rules are blocking continuation.', status.stopRules.dryRunResult, 'stop_rules')
    nextAction = commandFor('system\\control-plane\\stop-rules.ts', '--dry-run')
  } else if (checkerBlocks(checkers.invariant)) {
    finalDiagnosis = 'INVARIANT_BLOCKED'
    addBlock(blockers, finalDiagnosis, 'Invariant checker has high/critical findings.', JSON.stringify(checkers.invariant), 'invariant_checker')
    nextAction = commandFor(INVARIANT_CLI)
  } else if (checkerBlocks(checkers.agent_contract)) {
    finalDiagnosis = 'AGENT_CONTRACT_BLOCKED'
    addBlock(blockers, finalDiagnosis, 'Agent contract checker has high/critical findings.', JSON.stringify(checkers.agent_contract), 'agent_contract_checker')
    nextAction = commandFor(AGENT_CONTRACT_CLI)
  } else if (checkerBlocks(checkers.model_runtime)) {
    finalDiagnosis = 'MODEL_RUNTIME_BLOCKED'
    addBlock(blockers, finalDiagnosis, 'Model runtime checker has high/critical findings.', JSON.stringify(checkers.model_runtime), 'model_runtime_checker')
    nextAction = commandFor(MODEL_RUNTIME_CLI)
  } else if (checkerBlocks(checkers.spec_source_chain)) {
    finalDiagnosis = 'SPEC_SOURCE_BLOCKED'
    addBlock(blockers, finalDiagnosis, 'Spec source-chain checker has high/critical findings.', JSON.stringify(checkers.spec_source_chain), 'spec_source_chain_checker')
    nextAction = commandFor(SPEC_SOURCE_CLI, `--batch ${status.batchPath}`)
  } else if (dirtyWorktree(status)) {
    finalDiagnosis = 'DIRTY_WORKTREE'
    addBlock(blockers, finalDiagnosis, 'Unexpected dirty worktree entries exist.', status.unexpectedDirty.map(item => `${item.code} ${item.path}`).join(', '), 'git')
    nextAction = 'git status --short --branch'
  } else if (runtimeArtifacts(status)) {
    finalDiagnosis = 'RUNTIME_ARTIFACTS_PRESENT'
    addBlock(blockers, finalDiagnosis, 'Runtime artifacts are present in git status.', status.dirtyArtifacts.map(item => `${item.code} ${item.path}`).join(', '), 'runtime_artifact_policy')
    nextAction = 'Inspect runtime artifacts; do not commit them.'
  } else if (status.activeWorkorders.length > 0 && status.workorderCompletions.some(item => !item.complete)) {
    finalDiagnosis = 'FIX_REQUIRED'
    addBlock(blockers, finalDiagnosis, 'Active workorders remain but no safe cleanup or approval action is available.', status.activeWorkorders.map(item => `${item.workorder_id}:${item.status}`).join(', '), 'operator_lifecycle')
    nextAction = commandFor(OPERATOR_CLI, `${status.batchPath} --status`)
  } else {
    finalDiagnosis = 'CLEAN_READY'
    nextAction = commandFor(OPERATOR_CLI, `${status.batchPath} --dry-run`)
  }

  return {
    schema_version: 1,
    generated_at: options.generatedAt ?? new Date().toISOString(),
    final_diagnosis: finalDiagnosis,
    next_action: nextAction,
    next_actions: [nextAction],
    blockers,
    approvals: status.approvalStops.map(approvalSummary),
    cleanups: status.cleanupSuggestions.map(cleanupSummary),
    checkers,
    codex_worker: summarizeCodexWorker(loadCodexWorkerConfig()),
    git_status: status.git,
    stop_rules: status.stopRules,
    product_gate: productGate,
    memory,
    safety_notes: [
      'Doctor is read-only by default.',
      'Doctor does not dispatch batches.',
      'Doctor does not apply cleanup without the existing operator safe-cleanup flag.',
      'Doctor does not grant approvals.',
      'Doctor does not run Supabase commands or migrations.',
    ],
  }
}

export function formatOperatorDoctorReport(result: OperatorDoctorResult): string {
  const lines: string[] = []
  lines.push('# Governance Operator Doctor')
  lines.push(`Diagnosis: ${result.final_diagnosis}`)
  lines.push(`Next action: ${result.next_action}`)
  lines.push('')
  lines.push('## Blockers')
  if (result.blockers.length === 0) {
    lines.push('(none)')
  } else {
    for (const blocker of result.blockers) {
      lines.push(`- ${blocker.category}: ${blocker.message}`)
      lines.push(`  gate: ${blocker.gate}`)
      lines.push(`  evidence: ${blocker.evidence}`)
    }
  }
  lines.push('')
  lines.push('## Approvals')
  lines.push(result.approvals.length === 0 ? '(none)' : result.approvals.map(item => `- ${item.approval_id} ${item.workorder_id} ${item.classification}`).join('\n'))
  lines.push('')
  lines.push('## Cleanups')
  lines.push(result.cleanups.length === 0 ? '(none)' : result.cleanups.map(item => `- ${item.kind} ${item.workorder_id} run=${item.run_id} safe=${item.safe}`).join('\n'))
  lines.push('')
  lines.push('## Checkers')
  lines.push(`invariant: ${result.checkers.invariant.status} critical=${result.checkers.invariant.critical} high=${result.checkers.invariant.high} medium=${result.checkers.invariant.medium}`)
  lines.push(`agent_contract: ${result.checkers.agent_contract.status} critical=${result.checkers.agent_contract.critical} high=${result.checkers.agent_contract.high} medium=${result.checkers.agent_contract.medium}`)
  lines.push(`model_runtime: ${result.checkers.model_runtime.status} critical=${result.checkers.model_runtime.critical} high=${result.checkers.model_runtime.high} medium=${result.checkers.model_runtime.medium}`)
  lines.push(`spec_source_chain: ${result.checkers.spec_source_chain.status} critical=${result.checkers.spec_source_chain.critical} high=${result.checkers.spec_source_chain.high} medium=${result.checkers.spec_source_chain.medium}`)
  lines.push('')
  lines.push('## Codex Worker')
  lines.push(`${result.codex_worker.status}: enabled=${result.codex_worker.codex_worker_enabled} dispatcher=${result.codex_worker.allow_dispatcher_integration} agents=${result.codex_worker.allowed_agents.join(', ')}`)
  lines.push('')
  lines.push('## Product Gate')
  lines.push(`${result.product_gate.status}: ${result.product_gate.reason}`)
  lines.push('')
  lines.push('## Safety')
  for (const note of result.safety_notes) lines.push(`- ${note}`)
  return lines.join('\n')
}

export function runOperatorDoctor(batchPath: string, opts: { json?: boolean } = {}): { result: OperatorDoctorResult; report: string; exitCode: number } {
  const status = collectOperatorStatus(batchPath)
  const result = diagnoseOperatorDoctor(status, {
    checkers: collectOperatorDoctorCheckers(batchPath),
    memory: collectOperatorDoctorMemoryStatus(process.cwd(), batchPath),
  })
  return {
    result,
    report: opts.json ? JSON.stringify(result, null, 2) : formatOperatorDoctorReport(result),
    exitCode: result.final_diagnosis === 'CLEAN_READY' ? 0 : 2,
  }
}

function main(): number {
  const args = process.argv.slice(2)
  const batchFile = args.find(arg => !arg.startsWith('--'))
  const json = args.includes('--json')
  if (!batchFile) {
    console.error('Usage: npx tsx system/workorders/cli/operator-doctor.ts <batch-file> [--json]')
    return 2
  }
  const result = runOperatorDoctor(batchFile, { json })
  console.log(result.report)
  return result.exitCode
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main()
}
