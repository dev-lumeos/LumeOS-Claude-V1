# Governance Batch 009 - Codex Worker Bridge

Date: 2026-05-09

## Purpose

Add a controlled bridge from governance workorders to non-interactive Codex CLI execution so `senior-coding-agent` can eventually be invoked without Tom manually copying prompts.

## Files Created / Updated

- `system/workers/codex-worker.ts`
- `system/workers/codex-worker.config.json`
- `system/workers/__tests__/codex-worker.test.ts`
- `docs/project/CODEX_WORKER_BRIDGE.md`
- `docs/project/MODEL_RUNTIME_HARDENING.md`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `system/memory/canonical/lumeos_canonical.md`

## Safety Rules

- Dry-run is default.
- `--execute` is required before Codex is called.
- Tests mock Codex execution and never call Codex.
- Dispatcher auto-integration is deferred.
- `codex_worker_enabled` remains `false`.
- Generated worker reports are runtime artifacts under `system/reports/codex-worker/` and should not be committed by default.

## Durable Rule

Codex worker execution must be explicit, constrained by workorder scope, and recorded. Codex CLI must not be treated as a vLLM endpoint and must not bypass approvals, source-chain checks, product gates, or forbidden command rules.

## Regression Tests

- `system/workers/__tests__/codex-worker.test.ts`

Covered behaviors:

- dry-run does not call Codex
- prompt contains scope, blocked files, and forbidden commands
- invalid paths fail
- execute/resume command construction is mock-tested
- final state parsing is stable
- runtime reports are not written during default dry-run

## Product Work Gate

Product work remains blocked unless Tom explicitly opens it. This batch adds worker infrastructure only; it does not execute product batches, Supabase commands, migrations, imports, or approvals.

## Next Integration Step

Decide whether and when to enable dispatcher/operator use of the Codex Worker Bridge for `senior-coding-agent` workorders.
