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

export type MemoryProposalCategory =
  | 'current_truth_update'
  | 'completed_governance_milestone'
  | 'forbidden_action_policy'
  | 'runtime_status_update'
  | 'codex_worker_policy_update'
  | 'project_profile_update'
  | 'ui_governance_update'
  | 'learning_record_update'
  | 'archival_note'

export type MemoryProposalConfidence = 'high' | 'medium' | 'low'

export interface MemoryUpdateProposal {
  proposal_id: string
  created_at: string
  source_refs: string[]
  affected_memory_area: 'current_handover' | 'canonical_memory' | 'governance_learning' | 'agents_docs'
  category: MemoryProposalCategory
  suggested_memory_text: string
  reason: string
  confidence: MemoryProposalConfidence
  safety_classification: 'draft_only_review_required'
  requires_tom_review: true
  forbidden_actions_confirmed: string[]
  stale_or_conflicting_memory_notes: string[]
}

export interface BlockedMemorySuggestion {
  source_ref: string
  reason: 'forbidden_action_policy' | 'unsafe_product_gate' | 'fixture_activation_risk' | 'broad_automation_risk'
  text_excerpt: string
}

export interface MemoryUpdateProposalResult {
  schema_version: 1
  generated_at: string
  repo_root: string
  product_gate_status: {
    status: 'blocked'
    reason: string
  }
  summary: {
    proposals: number
    blocked_suggestions: number
    conflict_notes: number
  }
  proposals: MemoryUpdateProposal[]
  blocked_suggestions: BlockedMemorySuggestion[]
  conflict_notes: string[]
  recommended_next_action: string
  exitCode: 0 | 1 | 2
}

export interface MemoryUpdateProposalOptions {
  repoRoot?: string
  generatedAt?: string
  fromFile?: string
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
const MEMORY_DRAFTS_DIR = 'docs/project/governance-learning/memory-update-drafts'
const FORBIDDEN_ACTIONS_CONFIRMED = [
  'no product work',
  'no Supabase commands',
  'no migration execution',
  'no approval grants',
  'no runtime_state edits',
  'no queue edits',
  'no canonical memory write',
]

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

function repoFile(repoRoot: string, relativePath: string): string {
  return path.join(repoRoot, relativePath)
}

function relativeSource(repoRoot: string, filePath: string): string {
  return toPosix(path.relative(repoRoot, filePath))
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

function excerpt(value: string, limit = 240): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, limit)
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
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

function todoItems(repoRoot: string): any[] {
  const parsed = readJsonIfExists(repoFile(repoRoot, 'docs/project/GOVERNANCE_TODO_REGISTER.json'))
  return Array.isArray(parsed?.items) ? parsed.items : []
}

function recentLearningRecords(repoRoot: string): Array<{ file: string; text: string }> {
  const dir = repoFile(repoRoot, 'docs/project/governance-learning')
  return walkFiles(dir, name => name.endsWith('.md'))
    .filter(file => !toPosix(file).includes('/drafts/') && !toPosix(file).includes('/memory-update-drafts/'))
    .map(file => ({ file: relativeSource(repoRoot, file), text: readIfExists(file) }))
}

function unsafeMemorySuggestion(text: string): BlockedMemorySuggestion['reason'] | null {
  if (/\b(product gate|product work)\s+(is\s+)?open\b/i.test(text)) return 'unsafe_product_gate'
  if (/\b(supabase\s+db\s+(push|reset)|execute\s+migrations?|run\s+migrations?|production\s+db|bls\s+import)\b/i.test(text)) return 'forbidden_action_policy'
  if (/\b(beauty club|fixture-beauty-club).{0,40}\b(active|productive|enabled)\b/i.test(text)) return 'fixture_activation_risk'
  if (/\bbroad\s+codex\s+automation\s+(enabled|allowed|on)\b/i.test(text)) return 'broad_automation_risk'
  return null
}

function unsafeSourceSuggestion(text: string): BlockedMemorySuggestion['reason'] | null {
  if (/\b(product gate|product work)\s+(is\s+)?open\b/i.test(text)) return 'unsafe_product_gate'
  if (/\b(beauty club|fixture-beauty-club).{0,40}\b(active|productive|enabled)\b/i.test(text)) return 'fixture_activation_risk'
  if (/\bbroad\s+codex\s+automation\s+(enabled|allowed|on)\b/i.test(text)) return 'broad_automation_risk'
  return null
}

function makeProposal(params: {
  generatedAt: string
  category: MemoryProposalCategory
  sourceRefs: string[]
  affectedMemoryArea: MemoryUpdateProposal['affected_memory_area']
  text: string
  reason: string
  confidence?: MemoryProposalConfidence
  notes?: string[]
}): MemoryUpdateProposal {
  const idDate = params.generatedAt.slice(0, 10).replace(/-/g, '')
  const slug = params.category.replace(/_/g, '-')
  return {
    proposal_id: `MEM-${idDate}-${slug}`,
    created_at: params.generatedAt,
    source_refs: params.sourceRefs,
    affected_memory_area: params.affectedMemoryArea,
    category: params.category,
    suggested_memory_text: params.text,
    reason: params.reason,
    confidence: params.confidence ?? 'medium',
    safety_classification: 'draft_only_review_required',
    requires_tom_review: true,
    forbidden_actions_confirmed: FORBIDDEN_ACTIONS_CONFIRMED,
    stale_or_conflicting_memory_notes: params.notes ?? [],
  }
}

function addProposal(
  proposals: MemoryUpdateProposal[],
  blocked: BlockedMemorySuggestion[],
  proposal: MemoryUpdateProposal,
): void {
  const unsafe = unsafeMemorySuggestion(proposal.suggested_memory_text)
  if (unsafe) {
    blocked.push({
      source_ref: proposal.source_refs[0] ?? 'unknown',
      reason: unsafe,
      text_excerpt: excerpt(proposal.suggested_memory_text),
    })
    return
  }
  if (!proposals.some(item => item.proposal_id === proposal.proposal_id)) proposals.push(proposal)
}

function collectMemoryConflictNotes(sources: string): string[] {
  const notes: string[] = []
  if (/\b(product gate|product work)\s+(is\s+)?open\b/i.test(sources) && /product work remains closed|product gate.*closed/i.test(sources)) {
    notes.push('Product gate status differs across sources; keep closed unless Tom explicitly opens it.')
  }
  if (/planned_hardware_maintenance|DGX\/Spark devices are installed|rack/i.test(sources)) {
    notes.push('Runtime status is maintenance-related; proposals must require recheck after hardware maintenance.')
  }
  if (/\b(beauty club|fixture-beauty-club).{0,40}\b(active|productive|enabled)\b/i.test(sources)) {
    notes.push('Beauty Club fixture appears confused with an active project; keep it fixture-only until Tom supplies a real repo path and policy.')
  }
  if (/\bbroad\s+codex\s+automation\s+(enabled|allowed|on)\b/i.test(sources)) {
    notes.push('Broad Codex automation is implied in a source; keep Codex Worker controlled and gated.')
  }
  if (/GOV-TODO-\d+[\s\S]{0,200}"status":\s*"done"[\s\S]{0,200}status.*open/i.test(sources)) {
    notes.push('A TODO may be marked done in one source and open elsewhere; review TODO/register consistency.')
  }
  return notes
}

export function runMemoryUpdateProposalMode(options: MemoryUpdateProposalOptions = {}): MemoryUpdateProposalResult {
  const repoRoot = path.resolve(options.repoRoot ?? process.cwd())
  const generatedAt = options.generatedAt ?? now()
  const handoverPath = repoFile(repoRoot, 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md')
  const todoPath = repoFile(repoRoot, 'docs/project/GOVERNANCE_TODO_REGISTER.json')
  const handover = readIfExists(handoverPath)
  const todos = todoItems(repoRoot)
  const learningRecords = recentLearningRecords(repoRoot)
  const explicitFile = options.fromFile ? (path.isAbsolute(options.fromFile) ? options.fromFile : repoFile(repoRoot, options.fromFile)) : undefined
  const explicitText = explicitFile ? readIfExists(explicitFile) : ''
  const sourceText = [
    handover,
    JSON.stringify(todos),
    ...learningRecords.map(item => item.text),
    explicitText,
  ].join('\n')
  const conflictNotes = collectMemoryConflictNotes(sourceText)
  const proposals: MemoryUpdateProposal[] = []
  const blocked: BlockedMemorySuggestion[] = []
  const sourceUnsafe = unsafeSourceSuggestion(sourceText)
  if (sourceUnsafe) {
    blocked.push({
      source_ref: 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md',
      reason: sourceUnsafe,
      text_excerpt: excerpt(sourceText),
    })
  }

  if (/product work remains closed|product gate.*closed/i.test(sourceText)) {
    addProposal(proposals, blocked, makeProposal({
      generatedAt,
      category: 'current_truth_update',
      sourceRefs: ['docs/project/CURRENT_GOVERNANCE_HANDOVER.md'],
      affectedMemoryArea: 'current_handover',
      text: 'Current governance truth: product work remains closed unless Tom explicitly opens it; no Supabase/db/migration/approval-grant work is authorized by learning or memory proposal tooling.',
      reason: 'Keep the current truth explicit after recent governance automation work.',
      confidence: 'high',
      notes: conflictNotes.filter(item => /Product gate/i.test(item)),
    }))
  }

  const doneTodos = todos.filter(item => item?.status === 'done')
  for (const item of doneTodos.slice(-5)) {
    addProposal(proposals, blocked, makeProposal({
      generatedAt,
      category: 'completed_governance_milestone',
      sourceRefs: ['docs/project/GOVERNANCE_TODO_REGISTER.json', ...asStringArray(item.source_files).slice(0, 3)],
      affectedMemoryArea: 'current_handover',
      text: `Completed governance milestone: ${item.title}. Evidence: ${item.evidence}`,
      reason: `TODO ${item.id} is marked done and may need a reviewed handover/current-memory note.`,
      confidence: 'medium',
    }))
  }

  if (/planned_hardware_maintenance|DGX\/Spark|rack installation/i.test(sourceText)) {
    addProposal(proposals, blocked, makeProposal({
      generatedAt,
      category: 'runtime_status_update',
      sourceRefs: ['docs/project/CURRENT_GOVERNANCE_HANDOVER.md'],
      affectedMemoryArea: 'current_handover',
      text: 'Runtime status: DGX/Spark endpoint failures during rack installation are planned_hardware_maintenance, not routing defects; runtime-dependent autonomous/night/large runs require fresh recheck after maintenance.',
      reason: 'Prevent stale runtime history or powered-down hardware from being misclassified as a routing failure.',
      confidence: 'high',
      notes: conflictNotes.filter(item => /Runtime status/i.test(item)),
    }))
  }

  if (/codex worker|controlled_enabled|senior-reviewer-agent|senior-coding-agent/i.test(sourceText)) {
    addProposal(proposals, blocked, makeProposal({
      generatedAt,
      category: 'codex_worker_policy_update',
      sourceRefs: ['docs/project/CURRENT_GOVERNANCE_HANDOVER.md', 'docs/project/CODEX_WORKER_BRIDGE.md'],
      affectedMemoryArea: 'current_handover',
      text: 'Codex Worker policy: Codex/GPT-5.5 is controlled-enabled only for gated senior governance agents with complete metadata, explicit codex_worker opt-in, closed product gate enforcement, and no broad automation.',
      reason: 'Codex Worker routing changed from manual bridge to controlled senior governance path and should remain explicit in memory proposals.',
      confidence: 'high',
      notes: conflictNotes.filter(item => /Codex/i.test(item)),
    }))
  }

  if (/fixture-beauty-club|Project Profiles|second-project fixture/i.test(sourceText)) {
    addProposal(proposals, blocked, makeProposal({
      generatedAt,
      category: 'project_profile_update',
      sourceRefs: ['docs/project/CURRENT_GOVERNANCE_HANDOVER.md', 'docs/project/PROJECT_PROFILES.md'],
      affectedMemoryArea: 'current_handover',
      text: 'Project Profiles status: LumeOS remains the active default profile; fixture-beauty-club is an inactive portability fixture only and must not be treated as active product work.',
      reason: 'Avoid confusing the second-project fixture with a real Beauty Club project.',
      confidence: 'high',
      notes: conflictNotes.filter(item => /Beauty Club/i.test(item)),
    }))
  }

  if (/Governance UI|browser smoke|ui:smoke/i.test(sourceText)) {
    addProposal(proposals, blocked, makeProposal({
      generatedAt,
      category: 'ui_governance_update',
      sourceRefs: ['docs/project/CURRENT_GOVERNANCE_HANDOVER.md', 'docs/project/GOVERNANCE_UI_V2.md'],
      affectedMemoryArea: 'current_handover',
      text: 'Governance UI status: browser smoke coverage exists for local /governance routes and must not require DGX/Spark endpoint checks or product gate opening.',
      reason: 'Keep UI validation expectations recoverable without reading chat history.',
      confidence: 'medium',
    }))
  }

  if (learningRecords.length > 0) {
    const latest = learningRecords.slice(-1)[0]
    addProposal(proposals, blocked, makeProposal({
      generatedAt,
      category: 'learning_record_update',
      sourceRefs: [latest.file],
      affectedMemoryArea: 'governance_learning',
      text: `Learning status: recent governance learning records exist and memory updates must remain reviewed drafts, not automatic canonical-memory writes. Latest source: ${latest.file}.`,
      reason: 'Learning records can imply handover/canonical updates, but those updates must stay review-gated.',
      confidence: 'medium',
    }))
  }

  if (explicitText.trim()) {
    const sourceRef = explicitFile ? relativeSource(repoRoot, explicitFile) : 'explicit-input'
    const unsafe = unsafeMemorySuggestion(explicitText)
    if (unsafe) {
      blocked.push({ source_ref: sourceRef, reason: unsafe, text_excerpt: excerpt(explicitText) })
    } else {
      addProposal(proposals, blocked, makeProposal({
        generatedAt,
        category: 'archival_note',
        sourceRefs: [sourceRef],
        affectedMemoryArea: 'current_handover',
        text: `Reviewed source may need an archival note: ${excerpt(explicitText, 320)}`,
        reason: 'Explicit input was supplied for memory proposal review.',
        confidence: 'low',
      }))
    }
  }

  return {
    schema_version: 1,
    generated_at: generatedAt,
    repo_root: repoRoot,
    product_gate_status: {
      status: 'blocked',
      reason: 'Product work remains blocked unless Tom explicitly opens it.',
    },
    summary: {
      proposals: proposals.length,
      blocked_suggestions: blocked.length,
      conflict_notes: conflictNotes.length,
    },
    proposals,
    blocked_suggestions: blocked,
    conflict_notes: conflictNotes,
    recommended_next_action: proposals.length > 0
      ? 'Review memory update proposals and write drafts only for Tom-reviewed handover/canonical updates.'
      : 'No memory update proposal is required.',
    exitCode: blocked.length > 0 ? 1 : 0,
  }
}

export function writeMemoryUpdateDrafts(result: MemoryUpdateProposalResult, options: { repoRoot?: string } = {}): string[] {
  const repoRoot = path.resolve(options.repoRoot ?? result.repo_root)
  const draftsDir = repoFile(repoRoot, MEMORY_DRAFTS_DIR)
  fs.mkdirSync(draftsDir, { recursive: true })
  return result.proposals.map((proposal, index) => {
    const fileName = `${proposal.created_at.slice(0, 10)}-${proposal.category.replace(/_/g, '-')}-${index + 1}.md`
    const fullPath = path.join(draftsDir, fileName)
    fs.writeFileSync(fullPath, formatMemoryDraft(proposal), 'utf8')
    return relativeSource(repoRoot, fullPath)
  })
}

function formatMemoryDraft(proposal: MemoryUpdateProposal): string {
  return [
    '# DRAFT - Memory Update Proposal',
    '',
    'DRAFT - Tom review required before applying to handover, canonical memory, AGENTS.md, CLAUDE.md, or external memory.',
    '',
    '## Metadata',
    '',
    `- proposal_id: ${proposal.proposal_id}`,
    `- created_at: ${proposal.created_at}`,
    `- category: ${proposal.category}`,
    `- affected_memory_area: ${proposal.affected_memory_area}`,
    `- confidence: ${proposal.confidence}`,
    `- safety_classification: ${proposal.safety_classification}`,
    `- requires_tom_review: ${proposal.requires_tom_review}`,
    '',
    '## Source Refs',
    '',
    ...proposal.source_refs.map(item => `- ${item}`),
    '',
    '## Suggested Memory Text',
    '',
    proposal.suggested_memory_text,
    '',
    '## Reason',
    '',
    proposal.reason,
    '',
    '## Safety',
    '',
    ...proposal.forbidden_actions_confirmed.map(item => `- ${item}`),
    '',
    '## Stale Or Conflicting Memory Notes',
    '',
    ...(proposal.stale_or_conflicting_memory_notes.length > 0
      ? proposal.stale_or_conflicting_memory_notes.map(item => `- ${item}`)
      : ['- none detected']),
    '',
    '## Apply Procedure',
    '',
    'Do not apply automatically. Tom or a reviewed governance task must decide whether and where to apply this text.',
    '',
  ].join('\n')
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

function parseArgs(args: string[]): { json: boolean; fromDossier?: string; fromFile?: string; writeDrafts: boolean; memoryProposals: boolean } {
  const dossierIndex = args.indexOf('--from-dossier')
  const fileIndex = args.indexOf('--from-file')
  return {
    json: args.includes('--json'),
    fromDossier: dossierIndex !== -1 ? args[dossierIndex + 1] : undefined,
    fromFile: fileIndex !== -1 ? args[fileIndex + 1] : undefined,
    writeDrafts: args.includes('--write-drafts') || args.includes('--write-draft'),
    memoryProposals: args.includes('--memory-proposals') || args.includes('--memory-proposal'),
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
    if (opts.memoryProposals) {
      const result = runMemoryUpdateProposalMode({ fromFile: opts.fromFile })
      const written = opts.writeDrafts ? writeMemoryUpdateDrafts(result) : []
      if (opts.json) {
        console.log(JSON.stringify({ ...result, written_drafts: written.length > 0 ? written : undefined }, null, 2))
      } else {
        console.log(formatMemoryProposalReport(result, written))
      }
      return result.exitCode
    }
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

function formatMemoryProposalReport(result: MemoryUpdateProposalResult, written: string[]): string {
  const lines = [
    '# Memory Update Proposals',
    '',
    `Repo: ${result.repo_root}`,
    `Generated: ${result.generated_at}`,
    `Product gate: ${result.product_gate_status.reason}`,
    '',
    `Summary: proposals=${result.summary.proposals}, blocked=${result.summary.blocked_suggestions}, conflicts=${result.summary.conflict_notes}`,
    '',
  ]
  if (result.proposals.length === 0) {
    lines.push('No memory update proposals.')
  } else {
    lines.push('## Proposals')
    for (const proposal of result.proposals) {
      lines.push(`- [${proposal.confidence}] ${proposal.category} -> ${proposal.affected_memory_area}`)
      lines.push(`  ${proposal.suggested_memory_text}`)
    }
  }
  if (result.blocked_suggestions.length > 0) {
    lines.push('', '## Blocked Suggestions')
    for (const item of result.blocked_suggestions) {
      lines.push(`- ${item.reason} from ${item.source_ref}: ${item.text_excerpt}`)
    }
  }
  if (result.conflict_notes.length > 0) {
    lines.push('', '## Conflict Notes')
    lines.push(...result.conflict_notes.map(item => `- ${item}`))
  }
  if (written.length > 0) {
    lines.push('', '## Drafts Written')
    lines.push(...written.map(item => `- ${item}`))
  }
  lines.push('', '## Recommended Next Action', result.recommended_next_action)
  return lines.join('\n')
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main()
}
