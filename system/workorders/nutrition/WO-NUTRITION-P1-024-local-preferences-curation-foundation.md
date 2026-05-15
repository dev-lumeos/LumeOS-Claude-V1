# WO-NUTRITION-P1-024 - Local Preferences Curation Foundation

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only Preferences + Human Layer Curation foundation
**Source:** SPEC_01 Module Contract, SPEC_02 Entities, SPEC_03 User Flows, SPEC_04 Features, SPEC_05 Food Taxonomy, SPEC_06 Database Schema, SPEC_07 API, SPEC_10 Components, and old-platform Preference screen text supplied by Tom
**Execution authority:** scoped product-gate exception for one exact local-only Preferences foundation batch only
**Scope boundary:** local-only preferences schema, read-only catalog/API/preview, spec-gap report, and documentation

```yaml
workorder_id: "WO-nutrition-024"
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
  Build the local-only Nutrition Preferences + Human Layer Curation foundation
  needed before preference-aware Smart Search can become product behavior.

  Required behavior:
  - Compare old-platform Preference screenshot text against current Nutrition specs.
  - Document covered/partial/missing/implemented gaps.
  - Create a local-only spec patch/report for weak fields such as exclusion
    presets, cuisine codes, meal prep, planner notes, meal/snack counts, and
    preference strength.
  - Create/apply local-only schema for nutrition.food_preferences and
    nutrition.food_preference_items where missing.
  - Add a deterministic read-only preference catalog covering diet types,
    allergies/intolerances, general exclusions, cuisines, meal structure,
    cooking options, budget, and old-platform food preference groups/items.
  - Map preference catalog entries to Human Layer category/tag/cuisine targets
    only where deterministic; keep unresolved mappings explicit.
  - Add read-only GET /api/nutrition/preferences/catalog.
  - Add a small read-only /nutrition preview for the Preferences foundation.
  - Document Smart Search integration boundary without enabling Smart Search
    filtering or user preference writes.

  Do not run DEV/LIVE, Supabase Cloud, production DB, unsourced food/nutrient
  values, source-unbacked aliases/display names, AI-generated preference mappings,
  diary write flow, MealItem creation, production routing, MiniMax routing,
  service restart, manual runtime_state edits, or manual queue edits.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md"
  patches:
    - "docs/project/p1-005/P1-005-preferences-spec-gap-patch.md"
  sql_sources:
    - "docs/project/p1-005/P1-005-local-preferences-foundation.sql"
    - "docs/project/p1-005/P1-005-local-preferences-foundation-validation.sql"
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-local-preferences-foundation-report.md"
  raw_sources: []
  raw_sources_allowed: false
  ssot_priority:
    - "module_index"
    - "current_specs"
    - "patches"
    - "sql_sources"
    - "reviews"
    - "adrs"
    - "raw_sources"

documentation_impact:
  required: true
  domains:
    - "product"
    - "product_gate"
  ssot_files:
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    - "docs/project/p1-005/P1-005-local-preferences-foundation-report.md"
    - "docs/project/p1-005/P1-005-preferences-spec-gap-patch.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "apps/web/src/lib/nutrition/preferences-catalog.ts"
  - "apps/web/src/lib/nutrition/__tests__/preferences-catalog.test.ts"
  - "apps/web/src/app/api/nutrition/preferences/catalog/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "system/workorders/cli/nutrition-preferences-foundation.ts"
  - "system/workorders/cli/__tests__/nutrition-preferences-foundation.test.ts"
  - "docs/project/p1-005/P1-005-local-preferences-foundation.sql"
  - "docs/project/p1-005/P1-005-local-preferences-foundation-validation.sql"
  - "docs/project/p1-005/P1-005-local-preferences-foundation-report.md"
  - "docs/project/p1-005/P1-005-preferences-spec-gap-patch.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "apps/web/src/lib/nutrition/preferences-catalog.ts"
  - "apps/web/src/lib/nutrition/__tests__/preferences-catalog.test.ts"
  - "apps/web/src/app/api/nutrition/preferences/catalog/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "system/workorders/cli/nutrition-preferences-foundation.ts"
  - "system/workorders/cli/__tests__/nutrition-preferences-foundation.test.ts"
  - "docs/project/p1-005/P1-005-local-preferences-foundation.sql"
  - "docs/project/p1-005/P1-005-local-preferences-foundation-validation.sql"
  - "docs/project/p1-005/P1-005-local-preferences-foundation-report.md"
  - "docs/project/p1-005/P1-005-preferences-spec-gap-patch.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "apps/web/src/lib/nutrition/preferences-catalog.ts"
  - "apps/web/src/lib/nutrition/__tests__/preferences-catalog.test.ts"
  - "apps/web/src/app/api/nutrition/preferences/catalog/route.ts"
  - "apps/web/src/app/nutrition/page.tsx"
  - "system/workorders/cli/nutrition-preferences-foundation.ts"
  - "system/workorders/cli/__tests__/nutrition-preferences-foundation.test.ts"
  - "docs/project/p1-005/P1-005-local-preferences-foundation.sql"
  - "docs/project/p1-005/P1-005-local-preferences-foundation-validation.sql"
  - "docs/project/p1-005/P1-005-local-preferences-foundation-report.md"
  - "docs/project/p1-005/P1-005-preferences-spec-gap-patch.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "All expected output files exist and are complete."
  - "Local nutrition.food_preferences and nutrition.food_preference_items exist."
  - "No real user preference rows are inserted."
  - "Preference catalog includes all old-platform visible option groups or explicitly documents deferral."
  - "Mapped and unresolved preference mappings are reported."
  - "GET /api/nutrition/preferences/catalog returns the read-only catalog."
  - "/nutrition shows a read-only Preferences foundation preview without enabling persistence."
  - "Smart Search integration boundary is documented and not enabled as product default."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."

negative_constraints:
  - "No DEV/LIVE action."
  - "No Supabase Cloud action."
  - "No production DB action."
  - "No unsourced food values."
  - "No unsourced nutrient values."
  - "No source-unbacked aliases or display names."
  - "No AI-generated preference mappings."
  - "No diary write flow."
  - "No MealItem creation."
  - "No production routing change."
  - "No MiniMax routing change."
  - "No service restart."
  - "No manual runtime_state edit."
  - "No manual queue edit."

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\preferences-catalog.test.ts system\\workorders\\cli\\__tests__\\nutrition-preferences-foundation.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\food-search.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"

blocked_by: []
```
