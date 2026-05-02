# WO-GOVERNANCE-P1-005 — OrchestratorIntent Contract V1

**Status:** draft
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befund nach `WO-governance-004` Bootstrap-Implementation; Diagnose "Governance Validator Diagnosis — Unknown Agent undefined".
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- Scheduler-Service-Integration (`services/scheduler-api/**`).
- Batch Loader CLI Änderungen (`system/workorders/cli/**`).
- Supabase Migration Execution (`supabase db push --linked` bleibt manuell).
- Nutrition DB Implementation.
- Approval-Auto-Granting (existiert nicht und soll nicht existieren).
- Erweiterung von `MAX_REWRITE_LOOPS` (kein Fix-Vehikel).
- Disable des Governance-Validators (kein Bypass).
- Runtime-State / Approval-Queue Manipulation.

---

## Problem Statement

`Nutrition Batch 001 --run` erreicht zuverlässig den Dispatcher, durchläuft Stop-Check, Schema-Validate, Preflight, Locks und ruft `callModel()` auf. Der Lauf bricht aber jedes Mal am Governance-Validator ab:

```
Governance: REWRITE-Limit (2) erreicht.
Letzte Verletzung: Unbekannter Agent: undefined
```

**Root Cause** (siehe Diagnose):

1. Das Modell produziert ein `OrchestratorIntent` JSON ohne `selected_agent`-Feld → `intent.selected_agent === undefined`.
2. `workorder.agent_id` wird **nicht** automatisch in `intent.selected_agent` propagiert. Die WO-Metadaten und das Modell-Output sind unverbundene Domänen.
3. `governance-validator.ts` `ALLOWED_AGENTS` erlaubt nur 4 Werte (`micro-executor`, `db-migration-agent`, `security-specialist`, `review-agent`) — `agents.json` registriert dagegen 13 Executor-Agents.
4. Validator lehnt mit `REWRITE` ab, nach 2 Versuchen `FAIL`.

**Ziel:** OrchestratorIntent-Vertrag so reparieren, dass jeder Dispatch ein gültiges `selected_agent` produziert, **bevor** der Governance-Validator ihn prüft. Validator-Strenge bleibt erhalten — nur der Eingangs-Vertrag wird geschlossen.

---

## Architekturentscheidung (verbindlich)

Der Fix findet **vor** dem Governance-Validator statt — durch Normalisierung/Mapping zwischen WO-Metadaten und Modell-Output. Validator-Strenge wird nicht aufgeweicht. Drei legitime Pfade (Implementer wählt nach Spark-D-Review):

1. **Mapping-Layer** im Dispatcher: nach `parseOrchestratorIntent()` und vor `validateOrchestratorIntent()` ein Normalisierungs-Schritt, der `intent.selected_agent` aus `workorder.agent_id` ableitet, falls das Modell es nicht setzt. Mapping-Tabelle: WO-`agent_id` → Validator-`selected_agent`. Quelle-of-Truth: `agents.json` mit zusätzlichem Feld `validator_target_agent` ODER eine separate Mapping-Datei `system/control-plane/agent-validator-map.json`.
2. **Orchestrator-Prompt-Reform**: System-Prompt in `system/prompts/orchestration/orchestrator_main_prompt.md` so überarbeiten, dass das Modell **deterministisch** `selected_agent` aus den gültigen Werten setzt — basierend auf WO-`risk_category` und `agent_id` (im Prompt-Kontext mitgegeben).
3. **`ALLOWED_AGENTS`-Sync**: `governance-validator.ts` `ALLOWED_AGENTS` mit `agents.json` synchronisieren (`docs-agent`, `test-agent`, `i18n-agent`, `mealcam-agent`, ggf. `context-builder`, `governance-compiler`). Erfordert begleitend Orchestrator-Prompt-Update.

Empfehlung im Spec-Body: **Variante 1 (Mapping-Layer)** als robusteste, kleinste, am wenigsten architekturändernde Lösung — Validator bleibt unverändert, Modell-Output wird kontrolliert normalisiert. Implementer-Entscheidung im Spark-D-Review.

---

## Workorder

```yaml
workorder_id: "WO-governance-005"
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
      - system/control-plane/dispatcher.ts (Dispatcher-Pipeline; Stelle wo callModel/parseOrchestratorIntent/validateOrchestratorIntent aufeinander folgen)
      - system/control-plane/governance-validator.ts (ALLOWED_AGENTS, validateOrchestratorIntent, parseOrchestratorIntent, OrchestratorIntent Type)
      - system/agent-registry/agents.json (alle 13 Agenten + Typ + Phase)
      - system/workorders/schemas/workorder.schema.json (workorder.agent_id, workorder.risk_category Enums)
      - system/workorders/lifecycle/wo_lifecycle_v1.md
      - system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md (Beispiel: docs-WO mit Bootstrap agent_id micro-executor)
      - system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md (Test-Batch)
      - system/workorders/cli/batch-loader.ts (read-only Referenz: wie der Loader die WO an dispatchWorkorder übergibt)
      - Sofern vorhanden: system/prompts/orchestration/orchestrator_main_prompt.md
        (Falls die Datei nicht existiert: "Create this file only if dispatcher.ts currently references
         orchestration prompts or if existing prompt loading path supports it. Otherwise do not create
         a new prompt path without explicit review.")

      Verstehe den OrchestratorIntent-Vertrag:
      - selected_agent ist Pflicht
      - selected_agent muss aus ALLOWED_AGENTS stammen
      - undefined ist nicht erlaubt
      - 2 Rewrite-Versuche maximal, dann FAIL

      Analysiere drei Lösungsvarianten:
      A) Mapping-Layer im Dispatcher (empfohlen)
      B) Orchestrator-Prompt-Reform
      C) ALLOWED_AGENTS-Sync

      Schreibe architecture_notes mit gewählter Variante + Begründung.
      Variante A ist Default, sofern nichts dagegenspricht.
    </analyze>

    <implement>
      Implementiere die im architecture_notes gewählte Variante.

      Variante A — Mapping-Layer (Default):
      - Im Dispatcher: nach parseOrchestratorIntent() und vor validateOrchestratorIntent() einen
        normalizeOrchestratorIntent(intent, workorder)-Schritt einfügen.
      - normalizeOrchestratorIntent setzt intent.selected_agent = mapAgentToValidatorTarget(workorder.agent_id),
        FALLS intent.selected_agent ist undefined ODER intent.selected_agent ist nicht in ALLOWED_AGENTS.
      - mapAgentToValidatorTarget liest die Mapping-Tabelle aus einer der folgenden Quellen
        (in dieser Reihenfolge):
          1. agents.json[agent_id].validator_target_agent (neues optionales Feld; kein Pflicht-Sync)
          2. system/control-plane/agent-validator-map.json (separate Mapping-Datei, falls 1 nicht gesetzt)
          3. Hardcoded Default-Map (Fallback): docs-agent → micro-executor, test-agent → micro-executor,
             i18n-agent → micro-executor, mealcam-agent → micro-executor, context-builder → micro-executor,
             governance-compiler → micro-executor, db-migration-agent → db-migration-agent,
             security-specialist → security-specialist, review-agent → review-agent,
             senior-coding-agent → micro-executor, micro-executor → micro-executor.
      - Wenn weder das Modell noch die Mapping-Quellen einen gültigen selected_agent liefern,
        wirft die Funktion einen klaren Error → Validator macht REWRITE/FAIL wie bisher.
      - validateOrchestratorIntent bleibt unverändert (Validator-Strenge bewahrt).

      Variante B oder C nur wenn architecture_notes das begründet:
      - B: Orchestrator-Prompt-Update — nur wenn orchestrator_main_prompt.md bereits vom Dispatcher
           geladen wird oder eine bestehende Prompt-Loading-Path es unterstützt. Sonst ESCALATE.
      - C: ALLOWED_AGENTS-Sync mit agents.json — nur in Kombination mit Prompt-Update,
           damit der Orchestrator die neuen Werte tatsächlich nutzt.

      In allen Varianten:
      - Inline-Tests/Fixtures für die Mapping-Logik in einem __tests__-Verzeichnis nahe dem Code.
      - TypeScript-Types aktualisieren (z. B. OrchestratorIntent.selected_agent? oder
        AgentMappingTable Interface).
      - post_review_required: true setzen.
    </implement>

    <constraints>
      Kein Bypass des Governance-Validators.
      Keine Erhöhung von MAX_REWRITE_LOOPS als Fix.
      Keine Aufweichung der ALLOWED_AGENTS Enforcement.
      Kein Edit von batch-loader.ts (außerhalb scope).
      Kein --force-Flag oder Skip-Flag.
      Mapping-Tabelle muss explizit, deterministisch und auditierbar sein.
      Wenn neue Datei system/control-plane/agent-validator-map.json: schema-validierbar (JSON-Schema mitliefern).
      Wenn neues Feld in agents.json: rückwärtskompatibel (optional, kein Required).
      Keine Schema-/Migration-Änderung an Workorder-Schema.
      Keine Änderung an services/scheduler-api/.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in OrchestratorIntent-Type erkannt: {"status": "ESCALATE"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP", "issues": ["batch-loader out of scope"]}.
      Bei nötigem Edit von services/scheduler-api/: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Konflikt zwischen Variante B/C und fehlendem Prompt-Loading-Pfad: {"status": "ESCALATE", "issues": ["orchestrator_main_prompt.md not loaded by dispatcher — Variante B/C requires architecture review"]}.
      Bei mehrdeutiger Mapping-Quelle: {"status": "ESCALATE"}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei fehlendem Kontext (Spec/Schema nicht lesbar): {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/governance-validator.ts"
  - "system/prompts/orchestration/orchestrator_main_prompt.md"

context_files:
  - "system/agent-registry/agents.json"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md"
  - "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md"
  - "system/workorders/cli/batch-loader.ts"
  - "system/control-plane/__tests__/smoke-test.ts"

acceptance_criteria:
  - "selected_agent kann nach parseOrchestratorIntent + Normalisierung niemals undefined sein"
  - "Für docs/read-only WOs (z. B. WO-NUTRITION-P1-001 mit risk_category: docs) löst selected_agent deterministisch auf einen ALLOWED_AGENTS-Wert auf (typisch micro-executor)"
  - "Für db-migration WOs (z. B. WO-NUTRITION-P1-002, P1-003) löst selected_agent deterministisch auf db-migration-agent auf"
  - "governance-validator.ts und agents.json sind entweder synchronisiert ODER eine explizite, dokumentierte Mapping-Schicht (validator_target_agent oder agent-validator-map.json) existiert mit Tests"
  - "Ungültiger selected_agent (nicht in ALLOWED_AGENTS und nicht über Mapping resolvierbar) löst weiterhin REWRITE oder FAIL aus — kein Bypass"
  - "MAX_REWRITE_LOOPS bleibt unverändert (2)"
  - "Kein --force-Flag oder Skip-Flag im Dispatcher"
  - "pnpm tsc --noEmit clean"
  - "Bestehende Tests (system/control-plane/__tests__/) bleiben grün"
  - "Neue Inline-Tests für die Mapping-Logik vorhanden und grün"
  - "Dry-run von Nutrition Batch 001 bleibt grün (npx tsx system/workorders/cli/run-batch.ts ... --dry-run Exit 0)"
  - "--run von Nutrition Batch 001 bricht NICHT mehr mit 'Unbekannter Agent: undefined' ab; bei Approval-Pause an WO-002 (db-migration HUMAN_NEEDED Gate) ist das erwartetes Verhalten"
  - "Audit-Trail (system/state/pipeline-audit.jsonl) zeigt Mapping-Events nachvollziehbar"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS governance-validator.ts validateOrchestratorIntent() umgehen"
  - "NIEMALS MAX_REWRITE_LOOPS erhöhen als Fix"
  - "NIEMALS ein --force/--skip-validator/--bypass Flag einbauen"
  - "NIEMALS batch-loader.ts ändern (out of scope)"
  - "NIEMALS Runtime-State (system/state/runtime_state.json) oder Approval-Queue (system/approval/queue.json) editieren"
  - "NIEMALS services/scheduler-api/** ändern"
  - "NIEMALS supabase db push oder supabase db reset ausführen"
  - "NIEMALS package.json um neue npm-Dependencies erweitern (außer ESCALATE)"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen"
  - "NIEMALS Workorder-Schema (system/workorders/schemas/workorder.schema.json) ändern"
  - "NIEMALS ENV-Dateien lesen oder schreiben"

files_blocked:
  - "services/scheduler-api/**"
  - "system/workorders/cli/**"
  - "system/state/**"
  - "system/approval/**"
  - "apps/**"
  - "supabase/**"
  - ".env"
  - ".env.*"
  - "package.json"
  - "system/workorders/schemas/workorder.schema.json"

validation_commands:
  - "pnpm tsc --noEmit"
  - "pnpm test"
  - "npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run"

required_skills: ["gsd-v2"]
optional_skills: ["typescript-pro", "nodejs-best-practices"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-005` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** Pflicht für `risk_category: architecture` per `CLAUDE.md` "Cautious — Spark D mandatory, kein Auto-Retry" + High-Risk-Regel mit Prior-Approval-Anforderung für strukturelle Änderungen am Dispatcher/Validator.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nur bei `db-migration`).
- **`scope_files` enthält bewusst `orchestrator_main_prompt.md`** — falls die Datei existiert und vom Dispatcher geladen wird, ist Variante B/C verfügbar. Falls nicht, springt der Worker auf Variante A (Mapping-Layer in dispatcher.ts/governance-validator.ts) und berührt die Prompt-Datei nicht (wird nicht erzeugt ohne expliziten Review-Pfad — siehe `<analyze>`-Block).
- **`files_blocked` schließt explizit `system/workorders/schemas/workorder.schema.json` aus** — der WO-Schema-Vertrag bleibt unverändert; selected_agent ist eine Validator-Domäne, kein WO-Schema-Field.
- **`files_blocked` schließt `package.json` aus** — keine neuen Dependencies.
- **`files_blocked` schließt `services/scheduler-api/**` aus** — keine HTTP-Service-Berührung.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zu Bootstrap-Geschichte:** `WO-NUTRITION-P1-001` hat als Bootstrap-Workaround `agent_id: micro-executor` (statt korrekt `docs-agent`). Nach Implementierung von `WO-governance-005` kann der Bootstrap-Note in WO-001 entfernt und `agent_id` zurück auf `docs-agent` gesetzt werden — das ist eine Folge-WO, nicht Teil dieser.

---

*Draft erzeugt: 2026-05-02 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Diagnose-Bericht "Governance Validator Diagnosis — Unknown Agent undefined" und Workflow-Test-Befund nach `WO-governance-004`.*
