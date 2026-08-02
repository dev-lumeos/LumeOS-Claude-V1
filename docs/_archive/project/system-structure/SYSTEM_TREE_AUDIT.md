# System Tree Audit

Date: 2026-05-15  
Scope: `system/`  
Status: FACTUAL STRUCTURE AUDIT / NO CLEANUP PERFORMED

This audit explains the current `system/` tree using evidence from file
references, imports, tests, docs, project profiles, and recent governed runs. It
does not authorize deleting, moving, or rewriting any file.

## Executive Summary

The `system/` tree is a mix of active governance runtime code, active support
docs/config, generated evidence, historical references, and placeholders.

High-signal findings:

- `system/control-plane`, `system/workorders`, `system/agent-registry`,
  `system/project-profiles`, `system/state`, `system/approval`, `system/workers`,
  and core `system/reports` generators are active.
- `system/memory/canonical` is active support because governance-learning code
  reads `lumeos_canonical.md`. Most other `system/memory/*` folders are
  placeholders.
- `system/reports` contains both active generators and generated report output.
  These should not be treated the same.
- `system/workorders/nutrition/drafts` contains historical drafts; current
  active/completed batches live mostly in `system/workorders/nutrition/batches`
  and root Nutrition workorder files.
- `system/state` is active runtime state. It must be read through tools and
  mutated only through official state/cleanup mechanisms. Do not manually edit
  `runtime_state.json`, locks, queue, or JSONL audit files.
- `system/OPEN_TODOS.md` appears stale because active TODO SSOT is
  `docs/project/OPEN_TODOS.md` plus
  `docs/project/GOVERNANCE_TODO_REGISTER.json`.

## Classification Legend

- `ACTIVE_CORE`: actively used by governed execution, validation, routing,
  state, or worker behavior.
- `ACTIVE_SUPPORT`: actively referenced by tools, tests, docs, or SSOT checks,
  but not the main execution engine.
- `GENERATED_EVIDENCE`: generated reports/history/dossiers; may be evidence,
  but usually should not be committed by default.
- `ARCHIVE_REFERENCE`: historical/design reference; useful, but not active
  executable source.
- `PLACEHOLDER`: currently empty or `.gitkeep`-only; planned/possible future
  subsystem.
- `STALE`: likely superseded by another active SSOT path.
- `UNKNOWN`: insufficient evidence found.

## Top-Level Folder Audit

| Path | Classification | Purpose | Evidence of use | Risks / cleanup notes |
|---|---|---|---|---|
| `system/agent-registry` | `ACTIVE_CORE` | Agent definitions, permissions, routing, tool authorization. | Dispatcher/tests reference `agents.json`, `model_routing.json`, `permissions.json`, `authorize-tool-call.ts`. | Keep. Root `.gitkeep` is harmless residue. |
| `system/approval` | `ACTIVE_CORE` | Approval queue, grants, gate logic, viewer CLI. | `approval-queue.ts`, `approval-cli.ts`, tests, state sync, reports. | Do not manually edit `queue.json`. |
| `system/architecture` | `ARCHIVE_REFERENCE` | Scheduler/classifier design docs. | Markdown docs only; no active imports found. | Keep as design reference; index before moving. |
| `system/branch-policy` | `ARCHIVE_REFERENCE` | Branch policy V1 doc. | Active promotion logic is in `system/control-plane/promotion-governance.ts`. | Mark as historical/policy reference later. |
| `system/control-plane` | `ACTIVE_CORE` | Dispatcher, validators, runtime checks, stop rules, review pipeline, SSOT sync, promotion governance. | Required validation commands and many tests execute files here. | Core code; do not move without architectural migration. |
| `system/db-environments` | `ARCHIVE_REFERENCE` | DB environment design doc. | Markdown only; DB/Supabase execution is governed elsewhere. | Keep as reference; mark if superseded. |
| `system/decomposition` | `ACTIVE_SUPPORT` | Decomposition schema/design. | `decomposition_spec_v1.md` referenced by factory/planning docs. | `specs/` and `validators/` are placeholders; active validator is under workorders CLI. |
| `system/file-groups` | `ARCHIVE_REFERENCE` | File group registry. | Referenced by docs; no active imports found. | Compare with project profiles before cleanup. |
| `system/graph` | `PLACEHOLDER` | Intended graph subsystem. | `.gitkeep` only. | Do not delete yet; decide during cleanup blueprint. |
| `system/memory` | `ACTIVE_SUPPORT` | Compact canonical memory plus planned memory subsystem folders. | Project profiles define `memory_root`; governance-learning-check reads canonical memory. | Canonical is active support; most subfolders are placeholders. |
| `system/model-tiers` | `ACTIVE_SUPPORT` | Runtime/model tier docs. | `SSOT_SYNC_CHECK` checks runtime role consistency against v2 docs. | Keep v2 active; v1 files are likely archival references. |
| `system/policies` | `ACTIVE_SUPPORT` | Guardrails, retry, GSD policy docs. | Docs and guardrail references exist; some subfolders only `.gitkeep`. | Index active vs placeholder policy folders. |
| `system/project-profiles` | `ACTIVE_CORE` | Project profile schema/loader/config. | Imported by operator, reports, promotion governance, Codex worker, tests. | Core configuration; keep. |
| `system/prompts` | `ACTIVE_SUPPORT` | Prompt contracts and workorder factory prompts. | Workorder factory docs reference prompt files; orchestration contract exists. | `gstack/` and `review/` are placeholders. |
| `system/reports` | `ACTIVE_CORE` plus `GENERATED_EVIDENCE` | Report generators and report outputs. | Governance UI invokes `batch-dossier.ts`; checks invoke `governance-learning-check.ts`; generated reports also live here. | Split generators from generated evidence in future index. |
| `system/scheduler` | `ARCHIVE_REFERENCE` | Scheduler dispatch V1 doc. | Active preflight logic is `system/control-plane/scheduler-preflight.ts`. | Mark as design reference if superseded. |
| `system/state` | `ACTIVE_CORE` | Runtime state manager, audit writer, schemas, runtime logs. | Operator/reports/stop rules/learning tools read state and JSONL logs. | Do not manually edit runtime state, locks, or JSONL history. |
| `system/workers` | `ACTIVE_CORE` | Codex Worker bridge/config/tests. | Dispatcher and tests use Codex Worker; reports go to `system/reports/codex-worker`. | Keep forbidden path checks strict. |
| `system/workorders` | `ACTIVE_CORE` | Workorder schema, CLI, templates, active batches, drafts, examples. | Operator, worker, reports, UI, and project profiles use this root. | Needs indexes before any archive move. |

## system/memory Detailed Audit

### `system/memory/canonical`

Classification: `ACTIVE_SUPPORT`.

What it does:

- Stores compact continuity memory, not full incident history.
- Contains:
  - `lumeos_canonical.md`
  - `adr_index.md`
  - `session_protocol.md`

Evidence:

- `system/reports/governance-learning-check.ts` reads
  `system/memory/canonical/lumeos_canonical.md`.
- Tests write/read canonical memory fixtures.
- Project profiles define `"memory_root": "system/memory"`.
- Docs and Obsidian tooling reference `system/memory/canonical/`.

Current role:

- Active support SSOT/continuity context.
- Not the only current truth. The operational handover is
  `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`; TODO truth is
  `docs/project/OPEN_TODOS.md` and
  `docs/project/GOVERNANCE_TODO_REGISTER.json`.

Recommendation:

- Keep.
- Add a `system/memory/README.md` later explaining canonical vs placeholders.
- Do not automatically write report summaries into canonical memory.

### Placeholder subfolders

These contain only `.gitkeep` and no active reader/writer was found:

- `system/memory/events`
- `system/memory/execution`
- `system/memory/learning`
- `system/memory/promotions`
- `system/memory/retrieval`

Evidence:

- They are referenced mostly by old TODO/prompt/planning docs.
- Actual learning records live under `docs/project/governance-learning`.
- Actual generated runtime history lives under `system/reports/model-runtime-history`.

Recommendation:

- Classify as planned future subsystem placeholders.
- Do not delete now.
- Phase 1 cleanup should add an index/README.
- Phase 2 can mark them archive/planned if Tom agrees.

### `system/memory/schemas`

Classification: `ACTIVE_SUPPORT`.

Evidence:

- Contains `memory_schemas_v1.md`.
- Referenced by onboarding/prompt docs.
- No runtime schema validator import was found.

Recommendation:

- Keep as schema reference.
- Clarify in a future README that it is not an active validator.

## system/reports Detailed Audit

`system/reports` has two different kinds of content.

### Active report generators

Classification: `ACTIVE_CORE`.

Examples:

- `batch-dossier.ts`
- `governance-learning-check.ts`
- `governance-learning-suggest.ts`
- `report-retention-summarizer.ts`
- `run-summary-generator.ts`
- `failed-wo-report.ts`
- `model-quality-report.ts`
- `morning-report.ts`
- `wo-dossier.ts`

Evidence:

- Governance UI command runner invokes `batch-dossier.ts`.
- Required validation invokes `governance-learning-check.ts`.
- Dossier tests cover `batch-dossier.ts`.
- Retention tests cover `report-retention-summarizer.ts`.

Recommendation:

- Keep in place.
- Add `system/reports/README.md` in Phase 1 to separate generator scripts from
  outputs.

### Generated report outputs

Classification: `GENERATED_EVIDENCE`.

Examples:

- `system/reports/batches/`
- `system/reports/codex-worker/`
- `system/reports/model-runtime-history/`
- `system/reports/dossiers/`
- `system/reports/runs/`
- tracked root outputs such as `failed-wo-report.md`,
  `model-quality-report.md`, `morning-report-2026-04-30.md`

Evidence:

- `REPORT_RETENTION_POLICY.md` says Codex Worker reports and runtime history
  should not be committed by default.
- Project profile ignored paths include `system/reports/codex-worker/`.
- `batch-dossier.ts` writes batch reports under `system/reports/batches`.
- Some older generated dossiers/runs are tracked historical evidence.

Recommendation:

- Keep tracked evidence for now.
- Do not commit new generated outputs by default unless they are intentionally
  durable/redacted.
- Add a generated-evidence index before any pruning.

## system/workorders Detailed Audit

### Active core areas

- `system/workorders/cli`: active operator, batch loader, source-chain checker,
  factory, documentation-impact, Spark1 handoff, Nutrition deterministic helpers.
- `system/workorders/schemas`: active `workorder.schema.json` execution
  contract.
- `system/workorders/nutrition`: active current Nutrition P1-005 workorders and
  batches.

Evidence:

- Project profile `workorders_root` is `system/workorders`.
- Governance UI only allows batch paths under `system/workorders`.
- `run-batch-operator.ts`, `spec-source-chain-check.ts`, and `batch-dossier.ts`
  operate on this tree.
- Codex Worker validates prompts/workorders under this root.

### Active support/reference areas

- `system/workorders/templates`: authoring templates.
- `system/workorders/examples`: non-executable examples.
- `system/workorders/lifecycle`: lifecycle V1 doc.

### Historical/placeholder areas

- `system/workorders/adhoc`: older ad hoc workorders/smokes.
- `system/workorders/nutrition/drafts`: historical generated drafts and reviews.
- `system/workorders/nutrition/approved`: `.gitkeep` only.
- `system/workorders/nutrition/archive`: `.gitkeep` only.
- `system/workorders/batches`: top-level placeholder; current batches are under
  `system/workorders/nutrition/batches`.

Stale governance batches:

- The `BATCH-GOVERNANCE-P1-001` to `P1-012` files inside
  `system/workorders/nutrition/batches` appear to be completed historical
  governance implementation batches. They are useful evidence but should be
  indexed as historical/completed before any move.
- Older Nutrition P1-001/P1-004 batches are historical/reference-only unless a
  future governed task explicitly reissues them.

Recommendation:

- Do not move files now.
- Add indexes:
  - active batches
  - completed local P1-005 product batches
  - historical governance batches
  - historical drafts
- Only after index review, move historical material to archive with Tom approval.

## system/state Detailed Audit

Classification: `ACTIVE_CORE`.

Purpose:

- Runtime state management.
- Workorder state transitions.
- Audit event writing.
- Stop-rule and pipeline metrics evidence.

Primary files:

- `state-manager.ts`
- `audit-writer.ts`
- `runtime_state.schema.json`
- `shared_event.schema.json`
- tests under `system/state/__tests__`

Runtime artifacts:

- `runtime_state.json`
- `runtime_state.lock`
- `audit.jsonl`
- `audit.error.jsonl`
- `pipeline-audit.jsonl`
- `pipeline-metrics.jsonl`

Tracked vs runtime observations:

- Code/schemas/tests are tracked source.
- Some runtime artifacts exist locally and are used by reports/operator.
- `system/state/pipeline-metrics.jsonl` is tracked in the current git index;
  this should be reviewed carefully before changing because governed reports and
  tests may depend on current repository policy.

Do not manually edit:

- `system/state/runtime_state.json`
- `system/state/*.lock`
- `system/state/*.jsonl`
- `system/approval/queue.json`

Recommendation:

- Keep active state code/schemas.
- Treat runtime JSON/JSONL as append-only or tool-managed.
- Use official cleanup/baseline CLIs only.
- Add a state README/index in Phase 1.

## Stale / Unused / Placeholder Areas Found

High-risk stale or ambiguous areas:

- `system/OPEN_TODOS.md`: likely stale because current TODO SSOT is
  `docs/project/OPEN_TODOS.md` and
  `docs/project/GOVERNANCE_TODO_REGISTER.json`.
- `system/memory/events`, `execution`, `learning`, `promotions`, `retrieval`:
  placeholders only.
- `system/graph`: placeholder only.
- `system/decomposition/specs` and `system/decomposition/validators`:
  placeholders; active validator lives elsewhere.
- `system/prompts/gstack` and `system/prompts/review`: placeholders only.
- `system/policies/promotion` and `system/policies/review`: placeholders only.
- `system/workorders/nutrition/approved` and `archive`: placeholders only.
- Root-level `system/*_V1.md` and some `v1` model tier files are likely
  historical references beside newer active implementations.
- Tracked generated evidence under `system/reports/runs`, `dossiers`, and root
  report outputs should be indexed before any retention cleanup.

## Human-Readable Map

If you want to run a batch, look here:

- Batch files: `system/workorders/nutrition/batches/`
- Operator CLI: `system/workorders/cli/run-batch-operator.ts`
- Source-chain check: `system/workorders/cli/spec-source-chain-check.ts`
- Workorder schema: `system/workorders/schemas/workorder.schema.json`

If you want runtime routing, look here:

- Agent registry: `system/agent-registry/agents.json`
- Routing: `system/agent-registry/model_routing.json`
- Model tier docs: `system/model-tiers/model_registry_v2.md`,
  `system/model-tiers/model_tiers_v2.md`
- Runtime checks: `system/control-plane/model-runtime-check.ts`

If you want reports/dossiers, look here:

- Batch dossiers: `system/reports/batch-dossier.ts`
- Dossier outputs: `system/reports/batches/` and `system/reports/dossiers/`
- Learning checks: `system/reports/governance-learning-check.ts`
- Generated report retention: `system/reports/report-retention-summarizer.ts`

If you want canonical memory/handover, look here:

- Active handover: `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- Open TODOs: `docs/project/OPEN_TODOS.md`
- Machine TODO register: `docs/project/GOVERNANCE_TODO_REGISTER.json`
- Compact canonical memory: `system/memory/canonical/lumeos_canonical.md`

If you want generated runtime state, look here but do not edit:

- Runtime state: `system/state/runtime_state.json`
- Pipeline audit: `system/state/pipeline-audit.jsonl`
- Pipeline metrics: `system/state/pipeline-metrics.jsonl`
- Approval queue: `system/approval/queue.json`

## Immediate No-Action Recommendations

- Do not delete placeholder directories yet; they may encode planned structure.
- Do not move historical workorders or reports until indexes exist.
- Do not edit runtime state or queue files manually.
- Do not treat `system/memory/events` or `system/memory/retrieval` as active.
- Do not treat every file under `system/reports` as source code.
- Do not treat old `v1` docs as current without checking matching `v2` docs and
  current code.

## Next Recommended Governance Step

Run Phase 1 of the cleanup proposal: add indexes/readmes only. Start with:

1. `system/README.md`
2. `system/memory/README.md`
3. `system/reports/README.md`
4. `system/workorders/README.md` or update existing workorder readmes
5. `system/state/README.md`

No files should be moved or deleted in Phase 1.
