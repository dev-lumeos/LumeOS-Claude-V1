# Current Governance Handover

Current date: 2026-05-15.

This file is the concise active handover. Older session details are historical
evidence only and must not override the current SSOT files listed below.

## Current Runtime Truth

- DGX1 / Spark1 is the workflow-ready `orchestrator-agent` runtime.
  - Host: `edgexpert-1116`
  - IP: `192.168.0.128`
  - Service/container: `vllm.service` / `vllm-qwen`
  - Model: `qwen3.6-35b-fp8`
  - Spark1 handoff is proven for `spark1_orchestrated` operator dry-run/doctor.
- DGX2 / Spark2 is the workflow-ready coding/docs worker runtime.
  - Host: `edgexpert-5862`
  - IP: `192.168.0.188`
  - Service/container: `vllm.service` / `spark-b-coder`
  - Model: `qwen3-coder-next-fp8`
  - Completion health is required before governed docs-agent dispatch.
- DGX3 / Spark3 runs Nemotron Omni NVFP4 as a controlled reviewer/specialist candidate.
  - Host: `edgexpert-509d`
  - IP: `192.168.0.99`
  - Service/container: `vllm.service` / `vllm_node`
  - Model: `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
  - Role: controlled `nemotron-review-agent`, specialist / multimodal / visual-review / OCR / FoodCam candidate.
  - Governed review calls require enough output budget because Nemotron may emit separate reasoning before content; current controlled reviewer floor is 4096 tokens and completion health probe floor is 512 tokens.
  - Not orchestrator, not coding worker, not production routing by default.
  - Gemma4 on DGX3 is retired and must not be used.
- DGX4/5 MiniMax is a verified lab-only runtime path, not production routing.
  - DGX4 host/IP: `edgexpert-0dc8` / `192.168.0.101`
  - DGX4 container/image/model: `vllm_node` / `vllm-node-minimax` / `nvidia-MiniMax-M2.7-NVFP4`
  - DGX4 `/v1/models` showed `max_model_len=65536`.
  - DGX4 completions produced `content.trim() = ok` and valid JSON after trim.
  - DGX4 and DGX5 both showed `RayWorkerProc` with about `98006 MiB` reserved and about `50C` idle.
  - DGX5 host: `edgexpert-e5e3`; role: MiniMax worker/lab node, not standalone production route.
  - Still UNKLAR: exact DGX4/DGX5 service file, autostart state, remote startup wrapper parity, and complete Hermes 65k evidence.
- Codex remains bootstrap/senior/fallback. It is not the default orchestrator when `spark1_orchestrated` is requested.

## Current Workflow Truth

- Governed operator runs support `auto`, `codex_bootstrap`, and `spark1_orchestrated` orchestration modes.
- `spark1_orchestrated` must run the Spark1/orchestrator-agent handoff before worker dispatch and must not silently fall back to Codex orchestration.
- Full Spark1 -> worker -> Nemotron reviewer workflow proof is complete for `BATCH-NUTRITION-P1-005-LOCAL-COPY-LINK.md`.
  - Spark1 assigned `WO-nutrition-016->senior-coding-agent`.
  - `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent` was used.
  - Audit contains `review_started` and `review_completed`.
  - Nemotron review status was `PASS` with confidence `0.95`.
  - Dossier was written.
- Codex Worker timeout/reporting mismatch is fixed in dossier reporting.
  - Raw timeout remains visible as `worker_runtime_status`.
  - If scoped outputs exist and configured review passes, the timeout is `observed_non_terminal` and final classification remains `DONE`.
  - Missing outputs or failed review still make the timeout blocking.
- `SSOT_SYNC_CHECK` is implemented and wired into `governance-invariant-check`.
  - It checks mapped SSOT updates for runtime/model, workflow/governance, product-gate, infra runtime, and TODO changes.
  - It now also checks `OPEN_TODOS.md` open IDs against `GOVERNANCE_TODO_REGISTER.json`, and core runtime-role consistency across `STACK_REFERENCE.md` and model-tier docs.
- Documentation / SSOT handling is now a hard governed workorder lifecycle gate.
  - Every active/new workorder must declare `documentation_impact`.
  - Required documentation impact must run the documentation phase and emit `documentation_started` / `documentation_completed` before DONE.
  - Explicit N/A must be structured and auditable; generic `none` / `not applicable` reasons are invalid.
  - Dossiers report documentation impact, documentation-agent usage, SSOT files, SSOT sync status, and final SSOT classification.
- Configured reviewer handoff for already output-complete workorders passes the correct workorder context and expected-output content into the review pipeline. A configured reviewer failure still blocks DONE.
- Stop-rule baselines are governed acknowledgements, not manual state edits. `ESCALATION_RATE_SPIKE` now supports the same baseline mechanism as failed-run and invalid-json spike handling so resolved reviewer/runtime stabilization history can be acknowledged without weakening future stop-rule enforcement.

## Current Product / Nutrition Truth

- P1-005 import preparation is complete.
- Local-only schema foundation was applied to the local Supabase/Test DB only.
- Local Thai i18n correction was applied locally only.
- Local deterministic `nutrient_defs` seed was applied locally only.
- Current local `nutrition.nutrient_defs` state:
  - 138 rows.
  - 16 columns.
  - `name_th` and `group_th` exist and are empty strings by design.
  - UTF-8 German text is corrected.
  - RDA fields are partial by design.
- Local Nutrition UI has progressed through read-only schema/debug, preview, search/filter, RDA availability filter, detail panel, deep-link, pin/compare, and copy-link affordances.
- The local `nutrition.nutrient_defs` preview includes a read-only RDA availability filter with All nutrients, Nutrients with any RDA value, and Nutrients without RDA values modes. Availability is based only on non-empty `rda_male` or `rda_female` values and combines with existing search/group filters.
- The local-only food foundation boundary is completed for `BATCH-NUTRITION-P1-005-LOCAL-FOOD-FOUNDATION.md`.
  - Target tables: `nutrition.foods` and `nutrition.food_nutrients`.
  - Local validation confirmed both tables exist, both row counts are `0`, and `nutrition.food_nutrients.nutrient_code` references `nutrition.nutrient_defs(code)`.
  - The slice remains schema-only: no food search, no food UI, no BLS import, no raw BLS commit, no seed/import rows, and no invented food values.
- The local-only deterministic food sample staging boundary is completed for `BATCH-NUTRITION-P1-005-LOCAL-FOOD-SAMPLE-STAGING.md`.
  - Source file: `docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx`.
  - Selection rule: first 10 source-backed BLS rows with non-empty BLS code and German food name.
  - Applied output: `docs/project/p1-005/P1-005-local-food-sample-staging.sql`.
  - Local validation confirmed 10 `nutrition.foods` rows, 927 `nutrition.food_nutrients` rows, and 0 missing nutrient FK targets.
  - The local schema/debug page reports the staged food row counts.
  - This remains local-only sample staging, not broad/full BLS import, not raw BLS commit, not food search UI, and not DEV/LIVE promotion.
- The local-only deterministic BLS import expansion boundary is completed for `BATCH-NUTRITION-P1-005-LOCAL-BLS-IMPORT-EXPANSION.md`.
  - Source file: `docs/specs/Nutrition/00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx`.
  - Generated bulk CSV artifacts live under `tmp/nutrition/p1-005-bls-local-import` and are local runtime artifacts, not committed BLS data.
  - Applied import scope is full local scope: 7140 foods and 698092 food nutrient values, with 0 unsupported nutrient header mappings.
  - Local validation confirmed 0 missing nutrient FK targets, 0 orphan food nutrient rows, and UTF-8 food names render correctly.
  - The local schema/debug page reports `nutrition.foods=7140` and `nutrition.food_nutrients=698092`.
  - The boundary remains local-only: no DEV/LIVE, no Supabase Cloud, no production DB, no source workbook commit, no unsupported values, and no RDA changes.
- The local read-only Food Search / Food Detail slice is completed for `BATCH-NUTRITION-P1-005-LOCAL-FOOD-SEARCH.md`.
  - Visible page: `http://127.0.0.1:5001/nutrition`.
  - API route: `/api/nutrition/foods`.
  - It searches local `nutrition.foods`, opens one selected food, and shows linked nutrients from `nutrition.food_nutrients` resolved through `nutrition.nutrient_defs`.
  - BLS food names are shown as source-backed technical labels, not final human-friendly product copy.
  - Human-friendly names, aliases, categories, and richer search normalization remain future work; no invented aliases, display names, nutrient values, or food labels were added.
  - The slice is read-only and performs no DB writes, schema changes, seed/import changes, RDA changes, DEV/LIVE action, or Supabase Cloud action.
- The local-only Food Taxonomy / Human Layer foundation is completed for `BATCH-NUTRITION-P1-005-LOCAL-FOOD-HUMAN-LAYER.md`.
  - Applied local-only SQL: `docs/project/p1-005/P1-005-local-food-human-layer.sql`.
  - Created local `nutrition.food_categories`, `nutrition.tag_definitions`, `nutrition.food_tags`, and `nutrition.food_aliases`.
  - Added missing local Human Layer columns on `nutrition.foods`: `category_id`, `name_display_en`, `name_display_th`, `processing_level`, and `is_prepared_dish`.
  - Seeded 518 source-backed categories from `SPEC_05_FOOD_TAXONOMY.md`: 13 Level 1, 75 Level 2, 385 Level 3, and 45 Level 4 categories. L3/L4 rows come only from deterministic nested bullet extraction.
  - Deterministically categorized 4854 foods; 2286 remain intentionally unassigned until explicit deterministic mapping rules exist.
  - Inserted 16 V1 visible tag definitions and 9265 deterministic macro-derived `food_tags`; manual/cuisine/religious and ingredient-derived tags remain deferred.
  - Inserted 21420 source-backed aliases from exact BLS labels, exact source EN labels, and deterministic normalized variants only.
  - Refreshed local `sort_weight` for all 7140 foods from deterministic `SPEC_08_IMPORT_PIPELINE.md` rules; `sort_weight_missing=0`.
  - `/api/nutrition/foods` now supports `q`, `category`, `category_id`, `tag`, `limit`, `offset`, and `sort` (`relevance`, `protein_desc`, `kcal_asc`, `name_asc`), with category subtree filtering.
  - Added read-only category tree endpoint: `/api/nutrition/foods/categories`.
  - `/nutrition` now shows category and V1 tag filter chips, sort selector, pagination controls, macro badges, selected food detail, and source-label warning while remaining read-only.
  - This boundary remains local-only: no DEV/LIVE, no Supabase Cloud, no production DB, no invented categories, no invented aliases, no invented display names, no invented food/nutrient values, no RDA changes, and no diary/MealItem flow.
- The local-only Nutrition Preferences + Human Layer Curation foundation is completed for `BATCH-NUTRITION-P1-005-LOCAL-PREFERENCES-CURATION.md`.
  - Applied local-only SQL: `docs/project/p1-005/P1-005-local-preferences-foundation.sql`.
  - Created local `nutrition.food_preferences` and `nutrition.food_preference_items` schema support for diet type, allergies, intolerances, general exclusions, preferred cuisines, meal/snack counts, cooking skill, prep time, budget, meal prep, planner notes, and preference items.
  - Added read-only catalog API: `/api/nutrition/preferences/catalog`.
  - `/nutrition` shows a read-only Preferences foundation preview and links the catalog API.
  - Catalogued old-platform Preference screen options: 8 diet types, 20 allergy/intolerance chips, 8 general exclusion presets, 27 cuisines, 18 food preference groups, and 230 food preference items.
  - Six general exclusions have deterministic category mappings; `no_raw_fish` and `no_gluten` remain unresolved until preparation/allergen metadata exists.
  - The slice enables no user preference writes, no Smart Search default filtering, no diary logging, no MealItem creation, no invented food/nutrient values, no invented aliases/display names, and no DEV/LIVE action.
- The RDA/reference-values boundary remains open as a separate future candidate. Missing RDA values are not defects and must not be inferred or internet-backfilled.

## Current Gates / Forbidden Actions

Global product work remains closed unless Tom explicitly opens a narrow boundary.

Still forbidden without explicit future authorization:

- DB/Supabase/migration execution beyond already completed local-only boundaries.
- DEV or LIVE promotion.
- BLS import execution.
- Raw BLS commit.
- Seed execution beyond the already completed local-only `nutrient_defs` seed.
- RDA value changes.
- Production routing changes.
- MiniMax production routing.
- Service restart.
- Manual `runtime_state.json` edit.
- Manual approval queue edit.

## Open TODOs

The active open TODO set is tracked in both `docs/project/OPEN_TODOS.md` and
`docs/project/GOVERNANCE_TODO_REGISTER.json`.

- `GOV-TODO-012`: Evaluate MiniMax lab runtime before any governance routing decision.
- `GOV-TODO-023`: Create separate nutrient reference-values / RDA source candidate.
- `GOV-TODO-029`: Decide DGX3/Nemotron default route acceptance policy.
- `GOV-TODO-031`: Complete MiniMax Hermes 65k / service-autostart lab documentation.
- `GOV-TODO-032`: Verify and clean infra/vLLM startup wrappers against remote runtime state.

## Archived / Historical Notes

- The older first non-planning P1-005 boundary blocker is superseded. Local
  schema, local i18n correction, local seed, and local read-only UI slices have
  since completed under explicit local-only boundaries. DEV/LIVE and broader
  product execution remain blocked.
- Historical DGX3/Gemma4 and DGX4/GPT-OSS paths are archived / do-not-use.
- Older long-form governance history remains in git history, learning records,
  dossiers, and runtime-specific docs. Do not re-promote old session notes into
  current truth without re-verification.

## Read First

- `docs/project/STACK_REFERENCE.md`
- `docs/project/OPEN_TODOS.md`
- `docs/project/GOVERNANCE_TODO_REGISTER.json`
- `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- `docs/project/PRODUCT_WORK_GATE.md`
- `docs/project/FIRST_PRODUCT_GATE_OPENING_PROPOSAL.md`
- `docs/project/MINIMAX_LAB_RUNTIME.md`
- `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md`
- `docs/project/runtime/DGX3_SPARK3_NEMOTRON_RUNTIME.md`
- `docs/project/runtime/DGX3_NEMOTRON_REVIEWER_INTEGRATION_PLAN.md`
- `system/model-tiers/model_registry_v2.md`
- `system/model-tiers/model_tiers_v2.md`
