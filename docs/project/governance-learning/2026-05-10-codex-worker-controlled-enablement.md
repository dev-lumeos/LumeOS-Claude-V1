# Codex Worker Controlled Enablement

Date: 2026-05-10

## Purpose

Enable Codex Worker as the controlled `senior-coding-agent` runtime path in the dispatcher/operator workflow after the manual bridge and controlled dispatcher smoke passed.

## Change

- `system/workers/codex-worker.config.json` now enables `codex_worker_enabled` and `allow_dispatcher_integration`.
- The allowlist remains limited to `senior-coding-agent`.
- Workorders must explicitly set `codex_worker: true`.
- Workorders must include `source_refs`, `scope_files`, `files_blocked`, and `expected_outputs`.
- Workorders with `requires_approval: true` are blocked from Codex Worker dispatch.
- Product work remains blocked while `product_gate_open=false`.
- Hard timeout remains `120000ms` by default.

## Safety Boundaries

- No arbitrary agents may use Codex Worker.
- No product work may use Codex Worker unless Tom explicitly opens the product gate.
- No Supabase push/reset, migration execution, approval grants, runtime-state edits, queue edits, or raw BLS commits are allowed through this path.
- Runtime reports under `system/reports/codex-worker/` remain uncommitted runtime artifacts.

## Validation

Required validation for this batch:

- dispatcher Codex Worker tests
- Codex Worker bridge tests
- Operator Doctor tests
- Batch Dossier tests
- TypeScript typecheck
- governance invariant checker
- one controlled `WO-codex-001` smoke

## Product Gate

Product work remains blocked unless Tom explicitly opens it.
