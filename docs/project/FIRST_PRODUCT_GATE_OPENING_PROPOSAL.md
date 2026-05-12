# First Product Gate Opening Proposal

STATUS: READY_FOR_TOM_APPROVAL

Product work remains closed. This proposal does not open product work by itself. Tom must explicitly approve this exact proposal before any product-adjacent planning action starts.

## 1. Decision Requested

Approve a narrow product-gate opening for:

`Nutrition / BLS / P1-005 preparation`

This is a controlled planning, validation, source-chain, and workorder-readiness gate only. It does not allow BLS import execution, DB apply, Supabase commands, migration execution, production DB work, product batch execution, or Nutrition feature implementation.

## 2. Selected First Candidate

Selected candidate:

- Candidate: `Nutrition / BLS / P1-005 preparation`
- Type: planning/readiness only
- Current state: no active P1-005 batch/workorder exists in `system/workorders/nutrition/batches/`
- Basis:
  - `docs/specs/Nutrition/INDEX.md`
  - `docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md`
  - `docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md`
  - `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-004-schema-verification.md`
  - `docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md`

Why this is the safest first candidate:

- It follows the completed static schema verification milestone.
- It can be limited to source-chain and workorder-readiness checks.
- It can avoid raw BLS file mutation, BLS import execution, Supabase commands, migrations, and product code.
- It creates a controlled decision point before any real product execution.

## 3. Explicit Scope

Allowed scope after Tom approval:

- Review existing Nutrition/BLS source-chain readiness.
- Validate that P1-005 has complete source references before any workorder generation.
- Validate that prior P1-004 schema verification evidence exists and is current enough for planning.
- Draft or review a future P1-005 workorder/batch proposal, if needed, without dispatching it.
- Run read-only governance checks:
  - TypeScript compile.
  - Governance invariant checker.
  - Agent contract checker.
  - Governance learning checker.
  - Spec source-chain checker in read-only mode.
  - Decomposition-plan validator in read-only mode if a structured plan exists.
  - Workorder factory dry-run only if a valid structured plan exists.
  - Operator `--status`, `--dry-run`, or `--doctor` only for non-dispatching review.

Not allowed:

- Running product batches.
- Running dispatcher execution.
- Running Codex Worker execution.
- Running BLS import.
- Reading or writing raw BLS files except local read-only source validation explicitly approved by Tom.
- Committing raw BLS files.
- Inventing food, nutrient, category, or BLS values.
- Implementing Nutrition API/UI/features.
- Running Supabase commands.
- Executing migrations.
- Applying DB changes.
- Granting approvals.
- Editing `system/state/runtime_state.json`.
- Editing `system/approval/queue.json`.
- Modifying production model routing.
- Using MiniMax in production governance routing.

## 4. Required Checks Before Any Execution

Before any later product execution gate, the following must pass:

```powershell
cmd.exe /c node node_modules\typescript\bin\tsc --noEmit
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json --project lumeos
```

If a concrete P1-005 workorder or batch is created later, it must also pass:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-or-batch> --json --project lumeos
```

If a decomposition plan is used later, it must pass:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\decomposition-plan-validator.ts --plan <plan-file> --json --project lumeos
```

If the workorder factory is used later, it must be dry-run/validation only until Tom explicitly approves execution.

## 5. Tom Approval Requirement

Tom must explicitly approve one of these decisions:

- `APPROVE PRODUCT GATE: Nutrition/BLS/P1-005 preparation only`
- `DENY PRODUCT GATE: Nutrition/BLS/P1-005 preparation`
- `REVISE PRODUCT GATE: <specific narrower scope>`

No other wording opens the product gate. General product work remains closed.

## 6. Stop Conditions

Stop immediately with `FIX_REQUIRED` or `NEEDS_TOM_APPROVAL` if any of the following occurs:

- A check reports critical or high findings.
- The candidate requires BLS import execution.
- The candidate requires Supabase, migration, or DB execution.
- The candidate requires approval grants.
- The candidate lacks source references, scope files, blocked files, or expected outputs.
- The candidate would write raw BLS files or commit raw data.
- The candidate would modify runtime or approval state manually.
- The candidate broadens beyond P1-005 preparation.
- The candidate attempts to use MiniMax in production routing.

## 7. Rollback

Because this proposal does not execute product work, rollback is documentation-only:

- Leave the product gate closed.
- Mark this proposal `DENIED`, `SUPERSEDED`, or `REVISE_REQUIRED`.
- Do not run P1-005 planning, validation, or workorder generation until a revised Tom-approved proposal exists.

## 8. Current Decision State

Decision state: `READY_FOR_TOM_APPROVAL`

Product gate state: `CLOSED`

Exact next action:

Tom must explicitly approve opening the product gate only for `Nutrition / BLS / P1-005 preparation` with the scope in this document.

