# BATCH-GOVERNANCE-P1-001-batch-loader-cli

## Status
completed

## Purpose
Implement the missing Batch Loader CLI V1 so Markdown workorder batches can enter the existing `dispatchWorkorder` workflow without bypassing approval / preflight / audit.

This single-WO batch closes the gap identified in `Batch Loader Dispatch Path Inspection` (USE_LIBRARY_DISPATCH) and `BATCH_LOADER_CLI_V1.md` §1: there is currently no CLI entry point that loads a Markdown batch, validates the contained workorder drafts against `workorder.schema.json` and dispatches them in dependency order via `system/control-plane/dispatcher.ts` as a library — without going through `services/scheduler-api/`, the HTTP `POST /dispatch` endpoint, the `DispatchLoop`, the `SlotManager`, or Supabase persistence.

After this WO is implemented and approved, `BATCH-NUTRITION-P1-001-db-foundation` (currently `ready_for_approval`) can be tested through the official workflow path.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md` | `WO-governance-004` | governance-batch-loader-cli-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-004 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not use `services/scheduler-api/**` (no HTTP, no DispatchLoop, no SlotManager).
- Must not edit `system/approval/queue.json` directly.
- Must not edit `system/state/runtime_state.json` or `system/state/*.jsonl` directly.
- Must not execute DB migrations (`supabase db push --linked` / `supabase db reset` remain manual by Tom).
- Must implement `--dry-run` safely (no `dispatchWorkorder` calls in dry-run) before `--run` mode.
- Must call `dispatchWorkorder()` directly as library import from `system/control-plane/dispatcher.ts`.
- Must call `runPreflight()` before any dispatch (HOLD/REJECT abort).
- Must respect `blocked_by` topological order in `--run` mode.

---

## Expected Output

- `system/workorders/cli/run-batch.ts` — CLI entry point (argv parsing, mode dispatching, top-level output)
- `system/workorders/cli/batch-loader.ts` — pure logic (parse Markdown batch, extract YAML blocks, validate against schema, sort by dependencies, identify approval needs, run dry-run report, run dispatch sequence)
- `system/workorders/cli/README.md` — operator documentation referencing `docs/project/BATCH_LOADER_CLI_V1.md` as master spec

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

---

## Next Step After Approval

Run WO-governance-004 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` writes the three CLI files.
3. Review Pipeline V2 (Spark C → Spark D) reviews the implementation; `architecture` risk forces Spark D mandatory.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean
   - `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` shows the three Nutrition WOs with correct status, schema-validation result, dependency order, and approval-required flags for WO-nutrition-002 and WO-nutrition-003.
5. After successful `--dry-run` against the Nutrition batch: Tom can promote `BATCH-NUTRITION-P1-001-db-foundation` from `ready_for_approval` to actual approved execution, knowing the workflow path is operational.

---

## Validation Result

- `pnpm tsc --noEmit` — **PASS** (Exit 0)
- `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` — **PASS** (Exit 0)
- PreToolUse:Bash hook — **PASS** (no hook errors after pre-tool.ps1 PS-5.1 fix)
- `git status --short` before/after validation — clean (working tree unchanged)
- Dry-run output: 3 WOs schema-valide, topologische Order korrekt (001 → 002 → 003), Approval-Bedarf für WO-002/003 korrekt erkannt, kein Dispatch ausgeführt, Summary `overall: READY_TO_RUN`.

## Produced Files

- `system/workorders/cli/run-batch.ts`
- `system/workorders/cli/batch-loader.ts`
- `system/workorders/cli/README.md`

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- **Batch erzeugt keine Ausführung.** Reines Planungsdokument.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt.
- **Nicht in `BATCH-NUTRITION-P1-001-db-foundation` integriert**, da `governance-batch-loader-cli-v1` ein operativer Vorgänger ist und vor dem Nutrition-Batch produktiv sein muss.

---

*Batch-Plan erzeugt: 2026-05-02 — gemäß `WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md` (Draft), `REVIEW-WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md` (Verdict: PASS, Batch Readiness: Ready) und `BATCH_LOADER_CLI_V1.md` §11.*
