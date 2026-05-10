import fs from 'node:fs'
import path from 'node:path'

import { DEFAULT_BATCH_PATH, type CommandRequest, type GovernanceAction } from './command-allowlist'
import { runGovernanceCommand, type CommandExecution } from './command-runner'
import { findRepoRoot } from './repo-root'
import { productGateText, summaryFromJson, toneFromSummary } from './status'

export type GovernanceSnapshot = {
  generatedAt: string
  repoRoot: string
  projectProfile: {
    project_id: string
    display_name: string
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

function readProjectProfile(repoRoot: string): GovernanceSnapshot['projectProfile'] {
  try {
    const raw = fs.readFileSync(path.join(repoRoot, 'system/project-profiles/profiles/lumeos.json'), 'utf8')
    const profile = JSON.parse(raw) as { project_id?: string; display_name?: string }
    return {
      project_id: profile.project_id ?? 'lumeos',
      display_name: profile.display_name ?? 'LumeOS',
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

export async function buildGovernanceSnapshot(batchPath = DEFAULT_BATCH_PATH): Promise<GovernanceSnapshot> {
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
    projectProfile: readProjectProfile(repoRoot),
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
