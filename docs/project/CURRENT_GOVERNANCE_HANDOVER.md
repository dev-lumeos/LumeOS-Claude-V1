# Current Governance Handover

## Status

Current date: 2026-05-05.

`main` is pushed through Governance Batch 008, Governance Batch 007, Governance Batch 006, Governance Batch 005, Governance Batch 004, Governance Batch 003, the Governance Gap Analysis Plan, Nutrition P1-004 schema verification, governance runtime drift cleanup, local Supabase inventory, and local transaction dry-run reports.

The active governance branch is implementing Spark Runtime / Model Runtime Hardening.

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
- Governance Batch 004 adds a read-only Agent & Skill Contract Checker.
- Governance Batch 005 adds a read-only Spec Source Chain Checker and Workorder Source Chain Standard.
- Governance Batch 006 adds a read-only Batch Dossier Reporter and operator dossier suggestions.
- Governance Batch 007 adds a deterministic Promotion / Merge Governance CLI.
- Governance Batch 008 adds read-only Operator Doctor mode.
- Workorder Factory / Decomposition Automation adds a deterministic structured-plan to workorder/batch CLI.
- Memory/Learning Automation adds a read-only governance learning checker.
- Spark Runtime / Model Runtime Hardening adds a read-only model-runtime checker and dispatcher timeout/retry policy.
- Product work is conditionally open only for the next controlled planning/probe batch.
- Raw BLS files are local-only and ignored.
- Supabase `db push`, `db reset`, production DB commands, and migration execution remain forbidden unless Tom explicitly runs them outside the worker/operator flow.

## Read First

Use these files before starting more governance or product work:

- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/governance-learning/README.md`
- `docs/project/governance-learning/INCIDENT_LEARNING_SCHEMA.md`
- `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- `docs/project/PRODUCT_WORK_GATE.md`
- `docs/project/WORKORDER_FACTORY_AUTOMATION.md`
- `docs/project/MODEL_RUNTIME_HARDENING.md`
- `docs/project/governance-learning/CURRENT_LEARNING_STATUS.md`
- `AGENTS.md`
- `CLAUDE.md`
- `system/memory/canonical/lumeos_canonical.md`

The completion plan is the current truth for remaining governance gaps. Canonical memory contains only compact truths and must not replace the completion plan or incident records.

## Current Product Work Gate

Product work is not freely open.

Tom has conditionally opened the product gate only for the next controlled planning/probe batch.

Allowed:

- Planning-only product work.
- BLS import planning and preflight.
- Local read-only raw file inspection.
- Generation of reports and spec-linked workorders.
- Static validation.
- Governance checker runs.
- Governance Operator dry-run.
- Governance Operator continue only if no database execution, migration execution, or real bulk import occurs.

Forbidden:

- `supabase db push`
- `supabase db reset`
- Production database changes.
- Migration execution.
- Real BLS bulk import execution.
- Committing raw BLS files.
- Invented BLS, food, nutrient, or category values.
- Bypassing the Governance Operator or checkers.
- Auto-granting approvals.
- Autonomous, night, or large product runs.

Reason:

- Runtime invariant checking is available through `system/control-plane/governance-invariant-check.ts`.
- Agent and skill contract checking is available through `system/control-plane/agent-contract-check.ts`.
- Spec source-chain checking is available through `system/workorders/cli/spec-source-chain-check.ts`.
- Governance learning checking is available through `system/reports/governance-learning-check.ts`.
- Batch dossier reporting is available through `system/reports/batch-dossier.ts`.
- Promotion governance is available through `system/control-plane/promotion-governance.ts`.
- Operator Doctor is available through `system/workorders/cli/run-batch-operator.ts <batch-file> --doctor`.
- Model runtime checking is available through `system/control-plane/model-runtime-check.ts`.
- Current invariant checker result after cleanup: `critical=0`, `high=0`, `medium=0`.
- Static model-runtime checker result after hardening: `critical=0`, `high=0`; endpoint health must still be proven for autonomous, night, or large product runs.
- Raw BLS files remain local-only and ignored.

## Model Runtime Hardening Output

- `system/control-plane/model-runtime-check.ts`
- `system/control-plane/__tests__/model-runtime-check.test.ts`
- `docs/project/MODEL_RUNTIME_HARDENING.md`
- `docs/project/governance-learning/2026-05-05-spark-runtime-hardening-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\model-runtime-check.ts --check-endpoints --timeout-ms 1500
```

Rules:

- Default mode is read-only and does not call endpoints.
- `--check-endpoints` performs short `/v1/models` health checks only.
- No workorder prompts are sent by the checker.
- Dispatcher model calls now have bounded timeout and one retry for runtime failures.
- Operator Doctor includes model-runtime findings and still emits one safe next action.

## Workorder Factory Output

- `system/workorders/cli/wo-factory.ts`
- `system/workorders/cli/__tests__/wo-factory.test.ts`
- `docs/project/WORKORDER_FACTORY_AUTOMATION.md`
- `docs/project/governance-learning/2026-05-05-workorder-factory-automation-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --from-plan <plan-file> --out <output-dir> --dry-run
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --from-plan <plan-file> --out <output-dir> --write
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --validate <workorder-or-batch>
```

Rules:

- Factory input is a Markdown file with a deterministic JSON plan block.
- Dry-run writes nothing.
- `--write` creates draft workorders and a batch only after high/critical factory findings are clear.
- Factory does not dispatch, grant approvals, run Supabase commands, execute migrations, or import BLS data.
- Generated batches must still pass source-chain, invariant, and agent-contract checks before operator execution.

## Memory/Learning Automation Output

- `system/reports/governance-learning-check.ts`
- `system/reports/__tests__/governance-learning-check.test.ts`
- `docs/project/governance-learning/CURRENT_LEARNING_STATUS.md`
- `docs/project/governance-learning/2026-05-05-memory-learning-automation-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --write-summary
```

Rules:

- Default mode is read-only.
- `--write-summary` writes only `docs/project/governance-learning/CURRENT_LEARNING_STATUS.md`.
- The checker does not edit runtime state, approval state, audit history, or run history.
- It verifies incident metadata, fix commits, regression tests, durable rules, recurrence detectors, handover state, canonical memory, and product-gate wording.

## Safe Next Governance Batch

Run the next controlled planning/probe batch only after Tom confirms the required local model endpoint health, or continue with deeper observability work.

Goal:

- The conditional gate permits only planning/probe work, not import execution.
- Endpoint health still blocks autonomous, night, and large product runs until proven for the required model routes.

## Do Not Do

- Do not start real Nutrition P1-005 BLS import execution.
- Do not grant approvals automatically.
- Do not run Supabase `db push` or `db reset`.
- Do not execute migrations.
- Do not edit `system/state/runtime_state.json` or `system/approval/queue.json` manually.
- Do not commit runtime artifacts.
- Do not use raw BLS files as primary schema source when a current spec exists.
- Do not start product work outside the conditional planning/probe gate.

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

## Governance Batch 004 Output

- `system/control-plane/agent-contract-check.ts`
- `system/control-plane/__tests__/agent-contract-check.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-004-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
```

## Governance Batch 005 Output

- `system/workorders/cli/spec-source-chain-check.ts`
- `system/workorders/cli/__tests__/spec-source-chain-check.test.ts`
- `docs/project/WORKORDER_SOURCE_CHAIN_STANDARD.md`
- `docs/project/governance-learning/2026-05-05-governance-batch-005-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file> --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts --batch <batch-file>
```

## Governance Batch 006 Output

- `system/reports/batch-dossier.ts`
- `system/reports/__tests__/batch-dossier.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-006-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file> --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file> --write
```

Rules:

- Without `--write`, the dossier prints only and must not dirty the repo.
- With `--write`, Markdown and JSON reports are written under `system/reports/batches/`.
- The Governance Operator suggests the dossier command when it reaches a safe stop.

## Governance Batch 007 Output

- `system/control-plane/promotion-governance.ts`
- `system/control-plane/__tests__/promotion-governance.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-007-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --review-branch <branch>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --review-branch <branch> --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --merge-branch <branch>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --push-main
```

Rules:

- Review classifies changed files, forbidden artifacts, product-gate impact, and required checks.
- Merge runs review first and refuses unless the decision is `MERGE_READY`.
- Merge checks out `main`, merges the target branch, stops on conflicts, and runs typecheck.
- Push requires `main`, clean worktree, and `main` ahead of `origin/main`.
- Push is explicit; merge does not push automatically.

## Governance Batch 008 Output

- `system/workorders/cli/operator-doctor.ts`
- `system/workorders/cli/__tests__/operator-doctor.test.ts`
- `docs/project/governance-learning/2026-05-05-governance-batch-008-summary.md`

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --doctor
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --doctor --json
```

Rules:

- Doctor is read-only.
- Doctor does not dispatch, grant approvals, apply cleanup, run Supabase commands, or execute migrations.
- Doctor returns one diagnosis and exactly one next action.
- Normal operator reports include a doctor command for safe-stop diagnosis.

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
- Spec source-chain enforcement now exists as a checker; target product work still must pass it before BLS import.
