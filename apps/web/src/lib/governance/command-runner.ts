import { spawn, type SpawnOptionsWithoutStdio } from 'node:child_process'
import path from 'node:path'

import {
  DEFAULT_BATCH_PATH,
  DEFAULT_PROJECT_PROFILE,
  assertKnownAction,
  requiresConfirmation,
  validateBatchPath,
  validateBranchName,
  type CommandRequest,
  type GovernanceAction,
} from './command-allowlist'
import { findRepoRoot } from './repo-root'
import { parseJsonFromStdout, redactSecrets } from './redact'

export type CommandExecution = {
  action: GovernanceAction
  command: string
  args: string[]
  exitCode: number
  stdout: string
  stderr: string
  parsedJson: unknown | null
  timestamp: string
}

export type CommandPlan = {
  action: GovernanceAction
  command: string
  args: string[]
}

const TSX = path.join('node_modules', 'tsx', 'dist', 'cli.mjs')

export function commandPlanFor(request: CommandRequest): CommandPlan {
  assertKnownAction(request.action)

  if (requiresConfirmation(request.action) && !request.confirmed) {
    throw new Error(`Controlled action requires explicit confirmation: ${request.action}`)
  }

  const batchPath = validateBatchPath(request.batchPath ?? DEFAULT_BATCH_PATH)
  const nodeArgs = [TSX]

  switch (request.action) {
    case 'git.status':
      return { action: request.action, command: 'git', args: ['status', '--short', '--branch'] }
    case 'operator.status':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/workorders/cli/run-batch-operator.ts', batchPath, '--status', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'operator.dryRun':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/workorders/cli/run-batch-operator.ts', batchPath, '--dry-run', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'operator.doctor':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/workorders/cli/run-batch-operator.ts', batchPath, '--doctor', '--json', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'operator.continue':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/workorders/cli/run-batch-operator.ts', batchPath, '--continue', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'operator.continueSafeCleanups':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/workorders/cli/run-batch-operator.ts', batchPath, '--continue', '--apply-safe-cleanups', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'invariant.check':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/control-plane/governance-invariant-check.ts', '--json', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'agentContract.check':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/control-plane/agent-contract-check.ts', '--json'] }
    case 'modelRuntime.check':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/control-plane/model-runtime-check.ts', '--json'] }
    case 'modelRuntime.checkEndpoints':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/control-plane/model-runtime-check.ts', '--check-endpoints', '--timeout-ms', '1500', '--json'] }
    case 'specSource.checkBatch':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/workorders/cli/spec-source-chain-check.ts', '--batch', batchPath, '--json', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'learning.check':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/reports/governance-learning-check.ts', '--json', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'dossier.batch':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/reports/batch-dossier.ts', '--batch', batchPath, '--json', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'dossier.write':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/reports/batch-dossier.ts', '--batch', batchPath, '--write', '--project', DEFAULT_PROJECT_PROFILE] }
    case 'promotion.review': {
      const branch = validateBranchName(request.branch ?? 'goal/governance-ui-v1')
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/control-plane/promotion-governance.ts', '--review-branch', branch, '--json', '--project', DEFAULT_PROJECT_PROFILE] }
    }
    case 'promotion.merge': {
      const branch = validateBranchName(request.branch ?? 'goal/governance-ui-v1')
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/control-plane/promotion-governance.ts', '--merge-branch', branch, '--json', '--project', DEFAULT_PROJECT_PROFILE] }
    }
    case 'promotion.pushMain':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/control-plane/promotion-governance.ts', '--push-main', '--json'] }
    case 'approvals.list':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/approval/approval-cli.ts', 'list'] }
    case 'approvals.all':
      return { action: request.action, command: process.execPath, args: [...nodeArgs, 'system/approval/approval-cli.ts', 'all'] }
  }
}

export async function runGovernanceCommand(
  request: CommandRequest,
  options: Pick<SpawnOptionsWithoutStdio, 'cwd'> = {},
): Promise<CommandExecution> {
  const plan = commandPlanFor(request)
  const cwd = typeof options.cwd === 'string' ? options.cwd : findRepoRoot()
  const startedAt = new Date().toISOString()

  const result = await new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(plan.command, plan.args, { cwd, shell: false, windowsHide: true })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', chunk => { stdout += String(chunk) })
    child.stderr.on('data', chunk => { stderr += String(chunk) })
    child.on('error', reject)
    child.on('close', code => resolve({ exitCode: code ?? 1, stdout, stderr }))
  })

  const stdout = redactSecrets(result.stdout)
  const stderr = redactSecrets(result.stderr)

  return {
    action: plan.action,
    command: [plan.command, ...plan.args].join(' '),
    args: plan.args,
    exitCode: result.exitCode,
    stdout,
    stderr,
    parsedJson: parseJsonFromStdout(stdout),
    timestamp: startedAt,
  }
}
