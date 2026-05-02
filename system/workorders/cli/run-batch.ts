/**
 * Batch Loader CLI — dispatch markdown workorder batches via the existing
 * dispatchWorkorder() library, without going through services/scheduler-api/.
 *
 * Usage:
 *   npx tsx system/workorders/cli/run-batch.ts <batch-file>            # dry-run (default)
 *   npx tsx system/workorders/cli/run-batch.ts <batch-file> --dry-run
 *   npx tsx system/workorders/cli/run-batch.ts <batch-file> --run
 *
 * Spec: docs/project/BATCH_LOADER_CLI_V1.md
 * WO:   system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md
 *
 * Exit codes:
 *   0 — success (dry-run schema-valid, or run completed)
 *   1 — schema/parse errors, missing files, or usage error
 *   2 — system stopped, preflight HOLD/REJECT, or batch status not runnable
 *   3 — run paused waiting for approval (HUMAN_NEEDED gate)
 */

import {
  loadBatch,
  formatDryRunReport,
  runDispatch,
  formatPendingApprovalsReport,
} from './batch-loader'

function printUsage(): void {
  console.error(
    'Usage: npx tsx system/workorders/cli/run-batch.ts <batch-file> [--dry-run | --run]\n' +
      '  --dry-run   Default. Parse, validate, sort, list approval needs. No execution.\n' +
      '  --run       Library dispatch in topological order via dispatchWorkorder().\n' +
      '              Pauses on awaiting_approval. Stops on preflight HOLD/REJECT.\n' +
      'Spec: docs/project/BATCH_LOADER_CLI_V1.md',
  )
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  const batchFile = argv[0]
  const mode = argv[1]

  if (!batchFile || batchFile === '-h' || batchFile === '--help') {
    printUsage()
    process.exit(batchFile ? 0 : 1)
  }

  // Safe default: any unknown / missing mode flag falls back to dry-run.
  const isRun = mode === '--run'
  if (mode && mode !== '--dry-run' && mode !== '--run') {
    console.error(
      `[run-batch] Unknown mode "${mode}". Falling back to --dry-run.`,
    )
  }

  // ── Load + report (always runs, even before --run) ────────────────────
  let batch
  try {
    batch = loadBatch(batchFile)
  } catch (e) {
    console.error(`[run-batch] Failed to load batch: ${(e as Error).message}`)
    process.exit(1)
  }

  console.log(formatDryRunReport(batch))

  const hasSchemaErrors = batch.workorders.some(
    (w) => w.validationErrors.length > 0,
  )

  if (!isRun) {
    process.exit(hasSchemaErrors ? 1 : 0)
  }

  // ── --run mode ────────────────────────────────────────────────────────
  if (hasSchemaErrors) {
    console.error(
      '\n[run-batch] Refusing to --run: at least one workorder has schema errors.',
    )
    process.exit(1)
  }

  const runnableStatuses = new Set(['ready_for_approval', 'approved'])
  if (!runnableStatuses.has(batch.status)) {
    console.error(
      `\n[run-batch] Batch status is "${batch.status}". Refusing to --run.\n` +
        '            Only "ready_for_approval" or "approved" batches may be dispatched.',
    )
    process.exit(2)
  }

  console.log('\n═══ Dispatch (library-only, no scheduler-api) ═══\n')
  const outcomes = await runDispatch(batch)
  for (const o of outcomes) {
    console.log(`  ${o.workorder_id}  [${o.status}]  ${o.detail ?? ''}`)
  }

  console.log('\n' + formatPendingApprovalsReport())

  const stopped = outcomes.some(
    (o) =>
      o.status === 'system_stopped' || o.status === 'preflight_blocked',
  )
  const paused = outcomes.some((o) => o.status === 'paused_for_approval')
  const failed = outcomes.some((o) => o.status === 'failed')

  if (stopped) process.exit(2)
  if (paused) process.exit(3)
  if (failed) process.exit(2)
  process.exit(0)
}

main().catch((e) => {
  console.error(`[run-batch] Fatal: ${(e as Error)?.message ?? String(e)}`)
  process.exit(1)
})
