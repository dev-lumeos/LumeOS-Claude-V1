# WO-GOVERNANCE-P1-013 — OrchestratorIntent System-Prompt Contract V1

**Status:** draft
**Phase:** 1 — Governance Tooling
**Source:** Orchestrator-Prompt-Diagnose nach Closure von WO-005/006/007/008/009/010/011/012: Validator/Dispatcher/State-Layer sind robust (smoke 9/9, fail-cleanup 24/24, tsc PASS), aber Live-Re-Runs von `BATCH-NUTRITION-P1-001` produzieren weiterhin `governance: REWRITE-Limit (2) erreicht. Letzte Verletzung: Feld "<X>" muss ein Array sein, war: undefined`. Diagnose-Befund: **PROMPT_MISSING_REQUIRED_FIELDS** — der `buildSystemPrompt()`-Output enthält weder JSON-Schema noch Pflichtfeld-Liste noch Beispiel des `OrchestratorIntent`-Contracts. Das Modell muss das Format raten.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- `selected_agent`-Normalisierung (bereits in WO-005 erledigt — bleibt unangetastet).
- `risk_level`-Normalisierung (bereits in WO-009 erledigt).
- Array-Felder-Defensive-Validation (bereits in WO-012 erledigt).
- Dispatcher FAIL/Cleanup-Logik (bereits in WO-006/011 erledigt).
- Smoke-Test/Reviewer-Injection (bereits in WO-007/008 erledigt).
- Terminal-WO-Reset-CLI (bereits in WO-010 erledigt).
- Review-Pipeline Spark-D-Injection (separate künftige WO).
- Batch-Loader-Änderungen (`system/workorders/cli/**`).
- Nutrition-DB-Implementation oder Supabase-Migration-Execution.
- Approval-Auto-Granting.
- Validator-Strenge abschwächen.
- Schema-Erweiterung von `OrchestratorIntent` Type.
- `MAX_REWRITE_LOOPS`-Anpassung.
- Agent-Spec-Modifikationen (`.claude/agents/**` bleibt unverändert).
- Modell-Routing-Änderung (vllm-adapter / spark-routing bleibt).

---

## Problem Statement

Aktueller System-Prompt-Builder für dispatched Workorders:

`dispatcher.ts:391`:
```ts
const systemPrompt = buildSystemPrompt(loadAgentSpec(agentDef.spec_file), skills.loaded)
```

`skill-loader.ts:128-132`:
```ts
export function buildSystemPrompt(agentSpec: string, skills: LoadedSkill[]): string {
  if (!skills.length) return agentSpec
  const blocks = skills.map(s => `<skill name="${s.name}">\n${s.content}\n</skill>`).join('\n\n')
  return `${agentSpec}\n\n<loaded_skills>\n${blocks}\n</loaded_skills>`
}
```

Der `userMessage` an das Modell ist `wo.task` (Initial-Run) bzw. ein generischer `"REWRITE_REQUEST: Vorheriger Output war ungültig. Behebe folgende Verletzung..."` (Retry, `dispatcher.ts:407-408`).

**Was der Validator vom Output erwartet** (`governance-validator.ts:14-21`):
```ts
export interface OrchestratorIntent {
  selected_agent:   string  // ∈ ALLOWED_AGENTS
  risk_level:       string  // ∈ {'low','medium','high'}
  risks:            string[]
  execution_order:  string[]
  required_gates:   string[]  // ∈ ALLOWED_GATES
  stop_conditions:  string[]  // keine POSITIVE_STATE_KEYWORDS
}
```

Plus combined `ToolRequest`-Felder (`dispatcher.ts:107-115`): `tool`/`targetPath`/`content`/`command`/`mcpTool`/`mcpOperation`/`approvalId`/`approval_operation`.

**Belegte Lücken in der Prompt-Coverage:**
- `grep -rE "OrchestratorIntent|selected_agent|required_gates|stop_conditions" .claude/agents/` → **0 Treffer** in allen 16 Agent-Specs.
- `system/prompts/orchestration/` → leeres Verzeichnis (keine Templates).
- `grep` in `services/scheduler-api/src/vllm-adapter.ts` → 0 Treffer für OrchestratorIntent-Felder.
- `OrchestratorIntent`-Type existiert nur in `governance-validator.ts` (Validator-Seite).

**Konsequenzen im Live-Run:**
1. Modell erhält Agent-Spec-Markdown + Task-Beschreibung; kein JSON-Schema, keine Pflichtfeld-Liste, kein Beispiel.
2. Modell rät das Format aus Trainings-Daten — Output ist progressiv vollständiger pro WO-Iteration:
   - Pre-WO-005: `selected_agent` undefined → Validator REWRITE
   - Pre-WO-009: `risk_level` undefined → Validator REWRITE
   - Pre-WO-012: `required_gates`/`stop_conditions`/`risks`/`execution_order` undefined → TypeError (jetzt kontrolliertes REWRITE)
3. WO-012 macht den Validator robust gegen jede Modell-Output-Variante; aber jeder Run scheitert weiterhin am REWRITE-Limit, weil das Modell die Felder nicht zuverlässig liefert.
4. Validator-Strenge ist auf maximalem Stand; Robustheits-Lücke liegt **komplett auf Modell-Output-Seite**.

**Wirkung:**
- Workflow-Tests scheitern reproduzierbar an der gleichen Stelle (kontrollierter Validator-FAIL).
- REWRITE-Loop läuft 2× durch ohne Erfolg, weil REWRITE-Anweisung nur die letzte Verletzung nennt — das Modell weiß nicht, welche **anderen** Felder es zusätzlich liefern muss.
- Audit-Trail enthält 2-3 `governance_violation`-Events pro Run, alle für unterschiedliche fehlende Felder.

**Ziel:** Statischen `<orchestrator_intent_contract>`-Block in den System-Prompt aller dispatched Workorders injizieren, der vollständig dokumentiert: alle 6 OrchestratorIntent-Pflichtfelder, alle erlaubten Werte (ALLOWED_AGENTS/ALLOWED_RISK_LEVELS/ALLOWED_GATES), combined ToolRequest-Schema, mindestens ein vollständiges Beispiel-JSON, explizite "all-fields-required"-Anweisung. REWRITE-Pfad zusätzlich verbessern: Validator-Reason als strukturierte Anweisung an das Modell durchreichen statt nur den vorherigen JSON. Validator-Strenge bleibt 1:1 unverändert; Modell bekommt nur den Output-Vertrag, den der Validator ohnehin erwartet.

---

## Architekturentscheidung (verbindlich)

**Variante 1: Statisches Prompt-Template + buildSystemPrompt-Erweiterung + REWRITE-Reason-Pass-Through (Default).**

Drei zusammenwirkende Komponenten:

**A) Neue Datei `system/prompts/orchestration/orchestrator_intent_contract.md`** — statisches Template, das von `buildSystemPrompt` als XML-Block in den System-Prompt eingefügt wird. Inhalt:
1. JSON-Schema-Beschreibung der 6 OrchestratorIntent-Pflichtfelder.
2. Allowed-Values-Listen für `selected_agent`/`risk_level`/`required_gates` (statisch eingebettet, nicht zur Laufzeit aus den Sets generiert — Pflege erfolgt durch separates Update bei Validator-Änderungen, dokumentiert im Template).
3. Combined ToolRequest-Schema mit erlaubten `tool`-Werten.
4. Mindestens ein vollständiges Beispiel-JSON mit allen 6 Array-Pflichtfeldern (gefüllt oder als `[]`).
5. Explizite Anweisungen:
   - "Output exactly one JSON object. No prose. No markdown fences."
   - "You MUST include all 6 OrchestratorIntent fields, even when arrays are empty."
   - "If you intend to write a file or run a command, ALSO include the ToolRequest fields in the same JSON."

**B) `buildSystemPrompt` in `skill-loader.ts` erweitern** — wenn das Contract-File existiert, wird sein Inhalt als `<orchestrator_intent_contract>...</orchestrator_intent_contract>`-Block hinter den Agent-Spec eingefügt, vor dem `<loaded_skills>`-Block. Lese-Fehler (File missing) → fallback auf bisheriges Verhalten (kein Contract-Block) — sicherer Default für Test-Mocks und Edge-Cases.

**C) REWRITE-Pfad in `dispatcher.ts:407-408` verbessern** — statt nur den vorherigen JSON in den REWRITE-Request zu packen, wird die strukturierte Validator-Reason explizit an das Modell durchgereicht:
```
REWRITE_REQUEST: Your previous OrchestratorIntent was rejected.
Validator reason: <ValidationResult.reason>
Field: <ValidationResult.field>
Re-emit a COMPLETE JSON object with all 6 OrchestratorIntent fields. Fix the rejected field, keep the others valid.
Previous output: <modelOutput truncated to 500 chars>
```

Eigenschaften:
- Validator-Strenge unverändert (`ALLOWED_AGENTS`/`ALLOWED_RISK_LEVELS`/`ALLOWED_GATES` bleiben).
- `MAX_REWRITE_LOOPS` unverändert.
- Agent-Specs in `.claude/agents/**` unverändert (Contract liegt in System-Prompt-Schicht).
- Modell-Routing in `services/scheduler-api/**` unverändert.
- Test-Mocks für Smoke/Fail-Cleanup liefern weiterhin manuell-konstruierte Combined-JSONs — sie sehen den neuen Contract-Block, ignorieren ihn aber (Mocks haben fixe Output, keine Modell-Inferenz).

Alternativen verworfen:
- **Variante 2: Contract als Per-Agent-Spec in `.claude/agents/**`** — würde 16 Agent-Specs duplizieren; Contract-Drift-Risiko bei Validator-Änderung; widerspricht Single-Responsibility (Agent-Spec = Identität, nicht Output-Format-Vertrag). Verworfen.
- **Variante 3: Dynamische Contract-Generation aus den Validator-Sets zur Laufzeit** — würde `governance-validator.ts`-Sets exportieren und im Prompt-Builder dynamisch interpolieren. Architektonisch sauberer, aber komplexer; Variante 1 mit statischem Template ist Einstiegslösung. Reserviert für eine Phase-2-WO.
- **Variante 4: Contract direkt im `userMessage`** — würde bei jedem Aufruf inline angehängt, Token-ineffizient (kein System-Prompt-Caching). Verworfen.
- **Variante 5: Validator-seitig Default-Filling** (z. B. fehlendes `risks` auf `[]` setzen) — verschiebt das Problem statt zu lösen; Modell-Output bleibt unvollständig, Audit-Trail verliert Information. Verworfen.

In allen Varianten:
- Kein direkter Edit an `.claude/agents/**` oder `services/scheduler-api/**`.
- Kein neuer Audit-Event-Typ.
- Kein neuer State-Manager-Helper.
- Kein neues `npm`-Paket.
- WO-006/011 Lock-Release- und Run-id-Status-Update-Verhalten 1:1 erhalten.
- WO-012 Array-Defensive-§0-Block läuft weiterhin als letzte Sicherung — bei korrektem Modell-Output ist er ein NOOP, bei defektem ein kontrolliertes REWRITE.

---

## Workorder

```yaml
workorder_id: "WO-governance-013"
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
      - system/control-plane/skill-loader.ts
        (besonders: buildSystemPrompt Zeile 128-132 — aktuelle Implementation
        konkateniert nur agentSpec + skills; loadAgentSpec ist der Einstiegspunkt
        in dispatcher.ts:391)
      - system/control-plane/dispatcher.ts
        (Zeile 391 buildSystemPrompt-Aufruf; Zeile 406-409 callModel-Aufruf
        mit userMessage-Konstruktion; Zeile 407-408 REWRITE-Request-Format)
      - system/control-plane/governance-validator.ts
        (OrchestratorIntent-Interface Zeile 14-21; ALLOWED_AGENTS Zeile 38-44;
        ALLOWED_GATES Zeile 123-132; ALLOWED_RISK_LEVELS Zeile 134;
        POSITIVE_STATE_KEYWORDS Zeile 145-152; ValidationResult-Type)
      - system/control-plane/__tests__/smoke-test.ts
        (Test-Mocks aus WO-007 enthalten alle 6 OrchestratorIntent-Felder
        bereits korrekt — verifizieren dass der neue Contract-Block die
        bestehenden Tests nicht bricht)
      - system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
        (24 bestehende Tests bleiben grün; additive Tests verifizieren
        Contract-Block-Injection)
      - system/workorders/schemas/workorder.schema.json (read-only Referenz)
      - system/workorders/lifecycle/wo_lifecycle_v1.md
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
        (Pattern-Vorlage — defensive Validator-Layer)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-009-risk-level-normalization.md
        (Pattern-Vorlage)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-012-orchestrator-intent-array-defaults.md
        (Pattern-Vorlage — Validator-§0-Block; Contract-Block ist die
        Modell-Output-Seite, §0 ist die Validator-Defensive-Seite — beide
        wirken zusammen)

      Inspiziere bestehende Prompt-Builder-Pfade:
        - dispatcher.ts:391: buildSystemPrompt(agentSpec, skills)
        - skill-loader.ts:128: konkateniert nur agentSpec + skills
        - system/prompts/orchestration/: leeres Verzeichnis
        - .claude/agents/: 16 Agent-Specs ohne OrchestratorIntent-Erwähnung

      Plane das Contract-Template-Layout. Dokumentiere in architecture_notes:
        - alle 6 OrchestratorIntent-Felder mit Typ-Annotation und Pflicht-Status
        - allowed-Values pro Feld (statisch eingebettet)
        - combined ToolRequest-Schema
        - mindestens 1 vollständiges Beispiel-JSON
        - explizite "all-fields-required"-Anweisung
        - explizite "no prose, no markdown fences"-Anweisung
        - Versionierungs-Hinweis: Template muss bei Validator-Änderung manuell
          synchronisiert werden (Phase-2: dynamische Generation als Followup)

      Plane den REWRITE-Pfad-Edit in dispatcher.ts:407-408. Validator-Reason
      und Field-Name werden strukturiert an das Modell durchgereicht statt
      nur die rohe vorherige JSON.

      Schreibe architecture_notes mit gewählter Variante (Variante 1 = Default,
      statisches Template + buildSystemPrompt-Erweiterung + REWRITE-Reason-
      Pass-Through).
    </analyze>

    <implement>
      Implementiere Variante 1.

      Schritt 1 — system/prompts/orchestration/orchestrator_intent_contract.md
      (NEUE Datei). Inhalt mindestens:

        # OrchestratorIntent Output Contract

        You MUST emit exactly one JSON object as your output. No prose. No
        markdown fences. No explanatory text before or after.

        ## Required OrchestratorIntent fields (all 6 are mandatory)

        Every output JSON MUST include these 6 fields, even when arrays are empty:

        | Field | Type | Allowed Values |
        |---|---|---|
        | selected_agent  | string   | "micro-executor" \| "db-migration-agent" \| "security-specialist" \| "review-agent" |
        | risk_level      | string   | "low" \| "medium" \| "high" |
        | risks           | string[] | free-form risk descriptions; [] if none |
        | execution_order | string[] | free-form ordered step descriptions; [] if none |
        | required_gates  | string[] | from: "db-migration-gate", "rollback-gate", "typecheck-gate", "test-gate", "review-gate", "human-approval-gate", "files-scope-gate", "security-gate" |
        | stop_conditions | string[] | blocking conditions only; do not include "approved", "passed", "granted", "success", "completed" |

        ## Optional ToolRequest fields (combined output)

        If you intend to perform a tool call, include these fields in the same
        JSON object:

        | Field | Type | Notes |
        |---|---|---|
        | tool         | "read" \| "write" \| "bash" \| "mcp" | Required if any other ToolRequest field is set |
        | targetPath   | string                              | For read/write |
        | content      | string                              | For write |
        | command      | string                              | For bash |
        | mcpTool      | string                              | For mcp |
        | mcpOperation | string                              | For mcp |
        | approvalId   | string                              | When using a granted approval token |
        | approval_operation | string                        | Approval operation key |

        ## Production-keyword constraint

        execution_order MUST NOT contain any of these production-related strings
        unless the workorder has a granted approval token: "production", "prod",
        "live", "deploy", "release", "apply_migration_to_production", "apply to
        production", "ci/cd production".

        ## Approval-gate constraint

        If the workorder is not approved (approval token absent), required_gates
        MUST include "human-approval-gate" AND stop_conditions MUST include
        "production_execution_without_approval_token".

        ## Complete example

        ```json
        {
          "selected_agent": "micro-executor",
          "risk_level": "low",
          "risks": ["minor type-only change"],
          "execution_order": ["analyze", "edit_file", "verify_typecheck"],
          "required_gates": ["files-scope-gate", "review-gate", "human-approval-gate"],
          "stop_conditions": ["production_execution_without_approval_token"],
          "tool": "write",
          "targetPath": "services/example/src/types.ts",
          "content": "export type Foo = { id: string }"
        }
        ```

        ## Versioning

        This contract is statically maintained. When governance-validator.ts
        ALLOWED_AGENTS, ALLOWED_GATES, or ALLOWED_RISK_LEVELS change, this
        file MUST be updated in the same WO. Phase-2 (separate WO) may move
        to dynamic generation.

      Schritt 2 — skill-loader.ts buildSystemPrompt erweitern.

      Add path resolution at module-init oder in der Funktion (lazy):
        const CONTRACT_PATH = path.resolve(process.cwd(),
          'system/prompts/orchestration/orchestrator_intent_contract.md')

      Erweitere buildSystemPrompt:
        export function buildSystemPrompt(agentSpec: string, skills: LoadedSkill[]): string {
          const parts = [agentSpec]

          // Inject orchestrator intent contract if available.
          // File-missing (z. B. in Tests mit chdir) → graceful fallback
          // ohne Contract-Block (Validator-Layer fängt das ab).
          try {
            if (fs.existsSync(CONTRACT_PATH)) {
              const contract = fs.readFileSync(CONTRACT_PATH, 'utf8')
              parts.push(`<orchestrator_intent_contract>\n${contract}\n</orchestrator_intent_contract>`)
            }
          } catch { /* non-fatal */ }

          if (skills.length) {
            const blocks = skills.map(s => `<skill name="${s.name}">\n${s.content}\n</skill>`).join('\n\n')
            parts.push(`<loaded_skills>\n${blocks}\n</loaded_skills>`)
          }

          return parts.join('\n\n')
        }

      WICHTIG:
        - File-missing-Fallback ist Pflicht — Test-Mocks mit process.chdir(TEST_DIR)
          haben keine Contract-Datei, müssen weiterhin grün bleiben.
        - readFileSync ist sync (konsistent mit bisherigem agentSpec-Pattern).
        - Reihenfolge: agentSpec → contract → skills (Skills nutzen ggf.
          Contract-Wissen).

      Schritt 3 — dispatcher.ts REWRITE-Pfad verbessern.

      Aktuelle Stelle (Zeile 406-409):
        modelOutput = await deps.callModel(activeRoute, systemPrompt, rewriteCount === 0
          ? workerTask
          : `REWRITE_REQUEST: Vorheriger Output war ungültig. Behebe folgende Verletzung und gib nur valides JSON zurück: ${intent ? JSON.stringify(intent) : modelOutput}`
        )

      Refactor zu strukturiertem REWRITE-Hint mit Validator-Reason. Trick:
      die letzte Validation-Result muss gespeichert werden. Aktuell wird
      sie in der validation-Variable gehalten (Zeile 454+), nach dem
      REWRITE-Branch geht sie verloren. Ergänze:
        let lastValidation: ValidationResult | null = null
        // ...
        if (validation.status === 'REWRITE') {
          lastValidation = validation
          rewriteCount++
          // existing audit + continue
        }

      Bei retry (rewriteCount > 0):
        const rewriteHint = lastValidation
          ? `REWRITE_REQUEST: Your previous OrchestratorIntent was rejected.
Validator reason: ${lastValidation.reason ?? 'unknown'}
Field: ${lastValidation.field ?? 'unknown'}
Re-emit a COMPLETE JSON object with all 6 OrchestratorIntent fields. Fix the rejected field, keep the others valid.
Previous output: ${(modelOutput ?? '').slice(0, 500)}`
          : `REWRITE_REQUEST: Vorheriger Output war ungültig. Behebe und gib nur valides JSON zurück: ${(modelOutput ?? '').slice(0, 500)}`
        modelOutput = await deps.callModel(activeRoute, systemPrompt, rewriteHint)

      WICHTIG:
        - parseOrchestratorIntent-Failures auch abdecken (lastValidation = null
          dort, fallback-Format wie bisher).
        - Truncate auf 500 chars verhindert Token-Bloat bei langen Outputs.
        - REWRITE-Hint bleibt deterministisch (kein neuer Validator-Aufruf).

      Schritt 4 — Tests:

      A) smoke-test.ts: read-only-Verifikation. Test 6/7A/7B-Mocks aus WO-007
      sollten weiterhin grün laufen — sie liefern manuelle Combined-JSONs,
      sehen den neuen Contract-Block aber ignorieren ihn (Mock-Output ist
      fix). Falls ein Test rot wird → STOP/ESCALATE.

      B) dispatcher-fail-cleanup.test.ts: 24 bestehende Tests bleiben grün.
      Additive Tests:

      Test D-1: buildSystemPrompt enthält Contract-Block wenn Datei existiert.
        Setup: erstelle TEST_DIR/system/prompts/orchestration/orchestrator_intent_contract.md
               mit kurzem stub-Inhalt.
        Act: const prompt = buildSystemPrompt('AGENT_SPEC', [])
        Assert: prompt.includes('<orchestrator_intent_contract>') === true
        Assert: prompt.includes('AGENT_SPEC') === true (agentSpec bleibt)

      Test D-2: buildSystemPrompt graceful fallback bei missing Datei.
        Setup: KEIN Contract-File.
        Act: const prompt = buildSystemPrompt('AGENT_SPEC', [])
        Assert: prompt === 'AGENT_SPEC' (kein Contract-Block, kein Crash)

      Test D-3: buildSystemPrompt mit Skills + Contract.
        Setup: Contract-File existiert + 1 Skill.
        Act: const prompt = buildSystemPrompt('AGENT_SPEC', [{name: 's', content: 'X', ...}])
        Assert: order = AGENT_SPEC → contract → loaded_skills.

      Test D-4: REWRITE-Hint enthält Validator-Reason und Field nach erstem
      REWRITE-Cycle.
        Mock callModel: liefert 1× ungültigen Intent (REWRITE), dann tracked
        die userMessage des 2. Aufrufs.
        Assert: 2. userMessage enthält "Validator reason:" und field-Name.

      Tests verwenden eindeutige scope_files pro Test (services/wo013-NNN/...)
      analog zu WO-011/012-Pattern.

      Schritt 5 — governance-validator.ts: KEIN Edit erforderlich. Wenn
      ALLOWED_AGENTS/ALLOWED_GATES/ALLOWED_RISK_LEVELS exportiert werden
      müssten für Phase-2-dynamische-Generation, ist das eine separate WO.
      Variante 1 macht das statisch im Template.

      Final:
        - pnpm tsc --noEmit clean.
        - smoke-test.ts → 9/9 PASS bleibt (Mocks ignorieren Contract-Block).
        - dispatcher-fail-cleanup.test.ts → 24 bestehende + ≥4 neue = ≥28 PASS.
        - Nutrition Batch 001 dry-run → READY_TO_RUN bleibt.
        - post_review_required: true.
    </implement>

    <constraints>
      Kein Bypass von Preflight oder Governance-Validator.
      Keine Erhöhung von MAX_REWRITE_LOOPS (bleibt 2).
      Kein --force / --skip-validator / --bypass Flag.
      Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl.
      Keine Änderung an services/scheduler-api/**.
      Keine Änderung an batch-loader.ts oder system/workorders/cli/**.
      Keine Änderung an scheduler-preflight.ts.
      Keine Änderung an review-pipeline.ts.
      Keine Änderung an risk-categories.ts.
      Keine Änderung an workorder.schema.json.
      Keine Änderung an .claude/agents/** (Contract liegt in System-Prompt-
        Schicht, nicht in jeder Agent-Spec).
      Keine Änderung an OrchestratorIntent-Type oder ALLOWED_AGENTS/
        ALLOWED_GATES/ALLOWED_RISK_LEVELS Sets (Werte werden statisch
        ins Template embedded).
      Keine Änderung an parseOrchestratorIntent oder normalizeOrchestratorIntent.
      Keine Änderung an validateOrchestratorIntent §0-§8.
      Keine neuen npm-Dependencies; package.json unverändert.
      Test-Mocks (smoke-test, dispatcher-fail-cleanup) müssen weiterhin
        Combined-JSONs liefern; sie sehen den Contract-Block aber ignorieren
        ihn (kein Mock-Update nötig).
      Contract-Datei muss existieren — File-missing-Fallback ist nur für
        Test-process.chdir(TEST_DIR)-Szenarien gedacht, nicht für Production.
      WO-006/011 Lock-Release- und Run-id-Status-Update-Verhalten bleibt 1:1.
      WO-012 Array-Defensive-§0-Block bleibt 1:1 — fungiert weiterhin als
        letzte Sicherung bei defektem Modell-Output.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in buildSystemPrompt-Public-API erkannt:
        {"status": "ESCALATE"}.
      Bei nötigem Edit von .claude/agents/**: {"status": "STOP",
        "issues": ["agent specs out of WO-013 scope"]}.
      Bei nötigem Edit von services/scheduler-api/**: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötigem Edit von governance-validator.ts (Body-Logik):
        {"status": "ESCALATE", "issues": ["validator behavior change requires separate WO"]}.
      Bei nötigem Edit von parseOrchestratorIntent oder normalizeOrchestratorIntent:
        {"status": "ESCALATE"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE"}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei rotem Test in dispatcher-fail-cleanup.test.ts oder smoke-test.ts:
        {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei Behaviour-Bruch in einem WO-006/009/011/012-Test:
        {"status": "ESCALATE"}.
      Bei mehrdeutigem Prompt-Format-Detail: {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/skill-loader.ts"
  - "system/prompts/orchestration/orchestrator_intent_contract.md"
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/__tests__/smoke-test.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"

context_files:
  - "system/state/state-manager.ts"
  - "system/state/audit-writer.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-009-risk-level-normalization.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-012-orchestrator-intent-array-defaults.md"

acceptance_criteria:
  - "Neue Datei system/prompts/orchestration/orchestrator_intent_contract.md existiert und enthält JSON-Schema-Beschreibung aller 6 OrchestratorIntent-Pflichtfelder (selected_agent, risk_level, risks, execution_order, required_gates, stop_conditions)"
  - "Contract-Datei dokumentiert allowed-Values für selected_agent (mindestens micro-executor, db-migration-agent, security-specialist, review-agent), risk_level (low|medium|high), required_gates (alle 8 ALLOWED_GATES-Werte)"
  - "Contract-Datei dokumentiert combined ToolRequest-Schema mit erlaubten 'tool'-Werten (read|write|bash|mcp) und Optional-Feldern"
  - "Contract-Datei enthält mindestens 1 vollständiges Beispiel-JSON mit allen 6 OrchestratorIntent-Pflichtfeldern UND einem ToolRequest-Beispiel"
  - "Contract-Datei enthält explizite 'output exactly one JSON object, no prose, no markdown fences'-Anweisung"
  - "Contract-Datei enthält explizite 'include all 6 fields, even when arrays are empty'-Anweisung"
  - "Contract-Datei enthält PRODUCTION_KEYWORDS-Constraint und human-approval-gate-Pflicht-Constraint (Validator §5)"
  - "Contract-Datei enthält Versionierungs-Hinweis: muss bei Validator-Änderung manuell synchronisiert werden"
  - "buildSystemPrompt() in skill-loader.ts injiziert <orchestrator_intent_contract>...</orchestrator_intent_contract>-Block hinter agentSpec und vor <loaded_skills>, wenn Contract-Datei existiert"
  - "buildSystemPrompt() hat graceful File-missing-Fallback (return ohne Contract-Block, kein Crash) für Test-process.chdir-Szenarien"
  - "REWRITE-Pfad in dispatcher.ts:407-408 reicht Validator-Reason und Field strukturiert an das Modell durch (statt nur den vorherigen JSON)"
  - "REWRITE-Hint enthält 'Validator reason:' und 'Field:' Header, plus die letzten max 500 chars des vorherigen modelOutput"
  - "Validator-Strenge unverändert (ALLOWED_AGENTS/ALLOWED_RISK_LEVELS/ALLOWED_GATES/AGENT_VALIDATOR_MAP/RISK_CATEGORY_TO_RISK_LEVEL_MAP unverändert)"
  - "validateOrchestratorIntent §0-§8 Logik unverändert"
  - "parseOrchestratorIntent und normalizeOrchestratorIntent unverändert"
  - "OrchestratorIntent-TypeScript-Interface unverändert"
  - "MAX_REWRITE_LOOPS unverändert (2)"
  - "Agent-Specs in .claude/agents/** UNVERÄNDERT"
  - "services/scheduler-api/** UNVERÄNDERT"
  - "Keine neuen npm-Dependencies; package.json unverändert"
  - "Bestehende 9/9 smoke-test-Tests bleiben grün"
  - "Bestehende 24 dispatcher-fail-cleanup-Tests bleiben grün"
  - "Mindestens 4 additive Tests verifizieren: (a) buildSystemPrompt mit Contract-Datei → Block injiziert, (b) buildSystemPrompt ohne Contract-Datei → graceful fallback, (c) buildSystemPrompt mit Skills + Contract → korrekte Reihenfolge, (d) REWRITE-Hint enthält Validator-Reason"
  - "pnpm tsc --noEmit clean"
  - "Nutrition Batch 001 Dry-Run bleibt PASS (READY_TO_RUN)"
  - "Nutrition Batch 001 --run scheitert NICHT mehr reproduzierbar an fehlenden OrchestratorIntent-Feldern. Falls weiterhin FAIL, dann mit klarer Validator-Reason und reduzierter Häufigkeit der Validator-REWRITES (≤1 pro Run statt 2-3)"
  - "WO-006 Lock-Release-Verhalten bleibt 1:1 erhalten"
  - "WO-011 Run-id-spezifischer Status-Update bleibt 1:1 erhalten"
  - "WO-012 Array-Defensive-§0-Block bleibt 1:1 erhalten — fungiert weiterhin als letzte Sicherung bei defektem Modell-Output"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS .claude/agents/** ändern (Contract liegt in System-Prompt-Schicht)"
  - "NIEMALS services/scheduler-api/** ändern"
  - "NIEMALS system/workorders/cli/** ändern"
  - "NIEMALS system/state/** ändern"
  - "NIEMALS system/approval/** ändern"
  - "NIEMALS scheduler-preflight.ts ändern"
  - "NIEMALS review-pipeline.ts ändern"
  - "NIEMALS risk-categories.ts ändern"
  - "NIEMALS workorder.schema.json ändern"
  - "NIEMALS validator §0-§8 Body-Logik ändern (governance-validator.ts darf nur additive Erweiterungen erhalten, keine Behavior-Edits)"
  - "NIEMALS ALLOWED_GATES, ALLOWED_RISK_LEVELS, ALLOWED_AGENTS Werte abschwächen oder reduzieren"
  - "NIEMALS AGENT_VALIDATOR_MAP oder RISK_CATEGORY_TO_RISK_LEVEL_MAP ändern"
  - "NIEMALS MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS parseOrchestratorIntent oder normalizeOrchestratorIntent Verhalten ändern"
  - "NIEMALS OrchestratorIntent-TypeScript-Interface ändern"
  - "NIEMALS WO_TRANSITIONS oder ActiveWorkorder.status-Union ändern"
  - "NIEMALS WO-006 Lock-Release-Verhalten ändern"
  - "NIEMALS WO-011 Run-id-spezifischer Status-Update-Verhalten ändern"
  - "NIEMALS WO-012 Array-Defensive-§0-Block entfernen oder schwächen"
  - "NIEMALS Contract-File als Per-Agent-Spec-Duplikat in .claude/agents/** ablegen"
  - "NIEMALS Contract dynamisch zur Laufzeit aus den Validator-Sets generieren (Phase-2-Followup; Variante 1 ist statisch)"
  - "NIEMALS Validator-seitig fehlende Felder auf [] auto-defaulten (verschiebt das Problem; Modell-Output bleibt unvollständig)"
  - "NIEMALS Test-Anzahl in smoke-test.ts oder dispatcher-fail-cleanup.test.ts reduzieren"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen"
  - "NIEMALS ein --force / --skip-validator / --bypass Flag einbauen"
  - "NIEMALS runtime_state.json oder system/state/*.jsonl direkt editieren"
  - "NIEMALS Approval-Queue-Dateien (system/approval/**) editieren"
  - "NIEMALS Supabase-Befehle ausführen (supabase db push/reset/migration apply)"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS ENV-Dateien lesen oder schreiben"

files_blocked:
  - "services/scheduler-api/**"
  - "system/workorders/cli/**"
  - "system/state/**"
  - "system/approval/**"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/control-plane/review-pipeline.ts"
  - "system/control-plane/risk-categories.ts"
  - "system/control-plane/terminal-wo-reset-cli.ts"
  - "system/workorders/schemas/**"
  - ".claude/agents/**"
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
optional_skills: ["typescript-pro", "nodejs-best-practices", "prompt-engineering"]
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-013-orchestrator-intent-contract-prompt.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-013` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) korrekt zu `ALLOWED_AGENTS`-Wert normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) wird `risk_level` auf `'medium'` aufgefüllt.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nicht db-migration).
- **Verhältnis zu WO-005 / WO-006 / WO-007 / WO-008 / WO-009 / WO-010 / WO-011 / WO-012:**
  - WO-005/009/012: Validator-Robustheit (`selected_agent`/`risk_level`/Array-Felder).
  - WO-006/011: Cleanup auf FAIL-Pfaden (Lock-Release + Run-id-Status-Update).
  - WO-007/008: Smoke-Test/Reviewer-Injection.
  - WO-010: Operator-CLI für Terminal-WO-Reset.
  - **WO-013** schließt die symmetrische Modell-Output-Seite: der Validator wartet auf `OrchestratorIntent` mit 6 Pflichtfeldern; jetzt **sagt der System-Prompt dem Modell explizit**, dass und wie es diese liefern muss. Beide Seiten (Validator-Strenge + Modell-Vertrag) sind danach in Sync.
- **Architektur-Sauberkeit:** Statisches Template (`system/prompts/orchestration/orchestrator_intent_contract.md`) ist der Single-Source-of-Truth für den Output-Vertrag. Bei Validator-Änderung (z. B. neuer Wert in `ALLOWED_GATES`) wird das Template manuell synchron aktualisiert; Phase-2-Followup kann dynamische Generation aus den exportierten Sets einführen.
- **`scope_files` enthält 6 Files** — `skill-loader.ts` (buildSystemPrompt-Erweiterung), `orchestrator_intent_contract.md` (NEU), `governance-validator.ts` (defensiv im Scope für ggf. additive Set-Exports — Edit nicht erwartet), `dispatcher.ts` (REWRITE-Hint-Edit), 2 Test-Files. Konsistent mit `template_implementation_medium.md` (3-15 Files).
- **`files_blocked` schließt `.claude/agents/**` explizit aus** — Agent-Specs bleiben unverändert; der Contract gehört in die System-Prompt-Schicht, nicht in jede Agent-Spec.
- **`files_blocked` schließt `services/scheduler-api/**`** explizit aus — Modell-Routing/Adapter unverändert.
- **`files_blocked` schließt `terminal-wo-reset-cli.ts` (WO-010)** aus — Operator-CLI bleibt unangetastet.
- **`files_blocked` schließt `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`, `system/state/**`, `system/approval/**`, `system/workorders/cli/**`** aus — WO-013 ist ein reiner Prompt-Layer-Fix, kein Eingriff in Pipeline/State/Schema.
- **Audit-Trail:** Bestehender `governance_violation`-Event-Typ wird vom REWRITE-Pfad korrekt geschrieben. Kein neuer Audit-Event-Typ nötig.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Pre-WO-013: Live-Re-Runs scheitern an WO-012-Validator-§0 mit "Feld muss ein Array sein, war: undefined" — Modell rät das OrchestratorIntent-Format und liefert progressiv unterschiedliche unvollständige JSONs.
  - Post-WO-013-Erwartung: Modell sieht den expliziten Contract-Block und liefert vollständige Combined-JSONs. Falls trotzdem Felder fehlen, läuft REWRITE-Loop mit strukturierter Reason — Modell hat klares "fix this exact field"-Signal. Validator-FAIL-Häufigkeit pro Run sinkt von 2-3 auf ≤1.
- **Production-Default Verhalten:** Production-`dispatch-loop.ts` ruft `defaultCallModel` mit `buildSystemPrompt`-Output. Mit WO-013 enthält der Output zusätzlich den Contract-Block — Modell-Verhalten verändert sich VORTEILHAFT (vollständigere Outputs), kein Performance-Regression. Tests sehen Contract-Block im TEST_DIR nur, wenn der Test ihn dort anlegt — andernfalls greift File-missing-Fallback.
- **Tom darf nicht selbst granten** — die WO-Approval folgt dem normalen Spark-D-Mandatory-Review-Flow.

---

*Draft erzeugt: 2026-05-03 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Orchestrator-Prompt-Diagnose-Befund **PROMPT_MISSING_REQUIRED_FIELDS** nach WO-012-Closure, und WO-GOVERNANCE-P1-005/009/012 als Pattern-Vorlagen für Validator/Modell-Output-Vertrags-Schicht.*
