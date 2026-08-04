# REVIEW-WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md

**Reviewed Draft:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths.md`
**Reviewer:** Claude (Brain) · Workorder-Reviewer
**Review-Datum:** 2026-05-03

---

## Verdict

**PASS**

Architektur-Variante 1 sauber gewählt; Scope minimal; alle WO-006/011/012/013-Garantien explizit verankert. Die 4 Pfad-Identifikationen stimmen exakt mit den `cleanupHandled = true`-Stellen in `dispatcher.ts` überein. Eine LOW-Anmerkung zur potenziellen indirekten Smoke-Test-7B-Verhaltensänderung (durch Eliminierung der Lock-Leak-Quelle aus Test 7A) — nicht-blockierend, Test bleibt grün.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| INFO | **Schema-konform:** `workorder_id` matched `^WO-[a-z]+-[0-9]+$`; alle Pflichtfelder gesetzt; `negative_constraints`=32 (≥4); `acceptance_criteria`=27 (≥1); `scope_files`=4 (≥1); `task` enthält XML-Block; `rollback_hint` nicht nötig (nicht db-migration); `risk_category` ∈ enum; `priority` ∈ enum; `phase` ∈ enum. | — |
| INFO | **Template-konform:** `template_implementation_medium.md`-Struktur (XML-Task `<analyze>/<implement>/<constraints>/<on_error>`, `agent_id: senior-coding-agent`, `post_review_required: true`, 4 Files innerhalb 3-15-Range). | — |
| INFO | **`risk_category: architecture` korrekt:** Eingriff in Dispatcher-Cleanup-Sequenz auf 4 Public-Path-Returns ist klassisch architecture per `CLAUDE.md` Cautious-Block. Spark-D-Mandatory-Review eingehalten. | — |
| INFO | **`requires_approval: true` korrekt** für `risk_category: architecture`. | — |
| INFO | **`agent_id: senior-coding-agent` korrekt:** Existiert in `agents.json`; via `AGENT_VALIDATOR_MAP` (WO-005) zu `'micro-executor'` normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) `risk_level: 'medium'`. | — |
| INFO | **Scope minimal und angemessen:** 4 Files. `dispatcher.ts` (Primary, 4 Pfad-Edits); `state-manager.ts` (defensiv im Scope für Doku-Kommentar — Edit explizit als "kein Behavior-Edit" markiert); 2 Test-Files. Konsistent mit `template_implementation_medium.md`. | — |
| INFO | **`files_blocked` korrekt verriegelt 19 Patterns:** `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `terminal-wo-reset-cli.ts` (WO-010), `risk-categories.ts`, `services/scheduler-api/**`, `system/workorders/cli/**`, `system/approval/**`, `runtime_state.json`, alle `*.jsonl`-Audits, `system/workorders/schemas/**`, `package.json`, `.env*`. Lückenlos. | — |
| INFO | **Fix ist tatsächlich nur Lock-Release auf non-terminal/completed paths:** Out-of-Scope-Block + Constraints + 32 negative_constraints schließen explizit aus: Validator-Logik-Änderung, MAX_REWRITE_LOOPS-Erhöhung, `state-manager`-Behavior-Edit, `OrchestratorIntent`-Type-Änderung, `WO_TRANSITIONS`-Tabelle, `cleanupHandled`-Semantik-Änderung, Status-Wert-Drift, WO-006-FAIL-Pfad-Modifikation, WO-011-Helper-Aufruf-Änderung, WO-012-§0-Schwächung, WO-013-Contract-Edit, neuer Audit-Event-Typ. | — |
| INFO | **Pfad-Identifikation exakt korrekt** — Code-Inspektion bestätigt:
- Zeile 533: `cleanupHandled = true // V1.2.4: kein FAIL — finally darf WO-Status nicht auf 'failed' überschreiben` (no-tool-request, nach `endRun(runId, 'completed')`).
- Zeile 577: `cleanupHandled = true // V1.2.4: WO bewusst in awaiting_approval — finally darf nicht auf 'failed' überschreiben` (approval-gate, nach `updateActiveWorkorderStatusByRun(... 'awaiting_approval')` + `endRun(... 'awaiting_approval')`).
- Zeile 689: `cleanupHandled = true // V1.2.4: WO bewusst in 'review' für Re-Dispatch — finally darf nicht überschreiben` (review-pipeline review-rewrite, nach `endRun(... 'failed')` + `updateActiveWorkorderStatusByRun(... 'review')`).
- Zeile 716: `cleanupHandled = true // V1.2.4: WO bewusst in 'awaiting_approval' — finally darf nicht überschreiben` (review-pipeline human-needed, nach `endRun(... 'blocked')` + `updateActiveWorkorderStatusByRun(... 'awaiting_approval')`).
Alle 4 setzen `cleanupHandled = true` OHNE pre-existing `releaseScopeLock`/`releaseDbMigrationLock`-Aufrufe. | — |
| INFO | **`awaiting_approval`/`review` werden NICHT auf `failed` gesetzt:** Status-Werte explizit als unverändert verankert (3 ACs + 5 negative_constraints + Constraint-Block + Out-of-Scope). Spec ist absolut klar: "Status-Werte auf den 4 non-terminalen Pfaden bleiben unverändert (`completed` für no-tool-request mit pre-existing dispatched-Behavior, `awaiting_approval` für approval-gate, `review` für review-rewrite, `awaiting_approval` für human-needed)". | — |
| INFO | **Success-Path (Tool-Request) unverändert:** `<analyze>` und Constraint markieren explizit, dass Erfolgs-Pfad mit Tool-Request (Zeile ~755-757) bereits Lock-Release hat und unverändert bleibt. Code-Inspektion bestätigt: `await state.releaseScopeLock(runId); await state.releaseDbMigrationLock(runId); cleanupHandled = true` ist pre-existing dort. | — |
| INFO | **WO-006 FAIL-Cleanup intakt:** Constraint + 2 negative_constraints + 1 AC verankern. Reine FAIL-Pfade ohne `cleanupHandled = true` setzen Status via finally-Block (`if (!cleanupHandled)`-gated) → Lock-Release dort wirkt weiterhin. WO-014 fasst diese Pfade nicht an. | — |
| INFO | **WO-011 Run-id-spezifischer Status-Update intakt:** Constraint + 1 negative_constraint + 1 AC verankern. Alle 4 WO-014-Pfade nutzen weiterhin `updateActiveWorkorderStatusByRun(wo.workorder_id, runId, '<status>')` pre-existing — WO-014 ergänzt nur Lock-Release, ändert keinen Status-Update-Call. | — |
| INFO | **WO-012 Validator-§0 + WO-013 Contract-Prompt intakt:** 2 dedicated negative_constraints + Out-of-Scope-Block. Beide Layer wirken weiterhin auf der Validator-/Modell-Output-Seite. | — |
| INFO | **`runtime_state.json` nicht direkt editiert:** Constraint + 2 negative_constraints + `files_blocked`. Alle State-Mutations über `state-manager.ts` `mutate()`-Lock — `releaseScopeLock`/`releaseDbMigrationLock` sind existing State-Manager-API. | — |
| INFO | **JSONL-Logs nicht direkt editiert:** alle 4 `*.jsonl`-Pfade in `files_blocked`. Audit-Events ausschließlich über `audit-writer.ts` `auditScopeLockReleased` (existing Convenience). Kein neuer Event-Typ. | — |
| INFO | **Preflight nicht umgangen:** `scheduler-preflight.ts` in `files_blocked`. Constraint + negative_constraint + Out-of-Scope. WO-014 wirkt nur im Dispatcher-Body, nicht im Preflight-Pfad. | — |
| INFO | **Governance Validator nicht umgangen:** `governance-validator.ts` in `files_blocked`. `MAX_REWRITE_LOOPS` unverändert (Constraint + negative_constraint). `ALLOWED_*`-Sets unverändert. | — |
| INFO | **Acceptance Criteria messbar:** 27 ACs, davon 24 binär verifizierbar (Code-Inspektion auf 4 explizite Lock-Release-Aufrufe + 4 Audit-Events mit pfad-spezifischen Reasons + Status-Werte-Erhaltung; Test-Lauf-Counts; tsc-Exit; lockExistsFor-Pattern-Match in Tests E-1 bis E-4). | — |
| INFO | **Validation-Commands passend:** `pnpm tsc --noEmit` + `npx tsx --test dispatcher-fail-cleanup.test.ts` (mit `--test` — korrekt) + `npx tsx smoke-test.ts` (ohne `--test` — korrekt) + Batch-Dry-Run. | — |
| INFO | **`<on_error>`-Block umfassend:** TypeScript-Fehler, Breaking-Change, state-manager-Behavior-Edit (ESCALATE), governance-validator/scheduler-preflight/review-pipeline/terminal-wo-reset-cli/services-scheduler-api/batch-loader (STOP), neue Dependency, rote Tests, WO-006/009/011/012/013-Behaviour-Bruch (ESCALATE), Status-Wert-Drift (ESCALATE). Klare Eskalations-/Stop-Trigger. | — |
| INFO | **Architektur-Variante 1 sauber begründet:** Variante 2 (zwei Flags `statusHandled`+`lockHandled`) verworfen wegen WO-006-Test-Asserts-Bruch; Variante 3 (finally ungated für Lock-Release) verworfen wegen Doppel-Release-Audit-Spam; Variante 4 (Helper-Funktion) reserviert für Phase-2-Refactoring. Variante 1 ist additiv ohne Existing-Behavior-Touch. | — |
| INFO | **Idempotenz von `releaseScopeLock`/`releaseDbMigrationLock` ist Pre-existing-Property von state-manager.ts:** WO-014 nutzt das aus (Doppel-Release zwischen WO-014-Stellen + finally-Block bei Edge-Case ist sicher). Kein Behavior-Edit nötig. | — |
| INFO | **Tests sind ausreichend:** 4 additive Tests E-1 bis E-4 (je einer pro Pfad) prüfen `lockExistsFor(result.run_id) === false` UND korrekten `active_workorders[(woId, runId)].status` — exakt die Pflicht-Verifikation pro Pfad. Eindeutige `services/wo014-NNN/...` scope_files-Pattern für Lock-Isolation analog zu WO-011/012/013. | — |
| INFO | **Lifecycle korrekt:** `done → reviewed → closed` (architecture → Spark-D mandatory). Auto-Retry deaktiviert. | — |
| INFO | **Pattern-Konsistenz mit WO-006/011:** WO-006 fixt Lock-Release auf FAIL-Pfaden (try/finally Defense-in-Depth); WO-011 fixt run-id-spezifischen Status-Update; **WO-014** schließt die symmetrische Lücke für intentional-non-terminale Pfade — alle drei zusammen garantieren, dass JEDER Return-Pfad nach `acquireScopeLock` Locks freigibt UND korrekten Status setzt. | — |
| LOW | **Indirekter Smoke-Test-7B-Verhaltens-Hinweis (nicht-blockierend, Test bleibt grün).** Smoke-Test-7B (`Migration mit Approval → blocked (gateway)`) hat in den jüngsten Workflow-Test-Berichten "passing for coincidental reason" gezeigt — Lock-Konflikt aus Test-7A's awaiting_approval-Pfad triggerte Preflight-HOLD, was als `'blocked'`-Status gewertet wurde. Nach WO-014 release Test-7A seine Locks → Test-7B sieht keine Lock-Konflikte mehr → das `'blocked'`-Result kommt aus dem **echten** Tool-Auth-Block-Pfad (micro-executor hat keine supabase/migrations-Write-Permission). Test-Assertion `result.status === 'blocked'` bleibt erfüllt — Test grün. Aber der Pfad zum 'blocked' verschiebt sich von Preflight zu Tool-Auth. KEIN Problem für Test-Suite-Stabilität, aber Implementer sollte beim Test-Lauf darauf gefasst sein, dass Test-7B's "Reason" sich subtil ändert (weiterhin grün). | Optional: Implementer dokumentiert in der Test-Run-Verifikation, dass Test-7B's "blocked"-Pfad jetzt Tool-Auth (statt Preflight-Lock-Konflikt) ist. Kein Blocker. Wenn der Test rot werden sollte (z. B. weil eine andere Permission-Logik sich ändert), wäre das ein ESCALATE-Trigger pro `<on_error>`. |

---

## Batch Readiness

**Ready** — kein blocker-level Finding. LOW-Anmerkung zum Smoke-Test-7B-Pfad-Verschiebung ist Implementer-Hinweis und nicht-blockierend (Test bleibt grün, Assertion erfüllt). WO ist ready für `BATCH-GOVERNANCE-P1-010-finally-lock-release-on-non-terminal-paths` und Approval-Gate (`requires_approval: true`).

---

## Required Fixes

**Keine.** Die WO ist batch-ready. LOW-Finding ist optional und nicht-blockierend.

---

## Recommended Next Step

1. **Single-WO-Batch erstellen** (`BATCH-GOVERNANCE-P1-010-finally-lock-release-on-non-terminal-paths.md`) analog zu BATCH-005/006/007/008/009.
2. **Approval-Gate** (`requires_approval: true`) durch Tom (`npx tsx system/approval/approval-cli.ts grant <approval_id>`).
3. **Senior-Coding-Agent ausführt:**
   - 4 Lock-Release-Block-Insertions in `dispatcher.ts` (vor `cleanupHandled = true` an Zeilen 533, 577, 689, 716) mit pfad-spezifischen `auditScopeLockReleased`-Reasons.
   - Optional Doku-Kommentar-Erweiterung in `state-manager.ts` (`releaseScopeLock`/`releaseDbMigrationLock` Idempotenz-Hinweis, kein Behavior-Edit).
   - 4 additive Tests in `dispatcher-fail-cleanup.test.ts` (E-1 no-tool-request, E-2 approval-gate, E-3 review-rewrite, E-4 human-needed).
4. **Spark-D Mandatory Review** vor `done → reviewed → closed`.
5. **Validation:** `pnpm tsc --noEmit`, `smoke-test.ts` (9/9), `dispatcher-fail-cleanup.test.ts` (28 + ≥4 = ≥32 PASS), Batch-Dry-Run READY_TO_RUN.
6. **Tom-Aktion nach Closure (Verifikation):** Re-Run `BATCH-NUTRITION-P1-001-db-foundation` `--run`. Erwartung: WO-nutrition-001 `[dispatched] completed`; WO-nutrition-002 wird **nicht mehr durch Preflight HOLD** blockiert — entweder erfolgreicher Dispatch (db-migration WO ohne Approval-Token → awaiting_approval-Pfad mit Lock-Release dank WO-014) ODER pausiert am Approval-Gate. Beide Outcomes spec-konform.

**Übersicht der bereits geplanten Followup-WOs (aus BATCH-007/008/009/Vorgänger):**
- `WO-015-state-history-cleanup` — historische stuck-`dispatched`-Einträge in `active_workorders`.
- `WO-016-stop-rule-cli` — analoge Operator-CLI für `system_stop`.
- `WO-017-validator-normalize-tests` — dedicated Mapping-/Helper-Tests für WO-005/009/012-Layers.
- `WO-018-orchestrator-contract-dynamic-generation` — Phase-2 dynamische Generation der ALLOWED_*-Listen.
- Spark-D-Reviewer-Injection.
- WO-NUTRITION-P1-001 Bootstrap-Cleanup.

---

*Review erzeugt: 2026-05-03 — gemäß `MASTERPROMPT_WORKORDER_REVIEW.md`, gegen `workorder.schema.json`, `wo_lifecycle_v1.md`, `template_implementation_medium.md`, `dispatcher.ts` (4 cleanupHandled-Stellen verifiziert per grep an Zeilen 533/577/689/716; Lock-Release-Stellen 347/755-756/770-771/789-790; finally-Block 789), `state-manager.ts` (`releaseScopeLock`/`releaseDbMigrationLock`-Idempotenz pre-existing), und WO-006/011 als Pattern-Vorlagen für symmetrische Lock-Cleanup-Architektur.*
