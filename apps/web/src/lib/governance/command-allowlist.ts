export type GovernanceCommandMode = 'read' | 'controlled'

export type GovernanceAction =
  | 'git.status'
  | 'operator.status'
  | 'operator.dryRun'
  | 'operator.doctor'
  | 'operator.continue'
  | 'operator.continueSafeCleanups'
  | 'invariant.check'
  | 'agentContract.check'
  | 'modelRuntime.check'
  | 'modelRuntime.checkEndpoints'
  | 'specSource.checkBatch'
  | 'learning.check'
  | 'dossier.batch'
  | 'dossier.write'
  | 'promotion.review'
  | 'promotion.merge'
  | 'promotion.pushMain'
  | 'approvals.list'
  | 'approvals.all'

export type CommandRequest = {
  action: GovernanceAction
  batchPath?: string
  branch?: string
  confirmed?: boolean
}

export type CommandDefinition = {
  action: GovernanceAction
  label: string
  mode: GovernanceCommandMode
  controlled: boolean
  description: string
}

export const DEFAULT_BATCH_PATH = 'system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-bls-import-planning.md'

export const COMMAND_DEFINITIONS: Record<GovernanceAction, CommandDefinition> = {
  'git.status': {
    action: 'git.status',
    label: 'Git status',
    mode: 'read',
    controlled: false,
    description: 'Read current branch and worktree state.',
  },
  'operator.status': {
    action: 'operator.status',
    label: 'Operator status',
    mode: 'read',
    controlled: false,
    description: 'Run batch operator status. No mutations.',
  },
  'operator.dryRun': {
    action: 'operator.dryRun',
    label: 'Operator dry-run',
    mode: 'read',
    controlled: false,
    description: 'Validate batch dry-run without dispatch.',
  },
  'operator.doctor': {
    action: 'operator.doctor',
    label: 'Operator doctor',
    mode: 'read',
    controlled: false,
    description: 'Read-only diagnosis with one safe next action.',
  },
  'operator.continue': {
    action: 'operator.continue',
    label: 'Operator continue',
    mode: 'controlled',
    controlled: true,
    description: 'Continue through the operator until the next safe stop.',
  },
  'operator.continueSafeCleanups': {
    action: 'operator.continueSafeCleanups',
    label: 'Operator continue with safe cleanups',
    mode: 'controlled',
    controlled: true,
    description: 'Continue and allow official safe cleanup tools only.',
  },
  'invariant.check': {
    action: 'invariant.check',
    label: 'Invariant check',
    mode: 'read',
    controlled: false,
    description: 'Read-only runtime invariant checker.',
  },
  'agentContract.check': {
    action: 'agentContract.check',
    label: 'Agent contract check',
    mode: 'read',
    controlled: false,
    description: 'Read-only agent and skill contract checker.',
  },
  'modelRuntime.check': {
    action: 'modelRuntime.check',
    label: 'Model runtime check',
    mode: 'read',
    controlled: false,
    description: 'Read-only model routing policy check.',
  },
  'modelRuntime.checkEndpoints': {
    action: 'modelRuntime.checkEndpoints',
    label: 'Model endpoint health',
    mode: 'read',
    controlled: false,
    description: 'Short endpoint health check without prompts.',
  },
  'specSource.checkBatch': {
    action: 'specSource.checkBatch',
    label: 'Spec source chain',
    mode: 'read',
    controlled: false,
    description: 'Read-only source-chain checker for a batch.',
  },
  'learning.check': {
    action: 'learning.check',
    label: 'Learning check',
    mode: 'read',
    controlled: false,
    description: 'Read-only governance learning checker.',
  },
  'dossier.batch': {
    action: 'dossier.batch',
    label: 'Batch dossier',
    mode: 'read',
    controlled: false,
    description: 'Generate dossier output without writing files.',
  },
  'dossier.write': {
    action: 'dossier.write',
    label: 'Write dossier',
    mode: 'controlled',
    controlled: true,
    description: 'Write batch dossier report files.',
  },
  'promotion.review': {
    action: 'promotion.review',
    label: 'Promotion review',
    mode: 'read',
    controlled: false,
    description: 'Review branch merge readiness.',
  },
  'promotion.merge': {
    action: 'promotion.merge',
    label: 'Promotion merge',
    mode: 'controlled',
    controlled: true,
    description: 'Merge branch only after promotion review passes.',
  },
  'promotion.pushMain': {
    action: 'promotion.pushMain',
    label: 'Push main',
    mode: 'controlled',
    controlled: true,
    description: 'Push main to origin when promotion push gate passes.',
  },
  'approvals.list': {
    action: 'approvals.list',
    label: 'Pending approvals',
    mode: 'read',
    controlled: false,
    description: 'List pending approvals. No grants.',
  },
  'approvals.all': {
    action: 'approvals.all',
    label: 'All approvals',
    mode: 'read',
    controlled: false,
    description: 'List approvals by status. No grants.',
  },
}

export const FORBIDDEN_COMMAND_TEXT = [
  'supabase db reset',
  'supabase db push',
  'supabase db push --linked',
  'supabase migration up',
  'migration execution',
  'approval grant without Tom confirmation',
  'manual runtime_state edits',
  'manual queue edits',
  'raw BLS commit',
]

const BATCH_PATH_RE = /^system[\\/]workorders[\\/].+\.md$/i
const BRANCH_RE = /^[A-Za-z0-9._/-]+$/

export function assertKnownAction(action: string): asserts action is GovernanceAction {
  if (!(action in COMMAND_DEFINITIONS)) {
    throw new Error(`Command action is not allowlisted: ${action}`)
  }
}

export function validateBatchPath(batchPath: string): string {
  const normalized = batchPath.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!BATCH_PATH_RE.test(normalized) || normalized.includes('..')) {
    throw new Error(`Batch path must be repo-relative under system/workorders: ${batchPath}`)
  }
  return normalized
}

export function validateBranchName(branch: string): string {
  if (!BRANCH_RE.test(branch) || branch.includes('..') || branch.startsWith('-')) {
    throw new Error(`Invalid branch name: ${branch}`)
  }
  return branch
}

export function requiresConfirmation(action: GovernanceAction): boolean {
  return COMMAND_DEFINITIONS[action].controlled
}
