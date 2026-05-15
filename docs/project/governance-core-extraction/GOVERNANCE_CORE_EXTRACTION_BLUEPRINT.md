# AI-Governance-Core Extraction Blueprint

Status: planning only.

Source repo: `D:\GitHub\LumeOS-Claude-V1`

Future repo: `D:\GitHub\AI-Governance-Core`

This document is a blueprint. It does not authorize moving files, deleting files,
rewriting runtime behavior, or extracting code from the current repo. The
current LumeOS repo remains the working backloop and source of truth until Tom
approves a separate extraction phase.

## Milestone Context

The current embedded governance system is functional:

- Spark1 orchestration is proven.
- The DGX3/Nemotron reviewer path is proven.
- `documentation_impact` is mandatory in governed workorders.
- `SSOT_SYNC_CHECK` and cross-file SSOT consistency checks are active.
- Dossiers are generated for governed batches.
- Stop-rule baseline handling works through official tooling.
- LumeOS Nutrition Local Foundation V1 has been cut and documented.
- The system tree audit exists at:
  - `docs/project/system-structure/SYSTEM_TREE_AUDIT.md`
  - `docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json`
  - `docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md`

## Core Principle

Governance-Core controls. Project repos own truth.

AI-Governance-Core should own reusable workflow mechanics: validation,
dispatch, review, approvals, stop rules, documentation-impact enforcement,
SSOT synchronization, dossier generation, templates, and generic policies.

LumeOS should own LumeOS truth: product code, Nutrition specs, project TODOs,
current handover, project workorders, project dossiers, local source files, and
project-specific decisions.

The split must make it impossible for reusable governance code to silently carry
LumeOS product truth into a different project.

## Storage Policy

AI-Governance-Core must be file-backed by default.

Supabase/Postgres may exist later only as optional storage adapters. No core
governance command may require Supabase/Postgres unless the active project
profile explicitly enables a DB-backed adapter for that command.

Default core behavior must use project-local files for:

- runtime state
- approval state
- audit logs
- metrics
- reports
- dossiers
- SSOT docs

Project repos own those files. Core commands must receive paths through a
project profile or explicit CLI arguments.

## Why Split

The current `system/` tree contains both reusable governance engine code and
LumeOS-specific project evidence. That is useful while bootstrapping but risky
for reuse:

- New projects could inherit Nutrition assumptions.
- Runtime/model routing could become mixed with product truth.
- Generated reports could be mistaken for reusable source.
- Workorder templates and historical product batches are currently adjacent.
- SSOT enforcement should work across project repos, not only inside LumeOS.

The split creates a reusable control layer while preserving each project as the
owner of its own facts.

## Target Architecture

AI-Governance-Core provides reusable command-line tooling and libraries.
Project repos provide a project profile and project-local truth.

High-level flow:

1. Operator invokes AI-Governance-Core with a project root and profile.
2. Governance-Core loads project policy, workorder roots, report roots, SSOT
   mappings, forbidden paths, runtime routing, and product gates from the
   project profile.
3. Governance-Core runs preflight, Spark1 orchestration, worker dispatch,
   review, documentation handling, SSOT checks, stop rules, and dossier output.
4. All project-specific artifacts are read from and written to the project repo,
   not to the core repo.
5. Core repo generated outputs are limited to fixture/test evidence unless a
   specific core maintenance run is executed.

## What Belongs In AI-Governance-Core

Reusable engine/tooling:

- Control-plane checks:
  - governance invariant checks
  - agent contract checks
  - model runtime checks
  - review pipeline
  - stop rules
  - promotion gates
  - scheduler preflight
  - SSOT sync checks
- Workorder machinery:
  - workorder schemas
  - batch schemas
  - batch loader
  - batch operator
  - operator doctor
  - orchestration mode handling
  - Spark1 orchestrator handoff
  - documentation-impact validator
  - markdown output quality gate
  - workorder factory
- Dispatcher and worker integration contracts:
  - dispatcher
  - Codex worker adapter
  - generic worker contracts
  - model route wrappers
- Approval and stop-rule tooling:
  - approval queue library and CLI
  - stop-rule baseline tooling
  - terminal workorder cleanup tools
- Project profile loader:
  - project profile schema
  - path resolution
  - forbidden path matching
  - runtime artifact classification
- Generic report/dossier tooling:
  - batch dossier generator
  - run summary generator
  - failed workorder report generator
  - retention summarizer
  - governance learning checks
- Templates and policies:
  - generic workorder templates
  - documentation-impact templates
  - source-chain policy templates
  - product gate templates
  - runtime route templates
- Generic tests and fixtures:
  - fixture projects
  - fixture workorders
  - fixture runtime routes
  - fixture dossiers
- Future frontdoor engine:
  - brainstorm intake
  - summary
  - product intent
  - spec candidate
  - workorder draft generation
  - drift checker
  - approval handoff

## What Stays In LumeOS

Project truth and project evidence:

- LumeOS product code under `apps/`, `services/`, project packages, `supabase/`,
  and related product folders.
- LumeOS specs under `docs/specs/`.
- LumeOS project docs under `docs/project/`.
- LumeOS TODOs:
  - `docs/project/OPEN_TODOS.md`
  - `docs/project/GOVERNANCE_TODO_REGISTER.json`
- LumeOS current handover:
  - `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- LumeOS workorders and batches.
- LumeOS dossiers and generated reports.
- LumeOS project profile.
- Nutrition raw/source references and local BLS handling.
- Frontdoor notes, summaries, product intents, spec candidates, and workorder
  drafts for LumeOS.
- Any BeautyClub or other project-specific content.

## Project Profiles

Project profiles are the connection point between core and project.

A project profile should tell Governance-Core:

- project id and display name
- project root
- workorders root
- reports root
- memory root
- runtime state root
- approval root
- SSOT files
- TODO files
- product gate files
- forbidden paths
- generated evidence paths
- ignored local paths
- model routing profile or route overrides
- default governed batch
- documentation-impact policy
- source-chain policy

The profile must not make Governance-Core the owner of project truth. It only
teaches the core where the project truth lives and how to validate it.

## Non-Goals

This blueprint does not:

- perform the extraction
- move files
- delete files
- archive files
- rewrite runtime behavior
- replace the LumeOS embedded governance system
- change product code
- run DEV/LIVE
- change production routing
- change MiniMax routing
- promote Nutrition work beyond local state
- make AI-Governance-Core the owner of LumeOS product truth

## Risks

| Risk | Mitigation |
|---|---|
| LumeOS-specific paths leak into the core repo | Require fixture projects and project profile path injection. |
| Generated reports are copied as reusable source | Treat report outputs as project evidence, not core source. |
| Runtime state is copied and later edited manually | Keep runtime state project-local and mutate only through official tools. |
| Workorder templates contain LumeOS examples | Convert to generic templates or fixture examples. |
| Model routing hardcodes current DGX hosts | Put live routes in project/local runtime profiles; keep core defaults as templates. |
| SSOT checks become too LumeOS-specific | Split generic checks from project profile mappings. |
| Extraction breaks current LumeOS workflow | Attach LumeOS read-only first, then run doctor before any write-capable run. |
| Old embedded governance remains active and confusing | Cleanup only after Tom approves archive/removal phase. |

## Required Extraction Discipline

Each extraction phase must preserve these rules:

- Current LumeOS repo remains the active source of truth until cutover.
- Phase 1 requires Tom approval of the Phase-1 copy manifest before copying.
- No embedded governance cleanup happens during copy phases.
- The first external attachment is read-only.
- The first governed test is harmless and local-only.
- Any mismatch between core and LumeOS profile stops the phase.
- All generated evidence remains in the project repo unless the run is a core
  fixture test.
