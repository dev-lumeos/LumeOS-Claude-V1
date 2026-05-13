# WO-NUTRITION-P1-006 - BLS Source Inventory

**Status:** ready_to_run
**Phase:** 1 - Nutrition / BLS / P1-005 preparation
**Source:** `docs/project/p1-005/P1-005-next-execution-plan.md`
**Execution authority:** scoped product-gate exception for one exact planning-only batch only
**Scope boundary:** read-only source inspection and planning output only

```yaml
workorder_id: "WO-nutrition-006"
agent_id: "docs-agent"
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "docs"

task: |
  Produce the P1-005 BLS source inventory only.
  Write exactly one output:
  docs/project/p1-005/P1-005-bls-source-inventory.md

  The inventory must:
  - summarize the documented and local raw-source inputs relevant to future P1-005 import planning
  - distinguish current SSOT documents from local raw-source provenance material
  - avoid inventing row counts, field names, or import status
  - state that no BLS import, raw BLS commit, DB work, Supabase, migration, or product implementation is authorized

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
  - "docs/project/p1-005/P1-005-bls-source-inventory.md"

scope_files:
  - "docs/project/p1-005/P1-005-bls-source-inventory.md"

files_allowed:
  - "docs/project/p1-005/P1-005-bls-source-inventory.md"

context_files:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"
  - "docs/project/p1-005/P1-005-next-execution-plan.md"
  - "docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md"
  - "docs/project/PRODUCT_WORK_GATE.md"
  - "docs/project/NUTRITION_BOOTSTRAP_DOC_STATUS.md"
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  - "docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md"
  - "docs/specs/Nutrition/00_raw/"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "supabase/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The inventory distinguishes current spec SSOT from local raw-source provenance."
  - "The inventory does not claim import execution, import completeness, or DB readiness."
  - "The inventory cites only approved source-chain inputs and existing local raw-source paths."
  - "The output remains planning-only and does not authorize product execution."

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

required_skills: []
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-IMPORT-PREPARATION.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-IMPORT-PREPARATION.md --dry-run --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-IMPORT-PREPARATION.md --doctor --json --project lumeos"

blocked_by: []
```
