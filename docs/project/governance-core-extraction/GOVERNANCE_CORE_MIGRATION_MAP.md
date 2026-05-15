# AI-Governance-Core Migration Map

Status: planning only.

Evidence:

- `docs/project/system-structure/SYSTEM_TREE_AUDIT.md`
- `docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json`
- `docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md`
- current package/workspace inspection on 2026-05-15

Classification values:

- `COPY_TO_CORE`: reusable implementation should be copied into AI-Governance-Core.
- `STAY_IN_LUMEOS`: project truth/evidence remains in LumeOS.
- `TEMPLATE_TO_CORE`: convert to a generic template or fixture, not direct truth.
- `GENERATED_EVIDENCE`: report/runtime output, retained as evidence in the project.
- `ARCHIVE_REFERENCE`: historical reference only.
- `PLACEHOLDER`: keep only if needed as a future template or remove later with approval.
- `UNKNOWN`: needs more inspection before classification.

No files should be moved, deleted, or copied by this document.

## Migration Table

| Source path | Classification | Reason | Target path if copied/templates | Risks | Dependencies |
|---|---|---|---|---|---|
| `system/control-plane/` | COPY_TO_CORE | Active reusable governance checks, dispatcher, review, stop rules, model runtime checks, SSOT sync. | `src/control-plane/` | Many files assume `process.cwd()` is the project root and use `system/...` paths. | Project profile loader, runtime routes, state paths. |
| `system/control-plane/__tests__/` | COPY_TO_CORE | Tests define expected reusable governance behavior. | `tests/control-plane/` | Tests include LumeOS path fixtures that must become fixture-project paths. | Fixture project. |
| `system/workorders/cli/batch-loader.ts` | COPY_TO_CORE | Core batch parsing and validation. | `src/workorders/batch-loader.ts` | Current defaults expect embedded project paths. | Workorder schema, project profile. |
| `system/workorders/cli/batch-operator.ts` | COPY_TO_CORE | Core operator lifecycle, doctor/status/continue logic. | `src/workorders/batch-operator.ts` | Must write reports/state to external project repo, not core repo. | Dispatcher, dossier, state, approval. |
| `system/workorders/cli/run-batch-operator.ts` | COPY_TO_CORE | CLI entrypoint for governed runs. | `src/cli/run-batch-operator.ts` | CLI arguments must require project root/profile in external mode. | Project profile loader. |
| `system/workorders/cli/operator-doctor.ts` | COPY_TO_CORE | Reusable diagnostic logic. | `src/workorders/operator-doctor.ts` | Must distinguish core fixture runs from project runs. | Batch loader, project profile. |
| `system/workorders/cli/orchestration-mode.ts` | COPY_TO_CORE | Reusable orchestration mode contract. | `src/workorders/orchestration-mode.ts` | None beyond route profile injection. | Agent registry/routing. |
| `system/workorders/cli/spark1-orchestrator-handoff.ts` | COPY_TO_CORE | Reusable pre-dispatch orchestrator handoff. | `src/workorders/orchestrator-handoff.ts` | Must not hardcode Spark1 endpoint in core. | Model routing profile. |
| `system/workorders/cli/documentation-impact.ts` | COPY_TO_CORE | Mandatory documentation lifecycle enforcement. | `src/workorders/documentation-impact.ts` | Project SSOT mappings must be externalized. | SSOT sync check, project profile. |
| `system/workorders/cli/markdown-output-quality.ts` | COPY_TO_CORE | Generic output-completeness gate for Markdown docs. | `src/workorders/markdown-output-quality.ts` | Required sections may need project/workorder configuration. | Workorder expected outputs. |
| `system/workorders/cli/wo-factory.ts` | COPY_TO_CORE | Reusable workorder generation mechanics. | `src/workorders/wo-factory.ts` | Current templates may contain LumeOS examples. | Templates. |
| `system/workorders/cli/spec-source-chain-check.ts` | COPY_TO_CORE | Generic source-chain validation pattern. | `src/workorders/spec-source-chain-check.ts` | Source roots and product docs must come from profile. | Project profile. |
| `system/workorders/cli/decomposition-plan-validator.ts` | COPY_TO_CORE | Generic plan/workorder validation. | `src/workorders/decomposition-plan-validator.ts` | Fixture cleanup needed. | Schemas. |
| `system/workorders/cli/nutrient-defs-seed-extract.ts` | STAY_IN_LUMEOS | Nutrition-specific deterministic seed extraction. | n/a | Would leak Nutrition product truth into core. | Nutrition specs. |
| `system/workorders/cli/nutrition-human-layer.ts` | STAY_IN_LUMEOS | Nutrition-specific Human Layer extraction/generation. | n/a | Would leak BLS/Nutrition assumptions into core. | Nutrition specs/BLS. |
| `system/workorders/cli/nutrition-preferences-foundation.ts` | STAY_IN_LUMEOS | Nutrition-specific preference catalog logic. | n/a | Product-specific. | Nutrition specs/screenshots. |
| `system/workorders/cli/nutrition_food_bls_import_expand.py` | STAY_IN_LUMEOS | Nutrition BLS import helper. | n/a | Raw BLS workflow must remain project-owned. | BLS XLSX source. |
| `system/workorders/cli/nutrition_food_sample_extract.py` | STAY_IN_LUMEOS | Nutrition BLS sample extraction helper. | n/a | Product/source-specific. | BLS XLSX source. |
| `system/workorders/cli/__tests__/` | COPY_TO_CORE / STAY_IN_LUMEOS split | Generic operator tests copy; Nutrition helper tests stay. | `tests/workorders/` and LumeOS project tests | Mixed folder must be separated carefully. | Fixture project, Nutrition specs. |
| `system/workorders/schemas/` | COPY_TO_CORE | Active workorder schema definitions. | `schemas/workorders/` | Backward compatibility with old workorders. | Batch loader. |
| `system/workorders/templates/` | TEMPLATE_TO_CORE | Useful as reusable starting templates but contain project examples. | `templates/workorders/` | LumeOS path references must become placeholders. | Workorder schema. |
| `system/workorders/lifecycle/` | TEMPLATE_TO_CORE | Lifecycle docs are reusable but should be genericized. | `docs/lifecycle/` | Historical wording may imply embedded repo behavior. | Operator lifecycle. |
| `system/workorders/nutrition/` | STAY_IN_LUMEOS | LumeOS Nutrition workorders and batches are project evidence. | n/a | Copying would make core own product history. | LumeOS project docs/specs. |
| `system/workorders/fixture-*` | TEMPLATE_TO_CORE | Useful as fixture projects/examples. | `examples/fixtures/` | Must be clearly synthetic. | Tests. |
| `system/workorders/examples/` | ARCHIVE_REFERENCE / TEMPLATE_TO_CORE | Examples are useful but not active queue. | `examples/workorders/` | May be stale. | None. |
| `system/workorders/drafts/` | ARCHIVE_REFERENCE | Historical drafts, not active queue unless promoted. | n/a | Risk of accidental run if copied as active. | None. |
| `system/agent-registry/authorize-tool-call.ts` | COPY_TO_CORE | Reusable permission enforcement. | `src/agent-registry/authorize-tool-call.ts` | Registry file locations must be configurable. | Agent registry files. |
| `system/agent-registry/agents.json` | TEMPLATE_TO_CORE | Current agents include LumeOS runtime facts; core needs schema/template. | `templates/agent-registry/agents.example.json` | Hardcoded host/model truth can become stale. | Runtime docs. |
| `system/agent-registry/model_routing.json` | TEMPLATE_TO_CORE | Route shape reusable, live route values project/runtime-specific. | `templates/agent-registry/model_routing.example.json` | Must not make DGX endpoints core defaults. | Model runtime checks. |
| `system/agent-registry/permissions.json` | TEMPLATE_TO_CORE | Permission model reusable; paths project-specific. | `templates/agent-registry/permissions.example.json` | Embedded LumeOS path rules need placeholders. | Authorizer. |
| `system/agent-registry/tool_profiles.json` | TEMPLATE_TO_CORE | Reusable concept; project path rules vary. | `templates/agent-registry/tool_profiles.example.json` | Stale roles if copied literally. | Authorizer. |
| `system/agent-registry/*.md` | TEMPLATE_TO_CORE / ARCHIVE_REFERENCE | Registry docs useful but include historical runtime names. | `docs/agent-registry/` | Must align with current model routing policy. | Runtime docs. |
| `system/approval/approval-queue.ts` and CLI/viewer | COPY_TO_CORE | Reusable approval queue mechanism. | `src/approval/` | Queue storage must be project-local. | Project profile approval root. |
| `system/approval/queue.json` | GENERATED_EVIDENCE / STAY_IN_LUMEOS | Runtime approval state. | n/a | Must not be copied as core state. | Approval CLI. |
| `system/project-profiles/project-profile-loader.ts` | COPY_TO_CORE | Core project attachment mechanism. | `src/project-profiles/` | Needs external project-root mode. | Profile schema. |
| `system/project-profiles/project-profile.schema.json` | COPY_TO_CORE | Reusable schema. | `schemas/project-profile.schema.json` | May need fields for external repo paths. | Loader. |
| `system/project-profiles/profiles/lumeos.json` | STAY_IN_LUMEOS / TEMPLATE_TO_CORE | LumeOS profile is project truth; can inspire example. | `examples/fixtures/lumeos-like.profile.example.json` | Do not make LumeOS defaults core defaults. | LumeOS paths. |
| `system/reports/*.ts` | COPY_TO_CORE | Active reusable report/dossier/gov-learning generators. | `src/reports/` | Output roots must be project-local. | State/audit/report roots. |
| `system/reports/__tests__/` | COPY_TO_CORE | Reusable report behavior tests. | `tests/reports/` | Fixture generated evidence needed. | Fixture project. |
| `system/reports/batches/` | GENERATED_EVIDENCE | Product/governance batch evidence. | Project repo reports root | Historical volume can clutter core if copied. | Dossier generator. |
| `system/reports/dossiers/` | GENERATED_EVIDENCE | Dossier evidence. | Project repo reports root | Not reusable source. | Dossier generator. |
| `system/reports/runs/` | GENERATED_EVIDENCE | Run summaries. | Project repo reports root | Retention policy needed. | Run summary generator. |
| `system/reports/model-runtime-history/` | GENERATED_EVIDENCE | Runtime history for current environment. | Project/local runtime report root | Environment-specific. | Model runtime checks. |
| `system/reports/codex-worker/` | GENERATED_EVIDENCE | Worker reports/prompts. | Project repo reports root | Can include project context. | Codex worker. |
| `system/state/*.ts` | COPY_TO_CORE | Reusable state/audit writing helpers if present. | `src/state/` | Must write to external project runtime root. | Project profile. |
| `system/state/*.json`, `*.jsonl`, locks | GENERATED_EVIDENCE / STAY_IN_LUMEOS | Runtime state and audit logs. | n/a | Must not be manually edited or copied as defaults. | Official cleanup tools. |
| `system/workers/codex-worker.ts` | COPY_TO_CORE | Reusable Codex worker adapter. | `src/workers/codex-worker.ts` | Current allow/block path defaults need project profile. | Workorder parser, report root. |
| `system/workers/codex-worker.config.json` | TEMPLATE_TO_CORE | Generic config shape; actual values project-specific. | `templates/workers/codex-worker.config.example.json` | Report directory must not point to core reports by default. | Codex worker. |
| `system/model-tiers/` | TEMPLATE_TO_CORE / STAY_IN_LUMEOS split | Model-tier policy shape reusable; current DGX roles are LumeOS runtime truth. | `templates/model-tiers/`, `docs/model-routing/` | Stale runtime facts in core if copied literally. | Agent registry/model routing. |
| `system/policies/` | TEMPLATE_TO_CORE | Reusable policy templates and examples. | `policies/` | Project-specific forbidden actions must be profile-driven. | Governance checks. |
| `system/prompts/` | TEMPLATE_TO_CORE | Reusable prompt templates if generic. | `templates/prompts/` | Project-specific prompt content must be excluded. | Dispatcher/reviewer. |
| `system/memory/canonical/` | STAY_IN_LUMEOS / TEMPLATE_TO_CORE | Active support for LumeOS canonical memory; core should only carry schema/template. | `templates/memory/canonical.example.md` | Core must not own live LumeOS memory. | Governance learning check. |
| `system/memory/schemas/` | COPY_TO_CORE | Reusable memory schema support. | `schemas/memory/` | Confirm consumers before copy. | Memory/check tooling. |
| `system/memory/events/`, `execution/`, `learning/`, `promotions/`, `retrieval/` | PLACEHOLDER | Audit found placeholders unless evidence says otherwise. | Maybe `templates/memory/.gitkeep` | Copying placeholders may imply active subsystem. | None known. |
| `packages/wo-core/` | COPY_TO_CORE | Reusable workorder core package already isolated. | `packages/wo-core/` | Namespace should change from `@lumeos` or be aliased. | TS path config. |
| `packages/agent-core/` | COPY_TO_CORE | Reusable agent abstractions. | `packages/agent-core/` | Current docs may mention LumeOS. | Agent registry. |
| `packages/vllm-client/` | COPY_TO_CORE | Reusable VLLM client wrapper. | `packages/vllm-client/` | Runtime endpoint config must be external. | Model runtime checks. |
| `packages/execution-token/` | COPY_TO_CORE | Reusable execution token package. | `packages/execution-token/` | Package namespace and key policy need review. | wo-core. |
| `packages/scheduler-core/` | COPY_TO_CORE | Reusable scheduler core. | `packages/scheduler-core/` | Embedded path assumptions need tests. | wo-core. |
| `packages/graph-core/` | COPY_TO_CORE | Generic graph validation/readiness package; Phase-0 inspection found active imports by `services/orchestrator-api` and `services/scheduler-api`. | `packages/graph-core/` | Namespace rename impact remains open. | wo-core-adjacent graph consumers. |
| `packages/shared/` | STAY_IN_LUMEOS | Phase-0 inspection found it exports Supabase browser/server helpers only. | n/a | Violates file-backed-by-default core policy if copied as required dependency. | Supabase env/project apps. |
| `packages/supabase-clients/` | STAY_IN_LUMEOS / UNKNOWN | Supabase client package likely project app support. | n/a unless core needs test fixture only | Core should not depend on LumeOS DB clients. | Supabase env. |
| `packages/types/` | STAY_IN_LUMEOS | Product/domain types. | n/a | Could leak LumeOS domain model. | App/services. |
| `services/governance-compiler/` | TEMPLATE_TO_CORE | Phase-0 inspection found reusable concept but embedded prompt path, workspace root detection, and Spark A endpoint defaults. | `templates/services/governance-compiler/` first; later `src/services/governance-compiler/` after abstraction. | Hardcoded route/workspace assumptions. | wo-core, vllm-client, prompt templates. |
| `services/orchestrator-api/` | TEMPLATE_TO_CORE | Phase-0 inspection found reusable graph/scheduler/retry route concepts, but hardcoded Spark A/B status samples. | `templates/services/orchestrator-api/` first. | Runtime status defaults can become stale. | wo-core, graph-core, agent-core, scheduler-core. |
| `services/wo-classifier/` | TEMPLATE_TO_CORE | Phase-0 inspection found deterministic classifier logic plus optional Supabase duplicate check. | `templates/services/wo-classifier/` first; optional storage adapter later. | Must not make Supabase required by core. | wo-core, optional DB adapter. |
| `services/*-api` product services | STAY_IN_LUMEOS | Product/domain APIs. | n/a | Not core governance source. | Product code. |
| `apps/*` | STAY_IN_LUMEOS | Product/admin/web/mobile apps. | n/a | Not governance core. | Product services/packages. |
| `docs/project/*` | STAY_IN_LUMEOS | LumeOS SSOT, handover, TODOs, product milestones. | n/a | Core must not own project truth. | SSOT sync. |
| `docs/project/system-structure/*` | STAY_IN_LUMEOS / TEMPLATE_TO_CORE summary | Audit evidence for extraction source; useful as reference only. | `docs/migration/source-audit-summary.md` optional | Must not become generic truth. | This blueprint. |
| `docs/specs/Nutrition/` | STAY_IN_LUMEOS | Nutrition product truth. | n/a | Explicitly excluded from core. | Nutrition product. |
| `docs/specs/*` non-governance product specs | STAY_IN_LUMEOS | Project specs. | n/a | Product leakage. | Product. |
| `infra/vllm/`, `infra/systemd/` | STAY_IN_LUMEOS / TEMPLATE_TO_CORE | Current runtime docs are environment-specific; templates may be reusable later. | `docs/runtime/templates/` optional | Core must not own live DGX runtime truth. | Runtime SSOT. |
| `system/OPEN_TODOS.md` | ARCHIVE_REFERENCE / STALE | Audit says stale versus `docs/project/OPEN_TODOS.md`. | n/a | Do not maintain as active TODO SSOT. | Project TODO docs. |
| `backup_system.zip`, `system.zip`, `services.zip` | UNKNOWN | Root archives, not part of active system tree. | n/a | Could be stale/generated. | UNKLAR: verify before any cleanup. |

## Copy-to-Core Summary

Likely first-copy reusable source:

- `system/control-plane/`
- generic files from `system/workorders/cli/`
- `system/workorders/schemas/`
- generic `system/reports/*.ts`
- `system/approval/` implementation, excluding live queue state
- `system/project-profiles/` loader and schema, excluding live LumeOS-only profile as default
- `system/workers/codex-worker.ts`
- reusable packages:
  - `packages/wo-core/`
  - `packages/agent-core/`
  - `packages/vllm-client/`
  - `packages/execution-token/`
  - `packages/scheduler-core/`

## Must Stay In LumeOS Summary

- `apps/`
- product services
- `supabase/`
- `docs/specs/Nutrition/`
- `docs/project/`
- LumeOS workorders/batches/reports/dossiers
- Nutrition deterministic extraction/import helpers
- BLS source handling
- LumeOS runtime state and approval queue state
- LumeOS project profile

## UNKLAR Items

These need verification before extraction:

- package namespace rename impact: run `rg "@lumeos/" system packages services apps tools`.
- final LumeOS external project profile location: run `rg "system/project-profiles/profiles/lumeos.json|project.profile" .`.
- root archive files: run `git ls-files backup_system.zip system.zip services.zip` and inspect provenance before any cleanup.
