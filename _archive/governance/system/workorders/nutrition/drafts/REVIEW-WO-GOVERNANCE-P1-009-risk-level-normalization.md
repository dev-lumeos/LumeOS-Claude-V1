# REVIEW-WO-GOVERNANCE-P1-009-risk-level-normalization.md

**Reviewed Draft:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-009-risk-level-normalization.md`
**Reviewer:** Claude (Brain) · Workorder-Reviewer
**Review-Datum:** 2026-05-03

---

## Verdict

**PASS_WITH_FIXES**

Zwei strukturell-relevante Korrekturen: (a) Parameter-Position-Wording in Architekturentscheidung; (b) Constraint vs Implement-Anweisung zur `selected_agent`-Block-Struktur. Mapping, Architektur-Variante und Scope sind sauber.

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| **MAJOR** | **Parameter-Position-Wording falsch in Architekturentscheidung Bullet 3 + 4.** Bullet 3 (Zeile 60) sagt: "`normalizeOrchestratorIntent()`-Signatur erweitern um **zweiten** optionalen Parameter `workorderRiskCategory?: string`". Bullet 4 (Zeile 63) sagt: "`wo.risk_category` als **zweiten** Parameter mitgeben". Aktuelle Signatur ist bereits `(intent, workorderAgentId)` — neuer Parameter ist der **DRITTE**. `<implement>` Schritt 3 (Zeile 178), die Code-Skizze (Zeilen 180-184) und der AC (`"dritten optionalen Parameter"`, Zeile 290) sind korrekt. Der Implementer könnte beim Lesen der Architekturentscheidung verwirrt werden und versehentlich `workorderAgentId` durch `workorderRiskCategory` ersetzen. | Architekturentscheidung Bullet 3 von "zweiten" auf "dritten" korrigieren; Bullet 4 von "als zweiten Parameter mitgeben" auf "als dritten Parameter mitgeben" korrigieren. |
| **MAJOR** | **Constraint "selected_agent-Normalisierung UNVERÄNDERT" widerspricht der Implementierung.** Aktueller `normalizeOrchestratorIntent`-Body hat **drei early-Returns** (Zeilen 189/193/195: `if valid → return intent`, `if mapping fails → return intent`, `return modified intent`). `<implement>` Schritt 3 verlangt aber, **nach** dem `selected_agent`-Block einen `risk_level`-Block laufen zu lassen mit `result = { ...result, risk_level: mappedLevel }`. Mit early-Returns ist das unmöglich — der Code MUSS strukturell zu einem Accumulator-Pattern (`let result = intent; ... return result`) refaktoriert werden. Constraint Zeile 232 ("Bestehende selected_agent-Normalisierung-Pfad unverändert") und negative_constraint "NIEMALS bestehende selected_agent-Normalisierung **umstrukturieren** oder entfernen" sind beide zu strikt formuliert. | Constraint und negative_constraint präzisieren auf: "Funktionales Input/Output-Verhalten der `selected_agent`-Normalisierung bleibt unverändert (gleicher `agentId` → gleicher `selected_agent`-Wert, gleiche unmodified-Pass-Through-Fälle). Die strukturelle Anpassung der Funktion (early-Returns → Accumulator-Pattern) ist erlaubt, sofern keine Verhaltensänderung resultiert." Optional einen AC ergänzen: "Bestehende `governance-validator-normalize.test.ts`-Tests aus WO-005 bleiben grün (read-only-Verifikation)." |
| INFO | **Schema-konform:** `workorder_id` matched `^WO-[a-z]+-[0-9]+$`; alle Pflichtfelder gesetzt; `negative_constraints`=24 (≥4); `acceptance_criteria`=22 (≥1); `scope_files`=4 (≥1); `task` enthält XML-Block; `rollback_hint` nicht nötig (nicht db-migration); `risk_category` ∈ enum; `priority` ∈ enum; `phase` ∈ enum. | — |
| INFO | **Template-konform:** `template_implementation_medium.md`-Struktur (XML-Task mit `<analyze>/<implement>/<constraints>/<on_error>`, `agent_id: senior-coding-agent`, `post_review_required: true`, 4 Files innerhalb 3-15-Range). | — |
| INFO | **`risk_category: architecture` korrekt:** Eingriff in Validator-Public-API (`normalizeOrchestratorIntent`-Signatur + neue exportierte Konstante/Helper) ist klassisch architecture per `CLAUDE.md` Cautious-Block. Spark-D-Mandatory-Review eingehalten. | — |
| INFO | **`requires_approval: true` korrekt:** Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel. | — |
| INFO | **`agent_id: senior-coding-agent` korrekt:** Existiert in `agents.json` (`type: executor_senior`); via `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) korrekt zu `ALLOWED_AGENTS`-Wert normalisiert. | — |
| INFO | **Mapping deckt CLAUDE.md High-Risk-Regel exakt ab:**
- Autonom (`docs`, `standard`, `i18n`, `test`) → `low` ✓
- Cautious (`security`, `auth`, `rls`, `shared-core`, `architecture`) → `medium` ✓
- High-Risk (`db-migration`, `payments`, `medical`, `release`) → `high` ✓
13 RiskCategory-Werte aus `risk-categories.ts:27-40` vollständig abgedeckt. Mapping ist sinnvoll und deterministisch. | — |
| INFO | **Scope angemessen:** 4 Files (`dispatcher.ts` + `governance-validator.ts` + 2 Tests). Konsistent mit `template_implementation_medium.md` (3-15) und Pattern-Vorlage WO-005. | — |
| INFO | **`files_blocked` korrekt:** `risk-categories.ts` (Single-Source-of-Truth bleibt unverändert), `workorder.schema.json` (enum bleibt), `services/scheduler-api/**`, `system/state/**`, `system/approval/**`, `system/workorders/cli/**`, `package.json`, `.env*`. Lückenlos. | — |
| INFO | **Fix ist tatsächlich nur `risk_level`-Normalisierung:** Keine Änderung an Validator-Konstanten, kein neuer Audit-Event-Typ (existierendes `'orchestrator_intent_normalized'` aus WO-005 wiederverwendet), keine Schema-Änderung. | — |
| INFO | **Validator nicht umgangen:** Constraint "Kein Bypass" + "risk_level-Check nicht entfernen" + "selected_agent-Check nicht entfernen" alle explizit verankert. ACs ebenfalls. Modell-gelieferter gültiger Wert hat IMMER Vorrang vor Mapping-Default — keine versteckte Erzwingung. | — |
| INFO | **`MAX_REWRITE_LOOPS` unverändert (2):** AC + negative_constraint + constraint dreifach verankert. | — |
| INFO | **`risk_level`-Check nicht entfernt:** §2 in `governance-validator.ts:223` bleibt. Normalization läuft VOR Validator (`parse → normalize → validate`); §2 sieht nach Normalization einen gültigen Wert (PASS) oder einen ungültigen (REWRITE/FAIL deterministisch). | — |
| INFO | **Acceptance Criteria messbar:** 22 ACs, davon 19 binär verifizierbar (Code-Inspektion auf Mapping-Vollständigkeit, Helper-Existenz, Signatur-Erweiterung, tsc-Exit, Test-Lauf-Counts, Batch-Dry-Run-Outcome). AC "selected_agent-Normalisierung bleibt strukturell und funktional unverändert" ist nach Fix-Pass präzise als "funktional unverändert" lesbar. | — |
| INFO | **Validation-Commands passend:** `pnpm tsc --noEmit` + `npx tsx system/control-plane/__tests__/smoke-test.ts` (ohne `--test` — korrekt, Smoke-Test hat eigene `runAll()`) + `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` (mit `--test` — korrekt, nutzt `node:test`) + Batch-Dry-Run als E2E-Smoke-Indikator. | — |
| INFO | **Konsistenz mit WO-005-Pattern:** Mapping-Konstante + Helper + `normalizeOrchestratorIntent`-Erweiterung ist 1:1 das WO-005-Vorgehen. Audit-Event wiederverwendet. Pattern-Vorlage explizit referenziert. | — |
| LOW | **Kein dedicated Test für neuen Helper / Mapping in scope_files.** `governance-validator-normalize.test.ts` (existiert seit WO-005) ist NICHT in `scope_files`, nur in `context_files`. WO-009 sagt explizit: "Falls bestehende governance-validator-normalize.test.ts Erweiterung braucht (sie liegt NICHT in scope_files): ESCALATE". Das macht die Test-Coverage des neuen Mapping reduziert — der Implementer könnte sich auf E2E-Verifikation via `smoke-test.ts` + `dispatcher-fail-cleanup.test.ts` + Batch-Dry-Run verlassen. Akzeptabel als Pragmatismus, aber explizit dedicated Mapping-Tests wären für eine architecture-WO mit neuer Public-API stärker. | Optional Followup-WO `WO-governance-010-validator-normalize-tests` (Risk: `test`, autonom) für Mapping-/Helper-Tests. Kein Blocker für WO-009. Alternativ: scope_files um `governance-validator-normalize.test.ts` erweitern, falls Tom additive Test-Erweiterung in WO-009 wünscht — würde WO leicht aufblähen. |
| LOW | **`<on_error>` doppelte ESCALATE-Pfade.** Sowohl "Bei Breaking Change in `normalizeOrchestratorIntent`-Public-API erkannt (zweiter Pflicht-Parameter)" als auch "Bei mehrdeutigem Mapping-Eintrag" sind ESCALATE. Die "zweiter Pflicht-Parameter"-Formulierung ist Wording-konsistent zu finden 1; nach Fix #1 sollte sie als "dritter Pflicht-Parameter" gelesen werden — Optional cleanup. | Wording in `<on_error>` Zeile 254 nach Fix #1 mitnehmen: "(dritter Pflicht-Parameter statt optional)". |

---

## Batch Readiness

**Not Ready** — vor Single-WO-Batch und Approval-Schritt müssen Fix #1 (Parameter-Position-Wording) und Fix #2 (Constraint-Präzisierung zu Refactor-Erlaubnis) eingearbeitet werden. Ohne Fix #2 würde der Implementer am Konflikt zwischen "umstrukturieren verboten" und "nach selected_agent-Block" hängenbleiben und ESCALATE auslösen.

Nach den Fixes: Ready für `BATCH-GOVERNANCE-P1-005-risk-level-normalization` analog zu `BATCH-004` und Approval-Gate (`requires_approval: true`).

---

## Required Fixes

1. **MAJOR — Parameter-Position-Wording in Architekturentscheidung korrigieren:**
   - Bullet 3 (Zeile 60): "**zweiten** optionalen Parameter" → "**dritten** optionalen Parameter".
   - Bullet 4 (Zeile 63): "als **zweiten** Parameter mitgeben" → "als **dritten** Parameter mitgeben".
   - Optional `<on_error>` Zeile 254: "(zweiter Pflicht-Parameter statt optional)" → "(dritter Pflicht-Parameter statt optional)".
   - Begründung: aktuelle Signatur ist `(intent, workorderAgentId)` — neuer Parameter ist Index 3.

2. **MAJOR — Constraint präzisieren auf "funktional unverändert" statt "strukturell unverändert":**
   - Constraint-Block (Zeile 232): "Kein Entfernen oder Lockern des selected_agent-Checks aus §1 (WO-005-Schicht bleibt)" — präzisieren zu: "Funktionales Input/Output-Verhalten der WO-005 selected_agent-Normalisierung bleibt unverändert (gleicher Input → gleicher Output). Strukturelle Refaktorierung des `normalizeOrchestratorIntent`-Body (z. B. early-Return → Accumulator-Pattern) ist erlaubt, sofern dies notwendig ist, um den `risk_level`-Block nach dem `selected_agent`-Block laufen zu lassen, und keine Verhaltensänderung der `selected_agent`-Normalisierung resultiert."
   - Negative Constraint "NIEMALS bestehende selected_agent-Normalisierung **umstrukturieren** oder entfernen" → ändern zu: "NIEMALS bestehende selected_agent-Normalisierung in ihrem Verhalten ändern oder entfernen (strukturelle Refaktorierung im Rahmen der `risk_level`-Erweiterung erlaubt, solange Verhalten erhalten bleibt)."
   - Optional AC ergänzen: "Bestehende `governance-validator-normalize.test.ts`-Tests aus WO-005 bleiben grün (read-only-Verifikation; falls eine Test-Anpassung zur Wahrung des Verhaltens nötig wäre → ESCALATE pro `<on_error>`)."

---

## Recommended Next Step

1. **Fix-Pass auf den Draft anwenden** — beide Korrekturen in einem Edit (Architekturentscheidung-Wording + Constraint-Präzisierung).
2. **Mini-Re-Review** (1-Zeiler PASS) — empfohlen wegen `risk_category: architecture`.
3. **Single-WO-Batch erstellen** (`BATCH-GOVERNANCE-P1-005-risk-level-normalization.md`) analog zu `BATCH-GOVERNANCE-P1-003/004`.
4. **Approval-Gate** (`requires_approval: true`) durch Tom (`npx tsx system/approval/approval-cli.ts grant <approval_id>`).
5. **Senior-Coding-Agent ausführt:** `RISK_CATEGORY_TO_RISK_LEVEL_MAP` + `mapRiskCategoryToRiskLevel` + `normalizeOrchestratorIntent`-Erweiterung in `governance-validator.ts` + `wo.risk_category`-Durchreichung in `dispatcher.ts`.
6. **Spark-D Mandatory Review** vor `done → reviewed → closed`.
7. **Validation:** `pnpm tsc --noEmit`, `npx tsx system/control-plane/__tests__/smoke-test.ts` (9/9), `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` (all PASS), `npx tsx system/workorders/cli/run-batch.ts ... --dry-run` (READY_TO_RUN).
8. **Re-Run-Test gegen `BATCH-NUTRITION-P1-001-db-foundation` `--run`:** Erwartung: WO-nutrition-001 (`docs`) erreicht `risk_level: 'low'` via Mapping → Validator §2 PASS → Worker fährt fort. WO-nutrition-002/003 (`db-migration`) pausieren am Approval-Gate (kein Auto-Grant — korrekt).
9. **Optional Followup:** `WO-governance-010-validator-normalize-tests` (Risk: `test`, autonom) für dedicated Mapping-/Helper-Tests in `governance-validator-normalize.test.ts`.

---

*Review erzeugt: 2026-05-03 — gemäß `MASTERPROMPT_WORKORDER_REVIEW.md`, gegen `workorder.schema.json`, `wo_lifecycle_v1.md`, `template_implementation_medium.md`, `governance-validator.ts`, `dispatcher.ts`, `risk-categories.ts`, `dispatcher-fail-cleanup.test.ts` und `WO-GOVERNANCE-P1-005` (Pattern-Vorlage).*
