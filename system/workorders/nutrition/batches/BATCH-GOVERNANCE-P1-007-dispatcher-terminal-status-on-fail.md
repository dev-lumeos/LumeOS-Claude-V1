# BATCH-GOVERNANCE-P1-007-dispatcher-terminal-status-on-fail

## Status
completed *(2026-05-03)*

## Validation Result
- `pnpm tsc --noEmit` → **PASS** (EXIT=0)
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → **17/17 PASS** (9 bestehende WO-006-Tests + 8 additive WO-011-Tests inkl. CRITICAL Multi-Dispatch-Find-Key-Fix-Beweis)
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → **9/9 PASS** (Smoke-Test ungeändert; verifiziert keine Regression im success/awaiting_approval/blocked-Pfad)
- Implementation Review (Spark-D Mandatory) → **PASS** (siehe Verdict in `REVIEW-IMPLEMENTATION-WO-GOVERNANCE-P1-011`: Scope Compliance PASS, Safety Review PASS, neuer additiver Helper `updateActiveWorkorderStatusByRun` matcht run-spezifisch, alle 11 Post-`startRun` FAIL/Block/Catch/Finally-Pfade umgestellt, bestehende `updateWorkorderStatus`/`validateWoStatusTransition`/`WO_TRANSITIONS`/`ActiveWorkorder.status`-Union BIT-IDENTISCH erhalten, Pre-Dispatch-Pfade Zeilen 331/354 unverändert mit altem Helper, intentional-non-terminale Pfade `awaiting_approval`/`review`/no-tool-request unverändert in Status-Wert, WO-006 Lock-Release intakt, Terminal-WO-Reset-CLI nicht abgeschwächt)
- Implementation Files: 3 (`system/state/state-manager.ts` +63 additive Lines mit neuem Helper, `system/control-plane/dispatcher.ts` 14 Aufruf-Stellen umgestellt + Catch-Pfad ergänzt, `system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` +8 additive Test-Szenarien)

## Purpose
Fix dispatcher failure paths so `active_workorders` are updated by `workorder_id + run_id` and failed runs do not leave newer entries stuck as `dispatched`/`running`.

This single-WO batch closes die letzte bekannte State-Konsistenz-Lücke nach Closure von WO-005/006/007/008/009/010: `WO-nutrition-001` zeigt im Live-State 3 `active_workorders`-Einträge — eine `failed` (`RUN-20260502-3836`) und **zwei `dispatched`** (`RUN-20260502-6627`, `RUN-20260503-8238`), obwohl beide neueren Runs nach Validator-FAIL terminal beendet sind. Terminal-WO-Reset-CLI (WO-010) verweigert korrekt das Cleanup non-terminaler `dispatched`-Einträge — der Defekt liegt im Dispatcher.

**Root-Cause (per Code-Inspektion verifiziert):** `state-manager.ts:367` `updateWorkorderStatus(workorderId, status)` matcht via `s.active_workorders.find(w => w.workorder_id === workorderId)` — **NUR per `workorder_id`**, NICHT per `run_id`. `dispatcher.ts:240` `startWorkorder` pusht aber bei jedem Dispatch einen NEUEN Eintrag. Bei wiederholtem Dispatch derselben WO (Re-Run nach FAIL) findet `find()` den ERSTEN Eintrag (z. B. den bereits-`failed` von einem früheren Run); `validateWoStatusTransition('failed', 'failed')` ist same-state-idempotent → no-op auf den falschen Eintrag. Der **aktuelle** dispatched-Eintrag (mit der neuen `run_id`) bleibt unverändert in `'dispatched'`.

WO-governance-011 fügt einen **additiven** State-Manager-Helper `updateActiveWorkorderStatusByRun(workorderId, runId, status)` hinzu, der per `(workorder_id, run_id)`-Paar matcht (analog zu WO-010 `removeTerminalActiveWorkorder`). Dispatcher-FAIL-Pfade nach `startRun` werden auf den neuen Helper umgestellt; Pre-Dispatch-Pfade vor `startRun` (Lock-Konflikt-Returns Zeilen 331/354) bleiben mit dem alten Helper (kein Multi-Dispatch-Risiko). Bestehender `updateWorkorderStatus` und `validateWoStatusTransition` bleiben in Signatur und Verhalten BIT-IDENTISCH erhalten.

Dispatcher-FAIL-Pfade werden in 5 Kategorien systematisch klassifiziert (siehe WO-011 `<analyze>`-Block): A=neue Aufrufe ergänzen (Skill-Loader, Validator-Pfade, Tool-Auth, Approval-Gate-FAIL, callModel-Exception, Outer-Catch); B=bestehende Aufrufe umstellen (Files-Scope-Violation Zeile 580, Tool-Result Zeile 709); C=finally-Block umstellen (Zeile 741); D=Pre-Dispatch unverändert (Zeilen 331/354); E=intentional-non-terminale Pfade Helper-Wechsel mit unverändertem Status-Wert (Approval-Gate awaiting_approval Zeile 531, Review-Pipeline review Zeile 643, Review-Pipeline human-needed Zeile 670). WO-006 Lock-Release-Verhalten bleibt 1:1 erhalten.

Nach Closure dieser WO können wiederholte Workflow-Test-FAIL-Iterationen sauber bereinigt werden: jeder failed Run setzt den korrekten `active_workorders`-Eintrag (per `run_id`) auf `'failed'`, sodass die WO-010 Terminal-WO-Reset-CLI alle terminal-Einträge clearen kann. Tom muss keine ad-hoc State-Cleanup-Ausnahmen mehr autorisieren.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md` | `WO-governance-011` | governance-dispatcher-terminal-status-on-fail-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-011 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not bypass Preflight.
- Must not bypass Governance Validator.
- Must not increase `MAX_REWRITE_LOOPS` (bleibt 2).
- Must not weaken Terminal-WO-Reset-CLI (`terminal-wo-reset-cli.ts` in `files_blocked` — WO-010 Operator-Tooling unverändert).
- Must not edit `runtime_state.json` directly — alle Mutations über `state-manager.ts` `mutate()`-Lock.
- Must not edit JSONL logs directly (`audit.jsonl`, `audit.error.jsonl`, `pipeline-audit.jsonl`, `pipeline-audit-live.jsonl`) — Audit über `audit-writer.ts`.
- Must not modify `batch-loader.ts` oder `system/workorders/cli/**`.
- Must not modify `system/control-plane/governance-validator.ts`.
- Must not modify `system/control-plane/scheduler-preflight.ts`.
- Must not modify `system/control-plane/review-pipeline.ts`.
- Must not modify `system/control-plane/risk-categories.ts`.
- Must not modify `system/workorders/schemas/workorder.schema.json`.
- Must not touch `services/scheduler-api/**`.
- Must not edit approval queue files (`system/approval/**`).
- Must not add `--force` / `--skip-validator` / `--bypass` flags.
- Must not mark `awaiting_approval` or `review` as `failed` (intentional non-terminal mit Re-Dispatch-Pfad).
- Must not change Status-Wert für intentional-non-terminale Pfade (Kategorie E: nur Helper-Wechsel, gleicher Status).
- Must not change existing `updateWorkorderStatus` or `validateWoStatusTransition` Signatur oder Verhalten — additive Helper only.
- Must not change `WO_TRANSITIONS`-Tabelle oder `ActiveWorkorder.status`-Union.
- Must update `active_workorders` by `workorder_id + run_id` where `runId` is available (FAIL-Pfade nach `startRun`).
- Must not execute Workorders, Migrationen oder Supabase-Befehle.
- Must not change `package.json` und keine neuen npm-Dependencies.
- Must preserve WO-006 Lock-Release-Verhalten 1:1 (`releaseScopeLock`/`releaseDbMigrationLock` auf jedem FAIL-Pfad).
- Must preserve WO-006 Test 8 Behaviour (no-tool-request-Erfolgs-Pfad: status NICHT `failed`).
- Must write audit events only via `system/state/audit-writer.ts`.
- Must not disable or skip existing tests in `dispatcher-fail-cleanup.test.ts` oder `smoke-test.ts`.

---

## Expected Output

**Neuer State-Manager-Helper:**
- `state-manager.ts` enthält neue exportierte Funktion `updateActiveWorkorderStatusByRun(workorderId: string, runId: string, status: ActiveWorkorder['status']): Promise<{ updated: boolean; reason?: string }>`.
- Helper matcht per `(workorder_id, run_id)`-Paar — keine Mehrdeutigkeit bei Multi-Dispatch derselben WO.
- Atomar via existierendem `mutate()`-Lock; same-state idempotent über `validateWoStatusTransition`.
- Bei genau 1 Match + valider Transition → `{ updated: true }`, mutiert genau diesen Eintrag.
- Bei 0 Matches → `{ updated: false, reason: 'no match' }` (no-op, sicher).
- Bei mehrdeutigem Match → `{ updated: false, reason: 'ambiguous match (N)' }`.
- Bei invalider Transition → `{ updated: false, reason: 'invalid transition: <from> → <to>' }` + appendInvalidTransition-Audit.
- Berührt KEINE anderen `active_workorders`-Einträge.
- Berührt KEINE `scope_locks`/`db_migration_lock`/`system_stop`/`approvals`/`active_runs`.

**Bestehende State-Manager-Funktionen unverändert:**
- `updateWorkorderStatus(workorderId, status)` Signatur und Verhalten 1:1 (bleibt für Pre-Dispatch-Pfade Zeilen 331/354).
- `validateWoStatusTransition(from, to)` Signatur und Verhalten 1:1.
- `WO_TRANSITIONS`-Tabelle unverändert.
- `ActiveWorkorder.status`-Union unverändert.

**Dispatcher-FAIL-Pfade (Kategorie A — neue Aufrufe ergänzen):** Skill-Loader-Block, Validator-REWRITE-Limit (Parse + Validation), Validator-FAIL-Direct, Validator-BLOCKED, Tool-Auth-Block, Approval-Gate-Block (FAIL-Variante), callModel-Exception, Outer-Catch-Block — alle rufen vor Return `await state.updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed')` + ggf. `endRun(runId, 'failed')`.

**Dispatcher-FAIL-Pfade (Kategorie B — bestehende Aufrufe umstellen):** Files-Scope-Violation Post-Check (Zeile 580) und Tool-Result success/failed (Zeile 709) — bestehende `updateWorkorderStatus` durch `updateActiveWorkorderStatusByRun` ersetzt, KEIN doppeltes Setzen.

**Dispatcher finally-Block (Kategorie C — Zeile 741):** `try { updateWorkorderStatus(... 'failed') } catch` ersetzt durch `try { updateActiveWorkorderStatusByRun(... runId, 'failed') } catch`. `runId` ist im finally-Scope verfügbar.

**Dispatcher-Pfade VOR startRun (Kategorie D — UNVERÄNDERT):** Zeilen 331/354 (Scope-Lock-Konflikt, DB-Migration-Lock-Konflikt) bleiben mit `updateWorkorderStatus` (kein Multi-Dispatch-Risiko vor Dispatch).

**Dispatcher-Pfade intentional-non-terminal (Kategorie E — Helper-Wechsel, Status unverändert):** Approval-Gate awaiting_approval (Zeile 531), Review-Pipeline review (Zeile 643), Review-Pipeline human-needed (Zeile 670) — auf `updateActiveWorkorderStatusByRun` umgestellt mit jeweils unverändertem Status-Wert (`awaiting_approval`/`review`). KEINE Status-Wert-Änderung. No-tool-request-Erfolgs-Pfad (Zeile 487-492) bleibt komplett unverändert (kein expliziter Status-Update; cleanupHandled=true schützt vor finally-Überschreibung — WO-006 Test 8 Behaviour bleibt).

**Tests in `dispatcher-fail-cleanup.test.ts`:**
- Bestehende 9 Tests bleiben grün.
- Additive Tests: 5 Single-Dispatch FAIL-Path-Tests (Validator-FAIL/BLOCKED, Tool-Auth, Files-Scope, callModel-Exception) verifizieren `active_workorders[(workorder_id, run_id)].status === 'failed'`.
- **CRITICAL Multi-Dispatch-Same-WO-Test:** 2 Einträge mit gleicher `workorder_id`, unterschiedlichen `run_id` (RUN-A=`failed`, RUN-B=`dispatched`); FAIL-Run gegen RUN-B; nach Run sind BEIDE Einträge auf `'failed'` (RUN-A bleibt, RUN-B wechselt).
- State-Manager-Helper-Tests für `updateActiveWorkorderStatusByRun` (5+ Szenarien: eindeutig, no-match, ambiguous, invalid-transition, same-state-idempotent, Mutations-Isolation).
- Negativ-Tests (Schutz für intentional-non-terminale Pfade): Erfolgs-Pfad mit Tool-Request `done` bleibt; Erfolgs-Pfad ohne Tool-Request NICHT `failed`; Approval-awaiting bleibt `awaiting_approval`; Review-Pfad bleibt `review`; Multi-Dispatch + Approval-Gate: nur neuer Eintrag wechselt zu `awaiting_approval`, alter `failed`-Eintrag bleibt.

**Validation:**
- `pnpm tsc --noEmit` clean.
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → all PASS (mind. 9 + neue additive ≥6).
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS.

**No changes outside scope:** `services/scheduler-api/**`, `terminal-wo-reset-cli.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`, `system/workorders/cli/**`, `system/approval/**`, `runtime_state.json` (direkt), `*.jsonl` (direkt), `package.json`, `apps/**`, `supabase/**`, `.env*` ungeändert.

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

Nach Closure von WO-011 darf Tom folgende Verifikations-Sequenz ausführen — als Bestätigung der Multi-Dispatch-Korrektheit:

```bash
# Schritt 1 — Aktuellen stale State inspizieren:
npx tsx system/control-plane/terminal-wo-reset-cli.ts show WO-nutrition-001

# Erwartet: 3 Einträge — RUN-20260502-3836 status=failed,
# RUN-20260502-6627 status=dispatched, RUN-20260503-8238 status=dispatched.
# Nach WO-011 ALLEINE keine sofortige State-Korrektur — bestehende stale Einträge
# bleiben dispatched (WO-011 fixt FUTURE FAIL-Pfade, nicht historische State).

# Schritt 2 — Erneuter --run gegen BATCH-NUTRITION-P1-001:
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --run

# Erwartet: WO-nutrition-001 wird neu dispatched (NEUER active_workorders-Eintrag
# mit neuer run_id). Falls FAIL, wird der NEUE Eintrag korrekt auf 'failed' gesetzt
# (NICHT mehr auf 'dispatched' bleiben). Stale Einträge aus Vorgänger-Runs
# bleiben unverändert (separater Cleanup nötig).

# Schritt 3 — Cleanup historischer stale Einträge mit WO-010 CLI:
# Da WO-011 historische Einträge nicht repariert, müsste Tom ggf. einen
# Followup-Pfad bauen (z. B. WO-013-state-history-cleanup), um ältere
# stale Einträge auf 'failed' zu setzen, sodass WO-010 sie clearen kann.
# Alternativ: stale historische dispatched-Einträge können bewusst unangetastet
# bleiben (sie blockieren keine Re-Runs, nur State-Konsistenz ist verletzt).
```

**Wichtig:** WO-011 fixt FUTURE FAIL-Pfade. Bereits-existierende stale `dispatched`-Einträge in `active_workorders` werden NICHT automatisch repariert — sie bleiben unverändert, bis sie entweder durch eine separate Migration oder via Followup-WO bereinigt werden. Der praktische Nutzen von WO-011 liegt in der Vermeidung WEITERER stale Einträge.

---

## Next Step After Approval

Run WO-governance-011 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds:
   - Neuer additiver Helper `updateActiveWorkorderStatusByRun` in `state-manager.ts` (mit Mutations-Isolation, same-state idempotent, no-match/ambiguous/invalid-transition Refusal-Pfade).
   - Dispatcher-FAIL-Pfade Kategorie A/B/C/E: alle Aufrufe nach `startRun` auf neuen Helper umgestellt (Zeilen 386/420/467/473/481/512/554/580/643/670/709/741 + Outer-Catch); Status-Werte bei Kategorie E unverändert.
   - Dispatcher-Pfade Kategorie D (Zeilen 331/354): UNVERÄNDERT.
   - Test-Erweiterungen in `dispatcher-fail-cleanup.test.ts`: Single-Dispatch FAIL-Path-Tests, CRITICAL Multi-Dispatch-Same-WO-Test, State-Manager-Helper-Tests, Negativ-Tests.
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → all PASS.
   - `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS.
   - Multi-Dispatch-Same-WO-Test verifiziert das Find-Key-Fix.
5. **Tom-Aktion nach Closure:** Verifikations-Re-Run von BATCH-NUTRITION-P1-001 (siehe oben "First Intended Operator Verification"). Bei FAIL des neuen Runs sollte der NEUE `active_workorders`-Eintrag korrekt auf `'failed'` stehen.
6. Followup workorder candidates (not part of this batch):
   - **`WO-governance-012-stop-rule-cli`** — analoge Operator-CLI für `system_stop` (bereits in BATCH-006 als Followup gelistet). Risk: `architecture`.
   - **`WO-governance-013-state-history-cleanup`** — optionale Reparatur historischer stale `active_workorders`-Einträge (z. B. via separates Migration-Script oder erweiterte CLI). Risk: `architecture`. Erst sinnvoll, falls WO-010 + WO-011 nicht ausreichen.
   - **`WO-governance-014-validator-normalize-tests`** — dedicated Mapping-Tests für WO-005/009 Normalisierungs-Schichten (in BATCH-005/006 bereits gelistet). Risk: `test`, autonom.
   - **Spark-D-Reviewer-Injection** (`PipelineDeps.callSeniorReviewer` injizierbar). Risk: `architecture`.
   - **Cleanup of `WO-NUTRITION-P1-001` Bootstrap-Workaround** (`agent_id: docs-agent` zurückrollen). Risk: `standard`/`docs`.

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- Reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch durch diese Datei.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt mit anderen offenen Batches.
- **Vorgänger-Batches:**
  - `BATCH-GOVERNANCE-P1-001-batch-loader-cli` (Status: `completed`) — Batch-Loader CLI als Workflow-Eintrittspunkt.
  - `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` (Status: closed via `WO-governance-005`) — `selected_agent`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup` (Status: closed via `WO-governance-006`) — Try/Finally Lock-Release.
  - `BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection` (Status: completed via `WO-governance-008`) — `DispatcherDeps.callFastReviewer`-Injection.
  - `BATCH-GOVERNANCE-P1-005-risk-level-normalization` (Status: completed via `WO-governance-009`) — `risk_level`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-006-terminal-wo-reset-cli` (Status: completed via `WO-governance-010`) — Operator-CLI für Terminal-WO-Reset.
  - **WO-governance-007** (Smoke-Test Modernize, `risk_category: test`, autonom — kein Batch-Plan; closed nach WO-008).
- **Verhältnis zu BATCH-003 (WO-006):** Komplementär. WO-006 schließt das Lock-Release-Problem auf FAIL-Pfaden (Try/Finally Defense-in-Depth). WO-011 schließt das State-Synchronisations-Problem zwischen `active_runs.status` und `active_workorders[(woId, runId)].status`. Beide Try/Finally-Architekturen koexistieren — WO-011 stellt nur den im finally verwendeten Helper auf die run-id-spezifische Variante um.
- **Verhältnis zu BATCH-006 (WO-010):** Komplementär. WO-010 baut Operator-CLI mit Schutz-Funktion gegen non-terminale Cleanups. WO-011 sorgt dafür, dass nach FAIL der korrekte Status-Wert tatsächlich gesetzt wird, sodass die WO-010-CLI ihren Job machen kann. WO-010-CLI wird in dieser WO NICHT geändert (in `files_blocked`).
- **Verhältnis zu `BATCH-NUTRITION-P1-001-db-foundation`:** Indirekter operativer Vorgänger — nach WO-011 erzeugen FAIL-Iterationen keine neuen stale `dispatched`-Einträge mehr; der Re-Run-Workflow ist sauber state-konsistent.
- **Audit-Trail:** Kein neuer Audit-Event-Typ erforderlich. `appendInvalidTransition` (existierend in `state-manager.ts`) wird vom neuen Helper bei invalider Transition aufgerufen — analog zu `updateWorkorderStatus`. WO-006 `auditScopeLockReleased` im finally bleibt unverändert.
- **Production-Default Verhalten:** Erfolgsfall, awaiting_approval-Status, review-Status, no-tool-request-Erfolg — alle BIT-IDENTISCH (nur Helper-Wechsel bei Kategorie E, kein Status-Wert-Wechsel). FAIL-Pfade haben jetzt korrekten run-id-spezifischen Status-Update.
- **State-Machine-Sicherheit:** `WO_TRANSITIONS` (`state-manager.ts:250`) erlaubt `dispatched/running/review/awaiting_approval → failed`. Same-state idempotent (Zeile 267). Alle Implementation-relevanten Transitionen sind valid.

---

*Batch-Plan erzeugt: 2026-05-03 — gemäß `WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md` (Draft, nach Fix-Pass mit additivem `updateActiveWorkorderStatusByRun`-Helper), `REVIEW-WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md` (Verdict: PASS_WITH_FIXES → CRITICAL Find-Key-Fix + MAJOR Problem-Statement-Präzision + LOW Pfad-Listen-Präzision umgesetzt) und `BATCH-GOVERNANCE-P1-006-terminal-wo-reset-cli.md` (Pattern-Vorlage).*
