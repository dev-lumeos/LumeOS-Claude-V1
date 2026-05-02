# Nutrition Module — Spec Index
> LumeOS | Stand: April 2026 — aktualisiert Pass 1 + Pass 2

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Inputs/Outputs, Modul-Grenzen, Coach-Permissions, API-Übersicht |
| 02 | `SPEC_02_ENTITIES.md` | Core Entities, DB-Schema-Übersicht, Snapshot-Prinzip |
| 02+ | `SPEC_02_PASS2_ENTITIES.md` | **Pass 2:** nutrient_reference_values, food_portions, mealcam_scans, coach_suggestions, preferences erweitert |
| 03 | `SPEC_03_USER_FLOWS.md` | User Flows inkl. Food Search, Ghost Entry, MealPlan Lifecycle |
| 03+ | `SPEC_03_PASS2_PATCH.md` | **Pass 3:** Flow 0 Onboarding, Flows 15–19, MealCam/Barcode/Auto-Accept Korrekturen |
| 04 | `SPEC_04_FEATURES.md` | Features mit Regeln und Implementierungsdetails |
| 05 | `SPEC_05_FOOD_TAXONOMY.md` | Kategorie-Baum, Food Tags V1, sort_weight, Canonical Names |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL — alle Tabellen, Indexes, Triggers, RLS |
| 06+ | `SPEC_06_V1_MIGRATION.sql` | **Pass 1:** SQL-Migration für alle V1-Fixes und neue Tabellen inkl. coach_nutrition_suggestions |
| 06+ | `SPEC_06_RECALCULATE_PATCH.md` | **Pass 2:** Snapshot/Recalculate/Audit-Modell, food_source vs. data_source Klärung |
| 07 | `SPEC_07_API.md` | Alle API Endpoints mit Request/Response-Schemas |
| 07+ | `SPEC_07_PATCH_APRIL2026.md` | Patches: Top-Foods, Quick-Add, Water food_ml — **Barcode-Anteil Phase 2** |
| 07+ | `SPEC_07_PASS2_PATCH.md` | **Pass 2:** Food Portions, Micronutrient Review, MealCam V1, Preferences, Coach |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | BLS 4.0 Import: Pipeline, Mapping, Warn-Report, Review Queue |
| 09 | `SPEC_09_SCORING.md` | Scoring Engine: Pure Functions, Mikro-Review mit UL-Logik |
| 09+ | `SPEC_09_PATCH_UL_SUPPLEMENTS.md` | **Pass 1:** UL-Logik, Supplements-Integration in calcMicroFlags |
| 10 | `SPEC_10_COMPONENTS.md` | Frontend: Pages, Components, Hooks, Stores, i18n |
| 10+ | `SPEC_10_PATCH_APRIL2026.md` | Patches: QuickMacroEntry, nutrientDetails Refactor — **BarcodeScanner Phase 2** |
| 10+ | `SPEC_10_PASS2_PATCH.md` | **Pass 2:** PortionSelector, MealCam V1, Preferences UI, Coach UI, Thai disabled |

---

## Entscheidungsdokument

| Datei | Inhalt |
|---|---|
| `NUTRITION_NEXT_SPEC_DECISIONS.md` | Vollständige V1-Entscheidungen (Basis für Pass 1+2) |

---

## ADR-Dateien

| ADR | Thema | Status |
|---|---|---|
| `ADR_BLS_ONLY.md` | BLS 4.0 als einzige Food-Datenquelle, kein OpenFoodFacts/USDA | ✅ Final |
| `ADR_MEALCAM_V1.md` | MealCam ist V1, Barcode ist Phase 2 | ✅ Final |
| `ADR_SUPPLEMENTS_API_BOUNDARY.md` | Nutrition nutzt Supplements-API für Micronutrient Review | ✅ Final |
| `ADR_NUTRITION_PREFERENCES_V1.md` | Hard/Strong/Soft/Boost Constraint-Modell | ✅ Final |
| `ADR_RECIPES_SCHEMA_ONLY.md` | Recipes/Meal Plans/Shopping Lists V1 schema-only | ✅ Final |
| `ADR_MEALCAM_CONSENT.md` | Training-Freigabe Opt-in, Widerruf, Datenschutz | ✅ Final |
| `ADR_COACH_PERMISSIONS_V1.md` | Coach Permissions Granularität + Suggestions-Modell | ✅ Final |
| `ADR_CUSTOM_FOODS_V1.md` | Custom Foods user-privat, source-Werte | ✅ Final |
| `ADR_WATER_TOTAL_HYDRATION.md` | Gesamt-Hydration = geloggt + Nahrungswasser | ✅ Final |
| `ADR_GHOST_ENTRY_RECIPE.md` | Ghost Entries aus Meal Plan | ✅ Final |
| `ADR_RECIPE_SOURCE_BUDDY.md` | Buddy als Rezept-Ersteller | ✅ Final |
| `ADR_IMPROVEMENTS_PACKAGE.md` | Allgemeine Verbesserungsnotizen | archiv |

---

## V1 Scope — Entschieden April 2026

### V1 Pflicht

| Feature | Status |
|---|---|
| Food Search (BLS + Custom, Ranking, Tags, Alias, Fuzzy) | ✅ V1 |
| BLS 4.0 Food Database | ✅ V1 — einzige Master-Datenquelle |
| Meals / Diary Logging mit Snapshot | ✅ V1 |
| Water Logs (geloggt + Nahrungswasser) | ✅ V1 |
| Nutrition Targets (gecacht von Goals) | ✅ V1 |
| Custom Foods (user-privat) | ✅ V1 |
| Food Portions | ✅ V1 |
| Micronutrient Review (Food + Supplements-API) | ✅ V1 |
| nutrient_reference_values (RDA/AI/UL intern) | ✅ V1 (Seed-Werte noch TODO) |
| Thai / i18n strukturell vorbereitet | ✅ V1 (TH-Texte nicht release-blockierend) |
| **MealCam V1** | ✅ **V1** |
| Nutrition Preferences (Allergien, Unverträglichkeiten, Likes/Dislikes, Diät, religiös/kulturell) | ✅ V1 |
| Food Tags V1 (16 Tags) | ✅ V1 |
| Coach Permissions + Suggestions | ✅ V1 |

### V1 nice-to-have / schema-only

| Feature | Status |
|---|---|
| Recipes | ⚠️ Schema vorbereiten — Full UI/API Phase 2 wenn Zeit knapp |
| Meal Plans | ⚠️ Schema vorbereiten — Full UI/API Phase 2 wenn Zeit knapp |
| Shopping Lists | ⚠️ Schema vorbereiten — kein V1-UI |

### Phase 2 (nicht V1)

| Feature | |
|---|---|
| Barcode Scanner | Phase 2 |
| Supplement-Produktverwaltung in Nutrition | Phase 2 (nie — Supplements-Modul) |
| Buddy MealPlan Builder | Phase 2 |
| Marketplace Recipes | Phase 2 |
| Public Custom Foods / Sharing | Phase 2 |
| BLS 5.0 Update-Mechanismus | Phase 2 |
| Full Recipe UI + Full Meal Plan Builder | Phase 2 wenn Zeit knapp |
| Shopping List UI | Phase 2 |
| Smart Scale Integration | Phase 2 (Goals/Weight) |

---

## Kern-Entscheidungen (festgezogen April 2026)

| Entscheidung | ADR |
|---|---|
| Nur BLS 4.0 — kein OpenFoodFacts, kein USDA | `ADR_BLS_ONLY.md` |
| MealCam V1, Barcode Phase 2 | `ADR_MEALCAM_V1.md` |
| Custom Foods user-privat, source: user\|manual\|import\|admin | `ADR_CUSTOM_FOODS_V1.md` |
| Preferences: Hard/Strong/Soft/Boost Constraints | `ADR_NUTRITION_PREFERENCES_V1.md` |
| Supplements-API für Micronutrient Review | `ADR_SUPPLEMENTS_API_BOUNDARY.md` |
| Recipes/Meal Plans schema-only | `ADR_RECIPES_SCHEMA_ONLY.md` |
| MealCam Training-Consent Opt-in | `ADR_MEALCAM_CONSENT.md` |
| Coach nur Suggestions — User bestätigt | `ADR_COACH_PERMISSIONS_V1.md` |

---

## Offene Punkte nach Pass 1 + Pass 2

| # | Thema | Priorität |
|---|---|---|
| 1 | **MealCam Vision-Provider** entscheiden | 🔴 Vor Implementierung |
| 2 | **nutrient_reference_values Seed-Daten** beschaffen | 🔴 Vor Implementierung |
| 3 | SPEC_03 User Flows für MealCam V1 ergänzen | 🟡 |
| 4 | SPEC_04 Features für Coach Permissions + MealCam V1 ergänzen | 🟡 |
| 5 | SPEC_05 Food Taxonomy: Food Tags V1 vollständig mit Auto-Tag-Regeln | 🟡 |
| 6 | Thai-Übersetzungen | 🟢 Phase 2 |
| 7 | Buddy MealPlan Builder | 🟢 Phase 2 |
| 8 | Public Custom Foods / Sharing | 🟢 Phase 2 |
| 9 | Full Recipe / Meal Plan Builder | 🟢 Phase 2 wenn Zeit knapp |

---

## Konsistenzprüfung (Pass 2 Stand)

| Check | Status |
|---|---|
| OpenFoodFacts nicht als V1-Quelle | ✅ Entfernt |
| USDA nicht als V1-Quelle | ✅ Entfernt |
| Barcode Scanner Phase 2 | ✅ |
| MealCam V1 | ✅ |
| Recipes/Meal Plans schema-only oder Phase 2 | ✅ |
| Thai strukturell vorbereitet, nicht release-blockierend | ✅ |
| Supplements-Grenze sauber | ✅ |
| Coach nur Suggestions | ✅ |
| Custom Foods source: kein openfoodfacts | ✅ |
| nutrient_reference_values ul=NULL korrekt | ✅ (Seed-Werte pending) |
| ADRs widersprechen Specs nicht | ✅ Stand 2026-05-02 (nach OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md Fixes) |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5100, TypeScript |
| Database | Supabase PostgreSQL, Schema `nutrition` |
| Auth | JWT via globalAuthMiddleware |
| Search | pg_trgm (Trigram-Index, <100ms) |
| Scoring | packages/scoring (Pure Functions, testbar) |
| Contracts | packages/contracts/src/nutrition/ |
| Frontend | Next.js 15, React, Zustand, TanStack Query |
| Vision (MealCam) | **Vision-Provider TBD — Entscheidung vor Implementierung** |
| i18n | DE/EN/TH (400+ Keys, TH initial leer) |
