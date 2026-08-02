# AI-Governance-Core Target Structure

Status: proposed target structure, not executed.

Target repo: `D:\GitHub\AI-Governance-Core`

The target repo should contain reusable governance engine code, schemas,
templates, policies, tests, and fixtures. It should not contain LumeOS product
truth or generated LumeOS evidence.

## Default Storage Model

AI-Governance-Core is file-backed by default. Runtime state, approval queues,
audit logs, metrics, reports, dossiers, and SSOT files live in the active
project repo unless a project profile explicitly enables another adapter.

Supabase/Postgres support may be added later only as optional adapters. A core
command must not require Supabase/Postgres for normal operation.

## Proposed Root Layout

```text
AI-Governance-Core/
  README.md
  package.json
  pnpm-lock.yaml
  pnpm-workspace.yaml
  tsconfig.json
  turbo.json
  docs/
    architecture/
    lifecycle/
    operator-runbook/
    runtime/
    ssot/
    frontdoor/
  src/
    cli/
    control-plane/
    agent-registry/
    approval/
    project-profiles/
    reports/
    state/
    workers/
    workorders/
    frontdoor/
  schemas/
    project-profile.schema.json
    workorders/
    memory/
    reports/
  templates/
    workorders/
    batches/
    agent-registry/
    model-routing/
    project-profile/
    documentation-impact/
    frontdoor/
    memory/
  policies/
    product-gate/
    source-chain/
    ssot-sync/
    documentation-impact/
    stop-rules/
    storage-adapters/
  packages/
    wo-core/
    agent-core/
    vllm-client/
    execution-token/
    scheduler-core/
  examples/
    fixtures/
      minimal-project/
      model-routing/
      workorders/
      reports/
  tests/
    control-plane/
    workorders/
    reports/
    project-profiles/
    approval/
    workers/
    fixtures/
  reports/
    .gitkeep
```

## Source Layout Rules

### `src/control-plane/`

Reusable governance control logic:

- invariant checks
- agent contract checks
- model runtime checks
- review pipeline
- dispatcher
- stop rules
- promotion gates
- SSOT sync checks
- scheduler preflight

Project-specific path roots must be supplied by project profile or CLI args.

### `src/workorders/`

Reusable workorder lifecycle logic:

- batch loader
- batch operator
- doctor/status/continue logic
- orchestration mode handling
- Spark1/orchestrator handoff abstraction
- documentation-impact lifecycle
- Markdown output quality gate
- workorder factory
- source-chain check engine

Nutrition-specific helpers must not live here.

### `src/agent-registry/`

Reusable registry and permission enforcement:

- authorization logic
- registry schema handling
- route selection contracts

Live DGX endpoints must come from project/runtime profile files or local operator
configuration, not hardcoded defaults.

### `src/approval/`

Reusable approval queue library and CLI. Queue storage remains project-local.

### `src/project-profiles/`

Project profile loader and schema validation.

The loader must support:

- project root passed explicitly
- external profile path passed explicitly
- project-local report/state/approval roots
- generated evidence classification
- forbidden paths
- SSOT mappings

### `src/reports/`

Generic generators:

- batch dossier
- failed workorder report
- run summary
- morning report
- model quality report
- retention summarizer
- governance learning check/suggest

Generated project evidence belongs in the project repo report root.

### `src/state/`

Reusable state/audit helpers. Runtime state files are not defaults in the core
repo.

### `src/workers/`

Worker adapters and contracts:

- Codex worker adapter
- generic model worker wrappers
- worker output validation

Worker outputs write to project-local report roots.

### `src/frontdoor/`

Future subsystem for:

- brainstorm intake
- summary
- product intent
- spec candidate
- workorder draft generation
- drift checking
- approval handoff

Frontdoor templates live in core. Project notes and resulting artifacts live in
the project repo.

## Package Policy

The existing reusable package shape should be preserved initially:

- `packages/wo-core`
- `packages/agent-core`
- `packages/vllm-client`
- `packages/execution-token`
- `packages/scheduler-core`

Package naming must be decided during extraction:

- Option A: keep `@lumeos/*` temporarily for compatibility, then rename.
- Option B: rename to `@ai-governance-core/*` during Phase 2.

This is UNKLAR until package import impact is measured. Verification command:

```powershell
rg "@lumeos/" system packages services apps tools
```

## Generated Evidence Policy

AI-Governance-Core should not store LumeOS-generated evidence as source.

Allowed in core:

- fixture reports
- synthetic test dossiers
- examples with fake project ids

Not allowed in core:

- LumeOS Nutrition product dossiers
- LumeOS batch reports
- LumeOS runtime state
- LumeOS approval queue state
- LumeOS model runtime history
- LumeOS Codex worker reports

Core report folders should be ignored by default except `.gitkeep` and fixture
files explicitly used by tests.

## Memory And Canonical Policy

Core may contain:

- memory schemas
- canonical memory template
- documentation explaining memory layers

Core must not contain:

- `system/memory/canonical/lumeos_canonical.md` as live truth
- project handover files
- project-specific canonical facts

Project repos own their own canonical and handover layers.

## What Should Not Exist In Core

The core repo should not contain:

- `docs/specs/Nutrition/`
- BLS source files or generated BLS payloads
- LumeOS product TODOs
- LumeOS current handover as core truth
- LumeOS product dossiers
- BeautyClub product content
- local Supabase migrations from LumeOS
- product app code
- product service code
- live runtime state from a project repo
- live approval queue state from a project repo

## Compatibility Strategy

Phase 1 should preserve behavior by copying reusable code with minimal path
changes and a fixture project. Phase 2 should introduce explicit `--project-root`
and `--profile` handling wherever current code assumes `process.cwd()` is both
operator root and project root.

The first LumeOS connection should be read-only doctor/check mode.
