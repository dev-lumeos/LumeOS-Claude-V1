/**
 * Governance batch operator CLI.
 *
 * Safe modes:
 *   --status    read-only state report
 *   --doctor    read-only diagnosis and one safe next action
 *   --dry-run   batch dry-run only, no dispatch
 *   --continue  proceed until next safe stop
 *   --continue --apply-safe-cleanups  run official cleanup CLIs only
 */

import {
  buildOperatorReport,
  collectOperatorStatus,
  continueBatch,
  runDryRun,
} from './batch-operator'
import { runOperatorDoctor } from './operator-doctor'
import { parseRequestedOrchestrationMode } from './orchestration-mode'

function usage(): string {
  return [
    'Usage: npx tsx system/workorders/cli/run-batch-operator.ts <batch-file> [--status | --doctor | --dry-run | --continue] [--json] [--apply-safe-cleanups] [--project <id>] [--orchestration-mode <auto|codex_bootstrap|spark1_orchestrated>]',
    '',
    'Modes:',
    '  --status                  Read-only operator status. No mutations.',
    '  --doctor                  Read-only diagnosis with exactly one safe next action.',
    '  --dry-run                 Batch parser/validator dry-run only. No dispatch.',
    '  --continue                Proceed until next safe stop.',
    '  --continue --apply-safe-cleanups',
    '                            May run only official cleanup tools after safe dry-run proof.',
    '',
    'Orchestration modes:',
    '  auto                      Default. The operator chooses and reports the path.',
    '  codex_bootstrap           Codex may bootstrap/orchestrate while obeying all gates.',
    '  spark1_orchestrated       Requires Spark1/orchestrator-agent handoff before worker assignment; fail closed if unavailable.',
  ].join('\n')
}

async function main(): Promise<number> {
  const args = process.argv.slice(2)
  const batchFile = args[0]
  if (!batchFile || batchFile === '--help' || batchFile === '-h') {
    console.log(usage())
    return batchFile ? 0 : 1
  }

  const modeFlags = args.slice(1).filter(a => a === '--status' || a === '--doctor' || a === '--dry-run' || a === '--continue')
  const applySafeCleanups = args.includes('--apply-safe-cleanups')
  const json = args.includes('--json')
  const projectIndex = args.indexOf('--project')
  const projectId = projectIndex !== -1 ? args[projectIndex + 1] : 'lumeos'
  const orchestrationIndex = args.indexOf('--orchestration-mode')
  const orchestrationValue = orchestrationIndex !== -1 ? args[orchestrationIndex + 1] : 'auto'
  let orchestrationMode: ReturnType<typeof parseRequestedOrchestrationMode>
  try {
    orchestrationMode = parseRequestedOrchestrationMode(orchestrationValue)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    return 1
  }
  if (projectIndex !== -1 && (!projectId || projectId.startsWith('--'))) {
    console.error('--project requires an id')
    return 1
  }
  if (orchestrationIndex !== -1 && (!orchestrationValue || orchestrationValue.startsWith('--'))) {
    console.error('--orchestration-mode requires one of: auto, codex_bootstrap, spark1_orchestrated')
    return 1
  }
  const unknown = args.slice(1).filter((a, index) => {
    const absoluteIndex = index + 1
    return !['--status', '--doctor', '--dry-run', '--continue', '--apply-safe-cleanups', '--json', '--project', '--orchestration-mode'].includes(a) &&
      absoluteIndex !== projectIndex + 1 &&
      absoluteIndex !== orchestrationIndex + 1
  })
  if (unknown.length > 0) {
    console.error(`Unknown flag(s): ${unknown.join(', ')}`)
    console.error(usage())
    return 1
  }
  if (modeFlags.length > 1) {
    console.error(`Choose exactly one mode, got: ${modeFlags.join(', ')}`)
    return 1
  }

  const mode = modeFlags[0] ?? '--status'
  if (applySafeCleanups && mode !== '--continue') {
    console.error('--apply-safe-cleanups is only valid with --continue')
    return 1
  }
  if (json && mode !== '--doctor') {
    console.error('--json is only supported with --doctor')
    return 1
  }

  if (mode === '--status') {
    const status = collectOperatorStatus(batchFile, { projectId, orchestrationMode })
    console.log(buildOperatorReport(status))
    return 0
  }

  if (mode === '--dry-run') {
    const result = await runDryRun(batchFile, { orchestrationMode })
    console.log(result.report)
    return result.exitCode
  }

  if (mode === '--doctor') {
    const result = runOperatorDoctor(batchFile, { json, projectId, orchestrationMode })
    console.log(result.report)
    return result.exitCode
  }

  const result = await continueBatch(batchFile, { applySafeCleanups, projectId, orchestrationMode })
  console.log(result.report)
  return result.exitCode
}

main()
  .then(code => process.exit(code))
  .catch(error => {
    console.error(`run-batch-operator failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
