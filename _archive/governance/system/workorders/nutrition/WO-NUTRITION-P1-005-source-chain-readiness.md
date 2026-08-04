# WO-NUTRITION-P1-005 - Source-Chain Readiness Report

**Status:** ready_to_run
**Phase:** 1 - Nutrition / BLS / P1-005 preparation
**Source:** `docs/project/P1_005_DECOMPOSITION_CANDIDATE.md` (`PLAN-NUTRITION-P1-005-PREPARATION-001`)
**Execution authority:** scoped product-gate exception for one exact batch only
**Scope boundary:** report generation only

```yaml
workorder_id: "WO-nutrition-005"
agent_id: "docs-agent"
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "docs"

task: |
  Produce the P1-005 source-chain readiness report only.
  Use the approved Nutrition / BLS / P1-005 preparation source set and write exactly one output:
  docs/project/p1-005/P1-005-source-chain-readiness-report.md

  The report must:
  - summarize the approved source chain for P1-005 preparation
  - state what is established vs intentionally not established
  - keep the scope strictly read-only / analysis-only
  - state that no BLS import, DB work, Supabase, migration, or product implementation is authorized

  This workorder is executable only inside the exact allowlisted batch and remains forbidden from any import,
  DB, Supabase, migration, approval, runtime-state, queue-state, dispatcher-routing, or product-implementation work.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  patches: []
  sql_sources: []
  adrs: []
  reviews:
    - "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md"
    - "docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md"
    - "docs/project/P1_005_READINESS_CANDIDATE.md"
    - "docs/project/P1_005_DECOMPOSITION_CANDIDATE.md"
    - "docs/project/PRODUCT_WORK_GATE.md"
    - "docs/project/NUTRITION_BOOTSTRAP_DOC_STATUS.md"
    - "docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md"
    - "docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md"
    - "docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md"
  raw_sources: []
  raw_sources_allowed: false
  ssot_priority:
    - module_index
    - current_specs
    - patches
    - sql_sources
    - adrs
    - reviews
    - raw_sources

expected_outputs:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"

scope_files:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"

files_allowed:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"

context_files:
  - "docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md"
  - "docs/project/P1_005_READINESS_CANDIDATE.md"
  - "docs/project/P1_005_DECOMPOSITION_CANDIDATE.md"
  - "docs/project/PRODUCT_WORK_GATE.md"
  - "docs/project/NUTRITION_BOOTSTRAP_DOC_STATUS.md"
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md"
  - "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "supabase/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "Exactly one expected output exists and is complete."
  - "The report states what is established and what is intentionally not established."
  - "The report stays inside approved P1-005 preparation source-chain scope."
  - "The report does not authorize BLS import, DB work, Supabase, migration, or product implementation."

negative_constraints:
  - "Do not run BLS import."
  - "Do not commit raw BLS files."
  - "Do not run DB work."
  - "Do not run Supabase commands."
  - "Do not execute migrations."
  - "Do not implement Nutrition product code."
  - "Do not edit runtime_state.json."
  - "Do not edit queue.json."
  - "Do not change production routing."

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SOURCE-CHAIN-READINESS.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SOURCE-CHAIN-READINESS.md --dry-run --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SOURCE-CHAIN-READINESS.md --doctor --json --project lumeos"

blocked_by: []
```
