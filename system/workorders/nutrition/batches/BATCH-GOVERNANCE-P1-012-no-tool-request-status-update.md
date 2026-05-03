# BATCH-GOVERNANCE-P1-012-no-tool-request-status-update

## Status
completed

## Purpose
Mark no-tool-request completed workorders as `done` in `active_workorders` so `blocked_by` dependencies can progress.

This single-WO batch closes die letzte verbleibende Live-State-Lücke nach Closure von WO-005…015 (commits `b681402`, `35f9713`) und vollständigem Operator-Cleanup der historischen WO-nutrition-001-Einträge:

- `pnpm tsc --noEmit` PASS, `smoke-test.ts` 9/9 PASS, `dispatcher-fail-cleanup.test.ts` 32/32 PASS, `terminal-wo-reset-cli.test.ts` 65/65 PASS.
- Dry-run READY_TO_RUN.
- `WO-nutrition-001 [dispatched] Dispatcher status: completed` — Lock-Release durch WO-014, kein historischer Lock-Leak mehr.
- `WO-nutrition-002 [preflight_blocked] Preflight HOLD` — neuer Trigger: der frische `RUN-20260503-4291`-Eintrag bleibt mit `status: dispatched` zurück, weil der no-tool-request completed-Pfad (`dispatcher.ts:530-544`) `active_runs` auf `completed` setzt und Locks freigibt, aber `active_workorders.status` nicht auf `'done'` aktualisiert.

WO-governance-016 ergänzt im no-tool-request completed-Branch direkt zwischen `state.endRun(runId, 'completed')` und `state.releaseScopeLock(runId)` einen einzigen zusätzlichen Aufruf:

```ts
await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'done')
```

Architekturentscheidung: **Option A** — symmetrische Komplettierung zu WO-014 (Lock-Release auf cleanupHandled-Pfaden). Nicht **Option B** (Preflight-Toleranz für `dispatched` mit terminalem `active_run`) — Preflight bleibt strict, blocked_by-Resolution bleibt unverändert. `updateActiveWorkorderStatusByRun` ist run-id-spezifisch (WO-011 Pattern, vorhanden in `state-manager.ts:581`), Transition `dispatched → done` ist in `WO_TRANSITIONS` bereits erlaubt (`state-manager.ts:266`). Keine State-Manager-Änderung, kein neuer Audit-Event, kein neuer Helper. WO-006 cleanupHandled-Semantik bleibt 1:1, WO-011 catch-Block bleibt 1:1, WO-014 Lock-Release-Reihenfolge bleibt 1:1. WO-010/015 Operator-CLI bleibt 1:1.

Nach Closure dieser WO erreicht `BATCH-NUTRITION-P1-001` `--run` den Folge-WO-nutrition-002 sauber, weil `blocked_by: ['WO-nutrition-001']` durch den frisch als `done` markierten Eintrag erfüllt wird. Erwarteter nächster Halt: db-migration-Approval-Gate für WO-nutrition-002 mit pending Approval-Queue-Eintrag.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-016-no-tool-request-status-update.md` | `WO-governance-016` | governance-no-tool-request-status-update-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-016 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not change Preflight `blocked_by` logic (Option B explicitly rejected).
- Must not change `scheduler-preflight.ts`.
- Must not change `state-manager.ts` (`updateActiveWorkorderStatusByRun` already exists from WO-011 — only call it).
- Must not change `audit-writer.ts` (no new EventType, no new convenience function).
- Must not change `governance-validator.ts`.
- Must not change `review-pipeline.ts`.
- Must not change `terminal-wo-reset-cli.ts` (WO-010/015 paths bleiben 1:1).
- Must not change `risk-categories.ts`.
- Must not modify `batch-loader.ts` oder `system/workorders/cli/**`.
- Must not modify `services/scheduler-api/**`.
- Must not modify `system/workorders/schemas/workorder.schema.json`.
- Must not bypass Preflight.
- Must not bypass Governance Validator.
- Must not increase `MAX_REWRITE_LOOPS` (bleibt 2).
- Must not change `awaiting_approval` / `review` / `human-needed` status behavior — these paths bleiben 1:1.
- Must preserve WO-006 fail cleanup (catch-Block + finally-Block bleiben 1:1).
- Must preserve WO-011 run-id status updates (catch-Block + andere `updateActiveWorkorderStatusByRun`-Aufrufe bleiben 1:1).
- Must preserve WO-014 lock release (Reihenfolge: `endRun` → `updateActiveWorkorderStatusByRun` → `releaseScopeLock` → `releaseDbMigrationLock` → `auditScopeLockReleased` → `cleanupHandled = true` → `auditJobCompleted` → `return`).
- Must preserve WO-006 `cleanupHandled`-Flag-Semantik ("kein finally-`failed`-Status-Override").
- Must preserve `WO_TRANSITIONS` table (`dispatched → done` bereits erlaubt — keine Änderung).
- Must not edit `runtime_state.json` directly — alle Mutations über `state-manager.ts` `mutate()`-Lock.
- Must not edit JSONL audit logs directly (`audit.jsonl`, `audit.error.jsonl`, `pipeline-audit.jsonl`, `pipeline-audit-live.jsonl`) — Audit ausschließlich über `audit-writer.ts`.
- Must not execute Workorders (kein `dispatchWorkorder`-Aufruf, kein `run-batch --run`).
- Must not execute migrations.
- Must not execute Supabase commands.
- Must not edit approval queue (`system/approval/**`).
- Must not introduce `--force` / `--all` / `--bypass` / `--skip-validator` flags (keine CLI-Änderung in dieser WO).
- Must not introduce new npm dependencies; `package.json` unverändert.
- Must not wrap the new `updateActiveWorkorderStatusByRun`-Aufruf in try/catch (function ist no-op-safe per WO-011-Vorlage).

---

## Expected Output

- `dispatcher.ts:530-544` no-tool-request completed-Branch setzt jetzt `active_workorders.status` auf `'done'` via `state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'done')` direkt nach `state.endRun(runId, 'completed')` und vor `state.releaseScopeLock(runId)`.
- `active_runs.status` bleibt `'completed'` (unverändert).
- WO-014 Scope-Lock-Release läuft weiter wie bisher (Reihenfolge unverändert nach Insertion des Status-Updates).
- WO-014 DB-Migration-Lock-Release-Verhalten bleibt intakt.
- Dependent Workorders mit `blocked_by: ['<wo-id>']` können den Constraint resolven, sobald die WO via no-tool-request completed läuft.
- `awaiting_approval`-Pfad bleibt `awaiting_approval` (unverändert).
- `review`-Pfad bleibt `review` (unverändert).
- `human-needed`-Pfad bleibt `awaiting_approval` (unverändert).
- FAIL-Pfade aus WO-006/WO-011 bleiben intakt (catch-Block + finally-Block + run-id-spezifischer Status-Update auf `'failed'`).
- Success-Pfad mit Tool-Request bleibt unverändert (Zeile ~786 setzt bereits `'done'`).
- `dispatcher-fail-cleanup.test.ts` aktualisiert: 2 bestehende Tests (Test 9 "Erfolgsfall (no-tool-request)" + Test 29 "WO-014 E-1") prüfen zusätzlich `assert.equal(woEntry?.status, 'done')`; 1 neuer additiver Test "WO-016: no-tool-request completed → status done + locks released". Test-Run: alle PASS (32 bestehende inkl. 2 angepasst + 1 neu = 33).
- `smoke-test.ts` bleibt 9/9 PASS (Test 6 nutzt Tool-Request-Pfad und ist nicht betroffen; falls doch ein Test no-tool-request-Status assertiert, analog auf `'done'` aktualisieren).
- `terminal-wo-reset-cli.test.ts` bleibt 65/65 PASS (read-only Regressions-Check; keine Code-Datei in scope).
- `pnpm tsc --noEmit` PASS.
- Nutrition Batch 001 `--dry-run` bleibt READY_TO_RUN.
- Nutrition Batch 001 kann nach Closure und Tom-initiiertem `--run` WO-nutrition-002 erreichen → erwartete Pause am `db-migration`-Approval-Gate.

---

## Next Step After Approval

Run WO-governance-016 through the normal implementation workflow:

1. **APPROVED ARCHITECTURE EXECUTION** prompt (Senior-Coding-Agent / Spark-D-Mandatory-Review per `architecture` Risk-Tier).
2. Implementation in den 3 `scope_files`: `dispatcher.ts` (1 await-Aufruf + Inline-Kommentar), `dispatcher-fail-cleanup.test.ts` (2 Test-Updates + 1 neuer Test), `smoke-test.ts` (read-only verifizieren; Edit nur falls nötig).
3. Validation-Commands aus WO-Yaml ausführen (tsc, dispatcher-fail-cleanup-Test, smoke-test, terminal-wo-reset-cli-Test als Regression, batch-dry-run).
4. Implementation Review (Spark-D / Senior-Reviewer) — Verdict erwartet PASS.
5. Code-Commit `fix(governance): mark active workorder done on no-tool-request completed path` (separater Doku-Commit für Closure-Markdown danach).
6. Closure-Doku in WO-016 + BATCH-012 ergänzen analog zur WO-015-Closure-Sequenz (`docs(workorders): close no-tool-request status update workorder`).
7. Anschließend Live-Workflow-Test-Re-Run von `BATCH-NUTRITION-P1-001 --run` zur empirischen Verifikation, dass WO-nutrition-002 den `db-migration`-Approval-Gate erreicht (Approval Queue zeigt 1 Pending Approval; Tom granted manuell oder lehnt ab).

---

*Batch-Plan erzeugt: 2026-05-03 — gemäß `WO-GOVERNANCE-P1-016-no-tool-request-status-update.md` (Draft) und `REVIEW-WO-GOVERNANCE-P1-016-no-tool-request-status-update.md` (Verdict: PASS, zwei LOW-Findings nicht-blockierend), `BATCH-GOVERNANCE-P1-010-finally-lock-release-on-non-terminal-paths.md` und `BATCH-GOVERNANCE-P1-011-state-history-cleanup.md` als Pattern-Vorlagen.*

---

## Validation Result

- `pnpm tsc --noEmit` → PASS
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → 34/34 PASS (32 vorher + 2 neue WO-016)
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS
- `npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` → 65/65 PASS (Regressions-Check)
- `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` → READY_TO_RUN
- Implementation Review (Spark-D / Senior-Reviewer) → PASS (Scope Compliance PASS, Safety Review PASS)
- Code commit: `10c3ac6` (`fix(governance): mark no-tool workorders done`)

*Completed: 2026-05-03.*
