# WO-NUTRITION-P1-010 - Schema Foundation SQL Draft

**Status:** ready_to_run
**Phase:** 1 - Nutrition / BLS / P1-005 post-planning candidate
**Source:** `docs/project/p1-005/P1-005-additive-migration-candidate-plan.md`
**Execution authority:** scoped product-gate exception for one exact candidate batch only
**Scope boundary:** SQL draft only, outside executable migration paths

```yaml
workorder_id: "WO-nutrition-010"
agent_id: "docs-agent"
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "docs"

task: |
  Produce the first P1-005 additive SQL draft only.
  Write exactly one output:
  - docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql

  The draft must:
  - stay outside supabase/migrations/
  - cover only the first additive schema-foundation slice
  - use only schema elements explicitly supported by the approved source set
  - remain reviewable and non-executable
  - state clearly that no DB work, Supabase command, migration execution, or BLS import is authorized

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
    - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  patches: []
  sql_sources: []
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-bls-source-inventory.md"
    - "docs/project/p1-005/P1-005-import-field-mapping.md"
    - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
    - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"
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
  - "docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql"

scope_files:
  - "docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql"

files_allowed:
  - "docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql"

context_files:
  - "docs/project/p1-005/P1-005-bls-source-inventory.md"
  - "docs/project/p1-005/P1-005-import-field-mapping.md"
  - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
  - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "supabase/**"
  - "db/migrations/**"
  - "supabase/migrations/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The SQL draft remains outside executable migration paths."
  - "The SQL draft is additive-only and foundation-only."
  - "The draft does not include seed data, import logic, RLS, grants, or execution instructions."
  - "The output states clearly that it is non-executable."

negative_constraints:
  - "Do not run BLS import."
  - "Do not commit raw BLS files."
  - "Do not run DB work."
  - "Do not run Supabase commands."
  - "Do not execute migrations."
  - "Do not write under supabase/migrations."
  - "Do not write under db/migrations."
  - "Do not edit runtime_state.json."
  - "Do not edit queue.json."
  - "Do not change production routing."

required_skills: []
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SCHEMA-FOUNDATION-DRAFT.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SCHEMA-FOUNDATION-DRAFT.md --dry-run --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SCHEMA-FOUNDATION-DRAFT.md --doctor --json --project lumeos"

blocked_by: []
```
