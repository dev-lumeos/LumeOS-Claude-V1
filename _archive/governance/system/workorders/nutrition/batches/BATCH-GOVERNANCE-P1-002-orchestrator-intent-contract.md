# BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract

## Status
ready_for_approval

## Purpose
Fix the OrchestratorIntent / Governance Validator contract so dispatch runs cannot fail with `selected_agent: undefined`.

This single-WO batch closes the gap identified in the workflow test of `BATCH-NUTRITION-P1-001-db-foundation`: every `--run` reaches the dispatcher, calls the model, but breaks at `validateOrchestratorIntent()` because the model-generated `OrchestratorIntent` does not reliably include `selected_agent`, and `workorder.agent_id` is not propagated automatically into `intent.selected_agent`. The Governance Validator returns `REWRITE`, the dispatcher retries 2× per `MAX_REWRITE_LOOPS`, then `FAIL`s with:

```
Governance: REWRITE-Limit (2) erreicht.
Letzte Verletzung: Unbekannter Agent: undefined
```

The fix sits **before** the validator (normalization layer between WO-metadata and model-output), keeps the validator strict, and uses a hardcoded-map only in V1. After this WO is implemented and approved, `BATCH-NUTRITION-P1-001-db-foundation` (currently `ready_for_approval`) can finally pass the validator stage and pause cleanly at the `db-migration` HUMAN_NEEDED gate for `WO-nutrition-002`.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md` | `WO-governance-005` | governance-orchestrator-intent-contract-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-005 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not disable governance-validator.
- Must not increase `MAX_REWRITE_LOOPS` as a fix.
- Must not bypass `selected_agent` validation.
- Must not introduce a `--force` / `--skip-validator` / `--bypass` flag.
- Must not modify `batch-loader.ts`.
- Must not edit `runtime_state.json` or `approval queue`.
- Must not touch `services/scheduler-api`.
- Must not extend `agents.json` in V1 (Phase 2 / separate WO).
- Must not create a new mapping file (`agent-validator-map.json/.ts`) in V1 (Phase 2).
- Must not modify `orchestrator_main_prompt.md` in V1 (Phase 2 — Variant B).
- Must write audit events only via `system/state/audit-writer.ts` — no direct JSONL editing.

---

## Expected Output

- `dispatcher.ts` and/or `governance-validator.ts` contain a `normalizeOrchestratorIntent(intent, workorder)` step run between `parseOrchestratorIntent()` and `validateOrchestratorIntent()`.
- The normalization step uses a hardcoded `mapAgentToValidatorTarget` table (TypeScript const inside the existing files — no new files in V1):
  - docs/read-only WOs (`docs-agent`, `test-agent`, `i18n-agent`, `mealcam-agent`, `context-builder`, `governance-compiler`, `senior-coding-agent`, `micro-executor`) → `micro-executor`
  - `db-migration-agent` → `db-migration-agent`
  - `security-specialist` → `security-specialist`
  - `review-agent` → `review-agent`
- `intent.selected_agent` cannot be `undefined` after normalization; if neither model nor map yields a valid agent, a clear error surfaces and the validator returns `REWRITE`/`FAIL` as before.
- Validator strictness preserved (`validateOrchestratorIntent()` unchanged, `ALLOWED_AGENTS` unchanged in V1).
- Inline tests in `system/control-plane/__tests__/` cover the mapping logic.
- TypeScript compiles cleanly (`pnpm tsc --noEmit`).
- Nutrition Batch 001 dry-run still passes.
- Nutrition Batch 001 `--run` no longer fails with `"Unbekannter Agent: undefined"`; instead it pauses at `WO-nutrition-002` HUMAN_NEEDED gate (db-migration approval required) — that is the correct expected behavior.

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

Run WO-governance-005 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds the normalization step + hardcoded map + inline tests.
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` returns Exit 0.
   - `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --run` no longer fails at `Unbekannter Agent: undefined`. WO-nutrition-001 dispatches; WO-nutrition-002 either pauses at HUMAN_NEEDED gate (correct) or runs through `defaultExecuteTool` if the audit produces no scope-conflicts.
5. Followup workorder candidates (not part of this batch):
   - **Cleanup of `WO-NUTRITION-P1-001` Bootstrap-Workaround:** restore `agent_id: docs-agent` (from current bootstrap `micro-executor`), remove the bootstrap note. Risk: `standard` or `docs`. The mapping layer from this WO ensures `docs-agent` resolves correctly.
   - **Phase-2 mapping-source extension:** `agents.json[validator_target_agent]` field OR separate `agent-validator-map.json/.ts`. Risk: `architecture`.
   - **Phase-2 Variant B:** orchestrator prompt reform. Risk: `architecture`.
   - **Phase-2 Variant C:** `ALLOWED_AGENTS` sync. Risk: `architecture` (only meaningful with Variant B).

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- Reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch durch diese Datei.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt mit anderen offenen Batches (`BATCH-NUTRITION-P1-001-db-foundation` ist `ready_for_approval` aber operativ blockiert bis dieser WO durchgelaufen ist).
- **Vorgänger:** `BATCH-GOVERNANCE-P1-001-batch-loader-cli` (Status: `completed`) — der Batch-Loader CLI ist die Voraussetzung um diese WO überhaupt regulär durchzuführen.
- **Nicht in `BATCH-NUTRITION-P1-001-db-foundation` integriert**, da `governance-005` operativer Vorgänger für den End-to-End-Run des Nutrition-Batches ist.

---

*Batch-Plan erzeugt: 2026-05-02 — gemäß `WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md` (Draft, nach Fix-Pass), `REVIEW-WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md` (Verdict: PASS_WITH_FIXES → Pflicht-Fix umgesetzt) und `BATCH-GOVERNANCE-P1-001-batch-loader-cli.md` (Pattern-Vorlage).*
