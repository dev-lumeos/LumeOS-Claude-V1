# WO-NUTRITION-P1-017 - Local RDA Availability Filter

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only UI visibility
**Source:** local `nutrition.nutrient_defs` debug snapshot and current Nutrition schema source
**Execution authority:** scoped product-gate exception for one exact local-only UI batch only
**Scope boundary:** read-only local debug UI code only

```yaml
workorder_id: "WO-nutrition-017"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"

task: |
  Add a small read-only RDA availability filter to the existing
  nutrition.nutrient_defs local schema debug page preview.

  Required behavior:
  - Keep the page local-only and read-only.
  - Add an RDA availability control with exactly these modes:
    - All nutrients
    - Nutrients with any RDA value
    - Nutrients without RDA values
  - Treat a nutrient as having RDA data when either rda_male or rda_female
    has a non-empty value.
  - Combine the RDA filter with the existing search and group filters.
  - Preserve the existing selected nutrient detail, pinned compare, and copy
    nutrient link behavior.
  - Work safely with the current seeded local data where RDA fields are partial
    by design.
  - Add focused tests for the pure filter helper.
  - Update the active handover with the completed local UI behavior.

  Do not add DB writes, schema/data changes, RDA value changes, seed changes,
  migration, Supabase command, BLS import, DEV/LIVE action, production routing,
  or MiniMax routing.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  patches: []
  sql_sources: []
  adrs: []
  reviews:
    - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"
    - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"
  raw_sources: []
  raw_sources_allowed: false
  ssot_priority:
    - "module_index"
    - "current_specs"
    - "patches"
    - "sql_sources"
    - "adrs"
    - "reviews"
    - "raw_sources"

documentation_impact:
  required: true
  domains:
    - "product"
  ssot_files:
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx"
  - "apps/web/src/lib/nutrition/nutrient-preview-filter.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-preview-filter.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-rda-availability-filter.test.ts"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx"
  - "apps/web/src/lib/nutrition/nutrient-preview-filter.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-preview-filter.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-rda-availability-filter.test.ts"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx"
  - "apps/web/src/lib/nutrition/nutrient-preview-filter.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-preview-filter.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-rda-availability-filter.test.ts"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "apps/web/src/app/nutrition/local-schema/page.tsx"
  - "apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx"
  - "apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx"
  - "apps/web/src/lib/nutrition/local-schema-debug.ts"
  - "apps/web/src/lib/nutrition/nutrient-preview-filter.ts"
  - "apps/web/src/lib/nutrition/nutrient-detail-selection.ts"
  - "apps/web/src/lib/nutrition/nutrient-detail-link.ts"
  - "apps/web/src/lib/nutrition/nutrient-pin-compare.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-preview-filter.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-rda-availability-filter.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-detail-selection.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-detail-link.test.ts"
  - "apps/web/src/lib/nutrition/__tests__/nutrient-pin-compare.test.ts"
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md"
  - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - "supabase/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "The local schema page exposes an RDA availability filter with All, with any RDA value, and without RDA values modes."
  - "The RDA availability filter combines with the existing search and group filters."
  - "A row is classified as RDA-available only when rda_male or rda_female has a non-empty value."
  - "Existing selected nutrient detail, pinned compare, and copy-link behavior remains read-only."
  - "The active governance handover records the new local UI behavior."
  - "No DB write, schema/data change, seed change, RDA update, BLS import, DEV/LIVE action, production routing change, or MiniMax routing change is introduced."
  - "Expected output files exist and tests/typecheck pass."

negative_constraints:
  - "No DB apply."
  - "No migration."
  - "No Supabase command."
  - "No seed changes."
  - "No RDA updates."
  - "No BLS import."
  - "No DEV/LIVE action."
  - "No production routing change."
  - "No MiniMax production routing change."
  - "No manual runtime_state edit."
  - "No manual queue edit."

required_skills:
  - "frontend-specialist"
  - "nutrition-specialist"
  - "test-driven-development"
  - "lint-and-validate"
optional_skills: []

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\nutrient-rda-availability-filter.test.ts"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\nutrient-preview-filter.test.ts"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\nutrient-detail-selection.test.ts"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\nutrient-detail-link.test.ts"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\nutrient-pin-compare.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"

blocked_by: []
```
