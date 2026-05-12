# P1-005 Readiness Candidate

STATUS: READINESS_CANDIDATE / NO_EXECUTION_AUTHORITY

This document defines a concrete read-only readiness candidate for the approved narrow product-gate exception:

`Nutrition / BLS / P1-005 preparation`

It does not authorize product execution.

## 1. Purpose

The purpose of this candidate is to prepare the first concrete, source-backed, non-executable `P1-005` readiness package for Nutrition/BLS work.

This candidate is limited to:

- source-chain review
- planning/readiness review
- decomposition input identification
- future draft-only workorder or batch preparation
- read-only or dry-run validation only

It is not a product workorder, not an executable batch, and not a permission to run BLS import, DB work, Supabase commands, migrations, or Nutrition implementation.

## 2. Candidate Classification

Classification: `NO_ACTIVE_CANDIDATE`

Reason:

- No active product batch or workorder for `P1-005` exists in `system/workorders/nutrition/batches/`.
- Historical Nutrition batches are explicitly archival or reference-only.
- The existing `P1-004` schema verification batch is completed evidence, not an active rerun target.
- Current repo state supports readiness drafting, but not execution.

## 3. Historical Evidence Only

The following items are evidence and source context only. They must not be silently reactivated:

- `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md`
- `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-004-schema-verification.md`
- `docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md`
- `docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md`

These documents establish that:

- Nutrition schema planning exists.
- Static schema verification evidence exists.
- Local Supabase inspection and historical dry-run evidence exist.
- None of those artifacts authorize execution now.

## 4. Exact Allowed Scope

Allowed under the narrow approved exception:

- Review the Nutrition spec/source-chain set for `P1-005 preparation`.
- Confirm the highest-priority source documents for future drafting.
- Define a decomposition candidate in prose only.
- Define future workorder-factory inputs in prose only.
- Create future non-executable draft targets under governance-controlled paths.
- Run read-only validation only:
  - TypeScript compile
  - governance invariant check
  - agent contract check
  - governance learning check
  - spec-source-chain-check, if a concrete workorder or batch candidate exists later
  - decomposition-plan-validator, if a structured decomposition plan exists later
  - wo-factory dry-run, if a valid structured plan exists later
  - run-batch-operator `--status`, `--dry-run`, or `--doctor`, if a valid non-executable candidate exists later

## 5. Exact Forbidden Scope

Forbidden:

- BLS import execution
- raw BLS file commit
- Nutrition feature implementation
- DB work
- Supabase commands
- migration execution
- production DB work
- approval grants
- dispatcher execution
- Codex Worker execution
- product batch execution
- endpoint or model-runtime checks
- production routing changes
- MiniMax production routing
- manual edits to `system/state/runtime_state.json`
- manual edits to `system/approval/queue.json`

## 6. Source Documents Used

Primary source-chain set for this readiness candidate:

- `docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md`
- `docs/project/PRODUCT_WORK_GATE.md`
- `docs/project/NUTRITION_BOOTSTRAP_DOC_STATUS.md`
- `docs/specs/Nutrition/INDEX.md`
- `docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md`
- `docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md`
- `docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md`
- `system/workorders/nutrition/README.md`
- `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md`
- `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-004-schema-verification.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md`

## 7. Source-Chain Status

Current source-chain status: `PARTIAL_BUT_USABLE_FOR_READINESS_ONLY`

What exists:

- Nutrition module index and spec hierarchy exist.
- Workorder planning documents exist.
- Static schema verification evidence exists.
- Historical local Supabase reference evidence exists.
- Product gate exception is documented for `P1-005 preparation` only.

What is missing:

- No active `P1-005` batch.
- No active `P1-005` workorder.
- No validated decomposition plan for `P1-005`.
- No validated workorder-factory input set for `P1-005`.

Meaning:

- Enough source material exists to draft a concrete readiness package.
- There is not yet enough structured input to run decomposition validation, factory dry-run, or operator dry-run against a P1-005 candidate.

## 8. Required Decomposition Inputs

Before any decomposition validator can run, the following must exist:

- `plan_id` or `feature_id` for the concrete `P1-005` candidate
- `project_id: lumeos`
- exact objective limited to `Nutrition / BLS / P1-005 preparation`
- explicit `source_refs`
- explicit constraints matching the narrow gate
- explicit `non_goals`
- explicit subtasks/work units
- explicit expected outputs
- explicit scope boundaries

Minimum content rules:

- No import execution task.
- No DB execution task.
- No Supabase or migration task.
- No raw BLS write or commit task.
- No approval-grant task.

## 9. Required Workorder-Factory Inputs

Before any workorder-factory dry-run can run, the following must exist:

- a validated decomposition plan
- exact `source_refs`
- exact `scope_files`
- exact `files_blocked`
- exact `expected_outputs`
- exact risk/category for each planned work unit
- output paths confined to allowed governance/docs/workorder paths

For this candidate, acceptable draft outputs would be limited to governance-controlled planning artifacts such as:

- docs under `docs/project/`
- draft workorders under `system/workorders/nutrition/drafts/`
- non-executable batch proposal docs under `docs/project/` or `system/workorders/nutrition/drafts/`

## 10. Required Dry-Run Validations Before Any Execution

These checks are required before any future execution request is considered:

```powershell
cmd.exe /c node node_modules\typescript\bin\tsc --noEmit
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json --project lumeos
```

If a concrete candidate is drafted later:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <candidate> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\decomposition-plan-validator.ts --plan <plan-file> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --plan <plan-file> --dry-run --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --status --project lumeos
```

Only run the last four if the matching candidate files actually exist and remain non-executable.

## 11. No Execution Authorization

This readiness candidate does not authorize:

- product execution
- import execution
- migration execution
- DB execution
- Supabase commands
- dispatcher execution
- Codex Worker execution
- product batch execution

## 12. Exact Next Tom Decision Needed

Tom must decide whether to authorize drafting one concrete, non-executable `P1-005` decomposition or workorder candidate from this source set for read-only validation only.

