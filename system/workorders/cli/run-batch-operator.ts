/**
 * Governance batch operator CLI.
 *
 * Safe modes:
 *   --status    read-only state report
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

function usage(): string {
  return [
    'Usage: npx tsx system/workorders/cli/run-batch-operator.ts <batch-file> [--status | --dry-run | --continue] [--apply-safe-cleanups]',
    '',
    'Modes:',
    '  --status                  Read-only operator status. No mutations.',
    '  --dry-run                 Batch parser/validator dry-run only. No dispatch.',
    '  --continue                Proceed until next safe stop.',
    '  --continue --apply-safe-cleanups',
    '                            May run only official cleanup tools after safe dry-run proof.',
  ].join('\n')
}

async function main(): Promise<number> {
  const args = process.argv.slice(2)
  const batchFile = args[0]
  if (!batchFile || batchFile === '--help' || batchFile === '-h') {
    console.log(usage())
    return batchFile ? 0 : 1
  }

  const modeFlags = args.slice(1).filter(a => a === '--status' || a === '--dry-run' || a === '--continue')
  const applySafeCleanups = args.includes('--apply-safe-cleanups')
  const unknown = args.slice(1).filter(a =>
    !['--status', '--dry-run', '--continue', '--apply-safe-cleanups'].includes(a),
  )
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

  if (mode === '--status') {
    const status = collectOperatorStatus(batchFile)
    console.log(buildOperatorReport(status))
    return 0
  }

  if (mode === '--dry-run') {
    const result = await runDryRun(batchFile)
    console.log(result.report)
    return result.exitCode
  }

  const result = await continueBatch(batchFile, { applySafeCleanups })
  console.log(result.report)
  return result.exitCode
}

main()
  .then(code => process.exit(code))
  .catch(error => {
    console.error(`run-batch-operator failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
