import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { AutonomyFinalState } from './autonomy-handoff'

export type GovernanceLearningSuggestionAction =
  | 'none'
  | 'create_incident_record'
  | 'update_existing_learning_record'
  | 'add_regression_test'
  | 'update_handover_or_memory'

export type IncidentCandidateCategory =
  | 'CODEX_WORKER_TIMEOUT'
  | 'CODEX_WORKER_FIX_REQUIRED'
  | 'DISPATCHER_FAILED'
  | 'APPROVAL_SPLIT_BRAIN'
  | 'AWAITING_APPROVAL_WITH_NO_USABLE_TOKEN'
  | 'STOP_RULE_RETRIGGER'
  | 'INVALID_JSON_SPIKE'
  | 'MODEL_RUNTIME_BLOCKED'
  | 'PRODUCT_GATE_FALSE_POSITIVE'
  | 'SPEC_SOURCE_BLOCKED'
  | 'AGENT_CONTRACT_BLOCKED'
  | 'MIGRATION_GUARD_BLOCKED'
  | 'SCOPE_VIOLATION'
  | 'DIRTY_WORKTREE_BLOCKED'
  | 'PROMOTION_BLOCKED'
  | 'OPERATOR_DONE_OUTPUT_MISMATCH'
  | 'RUNTIME_ARTIFACT_COMMIT_RISK'

export type LearningSuggestionSeverity = 'critical' | 'high' | 'medium' | 'low'
export type LearningSuggestionConfidence = 'high' | 'medium' | 'low'

export interface GovernanceLearningSuggestionInput {
  finalState: AutonomyFinalState | string
  blockers?: string[]
  dossierPath?: string
}

export interface GovernanceLearningSuggestion {
  action: GovernanceLearningSuggestionAction
  learning_recommended: boolean
  reason: string
  suggested_record_type: 'none' | 'incident' | 'regression' | 'memory_update'
  suggested_next_step: string
}

export interface IncidentCandidate {
  candidate_id: string
  category: IncidentCandidateCategory
  suggested_incident_id: string
  date: string
  layer: string
  severity: LearningSuggestionSeverity
  status: 'draft'
  trigger_source: string
  root_cause_hypothesis: string
  evidence: string
  likely_fix_area: string
  regression_test_needed: boolean
  suggested_regression_test_file: string
  durable_rule_suggestion: string
  memory_update_needed: boolean
  recurrence_detector_suggestion: string
  product_work_blocked: boolean
  operator_blocked: boolean
  duplicate_of?: string
  confidence: LearningSuggestionConfidence
}

export interface GovernanceLearningSuggestResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  product_gate_status: {
    status: 'blocked' | 'allowed'
    reason: string
  }
  summary: {
    total_candidates: number
    unrecorded_high_or_critical: number
    duplicates: number
  }
  candidates: IncidentCandidate[]
  duplicates: IncidentCandidate[]
  recommended_next_action: string
  exitCode: 0 | 1 | 2
}

export interface GovernanceLearningSuggestOptions {
  repoRoot?: string
  fromDossier?: string
  generatedAt?: string
}

const INCIDENT_STATES = new Set([
  'FIX_REQUIRED',
  'STOP_RULE_BLOCKED',
  'INVARIANT_BLOCKED',
  'AGENT_CONTRACT_BLOCKED',
  'SPEC_SOURCE_BLOCKED',
  'MODEL_RUNTIME_BLOCKED',
  'PRODUCT_GATE_BLOCKED',
  'DIRTY_WORKTREE',
])

const DRAFTS_DIR = 'docs/project/governance-learning/drafts'

function now(): string {
  return new Date().toISOString()
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/')
}

function readIfExists(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
}

function readJsonIfExists(filePath: string): any | null {
  const content = readIfExists(filePath)
  if (!content.trim()) return null
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

function readJsonl(filePath: string): any[] {
  const content = readIfExists(filePath)
  if (!content.trim()) return []
  return content.split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line) } catch { return null }
    })
    .filter(Boolean)
}

function walkFiles(dir: string, predicate: (name: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return []
  const output: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) output.push(...walkFiles(fullPath, predicate))
    else if (predicate(entry.name)) output.push(fullPath)
  }
  return output.sort()
}

export function suggestGovernanceLearning(input: GovernanceLearningSuggestionInput): GovernanceLearningSuggestion {
  const finalState = String(input.finalState)
  if (!INCIDENT_STATES.has(finalState)) {
    return {
      action: 'none',
      learning_recommended: false,
      reason: `${finalState} does not require a learning record by default.`,
      suggested_record_type: 'none',
      suggested_next_step: 'No learning artifact is required unless Tom identifies a new durable lesson.',
    }
  }

  const blockerText = input.blockers?.filter(Boolean).join('; ') || 'No blocker detail provided.'
  return {
    action: 'create_incident_record',
    learning_recommended: true,
    reason: `${finalState} is incident-like and should be reviewed for durable learning. Blockers: ${blockerText}`,
    suggested_record_type: finalState === 'MODEL_RUNTIME_BLOCKED' ? 'regression' : 'incident',
    suggested_next_step: 'Create a governance learning record that links the blocker, fix, validation, and regression test.',
  }
}

function categoryForBlocker(finalState: string, blockerText: string): IncidentCandidateCategory | null {
  const text = `${finalState} ${blockerText}`
  if (/product work gate.*governance smoke|governance smoke.*product work gate/i.test(text)) return 'PRODUCT_GATE_FALSE_POSITIVE'
  if (/PRODUCT_GATE_BLOCKED|product gate/i.test(text)) return 'PRODUCT_GATE_FALSE_POSITIVE'
  if (/SPEC_SOURCE_BLOCKED|source_refs|source chain/i.test(text)) return 'SPEC_SOURCE_BLOCKED'
  if (/AGENT_CONTRACT_BLOCKED|agent contract/i.test(text)) return 'AGENT_CONTRACT_BLOCKED'
  if (/MODEL_RUNTIME_BLOCKED|runtime blocked|endpoint/i.test(text)) return 'MODEL_RUNTIME_BLOCKED'
  if (/DIRTY_WORKTREE|dirty worktree/i.test(text)) return 'DIRTY_WORKTREE_BLOCKED'
  if (/STOP_RULE_BLOCKED|stop rule/i.test(text)) return 'STOP_RULE_RETRIGGER'
  if (/MIGRATION_GUARD|migration guard/i.test(text)) return 'MIGRATION_GUARD_BLOCKED'
  if (/scope violation|files_scope/i.test(text)) return 'SCOPE_VIOLATION'
  if (/approval.*token|no usable token/i.test(text)) return 'AWAITING_APPROVAL_WITH_NO_USABLE_TOKEN'
  if (/promotion/i.test(text)) return 'PROMOTION_BLOCKED'
  if (/DONE.*output|missing expected output/i.test(text)) return 'OPERATOR_DONE_OUTPUT_MISMATCH'
  if (/runtime artifact/i.test(text)) return 'RUNTIME_ARTIFACT_COMMIT_RISK'
  if (/FIX_REQUIRED|failed/i.test(text)) return 'DISPATCHER_FAILED'
  return null
}

function candidateDefaults(category: IncidentCandidateCategory, evidence: string, source: string, generatedAt: string): IncidentCandidate {
  const date = generatedAt.slice(0, 10)
  const suffix = category.toLowerCase().replace(/_/g, '-')
  const layer = category.toLowerCase().replace(/_(blocked|timeout|fix_required|false_positive|spike|risk|mismatch)$/i, '')
  const highCategories = new Set<IncidentCandidateCategory>([
    'CODEX_WORKER_TIMEOUT',
    'CODEX_WORKER_FIX_REQUIRED',
    'DISPATCHER_FAILED',
    'APPROVAL_SPLIT_BRAIN',
    'AWAITING_APPROVAL_WITH_NO_USABLE_TOKEN',
    'STOP_RULE_RETRIGGER',
    'INVALID_JSON_SPIKE',
    'MODEL_RUNTIME_BLOCKED',
    'PRODUCT_GATE_FALSE_POSITIVE',
    'SPEC_SOURCE_BLOCKED',
    'AGENT_CONTRACT_BLOCKED',
    'MIGRATION_GUARD_BLOCKED',
    'SCOPE_VIOLATION',
    'OPERATOR_DONE_OUTPUT_MISMATCH',
  ])
  return {
    candidate_id: `CAND-${date.replace(/-/g, '')}-${suffix}`,
    category,
    suggested_incident_id: `GOV-${date.replace(/-/g, '')}-DRAFT`,
    date,
    layer,
    severity: highCategories.has(category) ? 'high' : 'medium',
    status: 'draft',
    trigger_source: source,
    root_cause_hypothesis: rootCauseFor(category),
    evidence: evidence.slice(0, 1200),
    likely_fix_area: fixAreaFor(category),
    regression_test_needed: highCategories.has(category),
    suggested_regression_test_file: testFileFor(category),
    durable_rule_suggestion: durableRuleFor(category),
    memory_update_needed: highCategories.has(category),
    recurrence_detector_suggestion: recurrenceFor(category),
    product_work_blocked: true,
    operator_blocked: highCategories.has(category),
    confidence: confidenceFor(category, evidence),
  }
}

function rootCauseFor(category: IncidentCandidateCategory): string {
  switch (category) {
    case 'CODEX_WORKER_TIMEOUT': return 'Codex Worker execution exceeded the configured hard timeout or did not return a final-state report.'
    case 'PRODUCT_GATE_FALSE_POSITIVE': return 'Product-gate classification likely matched safety wording instead of explicit product-work metadata.'
    case 'INVALID_JSON_SPIKE': return 'Pipeline metrics show repeated invalid JSON events that may indicate model contract drift.'
    case 'MODEL_RUNTIME_BLOCKED': return 'Runtime health or route readiness blocked operator execution.'
    default: return `${category} was observed in governance outputs and needs root-cause review.`
  }
}

function fixAreaFor(category: IncidentCandidateCategory): string {
  if (category.startsWith('CODEX_WORKER')) return 'system/workers/codex-worker.ts'
  if (category === 'INVALID_JSON_SPIKE') return 'system/control-plane/dispatcher.ts'
  if (category === 'PRODUCT_GATE_FALSE_POSITIVE') return 'system/control-plane/dispatcher.ts'
  if (category === 'MODEL_RUNTIME_BLOCKED') return 'system/control-plane/model-runtime-check.ts'
  if (category === 'SPEC_SOURCE_BLOCKED') return 'system/workorders/cli/spec-source-chain-check.ts'
  if (category === 'AGENT_CONTRACT_BLOCKED') return 'system/control-plane/agent-contract-check.ts'
  return 'governance operator/checker layer'
}

function testFileFor(category: IncidentCandidateCategory): string {
  if (category.startsWith('CODEX_WORKER')) return 'system/workers/__tests__/codex-worker.test.ts'
  if (category === 'INVALID_JSON_SPIKE') return 'system/control-plane/__tests__/dispatcher.test.ts'
  if (category === 'MODEL_RUNTIME_BLOCKED') return 'system/control-plane/__tests__/model-runtime-check.test.ts'
  if (category === 'SPEC_SOURCE_BLOCKED') return 'system/workorders/cli/__tests__/spec-source-chain-check.test.ts'
  if (category === 'AGENT_CONTRACT_BLOCKED') return 'system/control-plane/__tests__/agent-contract-check.test.ts'
  return 'system/workorders/cli/__tests__/batch-operator.test.ts'
}

function durableRuleFor(category: IncidentCandidateCategory): string {
  return `${category} must be captured as Incident -> Root Cause -> Fix -> Regression Test -> Durable Rule -> Memory Update before product gates are opened.`
}

function recurrenceFor(category: IncidentCandidateCategory): string {
  if (category === 'INVALID_JSON_SPIKE') return 'Pipeline metric spike detector should catch repeated invalid_json events.'
  if (category.startsWith('CODEX_WORKER')) return 'Codex Worker tests and runtime reports should catch timeout/final-state regressions.'
  return 'Governance learning suggestion tool should flag recurrence from dossier, audit, and operator outputs.'
}

function confidenceFor(category: IncidentCandidateCategory, evidence: string): LearningSuggestionConfidence {
  if (category === 'PRODUCT_GATE_FALSE_POSITIVE' && /governance smoke/i.test(evidence)) return 'high'
  if (/timeout|FIX_REQUIRED|BLOCKED|invalid_json/i.test(evidence)) return 'high'
  return 'medium'
}

function dossierEvidence(dossier: any): { category: IncidentCandidateCategory | null; evidence: string } {
  const finalState = String(dossier?.final_state ?? dossier?.finalState ?? dossier?.autonomy_handoff?.final_state ?? '')
  const blockers = [
    dossier?.autonomy_handoff?.blocker_type,
    ...(Array.isArray(dossier?.autonomy_handoff?.blockers) ? dossier.autonomy_handoff.blockers : []),
    dossier?.next_action,
  ].filter(Boolean).join('; ')
  return {
    category: categoryForBlocker(finalState, blockers),
    evidence: [finalState, blockers].filter(Boolean).join(' | '),
  }
}

function collectFromDossier(repoRoot: string, fromDossier: string | undefined, generatedAt: string): IncidentCandidate[] {
  if (!fromDossier) return []
  const fullPath = path.isAbsolute(fromDossier) ? fromDossier : path.join(repoRoot, fromDossier)
  const content = readIfExists(fullPath)
  if (!content.trim()) return []
  const parsed = readJsonIfExists(fullPath)
  const evidence = parsed ? dossierEvidence(parsed) : { category: categoryForBlocker(content, content), evidence: content }
  return evidence.category ? [candidateDefaults(evidence.category, evidence.evidence, toPosix(path.relative(repoRoot, fullPath)), generatedAt)] : []
}

function collectFromCodexReports(repoRoot: string, generatedAt: string): IncidentCandidate[] {
  const dir = path.join(repoRoot, 'system/reports/codex-worker')
  return walkFiles(dir, name => name.endsWith('-report.md') || name.endsWith('.md'))
    .flatMap(filePath => {
      const content = readIfExists(filePath)
      const rel = toPosix(path.relative(repoRoot, filePath))
      if (/timed out|timeout/i.test(content)) return [candidateDefaults('CODEX_WORKER_TIMEOUT', content, rel, generatedAt)]
      if (/CODEX_WORKER_FIX_REQUIRED|Final State\s+FIX_REQUIRED|final_state["']?\s*:\s*["']FIX_REQUIRED/i.test(content)) {
        return [candidateDefaults('CODEX_WORKER_FIX_REQUIRED', content, rel, generatedAt)]
      }
      return []
    })
}

function collectFromMetrics(repoRoot: string, generatedAt: string): IncidentCandidate[] {
  const metrics = readJsonl(path.join(repoRoot, 'system/state/pipeline-metrics.jsonl'))
  const invalidJson = metrics.filter(item => /invalid_json/i.test(String(item.event ?? item.status ?? item.outcome ?? '')))
  const humanNeeded = metrics.filter(item => /human_needed/i.test(String(item.event ?? item.status ?? item.outcome ?? '')))
  const candidates: IncidentCandidate[] = []
  if (invalidJson.length >= 3) candidates.push(candidateDefaults('INVALID_JSON_SPIKE', JSON.stringify(invalidJson.slice(-5)), 'system/state/pipeline-metrics.jsonl', generatedAt))
  if (humanNeeded.length >= 3) candidates.push(candidateDefaults('AWAITING_APPROVAL_WITH_NO_USABLE_TOKEN', JSON.stringify(humanNeeded.slice(-5)), 'system/state/pipeline-metrics.jsonl', generatedAt))
  return candidates
}

function collectFromAudit(repoRoot: string, generatedAt: string): IncidentCandidate[] {
  const audit = readJsonl(path.join(repoRoot, 'system/state/audit.jsonl'))
  return audit.flatMap(item => {
    const text = JSON.stringify(item)
    const category = categoryForBlocker(String(item.event ?? ''), text)
    return category ? [candidateDefaults(category, text, 'system/state/audit.jsonl', generatedAt)] : []
  })
}

function collectExistingIncidentText(repoRoot: string): Array<{ file: string; text: string }> {
  const dir = path.join(repoRoot, 'docs/project/governance-learning')
  return walkFiles(dir, name => name.endsWith('.md'))
    .filter(file => !toPosix(file).includes('/drafts/'))
    .map(file => ({ file: toPosix(path.relative(repoRoot, file)), text: readIfExists(file) }))
}

function dedupe(candidates: IncidentCandidate[], repoRoot: string): { candidates: IncidentCandidate[]; duplicates: IncidentCandidate[] } {
  const existing = collectExistingIncidentText(repoRoot)
  const unique: IncidentCandidate[] = []
  const duplicates: IncidentCandidate[] = []
  const seen = new Set<string>()
  for (const candidate of candidates) {
    const key = candidate.category
    if (seen.has(key)) continue
    seen.add(key)
    const duplicate = existing.find(item => matchesExistingIncident(candidate, item.text))
    if (duplicate) {
      duplicates.push({ ...candidate, duplicate_of: duplicate.file })
    } else {
      unique.push(candidate)
    }
  }
  return { candidates: unique, duplicates }
}

function matchesExistingIncident(candidate: IncidentCandidate, existingText: string): boolean {
  if (existingText.includes(candidate.category) || existingText.includes(candidate.root_cause_hypothesis)) return true
  const text = existingText.toLowerCase()
  const evidence = candidate.evidence.toLowerCase()
  const keywordSets: Record<IncidentCandidateCategory, string[]> = {
    CODEX_WORKER_TIMEOUT: ['codex worker', 'timeout'],
    CODEX_WORKER_FIX_REQUIRED: ['codex worker', 'fix_required'],
    DISPATCHER_FAILED: ['dispatcher', 'failed'],
    APPROVAL_SPLIT_BRAIN: ['approval', 'split-brain'],
    AWAITING_APPROVAL_WITH_NO_USABLE_TOKEN: ['approval', 'token'],
    STOP_RULE_RETRIGGER: ['stop-rule', 'retrigger'],
    INVALID_JSON_SPIKE: ['invalid json', 'spike'],
    MODEL_RUNTIME_BLOCKED: ['model runtime', 'blocked'],
    PRODUCT_GATE_FALSE_POSITIVE: ['product gate', 'false positive'],
    SPEC_SOURCE_BLOCKED: ['spec source', 'blocked'],
    AGENT_CONTRACT_BLOCKED: ['agent contract', 'blocked'],
    MIGRATION_GUARD_BLOCKED: ['migration guard', 'blocked'],
    SCOPE_VIOLATION: ['scope', 'violation'],
    DIRTY_WORKTREE_BLOCKED: ['dirty worktree', 'blocked'],
    PROMOTION_BLOCKED: ['promotion', 'blocked'],
    OPERATOR_DONE_OUTPUT_MISMATCH: ['operator', 'done', 'output'],
    RUNTIME_ARTIFACT_COMMIT_RISK: ['runtime artifact', 'commit'],
  }
  const keywords = keywordSets[candidate.category] ?? []
  if (keywords.length > 0 && keywords.every(keyword => text.includes(keyword))) return true
  return evidence.includes('migration_guard') && text.includes('rollback') ||
    evidence.includes('files_scope_violation') && text.includes('scope') ||
    evidence.includes('approval_queue') && text.includes('approval') && text.includes('token') ||
    evidence.includes('invalid_json') && text.includes('invalid_json')
}

export function runGovernanceLearningSuggest(options: GovernanceLearningSuggestOptions = {}): GovernanceLearningSuggestResult {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const generatedAt = options.generatedAt ?? now()
  const collected = [
    ...collectFromDossier(repoRoot, options.fromDossier, generatedAt),
    ...collectFromCodexReports(repoRoot, generatedAt),
    ...collectFromMetrics(repoRoot, generatedAt),
    ...collectFromAudit(repoRoot, generatedAt),
  ]
  const { candidates, duplicates } = dedupe(collected, repoRoot)
  const unrecordedHigh = candidates.filter(item => ['critical', 'high'].includes(item.severity)).length
  return {
    schema_version: 1,
    generated_at: generatedAt,
    repo_root: repoRoot,
    product_gate_status: {
      status: 'blocked',
      reason: 'Product work remains blocked unless Tom explicitly opens it.',
    },
    summary: {
      total_candidates: candidates.length,
      unrecorded_high_or_critical: unrecordedHigh,
      duplicates: duplicates.length,
    },
    candidates,
    duplicates,
    recommended_next_action: candidates.length > 0
      ? 'Review incident candidates and write drafts only when Tom wants learning records prepared.'
      : duplicates.length > 0
        ? 'Review duplicate evidence and update existing records only if it adds durable value.'
        : 'No learning incident draft is required.',
    exitCode: unrecordedHigh > 0 ? 1 : 0,
  }
}

export function writeGovernanceLearningDrafts(result: GovernanceLearningSuggestResult, options: { repoRoot?: string } = {}): string[] {
  const repoRoot = path.resolve(options.repoRoot ?? result.repo_root)
  const draftsDir = path.join(repoRoot, DRAFTS_DIR)
  fs.mkdirSync(draftsDir, { recursive: true })
  return result.candidates.map((candidate, index) => {
    const fileName = `${candidate.date}-${candidate.category.toLowerCase().replace(/_/g, '-')}-${index + 1}.md`
    const fullPath = path.join(draftsDir, fileName)
    fs.writeFileSync(fullPath, formatDraft(candidate), 'utf8')
    return toPosix(path.relative(repoRoot, fullPath))
  })
}

function formatDraft(candidate: IncidentCandidate): string {
  return [
    '# DRAFT - Governance Incident Learning Candidate',
    '',
    'DRAFT - review before promoting to final incident record.',
    '',
    '## Metadata',
    '',
    `- incident_id: ${candidate.suggested_incident_id}`,
    `- date: ${candidate.date}`,
    `- layer: ${candidate.layer}`,
    `- severity: ${candidate.severity}`,
    '- status: draft',
    `- product_work_blocked: ${candidate.product_work_blocked ? 'yes' : 'no'}`,
    `- autonomous_operator_blocked: ${candidate.operator_blocked ? 'yes' : 'no'}`,
    '',
    '## Summary',
    '',
    `${candidate.category} was detected from ${candidate.trigger_source}.`,
    '',
    '## Root Cause',
    '',
    candidate.root_cause_hypothesis,
    '',
    '## Trigger',
    '',
    `- command: ${candidate.trigger_source}`,
    '- workorder:',
    '- run_id:',
    '- approval_id:',
    '- stop_rule:',
    '',
    '## Evidence',
    '',
    candidate.evidence,
    '',
    '## Regression Test',
    '',
    `- test_file: ${candidate.suggested_regression_test_file}`,
    '- test_name:',
    '- command:',
    '',
    '## Durable Rule',
    '',
    '- rule_file: docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md',
    `- rule_text: ${candidate.durable_rule_suggestion}`,
    '',
    '## Memory Update',
    '',
    '- handover_updated: no',
    '- canonical_memory_updated: no',
    '- agent_contract_updated: no',
    '- workorder_template_updated: no',
    '',
    '## Recurrence Detector',
    '',
    candidate.recurrence_detector_suggestion,
    '',
    '## Follow-up',
    '',
    'Review and promote only after fix and regression test are known.',
    '',
  ].join('\n')
}

function parseArgs(args: string[]): { json: boolean; fromDossier?: string; writeDrafts: boolean } {
  const dossierIndex = args.indexOf('--from-dossier')
  return {
    json: args.includes('--json'),
    fromDossier: dossierIndex !== -1 ? args[dossierIndex + 1] : undefined,
    writeDrafts: args.includes('--write-drafts') || args.includes('--write-draft'),
  }
}

function formatReport(result: GovernanceLearningSuggestResult, written: string[]): string {
  const lines = [
    '# Governance Learning Suggestions',
    '',
    `Repo: ${result.repo_root}`,
    `Generated: ${result.generated_at}`,
    `Product gate: ${result.product_gate_status.reason}`,
    '',
    `Summary: candidates=${result.summary.total_candidates}, duplicates=${result.summary.duplicates}, high_or_critical=${result.summary.unrecorded_high_or_critical}`,
    '',
  ]
  if (result.candidates.length === 0) {
    lines.push('No unrecorded incident candidates.')
  } else {
    lines.push('## Candidates')
    for (const candidate of result.candidates) {
      lines.push(`- [${candidate.severity}] ${candidate.category} (${candidate.confidence})`)
      lines.push(`  Evidence: ${candidate.evidence.slice(0, 240)}`)
      lines.push(`  Regression test: ${candidate.suggested_regression_test_file}`)
    }
  }
  if (result.duplicates.length > 0) {
    lines.push('', '## Duplicates')
    for (const duplicate of result.duplicates) {
      lines.push(`- ${duplicate.category} duplicate_of=${duplicate.duplicate_of}`)
    }
  }
  if (written.length > 0) {
    lines.push('', '## Drafts Written')
    lines.push(...written.map(item => `- ${item}`))
  }
  lines.push('', '## Recommended Next Action', result.recommended_next_action)
  return lines.join('\n')
}

function main(): number {
  const opts = parseArgs(process.argv.slice(2))
  try {
    const result = runGovernanceLearningSuggest({ fromDossier: opts.fromDossier })
    const written = opts.writeDrafts ? writeGovernanceLearningDrafts(result) : []
    if (opts.json) {
      console.log(JSON.stringify({ ...result, written_drafts: written.length > 0 ? written : undefined }, null, 2))
    } else {
      console.log(formatReport(result, written))
    }
    return result.exitCode
  } catch (error) {
    const message = (error as Error).message
    if (opts.json) {
      console.log(JSON.stringify({
        schema_version: 1,
        generated_at: now(),
        error: message,
        candidates: [],
        duplicates: [],
        exitCode: 2,
      }, null, 2))
    } else {
      console.error(`governance-learning-suggest error: ${message}`)
    }
    return 2
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main()
}
