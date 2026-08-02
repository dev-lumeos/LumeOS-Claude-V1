# Phase 1 Copy Manifest

Status: proposed, not approved for execution.

This manifest defines what may be copied into `D:\GitHub\AI-Governance-Core`
if Tom approves Phase 1. No copying is authorized by this document alone.

Storage policy:

- AI-Governance-Core is file-backed by default.
- Supabase/Postgres adapters are optional future adapters only.
- No core command may require Supabase unless the active project profile
  explicitly enables a DB-backed adapter.

## A. COPY_TO_CORE_APPROVED_CANDIDATES

| Source path | Target path in AI-Governance-Core | Reason | Required path abstractions | Dependencies | Risk | Phase |
|---|---|---|---|---|---|---|
| `system/control-plane/agent-contract-check.ts` | `src/control-plane/agent-contract-check.ts` | Reusable agent contract checker. | Project root/profile for registry/doc paths. | agent registry templates | Medium: current paths assume embedded repo. | 1 |
| `system/control-plane/governance-invariant-check.ts` | `src/control-plane/governance-invariant-check.ts` | Reusable invariant checker. | Profile-driven product gates/raw paths. | project profile loader | Medium. | 1 |
| `system/control-plane/ssot-sync-check.ts` | `src/control-plane/ssot-sync-check.ts` | Mandatory reusable SSOT sync gate. | Project profile SSOT mappings and changed-path root. | TODO/SSOT docs in project repo | High if it accidentally checks core docs for project runs. | 1 |
| `system/control-plane/review-pipeline.ts` | `src/control-plane/review-pipeline.ts` | Reusable review parser/handoff/validation logic. | Model route profile and output schema injection. | model routing templates | Medium. | 1 |
| `system/control-plane/model-runtime-check.ts` | `src/control-plane/model-runtime-check.ts` | Reusable model route health check. | Route config externalized; no DGX endpoints as defaults. | vllm client | Medium. | 1 |
| `system/control-plane/stop-rules.ts` | `src/control-plane/stop-rules.ts` | Reusable stop-rule evaluation/baseline logic. | Project-local metrics/audit roots. | state/report roots | Medium. | 1 |
| `system/control-plane/pipeline-audit.ts` | `src/control-plane/pipeline-audit.ts` | Reusable audit event typing/helpers. | Project-local audit root. | state helpers | Low. | 1 |
| `system/control-plane/pipeline-metrics.ts` | `src/control-plane/pipeline-metrics.ts` | Reusable metrics helpers. | Project-local metrics root. | state helpers | Low. | 1 |
| `system/control-plane/governance-validator.ts` | `src/control-plane/governance-validator.ts` | Reusable orchestrator/intent validator. | Agent registry and expected agent from workorder/profile. | workorder schema | Medium. | 1 |
| `system/control-plane/risk-categories.ts` | `src/control-plane/risk-categories.ts` | Reusable risk category model. | None beyond exports. | workorder validator | Low. | 1 |
| `system/control-plane/scheduler-preflight.ts` | `src/control-plane/scheduler-preflight.ts` | Reusable preflight checks. | Project profile roots and forbidden paths. | workorder loader | Medium. | 1 |
| `system/control-plane/terminal-wo-reset-cli.ts` | `src/cli/terminal-wo-reset-cli.ts` | Official cleanup tool pattern. | Project-local state root; no direct state edits. | state manager/audit writer | Medium. | 1 |
| `system/control-plane/docs-agent-runtime-smoke.ts` | `src/control-plane/docs-agent-runtime-smoke.ts` | Reusable model smoke test pattern. | Route config and timeout profile. | model runtime routing | Medium. | 1 |
| `system/workorders/cli/batch-loader.ts` | `src/workorders/batch-loader.ts` | Core batch parsing/dispatch wiring. | Explicit project root/profile. | workorder schema, dispatcher | High. | 1 |
| `system/workorders/cli/batch-operator.ts` | `src/workorders/batch-operator.ts` | Core operator lifecycle. | Project report/state/approval roots. | loader, dossier, review | High. | 1 |
| `system/workorders/cli/run-batch-operator.ts` | `src/cli/run-batch-operator.ts` | CLI entrypoint. | Add explicit external project root/profile mode. | batch operator | High. | 1 |
| `system/workorders/cli/operator-doctor.ts` | `src/workorders/operator-doctor.ts` | Reusable doctor diagnostics. | Profile-driven roots and gates. | project profile loader | Medium. | 1 |
| `system/workorders/cli/orchestration-mode.ts` | `src/workorders/orchestration-mode.ts` | Reusable orchestration mode model. | None beyond route config. | operator | Low. | 1 |
| `system/workorders/cli/spark1-orchestrator-handoff.ts` | `src/workorders/orchestrator-handoff.ts` | Reusable orchestrator-agent handoff. | Route id/endpoint from profile. | model runtime route | Medium. | 1 |
| `system/workorders/cli/documentation-impact.ts` | `src/workorders/documentation-impact.ts` | Mandatory docs lifecycle gate. | Project SSOT mappings. | ssot sync | High. | 1 |
| `system/workorders/cli/markdown-output-quality.ts` | `src/workorders/markdown-output-quality.ts` | Generic docs output completeness gate. | Workorder-configurable expectations. | batch operator | Low. | 1 |
| `system/workorders/cli/wo-factory.ts` | `src/workorders/wo-factory.ts` | Reusable workorder generation mechanics. | Generic templates only. | templates, schema | Medium. | 1 |
| `system/workorders/cli/spec-source-chain-check.ts` | `src/workorders/spec-source-chain-check.ts` | Reusable source-chain check pattern. | Source roots from project profile. | project profile | Medium. | 1 |
| `system/workorders/schemas/` | `schemas/workorders/` | Reusable workorder/batch schemas. | Backward compatibility for existing workorders. | batch loader | Medium. | 1 |
| `system/project-profiles/project-profile-loader.ts` | `src/project-profiles/project-profile-loader.ts` | Core external project attachment mechanism. | Add explicit external profile path support. | schema | High. | 1 |
| `system/project-profiles/project-profile.schema.json` | `schemas/project-profile.schema.json` | Reusable profile schema. | Add storage adapter fields if missing. | loader | Medium. | 1 |
| `system/approval/approval-queue.ts` | `src/approval/approval-queue.ts` | Reusable approval queue. | Queue path from project profile. | approval operation types | Medium. | 1 |
| `system/approval/approval-cli.ts` | `src/cli/approval-cli.ts` | Official approval CLI. | Project-local approval root. | approval queue | Medium. | 1 |
| `system/approval/approval-viewer.ts` | `src/approval/approval-viewer.ts` | Reusable approval reporting. | Project-local approval root. | approval queue | Low. | 1 |
| `system/reports/batch-dossier.ts` | `src/reports/batch-dossier.ts` | Reusable dossier generator. | Project report root and project profile. | batch/operator state | Medium. | 1 |
| `system/reports/governance-learning-check.ts` | `src/reports/governance-learning-check.ts` | Reusable learning check. | Project learning docs and canonical paths. | project profile | Medium. | 1 |
| `system/reports/report-retention-summarizer.ts` | `src/reports/report-retention-summarizer.ts` | Reusable generated-evidence retention planning. | Project report roots. | git status | Low. | 1 |
| `system/reports/run-summary-generator.ts` | `src/reports/run-summary-generator.ts` | Reusable run summary generation. | Project report root. | state/audit | Low. | 1 |
| `system/reports/failed-wo-report.ts` | `src/reports/failed-wo-report.ts` | Reusable failed workorder reporting. | Project state/report roots. | state/audit | Low. | 1 |
| `system/workers/codex-worker.ts` | `src/workers/codex-worker.ts` | Reusable Codex worker adapter. | Allowed/blocked paths from project profile; report root injection. | workorder schema | High. | 1 |
| `packages/wo-core/` | `packages/wo-core/` | Reusable governance/workorder types. | Namespace decision later. | TS workspace | Medium. | 1 |
| `packages/agent-core/` | `packages/agent-core/` | Reusable agent model. | Runtime facts must be separated from code. | agent registry | Medium. | 1 |
| `packages/vllm-client/` | `packages/vllm-client/` | Reusable vLLM client. | Endpoint/model from route config. | model runtime check | Low. | 1 |
| `packages/execution-token/` | `packages/execution-token/` | Reusable execution token package. | Key storage policy externalized. | wo-core | Medium. | 1 |
| `packages/scheduler-core/` | `packages/scheduler-core/` | Reusable scheduler sorting/slot types. | None known. | wo-core | Low. | 1 |
| `packages/graph-core/` | `packages/graph-core/` | Generic graph validation/readiness; active imports found. | Namespace decision later. | orchestrator/scheduler services | Low. | 1b |

## B. TEMPLATE_TO_CORE_CANDIDATES

| Source path | Target template path | What must be genericized | What must not be copied literally | Risk |
|---|---|---|---|---|
| `system/agent-registry/agents.json` | `templates/agent-registry/agents.example.json` | Agent ids, roles, approval requirements. | Live DGX/LumeOS runtime truth as defaults. | High |
| `system/agent-registry/model_routing.json` | `templates/model-routing/model_routing.example.json` | Route schema, endpoint placeholders. | Live endpoints as core defaults. | High |
| `system/agent-registry/permissions.json` | `templates/agent-registry/permissions.example.json` | Path variables and role permissions. | LumeOS product paths as universal paths. | Medium |
| `system/agent-registry/tool_profiles.json` | `templates/agent-registry/tool_profiles.example.json` | Tool profile shape. | Product-specific path rules. | Medium |
| `system/workorders/templates/` | `templates/workorders/` | Replace LumeOS paths with placeholders. | Nutrition/examples as active template truth. | Medium |
| `system/workorders/lifecycle/` | `docs/lifecycle/` | Embedded repo path assumptions. | Historical lifecycle claims as current universal truth. | Medium |
| `system/policies/` | `policies/` | Project-specific gates and forbidden paths. | LumeOS product policy as default. | Medium |
| `system/prompts/` | `templates/prompts/` | Prompt variables and project context injection. | LumeOS-specific context. | Medium |
| `system/model-tiers/` | `templates/model-tiers/` | Model tier schema/route concepts. | Current DGX runtime facts as core defaults. | High |
| `system/workers/codex-worker.config.json` | `templates/workers/codex-worker.config.example.json` | Report/allowed path placeholders. | LumeOS report root as default. | Medium |
| `services/governance-compiler/` | `templates/services/governance-compiler/` or later `src/services/governance-compiler/` | Prompt path, workspace root, model route injection. | `CLAUDE.md` root discovery and Spark A endpoint defaults. | High |
| `services/orchestrator-api/` | `templates/services/orchestrator-api/` | Runtime status, route config, package names. | Hardcoded Spark A/B status. | Medium |
| `services/wo-classifier/` | `templates/services/wo-classifier/` | Storage adapter, Spark availability, route profile. | Supabase duplicate check as required dependency; stale Spark C/D availability. | High |
| `system/project-profiles/profiles/lumeos.json` | `examples/fixtures/lumeos-like.profile.example.json` | Replace LumeOS paths with fixture placeholders. | LumeOS profile as core default. | High |

## C. STAY_IN_LUMEOS

| Path | Reason | Owner | Why copying would be dangerous |
|---|---|---|---|
| `apps/` | Product apps. | LumeOS | Would mix product implementation into governance core. |
| `services/*-api` product services | Product/domain APIs. | LumeOS | Not reusable governance engine. |
| `supabase/` | LumeOS local/DB schema and migrations. | LumeOS | Core must not own project DB truth. |
| `docs/specs/Nutrition/` | Nutrition product specs and sources. | LumeOS | Explicitly excluded from core. |
| `docs/project/` | LumeOS project SSOT, TODOs, milestones, handover. | LumeOS | Project repos own truth. |
| `system/workorders/nutrition/` | LumeOS workorders/batches/history. | LumeOS | Project evidence, not reusable source. |
| `system/reports/batches/` | LumeOS generated batch evidence. | LumeOS | Generated project evidence. |
| `system/reports/dossiers/` | LumeOS dossiers. | LumeOS | Generated project evidence. |
| `system/reports/runs/` | LumeOS run summaries. | LumeOS | Generated project evidence. |
| `system/reports/codex-worker/` | LumeOS worker prompts/reports. | LumeOS | Contains project context. |
| `system/state/runtime_state.json` | Runtime state. | LumeOS official tools | Copying would create stale live state. |
| `system/state/*.jsonl` | Runtime/audit metrics. | LumeOS official tools | Must not be edited manually or copied as defaults. |
| `system/approval/queue.json` | Approval queue state. | LumeOS official tools | Live state, not core default. |
| `system/workorders/cli/nutrient-defs-seed-extract.ts` | Nutrition seed helper. | LumeOS | Product/source-specific. |
| `system/workorders/cli/nutrition-human-layer.ts` | Nutrition Human Layer helper. | LumeOS | Product/source-specific. |
| `system/workorders/cli/nutrition-preferences-foundation.ts` | Nutrition preference helper. | LumeOS | Product/source-specific. |
| `system/workorders/cli/nutrition_food_bls_import_expand.py` | BLS import helper. | LumeOS | BLS source-specific. |
| `system/workorders/cli/nutrition_food_sample_extract.py` | BLS sample helper. | LumeOS | BLS source-specific. |
| `packages/shared/` | Supabase browser/server helpers. | LumeOS | Violates file-backed-by-default core policy. |
| `packages/supabase-clients/` | Supabase client package. | LumeOS | DB adapter should be optional and profile-enabled. |
| `packages/types/` | Product/domain types. | LumeOS | Domain truth leakage. |

## D. GENERATED_EVIDENCE_DO_NOT_COPY

| Path | Reason | Project evidence handling |
|---|---|---|
| `system/reports/batches/**` | Generated governed batch reports. | Keep in LumeOS report root; cite by path. |
| `system/reports/dossiers/**` | Generated dossiers. | Keep in LumeOS report root; cite by path. |
| `system/reports/runs/**` | Generated run summaries. | Keep in LumeOS report root. |
| `system/reports/model-runtime-history/**` | Environment-specific runtime history. | Keep in LumeOS/local runtime evidence. |
| `system/reports/codex-worker/**` | Worker generated prompts/reports. | Keep in project evidence; may contain project context. |
| `system/state/*.jsonl` | Runtime audit/metrics. | Keep project-local and mutate only via tools. |
| `system/state/*.json` | Runtime state snapshots. | Keep project-local and mutate only via tools. |
| `system/approval/queue.json` | Approval state. | Keep project-local and mutate only via approval CLI. |
| `backup_system.zip` | Ignored local archive, not tracked. | Do not copy; handle later cleanup by approval. |
| `system.zip` | Ignored local archive, not tracked. | Do not copy; handle later cleanup by approval. |
| `services.zip` | Ignored local archive, not tracked. | Do not copy; handle later cleanup by approval. |

## E. UNKNOWN_NEEDS_DECISION

| Path | Current evidence | Blocker | Exact verification command |
|---|---|---|---|
| Package namespace rename | `@lumeos/*` appears across system/packages/services/apps/tools. | Need decide temporary compatibility vs immediate rename. | `rg "@lumeos/" system packages services apps tools` |
| Final LumeOS external profile location | Current active path is `system/project-profiles/profiles/lumeos.json`; future `.governance/project.profile.json` is only proposed. | Tom must choose target project profile location later. | `rg "system/project-profiles/profiles/lumeos.json|project.profile" .` |
| `services/governance-compiler/` extraction form | Reusable concept, but path/model prompt assumptions are embedded. | Decide whether Phase 1 templates only or Phase 2 service extraction. | `rg "governance-compiler|governance_compiler_prompt|SPARK_A_ENDPOINT" services system docs tools` |
| `services/orchestrator-api/` extraction form | Reusable route concept but runtime status defaults are hardcoded. | Decide whether to template or port as service in later phase. | `rg "orchestrator-api|/graph|/scheduler|/retry" services system docs tools` |
| `services/wo-classifier/` extraction form | Deterministic classifier plus optional Supabase duplicate check. | Needs storage adapter/profile design before core copy. | `rg "wo-classifier|checkDuplicate|SUPABASE_URL" services system docs tools` |
| Root zip archives provenance | Ignored local archives exist but are not tracked. | Need cleanup decision outside extraction. | `git check-ignore -v backup_system.zip system.zip services.zip; Get-Item backup_system.zip,system.zip,services.zip` |

## Initial Phase-1 Allowed Copy Set

Recommended narrow Phase-1 set:

- reusable schemas
- generic workorder/operator code
- control-plane code after path abstraction
- project profile loader/schema
- report generator code only
- approval tooling only
- worker adapter code only
- generic templates/policies after review
- reusable packages with no project DB dependency

Explicitly excluded from Phase 1:

- Nutrition helpers
- BLS import/extract scripts
- LumeOS workorders/batches
- LumeOS docs/project truth
- LumeOS specs
- LumeOS reports/dossiers
- runtime state
- approval queue state
- generated report outputs
- live DGX runtime facts as core defaults
- LumeOS product packages/types unless separately proven reusable
- Supabase/Postgres-required packages as mandatory core dependencies

