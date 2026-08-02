# 01 – Modul: Nutrition

**Stand:** 2026-07-30
**Status:** Einziges „lebendes" Modul. Echte Server-Seiten gegen lokale DB, aber read-only (Phase 1B laut `README.md`). Keine Writes, kein Auth, keine Live-Userdaten – bestätigt auch im Dashboard-Mock (`src/app/dashboard/page.tsx:15`).

---

## 1. Seiten (`src/app/nutrition/`)

| Route | Datei | Tiefe |
|---|---|---|
| `/nutrition` | `page.tsx` | **Mock.** Diary-Übersicht als spec-treue UI, read-only, verlinkt auf Foods. |
| `/nutrition/foods` | `foods/page.tsx:47-68` | **Echt.** `force-dynamic`, Server-Component, ruft `searchFoods` aus `src/lib/nutrition/food-search.ts`. Filter: `q`, `category`, `tag`, `sort`, `offset`; Ausschluss-Optionen (animal, dairy, gluten, egg, fish, nuts, pork; strict vegan/vegetarian); Preference-Preview. |
| `/nutrition/curation` | `curation/page.tsx:29-50` | **Echt.** Admin-Kuration via `getNutritionCurationData`: unassigned foods, Kategorien/Tags/Aliase pflegen. |
| `/nutrition/preferences` | `preferences/page.tsx` | Redirect auf `/nutrition/foods`. |
| `/nutrition/local-schema` | `local-schema/page.tsx` | Debug-Ansicht des lokalen Schemas. |

## 2. API-Routen (`src/app/api/nutrition/`)

Nutrition ist das einzige Modul mit API-Routen.

| Endpoint | Datei | Zweck |
|---|---|---|
| `/api/nutrition/foods` | `foods/route.ts:47-73` | JSON-Variante der Foods-Suche (gleiche Filter wie Seite) |
| `/api/nutrition/foods/smart-preview` | `foods/smart-preview/route.ts` | Preview des eingebetteten Katalogs |
| `/api/nutrition/foods/categories` | `foods/categories/route.ts` | Kategorieliste |
| `/api/nutrition/curation` | `curation/route.ts` | Kurationsdaten als JSON |
| `/api/nutrition/preferences/catalog` | `preferences/catalog/route.ts` | Preference-Katalog |
| `/api/nutrition/local-schema` | `local-schema/route.ts` | Schema-Debug als JSON |

## 3. Fachlogik (`src/lib/nutrition/`)

Dateiliste verifiziert (10 Fachlogik-Dateien + 12 Testdateien):

- **Suche:** `food-search.ts` – SQL direkt gegen `nutrition.foods`, `food_categories` (mit `parent_id`-Hierarchie), `food_tags`, `tag_definitions`, `food_aliases`; laedt Nährstoffe aus `food_nutrients`/`nutrient_defs` (EAV, `food-search.ts:132-145`)
- **Kuration:** `curation.ts` – arbeitet auf `nutrition.food_curation_candidates` / `food_curation_decisions` (`curation.ts:79-116`)
- **Preferences:** `preferences-catalog.ts` (**code-eingebetteter Katalog**, `source: 'old_platform_screenshots_and_current_specs'`, `write_policy: 'read_only_catalog_no_user_persistence'`), `preference-search-preview.ts` (Preview-Join auf `food_tags`)
- **Nährstoff-UI-Logik:** `nutrient-preview-filter.ts`, `nutrient-detail-link.ts`, `nutrient-pin-compare.ts`, `nutrient-detail-selection.ts`
- **Schema-/Analyse:** `local-schema-debug.ts`, `human-layer-gap-analysis.ts` (Workstream P1-005)

**DB-Zugriff:** SQL gegen den lokalen Docker-Container `supabase_db_LumeOS-Claude-V1` (`food-search.ts:6`). **Nicht** über `@supabase/supabase-js`.

## 4. Datenbank

**Live-Schema (Schema `nutrition`, vom Code abgefragt):** `supabase/migrations/`
- `20240522_001_nutrition_schema_foundation.sql` – Schema-Grundlage
- `20240522_002_nutrition_food_core_tables.sql` – Kerntabellen: `nutrient_defs`, `food_categories`, `foods`, `food_nutrients` (**EAV-Nährstoffmodell existiert**), `food_aliases`, `tag_definitions`, `food_tags`
- Slices `20260513_*` / `20260514_*` (Foundation/TH-i18n/Food-Foundation-Ergänzungen, keine CREATE TABLEs)
- `snippets/` – 3 unbenannte SQL-Snippets (unprotokolliert)

**Nicht in den Migrations gefunden (Quelle offen):** `food_curation_candidates`, `food_curation_decisions` (vom Code genutzt), jegliche Preferences-Tabellen (existieren **nirgends** – der Preference-Katalog ist code-eingebettet).

**Diary-Entwurf (nicht verdrahtet):** `db/schema/nutrition.sql` + `db/migrations/20260423_001_nutrition_initial.sql` – Tabellen `foods`, `food_portions`, `diary_days`, `meal_logs`, `meal_items`, `daily_nutrition_summaries` im **public**-Schema, mit RLS + `auth.uid()` (Supabase-Zielbild), flache Makro-Spalten statt EAV. Wird vom Code nirgends abgefragt.

## 5. Tests

- **Unit-Tests:** `src/lib/nutrition/__tests__/` – 12 Dateien: `food-search`, `preference-search-preview`, `preferences-catalog`, `curation`, `curation-scan`, `local-schema-debug`, `human-layer-gap-analysis`, `nutrient-preview-filter`, `nutrient-detail-link`, `nutrient-pin-compare`, `nutrient-detail-selection`, `test-fixtures.ts`
- **Ops-Skripte:** Keine im Modul gefunden (frühere Dokumentation von `scripts/db` war falsch). Wie das Live-Schema in den lokalen Container gelangt, ist **offen** (kein Load-Skript im Repo auffindbar).
- Ausführung **nicht verifiziert** – Shell in der Scan-Session nicht verfügbar.

## 6. Spec-Abgleich

**Korrektur (v0.2, 2026-07-30):** Entgegen der ersten Fassung dieses Dokuments existiert eine **umfangreiche Nutrition-Spec** unter `docs/specs/Nutrition/`:

- `01_current_specs\` – SPEC_01 Module Contract, SPEC_02 Entities, SPEC_03 User Flows, SPEC_04 Features, SPEC_05 Food Taxonomy, SPEC_06 Database Schema, SPEC_07 API, SPEC_08 Import Pipeline, SPEC_09 Scoring, SPEC_10 Components
- `02_patches\` – 12 Patch-Dokumente (u.a. Custom Food, Recipe Flow, MealPlanLog, UL Supplements, April-2026-Patches)
- `03_sql\` – `SPEC_06_V1_MIGRATION.sql`, Seed-Struktur Nutrient Reference Values
- `04_adrs\` – `ADR_BLS_ONLY.md` (deckt sich mit dem BLS-Scope im Code), `ADR_CUSTOM_FOODS_V1.md`, `ADR_COACH_PERMISSIONS_V1.md`
- `00_decisions\NUTRITION_NEXT_SPEC_DECISIONS.md`, `00_raw\bls\` (BLS 4.0 Originaldaten, PDF + XLSX)

**Befund:** Der Code implementiert eine **Teilmenge** der Spec – Food Search, Curation, Preferences-Katalog (≈ SPEC_04/05/06-Basis). Spezifiziert, aber im Code nicht sichtbar: Scoring (SPEC_09), Import-Pipeline (SPEC_08), Custom Foods (ADR_CUSTOM_FOODS_V1), Rezept-/Mealplan-Flows (Patches), Diary. **Der Detailabgleich Spec ↔ Code (welche SPEC-Features in welchem Umfang umgesetzt sind) steht noch aus** und ist der nächste sinnvolle Schritt für dieses Modul.

## 7. Lücken und offene Punkte

1. **Kein Schreibpfad, keine Preferences-Tabelle:** Der Preference-Katalog ist code-eingebettet mit explizitem `write_policy: 'read_only_catalog_no_user_persistence'` (`preferences-catalog.ts:4`). Eine DB-Tabelle für User-Preferences existiert **nirgends** (weder `supabase/migrations/` noch `db/schema/`).
2. **Diary:** Live-Schema hat keine Diary-Tabellen. Es gibt einen **nicht verdrahteten Entwurf** (`db/schema/nutrition.sql`, public-Schema, RLS, flache Makros), der zudem konzeptionell vom EAV-Live-Modell abweicht → Modellkonflikt vor Diary-Bau klären.
3. **Kein RLS** im Live-Schema – für lokalen Single-User ok, für Remote-Betrieb Pflicht. Der Diary-Entwurf hat RLS bereits vorgedacht.
4. **Curation-Tabellen ohne dokumentierte Herkunft:** `food_curation_candidates`/`food_curation_decisions` werden vom Code genutzt, sind aber in keiner Migration im Repo → Schema-Hoheit unklar, Drift-Risiko.
5. ~~Detailabgleich steht aus~~ → erledigt: siehe `02-nutrition-spec-code-abgleich.md` (dort §3/§4 ebenfalls mit diesem Stand korrigiert).
6. **Entscheidung nötig:** supabase-js vs. Docker-Container-Pattern vereinheitlichen (hängt an der Architektur-Entscheidung aus `02-nutrition-spec-code-abgleich.md` §6).
