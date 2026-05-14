# Current Governance Handover

Current date: 2026-05-14.

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
- Local Nutrition UI has progressed through read-only schema/debug, preview, search/filter, detail panel, deep-link, pin/compare, and copy-link affordances.
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
