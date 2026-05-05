# Current Governance Handover

## Status

Current date: 2026-05-05.

`main` is pushed through Nutrition P1-004 schema verification. The current governance work is on branch `goal/governance-gap-analysis-plan`.

## Current Truth

- Governance Batch Operator exists and is the preferred way to run workorder batches.
- Operator modes:
  - `--status`
  - `--dry-run`
  - `--continue`
  - `--continue --apply-safe-cleanups`
- Nutrition Batch 001 reached operator `DONE`.
- Nutrition P1-004 schema verification reached `DONE` and is pushed to `origin/main`.
- Raw BLS files are local-only and ignored.
- Supabase `db push`, `db reset`, production DB commands, and migration execution remain forbidden unless Tom explicitly runs them outside the worker/operator flow.

## Read First

Use these files before starting more governance or product work:

- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- `docs/project/governance-learning/README.md`
- `docs/project/governance-learning/INCIDENT_LEARNING_SCHEMA.md`
- `AGENTS.md`
- `CLAUDE.md`
- `system/memory/canonical/lumeos_canonical.md`

Treat `system/memory/canonical/lumeos_canonical.md` as stale where it claims all governance blocks are complete. The completion plan is the newer truth for governance gaps.

## Current Product Work Gate

BLS import and Nutrition P1-005 product work are blocked until at least Governance Batch 002 is completed and Governance Batch 003 is completed or explicitly waived by Tom.

Reason:

- Memory and learning are not yet workflow-enforced.
- Runtime invariant checking is not yet available as a standalone read-only checker.
- Recent incidents are fixed in code/tests, but not durably recorded as incident learning records.

## Safe Next Governance Batch

Governance Batch 002 - Memory & Learning Foundation.

Goal:

- Define durable memory locations.
- Define learning record schema.
- Create incident-to-regression checklist.
- Establish Incident -> Fix -> Test -> Rule -> Memory workflow.
- Require current handover updates after every governance batch.

## Do Not Do

- Do not start Nutrition P1-005 BLS import.
- Do not grant approvals automatically.
- Do not run Supabase `db push` or `db reset`.
- Do not execute migrations.
- Do not edit `system/state/runtime_state.json` or `system/approval/queue.json` manually.
- Do not commit runtime artifacts.
- Do not use raw BLS files as primary schema source when a current spec exists.

## Recent Incidents To Remember

- No-tool success left active workorders open.
- Scheduler collapsed blocked/awaiting approval into failed.
- Approval queue, runtime approval item, and token state diverged.
- Granted approvals were not redispatchable until token logic was fixed.
- Historical failed run and invalid JSON stop rules retriggered.
- db-migration-agent output contract conflicted with dispatcher expectations.
- Qwen returned thinking/prose instead of JSON until API options were fixed.
- Directory scope trailing slash mismatch caused false violations.
- Executable rollback/DOWN SQL had to be blocked.
- selected_agent mismatch could bypass correct gates.
- Example migration path leaked into real tool request.
- Approval deny did not sync runtime mirror.
- Read-only spec access incorrectly required migration approval.
- Operator `DONE` initially meant "no blockers" rather than "outputs complete".
- Spec source-chain enforcement is still missing.

