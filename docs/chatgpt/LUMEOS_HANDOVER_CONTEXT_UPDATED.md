# LumeOS — Handover Context for New Chat

Stand: 2026-05-02  
Zweck: Dieses Dokument enthält den aktuellen Arbeitsstand, wichtige Pfade, Dateien, Entscheidungen, offene Punkte und nächste Schritte für das LumeOS Governance-/Workorder-/Nutrition-System.  
Nutzung: In einem neuen Chat diese Datei oder den Inhalt als Kontext geben, damit nicht wieder alles rekonstruiert werden muss.

---

## 1. Grundregel für den neuen Chat

Arbeite nicht frei improvisiert.

Immer vorhandene Struktur nutzen:

- Workorder-Schema
- Workorder-Templates
- Workorder-Lifecycle
- WO-Factory-Prompts
- Split-Pläne
- Batch-Pläne
- Reviews
- Acceptance Criteria
- FILES_ALLOWED / FILES_BLOCKED

Keine langen neuen Prompts erfinden, wenn vorhandene Factory-Prompts genutzt werden können.

---

## 2. Haupt-Repo

```txt
D:\GitHub\LumeOS-Claude-V1
```

Alle Pfade in diesem Dokument beziehen sich auf dieses Repo.

---

## 3. Aktuelle Arbeitslogik

Ziel ist nicht, einzelne Workorders irgendwie manuell erledigen zu lassen.

Ziel ist, den vollständigen LumeOS-Workflow zu testen und nutzbar zu machen:

```txt
Spec
→ Decomposition / Split
→ Workorder Factory
→ Draft-WOs
→ Review / Fix
→ Batch Plan
→ Approval
→ Dispatch / Execution
→ Audit / Reports
```

Wichtig:

- Kein Bypass am Workflow vorbei.
- Keine manuelle Einzel-WO-Ausführung, wenn ein offizieller Weg existiert.
- Aktuell fehlt aber ein offizieller Entry Point für Markdown-Batches.
- Deshalb gibt es genau einen dokumentierten Bootstrap-Sonderfall: `WO-governance-004`.

---

## 4. Nutrition-Spec-Struktur

Aktueller Nutrition-Spec-Root:

```txt
docs/specs/Nutrition/
```

Zielstruktur ist bereits aufgeräumt:

```txt
docs/specs/Nutrition/
  INDEX.md

  00_decisions/
  01_current_specs/
  02_patches/
  03_sql/
  04_adrs/
  05_reviews/
  06_workorder_planning/
```

Root soll im Normalfall nur enthalten:

```txt
INDEX.md
optional README.md
```

### Wichtige Nutrition-Dateien

```txt
docs/specs/Nutrition/00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md

docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md
docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md
docs/specs/Nutrition/01_current_specs/SPEC_03_USER_FLOWS.md
docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md
docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md
docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
docs/specs/Nutrition/01_current_specs/SPEC_07_API.md
docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md
docs/specs/Nutrition/01_current_specs/SPEC_09_SCORING.md
docs/specs/Nutrition/01_current_specs/SPEC_10_COMPONENTS.md

docs/specs/Nutrition/02_patches/SPEC_02_PASS2_ENTITIES.md
docs/specs/Nutrition/02_patches/SPEC_03_PASS2_PATCH.md
docs/specs/Nutrition/02_patches/SPEC_06_PATCH_V1_DECISIONS.md
docs/specs/Nutrition/02_patches/SPEC_06_RECALCULATE_PATCH.md
docs/specs/Nutrition/02_patches/SPEC_07_PASS2_PATCH.md
docs/specs/Nutrition/02_patches/SPEC_09_PATCH_UL_SUPPLEMENTS.md
docs/specs/Nutrition/02_patches/SPEC_10_PASS2_PATCH.md

docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql
docs/specs/Nutrition/03_sql/NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md

docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md
docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_02_DATA_API.md
docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md
docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_V1_FINAL.md

docs/specs/Nutrition/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md
docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md
```

---

## 5. Nutrition V1 Status

Final Review Ergebnis:

```txt
PASS_WITH_FIXES
```

Praktisch heißt das:

```txt
14 Bereiche sind workorder-ready.
2 Bereiche warten auf externe Entscheidungen / Daten.
```

### Workorder-ready Bereiche

- BLS Import
- Food Search
- Custom Foods
- Tags
- Preferences / Onboarding
- Diary / Meal Items
- Snapshots / Recalculate
- Portions
- Water Logs
- Nutrition Targets
- Supplements API Integration
- Coach Permissions
- Coach Suggestions
- Recipes / Meal Plans / Shopping Lists schema-only
- Thai / i18n preparation
- MealCam UI mit Mock Provider teilweise startbar
- Micronutrient Review UI/API Placeholder teilweise startbar

### Echte externe Blocker

#### BLOCK-1: MealCam Vision Provider

Blockiert:

- echter MealCam Provider Adapter
- echte MealCam Service Integration

Blockiert nicht:

- MealCam Schema
- Consent UI
- Confirmation UI
- Mock Provider UI

#### BLOCK-2: nutrient_reference_values Seed-Werte

Blockiert:

- echtes Micronutrient Scoring
- UL/Ampel-Produktionslogik
- echte RDA/AI/UL-basierte Bewertung

Blockiert nicht:

- Tabellenstruktur
- API Placeholder
- UI grau / nicht bewertbar
- Supplements API Boundary

---

## 6. Nutrition V1 Grundentscheidungen

### Food-Datenquellen

- BLS 4.0 ist die einzige Master-Food-Datenquelle in V1.
- OpenFoodFacts ist nicht V1.
- USDA ist nicht V1.
- Custom Foods sind erlaubt, aber klar von BLS getrennt.
- BLS 5.0 Update-Mechanismus kommt später.

### MealCam

- MealCam ist V1.
- Barcode Scanner ist Phase 2.
- MealCam darf nie automatisch finale Meal Items schreiben.
- User muss jedes erkannte Item bestätigen.
- High Confidence bedeutet nur grün/empfohlen in Confirmation UI.
- Real Provider wartet auf Entscheidung.

### Tags

V1 user-visible Tags:

```txt
high_protein
low_carb
low_fat
high_fiber
vegan
vegetarian
gluten_free
lactose_free
nut_free
halal
kosher
spicy
thai_food
mediterranean
processed_food
ultra_processed
```

Auto-Tag-Trigger darf nur 12 deterministisch ableitbare Tags setzen:

```txt
high_protein
low_carb
low_fat
high_fiber
vegan
vegetarian
gluten_free
lactose_free
nut_free
mediterranean
processed_food
ultra_processed
```

Diese 4 V1-Tags sind admin-managed und werden nicht automatisch gesetzt:

```txt
halal
kosher
spicy
thai_food
```

### Nutrition Preferences

V1 enthält:

- Allergien
- Unverträglichkeiten
- Likes
- Dislikes
- Ernährungsform
- religiöse/kulturelle Einschränkungen
- bevorzugte Küchen/Stile
- Meal Slots

Constraint-Level:

- Allergien = Hard Constraints
- Unverträglichkeiten = Strong Constraints
- religiös/kulturell = Hard Constraint, wenn User so setzt
- Dislikes = Soft Constraints
- Likes = Ranking Boost

### Coach

- Coach darf lesen, wenn User freigibt.
- Coach darf Vorschläge machen.
- Coach darf keine Nutrition-Daten direkt ändern.
- User muss Vorschläge annehmen oder ablehnen.

### Thai / i18n

- DE/EN aktiv.
- TH strukturell vorbereitet.
- TH UI sichtbar, aber disabled/ausgegraut.
- Klick auf TH: `Coming soon`.
- Thai ist nicht release-blockierend.

---

## 7. Workorder-System

Root:

```txt
system/workorders/
```

Bestehende Struktur:

```txt
system/workorders/adhoc/
system/workorders/batches/
system/workorders/examples/
system/workorders/lifecycle/
system/workorders/schemas/
system/workorders/templates/
system/workorders/nutrition/drafts/
system/workorders/nutrition/batches/
system/workorders/nutrition/approved/
system/workorders/nutrition/archive/
```

Wichtige Dateien:

```txt
system/workorders/schemas/workorder.schema.json
system/workorders/schemas/wo_factory_spec_v1.md
system/workorders/lifecycle/wo_lifecycle_v1.md
system/workorders/templates/README.md
system/workorders/templates/template_docs.md
system/workorders/templates/template_implementation_low.md
system/workorders/templates/template_implementation_medium.md
system/workorders/templates/template_migration.md
system/workorders/templates/template_test.md
```

---

## 8. WO Factory

Factory-Grundlagen existieren bereits.

Dedizierte Factory-Prompts wurden ergänzt:

```txt
system/prompts/wo-factory/wo_factory_prompt.md
system/prompts/wo-factory/wo_decomposition_prompt.md
```

### Nutzung künftig

Wenn nur große Spec / Plan vorhanden:

```txt
Nutze system/prompts/wo-factory/wo_decomposition_prompt.md.
```

Wenn geprüfter Split-Plan / Kandidatenliste vorhanden:

```txt
Nutze system/prompts/wo-factory/wo_factory_prompt.md.
```

Ziel: keine langen individuellen Prompts mehr bauen.

---

## 9. Nutrition Phase 1 DB Foundation

Split-Datei:

```txt
docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md
```

Phase 1 macht nur DB/Foundation.

Nicht Phase 1:

- keine API
- keine UI
- kein BLS Import Runner
- keine echte MealCam Provider Integration
- keine echten RDA/AI/UL Seed-Werte
- keine Production DB Pushes

### 14 Kandidaten aus dem Split

1. `nutrition-db-audit-existing-state`
2. `nutrition-db-core-schema-foundation`
3. `nutrition-db-food-core-tables`
4. `nutrition-db-custom-foods-and-portions`
5. `nutrition-db-diary-snapshot-foundation`
6. `nutrition-db-preferences-foundation`
7. `nutrition-db-targets-water-foundation`
8. `nutrition-db-reference-values-structure`
9. `nutrition-db-mealcam-foundation`
10. `nutrition-db-coach-suggestions-foundation`
11. `nutrition-db-schema-only-recipes-plans-shopping`
12. `nutrition-db-rls-grants-policies`
13. `nutrition-db-verify-schema`
14. `nutrition-db-rollback-plan`

### Recommended First Batch

1. `nutrition-db-audit-existing-state`
2. `nutrition-db-core-schema-foundation`
3. `nutrition-db-food-core-tables`

---

## 10. Erste Nutrition Draft-Workorders

Drafts:

```txt
system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md
system/workorders/nutrition/drafts/WO-NUTRITION-P1-002-core-schema-foundation.md
system/workorders/nutrition/drafts/WO-NUTRITION-P1-003-food-core-tables.md
```

Review:

```txt
system/workorders/nutrition/drafts/REVIEW-WO-NUTRITION-P1-BATCH-001.md
```

Batch:

```txt
system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md
```

Batch Status:

```txt
ready_for_approval
```

### Workorder IDs

Dateinamen nutzen Display-Format:

```txt
WO-NUTRITION-P1-001-...
```

Interne schema-kompatible IDs:

```txt
WO-nutrition-001
WO-nutrition-002
WO-nutrition-003
```

Batch-Pläne müssen das Mapping dokumentieren.

---

## 11. Stand der ersten drei WOs

### WO-nutrition-001

Datei:

```txt
system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md
```

Typ:

```txt
docs / discovery
```

Approval:

```txt
nicht nötig
```

Ziel:

- vorhandene Nutrition DB-/Migration-/Schema-/Type-Dateien prüfen
- Audit Report erzeugen

Output:

```txt
docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md
```

Hinweis:

- audit-Verzeichnis darf angelegt werden, falls es fehlt.

### WO-nutrition-002

Datei:

```txt
system/workorders/nutrition/drafts/WO-NUTRITION-P1-002-core-schema-foundation.md
```

Typ:

```txt
db-migration
```

Approval:

```txt
erforderlich
```

Ziel:

- `nutrition` Schema
- Extensions wie `pg_trgm`
- `gen_random_uuid` / `pgcrypto` prüfen
- Schema Grants

Nicht Teil:

- keine Tabellen-DDL

Hinweis:

- `supabase db diff` ist manueller Reviewer/Tom-Check, nicht automatischer Validation Command.

### WO-nutrition-003

Datei:

```txt
system/workorders/nutrition/drafts/WO-NUTRITION-P1-003-food-core-tables.md
```

Typ:

```txt
db-migration
```

Approval:

```txt
erforderlich
```

Ziel:

- `nutrient_defs`
- `food_categories` inkl. `name_th`
- `foods`
- `food_nutrients`
- `food_aliases`
- `tag_definitions`
- `food_tags`
- Auto-Tag Trigger für deterministische Tags

Fixes bereits eingearbeitet:

- 16 V1-Tags werden in `tag_definitions` geseedet.
- Nur 12 deterministische Tags werden vom Trigger gesetzt.
- 4 admin-managed Tags werden nicht automatisch gesetzt.
- `nutrient_defs` muss genau 138 BLS-Code-Seed-Einträge enthalten.
- `tag_definitions` muss genau 16 V1-Tag-Seed-Einträge enthalten.

---

## 12. Batch Loader CLI / Bootstrap Status

Status: IMPLEMENTED AND VALIDATED

Der fehlende Workflow-Einstieg wurde per Bootstrap-WO umgesetzt.

Relevante Dateien:

```txt
docs/project/BATCH_LOADER_CLI_V1.md
system/workorders/cli/run-batch.ts
system/workorders/cli/batch-loader.ts
system/workorders/cli/README.md
system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md
system/workorders/nutrition/drafts/REVIEW-WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md
system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-001-batch-loader-cli.md
```

Status:

```txt
WO-governance-004: closed
BATCH-GOVERNANCE-P1-001: completed
Batch Loader Bootstrap: completed
```

Validation:

```txt
pnpm tsc --noEmit → PASS, Exit 0
run-batch --dry-run auf BATCH-NUTRITION-P1-001-db-foundation.md → PASS, Exit 0
Hook Status → PASS, keine PreToolUse:Bash hook error
Working tree vor/nach Validation → clean
```

Batch Loader Verhalten:

- `--dry-run` liest Batch-Datei.
- erkennt inkludierte WO-Drafts.
- extrahiert Workorder-YAML.
- validiert gegen `workorder.schema.json`.
- prüft Dependency-Reihenfolge.
- zeigt Approval-Bedarf.
- führt nichts aus.
- `--run` nutzt `dispatchWorkorder()` direkt als Library.
- Scheduler HTTP Service wird in V1 nicht genutzt.

Wichtige Architekturentscheidung:

- Batch Loader V1 nutzt Library Dispatch:
  - `system/control-plane/dispatcher.ts`
  - `dispatchWorkorder()`
  - `defaultCallModel`
  - `defaultExecuteTool`
- Nicht genutzt:
  - `services/scheduler-api/**`
  - Scheduler HTTP `/dispatch`
  - DispatchLoop
  - SlotManager
  - Supabase Workorder Repository

Aktueller Fix:

- `batch-loader.ts` musste `defaultCallModel` explizit an `dispatchWorkorder()` übergeben.
- Fehler `deps.callModel is not a function` ist behoben.

---

## 13. Claude Code Hook Fix

Datei:

```txt
.claude/hooks/pre-tool.ps1
```

Problem:

- Claude Code zeigte wiederholt:
  - `PreToolUse:Bash hook error`
  - `pre-tool.ps1:115 Zeichen:33`

Ursache:

- Audit-Logging-Block war nicht robust genug für Windows PowerShell 5.1.
- Versuche mit `UTF8Encoding::new($false)` und Encoding-Patches führten mehrfach zu Problemen.
- Finale Lösung: Audit-Logging vereinfacht und PowerShell-5.1-kompatibel gemacht.

Status:

- Hook-Test `pwd` → PASS
- Keine `PreToolUse:Bash hook error` mehr sichtbar
- Unicode/Emojis wurden erhalten
- Working tree clean nach Test

Wichtig:

- Bei künftigen Hook-Änderungen keine PowerShell-HereDocs oder Bash-Syntax verwenden.
- Keine `Set-Content`-Patches, wenn Emojis/Unicode enthalten sind.
- Wenn nötig: Claude Code soll Datei selbst minimal ändern und Diff prüfen.

---

## 14. Nutrition Batch 001 Status

Batch-Datei:

```txt
system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md
```

Status:

```txt
ready_for_approval
```

Enthaltene WOs:

- `WO-nutrition-001`
  - Datei: `system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md`
  - Typ: docs/discovery
  - aktueller Bootstrap-Agent: `micro-executor`
  - ursprünglicher Agent: `docs-agent`
  - Grund für Änderung: aktueller Governance Validator erlaubt `docs-agent` noch nicht als `selected_agent`.
- `WO-nutrition-002`
  - Core Schema Foundation
  - risk_category: `db-migration`
  - Approval erforderlich
- `WO-nutrition-003`
  - Food Core Tables
  - risk_category: `db-migration`
  - Approval erforderlich

Dry-run:

- PASS
- alle drei WOs schema-valide
- Dependency Order korrekt: `001 → 002 → 003`
- Approval-Bedarf für WO-002 und WO-003 korrekt erkannt
- Summary: `READY_TO_RUN`

Run-Status:

- `--run` erreicht inzwischen:
  - Loader
  - Dispatcher
  - Preflight
  - Locks
  - Model Call
  - Governance Validator

Aktueller Blocker:

- Governance Validator bricht ab mit:
  - `Governance: REWRITE-Limit (2) erreicht`
  - `Letzte Verletzung: Unbekannter Agent: undefined`

Erkenntnis:

- `workorder.agent_id` wird nicht automatisch zu `selected_agent`.
- Dispatcher ruft `callModel`.
- Modell erzeugt `OrchestratorIntent`.
- Validator prüft `intent.selected_agent`.
- Qwen/Spark-Orchestrator liefert aktuell kein `selected_agent`.
- Das ist kein Loader-Bug mehr.

---

## 15. Runtime-State-Cleanups während Workflow-Test

Datei:

```txt
system/state/runtime_state.json
```

Hinweis:

- Datei ist gitignored / Runtime-State.
- Nicht ohne explizite Approval bearbeiten.

Durchgeführt:

1. Entfernt:
   - `WO-nutrition-001`
   - `RUN-20260426-0500`
   - `agent_id: micro-executor`
   - `status: done`

2. Entfernt:
   - `WO-nutrition-002`
   - `RUN-20260426-0532`
   - `agent_id: micro-executor`
   - `status: awaiting_approval`

3. Entfernt:
   - `WO-nutrition-003`
   - `RUN-20260426-0567`
   - `agent_id: micro-executor`
   - `status: dispatched`

4. Entfernt nach späterem Test:
   - stale `WO-nutrition-001` active_workorders:
     - `RUN-20260502-3657`
     - `RUN-20260502-5008`
     - beide noch mit `agent_id: docs-agent`
   - stale scope_lock:
     - `RUN-20260502-5008`
     - scope file:
       - `docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md`

Grund:

- Alte Test-/Seed-Runs blockierten Preflight:
  - `wo_not_terminal`
  - `scope_lock_free`

Wichtige Erkenntnis:

- Dispatcher räumt bei bestimmten FAIL-Pfaden Scope-Locks und active_workorders nicht zuverlässig auf.
- Das ist ein eigener Governance-Core-Fix.
- Nicht weiter manuell workarounden, außer gezielt genehmigte State-Cleanups.

---

## 16. Aktueller Architecture-Blocker: OrchestratorIntent / selected_agent

Problem:

- Nutrition Batch 001 `--run` scheitert im Governance Validator:
  - `Unbekannter Agent: undefined`

Root Cause:

- `validateOrchestratorIntent()` prüft `intent.selected_agent`.
- Das Modell liefert `selected_agent` nicht zuverlässig.
- `workorder.agent_id` wird nicht automatisch in `selected_agent` übernommen.
- `governance-validator.ts` enthält außerdem eine begrenzte `ALLOWED_AGENTS` Liste:
  - `micro-executor`
  - `db-migration-agent`
  - `security-specialist`
  - `review-agent`
- `agents.json` enthält mehr Agents, u. a. `docs-agent`.
- Validator und Registry sind nicht synchron.

Bewertung:

- Loader Bug: nein
- Workorder Bug: nein
- Validator Config Bug: ja
- Model Output Bug: ja

Nicht tun:

- Validator nicht umgehen.
- `MAX_REWRITE_LOOPS` nicht erhöhen.
- `selected_agent` Check nicht deaktivieren.
- Kein `--force` im Loader bauen.
- Keine weiteren spontanen Quickfixes.

---

## 17. WO-Governance-005: OrchestratorIntent Contract Fix

Draft:

```txt
system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
```

Review:

```txt
system/workorders/nutrition/drafts/REVIEW-WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
```

Status:

- Draft erstellt
- Review: `PASS_WITH_FIXES`
- Fix-Pass durchgeführt
- Nach Fix: batch-ready

Workorder:

```txt
workorder_id: WO-governance-005
title: governance-orchestrator-intent-contract-v1
risk_category: architecture
requires_approval: true
agent_id: senior-coding-agent
```

Ziel:

- OrchestratorIntent Contract fixen.
- `selected_agent` darf nach Parsing/Normalization nie `undefined` sein.
- Docs/read-only WOs werden deterministisch auf einen validator-approved Agent gemappt.
- DB-Migration-WOs werden auf `db-migration-agent` gemappt.
- Validator darf nicht umgangen werden.

Wichtige Review/Fix-Entscheidung:

- V1 nutzt explizit eine Hardcoded-Map innerhalb bestehender Scope-Files.
- Keine neue Mapping-Datei in V1.
- Keine `agents.json`-Erweiterung in V1.
- Externe Mapping-Datei oder `agents.json[validator_target_agent]` ist Phase 2.
- `orchestrator_main_prompt.md` ist in V1 conditional/inaktiv, wenn kein bestehender Prompt-Ladepfad existiert.
- Kein direkter JSONL-Audit-Edit.
- Audit nur über bestehende Audit-Writer/Dispatcher-Mechanismen.

Nächster Schritt:

- Batch für WO-005 erzeugen:
  - `system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract.md`
- Danach Approval.
- Danach Implementation.

---

## 18. Bestehende Workflow-Komponenten

Approval:

```txt
system/approval/approval-queue.ts
system/approval/approval-cli.ts
system/approval/approval-gate.ts
```

Dispatcher / Execution:

```txt
system/control-plane/dispatcher.ts
system/control-plane/scheduler-preflight.ts
system/state/state-manager.ts
system/state/audit-writer.ts
system/control-plane/review-pipeline.ts
system/agent-registry/authorize-tool-call.ts
```

Reports:

```txt
system/reports/morning-report.ts
system/reports/failed-wo-report.ts
system/reports/model-quality-report.ts
system/reports/run-summary-generator.ts
system/reports/wo-dossier.ts
```

Useful commands:

```powershell
npx tsx system/approval/approval-cli.ts list
npx tsx system/approval/approval-cli.ts grant <approval_id>
npx tsx system/approval/approval-cli.ts deny <approval_id> "Grund"

npx tsx system/control-plane/night-run-policy.ts status
npx tsx system/control-plane/night-run-policy.ts check
npx tsx system/control-plane/night-run-policy.ts activate

npx tsx system/control-plane/stop-rules.ts --dry-run

npx tsx system/reports/morning-report.ts
npx tsx system/reports/failed-wo-report.ts
npx tsx system/reports/run-summary-generator.ts --all
npx tsx system/reports/wo-dossier.ts --all-completed

npx tsx system/workorders/cli/run-batch.ts <batch-file> --dry-run
npx tsx system/workorders/cli/run-batch.ts <batch-file> --run
```

---

## 19. Aktuelle offene TODOs

### Sofort

1. Committen:
   - `WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md`
   - `REVIEW-WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md`

2. Erzeugen:
   - `system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract.md`

3. Approval für WO-governance-005 einholen.

4. WO-governance-005 implementieren.

5. Danach Nutrition Batch 001 erneut testen:
   - `--dry-run`
   - `--run`

### Danach

6. Wenn Nutrition Batch 001 bei WO-002 pausiert:
   - Approval Queue prüfen
   - nicht selbst granten
   - Tom entscheidet

7. Eigene Governance-WO anlegen:
   - `governance-dispatcher-fail-cleanup-v1`
   - Ziel:
     - Dispatcher muss bei FAIL/Exception-Pfaden Scope-Locks freigeben.
     - active_workorders muss terminal markiert oder sauber entfernt/archiviert werden.
     - Keine stale `dispatched`/`running` Einträge nach FAIL.

8. Spätere Phase-2-WO:
   - `governance-validator-agent-registry-sync-v1`
   - Ziel:
     - Validator allowed agents mit `agents.json` synchronisieren.
     - Hardcoded-Map durch Registry-/Config-basierte Lösung ersetzen.

---

## 20. Git / Commits zuletzt

Zuletzt relevante Commits aus dieser Arbeitsphase:

```txt
fix(claude): simplify pre-tool audit logging
feat(workorders): add batch loader cli bootstrap
docs(governance): add batch loader cli spec
docs(workorders): add batch loader cli approval batch
docs(workorders): review batch loader cli draft workorder
docs(workorders): add batch loader cli draft workorder
docs(workorders): mark batch loader bootstrap complete
docs(nutrition): use micro executor for bootstrap audit workorder
```

Immer prüfen:

```powershell
git status
git log --oneline -8
```

---

## 21. DGX / Spark Status

### Spark 3

Host:

```txt
edgexpert-509d
```

Endpoint funktioniert:

```bash
curl http://localhost:8001/v1/models
```

Antwort enthält:

```txt
google/gemma-4-26B-A4B-it
max_model_len: 65536
```

Docker:

```txt
Container: vllm_node
Status: Up 3 days
```

Wichtig:

- vLLM auf Spark 3 wurde per `docker exec` im laufenden Container gestartet.
- Deshalb zeigt `docker logs vllm_node` nur CUDA-Container-Startbanner, nicht vLLM Runtime Logs.

Spark-3 Statusbefehle:

```bash
curl http://localhost:8001/v1/models

docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"

ps aux | grep -iE "vllm|gemma|python|uvicorn" | grep -v grep

watch -n 1 nvidia-smi
```

Wenn künftig echte vLLM Logs gewünscht sind, beim Start mit Logfile:

```bash
2>&1 | tee -a ~/spark3-vllm.log
```

Dann:

```bash
tail -f ~/spark3-vllm.log
```

Nicht neu starten, solange Healthcheck funktioniert.

---

## 22. Kurz-Prompt für neuen Chat

```txt
Ich arbeite im Repo D:\GitHub\LumeOS-Claude-V1.
Bitte lies das Handover-Dokument vollständig.
Wir arbeiten am LumeOS Governance-/Workorder-System und Nutrition V1.
Nicht improvisieren.
Nutze vorhandene Workorder-Factory, Templates, Schema, Lifecycle und Batch-Pläne.

Aktueller Stand:
- Batch Loader CLI Bootstrap ist implementiert und validiert.
- run-batch --dry-run für Nutrition Batch 001 ist PASS.
- run-batch --run erreicht Dispatcher/Model/Governance Validator.
- Aktueller Blocker ist nicht mehr der Loader, sondern der OrchestratorIntent Contract:
  Validator erhält selected_agent: undefined.
- Dafür existiert jetzt:
  - WO-GOVERNANCE-P1-005-orchestrator-intent-contract.md
  - Review dazu
  - Fix-Pass erledigt
  - WO ist batch-ready.
- Nächster Schritt:
  - Batch BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract.md erzeugen.
  - Dann Approval.
  - Dann Implementation.
- Nicht weiter spontan patchen.
- Keine Runtime-State-Cleanups ohne explizite Approval.
- Keine Supabase-Befehle.
- Keine Workorders manuell am Workflow vorbei ausführen.
```

---

## 23. Aktueller One-Liner

```txt
Wir sind nicht mehr beim Batch Loader. Der ist okay. Aktueller Blocker ist OrchestratorIntent/selected_agent. Nächster Schritt ist BATCH-GOVERNANCE-P1-002 für WO-governance-005.
```
