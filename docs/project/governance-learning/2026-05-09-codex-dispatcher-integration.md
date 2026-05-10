# Codex Dispatcher Integration

Date: 2026-05-09

## Purpose

Governance Batch 010 adds a narrow dispatcher/operator/dossier integration point for the manual Codex Worker Bridge.

The goal is to let `senior-coding-agent` use Codex Worker through governance later, without making automatic Codex execution broad or default.

## Implemented

- Dispatcher can route `senior-coding-agent` to Codex Worker only when config and workorder gates pass.
- Default config remains disabled:
  - `codex_worker_enabled: false`
  - `allow_dispatcher_integration: false`
- `allowed_agents` is limited to `senior-coding-agent`.
- Workorders must opt in with `codex_worker: true` when `require_explicit_workorder_flag` is enabled.
- Workorders must include source refs, scoped files, blocked files, and expected outputs.
- Operator Doctor reports Codex Worker ready/disabled state.
- Batch dossier includes Codex Worker runtime report metadata when reports exist.

## Safety Rules

- No real Codex execute was run in this batch.
- Tests mock Codex Worker execution.
- Runtime reports under `system/reports/codex-worker/` remain ignored and uncommitted.
- Dispatcher integration must not route arbitrary agents to Codex.
- Supabase reset/push, migration execution, approvals, runtime-state edits, and queue edits remain forbidden.

## Follow-up

Tom may later decide whether to enable the config gate for one controlled `senior-coding-agent` workorder. Until then, the manual worker bridge remains the active execution path.
