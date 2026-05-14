# WO-NUTRITION-P1-022 - Local Food Human Layer Foundation

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only Food Taxonomy / Human Layer
**Source:** SPEC_05 Food Taxonomy, SPEC_06 Database Schema, SPEC_04 Features, SPEC_08 Import Pipeline, SPEC_07 API
**Execution authority:** scoped product-gate exception for one exact local-only Human Layer batch only
**Scope boundary:** local-only schema/data foundation plus read-only Food Search enhancement

```yaml
workorder_id: "WO-nutrition-022"
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
  Build the local-only Food Taxonomy / Human Layer foundation required before
  better Food Search can exist.

  Required behavior:
  - Inspect local schema gap for food_categories, tag_definitions, food_tags,
    food_aliases, and missing Human Layer columns on nutrition.foods.
  - Create and apply a local-only deterministic SQL foundation.
  - Seed all explicit Level 1 and Level 2 categories extractable from
    SPEC_05_FOOD_TAXONOMY.md.
  - Insert the 16 V1 visible tag definitions from SPEC_04/SPEC_05.
  - Auto-assign only deterministic macro-derived tags.
  - Generate only source-backed aliases from exact source labels and
    deterministic normalized variants.
  - Assign categories only with deterministic BLS code/name rules from specs.
  - Enhance /nutrition and /api/nutrition/foods to use category, tag, and alias
    data when available.
  - Keep the UI read-only and preserve the source-label warning.

  Do not run DEV/LIVE, Supabase Cloud, production DB, BLS import expansion, raw
  BLS commit, invented categories, source-unbacked aliases, source-unbacked
  display names, invented food values, invented nutrient values, RDA changes,
  diary write flow, MealItem creation, production routing, MiniMax routing,
  service restart, manual runtime_state edits, or manual queue edits.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
  patches: []
  sql_sources:
    - "docs/project/p1-005/P1-005-local-food-human-layer.sql"
    - "docs/project/p1-005/P1-005-local-food-human-layer-validation.sql"
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
    - "docs/project/p1-005/P1-005-local-food-search-slice.md"
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
  - "apps/web/src/app/nutrition/page.tsx"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "Local food_categories exists and has 13 L1 and at least 75 L2 source-backed categories."
  - "Local tag_definitions has the 16 V1 visible tags."
  - "Local food_tags contains only deterministic macro-derived assignments for this slice."
  - "Local food_aliases contains source-backed exact/normalized aliases only."
  - "nutrition.foods remains 7140 rows and nutrition.food_nutrients remains FK-valid."
  - "Categorized/unassigned food counts are reported."
  - "/nutrition shows category and V1 tag filters when data exists."
  - "/nutrition and /api/nutrition/foods remain read-only."
  - "The UI keeps BLS labels marked as source-backed technical labels."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."

negative_constraints:
  - "No DEV/LIVE action."
  - "No Supabase Cloud action."
  - "No production DB action."
  - "No raw BLS commit."
  - "No invented food values."
  - "No invented nutrient values."
  - "No invented categories."
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
