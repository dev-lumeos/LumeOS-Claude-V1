# Current Governance Handover

## Status

Current date: 2026-05-05.

`main` is pushed through Governance Batch 003, the Governance Gap Analysis Plan, and Nutrition P1-004 schema verification. Governance runtime drift cleanup is complete on branch `goal/governance-runtime-drift-cleanup` until merged.

## Current Truth

- Governance Batch Operator exists and is the preferred way to run workorder batches.
- Operator modes:
  - `--status`
  - `--dry-run`
  - `--continue`
  - `--continue --apply-safe-cleanups`
- Nutrition Batch 001 reached operator `DONE`.
- Nutrition P1-004 schema verification reached `DONE` and is pushed to `origin/main`.
- Governance Gap Analysis Plan is pushed to `origin/main`.
- Governance Batch 002 created durable memory and learning records.
- Governance Batch 003 added a read-only invariant checker.
- Governance runtime drift cleanup made the invariant checker report zero critical/high findings.
- Raw BLS files are local-only and ignored.
- Supabase `db push`, `db reset`, production DB commands, and migration execution remain forbidden unless Tom explicitly runs them outside the worker/operator flow.

## Read First

Use these files before starting more governance or product work:

- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/governance-learning/README.md`
- `docs/project/governance-learning/INCIDENT_LEARNING_SCHEMA.md`
- `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- `AGENTS.md`
- `CLAUDE.md`
- `system/memory/canonical/lumeos_canonical.md`

The completion plan is the current truth for remaining governance gaps. Canonical memory contains only compact truths and must not replace the completion plan or incident records.

## Current Product Work Gate

BLS import and Nutrition P1-005 product work remain blocked until Governance Batch 005 is completed or explicitly waived by Tom.

Reason:

- Memory and learning foundation exists as of Governance Batch 002.
- Runtime invariant checking is available through `system/control-plane/governance-invariant-check.ts`.
- Current invariant checker result after cleanup: `critical=0`, `high=0`, `medium=0`.
- Recent incidents are now being recorded as durable incident learning records.
- Spec source-chain enforcement is still missing and is required before BLS import.

## Safe Next Governance Batch

Governance Batch 004 - Agent & Skill Contract Validation.

Goal:

- Prevent agent and skill contract drift.
- Validate JSON-only output contracts.
- Detect example path leaks in agent examples.
- Validate selected_agent/model-routing rules.
- Validate SKILL.md frontmatter.

## Do Not Do

- Do not start Nutrition P1-005 BLS import.
- Do not grant approvals automatically.
- Do not run Supabase `db push` or `db reset`.
- Do not execute migrations.
- Do not edit `system/state/runtime_state.json` or `system/approval/queue.json` manually.
- Do not commit runtime artifacts.
- Do not use raw BLS files as primary schema source when a current spec exists.
- Do not start product work until the Product Work Gate opens.

## Incident Records Created In Governance Batch 002

- `docs/project/governance-learning/2026-05-05-approval-token-runtime-split-brain.md`
- `docs/project/governance-learning/2026-05-05-example-migration-path-leak.md`
- `docs/project/governance-learning/2026-05-05-operator-done-ambiguity.md`
- `docs/project/governance-learning/2026-05-05-selected-agent-mismatch.md`
- `docs/project/governance-learning/2026-05-05-executable-rollback-sql.md`
- `docs/project/governance-learning/2026-05-05-read-only-spec-approval-misclassification.md`
- `docs/project/governance-learning/2026-05-05-invalid-json-stop-rule-retrigger.md`
- `docs/project/governance-learning/2026-05-05-scope-trailing-slash-mismatch.md`

## Governance Batch 003 Output

- `system/control-plane/governance-invariant-check.ts`
- `system/control-plane/__tests__/governance-invariant-check.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-003-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json
```

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
