# WO-GOVERNANCE-P1-007 — Smoke-Test Modernize V1

**Status:** draft
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befunde nach `WO-governance-005` (OrchestratorIntent-Contract) und `WO-governance-006` (Dispatcher FAIL-Cleanup); `system/control-plane/__tests__/smoke-test.ts` Test 6/7A/7B verwenden veraltete Mock-Outputs (reines `ToolRequest`-JSON ohne `OrchestratorIntent`-Felder), die durch den heute verschärften Governance-Validator als REWRITE→FAIL klassifiziert werden.
**Template:** `system/workorders/templates/template_test.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `closed` (autonom — `risk_category: test` erlaubt direktes Close per `CLAUDE.md` High-Risk-Regel)

---

## Out of Scope

- Änderungen an `dispatcher.ts` (separate Concern, bereits durch WO-005/006 abgedeckt).
- Änderungen an `governance-validator.ts` (Validator-Strenge bleibt — Tests passen sich an, nicht der Validator).
- Änderungen an `review-pipeline.ts`.
- Änderungen an `scheduler-preflight.ts`.
- Änderungen an `system/state/**`, `system/approval/**`, `system/workorders/cli/**`.
- Neue Test-Files außer der Update-Stelle in `smoke-test.ts`.
- Neue npm-Dependencies oder Vitest/Jest-Migration.
- Veränderung der Test-Anzahl (9 Tests bleiben 9 Tests).
- Auto-Retry-Verhalten oder Validator-Toleranz erhöhen.
- Refactor des `setup()`-Test-Dirs oder der `makeWO()`-Helper-Signatur.

---

## Problem Statement

Die bestehenden Smoke-Tests in `system/control-plane/__tests__/smoke-test.ts` wurden vor Einführung des `OrchestratorIntent`-Vertrags geschrieben. Die Mock-Outputs an `dispatchWorkorder()` liefern aktuell **ausschließlich** `ToolRequest`-JSON, z. B. (Test 6):

```ts
const mockCallModel = async () => JSON.stringify({
  tool: 'write', targetPath: 'services/nutrition-api/src/routes/diary.ts',
  content: '// Updated\nexport type DiaryEntry = { id: string; date: string }',
})
```

Der heutige Dispatcher führt jedoch zwischen `callModel()` und `executeTool()` zusätzlich:

1. `parseOrchestratorIntent(content)` — erwartet `selected_agent`, `risk_level`, `risks`, `execution_order`, `required_gates`, `stop_conditions`.
2. `normalizeOrchestratorIntent(intent, wo.agent_id)` — füllt `selected_agent` aus `AGENT_VALIDATOR_MAP`, wenn fehlend.
3. `validateOrchestratorIntent(intent, wo)` — prüft Werte gegen `ALLOWED_AGENTS`, `ALLOWED_GATES`, `ALLOWED_RISK_LEVELS` und kontextspezifische Regeln (Migrations-Gates, Production-Keywords usw.).

Da die heutigen Mocks reine ToolRequests liefern, bricht der Validator mit REWRITE-Loop und nach `MAX_REWRITE_LOOPS` (= 2) FAIL ab. Tests 6, 7A und 7B sind dadurch **falsch grün** oder rot — abhängig davon, ob der Test den FAIL-Pfad erwartet oder nicht. Test 6 erwartet `completed`, Test 7A `awaiting_approval`, Test 7B `blocked`. Mit den aktuellen Mocks wäre der wahrscheinlichste tatsächliche Status: `failed` (Validator-Limit) — also Test 6 rot, Test 7B vermutlich grün aus dem falschen Grund.

**Wirkung:**
- Smoke-Tests sind kein verlässlicher Regression-Indikator mehr.
- Tom's Workflow kann nicht zwischen "echte Regression" und "Mock veraltet" unterscheiden.
- Bei jedem Run gegen den heutigen Dispatcher entstehen unnötige Audit-Events `validator_blocked` ohne Aussagekraft.

**Ziel:** Mocks so erweitern, dass sie den heutigen `OrchestratorIntent`-Vertrag erfüllen und der Validator PASS für die jeweils gewünschten Pfade gibt — ohne den Validator zu schwächen, ohne `MAX_REWRITE_LOOPS` zu erhöhen, ohne Auto-Retry oder Bypass.

---

## Architekturentscheidung (verbindlich)

Tests passen sich an die Production-Contracts an, nicht umgekehrt. Konkret:

1. **Combined-JSON-Pattern:** Jeder Mock liefert ein einzelnes JSON-Objekt, das sowohl die `OrchestratorIntent`-Felder (`selected_agent`, `risk_level`, `risks`, `execution_order`, `required_gates`, `stop_conditions`) als auch die `ToolRequest`-Felder (`tool`, `targetPath`, `content` / `command` / `mcpTool` / `mcpOperation` / `approvalId` / `approval_operation`) enthält. Das ist konsistent mit `dispatcher.ts`, der zuerst `parseOrchestratorIntent` und dann `parseToolRequest` auf demselben Content laufen lässt.
2. **Per-Test-Profil:**
   - **Test 6 (Dispatcher E2E write):** `selected_agent: 'micro-executor'`, `risk_level: 'low'`, `required_gates` enthält `files-scope-gate` und `review-gate`, `stop_conditions` enthält mindestens eine blockierende Bedingung (z. B. `'production_execution_without_approval_token'`).
   - **Test 7A (Migration ohne Approval → awaiting_approval):** `selected_agent: 'micro-executor'`, `risk_level: 'high'`, `required_gates` enthält `human-approval-gate` und `review-gate` und `files-scope-gate`. Da der Workorder eine Migration schreibt aber `agent_id: micro-executor` hat (nicht `db-migration-agent`), ist der Approval-Pfad korrekt.
   - **Test 7B (Migration mit Approval → blocked durch Gateway):** Analog Test 7A, aber zusätzlich `approvalId` und `approval_operation` im ToolRequest-Teil.
3. **Validator-PASS verifizieren ohne Validator zu schwächen:** Werte werden so gewählt, dass `validateOrchestratorIntent` PASS gibt. Die einzig erlaubte Anpassung ist im **Mock-Content** — Validator-Source bleibt unverändert.
4. **Test-Anzahl unverändert (9):** Test 1–5 und Test 8 ändern sich nicht. Tests 6, 7A, 7B bekommen erweiterte Mock-Bodies. Keine neuen Tests, keine entfernten Tests, keine Skips.

---

## Workorder

```yaml
workorder_id: "WO-governance-007"
agent_id:     "test-agent"
phase:        1
priority:     "normal"
quality_critical: false
requires_approval: false
risk_category: "test"

task: |
  <task>
    <analyze>
      Lies vollständig:
      - system/control-plane/__tests__/smoke-test.ts (alle 9 Tests; insbesondere Setup-Block,
        makeWO-Helper, mockCallModel-Definitionen in test6_dispatcher_e2e_write,
        test7a_migration_awaiting_approval, test7b_migration_blocked_by_gateway)
      - system/control-plane/dispatcher.ts (Reihenfolge:
        callModel → parseOrchestratorIntent → normalizeOrchestratorIntent →
        validateOrchestratorIntent → parseToolRequest → permissions-check → executeTool)
      - system/control-plane/governance-validator.ts (OrchestratorIntent-Interface,
        ALLOWED_AGENTS, ALLOWED_GATES, ALLOWED_RISK_LEVELS, AGENT_VALIDATOR_MAP,
        DB_MIGRATION_REQUIRED_GATES, SECURITY_REQUIRED_GATES, PRODUCTION_KEYWORDS,
        POSITIVE_STATE_KEYWORDS, validateOrchestratorIntent-Body)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
        (für AGENT_VALIDATOR_MAP-Logik, normalizeOrchestratorIntent-Vertrag)
      - system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts (zeigt das
        bereits etablierte Combined-JSON-Pattern für korrekt geformte Mocks —
        diente als Pattern-Vorlage)
      - system/control-plane/__tests__/governance-validator-normalize.test.ts (zeigt
        gültige OrchestratorIntent-Beispielwerte)

      Identifiziere für Tests 6, 7A, 7B die jeweils erwartete Status-Antwort
      (completed | awaiting_approval | blocked) und welcher Validator-Pfad dazu
      gehört.

      Belegte zu modernisierende Stellen:
        - test6_dispatcher_e2e_write: mockCallModel liefert reines ToolRequest-JSON,
          fehlende OrchestratorIntent-Felder → REWRITE-FAIL.
        - test7a_migration_awaiting_approval: dito.
        - test7b_migration_blocked_by_gateway: dito; zusätzlich enthält der Mock
          bereits approvalId+approval_operation, die im Combined-JSON erhalten bleiben.

      Schreibe ein kurzes architecture_note, welche OrchestratorIntent-Werte pro Test
      gewählt werden und warum (insbesondere required_gates und stop_conditions).
    </analyze>

    <implement>
      Nur in scope_files schreiben:
        - system/control-plane/__tests__/smoke-test.ts

      Modifikationen:
      A) Test 6 (test6_dispatcher_e2e_write): mockCallModel liefert ein einzelnes
         JSON-Objekt, das beides enthält:
           OrchestratorIntent-Teil:
             selected_agent: 'micro-executor'
             risk_level:     'low'
             risks:          ['type-only changes', 'no migration']
             execution_order:['parse', 'validate', 'write']
             required_gates: ['files-scope-gate', 'review-gate']
             stop_conditions:['production_execution_without_approval_token']
           ToolRequest-Teil (unverändert wie heute):
             tool:        'write'
             targetPath:  'services/nutrition-api/src/routes/diary.ts'
             content:     '// Updated\nexport type DiaryEntry = { id: string; date: string }'
         Test-Erwartung result.status === 'completed' bleibt unverändert.

      B) Test 7A (test7a_migration_awaiting_approval): mockCallModel liefert ein
         Combined-JSON:
           OrchestratorIntent-Teil:
             selected_agent: 'micro-executor'
             risk_level:     'high'
             risks:          ['db migration without approval']
             execution_order:['parse', 'validate', 'await_approval']
             required_gates: ['human-approval-gate', 'review-gate', 'files-scope-gate']
             stop_conditions:['production_execution_without_approval_token']
           ToolRequest-Teil:
             tool:        'write'
             targetPath:  'supabase/migrations/001_add_diary.sql'
             content:     'CREATE TABLE diary_days (...)'
         Test-Erwartung result.status === 'awaiting_approval' bleibt unverändert.

      C) Test 7B (test7b_migration_blocked_by_gateway): mockCallModel liefert
         Combined-JSON wie 7A, aber mit:
           ToolRequest-Teil zusätzlich:
             approvalId:          'APP-T7B-001'
             approval_operation:  'write_migration'
         Test-Erwartung result.status === 'blocked' bleibt unverändert.

      Die Hilfsfunktion makeWO() bleibt unverändert. setup() bleibt unverändert.
      runAll() bleibt unverändert. Tests 1, 2, 3, 4, 5 und 8 werden NICHT angefasst.

      Final: Smoke-Tests müssen ohne weitere Bearbeitung erneut grün laufen
      (`npx tsx system/control-plane/__tests__/smoke-test.ts`). Falls ein einzelner
      Test rot bleibt: STATUS=FAIL mit Test-Name + actual/expected.
    </implement>

    <constraints>
      Kein Production-Code ändern (außerhalb scope_files schreiben verboten).
      Kein Eingriff in dispatcher.ts, governance-validator.ts, review-pipeline.ts,
      scheduler-preflight.ts, system/state/**, system/approval/**,
      system/workorders/cli/**, services/**, apps/**, supabase/**.
      Keine neuen npm-Dependencies, kein Vitest/Jest-Switch — bestehender
      `node:assert/strict`-Style bleibt.
      Keine Test-Skips (xtest/skip/it.skip/test.skip).
      Test-Anzahl bleibt 9.
      Validator-Strenge bleibt unverändert — keine Werte wählen, die nur
      durchgelassen werden, weil ALLOWED_GATES erweitert würde.
      Mock-Werte müssen Validator-PASS produzieren OHNE den Validator anzupassen.
      Kein --force, --skip-validator, --bypass.
      Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl.
      Audit-Events nicht herausfiltern oder unterdrücken.
    </constraints>

    <on_error>
      Bei rotem Test nach Anpassung: {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei nötigem Edit von dispatcher.ts oder governance-validator.ts: {"status": "STOP"}.
      Bei nötigem Edit außerhalb scope_files: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Validator-Werten, die in ALLOWED_GATES/ALLOWED_AGENTS/ALLOWED_RISK_LEVELS nicht enthalten sind: {"status": "ESCALATE", "issues": ["validator value not allowed: ..."]}.
      Bei mehrdeutigem Test-Erwartungswert: {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/__tests__/smoke-test.ts"

context_files:
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"
  - "system/control-plane/__tests__/governance-validator-normalize.test.ts"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md"

acceptance_criteria:
  - "Tests 6, 7A, 7B verwenden je ein Combined-JSON-Mock mit OrchestratorIntent + ToolRequest in einem Objekt"
  - "selected_agent ist in jedem Mock auf einen ALLOWED_AGENTS-Wert gesetzt (micro-executor)"
  - "risk_level ist in jedem Mock auf einen ALLOWED_RISK_LEVELS-Wert gesetzt (low|high)"
  - "required_gates enthält in jedem Mock ausschließlich ALLOWED_GATES-Werte"
  - "stop_conditions enthält in jedem Mock mindestens eine blockierende Bedingung (kein POSITIVE_STATE_KEYWORD)"
  - "execution_order enthält keine PRODUCTION_KEYWORDS in Tests 6/7A/7B"
  - "Test 6 result.status === 'completed' bleibt erfüllt"
  - "Test 7A result.status === 'awaiting_approval' bleibt erfüllt"
  - "Test 7B result.status === 'blocked' bleibt erfüllt"
  - "Tests 1, 2, 3, 4, 5, 8 bleiben unverändert (Bytes-identisch außerhalb der drei mockCallModel-Bodies)"
  - "Test-Anzahl bleibt 9 — keine neuen Tests, keine Skips, keine Removals"
  - "pnpm tsc --noEmit clean"
  - "npx tsx system/control-plane/__tests__/smoke-test.ts → 9/9 bestanden"
  - "Keine Änderung an dispatcher.ts, governance-validator.ts, review-pipeline.ts, scheduler-preflight.ts"
  - "Keine neue npm-Dependency in package.json"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS Production-Code in system/control-plane/ (außer __tests__) ändern"
  - "NIEMALS dispatcher.ts ändern"
  - "NIEMALS governance-validator.ts ändern"
  - "NIEMALS review-pipeline.ts ändern"
  - "NIEMALS scheduler-preflight.ts ändern"
  - "NIEMALS system/state/** ändern"
  - "NIEMALS system/approval/** ändern"
  - "NIEMALS system/workorders/cli/** ändern"
  - "NIEMALS services/** ändern"
  - "NIEMALS apps/** ändern"
  - "NIEMALS supabase/** ändern"
  - "NIEMALS .env oder .env.* lesen oder schreiben"
  - "NIEMALS package.json ändern (keine neuen Dependencies)"
  - "NIEMALS Tests skippen (xtest/it.skip/test.skip/xit)"
  - "NIEMALS Test-Anzahl reduzieren oder erhöhen"
  - "NIEMALS Validator-Konstanten (ALLOWED_AGENTS, ALLOWED_GATES, ALLOWED_RISK_LEVELS) erweitern"
  - "NIEMALS MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS Auto-Retry oder --bypass / --skip-validator / --force Flags einführen"
  - "NIEMALS runtime_state.json oder system/state/*.jsonl direkt editieren"
  - "NIEMALS Audit-Events herausfiltern oder unterdrücken"
  - "NIEMALS Vitest/Jest einführen — bestehender node:assert/strict Style bleibt"

files_blocked:
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/state/**"
  - "system/approval/**"
  - "system/workorders/cli/**"
  - "system/workorders/schemas/**"
  - "services/**"
  - "apps/**"
  - "supabase/**"
  - "package.json"
  - ".env"
  - ".env.*"

validation_commands:
  - "pnpm tsc --noEmit"
  - "npx tsx system/control-plane/__tests__/smoke-test.ts"

required_skills: ["gsd-v2"]
optional_skills: ["test-driven-development", "typescript-pro"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-007-smoke-test-modernize.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-007` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`agent_id: test-agent`** — registriert in `system/agent-registry/agents.json`, `type: executor`, kanonisch für Test-WOs (template_test.md). Wird durch `AGENT_VALIDATOR_MAP['test-agent'] = 'micro-executor'` (aus WO-005) korrekt auf einen `ALLOWED_AGENTS`-Wert normalisiert. Kein Bootstrap-Workaround nötig.
- **`requires_approval: false`** ist gerechtfertigt für `risk_category: test` per `CLAUDE.md` Autonom-Regel — `test` zählt zu den autonom ausführbaren Risk-Kategorien.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`).
- **`risk_category: test`** ist intentional — der Eingriff betrifft ausschließlich eine Test-Datei, keine Production-Logik. Lifecycle erlaubt `done → closed` ohne Spark-D-Review.
- **Verhältnis zu WO-005 / WO-006:** Konsequenz dieser beiden WOs. WO-005 verschärft den Validator-Vertrag (selected_agent Pflicht); WO-006 sorgt für Cleanup auf FAIL-Pfaden. Solange WO-007 nicht implementiert ist, sind die alten Smoke-Tests gegen den heutigen Dispatcher entweder rot oder grün-aus-falschem-Grund — kein verlässlicher Regression-Indikator.
- **`scope_files` umfasst genau eine Datei** — bewusste Mikro-Scope, konsistent mit `template_test.md` und `.claude/rules/scope.md` (max 3 Files pro Micro-WO).
- **Combined-JSON-Pattern als etablierter Standard:** `dispatcher-fail-cleanup.test.ts` aus WO-006 nutzt das Combined-Pattern bereits erfolgreich; WO-007 zieht den Smoke-Test auf denselben Stand.
- **Lifecycle-Pfad:** Erwartet `done → closed` direkt (kein Mandatory-Review, da `risk_category: test` autonom). Auto-Retry erlaubt für `test` per `CLAUDE.md`.
- **Bezug zur Geschichte:** Die Smoke-Tests waren vor WO-005/006 grün. Nach WO-005/006 sind sie veraltet und müssen einmalig auf den neuen Vertrag gehoben werden. Diese WO ist der einmalige Lift-Up.

---

*Draft erzeugt: 2026-05-02 — gemäß `template_test.md`, `wo_factory_prompt.md`, Workflow-Test-Befund-Sequenz nach WO-005/006, und WO-GOVERNANCE-P1-006 als Pattern-Vorlage.*
