# WO-NUTRITION-P1-018 - Local Food Foundation Schema Slice

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only food foundation
**Source:** current Nutrition schema source and completed local nutrient foundation
**Execution authority:** scoped product-gate exception for one exact local-only schema batch only
**Scope boundary:** governed artifact/code/docs preparation plus local Supabase/Test DB schema-only apply after gates pass

```yaml
workorder_id: "WO-nutrition-018"
agent_id: "senior-coding-agent"
codex_worker: false
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Local-only rollback, if separately approved, would drop nutrition.food_nutrients first and nutrition.foods second; no rows are inserted by this slice."

task: |
  Build the minimum local-only Nutrition food foundation schema slice needed
  before any food search can exist.

  Required behavior:
  - Create a schema-only migration candidate for local Supabase/Test DB only.
  - Add nutrition.foods and nutrition.food_nutrients.
  - Make nutrition.food_nutrients.nutrient_code reference nutrition.nutrient_defs(code).
  - Keep the slice additive and drift-aware.
  - Insert no rows.
  - Add no food search and no food UI.
  - Update the local schema debug/status page only to show schema status,
    table row counts, and FK status.
  - Update active handover with the local-only schema boundary and validation
    outcome after local apply.
  - Produce a local validation report for this slice.

  Do not run DEV/LIVE commands, Supabase Cloud commands, BLS import, raw BLS
  commit, invented food values, seed/import rows, production routing,
  MiniMax routing, manual runtime_state edit, or manual queue edit.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  patches: []
  sql_sources:
    - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
    - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-bls-source-inventory.md"
    - "docs/project/p1-005/P1-005-import-field-mapping.md"
    - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"
  raw_sources: []
  raw_sources_allowed: false
  ssot_priority:
    - "module_index"
    - "current_specs"
    - "sql_sources"
    - "reviews"
    - "patches"
    - "adrs"
    - "raw_sources"

documentation_impact:
  required: true
  domains:
    - "product"
    - "product_gate"
  ssot_files:
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    - "docs/project/p1-005/P1-005-local-food-foundation-validation.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/lib/nutrition/__tests__/local-schema-debug.test.ts"
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "system/workorders/nutrition/__tests__/food-foundation-slice.test.ts"
  - "docs/project/p1-005/P1-005-local-food-foundation-validation.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/lib/nutrition/__tests__/local-schema-debug.test.ts"
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "system/workorders/nutrition/__tests__/food-foundation-slice.test.ts"
  - "docs/project/p1-005/P1-005-local-food-foundation-validation.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/lib/nutrition/__tests__/local-schema-debug.test.ts"
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "system/workorders/nutrition/__tests__/food-foundation-slice.test.ts"
  - "docs/project/p1-005/P1-005-local-food-foundation-validation.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/project/p1-005/P1-005-bls-source-inventory.md"
  - "docs/project/p1-005/P1-005-import-field-mapping.md"
  - "docs/project/p1-005/P1-005-additive-migration-candidate-plan.md"
  - "docs/project/p1-005/P1-005-rollback-and-validation-checklist.md"
  - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "nutrition.foods exists locally after the approved local-only apply."
  - "nutrition.food_nutrients exists locally after the approved local-only apply."
  - "nutrition.food_nutrients.nutrient_code references nutrition.nutrient_defs(code)."
  - "nutrition.foods row count remains 0."
  - "nutrition.food_nutrients row count remains 0."
  - "No food search, food UI, BLS import, raw BLS commit, seed/import rows, DEV/LIVE action, production routing change, or MiniMax routing change is introduced."
  - "Local schema debug/status page exposes the food foundation table/FK status without adding food search."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."
  - "All expected output files listed in this workorder exist and are complete."

negative_constraints:
  - "No food search."
  - "No food UI."
  - "No BLS import execution."
  - "No raw BLS commit."
  - "No invented food values."
  - "No seed/import rows unless separately approved."
  - "No DEV/LIVE action."
  - "No Supabase Cloud command."
  - "No production routing change."
  - "No MiniMax production routing change."
  - "No manual runtime_state edit."
  - "No manual queue edit."

required_skills:
  - "nutrition-specialist"
  - "supabase-specialist"
  - "test-driven-development"
  - "lint-and-validate"
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\local-schema-debug.test.ts"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test system\\workorders\\nutrition\\__tests__\\food-foundation-slice.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"

blocked_by: []
```
