# Nutrition Module — Spec Index

STATUS: BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY

This Nutrition spec index is retained as source-chain evidence and future planning context. It is not an active product runbook and does not authorize BLS import, Supabase commands, migrations, Nutrition implementation, or product batches. Product execution remains closed unless Tom explicitly opens a specific product gate.
> LumeOS | Stand: Mai 2026

---

## Ordnerstruktur

```
docs/specs/Nutrition/
├── INDEX.md                         ← dieser Einstieg
├── 00_decisions/                    Entscheidungsdokumente
├── 01_current_specs/                Haupt-Specs (SSOT)
├── 02_patches/                      Ergänzungs-Patches zu Specs
├── 03_sql/                          SQL-Dateien + Seed-Strukturen
├── 04_adrs/                         Architecture Decision Records
├── 05_reviews/                      Opus-Reviews
└── 06_workorder_planning/           Workorder-Planung
```

---

## 00 Entscheidungen

| Datei | Inhalt |
|---|---|
| [00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md](00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md) | Vollständige V1-Entscheidungen (Basis für alle Passes) |

---

## 01 Haupt-Specs

| Spec | Datei | Inhalt |
|---|---|---|
| 01 | [01_current_specs/SPEC_01_MODULE_CONTRACT.md](01_current_specs/SPEC_01_MODULE_CONTRACT.md) | Zweck, Inputs/Outputs, Modul-Grenzen, Coach-Permissions, API-Übersicht |
| 02 | [01_current_specs/SPEC_02_ENTITIES.md](01_current_specs/SPEC_02_ENTITIES.md) | Core Entities, DB-Schema-Übersicht, Snapshot-Prinzip |
| 03 | [01_current_specs/SPEC_03_USER_FLOWS.md](01_current_specs/SPEC_03_USER_FLOWS.md) | User Flows inkl. Food Search, Ghost Entry, MealPlan Lifecycle |
| 04 | [01_current_specs/SPEC_04_FEATURES.md](01_current_specs/SPEC_04_FEATURES.md) | Features mit Regeln und Implementierungsdetails |
| 05 | [01_current_specs/SPEC_05_FOOD_TAXONOMY.md](01_current_specs/SPEC_05_FOOD_TAXONOMY.md) | Kategorie-Baum, Food Tags V1, sort_weight, Canonical Names |
| 06 | [01_current_specs/SPEC_06_DATABASE_SCHEMA.md](01_current_specs/SPEC_06_DATABASE_SCHEMA.md) | Vollständiges SQL — alle Tabellen, Indexes, Triggers, RLS |
| 07 | [01_current_specs/SPEC_07_API.md](01_current_specs/SPEC_07_API.md) | Alle API Endpoints mit Request/Response-Schemas |
| 08 | [01_current_specs/SPEC_08_IMPORT_PIPELINE.md](01_current_specs/SPEC_08_IMPORT_PIPELINE.md) | BLS 4.0 Import: Pipeline, Mapping, Warn-Report, Review Queue |
| 09 | [01_current_specs/SPEC_09_SCORING.md](01_current_specs/SPEC_09_SCORING.md) | Scoring Engine: Pure Functions, Mikro-Review mit UL-Logik |
| 10 | [01_current_specs/SPEC_10_COMPONENTS.md](01_current_specs/SPEC_10_COMPONENTS.md) | Frontend: Pages, Components, Hooks, Stores, i18n |

---

## 02 Patches

| Patch | Datei | Inhalt |
|---|---|---|
| 02+ | [02_patches/SPEC_02_PASS2_ENTITIES.md](02_patches/SPEC_02_PASS2_ENTITIES.md) | Pass 2: nutrient_reference_values, food_portions, mealcam_scans, coach_suggestions, preferences erweitert |
| 02 | [02_patches/SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md](02_patches/SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md) | Custom Food Entity Patch |
| 02 | [02_patches/SPEC_02_PATCH_MEALPLANLOG_ADR.md](02_patches/SPEC_02_PATCH_MEALPLANLOG_ADR.md) | MealPlanLog ADR Patch |
| 02 | [02_patches/SPEC_02_PATCH_NOTES.md](02_patches/SPEC_02_PATCH_NOTES.md) | Allgemeine Entity Patch Notes |
| 03+ | [02_patches/SPEC_03_PASS2_PATCH.md](02_patches/SPEC_03_PASS2_PATCH.md) | Pass 3: Flow 0 Onboarding, Flows 15-19, MealCam/Barcode/Auto-Accept Korrekturen |
| 03 | [02_patches/SPEC_03_FLOW4_RECIPE_PATCH.md](02_patches/SPEC_03_FLOW4_RECIPE_PATCH.md) | Flow 4 Recipe Ghost Entry Patch |
| 06+ | [02_patches/SPEC_06_PATCH_V1_DECISIONS.md](02_patches/SPEC_06_PATCH_V1_DECISIONS.md) | Pass 1: Schema-Fixes Dokumentation |
| 06+ | [02_patches/SPEC_06_RECALCULATE_PATCH.md](02_patches/SPEC_06_RECALCULATE_PATCH.md) | Pass 2: Snapshot/Recalculate/Audit-Modell, food_source vs. data_source Klaerung |
| 07+ | [02_patches/SPEC_07_PATCH_APRIL2026.md](02_patches/SPEC_07_PATCH_APRIL2026.md) | Patches: Top-Foods, Quick-Add, Water food_ml — Barcode-Anteil Phase 2 |
| 07+ | [02_patches/SPEC_07_PASS2_PATCH.md](02_patches/SPEC_07_PASS2_PATCH.md) | Pass 2: Food Portions, Micronutrient Review, MealCam V1, Preferences, Coach, Consent API |
| 09+ | [02_patches/SPEC_09_PATCH_UL_SUPPLEMENTS.md](02_patches/SPEC_09_PATCH_UL_SUPPLEMENTS.md) | Pass 1: UL-Logik, Supplements-Integration in calcMicroFlags |
| 10+ | [02_patches/SPEC_10_PATCH_APRIL2026.md](02_patches/SPEC_10_PATCH_APRIL2026.md) | Patches: QuickMacroEntry, nutrientDetails Refactor — BarcodeScanner Phase 2 |
| 10+ | [02_patches/SPEC_10_PASS2_PATCH.md](02_patches/SPEC_10_PASS2_PATCH.md) | Pass 2+3: PortionSelector, MealCam V1, Preferences UI, Coach UI, Recalculate, Consent Settings |

---

## 03 SQL

| Datei | Inhalt |
|---|---|
| [03_sql/SPEC_06_V1_MIGRATION.sql](03_sql/SPEC_06_V1_MIGRATION.sql) | Pass 1: SQL-Migration fuer alle V1-Fixes und neue Tabellen inkl. coach_nutrition_suggestions |
| [03_sql/NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md](03_sql/NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md) | Seed-Anforderungen fuer RDA/AI/UL ohne erfundene Werte |

---

## 04 ADRs

| ADR | Datei | Status |
|---|---|---|
| BLS-Only | [04_adrs/ADR_BLS_ONLY.md](04_adrs/ADR_BLS_ONLY.md) | Final |
| MealCam V1 | [04_adrs/ADR_MEALCAM_V1.md](04_adrs/ADR_MEALCAM_V1.md) | Final |
| Supplements-API Boundary | [04_adrs/ADR_SUPPLEMENTS_API_BOUNDARY.md](04_adrs/ADR_SUPPLEMENTS_API_BOUNDARY.md) | Final |
| Nutrition Preferences V1 | [04_adrs/ADR_NUTRITION_PREFERENCES_V1.md](04_adrs/ADR_NUTRITION_PREFERENCES_V1.md) | Final |
| Recipes Schema-Only | [04_adrs/ADR_RECIPES_SCHEMA_ONLY.md](04_adrs/ADR_RECIPES_SCHEMA_ONLY.md) | Final |
| MealCam Consent | [04_adrs/ADR_MEALCAM_CONSENT.md](04_adrs/ADR_MEALCAM_CONSENT.md) | Final |
| Coach Permissions V1 | [04_adrs/ADR_COACH_PERMISSIONS_V1.md](04_adrs/ADR_COACH_PERMISSIONS_V1.md) | Final |
| Custom Foods V1 | [04_adrs/ADR_CUSTOM_FOODS_V1.md](04_adrs/ADR_CUSTOM_FOODS_V1.md) | Final |
| Water Total Hydration | [04_adrs/ADR_WATER_TOTAL_HYDRATION.md](04_adrs/ADR_WATER_TOTAL_HYDRATION.md) | Final |
| Ghost Entry Recipe | [04_adrs/ADR_GHOST_ENTRY_RECIPE.md](04_adrs/ADR_GHOST_ENTRY_RECIPE.md) | Final |
| Recipe Source Buddy | [04_adrs/ADR_RECIPE_SOURCE_BUDDY.md](04_adrs/ADR_RECIPE_SOURCE_BUDDY.md) | Final |
| Improvements Package | [04_adrs/ADR_IMPROVEMENTS_PACKAGE.md](04_adrs/ADR_IMPROVEMENTS_PACKAGE.md) | archiv |

---

## 05 Reviews

| Datei | Inhalt |
|---|---|
| [05_reviews/OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md](05_reviews/OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md) | Opus Review 1: Scope + ADR Konsistenz |
| [05_reviews/OPUS_REVIEW_NUTRITION_02_DATA_API.md](05_reviews/OPUS_REVIEW_NUTRITION_02_DATA_API.md) | Opus Review 2: Datenmodell + API |
| [05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md](05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md) | Opus Review 3: UI + Flows + Workorder Readiness |
| [05_reviews/OPUS_REVIEW_NUTRITION_V1_FINAL.md](05_reviews/OPUS_REVIEW_NUTRITION_V1_FINAL.md) | Opus Final Review: PASS |

---

## 06 Workorder-Planung

| Datei | Inhalt |
|---|---|
| [06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md](06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md) | Workorder-Batch-Plan Nutrition V1 |

---

## V1 Scope

### V1 Pflicht

| Feature | Status |
|---|---|
| Food Search (BLS + Custom, Ranking, Tags, Alias, Fuzzy) | V1 |
| BLS 4.0 Food Database | V1 - einzige Master-Datenquelle |
| Meals / Diary Logging mit Snapshot | V1 |
| Water Logs (geloggt + Nahrungswasser) | V1 |
| Nutrition Targets (gecacht von Goals) | V1 |
| Custom Foods (user-privat) | V1 |
| Food Portions | V1 |
| Micronutrient Review (Food + Supplements-API) | V1 |
| nutrient_reference_values (RDA/AI/UL intern) | V1 (Seed-Werte noch TODO) |
| Thai / i18n strukturell vorbereitet | V1 (TH-Texte nicht release-blockierend) |
| MealCam V1 | V1 |
| Nutrition Preferences | V1 |
| Food Tags V1 (16 Tags) | V1 |
| Coach Permissions + Suggestions | V1 |

### V1 schema-only

| Feature | Status |
|---|---|
| Recipes | Schema vorbereiten - Full UI/API Phase 2 wenn Zeit knapp |
| Meal Plans | Schema vorbereiten - Full UI/API Phase 2 wenn Zeit knapp |
| Shopping Lists | Schema vorbereiten - kein V1-UI |

### Phase 2

| Feature |
|---|
| Barcode Scanner |
| Supplement-Produktverwaltung in Nutrition |
| Buddy MealPlan Builder |
| Marketplace Recipes |
| Public Custom Foods / Sharing |
| BLS 5.0 Update-Mechanismus |
| Full Recipe UI + Full Meal Plan Builder |
| Shopping List UI |
| Smart Scale Integration |

---

## Kern-Entscheidungen

| Entscheidung | ADR |
|---|---|
| Nur BLS 4.0 | [04_adrs/ADR_BLS_ONLY.md](04_adrs/ADR_BLS_ONLY.md) |
| MealCam V1, Barcode Phase 2 | [04_adrs/ADR_MEALCAM_V1.md](04_adrs/ADR_MEALCAM_V1.md) |
| Custom Foods user-privat | [04_adrs/ADR_CUSTOM_FOODS_V1.md](04_adrs/ADR_CUSTOM_FOODS_V1.md) |
| Preferences Hard/Strong/Soft/Boost | [04_adrs/ADR_NUTRITION_PREFERENCES_V1.md](04_adrs/ADR_NUTRITION_PREFERENCES_V1.md) |
| Supplements-API fuer Micronutrient Review | [04_adrs/ADR_SUPPLEMENTS_API_BOUNDARY.md](04_adrs/ADR_SUPPLEMENTS_API_BOUNDARY.md) |
| Recipes/Meal Plans schema-only | [04_adrs/ADR_RECIPES_SCHEMA_ONLY.md](04_adrs/ADR_RECIPES_SCHEMA_ONLY.md) |
| MealCam Training-Consent Opt-in | [04_adrs/ADR_MEALCAM_CONSENT.md](04_adrs/ADR_MEALCAM_CONSENT.md) |
| Coach nur Suggestions | [04_adrs/ADR_COACH_PERMISSIONS_V1.md](04_adrs/ADR_COACH_PERMISSIONS_V1.md) |

---

## Offene Punkte

| # | Thema | Prioritaet |
|---|---|---|
| 1 | MealCam Vision-Provider entscheiden | Vor Implementierung |
| 2 | nutrient_reference_values Seed-Daten beschaffen | Vor Implementierung |
| 3 | Thai-Uebersetzungen | Phase 2 |
| 4 | Buddy MealPlan Builder | Phase 2 |
| 5 | Public Custom Foods / Sharing | Phase 2 |
| 6 | Full Recipe / Meal Plan Builder | Phase 2 wenn Zeit knapp |

---

## Konsistenzpruefung (Stand Mai 2026)

| Check | Status |
|---|---|
| OpenFoodFacts nicht als V1-Quelle | Entfernt |
| USDA nicht als V1-Quelle | Entfernt |
| Barcode Scanner Phase 2 | OK |
| MealCam V1 | OK |
| AUTO_ACCEPT entfernt | OK (nach [05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md](05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md)) |
| Recipes/Meal Plans schema-only oder Phase 2 | OK |
| Thai strukturell vorbereitet | OK |
| Supplements-Grenze sauber | OK |
| Coach nur Suggestions | OK |
| Custom Foods source: kein openfoodfacts | OK |
| nutrient_reference_values ul=NULL korrekt | OK (Seed-Werte pending) |
| ADRs widersprechen Specs nicht | OK (nach [05_reviews/OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md](05_reviews/OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md)) |
| coach_nutrition_suggestions DDL vorhanden | OK |
| food_source/data_source Doppelung dokumentiert | OK |
| Recalculate API + Audit-Modell definiert | OK |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5100, TypeScript |
| Database | Supabase PostgreSQL, Schema nutrition |
| Auth | JWT via globalAuthMiddleware |
| Search | pg_trgm (Trigram-Index, <100ms) |
| Scoring | packages/scoring (Pure Functions, testbar) |
| Contracts | packages/contracts/src/nutrition/ |
| Frontend | Next.js 15, React, Zustand, TanStack Query |
| Vision (MealCam) | Vision-Provider TBD - Entscheidung vor Implementierung |
| i18n | DE/EN/TH (400+ Keys, TH initial leer) |
