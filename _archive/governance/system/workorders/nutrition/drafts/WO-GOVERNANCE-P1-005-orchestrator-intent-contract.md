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

Der Fix findet **vor** dem Governance-Validator statt — durch Normalisierung/Mapping zwischen WO-Metadaten und Modell-Output. Validator-Strenge wird nicht aufgeweicht.

**V1-Scope (verbindlich nach Review-Pass):**

**Variante A — Mapping-Layer mit Hardcoded Default-Map** ist die einzige V1-Option. Implementer hat in V1 **keine Wahl** zwischen drei Varianten — nur Variante A in der unten beschriebenen reduzierten Form ist V1-Scope.

Die anderen Optionen sind explizit Phase 2 / eigene Folge-WO:

- **Phase 2 — Variante A erweitert:** `agents.json[agent_id].validator_target_agent` als optionales Registry-Feld ODER `system/control-plane/agent-validator-map.json` als separate Mapping-Datei. Erfordert eigenen Approval-Pfad, weil `agents.json` außerhalb des aktuellen Scope liegt und neue Mapping-Datei eine zusätzliche Schema-Kontur einführt.
- **Phase 2 — Variante B (Orchestrator-Prompt-Reform):** Nur wenn `system/prompts/orchestration/orchestrator_main_prompt.md` tatsächlich vom Dispatcher geladen wird. Erfordert eigenen Approval-Pfad.
- **Phase 2 — Variante C (`ALLOWED_AGENTS`-Sync mit `agents.json`):** Erfordert begleitendes Prompt-Update und ist ohne Variante B nicht wirksam. Eigener Approval-Pfad.

Begründung für V1 = Variante A Hardcoded-Map only: kleinste, deterministische, audit-fähige Lösung innerhalb des bestehenden Scope (`dispatcher.ts`, `governance-validator.ts`); kein File-Schema-Erweiterung, keine Registry-Mutation, keine Prompt-Loading-Annahmen.

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

      V1-Scope ist verbindlich auf Variante A Hardcoded-Map beschränkt.
      Variante B (Prompt-Reform) und Variante C (ALLOWED_AGENTS-Sync) sind
      Phase 2 / eigene Folge-WO mit separatem Approval. Implementer schreibt
      architecture_notes mit Begründung für die V1-Hardcoded-Variante;
      keine Wahl zwischen den drei Varianten in V1.

      Hinweis zu orchestrator_main_prompt.md: Datei ist in scope_files nur als
      bedingter Eintrag aufgeführt. V1-Scope berührt sie NICHT, weil die
      V1-Lösung keine Prompt-Reform vornimmt. Falls die Datei nicht existiert
      oder vom Dispatcher gar nicht geladen wird: ESCALATE und nicht erzeugen.
      Falls sie existiert: nicht editieren (V1-Scope = nur dispatcher.ts und
      governance-validator.ts).
    </analyze>

    <implement>
      V1-Implementation: ausschließlich Variante A in Hardcoded-Map-Form.

      Schritte:
      - Im Dispatcher: nach parseOrchestratorIntent() und vor validateOrchestratorIntent() einen
        normalizeOrchestratorIntent(intent, workorder)-Schritt einfügen (in dispatcher.ts oder
        governance-validator.ts — Implementer-Entscheidung im Code, beide Files sind in scope).
      - normalizeOrchestratorIntent setzt intent.selected_agent = mapAgentToValidatorTarget(workorder.agent_id),
        FALLS intent.selected_agent ist undefined ODER intent.selected_agent ist nicht in ALLOWED_AGENTS.
      - mapAgentToValidatorTarget nutzt eine HARDCODED Default-Map als einzige V1-Quelle:
          docs-agent              → micro-executor
          test-agent              → micro-executor
          i18n-agent              → micro-executor
          mealcam-agent           → micro-executor
          context-builder         → micro-executor
          governance-compiler     → micro-executor
          db-migration-agent      → db-migration-agent
          security-specialist     → security-specialist
          review-agent            → review-agent
          senior-coding-agent     → micro-executor
          micro-executor          → micro-executor
      - Die Map wird als TypeScript-const oder Record innerhalb von dispatcher.ts oder
        governance-validator.ts deklariert. Keine separate JSON/TS-Datei in V1.
      - Wenn weder das Modell noch die Hardcoded-Map einen gültigen selected_agent liefern
        (z. B. unbekanntes workorder.agent_id), wirft die Funktion einen klaren Error →
        Validator macht REWRITE/FAIL wie bisher.
      - validateOrchestratorIntent bleibt unverändert (Validator-Strenge bewahrt).

      Phase-2-Erweiterungen (NICHT in dieser WO):
      - agents.json[agent_id].validator_target_agent als optionales Registry-Feld → eigene WO.
      - system/control-plane/agent-validator-map.json als separate Mapping-Datei → eigene WO.
      - Variante B (Prompt-Reform) → eigene WO mit separatem Approval.
      - Variante C (ALLOWED_AGENTS-Sync) → eigene WO mit separatem Approval.

      In V1:
      - Inline-Tests/Fixtures für die Mapping-Logik in system/control-plane/__tests__/
        (oder bestehender __tests__-Ordner nahe dem Code).
      - TypeScript-Types aktualisieren (OrchestratorIntent.selected_agent bleibt required;
        AgentMappingTable als interner Type/const, falls hilfreich).
      - Audit-Events ausschließlich über system/state/audit-writer.ts schreiben — KEIN direktes
        Editieren von system/state/pipeline-audit.jsonl oder anderen JSONL-Dateien.
      - post_review_required: true setzen.

      orchestrator_main_prompt.md NICHT anfassen (auch wenn in scope_files gelistet —
      Eintrag ist bedingt und in V1 inaktiv).
    </implement>

    <constraints>
      Kein Bypass des Governance-Validators.
      Keine Erhöhung von MAX_REWRITE_LOOPS als Fix.
      Keine Aufweichung der ALLOWED_AGENTS Enforcement.
      Kein Edit von batch-loader.ts (außerhalb scope).
      Kein --force-Flag oder Skip-Flag.
      Mapping-Tabelle muss explizit, deterministisch und auditierbar sein.
      V1 NUR Hardcoded-Map innerhalb dispatcher.ts oder governance-validator.ts.
      KEINE neue Datei system/control-plane/agent-validator-map.json in V1.
      KEINE neues Feld in agents.json in V1.
      KEINE Änderung an orchestrator_main_prompt.md in V1.
      Keine Schema-/Migration-Änderung an Workorder-Schema.
      Keine Änderung an services/scheduler-api/.
      Audit-Pfad NUR über bestehende system/state/audit-writer.ts; kein direktes JSONL-Editieren.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in OrchestratorIntent-Type erkannt: {"status": "ESCALATE"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP", "issues": ["batch-loader out of scope"]}.
      Bei nötigem Edit von services/scheduler-api/: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Versuch Variante B oder C zu implementieren (nicht V1-Scope): {"status": "ESCALATE", "issues": ["Variante B/C ist Phase 2 — eigene WO erforderlich"]}.
      Bei Versuch agents.json zu erweitern oder neue Mapping-Datei zu erzeugen: {"status": "ESCALATE", "issues": ["Externe Mapping-Quelle ist Phase 2 — V1 nutzt nur Hardcoded-Map"]}.
      Bei orchestrator_main_prompt.md fehlt oder wird nicht vom Dispatcher geladen: kein Fehler — V1 berührt diese Datei nicht.
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
  - "Eine explizite, dokumentierte und audit-fähige Hardcoded Mapping-Schicht existiert in dispatcher.ts oder governance-validator.ts mit Inline-Tests. KEINE Erweiterung von agents.json und KEINE neue separate Mapping-Datei in V1 (beides explizit Phase 2)."
  - "orchestrator_main_prompt.md bleibt in V1 unverändert — auch wenn der Pfad in scope_files steht (bedingter Eintrag, in V1 inaktiv)"
  - "Audit-Events laufen ausschließlich über system/state/audit-writer.ts; keine direkte JSONL-Editierung"
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
  - "NIEMALS agents.json in V1 erweitern (Phase 2)"
  - "NIEMALS eine neue Mapping-Datei (agent-validator-map.json/.ts) in V1 erzeugen (Phase 2)"
  - "NIEMALS orchestrator_main_prompt.md in V1 editieren oder erzeugen (Phase 2 — Variante B)"
  - "NIEMALS direkt in system/state/pipeline-audit.jsonl oder andere JSONL-Dateien schreiben"

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
- **`scope_files` enthält `orchestrator_main_prompt.md` als bedingten Eintrag** — V1-Scope ist Variante A Hardcoded-Map only und berührt diese Datei NICHT. Eintrag bleibt aus Konsistenz mit dem Original-Spec stehen, ist aber in V1 inaktiv. Phase-2-Varianten (B/C) würden diesen Pfad aktiv nutzen, sind aber eigene WOs mit separatem Approval. Siehe `<analyze>`-Block.
- **V1-Boundary (verbindlich nach Review-Pass):**
  - V1 ändert NUR `dispatcher.ts` und `governance-validator.ts`.
  - V1 nutzt eine Hardcoded-Map als TypeScript-const innerhalb dieser Files.
  - V1 erzeugt KEINE neue Datei `agent-validator-map.json/.ts`.
  - V1 erweitert NICHT `agents.json` um `validator_target_agent`.
  - V1 ändert NICHT `orchestrator_main_prompt.md`.
  - V1 schreibt Audit-Events NUR über `system/state/audit-writer.ts`.
  - Phase 2 deckt: externe Mapping-Datei, agents.json-Erweiterung, Prompt-Reform (Variante B), `ALLOWED_AGENTS`-Sync (Variante C). Jeweils eigene WOs.
- **`files_blocked` schließt explizit `system/workorders/schemas/workorder.schema.json` aus** — der WO-Schema-Vertrag bleibt unverändert; selected_agent ist eine Validator-Domäne, kein WO-Schema-Field.
- **`files_blocked` schließt `package.json` aus** — keine neuen Dependencies.
- **`files_blocked` schließt `services/scheduler-api/**` aus** — keine HTTP-Service-Berührung.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zu Bootstrap-Geschichte:** `WO-NUTRITION-P1-001` hat als Bootstrap-Workaround `agent_id: micro-executor` (statt korrekt `docs-agent`). Nach Implementierung von `WO-governance-005` kann der Bootstrap-Note in WO-001 entfernt und `agent_id` zurück auf `docs-agent` gesetzt werden — das ist eine Folge-WO, nicht Teil dieser.

---

*Draft erzeugt: 2026-05-02 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Diagnose-Bericht "Governance Validator Diagnosis — Unknown Agent undefined" und Workflow-Test-Befund nach `WO-governance-004`.*
