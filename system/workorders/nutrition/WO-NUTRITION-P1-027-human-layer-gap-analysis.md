# WO-NUTRITION-P1-027 - Human Layer Gap Analysis

**Status:** ready_to_run
**Phase:** 1 - Nutrition / P1-005 local-only Human Layer analysis
**Source:** Current Nutrition specs and local P1-005 Human Layer outputs
**Execution authority:** scoped product-gate exception for one exact local-only batch only
**Scope boundary:** local-only read-only analysis reports, helper tests, curation summary UI, and handover docs

```yaml
workorder_id: "WO-nutrition-027"
agent_id: "senior-coding-agent"
codex_worker: true
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Code/docs-only rollback by reverting this workorder outputs. No data-store rollback is required because this slice applies no database mutations."
required_skills: []
optional_skills: []

task: |
  Create a governed local-only Human Layer gap analysis for remaining category
  coverage and alias coverage work before applying any new mappings.

  Required behavior:
  - Produce a category coverage report for the 2286 currently unassigned foods.
  - Analyze unassigned foods by BLS prefix, source-label pattern, and SPEC_05 mapping evidence.
  - Produce an alias coverage report for current source-backed aliases.
  - Do not apply category mappings, aliases, display names, tags, food values, or nutrient values unless a separate deterministic apply boundary is opened.
  - Add deterministic read-only helper coverage for category and alias analysis SQL.
  - Expose alias coverage in the read-only local curation surface.
  - Update active handover SSOT for the analysis result.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
    - "docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md"
  patches: []
  sql_sources: []
  reviews:
    - "docs/project/p1-005/P1-005-local-food-human-layer-report.md"
    - "docs/project/p1-005/P1-005-local-food-search-slice.md"
    - "docs/project/p1-005/P1-005-local-preference-preview-curation-report.md"
  adrs: []
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
    - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
    - "docs/project/p1-005/P1-005-human-layer-alias-coverage-analysis.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "apps/web/src/lib/nutrition/human-layer-gap-analysis.ts"
  - "apps/web/src/lib/nutrition/__tests__/human-layer-gap-analysis.test.ts"
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
  - "docs/project/p1-005/P1-005-human-layer-alias-coverage-analysis.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

scope_files:
  - "apps/web/src/lib/nutrition/human-layer-gap-analysis.ts"
  - "apps/web/src/lib/nutrition/__tests__/human-layer-gap-analysis.test.ts"
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
  - "docs/project/p1-005/P1-005-human-layer-alias-coverage-analysis.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

files_allowed:
  - "apps/web/src/lib/nutrition/human-layer-gap-analysis.ts"
  - "apps/web/src/lib/nutrition/__tests__/human-layer-gap-analysis.test.ts"
  - "apps/web/src/lib/nutrition/curation.ts"
  - "apps/web/src/lib/nutrition/__tests__/curation.test.ts"
  - "apps/web/src/app/nutrition/curation/page.tsx"
  - "docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md"
  - "docs/project/p1-005/P1-005-human-layer-alias-coverage-analysis.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

context_files:
  - "docs/specs/Nutrition/INDEX.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_07_API.md"
  - "docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md"
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
  - "Category coverage report records foods, categorized foods, unassigned foods, prefix counts, safe candidate rules, and deferred unsafe patterns."
  - "Alias coverage report records alias counts, zero/one/multi alias counts, source-backed strategy, and unresolved curation needs."
  - "No data-store schema or data changes are made by this analysis slice."
  - "No category mappings, aliases, display names, tags, food values, or nutrient values are added or changed."
  - "/nutrition/curation remains read-only and exposes alias coverage."
  - "Documentation impact is handled and SSOT_SYNC_CHECK passes."

negative_constraints:
  - "No remote environment action."
  - "No remote cloud action."
  - "No production data-store action."
  - "No data-store schema change."
  - "No data-store write."
  - "No raw BLS commit."
  - "No source-unbacked food values."
  - "No source-unbacked nutrient values."
  - "No source-unbacked aliases, display names, categories, or tags."
  - "No RDA changes."
  - "No diary write flow."
  - "No MealItem creation."
  - "No production routing change."
  - "No MiniMax routing change."
  - "No service restart."
  - "No manual governed-runtime state edit."
  - "No manual governed queue edit."

validation_commands:
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs --test apps\\web\\src\\lib\\nutrition\\__tests__\\human-layer-gap-analysis.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\curation.test.ts apps\\web\\src\\lib\\nutrition\\__tests__\\food-search.test.ts"
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-HUMAN-LAYER-GAP-ANALYSIS.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-HUMAN-LAYER-GAP-ANALYSIS.md --dry-run --project lumeos --orchestration-mode spark1_orchestrated"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-HUMAN-LAYER-GAP-ANALYSIS.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated"
```
