# WO-GOVERNANCE-P1-012 — OrchestratorIntent Array-Defaults V1

**Status:** closed
**Completion Note:** Implementation reviewed PASS. OrchestratorIntent array-field defensive validation implemented. Missing/non-array risks, execution_order, required_gates and stop_conditions now produce controlled REWRITE instead of TypeError. smoke-test.ts 9/9 PASS. dispatcher-fail-cleanup.test.ts 24/24 PASS. *(closed: 2026-05-03)*
**Phase:** 1 — Governance Tooling
**Source:** Workflow-Test-Befund Nutrition Batch 001 `--run` nach Closure von WO-005/006/007/008/009/010/011 + Cleanup von `RUN-20260502-3836`: `WO-nutrition-001` neuer Run `RUN-20260503-7133` failed mit `Dispatcher status: failed — intent.required_gates is not iterable`. WO-011 wirkt korrekt (neuer Eintrag steht als `failed`, nicht `dispatched`); aber der Validator wirft TypeError statt deterministisches REWRITE/FAIL, weil das Modell-Output-OrchestratorIntent kein Array für `required_gates` liefert.
**Template:** `system/workorders/templates/template_implementation_medium.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `reviewed` (architecture/Spark D mandatory) → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- `selected_agent`-Normalisierung (bereits in WO-005 erledigt — bleibt unangetastet).
- `risk_level`-Normalisierung (bereits in WO-009 erledigt).
- Dispatcher FAIL/Exception-Cleanup (bereits in WO-006 erledigt).
- Smoke-Test/Reviewer-Injection (bereits in WO-007/008 erledigt).
- Terminal-WO-Reset-CLI (bereits in WO-010 erledigt).
- Dispatcher Terminal-Status-on-FAIL (bereits in WO-011 erledigt).
- Review-Pipeline Spark-D-Injection (separate künftige WO).
- Batch-Loader-Änderungen (`system/workorders/cli/**`).
- Nutrition-DB-Implementation oder Supabase-Migration-Execution.
- Approval-Auto-Granting.
- Validator-Strenge abschwächen (`ALLOWED_GATES`, `ALLOWED_AGENTS`, `ALLOWED_RISK_LEVELS` bleiben unverändert).
- Schema-Erweiterung von `OrchestratorIntent` Type.
- Modell-Prompt-Tuning (Orchestrator-System-Prompt).
- `MAX_REWRITE_LOOPS`-Anpassung.

---

## Problem Statement

Nach Closure von WO-005 bis WO-011 erreicht `BATCH-NUTRITION-P1-001-db-foundation` `--run` den Governance-Validator, und im Live-Test produzierte das Modell-Output ein OrchestratorIntent ohne array-Felder für `required_gates`/`stop_conditions`/`execution_order`/`risks`. Der Validator (`governance-validator.ts:300`) iteriert mit `for (const gate of intent.required_gates)` ohne defensive Array-Prüfung — bei `undefined`/`null`/non-array wird ein TypeError `intent.required_gates is not iterable` geworfen.

**Beobachteter Live-Pfad (RUN-20260503-7133):**
1. Pre-WO-011-Cleanup hat den Preflight-`failed`-Block beseitigt (WO-010 CLI hat `RUN-20260502-3836` entfernt).
2. Re-Run dispatched, Preflight passierte (`find()` matched jetzt `dispatched`-Eintrag, kein Block).
3. `startRun` + `startWorkorder` liefen → neuer `active_workorders`-Eintrag `RUN-20260503-7133` (initial `dispatched`).
4. Modell-Output gelieferte OrchestratorIntent ohne valides `required_gates`-Array.
5. Validator §3 `for (const gate of intent.required_gates)` → **TypeError** geworfen.
6. Outer Catch-Block (`dispatcher.ts:729`) fängt → `endRun(runId, 'failed')` + `updateActiveWorkorderStatusByRun(... 'failed')` (WO-011-Helper) + `releaseScopeLock`/`releaseDbMigrationLock`.
7. **WO-011 wirkt korrekt:** neuer Eintrag steht als `status: 'failed'` (nicht stuck `dispatched`).

**Architektonisches Defizit:**
- Validator §3, §4, §5, §6, §7 iterieren über `intent.required_gates`, `intent.stop_conditions`, `intent.execution_order` ohne Array-Type-Checks.
- TypeScript-Type `OrchestratorIntent` deklariert die Felder als `string[]`, aber Modell-Output ist Runtime-Daten — keine Compile-Time-Garantie.
- `parseOrchestratorIntent` (Zeile 150) macht `JSON.parse(...)` und cast-und-return ohne strukturelle Validation der Array-Eigenschaft.
- Pattern analog zu früheren Robustheits-Lücken: WO-005 (`selected_agent: undefined`), WO-009 (`risk_level: undefined`). Validator §1+§2 wurden defensive (Existenz-Check + Mapping); §3-§7 fehlt analoge Defensive.

**Wirkung:**
- Jeder Modell-Output ohne array-Felder löst TypeError statt kontrolliertem REWRITE.
- TypeError wird vom Outer-Catch-Block gefangen → Run terminiert als `failed` mit Error-Message `intent.required_gates is not iterable`. Der Operator sieht eine nicht-aussagekräftige Crash-Meldung statt einer Validator-Fehlerbeschreibung.
- REWRITE-Loop wird übersprungen — kein Versuch, das Modell zu einem korrekten Output anzuleiten.
- Audit-Trail enthält `job_failed` mit Crash-Reason, aber kein `governance_violation`-Event mit Field-Information.

**Ziel:** Validator macht jede Array-Iteration defensive: bei `undefined`/`null`/non-array → deterministisches REWRITE mit klarer Reason und korrektem `field`-Eintrag. Validator-Strenge bleibt unverändert (`ALLOWED_GATES`, `ALLOWED_RISK_LEVELS`, etc.). Pattern wahlweise: (a) defensive `Array.isArray`-Check vor jeder for-of-Schleife, oder (b) zentrale Pre-Validation-Funktion, die alle Array-Felder einmal prüft und bei nicht-Array sofort REWRITE returnt. Die Try/Finally-Cleanup-Architektur aus WO-006/WO-011 bleibt 1:1 unverändert.

---

## Architekturentscheidung (verbindlich)

**Variante 1: Zentrale Pre-Validation der Array-Felder am Anfang von `validateOrchestratorIntent` (Default).**

Ein neuer Block direkt am Anfang von `validateOrchestratorIntent` (vor §1 selected_agent-Check) prüft alle Array-Pflichtfelder mit `Array.isArray()`. Bei nicht-Array → sofortiges REWRITE mit explizitem `field` und Reason.

```ts
// ── 0. Array-Felder Defensive (WO-012) ─────────────────────────────────────
// OrchestratorIntent-TypeScript-Type deklariert string[], aber Modell-Output ist
// Runtime-Daten ohne Compile-Time-Garantie. Iteration über non-array würde
// TypeError werfen (intent.required_gates is not iterable). Stattdessen:
// kontrolliertes REWRITE mit klarer Reason.
const ARRAY_FIELDS: Array<keyof OrchestratorIntent> = [
  'risks', 'execution_order', 'required_gates', 'stop_conditions',
]
for (const field of ARRAY_FIELDS) {
  if (!Array.isArray(intent[field])) {
    return {
      status: 'REWRITE',
      reason: `Feld "${field}" muss ein Array sein, war: ${typeof intent[field]}`,
      field:  field as ValidationResult['field'],
    }
  }
}
```

Eigenschaften:
- 4 Pflichtfelder aus `OrchestratorIntent`-Interface abgedeckt: `risks`, `execution_order`, `required_gates`, `stop_conditions`. (`selected_agent`/`risk_level` sind Strings, durch §1/§2 abgedeckt.)
- Schlägt zentral und zuerst zu, **bevor** irgendein for-of-Iterations-Code läuft → kein TypeError-Risiko.
- Reason enthält `typeof intent[field]` (z. B. "war: undefined", "war: object" für null, "war: string") für Operator-Debugging.
- Validator-Strenge der nachfolgenden §3-§7 bleibt 1:1 unverändert — sie sehen entweder einen Array oder fliegen gar nicht erst los.
- Kein Verhaltens-Edit an existierenden §1/§2/§3-§7-Bodies.

Alternativen verworfen:
- **Variante 2: Inline-Defensive vor jeder for-of-Schleife** — würde §3, §4, §5, §6, §7 punktuell mit `if (!Array.isArray(...))`-Returns umrahmen. Funktional identisch, aber 4-5 Stellen statt 1; verstreut den Robustheits-Code; höhere Diff-Fläche; schwerer wartbar.
- **Variante 3: `parseOrchestratorIntent` strenger machen** — Zod-Schema o. ä. einführen. Größerer Eingriff, neue Library-Dependency oder Boilerplate, würde `parseOrchestratorIntent`-Signatur ändern. Verworfen wegen Scope-Erweiterung.
- **Variante 4: Type-Cast in Validator entfernen** — `intent.required_gates as string[]`-Casts im Validator sind nicht das Problem; Runtime-Daten ignorieren TypeScript-Casts. Verworfen.
- **Variante 5: Auto-Normalisierung undefined → []** — würde leeres Array akzeptieren. Aber Validator §5 verlangt z. B. `human-approval-gate` in `required_gates` (wenn kein Approval-Token); leeres Array würde dort als REWRITE zurückkommen. Die zentrale Defensive-Variante ist deterministischer (REWRITE direkt mit klarer "muss ein Array sein"-Reason statt indirekt via "human-approval-gate fehlt"). Verworfen.

In allen Varianten:
- `parseOrchestratorIntent` und `normalizeOrchestratorIntent` (WO-005/009) bleiben unverändert.
- `ALLOWED_GATES`, `ALLOWED_RISK_LEVELS`, `ALLOWED_AGENTS` unverändert.
- `MAX_REWRITE_LOOPS = 2` unverändert.
- Validator §1-§7 Body-Logik unverändert (nur ein neuer §0-Block davor).
- Bestehende Tests in `dispatcher-fail-cleanup.test.ts` und `smoke-test.ts` bleiben grün (alle Mocks liefern korrekte Arrays; nur neue Tests prüfen den nicht-Array-Pfad).

---

## Workorder

```yaml
workorder_id: "WO-governance-012"
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
        (besonders: OrchestratorIntent-Interface Zeile 14-21; ALLOWED_GATES Set
        Zeile 80-89; validateOrchestratorIntent ab Zeile 271; alle for-of-Stellen
        Zeile 300, 311, 326, 360, 376, 390 die intent-Array-Felder iterieren;
        ValidationResult-Type)
      - system/control-plane/dispatcher.ts
        (Outer Catch-Block Zeile 729 der TypeErrors fängt; bereits in WO-011 mit
        updateActiveWorkorderStatusByRun verbunden — bleibt unverändert)
      - system/control-plane/__tests__/smoke-test.ts
        (Test 6/7A/7B Mocks aus WO-007 enthalten alle Array-Felder korrekt —
        keine Mock-Anpassung nötig; read-only-Verifikation)
      - system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
        (Pattern für additive Tests; bestehende Lock-Release-Tests bleiben grün)
      - system/workorders/schemas/workorder.schema.json (read-only Referenz)
      - system/workorders/lifecycle/wo_lifecycle_v1.md
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
        (Pattern für Validator-Defensive — selected_agent-Existenz-Check + Mapping)
      - system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-009-risk-level-normalization.md
        (Pattern für Validator-Defensive — risk_level-Existenz-Check + Mapping)

      Identifiziere alle for-of-Stellen in validateOrchestratorIntent, die über
      intent-Array-Felder iterieren ohne Array-Type-Check:
        - §3 Zeile 300: for (const gate of intent.required_gates)
        - §4 Zeile 311: for (const condition of intent.stop_conditions)
        - §5 Zeile 326: for (const step of intent.execution_order) — Production-Keyword-Check
        - §5 Zeile 340: intent.required_gates.includes(...)
        - §5 Zeile 349: intent.stop_conditions.includes(...)
        - §6 Zeile 360-361: for+includes über intent.required_gates
        - §7 Zeile 376-377: for+includes über intent.required_gates
        - §8 Zeile 390: for (const step of intent.execution_order) — FILES_ALLOWED-Check

      Verstehe: 4 Pflicht-Array-Felder im OrchestratorIntent-Interface:
        - risks: string[]
        - execution_order: string[]
        - required_gates: string[]
        - stop_conditions: string[]
      (selected_agent und risk_level sind Strings — durch §1+§2 abgedeckt.)

      Schreibe architecture_notes mit gewählter Variante (Variante 1 = Default,
      zentrale Pre-Validation am Anfang von validateOrchestratorIntent).
      Bestätige, dass:
        - Validator-Strenge der nachfolgenden §1-§7 unverändert bleibt.
        - parseOrchestratorIntent und normalizeOrchestratorIntent unverändert bleiben.
        - ALLOWED_GATES/ALLOWED_RISK_LEVELS/ALLOWED_AGENTS unverändert bleiben.
        - MAX_REWRITE_LOOPS unverändert bleibt.
        - WO-005 selected_agent-Normalisierung intakt bleibt.
        - WO-009 risk_level-Normalisierung intakt bleibt.
        - WO-011 Lock-Release- und FAIL-Status-Update-Verhalten intakt bleibt.
    </analyze>

    <implement>
      Implementiere Variante 1 (zentrale Pre-Validation der Array-Felder).

      Schritt 1 — governance-validator.ts: neuer Block §0 am Anfang von
      validateOrchestratorIntent, VOR §1 selected_agent-Check.

      Position: Zeile ~280, direkt nach `): ValidationResult {` und VOR
      `// ── 1. selected_agent Enum`.

      Code-Skizze:
        // ── 0. Array-Felder Defensive (WO-012) ──────────────────────────────
        // OrchestratorIntent-TypeScript-Type deklariert string[], aber Modell-
        // Output ist Runtime-Daten ohne Compile-Time-Garantie. Iteration über
        // non-array würde TypeError werfen. Stattdessen: kontrolliertes REWRITE.
        const ARRAY_FIELDS: ReadonlyArray<'risks' | 'execution_order' | 'required_gates' | 'stop_conditions'> = [
          'risks', 'execution_order', 'required_gates', 'stop_conditions',
        ]
        for (const field of ARRAY_FIELDS) {
          const value = intent[field]
          if (!Array.isArray(value)) {
            return {
              status: 'REWRITE',
              reason: `Feld "${field}" muss ein Array sein, war: ${value === null ? 'null' : typeof value}`,
              field:  field,
            }
          }
        }

      WICHTIG:
        - Block kommt VOR §1 selected_agent — vor JEDER for-of-Schleife der
          späteren Sektionen.
        - field-Type entspricht dem ValidationResult.field-Type — keine
          Type-Cast-Hacks nötig (alle 4 sind in OrchestratorIntent-keys).
        - typeof unterscheidet zwischen undefined/string/object/number; null
          wird explizit benannt (typeof null === 'object' wäre sonst irreführend).
        - Same-state idempotent ist hier nicht relevant (Validator returnt
          keine State-Mutation).
        - KEINE Behavior-Änderung an den existierenden §1-§7-Blocks.

      Schritt 2 — dispatcher.ts: KEIN Edit erforderlich.
      WO-011-Outer-Catch-Block fängt weiterhin alle Exceptions inkl. der
      seltenen Edge-Cases die §0 nicht abdeckt. Aber nach §0 sollte der
      Validator keinen TypeError mehr werfen — alle for-of-Schleifen
      operieren auf garantierten Arrays.

      Schritt 3 — Tests:

      A) smoke-test.ts: read-only-Verifikation. Test 6/7A/7B-Mocks enthalten
      alle 4 Array-Felder bereits korrekt — keine Mock-Anpassung erwartet.
      Falls ein Test versehentlich rot wird, ist das Behaviour-Bruch — STOP
      und ESCALATE.

      B) dispatcher-fail-cleanup.test.ts: additive Tests. Bestehende 17 Tests
      (9 WO-006 + 8 WO-011) bleiben grün. Neue Tests:

      Test C-1: required_gates undefined → REWRITE-Limit FAIL mit klarer Reason.
        Mock-callModel returnt JSON ohne required_gates-Feld:
          { selected_agent: 'micro-executor', risk_level: 'low',
            risks: [], execution_order: [], stop_conditions: [] }
        Erwartung: result.status === 'failed' (nach 2 REWRITES → FAIL),
        result.error enthält "muss ein Array sein" oder ähnlich,
        active_workorders[(woId, runId)].status === 'failed' (WO-011 wirkt),
        scope_lock released (WO-006 wirkt),
        KEIN TypeError-Crash.

      Test C-2: required_gates als String statt Array → REWRITE-FAIL.
        Mock liefert: required_gates: 'review-gate' (statt ['review-gate']).
        Erwartung wie C-1.

      Test C-3: stop_conditions undefined → REWRITE-FAIL.
        Mock ohne stop_conditions-Feld. Erwartung wie C-1.

      Test C-4: execution_order non-array → REWRITE-FAIL.
        Mock liefert: execution_order: 'parse_validate_write' (String).
        Erwartung wie C-1.

      Test C-5: risks undefined → REWRITE-FAIL.
        Mock ohne risks-Feld. Erwartung wie C-1.

      Test C-6 (Negativ-Schutz): valider OrchestratorIntent mit allen Arrays
      bleibt PASS-fähig (no-tool-request-Pfad: result.status === 'completed').
      Bestätigt dass §0 korrekt durchlässt.

      Tests verwenden eindeutige scope_files pro Test (services/wo012-NNN/...)
      analog zu WO-011-Pattern, um Lock-Konflikte zu vermeiden.

      Final:
        - pnpm tsc --noEmit clean.
        - smoke-test.ts → 9/9 PASS bleibt.
        - dispatcher-fail-cleanup.test.ts → all PASS (17 + neue additive ≥6).
        - Nutrition Batch 001 dry-run → READY_TO_RUN bleibt.
        - Nutrition Batch 001 --run scheitert NICHT mehr an "intent.required_gates
          is not iterable". Falls FAIL, dann mit klarer Validator-Reason
          ("Feld required_gates muss ein Array sein, war: ...").
        - post_review_required: true.
    </implement>

    <constraints>
      Kein Bypass von Preflight oder Governance-Validator.
      Kein Entfernen oder Lockern von §1 (selected_agent), §2 (risk_level),
        §3 (Gate-IDs aus ALLOWED_GATES), §4 (stop_conditions ohne POSITIVE_STATE),
        §5 (PRODUCTION-Keywords + human-approval-gate Pflicht ohne Token),
        §6 (DB-Migration Pflicht-Gates), §7 (Security-WO Pflicht-Gates),
        §8 (FILES_ALLOWED Scope-Check).
      Keine Erhöhung von MAX_REWRITE_LOOPS.
      Keine Erweiterung oder Reduktion von ALLOWED_GATES, ALLOWED_AGENTS,
        ALLOWED_RISK_LEVELS, AGENT_VALIDATOR_MAP, RISK_CATEGORY_TO_RISK_LEVEL_MAP.
      Kein --force / --skip-validator / --bypass Flag.
      Keine Direkt-Manipulation von runtime_state.json oder system/state/*.jsonl.
      Keine Änderung an services/scheduler-api/**.
      Keine Änderung an batch-loader.ts oder system/workorders/cli/**.
      Keine Änderung an scheduler-preflight.ts.
      Keine Änderung an review-pipeline.ts.
      Keine Änderung an risk-categories.ts.
      Keine Änderung an workorder.schema.json.
      Keine Änderung an parseOrchestratorIntent oder normalizeOrchestratorIntent
        (WO-005/009-Layer bleibt unangetastet).
      Keine Änderung am OrchestratorIntent-Type — bleibt string[] für die 4
        Array-Felder.
      Keine neuen npm-Dependencies; package.json unverändert.
      Bestehende Validator-§1-§8-Bodies und ihre for-of-Schleifen bleiben
        strukturell unverändert — der neue §0-Block wird VOR §1 eingefügt.
      WO-006 Lock-Release-Verhalten bleibt 1:1 erhalten.
      WO-011 Run-id-spezifischer Status-Update bleibt 1:1 erhalten.
      smoke-test.ts und dispatcher-fail-cleanup.test.ts bestehende Tests
        bleiben byte-stabil außerhalb der additiven Test-Cases.
      post_review_required: true.
    </constraints>

    <on_error>
      Bei TypeScript-Fehler: {"status": "FAIL", "issues": ["tsc: ..."]}.
      Bei Breaking Change in validateOrchestratorIntent-Public-API erkannt:
        {"status": "ESCALATE"}.
      Bei nötigem Edit von parseOrchestratorIntent oder normalizeOrchestratorIntent:
        {"status": "ESCALATE", "issues": ["WO-005/009 layer not in WO-012 scope"]}.
      Bei nötigem Edit von OrchestratorIntent-Type:
        {"status": "ESCALATE", "issues": ["type signature change requires separate WO"]}.
      Bei nötigem Edit von dispatcher.ts: {"status": "ESCALATE",
        "issues": ["dispatcher edit not expected; outer catch already covers TypeError fallback"]}.
      Bei nötigem Edit von services/scheduler-api/**: {"status": "STOP"}.
      Bei nötigem Edit von batch-loader.ts: {"status": "STOP"}.
      Bei nötigem Edit von scheduler-preflight.ts: {"status": "STOP"}.
      Bei nötigem Edit von review-pipeline.ts: {"status": "STOP"}.
      Bei nötigem Edit von risk-categories.ts: {"status": "STOP"}.
      Bei nötigem Edit von workorder.schema.json: {"status": "STOP"}.
      Bei nötiger neuer npm-Dependency: {"status": "ESCALATE"}.
      Bei Migration / Schema-Änderung erkannt: {"status": "ESCALATE",
        "issues": ["route to db-migration-agent"]}.
      Bei Security-Befund: {"status": "STOP"}.
      Bei rotem Test in dispatcher-fail-cleanup.test.ts oder smoke-test.ts
        nach Anpassung: {"status": "FAIL", "issues": ["test: <name> — actual=<x> expected=<y>"]}.
      Bei Behaviour-Bruch in einem WO-006/WO-009/WO-011-Test:
        {"status": "ESCALATE"}.
      Bei mehrdeutigem Validator-Verhalten: {"status": "ESCALATE"}.
      Bei fehlendem Kontext: {"status": "BLOCKED"}.
    </on_error>
  </task>

scope_files:
  - "system/control-plane/governance-validator.ts"
  - "system/control-plane/dispatcher.ts"
  - "system/control-plane/__tests__/smoke-test.ts"
  - "system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts"

context_files:
  - "system/state/state-manager.ts"
  - "system/state/audit-writer.ts"
  - "system/control-plane/scheduler-preflight.ts"
  - "system/workorders/schemas/workorder.schema.json"
  - "system/workorders/lifecycle/wo_lifecycle_v1.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-009-risk-level-normalization.md"
  - "system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-011-dispatcher-terminal-status-on-fail.md"

acceptance_criteria:
  - "Neuer §0-Block in validateOrchestratorIntent prüft alle 4 OrchestratorIntent-Array-Pflichtfelder (risks, execution_order, required_gates, stop_conditions) mit Array.isArray vor jeglicher for-of-Iteration"
  - "Bei nicht-Array Feld returnt §0 ein ValidationResult mit status='REWRITE', explizitem field, und reason die typeof-Information enthält"
  - "Missing required_gates wirft KEINEN TypeError mehr — produziert deterministisches REWRITE"
  - "Missing stop_conditions wirft KEINEN TypeError mehr — produziert deterministisches REWRITE"
  - "Missing risks wirft KEINEN TypeError mehr — produziert deterministisches REWRITE"
  - "Missing execution_order wirft KEINEN TypeError mehr — produziert deterministisches REWRITE"
  - "Non-array required_gates (z. B. String) produziert REWRITE mit reason='Feld \"required_gates\" muss ein Array sein, war: string'"
  - "Non-array stop_conditions/risks/execution_order analog produzieren REWRITE mit klarer Reason"
  - "Existierende valide OrchestratorIntent (alle Arrays vorhanden) durchlaufen §0 unverändert und erreichen §1-§8"
  - "Validator §1 selected_agent-Logik unverändert"
  - "Validator §2 risk_level-Logik unverändert"
  - "Validator §3-§8 Logik (ALLOWED_GATES, POSITIVE_STATE, PRODUCTION_KEYWORDS, DB_MIGRATION_REQUIRED_GATES, SECURITY_REQUIRED_GATES, FILES_ALLOWED) unverändert"
  - "ALLOWED_GATES, ALLOWED_RISK_LEVELS, ALLOWED_AGENTS, AGENT_VALIDATOR_MAP, RISK_CATEGORY_TO_RISK_LEVEL_MAP unverändert"
  - "MAX_REWRITE_LOOPS unverändert (2)"
  - "OrchestratorIntent-TypeScript-Interface unverändert"
  - "parseOrchestratorIntent unverändert"
  - "normalizeOrchestratorIntent (WO-005/009) unverändert"
  - "dispatcher.ts unverändert (Outer Catch-Block aus WO-011 fängt sowieso noch alle Edge-Cases)"
  - "WO-006 Lock-Release-Verhalten bleibt 1:1 erhalten"
  - "WO-011 Run-id-spezifischer Status-Update bleibt 1:1 erhalten — bei REWRITE-Limit FAIL nach §0 wird active_workorders[(woId, runId)].status auf 'failed' gesetzt"
  - "Kein Validator-Bypass eingeführt"
  - "Kein --force/--skip-validator/--bypass Flag eingeführt"
  - "Keine neuen npm-Dependencies; package.json unverändert"
  - "Keine Änderung an services/scheduler-api/**, batch-loader.ts, scheduler-preflight.ts, review-pipeline.ts, risk-categories.ts, workorder.schema.json"
  - "smoke-test.ts bleibt 9/9 PASS (Mocks aus WO-007 enthalten bereits alle Array-Felder)"
  - "dispatcher-fail-cleanup.test.ts bestehende 17 Tests bleiben grün"
  - "Neue additive Tests (mindestens 6) decken alle 4 Array-Felder ab: undefined-Pfad, non-array-Pfad (String), und Negativ-Schutz (valider Intent durchläuft)"
  - "pnpm tsc --noEmit clean"
  - "Nutrition Batch 001 Dry-Run bleibt PASS (READY_TO_RUN)"
  - "Nutrition Batch 001 --run scheitert NICHT mehr an 'intent.required_gates is not iterable' TypeError; falls FAIL, dann mit Validator-Reason wie 'Feld \"required_gates\" muss ein Array sein, war: ...' (kontrolliertes REWRITE-Limit-FAIL)"

negative_constraints:
  - "NIEMALS außerhalb scope_files schreiben"
  - "NIEMALS Validator-§1-§8 Logik abschwächen oder entfernen"
  - "NIEMALS ALLOWED_GATES erweitern oder reduzieren"
  - "NIEMALS ALLOWED_RISK_LEVELS erweitern oder reduzieren"
  - "NIEMALS ALLOWED_AGENTS erweitern oder reduzieren"
  - "NIEMALS AGENT_VALIDATOR_MAP / RISK_CATEGORY_TO_RISK_LEVEL_MAP ändern"
  - "NIEMALS MAX_REWRITE_LOOPS erhöhen"
  - "NIEMALS parseOrchestratorIntent oder normalizeOrchestratorIntent ändern (WO-005/009-Layer bleibt unangetastet)"
  - "NIEMALS OrchestratorIntent-TypeScript-Interface ändern"
  - "NIEMALS WO_TRANSITIONS oder ActiveWorkorder.status-Union ändern"
  - "NIEMALS dispatcher.ts ändern (außer Tests; Outer Catch-Block bleibt)"
  - "NIEMALS state-manager.ts ändern (kein neuer Helper nötig — §0 ist rein Validator-Defensive)"
  - "NIEMALS audit-writer.ts ändern (kein neuer Audit-Event-Typ nötig — bestehender governance_violation reicht)"
  - "NIEMALS batch-loader.ts oder system/workorders/cli/** ändern"
  - "NIEMALS services/scheduler-api/** ändern"
  - "NIEMALS scheduler-preflight.ts ändern"
  - "NIEMALS review-pipeline.ts ändern"
  - "NIEMALS risk-categories.ts ändern"
  - "NIEMALS workorder.schema.json ändern"
  - "NIEMALS undefined required_gates silent auf [] normalisieren ohne nachfolgende Validator-Strenge — §0 muss explizit REWRITE returnen"
  - "NIEMALS bei non-Array silent durchlaufen lassen — TypeError-Crash MUSS durch §0 verhindert werden"
  - "NIEMALS ein --force / --skip-validator / --bypass Flag einbauen"
  - "NIEMALS runtime_state.json oder system/state/*.jsonl direkt editieren"
  - "NIEMALS Approval-Queue-Dateien (system/approval/**) editieren"
  - "NIEMALS Supabase-Befehle ausführen (supabase db push/reset/migration apply)"
  - "NIEMALS package.json ändern"
  - "NIEMALS neue npm-Dependencies hinzufügen"
  - "NIEMALS bestehende Tests deaktivieren oder skip-pen (xtest/it.skip/test.skip/xit)"
  - "NIEMALS Test-Anzahl in dispatcher-fail-cleanup.test.ts oder smoke-test.ts reduzieren"
  - "NIEMALS Audit-History (audit.jsonl, audit.error.jsonl, pipeline-audit.jsonl) löschen oder rewriten"
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

- **Filename ↔ workorder_id:** Filename `WO-GOVERNANCE-P1-012-orchestrator-intent-array-defaults.md` folgt der Auftrags-Convention; `workorder_id: WO-governance-012` folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.
- **`requires_approval: true`** ist Pflicht für `risk_category: architecture` per `CLAUDE.md` Cautious-Regel (Spark D mandatory, kein Auto-Retry).
- **`agent_id: senior-coding-agent`** — registriert in `system/agent-registry/agents.json`. Wird durch `AGENT_VALIDATOR_MAP['senior-coding-agent'] = 'micro-executor'` (WO-005) korrekt zu `ALLOWED_AGENTS`-Wert normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) wird `risk_level` auf `'medium'` aufgefüllt. Mit WO-012 ist dieser WO selbst dispatchable, weil sein OrchestratorIntent-Output (vom Senior-Coding-Agent) keine Array-Felder mehr fehlen darf.
- **`rollback_hint` nicht erforderlich** per Schema if/then (nicht db-migration).
- **Verhältnis zu WO-005 / WO-006 / WO-007 / WO-008 / WO-009 / WO-010 / WO-011:**
  - WO-005/009 normalisieren OrchestratorIntent-String-Felder (`selected_agent`, `risk_level`).
  - WO-006/011 fixen Cleanup auf FAIL-Pfaden (Lock-Release + Run-id-spezifischer Status-Update).
  - WO-007/008 modernisieren Smoke-Tests + Reviewer-Injection.
  - WO-010 baut Operator-CLI für Terminal-WO-Reset.
  - **WO-012** schließt die letzte bekannte Validator-Robustheits-Lücke: defensive Array-Type-Checks vor for-of-Iterationen → kein TypeError-Crash mehr bei Modell-Output ohne Array-Felder. Validator-Strenge bleibt unverändert; nur die TypeError-Quelle wird durch deterministisches REWRITE ersetzt.
- **Architekturelle Sauberkeit:** Die zentrale Pre-Validation (§0) ist die kompakteste Lösung. Alternative inline-Defensive vor jeder for-of-Schleife wäre 4-5 Stellen statt 1 — mehr Diff-Fläche, schlechter wartbar. Variante 1 ist der "Defense-at-Boundary"-Pattern.
- **`scope_files` enthält 4 Files** — `governance-validator.ts` (Primary, neuer §0-Block) + `dispatcher.ts` (in scope für Sicherheit, aber Edit nicht erwartet) + 2 Test-Files. Konsistent mit `template_implementation_medium.md` (3-15 Files).
- **`files_blocked` schließt `terminal-wo-reset-cli.ts` (WO-010)** explizit aus — die CLI bleibt unverändert.
- **`files_blocked` schließt `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`, `system/state/**`, `system/approval/**`, `services/scheduler-api/**`, `system/workorders/cli/**`** explizit aus — WO-012 ist ein reiner Validator-Robustheits-Fix, kein Eingriff in Pipeline/State/Schema.
- **Audit-Trail:** Bestehender `governance_violation`-Event-Typ wird vom REWRITE-Pfad korrekt geschrieben (Validator returnt → dispatcher.ts ruft `audit.writeAuditEvent({ event: 'governance_violation', ... })`). Kein neuer Audit-Event-Typ nötig.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (architecture-review + Spark D mandatory) → `closed`. Auto-Retry **deaktiviert** für `architecture` per `CLAUDE.md` High-Risk-Regel.
- **Bezug zur Geschichte:**
  - Pre-WO-012 Live-State (post-WO-011 + Cleanup von RUN-20260502-3836): Re-Run produzierte `RUN-20260503-7133` mit `status: failed` und Error `intent.required_gates is not iterable`. WO-011 wirkte korrekt (run-id-spezifisches FAIL-Update); WO-012 schließt die Validator-Robustheits-Lücke.
  - Post-WO-012-Erwartung: bei demselben Modell-Output produziert der Validator REWRITE mit Reason "Feld required_gates muss ein Array sein, war: undefined" → Dispatcher REWRITE-Loop läuft → nach 2 REWRITES FAIL mit klarer Reason. Operator sieht `governance_violation`-Audit statt Crash.
- **Production-Default Verhalten unverändert:** Wenn das Modell ein valides OrchestratorIntent mit allen 4 Array-Feldern liefert, läuft §0 als NOOP durch — `Array.isArray()` returnt true, kein REWRITE. Performance-Impact vernachlässigbar (4 Array.isArray-Calls pro Validation).
- **Tom darf nicht selbst granten** — die WO-Approval folgt dem normalen Spark-D-Mandatory-Review-Flow.

---

*Draft erzeugt: 2026-05-03 — gemäß `template_implementation_medium.md`, `wo_factory_prompt.md`, Workflow-Test-Befund-Sequenz nach WO-011-Closure (`RUN-20260503-7133` TypeError), und WO-GOVERNANCE-P1-005 + WO-GOVERNANCE-P1-009 als Pattern-Vorlagen für defensive Validator-Layer.*
