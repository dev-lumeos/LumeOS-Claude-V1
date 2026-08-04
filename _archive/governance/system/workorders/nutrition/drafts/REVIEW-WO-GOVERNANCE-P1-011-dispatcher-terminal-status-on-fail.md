# REVIEW-WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md

**Reviewed Draft:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md`
**Reviewer:** Claude (Brain) · Workorder-Reviewer
**Review-Datum:** 2026-05-03

---

## Verdict

**PASS_WITH_FIXES**

Eine CRITICAL-Korrektur zum Root-Cause: `updateWorkorderStatus()` matcht NUR per `workorder_id` (nicht per `run_id`), das ist die eigentliche Ursache der stale `dispatched`-Einträge — nicht die fehlende explizite Aufruf-Stelle. WO-011's vorgeschlagener Fix (explizites `updateWorkorderStatus` auf jedem FAIL-Pfad) löst das Symptom NICHT, solange die Find-Logik unverändert bleibt. Architektur, Scope und Schutz-Garantien sonst sauber.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| **CRITICAL** | **Root-Cause ist NICHT die fehlende explizite Aufruf-Stelle, sondern `updateWorkorderStatus()` Find-Key.** `state-manager.ts:367` definiert: `const wo = s.active_workorders.find(w => w.workorder_id === workorderId)` — matcht NUR per `workorder_id`, NICHT per `run_id`. Bei wiederholtem Dispatch derselben `workorder_id` existieren multiple `active_workorders`-Einträge (siehe `dispatcher.ts:240` `startWorkorder` — pusht NEUEN Eintrag pro Dispatch). Wenn WO-nutrition-001/RUN-20260502-3836 zuerst auf `failed` gesetzt wurde, dann WO-nutrition-001/RUN-20260502-6627 erneut dispatched (NEUER Eintrag mit `status: 'dispatched'`), und dann FAIL → `updateWorkorderStatus('failed')` findet den ERSTEN Eintrag (RUN-20260502-3836, bereits `failed`), `same-state idempotent` → no-op. Der NEUE Eintrag (RUN-20260502-6627) bleibt `dispatched`. Das erklärt exakt den Live-State (3 Einträge: 1× failed + 2× dispatched). WO-011's Fix (explizites `updateWorkorderStatus('failed')` auf jedem FAIL-Pfad) würde nichts ändern — `find()` greift weiterhin den ersten Eintrag. | WO-011 muss um einen neuen **additiven** State-Manager-Helper erweitert werden: `updateActiveWorkorderStatusByRun(workorderId: string, runId: string, status: ActiveWorkorder['status']): Promise<{ updated: boolean; reason?: string }>` — matcht per `(workorder_id, run_id)`-Paar (analog zu `removeTerminalActiveWorkorder` aus WO-010). Dispatcher-FAIL-Pfade verwenden den neuen Helper statt `updateWorkorderStatus`. Das ist additiv (kein Behavior-Edit an `updateWorkorderStatus`) und bleibt im erlaubten Scope (state-manager.ts ist in scope_files; negative_constraint "NIEMALS Verhalten ändern" gilt nur für bestehende Funktionen, additive Helper sind erlaubt). Architekturentscheidung Variante 1 entsprechend erweitern; ACs ergänzen; bestehende `updateWorkorderStatus`-Aufrufe in dispatcher.ts mit `(workorderId)` BLEIBEN möglich für Pfade vor `startRun` (Zeilen 331/354 — dort gibt es noch keine `runId`-Mehrdeutigkeit, sicher). |
| MAJOR | **Problem-Statement-Präzision irreführend.** WO-011 Zeilen 42-45: "Catch swallowed nur den Fehler ('non-fatal'), der State bleibt unverändert wenn Transition rejectet wurde." Aber `dispatched → failed` IST in `WO_TRANSITIONS` erlaubt (`state-manager.ts:252`); die State-Machine-Validation rejectet diese Transition nicht. Der Catch greift NICHT, weil keine Exception geworfen wird — die Mutation ist erfolgreich, aber sie trifft den FALSCHEN Eintrag (siehe CRITICAL). Implementer könnte beim Lesen vermuten, der Fix sei "alle FAIL-Pfade explizit" und das eigentliche Problem (Find-Key) übersehen. | Problem-Statement um die Find-Key-Diagnose erweitern: `find()` matcht NUR per `workorder_id`; bei multiple Einträgen wird nur der FIRST aktualisiert. Diese Klarstellung sollte in `<analyze>` (Implementer-Anweisung) und im "Architektonisches Defizit"-Abschnitt explizit stehen. |
| INFO | **Schema-konform:** `workorder_id` matched `^WO-[a-z]+-[0-9]+$`; alle Pflichtfelder; `negative_constraints`=28 (≥4); `acceptance_criteria`=28 (≥1); `scope_files`=4 (≥1); `task` enthält XML-Block; `rollback_hint` nicht nötig (nicht db-migration); `risk_category` ∈ enum; `priority` ∈ enum; `phase` ∈ enum. | — |
| INFO | **Template-konform:** `template_implementation_medium.md`-Struktur; `agent_id: senior-coding-agent`; `post_review_required: true`; XML-Task mit `<analyze>/<implement>/<constraints>/<on_error>`; 4 Files innerhalb 3-15-Range. | — |
| INFO | **`risk_category: architecture` korrekt:** State-Synchronisationsfix mit Breite-Wirkung auf Dispatcher-Public-Behaviour ist klassisch architecture per `CLAUDE.md` Cautious-Block. Spark-D-Mandatory-Review eingehalten. | — |
| INFO | **`requires_approval: true` korrekt** für `risk_category: architecture`. | — |
| INFO | **`agent_id: senior-coding-agent` korrekt:** Existiert in `agents.json`; via `AGENT_VALIDATOR_MAP` (WO-005) zu `'micro-executor'` normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) `risk_level: 'medium'`. | — |
| INFO | **Scope angemessen:** 4 Files. State-manager.ts mit klarer Restriktion "nur Doku-Kommentar; kein Verhaltens-Edit" — nach Fix #1 würde sich diese auf "additive Helper erlaubt; keine Verhaltensänderung an bestehenden Funktionen" präzisieren müssen. | — |
| INFO | **`files_blocked` korrekt verriegelt 19 Patterns:** `terminal-wo-reset-cli.ts` (WO-010 read-only), `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `runtime_state.json`, alle `*.jsonl`-Audits, `services/scheduler-api/**`, `system/workorders/cli/**`, `system/approval/**`, `package.json`, `.env*`. Lückenlos. | — |
| INFO | **Terminal-WO-Reset-CLI nicht abgeschwächt:** `terminal-wo-reset-cli.ts` in `files_blocked` + Out-of-Scope explicit + 1 negative_constraint "NIEMALS terminal-wo-reset-cli.ts ändern (WO-010 — Operator-Tooling unverändert)". CLI bleibt read-only-Referenz; ihre Schutz-Funktion gegen non-terminale Cleanups bleibt erhalten. | — |
| INFO | **`awaiting_approval`/`review` nicht versehentlich terminalisiert:** Out-of-Scope-Punkt + Constraint-Block + 4 dedicated negative_constraints + 4 explizite ACs (`status === 'awaiting_approval' UNVERÄNDERT`, `status === 'review' UNVERÄNDERT`). Pfade an Zeilen 531/643/670 explizit als unverändert markiert. | — |
| INFO | **Success-Path nicht verändert:** AC "Erfolgs-Pfad mit Tool-Request: status === 'done' UNVERÄNDERT" + AC "Erfolgs-Pfad OHNE Tool-Request: status NICHT 'failed'" + Constraint "Erfolgs-Pfad bleibt unverändert" + negative_constraint "NIEMALS no-tool-request-Erfolgs-Pfad ... auf 'failed' setzen — WO-006 Test 8 Behaviour bleibt". | — |
| INFO | **WO-006 Lock-Release intakt:** AC "Lock-Release-Verhalten aus WO-006 ... bleibt 1:1 erhalten — alle 9 dispatcher-fail-cleanup.test.ts Tests bleiben grün" + Constraint mehrfach + negative_constraint "NIEMALS WO-006 Lock-Release-Verhalten ändern" + Architecture-Decision-Bullet "WO-006 Try/Finally Lock-Release-Block ... bleibt strukturell unverändert". | — |
| INFO | **Acceptance Criteria messbar:** 28 ACs, davon 25 binär verifizierbar (Code-Inspektion + Test-Lauf-Counts + Status-Asserts). Final AC "Nach simuliertem failed Run kann CLI clearen" wird via Test mit `getAllActiveWorkorders().find(...).status === 'failed'` verifiziert (NICHT via tatsächlichen `--confirm`-Aufruf — sauber). | — |
| INFO | **Validation-Commands passend:** `pnpm tsc --noEmit` + `npx tsx --test dispatcher-fail-cleanup.test.ts` (mit `--test` — korrekt, `node:test`) + `npx tsx smoke-test.ts` (ohne `--test` — korrekt, eigene `runAll()`-Schleife). | — |
| INFO | **`<on_error>`-Block umfassend:** Behandelt TypeScript-Fehler, Breaking-Change in dispatcher/state-manager-API, alle out-of-scope-File-Edits, neue npm-Dependency, Migration, Security, rote Tests, WO-006 Behaviour-Bruch, mehrdeutige FAIL-Pfade. Klare Eskalationspfade. | — |
| INFO | **Lifecycle korrekt:** `done → reviewed → closed` (architecture → Spark-D mandatory) per `wo_lifecycle_v1.md`. Auto-Retry deaktiviert per `CLAUDE.md` High-Risk-Regel. | — |
| LOW | **WO-011 listet einige bereits-korrekte FAIL-Pfade nicht auf.** `dispatcher.ts:580` (Files-Scope-Violation Post-Check) hat bereits `updateWorkorderStatus('failed')` BEVOR Return — siehe Live-Check `grep -n updateWorkorderStatus`. WO-011 Architekturentscheidung listet "Files-Scope-Violation Post-Execution" als zu fixenden Pfad, aber implementiert ist es bereits. Implementer würde es im `<analyze>`-Schritt erkennen, ist same-state-idempotent — nicht-blockierend, aber Diagnose-Genauigkeit könnte präziser sein. | Im `<analyze>`-Schritt explizit hinweisen, dass einige Pfade bereits `updateWorkorderStatus('failed')` haben (Zeile 580 + frühe Pfade Zeilen 331/354) und nur die fehlenden ergänzt werden müssen. Nach Fix #1 wird der Implementer ohnehin alle Pfade durchgehen müssen, weil sie auf den NEUEN run-id-aware Helper umgestellt werden müssen. |
| LOW | **`endRun(runId, 'failed')` Aufruf-Reihenfolge nicht in allen Pfaden konsistent.** Dispatcher hat unterschiedliche Patterns: einige Pfade rufen `endRun` BEVOR `updateWorkorderStatus`, andere ANCH andere gar nicht. WO-011 sagt im Implement-Block "endRun wenn der Pfad das nicht schon tut". Implementer könnte unklar sein, wann das nötig ist. | Optional konkretisieren: `endRun(runId, 'failed')` ist nötig wenn der Pfad keinen `state.endRun`-Aufruf vor dem Return hat (find via `grep -n "endRun" dispatcher.ts` und cross-checken pro Pfad). Same-state idempotent, daher Doppel-Aufruf safe. |

---

## Batch Readiness

**Not Ready** — vor Single-WO-Batch und Approval-Schritt muss Fix #1 (CRITICAL: Root-Cause Find-Key) eingearbeitet werden. Ohne diese Korrektur würde der Implementer alle FAIL-Pfade mit explizitem `updateWorkorderStatus('failed')` ergänzen, aber der Live-State würde weiterhin stale `dispatched`-Einträge zeigen — die `find()`-Logik trifft den falschen Eintrag. Fix #2 (MAJOR: Problem-Statement-Präzision) verhindert Implementer-Verwirrung.

Nach den Fixes: Ready für `BATCH-GOVERNANCE-P1-007-dispatcher-terminal-status-on-fail` analog zu BATCH-003/004/005/006 und Approval-Gate.

---

## Required Fixes

1. **CRITICAL — Neuen state-manager Helper hinzufügen + Architekturentscheidung erweitern:**
   - Architekturentscheidung-Block: explizit dokumentieren, dass `updateWorkorderStatus(workorderId, status)` per `workorder_id`-only-find die NEUEN Einträge nicht erreicht. Lösung: additiver Helper.
   - Neue Funktion in `state-manager.ts` (additive, keine Signatur-Änderung an existierenden):
     ```ts
     export async function updateActiveWorkorderStatusByRun(
       workorderId: string,
       runId: string,
       status: ActiveWorkorder['status'],
     ): Promise<{ updated: boolean; reason?: string }>
     ```
     Atomar via `mutate()`-Lock. Matcht per `w.workorder_id === workorderId && w.run_id === runId`. Wendet `validateWoStatusTransition` an. Same-state idempotent (returns `{ updated: false, reason: 'same-state' }`). Bei keinem Match: `{ updated: false, reason: 'no match' }`. Bei mehrdeutigem Match: `{ updated: false, reason: 'ambiguous match (N)' }`.
   - `<implement>` Schritt 1: Dispatcher-FAIL-Pfade NACH `startRun()` verwenden den NEUEN Helper `updateActiveWorkorderStatusByRun(wo.workorder_id, runId, 'failed')` statt des alten `updateWorkorderStatus`.
   - Frühe Pfade VOR `startRun()` (Zeilen 331/354) bleiben mit `updateWorkorderStatus` (kein `runId` verfügbar; Mehrdeutigkeit dort kein Risiko, da Lock-Konflikt vor Dispatch).
   - WO-006 finally-Block (Zeile 741): `try { updateWorkorderStatus(workorderId, 'failed') } catch` ersetzen durch `try { updateActiveWorkorderStatusByRun(workorderId, runId, 'failed') } catch` — `runId` ist im finally-Scope verfügbar (siehe `dispatcher.ts:367` Variable-Lifetime).
   - ACs ergänzen: "Neuer Helper `updateActiveWorkorderStatusByRun` existiert in state-manager.ts, matcht per (workorder_id, run_id)"; "Bestehender `updateWorkorderStatus` Verhalten unverändert (für Pre-Dispatch-Pfade weiter genutzt)"; "Tests verifizieren, dass nach 2 aufeinanderfolgenden FAIL-Runs derselben workorder_id BEIDE active_workorders-Einträge auf 'failed' stehen".
   - Tests in `dispatcher-fail-cleanup.test.ts`: neuer Test "Multi-Dispatch Same-WO: nach 2 FAIL-Runs sind BEIDE active_workorders-Einträge mit unterschiedlichen run_ids auf 'failed'".

2. **MAJOR — Problem-Statement-Präzision:**
   - "Catch swallowed nur den Fehler" auf "Find-Key-Mismatch" korrigieren.
   - Erweitern um: "Konkret: `updateWorkorderStatus(workorderId, 'failed')` matcht per `find(w => w.workorder_id === workorderId)` — bei multiple Einträgen wird nur der FIRST gefunden. Wenn der erste Eintrag bereits `'failed'` ist (aus früherem Dispatch), greift `same-state idempotent` und der NEUE Eintrag bleibt `dispatched`."
   - "Wirkung"-Abschnitt entsprechend anpassen.

3. **LOW (optional) — Diagnose-Präzision:**
   - `<analyze>`-Schritt: explizit bestehende Aufruf-Stellen Zeilen 331/354/580 als "bereits korrekt — Pre-Dispatch oder schon richtig gesetzt" markieren, sodass der Implementer nur die fehlenden Pfade auf den neuen Helper umstellt.
   - `endRun(runId, 'failed')`-Anweisung präzisieren: "Aufrufen wenn der Pfad keinen `state.endRun`-Aufruf vor dem Return hat. Same-state idempotent, Doppel-Aufruf safe."

---

## Recommended Next Step

1. **Fix-Pass auf den Draft anwenden** — alle drei Korrekturen koordiniert (Fix #1 = neue Helper-Spec + ACs + Tests, Fix #2 = Problem-Statement-Update, Fix #3 = Implement-Diagnose-Präzision).
2. **Mini-Re-Review** (1-Zeiler PASS-Bestätigung) — empfohlen wegen der CRITICAL-Erweiterung des Architektur-Scopes.
3. **Single-WO-Batch erstellen** (`BATCH-GOVERNANCE-P1-007-dispatcher-terminal-status-on-fail.md`) analog zu BATCH-003/004/005/006.
4. **Approval-Gate** durch Tom (`npx tsx system/approval/approval-cli.ts grant <approval_id>`).
5. **Senior-Coding-Agent ausführt:** neuer State-Manager-Helper `updateActiveWorkorderStatusByRun` + Dispatcher-FAIL-Pfade auf neuen Helper umgestellt + finally-Block angepasst + neue Tests in dispatcher-fail-cleanup.test.ts (insbesondere Multi-Dispatch-Same-WO).
6. **Spark-D Mandatory Review** vor `done → reviewed → closed`.
7. **Validation:** tsc, dispatcher-fail-cleanup-Tests, smoke-test.
8. **Tom-Aktion nach Closure:** Re-Run-Test-Sequenz mit absichtlich-failenden WOs; verifizieren dass nach 2× FAIL die Terminal-WO-Reset-CLI BEIDE `active_workorders`-Einträge cleanen kann (`failed`-Status erreicht).

---

*Review erzeugt: 2026-05-03 — gemäß `MASTERPROMPT_WORKORDER_REVIEW.md`, gegen `workorder.schema.json`, `wo_lifecycle_v1.md`, `template_implementation_medium.md`, `dispatcher.ts` (FAIL-Pfad-Inventar via grep), `state-manager.ts` (`updateWorkorderStatus` Find-Logik Zeile 367, `WO_TRANSITIONS` Zeile 250, `startWorkorder` Zeile 240), `terminal-wo-reset-cli.ts` (read-only) und WO-006/WO-010 als Pattern-Vorlagen.*
