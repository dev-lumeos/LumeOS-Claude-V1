# REVIEW-WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md

**Reviewed Draft:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-010-terminal-wo-reset-cli.md`
**Reviewer:** Claude (Brain) · Workorder-Reviewer
**Review-Datum:** 2026-05-03

---

## Verdict

**PASS_WITH_FIXES**

Eine CRITICAL-Korrektur am `ActiveWorkorder.status`-Type-Mismatch und eine MINOR-Korrektur an Exit-Code-Inkonsistenz. Architektur, Scope und Sicherheits-Garantien sind sonst sauber.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| **CRITICAL** | **`'blocked'` ist NICHT in `ActiveWorkorder.status`-Union-Typ.** WO-010 spezifiziert in Architekturentscheidung-Bullet 2 (Zeile 71), Implement-Block (`new Set(['failed', 'done', 'blocked'])`), AC ("terminalem Status (failed\|done\|blocked)") und Test-Setup (Eintrag c: `WO-test-003 / RUN-003 / status: blocked`) den Wert `'blocked'` als clearable. Aber `state-manager.ts:32` definiert `ActiveWorkorder.status: 'queued' \| 'dispatched' \| 'running' \| 'review' \| 'awaiting_approval' \| 'done' \| 'failed'` — **kein `'blocked'`**. `'blocked'` existiert nur in `Run.status` (Zeile 21), nicht in `ActiveWorkorder`. Konsequenzen: (a) `ReadonlySet<ActiveWorkorder['status']> = new Set(['failed','done','blocked'])` ist TypeScript-Fehler (`'blocked'` nicht in Union); (b) Test-Eintrag mit `status: 'blocked'` in `active_workorders` ist Type-Verletzung; (c) inkonsistent mit `scheduler-preflight.ts:144-146`, das nur `'done'` und `'failed'` als terminal blockiert. | An allen vier Stellen `'blocked'` entfernen: Architekturentscheidung-Bullet 2 → `{'failed','done'}`; Implement-Block-Code-Skizze → `new Set(['failed', 'done'])`; AC → "terminalem Status (failed\|done)"; Test-Setup → Eintrag (c) entweder entfernen oder auf einen anderen non-terminal-Status setzen (z. B. `status: 'review'`) und entsprechend als zusätzlichen Refusal-Test verwenden. Notes-Bullet "diese drei Status sind in `wo_lifecycle_v1.md` als terminal-aber-nicht-finally" entsprechend auf zwei reduzieren. Test-Anzahl-AC ("mindestens 12 Szenarien") ggf. auf 11 anpassen oder Refusal-Tests ergänzen. |
| **MINOR** | **Exit-Code-Inkonsistenz für `clear` Sub-Command.** AC-Block sagt: "CLI verweigert clear bei keinem Match mit Exit 2" und "CLI verweigert clear bei mehrdeutigem Match mit Exit 1". Implement-Block-Anweisung sagt einheitlich: "Bei outcome.removed===false: Exit 1 mit reason." — also Exit 1 für ALLE Refusal-Fälle (no match, ambiguous, non-terminal). Implementer wird beim Lesen unsicher, welche Exit-Codes gelten. | Konsistenz herstellen: entweder im AC-Block "Exit 2 bei keinem Match" auf Exit 1 vereinheitlichen, ODER im Implement-Block den outcome differenzieren (z. B. `if (outcome.reason === 'no match') process.exit(2); else process.exit(1)`). Empfohlen: Exit-Code-Schema **einheitlich** in der Architekturentscheidung definieren und sowohl im Implement als auch in den ACs konsequent verwenden. Vorschlag: Exit 0 = success/found; Exit 1 = invalid usage / refusal (non-terminal, ambiguous, missing args, unknown sub-command); Exit 2 = no match (für `show` und `clear`). |
| INFO | **Schema-konform:** `workorder_id` matched `^WO-[a-z]+-[0-9]+$`; alle Pflichtfelder gesetzt; `negative_constraints`=28 (≥4); `acceptance_criteria`=35 (≥1); `scope_files`=4 (≥1); `task` enthält XML-Block; `rollback_hint` nicht nötig (nicht db-migration); `risk_category` ∈ enum; `priority` ∈ enum; `phase` ∈ enum. | — |
| INFO | **Template-konform:** `template_implementation_medium.md`-Struktur (XML-Task mit `<analyze>/<implement>/<constraints>/<on_error>`, `agent_id: senior-coding-agent`, `post_review_required: true`, 4 Files innerhalb 3-15-Range). | — |
| INFO | **`risk_category: architecture` korrekt:** Eingriff in State-Manager-Public-API (additive Helper) + neuer CLI-Eingangspunkt + Audit-Event-Schema-Erweiterung (`EventType`-Union) ist klassisch architecture per `CLAUDE.md` Cautious-Block. Spark-D-Mandatory-Review eingehalten. | — |
| INFO | **`requires_approval: true` korrekt:** Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel. | — |
| INFO | **`agent_id: senior-coding-agent` korrekt:** Existiert in `agents.json`; via `AGENT_VALIDATOR_MAP` (WO-005) zu `'micro-executor'` normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) wird `risk_level` auf `'medium'` aufgefüllt. | — |
| INFO | **Scope angemessen:** 4 Files (neue CLI + 2 erweiterte State/Audit-Files + neue Test-Datei). Konsistent mit `template_implementation_medium.md`. | — |
| INFO | **`runtime_state.json` und `*.jsonl`-Audits korrekt verriegelt:** Beide in `files_blocked`. CLI darf NUR über `state-manager.ts` `mutate()` und `audit-writer.ts` `writeAuditEvent` schreiben. Negative_constraint und Constraint mehrfach verankert. | — |
| INFO | **`system_stop`, `scope_locks`, `approval queue` sauber out-of-scope:** Out-of-Scope-Block + 3 dedicated negative_constraints + Followup-Hinweis (`WO-governance-011-stop-rule-cli`). Kein `triggerSystemStop`/`clearSystemStop`/`acquireScopeLock`/`releaseScopeLock`-Aufruf erlaubt. | — |
| INFO | **`--confirm` sicher genug:** Default-Modus von `clear` ohne explizites Flag = `--dry-run` (Read-only-Vorschau). Mutation NUR bei `--confirm`. Kein `--force`/`--all`/`--bypass`/`--skip-validator`-Flag. AC + negative_constraint dreifach verankert. Audit-Event NUR vor erfolgreicher Mutation; Dry-Run schreibt KEIN Audit. | — |
| INFO | **Broad cleanup verhindert:** `clear` Pflicht-Argumente sind sowohl `<workorder_id>` als auch `--run-id <run_id>`. Kein Wildcard, kein `--all`. Negative_constraint "NIEMALS broad cleanup ohne exaktes (workorder_id, run_id)-Paar zulassen" explizit. | — |
| INFO | **JSONL-Audit-Files nicht direkt editiert:** `system/state/audit.jsonl`, `audit.error.jsonl`, `pipeline-audit.jsonl`, `pipeline-audit-live.jsonl` alle in `files_blocked`. CLI muss `auditTerminalWorkorderReset` (neue Convenience) verwenden, die intern `writeAuditEvent` aufruft. | — |
| INFO | **State-Manager-Helper additiv, keine Signatur-Änderung an existierenden Funktionen:** `getAllActiveWorkorders` und `removeTerminalActiveWorkorder` als neue exportierte Funktionen. AC + negative_constraint "NIEMALS bestehende state-manager-Funktionen in Signatur oder Verhalten ändern" explizit. | — |
| INFO | **Audit-Writer-Erweiterung additiv:** `auditTerminalWorkorderReset` als neue Convenience analog zu `auditScopeLockReleased`. `EventType`-Union wird um `'terminal_workorder_reset'` ergänzt — aktuell ist `EventType` (Zeile 10-29 in `audit-writer.ts`) ein closed Union, also Pflicht-Edit. Da `audit-writer.ts` in `scope_files` ist, ist diese Erweiterung erlaubt. | — |
| INFO | **Acceptance Criteria messbar:** 35 ACs, davon 31 binär verifizierbar (Code-Inspektion auf neue Funktionen, CLI-Output, Test-Lauf-Counts, Exit-Codes, Audit-Event-Vorhandensein, State-Diff vor/nach Cleanup). AC für "Audit NUR nach --confirm" ist via Audit-File-Inhalts-Diff zwischen Dry-Run und Confirm prüfbar. | — |
| INFO | **Validation-Commands passend:** `pnpm tsc --noEmit` + `npx tsx --test ...test.ts` + `CLI list` + `CLI clear ... --dry-run` (sicher: keine Mutation) + `Batch dry-run` als Smoke-Indikator. Implementer führt KEINEN `--confirm`-Cleanup im Rahmen der WO aus — das ist eine Tom-Aktion nach Closure. Sehr sauber. | — |
| INFO | **Architektur ist tatsächlich nur Terminal-WO-Reset-CLI:** Keine Änderung an Dispatch/Validator/Preflight/Review-Pipeline; keine Schema-Änderung; keine Auto-Cleanup-Logik; keine Lifecycle-Transition `failed → ready` (bewusst verworfen, siehe Variante 5). CLI ist ein optionaler Operator-Touchpoint, Production-Default bit-identisch ohne CLI-Aufruf. | — |
| INFO | **`<on_error>` umfassend:** TypeScript-Fehler, Breaking-Change in state-manager-API, alle out-of-scope-File-Edits, neue npm-Dependency, Migration-Erkennung, Security-Befund, system_stop/scope_locks-Touch (ESCALATE). Klare Eskalationspfade. | — |
| INFO | **Lifecycle korrekt:** `done → reviewed → closed` (architecture → Spark-D mandatory) per `wo_lifecycle_v1.md`. Auto-Retry für `architecture` deaktiviert per `CLAUDE.md` High-Risk-Regel. | — |
| LOW | **`EventType`-Union-Erweiterung-Wording konditional formuliert.** Implement-Schritt 2 (Zeile ~273): "Falls AuditEvent.event als Union-Typ enumeriert ist (statt freier String), Union additiv um 'terminal_workorder_reset' erweitern. Wenn AuditEvent als free-form-String typisiert ist, keine Type-Anpassung nötig." Tatsächlich IST `EventType` (`audit-writer.ts:10-29`) ein closed Union — die Type-Erweiterung ist Pflicht, nicht konditional. Direkter formulieren würde Implementer-Mehraufwand sparen. | Wording auf "Pflicht: `EventType`-Union (`audit-writer.ts:10`) additiv um `'terminal_workorder_reset'` erweitern; bestehende Union-Member unverändert" ändern. Optional: `defaultSeverity()` (Zeile 93) ggf. um den neuen Event ergänzen — falls die Funktion einen explizit erwartet. |
| LOW | **Test-Anzahl-AC nach Fix #1 anzupassen.** AC sagt: "Tests in system/control-plane/__tests__/terminal-wo-reset-cli.test.ts decken mindestens 12 Szenarien ab". Nach Entfernung von Eintrag (c) `status: 'blocked'` und seinem zugehörigen Test-Case sind es 11 Szenarien — oder ein zusätzlicher Refusal-Test mit z. B. `status: 'review'` als Ersatz. | Nach Fix #1 entweder die Mindest-Test-Anzahl auf 11 senken oder Eintrag (c) durch einen `status: 'review'`-Eintrag ersetzen, der dann als zusätzlicher Refusal-Test gegen non-terminal Status dient (semantisch konsistent). |

---

## Batch Readiness

**Not Ready** — vor Single-WO-Batch und Approval-Schritt müssen Fix #1 (CRITICAL: `'blocked'` aus clearable-Set entfernen) und Fix #2 (MINOR: Exit-Code-Konsistenz) eingearbeitet werden. Ohne Fix #1 würde der Implementer entweder TypeScript-Errors hinnehmen oder unbewusst die `ActiveWorkorder.status`-Union erweitern (was eine Schema-Änderung wäre, explizit verboten in negative_constraints und Out-of-Scope).

Nach den Fixes: Ready für `BATCH-GOVERNANCE-P1-006-terminal-wo-reset-cli` analog zu BATCH-003/004/005 und Approval-Gate (`requires_approval: true`).

---

## Required Fixes

1. **CRITICAL — `'blocked'` aus clearable-Set entfernen** (4 Stellen koordiniert ändern):
   - **Architekturentscheidung Bullet 2** (Zeile 71): `entry.status ∈ {'failed','done','blocked'}` → `entry.status ∈ {'failed','done'}`.
   - **`<implement>` Schritt 1 Code-Skizze**: `new Set(['failed', 'done', 'blocked'])` → `new Set(['failed', 'done'])`.
   - **`<implement>` Schritt 4 Test-Setup**: Eintrag (c) `WO-test-003 / RUN-003 / status: blocked` entweder entfernen oder auf einen `ActiveWorkorder.status`-konformen non-terminal Wert ändern (z. B. `'review'`), dann als zusätzlichen Refusal-Test verwenden.
   - **AC-Block** (Zeile ~316): "terminalem Status (failed\|done\|blocked)" → "terminalem Status (failed\|done)".
   - **Notes-Bullet** zur Begründung "Diese drei Status sind in `wo_lifecycle_v1.md` als terminal-aber-nicht-finally" → auf zwei reduzieren oder Begründung neu formulieren.
   - **Test-Anzahl-AC** ("mindestens 12 Szenarien") nach Anpassung ggf. auf 11 senken oder neuen Refusal-Test ergänzen.
   - Begründung: `state-manager.ts:32` definiert `ActiveWorkorder.status` als Union ohne `'blocked'`; Schema-Erweiterung ist explizit out-of-scope (negative_constraint Zeile ~24); `scheduler-preflight.ts:144-146` blockiert nur `'done'` und `'failed'` — `'blocked'` ist im Preflight-Reject-Pfad gar nicht relevant.

2. **MINOR — Exit-Code-Konsistenz für `clear` Sub-Command:**
   - Entscheidung im Architekturentscheidung-Block dokumentieren (Vorschlag): Exit 0 = success/found; Exit 1 = invalid usage / refusal (non-terminal, ambiguous, missing args, unknown sub-command); Exit 2 = no match (für `show` und `clear`).
   - `<implement>` Schritt 3 Code-Verhalten entsprechend differenzieren: `if (outcome.reason === 'no match') process.exit(2); else process.exit(1)` (oder analog).
   - AC-Block die drei Refusal-ACs ("Exit 1 bei nicht-terminal", "Exit 1 bei ambiguous", "Exit 2 bei no match") konsistent mit Implement-Verhalten halten.

3. **LOW (optional) — `EventType`-Union-Erweiterung explizit als Pflicht statt konditional:**
   - `<implement>` Schritt 2: "Falls AuditEvent.event als Union-Typ enumeriert ist..." → "Pflicht: `EventType`-Union (`audit-writer.ts:10`) additiv um `'terminal_workorder_reset'` erweitern; bestehende Member unverändert. `defaultSeverity()` ggf. um Standard-Severity `'warning'` ergänzen."

---

## Recommended Next Step

1. **Fix-Pass auf den Draft anwenden** — alle drei Korrekturen in einem Edit (Fix #1 koordiniert über 4-5 Stellen, Fix #2 Exit-Code-Schema, Fix #3 Wording-Klarstellung).
2. **Mini-Re-Review** (1-Zeiler PASS-Bestätigung) — empfohlen wegen `risk_category: architecture` und der Multi-Stelle-Natur von Fix #1.
3. **Single-WO-Batch erstellen** (`BATCH-GOVERNANCE-P1-006-terminal-wo-reset-cli.md`) analog zu BATCH-003/004/005.
4. **Approval-Gate** (`requires_approval: true`) durch Tom (`npx tsx system/approval/approval-cli.ts grant <approval_id>`).
5. **Senior-Coding-Agent ausführt:** neue CLI + 2 State-Manager-Helper + 1 Audit-Writer-Convenience + Test-File mit ~11-12 Szenarien.
6. **Spark-D Mandatory Review** vor `done → reviewed → closed`.
7. **Validation:** `pnpm tsc --noEmit`, `npx tsx --test terminal-wo-reset-cli.test.ts`, `npx tsx terminal-wo-reset-cli.ts list`, `... clear WO-nutrition-001 --run-id RUN-20260503-8238 --dry-run` (Vorschau, keine Mutation), Batch-Dry-Run READY_TO_RUN.
8. **Tom-Aktion nach Closure:** `npx tsx system/control-plane/terminal-wo-reset-cli.ts clear WO-nutrition-001 --run-id RUN-20260503-8238 --confirm` — entfernt den stale Eintrag mit Audit-Event. Anschließend Re-Run von BATCH-NUTRITION-P1-001 ohne weitere Operator-Intervention (sofern WO-005/009 alle Validator-FAILs verhindern).
9. **Optional Followup:** `WO-governance-011-stop-rule-cli` (analog für `system_stop` clear/status, separate Approval, Risk: `architecture`).

---

*Review erzeugt: 2026-05-03 — gemäß `MASTERPROMPT_WORKORDER_REVIEW.md`, gegen `workorder.schema.json`, `wo_lifecycle_v1.md`, `template_implementation_medium.md`, `state-manager.ts` (`ActiveWorkorder.status`-Union), `audit-writer.ts` (`EventType`-Union), `scheduler-preflight.ts` (Terminal-Reject-Logik) und WO-005/006/009 als Pattern-Vorlagen.*
