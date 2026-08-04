import fs from 'node:fs'
import path from 'node:path'

import { DEFAULT_BATCH_PATH, type CommandRequest, type GovernanceAction } from './command-allowlist'
import { runGovernanceCommand, type CommandExecution } from './command-runner'
import { findRepoRoot } from './repo-root'
import { productGateText, summaryFromJson, toneFromSummary } from './status'
import { getProjectProfile } from '../../../../../system/project-profiles/project-profile-loader'

export type GovernanceSnapshot = {
  generatedAt: string
  repoRoot: string
  projectProfile: {
    project_id: string
    display_name: string
    profile_kind?: string
    active?: boolean
    repo_root?: string
    specs_root?: string
    workorders_root?: string
    default_governance_batch?: string
    allowed_domain_paths?: string[]
    docs_entrypoints?: string[]
    raw_data_paths?: string[]
    forbidden_commands?: string[]
    product_gate?: {
      status: string
      reason: string
    }
    codex_worker_policy?: {
      enabled?: boolean
      allowed_agents?: string[]
      require_explicit_workorder_flag?: boolean
      default_timeout_ms?: number
    }
  }
  batchPath: string
  commands: Partial<Record<GovernanceAction, CommandExecution>>
  cards: Array<{
    id: string
    label: string
    value: string
    tone: string
  }>
  docs: {
    handover: string
    learningStatus: string
  }
}

const SNAPSHOT_ACTIONS: GovernanceAction[] = [
  'git.status',
  'invariant.check',
  'agentContract.check',
  'modelRuntime.check',
  'learning.check',
  'approvals.list',
]

function readDoc(repoRoot: string, relativePath: string): string {
  try {
    return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
  } catch {
    return `${relativePath} not found.`
  }
}

export function readProjectProfile(repoRoot: string, projectId = 'lumeos'): GovernanceSnapshot['projectProfile'] {
  try {
    const profile = getProjectProfile(projectId, { repoRoot })
    return {
      project_id: profile.project_id ?? 'lumeos',
      display_name: profile.display_name ?? 'LumeOS',
      profile_kind: profile.profile_kind,
      active: profile.active,
      repo_root: profile.repo_root,
      specs_root: profile.specs_root,
      workorders_root: profile.workorders_root,
      default_governance_batch: profile.default_governance_batch ?? profile.default_operator_batch,
      allowed_domain_paths: profile.allowed_domain_paths,
      docs_entrypoints: profile.docs_entrypoints,
      raw_data_paths: profile.raw_data_paths,
      forbidden_commands: profile.forbidden_commands,
      product_gate: profile.product_gate,
      codex_worker_policy: profile.codex_worker_policy,
    }
  } catch {
    return { project_id: 'lumeos', display_name: 'LumeOS' }
  }
}

function commandValue(result: CommandExecution | undefined): string {
  if (!result) return 'not run'
  if (result.parsedJson) {
    const summary = summaryFromJson(result.parsedJson)
    if (summary) {
      return `critical ${summary.critical ?? 0} / high ${summary.high ?? 0} / medium ${summary.medium ?? 0}`
    }
  }
  if (result.exitCode === 0) return 'ok'
  return `exit ${result.exitCode}`
}

export async function buildGovernanceSnapshot(batchPath = DEFAULT_BATCH_PATH, projectId = 'lumeos'): Promise<GovernanceSnapshot> {
  const commands: Partial<Record<GovernanceAction, CommandExecution>> = {}
  const repoRoot = findRepoRoot()

  for (const action of SNAPSHOT_ACTIONS) {
    try {
      const request: CommandRequest = { action, batchPath }
      commands[action] = await runGovernanceCommand(request, { cwd: repoRoot })
    } catch (error) {
      commands[action] = {
        action,
        command: action,
        args: [],
        exitCode: 2,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        parsedJson: null,
        timestamp: new Date().toISOString(),
      }
    }
  }

  const model = commands['modelRuntime.check']?.parsedJson
  const invariant = commands['invariant.check']?.parsedJson
  const agent = commands['agentContract.check']?.parsedJson
  const learning = commands['learning.check']?.parsedJson

  return {
    generatedAt: new Date().toISOString(),
    repoRoot,
    projectProfile: readProjectProfile(repoRoot, projectId),
    batchPath,
    commands,
    cards: [
      {
        id: 'product-gate',
        label: 'Product Work Gate',
        value: productGateText(model),
        tone: 'blocked',
      },
      {
        id: 'git',
        label: 'Git Status',
        value: commands['git.status']?.stdout.trim().split('\n')[0] ?? 'unknown',
        tone: commands['git.status']?.exitCode === 0 ? 'pass' : 'blocked',
      },
      {
        id: 'invariant',
        label: 'Invariant Status',
        value: commandValue(commands['invariant.check']),
        tone: toneFromSummary(summaryFromJson(invariant)),
      },
      {
        id: 'agent-contract',
        label: 'Agent Contract Status',
        value: commandValue(commands['agentContract.check']),
        tone: toneFromSummary(summaryFromJson(agent)),
      },
      {
        id: 'model-runtime',
        label: 'Model Runtime Status',
        value: commandValue(commands['modelRuntime.check']),
        tone: toneFromSummary(summaryFromJson(model)),
      },
      {
        id: 'learning',
        label: 'Learning Status',
        value: commandValue(commands['learning.check']),
        tone: toneFromSummary(summaryFromJson(learning)),
      },
      {
        id: 'approvals',
        label: 'Pending Approvals',
        value: commands['approvals.list']?.stdout.match(/Pending Approvals \((\d+)\)/)?.[1] ?? 'unknown',
        tone: 'info',
      },
      {
        id: 'next-action',
        label: 'Next Action',
        value: 'Use operator doctor for the selected batch before controlled actions.',
        tone: 'info',
      },
    ],
    docs: {
      handover: readDoc(repoRoot, 'docs/project/CURRENT_GOVERNANCE_HANDOVER.md'),
      learningStatus: readDoc(repoRoot, 'docs/project/governance-learning/CURRENT_LEARNING_STATUS.md'),
    },
  }
}
