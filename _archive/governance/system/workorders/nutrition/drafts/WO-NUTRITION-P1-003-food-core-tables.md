# WO-NUTRITION-P1-003 — Nutrition Food Core Tables

**Status:** draft
**Phase:** 1 — DB Foundation
**Source:** `docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` §5 Kandidat #3
**Template:** `system/workorders/templates/template_migration.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `blocked` (auf WO-nutrition-002) → `ready` → `dispatched` → `running` → `done` → `reviewed` → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- Keine User-Daten-Tabellen (foods_custom, meals, meal_items etc. — kommen in P1-004+)
- Keine BLS-Daten-Import-Logik (Phase 2)
- Keine Search-API (Phase 2)
- Kein UI
- Keine Tags außerhalb der 16 V1-Tags aus `NUTRITION_NEXT_SPEC_DECISIONS.md §5`
- Keine erweiterten Tags aus `SPEC_05_FOOD_TAXONOMY.md` Phase 1+ (= Phase 2)
- Keine OpenFoodFacts- oder USDA-Datenquelle
- Keine Service-Code-Änderungen
- Keine Produktivmigration ausführen (`supabase db push --linked` bleibt manuell durch Tom)

---

## Workorder

```yaml
workorder_id: "WO-nutrition-003"
agent_id:     "db-migration-agent"
phase:        1
priority:     "normal"
quality_critical: false
requires_approval: true
risk_category: "db-migration"
rollback_hint: "DOWN: DROP TRIGGER IF EXISTS trg_foods_auto_tag ON nutrition.foods; DROP FUNCTION IF EXISTS nutrition.trg_auto_tag_food_fn() CASCADE; DROP FUNCTION IF EXISTS nutrition.auto_tag_food(UUID) CASCADE; DROP TABLE IF EXISTS nutrition.food_tags, nutrition.food_aliases, nutrition.food_nutrients, nutrition.foods, nutrition.food_categories, nutrition.tag_definitions, nutrition.nutrient_defs CASCADE — nur wenn keine User-Daten-Tabellen referenzieren. Konkrete DOWN-SQL-Templates im Migration-Header dokumentieren."

task: |
  <task>
    <analyze>
      Lies bestehenden Schema-Stand in supabase/migrations/ und nutrition Schema (nach P1-002).
      Lies SPEC_06_DATABASE_SCHEMA.md für DDL-Details der 7 Stamm-Tabellen.
      Lies SPEC_06_V1_MIGRATION.sql für Pass-1/2-Korrekturen (food_categories.name_th muss enthalten sein).
      Lies NUTRITION_NEXT_SPEC_DECISIONS.md §5 für die 16 V1-Tags die als Seed in tag_definitions kommen.
      Beachte den Split innerhalb der 16 V1-Tags:
        - 12 deterministisch ableitbare Tags werden vom Auto-Tag-Trigger gesetzt:
          high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian,
          gluten_free, lactose_free, nut_free, mediterranean,
          processed_food, ultra_processed
        - 4 admin-managed Tags werden NUR als tag_definitions-Seed angelegt,
          aber NICHT vom Trigger automatisch zugewiesen:
          halal, kosher, spicy, thai_food
        Quelle: NUTRITION_NEXT_SPEC_DECISIONS.md §5 — "manuell gepflegte Tag-Liste für schwierige Tags".
      Lies audit-report.md (aus WO-nutrition-001) um zu prüfen ob Tabellen ggf. teilweise existieren.
      Plane Migration UND Rollback bevor du schreibst.
    </analyze>

    <implement>
      Erstelle eine neue Migration-Datei unter:
      supabase/migrations/  (future path to be decided — Naming-Convention YYYYMMDD_NNN_nutrition_food_core_tables.sql)

      Inhalt der Migration (UP) — alle CREATE TABLE / CREATE INDEX / CREATE FUNCTION mit IF NOT EXISTS / OR REPLACE:

      Tabellen (7):
      - nutrition.nutrient_defs (138 BLS-Codes als Stamm; Seed-INSERTs in dieser Migration)
      - nutrition.food_categories (4-Ebenen-Baum; INKLUSIVE name_th TEXT)
      - nutrition.foods (BLS Core-Food-Datenbank, bls_code UNIQUE NOT NULL)
      - nutrition.food_nutrients (EAV; PK = food_id + nutrient_code)
      - nutrition.food_aliases (DE/EN/TH Synonyme; PK = food_id + alias + locale)
      - nutrition.tag_definitions (Seed-INSERTs der 16 V1-Tags aus Decisions §5 — alle 16 als Definition geseedet)
      - nutrition.food_tags (food_id + tag_code PK)

      Auto-Tag-Trigger:
      - Funktion nutrition.auto_tag_food(p_food_id UUID) — REDUZIERT auf die 12 deterministisch ableitbaren V1-Tags:
        high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian,
        gluten_free, lactose_free, nut_free, mediterranean, processed_food, ultra_processed
      - Die 4 admin-managed Tags (halal, kosher, spicy, thai_food) werden vom Trigger NICHT gesetzt —
        sie existieren nur als tag_definitions-Seed und werden später durch Admin-Tools / manuelle Pflege
        in food_tags geschrieben (Admin-Tagging-Mechanismus ist nicht Teil dieser WO).
      - Trigger trg_foods_auto_tag AFTER INSERT OR UPDATE OF (relevante Spalten) ON nutrition.foods

      Indexe:
      - GIN-Index auf foods.name_display (pg_trgm) für Textsuche
      - GIN-Index auf food_aliases.alias (pg_trgm)
      - sort_weight, category, bls_code, nutrient_code wie in SPEC_06 spezifiziert

      RLS:
      - ALTER TABLE ... ENABLE ROW LEVEL SECURITY auf allen 7 Tabellen
      - Read-all-Policy für Rolle authenticated auf allen 7 Tabellen
      - Write-Rechte nur über service_role (kein authenticated-Write auf Stamm-Tabellen)

      Grants:
      - GRANT SELECT auf alle 7 Tabellen für authenticated
      - GRANT ALL für service_role (nur falls noch nicht aus Schema-Foundation)

      DOWN-Rollback als SQL-Kommentar im Migration-Header dokumentieren (analog rollback_hint).

      TypeScript-Types:
      - Aktualisiere/erstelle packages/types/src/nutrition/foods.ts mit Interfaces zu den 7 Tabellen
      - Re-Export in packages/types/src/nutrition/index.ts
    </implement>

    <constraints>
      Migration muss reversibel sein (rollback_hint Pflicht).
      Migration muss idempotent sein (CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION, etc.).
      RLS für alle neuen Tabellen aktivieren — keine Ausnahme.
      Tag-Definitions Seed: ausschließlich die 16 V1-Tags aus NUTRITION_NEXT_SPEC_DECISIONS.md §5 (high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian, gluten_free, lactose_free, nut_free, halal, kosher, spicy, thai_food, mediterranean, processed_food, ultra_processed). KEINE weiteren Tags aus SPEC_05.
      Auto-Tag-Trigger setzt ausschließlich die 12 deterministisch ableitbaren V1-Tags (high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian, gluten_free, lactose_free, nut_free, mediterranean, processed_food, ultra_processed). Die 4 admin-managed Tags (halal, kosher, spicy, thai_food) werden NICHT vom Trigger gesetzt.
      Kein DROP COLUMN, kein DROP TABLE.
      Naming-Convention YYYYMMDD_NNN_<beschreibung>.sql.
    </constraints>

    <on_error>
      Bei fehlender Schema-Foundation (nutrition Schema nicht existent): {"status": "BLOCKED", "issues": ["nutrition schema missing — WO-nutrition-002 nicht abgeschlossen"]}.
      Bei fehlendem rollback_plan: {"status": "BLOCKED"}.
      Bei Destructive SQL ohne Task: {"status": "STOP"}.
      Bei RLS fehlt: {"status": "FAIL"}.
      Bei Breaking Schema Change: {"status": "ESCALATE"}.
      Bei Tag-Set Drift (mehr/weniger als 16 V1-Tags in tag_definitions geseedet): {"status": "FAIL"}.
      Bei Trigger-Drift (Auto-Tag-Trigger setzt mehr/weniger als die 12 deterministisch ableitbaren Tags): {"status": "FAIL"}.
    </on_error>
  </task>

scope_files:
  - "supabase/migrations/"
  - "packages/types/src/nutrition/foods.ts"
  - "packages/types/src/nutrition/index.ts"

context_files:
  - "supabase/migrations/"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql"
  - "docs/specs/Nutrition/00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md"
  - "docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md"

acceptance_criteria:
  - "Neue Migration unter supabase/migrations/ erstellt (future path to be decided — YYYYMMDD_NNN_nutrition_food_core_tables.sql)"
  - "7 Stamm-Tabellen erzeugt: nutrient_defs, food_categories, foods, food_nutrients, food_aliases, tag_definitions, food_tags"
  - "food_categories.name_th TEXT vorhanden"
  - "foods.bls_code UNIQUE NOT NULL"
  - "food_nutrients PK = (food_id, nutrient_code)"
  - "food_aliases PK = (food_id, alias, locale)"
  - "nutrient_defs enthält genau 138 BLS-Code-Seed-Einträge"
  - "tag_definitions enthält genau 16 V1-Tag-Seed-Einträge aus NUTRITION_NEXT_SPEC_DECISIONS.md §5 (high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian, gluten_free, lactose_free, nut_free, halal, kosher, spicy, thai_food, mediterranean, processed_food, ultra_processed)"
  - "Auto-Tag-Trigger trg_foods_auto_tag setzt nur die 12 deterministisch ableitbaren V1-Tags (high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian, gluten_free, lactose_free, nut_free, mediterranean, processed_food, ultra_processed)"
  - "Die 4 admin-managed Tags (halal, kosher, spicy, thai_food) werden vom Auto-Tag-Trigger NICHT automatisch gesetzt — sie existieren nur als tag_definitions-Seed"
  - "GIN-Indexe auf foods.name_display und food_aliases.alias (pg_trgm) erstellt"
  - "RLS aktiviert mit Read-all-Policy für authenticated auf allen 7 Tabellen"
  - "GRANT SELECT für authenticated auf allen 7 Tabellen"
  - "DOWN-Rollback im Migration-Header dokumentiert (rollback_hint)"
  - "Migration ist idempotent (zweimaliges Apply ohne Fehler)"
  - "TypeScript-Types in packages/types/src/nutrition/foods.ts spiegeln DB-Tabellen"
  - "packages/types/src/nutrition/index.ts re-exportiert die neuen Interfaces"
  - "supabase db diff zeigt nur erwartete Änderungen"
  - "pnpm tsc --noEmit clean"

negative_constraints:
  - "NIEMALS supabase db push --linked (nur Tom manuell)"
  - "NIEMALS supabase db reset (nur Tom manuell)"
  - "NIEMALS DROP TABLE oder TRUNCATE ohne expliziten Task"
  - "NIEMALS Migration ohne nachfolgendes security-specialist Review"
  - "NIEMALS RLS deaktivieren"
  - "NIEMALS Tag-Definitions außerhalb der 16 V1-Tags seeden"
  - "NIEMALS openfoodfacts oder USDA als Datenquelle einführen"
  - "NIEMALS Auto-Tag-Trigger erweiterte Phase-1-Tags aus SPEC_05 setzen lassen"
  - "NIEMALS die 4 admin-managed Tags (halal, kosher, spicy, thai_food) im Auto-Tag-Trigger zuweisen"
  - "NIEMALS User-Daten-Tabellen (foods_custom, meals, ...) in dieser Migration anlegen"
  - "NIEMALS Änderungen außerhalb supabase/migrations/ und packages/types/src/nutrition/"

files_blocked:
  - "services/**"
  - "apps/**"
  - "packages/agent-core/**"
  - "packages/contracts/**"
  - "packages/execution-token/**"
  - "packages/graph-core/**"
  - "packages/scheduler-core/**"
  - "packages/shared/**"
  - "packages/supabase-clients/**"
  - "packages/vllm-client/**"
  - "packages/wo-core/**"
  - "infra/**"
  - "tools/**"
  - "system/**"
  - "docs/**"
  - ".env"
  - ".env.*"

validation_commands:
  - "pnpm tsc --noEmit"

required_skills: ["gsd-v2", "supabase-specialist"]
optional_skills: []
blocked_by: ["WO-nutrition-002"]
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-NUTRITION-P1-003-food-core-tables.md` folgt Auftrags-Convention; `workorder_id: WO-nutrition-003` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$`.
- **`requires_approval: true`** ist Pflicht für `risk_category: db-migration` (per `template_migration.md`).
- **`rollback_hint`** ist Pflicht-Feld bei `db-migration` (per `workorder.schema.json` if/then-Block).
- **`blocked_by`** verweist auf `WO-nutrition-002` (Schema-Foundation), damit Tabellen-DDL nicht ohne nutrition Schema läuft (per Dependency Graph in Split-Plan §6).
- **`files_blocked`** schließt explizit alle Packages außer `packages/types/src/nutrition/` aus, das Teil von `scope_files` ist.
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (security-specialist) → `closed`. Tag-Set-Drift ist `guardrail_violation` → sofortige Human-Eskalation per `wo_lifecycle_v1.md`.
- **Tag-Set:** Strikt 16 V1-Tags aus Decisions §5 — nicht aus SPEC_05 (deren erweiterter Phase-1-Katalog wurde per Review-Konsens auf Phase 2 verschoben, siehe `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md` CRIT-2 / FIX-2).
- **Auto-Tag-Trigger Split (12 + 4):** `tag_definitions` enthält alle 16 V1-Tags als Seed. Der Auto-Tag-Trigger setzt jedoch nur die 12 deterministisch aus BLS-Code/Makros ableitbaren Tags (high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian, gluten_free, lactose_free, nut_free, mediterranean, processed_food, ultra_processed). Die 4 admin-managed Tags (halal, kosher, spicy, thai_food) sind per `NUTRITION_NEXT_SPEC_DECISIONS.md §5` "manuell gepflegte Tag-Liste für schwierige Tags" — sie werden NICHT vom Trigger gesetzt, sondern später durch Admin-Tools/manuelle Pflege in `food_tags` geschrieben (Admin-Tagging-Mechanismus ist nicht Teil dieser WO).

---

*Draft erzeugt: 2026-05-02 — gemäß `NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` und `template_migration.md`.*
