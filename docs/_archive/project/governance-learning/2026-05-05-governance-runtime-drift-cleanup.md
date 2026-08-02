# Governance Runtime Drift Cleanup - 2026-05-05

## Purpose

Resolve the high findings reported by the read-only governance invariant checker without manually editing runtime files, deleting run/audit history, granting approvals, or applying product work.

## Starting Point

- Checker result: `critical=0`, `high=7`, `medium=1`.
- Drift classes:
  - stale `dispatched` active workorders pointing to terminal runs.
  - terminal `done` active workorder left in runtime state.
  - stale `review` active workorder pointing to a failed run.
  - stale `awaiting_approval` active workorder without pending or usable approval evidence.
  - checker false positive for failed-runs stop-rule baseline.

## Official Cleanup Paths Used

- `terminal-wo-reset-cli.ts clear`
- `terminal-wo-reset-cli.ts clear-stale-dispatched`
- `terminal-wo-reset-cli.ts clear-expired-approval`
- `terminal-wo-reset-cli.ts clear-stale-review`

Each cleanup used dry-run first and confirm only after one exact target was shown.

## Code Fix

Added minimal official support for stale review cleanup:

- State manager helper: `removeStaleReviewActiveWorkorder`.
- CLI command: `clear-stale-review <workorder_id> --run-id <run_id> [--dry-run | --confirm]`.
- Audit event: `stale_review_workorder_cleanup`.

Also fixed the invariant checker to respect the failed-runs stop-rule baseline instead of counting historical failed runs blindly.

## Validation

- `governance-invariant-check.test.ts`
- `terminal-wo-reset-cli.test.ts`
- `tsc --noEmit`
- Final invariant checker result: `critical=0`, `high=0`, `medium=0`.

## Product Work Gate

BLS import and Nutrition P1-005 remain blocked until Governance Batch 005 is complete or Tom explicitly waives it.
