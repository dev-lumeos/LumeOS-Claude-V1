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

## 12. Batch Loader / Workflow-Lücke

Inspection Ergebnis:

```txt
PARTIAL_WORKFLOW_EXISTS
```

Vorhanden:

- Approval Queue
- Dispatcher
- Preflight
- Locks
- Review Pipeline
- State Manager
- Reports

Fehlt:

```txt
Markdown-Batch → WO-Drafts → Schema Validation → dispatchWorkorder()
```

Es gibt keinen offiziellen Single-WO- oder Markdown-Batch-CLI Entry Point.

Spec für fehlenden Entry Point:

```txt
docs/project/BATCH_LOADER_CLI_V1.md
```

Architecture-Entscheidung:

```txt
USE_LIBRARY_DISPATCH
```

Das bedeutet:

- Batch Loader V1 ruft `dispatchWorkorder()` direkt als Library auf.
- Scheduler HTTP Service wird nicht genutzt.
- Scheduler HTTP Service ist Phase 2 / Production-Erweiterung.

---

## 13. Governance Bootstrap Workorder

Da kein Entry Point existiert, ist `WO-governance-004` ein einmaliger Bootstrap-Sonderfall.

Draft:

```txt
system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md
```

Review:

```txt
system/workorders/nutrition/drafts/REVIEW-WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md
```

Review Verdict:

```txt
PASS
```

Batch:

```txt
system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-001-batch-loader-cli.md
```

Batch Status:

```txt
ready_for_approval
```

Interne ID:

```txt
WO-governance-004
```

### Warum Bootstrap

Der offizielle Entry Point fehlt genau für die Art Workflow, die diese WO bauen soll. Deshalb darf diese eine WO mit explizitem Tom-Approval umgesetzt werden.

Das ist kein generelles Muster.

Nach Implementierung des Batch Loaders müssen weitere Batches über den Loader laufen.

---

## 14. WO-governance-004 Scope

Erlaubte Dateien:

```txt
system/workorders/cli/run-batch.ts
system/workorders/cli/batch-loader.ts
system/workorders/cli/README.md
```

Verboten:

```txt
services/scheduler-api/**
system/control-plane/dispatcher.ts
system/control-plane/scheduler-preflight.ts
system/state/state-manager.ts
system/approval/approval-queue.ts
package.json
system/approval/queue.json
system/state/runtime_state.json
system/state/*.jsonl
supabase db push
supabase db reset
echte Workorder-Ausführung außer dry-run Parsing/Validation
```

### Batch Loader V1 Muss

- CLI unterstützen:

```txt
npx tsx system/workorders/cli/run-batch.ts <batch-file> --dry-run
npx tsx system/workorders/cli/run-batch.ts <batch-file> --run
```

- Default sicher: ohne `--run` kein echter Run.
- `--dry-run`:
  - Batch-MD lesen
  - Included Workorders erkennen
  - Draft-Dateien laden
  - ersten YAML-Codeblock oder Workorder-YAML-Block extrahieren
  - gegen `workorder.schema.json` validieren
  - Dependency-Reihenfolge prüfen
  - Approval-Bedarf anzeigen
  - nichts ausführen
- `--run`:
  - `dispatchWorkorder()` direkt als Library nutzen
  - nicht `services/scheduler-api` nutzen
  - `runPreflight()` respektieren, falls sinnvoll importierbar
  - bei HOLD/REJECT stoppen
  - db-migration nicht ohne Approval durchlaufen lassen
  - pending approvals am Ende anzeigen

### Required Validation

Nach Implementierung:

```powershell
pnpm tsc --noEmit
npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run
```

---

## 15. Explizites Approval für Bootstrap

Nächster sauberer Schritt ist, dass Tom explizit Approval für genau diese Bootstrap-WO gibt.

Muster:

```txt
APPROVED BOOTSTRAP EXECUTION

I approve WO-governance-004 as a one-time bootstrap implementation.

Scope:
- system/workorders/cli/run-batch.ts
- system/workorders/cli/batch-loader.ts
- system/workorders/cli/README.md

Allowed:
- implement batch loader CLI V1 according to WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md
- run pnpm tsc --noEmit
- run dry-run command only

Forbidden:
- no services/scheduler-api changes
- no dispatcher/state/approval code changes
- no runtime_state edits
- no approval queue edits
- no supabase db push
- no real Workorder execution except dry-run parsing/validation
```

Dann kann Claude Code die Bootstrap-WO implementieren.

---

## 16. Bestehende Workflow-Komponenten

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
```

---

## 17. Git / Commits zuletzt

Zuletzt relevante Commits:

```txt
9fdfbca fix(claude): make pre-tool audit logging non-blocking
9f0842c fix(claude): harden pre-tool audit logging
d5dfce8 docs(nutrition): mark first db foundation batch ready for approval
fab0c1e docs(workorders): add wo factory prompts
a93bd4c docs(nutrition): add first phase 1 db foundation batch plan
```

Weitere lokale Commits danach:

```txt
1a31009 docs(workorders): add batch loader cli draft workorder
76eaa36 docs(workorders): review batch loader cli draft workorder
475c950 docs(workorders): add batch loader cli approval batch
```

Zusätzlich wurde `docs/project/BATCH_LOADER_CLI_V1.md` erstellt und sollte committed sein oder committed werden, falls noch untracked.

Immer prüfen:

```powershell
git status
git log --oneline -8
```

---

## 18. Claude Hook Fix

Hook-Datei:

```txt
.claude/hooks/pre-tool.ps1
```

Problem:

- PreToolUse Bash hook error kam beim Audit-Logging.
- Ursache war Logging-Zeile mit ToolInput.
- Patch wurde auf non-blocking Audit Logging geändert.
- Wichtig: In PowerShell keine Bash-Heredoc-Syntax wie `python - <<'PY'` verwenden.

Richtige Regel:

- Bei Patches in PowerShell entweder native PowerShell nutzen oder temporäre Python-Datei per PowerShell schreiben und dann `python file.py` ausführen.
- Vor Commit immer prüfen:

```powershell
git --no-pager diff -- .claude/hooks/pre-tool.ps1
```

Nicht akzeptabel:

```txt
ðŸ...
﻿#
```

Das wären Encoding-Schäden.

---

## 19. DGX / Spark Status

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

## 20. Nächster Schritt nach diesem Handover

Wenn in neuem Chat fortgesetzt wird, direkt hier einsteigen:

```txt
Wir sind bei WO-governance-004 Bootstrap.
Bitte nutze das Handover-Dokument.
Nächster Schritt: Ich gebe explizites Bootstrap-Approval, danach soll Claude Code ausschließlich WO-governance-004 implementieren.
```

Vorher prüfen:

```powershell
git status
git log --oneline -8
```

Dann Approval-Text nutzen:

```txt
APPROVED BOOTSTRAP EXECUTION

I approve WO-governance-004 as a one-time bootstrap implementation.

Scope:
- system/workorders/cli/run-batch.ts
- system/workorders/cli/batch-loader.ts
- system/workorders/cli/README.md

Allowed:
- implement batch loader CLI V1 according to WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md
- run pnpm tsc --noEmit
- run dry-run command only

Forbidden:
- no services/scheduler-api changes
- no dispatcher/state/approval code changes
- no runtime_state edits
- no approval queue edits
- no supabase db push
- no real Workorder execution except dry-run parsing/validation
```

Claude Code muss dann streng nach WO-GOVERNANCE-P1-004 arbeiten.

---

## 21. Kompakter Prompt für neuen Chat

```txt
Ich arbeite im Repo D:\GitHub\LumeOS-Claude-V1.
Bitte lies das Handover-Dokument vollständig.
Wir arbeiten am LumeOS Governance-/Workorder-System und Nutrition V1.
Nicht improvisieren.
Nutze vorhandene Workorder-Factory, Templates, Schema, Lifecycle und Batch-Pläne.
Aktueller Fokus: WO-governance-004 Batch Loader CLI Bootstrap.
Ziel: fehlenden Markdown-Batch Entry Point bauen, damit danach Nutrition Batch 001 regulär über den Workflow laufen kann.
```

