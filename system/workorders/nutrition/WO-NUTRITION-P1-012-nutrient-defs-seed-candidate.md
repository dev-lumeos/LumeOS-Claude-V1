# WO-NUTRITION-P1-012 - NutrientDefs Seed Candidate

**Status:** ready_to_run
**Phase:** 1 - Nutrition / BLS / P1-005 local-only seed preparation
**Source:** `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
**Execution authority:** scoped product-gate exception for one exact local-only review batch only
**Scope boundary:** review-only seed candidate output only

```yaml
workorder_id: "WO-nutrition-012"
agent_id: "docs-agent"
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "docs"

task: |
  Produce the local-only review seed candidate for nutrition.nutrient_defs.
  Write exactly one output:
  - docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md

  Completion without writing this file is invalid. The dispatcher must receive a write tool
  request for the exact output path above. Do not return a completed/no-tool response unless
  the file has already been written and satisfies all acceptance criteria.

  The candidate must be a complete markdown review artifact, not a stub. It must include these sections:
  - Title and status
  - Purpose
  - Scope
  - Source refs
  - Expected row count
  - Review-only seed candidate table
  - Validation query
  - Explicit exclusions
  - Stop conditions
  - Next local-only boundary

  The review-only seed candidate table must be bounded for dispatcher reliability.
  Do not attempt to emit the full 138-row payload in this workorder. Emit exactly 10
  representative rows that are safely source-derived, and include an explicit gap note
  that the full 138-row seed payload remains blocked until a separate seed-payload
  generation boundary is opened.

  The representative review-only seed candidate table must include meaningful rows and the columns:
  - code
  - name_de
  - name_en
  - name_th
  - group_de
  - group_en
  - group_th
  - unit
  - display_tier
  - sort_order
  - source_ref

  Source discipline:
  - Use only repo source paths from source_refs/context_files below.
  - Derive representative rows from `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`,
    section `### Seed-Daten: nutrient_defs (138 Codes)`.
  - The `source_ref` table column must cite the repo source path/section, for example:
    `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md:67-257`.
  - Do not cite invented external versions such as `BLS2023-v2.1`, `BLS-2024-09`, or
    `LUMEOS-nutrition-v1.2` unless that exact string appears in the repo source files.
  - Do not fabricate nutrient names, units, groups, or row payload.
  - It is acceptable for name_th and group_th to be empty string while no translation seed boundary is open.

  The candidate must:
  - stay review-only and non-executable
  - cite the approved source refs for the nutrient_defs seed payload
  - state the expected seed row count from the approved specs
  - include a validation query for later local-only verification
  - state that Thai fields may remain empty string in the candidate while no translation seed boundary is open
  - state that no seed execution, local DB apply, Supabase command, DEV/LIVE action, BLS import, raw BLS commit, or migration execution is authorized

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md"
    - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  patches: []
  sql_sources:
    - "supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql"
    - "supabase/migrations/20260513_002_nutrition_nutrient_defs_th_i18n_slice.sql"
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-bls-source-inventory.md"
    - "docs/project/p1-005/P1-005-import-field-mapping.md"
    - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
    - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"
    - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"
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
  - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"

scope_files:
  - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"

files_allowed:
  - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md"
  - "docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md"
  - "supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql"
  - "supabase/migrations/20260513_002_nutrition_nutrient_defs_th_i18n_slice.sql"
  - "docs/project/p1-005/P1-005-bls-source-inventory.md"
  - "docs/project/p1-005/P1-005-import-field-mapping.md"
  - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
  - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"
  - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - "supabase/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The output is review-only and non-executable."
  - "The output cites only approved source-chain inputs."
  - "The output states the expected nutrient_defs seed row count as 138."
  - "The output includes at least one later validation query for row count verification."
  - "The output states that Thai fields may remain empty string while translation seed work stays blocked."
  - "The output does not authorize seed execution, local DB apply, Supabase commands, DEV/LIVE, BLS import, raw BLS commit, or migration execution."

negative_constraints:
  - "Do not execute seed inserts."
  - "Do not apply anything to the local DB."
  - "Do not run Supabase commands."
  - "Do not perform DEV or LIVE actions."
  - "Do not run BLS import."
  - "Do not commit raw BLS files."
  - "Do not execute migrations."
  - "Do not edit runtime_state.json."
  - "Do not edit queue.json."
  - "Do not change production routing."

required_skills: []
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SEED-CANDIDATE.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SEED-CANDIDATE.md --dry-run --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SEED-CANDIDATE.md --doctor --json --project lumeos"

blocked_by: []
```
