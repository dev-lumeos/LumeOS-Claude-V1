# Governance Operator Runbook

This runbook describes the safe operator workflow for running a workorder batch from status check to the next safe stop.

The active project profile defaults to `lumeos`. Profile-aware governance commands accept `--project lumeos`; the UI uses the same default for operator, doctor, invariant, source-chain, learning, dossier, and promotion reads.

The operator CLI is:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --status
```

All operator modes accept an explicit orchestration selector:

```powershell
--orchestration-mode auto
--orchestration-mode codex_bootstrap
--orchestration-mode spark1_orchestrated
```

## Orchestration Modes

Every operator, doctor, and batch dossier report must include:

- `requested_orchestration_mode`
- `actual_orchestration_mode`
- `spark1_orchestrator_used`
- `codex_role`
- `worker_assignment_result`
- `missing_integration_point`

Supported requested modes:

- `codex_bootstrap`: Codex may act as orchestrator/bootstrapper while still obeying all governance gates, product gates, stop rules, approval rules, and forbidden actions.
- `spark1_orchestrated`: the run routes through Spark1 / `orchestrator-agent` before worker assignment. Codex must not silently act as orchestrator. The handoff validates Spark1 routing intent and worker assignments before the existing dispatcher path runs. If Spark1 is unavailable, or if the intent/assignment is invalid, the operator returns `STOP_AND_REPORT` / `ORCHESTRATION_BLOCKED`.
- `auto`: the operator may choose the orchestration path based on policy and must report the chosen path and reason. Current policy chooses `codex_bootstrap` unless `spark1_orchestrated` is explicitly requested.

Spark1 handoff behavior:

- Runs `orchestrator-agent` completion health before dispatch.
- Sends the batch/workorder summary to Spark1 and requires JSON routing intent.
- Requires `worker_assignments` entries to match the governed workorder route before dispatch.
- Blocks with `ORCHESTRATION_BLOCKED` instead of falling back to Codex when Spark1 is requested but unavailable or invalid.

Current proof:

- Commit `a0b3a20` proves Spark1 handoff in operator probes.
- `--doctor` and `--dry-run` now invoke Spark1 / `orchestrator-agent` handoff for `spark1_orchestrated`.
- The live doctor probe for `BATCH-NUTRITION-P1-005-LOCAL-DETAIL-PANEL.md` returned `actual_orchestration_mode: spark1_orchestrated`, `spark1_orchestrator_used: true`, `codex_role: none`, `worker_assignment_result: WO-nutrition-013->senior-coding-agent`, and `final_diagnosis: CLEAN_READY`.
- DGX1 / Spark1 runtime details and corrected `vllm.service` flags are recorded in `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md`.

Example Spark1-gated local Nutrition test:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\<BATCH>.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated
```

To execute a ready governed batch through Spark1 handoff:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\<BATCH>.md --continue --project lumeos --orchestration-mode spark1_orchestrated
```

Concrete P1-005 local detail-panel command:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-005-LOCAL-DETAIL-PANEL.md --continue --project lumeos --orchestration-mode spark1_orchestrated
```

## Documentation / SSOT Lifecycle Gate

SSOT handling is a required phase of every governed workorder lifecycle:

```text
workorder -> worker execution -> configured review -> documentation impact handling -> SSOT_SYNC_CHECK -> dossier -> DONE
```

Every new or active workorder YAML must declare `documentation_impact`:

```yaml
documentation_impact:
  required: true
  domains:
    - "workflow"
  ssot_files:
    - "docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md"
  documentation_agent_required: true
  na_reason: null
```

If documentation impact is not applicable, the workorder must still declare a structured auditable N/A:

```yaml
documentation_impact:
  required: false
  domains:
    - "none"
  ssot_files: []
  documentation_agent_required: false
  na_reason: "Local-only UI affordance does not alter accepted behavior, SSOT runtime docs, gates, or TODO state."
```

Rules:

- Missing `documentation_impact` is a schema/preflight blocker.
- `none` requires `required=false`, `documentation_agent_required=false`, and a specific non-generic `na_reason`.
- Runtime, model-routing, workflow, governance, product-gate, infra-runtime, and TODO-state domains require `documentation_agent_required=true` unless a structured exemption is explicitly declared.
- Historical workorders may be grandfathered only with `domain=historical_workorder` and the exact reason `pre-existing archived workorder before documentation-impact gate`.
- If `documentation_impact.required=true`, the operator must emit `documentation_started` and `documentation_completed` before DONE.
- If documentation is skipped with a valid N/A, the operator emits `documentation_skipped_with_na`.
- If declared SSOT files are missing or `SSOT_SYNC_CHECK` fails, the operator emits `documentation_blocked` and the batch remains `FIX_REQUIRED`.
- Batch dossiers must report documentation impact, documentation agent usage, SSOT files, N/A reason when present, SSOT sync status, and final SSOT classification.

For Nutrition batch 001:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --status
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --status --project lumeos
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

It inspects operator status, stop rules, runtime blockers, approvals, cleanup suggestions, git status, invariant checker, agent-contract checker, spec-source-chain checker, and memory/learning file presence. It returns exactly one safe next action and an `autonomy_handoff` object.

Doctor also reports Codex Worker state:

- `CODEX_WORKER_READY`: config permits dispatcher use for the allowlisted senior agent path.
- `CODEX_WORKER_DISABLED`: bridge exists but automatic dispatcher execution is disabled by config.
- `CODEX_WORKER_CONFIG_ERROR`: config could not be loaded or normalized.

Codex Worker ready status is not a broad product-work opening. It means the narrow senior-agent path is available when a workorder explicitly opts in and passes governance gates.

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --doctor
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --doctor --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system\workorders\nutrition\batches\BATCH-NUTRITION-P1-001-db-foundation.md --doctor --json --project lumeos
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

## Autonomy Handoff Contract

Operator status, Doctor JSON, and Batch Dossier JSON now include a stable autonomy handoff section for STOP/FIX/approval states.

Fields:

- `final_state`
- `diagnosis`
- `blocker_type`
- `blockers`
- `tom_action_required`
- `safe_cleanup_available`
- `safe_cleanup_command`
- `dossier_recommended`
- `dossier_command`
- `doctor_command`
- `learning_recommended`
- `learning_record_suggestion`
- `codex_worker_candidate`
- `codex_worker_reason`
- `product_gate_status`
- `next_action`
- `forbidden_actions`

Rules:

- `NEEDS_TOM_APPROVAL` points Tom to approval review and never auto-grants.
- `NEEDS_SAFE_CLEANUP` points first to the official cleanup dry-run, not confirm.
- `FIX_REQUIRED`, stop-rule, invariant, contract, source-chain, model-runtime, product-gate, and dirty-worktree blockers recommend dossier review and learning review.
- Product-gate blocked states remain blocked; the handoff must not open product work.
- Codex Worker is only suggested for eligible governance workorders with explicit `codex_worker` metadata and passing gates.

## Non-Interactive Workflow Autonomy

The operator/governance workflow should continue automatically through safe preparation work after Tom has already defined scope and forbidden actions.

Three policy modes apply:

- `AUTO_CONTINUE`
- `AUTO_PLAN_AROUND`
- `STOP_AND_REPORT`

### `AUTO_CONTINUE`

Do not ask Tom again when the next useful step is still read-only, draft-only, docs-only, validation-only, or otherwise non-executing inside the approved scope.

### `AUTO_PLAN_AROUND`

If the next likely step touches a risky execution domain, first produce the safest non-executing alternative instead of stopping immediately.

Examples:

- draft SQL instead of DB apply
- draft migration plus rollback instead of migration execution
- import plan instead of import execution
- source inventory instead of raw-data mutation
- routing proposal instead of production routing change

### `STOP_AND_REPORT`

Stop only when no safe read-only, draft-only, or dry-run path remains and the next step is a true execution boundary.

When stopping:

- report the exact execution boundary
- report the exact next Tom decision
- do not wait interactively during already approved safe preparation work

### Current P1-005 application

`Nutrition / BLS / P1-005 preparation` now sits at `STOP_AND_REPORT` because the draft-only workflow is complete and the next step would be the first real execution boundary.

Learning suggestions are read-only by default:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --final-state FIX_REQUIRED --json
```

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

## Project Profile Commands

The first reusable profile layer lives under `system/project-profiles/`.

Use the LumeOS profile explicitly when you need profile-aware raw path, forbidden path, product-gate, or promotion policy checks:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\promotion-governance.ts --review-branch <branch> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\batch-dossier.ts --batch <batch-file> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run --project lumeos
```

Rules:

- The profile does not grant permissions or open product work.
- LumeOS raw BLS paths remain local-only and forbidden as commit output.
- Supabase reset, push, migration execution, production DB commands, runtime state edits, queue edits, and approval auto-grants remain forbidden regardless of profile.
- Beauty Club is represented only as an inactive example skeleton until Tom supplies a real repo path and policy.

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

## Codex Worker Dispatcher Path

The dispatcher has a narrow Codex Worker integration point for `senior-coding-agent`.

Codex Worker dispatch is controlled-enabled. Automatic Codex Worker dispatch requires all of:

- `codex_worker_enabled: true`
- `allow_dispatcher_integration: true`
- `senior-coding-agent`
- `runtime_type: codex-cli`
- workorder `codex_worker: true`
- complete `source_refs`, `scope_files`, `files_blocked`, and `expected_outputs`
- no pending human approval requirement
- `require_product_gate: true`
- `product_gate_open: false` blocks product work unless Tom explicitly opens the gate

The path keeps the Codex worker hard timeout and maps final states into the normal dispatcher lifecycle:

- `DONE` -> completed
- `NEEDS_TOM_APPROVAL` -> awaiting approval pause
- `FIX_REQUIRED` -> failed
- `STOP` -> blocked

Batch dossier reporting separates Codex Worker subprocess status from the governed final classification:

- `worker_runtime_status`: raw Codex Worker timeout/FIX/STOP evidence.
- `output_validation_status`: whether declared expected outputs exist.
- `review_status`: configured review result, including Nemotron reviewer PASS/FAIL/BLOCKED.
- `final_classification`: the governed batch result after output and review validation.

If a Codex Worker subprocess times out but all scoped expected outputs exist and the configured reviewer passes, the timeout remains visible as `observed_non_terminal` and is reported as superseded by validated outputs. If outputs are missing or review fails, the timeout remains blocking and the dossier must classify the batch as `FIX_REQUIRED`.

Generated Codex worker prompt/report files under `system/reports/codex-worker/` are runtime artifacts and must not be committed.

## SSOT Sync Check

`SSOT_SYNC_CHECK` is part of `DONE`. Runtime/model routing, workflow/operator/governance, product-gate, infra/systemd, infra/vLLM, and completed-TODO changes must update their mapped SSOT docs/TODO files in the same change.

Run directly when needed:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\ssot-sync-check.ts --json
```

The governance invariant checker also runs the SSOT sync check. If a mapped SSOT update is genuinely not applicable, add an auditable structured marker in the relevant changed file:

```text
SSOT_SYNC_CHECK: N/A (domain=<domain>; reason=<specific reason>)
```

Accepted domains include `runtime_model`, `workflow_governance`, `product_gate`, `infra_runtime`, and `completed_todo`.
