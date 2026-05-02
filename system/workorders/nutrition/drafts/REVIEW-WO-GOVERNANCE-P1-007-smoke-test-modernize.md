# REVIEW-WO-GOVERNANCE-P1-007-smoke-test-modernize.md

**Reviewed Draft:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-007-smoke-test-modernize.md`
**Reviewer:** Claude (Brain) · Workorder-Reviewer
**Review-Datum:** 2026-05-02

---

## Verdict

**PASS_WITH_FIXES**

Eine Pflicht-Korrektur an einem Mock-Body (Test 6 `required_gates`), sonst saubere Test-WO.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| **CRITICAL** | **Test 6 Mock fehlt `human-approval-gate`.** Im `<implement>`-Block A) ist `required_gates: ['files-scope-gate', 'review-gate']` spezifiziert. Validator §5 (`governance-validator.ts:272`) erzwingt `human-approval-gate` in `required_gates` IMMER, wenn `approvalTokenPresent=false`. Test 6 hat keinen Approval-Token (kein `approvalId` im ToolRequest, keine `gate.createApprovalToken`-Vorbereitung). Konsequenz: REWRITE × 2 → FAIL, `result.status === 'completed'` wird nie erreicht. | Test 6 `required_gates` auf `['files-scope-gate', 'review-gate', 'human-approval-gate']` setzen. Dispatcher-fail-cleanup-Tests zeigen das Pattern (Zeilen 170, 217, 259): jeder validator-PASS-Mock ohne Token enthält `human-approval-gate` und `production_execution_without_approval_token` zusammen. |
| MINOR | **Lifecycle-Zeile referenziert falsche `CLAUDE.md`-Regel.** Header-Zeile: "(autonom — `risk_category: test` erlaubt direktes Close per `CLAUDE.md` High-Risk-Regel)". Korrekt wäre "Autonom-Regel" — `test` steht im Autonom-Block, nicht High-Risk. Inhaltlich richtig, Bezeichnung falsch. | Satz auf "(autonom — `risk_category: test` erlaubt `done → closed` ohne Spark-D-Review per `CLAUDE.md` Autonom-Regel)" ändern. |
| INFO | **Schema-konform:** `workorder_id` matched `^WO-[a-z]+-[0-9]+$`; Pflichtfelder vorhanden; `negative_constraints` = 22 (≥4); `acceptance_criteria` = 15 (≥1); `scope_files` = 1 (≥1); `task` enthält XML-Block; kein `rollback_hint` nötig (nicht db-migration). | — |
| INFO | **Template-konform:** `template_test.md`-Struktur (XML-Task mit `<analyze>/<implement>/<constraints>/<on_error>`, `agent_id: test-agent`, "kein Production-Code ändern"-Constraint). | — |
| INFO | **`agent_id: test-agent` korrekt:** Existiert in `system/agent-registry/agents.json` (`type: executor`). Per `AGENT_VALIDATOR_MAP['test-agent'] = 'micro-executor'` (WO-005) sauber zum validator-zugelassenen Wert normalisiert. Kein Bootstrap-Workaround. | — |
| INFO | **`risk_category: test` + `requires_approval: false` korrekt:** `test` ist in `CLAUDE.md` Autonom-Block; Schema erlaubt den Wert (enum). | — |
| INFO | **Scope ist Mikro:** Genau 1 File (`smoke-test.ts`). `.claude/rules/scope.md` Limit (max 3 für Micro-WO) eingehalten. | — |
| INFO | **`files_blocked` korrekt verriegelt:** dispatcher.ts, governance-validator.ts, review-pipeline.ts, scheduler-preflight.ts, system/state/**, system/approval/**, system/workorders/cli/**, system/workorders/schemas/**, services/**, apps/**, supabase/**, package.json, .env*. Kein Loophole. | — |
| INFO | **Validator-Strenge bleibt:** `<constraints>` und `negative_constraints` schließen Edits an `governance-validator.ts`, ALLOWED_GATES/ALLOWED_AGENTS/ALLOWED_RISK_LEVELS-Erweiterung, `MAX_REWRITE_LOOPS`-Erhöhung und Bypass-Flags explizit aus. | — |
| INFO | **`dispatcher.ts` bleibt unangetastet:** Steht in `files_blocked` und in 2 negative_constraints. | — |
| INFO | **Acceptance Criteria messbar:** 15 ACs, davon 13 binär verifizierbar (Status-Asserts, tsc-Exit, Test-Lauf). AC "Tests 1, 2, 3, 4, 5, 8 bleiben unverändert (Bytes-identisch außerhalb der drei mockCallModel-Bodies)" ist via `git diff --stat` prüfbar. | — |
| INFO | **Validation Commands passend:** `pnpm tsc --noEmit` + `npx tsx system/control-plane/__tests__/smoke-test.ts`. Genau die zwei Befehle, die für eine Smoke-Test-Modernisierung nötig sind. Kein `npx tsx --test`-Aufruf nötig, da die Datei einen eigenen `runAll()`-Runner hat. | — |
| INFO | **OrchestratorIntent-Werte ansonsten validator-PASS:** `selected_agent: 'micro-executor'` ∈ ALLOWED_AGENTS; `risk_level: 'low'\|'high'` ∈ ALLOWED_RISK_LEVELS; `'files-scope-gate'`, `'review-gate'`, `'human-approval-gate'` ∈ ALLOWED_GATES; `'production_execution_without_approval_token'` enthält kein POSITIVE_STATE_KEYWORD; `execution_order`-Strings (`parse`/`validate`/`write`/`await_approval`) enthalten kein PRODUCTION_KEYWORD. | — |
| INFO | **Lifecycle korrekt:** `done → closed [Orchestrator — trivial WOs]` ist in `wo_lifecycle_v1.md` für `risk_category: test` zulässig. Kein Mandatory-Review-Gate. | — |

---

## Batch Readiness

**Not Ready** — vor Batch-Plan oder Direkt-Ausführung muss der CRITICAL-Fix (Test 6 `required_gates` ergänzen) ins Draft eingearbeitet werden. Ohne Fix produziert die Implementierung einen roten Test 6 und damit FAIL der gesamten WO.

Nach dem Fix: Ready für Single-WO-Direkt-Ausführung (`risk_category: test` → autonom, `requires_approval: false`). Kein Single-WO-Batch nötig — Test-WOs dürfen ohne Batch-Plan gefahren werden, sofern Tom dies wünscht.

---

## Required Fixes

1. **Test 6 `required_gates` korrigieren** im `<implement>`-Block A) der Draft:
   - Vorher: `required_gates: ['files-scope-gate', 'review-gate']`
   - Nachher: `required_gates: ['files-scope-gate', 'review-gate', 'human-approval-gate']`

   Begründung: Validator §5 fordert ohne Approval-Token IMMER `human-approval-gate` + `'production_execution_without_approval_token'` in `stop_conditions` (Letzteres ist bereits korrekt).

   Optional: AC-Block ergänzen um expliziten Punkt: "Test 6 required_gates enthält 'human-approval-gate' (Validator §5 ohne Approval-Token-Pflicht)".

2. *(Optional, MINOR)* Lifecycle-Header-Satz auf "Autonom-Regel" korrigieren statt "High-Risk-Regel".

---

## Recommended Next Step

1. **Fix-Pass auf den Draft anwenden** — beide Korrekturen in einem Edit (Test 6 required_gates + Lifecycle-Wording).
2. **Optional: Mini-Re-Review** (1-Zeiler) zur Bestätigung des Fixes — oder direkt:
3. **Direkt-Ausführung als Test-WO** über die normale Pipeline (`risk_category: test` + `requires_approval: false` erlaubt es). Kein Approval-Schritt, kein Batch-Plan nötig — `BATCH-GOVERNANCE-P1-004-smoke-test-modernize` ist möglich aber für Test-WOs überdimensioniert.
4. Nach `done → closed`: Smoke-Test-Run als Bestätigung, dass die nun grünen 9/9 Tests den heutigen Dispatcher-Vertrag prüfen — Voraussetzung für stabilen Regression-Indikator vor weiteren Nutrition-Workflow-Test-Runs.

---

*Review erzeugt: 2026-05-02 — gemäß `MASTERPROMPT_WORKORDER_REVIEW.md`, gegen `workorder.schema.json`, `wo_lifecycle_v1.md`, `template_test.md`, `governance-validator.ts` und `agents.json`.*
