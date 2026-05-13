# WO-NUTRITION-P1-007 - Import Field Mapping

**Status:** ready_to_run
**Phase:** 1 - Nutrition / BLS / P1-005 preparation
**Source:** `docs/project/p1-005/P1-005-next-execution-plan.md`
**Execution authority:** scoped product-gate exception for one exact planning-only batch only
**Scope boundary:** planning output only

```yaml
workorder_id: "WO-nutrition-007"
agent_id: "docs-agent"
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "docs"

task: |
  Produce the P1-005 import field mapping plan only.
  Write exactly one output:
  docs/project/p1-005/P1-005-import-field-mapping.md

  The mapping plan must:
  - map known spec-level import concepts to target schema concepts
  - clearly separate confirmed mappings from unknowns that require later raw-source inspection or migration proof
  - avoid inventing concrete raw input columns when they are not explicitly present in the approved source set
  - state that no BLS import, DB work, Supabase, migration, or product implementation is authorized

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
  - "docs/project/p1-005/P1-005-import-field-mapping.md"

scope_files:
  - "docs/project/p1-005/P1-005-import-field-mapping.md"

files_allowed:
  - "docs/project/p1-005/P1-005-import-field-mapping.md"

context_files:
  - "docs/project/p1-005/P1-005-source-chain-readiness-report.md"
  - "docs/project/p1-005/P1-005-next-execution-plan.md"
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  - "docs/specs/Nutrition/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md"
  - "docs/specs/Nutrition/00_raw/"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "supabase/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "Confirmed mappings are explicitly tied to current specs."
  - "Unknown or unproven mappings are listed as gaps rather than invented facts."
  - "The plan contains no executable import or DB instructions."
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

blocked_by:
  - "WO-nutrition-006"
```
