export type AutonomyFinalState =
  | 'READY_TO_RUN'
  | 'DONE'
  | 'NEEDS_TOM_APPROVAL'
  | 'NEEDS_SAFE_CLEANUP'
  | 'FIX_REQUIRED'
  | 'STOP_RULE_BLOCKED'
  | 'INVARIANT_BLOCKED'
  | 'AGENT_CONTRACT_BLOCKED'
  | 'SPEC_SOURCE_BLOCKED'
  | 'MODEL_RUNTIME_BLOCKED'
  | 'PRODUCT_GATE_BLOCKED'
  | 'DIRTY_WORKTREE'
  | 'NOT_RUN'
  | 'PARTIAL'
  | 'UNKNOWN'

export interface AutonomyProductGateStatus {
  status: string
  reason: string
}

export interface AutonomyHandoffInput {
  finalState: AutonomyFinalState
  batchPath?: string
  diagnosis?: string
  blockerType?: string
  blockers?: string[]
  tomActionRequired?: boolean
  safeCleanupCommand?: string
  dossierCommand?: string
  doctorCommand?: string
  learningRecommended?: boolean
  learningReason?: string
  codexWorkerCandidate?: boolean
  codexWorkerReason?: string
  productGateStatus?: AutonomyProductGateStatus
  nextAction?: string
}

export interface AutonomyHandoff {
  final_state: AutonomyFinalState
  diagnosis: string
  blocker_type: string
  blockers: string[]
  tom_action_required: boolean
  safe_cleanup_available: boolean
  safe_cleanup_command: string
  dossier_recommended: boolean
  dossier_command: string
  doctor_command: string
  learning_recommended: boolean
  learning_record_suggestion: string
  codex_worker_candidate: boolean
  codex_worker_reason: string
  product_gate_status: AutonomyProductGateStatus
  next_action: string
  forbidden_actions: string[]
}

const DEFAULT_FORBIDDEN_ACTIONS = [
  'Do not run product work unless Tom explicitly opens the product gate.',
  'Do not run Supabase db push/reset.',
  'Do not execute migrations.',
  'Do not grant approvals automatically.',
  'Do not manually edit runtime_state.json or queue.json.',
  'Do not commit runtime artifacts.',
]

function defaultBlockerType(finalState: AutonomyFinalState): string {
  if (finalState === 'NEEDS_TOM_APPROVAL') return 'approval'
  if (finalState === 'NEEDS_SAFE_CLEANUP') return 'cleanup'
  if (finalState === 'STOP_RULE_BLOCKED') return 'stop_rules'
  if (finalState === 'INVARIANT_BLOCKED') return 'invariant'
  if (finalState === 'AGENT_CONTRACT_BLOCKED') return 'agent_contract'
  if (finalState === 'SPEC_SOURCE_BLOCKED') return 'spec_source_chain'
  if (finalState === 'MODEL_RUNTIME_BLOCKED') return 'model_runtime'
  if (finalState === 'PRODUCT_GATE_BLOCKED') return 'product_gate'
  if (finalState === 'DIRTY_WORKTREE' || finalState === 'FIX_REQUIRED') return 'fix_required'
  return 'none'
}

function defaultLearningRecommended(finalState: AutonomyFinalState): boolean {
  return [
    'FIX_REQUIRED',
    'STOP_RULE_BLOCKED',
    'INVARIANT_BLOCKED',
    'AGENT_CONTRACT_BLOCKED',
    'SPEC_SOURCE_BLOCKED',
    'MODEL_RUNTIME_BLOCKED',
    'PRODUCT_GATE_BLOCKED',
    'DIRTY_WORKTREE',
  ].includes(finalState)
}

function defaultLearningSuggestion(finalState: AutonomyFinalState, reason?: string): string {
  if (!defaultLearningRecommended(finalState) && !reason) return 'No learning record suggested for normal ready/done/approval/cleanup handoff.'
  return reason ?? 'Review the dossier; if this is an incident or regression, create a governance learning record with fix/test/durable-rule links.'
}

function defaultNextAction(finalState: AutonomyFinalState, fallback?: string): string {
  if (fallback) return fallback
  if (finalState === 'NEEDS_TOM_APPROVAL') return 'Review pending approval details; do not grant automatically.'
  if (finalState === 'NEEDS_SAFE_CLEANUP') return 'Run the safe cleanup dry-run first.'
  if (finalState === 'DONE') return 'Review the dossier before promotion.'
  if (finalState === 'NOT_RUN') return 'Run operator dry-run before execution.'
  if (finalState === 'READY_TO_RUN') return 'Run operator dry-run before continue.'
  return 'Generate or inspect the dossier, then resolve the blocker.'
}

export function buildAutonomyHandoffContract(input: AutonomyHandoffInput): AutonomyHandoff {
  const finalState = input.finalState
  const learningRecommended = input.learningRecommended ?? defaultLearningRecommended(finalState)
  const safeCleanupCommand = input.safeCleanupCommand
  const dossierCommand = input.dossierCommand ?? 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\batch-dossier.ts --batch <batch-file>'
  const doctorCommand = input.doctorCommand ?? 'cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts <batch-file> --doctor'
  return {
    final_state: finalState,
    diagnosis: input.diagnosis ?? finalState,
    blocker_type: input.blockerType ?? defaultBlockerType(finalState),
    blockers: input.blockers ?? [],
    tom_action_required: input.tomActionRequired ?? finalState === 'NEEDS_TOM_APPROVAL',
    safe_cleanup_available: !!safeCleanupCommand,
    safe_cleanup_command: safeCleanupCommand ?? '',
    dossier_recommended: true,
    dossier_command: dossierCommand,
    doctor_command: doctorCommand,
    learning_recommended: learningRecommended,
    learning_record_suggestion: defaultLearningSuggestion(finalState, input.learningReason),
    codex_worker_candidate: input.codexWorkerCandidate ?? false,
    codex_worker_reason: input.codexWorkerReason ?? 'Codex Worker is only appropriate for eligible governance workorders with explicit codex_worker metadata.',
    product_gate_status: input.productGateStatus ?? {
      status: 'blocked',
      reason: 'Product work remains blocked unless Tom explicitly opens it.',
    },
    next_action: defaultNextAction(finalState, input.nextAction),
    forbidden_actions: DEFAULT_FORBIDDEN_ACTIONS,
  }
}
