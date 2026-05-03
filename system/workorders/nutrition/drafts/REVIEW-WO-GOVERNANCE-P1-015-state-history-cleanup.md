# REVIEW-WO-GOVERNANCE-P1-015-state-history-cleanup.md

## Verdict
**PASS**

## Findings

| Severity | Finding | Fix |
|---|---|---|
| INFO | Schema-Kompatibilität verifiziert: `workorder_id: WO-governance-015` matcht `^WO-[a-z]+-[0-9]+$`; `task` enthält `<task>…</task>` mit allen 4 Sub-Tags; `scope_files` 4 Items (≥1); `acceptance_criteria` 39 Items (≥1); `negative_constraints` 33 Items (≥4); `risk_category: architecture` und `phase: 1` gültige Enum-Werte; `rollback_hint` nicht erforderlich (kein `db-migration` per Schema if/then). | — |
| INFO | Code-Faktencheck gegen Repo-Stand: `EventType` in `audit-writer.ts:30` enthält bereits `'terminal_workorder_reset'` → additive Erweiterung um `'stale_dispatched_workorder_cleanup'` semantisch korrekt; `ActiveWorkorder.status`-Union (`state-manager.ts:32`) enthält `'dispatched'`; `Run.status`-Union (`:21`) deckt `completed|failed|blocked|awaiting_approval|running` ab; `getActiveRuns()` (`:237`) filtert nur `'running'` → Begründung für neuen `getActiveRunByRunId`-Helper korrekt; `TERMINAL_CLEARABLE = ['failed','done']` (`:327-328`) bleibt 1:1; bestehende CLI hat 3 Sub-Commands → 4. Sub-Command additiv. | — |
| INFO | Sicherheitsmodell ist solide: separater Sub-Command `clear-stale-dispatched` (statt Flag-Erweiterung von `clear`); evidence-gated (3 Kinds: `active_run_terminal`, `no_active_run_and_age`, `operator_threshold`); State-Manager verifiziert Evidence selbst gegen den State (nicht nur CLI-Deklaration); explizite Refusal-Pfade bei `running`/`awaiting_approval` `active_run`; eigener Audit-Event-String differenziert Forensic-Trail von WO-010-Cleanup; exakter `<workorder_id>` + `--run-id` Pflicht; kein `--force`/`--all`/`--bypass`/Wildcard. | — |
| INFO | Out-of-Scope-Trennung sauber: `system_stop`, `scope_locks`, `approval-Queue`, `dispatcher.ts`, `governance-validator.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `services/scheduler-api/**`, `system/workorders/cli/**`, `runtime_state.json`, `*.jsonl`, `package.json`, ENV-Files alle in `files_blocked` und/oder `negative_constraints` bestätigt. WO-010 `clear`-Default-Verhalten bleibt 1:1 (`failed|done`-only Gate). | — |
| LOW | Validation Command 5 (`clear-stale-dispatched WO-nutrition-001 --run-id RUN-20260502-6627 --dry-run`) verlässt sich auf den **Live-State** zur Closure-Validation. Falls Tom vor der WO-Ausführung die stale-Einträge bereits anders bereinigt hat (z. B. via Reboot, Lifecycle-Event-Reset), liefert dieselbe Command Exit 2 statt Exit 0. Kein Blocker — die Tests verifizieren das Verhalten deterministisch im TEST_DIR. Empfehlung: Implementer-Hinweis oder Acceptance-Kriterium mit OR-Klausel ("Exit 0 falls Eintrag noch live; Exit 2 falls bereits bereinigt — beides spec-konform"). | Optionaler Klarstellungs-Satz im Acceptance-Kriterium oder Implement-Block. Ohne Fix: Implementer behandelt Exit 2 als Refusal — was ebenfalls korrekt ist. |
| LOW | Evidence-`kind`-Auswahl auf CLI-Seite hat eine implizite Priorität: `active_run_terminal` (wenn `active_run` mit terminalem Status existiert) → `no_active_run_and_age` (Default 60min, wenn kein `active_run`) → `operator_threshold` (wenn `--older-than-minutes` explizit). Bei Kollisions-Fall (z. B. `active_run` terminal UND `--older-than-minutes` explizit) ist Default-Verhalten nicht im Draft fixiert. State-Manager-Funktion verifiziert ohnehin gegen den State, daher kein Sicherheitsproblem — nur UX-Klarheit. | Optional: Reihenfolge-Regel im Implement-Block fixieren ("Operator-Threshold dominiert, wenn `--older-than-minutes` gesetzt"). |
| INFO | Acceptance Criteria sind messbar: 39 konkrete Items decken State-Manager-API, Audit-Differenzierung, CLI-Sub-Command-Verhalten, Refusal-Pfade, Exit-Code-Schema, Test-Mindestabdeckung (22 Szenarien), Validation-Commands, WO-010-Regression-Schutz und Ko-Existenz mit smoke-test/dispatcher-fail-cleanup ab. | — |

## Batch Readiness
**Ready** — als Single-WO-Batch nach BATCH-GOVERNANCE-P1-010-Pattern.

Risk-Profil identisch zu WO-010/014: `architecture` → Cautious-Tier per `CLAUDE.md` → Spark-D-Mandatory-Review-Pflicht, kein Auto-Retry, `requires_approval: true`. Single-WO-Batch erlaubt klare Approval-Granting durch Tom nach Spark-D-Review.

`agent_id: senior-coding-agent` ist konsistent mit Template `template_implementation_medium.md` (3-15 Files, Cross-Module Impact möglich) und mit den existierenden WO-010/011/014 als Pattern-Vorlagen.

`blocked_by: []` ist korrekt — WO-005…014 sind alle closed; keine offene Vorgänger-Dependency.

## Required Fixes
Keine. Die zwei LOW-Findings sind UX-Klarstellungen ohne Sicherheits- oder Schema-Impact und können entweder im Implement-Block des WO-Drafts (vor Batch-Erstellung) oder im finalen Implementer-Code (mit kurzer Doc-Comment) adressiert werden — beides nicht-blockierend.

## Recommended Next Step
Batch-Plan für Single-WO-Batch `BATCH-GOVERNANCE-P1-011-state-history-cleanup` erstellen analog zu BATCH-GOVERNANCE-P1-010 (siehe `MASTERPROMPT_WORKORDER_BATCH_PLAN.md`). Approval-Gate setzen mit Spark-D-Mandatory-Review. Implementation und Closure analog zur WO-014-Sequenz (3 Commits: Code → Closure-Doku → ggf. Workflow-Test-Snapshot).
