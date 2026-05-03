# BATCH-GOVERNANCE-P1-008-orchestrator-intent-array-defaults

## Status
ready_for_approval

## Purpose
Make OrchestratorIntent validation robust against missing or non-array array fields so malformed model output produces deterministic REWRITE/FAIL instead of TypeError crashes.

This single-WO batch closes die letzte bekannte Validator-Robustheits-Lücke nach Closure von WO-005/006/007/008/009/010/011 + Operator-Cleanup von `RUN-20260502-3836`: Re-Run von `BATCH-NUTRITION-P1-001-db-foundation` produzierte `RUN-20260503-7133` mit `Dispatcher status: failed — intent.required_gates is not iterable`. WO-011 wirkte korrekt (neuer `active_workorders`-Eintrag wurde via run-id-spezifischem Helper auf `failed` gesetzt — kein stuck-`dispatched`); aber der Validator wirft TypeError statt deterministisches REWRITE, weil das Modell-Output-OrchestratorIntent für `required_gates` (oder andere Array-Pflichtfelder) `undefined`/`null`/non-array liefert.

**Root-Cause (per Code-Inspektion verifiziert):** `governance-validator.ts:300` iteriert mit `for (const gate of intent.required_gates)` ohne Array-Type-Check. Identische Lücke in §4 (Zeile 311 `intent.stop_conditions`), §5 (Zeile 326 `intent.execution_order`), §8 (Zeile 390 `intent.execution_order`). Bei nicht-Array-Wert → TypeError → Outer Catch-Block (`dispatcher.ts:729`) fängt → Run terminiert als `failed` mit nicht-aussagekräftiger Crash-Meldung statt `governance_violation`-Audit-Event.

**Pattern:** Analog zu früheren Robustheits-Lücken — WO-005 (`selected_agent: undefined`), WO-009 (`risk_level: undefined`). Validator §1+§2 wurden defensive (Existenz-Check + Mapping); §3-§8 Array-Iterations fehlt analoge Defensive für die 4 Array-Pflichtfelder (`risks`, `execution_order`, `required_gates`, `stop_conditions`).

WO-governance-012 fügt einen **additiven §0-Block** am Anfang von `validateOrchestratorIntent` (vor §1) ein, der alle 4 Array-Pflichtfelder mit `Array.isArray()` prüft. Bei nicht-Array → sofortiges `REWRITE` mit explizitem `field` und Reason `Feld "X" muss ein Array sein, war: <typeof>` (mit `null` explizit benannt statt irreführendem `'object'`). Validator-Strenge der nachfolgenden §1-§8 bleibt 1:1 unverändert. Bestehende Layers (`parseOrchestratorIntent`, `normalizeOrchestratorIntent`, WO-005/009) und Lock-Cleanup (WO-006/011) bleiben unangetastet.

Nach Closure dieser WO produziert ein Modell-Output mit fehlenden Array-Feldern keinen TypeError-Crash mehr, sondern ein kontrolliertes REWRITE-Limit-FAIL mit klarer Reason. Operator sieht `governance_violation`-Audit-Trail mit Feld-Information. WO-011-Run-id-spezifischer Status-Update greift weiterhin korrekt am REWRITE-Limit-FAIL-Pfad (`dispatcher.ts:485`), sodass der neue `active_workorders`-Eintrag auf `'failed'` steht und via WO-010 Terminal-WO-Reset-CLI clearbar ist.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-012-orchestrator-intent-array-defaults.md` | `WO-governance-012` | governance-orchestrator-intent-array-defaults-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-012 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not bypass `governance-validator` or `scheduler-preflight`.
- Must not weaken Validator §1 (`selected_agent`-Check), §2 (`risk_level`-Check), §3 (`ALLOWED_GATES`-Check), §4 (`stop_conditions`-Negativ-Keywords), §5 (Production-Keywords + `human-approval-gate`-Pflicht), §6 (DB-Migration-Pflicht-Gates), §7 (Security-WO-Pflicht-Gates), §8 (`FILES_ALLOWED`-Scope-Check).
- Must not increase `MAX_REWRITE_LOOPS` (bleibt 2).
- Must not extend or reduce `ALLOWED_GATES`, `ALLOWED_AGENTS`, `ALLOWED_RISK_LEVELS`.
- Must not modify `AGENT_VALIDATOR_MAP` (WO-005) or `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009).
- Must not modify `parseOrchestratorIntent` or `normalizeOrchestratorIntent` (WO-005/009-Layer bleibt unangetastet).
- Must not modify `OrchestratorIntent`-TypeScript-Interface.
- Must not modify `WO_TRANSITIONS` or `ActiveWorkorder.status`-Union.
- Must not modify `dispatcher.ts` (Outer Catch-Block aus WO-011 bleibt — fängt sowieso noch alle Edge-Cases als Defense-in-Depth).
- Must not modify `state-manager.ts` (kein neuer Helper nötig — §0 ist rein Validator-Defensive).
- Must not modify `audit-writer.ts` (kein neuer Audit-Event-Typ nötig — bestehender `governance_violation` reicht).
- Must not modify `terminal-wo-reset-cli.ts` (WO-010 Operator-Tooling unverändert).
- Must not modify `batch-loader.ts` (`system/workorders/cli/**`).
- Must not modify `services/scheduler-api/**`.
- Must not modify `scheduler-preflight.ts`.
- Must not modify `review-pipeline.ts`.
- Must not modify `risk-categories.ts` (Single-Source-of-Truth bleibt).
- Must not modify `system/workorders/schemas/workorder.schema.json`.
- Must not edit `runtime_state.json` directly — alle State-Mutationen über `state-manager.ts` `mutate()`-Lock.
- Must not edit JSONL audit logs directly (`audit.jsonl`, `audit.error.jsonl`, `pipeline-audit.jsonl`, `pipeline-audit-live.jsonl`) — Audit ausschließlich über `audit-writer.ts`.
- Must not edit approval queue files (`system/approval/**`).
- Must not execute Workorders, Migrationen oder Supabase-Befehle (`supabase db push/reset/migration apply`).
- Must not add `--force` / `--skip-validator` / `--bypass` flags.
- Must not modify `package.json` und keine neuen npm-Dependencies.
- Must not silently normalize undefined `required_gates` to `[]` without subsequent Validator-Strenge — §0 muss explizit REWRITE returnen.
- Must not silently pass-through non-array values — TypeError-Crash MUSS durch §0 verhindert werden.
- Must preserve WO-006 Lock-Release-Verhalten 1:1 (`releaseScopeLock`/`releaseDbMigrationLock` auf jedem FAIL-Pfad).
- Must preserve WO-011 Run-id-spezifischer Status-Update 1:1 (`updateActiveWorkorderStatusByRun` auf REWRITE-Limit-FAIL-Pfaden).
- Must not disable or skip existing tests in `dispatcher-fail-cleanup.test.ts` oder `smoke-test.ts`.
- Must not weaken any test expectation.
- Must write audit events only via `system/state/audit-writer.ts`.

---

## Expected Output

**Validator-Robustheit:**
- Neuer §0-Block in `validateOrchestratorIntent` (Position vor §1 selected_agent, Zeile ~280) prüft alle 4 OrchestratorIntent-Array-Pflichtfelder (`risks`, `execution_order`, `required_gates`, `stop_conditions`) mit `Array.isArray()` vor jeglicher for-of-Iteration.
- Bei nicht-Array-Feld returnt §0 ein `ValidationResult` mit `status: 'REWRITE'`, explizitem `field`, und `reason: 'Feld "<field>" muss ein Array sein, war: <typeof>'` (mit `null` explizit benannt).
- Missing/non-array `required_gates` wirft KEINEN TypeError mehr — produziert deterministisches REWRITE.
- Missing/non-array `stop_conditions`/`risks`/`execution_order` analog produzieren REWRITE mit klarer Reason.
- Existierende valide OrchestratorIntent (alle 4 Arrays vorhanden) durchlaufen §0 unverändert und erreichen §1-§8.

**Bestehende Validator/Layer/State-Garantien unverändert:**
- Validator §1 (`selected_agent`-Logik), §2 (`risk_level`-Logik), §3-§8 (`ALLOWED_GATES`, `POSITIVE_STATE_KEYWORDS`, `PRODUCTION_KEYWORDS`, `DB_MIGRATION_REQUIRED_GATES`, `SECURITY_REQUIRED_GATES`, `FILES_ALLOWED`-Check) BIT-IDENTISCH erhalten.
- `ALLOWED_GATES`, `ALLOWED_RISK_LEVELS`, `ALLOWED_AGENTS`, `AGENT_VALIDATOR_MAP`, `RISK_CATEGORY_TO_RISK_LEVEL_MAP` unverändert.
- `MAX_REWRITE_LOOPS = 2` unverändert.
- `OrchestratorIntent`-TypeScript-Interface unverändert.
- `parseOrchestratorIntent` und `normalizeOrchestratorIntent` (WO-005/009-Layer) unverändert.
- `dispatcher.ts` unverändert (Outer Catch-Block aus WO-011 bleibt als Defense-in-Depth — fängt aber nach §0 keine Validator-TypeErrors mehr).
- `state-manager.ts` unverändert (kein neuer Helper nötig).
- `audit-writer.ts` unverändert (`governance_violation`-Event bleibt für Validator-REWRITE-Audit).
- WO-006 Lock-Release-Verhalten 1:1 erhalten.
- WO-011 Run-id-spezifischer Status-Update 1:1 erhalten — bei §0-REWRITE-Limit-FAIL wird `active_workorders[(woId, runId)].status` korrekt auf `'failed'` gesetzt (`dispatcher.ts:485` ruft `updateActiveWorkorderStatusByRun` weiterhin).

**Tests:**
- Bestehende 17 Tests in `dispatcher-fail-cleanup.test.ts` bleiben grün (9 WO-006 + 8 WO-011).
- Mindestens 6 additive Tests:
  - **Test C-1:** `required_gates` undefined → REWRITE-Limit FAIL mit klarer Reason; `active_workorders[(woId, runId)].status === 'failed'` (WO-011); `scope_lock` released (WO-006); KEIN TypeError.
  - **Test C-2:** `required_gates` als String statt Array → REWRITE-FAIL.
  - **Test C-3:** `stop_conditions` undefined → REWRITE-FAIL.
  - **Test C-4:** `execution_order` non-array (String) → REWRITE-FAIL.
  - **Test C-5:** `risks` undefined → REWRITE-FAIL.
  - **Test C-6 (Negativ-Schutz):** valider OrchestratorIntent mit allen Arrays bleibt PASS-fähig (no-tool-request-Pfad: `result.status === 'completed'`).
- Tests verwenden eindeutige `scope_files` pro Test (`services/wo012-NNN/...`) analog zu WO-011-Pattern für saubere Lock-Isolation.
- `smoke-test.ts` bleibt 9/9 PASS (Test 6/7A/7B-Mocks aus WO-007 enthalten alle Array-Felder bereits korrekt — keine Mock-Anpassung erwartet).

**Validation:**
- `pnpm tsc --noEmit` clean.
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS (kein `--test` Flag — eigene `runAll()`-Schleife).
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → all PASS (≥17 + ≥6 = ≥23).
- `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` → READY_TO_RUN.
- Nutrition Batch 001 `--run` scheitert NICHT mehr an `intent.required_gates is not iterable` TypeError; falls Modell-Output nicht-Array-Felder liefert, dann mit kontrolliertem Validator-FAIL und Reason `Feld "..." muss ein Array sein, war: ...`.

**No changes outside scope:** `services/scheduler-api/**`, `terminal-wo-reset-cli.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`, `system/workorders/cli/**`, `system/state/**`, `system/approval/**`, `runtime_state.json` (direkt), `*.jsonl` (direkt), `package.json`, `apps/**`, `supabase/**`, `.env*` ungeändert.

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

Nach Closure von WO-012 darf Tom folgende Verifikations-Sequenz ausführen:

```bash
# Schritt 1 — Pflicht-Validation:
pnpm tsc --noEmit
npx tsx system/control-plane/__tests__/smoke-test.ts
npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run

# Erwartet: tsc EXIT=0, smoke 9/9 PASS, fail-cleanup ≥23/23 PASS, dry-run READY_TO_RUN.

# Schritt 2 — Live-Re-Run-Verifikation:
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --run

# Erwartet: kein TypeError "required_gates is not iterable" mehr.
# Möglichkeit A — Modell liefert valides OrchestratorIntent + Tool-Request:
#   WO-nutrition-001 läuft durch oder pausiert am Approval-Gate.
# Möglichkeit B — Modell liefert weiterhin unvollständigen Intent:
#   WO-nutrition-001 endet mit kontrolliertem 'failed' (REWRITE-Limit-FAIL),
#   reason enthält "Feld ... muss ein Array sein, war: ...",
#   active_workorders[(woId, runId)].status === 'failed' (WO-011 wirkt),
#   scope_lock released (WO-006 wirkt).
# Beide Möglichkeiten sind Spec-konform.

# Schritt 3 — State-Inspektion:
npx tsx system/control-plane/terminal-wo-reset-cli.ts show WO-nutrition-001

# Erwartet: neuer active_workorders-Eintrag mit korrektem Status (done/failed/awaiting_approval).
```

**Wichtig:** WO-012 schließt die Validator-Robustheits-Lücke. Bereits-existierende stuck-`dispatched`-Einträge in `active_workorders` (`RUN-20260502-6627`, `RUN-20260503-8238`) werden NICHT automatisch repariert — separater Followup-Pfad nötig (siehe `WO-014-state-history-cleanup`-Kandidat). Praktischer Impact dieser Stale-Einträge: minimal — `dispatched`-Einträge sind nicht Preflight-blocking (nur `failed`/`done` sind terminal-blocking via `scheduler-preflight.ts:144-146`), und der Preflight-`find()` matched jetzt einen non-failed-Eintrag zuerst (kein Re-Run-Block).

---

## Next Step After Approval

Run WO-governance-012 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds:
   - Neuer §0-Block in `governance-validator.ts:280` (vor §1 selected_agent) mit `ARRAY_FIELDS`-Konstante und `Array.isArray()`-Check pro Feld.
   - Reason-Format `Feld "<field>" muss ein Array sein, war: <typeof>` mit `null` explizit benannt.
   - Mindestens 6 additive Tests in `dispatcher-fail-cleanup.test.ts` für alle 4 Array-Felder + Negativ-Schutz.
   - `dispatcher.ts` und `smoke-test.ts` voraussichtlich UNVERÄNDERT (read-only-Verifikation).
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS.
   - `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → ≥23 PASS.
   - `npx tsx system/workorders/cli/run-batch.ts ... --dry-run` → READY_TO_RUN.
5. **Tom-Aktion nach Closure:** Verifikations-Re-Run von BATCH-NUTRITION-P1-001 (siehe oben "First Intended Operator Verification After Closure"). Erwartet: kein TypeError mehr; entweder run läuft durch / pausiert am Approval-Gate / endet mit kontrolliertem `failed` (statt Crash).
6. Followup workorder candidates (not part of this batch):
   - **`WO-governance-013-finally-lock-release-on-non-terminal-paths`** — schließt latentes WO-006-Lock-Leak auf intentional-non-terminal-Pfaden (no-tool-request, awaiting_approval, review). Risk: `architecture`. Bereits in BATCH-007 als Followup gelistet.
   - **`WO-governance-014-state-history-cleanup`** — repariert historische stuck-`dispatched`-Einträge oder erweitert WO-010 CLI um `--include-stuck-dispatched`-Flag mit verstärktem Audit. Risk: `architecture`.
   - **`WO-governance-015-stop-rule-cli`** — analoge Operator-CLI für `system_stop` Clear/Status (in BATCH-006 als Followup gelistet).
   - **`WO-governance-016-validator-normalize-tests`** — dedicated Mapping-/Helper-Tests für WO-005/009/012 Validator-Layer. Risk: `test`, autonom.
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
  - `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` (Status: closed via `WO-governance-005`) — `selected_agent`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup` (Status: closed via `WO-governance-006`) — Try/Finally Lock-Release.
  - `BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection` (Status: completed via `WO-governance-008`) — `DispatcherDeps.callFastReviewer`-Injection.
  - `BATCH-GOVERNANCE-P1-005-risk-level-normalization` (Status: completed via `WO-governance-009`) — `risk_level`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-006-terminal-wo-reset-cli` (Status: completed via `WO-governance-010`) — Operator-CLI für Terminal-WO-Reset.
  - `BATCH-GOVERNANCE-P1-007-dispatcher-terminal-status-on-fail` (Status: completed via `WO-governance-011`) — Run-id-spezifischer Status-Update.
  - **WO-governance-007** (Smoke-Test Modernize, `risk_category: test`, autonom — kein Batch-Plan; closed nach WO-008).
- **Verhältnis zu BATCH-002 (WO-005) und BATCH-005 (WO-009):** Komplementär. WO-005 fixt `selected_agent`-Existenz + Mapping (defensive Layer für String-Feld); WO-009 fixt `risk_level`-Existenz + Mapping (defensive Layer für String-Feld); **WO-012** schließt die Symmetrie für die 4 Array-Pflichtfelder. Pattern identisch (defensive Validator-Layer); Implementations-Variante anders (zentrale §0-Block-Pre-Validation statt Mapping-Layer, weil Arrays nicht aus `risk_category`/`agent_id` ableitbar sind).
- **Verhältnis zu BATCH-003 (WO-006) und BATCH-007 (WO-011):** Komplementär. WO-006 fixt Lock-Release auf FAIL-Pfaden; WO-011 fixt Run-id-spezifischen Status-Update. WO-012 sorgt dafür, dass Validator-FAIL-Pfade in deterministische REWRITE-Limit-FAILs einlaufen statt TypeError-Crashes — beide Cleanup-Layers (WO-006/011) wirken weiterhin auf den korrekten REWRITE-Limit-FAIL-Pfad (`dispatcher.ts:485`).
- **Verhältnis zu `BATCH-NUTRITION-P1-001-db-foundation`:** Indirekter operativer Vorgänger — nach WO-012 ist die Validator-Robustheits-Lücke geschlossen; künftige Modell-Output-Defekte produzieren keine TypeError-Crashes mehr, sondern kontrollierte REWRITE-Limit-FAILs mit klarer Reason. Operator-Workflow-Sequence wird vorhersagbarer.
- **Audit-Trail:** Bestehender `governance_violation`-Event-Typ wird vom REWRITE-Pfad korrekt geschrieben (Validator returnt → `dispatcher.ts` ruft `audit.writeAuditEvent({ event: 'governance_violation', ... })`). Kein neuer Audit-Event-Typ nötig.
- **Production-Default Verhalten unverändert:** Wenn das Modell ein valides OrchestratorIntent mit allen 4 Array-Feldern liefert, läuft §0 als NOOP durch — `Array.isArray()` returnt true, kein REWRITE. Performance-Impact vernachlässigbar (4 `Array.isArray`-Calls pro Validation, O(1) Operationen).
- **State-Machine-Sicherheit:** §0-REWRITE-Status durchläuft den existierenden REWRITE-Loop in `dispatcher.ts`; bei Limit greift `updateActiveWorkorderStatusByRun(... 'failed')` (WO-011). State-Konsistenz garantiert: kein neuer stuck-`dispatched`-Eintrag möglich.

---

*Batch-Plan erzeugt: 2026-05-03 — gemäß `WO-GOVERNANCE-P1-012-orchestrator-intent-array-defaults.md` (Draft, PASS-Review ohne Pflicht-Fixes), `REVIEW-WO-GOVERNANCE-P1-012-orchestrator-intent-array-defaults.md` (Verdict: PASS, eine LOW-Anmerkung nicht-blockierend) und `BATCH-GOVERNANCE-P1-007-dispatcher-terminal-status-on-fail.md` (Pattern-Vorlage).*
