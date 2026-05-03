# BATCH-GOVERNANCE-P1-010-finally-lock-release-on-non-terminal-paths

## Status
ready_for_approval

## Purpose
Release acquired locks on intentional non-terminal/completed paths so later workorders can pass Preflight without stale lock conflicts.

This single-WO batch closes den letzten beobachteten Workflow-Reibungspunkt nach Closure von WO-005/006/007/008/009/010/011/012/013: `BATCH-NUTRITION-P1-001-db-foundation` `--run` produziert erstmals `WO-nutrition-001 [dispatched] Dispatcher status: completed`, aber `WO-nutrition-002 [preflight_blocked] Preflight HOLD` — der nachfolgende WO wird vom Preflight gehalten wegen stale Scope-Lock aus dem completed-no-tool-request-Pfad von WO-001.

**Root-Cause (per Code-Inspektion verifiziert via grep):** 4 Pfade in `dispatcher.ts` setzen `cleanupHandled = true` ohne pre-existing Lock-Release-Aufrufe vor Return:
- Zeile 531-536: no-tool-request completed (`endRun(... 'completed')` + `cleanupHandled = true`, KEIN `releaseScopeLock`)
- Zeile 575-577: approval-gate awaiting_approval (`updateActiveWorkorderStatusByRun(... 'awaiting_approval')` + `endRun(... 'awaiting_approval')` + `cleanupHandled = true`, KEIN `releaseScopeLock`)
- Zeile 687-689: review-pipeline review-rewrite (`endRun(... 'failed')` + `updateActiveWorkorderStatusByRun(... 'review')` + `cleanupHandled = true`, KEIN `releaseScopeLock`)
- Zeile 714-716: review-pipeline human-needed (`endRun(... 'blocked')` + `updateActiveWorkorderStatusByRun(... 'awaiting_approval')` + `cleanupHandled = true`, KEIN `releaseScopeLock`)

WO-006 finally-Block (Zeile 789-790) ist mit `if (!cleanupHandled)` gegated → bei `cleanupHandled = true` läuft er NICHT → Locks bleiben bis TTL-Expiry (10 Min) reserviert. Asymmetrie zwischen FAIL-Pfaden (WO-006 löst, finally-Block wirkt) und intentional-non-terminalen Pfaden (Lock-Leak).

WO-governance-014 ergänzt vor jedem `cleanupHandled = true` auf den 4 Pfaden:
```ts
await state.releaseScopeLock(runId)
await state.releaseDbMigrationLock(runId)
audit.auditScopeLockReleased({
  run_id: runId, workorder_id: wo.workorder_id, agent_id: wo.agent_id,
  orchestration_mode: orchestrationMode,
  reason: '<pfad-spezifisch>'
})
```

`releaseScopeLock`/`releaseDbMigrationLock` sind in `state-manager.ts` bereits idempotent (multi-call-safe); Doppel-Release zwischen WO-014-Stelle und finally-Edge-Case ist sicher. `cleanupHandled = true` Semantik bleibt unverändert (flag = "kein finally-`failed`-Status-Override"); WO-006 finally-Block bleibt 1:1 gated für Defense-in-Depth gegen unerwartete Throws. WO-011 Run-id-spezifischer Status-Update bleibt 1:1 (alle 4 Pfade nutzen weiterhin `updateActiveWorkorderStatusByRun`). WO-012 Array-Defensive + WO-013 Contract-Prompt + REWRITE-Hint alle unangetastet.

Nach Closure dieser WO erreicht `BATCH-NUTRITION-P1-001` `--run` den Folge-WO-nutrition-002 ohne Preflight-HOLD durch stale Lock — der nächste Schritt ist entweder erfolgreicher Dispatch oder Pause am `db-migration`-Approval-Gate. Damit ist die Validator/Dispatcher/State/Lock/Operator-Tooling-Pipeline für die Bootstrap-Test-Sequenz vollständig glatt.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md` | `WO-governance-014` | governance-finally-lock-release-on-non-terminal-paths-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-014 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not bypass Preflight.
- Must not bypass Governance Validator.
- Must not increase `MAX_REWRITE_LOOPS` (bleibt 2).
- Must not edit `runtime_state.json` directly — alle State-Mutationen über `state-manager.ts` `mutate()`-Lock.
- Must not edit JSONL audit logs directly (`audit.jsonl`, `audit.error.jsonl`, `pipeline-audit.jsonl`, `pipeline-audit-live.jsonl`) — Audit ausschließlich über `audit-writer.ts` `auditScopeLockReleased`.
- Must not modify `batch-loader.ts` oder `system/workorders/cli/**`.
- Must not modify `system/control-plane/governance-validator.ts`.
- Must not modify `system/control-plane/scheduler-preflight.ts`.
- Must not modify `system/control-plane/review-pipeline.ts`.
- Must not modify `system/control-plane/risk-categories.ts`.
- Must not modify `system/control-plane/terminal-wo-reset-cli.ts` (WO-010 Operator-Tooling unangetastet).
- Must not modify `services/scheduler-api/**`.
- Must not modify `system/workorders/schemas/workorder.schema.json`.
- Must not modify `OrchestratorIntent`-TypeScript-Interface oder Validator-§0-§8.
- Must not modify `parseOrchestratorIntent` oder `normalizeOrchestratorIntent` (WO-005/009-Layer bleibt unangetastet).
- Must not modify `state-manager.ts` `releaseScopeLock`/`releaseDbMigrationLock`-Verhalten (Idempotenz bleibt; Doku-Kommentar erlaubt; kein Behavior-Edit).
- Must not edit approval queue files (`system/approval/**`).
- Must not execute Workorders, Migrationen oder Supabase-Befehle (`supabase db push/reset/migration apply`).
- Must not add `--force` / `--skip-validator` / `--bypass` flags.
- Must not modify `package.json` und keine neuen npm-Dependencies.
- Must not mark `awaiting_approval` or `review` as `failed` (Status-Werte auf den 4 non-terminalen Pfaden bleiben unverändert).
- Must not change `cleanupHandled`-Flag-Semantik (flag bleibt = "kein finally-`failed`-Status-Override").
- Must preserve WO-006 fail-lock-release behavior (alle reinen FAIL-Pfade ohne `cleanupHandled = true` bleiben unverändert; finally-Block 1:1 gated).
- Must preserve WO-011 run-id-specific failed status behavior (alle 4 WO-014-Pfade nutzen weiterhin `updateActiveWorkorderStatusByRun`).
- Must preserve WO-012 validator array-defense behavior (§0-Block 1:1 erhalten).
- Must preserve WO-013 prompt-contract behavior (Contract-Block-Injection + REWRITE-Hint unangetastet).
- Must not introduce a new audit-event type (existierender `auditScopeLockReleased` wird wiederverwendet mit pfad-spezifischem `reason`).
- Must not disable or skip existing tests in `dispatcher-fail-cleanup.test.ts` oder `smoke-test.ts`.
- Must not weaken any test expectation.

---

## Expected Output

**Dispatcher-Pfad-Edits:**
- **No-tool-request completed-Pfad** (`dispatcher.ts:531-536`): VOR `cleanupHandled = true` werden `releaseScopeLock(runId)` und `releaseDbMigrationLock(runId)` aufgerufen, gefolgt von `auditScopeLockReleased` mit `reason: 'no-tool-request completed path'`. `active_workorders[(woId, runId)].status` bleibt `dispatched` (pre-existing Behavior, no-tool-request setzt Status nicht auf `done` — WO-006 Test 8 unverändert).
- **Approval-Gate awaiting_approval-Pfad** (`dispatcher.ts:573-577`): VOR `cleanupHandled = true` werden Locks released, gefolgt von `auditScopeLockReleased` mit `reason: 'approval-gate awaiting_approval'`. Status bleibt `'awaiting_approval'`.
- **Review-Pipeline review-rewrite-Pfad** (`dispatcher.ts:687-689`): VOR `cleanupHandled = true` werden Locks released, gefolgt von `auditScopeLockReleased` mit `reason: 'review-pipeline rewrite — wo in review'`. Status bleibt `'review'`.
- **Review-Pipeline human-needed-Pfad** (`dispatcher.ts:714-716`): VOR `cleanupHandled = true` werden Locks released, gefolgt von `auditScopeLockReleased` mit `reason: 'review-pipeline human-needed — wo in awaiting_approval'`. Status bleibt `'awaiting_approval'`.

**Bestehende Pfade unverändert:**
- Erfolgs-Pfad mit Tool-Request (`dispatcher.ts:755-757`) — bereits `releaseScopeLock` + `releaseDbMigrationLock` + `cleanupHandled = true` pre-existing.
- Outer Catch-Block (`dispatcher.ts:770-772`) — bereits Lock-Release pre-existing.
- Finally-Block (`dispatcher.ts:789-792`) — `if (!cleanupHandled)`-gated, wirkt für unerwartete Throw-Pfade als Defense-in-Depth.
- Alle reinen FAIL-Pfade (Skill-Loader-Block, Validator-FAIL/BLOCKED, REWRITE-Limit, Tool-Auth-Block, Files-Scope-Violation, callModel-Exception) — WO-006-Behavior 1:1.
- Pre-Dispatch-Lock-Konflikt-Pfade (Zeilen 331/354) — pre-existing `updateWorkorderStatus(... 'failed')` unverändert.

**Bestehende State/Audit/Validator/Layer-Garantien unverändert:**
- `state-manager.ts` `releaseScopeLock`/`releaseDbMigrationLock`-Idempotenz BIT-IDENTISCH (multi-call-safe; kein Behavior-Edit nötig — Doku-Kommentar erlaubt).
- `audit-writer.ts` `auditScopeLockReleased`-Convenience wiederverwendet — kein neuer Event-Typ.
- `governance-validator.ts` §0-§8 unangetastet (WO-005/009/012 intakt).
- `parseOrchestratorIntent` / `normalizeOrchestratorIntent` unangetastet.
- `MAX_REWRITE_LOOPS = 2` unverändert.
- `WO_TRANSITIONS` und `ActiveWorkorder.status`-Union unverändert.
- `OrchestratorIntent`-TypeScript-Interface unverändert.
- `cleanupHandled`-Flag-Semantik unverändert.
- WO-013 Contract-Prompt + REWRITE-Hint unangetastet.

**Tests:**
- Bestehende 28 Tests in `dispatcher-fail-cleanup.test.ts` bleiben grün (9 WO-006 + 8 WO-011 + 7 WO-012 + 4 WO-013).
- Mindestens 4 additive Tests:
  - **Test E-1** no-tool-request completed → `lockExistsFor(result.run_id) === false` UND `active_workorders[(woId, runId)].status === 'dispatched'` (WO-006 Test 8 Behavior pre-existing).
  - **Test E-2** approval-gate awaiting_approval → `lockExistsFor === false` UND status === `'awaiting_approval'`.
  - **Test E-3** review-pipeline review-rewrite → `lockExistsFor === false` UND status === `'review'` (Mock-Reviewer triggert rewrite).
  - **Test E-4** review-pipeline human-needed → `lockExistsFor === false` UND status === `'awaiting_approval'` (Mock-Reviewer triggert human-needed).
- Tests verwenden eindeutige `services/wo014-NNN/...` scope_files-Pattern für Lock-Isolation analog WO-011/012/013.
- `smoke-test.ts` bleibt 9/9 PASS (Test-7B kann subtil das `'blocked'`-Result-Pfad von Preflight-HOLD auf Tool-Auth-Block verschieben — beide Pfade liefern `result.status === 'blocked'`, Assertion bleibt erfüllt).

**Validation:**
- `pnpm tsc --noEmit` clean.
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS (kein `--test` Flag — eigene `runAll()`-Schleife).
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → all PASS (≥28 + ≥4 = ≥32).
- `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` → READY_TO_RUN.

**No changes outside scope:** `services/scheduler-api/**`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `terminal-wo-reset-cli.ts`, `workorder.schema.json`, `system/workorders/cli/**`, `system/approval/**`, `runtime_state.json` (direkt), `*.jsonl` (direkt), `package.json`, `apps/**`, `supabase/**`, `.env*` ungeändert.

**Live-Erwartung nach Closure:**
- `BATCH-NUTRITION-P1-001 --run` erreicht **WO-nutrition-002** (kein Preflight-HOLD durch stale Scope-Lock von WO-001-no-tool-request mehr).
- WO-nutrition-002 hat `risk_category: db-migration` und `requires_approval: true` → erwartetes Outcome: entweder erfolgreicher Dispatch (mit Approval-Gate-Pfad → `awaiting_approval`-Status, jetzt mit korrekter Lock-Release) ODER Pause am Approval-Gate. Beide Outcomes spec-konform.

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

## First Intended Operator Verification After Closure

Nach Closure von WO-014 darf Tom folgende Verifikations-Sequenz ausführen:

```bash
# Schritt 1 — Pflicht-Validation:
pnpm tsc --noEmit
npx tsx system/control-plane/__tests__/smoke-test.ts
npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run

# Erwartet: tsc EXIT=0, smoke 9/9 PASS, fail-cleanup ≥32/32 PASS, dry-run READY_TO_RUN.

# Schritt 2 — Live-Re-Run-Verifikation:
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --run

# Erwartet:
# Möglichkeit A — beide WOs erreicht, WO-002 dispatched oder pausiert am Approval-Gate:
#   WO-nutrition-001 [dispatched] Dispatcher status: completed (oder done)
#   WO-nutrition-002 [dispatched] Dispatcher status: awaiting_approval / pausiert
# Möglichkeit B — WO-001 läuft glatt durch, WO-002 hat eigene FAIL-Ursache:
#   WO-002 mit kontrolliertem REWRITE/FAIL-Reason; aber NICHT mehr "Preflight HOLD"
#   wegen stale Lock von WO-001.
# In keinem Fall: Preflight HOLD durch stale Scope-Lock von WO-001.

# Schritt 3 — Approval-Queue inspizieren:
npx tsx system/approval/approval-cli.ts list
# Erwartet: Pending Approval für WO-nutrition-002 (db-migration), falls Möglichkeit A.
```

**Wichtig:** WO-014 fixt das Lock-Leak-Symptom auf den 4 intentional-non-terminalen Pfaden. Stuck-historische `dispatched`-Einträge in `active_workorders` (`RUN-20260502-6627`, `RUN-20260503-8238`, `RUN-20260503-1044` aus früheren Workflow-Tests) bleiben unverändert — `WO-015-state-history-cleanup` als separater Followup reserviert. Praktischer Impact dieser stale Einträge: minimal, da Preflight nur `failed`/`done` als terminal-blockierend behandelt; `dispatched` ist nicht-blockierend.

---

## Next Step After Approval

Run WO-governance-014 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds:
   - 4 Lock-Release-Block-Insertions in `dispatcher.ts` vor `cleanupHandled = true` an Zeilen 533, 577, 689, 716 mit pfad-spezifischen `auditScopeLockReleased`-Reasons.
   - Optional Doku-Kommentar-Erweiterung in `state-manager.ts` (`releaseScopeLock`/`releaseDbMigrationLock` Idempotenz; kein Behavior-Edit).
   - 4 additive Tests in `dispatcher-fail-cleanup.test.ts` (E-1 no-tool-request, E-2 approval-gate, E-3 review-rewrite, E-4 human-needed).
   - `governance-validator.ts`, `smoke-test.ts` voraussichtlich UNVERÄNDERT.
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS.
   - `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → ≥32 PASS.
   - `npx tsx system/workorders/cli/run-batch.ts ... --dry-run` → READY_TO_RUN.
5. **Tom-Aktion nach Closure:** Verifikations-Re-Run von BATCH-NUTRITION-P1-001 (siehe oben "First Intended Operator Verification After Closure"). Erwartet: WO-nutrition-002 wird erreicht — kein Preflight-HOLD durch stale Lock von WO-001.
6. Followup workorder candidates (not part of this batch):
   - **`WO-governance-015-state-history-cleanup`** — historische stuck-`dispatched`-Einträge bereinigen oder erweitert WO-010 CLI um `--include-stuck-dispatched`-Flag mit verstärktem Audit. Risk: `architecture`. Bereits in BATCH-007/008/009 als Followup gelistet.
   - **`WO-governance-016-stop-rule-cli`** — analoge Operator-CLI für `system_stop` Clear/Status. Risk: `architecture`.
   - **`WO-governance-017-validator-normalize-tests`** — dedicated Mapping-/Helper-Tests für WO-005/009/012-Layers. Risk: `test`, autonom.
   - **`WO-governance-018-orchestrator-contract-dynamic-generation`** — Phase-2-Followup zu WO-013: dynamische Generation der ALLOWED_*-Listen. Risk: `architecture`.
   - **Spark-D-Reviewer-Injection** (`PipelineDeps.callSeniorReviewer` injizierbar). Risk: `architecture`.
   - **Cleanup of `WO-NUTRITION-P1-001` Bootstrap-Workaround** (`agent_id: docs-agent` zurückrollen). Risk: `standard`/`docs`.

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- Reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch durch diese Datei.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt mit anderen offenen Batches.
- **Vorgänger-Batches:**
  - `BATCH-GOVERNANCE-P1-001-batch-loader-cli` (Status: `completed`).
  - `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` (closed via `WO-005`) — `selected_agent`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup` (closed via `WO-006`) — Try/Finally Lock-Release auf FAIL-Pfaden.
  - `BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection` (completed via `WO-008`) — `DispatcherDeps.callFastReviewer`.
  - `BATCH-GOVERNANCE-P1-005-risk-level-normalization` (completed via `WO-009`).
  - `BATCH-GOVERNANCE-P1-006-terminal-wo-reset-cli` (completed via `WO-010`).
  - `BATCH-GOVERNANCE-P1-007-dispatcher-terminal-status-on-fail` (completed via `WO-011`) — Run-id-spezifischer Status-Update.
  - `BATCH-GOVERNANCE-P1-008-orchestrator-intent-array-defaults` (completed via `WO-012`) — Validator-§0.
  - `BATCH-GOVERNANCE-P1-009-orchestrator-intent-contract-prompt` (completed via `WO-013`) — Modell-Output-Vertrag.
  - **WO-governance-007** (Smoke-Test Modernize, autonom, kein Batch).
- **Verhältnis zu BATCH-003 (WO-006) und BATCH-007 (WO-011):** Komplementär. WO-006 löst Lock-Release auf FAIL-Pfaden via Try/Finally. WO-011 löst run-id-spezifischen Status-Update. **WO-014** schließt die symmetrische Lücke für intentional-non-terminale Pfade — alle drei zusammen garantieren, dass JEDER Return-Pfad nach `acquireScopeLock` Locks freigibt UND korrekten Status setzt.
- **Verhältnis zu BATCH-008/009 (WO-012/013):** Indirekt komplementär. WO-012/013 sorgen dafür, dass das Modell vollständigen OrchestratorIntent liefert → no-tool-request-Pfad und awaiting_approval-Pfad werden zuverlässig erreicht. WO-014 sorgt dafür, dass diese Pfade ihre Locks freigeben — dadurch wird der Folgeschritt für nachfolgende WOs nicht blockiert.
- **Verhältnis zu `BATCH-NUTRITION-P1-001-db-foundation`:** Direkter operativer Vorgänger. Der letzte beobachtete Workflow-Reibungspunkt (`WO-nutrition-002 [preflight_blocked]` nach `WO-nutrition-001 completed`) verschwindet nach WO-014-Closure. Workflow-Test-Sequenz wird vorhersagbarer.
- **Audit-Trail:** Bestehender `auditScopeLockReleased`-Event-Typ wird wiederverwendet mit pfad-spezifischem `reason`-Feld. Kein neuer Audit-Event-Typ. 4 neue Audit-Events pro WO-Lebenszyklus auf den jeweiligen Pfaden — minimaler Overhead.
- **Production-Default Verhalten:** Bei Modell-Output mit Tool-Request greift weiterhin der existierende Erfolgs-Pfad (Zeile 755-757) — bit-identisch unverändert. Nur die 4 `cleanupHandled = true`-Pfade bekommen explizites Lock-Release. Token-/Performance-Overhead vernachlässigbar (3 weitere `await`-Calls pro Pfad-Hit; alle idempotent).
- **State-Machine-Sicherheit:** Doppel-Release zwischen WO-014-Stelle und finally-Block-Edge-Case ist sicher (`releaseScopeLock`/`releaseDbMigrationLock` sind in `state-manager.ts` pre-existing idempotent — multi-call-safe). Audit-Event-Spam minimal: `auditScopeLockReleased` wird pro Pfad einmal geschrieben mit pfad-spezifischem Reason; finally schreibt eigene `'finally cleanup on early failure path'`-Reason — beide unterscheidbar im Audit-Trail.

---

*Batch-Plan erzeugt: 2026-05-03 — gemäß `WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md` (Draft, PASS-Review ohne Pflicht-Fixes), `REVIEW-WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md` (Verdict: PASS, eine LOW-Anmerkung zur indirekten Smoke-Test-7B-Pfad-Verschiebung nicht-blockierend) und `BATCH-GOVERNANCE-P1-009-orchestrator-intent-contract-prompt.md` (Pattern-Vorlage).*
