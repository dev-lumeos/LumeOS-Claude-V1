# Nutrition Module — Spec Index
> LumeOS | Stand: April 2026 — aktualisiert nach V1-Entscheidungsdokument

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Inputs/Outputs, Modul-Grenzen, Coach-Permissions, API-Übersicht |
| 02 | `SPEC_02_ENTITIES.md` | Core Entities, DB-Schema-Übersicht, Snapshot-Prinzip |
| 03 | `SPEC_03_USER_FLOWS.md` | User Flows inkl. Food Search, Ghost Entry, MealPlan Lifecycle |
| 04 | `SPEC_04_FEATURES.md` | Features mit Regeln und Implementierungsdetails |
| 05 | `SPEC_05_FOOD_TAXONOMY.md` | Kategorie-Baum, Food Tags V1, sort_weight, Canonical Names |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL — alle Tabellen, Indexes, Triggers, RLS |
| 07 | `SPEC_07_API.md` | Alle API Endpoints mit Request/Response-Schemas |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | BLS 4.0 Import: Pipeline, Mapping, Warn-Report, Review Queue |
| 09 | `SPEC_09_SCORING.md` | Scoring Engine: Pure Functions, Mikro-Review mit UL-Logik |
| 10 | `SPEC_10_COMPONENTS.md` | Frontend: Pages, Components, Hooks, Stores, i18n |

---

## V1 Scope — Entschieden April 2026

### V1 Pflicht

| Feature | Status |
|---|---|
| Food Search (BLS + Custom) | ✅ V1 |
| BLS 4.0 Food Database | ✅ V1 — einzige Master-Datenquelle |
| Meals / Diary Logging | ✅ V1 |
| Meal Items mit Snapshot-Nährwerten | ✅ V1 |
| Water Logs | ✅ V1 |
| Nutrition Targets | ✅ V1 |
| Custom Foods (user-privat) | ✅ V1 |
| Micronutrient Review (Food + Supplements-API) | ✅ V1 |
| Thai / i18n strukturell vorbereitet | ✅ V1 (TH-Texte nicht zwingend befüllt) |
| **MealCam V1** | ✅ **V1** |
| Nutrition Preferences (Allergien, Unverträglichkeiten, Likes/Dislikes, Diät, religiös/kulturell) | ✅ V1 |
| Food Tags V1 (16 Tags) | ✅ V1 |
| Food Portions | ✅ V1 |
| nutrient_reference_values | ✅ V1 |

### V1 nice-to-have / schema-only

| Feature | Status |
|---|---|
| Recipes | ⚠️ Schema vorbereiten — kein Full-UI Pflicht |
| Meal Plans | ⚠️ Schema vorbereiten — kein Full-UI Pflicht |
| Shopping Lists | ⚠️ Schema vorbereiten — kein Full-UI Pflicht |

**Wenn Zeit knapp wird:** Recipes, Meal Plans, Shopping Lists vollständig auf Phase 2 verschieben.

### Phase 2 (nicht V1)

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

## Kern-Entscheidungen (festgezogen April 2026)

| Entscheidung | Begründung | ADR |
|---|---|---|
| **Nur BLS 4.0** als Food-Datenquelle | Beste Datenqualität, CC BY 4.0, kein Merge-Overhead | `ADR_BLS_ONLY.md` |
| **OpenFoodFacts und USDA** nicht in V1 | Scope-Reduktion, Merge-Komplexität | `ADR_BLS_ONLY.md` |
| **MealCam ist V1**, Barcode ist Phase 2 | MealCam differenziert — Barcode ist Commodity | `ADR_MEALCAM_V1.md` |
| **Custom Foods** nur user-privat in V1 | Public Sharing ist Phase 2 | `ADR_CUSTOM_FOODS_V1.md` |
| **Nutrition Preferences** mit Hard/Soft Constraints | Allergien = Hard, Dislikes = Soft | `ADR_NUTRITION_PREFERENCES_V1.md` |
| **Supplements-API** für Micronutrient Review | Nutrition speichert keine Supplement-Produkte | `ADR_SUPPLEMENTS_API_BOUNDARY.md` |
| **EAV-Hybrid** für Nährstoffe | `foods` flat (Search), `food_nutrients` EAV (volle Tiefe), `meal_items` Snapshot | — |
| **Snapshot-Prinzip** in meal_items | Historische Diary-Daten bleiben stabil | — |
| **nutrient_reference_values** Tabelle | RDA/AI/UL pro Nährstoff/Alter/Geschlecht | — |
| **Kein automatisches Ghost-Entry-Expiry** | User entscheidet jederzeit — auch retroaktiv | — |
| **Water Target → Goals** | Goals berechnet wissenschaftlich | — |
| **Recipes/Meal Plans/Shopping Lists** schema-only | V1-Pflicht nur Schema, UI optional | `ADR_RECIPES_SCHEMA_ONLY.md` |
| **MealCam Consent** für Training-Freigabe | Opt-in für Modell-Training, Widerruf möglich | `ADR_MEALCAM_CONSENT.md` |
| **Coach** darf nur vorschlagen, nicht direkt ändern | User muss bestätigen | `ADR_COACH_PERMISSIONS_V1.md` |

---

## ADR-Dateien

| ADR | Thema |
|---|---|
| `ADR_BLS_ONLY.md` | BLS 4.0 als einzige Food-Datenquelle, kein OpenFoodFacts, kein USDA |
| `ADR_MEALCAM_V1.md` | MealCam ist V1, Barcode ist Phase 2, Provider-Entscheidung offen |
| `ADR_CUSTOM_FOODS_V1.md` | Custom Foods user-privat, source-Werte, Pflichtfelder |
| `ADR_NUTRITION_PREFERENCES_V1.md` | Preferences-Modell mit Hard/Strong/Soft/Boost Constraints |
| `ADR_SUPPLEMENTS_API_BOUNDARY.md` | Nutrition ↔ Supplements Grenze, API-Abfrage, Fallback |
| `ADR_RECIPES_SCHEMA_ONLY.md` | Recipes/Meal Plans/Shopping Lists V1 schema-only |
| `ADR_MEALCAM_CONSENT.md` | Training-Freigabe Opt-in, Widerruf, Datenschutz |
| `ADR_COACH_PERMISSIONS_V1.md` | Coach Permissions Granularität, Suggestions-Modell |
| `ADR_WATER_TOTAL_HYDRATION.md` | Gesamt-Hydration = geloggt + Nahrungswasser |
| `ADR_GHOST_ENTRY_RECIPE.md` | Ghost Entries aus Meal Plan |
| `ADR_IMPROVEMENTS_PACKAGE.md` | Allgemeine Verbesserungsnotizen |
| `ADR_RECIPE_SOURCE_BUDDY.md` | Buddy als Rezept-Ersteller |

---

## Offene Punkte (nach V1-Entscheidungen)

| # | Thema | Beschreibung |
|---|---|---|
| 1 | MealCam Vision-Provider | Provider final entscheiden bevor Implementierung |
| 2 | nutrient_reference_values befüllen | Schwangerschaft/Stillzeit vorbereitet, V1 nur Alter+Geschlecht aktiv |
| 3 | Thai-Übersetzungen | TH-Texte initial leer, Phase 2 befüllen |
| 4 | Buddy MealPlan Builder | Phase 2 |
| 5 | Barcode Scanner | Phase 2 |
| 6 | BLS 5.0 Update-Mechanismus | Phase 2 |
| 7 | Marketplace Recipes | Phase 2 |
| 8 | Public Custom Foods / Sharing | Phase 2 |
| 9 | Smart Scale Integration | Phase 2 (Goals/Weight) |
| 10 | Full Recipe UI / Meal Plan Builder | Phase 2 wenn Zeit knapp |

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
| Vision (MealCam) | Vision-Provider TBD |
| i18n | DE/EN/TH (400+ Keys, TH initial leer) |
