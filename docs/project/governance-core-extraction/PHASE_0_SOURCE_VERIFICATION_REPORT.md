# Phase 0 Source Verification Report

Status: Phase 0 complete, pending Tom review for Phase 1.

Scope: read-only verification and copy-manifest preparation for the future
`D:\GitHub\AI-Governance-Core` repository.

No extraction was performed. No files were copied into `D:\GitHub\AI-Governance-Core`.
No files were moved or deleted. No product code, runtime behavior, DB state,
runtime state, or queue state was changed.

## Source Repository State

| Field | Value |
|---|---|
| Source repo | `D:\GitHub\LumeOS-Claude-V1` |
| Branch | `goal/p1-005-draft-candidate` |
| Phase-0 source commit | `6f36ef584ef74e6821d52d0e48b3a19d729f9944` |
| Worktree at Phase-0 start | clean |
| Git status at Phase-0 start | `## goal/p1-005-draft-candidate` |
| Related Phase-0 writes | planning docs, governed workorder/batch, SSOT pointers only |
| Unrelated dirty files | none observed at Phase-0 start |

Phase-0 writes are intentionally limited to:

- `docs/project/governance-core-extraction/`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/OPEN_TODOS.md`
- `docs/project/GOVERNANCE_TODO_REGISTER.json`
- governed workorder/batch metadata for this Phase-0 verification task

## Evidence Read

- `docs/project/system-structure/SYSTEM_TREE_AUDIT.md`
- `docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json`
- `docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md`
- `docs/project/governance-core-extraction/GOVERNANCE_CORE_MIGRATION_MAP.md`
- `docs/project/governance-core-extraction/GOVERNANCE_CORE_EXTRACTION_BLUEPRINT.md`
- `docs/project/governance-core-extraction/GOVERNANCE_CORE_TARGET_STRUCTURE.md`
- `docs/project/governance-core-extraction/LUMEOS_PROJECT_REATTACH_PLAN.md`
- `docs/project/governance-core-extraction/EXTRACTION_PHASE_PLAN.md`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/OPEN_TODOS.md`
- `docs/project/GOVERNANCE_TODO_REGISTER.json`
- root package/workspace config
- selected package and service source files by read-only inspection

## Storage Policy Verification

Phase 0 adds the storage policy explicitly to the extraction docs:

- AI-Governance-Core must be file-backed by default.
- Supabase/Postgres may be optional future storage adapters only.
- No core governance command may require Supabase unless the active project
  profile explicitly enables a DB-backed adapter.
- Project repos own runtime state, approval state, reports, dossiers, and SSOT.

Current evidence supports this policy:

- `services/wo-classifier/src/supabase.ts` already soft-fails duplicate checks
  when Supabase env vars are absent.
- `packages/shared` and `packages/supabase-clients` are Supabase-coupled and
  should not be Phase-1 core dependencies.
- Current operator/checker state is file-backed under `system/state`,
  `system/approval`, and `system/reports`.

## UNKLAR Resolution Summary

### `packages/graph-core`

Inspection command:

```powershell
rg "@lumeos/graph-core|graph-core" .
```

Evidence:

- Imported by `services/orchestrator-api/src/routes/graph.ts`.
- Listed as dependency in `services/orchestrator-api/package.json` and
  `services/scheduler-api/package.json`.
- Contains generic graph types, validation, cycle detection, and readiness
  calculation.

Classification refinement:

- `COPY_TO_CORE`

Phase guidance:

- Copy candidate, but not in the smallest Phase-1 set unless graph/orchestrator
  service extraction is included.

### `packages/shared`

Inspection commands:

```powershell
rg "@lumeos/shared|packages/shared" .
Get-Content packages/shared/src/index.ts
Get-Content packages/shared/src/supabase/client.ts
Get-Content packages/shared/src/supabase/server.ts
```

Evidence:

- Exports only Supabase browser/server helpers.
- Depends on `@supabase/supabase-js` and `@supabase/ssr`.
- Reads project env vars such as `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

Classification refinement:

- `STAY_IN_LUMEOS`

Reason:

- This is a project/app support package, not reusable file-backed governance
  core.

### `services/governance-compiler`

Inspection:

- `package.json`
- `src/index.ts`
- `src/routes/compile.ts`
- imports and prompt path usage

Evidence:

- Depends on `@lumeos/wo-core` and `@lumeos/vllm-client`.
- Loads prompt from `system/prompts/governance/governance_compiler_prompt.md`.
- Hardcodes/falls back to Spark A endpoint `http://192.168.0.128:8001`.
- Finds workspace root by looking for `CLAUDE.md`.

Classification refinement:

- `TEMPLATE_TO_CORE`

Reason:

- The concept is reusable, but the current implementation has embedded LumeOS
  workspace/root/prompt/runtime assumptions. It should become a generic compiler
  service only after path, prompt, and route injection are abstracted.

### `services/orchestrator-api`

Inspection:

- `package.json`
- `src/index.ts`
- `src/routes/graph.ts`
- `src/routes/scheduler.ts`
- `src/routes/retry.ts`

Evidence:

- Depends on reusable packages: `wo-core`, `graph-core`, `agent-core`,
  `scheduler-core`.
- Provides simple Hono routes for graph validation, scheduler prioritization,
  and retry decisions.
- Has hardcoded status sample for Spark A/B slots.

Classification refinement:

- `TEMPLATE_TO_CORE`

Reason:

- Reusable concept and some reusable route code, but active runtime status and
  route defaults need genericization before copying as core service source.

### `services/wo-classifier`

Inspection:

- `package.json`
- `src/index.ts`
- `src/routes/classify.ts`
- `src/supabase.ts`
- `src/rules/index.ts`

Evidence:

- Deterministic classifier logic is reusable.
- Duplicate check uses Supabase only when env vars are configured; otherwise it
  returns `{ duplicate: false, configured: false }`.
- Current classifier rules include Spark C/D availability comments that are
  stale relative to current runtime truth.

Classification refinement:

- `TEMPLATE_TO_CORE`

Reason:

- Extract as a generic deterministic classifier only after storage adapters and
  runtime route availability are profile-driven. The current Supabase duplicate
  check may become an optional adapter.

### Package Namespace Rename Impact

Inspection command:

```powershell
rg "@lumeos/" system packages services apps tools
```

Evidence:

- `@lumeos/*` appears across core-like packages, governance services,
  scheduler services, tools, app package names, and documentation.

Classification:

- namespace rename impact remains `UNKNOWN_NEEDS_DECISION`

Required decision:

- Phase 1 should keep `@lumeos/*` temporarily inside the copied skeleton or use
  compatibility aliases.
- Rename to `@ai-governance-core/*` should be a later controlled phase after
  compile/test impact is measured.

### Final External Project Profile Location

Inspection command:

```powershell
rg "system/project-profiles/profiles/lumeos.json|project.profile" .
```

Evidence:

- Current active profile is under
  `system/project-profiles/profiles/lumeos.json`.
- Multiple checks, tests, docs, and app snapshot code reference the embedded
  project profile path.
- Existing extraction docs propose future `.governance/project.profile.json` or
  `governance/project.profile.json`, but no decision has been made.

Classification:

- final target location remains `UNKNOWN_NEEDS_DECISION`

Phase guidance:

- Phase 4 should attach LumeOS read-only using the existing embedded profile
  path first. Moving profile location is a later project cleanup decision.

### Root Archive Files

Inspection commands:

```powershell
git ls-files backup_system.zip system.zip services.zip
git check-ignore -v backup_system.zip system.zip services.zip
Get-Item backup_system.zip,system.zip,services.zip
```

Evidence:

- `git ls-files` returned no tracked files.
- `.gitignore` ignores `*.zip`.
- Files exist locally:
  - `backup_system.zip`
  - `system.zip`
  - `services.zip`

Classification:

- `GENERATED_EVIDENCE_DO_NOT_COPY` / local ignored archives

Phase guidance:

- Do not copy into AI-Governance-Core.
- Do not delete in Phase 0.
- Provenance remains unclear; if cleanup is needed, handle under the system tree
  cleanup process with Tom approval.

## Classification Refinements

| Path | Previous state | Phase-0 refinement | Evidence |
|---|---|---|---|
| `packages/graph-core/` | `COPY_TO_CORE / UNKNOWN` | `COPY_TO_CORE` | Active imports by orchestrator/scheduler and generic graph code. |
| `packages/shared/` | `STAY_IN_LUMEOS / UNKNOWN` | `STAY_IN_LUMEOS` | Supabase browser/server helpers only. |
| `services/governance-compiler/` | `UNKNOWN` | `TEMPLATE_TO_CORE` | Reusable concept, but hardcoded prompt/workspace/Spark endpoint assumptions. |
| `services/orchestrator-api/` | `UNKNOWN` | `TEMPLATE_TO_CORE` | Reusable concept, but runtime status defaults need genericization. |
| `services/wo-classifier/` | `UNKNOWN` | `TEMPLATE_TO_CORE` | Deterministic classifier reusable, Supabase duplicate check must become adapter. |
| `backup_system.zip`, `system.zip`, `services.zip` | `UNKNOWN` | `GENERATED_EVIDENCE_DO_NOT_COPY` | Ignored local zip archives, not tracked. |

## Phase-1 Readiness Assessment

Phase 1 is not yet approved.

Phase 0 recommends a narrow Phase-1 copy only after Tom reviews
`PHASE_1_COPY_MANIFEST.md`.

Go/no-go recommendation:

- `GO` for Phase 1 only after explicit Tom approval of the copy manifest.
- `NO-GO` for any extraction that copies Nutrition helpers, LumeOS reports,
  runtime state, approval queue state, BLS source handling, or live DGX runtime
  facts as core defaults.

