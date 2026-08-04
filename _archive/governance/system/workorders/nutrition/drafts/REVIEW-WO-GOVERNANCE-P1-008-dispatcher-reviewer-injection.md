# REVIEW-WO-GOVERNANCE-P1-008-dispatcher-reviewer-injection.md

**Reviewed Draft:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-008-dispatcher-reviewer-injection.md`
**Reviewer:** Claude (Brain) · Workorder-Reviewer
**Review-Datum:** 2026-05-02

---

## Verdict

**PASS_WITH_FIXES**

Zwei Pflicht-Korrekturen am Mock-Reviewer-JSON-Vertrag und an einem Validation-Command. Architektur-Entscheidung und Scope sind sauber.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| **CRITICAL** | **Mock-Reviewer-JSON entspricht nicht `ReviewOutput`-Contract.** WO-008 spezifiziert sowohl in der Architekturentscheidung (Zeile 70) als auch im `<implement>`-Schritt 3 (Zeilen 138-139): `{ status: 'PASS', confidence: 0.9, risk: 'low', findings: [], requires_claude: false }`. Aber `governance-validator.ts:372-380` definiert `ReviewOutput` mit Pflichtfeldern `status`, `risk: 'LOW'\|'MEDIUM'\|'HIGH'` (UPPERCASE!), `confidence`, `violations: string[]`, `recommendations: string[]`, `summary: string`, `requires_claude: boolean`. Der vorgeschlagene Mock fehlen: `violations`, `recommendations`, `summary`; `risk: 'low'` ist UPPERCASE-Verletzung; `findings` ist kein Feld in `ReviewOutput`. `validateReviewOutput()` (`governance-validator.ts:389`) würde werfen → `parseReviewerJson` Catch → `failureReason: 'invalid_json'` (`review-pipeline.ts:254`) → Spark-D Eskalation → HUMAN_NEEDED → Test 6 bleibt `blocked`. **WO erreicht ihr eigenes ACs nicht ohne diesen Fix.** | Mock-JSON in beiden Stellen (Architekturentscheidung Zeile 70 + `<implement>` Schritt 3) korrigieren auf: `{ status: 'PASS', risk: 'LOW', confidence: 0.9, violations: [], recommendations: [], summary: 'mock spark-c pass', requires_claude: false }`. Optional ein Hinweis ergänzen, dass `risk` UPPERCASE ist (Reviewer-Risk-Casing ≠ Orchestrator-risk_level Casing — bewusst getrennte Domänen per `governance-validator.ts:386-387` Kommentar). |
| **MAJOR** | **Validation-Command für smoke-test.ts falsch.** WO-008 listet `npx tsx --test system/control-plane/__tests__/smoke-test.ts`. `smoke-test.ts` nutzt jedoch keinen `node:test`-Runner sondern eine eigene `runAll()`-Funktion am Datei-Ende (`smoke-test.ts:259-293`). Mit `--test` wird die Datei als node:test-Suite interpretiert, findet keine `it()`/`test()`-Aufrufe und meldet false-PASS oder Skip. Korrekter Befehl: `npx tsx system/control-plane/__tests__/smoke-test.ts`. Bei `dispatcher-fail-cleanup.test.ts` ist `--test` dagegen RICHTIG (nutzt `describe/it` aus `node:test`). | `validation_commands` korrigieren: Smoke-Test-Zeile auf `npx tsx system/control-plane/__tests__/smoke-test.ts` (ohne `--test`); `dispatcher-fail-cleanup.test.ts` mit `--test` lassen. AC-Block analog: Zeile "smoke-test.ts → 9/9 bestanden" ohne `--test` formulieren. |
| INFO | **Schema-konform:** `workorder_id` matched `^WO-[a-z]+-[0-9]+$`; alle Pflichtfelder gesetzt; `negative_constraints`=22 (≥4); `acceptance_criteria`=20 (≥1); `scope_files`=3 (≥1); `task` enthält XML-Block; `rollback_hint` nicht nötig (nicht db-migration); `risk_category` ∈ enum; `priority` ∈ enum; `phase` ∈ enum. | — |
| INFO | **Template-konform:** `template_implementation_medium.md`-Struktur (XML-Task mit `<analyze>/<implement>/<constraints>/<on_error>`, `agent_id: senior-coding-agent`, `post_review_required: true`, 3-15 Files-Range eingehalten mit 3 Files). | — |
| INFO | **`risk_category: architecture` korrekt:** Eingriff in `dispatcher.ts`-Public-API (`DispatcherDeps`-Interface) ist klassisch architecture per `CLAUDE.md` Cautious-Block. Spark-D-Mandatory-Review eingehalten, Auto-Retry deaktiviert. | — |
| INFO | **`requires_approval: true` korrekt:** Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel. | — |
| INFO | **`agent_id: senior-coding-agent` korrekt:** Existiert in `agents.json` (`type: executor_senior`); via `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) sauber zum validator-zugelassenen Wert normalisiert. | — |
| INFO | **Scope angemessen:** 3 Files (`dispatcher.ts` + 2 Test-Files). `dispatcher-fail-cleanup.test.ts` ist defensiv in scope_files für den Fall, dass Tests doch die Review-Pipeline erreichen — Default-Erwartung pro WO ist "kein Edit nötig", was korrekt ist (FAIL-Pfade brechen vor `executeTool` ab). | — |
| INFO | **`files_blocked` korrekt verriegelt `services/scheduler-api/**`:** `vllm-adapter.ts` (Production-Default `callGemmaReviewer`) bleibt unangetastet. Production-Default-Pfad (`?? callGemmaReviewer`) bleibt der einzige Konsument. | — |
| INFO | **`files_blocked` korrekt verriegelt `review-pipeline.ts`:** `PipelineDeps.callFastReviewer` existiert bereits (`review-pipeline.ts:50-60`); Dispatcher reicht seinen optionalen `callFastReviewer` durch — keine Pipeline-Edit nötig. ESCALATE-Pfad in `<on_error>` korrekt für unerwartete Edge-Cases dokumentiert. | — |
| INFO | **Architektur ist tatsächlich nur DI:** `DispatcherDeps`-Interface erweitert um optionales Feld; einzige Verhaltensänderung ist `?? callGemmaReviewer`-Fallback an genau einer Stelle (`dispatcher.ts:600`). Kein neuer Code-Pfad bei Default-Aufruf. Production bit-identisch. | — |
| INFO | **Test 6 nicht auf 'blocked' verschlechtert:** AC "Test 6 result.status === 'completed'" (Zeile 217) und negative_constraint "NIEMALS Smoke-Test-Erwartung von Test 6 auf 'blocked' verschlechtern" (Zeile 243) explizit verankert. | — |
| INFO | **Spark-D-Injection korrekt out-of-scope:** Begründung über `review-pipeline.ts:358` schlüssig — bei Spark-C PASS wird Spark-D nicht aufgerufen, ergo Mock-Reviewer auf Spark-C reicht für Test 6. Edge-Cases mit Escalation/BLOCKED bleiben für eine zukünftige WO. | — |
| INFO | **Acceptance Criteria messbar:** 20 ACs, davon 17 binär verifizierbar (TypeScript-Exit, Test-Lauf-Counts, Code-Inspektion auf Interface-Felder, Audit-Event-Vorhandensein). AC "Production-Default-Verhalten ist BIT-IDENTISCH" ist via Code-Diff-Review verifizierbar. | — |
| INFO | **`<on_error>` umfassend:** Deckt TypeScript-Fehler, Breaking-Change-Erkennung, `review-pipeline.ts`-Eskalation, `services/scheduler-api/**`-Stop, `governance-validator.ts`-Stop, neue npm-Dependency, Test-FAIL-Reporting. ESCALATE für `review-pipeline.ts` als Sicherheitsnetz wenn Implementer doch Erweiterung braucht. | — |
| INFO | **Lifecycle korrekt:** `done → reviewed → closed` (architecture → Spark-D mandatory) per `wo_lifecycle_v1.md`. Auto-Retry für `architecture` deaktiviert per `CLAUDE.md` High-Risk-Regel. | — |
| INFO | **Schließt Tom's Review-Liste vollständig ab:** schema ✓ template ✓ risk_category ✓ requires_approval ✓ agent_id ✓ scope ✓ FILES_ALLOWED/BLOCKED ✓ DI-only ✓ production-default ✓ review-pipeline blockiert ✓ services/scheduler-api blockiert ✓ Test-6 nicht abgeschwächt ✓ ACs messbar ✓ Validation-Commands meist passend (siehe MAJOR oben) ✓. | — |

---

## Batch Readiness

**Not Ready** — vor Batch-Plan oder Approval-Schritt müssen die zwei Pflicht-Fixes (Mock-JSON-Schema + Validation-Command) ins Draft eingearbeitet werden. Ohne Fix produziert die Implementierung trotz korrekter DI-Architektur einen weiterhin roten Test 6 (CRITICAL) bzw. unklare Validation-Reports (MAJOR).

Nach den Fixes: Ready für Single-WO-Batch (`BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection.md`) und Approval-Gate (`requires_approval: true`).

---

## Required Fixes

1. **CRITICAL — Mock-Reviewer-JSON-Vertrag korrigieren** an zwei Stellen im Draft (Architekturentscheidung Zeile 70 + `<implement>` Schritt 3 Zeilen 138-139):

   - Vorher: `{ status: 'PASS', confidence: 0.9, risk: 'low', findings: [], requires_claude: false }`
   - Nachher: `{ status: 'PASS', risk: 'LOW', confidence: 0.9, violations: [], recommendations: [], summary: 'mock spark-c pass', requires_claude: false }`

   Begründung: `ReviewOutput`-Pflichtfelder pro `governance-validator.ts:372-380`; `risk` ist UPPERCASE-Domain (Reviewer ≠ Orchestrator); `findings` existiert nicht im Contract; `violations`/`recommendations`/`summary` fehlen; `validateReviewOutput()` würde sonst werfen und Test 6 würde weiter mit `failureReason: 'invalid_json'` enden.

   Optional AC-Ergänzung: "Mock-Reviewer-JSON in Test 6 erfüllt vollständigen `ReviewOutput`-Contract (status, risk UPPERCASE, confidence ≥ 0.75, violations, recommendations, summary, requires_claude=false)".

2. **MAJOR — Validation-Command-Korrektur** in `validation_commands`-Block (Zeile 274-276) und im AC-Block (Zeile 230):

   - Vorher (Zeile 275): `"npx tsx --test system/control-plane/__tests__/smoke-test.ts"`
   - Nachher: `"npx tsx system/control-plane/__tests__/smoke-test.ts"` (ohne `--test`)

   Begründung: `smoke-test.ts` nutzt eigene `runAll()`-Schleife (siehe `smoke-test.ts:259-293`), keine `node:test`-Suite. Mit `--test` interpretiert tsx die Datei als node:test-Modul und findet keine `it()`-Aufrufe. `dispatcher-fail-cleanup.test.ts` mit `--test` ist korrekt (nutzt `describe/it`).

   AC Zeile 230 entsprechend anpassen: `"npx tsx system/control-plane/__tests__/smoke-test.ts → 9/9 bestanden"`.

---

## Recommended Next Step

1. **Fix-Pass auf den Draft anwenden** — beide Korrekturen in einem Edit:
   - Mock-JSON an 2 Stellen (Architekturentscheidung + `<implement>`)
   - Validation-Command (1 Stelle in `validation_commands` + 1 Stelle in AC)
2. **Mini-Re-Review** (1-Zeiler PASS-Bestätigung) — empfohlen wegen `risk_category: architecture`.
3. **Single-WO-Batch erstellen** (`BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection.md`) analog zu `BATCH-GOVERNANCE-P1-003`.
4. **Approval-Gate** (`requires_approval: true`) durch Tom (`npx tsx system/approval/approval-cli.ts grant <approval_id>`).
5. **Senior-Coding-Agent ausführt:** DI-Erweiterung in `dispatcher.ts` + Mock-Reviewer-Injection in `smoke-test.ts` Test 6.
6. **Spark-D Mandatory Review** vor `done → reviewed → closed`.
7. **Validation:** `pnpm tsc --noEmit`, `npx tsx system/control-plane/__tests__/smoke-test.ts` (9/9), `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` (all PASS).

---

*Review erzeugt: 2026-05-02 — gemäß `MASTERPROMPT_WORKORDER_REVIEW.md`, gegen `workorder.schema.json`, `wo_lifecycle_v1.md`, `template_implementation_medium.md`, `dispatcher.ts`, `review-pipeline.ts`, `governance-validator.ts` (`ReviewOutput`-Contract), `smoke-test.ts` (Runner-Pattern) und `agents.json`.*
