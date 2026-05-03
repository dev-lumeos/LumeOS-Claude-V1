# BATCH-GOVERNANCE-P1-006-terminal-wo-reset-cli

## Status
ready_for_approval

## Purpose
Implement a safe operator CLI for inspecting and clearing explicitly approved stale terminal `active_workorders` entries without manual `runtime_state.json` edits.

This single-WO batch closes the residual Operator-Workflow-Gap identified after the Closure of WO-005/006/007/008/009: stale terminal `active_workorders`-Einträge (z. B. `WO-nutrition-001 / RUN-20260503-8238`, `status: failed`) blockieren `BATCH-NUTRITION-P1-001-db-foundation` `--run` über `scheduler-preflight.ts:140-146`. Bisher wurden solche Einträge über Tom-autorisierte ad-hoc State-Cleanup-Ausnahmen oder direkte JSON-Edits entfernt — nicht audit-fähig, nicht reproduzierbar, kein dediziertes Operator-Tooling.

WO-governance-010 implementiert eine schmale, sichere, auditfähige Standalone-CLI (`system/control-plane/terminal-wo-reset-cli.ts`) mit drei Sub-Commands:
- `list` — Read-only-Übersicht aller `active_workorders`, gruppiert nach Status.
- `show <workorder_id>` — Read-only Detail-Inspektion.
- `clear <workorder_id> --run-id <run_id> [--dry-run | --confirm]` — gezielte Cleanup-Operation. Default ohne Flag = `--dry-run` (sicher).

Sicherheits-Architektur:
- Default Read-only; Mutation NUR mit explizitem `--confirm`.
- Pflicht-Argumente `<workorder_id>` UND `--run-id <run_id>` — kein Wildcard, kein Cleanup-aller-failed-WOs.
- Clearable Status: NUR `'failed'` und `'done'` (gemäß `ActiveWorkorder.status`-Union; `'blocked'` ist KEIN gültiger Wert dieser Union und damit per Type-System ausgeschlossen).
- Non-terminal Status (`queued`/`dispatched`/`running`/`review`/`awaiting_approval`) werden explizit als Refusal-Pfad abgelehnt.
- Mehrdeutige oder leere Matches → Refusal.
- Einheitliches Exit-Code-Schema: Exit 0 = Erfolg/read-only-OK; Exit 1 = usage error/refusal/unsafe; Exit 2 = no exact match found.
- Audit-Event `'terminal_workorder_reset'` (additive `EventType`-Union-Erweiterung in `audit-writer.ts`) wird VOR jeder erfolgreichen Mutation geschrieben — Dry-Run schreibt KEIN Audit.
- Kein `--force`/`--all`/`--bypass`/`--skip-validator`-Flag.

`state-manager.ts` erhält zwei neue exportierte Helper (`getAllActiveWorkorders()`, `removeTerminalActiveWorkorder()`) — additive Erweiterung, keine Signatur-Änderung an existierenden Funktionen. `audit-writer.ts` erhält eine neue Convenience-Funktion `auditTerminalWorkorderReset(p)` analog zu `auditScopeLockReleased`. Production-Default-Verhalten ist BIT-IDENTISCH ohne CLI-Aufruf — die CLI ist ein optionaler Operator-Touchpoint, kein Eingriff in Dispatch/Validator/Preflight/Review-Pipeline.

Nach Closure dieser WO kann Tom den aktuellen stale Eintrag (`WO-nutrition-001 / RUN-20260503-8238 / status: failed`) operativ entfernen und BATCH-NUTRITION-P1-001 ohne weitere ad-hoc State-Cleanup-Ausnahmen re-runnen.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md` | `WO-governance-010` | governance-terminal-wo-reset-cli-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-010 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not directly edit `runtime_state.json` outside State Manager (alle Mutations über `state-manager.ts` `mutate()`-Lock).
- Must not directly edit JSONL audit files (`system/state/audit.jsonl`, `audit.error.jsonl`, `pipeline-audit.jsonl`, `pipeline-audit-live.jsonl`) — Audit ausschließlich über `audit-writer.ts` `writeAuditEvent`.
- Must not clear `system_stop` (separate Followup-WO `WO-governance-011-stop-rule-cli`).
- Must not clear `scope_locks` (separate künftige WO).
- Must not edit approval queue files (`system/approval/**`).
- Must not execute Workorders (kein `dispatchWorkorder`-Aufruf, kein `run-batch`-Aufruf).
- Must not execute migrations.
- Must not execute Supabase commands (`supabase db push/reset/migration apply`).
- Must not add `--force` / `--all` / `--bypass` / `--skip-validator` flag.
- Must not allow broad cleanup ohne exaktes (`workorder_id` + `run_id`)-Paar.
- Must require exact `workorder_id` + `run_id` for cleanup (Pflicht-Argumente).
- Must not modify `dispatcher.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `system/workorders/cli/**`, `services/scheduler-api/**`, `system/workorders/schemas/**`.
- Must not modify `package.json` and must not add new npm dependencies.
- Must not modify Workorder-Files (`*.md` Drafts oder Batches).
- Must not change existing `state-manager.ts` function signatures or behavior — additive helpers only (`getAllActiveWorkorders`, `removeTerminalActiveWorkorder`).
- Must not change existing `audit-writer.ts` convenience signatures — `EventType`-Union additive Erweiterung um `'terminal_workorder_reset'` ist erlaubt.
- Must not clear non-terminal `ActiveWorkorder.status` (`queued`/`dispatched`/`running`/`review`/`awaiting_approval`).
- Must not write Audit-Event vor `--dry-run` — Audit NUR vor erfolgreicher `--confirm`-Mutation.
- Must write audit events only via `system/state/audit-writer.ts` `auditTerminalWorkorderReset`.
- Must not disable or skip existing tests in `smoke-test.ts` or `dispatcher-fail-cleanup.test.ts`.
- Must not weaken any test expectation.
- Must not use `child_process.exec/spawn` in CLI body (only in test file via `node:test` and explicit spawn).

---

## Expected Output

CLI Sub-Commands ausführbar:
- `npx tsx system/control-plane/terminal-wo-reset-cli.ts list` — Read-only-Liste, gruppiert nach Status, Exit 0.
- `npx tsx system/control-plane/terminal-wo-reset-cli.ts show <workorder_id>` — Read-only Detail; Exit 0 bei Match, Exit 2 bei keinem Match.
- `npx tsx system/control-plane/terminal-wo-reset-cli.ts clear <workorder_id> --run-id <run_id> --dry-run` — Vorschau ohne Mutation, ohne Audit-Event; Exit 0 bei terminalem Match, Exit 1 bei non-terminal/ambiguous, Exit 2 bei no match.
- `npx tsx system/control-plane/terminal-wo-reset-cli.ts clear <workorder_id> --run-id <run_id> --confirm` — schreibt Audit-Event VOR Mutation, entfernt genau einen Eintrag bei terminalem Match; Exit-Codes wie Dry-Run.
- `clear` ohne Flag (weder `--dry-run` noch `--confirm`) → Default = `--dry-run`-Verhalten (sicher).

Sicherheits-Garantien:
- `--dry-run` mutiert NICHTS und schreibt KEIN Audit-Event.
- `--confirm` entfernt GENAU EINEN matching terminal `active_workorders`-Eintrag (`status ∈ {'failed','done'}`).
- Clearable Status NUR `'failed'` und `'done'` (`'blocked'` ist nicht in `ActiveWorkorder.status`-Union, per Type-System ausgeschlossen).
- Non-terminal Status (`queued`/`dispatched`/`running`/`review`/`awaiting_approval`) werden refused.
- Audit-Event `'terminal_workorder_reset'` wird über `auditTerminalWorkorderReset` → `writeAuditEvent` geschrieben (kein direkter JSONL-Edit).
- Tests in `system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` decken mindestens 13 Szenarien ab und sind alle grün.

Validation:
- `pnpm tsc --noEmit` clean.
- `npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` → all PASS.
- `npx tsx system/control-plane/terminal-wo-reset-cli.ts list` → Exit 0 mit korrekter Ausgabe.
- `npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001 --run-id RUN-20260503-8238 --dry-run` → Exit 0, Vorschau zeigt 1 zu entfernenden Eintrag, State unverändert.
- Nutrition Batch 001 `--dry-run` bleibt READY_TO_RUN.
- `smoke-test.ts` bleibt 9/9 PASS (read-only-Verifikation).
- `dispatcher-fail-cleanup.test.ts` bleibt 9/9 PASS (read-only-Verifikation).

No changes outside scope:
- `services/scheduler-api/**`, `system/workorders/cli/**`, `system/approval/**`, `dispatcher.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`, `package.json`, `apps/**`, `supabase/**`, `.env*` ungeändert.

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

## First Intended Operator Use After Closure

Nach Closure von WO-010 darf Tom genau diesen Cleanup-Aufruf ausführen, der die historische Workflow-Test-Blockade beendet:

```bash
# Schritt 1 — Read-only-Vorschau (sicher):
npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001 \
  --run-id RUN-20260503-8238 --dry-run

# Erwartet: Exit 0, Output zeigt 1 zu entfernenden Eintrag mit status=failed,
# State bleibt unverändert (verifizierbar via list/show).

# Schritt 2 — Mutation mit Audit-Event:
npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001 \
  --run-id RUN-20260503-8238 --confirm

# Erwartet: Exit 0, Audit-Event 'terminal_workorder_reset' in
# system/state/audit.jsonl, active_workorders ohne diesen Eintrag.
```

Cleanup-Ziel:
- `workorder_id: WO-nutrition-001`
- `run_id: RUN-20260503-8238`
- `status: failed` (terminal — clearable)
- Quelle: stale aus dem Pflicht-`--run`-Test während WO-009-Closure

Nach diesem Cleanup kann `BATCH-NUTRITION-P1-001-db-foundation` `--run` erneut ausgeführt werden — ohne weitere ad-hoc State-Cleanup-Ausnahmen, ohne `clearSystemStop`-Aufruf (sofern Stop-Rule-Counter unter Schwellwert 5 bleibt), ohne manuellen JSON-Edit. WO-005 + WO-009 sorgen dafür, dass Validator §1+§2 PASS-fähig sind; WO-006 sorgt für Lock-Cleanup auf jedem FAIL-Pfad; WO-010 ermöglicht jetzt den deterministischen Re-Run-Operator-Workflow.

---

## Next Step After Approval

Run WO-governance-010 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds:
   - `getAllActiveWorkorders()` und `removeTerminalActiveWorkorder()` in `state-manager.ts` (additive Helper).
   - `auditTerminalWorkorderReset()` in `audit-writer.ts` + `EventType`-Union additiv um `'terminal_workorder_reset'` erweitert.
   - Neue Standalone-CLI `system/control-plane/terminal-wo-reset-cli.ts` mit drei Sub-Commands (`list`, `show`, `clear`) und einheitlichem Exit-Code-Schema.
   - Neue Test-Datei `system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` mit ≥13 Szenarien.
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx --test system/control-plane/__tests__/terminal-wo-reset-cli.test.ts` → all PASS.
   - `npx tsx system/control-plane/terminal-wo-reset-cli.ts list` → Exit 0.
   - `npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001 --run-id RUN-20260503-8238 --dry-run` → Exit 0, Vorschau ohne Mutation.
   - `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` → READY_TO_RUN.
   - `smoke-test.ts` 9/9 PASS, `dispatcher-fail-cleanup.test.ts` 9/9 PASS bleiben.
5. **Tom-Aktion nach Closure:** `--confirm`-Cleanup für `WO-nutrition-001 / RUN-20260503-8238` (siehe "First Intended Operator Use After Closure"). Anschließend Re-Run von BATCH-NUTRITION-P1-001 ohne weitere Operator-Intervention.
6. Followup workorder candidates (not part of this batch):
   - **`WO-governance-011-stop-rule-cli`** — analoge Operator-CLI für `system_stop` Clear/Status mit Audit-Event. Risk: `architecture`. Ergänzt diesen WO-010-Pattern für die zweite wiederkehrende Operator-Aufgabe.
   - **`WO-governance-012-validator-normalize-tests`** — dedicated Mapping-/Helper-Tests in `governance-validator-normalize.test.ts` für WO-005 + WO-009 Normalisierungs-Schichten. Risk: `test`, autonom.
   - **Spark-D-Reviewer-Injection** (`PipelineDeps.callSeniorReviewer` injizierbar). Risk: `architecture`.
   - **Cleanup of `WO-NUTRITION-P1-001` Bootstrap-Workaround** — restore `agent_id: docs-agent`, remove the bootstrap note. Risk: `standard`/`docs`.

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- Reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch durch diese Datei.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt mit anderen offenen Batches.
- **Vorgänger-Batches:**
  - `BATCH-GOVERNANCE-P1-001-batch-loader-cli` (Status: `completed`) — Batch-Loader CLI als Workflow-Eintrittspunkt.
  - `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` (Status: closed via `WO-governance-005`) — `selected_agent`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup` (Status: closed via `WO-governance-006`) — Try/Finally-Cleanup auf FAIL-Pfaden.
  - `BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection` (Status: completed via `WO-governance-008`) — `DispatcherDeps.callFastReviewer`-Injection.
  - `BATCH-GOVERNANCE-P1-005-risk-level-normalization` (Status: completed via `WO-governance-009`) — `risk_level`-Normalisierung aus `risk_category`.
  - **WO-governance-007** (Smoke-Test Modernize, `risk_category: test`, autonom — kein Batch-Plan; closed nach WO-008).
- **Verhältnis zu BATCH-005:** Komplementär. WO-009 schließt die Validator-Pipeline-FAIL-Quellen-Liste (Validator §1+§2). WO-010 schließt den verbleibenden Operator-Workflow-Gap nach FAIL-Iterationen. Beide WOs zusammen ermöglichen deterministische, audit-fähige Re-Runs ohne ad-hoc State-Cleanup-Ausnahmen.
- **Verhältnis zu `BATCH-NUTRITION-P1-001-db-foundation`:** Direkter operativer Vorgänger — solange stale terminale Einträge nur über manuelle Edits entfernt werden können, blockiert jeder FAIL-Iteration den nächsten Re-Run. Nach WO-010 ist der Re-Run-Workflow sauber operator-driven.
- **Audit-Event-Erweiterung:** `EventType`-Union (`audit-writer.ts:10-29`) wird um `'terminal_workorder_reset'` erweitert (additive, keine Breaking-Change). Convenience-Funktion `auditTerminalWorkorderReset` analog zu `auditScopeLockReleased`. Kein neuer Audit-Writer-Architektur-Edit nötig.
- **Production-Default Verhalten unverändert:** Die CLI ist ein optionaler Operator-Touchpoint. Ohne CLI-Aufruf bleibt jeder WO-/Lock-/Audit-/Approval-Pfad bit-identisch. Tests für `dispatcher-fail-cleanup` und `smoke-test` bleiben grün, weil sie die neuen Helper nicht aufrufen (`getAllActiveWorkorders` ist read-only und nicht im Dispatch-Pfad; `removeTerminalActiveWorkorder` ist nur via CLI erreichbar).
- **Bewusste Out-of-Scope-Trennung:** `system_stop`, `scope_locks`, Approval-Queue, Workorder-Files, Migration-Execution, Supabase-Commands sind alle explizit out-of-scope. Diese CLI ist ein schmaler, fokussierter Touchpoint — kein generisches "State-Editor"-Tool.

---

*Batch-Plan erzeugt: 2026-05-03 — gemäß `WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md` (Draft, nach Fix-Pass), `REVIEW-WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md` (Verdict: PASS_WITH_FIXES → alle drei Pflicht-Fixes umgesetzt) und `BATCH-GOVERNANCE-P1-005-risk-level-normalization.md` (Pattern-Vorlage).*
