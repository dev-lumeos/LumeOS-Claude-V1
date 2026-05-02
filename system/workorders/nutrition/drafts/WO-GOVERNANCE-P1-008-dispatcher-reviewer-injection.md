# WO-GOVERNANCE-P1-008 — Dispatcher Reviewer-Injection V1

**Status:** closed
**Completion Note:** Implementation reviewed PASS. Production fallback unchanged. smoke-test.ts 9/9 PASS. dispatcher-fail-cleanup.test.ts 9/9 PASS. *(closed: 2026-05-02)*
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befund nach `WO-governance-007` (Smoke-Test Modernize): `pnpm tsc --noEmit` PASS, smoke-test 8/9 PASS, **Test 6 FAIL**. Root-Cause: Test 6 erreicht nach erfolgreichem `executeTool()` die Review-Pipeline; `dispatcher.ts:600` injiziert hardcoded `callFastReviewer: callGemmaReviewer` aus `services/scheduler-api/src/vllm-adapter.ts`; `callGemmaReviewer` macht echten `fetch` zu `process.env.SPARK_C_ENDPOINT ?? 'http://192.168.0.99:8001'`. Im Smoke-Test gibt es keinen Mock-Injection-Point → invalid_json → Spark-D escalation → invalid_json → HUMAN_NEEDED → `result.status === 'blocked'`.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- `risk_level`-Normalisierung (separate Future-WO).
- `selected_agent`-Normalisierung (bereits in WO-005 erledigt).
- Dispatcher FAIL/Exception-Cleanup (bereits in WO-006 erledigt).
- Batch-Loader-Änderungen (`system/workorders/cli/**`).
- Nutrition Batch 001 Run.
- Spark-C/D Runtime-Configuration oder VLLM-Endpoint-Änderung.
- Änderung an `services/scheduler-api/**` (insbesondere `vllm-adapter.ts`).
- Änderung am `PipelineDeps`-Interface in `review-pipeline.ts` (existierender `callFastReviewer` reicht aus).
- Approval-Auto-Granting (existiert nicht und soll nicht existieren).
- Spark-D-Reviewer-Injection (separate Phase, nicht für Test 6 nötig — bei PASS auf Spark-C wird Spark-D nicht aufgerufen).
- Live-Tests gegen reale Spark-Endpoints.

---

## Problem Statement

WO-007 hat die Smoke-Test-Mocks auf den heutigen `OrchestratorIntent + ToolRequest`-Vertrag modernisiert. Tests 7A und 7B passieren jetzt korrekt. **Test 6 bleibt rot**, weil:

1. Mock liefert validen Combined-JSON-Output → Validator PASS → Tool-Auth PASS → `executeTool()` schreibt erfolgreich.
2. Dispatcher-Pipeline ruft danach `runReviewPipeline(...)` (`dispatcher.ts:586`) mit hartcodiertem `callFastReviewer: callGemmaReviewer` (`dispatcher.ts:50`+`600`).
3. `callGemmaReviewer` (`services/scheduler-api/src/vllm-adapter.ts:90`) macht `fetch` an `process.env.SPARK_C_ENDPOINT ?? 'http://192.168.0.99:8001'`.
4. Smoke-Test hat keinen Spark-C-Server und kein Mock → `fetch` schlägt fehl / liefert invalid_json → Pipeline escaliert zu Spark-D → ebenfalls invalid_json → `kind: 'human_needed'` → Dispatcher setzt `result.status === 'blocked'`.

**Wirkung:**
- Test 6 erwartet `completed`, bekommt `blocked` → falsch-rot, obwohl der Worker-Pfad korrekt funktioniert.
- Smoke-Tests können nicht den vollen End-to-End-Pfad (Worker → executeTool → Review → done) deterministisch verifizieren.
- Jeder Smoke-Test-Run macht ungewollte Netzwerk-Calls gegen `192.168.0.99:8001` (oder env-overriddes) — abhängig vom Stack-Status werden die Tests unzuverlässig.

**Architektonisches Defizit:** `DispatcherDeps` (`dispatcher.ts:118`) erlaubt aktuell nur `callModel` und `executeTool`-Injection. Der Reviewer-Adapter ist nicht injizierbar, obwohl `PipelineDeps.callFastReviewer` (in `review-pipeline.ts:50-60`) bereits eine Injection-Schnittstelle ist. Die Lücke ist nur im Dispatcher selbst — er gibt seinen `callFastReviewer` nicht aus seiner Deps-Schnittstelle weiter.

**Ziel:** `DispatcherDeps` um ein **optionales** Feld `callFastReviewer?: ReviewerCall` erweitern. Wenn nicht gesetzt → Default `callGemmaReviewer` (Production-Verhalten unverändert). Wenn gesetzt → wird in `runReviewPipeline()` als `callFastReviewer` durchgereicht. Smoke-Test-Test-6 kann damit einen deterministischen PASS-Reviewer injizieren und `result.status === 'completed'` erreichen — ohne Validator-Bypass, ohne Review-Pipeline-Skip, ohne `services/scheduler-api`-Edit.

---

## Architekturentscheidung (verbindlich)

**Variante 1: Optionales DispatcherDeps-Feld (Default).**

```ts
export interface DispatcherDeps {
  callModel:    (routing: ModelRoutingEntry, system: string, user: string) => Promise<string>
  executeTool:  (req: ToolRequest) => Promise<ToolResult>
  callFastReviewer?: (systemPrompt: string, userMessage: string, maxTokens?: number) => Promise<string>
}
```

- Default in `dispatchWorkorder()`-Signatur: `deps.callFastReviewer ?? callGemmaReviewer`.
- Im `runReviewPipeline(...)`-Aufruf: `callFastReviewer: deps.callFastReviewer ?? callGemmaReviewer`.
- Production (`dispatch-loop.ts` injiziert nur `callModel` und `executeTool`) bleibt unverändert — Default greift.

Alternativen verworfen:
- **Variante 2:** Spark-D ebenfalls injizierbar machen — erfordert Edit an `review-pipeline.ts` (PipelineDeps erweitern + Aufruf-Stelle anpassen). Nicht nötig, weil Test 6 mit valider Spark-C-PASS-Antwort die Pipeline mit `kind: 'done'` beendet (Spark-D wird nicht aufgerufen, `review-pipeline.ts:358`). Reserviert für eine zukünftige WO.
- **Variante 3:** Globaler Module-Mock (`vi.mock`-style) — würde neue Test-Dependencies erfordern und das aktuelle `node:assert/strict`-Pattern brechen.
- **Variante 4:** ENV-Flag `SPARK_C_DISABLED` zur Pipeline-Skip — würde Production-Pfad mit Test-Pfad vermischen und Validator-Strenge schwächen.

In allen Varianten:
- Default-Verhalten ohne Mock ist BIT-IDENTISCH zur heutigen Production-Pipeline (kein neuer Code-Pfad bei Default).
- Der Test in Test 6 injiziert einen `callFastReviewer`, der ein valides `{ status: 'PASS', risk: 'LOW', confidence: 0.9, violations: [], recommendations: [], summary: 'mock spark-c pass', requires_claude: false }`-JSON zurückgibt — entspricht dem `ReviewOutput`-Vertrag aus `governance-validator.ts:372-380`. **WICHTIG:** `risk` ist UPPERCASE-Domäne (`'LOW' | 'MEDIUM' | 'HIGH'`) — Reviewer-Risk-Casing ≠ Orchestrator-`risk_level`-Casing (`'low' | 'medium' | 'high'`). Felder `violations`, `recommendations`, `summary` sind Pflicht; `findings` existiert nicht im Contract.
- `dispatcher-fail-cleanup.test.ts`-Tests bleiben unverändert (sie erreichen die Review-Pipeline nicht, weil sie vor `executeTool()` failen).

---

## Workorder

```yaml
workorder_id: "WO-governance-008"
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
      - system/control-plane/dispatcher.ts (DispatcherDeps-Interface ab Zeile 118;
        Default-Argumente ab Zeile 268; runReviewPipeline-Aufruf ab Zeile 586;
        callGemmaReviewer-Import ab Zeile 50)
      - system/control-plane/review-pipeline.ts (PipelineDeps-Interface ab Zeile 50;
        callFastReviewer-Vertrag ab Zeile 56; runReviewPipeline-Body;
        ReviewOutput-Schema; Override-Trigger applyEscalationOverrides)
      - system/control-plane/__tests__/smoke-test.ts (test6_dispatcher_e2e_write —
        die Stelle, an der nach WO-007 ein PASS-Reviewer injiziert werden soll)
      - system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
        (Pattern für DispatcherDeps-Mocks; Verifikation, dass die FAIL-Tests
        die Review-Pipeline nicht erreichen — kein Test-Break-Risk)
      - services/scheduler-api/src/vllm-adapter.ts (callGemmaReviewer-Signatur ab
        Zeile 90 — als Referenz für Default-Type)
      - system/workorders/schemas/workorder.schema.json
      - system/workorders/lifecycle/wo_lifecycle_v1.md
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md
        (Pattern für architecture-WO mit DispatcherDeps-Erweiterung)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-007-smoke-test-modernize.md
        (Vorgänger-Kontext, Combined-JSON-Mock-Pattern)

      Identifiziere die exakten Stellen, die geändert werden müssen:
        - DispatcherDeps-Interface: optionales Feld callFastReviewer ergänzen
        - Default-Argumente von dispatchWorkorder(): kein direkter Eingriff nötig,
          weil callFastReviewer optional ist (Default-Lookup an der Aufruf-Stelle)
        - runReviewPipeline-Aufruf: callFastReviewer-Argument auf
          deps.callFastReviewer ?? callGemmaReviewer setzen
        - smoke-test.ts test6_dispatcher_e2e_write: PASS-Mock-Reviewer injizieren

      Schreibe architecture_notes mit gewählter Variante (Variante 1 = Default).
      Begründe explizit, warum Spark-D-Injection nicht nötig ist (review-pipeline.ts:358 —
      bei Spark-C PASS wird Spark-D nicht aufgerufen).
    </analyze>

    <implement>
      Implementiere Variante 1 (Optionales DispatcherDeps-Feld).

      Schritt 1 — dispatcher.ts: DispatcherDeps-Interface erweitern.
      - Zeile 118ff: callFastReviewer?: (systemPrompt: string, userMessage: string, maxTokens?: number) => Promise<string>
      - Type-Signatur muss exakt der von callGemmaReviewer entsprechen (vllm-adapter.ts:90).

      Schritt 2 — dispatcher.ts: runReviewPipeline-Aufruf anpassen.
      - Zeile 586ff: callFastReviewer-Argument von 'callGemmaReviewer' auf
        'deps.callFastReviewer ?? callGemmaReviewer' ändern.
      - Keine andere Logik ändern. Kein neuer Audit-Event, keine neue Konstante.

      Schritt 3 — smoke-test.ts test6_dispatcher_e2e_write: PASS-Reviewer injizieren.
      - In Test 6: dispatchWorkorder(makeWO(), { callModel: mockCallModel, executeTool: defaultExecuteTool, callFastReviewer: mockFastReviewer })
      - mockFastReviewer ist eine async-Funktion, die deterministisch ein valides
        ReviewOutput-JSON zurückgibt (entspricht dem ReviewOutput-Contract aus
        governance-validator.ts:372-380):
          {
            status: 'PASS',
            risk: 'LOW',                       // UPPERCASE-Pflicht (Reviewer-Domäne)
            confidence: 0.9,                   // ≥ CONFIDENCE_THRESHOLD (0.75)
            violations: [],                    // Pflichtfeld
            recommendations: [],               // Pflichtfeld
            summary: 'mock spark-c pass',      // Pflichtfeld (string)
            requires_claude: false             // sonst Override → ESCALATE
          }
        WICHTIG:
          - risk ist UPPERCASE-Domäne (LOW/MEDIUM/HIGH); Reviewer-Risk-Casing
            ≠ Orchestrator-risk_level-Casing.
          - findings existiert NICHT im ReviewOutput-Contract — NICHT verwenden.
          - validateReviewOutput() würde sonst werfen → failureReason='invalid_json'
            → Spark-D-Eskalation → HUMAN_NEEDED → Test 6 bleibt 'blocked'.
      - Test-Erwartung result.status === 'completed' bleibt unverändert.
      - Audit-Asserts (job_completed, tool_call_allowed) bleiben unverändert.

      Schritt 4 — dispatcher-fail-cleanup.test.ts: prüfen ob Tests die Review-Pipeline
      erreichen. Erwartet: NEIN (alle FAIL-Pfade brechen vor executeTool ab).
      Falls einzelne Tests doch durchfallen würden, denselben PASS-Mock-Reviewer als
      Default in der Test-Setup-Stage einfügen. Sonst KEIN Edit an dieser Datei.

      In allen Schritten:
      - KEIN Edit an review-pipeline.ts (PipelineDeps existierender callFastReviewer ist
        ausreichend).
      - KEIN Edit an services/scheduler-api/** (callGemmaReviewer wird weiterhin als
        Default-Import verwendet).
      - KEIN Edit an governance-validator.ts.
      - KEIN Edit an scheduler-preflight.ts.
      - post_review_required: true (architecture risk_category).
    </implement>

    <constraints>
      Kein neuer Bypass von Preflight oder Governance-Validator.
      Keine Erhöhung von MAX_REWRITE_LOOPS.
      Keine ENV-Flags zum Skippen der Review-Pipeline.
      Kein --force / --skip-review / --no-spark Flag.
      Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl.
      Keine Änderung an services/scheduler-api/**.
      Keine Änderung an review-pipeline.ts (existierendes PipelineDeps.callFastReviewer reicht).
      Keine Änderung an governance-validator.ts.
      Keine Änderung an scheduler-preflight.ts.
      Keine Änderung an batch-loader.ts.
      Keine neuen npm-Dependencies.
      Production-Default-Verhalten ist BIT-IDENTISCH zur Pre-WO-008-Version, wenn
      kein callFastReviewer in DispatcherDeps gesetzt ist (callGemmaReviewer als Fallback).
      Smoke-Test-Test-6-Erwartung bleibt 'completed' (NICHT auf 'blocked' verschlechtern).
      dispatcher-fail-cleanup.test.ts darf nicht rot werden.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in dispatcher-Public-API erkannt (z. B. callFastReviewer als
        Pflichtfeld statt optional): {"status": "ESCALATE"}.
      Bei nötigem Edit von review-pipeline.ts (PipelineDeps-Erweiterung):
        {"status": "ESCALATE", "issues": ["pipeline deps extension requires separate WO"]}.
      Bei nötigem Edit von services/scheduler-api/**: {"status": "STOP"}.
      Bei nötigem Edit von governance-validator.ts: {"status": "STOP"}.
      Bei nötigem Edit von scheduler-preflight.ts: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE", "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei smoke-test Test 6 weiter rot nach Anpassung:
        {"status": "FAIL", "issues": ["test6: actual=<x> expected=completed", "<root-cause>"]}.
      Bei dispatcher-fail-cleanup.test.ts rot nach Anpassung:
        {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei mehrdeutigem Test-Erwartungswert: {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/__tests__/smoke-test.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"

context_files:
  - "system/control-plane/review-pipeline.ts"
  - "services/scheduler-api/src/vllm-adapter.ts"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-006-dispatcher-fail-cleanup.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-007-smoke-test-modernize.md"

acceptance_criteria:
  - "DispatcherDeps in dispatcher.ts hat ein neues optionales Feld callFastReviewer mit Type-Signatur identisch zu callGemmaReviewer"
  - "runReviewPipeline-Aufruf in dispatcher.ts nutzt deps.callFastReviewer ?? callGemmaReviewer als Default-Fallback"
  - "Production-Default-Verhalten ist BIT-IDENTISCH zur Pre-WO-008-Version, wenn kein callFastReviewer in DispatcherDeps gesetzt wird"
  - "Smoke-Test test6_dispatcher_e2e_write injiziert einen Mock-Reviewer, der valides ReviewOutput-PASS-JSON liefert"
  - "Mock-Reviewer-JSON in Test 6 erfüllt vollständigen ReviewOutput-Contract (status, risk UPPERCASE LOW/MEDIUM/HIGH, confidence ≥ 0.75, violations, recommendations, summary, requires_claude=false)"
  - "Smoke-Test Test 6 result.status === 'completed' wird erfüllt (nicht mehr 'blocked')"
  - "Smoke-Test reaches 9/9 PASS"
  - "dispatcher-fail-cleanup.test.ts bleibt 9/9 PASS"
  - "Keine Änderung an services/scheduler-api/**"
  - "Keine Änderung an review-pipeline.ts (PipelineDeps existierender callFastReviewer reicht)"
  - "Keine Änderung an governance-validator.ts"
  - "Keine Änderung an scheduler-preflight.ts"
  - "Kein Validator-Bypass eingeführt"
  - "MAX_REWRITE_LOOPS unverändert (2)"
  - "Kein --force / --skip-review / --no-spark Flag eingeführt"
  - "Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl"
  - "Keine neuen npm-Dependencies in package.json"
  - "pnpm tsc --noEmit clean"
  - "npx tsx system/control-plane/__tests__/smoke-test.ts → 9/9 bestanden"
  - "npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts → all PASS"
  - "Audit-Trail (system/state/pipeline-audit.jsonl) zeigt review_completed-Event für Test 6 mit injectedem Reviewer (Verifikation per existierendem audit-writer)"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS services/scheduler-api/** ändern (insbesondere vllm-adapter.ts)"
  - "NIEMALS review-pipeline.ts ändern, außer zwingend nötig und im Report begründet (Default: nicht nötig — PipelineDeps.callFastReviewer existiert bereits)"
  - "NIEMALS governance-validator.ts ändern"
  - "NIEMALS scheduler-preflight.ts ändern"
  - "NIEMALS batch-loader.ts ändern"
  - "NIEMALS Validator umgehen oder MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS Review-Pipeline-Aufruf im Dispatcher entfernen oder konditional skippen"
  - "NIEMALS Smoke-Test-Erwartung von Test 6 auf 'blocked' verschlechtern"
  - "NIEMALS Smoke-Test-Erwartung anderer Tests verschlechtern"
  - "NIEMALS dispatcher-fail-cleanup.test.ts Erwartungen ändern"
  - "NIEMALS runtime_state.json oder system/state/*.jsonl direkt editieren"
  - "NIEMALS Approval-Queue-Dateien (system/approval/**) editieren"
  - "NIEMALS Supabase-Befehle ausführen (supabase db push/reset/migration apply)"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen (xtest/it.skip/test.skip/xit)"
  - "NIEMALS Test-Anzahl in smoke-test.ts oder dispatcher-fail-cleanup.test.ts reduzieren"
  - "NIEMALS Workorder-Schema (system/workorders/schemas/workorder.schema.json) ändern"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS ein --force / --skip-review / --no-spark / --bypass Flag einbauen"
  - "NIEMALS callFastReviewer als Pflichtfeld in DispatcherDeps machen — IMMER optional mit Default-Fallback auf callGemmaReviewer"

files_blocked:
  - "services/scheduler-api/**"
  - "system/control-plane/review-pipeline.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/state/**"
  - "system/approval/**"
  - "system/workorders/cli/**"
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

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices", "debugging-strategies"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-008-dispatcher-reviewer-injection.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-008` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`, `type: executor_senior`, kanonisch für Multi-File-Architektur-Eingriffe. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (aus WO-005) korrekt auf einen `ALLOWED_AGENTS`-Wert normalisiert.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`).
- **Verhältnis zu WO-005 / WO-006 / WO-007:**
  - WO-005 fixt Validator-PASS für unbekannte Agent-Namen (Pipeline-FAIL-Vermeidung).
  - WO-006 fixt Cleanup auf FAIL-Pfaden (Lock-Release).
  - WO-007 fixt Smoke-Test-Mocks auf den heutigen `OrchestratorIntent + ToolRequest`-Vertrag.
  - **WO-008** schließt die letzte Lücke für Test 6: macht den Reviewer-Adapter im Dispatcher injizierbar, sodass Tests deterministisch eine PASS-Antwort liefern können — ohne reale Spark-C/D-Calls.
- **`scope_files` enthält genau 3 Files** — `dispatcher.ts` + 2 Test-Files. Konsistent mit `template_implementation_medium.md` (3-15 Files erlaubt) und `.claude/rules/scope.md` (Macro-WO erlaubt mehr als 3).
- **`files_blocked` schließt explizit `review-pipeline.ts` aus** — die Lösung kommt komplett aus `dispatcher.ts`-Seite (existierender `PipelineDeps.callFastReviewer` ist die Eingangs-Schnittstelle). Falls der Implementer dennoch `review-pipeline.ts`-Edit braucht, muss er ESCALATE pro `<on_error>`-Regel.
- **Spark-D bleibt absichtlich nicht-injizierbar** — bei Spark-C PASS wird `runSingleTier('spark-d', ...)` nicht aufgerufen (`review-pipeline.ts:358`). Test 6 mit PASS-Mock erreicht `kind: 'done'` ohne Spark-D-Berührung. Eine zukünftige WO kann Spark-D-Injection für Edge-Cases (BLOCKED-Test mit Spark-C-Escalation) ergänzen.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Pre-WO-008-Smoke-Test-Run: 8/9 PASS, Test 6 → `blocked` mit Reason "HUMAN_NEEDED: spark-d invalid_json → Claude needed".
  - Post-WO-008-Erwartung: 9/9 PASS, Test 6 → `completed`.
- **Default-Verhalten BIT-IDENTISCH zur Pre-WO-008-Version:** Wenn der Aufrufer `dispatcher.ts` ohne `callFastReviewer`-Feld aufruft (z. B. aus `dispatch-loop.ts` in `services/scheduler-api/`), greift der `??`-Fallback auf das hartcodierte `callGemmaReviewer` — keine Verhaltensänderung.

---

*Draft erzeugt: 2026-05-02 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Workflow-Test-Befund-Sequenz nach WO-007, und WO-GOVERNANCE-P1-006 als Pattern-Vorlage.*
