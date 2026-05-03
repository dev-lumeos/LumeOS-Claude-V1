# WO-GOVERNANCE-P1-009 — risk_level Normalization V1

**Status:** draft
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befund Nutrition Batch 001 `--run` nach Closure von WO-005/006/007/008 und nach `clearSystemStop`: `WO-nutrition-001` failed mit "`Governance: REWRITE-Limit (2) erreicht. Letzte Verletzung: Ungültiger risk_level: undefined`" (`RUN-20260503-8238`). Kein stale Lock, kein `selected_agent`-Problem mehr (WO-005 wirkt korrekt). Verbleibender Validator-Gap: `risk_level` wird vom Modell-Output nicht zuverlässig geliefert; Validator §2 (`governance-validator.ts:223`) wirft REWRITE → nach 2 Versuchen FAIL.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- `selected_agent`-Normalisierung (bereits in WO-005 erledigt — bleibt unangetastet).
- Dispatcher FAIL/Cleanup-Logik (bereits in WO-006 erledigt).
- Smoke-Test-Mock-Modernisierung (bereits in WO-007 erledigt).
- Dispatcher-Reviewer-Injection (bereits in WO-008 erledigt).
- Review-Pipeline Spark-D-Injection (separate künftige WO).
- Batch-Loader-Änderungen (`system/workorders/cli/**`).
- Nutrition-DB-Implementation oder Supabase-Migration-Execution.
- Approval-Auto-Granting.
- Änderung des Workorder-Schemas (`risk_category` enum).
- Änderung der `RISK_PROFILES` aus `risk-categories.ts`.
- Modell-Prompt-Tuning (Orchestrator-System-Prompt).
- Erweiterung von `ALLOWED_RISK_LEVELS` (`'low' | 'medium' | 'high'` bleiben).

---

## Problem Statement

Nach Closure von WO-005/006/007/008 erreicht `BATCH-NUTRITION-P1-001-db-foundation` `--run` den Governance-Validator. WO-005 sorgt dafür, dass `selected_agent` nie undefined ist. WO-006 gibt Locks auf jedem FAIL-Pfad sauber frei. Das verbleibende Validator-Problem:

1. Modell-Output (Claude Code Orchestrator, `orchestration_mode: claude_code`) enthält `risk_level: undefined` (nicht zuverlässig generiert).
2. Validator §2 (`governance-validator.ts:223-229`) prüft `if (!ALLOWED_RISK_LEVELS.has(intent.risk_level))` → REWRITE.
3. Nach `MAX_REWRITE_LOOPS = 2` Wiederholungen → FAIL, Run terminal `failed`.
4. Beobachtet aktuell bei `RUN-20260503-8238` (WO-nutrition-001, `risk_category: docs`).

**Architektonisches Defizit:** Im Gegensatz zu `selected_agent` (WO-005) gibt es keine Normalisierungs-Schicht für `risk_level`. Die Information ist deterministisch aus `workorder.risk_category` ableitbar — sie muss vom Modell nicht generiert werden, der Dispatcher kann sie selbst auffüllen.

**Wirkung:**
- Jedes WO mit nicht-zuverlässigem Modell-Output blockiert auf `risk_level`-FAIL.
- Re-Runs derselben Batch produzieren denselben Failure.
- Auto-Stop-Rule (Schwellwert 5) wird wieder ausgelöst, Operator-Intervention nötig.
- Workflow-Test-Sequenz von BATCH-NUTRITION-P1-001 bleibt blockiert.

**Ziel:** Eine deterministische `risk_category → risk_level`-Mapping-Schicht in `governance-validator.ts` ergänzen und die existierende `normalizeOrchestratorIntent()` aus WO-005 erweitern, sodass `risk_level` aus dem Workorder-Kontext aufgefüllt wird, wenn der Modell-Output undefined oder nicht in `ALLOWED_RISK_LEVELS` ist. Validator-Strenge bleibt unverändert — der Validator sieht nach Normalization entweder einen gültigen Wert oder einen ungültigen, und entscheidet deterministisch (REWRITE bei explizit-falschen Werten, PASS bei aufgefüllten).

---

## Architekturentscheidung (verbindlich)

**Variante 1: Mapping-Layer analog zu WO-005 `AGENT_VALIDATOR_MAP` (Default).**

Erweiterung in `governance-validator.ts`:

1. Neue Konstante `RISK_CATEGORY_TO_RISK_LEVEL_MAP: Record<RiskCategory, 'low' | 'medium' | 'high'>` mit der vom Plan vorgegebenen Mapping:
   - `docs`, `standard`, `test`, `i18n` → `'low'`
   - `architecture`, `security`, `auth`, `rls`, `shared-core` → `'medium'`
   - `db-migration`, `payments`, `medical`, `release` → `'high'`
2. Neue Helper-Funktion `mapRiskCategoryToRiskLevel(riskCategory: string | undefined): 'low' | 'medium' | 'high' | undefined`.
3. `normalizeOrchestratorIntent()`-Signatur erweitern um **dritten** optionalen Parameter `workorderRiskCategory?: string` (zweiter Parameter `workorderAgentId` bleibt unverändert an Position 2). Body-Logik:
   - Wenn `intent.risk_level` ein gültiger `ALLOWED_RISK_LEVELS`-Wert ist → unverändert (Modell-Wert gewinnt).
   - Sonst: Lookup über `mapRiskCategoryToRiskLevel(workorderRiskCategory)`. Falls Mapping liefert → `intent.risk_level` setzen. Sonst: intent unverändert zurückgeben (Validator entscheidet deterministisch REWRITE → FAIL).
4. Aufruf in `dispatcher.ts:normalizeOrchestratorIntent`-Stelle: `wo.risk_category` als **dritten** Parameter mitgeben (Position-Reihenfolge: `intent`, `wo.agent_id`, `wo.risk_category`).

Das Pattern ist 1:1 das WO-005-Pattern — gleiche Architektur, gleiche Test-Topologie, gleiches Audit-Verhalten.

Alternativen verworfen:
- **Variante 2: Modell-Prompt-Tuning** — System-Prompt um expliziten `risk_level`-Pflicht-Hinweis erweitern. Anfällig für Modell-Drift, nicht-deterministisch, nicht-architektonisch — verworfen.
- **Variante 3: Validator §2 toleranter machen** — `risk_level: undefined` als Synonym für `'low'` interpretieren. Schwächt Validator-Strenge, verwischt explizite vom Modell gemeldete Werte mit Default. Verworfen.
- **Variante 4: `RISK_PROFILES` aus `risk-categories.ts` um ein `risk_level`-Feld erweitern** — würde `risk-categories.ts` mutieren (außerhalb des minimalen Scopes). Das aktuelle WO benötigt nur das Mapping; `risk-categories.ts`-Erweiterung ist später möglich, gehört aber nicht hierher. Verworfen.

In allen Varianten:
- `ALLOWED_RISK_LEVELS` bleibt `{ 'low', 'medium', 'high' }`.
- `MAX_REWRITE_LOOPS` bleibt 2.
- `normalizeOrchestratorIntent()`-Aufruf-Reihenfolge im Dispatcher bleibt: `parse → normalize → validate`.
- Kein Validator-Bypass.
- Modell-gelieferter gültiger Wert hat IMMER Vorrang vor Mapping-Default.
- Existierende `selected_agent`-Normalisierung aus WO-005 bleibt **funktional unverändert** (gleicher Input → gleicher `selected_agent`-Output, gleiche Pass-Through-Fälle). Eine **interne strukturelle Refaktorierung** des `normalizeOrchestratorIntent`-Body von early-Returns auf ein Accumulator-Pattern (`let result = intent; ... return result`) ist erlaubt und nötig, damit der `risk_level`-Block nach dem `selected_agent`-Block laufen kann. Verhalten der WO-005-Schicht bleibt 1:1 erhalten.

---

## Workorder

```yaml
workorder_id: "WO-governance-009"
agent_id:     "senior-coding-agent"
phase:        1
priority:     "normal"
quality_critical: false
requires_approval: true
risk_category: "architecture"

task: |
  <task>
    <analyze>
      Lies vollständig:
      - system/control-plane/governance-validator.ts
        (ALLOWED_RISK_LEVELS Set ab Zeile 91; AGENT_VALIDATOR_MAP ab Zeile 57;
        mapAgentToValidatorTarget ab Zeile 76; normalizeOrchestratorIntent ab Zeile 183;
        validateOrchestratorIntent §2 risk_level-Check ab Zeile 223)
      - system/control-plane/dispatcher.ts (Aufruf-Stelle parseOrchestratorIntent →
        normalizeOrchestratorIntent → validateOrchestratorIntent; aktuelle Signatur
        normalizeOrchestratorIntent(intent, wo.agent_id))
      - system/control-plane/risk-categories.ts
        (RiskCategory Type-Definition; RISK_PROFILES; ALL_RISK_CATEGORIES als Referenz)
      - system/control-plane/__tests__/smoke-test.ts (Test 6 mockCallModel-Output
        liefert bereits risk_level: 'low' im Combined-JSON — keine Mock-Anpassung nötig
        sofern risk_level valide ist)
      - system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts (Pattern für
        DispatcherDeps-Mocks mit OrchestratorIntent + ToolRequest)
      - system/control-plane/__tests__/governance-validator-normalize.test.ts (Pattern
        für Validator-Normalization-Tests aus WO-005 — als Vorlage für neue Tests)
      - system/workorders/schemas/workorder.schema.json (risk_category enum)
      - system/workorders/lifecycle/wo_lifecycle_v1.md
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
        (Pattern-Vorlage — gleiches Mapping-Layer-Konzept, gleiche Validator-Stelle,
        gleiche Test-Topologie)

      Identifiziere die exakten Stellen:
        - governance-validator.ts: nach AGENT_VALIDATOR_MAP eine zweite Mapping-Konstante
          RISK_CATEGORY_TO_RISK_LEVEL_MAP einfügen.
        - governance-validator.ts: Helper mapRiskCategoryToRiskLevel ergänzen.
        - governance-validator.ts: normalizeOrchestratorIntent() um dritten optionalen
          Parameter workorderRiskCategory (Position 3, nach intent und workorderAgentId)
          erweitern und Body-Logik um risk_level-Fallback erweitern.
        - dispatcher.ts: normalizeOrchestratorIntent-Aufruf um wo.risk_category
          ergänzen.
        - smoke-test.ts: Mocks bereits risk_level-konform aus WO-007 (Test 6: 'low',
          Test 7A/B: 'high') — keine Mock-Änderung erwartet. Read-only-Verifikation.
        - dispatcher-fail-cleanup.test.ts: Tests verifizieren weiterhin alle
          FAIL-Pfade. Falls neue Tests sinnvoll sind (z. B. Lock-Release wenn
          risk_level normalisiert werden müsste aber risk_category fehlt), additiv.
        - Neuer Test-File-Edit ist nicht zwingend Pflicht — bestehende
          governance-validator-normalize.test.ts kann erweitert werden, aber sie liegt
          nicht in scope_files. Wenn der Implementer neue Tests dort braucht, ESCALATE.

      Schreibe architecture_notes mit gewählter Variante (Variante 1 = Default) und
      bestätige, dass:
        - selected_agent-Normalisierung FUNKTIONAL unverändert bleibt (gleicher Input
          → gleicher selected_agent-Output, gleiche Pass-Through-Fälle). Interne
          strukturelle Refaktorierung des Bodys (z. B. early-Returns → Accumulator)
          ist erlaubt und im Implement-Schritt notwendig, ohne Verhaltensänderung.
        - Modell-gelieferter gültiger risk_level immer Vorrang behält.
        - Validator §2 Fail-Verhalten bei unbekannter risk_category unverändert (REWRITE → FAIL).
    </analyze>

    <implement>
      Implementiere Variante 1 (Mapping-Layer + Normalize-Erweiterung).

      Schritt 1 — governance-validator.ts: RISK_CATEGORY_TO_RISK_LEVEL_MAP.
      - Direkt nach AGENT_VALIDATOR_MAP (Zeile ~57-72) eine neue exportierte Konstante:
          export const RISK_CATEGORY_TO_RISK_LEVEL_MAP: Record<string, 'low' | 'medium' | 'high'> = {
            'docs':         'low',
            'standard':     'low',
            'test':         'low',
            'i18n':         'low',
            'architecture': 'medium',
            'security':     'medium',
            'auth':         'medium',
            'rls':          'medium',
            'shared-core':  'medium',
            'db-migration': 'high',
            'payments':     'high',
            'medical':      'high',
            'release':      'high',
          }
      - Werte nur 'low' | 'medium' | 'high' (Subset von ALLOWED_RISK_LEVELS).
      - Mapping deckt ALLE 13 RiskCategory-Werte aus risk-categories.ts ab.

      Schritt 2 — governance-validator.ts: mapRiskCategoryToRiskLevel Helper.
      - Direkt nach mapAgentToValidatorTarget (Zeile ~76-78) ergänzen:
          export function mapRiskCategoryToRiskLevel(
            riskCategory: string | undefined,
          ): 'low' | 'medium' | 'high' | undefined {
            if (!riskCategory) return undefined
            return RISK_CATEGORY_TO_RISK_LEVEL_MAP[riskCategory]
          }

      Schritt 3 — governance-validator.ts: normalizeOrchestratorIntent erweitern.
      - Signatur erweitern: erster Parameter intent bleibt; zweiter Parameter
        workorderAgentId bleibt unverändert auf Position 2; dritter optionaler
        Parameter workorderRiskCategory?: string an Position 3 ergänzen.
        Beispiel:
          export function normalizeOrchestratorIntent(
            intent: OrchestratorIntent,
            workorderAgentId: string,
            workorderRiskCategory?: string,
          ): OrchestratorIntent
      - Body-Logik (Accumulator-Pattern statt early-Returns):
          1. Bestehende selected_agent-Normalisierung bleibt FUNKTIONAL UNVERÄNDERT
             (gleicher Input → gleicher selected_agent-Output). Strukturell wird
             der Body von early-Returns auf einen Accumulator umgestellt:
               let result: OrchestratorIntent = intent
               // selected_agent-Normalisierung füllt result.selected_agent ggf. auf
               const currentAgent = result.selected_agent
               if (typeof currentAgent !== 'string' || !ALLOWED_AGENTS.has(currentAgent)) {
                 const mappedAgent = mapAgentToValidatorTarget(workorderAgentId)
                 if (mappedAgent) result = { ...result, selected_agent: mappedAgent }
               }
             Es darf keine Verhaltensänderung der WO-005-Schicht resultieren.
          2. Nach selected_agent-Block (also auf demselben result):
               const currentRiskLevel = result.risk_level
               if (typeof currentRiskLevel === 'string' && ALLOWED_RISK_LEVELS.has(currentRiskLevel)) {
                 // Modell-Wert gewinnt — keine Normalisierung
               } else {
                 const mappedLevel = mapRiskCategoryToRiskLevel(workorderRiskCategory)
                 if (mappedLevel) {
                   result = { ...result, risk_level: mappedLevel }
                 }
               }
          3. Falls weder Modell-Wert noch Mapping greifen → intent unverändert
             zurückgeben. Validator §2 entscheidet dann deterministisch REWRITE→FAIL.
      - WICHTIG: result als neues Objekt zurückgeben (immutability beibehalten).
      - JSDoc-Kommentar aktualisieren: Beschreibung des dritten Parameters und
        risk_level-Fallback-Verhalten.

      Schritt 4 — dispatcher.ts: Aufruf-Stelle anpassen.
      - normalizeOrchestratorIntent-Aufruf um wo.risk_category als dritten Parameter
        ergänzen. Audit-Event 'orchestrator_intent_normalized' bleibt unverändert
        (kein neuer Event-Typ).

      Schritt 5 — Tests:
      - smoke-test.ts: Read-only-Verifikation. Mocks aus WO-007 enthalten bereits
        risk_level. Keine Änderung erwartet.
      - dispatcher-fail-cleanup.test.ts: Read-only-Verifikation. Tests prüfen
        Lock-Cleanup, kein risk_level-Pfad-spezifischer Test betroffen.
      - Falls die Implementer-Diagnose ergibt, dass ein zusätzlicher dispatcher-
        fail-cleanup-Test sinnvoll ist (z. B. neuer FAIL-Pfad weil
        risk_category nicht gemappt werden kann), additiv ergänzen.
      - Falls bestehende governance-validator-normalize.test.ts Erweiterung braucht
        (sie liegt NICHT in scope_files): {"status": "ESCALATE"} pro <on_error>.

      Final:
      - pnpm tsc --noEmit muss clean sein.
      - smoke-test.ts → 9/9 PASS bleibt (Mocks waren bereits korrekt).
      - dispatcher-fail-cleanup.test.ts → 9/9 PASS bleibt.
      - Nutrition Batch 001 dry-run → PASS bleibt.
      - Nutrition Batch 001 --run scheitert NICHT mehr an "Ungültiger risk_level: undefined".
        Pause für Approval (db-migration WOs) ist erwartet/akzeptabel.
      - post_review_required: true.
    </implement>

    <constraints>
      Kein Bypass von Preflight oder Governance-Validator.
      Kein Entfernen oder Lockern des risk_level-Checks in §2.
      Kein Entfernen oder Lockern des selected_agent-Checks aus §1 (WO-005-Schicht bleibt).
      Keine Erhöhung von MAX_REWRITE_LOOPS.
      Kein --force / --skip-validator / --bypass Flag.
      Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl.
      Keine Änderung an services/scheduler-api/**.
      Keine Änderung an batch-loader.ts.
      Keine Änderung an scheduler-preflight.ts.
      Keine Änderung an risk-categories.ts (nur Read als context).
      Keine Änderung an workorder.schema.json (risk_category enum bleibt).
      Keine Erweiterung von ALLOWED_RISK_LEVELS.
      Keine neuen npm-Dependencies; package.json unverändert.
      Modell-gelieferter gültiger risk_level hat IMMER Vorrang vor Mapping-Default.
      Mapping muss alle 13 RiskCategory-Werte abdecken.
      Audit-Trail: Bei risk_level-Normalisierung ein Audit-Event nutzen, das bereits
        existiert (z. B. 'orchestrator_intent_normalized' aus WO-005). Kein neuer
        Event-Typ. Falls Audit-Writer-Erweiterung nötig: ESCALATE.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in normalizeOrchestratorIntent-Public-API erkannt
        (z. B. dritter Parameter als Pflicht statt optional, oder
        Reihenfolge der bisherigen Parameter geändert): {"status": "ESCALATE"}.
      WICHTIG: Eine interne strukturelle Refaktorierung des Body von early-Returns
        auf Accumulator-Pattern ist KEIN Breaking Change und KEIN ESCALATE-Trigger,
        solange das funktionale Input/Output-Verhalten der selected_agent-
        Normalisierung 1:1 erhalten bleibt.
      Bei nötigem Edit von risk-categories.ts: {"status": "ESCALATE", "issues": ["risk-categories.ts mutation requires separate WO"]}.
      Bei nötigem Edit von services/scheduler-api/**: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötigem Edit von workorder.schema.json: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE", "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei smoke-test.ts oder dispatcher-fail-cleanup.test.ts rot nach Anpassung:
        {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei nötigem Edit von governance-validator-normalize.test.ts (außerhalb scope_files):
        {"status": "ESCALATE", "issues": ["existing normalize-test extension requires scope adjustment"]}.
      Bei mehrdeutigem Mapping-Eintrag (z. B. risk_category-Wert nicht in
        RiskCategory-Type): {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/__tests__/smoke-test.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"

context_files:
  - "system/control-plane/risk-categories.ts"
  - "system/control-plane/__tests__/governance-validator-normalize.test.ts"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-008-dispatcher-reviewer-injection.md"

acceptance_criteria:
  - "RISK_CATEGORY_TO_RISK_LEVEL_MAP in governance-validator.ts deckt alle 13 RiskCategory-Werte ab (docs, standard, test, i18n → low; architecture, security, auth, rls, shared-core → medium; db-migration, payments, medical, release → high)"
  - "Helper mapRiskCategoryToRiskLevel(riskCategory) gibt für ungültige/leere Eingabe undefined zurück (sicherer Fall-through)"
  - "normalizeOrchestratorIntent akzeptiert dritten optionalen Parameter workorderRiskCategory; bestehende Aufrufer mit zwei Argumenten bleiben backward-compatible"
  - "selected_agent-Normalisierung aus WO-005 bleibt FUNKTIONAL unverändert (gleicher Input → gleicher selected_agent-Output, gleiche Pass-Through-Fälle); interne strukturelle Refaktorierung der early-Returns auf Accumulator-Pattern ist erlaubt, sofern keine Verhaltensänderung resultiert"
  - "Bestehende governance-validator-normalize.test.ts-Tests aus WO-005 bleiben grün (read-only-Verifikation; falls eine Test-Anpassung zur Wahrung des Verhaltens nötig wäre → ESCALATE pro <on_error>)"
  - "Modell-gelieferter gültiger risk_level (in ALLOWED_RISK_LEVELS) hat Vorrang vor Mapping-Default"
  - "Wenn risk_level undefined/leer/ungültig UND workorderRiskCategory in MAP → risk_level wird auf gemappten Wert gesetzt"
  - "Wenn risk_level undefined/leer/ungültig UND workorderRiskCategory NICHT in MAP → intent unverändert; Validator entscheidet deterministisch REWRITE/FAIL"
  - "Validator §2 (risk_level-Check) Logik unverändert — keine Toleranz erhöht"
  - "MAX_REWRITE_LOOPS unverändert (2)"
  - "Kein Validator-Bypass eingeführt"
  - "Kein --force/--skip-validator/--bypass Flag eingeführt"
  - "dispatcher.ts normalizeOrchestratorIntent-Aufruf reicht wo.risk_category als dritten Parameter durch"
  - "Keine neuen npm-Dependencies; package.json unverändert"
  - "Keine Änderung an services/scheduler-api/**"
  - "Keine Änderung an batch-loader.ts"
  - "Keine Änderung an risk-categories.ts oder workorder.schema.json"
  - "pnpm tsc --noEmit clean"
  - "npx tsx system/control-plane/__tests__/smoke-test.ts → 9/9 bestanden"
  - "npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts → all PASS"
  - "Nutrition Batch 001 Dry-Run bleibt PASS (Schema-Validation, READY_TO_RUN)"
  - "Nutrition Batch 001 --run scheitert NICHT mehr an 'Ungültiger risk_level: undefined' für WO-nutrition-001 (docs); WO-nutrition-002/003 dürfen für db-migration-Approval pausieren — das ist OK"
  - "Audit-Trail nutzt existierendes Event 'orchestrator_intent_normalized' (kein neuer Event-Typ)"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS governance-validator §1 (selected_agent) oder §2 (risk_level) Check entfernen oder schwächen"
  - "NIEMALS ALLOWED_RISK_LEVELS erweitern"
  - "NIEMALS MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS Validator-Konstanten (ALLOWED_AGENTS, ALLOWED_GATES, ALLOWED_RISK_LEVELS) abschwächen"
  - "NIEMALS batch-loader.ts ändern"
  - "NIEMALS services/scheduler-api/** ändern"
  - "NIEMALS scheduler-preflight.ts ändern"
  - "NIEMALS risk-categories.ts ändern (Single Source of Truth bleibt)"
  - "NIEMALS workorder.schema.json ändern (risk_category enum bleibt)"
  - "NIEMALS Modell-gelieferten gültigen risk_level überschreiben (nur fehlende/ungültige normalisieren)"
  - "NIEMALS RISK_CATEGORY_TO_RISK_LEVEL_MAP-Werte außerhalb 'low'|'medium'|'high'"
  - "NIEMALS ein --force / --skip-validator / --bypass Flag einbauen"
  - "NIEMALS selected_agent-Normalisierungs-Semantik verändern (interne strukturelle Refaktorierung der early-Returns auf Accumulator-Pattern ist erlaubt, solange Input → Output für selected_agent identisch bleibt; Entfernen oder Lockern des selected_agent-Checks oder der ALLOWED_AGENTS-Pflicht ist verboten)"
  - "NIEMALS runtime_state.json oder system/state/*.jsonl direkt editieren"
  - "NIEMALS Approval-Queue-Dateien (system/approval/**) editieren"
  - "NIEMALS Supabase-Befehle ausführen (supabase db push/reset/migration apply)"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen (xtest/it.skip/test.skip/xit)"
  - "NIEMALS Test-Anzahl in smoke-test.ts oder dispatcher-fail-cleanup.test.ts reduzieren"
  - "NIEMALS Audit-History (pipeline-audit.jsonl, audit.jsonl) löschen oder rewriten"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS einen neuen Audit-Event-Typ einführen (existierendes 'orchestrator_intent_normalized' nutzen)"

files_blocked:
  - "services/scheduler-api/**"
  - "system/workorders/cli/**"
  - "system/state/**"
  - "system/approval/**"
  - "system/control-plane/risk-categories.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/workorders/schemas/**"
  - "apps/**"
  - "supabase/**"
  - "package.json"
  - ".env"
  - ".env.*"

validation_commands:
  - "pnpm tsc --noEmit"
  - "npx tsx system/control-plane/__tests__/smoke-test.ts"
  - "npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices", "debugging-strategies"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-009-risk-level-normalization.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-009` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`, `type: executor_senior`. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (aus WO-005) korrekt zu `ALLOWED_AGENTS`-Wert normalisiert.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`).
- **Verhältnis zu WO-005 / WO-006 / WO-007 / WO-008:**
  - WO-005 fixt `selected_agent`-Normalisierung (Pipeline-FAIL-Vermeidung Stufe 1).
  - WO-006 fixt Cleanup auf FAIL-Pfaden (Lock-Release).
  - WO-007 modernisiert Smoke-Test-Mocks auf OrchestratorIntent+ToolRequest-Vertrag.
  - WO-008 erlaubt Reviewer-Injection im Dispatcher.
  - **WO-009** schließt die letzte bekannte Validator-Pipeline-FAIL-Quelle: `risk_level`-Normalisierung. Pattern 1:1 zu WO-005.
- **Mapping ist die Single-WO-Verantwortung dieses Drafts.** Andere Felder im OrchestratorIntent (`risks`, `execution_order`, `required_gates`, `stop_conditions`) sind nicht Teil dieser WO und werden nicht normalisiert.
- **`scope_files` enthält 4 Files** — `dispatcher.ts` + `governance-validator.ts` + 2 Test-Files. Konsistent mit `template_implementation_medium.md` (3-15 Files) und `.claude/rules/scope.md` (Macro-WO erlaubt).
- **`files_blocked` schließt `risk-categories.ts` explizit aus** — der Source-of-Truth für `RiskCategory` bleibt unverändert. Das Mapping ist eine bewusst getrennte Validator-Domäne.
- **`files_blocked` schließt `system/workorders/schemas/**` explizit aus** — Workorder-Schema bleibt unverändert, `risk_category` enum bleibt.
- **Audit-Event:** Dieselbe Event-Stelle wie WO-005 (`orchestrator_intent_normalized`) — kein neuer Event-Typ, kein Audit-Writer-Edit.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Pre-WO-009 Nutrition Batch 001 `--run` (am 2026-05-03 nach `clearSystemStop`): `RUN-20260503-8238` für WO-nutrition-001 → FAIL "Ungültiger risk_level: undefined" → REWRITE-Limit erreicht.
  - Post-WO-009-Erwartung: WO-nutrition-001 (`docs`) → `risk_level: 'low'` aus Mapping → Validator §2 PASS → Worker fährt fort. WO-nutrition-002/003 (`db-migration`) erreichen den Approval-Gate (kein Auto-Grant; Tom-Aktion erforderlich, das ist OK).
- **Scope-Klarstellung:**
  - **Primary:** `governance-validator.ts` (Mapping + Helper + normalize-Erweiterung) und `dispatcher.ts` (Aufruf-Stelle).
  - **Secondary:** `smoke-test.ts` und `dispatcher-fail-cleanup.test.ts` — read-only-Verifikation, additive Test-Erweiterung nur falls zwingend nötig.
- **Production-Default Verhalten unverändert für andere Caller:** `normalizeOrchestratorIntent(intent, agentId)` ohne dritten Parameter funktioniert weiter (Backward-Compatibility). `risk_level`-Normalization greift dann nur über den Modell-Wert-Pfad — fehlende `workorderRiskCategory` führt zu unverändertem Intent (deterministisch REWRITE/FAIL durch Validator §2, wie heute).

---

*Draft erzeugt: 2026-05-03 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Workflow-Test-Befund-Sequenz nach WO-008-Closure und `clearSystemStop`, und WO-GOVERNANCE-P1-005 als Pattern-Vorlage.*
