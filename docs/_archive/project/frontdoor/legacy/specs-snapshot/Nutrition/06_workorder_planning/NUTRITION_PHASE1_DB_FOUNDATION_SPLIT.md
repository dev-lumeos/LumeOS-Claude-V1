# NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md

STATUS: BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY

This split plan is retained as historical planning evidence. It is not an active runbook and does not authorize DB schema work, Supabase commands, migration execution, BLS import, or Nutrition product work. Product execution remains closed unless Tom explicitly opens a specific product gate.

> Phase-1-Split-Planung für `nutrition-db-foundation-v1`
> Stand: 2026-05-02
> Author: Opus
> **Hinweis:** Dies ist KEINE echte Workorder-Erstellung. Nur Split-Planung. Keine Workorder-Dateien unter `system/workorders/` werden erzeugt.

---

## 1. Scope

Phase 1 baut **ausschließlich** die DB-/Foundation-Basis für Nutrition V1.

**Was Phase 1 macht:**
- Schema `nutrition` und alle V1-Tabellen mit korrekten Constraints, Indexen, RLS
- Idempotente Migrations (CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, DROP CONSTRAINT IF EXISTS)
- TypeScript-Types passend zu DB-Schemas (read/write contracts in `packages/types`)

**Was Phase 1 explizit NICHT macht:**
- Keine API-Implementierung (`services/nutrition-api/` bleibt unberührt)
- Keine UI-Implementierung (`apps/web/`, `apps/app/` bleiben unberührt)
- Keine BLS-Import-Logik (Phase 2)
- Keine echte MealCam-Provider-Integration (wartet auf BLOCK-1)
- Keine echten RDA/AI/UL Seed-Werte (wartet auf BLOCK-2)
- Keine Produktiv-Migration ausgeführt (`supabase db push --linked` bleibt manuell durch Tom)

**Output am Ende von Phase 1:**
Eine Reihe geprüfter, idempotenter Migrations-Dateien unter `supabase/migrations/`, plus aktualisierte Types unter `packages/types/src/nutrition/`. `supabase db diff` zeigt erwarteten Diff. Lokale `supabase db reset` läuft sauber durch. Phase 2 (BLS Import + Search) kann darauf aufbauen.

---

## 2. Inputs

Folgende Dateien wurden für diesen Split-Plan gelesen:

- `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\06_workorder_planning\NUTRITION_WORKORDER_PLAN_V1.md` — übergeordneter Workorder-Plan mit `nutrition-db-foundation-v1` als Phase-1-Hauptkandidat
- `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\01_current_specs\SPEC_06_DATABASE_SCHEMA.md` — Master-Schema (DDL aller V1-Tabellen)
- `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\03_sql\SPEC_06_V1_MIGRATION.sql` — V1-Migrations-Patch (Pass-1/2-Korrekturen, neue Tabellen)
- `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\02_patches\SPEC_06_RECALCULATE_PATCH.md` — Snapshot/Recalculate API + Audit + `food_source` vs. `data_source` Klärung
- `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\02_patches\SPEC_02_PASS2_ENTITIES.md` — Pass-2 Entities (NutrientReferenceValue, FoodPortion, MealCamScan, NutritionPreferences, CoachNutritionSuggestion)
- `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\00_decisions\NUTRITION_NEXT_SPEC_DECISIONS.md` — verbindliche V1-Entscheidungen
- `D:\GitHub\LumeOS-Claude-V1\system\workorders\schemas\workorder.schema.json` — Workorder-Schema inkl. risk_category enum, rollback_hint Pflicht bei db-migration
- `D:\GitHub\LumeOS-Claude-V1\system\workorders\templates\template_migration.md` — DB-Migration Template (requires_approval: true, security-specialist Review, RLS-Pflicht)
- `D:\GitHub\LumeOS-Claude-V1\system\workorders\templates\template_implementation_low.md` — Implementation Low Template (max 3 Files)

---

## 3. Phase-1-Ziel

Am Ende von Phase 1 existiert:

- Schema `nutrition` mit allen V1-Tabellen und Pass-2-Erweiterungen
- Idempotente DB-Struktur: jeder Re-Run der Migration darf keine Fehler werfen
- Tabellen, Enums (CHECK-Constraints), Foreign Keys, UNIQUE-Constraints, Indexes
- RLS für alle User-Daten-Tabellen aktiviert; Policies für Owner-only / Editorial-only / Service-Role
- GRANT-Statements für `authenticated` und `service_role`
- TypeScript-Types in `packages/types/src/nutrition/` reflektieren die Tabellen
- **Keine erfundenen Reference-Values** — `nutrient_reference_values` Tabelle leer
- **Keine Produktivmigration ausgeführt** — Tom drückt manuell auf production
- Grundlage für Phase 2 (BLS Import + Search) ist gelegt: alle Tabellen für `foods`, `food_nutrients`, `food_categories`, `tag_definitions`, `food_aliases`, `food_tags` existieren mit korrekter Struktur

---

## 4. Nicht in Phase 1

Folgende Bereiche sind **explizit nicht** Teil von Phase 1:

- BLS Import Runner (Phase 2)
- Food Search API (Phase 2)
- Smart Search Ranking (Phase 2)
- UI (alle Phasen 4–8 + Parallel Track A)
- MealCam Real-Provider-Adapter (wartet auf BLOCK-1)
- MealCam Service-Integration (wartet auf BLOCK-1)
- Micronutrient Scoring (Pure Functions in `packages/scoring`) (wartet auf BLOCK-2)
- RDA/AI/UL Seed Data (wartet auf BLOCK-2)
- Barcode Scanner (Phase 2 — Decisions §1)
- Full Recipes UI (Phase 2 — Decisions §15)
- Full MealPlan Builder UI (Phase 2)
- Full Shopping List UI (Phase 2)
- Coach Suggestion UI (Phase 7 / Phase 8)
- Supplements API Runtime-Integration (Phase 6 — Konsument-Code, nicht DB)
- Onboarding UI (Phase 5 / Phase 8)
- Recalculate UI (Phase 8)

---

## 5. Empfohlene Micro-Workorder-Kandidaten

| Reihenfolge | Kandidat | Typ | Ziel | Scope Files | Risiko | Blocker | Output |
|---|---|---|---|---|---|---|---|
| 1 | `nutrition-db-audit-existing-state` | docs/discovery (read-only) | Vorhandene DB-/Migration-/Schema-Dateien prüfen, keine Änderung. Erfasst aktuellen Zustand `supabase/migrations/` + `packages/types/src/nutrition/` + `nutrition` schema in lokaler Supabase. Liefert Audit-Report mit Lücken-Liste vs. Spec | `docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md` (neu, read-only-Output) | docs (kein db-migration, kein code) | keiner | Audit-Report mit: existing tables, missing tables, schema vs. SPEC_06 diff, redundant `data_source` flag, RLS-Status |
| 2 | `nutrition-db-core-schema-foundation` | db-migration | Schema `nutrition` + benötigte Postgres-Extensions (`pg_trgm`, `gen_random_uuid`); search_path; Schema-Privileges | future migration path to be decided (z. B. `supabase/migrations/YYYYMMDD_NNN_nutrition_schema_foundation.sql`) | db-migration | #1 | Schema + Extensions vorhanden, GRANT USAGE für `authenticated`/`service_role` |
| 3 | `nutrition-db-food-core-tables` | db-migration | `nutrient_defs`, `food_categories` (inkl. `name_th`), `foods`, `food_nutrients`, `food_aliases`, `tag_definitions`, `food_tags` + Auto-Tag-Trigger | future migration path; `packages/types/src/nutrition/foods.ts` | db-migration | #2 | Read-only-Stamm-Tabellen vorhanden, Trigger `trg_foods_auto_tag` aktiv (Tag-Set V1: 16 Tags) |
| 4 | `nutrition-db-custom-foods-and-portions` | db-migration | `foods_custom` (mit korrigiertem `source CHECK ('user','manual','import','admin')` + `name_th` + `custom_allergens TEXT[]`); `food_portions`; `user_recent_portions` | future migration path; `packages/types/src/nutrition/custom-foods.ts`, `.../portions.ts` | db-migration | #2, #3 | `foods_custom` ohne `openfoodfacts`, `food_portions` mit korrekter RLS (BLS-Portionen read-only für User) |
| 5 | `nutrition-db-diary-snapshot-foundation` | db-migration | `meals`; `meal_items` (mit erweitertem `food_source CHECK ('bls','custom','mealcam','manual')`, `portion_name`, `nutrients JSONB`, `snapshot_version`, `snapshot_history JSONB`, optional `data_source` deprecated); ggf. `meal_item_snapshot_history` als Alternative | future migration path; `packages/types/src/nutrition/diary.ts` | db-migration | #2, #3, #4 | Diary-Foundation mit Snapshot+Recalculate-Audit |
| 6 | `nutrition-db-preferences-foundation` | db-migration | `food_preferences` (erweitert: `excluded_foods UUID[]`, `preferred_foods UUID[]`, `religious_dietary`, `religious_is_hard`, `meal_slots JSONB`, `onboarding_complete`); `food_preference_items` (erweitert: `severity`, `source`, `target_type CHECK ('food','category','tag','cuisine')`) | future migration path; `packages/types/src/nutrition/preferences.ts` | db-migration | #2, #3 | Preferences inkl. `cuisine`-Target und Hard/Strong/Soft/Boost-Severity |
| 7 | `nutrition-db-targets-water-foundation` | db-migration | `nutrition_targets` (Cache von Goals + Fallback); `water_logs`; `daily_nutrition_summary VIEW` (Makros direkt + Mikros via JSONB); `micro_flags` | future migration path; `packages/types/src/nutrition/targets.ts`, `.../water.ts`, `.../summary.ts` | db-migration | #2, #5 | Target-Cache, Water-Logs, Daily-Aggregat-VIEW funktionsfähig |
| 8 | `nutrition-db-reference-values-structure` | db-migration / medical-adjacent | `nutrient_reference_values` Struktur (mit `source` + `source_version` Pflicht; `ul = NULL` ≠ `ul = 0` per CHECK); KEINE Seed-Werte | future migration path; `packages/types/src/nutrition/reference-values.ts` | db-migration (medical-adjacent) | #2, #3 | Tabelle leer, aber struktur-vollständig; Validierungs-Logik dokumentiert |
| 9 | `nutrition-db-mealcam-foundation` | db-migration / privacy | `mealcam_scans` (`image_path`, `image_url`, `image_stored`, `training_consent`, `scan_status`, `confidence_level`, `provider_response JSONB`, `detected_items JSONB`, `user_corrections JSONB`, `meal_id`, `plan_item_id`); RLS Owner-only | future migration path; `packages/types/src/nutrition/mealcam.ts` | db-migration (privacy-relevant) | #2, #5 | MealCam-Schema + Owner-RLS; `training_consent` default false |
| 10 | `nutrition-db-coach-suggestions-foundation` | db-migration / permissions | `coach_nutrition_suggestions` (9 Suggestion-Typen via CHECK, `status` enum mit TTL `expires_at`, `payload JSONB`, `decided_at`, `decision_note`); RLS Owner-Read; Coach-Schreibrechte über Service-Role | future migration path; `packages/types/src/nutrition/coach-suggestions.ts` | db-migration (permissions-relevant) | #2 | Coach-Suggestion-Tabelle vorhanden mit Default-TTL 7 Tage |
| 11 | `nutrition-db-schema-only-recipes-plans-shopping` | db-migration | `recipes` (mit `source CHECK ('user','coach','marketplace','buddy')`), `recipe_items`, `meal_plans` (Lifecycle), `meal_plan_days`, `meal_plan_items`, `meal_plan_logs` (mit `logged_via` enum), `shopping_lists`, `shopping_list_items` | future migration path; `packages/types/src/nutrition/recipes.ts`, `.../meal-plans.ts`, `.../shopping.ts` | db-migration | #2, #3, #4 | Schema-only-Tabellen vorhanden — keine UI/API |
| 12 | `nutrition-db-rls-grants-policies` | db-migration / security | Konsolidierte RLS-Policies + GRANT-Statements; Owner-only für User-Tabellen; lesbar für `authenticated` bei Stamm-Tabellen; Service-Role für Editorial; Coach-Read über separate Policy | future migration path | db-migration / security | #3, #4, #5, #6, #7, #8, #9, #10, #11 | RLS-Audit clean: alle Tabellen mit RLS, Policies konsistent |
| 13 | `nutrition-db-verify-schema` | test/verification | Verifikation: SQL-Constraint-Assertions, Migration läuft idempotent durch zweimaliges `supabase db reset`, kein `openfoodfacts` in `source`-Enum, `cuisine` in `preference target_type`, `mealcam`/`manual` in `food_source`, `ul = NULL` erlaubt vs. `ul = 0` — je nach gewähltem CHECK | `tools/scripts/verify-nutrition-schema.ts` (oder vergleichbar); read-only auf migrations | test | #2–#11 | Verifikations-Skript läuft grün; Report aller Constraint-Checks |
| 14 | `nutrition-db-rollback-plan` | docs / migration-safety | Dokumentation: `rollback_hint` pro Migration, DOWN-Pfade, Daten-Sicherheits-Hinweise, Hinweis dass kein `DROP TABLE` ohne expliziten Approval | `docs/specs/Nutrition/06_workorder_planning/rollback-plan.md` (neu) | docs | #2–#11 | Rollback-Doc mit pro-Migration-Hinweis und ggf. DOWN-SQL-Templates |

**Hinweis zu "future migration path":** Die exakten Dateinamen werden bei der Workorder-Erstellung gemäß `template_migration.md` Naming-Convention gebildet (`YYYYMMDD_NNN_<beschreibung>.sql`). Die Reihenfolge entscheidet über `NNN`.

---

## 6. Dependency Graph

Lineare Reihenfolge mit Parallelisierungs-Möglichkeiten:

```
#1 audit
   ↓
#2 core-schema-foundation
   ↓
   ├─ #3 food-core-tables
   │     ↓
   │     ├─ #4 custom-foods-and-portions
   │     │     ↓
   │     │     ├─ #5 diary-snapshot-foundation
   │     │     └─ #11 schema-only-recipes-plans-shopping
   │     │           ↑ (auch abhängig von #5 für meal_plan_items.recipe_id)
   │     ├─ #6 preferences-foundation
   │     ├─ #8 reference-values-structure
   │     └─ #9 mealcam-foundation
   │           ↑ (auch abhängig von #5 für meal_id)
   ├─ #7 targets-water-foundation
   │     ↑ (auch abhängig von #5 für daily_nutrition_summary VIEW)
   └─ #10 coach-suggestions-foundation

#3..#11 fertig
   ↓
#12 rls-grants-policies (konsolidierter Sweep)
   ↓
#13 verify-schema
   ↓
#14 rollback-plan (kann auch parallel zu #13 laufen)
```

**Regeln aus Graph:**
- Audit muss zuerst (#1).
- Core Schema vor allen Tabellen (#2).
- Food Core (#3) vor BLS Import / Search (Phase 2 außerhalb).
- Custom Foods + Portions (#4) vor Diary (#5).
- Diary (#5) vor Recalculate (Recalculate-API ist Phase 3 außerhalb, aber Diary-Schema enthält bereits Recalculate-Foundation `snapshot_version`/`snapshot_history`).
- Preferences (#6) vor Search-Ranking-Boost (Phase 2 außerhalb).
- Reference-Values-Struktur (#8) vor Micronutrient Review (Phase 6 außerhalb, blockiert auf BLOCK-2).
- RLS/Grants (#12) nach Tabellen.
- Verify (#13) nach allen Migrationen.
- Rollback-Plan (#14) als reines Doku-WO parallel zu #13 zulässig.

---

## 7. Risk Classification

| Kandidat | risk_category | requires_approval | Grund |
|---|---|---|---|
| #1 `nutrition-db-audit-existing-state` | `docs` | false | Read-only Audit, keine Änderung an Schema oder Code |
| #2 `nutrition-db-core-schema-foundation` | `db-migration` | true | Schema + Extensions; gemäß `template_migration.md` immer Approval Pflicht |
| #3 `nutrition-db-food-core-tables` | `db-migration` | true | Stamm-Tabellen + Auto-Tag-Trigger |
| #4 `nutrition-db-custom-foods-and-portions` | `db-migration` | true | User-Daten + RLS-relevant |
| #5 `nutrition-db-diary-snapshot-foundation` | `db-migration` | true | User-Daten, Snapshot-Audit-Mechanik |
| #6 `nutrition-db-preferences-foundation` | `db-migration` | true | User-Daten mit Constraint-Logik (allergies/intolerances als Hard-Constraints) |
| #7 `nutrition-db-targets-water-foundation` | `db-migration` | true | User-Daten + VIEW-Logik |
| #8 `nutrition-db-reference-values-structure` | `db-migration` (medical-adjacent — siehe Begründung) | true | Medical-Daten-Bezug (RDA/AI/UL); per `CLAUDE.md §High-Risk-Regel` ist `medical` High-Risk und braucht Prior Approval. Da hier nur Schema (keine Werte), `db-migration` als primäre Kategorie ausreichend; medizinische Review-Anforderung gilt erst bei BLOCK-2-Seed-WO |
| #9 `nutrition-db-mealcam-foundation` | `db-migration` (privacy-relevant) | true | Bilder + Consent → Privacy. `training_consent` default `false` schützt Datenschutz |
| #10 `nutrition-db-coach-suggestions-foundation` | `db-migration` (permissions-relevant) | true | Cross-Modul-Permissions (Coach schreibt via Service-Role, User liest) |
| #11 `nutrition-db-schema-only-recipes-plans-shopping` | `db-migration` | true | Schema-only, aber dennoch RLS-Pflicht und reversibel |
| #12 `nutrition-db-rls-grants-policies` | `security` (zusätzlich `rls`) | true | RLS-Konsolidierung. Nach `CLAUDE.md` ist `security` und `rls` Cautious — Spark D mandatory, kein Auto-Retry |
| #13 `nutrition-db-verify-schema` | `test` | false | Reine Verifikation, autonom ausführbar |
| #14 `nutrition-db-rollback-plan` | `docs` | false | Doku |

**Hinweis zu `requires_approval`:** Per `template_migration.md` ist `requires_approval: true` für alle DB-Migrationen Pflicht — auch bei `db-migration` als primäre Kategorie. Per `CLAUDE.md §High-Risk-Regel` brauchen `db-migration`, `security`, `rls` und `medical` Prior Approval.

---

## 8. Files Allowed / Files Blocked Vorschlag

### #1 `nutrition-db-audit-existing-state`

**FILES_ALLOWED (write):**
- `docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md` (neu)

**FILES_ALLOWED (read):**
- `supabase/migrations/**`
- `packages/types/src/nutrition/**`
- `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
- `docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql`

**FILES_BLOCKED (alle Phase 1):**
- `services/**`
- `apps/**`
- `packages/**` außer `packages/types/src/nutrition/**` (für Read in #1)
- `infra/**`
- `tools/**` außer in #13
- `system/**`
- `.env*`

### #2 `nutrition-db-core-schema-foundation`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path to be decided — neuer Datei-Name `YYYYMMDD_NNN_nutrition_schema_foundation.sql`)

**FILES_ALLOWED (read):**
- `supabase/migrations/**`
- `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`

**FILES_BLOCKED:**
- `services/**`, `apps/**`, alle `packages/**` außer `packages/types/`, `infra/**`, `tools/**`, `system/**`, `.env*`

### #3 `nutrition-db-food-core-tables`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/foods.ts` (neu oder erweitert)
- `packages/types/src/nutrition/index.ts` (Re-Export)

**FILES_BLOCKED:**
- `services/**`, `apps/**`, alle `packages/**` außer `packages/types/`, `infra/**`, `tools/**`, `system/**`, `.env*`

### #4 `nutrition-db-custom-foods-and-portions`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/custom-foods.ts` (neu)
- `packages/types/src/nutrition/portions.ts` (neu)
- `packages/types/src/nutrition/index.ts`

**FILES_BLOCKED:** wie #3

### #5 `nutrition-db-diary-snapshot-foundation`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/diary.ts` (neu)
- `packages/types/src/nutrition/index.ts`

**FILES_BLOCKED:** wie #3

### #6 `nutrition-db-preferences-foundation`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/preferences.ts` (neu)
- `packages/types/src/nutrition/index.ts`

**FILES_BLOCKED:** wie #3

### #7 `nutrition-db-targets-water-foundation`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/targets.ts` (neu)
- `packages/types/src/nutrition/water.ts` (neu)
- `packages/types/src/nutrition/summary.ts` (neu — DailyNutritionSummary)
- `packages/types/src/nutrition/index.ts`

> Hinweis: Hier werden 4 Type-Files berührt + 1 Migration. Falls scope_files-Limit von max 3 Files (vgl. `template_implementation_low.md`) überschritten wird, muss dieser Kandidat in zwei WOs gesplittet werden — empfohlene Splittung: (a) `nutrition-db-targets-foundation`, (b) `nutrition-db-water-and-summary-foundation`.

**FILES_BLOCKED:** wie #3

### #8 `nutrition-db-reference-values-structure`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/reference-values.ts` (neu)
- `packages/types/src/nutrition/index.ts`

**FILES_BLOCKED:** wie #3 + `docs/specs/Nutrition/04_seed/**` (kein Seed in Phase 1)

### #9 `nutrition-db-mealcam-foundation`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/mealcam.ts` (neu)
- `packages/types/src/nutrition/index.ts`

**FILES_BLOCKED:** wie #3 + `services/nutrition-api/src/routes/mealcam.ts` (kein Service-Code)

### #10 `nutrition-db-coach-suggestions-foundation`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/coach-suggestions.ts` (neu)
- `packages/types/src/nutrition/index.ts`

**FILES_BLOCKED:** wie #3

### #11 `nutrition-db-schema-only-recipes-plans-shopping`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path)
- `packages/types/src/nutrition/recipes.ts` (neu)
- `packages/types/src/nutrition/meal-plans.ts` (neu)
- `packages/types/src/nutrition/shopping.ts` (neu)
- `packages/types/src/nutrition/index.ts`

> Hinweis: 5 Type-Files + 1 Migration → vermutlich zu groß für ein einzelnes WO. Empfohlene Splittung: (a) `nutrition-db-recipes-schema-only`, (b) `nutrition-db-meal-plans-schema-only`, (c) `nutrition-db-shopping-schema-only`.

**FILES_BLOCKED:** wie #3 + alle UI/API für diese Bereiche

### #12 `nutrition-db-rls-grants-policies`

**FILES_ALLOWED (write):**
- `supabase/migrations/` (future migration path — RLS-Sweep-Migration)
- ggf. Policy-Adjustments in vorherigen Migrationen (nur via neue Migration, NICHT durch Edit alter Files)

**FILES_BLOCKED:** wie #3 + alle Type-Files (RLS ist DB-only)

### #13 `nutrition-db-verify-schema`

**FILES_ALLOWED (write):**
- `tools/scripts/verify-nutrition-schema.ts` (neu)
- `tools/scripts/test-nutrition-constraints.ts` (neu, optional)

**FILES_ALLOWED (read):**
- `supabase/migrations/**`
- `packages/types/src/nutrition/**`

**FILES_BLOCKED:** alle Phase-1-Bereiche außer `tools/scripts/`; `services/**`, `apps/**`, `infra/**`, `system/**`, `.env*`, `supabase/seed.sql`

### #14 `nutrition-db-rollback-plan`

**FILES_ALLOWED (write):**
- `docs/specs/Nutrition/06_workorder_planning/rollback-plan.md` (neu)

**FILES_BLOCKED:** alles außer `docs/specs/Nutrition/06_workorder_planning/`

---

## 9. Acceptance Criteria pro Kandidat

### #1 `nutrition-db-audit-existing-state`

- Audit-Report listet alle aktuell unter `supabase/migrations/` existierenden Nutrition-bezogenen Migrationen (falls vorhanden)
- Audit-Report listet alle aktuell unter `packages/types/src/nutrition/` existierenden Type-Files
- Audit-Report enthält Diff-Liste: Tabelle / Spalte vorhanden in Spec aber nicht in DB; und umgekehrt
- Audit-Report flagged: `data_source` Doppel-Spalte (siehe `SPEC_06_RECALCULATE_PATCH.md` Klärung — `food_source` ist primary)
- Audit-Report bestätigt RLS-Status pro existierender Tabelle
- Keine Datei außerhalb `docs/specs/Nutrition/06_workorder_planning/audit/` geschrieben

### #2 `nutrition-db-core-schema-foundation`

- Migration ist idempotent (zweimaliges `supabase db reset` läuft fehlerfrei)
- `CREATE SCHEMA IF NOT EXISTS nutrition;`
- `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
- `GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role;`
- `rollback_hint` dokumentiert: `DROP SCHEMA nutrition CASCADE` (nur wenn keine Daten)
- DOWN-Migration als Kommentar im SQL-Header
- TypeScript kompiliert (`pnpm tsc --noEmit` clean)

### #3 `nutrition-db-food-core-tables`

- Idempotente Migration mit `CREATE TABLE IF NOT EXISTS` für alle 7 Tabellen
- `food_categories.name_th TEXT` vorhanden
- `foods.bls_code` UNIQUE NOT NULL
- `food_nutrients` PK `(food_id, nutrient_code)`, `data_source` enum-konsistent zu BLS
- `tag_definitions` enthält die 16 V1-Tag-Codes als Seed (Decisions §5)
- Auto-Tag-Trigger `trg_foods_auto_tag` aktiv und auf 16 V1-Tags reduziert
- RLS aktiviert mit Read-all-Policy für authenticated
- `rollback_hint` dokumentiert
- Types in `packages/types/src/nutrition/foods.ts` reflektieren DB

### #4 `nutrition-db-custom-foods-and-portions`

- `foods_custom.source CHECK (source IN ('user','manual','import','admin'))` — kein `openfoodfacts`, kein `mealcam`
- `foods_custom.name_th TEXT` vorhanden
- `foods_custom.custom_allergens TEXT[] DEFAULT '{}'` vorhanden
- `food_portions` mit Genau-Eines-Constraint (`food_id` XOR `custom_food_id`)
- `food_portions` RLS: BLS-Portionen Read-all, Custom-Portionen Owner-only Write
- `user_recent_portions` mit Owner-only RLS
- `rollback_hint` dokumentiert
- Idempotent

### #5 `nutrition-db-diary-snapshot-foundation`

- `meals` mit Owner-RLS
- `meal_items.food_source CHECK (food_source IN ('bls','custom','mealcam','manual'))`
- `meal_items.snapshot_version INTEGER NOT NULL DEFAULT 1`
- `meal_items.snapshot_history JSONB DEFAULT '[]'`
- `meal_items.portion_name TEXT` vorhanden
- `meal_items.scan_id UUID REFERENCES nutrition.mealcam_scans(id)` (FK später falls nötig)
- `data_source` Spalte: entweder gedroppt oder als deprecated dokumentiert (gemäß `SPEC_06_RECALCULATE_PATCH.md` Empfehlung "entfernen")
- Idempotent
- `rollback_hint` dokumentiert
- Types reflektieren DB

### #6 `nutrition-db-preferences-foundation`

- `food_preferences` enthält alle Pass-2-Spalten: `excluded_foods`, `preferred_foods`, `religious_dietary`, `religious_is_hard`, `meal_slots`, `onboarding_complete`
- `food_preference_items.severity CHECK (severity IN ('hard','strong','soft','boost'))`
- `food_preference_items.source CHECK (source IN ('onboarding','settings','coach_suggestion','import'))`
- `food_preference_items.target_type CHECK (target_type IN ('food','category','tag','cuisine'))`
- `exactly_one_target` CHECK aktualisiert für alle 4 Targets (food/custom_food/category/tag — `cuisine` über `tag_code`)
- Owner-RLS
- Idempotent
- `rollback_hint` dokumentiert

### #7 `nutrition-db-targets-water-foundation`

- `nutrition_targets` UNIQUE `(user_id, date)`, Owner-RLS
- `water_logs` Owner-RLS
- `daily_nutrition_summary VIEW` aggregiert Makros + Mikros (JSONB) + Wasser (separate Sub-Query)
- `micro_flags` Owner-RLS
- `rollback_hint` dokumentiert
- Idempotent
- Types in `packages/types/src/nutrition/`

### #8 `nutrition-db-reference-values-structure`

- `nutrient_reference_values` mit `source TEXT NOT NULL` (Pflicht)
- `source_version TEXT` vorhanden
- `effective_from DATE NOT NULL DEFAULT '2020-01-01'`
- UNIQUE-Constraint auf `(nutrient_code, age_min, age_max, sex, is_pregnant, is_lactating, effective_from)`
- **Keine Seed-Werte enthalten** — Tabelle leer nach Migration
- `ul = NULL` ist erlaubt (kein NOT NULL Constraint auf `ul`)
- Read-all für authenticated; Write nur Service-Role
- Idempotent
- `rollback_hint` dokumentiert

### #9 `nutrition-db-mealcam-foundation`

- `mealcam_scans` mit `training_consent BOOLEAN DEFAULT false` (Opt-in)
- `scan_status CHECK` enthält `('pending','processing','completed','failed','user_corrected','user_confirmed')`
- `confidence_level CHECK` enthält `('high','suggest','low')`
- `detected_items JSONB DEFAULT '[]'`, `user_corrections JSONB DEFAULT '[]'`
- `image_stored BOOLEAN DEFAULT false`
- Owner-RLS (User sieht nur eigene Scans)
- `rollback_hint` dokumentiert
- Idempotent

### #10 `nutrition-db-coach-suggestions-foundation`

- `coach_nutrition_suggestions.suggestion_type CHECK` enthält alle 9 Typen
- `status CHECK (status IN ('pending','accepted','rejected','expired'))`
- `expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days'`
- `payload JSONB NOT NULL`
- Owner-Read-Policy für User (auf `user_id`); Coach-Schreibrechte über Service-Role
- Index auf `(user_id, status)`
- `rollback_hint` dokumentiert
- Idempotent

### #11 `nutrition-db-schema-only-recipes-plans-shopping`

- `recipes.source CHECK` enthält `('user','coach','marketplace','buddy')`
- `meal_plan_logs.logged_via CHECK` enthält erweiterte Werte (`'mealcam','manual','recipe','plan_ghost'`)
- `meal_plan_items.exactly_one_item_source` CHECK aktiv
- Alle 8 Tabellen mit RLS und Owner-Policies
- Schema-only-Marker im SQL-Header-Kommentar: "Schema-only V1 — keine UI/API in Phase 1–8 ohne explizite Phase-2-Entscheidung"
- `rollback_hint` dokumentiert
- Idempotent

### #12 `nutrition-db-rls-grants-policies`

- Jede User-Tabelle hat aktive RLS-Policy (Owner-only oder Owner-Read + Service-Role-Write)
- Stamm-Tabellen (`nutrient_defs`, `food_categories`, `foods`, `food_nutrients`, `food_aliases`, `tag_definitions`, `food_tags`, `food_portions` BLS-Anteil, `nutrient_reference_values`) lesbar für `authenticated`
- `service_role` hat ALL auf alle Tabellen
- `authenticated` hat SELECT/INSERT/UPDATE/DELETE auf User-Tabellen
- Audit-Report (im SQL-Kommentar oder separates Doc) listet alle Policies
- `rollback_hint` dokumentiert
- Idempotent

### #13 `nutrition-db-verify-schema`

- Verifikations-Skript läuft ohne Fehler nach `supabase db reset`
- Kein `openfoodfacts` in `foods_custom.source` enum
- `cuisine` in `food_preference_items.target_type` enum
- `mealcam` und `manual` in `meal_items.food_source` enum
- `name_th` Spalten existieren auf `food_categories` und `foods_custom`
- `nutrient_reference_values` Tabelle existiert und ist leer
- Auto-Tag-Trigger setzt nur die 16 V1-Tags (Test mit Sample-Insert)
- RLS aktiv auf allen User-Daten-Tabellen (Test via Query)
- Report wird in Konsole + optional in `docs/specs/Nutrition/06_workorder_planning/audit/verify-report.md` geschrieben

### #14 `nutrition-db-rollback-plan`

- Pro Migration ein `rollback_hint` dokumentiert
- DOWN-SQL-Templates pro Migration (zumindest als Kommentar im SQL-Header oder zentral im rollback-plan)
- Daten-Sicherheits-Hinweise: kein `DROP TABLE` ohne explizit dokumentierten Datenverlust-Plan
- Hinweis dass Production-Migrationen manuell durch Tom (`supabase db push --linked`) ausgeführt werden
- Datei `rollback-plan.md` enthält Tabelle: Migration → Rollback-Strategie → Datenverlust-Risiko → Approval-Anforderung

---

## 10. Recommended First Batch

Erste empfohlene Batch (max 3 Kandidaten):

1. **`nutrition-db-audit-existing-state`** — startet ohne Risiko, liefert Datenbasis für alle weiteren WOs. Kein Approval nötig.
2. **`nutrition-db-core-schema-foundation`** — minimaler erster DB-Schritt, liefert das Fundament. Nach Audit klar ob nötig.
3. **`nutrition-db-food-core-tables`** — größter Block der Stamm-Tabellen, hängt nur an #1+#2. Liefert Voraussetzung für viele andere Tabellen.

**Begründung:**
- #1 liefert eine schwarz-auf-weiß-Diff-Sicht, was bereits existiert vs. was noch fehlt. Verhindert versehentliche Doppel-Migrations.
- #2 ist klein und unabhängig: Schema + Extensions, kein Tabellen-DDL.
- #3 ist der zentrale Block der Read-only-Stamm-Daten. Wenn #3 sauber durchläuft, sind 7 Tabellen + Trigger fertig — alle nachfolgenden Tabellen referenzieren diese (FK-Constraints).

Nach diesem Batch wird sichtbar:
- Wie performant der Auto-Tag-Trigger im idempotenten Re-Run ist
- Ob die `tag_definitions`-Seed-Liste mit 16 V1-Tags konsistent ist
- Welche Konflikte mit existierendem Schema bestehen (falls Audit Reste findet)

---

## 11. Open Questions

Echte offene Punkte aus den gelesenen Dateien (keine Spekulation):

1. **`data_source` Spalte in `meal_items` — Drop oder behalten?**
   `SPEC_06_RECALCULATE_PATCH.md` empfiehlt Drop ("Empfehlung: data_source entfernen — food_source reicht"), aber Migration enthält die Spalte und Schema dokumentiert sie als deprecated.
   Status: nicht final entschieden im Spec-Set. Empfehlung für #5: Spalte droppen, da `food_source` semantisch identisch.

2. **`food_portions` für user-eigene BLS-Portionen — wo gespeichert?**
   `SPEC_07_PASS2_PATCH.md §2` definiert `POST /foods/:id/portions/user`, aber die Speicherorte sind unklar:
   - Option A: in `food_portions` mit `user_id`-Spalte (Schema-Erweiterung notwendig — nicht im Migration-SQL)
   - Option B: nur in `user_recent_portions` (kein editorial-style Eintrag)
   Status: nicht belegt im Spec-Set. Empfehlung für #4: Option B (nur `user_recent_portions`); alternative Option A erfordert Schema-Erweiterung.

3. **`cuisine` in `food_preference_items.target_type` — Referenz über `tag_code` oder separate `cuisine_id`?**
   `SPEC_02_PASS2_ENTITIES.md §27` listet `cuisine` als target_type, aber kein eigenes `cuisine_id`-Feld. Empfehlung in `OPUS_REVIEW_NUTRITION_02_DATA_API.md` FIX-2: über `tag_code` mit `tag_definitions.tag_type = 'cuisine'`. Status: nicht final entschieden im Spec-Set, aber konsensfähige Empfehlung dokumentiert.

4. **`nutrient_defs.rda_male/rda_female`-Convenience-Spalten — behalten oder droppen?**
   `OPUS_REVIEW_NUTRITION_02_DATA_API.md` IMP-5 + FIX-11: behalten als Convenience, mit `nutrient_reference_values` als Single Source of Truth. Status: konsensfähig dokumentiert, aber Implementation-Detail offen.

5. **MealCam `meal_items.scan_id` FK direction — `scan_id` referenziert `mealcam_scans(id)` oder umgekehrt `mealcam_scans.meal_id` referenziert `meals(id)`?**
   `SPEC_02_PASS2_ENTITIES.md §25` zeigt `mealcam_scans.meal_id UUID FK → meals` (NULL bis bestätigt). `SPEC_06_V1_MIGRATION.sql` ergänzt zusätzlich `meal_items.scan_id UUID REFERENCES mealcam_scans(id)`. Beide FK existieren parallel — keine Inkonsistenz, aber redundante Beziehungs-Modellierung. Status: dokumentiert, nicht problematisch.

Andere Punkte (z. B. konkrete Migration-Datei-Namen mit Datum, exakte Reihenfolge des `NNN`-Counters, ob `pnpm test` als zusätzlicher `validation_command` neben `pnpm tsc --noEmit`) sind nicht belegt in den gelesenen Files und werden bei der WO-Erstellung gemäß `template_migration.md` festgelegt.

---

## 12. Next Step

Empfehlung:

Nach Freigabe dieses Split-Plans wird der **Recommended First Batch** (Kandidaten #1, #2, #3) als drei echte Workorder-Dateien unter `system/workorders/` erzeugt. Jede WO folgt:

- **#1**: `template_implementation_low.md`-Variante (read-only Audit) → kein db-migration risk_category
- **#2**: `template_migration.md` mit `risk_category: db-migration`, `rollback_hint`, `requires_approval: true`
- **#3**: `template_migration.md` analog, plus aktualisierte TypeScript-Types

Vor der WO-Erstellung erfolgt ggf. ein zwischengeschalteter Batch-Plan (`MASTERPROMPT_WORKORDER_BATCH_PLAN.md` aus `CLAUDE.md`) für den ersten Batch.

Nach erfolgreichem Durchlauf des ersten Batches:
- Audit-Report lesen → Korrektur-WOs ggf. inserten
- Schema-Foundation verifizieren (manueller `supabase db diff` + lokaler `supabase db reset` Test)
- Dann Batch 2 (Kandidaten #4–#6 oder #4 + #6 + #8 parallel je nach Spark-Verfügbarkeit) planen

---

*Ende NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md*
