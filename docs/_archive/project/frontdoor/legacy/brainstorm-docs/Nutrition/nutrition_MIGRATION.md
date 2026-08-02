# Nutrition Module — Migration & Legacy Docs

## Konsolidierung der alten Dokumentation

Dieses Dokument fasst die vorherige Dokumentation aus `docs/nutrition-module/` zusammen und dokumentiert den Migrations-Verlauf.

---

## Alte Dokumentation: `docs/nutrition-module/TODO.md`

### Status: ~95% Sprint 1 Done

**Erledigte Features (Phase 1):**

1. ✅ Food Search — BLS 7140 Foods, nutrients_full JSONB, 98 BLS Nährstoffe
2. ✅ Food Log — CRUD Meals, Meal Items, Meal Types
3. ✅ Macro Dashboard — SVG Rings, Targets, Remaining Bar
4. ✅ Micro Dashboard — 107 Nährstoffe, 7 Gruppen, Traffic Light, RDA
5. ✅ Micronutrient Detail Cards — 42+ Nährstoffe, 3 Sprachen, Symptome
6. ✅ Water Tracking — Daily Log, Goal Progress
7. ✅ Weight Tracking — Daily Log, BMI, Sparkline Trend
8. ✅ TDEE Calculator — Mifflin-St Jeor, 5 Activity Levels, 4 Goals
9. ✅ Recipe System — CRUD, Meal-to-Recipe, Per-Serving Macros
10. ✅ Quick-Add Macros — Direkte Makro-Eingabe, Auto-Calculates kcal
11. ✅ Smart Suggestions — Wie gestern, Favorites, Recent, One-Click
12. ✅ Streak System — Current/Longest, Badges, Motivational
13. ✅ Nutrient Heatmap — 28-Day Grid auf Dashboard
14. ✅ Copy Yesterday's Meals
15. ✅ Enhanced Search — Category Filters, Sort-By, Favorites
16. ✅ Food Favorites — DB + API + ⭐
17. ✅ Custom Foods — Form + API + Search UNION
18. ✅ Portions System — DB + API
19. ✅ Meal Plans — Ghost Entries, Confirm/Skip/Adjust
20. ✅ Settings — Meal Schedule, Preferences
21. ✅ Morning Quick Entry — Weight + Water auf Home
22. ✅ Day Summary — Evening Review, Compliance %
23. ✅ Deficit Suggestions — Macro-Deficit-based Food Search
24. ✅ Trends — 7d/14d/30d Period Views, Ø Werte
25. ✅ Macros Detail Tab — Parent/Child Hierarchie Fats/Carbs/Protein
26. ✅ Cross-Module Connectors — Nutrition Score → Dashboard, Recovery
27. ✅ Rules Engine — 8 Regeln, Alerts, Safety Order
28. ✅ MealCam — Camera/File Upload, AI Detection (Mock)
29. ✅ i18n — 400+ Keys DE/EN/TH
30. ✅ Seed Data — 41 Tage, 13 Foods, 144 Meals, 185 Items
31. ✅ All API Endpoints wired to Postgres (0 Zustand Imports)

### Offene Items (Phase 2)

| Item | Beschreibung | Quelle |
|------|-------------|--------|
| MealCam Real | Claude Vision API statt Mock | TODO.md |
| Barcode Scanner | Deferred | TODO.md |
| Menu Plan per Coach | Coach erstellt Pläne für User | Tom Feedback |
| Menu Plan Confirmation | User bestätigt Plan bei jedem Essen | Tom Feedback |
| Food DB Expansion | BLS 4.0 + 5 EU DBs | Research |
| AI Coach Nutrition Advice | Coach-basierte Empfehlungen | TODO.md |
| Wallet/Monetization | Integration | TODO.md |

### Known Bugs

| Bug | Beschreibung | Wo |
|-----|-------------|-----|
| Custom Foods 500 | `:id` Parameter fängt "custom" als UUID | `routes/foods.ts` |
| Micro-Dashboard 0-values | Liest meal_items Spalten statt nutrients_full JSONB | `MicroDashboard.tsx` |

---

## SQL Migrations-Verlauf

### Core Nutrition Migrations

| Nr | Datei | Beschreibung |
|----|-------|-------------|
| 001 | `001_create_foods_table.sql` | Foods Tabelle (BLS 4.0), pg_trgm Extension, Indexes |
| 002 | `002_create_nutrition_tables.sql` | foods_portions, foods_custom, meals, meal_items, nutrition_targets, nutrition_micro_flags, water_logs, weight_logs, daily_nutrition_summary View |
| 004 | `004_create_recipes_tables.sql` | recipes, recipe_items, food_favorites |
| 005 | `005_add_nutrients_full.sql` | nutrients_full JSONB Spalte + GIN Index |
| 006 | `006_portions_custom_foods_mealplans.sql` | Portions erweitert, Custom Foods erweitert, meal_plans + meal_plan_days + meal_plan_items, Allergen-Flags |
| 007 | `007_user_settings.sql` | user_settings Key-Value Store + Seed Data |
| 017 | `017_nutrition_goals.sql` | user_nutrition_goals, macro_cycling_configs, refeed_schedules, auto_adjust_rules, tdee_history |
| 021 | `021_food_preferences.sql` | user_food_preferences |
| 042 | `042_fix_numeric_precision.sql` | Numeric Precision Fixes |
| 071 | `071_nutrition_schema_split.sql` | Move Tables public → nutrition Schema |
| 072 | `072_nutrition_schema_access.sql` | Schema Access Grants |
| 073 | `073_nutrition_schema_rollback.sql` | Rollback Script |

### Timestamped Migrations

| Datei | Beschreibung |
|-------|-------------|
| `20250322030003_nutrition_schema_split.sql` | Schema Split (Duplicate) |
| `20250322030004_nutrition_schema_access.sql` | Schema Access (Duplicate) |
| `20250322030005_nutrition_schema_rollback.sql` | Rollback (Duplicate) |
| `20260319_1530_nutrition_settings_consolidation.sql` | Settings Consolidation |
| `20260320_1600_food_preferences_columns.sql` | Food Preferences Column Updates |
| `20260322_smart_search_indexes.sql` | Smart Search Indexes |

### Tangential Migrations (referenzieren Nutrition)

| Datei | Beschreibung |
|-------|-------------|
| `008_supplements.sql` | Supplements (separate Modul, referenziert Nutrition) |
| `010_create_recovery_tables.sql` | Recovery (Cross-Module) |
| `012_create_coach_tables.sql` | Coach System (Nutrition Coaching) |
| `049_local_first_architecture.sql` | Local-First Sync |
| `051_tier_permissions.sql` | Tier-basierte Feature-Gates |
| `063_user_programs.sql` | User Programs (inkl. Nutrition) |

---

## Schema Evolution

### Phase 1: Public Schema (Migrations 001-042)
Alle Tabellen in `public` Schema. Direkte Queries auf `public.foods`, `public.meals`, etc.

### Phase 2: Nutrition Schema (Migration 071)
Tabellen verschoben nach `nutrition.*`. Backward-Compat Views in `public.*`.
API `search_path` auf `nutrition,public` gesetzt.

### Phase 3: Smart Search (Migration 20260322)
Zusätzliche Indexes für Preference-aware Search:
- Trigram-Index auf `foods.name_de`
- GIN-Index auf `allergens`
- Composite Indexes für Performance

---

## Buddy AI Integration

**Datei:** `docs/buddy/engines/nutrition-engine.md`

Das Buddy AI System hat einen dedizierten **Nutrition Engine** der:
- Daily Calories + Makros aggregiert
- Macro/Micro-Defizite erkennt
- Timing-Optimierung vorschlägt
- Meal/Supplement Recommendations generiert
- Compliance vs Targets trackt

**API Endpoint:** `GET /api/nutrition/for-ai` — Kompakter Context für Buddy.

---

## Architektur-Entscheidungen

### Warum Hono statt Express?
- Kleinerer Footprint
- Bessere TypeScript Integration
- Edge-kompatibel
- Middleware-Chains (CORS, Auth, Error Handler)

### Warum nutrients_full JSONB?
- BLS 4.0 hat 98 Nährstoffe — nicht alle als Spalten sinnvoll
- JSONB erlaubt flexible Queries
- GIN-Index für Performance
- Spalten für die wichtigsten 46 Nährstoffe bleiben für schnelle Aggregation

### Warum separates Schema?
- Domain-Isolation
- Klare Ownership
- Zukunftssichere Multi-Schema Architektur
- Backward-Compat via Views

### Warum In-Memory Store + Postgres?
- `store.ts` existiert als Fallback/Cache für BLS Foods
- Primärer Datenspeicher ist Postgres
- Alle API Routes greifen direkt auf DB zu (0 Zustand Imports serverseitig)
