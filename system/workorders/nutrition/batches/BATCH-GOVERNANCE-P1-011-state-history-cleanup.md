# BATCH-GOVERNANCE-P1-011-state-history-cleanup

## Status
completed

## Purpose
Add safe operator tooling for historical stuck-dispatched active_workorders, without weakening normal protection for live dispatched/running workorders.

This single-WO batch closes the last remaining operator-tooling gap surfaced by the Nutrition Batch 001 Final Workflow Test after WO-GOVERNANCE-P1-014 closure (commit `b681402`):

- `pnpm tsc --noEmit` PASS, `smoke-test.ts` 9/9 PASS, `dispatcher-fail-cleanup.test.ts` 32/32 PASS.
- Dry-run READY_TO_RUN.
- `WO-nutrition-001 [dispatched] Dispatcher status: completed` — Lock-Release on `cleanupHandled = true`-Pfaden funktioniert (WO-014).
- `WO-nutrition-002 [preflight_blocked] Preflight HOLD` — weiterhin, nicht mehr durch Lock-Leak, sondern durch akkumulierte historische `dispatched`-Einträge in `active_workorders` (4× WO-nutrition-001 mit `status: dispatched` aus früheren Workflow-Test-Iterationen).
- WO-010 Terminal-WO-Reset-CLI deckt `failed|done` ab, schützt aber bewusst `dispatched`-Einträge — was in diesem Fall den Cleanup blockiert.

WO-governance-015 ergänzt einen separaten, evidence-gated Sub-Command `clear-stale-dispatched` zur existierenden CLI, der nur historisch-stale `dispatched`-Einträge mit nachweislich nicht-laufendem `active_run` bereinigen kann. Das WO-010-`clear`-Default-Verhalten (`failed|done`-only) bleibt 1:1 unangetastet. Audit-Event-String differenziert (`'stale_dispatched_workorder_cleanup'` vs. `'terminal_workorder_reset'`).

Nach Closure dieser WO erreicht `BATCH-NUTRITION-P1-001` `--run` (nach Operator-Cleanup der 4 stale `dispatched`- und 2 `failed`-Einträge) WO-nutrition-002 → erwartete Pause am `db-migration`-Approval-Gate (Tom-Approval erforderlich). Damit ist die Operator-State-Tooling-Pipeline vollständig.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-015-state-history-cleanup.md` | `WO-governance-015` | governance-state-history-cleanup-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-015 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not weaken existing WO-010 `failed|done` clear behavior.
- Must not clear normal live `dispatched`/`running` entries.
- Must require exact `<workorder_id>` + `--run-id <run_id>`.
- Must require stale evidence (one of: `active_run_terminal`, `no_active_run_and_age` with default 60-min threshold, `operator_threshold` with explicit `--older-than-minutes <N>`).
- Must verify evidence inside `removeStaleDispatchedActiveWorkorder` against current state (not only against CLI-declared kind).
- Must require explicit `--confirm` for mutation; default of `clear-stale-dispatched` ohne Flag = `--dry-run` (sicher).
- Must refuse if `active_runs` shows `'running'` or `'awaiting_approval'` for the same `run_id`.
- Must refuse ambiguous matches.
- Must refuse no matches with Exit 2.
- Must not directly edit `runtime_state.json` — alle Mutationen über `state-manager.ts` `mutate()`-Lock.
- Must not directly edit JSONL audit logs (`audit.jsonl`, `audit.error.jsonl`, `pipeline-audit.jsonl`, `pipeline-audit-live.jsonl`) — Audit ausschließlich über `audit-writer.ts`.
- Must not touch `scope_locks` (no acquire/release).
- Must not clear `system_stop`.
- Must not edit approval queue (`system/approval/**`).
- Must not mutate `active_runs` (read-only Lookup via `getActiveRunByRunId`).
- Must not execute Workorders (kein `dispatchWorkorder`-Aufruf, kein `run-batch`-Aufruf).
- Must not execute migrations.
- Must not execute Supabase commands.
- Must not change `dispatcher.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`.
- Must not modify `batch-loader.ts` oder `system/workorders/cli/**`.
- Must not modify `services/scheduler-api/**`.
- Must not modify `system/workorders/schemas/workorder.schema.json`.
- Must not add `--force` / `--all` / `--bypass` / `--skip-validator` flags.
- Must not allow wildcard cleanup or broad cleanup.
- Must not change existing `state-manager` function signatures or behavior (additive helpers only).
- Must not change existing `audit-writer` convenience functions (additive only).
- Must not modify `package.json` und keine neuen npm-Dependencies.
- Must not use `child_process.exec`/`spawn` im CLI-Body.

---

## Expected Output

- Terminal-WO-Reset-CLI erhält neuen Sub-Command `clear-stale-dispatched <workorder_id> --run-id <run_id> [--older-than-minutes <N>] [--dry-run | --confirm]`.
- Existing `clear` Sub-Command bleibt 1:1 unverändert (`failed|done`-only).
- `state-manager.ts` erhält zwei additive Helper: `getActiveRunByRunId(runId)` (read-only Lookup) und `removeStaleDispatchedActiveWorkorder(workorderId, runId, evidence)` (atomic, evidence-gated, nur `active_workorders`-Mutation).
- `audit-writer.ts` `EventType`-Union additiv um `'stale_dispatched_workorder_cleanup'` erweitert; neue Convenience-Funktion `auditStaleDispatchedWorkorderCleanup`.
- Dry-run zeigt Stale-Evidence mit Vorschau ("would remove 1 stale-dispatched entry: evidence=<kind>, age=<m>min, active_run=<status_or_none>") und mutiert nichts.
- Confirm entfernt genau einen stale-dispatched Eintrag nur bei exaktem `<workorder_id>` + `--run-id` und erfüllter Evidence.
- Normal live `dispatched`/`running`-Einträge werden mit Exit 1 abgewiesen (Reason "active run still running" oder "evidence insufficient").
- Audit-Event-String `'stale_dispatched_workorder_cleanup'` differenziert eindeutig von `'terminal_workorder_reset'` (WO-010) im Forensic-Trail.
- Tests in `system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` decken mindestens 22 Szenarien ab (existing WO-010-Tests bleiben grün, additive WO-015-Tests inkl. State-Manager-Helper, CLI-Sub-Command, Refusal-Pfade, Evidence-Varianten, Audit-Differenzierung).
- `pnpm tsc --noEmit` PASS.
- `npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` → all PASS.
- Batch dry-run (`run-batch.ts BATCH-NUTRITION-P1-001-db-foundation.md --dry-run`) bleibt READY_TO_RUN.
- `runtime_state.json` bleibt valid JSON.

---

## First Intended Operator Use After Closure

After implementation and review, Tom may inspect and, if dry-run confirms safety, clean historical stuck-dispatched entries for:

- `WO-nutrition-001 / RUN-20260502-6627` (dispatched_at 2026-05-02T09:35:46.646Z)
- `WO-nutrition-001 / RUN-20260503-8238` (dispatched_at 2026-05-03T04:35:18.255Z)
- `WO-nutrition-001 / RUN-20260503-1044` (dispatched_at 2026-05-03T09:35:41.062Z)
- `WO-nutrition-001 / RUN-20260503-8969` (dispatched_at 2026-05-03T10:18:38.988Z)

Zusätzlich für die zwei verbleibenden `failed`-Einträge (per existierendem WO-010 `clear` clearable, NICHT durch WO-015):

- `WO-nutrition-001 / RUN-20260503-7133` (status `failed`)
- `WO-nutrition-001 / RUN-20260503-6009` (status `failed`)

The exact commands must be taken from the implemented CLI help/output (`npx tsx system/control-plane/terminal-wo-reset-cli.ts` ohne Argumente zeigt aktuelle Sub-Command-Liste). Do not assume command syntax beyond the WO. Operator-Sequenz für jeden Eintrag: zuerst `--dry-run`-Vorschau, dann `--confirm` mit Audit-Event.

---

## Next Step After Approval

Run WO-governance-015 through the normal implementation workflow:

1. **APPROVED ARCHITECTURE EXECUTION** prompt (Senior-Coding-Agent / Spark-D-Mandatory-Review per `architecture` Risk-Tier).
2. Implementation in den 4 `scope_files`: `terminal-wo-reset-cli.ts`, `state-manager.ts`, `audit-writer.ts`, `terminal-wo-reset-cli.test.ts`.
3. Validation-Commands aus WO-Yaml ausführen (tsc, test, show, dry-run, batch-dry-run).
4. Implementation Review (Spark-D / Senior-Reviewer) — Verdict erwartet PASS.
5. Code-Commit (separater Doku-Commit für Closure-Markdown danach).
6. Closure-Doku in WO-015 + BATCH-011 ergänzen analog zur WO-014-Closure-Sequenz (`docs(workorders): close state history cleanup workorder`).
7. Optional: Workflow-Test-Snapshot in BATCH-NUTRITION-P1-001-db-foundation.md ergänzen, sobald WO-015 + Operator-Cleanup-Sequenz live verifiziert sind.

---

*Batch-Plan erzeugt: 2026-05-03 — gemäß `WO-GOVERNANCE-P1-015-state-history-cleanup.md` (Draft) und `REVIEW-WO-GOVERNANCE-P1-015-state-history-cleanup.md` (Verdict: PASS, zwei LOW-Findings nicht-blockierend), `BATCH-GOVERNANCE-P1-010-finally-lock-release-on-non-terminal-paths.md` als Pattern-Vorlage.*

---

## Validation Result

- `pnpm tsc --noEmit` → PASS
- `npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` → 65/65 PASS (32 bestehende WO-010 + 33 neue WO-015)
- `npx tsx system/control-plane/terminal-wo-reset-cli.ts show WO-nutrition-001` → PASS (Exit 0, listet die 6 Live-Einträge)
- `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` → READY_TO_RUN
- Implementation Review (Spark-D / Senior-Reviewer) → PASS (Scope Compliance PASS, Safety Review PASS)
- Code commit: `35f9713` (`feat(governance): add stale dispatched workorder cleanup`)
- LOW-Finding noted: audit-on-confirm may occur before state-manager refusal in race cases (audit-before-mutation pattern, identisch zur WO-010-Vorlage). Non-blocking; kein Sicherheits- oder Scope-Impact, nur potentielles Forensic-Rauschen bei Race-Refusal. Adressierbar als kleiner Followup-Commit oder gemeinsam mit einer WO-010-Audit-Migration.

*Completed: 2026-05-03.*
