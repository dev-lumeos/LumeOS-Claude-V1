# BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup

## Status
ready_for_approval

## Purpose
Fix dispatcher failure cleanup so failed runs do not leave stale scope locks or `active_workorders` entries that block later workflow tests.

This single-WO batch closes the cleanup gap identified across multiple workflow tests of `BATCH-NUTRITION-P1-001-db-foundation`: every failed `--run` (callModel-Bug, Governance-Validator FAIL, etc.) leaves stale entries in `system/state/runtime_state.json` — both `active_workorders` (status `dispatched` or `running`) and `scope_locks` with active 10-minute TTL. The `releaseScopeLock()` and `releaseDbMigrationLock()` calls are not invoked on all failure paths in `dispatcher.ts`, only on the success path and the outer catch-block. As a consequence, each failed run requires either manual `runtime_state.json` cleanup (Tom-approved State-Cleanup-Agent) or 10-minute TTL waiting before the next `--run` can proceed.

WO-governance-006 implements defensive cleanup (Try/Finally Default, alternatives Cleanup-Helper or State-Manager-Hook) so every dispatcher FAIL/EXCEPTION path reliably releases acquired locks and sets `active_workorders.status` to a terminal value before returning. Validator strictness preserved, no bypass, no `--force` flag.

After this WO is implemented and approved, `BATCH-NUTRITION-P1-001-db-foundation` workflow tests can be re-run repeatedly without manual State-Cleanup between attempts.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md` | `WO-governance-006` | governance-dispatcher-fail-cleanup-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-006 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not bypass Preflight.
- Must not bypass Governance Validator.
- Must not increase `MAX_REWRITE_LOOPS`.
- Must not edit `runtime_state.json` directly.
- Must not edit audit JSONL logs (`pipeline-audit.jsonl`, `audit.jsonl`, `audit.error.jsonl`) directly.
- Must not modify `batch-loader.ts`.
- Must not touch `services/scheduler-api/**`.
- Must not add `--force` / `--skip-cleanup` / `--bypass` flags.
- Must not delete audit history.
- Must not change `releaseScopeLock` / `releaseDbMigrationLock` behavior in `state-manager.ts` (idempotency must be preserved — comments only).
- Must not modify `governance-validator.ts` (separate WO-005).
- Must not modify `scheduler-preflight.ts` (read-only context).
- Must write audit events only via `system/state/audit-writer.ts`.

---

## Expected Output

- `dispatcher.ts` ensures `releaseScopeLock(runId)` is invoked on every failure path after `acquireScopeLock()` (try/finally or equivalent).
- `dispatcher.ts` ensures `releaseDbMigrationLock(runId)` is invoked on every failure path after `acquireDbMigrationLock()`.
- `dispatcher.ts` updates `active_workorders.status` to `failed` before return on every FAIL path (so it does not remain indefinitely in `dispatched`/`running`).
- Each FAIL path writes an audit event via `audit-writer.ts` (`auditJobFailed`, `writeAuditEvent`, or specific event).
- Successful path behavior unchanged — existing dispatcher and smoke tests pass without modification.
- New tests in `system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` cover at least 5 FAIL paths (Validator FAIL, Validator BLOCKED, Tool-Auth Block, Files-Scope-Violation, Approval-Gate Block) and verify lock release.
- After a failed Nutrition Batch 001 `--run`, no new stale `scope_lock` remains in `runtime_state.json` — no manual State-Cleanup needed.
- `pnpm tsc --noEmit` clean.
- `npx tsx --test system/control-plane/__tests__/` and `npx tsx --test system/state/__tests__/` all green.

---

## Lifecycle Path

Per `system/workorders/lifecycle/wo_lifecycle_v1.md`:

```
wo_generated → graph_validated → queue_released
  → ready (no blocked_by)
  → dispatched → running
  → done
  → reviewed (architecture review + Spark D mandatory)
  → closed
```

Auto-Retry **disabled** for `architecture` per `CLAUDE.md` High-Risk-Regel.

---

## Next Step After Approval

Run WO-governance-006 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds Try/Finally cleanup wrappers + new tests in `system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts`.
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx --test system/control-plane/__tests__/` all green (including new dispatcher-fail-cleanup tests).
   - `npx tsx --test system/state/__tests__/` all green.
   - `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` returns Exit 0.
   - `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --run` — verifies that even if the run fails (e.g. at `risk_level: undefined` validator stage), no new stale `scope_lock` is left in `runtime_state.json`.
5. Followup workorder candidates (not part of this batch):
   - **`risk_level`-Normalisierung** — future OrchestratorIntent field-normalization WO, analoges Pattern zu WO-005. Risk: `architecture`. Erst sinnvoll, wenn diese WO closed ist (sonst hinterlässt jeder Test-Run wieder stale Locks).
   - **Cleanup of `WO-NUTRITION-P1-001` Bootstrap-Workaround:** restore `agent_id: docs-agent`, remove the bootstrap note. Risk: `standard` or `docs`. Voraussetzung: WO-005 closed (Mapping-Layer aktiv).
   - **Phase-2-Erweiterungen** für WO-005 (validator_target_agent in agents.json oder separate map file). Risk: `architecture`.

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- Reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch durch diese Datei.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt mit anderen offenen Batches.
- **Vorgänger-Batches:**
  - `BATCH-GOVERNANCE-P1-001-batch-loader-cli` (Status: `completed`) — Batch-Loader CLI als Workflow-Eintrittspunkt.
  - `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` (Status: implementiert via `WO-governance-005`) — `selected_agent`-Normalisierung, beseitigt den ursprünglichen `Unbekannter Agent: undefined`-FAIL.
- **Verhältnis zu `BATCH-GOVERNANCE-P1-002`:** Komplementär. WO-005 fixt die Pipeline-FAIL-Vermeidung (selected_agent), WO-006 fixt die FAIL-Folge-Cleanup. Beide WOs zusammen entkoppeln den Bootstrap-Workflow von manuellem State-Cleanup zwischen Test-Runs.
- **Nicht in `BATCH-NUTRITION-P1-001-db-foundation` integriert**, da WO-006 operativer Vorgänger für wiederholbare End-to-End-Test-Runs ist.

---

*Batch-Plan erzeugt: 2026-05-02 — gemäß `WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md` (Draft, nach Fix-Pass), `REVIEW-WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md` (Verdict: PASS_WITH_FIXES → Pflicht-Fix umgesetzt) und `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract.md` (Pattern-Vorlage).*
