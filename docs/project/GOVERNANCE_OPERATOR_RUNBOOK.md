# Governance Operator Runbook

This runbook describes the safe operator workflow for running a workorder batch from status check to the next safe stop.

The operator CLI is:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --status
```

For Nutrition batch 001:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --status
```

## Status Command

Status mode is read-only. It reports git state, current branch, system stop, stop-rule dry-run status, failed-runs and invalid-json baselines, locks, batch-related active workorders/runs, approvals, dirty artifacts, cleanup suggestions, approval stops, and one exact next command.

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --status
```

## Dry-Run Command

Dry-run mode runs only the batch parser and validator. It does not dispatch workorders.

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --dry-run
```

## Doctor Command

Doctor mode is read-only. It does not dispatch workorders, mutate runtime state, apply cleanup, grant approvals, run Supabase commands, or execute migrations.

It inspects operator status, stop rules, runtime blockers, approvals, cleanup suggestions, git status, invariant checker, agent-contract checker, spec-source-chain checker, and memory/learning file presence. It returns exactly one safe next action.

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --doctor
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --doctor --json
```

Doctor diagnoses:

- `CLEAN_READY`
- `NEEDS_TOM_APPROVAL`
- `NEEDS_SAFE_CLEANUP`
- `STOP_RULE_BLOCKED`
- `INVARIANT_BLOCKED`
- `AGENT_CONTRACT_BLOCKED`
- `SPEC_SOURCE_BLOCKED`
- `DIRTY_WORKTREE`
- `RUNTIME_ARTIFACTS_PRESENT`
- `PRODUCT_GATE_BLOCKED`
- `FIX_REQUIRED`
- `UNKNOWN`

## Continue Command

Continue mode proceeds only until the next safe stop:

- approval needed
- technical error
- stop-rule block
- unexpected dirty worktree
- safe cleanup needed
- batch done

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --continue
```

## Approval Procedure

When the operator reports `NEEDS_TOM_APPROVAL`, it stops and prints:

- approval id
- workorder id
- run id
- agent
- risk category
- proposed action
- affected files
- exact grant command
- classification

Classifications:

- `SAFE_TO_REVIEW`: normal file-write approval candidate.
- `NEEDS_HUMAN_SQL_REVIEW`: migration or SQL-sensitive approval. Tom must inspect the file content and intended scope.
- `DO_NOT_GRANT`: unsafe approval request.
- `CONTENT_NOT_VISIBLE`: content is missing or truncated; inspect manually before deciding.

For `write_migration`, a grant only allows writing the migration file. It does not allow `supabase db push`, `supabase db reset`, production DB commands, or bypassing post-write review.

## Cleanup Procedure

The operator suggests cleanup but does not apply it unless `--continue --apply-safe-cleanups` is used.

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --continue --apply-safe-cleanups
```

Safe cleanups are restricted to official cleanup paths in `system\control-plane\terminal-wo-reset-cli.ts`.

The operator may apply cleanup only when:

- the workorder/run match is exact
- cleanup dry-run confirms one target
- no active scope or DB migration locks exist for that run
- no pending approval exists for that run
- the reason is terminal stale state or expired/unusable enforcement token

It must never clean running workorders, usable unexpired approvals, pending approvals, or ambiguous matches.

## What Codex May Do

Codex may:

- run `--status`
- run `--dry-run`
- run `--doctor`
- run `--continue`
- run `--continue --apply-safe-cleanups` when the operator classifies the cleanup as safe
- inspect reports and runtime state read-only
- edit governance code, tests, and docs on a non-main branch

## What Only Tom May Do

Only Tom may:

- grant or deny human approvals
- decide `NEEDS_HUMAN_SQL_REVIEW`
- approve production database activity outside this operator
- decide whether to clear a system stop
- decide how to handle dirty worktree items that are not operator-owned

## Forbidden Commands

Do not run:

```powershell
supabase db push
supabase db reset
```

Do not run production DB commands, automatic approval grants, direct edits to `system/state/runtime_state.json`, direct deletes of audit/run history, threshold raises without review, or anything that bypasses `checkApproval`.

## Dirty Worktree Recovery

The operator classifies dirty files as:

- code changes
- workorder outputs
- runtime/audit artifacts
- ignored state artifacts
- report outputs

If it reports `FIX_REQUIRED`, inspect `git status --short --branch`. Commit intended governance changes, leave runtime/audit artifacts alone unless Tom says otherwise, and rerun `--status`.

Commands such as `run-summary-generator --all` can dirty report outputs. Run status before report generation and expect report artifacts afterward.

## Operator End States

- `READY_TO_RUN`: no blocking approval, stop rule, cleanup, or unexpected dirty worktree.
- `NEEDS_TOM_APPROVAL`: Tom must grant or deny the printed approval.
- `NEEDS_SAFE_CLEANUP`: operator found a safe cleanup candidate; run with `--apply-safe-cleanups` or inspect manually.
- `FIX_REQUIRED`: technical issue or unexpected dirty worktree blocks safe continuation.
- `STOP_RULE_BLOCKED`: system stop or stop-rule dry-run violation blocks continuation.
- `DONE`: no active batch workorders remain and every expected output inferred from the batch WOs exists.

The operator must distinguish cleared runtime blockers from true batch completion. If no active workorders remain but expected outputs are missing, the batch is not `DONE`; continue mode should select the first incomplete workorder instead of redispatching the whole batch.

When a selected incomplete workorder has `blocked_by` dependencies whose expected outputs already exist, the operator may treat those specific blockers as resolved for that selected dispatch. Unresolved blockers must remain blocking.
