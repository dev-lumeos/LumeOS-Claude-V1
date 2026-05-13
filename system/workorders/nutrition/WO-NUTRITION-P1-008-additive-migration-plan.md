# WO-NUTRITION-P1-008 - Additive Migration Candidate Plan

**Status:** ready_to_run
**Phase:** 1 - Nutrition / BLS / P1-005 preparation
**Source:** `docs/project/p1-005/P1-005-next-execution-plan.md`
**Execution authority:** scoped product-gate exception for one exact planning-only batch only
**Scope boundary:** planning output only

```yaml
workorder_id: "WO-nutrition-008"
agent_id: "docs-agent"
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "docs"

task: |
  Produce the P1-005 additive migration candidate plan and rollback/validation checklist only.
  Write exactly two outputs:
  - docs/project/p1-005/P1-005-additive-migration-candidate-plan.md
  - docs/project/p1-005/P1-005-rollback-and-validation-checklist.md

  The plan must:
  - identify the likely additive schema preparation steps implied by the current specs and existing local inventory
  - define sequencing, validation gates, and rollback thinking without authoring or executing real migrations
  - distinguish plan candidates from approved migration files
  - state that no DB work, Supabase command, migration execution, or product implementation is authorized

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
    - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"
    - "docs/project/p1-005/P1-005-next-execution-plan.md"
    - "docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md"
    - "docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md"
    - "docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md"
    - "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md"
  raw_sources:
    - "docs/specs/Nutrition/00_raw/"
  raw_sources_allowed: true
  ssot_priority:
    - module_index
    - current_specs
    - patches
    - sql_sources
    - adrs
    - reviews
    - raw_sources

expected_outputs:
  - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
  - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"

scope_files:
  - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
  - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"

files_allowed:
  - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
  - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"

context_files:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"
  - "docs/project/p1-005/P1-005-next-execution-plan.md"
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md"
  - "docs/specs/Nutrition/00_raw/"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "supabase/**"
  - "supabase/migrations/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The migration candidate plan remains documentation-only."
  - "The rollback/checklist output describes sequencing and verification without executable SQL or commands."
  - "The plan distinguishes established facts, assumptions, and still-blocked execution steps."
  - "Neither output authorizes import, DB work, Supabase, migration execution, or product implementation."

negative_constraints:
  - "Do not run BLS import."
  - "Do not commit raw BLS files."
  - "Do not run DB work."
  - "Do not run Supabase commands."
  - "Do not execute migrations."
  - "Do not write under supabase/migrations."
  - "Do not implement Nutrition product code."
  - "Do not edit runtime_state.json."
  - "Do not edit queue.json."
  - "Do not change production routing."

required_skills: []
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-IMPORT-PREPARATION.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-IMPORT-PREPARATION.md --dry-run --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-IMPORT-PREPARATION.md --doctor --json --project lumeos"

blocked_by:
  - "WO-nutrition-006"
  - "WO-nutrition-007"
```
