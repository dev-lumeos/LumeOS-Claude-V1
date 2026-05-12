# P1-005 Next Execution Plan

STATUS: AUTO_PLAN_AROUND / NON_EXECUTING_PREPARATION_PLAN

This document defines the next safe `P1-005` step after the completed source-chain readiness batch.

Current boundary:

- `BATCH-NUTRITION-P1-005-SOURCE-CHAIN-READINESS.md` is complete.
- The scoped dossier is `DONE`.
- The exact per-batch product-gate exception works.
- The global product gate remains closed.

This plan does not authorize product execution.

## 1. Purpose

Prepare the first concrete path from source-chain readiness toward real `Nutrition / BLS / P1-005` execution without crossing into import, DB, Supabase, or migration execution.

This is an `AUTO_PLAN_AROUND` artifact:

- if BLS import is needed, plan it without running it
- if DB or Supabase work is needed, define the candidate and rollback path without applying it
- if migration work is needed, define the candidate and validation steps without executing it

## 2. Current Constraints

Still forbidden:

- BLS import execution
- raw BLS commit
- DB changes
- Supabase commands
- migrations
- product implementation
- dispatcher execution
- Codex Worker execution
- approval grants
- manual `runtime_state.json` edits
- manual `queue.json` edits
- endpoint checks
- production routing changes
- MiniMax production routing changes

## 3. Recommended Next Executable Path

Recommended first executable path after Tom approval:

`BATCH-NUTRITION-P1-005-IMPORT-PREPARATION-DRAFT.md` promoted into one exact governed execution-scoped batch that still produces planning artifacts only.

Recommended output set:

- `docs/project/p1-005/P1-005-bls-source-inventory.md`
- `docs/project/p1-005/P1-005-import-field-mapping.md`
- `docs/project/p1-005/P1-005-additive-migration-candidate-plan.md`
- `docs/project/p1-005/P1-005-rollback-and-validation-checklist.md`

Reason:

- it advances the work toward real execution
- it still avoids import, DB apply, Supabase commands, and migrations
- it produces the missing preparation package Tom would need before opening a true DB/import boundary

## 4. Exact Next Executable Options

### Option A — Recommended First

Create and, later, execute one narrow planning-only batch for:

- raw BLS source inventory
- import field mapping
- additive migration candidate plan
- rollback and validation checklist

Risk classification: `medium`

Why first:

- highest information gain
- no DB apply
- no import
- no migration execution
- directly prepares the next real execution decision

### Option B — Migration-Candidate Authoring Path

Create a docs-only or SQL-draft-only candidate for the Nutrition additive migration sequence without writing under `supabase/migrations/` yet.

Risk classification: `medium_high`

Why second:

- useful only after Option A clarifies source structure and import mapping
- easier to author safely once source inventory exists

### Option C — Raw-Source Inspection First

Open a narrower read-only gate only for local raw BLS source inspection and create a source inventory report before any migration-candidate planning.

Risk classification: `high`

Why deferred:

- depends on explicit authorization to inspect local raw BLS material
- cannot be assumed from the current approved source set

## 5. Required Source Inputs

Already established:

- `docs/specs/Nutrition/INDEX.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
- `docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md`
- `docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md`
- `docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md`
- `docs/project/p1-005/P1-005-source-chain-readiness-report.md`

Still required before any real import/DB boundary:

- exact raw BLS source files and local paths, if Tom wants raw-source inspection opened
- exact import-file structure summary
- exact field mapping from raw source to target schema
- additive migration candidate ordering
- rollback procedure for each planned DB step

## 6. Required Validations

For the next non-executing planning batch:

```powershell
cmd.exe /c node node_modules\typescript\bin\tsc --noEmit
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts --batch <next-batch> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <next-batch> --dry-run --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <next-batch> --doctor --json --project lumeos
```

If a structured decomposition candidate is created later:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\decomposition-plan-validator.ts --plan <plan-file> --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --from-plan <plan-file> --out system/workorders/nutrition --dry-run --json --project lumeos
```

## 7. Rollback / Stop Conditions

Stop immediately if:

- the plan starts to require real BLS import
- the plan starts to require writing under `supabase/migrations/`
- the plan requires Supabase commands
- the plan requires DB apply or destructive SQL
- the plan assumes raw BLS facts that are not explicitly inspected and cited
- the plan widens into product implementation
- the plan requires dispatcher execution or Codex Worker execution

Rollback principle:

- all outputs in this phase must remain documentation-only or `NON_EXECUTABLE_DRAFT`
- no DB or runtime state changes means rollback is file deletion or document supersession only

## 8. What Remains Blocked

Still blocked until Tom explicitly opens a new execution boundary:

- raw BLS inspection if it is outside the currently approved documented source set
- any migration authoring under `supabase/migrations/`
- any Supabase command
- any DB execution
- any import runner execution
- any bulk transformation or commit of raw BLS data

## 9. Recommended Next Draft Artifacts

Recommended next draft artifact set:

- one `NON_EXECUTABLE_DRAFT` batch candidate for import/DB preparation planning only
- optional supporting draft workorders for:
  - BLS source inventory
  - import field mapping
  - additive migration candidate plan
  - rollback/validation checklist

## 10. Exact Next True Execution-Boundary Decision

Tom must decide whether to authorize the next narrow execution-scoped batch for `P1-005` planning only:

- allow creation and possible execution of a planning-only batch that produces import/DB preparation artifacts
- or keep all post-readiness work blocked

This document does not open that boundary.
