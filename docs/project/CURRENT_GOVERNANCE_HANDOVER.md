# Current Governance Handover

Current date: 2026-05-15.

This is the concise active handover. Historical session details remain in git,
dossiers, reports, and project docs, but this file is the current operator
orientation layer.

## Current Milestone

Milestone cut:
`LumeOS Nutrition Local Foundation V1 + Governance Workflow Baseline`

Milestone document:
`docs/project/p1-005/P1-005-local-nutrition-foundation-v1-cut.md`

Status:

- Product Work Gate: product work is blocked unless Tom explicitly opens a
  narrow governed boundary.
- Local Nutrition Foundation V1 is usable for further local product development.
- It is not complete and not DEV/LIVE-ready.
- No Supabase Cloud, DEV, LIVE, production DB, raw BLS commit, RDA value change,
  diary write flow, MealItem creation, production routing, or MiniMax routing is
  authorized by the milestone.

## Current Runtime Truth

- DGX1 / Spark1 is the workflow-ready `orchestrator-agent`.
  - Host/IP: `edgexpert-1116` / `192.168.0.128`
  - Service/container: `vllm.service` / `vllm-qwen`
  - Model: `qwen3.6-35b-fp8`
  - Spark1 handoff is proven for `spark1_orchestrated` runs.
- DGX2 / Spark2 is the workflow-ready coding/docs worker.
  - Host/IP: `edgexpert-5862` / `192.168.0.188`
  - Service/container: `vllm.service` / `spark-b-coder`
  - Model: `qwen3-coder-next-fp8`
- DGX3 / Spark3 runs Nemotron Omni NVFP4 as a controlled reviewer/specialist
  candidate.
  - Host/IP: `edgexpert-509d` / `192.168.0.99`
  - Service/container: `vllm.service` / `vllm_node`
  - Model: `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4`
  - Controlled `nemotron-review-agent` is proven for explicit workflow tests.
  - It is not orchestrator, not coding worker, and not production/default routing.
  - Gemma4 on DGX3 is retired and must not be used.
- DGX4/5 MiniMax is lab-only.
  - DGX4 verified facts: `edgexpert-0dc8`, `192.168.0.101`, container
    `vllm_node`, image `vllm-node-minimax`, model `nvidia-MiniMax-M2.7-NVFP4`,
    `max_model_len=65536`, simple completion OK, JSON after trim OK.
  - DGX5 host: `edgexpert-e5e3`; MiniMax worker/lab node.
  - Still UNKLAR: exact service/autostart state, repository wrapper parity, and
    complete Hermes 65k evidence.
  - Future verification commands, only after Tom opens a runtime verification
    boundary:
    - `ssh edgexpert-0dc8 "systemctl is-enabled vllm.service; systemctl status vllm.service --no-pager; docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}'"`
    - `ssh edgexpert-e5e3 "systemctl is-enabled vllm.service; systemctl status vllm.service --no-pager; docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}'"`
    - `curl http://192.168.0.101:8001/v1/models`
- Codex remains bootstrap/senior/fallback and is not default orchestrator when
  `spark1_orchestrated` is requested.

## Current Workflow Truth

- Governed operator modes: `auto`, `codex_bootstrap`, `spark1_orchestrated`.
- `spark1_orchestrated` must run Spark1/orchestrator-agent before worker
  dispatch and must not silently fall back to Codex orchestration.
- DGX3/Nemotron review is proven for explicit controlled review via
  `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`.
- Mandatory lifecycle for active/new workorders:
  worker -> review if required -> documentation impact handling ->
  `SSOT_SYNC_CHECK` -> dossier -> DONE.
- `documentation_impact` is required. Documentation phases emit
  `documentation_started` and `documentation_completed`, or a structured
  auditable N/A.
- `SSOT_SYNC_CHECK` is active and wired into governance invariants. It checks
  mapped SSOT docs, open TODO/register consistency, and runtime-role consistency.
- Dossiers report worker runtime status, output validation, review status,
  documentation/SSOT status, and final classification.
- Stop-rule baselines are governed acknowledgements, not manual state edits.
- Codex Worker timeout/reporting mismatch is fixed: a timeout remains visible,
  but it is non-terminal when scoped outputs exist and configured review passes.

## Current Product Truth

Local Nutrition Foundation V1 current database state:

- `nutrition.nutrient_defs`: 138 rows.
- `nutrition.foods`: 7140 rows.
- `nutrition.food_nutrients`: 698092 rows.
- `nutrition.food_categories`: 518 rows.
  - L1: 13
  - L2: 75
  - L3: 385
  - L4: 45
- Categorized foods: 4903.
- Unassigned foods: 2237.
- `sort_weight`: populated for all 7140 foods.
- `nutrition.tag_definitions`: 16 rows.
- `nutrition.food_tags`: 9265 rows.
- `nutrition.food_aliases`: 21420 rows.
- `nutrition.food_preferences`: table exists, 0 rows.
- `nutrition.food_preference_items`: table exists, 0 rows.
- `nutrition.food_curation_candidates`: table exists, 0 rows.
- `nutrition.food_curation_decisions`: table exists, 0 rows.

Visible local surfaces:

- `http://127.0.0.1:5001/nutrition`
- `http://127.0.0.1:5001/nutrition/curation`
- `GET /api/nutrition/foods`
- `GET /api/nutrition/foods/categories`
- `GET /api/nutrition/foods/smart-preview`
- `GET /api/nutrition/curation`
- `GET /api/nutrition/preferences/catalog`

Completed product work:

- Local BLS `nutrient_defs` foundation, Thai i18n fields, deterministic seed,
  UTF-8 correction, and partial-by-design RDA boundary.
- Full deterministic local BLS food import into `foods` and `food_nutrients`.
- Local Food Search V1, Food Detail, source-label warning, search normalization,
  category/tag filters, sort modes, pagination/load-more, macro badges, and
  nutrient table.
- Human Layer foundation with L1-L4 categories where deterministic, V1 tags,
  source-backed aliases, and `sort_weight`.
- Preferences catalog foundation from old platform screenshots.
- Read-only Preferences catalog API and preview.
- Preference-aware Smart Preview with deterministic supported exclusions:
  `no_offal`, `no_processed_meat`, `no_shellfish`, `no_pork`, `no_red_meat`,
  and `no_dairy`.
- Read-only curation UI, preference mapping workbench, curation persistence
  tables, Human Layer gap analysis, and alias coverage analysis.
- V2 Wild/game meat mapping completed:
  - SPEC_05 evidence: `game_meat | Wild | V2xxxx (Hirsch, Wildschwein, Reh)`.
  - Local target: `wild`, id `86faea12-9082-456b-9528-34359ad065ba`, level 2.
  - Affected rows: 49.
  - Categorized foods moved 4854 -> 4903.
  - Unassigned foods moved 2286 -> 2237.

## Open Product TODOs

- `GOV-TODO-036`: Remaining 2237 unassigned foods need separate deterministic
  category evidence and one-rule governed apply batches.
- `GOV-TODO-037`: Curated display names and curated aliases are not implemented.
- `GOV-TODO-038`: `no_raw_fish` and `no_gluten` require deterministic metadata
  before they can affect search.
- `GOV-TODO-039`: Preference persistence UI and persisted Smart Search are not
  implemented.
- `GOV-TODO-040`: Diary, MealItem, serving/portion, amount input, and meal
  schedule foundations are not implemented.
- `GOV-TODO-041`: Daily nutrition summary and macro dashboard are not implemented.
- `GOV-TODO-023`: RDA / nutrient reference-values source candidate remains open.
- `GOV-TODO-046`: DEV/LIVE and Supabase Cloud promotion require Tom decision.

## Open Governance TODOs

- `GOV-TODO-042`: Governance Frontdoor workflow.
- `GOV-TODO-043`: Project/topic archive structure.
- `GOV-TODO-044`: Project onboarding / repo separation blueprint.
- `GOV-TODO-045`: Structure cleanup blueprint.

## Open Runtime TODOs

- `GOV-TODO-012`: MiniMax lab evaluation before routing decision.
- `GOV-TODO-029`: DGX3/Nemotron default route-role acceptance policy.
- `GOV-TODO-031`: MiniMax Hermes 65k / service-autostart documentation.
- `GOV-TODO-032`: infra/vLLM and systemd cleanup.

## Forbidden Actions

Still forbidden without a new explicit boundary:

- DEV or LIVE promotion.
- Supabase Cloud use.
- Production DB work.
- DB/Supabase/migration execution outside already completed local-only
  boundaries.
- Raw BLS commit.
- RDA value changes.
- Invented food values, nutrient values, aliases, display names, or category
  mappings.
- Diary write flow or MealItem creation.
- Production routing changes.
- MiniMax production routing.
- Service restart.
- Manual `runtime_state.json` edit.
- Manual approval queue edit.

## Recommended Next Governance Workstream

Build the Governance Frontdoor workflow:

Brainstorm -> Summary -> Product Intent -> Spec -> Workorder Drafts -> Drift
Checker -> Approval -> Queue.

This should build on the now-proven workorder lifecycle, `documentation_impact`
gate, Spark1 orchestration, Nemotron review, SSOT sync, and dossier reporting.

## Read First

- `docs/project/p1-005/P1-005-local-nutrition-foundation-v1-cut.md`
- `docs/project/OPEN_TODOS.md`
- `docs/project/GOVERNANCE_TODO_REGISTER.json`
- `docs/project/STACK_REFERENCE.md`
- `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md`
- `docs/project/PRODUCT_WORK_GATE.md`
- `docs/project/runtime/DGX1_SPARK1_ORCHESTRATOR_RUNTIME.md`
- `docs/project/runtime/DGX3_SPARK3_NEMOTRON_RUNTIME.md`
- `system/model-tiers/model_registry_v2.md`
- `system/model-tiers/model_tiers_v2.md`
