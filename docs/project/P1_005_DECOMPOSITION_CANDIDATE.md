# P1-005 Decomposition Candidate

STATUS: NON_EXECUTABLE_DRAFT

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `NOT_DISPATCHABLE`

Execution authority: none

## Candidate ID

`PLAN-NUTRITION-P1-005-PREPARATION-001`

## Purpose

This document is the first concrete non-executable decomposition/workorder candidate for the approved narrow product-gate exception:

`Nutrition / BLS / P1-005 preparation`

It exists only for read-only validation and future draft refinement. It does not authorize product execution, BLS import, DB work, Supabase commands, migrations, approvals, dispatcher execution, Codex Worker execution, or product batch execution.

## Source Refs

- `docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md`
- `docs/project/P1_005_READINESS_CANDIDATE.md`
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
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/GOVERNANCE_TODO_REGISTER.json`

Current source-chain limitation:

- The currently authorized source set does not include a direct `docs/specs/Nutrition/01_current_specs/*` reference.
- That is sufficient for a decomposition draft, but insufficient for a factory/source-chain-clean workorder-shaped draft.

## Exact Non-Executable Scope

- Review the documented source chain for `P1-005 preparation`.
- Convert the source chain into one draft-only planning workorder candidate.
- Produce draft-only governance artifacts that could later be validated and reviewed.
- Keep all expected outputs in documentation or `system/workorders/nutrition/drafts/`.
- Stop before any import, schema write, migration, runtime, approval, dispatcher, or batch execution path.

## Explicit Non-Goals

- BLS import execution
- raw BLS commit
- Nutrition API or UI implementation
- DB work
- Supabase commands
- migration execution
- production DB work
- approval grants
- dispatcher execution
- Codex Worker execution
- product batch execution
- endpoint/model-runtime checks
- production routing changes
- MiniMax production routing

## Proposed Subtasks

1. Review Nutrition/BLS source-chain evidence relevant to `P1-005 preparation`.
2. Produce one draft-only source-chain readiness report for `P1-005 preparation`.
3. Produce one draft-only non-dispatchable workorder candidate under `system/workorders/nutrition/drafts/`.
4. Validate the decomposition structure and dry-run factory conversion only.

## Expected Outputs As Drafts Only

- `docs/project/p1-005/P1-005-source-chain-readiness-report.md`
- `system/workorders/nutrition/drafts/WO-NUTRITION-P1-005-preparation-draft.md`

## Files Allowed For Future Candidate Validation

- `docs/project/P1_005_DECOMPOSITION_CANDIDATE.md`
- `docs/project/p1-005/P1-005-source-chain-readiness-report.md`
- `system/workorders/nutrition/drafts/WO-NUTRITION-P1-005-preparation-draft.md`

## Files Blocked

- `system/state/**`
- `system/approval/**`
- `supabase/**`
- `docs/specs/Nutrition/00_raw/**`
- `.env`
- `.env.*`

## Acceptance Criteria

- Candidate remains clearly non-executable.
- All outputs are draft-only and stay inside allowed documentation or draft-workorder paths.
- Source references are explicit and limited to the approved source set.
- No task requests BLS import, DB execution, Supabase, migration execution, approval grant, dispatcher execution, or Codex Worker execution.
- Decomposition validator passes.
- Factory dry-run can transform the candidate into draft workorder markdown without writing files.

## Dry-Run Validation Plan

Read-only only:

- `cmd.exe /c node node_modules\typescript\bin\tsc --noEmit`
- `cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos`
- `cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json`
- `cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json --project lumeos`
- `cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\decomposition-plan-validator.ts --plan docs/project/P1_005_DECOMPOSITION_CANDIDATE.md --json --project lumeos`
- `cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --from-plan docs/project/P1_005_DECOMPOSITION_CANDIDATE.md --out system/workorders/nutrition --dry-run --json --project lumeos`

Current observed result:

- Decomposition validator: passes.
- Factory dry-run: blocked by source-chain rule `source_refs.current_spec_missing` because the currently authorized source set does not include a primary `01_current_specs` SSOT reference.

## Stop Conditions

- Any critical or high validation finding.
- Any workorder-factory dry-run failure caused by incomplete authorized source refs.
- Any sign that the candidate widens into execution.
- Any requirement for BLS import, DB work, Supabase, migration execution, or approvals.
- Any output path outside draft/docs scope.
- Any missing source-chain information that would require invented facts.

## Tom Approval Requirement Before Any Execution

Tom must explicitly approve any later step that moves from this draft candidate into a real executable workorder or batch. This document does not grant that approval.

## Machine-Readable Candidate

```json
{
  "plan_id": "PLAN-NUTRITION-P1-005-PREPARATION-001",
  "feature_id": "NUTRITION-P1-005-PREPARATION",
  "project_id": "lumeos",
  "module": "Nutrition",
  "objective": "Prepare a draft-only, non-executable P1-005 readiness package for Nutrition/BLS planning and source-chain validation without running import, DB, Supabase, migration, approval, dispatcher, or product execution paths.",
  "batch_id": "BATCH-NUTRITION-P1-005-PREPARATION-DRAFT",
  "batch_title": "Nutrition P1-005 Preparation Draft Candidate",
  "status": "draft_non_executable",
  "source_refs": {
    "module_index": "docs/specs/Nutrition/INDEX.md",
    "current_specs": [
      "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md",
      "docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md"
    ],
    "patches": [],
    "sql_sources": [],
    "adrs": [],
    "reviews": [
      "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md",
      "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md",
      "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-004-schema-verification.md",
      "docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md",
      "docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md",
      "docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md",
      "docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md",
      "docs/project/P1_005_READINESS_CANDIDATE.md",
      "docs/project/PRODUCT_WORK_GATE.md",
      "docs/project/NUTRITION_BOOTSTRAP_DOC_STATUS.md",
      "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    ],
    "raw_sources": [],
    "raw_sources_allowed": false,
    "ssot_priority": [
      "module_index",
      "current_specs",
      "reviews"
    ]
  },
  "objectives": [
    "Produce a draft-only source-chain readiness report.",
    "Produce a draft-only non-dispatchable workorder candidate."
  ],
  "constraints": [
    "No product execution.",
    "No BLS import.",
    "No raw BLS commit.",
    "No Nutrition implementation.",
    "No DB work.",
    "No Supabase commands.",
    "No migration execution.",
    "No approval grants.",
    "No dispatcher execution.",
    "No Codex Worker execution.",
    "No product batch execution."
  ],
  "non_goals": [
    "Do not create an executable product batch.",
    "Do not create a queue-releasable workorder.",
    "Do not claim import readiness beyond the documented source set."
  ],
  "workorders": [
    {
      "id": "WO-p1-005-preparation-draft-001",
      "title": "Draft P1-005 preparation readiness package",
      "agent_id": "docs-agent",
      "risk_category": "docs",
      "task": "<analyze>Review only the approved P1-005 preparation source set and identify the minimum source-backed planning package.</analyze>\n<implement>Create a draft-only source-chain readiness report and a draft-only non-dispatchable workorder candidate. Mark both as non-executable and not queue released.</implement>\n<constraints>No product execution. No BLS import. No DB or Supabase commands. No migrations. No approval grants. No dispatcher or Codex Worker execution. No raw BLS file writes or commits.</constraints>\n<on_error>Stop with FIX_REQUIRED if source-chain evidence is incomplete or if the candidate would require execution-scoped outputs.</on_error>",
      "expected_outputs": [
        "docs/project/p1-005/P1-005-source-chain-readiness-report.md",
        "system/workorders/nutrition/drafts/WO-NUTRITION-P1-005-preparation-draft.md"
      ],
      "scope_files": [
        "docs/project/p1-005/P1-005-source-chain-readiness-report.md",
        "system/workorders/nutrition/drafts/WO-NUTRITION-P1-005-preparation-draft.md"
      ],
      "files_allowed": [
        "docs/project/p1-005/P1-005-source-chain-readiness-report.md",
        "system/workorders/nutrition/drafts/WO-NUTRITION-P1-005-preparation-draft.md"
      ],
      "files_blocked": [
        "system/state/**",
        "system/approval/**",
        "supabase/**",
        "docs/specs/Nutrition/00_raw/**",
        ".env",
        ".env.*"
      ],
      "acceptance_criteria": [
        "Both expected outputs exist as draft-only artifacts.",
        "The workorder candidate is explicitly marked NON_EXECUTABLE_DRAFT, NOT_QUEUE_RELEASED, and NOT_DISPATCHABLE.",
        "No task content requests import, DB, Supabase, migration, approval, dispatcher, or Codex execution.",
        "Source-chain references stay inside the approved source set."
      ],
      "acceptance_hints": [
        "Treat historical Nutrition batches and local Supabase reports as evidence only, not active runbooks.",
        "If any source fact is missing, mark it incomplete instead of inventing details."
      ],
      "negative_constraints": [
        "Do not run BLS import.",
        "Do not run Supabase commands.",
        "Do not execute migrations.",
        "Do not write runtime_state.json or queue.json.",
        "Do not dispatch any workorder.",
        "Do not execute Codex Worker."
      ],
      "blocked_by": [],
      "context_files": [
        "docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md",
        "docs/project/P1_005_READINESS_CANDIDATE.md",
        "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md",
        "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md"
      ],
      "validation_commands": [
        "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts <draft-candidate> --json --project lumeos"
      ],
      "requires_approval": false,
      "phase": 1,
      "priority": "P0",
      "quality_critical": true,
      "source_refs": {
        "module_index": "docs/specs/Nutrition/INDEX.md",
        "current_specs": [
          "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
        ],
        "reviews": [
          "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md",
          "docs/project/P1_005_READINESS_CANDIDATE.md"
        ],
        "raw_sources": [],
        "raw_sources_allowed": false,
        "ssot_priority": [
          "module_index",
          "current_specs",
          "reviews"
        ]
      }
    }
  ],
  "dependencies": [
    "Tom-approved narrow gate for Nutrition / BLS / P1-005 preparation only",
    "Historical P1-004 static schema verification evidence"
  ],
  "conflicts": [
    "Any request to execute BLS import",
    "Any request to run Supabase or migration commands",
    "Any request to convert this draft directly into a dispatchable batch without a new Tom decision"
  ],
  "acceptance_hint": "Use this candidate only for decomposition-plan validation and factory dry-run. Treat any later executable workorder or batch as a separate approval boundary."
}
```
