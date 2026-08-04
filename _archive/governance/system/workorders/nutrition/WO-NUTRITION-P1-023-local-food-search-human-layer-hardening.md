# WO-NUTRITION-P1-023 - Local Food Search Human Layer Hardening

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only Human Layer and Food Search hardening
**Source:** SPEC_03 User Flows, SPEC_04 Features, SPEC_05 Food Taxonomy, SPEC_06 Database Schema, SPEC_07 API, SPEC_08 Import Pipeline
**Execution authority:** scoped product-gate exception for one exact local-only Human Layer hardening batch only
**Scope boundary:** local-only taxonomy/search metadata, read-only API/UI hardening, and documentation

```yaml
workorder_id: "WO-nutrition-023"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Local-only rollback requires a separately approved local SQL rollback if needed. Do not run DEV/LIVE rollback."

task: |
  Harden the local-only Nutrition Food Taxonomy / Human Layer and Food Search
  slice toward current specs without adding diary logging, MealItem creation, or
  unsourced human-friendly names.

  Required behavior:
  - Verify the local baseline before changes.
  - Extract deterministic L3/L4 categories from SPEC_05 nested bullet hierarchy.
  - Improve deterministic food category coverage only where source/spec rules are clear.
  - Refresh local sort_weight using deterministic SPEC_08 rules.
  - Keep V1 visible tags limited to the 16 SPEC_04/SPEC_05 tags.
  - Keep food_aliases source-backed only.
  - Add SPEC_07-style local API support for q, category/category_id, tag, limit,
    offset, and sort modes.
  - Add a read-only category tree endpoint.
  - Update /nutrition with category/tag filters, sort selector, pagination,
    macro badges, selected food detail, and source-label warning.
  - Update documentation/SSOT.

  Do not run DEV/LIVE, Supabase Cloud, production DB, BLS import expansion, raw
  BLS commit, unsourced categories, source-unbacked aliases, source-unbacked
  display names, unsourced food values, unsourced nutrient values, RDA changes,
  diary write flow, MealItem creation, production routing, MiniMax routing,
  service restart, manual runtime_state edits, or manual queue edits.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  patches: []
  sql_sources:
    - "docs/project/p1-005/P1-005-local-food-human-layer.sql"
    - "docs/project/p1-005/P1-005-local-food-human-layer-validation.sql"
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
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
    - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "system/workorders/cli/nutrition-human-layer.ts"
  - "system/workorders/cli/__tests__/nutrition-human-layer.test.ts"
  - "docs/project/p1-005/P1-005-local-food-human-layer.sql"
  - "docs/project/p1-005/P1-005-local-food-human-layer-validation.sql"
  - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
  - "apps/web/src/lib/nutrition/food-search.ts"
  - "apps/web/src/lib/nutrition/__tests__/food-search.test.ts"
  - "apps/web/src/app/api/nutrition/foods/route.ts"
  - "apps/web/src/app/api/nutrition/foods/categories/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "system/workorders/cli/nutrition-human-layer.ts"
  - "system/workorders/cli/__tests__/nutrition-human-layer.test.ts"
  - "docs/project/p1-005/P1-005-local-food-human-layer.sql"
  - "docs/project/p1-005/P1-005-local-food-human-layer-validation.sql"
  - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
  - "apps/web/src/lib/nutrition/food-search.ts"
  - "apps/web/src/lib/nutrition/__tests__/food-search.test.ts"
  - "apps/web/src/app/api/nutrition/foods/route.ts"
  - "apps/web/src/app/api/nutrition/foods/categories/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "system/workorders/cli/nutrition-human-layer.ts"
  - "system/workorders/cli/__tests__/nutrition-human-layer.test.ts"
  - "docs/project/p1-005/P1-005-local-food-human-layer.sql"
  - "docs/project/p1-005/P1-005-local-food-human-layer-validation.sql"
  - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
  - "apps/web/src/lib/nutrition/food-search.ts"
  - "apps/web/src/lib/nutrition/__tests__/food-search.test.ts"
  - "apps/web/src/app/api/nutrition/foods/route.ts"
  - "apps/web/src/app/api/nutrition/foods/categories/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "All expected_outputs files exist and are complete for the governed Human Layer hardening boundary."
  - "Local food_categories has 13 L1, 75 L2, deterministic L3 rows, and deterministic L4 rows from SPEC_05."
  - "Local category hierarchy has no orphan parents."
  - "Local foods remains 7140 and food_nutrients remains FK-valid."
  - "Foods categorized count is improved from the verified baseline without unsourced mappings."
  - "sort_weight is populated for all local foods using deterministic SPEC_08 rules."
  - "/api/nutrition/foods supports q, category/category_id, tag, limit, offset, and sort modes."
  - "/api/nutrition/foods/categories returns a category hierarchy."
  - "/nutrition shows category filters, V1 tag filters, sort selector, pagination controls, macro badges, selected food detail, and source-label warning."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."

negative_constraints:
  - "No DEV/LIVE action."
  - "No Supabase Cloud action."
  - "No production DB action."
  - "No raw BLS commit."
  - "No unsourced food values."
  - "No unsourced nutrient values."
  - "No unsourced categories."
  - "No source-unbacked aliases or synonyms."
  - "No source-unbacked display names."
  - "No RDA value change."
  - "No Diary write flow."
  - "No MealItem creation."
  - "No production routing change."
  - "No MiniMax routing change."
  - "No service restart."
  - "No manual runtime_state edit."
  - "No manual queue edit."

required_skills:
  - "nutrition-specialist"
  - "supabase-specialist"
  - "frontend-specialist"
  - "test-driven-development"
  - "lint-and-validate"
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test system\\workorders\\cli\\__tests__\\nutrition-human-layer.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\food-search.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"

blocked_by: []
```
