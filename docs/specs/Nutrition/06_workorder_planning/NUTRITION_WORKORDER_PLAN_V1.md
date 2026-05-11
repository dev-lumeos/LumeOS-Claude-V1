# NUTRITION_WORKORDER_PLAN_V1.md

STATUS: BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY

This planning document is retained as source-chain evidence for future Nutrition work. It is not an active runbook and does not authorize BLS import, Nutrition implementation, Supabase commands, migration execution, or product batches. Product execution remains closed unless Tom explicitly opens a specific product gate.

> Workorder-Planungsdokument für Nutrition V1
> Stand: 2026-05-02
> Author: Opus
> **Hinweis:** Dies ist KEINE Workorder-Erstellung. Nur Planungsdokument.
> Quellen: `OPUS_REVIEW_NUTRITION_V1_FINAL.md`, `NUTRITION_NEXT_SPEC_DECISIONS.md`, `INDEX.md`, `SPEC_01_MODULE_CONTRACT.md`, `SPEC_02_PASS2_ENTITIES.md`, `SPEC_06_DATABASE_SCHEMA.md`, `SPEC_06_V1_MIGRATION.sql`, `SPEC_06_RECALCULATE_PATCH.md`, `SPEC_07_PASS2_PATCH.md`, `SPEC_10_PASS2_PATCH.md`

---

## 1. Status

- Nutrition V1 Specs sind **PASS_WITH_FIXES** (siehe `OPUS_REVIEW_NUTRITION_V1_FINAL.md`).
- **14 Bereiche** sind workorder-ready ohne weitere Klärung.
- **2 Bereiche** warten auf externe Research- oder Decision-Inputs (MealCam Vision-Provider, `nutrient_reference_values` Seed-Werte).
- Drei Review-Wellen + zwei Pass-Wellen sind durchlaufen, alle Critical-Findings bereinigt, Provider-Adapter-Layer und Micronutrient-Scoring-Logik können erst nach den zwei Open Items final gebaut werden — UI/API/Schema sind providerunabhängig spezifiziert.

---

## 2. Blocker

| Blocker | Blockiert | Blockiert nicht | Nächste Entscheidung |
|---|---|---|---|
| **MealCam Vision-Provider** | Provider-Adapter (HTTP-Client, Image-Encoding, Polling/Async-Logic), echte MealCam-Service-Integration, End-to-End-Tests mit echtem Provider | MealCam Schema (`mealcam_scans`), MealCam Consent-Flow, Confirmation UI, Upload/Capture UI, MealCam UI-Components mit Mock-Provider, API-Vertrags-Endpoints (`/mealcam/scan`, `/scan/:id/correct`, `/scan/:id/confirm`, `/scan/:id/consent`) | Tom entscheidet konkreten Provider (z. B. Anthropic Vision, OpenAI Vision, eigenes Modell) → danach dünner Provider-Adapter-WO |
| **`nutrient_reference_values` Seed-Werte** | Echtes Micronutrient Scoring (UL-Logik, deficit/surplus-Klassifikation), Ampelstatus, `calcMicroFlagsEnhanced` Pure Function, Daily-Aggregat-Vergleich gegen Reference-Values, medizinische Review vor Produktion | `nutrient_reference_values` Tabelle + Schema + RLS + GRANTs, API-Endpoint `GET /nutrients/reference-values`, MicroDashboard UI mit Placeholder/grauem "nicht bewertbar"-Zustand, Supplements API Boundary | Tom oder Medical-Lead beschafft DACH 2020 / EFSA DRV / IOM Quelltabellen → Werte für Priorität-1-Nährstoffe (24 Codes, Erwachsene 18–50 m/w) extrahieren → SQL-Datei `NUTRIENT_REFERENCE_VALUES_SEED_DATA.sql` mit `source` + `source_version` pro Eintrag → medizinische Freigabe |

---

## 3. Workorder-ready Bereiche

| Bereich | Ready? | Warum | Abhängigkeiten |
|---|---|---|---|
| BLS Import | ✅ Ja | Pipeline (`SPEC_08`), Mapping, Warn-/Error-Reports, Review Queue spezifiziert. Auto-Tagging-Trigger auf 16 V1-Tags reduziert. | DB-Foundation (Phase 1) |
| Food Search | ✅ Ja | BLS+Custom Foods, Tag-Filter, Smart-Search-Boost via Preferences, pg_trgm Index, Response-Schema konsistent | DB-Foundation, BLS Import |
| Custom Foods | ✅ Ja | CRUD, EU-14 Allergen-Selektor (`custom_allergens TEXT[]`), `source` enum bereinigt (`user|manual|import|admin`), Barcode aus V1-Flow entfernt | DB-Foundation |
| Tags | ✅ Ja | 16 V1-Filter-Tags aus Decisions §5 verbindlich, weitere Tags aus SPEC_05 als Phase-2-Erweiterung markiert, Auto-Tagging-Trigger entsprechend angepasst | DB-Foundation |
| Preferences / Onboarding | ✅ Ja | Onboarding-Flow als Flow 0 vorhanden, 4-Step Wizard, `food_preference_items.target_type` CHECK auf `cuisine` erweitert, 9 Components in SPEC_10_PASS2 | DB-Foundation, Auth-Modul (User-Profile) |
| Diary / Meal Items | ✅ Ja | `food_source` enum auf `('bls','custom','mealcam','manual')` erweitert, `meal_items.portion_name` vorhanden, Quick-Add Makros (`QuickMacroEntry`) ergänzt | DB-Foundation, BLS Import, Custom Foods |
| Snapshots / Recalculate | ✅ Ja | API-Endpoints `POST /meal-items/:id/recalculate` + `POST /meals/:id/recalculate` definiert, UI-Components vorhanden, Flow 15, `snapshot_history JSONB` Audit | Diary |
| Portions | ✅ Ja | `food_portions` Tabelle, `user_recent_portions`, RLS-Fix (BLS-Portions read-only für User), Routing-Reihenfolge `/foods/:id/portions` vor `/foods/:id` korrigiert | DB-Foundation |
| Water Logs | ✅ Ja | `water_logs`, Quick-Add, Total-Hydration (logged + food_ml), Goals liefert Target | DB-Foundation, Goals (Target-Source) |
| Nutrition Targets | ✅ Ja | `nutrition_targets` als Cache, Daily-Fetch von Goals, Fallback bei Goals-Down dokumentiert, Default-Werte spezifiziert | DB-Foundation, Goals (Target-Source) |
| Supplements API Integration | ✅ Ja | Nur Konsument-Code (`GET http://supplements:5200/api/supplements/daily-intake`), Fallback-Verhalten (`supplement_data_available: false`) dokumentiert, keine lokale Supplement-Tabellen | Supplements-Modul (extern) |
| Coach Permissions | ✅ Ja | `CoachPermissionsPanel` mit 9 Toggles, Settings-Flow 18, Permission-Tabelle im Auth-Modul (cross-module) | DB-Foundation, Auth-Modul (Permission-Tabelle) |
| Coach Suggestions | ✅ Ja | `coach_nutrition_suggestions` Tabelle DDL + Index + RLS vorhanden, 9 Suggestion-Typen, Per-Type-Akzeptanz-Wirkung dokumentiert (Flow 17) | DB-Foundation, Coach Permissions |
| Recipes / Meal Plans / Shopping Lists schema-only | ✅ Ja | Schema-only-Marker durchgängig in SPEC_07, SPEC_10, SPEC_03 gesetzt. `Recipe.source` mit `buddy` ergänzt (V1 schema-only). 501-Response für Phase-2-Endpoints definiert | DB-Foundation |
| Thai/i18n preparation | ✅ Ja | `name_th` Felder in allen relevanten Tabellen, UI: TH disabled "Coming soon"-Tooltip, Fallback `name_th = NULL` → `name_de`, 400+ Keys mit TH initial leer | i18n-Infrastruktur (Cross-Cutting) |
| MealCam UI mit Mock-Provider | ⚠️ Teilweise | UI-Components, Schema, Consent-Flow, Confirmation-Flow alle providerunabhängig spezifiziert. Mock-Provider ermöglicht UI-Tests ohne echte Vision-API | DB-Foundation; Provider-Adapter-WO **wartet auf BLOCK-1** |
| Micronutrient Review UI/API Placeholder | ⚠️ Teilweise | UI-Components (`MicroDashboard`, `MicroNutrientCard`, `ULWarningBar`, `SupplementDataBanner`) und API-Endpoint (`GET /summary/micronutrients`) bauen lassen sich. Status grau / nicht bewertbar wenn keine Reference-Values vorhanden | Reference-Values-Seed **wartet auf BLOCK-2** |

---

## 4. Empfohlene Umsetzung in Phasen

### Phase 1 — DB Foundation

**Ziel:** Schema-Grundlagen, Tabellen, Constraints, RLS, DDL vorbereiten.

**Bereiche:**
- `SPEC_06_V1_MIGRATION.sql` Idempotenz prüfen + ggf. ergänzen
- BLS/Core Tables: `nutrient_defs`, `food_categories`, `foods`, `food_nutrients`, `tag_definitions`, `food_tags`, `food_aliases`
- Custom Foods: `foods_custom` mit korrigiertem `source CHECK ('user','manual','import','admin')` + `name_th` + `custom_allergens TEXT[]`
- `food_portions` + `user_recent_portions`
- `nutrient_reference_values` Struktur ohne Seed-Werte (RLS, Indices, GRANTs)
- `food_preferences` + `food_preference_items` (extended: severity, source, target_type inkl. cuisine)
- `coach_nutrition_suggestions` (DDL, RLS, GRANTs, Indices)
- MealCam-Tabellen: `mealcam_scans` (mit `image_path`, `training_consent`, `detected_items JSONB`, `user_corrections JSONB`, `scan_status`, `confidence_level`)
- Snapshot/Recalculate: `meal_items.snapshot_version`, `snapshot_history JSONB`, `meal_item_snapshot_history` (falls Audit-Tabelle als Variante gewählt)
- Diary: `meals`, `meal_items` (food_source erweitert, `portion_name`, `data_source`-Klärung)
- `nutrition_targets`, `water_logs`, `micro_flags`, `daily_nutrition_summary VIEW`
- Schema-only: `recipes`, `recipe_items`, `meal_plans`, `meal_plan_days`, `meal_plan_items`, `meal_plan_logs`, `shopping_lists`, `shopping_list_items`

### Phase 2 — BLS Import + Food Search

**Ziel:** BLS 4.0 importieren und suchbar machen.

**Bereiche:**
- `nutrient_defs` Mapping (138 BLS-Codes als Seed)
- BLS-Import-Run-Metadata (Version, Stand, Pipeline-Run-ID)
- Warning-/Error-Reports (nicht gemappte Spalten, fehlerhafte Foods)
- Review Queue (manuelle Sichtung fehlerhafter Imports)
- Multilinguale Such-Felder (`name_de`, `name_en`, `name_th`, `name_display*`)
- Aliases (DE/EN/TH, source: editorial/ai_generated/user)
- Fuzzy-/Trigram-Suche (pg_trgm GIN-Index)
- Ranking (sort_weight + similarity-Score, Custom Foods immer zuerst, Liked-Boost, Tag-Match-Boost)
- Tag-Definitionen (V1: 16 sichtbare Filter-Tags + Auto-Tag-Trigger, weitere Tags Phase 2)

### Phase 3 — Diary / Meal Items / Portions / Snapshots

**Ziel:** Core Diary funktional machen.

**Bereiche:**
- Meal Slots (default + custom)
- Meal Items (food_id ODER custom_food_id, food_source, food_name denormalisiert, amount_g, eingefrorene Nährstoffe direkt + JSONB-Snapshot)
- Amount/Portion Logic: gram-based canonical calculation, Portions-Selector, recent_amount_g
- Snapshots: vollständige Nährstoff-Einfrierung beim Logging, immutable nach Erstellung
- Daily Aggregates: `daily_nutrition_summary VIEW`, Range-Aggregat `GET /summary/range`
- Recalculate API: `POST /meal-items/:id/recalculate`, `POST /meals/:id/recalculate`, History-Sicherung in `snapshot_history`
- Recalculate UI: `MealItemRecalculateButton`, `MealItemRecalculateModal` (Diff-Anzeige), `MealRecalculateAllButton`, Flow 15

### Phase 4 — Preferences / Onboarding / Settings

**Ziel:** User Preferences als Constraints und Ranking-Signale aktivieren.

**Bereiche:**
- Allergien (Hard Constraint, EU-14)
- Unverträglichkeiten (Strong Constraint)
- Likes/Dislikes (Soft / Boost) auf food/category/tag/cuisine-Ebene
- Religiöse/kulturelle Einschränkungen (Hard wenn User so setzt)
- Cuisine Preferences (Multi-Select)
- Onboarding Flow 0: 4-Step Wizard (Diät+Allergien → Religiös → Likes/Dislikes → Meal-Slots+Ziel)
- Settings Flow 9 (bestehend) + Coach-Suggestions-Pflege (Flow 17)

### Phase 5 — Targets / Water Logs

**Ziel:** Targets und tägliches Wassertracking integrieren.

**Bereiche:**
- Nutrition Targets: Daily-Fetch von Goals, Cache in `nutrition_targets`, Fallback-Default bei Goals-Down
- Target Snapshots: pro Tag eingefroren, ändern sich nicht rückwirkend
- Goals Boundary: `GET goals:5900/api/goals/targets/today`, Fallback-Werte (2000 kcal, 150g P, 200g KH, 65g F, 30g Fiber, 2500ml Wasser)
- Water Logs: Quick-Add (250/500/750/1000 ml), explizit geloggt
- Diary Water Progress: Total-Hydration = `water_logs.amount_ml + meal_items.water_g`, Pending-Action bei <80% nach 18:00

### Phase 6 — Supplements API Boundary + Micronutrient Review Shell

**Ziel:** Micronutrient Review strukturell vorbereiten.

**Bereiche:**
- Supplements API Input: `GET supplements:5200/api/supplements/daily-intake`, Response-Format {nutrient_totals, items, supplement_data_available}
- Food vs Supplement Split: separate Anzeige in `MicroNutrientCard` (food_amount, supplement_amount, total_amount)
- Unavailable-Supplement-Data State: `SupplementDataBanner`, kein Hard-Failure, Score nur auf Food-Anteil
- Gray / Not-Assessable State: wenn keine Reference-Values vorhanden → `status: 'gray'`, kein Ampel-Vergleich
- UI Shell: `MicroDashboard` (erweitert), `MicroNutrientCard` (erweitert), `ULWarningBar` (zeigt erst wenn UL belegt)
- **Keine echten RDA/AI/UL-Werte erfinden.** Nur Schema, API, UI-Shell.

### Phase 7 — Coach Permissions + Suggestions

**Ziel:** Coach kann Nutrition lesen/vorschlagen, aber nicht direkt ändern.

**Bereiche:**
- Permission Gates: 9 Permission-Bereiche (`nutrition.diary`, `.water`, `.micronutrient`, `.mealcam_images`, `.targets`, `.custom_foods`, `.recipes`, `.meal_plans`, `.preferences`)
- Audit Log (für alle Coach-Zugriffe und Suggestion-Aktionen)
- Suggestions Model: 9 Typen (`nutrition_target`, `meal_plan`, `food_alternative`, `water_goal`, `custom_food_correction`, `micronutrient_comment`, `mealcam_comment`, `diary_flag`, `preference`)
- Status: `pending | accepted | rejected | expired` (TTL Default 7 Tage)
- User Accept/Reject Flows: Per-Type-Akzeptanz-Wirkung (siehe Flow 17), `decision_note` optional
- Coach-Permissions-Settings UI: `CoachPermissionsPanel` mit 9 Toggles, Flow 18

### Phase 8 — UI Assembly + i18n

**Ziel:** Nutrition V1 UI zusammenführen.

**Bereiche:**
- Diary (`DiaryView`, `MealGroup`, `FoodLogEntry`, `MacroDashboard`, `NutritionScoreCard`, `GhostMealEntry` + `GhostConfirmModal`)
- Food Search (`FoodSearch`, `FoodSearchFilters`, `FoodCard`, `FoodAmountInput`, `SmartSuggestions`)
- Custom Food Form (mit EU-14-Allergen-Selector)
- Portion Selector (`PortionSelector` + `useFoodPortions`)
- Targets-Anzeige (read-only via `MacroDashboard`)
- Water (`WaterTracker`, `WaterQuickAdd`)
- Preferences UI (`PreferencesView` erweitert + Onboarding-Components-Wiederverwendung in Settings)
- Coach UI (`CoachSuggestionBadge`, `CoachSuggestionList`, `CoachSuggestionCard`, `SuggestionTypeDisplay`, `CoachPermissionsPanel`)
- Quick-Add Makros (`QuickMacroEntry`)
- Recalculate UI (`MealItemRecalculateButton`, `-Modal`, `MealRecalculateAllButton`)
- Thai disabled / "Coming soon"-Tooltip
- DE/EN aktiv (400+ Keys), TH-Keys initial leer, kein Release-Block

### Parallel Track A — MealCam

**Status:** Teilweise ready.

**Startbar:**
- Schema (`mealcam_scans`)
- Consent-Modell (Opt-in `training_consent`, Settings-UI für Widerruf, `MealCamConsentSettings`, `RevokeAllConsentButton`)
- Upload UI (`MealCamButton`, `MealCamModal`, `MealCamImageInput`)
- Confirmation UI (`MealCamResults`, `MealCamFoodItem`, `MealCamUnknownItem`, `MealCamConfirmation`, `MealCamConsentBanner`)
- Mock Provider (deterministische Test-Responses für UI-Tests)
- API-Vertrags-Endpoints (5-Schritt-Flow gemäß `SPEC_07_PASS2 §4`)
- Plan-Comparison (`MealCamPlanComparison`)

**Wartet (BLOCK-1):**
- Vision-Provider-Decision (Anthropic / OpenAI / eigenes Modell)
- Real Provider Adapter (HTTP-Client, Image-Encoding, Polling/Async)
- Service-Integration (`mealcam`-Endpoint mit echtem Provider)
- E2E-Tests mit echtem Provider

### Parallel Track B — Reference Values

**Status:** Research nötig.

**Startbar:**
- Tabellen-Struktur (`nutrient_reference_values` mit `nutrient_code`, `age_min`, `age_max`, `sex`, `is_pregnant`, `is_lactating`, `rda`, `ai`, `ul`, `target_min`, `target_max`, `source`, `source_version`, `notes`, `effective_from`)
- RLS-Policies + GRANTs
- Admin-Import-Format (CSV oder SQL-Bulk-Insert mit Validierung pro Pflichtregel)
- Placeholder States in UI (`status: 'gray'` wenn kein RDA/AI vorhanden)
- Validierungs-Logik (`ul = NULL` ≠ `ul = 0`, Source mandatory, kein Wert ohne Beleg)

**Wartet (BLOCK-2):**
- Geprüfte DACH 2020 / EFSA DRV Reference-Daten (Quelltabellen beschaffen)
- Source/Version-Metadaten pro Eintrag
- Medizinische Review-Freigabe vor Produktionseinsatz
- IOM/NAM Optional für US-Vergleichswerte

---

## 5. Nicht starten vor Entscheidung

| Bereich | Begründung |
|---|---|
| Real MealCam Provider Adapter | Wartet auf BLOCK-1 (Vision-Provider-Wahl) |
| Real Micronutrient Scoring | Wartet auf BLOCK-2 (Reference-Values-Seed) |
| UL/Ampel Production Logic | Wartet auf BLOCK-2 |
| RDA/AI/UL Seed SQL (`NUTRIENT_REFERENCE_VALUES_SEED_DATA.sql`) | Wartet auf medizinisch geprüfte Quelltabellen |
| Barcode Scanner | Phase 2 (Decisions §1) — explizit nicht V1 |
| Buddy MealPlan Builder | Phase 2 (Decisions §1) — `source = 'buddy'` ist V1 nur Schema |
| Marketplace Recipes | Phase 2 (Decisions §1) — Marketplace-Modul-Boundary |
| Full Recipes UI | Phase 2 (Decisions §15) — V1 Schema-only, Full UI optional |
| Full MealPlan Builder | Phase 2 (Decisions §15) |
| Shopping List UI | Phase 2 (Decisions §15) |

---

## 6. Micro-Workorder-Regeln

Verbindliche Regeln für die spätere Workorder-Erstellung:

- **Jede WO klein**: max. 3 Files Scope (siehe `.claude/rules/scope.md`); Discovery-WOs (read-only) ausgenommen
- **Eine WO = ein klarer Scope**: kein "während ich schon dabei bin"
- **DB-WOs getrennt von API-WOs**: ein Layer pro WO (Decisions, `.claude/rules/scope.md` §Layer-Trennung)
- **UI-WOs getrennt von API-WOs**: kein Mix `service + ui`, kein Mix `types + service`
- **RLS/Permissions eigene WOs**: Sicherheits-relevante Änderungen isoliert reviewbar
- **Import-Pipeline eigene WOs**: BLS-Import als geschlossene Einheit (Mapping + Run + Reports)
- **Search-Ranking eigene WOs**: Ranking-Algorithmen separat von Suchschnittstelle
- **Keine MealCam Real-Provider WO ohne Provider-Entscheidung** (BLOCK-1)
- **Keine Micronutrient-Scoring WO ohne geprüfte Reference-Values** (BLOCK-2)
- **Keine Barcode-WO in V1** (Phase 2)
- **High-Risk-Regel** (`CLAUDE.md`): `db-migration`, `medical` brauchen Prior Approval und Spark D mandatory
- **DB-Migrationen** brauchen `rollback_hint` und reversibles UP+DOWN
- **Snapshots/Recalculate** ist `medical`-adjacent (Diary-Daten, Health-Implikation) → ggf. Cautious-Risk
- **i18n** läuft als `i18n` Risk-Kategorie (autonomer Run möglich)
- **Schema-only-Bereiche** (Recipes/Plans/Shopping) als reine `db-migration`-WOs ohne UI/API-Pflicht-Anteile

---

## 7. Erste Workorder-Kandidaten

> Hinweis: Hier nur Kandidatenliste. Keine vollständigen WOs werden in diesem Plan erstellt.

| Kandidat | Bereich | Warum zuerst | Blocker |
|---|---|---|---|
| `nutrition-db-foundation-v1` | Phase 1 — DB | Foundation für alle weiteren WOs; Master-Schema mit Migration sync, alle V1-Tabellen idempotent erzeugen | keiner |
| `nutrition-bls-import-runner-v1` | Phase 2 — BLS | Liefert Daten für Search, Diary, Tags; Import-Pipeline mit Run-Metadata, Mapping, Warn-Reports, Review Queue | Phase 1 |
| `nutrition-food-search-v1` | Phase 2 — Search | Core User-Funktion; pg_trgm + Smart-Search-Boost via Preferences | Phase 1, BLS Import |
| `nutrition-custom-foods-v1` | Phase 2 — Custom | Ergänzt Search-Sortiment; CRUD, EU-14-Allergene, `name_th` | Phase 1 |
| `nutrition-portions-v1` | Phase 3 — Portions | Vorgelagert zu Diary-Logging; `food_portions`, `user_recent_portions`, RLS-Policy | Phase 1, Custom Foods |
| `nutrition-diary-snapshots-v1` | Phase 3 — Diary | Core Diary; Meals + Meal Items + Snapshot-Logic + Quick-Add | Phase 1, BLS Import, Custom Foods, Portions |
| `nutrition-recalculate-v1` | Phase 3 — Recalc | Audit/History für Diary; API + UI + `snapshot_history` | Diary |
| `nutrition-preferences-v1` | Phase 4 — Preferences | Smart-Search & Onboarding-Voraussetzung; Schema + API + Onboarding-Flow | Phase 1, Auth-Modul (User-Profile) |
| `nutrition-water-logs-v1` | Phase 5 — Water | Eigenständig; Logs + Total-Hydration + Quick-Add | Phase 1 |
| `nutrition-targets-v1` | Phase 5 — Targets | Voraussetzung für Compliance/Score; Cache + Goals-Fetch + Fallback | Phase 1, Goals-Modul (extern) |
| `nutrition-supplements-boundary-v1` | Phase 6 — Supplements | API-Konsument-Code, Fallback-Verhalten; keine eigenen Supplement-Tabellen | Supplements-Modul (extern) |
| `nutrition-coach-permissions-v1` | Phase 7 — Coach Permissions | Voraussetzung für Coach Suggestions; 9 Permission-Bereiche, Audit-Log | Auth-Modul (Permission-Tabelle) |
| `nutrition-coach-suggestions-v1` | Phase 7 — Coach Suggestions | 9 Typen + Per-Type-Wirkung; `coach_nutrition_suggestions` + API + UI | Coach Permissions |
| `nutrition-i18n-shell-v1` | Phase 8 — i18n | Cross-Cutting; DE/EN aktiv, TH disabled, 400+ Keys | keiner |
| `nutrition-mealcam-ui-mock-v1` | Parallel Track A | UI-Components mit Mock-Provider testen; Schema + Consent + Upload + Confirmation | Phase 1; KEIN Real-Provider (BLOCK-1) |
| `nutrition-reference-values-research-v1` | Parallel Track B | Research-WO: Quelltabellen sichten, Pflichtregeln dokumentieren, Import-Format definieren — KEIN Seed-SQL | KEIN Seed-Eintrag bis BLOCK-2 entschieden |

---

## 8. Sources

Folgende Dateien wurden für diesen Workorder-Plan gelesen:

- `OPUS_REVIEW_NUTRITION_V1_FINAL.md` — finale Konsolidierung der drei Reviews mit Workorder-Readiness und Blockern
- `NUTRITION_NEXT_SPEC_DECISIONS.md` — verbindliche V1-Entscheidungen (Scope, Phase 2, Modulgrenzen, Tag-Set, Preferences, MealCam, Coach, Snapshots)
- `INDEX.md` — Navigations-Übersicht und Open Items #1/#2
- `SPEC_01_MODULE_CONTRACT.md` — Modul-Verträge, Inputs/Outputs, Coach-Permissions, API-Übersicht
- `SPEC_02_PASS2_ENTITIES.md` — Pass-2 Entity-Definitionen (NutrientReferenceValue, FoodPortion, MealCamScan, NutritionPreferences, CoachNutritionSuggestion etc.)
- `SPEC_06_DATABASE_SCHEMA.md` — Master DDL inkl. Auto-Tagging-Trigger und V1-Korrektur-Block
- `SPEC_06_V1_MIGRATION.sql` — V1-Migrations-Patch mit allen Pass-1/2-Korrekturen, neuen Tabellen und RLS-Policies
- `SPEC_06_RECALCULATE_PATCH.md` — Snapshot/Recalculate API + Audit-Modell + `food_source` vs. `data_source` Klärung
- `SPEC_07_PASS2_PATCH.md` — Pass-2 API-Ergänzungen (Portions, MealCam V1 5-Schritt-Flow, Preferences Onboarding/Settings, Coach Suggestions, Micronutrients, Reference-Values-Endpoint)
- `SPEC_10_PASS2_PATCH.md` — Pass-2 Component-Ergänzungen (PortionSelector, MealCam-Components, Onboarding-Components, Coach-Suggestion-Components, Micronutrient-Erweiterungen, Thai-Verhalten)

Out-of-Scope für diesen Plan (nicht gelesen, da nicht in Auftrag): `OPUS_REVIEW_NUTRITION_01..03`, andere Pass-1-Patches, ADRs einzeln, `SPEC_03/04/05/08/09/10` (Master), `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md`. Inhalte dieser Dateien sind über `OPUS_REVIEW_NUTRITION_V1_FINAL.md` indirekt enthalten.

---

*Ende NUTRITION_WORKORDER_PLAN_V1.md*
