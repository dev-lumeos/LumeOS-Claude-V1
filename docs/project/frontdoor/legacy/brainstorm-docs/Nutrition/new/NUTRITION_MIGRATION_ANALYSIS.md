# Nutrition Module — Legacy Analyse & Migrationsplan

> **Quellen (nur diese, keine Annahmen):**
> - Legacy Code: `D:\GitHub\LumeOSmacmini\src\modules\nutrition\`
> - Legacy Contracts: `D:\GitHub\LumeOSmacmini\packages\contracts\src\nutrition\`
> - Legacy SQL: `D:\GitHub\LumeOSmacmini\supabase\migrations\*`
> - Ziel-Specs: `D:\GitHub\jarvis-ui\docs\LumeOS\Nutrition\new\spec\`
>
> **Confidence Legend:**
> `H` = direkt aus SQL-DDL · `M` = aus Code/Contract · `L` = nur aus Doku · `U` = UNKNOWN (nicht verifiziert)

---

## 1. LEGACY DB STRUCTURE

### 1.1 Schema-Organisation (H)

Anfangs alle Nutrition-Tabellen in `public.*`.
Migration `071_nutrition_schema_split.sql` verschiebt sie nach `nutrition.*` und legt in `public` Compat-Views an.
Es existiert ein Duplikat derselben Migration unter `20250322030003_nutrition_schema_split.sql` — **Konfliktrisiko beim Re-Run** (siehe §5).

### 1.2 Tatsächliche Tabellen (H, aus DDL)

| Tabelle | Herkunft | Zweck | Zeilen pro User |
|---|---|---|---|
| `foods` | `001` | BLS 4.0 Core-DB, Stammdaten | 0 (global) |
| `foods_portions` | `002`,`006` | Portionsgrößen pro Food | 0 (global) |
| `foods_custom` | `002`,`006` | User-Foods, polymorph | n |
| `meals` | `002` | Mahlzeit-Container | n |
| `meal_items` | `002` | Einträge mit eingefrorenen Nährstoffen | n |
| `nutrition_targets` | `002` | **CURRENT** Targets, `UNIQUE(user_id)` | **genau 1** |
| `nutrition_micro_flags` | `002` | Mikro-Warnungen per Tag | n |
| `water_logs` | `002` | Wasseraufnahme | n |
| `weight_logs` | `002` | Gewicht | n |
| `recipes` | `004` | Rezepte | n |
| `recipe_items` | `004` | Zutaten | n |
| `food_favorites` | `004` | Favoriten `(user_id, food_id)` PK | n |
| `meal_plans` | `006` | Meal Plan Header | n |
| `meal_plan_days` | `006` | Tage im Plan | n |
| `meal_plan_items` | `006` | Items pro Plantag | n |
| `user_nutrition_goals` | `017` | **Paralleles Target-System** mit TDEE | n (kein UNIQUE) |
| `macro_cycling_configs` | `017` | Training/Rest Day Makros | 1 pro Goal |
| `refeed_schedules` | `017` | Refeed-Planung | 1 pro Goal |
| `auto_adjust_rules` | `017` | Adaptive TDEE | 1 pro Goal |
| `tdee_history` | `017` | TDEE-Verlauf `UNIQUE(user_id, date)` | n |
| `user_food_preferences` | `021`,`20260319`,`20260320` | Diät, Allergien, Likes | 1 pro User |
| `user_settings` | `007` | Key-Value JSONB | n |
| `daily_nutrition_summary` | `002` | **VIEW, keine Tabelle** | — |

**Kritisch:** `daily_nutrition_aggregates` wird in `071` als *"Tabelle wenn existiert"* behandelt — im SQL-Output aus `002` ist es aber nur ein **VIEW**. Es gibt keinen DDL, der es zur Tabelle macht. Confidence `H` → **in dieser Repo-Version ist es definitiv ein VIEW**.

### 1.3 `foods` — Tabelle (`001` + `005` + `006`) (H)

Primary Keys und relevante Felder:

```
id UUID PK
bls_code TEXT UNIQUE NOT NULL
name_de TEXT NOT NULL, name_en TEXT
category TEXT NOT NULL, category_code TEXT NOT NULL
source TEXT DEFAULT 'bls_4.0'
confidence NUMERIC(3,2) DEFAULT 1.0
is_verified BOOLEAN DEFAULT true

-- Direkte Nährstoff-Spalten (46 Stück)
kcal, kj, protein_g, fat_g, carbs_g, sugar_g, fiber_g, salt_g,
water_g, alcohol_g, fat_mono_g, fat_poly_g, fat_sat_g,
cholesterol_mg, calcium_mg, iron_mg, magnesium_mg, phosphorus_mg,
potassium_mg, sodium_mg, zinc_mg, copper_mg, manganese_mg,
selenium_ug, iodine_ug,
vitamin_a_ug, vitamin_d_ug, vitamin_e_mg, vitamin_k_ug, vitamin_c_mg,
thiamin_mg, riboflavin_mg, niacin_mg, vitamin_b6_mg, folate_ug,
vitamin_b12_ug, pantothenic_acid_mg, biotin_ug

-- Zusatz aus 005 + 006
nutrients_full JSONB DEFAULT '{}'  -- für 98 weitere BLS-Nährstoffe
allergens TEXT[] DEFAULT '{}'

created_at/updated_at TIMESTAMPTZ
```

**Indexes (H):** `btree(bls_code)`, `btree(category)`, `btree(category_code)`, `gin(name_de gin_trgm_ops)`, `gin(nutrients_full)`, `gin(allergens)`, `btree(LOWER(name_de))`, `btree(LOWER(name_en))`, Composite `(category, LOWER(name_de))`, `btree(carbs_g) WHERE NOT NULL`.

**RLS (H):** SELECT für alle `authenticated`.

**Trigger (H):** `update_foods_updated_at` (vor UPDATE).

### 1.4 `meal_items` — Snapshot-Tabelle (H)

Polymorphe Food-Referenz über `food_source`-Diskriminator, **kein FK auf `foods` oder `foods_custom`**:

```
id UUID PK
meal_id UUID FK → meals ON DELETE CASCADE
food_id UUID                              -- kein FK!
food_source TEXT CHECK IN ('bls','custom','openfoodfacts','mealcam')
food_name TEXT NOT NULL                   -- denormalisiert
amount_g NUMERIC(8,2) NOT NULL

-- 34 direkte Snapshot-Spalten: alle Makros + Tier-1/2 Mikros
kcal, protein_g, fat_g, carbs_g, sugar_g, fiber_g, salt_g,
vitamin_a/d/e/k/c, thiamin, riboflavin, niacin, vitamin_b6,
folate, vitamin_b12, pantothenic_acid, biotin,
calcium, iron, magnesium, phosphorus, potassium, sodium, zinc,
copper, manganese, selenium, iodine, cholesterol,
fat_sat, fat_mono, fat_poly
```

**Berechnungslogik (M, aus Contract-Kommentar `meal.ts:135`):**
`kcal = food.kcal * amount_g / 100` — gilt analog für alle 34 Spalten.
Kein Code gefunden, der das tatsächlich schreibt → siehe §5.

### 1.5 `daily_nutrition_summary` — VIEW (H)

Definiert in `002`:

```sql
SELECT m.user_id, m.date,
  COUNT(DISTINCT m.id) AS meal_count,
  SUM(mi.kcal) AS total_kcal, ...
  (SELECT SUM(wl.amount_ml) FROM water_logs wl
   WHERE wl.user_id = m.user_id AND wl.date = m.date) AS total_water_ml
FROM meals m
LEFT JOIN meal_items mi ON mi.meal_id = m.id
GROUP BY m.user_id, m.date;
```

Kein `score`, kein `target_*`, keine Flag-Counts — obwohl der Contract `DailyNutritionAggregate` all das deklariert. → **Contract lügt**, siehe §5.

### 1.6 `nutrition_targets` vs `user_nutrition_goals` — doppelte Wahrheit (H)

Beide existieren parallel. Keine Foreign Keys zwischen ihnen. Unklar welche von welchem UI benutzt wird (Code-Search nicht durchgeführt — gäbe es ein Semantic-Search-Tool wäre das hier angebracht).

| Aspekt | `nutrition_targets` | `user_nutrition_goals` |
|---|---|---|
| Kardinalität | `UNIQUE(user_id)` → 1 aktiv | `is_active BOOLEAN`, kein UNIQUE → mehrere möglich |
| Scope | Kalorien, Makros, 7 Mikro-Defaults (RDA hardcoded) | TDEE, advanced goal types, macro_cycling, refeed, auto_adjust |
| Zeitachse | stateless — kein Datum | `started_at`, `max_duration_weeks`, `is_active` |
| Historie | keine | `tdee_history` separat |
| User-Profil-Snapshot | nein | ja (`current_weight_kg`, `height_cm`, `age`, `gender`, …) |

**Implikation:** Für historische Analyse („was waren meine Targets als ich X kg wog?") liefert die Legacy **keine saubere Antwort**. `nutrition_targets` überschreibt, `user_nutrition_goals` speichert Snapshot nur zum Start eines Goals.

### 1.7 `water_logs`, `weight_logs` — „date-only" (H)

Beide haben `date DATE NOT NULL`, aber **keine `time`-Spalte** — nur `created_at TIMESTAMPTZ`. Contracts behaupten `time HH:MM` → Contract weicht erneut vom Schema ab.

### 1.8 Client-seitige DB-Zugriffe (M)

Der `src/modules/nutrition/`-Layer spricht **nicht direkt** mit Supabase. Alle `queries/*.ts` rufen `nutritionApi(url)` — ein generisches HTTP-Fetch gegen ein Backend unter `../../apps/app/shared/lib/api-shim`. Gemappte REST-Endpoints (aus URL-Patterns in `queries/`):

```
GET    /foods/search?q=…&limit&offset&category&minConfidence&attributes
GET    /foods/{id}
GET    /meals?userId&date
POST   /meals                      (erstellt Meal, kein MealItem!)
PATCH  /meals/{id}
DELETE /meals/{id}
GET    /meals/{id}/items
POST   /meals/{id}/items           (body: foodId, amountG)
PATCH  /meal-items/{id}            (body: amountG)
DELETE /meal-items/{id}
GET    /summary/daily?userId&date
GET    /summary/score              -- UNKNOWN wie berechnet, DB hat kein Score-Feld
GET    /summary/alerts
GET    /summary/trends?startDate&endDate
GET    /targets?userId
GET    /targets/active
POST   /targets
PATCH  /targets/{id}
POST   /targets/{id}/activate      -- UNKNOWN, DB hat kein is_active in nutrition_targets
DELETE /targets/{id}
GET    /water, POST /water, DELETE /water/{id}
GET    /water/aggregate
GET    /weight, POST /weight, PATCH/DELETE /weight/{id}
GET    /weight/latest
```

Der alternative `src/modules/nutrition/api/`-Layer (Hono + `mealsStorage: MealEntry[]`) ist **In-Memory Mock** und nicht produktiv (H, aus `handlers.ts:15-16`).

### 1.9 `.backup` / `.bak` / `.bak2` Sprawl (H)

Fast jede Datei in `components/`, `queries/`, `hooks/` hat bis zu 3 Backup-Kopien. Das ist **keine Git-Praxis**, das sind Filesystem-Snapshots. Für die Migration: irrelevant, aber verrät erhebliche Refactor-Aktivität ohne Versionierung → **Historie ist verloren** für die Frage „warum wurde das so gebaut".

### 1.10 Hardcoded Dev-User (H, kritisch)

In `004`, `006`, `017` und `021`:

```sql
DEFAULT '00000000-0000-0000-0000-000000000001'
-- RLS Policy: USING (user_id = '00000000-0000-0000-0000-000000000001')
```

**Das ist nicht nur ein Dev-Shortcut — die RLS-Policies hängen hardcoded am Dev-User.** Produktiv müsste `auth.uid()` stehen. Siehe §5 Risk R-03.
`021_food_preferences.sql` verwendet sogar `USING (true)` → **RLS effektiv deaktiviert.**

### 1.11 Fehlende Elemente in Legacy (H, relevant für Mapping)

Folgendes ist in der neuen Spec spezifiziert, existiert aber **nicht** in den Legacy-Migrations:

- `nutrient_defs` Tabelle (die 138 BLS-Codes als Stammdaten)
- `food_categories` Tabelle (Kategorie-Baum, 4 Ebenen)
- `food_nutrients` EAV-Tabelle
- `food_aliases` Tabelle (Such-Synonyme)
- `food_preference_items` (strukturierte Likes/Dislikes)
- `meal_plan_logs` (Ausführungsprotokoll für Compliance)
- `shopping_lists` + `shopping_list_items`
- `tag_definitions` + `food_tags` — **UNKNOWN**: in DATABASE.md wird Migration `20260331000004_food_semantic_tags.sql` referenziert, diese ist in meinem File-Scan **nicht aufgetaucht**. Entweder nicht committet oder nachträglich gelöscht. → Behandle als FEHLEND in Legacy. (Siehe §5 R-04)

Legacy hat `foods.allergens TEXT[]` + `foods_custom.allergens TEXT[]` als einfache Array-Lösung — das ist der **Ersatz** für das neue Tag-System, aber nicht äquivalent.

---

## 2. RECONSTRUCTED DATA MODEL

### 2.1 Logisches Modell (Confidence: H für Kanten direkt aus FKs, M für polymorphe Referenzen)

```
                 ┌─────────────┐
                 │   foods     │◄──────────────────────┐
                 │ (BLS 4.0)   │                        │
                 └──┬──┬──┬────┘                        │
                    │  │  │                             │
                    │  │  └─────► foods_portions        │
                    │  │                                │
                    │  └──── food_favorites (n:m) ──────┤
                    │                                    │
                    │         ┌──────────────┐          │
                    │         │ foods_custom │          │
                    │         │  (per user)  │          │
                    │         └──────┬───────┘          │
                    │                │                   │
                    │    polymorph   │                   │
                    │   (food_source)│                   │
                    ▼                ▼                   │
              ┌───────────────────────┐                  │
              │     meal_items        │                  │
              │ (SNAPSHOT 34 nutrs)   │                  │
              └───────────┬───────────┘                  │
                          │ CASCADE                      │
                          ▼                              │
                    ┌──────────┐                         │
                    │  meals   │◄── nutrition.daily_summary (VIEW)
                    └──────────┘         │              ▲
                                         │              │
                                         ▼              │
                                  water_logs ───────────┘
                                  weight_logs (standalone)

                 TARGETS — zwei parallele Systeme
                 ┌─────────────────────┐   ┌──────────────────────────┐
                 │ nutrition_targets   │   │ user_nutrition_goals     │
                 │ UNIQUE(user_id)     │   │ + macro_cycling_configs  │
                 │ (current only)      │   │ + refeed_schedules       │
                 └─────────────────────┘   │ + auto_adjust_rules      │
                                           │ + tdee_history           │
                                           └──────────────────────────┘
                                                      │
                                                      ▼
                                             nutrition_micro_flags
                                             (pro Tag, per Nutrient)

                 RECIPES + MEAL PLANS
                 recipes ──< recipe_items ──► foods
                 meal_plans ──< meal_plan_days ──< meal_plan_items
                                                     ├─► foods
                                                     ├─► foods_custom
                                                     └─► recipes

                 PREFERENCES
                 user_food_preferences (single row per user, JSONB for likes)
                 user_settings (key/value JSONB)
```

### 2.2 Entity-Regeln aus Code-Evidence

| Regel | Evidenz | Confidence |
|---|---|---|
| Ein User hat max. 1 `nutrition_targets` | `UNIQUE(user_id)` in `002` | H |
| Ein User kann mehrere `user_nutrition_goals` haben, `is_active` nicht eindeutig | kein UNIQUE-Constraint | H |
| `meal_items` referenzieren Foods **ohne FK** — Löschen eines Foods bricht keine Items | polymorph via `food_source`, Kommentar `002:89` | H |
| Nährstoffe in `meal_items` sind **Snapshots** (berechnet aus `food.nutrient * amount/100`) | Contract `meal.ts:135`, keine Trigger/Funktion im SQL | M (Code nicht gefunden) |
| `daily_nutrition_summary` ist **live** (VIEW, kein Cache) | `002` DDL | H |
| `food_favorites` PK ist `(user_id, food_id)` — 1-Per-Paar | `004` DDL | H |
| `recipes.total_*`-Spalten vorhanden in Spec, **fehlen in SQL-Legacy** | `004` hat nur `recipe_items.calories_kcal` etc. | H |
| `recipe_items` hat **kein Nährstoff-Trigger** in Legacy | in `004` kein `CREATE TRIGGER` | H |
| Allergene als `TEXT[]` statt strukturiert | `006`: `ALTER TABLE foods ADD allergens TEXT[]` | H |
| Semantic Tags | **UNKNOWN ob live** — DATABASE.md referenziert Migration, die nicht im Repo ist | U |

### 2.3 Datenflüsse (aus API-URLs + Contract-Schemas, M)

**Food-Logging Path:**
```
Client Search → GET /foods/search → Meilisearch-artige params (attributesToSearchOn)
                                     → UNKNOWN welches Backend;
                                       direkte Spalten + gin_trgm auf name_de vorhanden
POST /meals { mealType, date, name }
  → creates meals row
POST /meals/{id}/items { foodId, amountG }
  → server MUSS calculate: 34 Nutrient-Spalten × (amountG/100)
  → NICHT im Legacy-SQL verifiziert wo das passiert
```

**Daily Summary Path:**
```
GET /summary/daily
  → backend query against daily_nutrition_summary VIEW
  → VIEW live-aggregiert jede Anfrage (O(meals × meal_items) pro User-Tag)
GET /summary/score
  → UNKNOWN wie berechnet. DB hat keine Score-Spalte.
  → packages/rules-engine wird in useSummaryQuery.ts importiert → M: wahrscheinlich
    backend-side pure function
```

### 2.4 Implizites Modell vs. Contract-Behauptungen (Diskrepanzen, H)

| Contract behauptet | SQL-Realität | Bewertung |
|---|---|---|
| `Meal.total_kcal`, `total_protein_g` … | `meals` hat nur `notes` | **Drop** beim Mapping |
| `Meal.time HH:MM` | `meals` hat kein `time`-Feld | **Drop** |
| `Meal.photo_url, is_mealcam, mealcam_scan_id` | nicht in `meals` DDL | **Drop** |
| `MealItem.portion_id`, `sort_order`, `notes` | fehlen in `meal_items` | **Drop** |
| `MealItem.food_custom_id` | nein: stattdessen polymorph `food_id` + `food_source` | **Transform** |
| `NutritionTarget.is_active, user_level, name` | `is_active` fehlt, `user_level` vorhanden, `name` fehlt | **Partial Drop** |
| `NutritionTarget.start/end_date` | nicht in `002`, nicht in späteren Migrations | **Drop** |
| `DailyNutritionAggregate` als Tabelle mit Score/Flags | nur VIEW ohne Score | **Neu aufbauen** |
| `WaterLog.time`, `WeightLog.time`, `photo_url`, `muscle_mass_kg` | nur `date` + `created_at` | **Drop** |
| `WeightLog.updated_at` | nein: nur `created_at` | **Drop** |

---

## 3. FIELD MAPPING TABLE

Format: `Legacy → Neu`. Actions: `KEEP` (1:1), `RENAME`, `TRANSFORM` (mit Regel), `SPLIT` (in mehrere), `DROP`, `NEW` (kein Legacy-Äquivalent).

### 3.1 Foods → nutrition.foods (+ nutrition.food_nutrients)

| Legacy `public.foods` / `nutrition.foods` | Neu `nutrition.foods` | Action | Regel |
|---|---|---|---|
| `id` | `id` | KEEP | UUID unverändert |
| `bls_code` | `bls_code` | KEEP | — |
| `name_de` | `name_de` | KEEP | — |
| `name_en` | `name_en` | KEEP | — |
| — | `name_display` | NEW | generieren beim Import (user-friendly) |
| — | `name_display_en` | NEW | generieren |
| `category` + `category_code` (TEXT) | `category_id` (UUID FK) | TRANSFORM | BLS-Code erste Stellen → `food_categories` Baum lookup |
| — | `sort_weight` (0–1000) | NEW | Import-Heuristik |
| — | `processing_level` | NEW | Default `'raw'`; aus `category_code` oder Name ableiten (LOW confidence) |
| — | `is_prepared_dish` | NEW | true für Category X/Y |
| `kcal` | `enercc` | RENAME | — |
| `kj` | `enercj` | RENAME | — |
| `water_g` | `water_g` | KEEP | — |
| `protein_g` | `prot625` | RENAME | — |
| `fat_g` | `fat` | RENAME | — |
| `carbs_g` | `cho` | RENAME | — |
| `sugar_g` | `sugar` | RENAME | — |
| `fiber_g` | `fibt` | RENAME | — |
| `salt_g` | `nacl` | RENAME | — |
| `alcohol_g` | `alc` | RENAME | — |
| `fat_sat_g` | `fasat` | RENAME | — |
| `fat_mono_g`, `fat_poly_g`, `cholesterol_mg`, und **alle 34 Mikronährstoff-Spalten** | → `food_nutrients` EAV | SPLIT | für jedes non-null Feld: 1 Row `(food_id, nutrient_code=<BLS-Code>, value)`. Mapping-Tabelle siehe §3.1a |
| `nutrients_full` JSONB | → `food_nutrients` EAV | SPLIT | JSON-Key = BLS-Code; jeden Entry als eigene Row |
| `source` (TEXT) | — | DROP | in Neu gibt's keinen `source` auf foods — BLS ist einzige Quelle |
| `confidence` (NUMERIC) | — | DROP | Replaced by `food_nutrients.data_source` per Nutrient |
| `is_verified` BOOLEAN | — | DROP | BLS ist per Definition verified |
| `allergens` TEXT[] | → `food_tags` (tag_code='allergen_*') | TRANSFORM | siehe §3.1b |
| `created_at`, `updated_at` | `created_at`, `updated_at` | KEEP | — |

#### 3.1a Column→BLS-Code Mapping für EAV-Split (H, aus SPEC_06 nutrient_defs)

| Legacy Column | nutrient_code | Neu Unit |
|---|---|---|
| `kcal` | `ENERCC` | kcal |
| `kj` | `ENERCJ` | kJ |
| `protein_g` | `PROT625` | g |
| `fat_g` | `FAT` | g |
| `carbs_g` | `CHO` | g |
| `fiber_g` | `FIBT` | g |
| `sugar_g` | `SUGAR` | g |
| `fat_sat_g` | `FASAT` | g |
| `fat_mono_g` | `FAMS` | g |
| `fat_poly_g` | `FAPU` | g |
| `salt_g` | `NACL` | g |
| `water_g` | `WATER` | g |
| `alcohol_g` | `ALC` | g |
| `cholesterol_mg` | `CHORL` | mg |
| `calcium_mg` | `CA` | mg |
| `iron_mg` | `FE` | mg |
| `magnesium_mg` | `MG` | mg |
| `phosphorus_mg` | `P` | mg |
| `potassium_mg` | `K` | mg |
| `sodium_mg` | `NA` | mg |
| `zinc_mg` | `ZN` | mg |
| `copper_mg` | `CU` | µg (⚠ Unit-Change mg→µg, ×1000) |
| `manganese_mg` | `MN` | µg (⚠ ×1000) |
| `selenium_ug` | — (nicht im nutrient_defs) | U |
| `iodine_ug` | `ID` | µg |
| `vitamin_a_ug` | `VITA` | µg |
| `vitamin_d_ug` | `VITD` | µg |
| `vitamin_e_mg` | `VITE` | mg |
| `vitamin_k_ug` | `VITK` | µg |
| `vitamin_c_mg` | `VITC` | mg |
| `thiamin_mg` | `THIA` | mg |
| `riboflavin_mg` | `RIBF` | mg |
| `niacin_mg` | `NIA` | mg |
| `vitamin_b6_mg` | `VITB6` | **µg** (⚠ Unit-Change mg→µg, ×1000) |
| `folate_ug` | `FOL` | µg |
| `vitamin_b12_ug` | `VITB12` | µg |
| `pantothenic_acid_mg` | `PANTAC` | mg |
| `biotin_ug` | `BIOT` | µg |

**⚠ Unit-Inkonsistenzen (H, aus SPEC_06 DDL-Vergleich):**
- `copper_mg` → `CU` (`µg`): **×1000 beim Migrieren**
- `manganese_mg` → `MN` (`µg`): **×1000 beim Migrieren**
- `vitamin_b6_mg` → `VITB6` (`µg`): **×1000 beim Migrieren**
- `selenium_ug` → **UNKNOWN** — nicht in nutrient_defs-Seed sichtbar (weder in Tier1/2/3-Listing noch in RDA-Updates). Entweder zu ergänzen in SPEC_06 oder Daten droppen. → **§5 R-10**

#### 3.1b `foods.allergens` TEXT[] → `food_tags` (TRANSFORM)

Neue Seite hat Allergen-Tags als `tag_code = 'allergen_*'`. Mapping pro Array-Element:

| Legacy Allergen-String | `food_tags.tag_code` |
|---|---|
| `gluten` | `allergen_gluten` |
| `dairy` | `allergen_milk` |
| `eggs` | `allergen_eggs` |
| `nuts` | `allergen_nuts` |
| `peanuts` | `allergen_peanuts` |
| `soy` | `allergen_soy` |
| `fish` | `allergen_fish` |
| `shellfish` | `allergen_crustaceans` |
| `sesame` | U — **nicht in neuem Tag-Vokabular dokumentiert** |
| `celery`, `mustard`, `sulfites`, `lupin`, `molluscs` | U — SPEC_06 allergen-Tags nicht vollständig gelistet |

Confidence: `1.0` (direkter User-/Import-Input).

### 3.2 foods_portions (KEEP mit kleinen Additions)

| Legacy | Neu | Action |
|---|---|---|
| `id` | `id` | KEEP |
| `food_id` | `food_id` | KEEP (FK bleibt) |
| `name_de` | `name_de` | KEEP |
| `name_en` | `name_en` | KEEP |
| `name_th` (aus `006`) | `name_th` | KEEP |
| `amount_g` | `amount_g` | KEEP |
| `is_default` | `is_default` | KEEP |
| `sort_order` | `sort_order` | KEEP |
| — | — | **UNKNOWN**: `foods_portions` ist in SPEC_02 nicht explizit aufgeführt. Nur `serving_size_g` / `serving_name` in `foods_custom`. → **§5 R-05** |

### 3.3 foods_custom (H)

| Legacy | Neu `foods_custom` | Action |
|---|---|---|
| `id`, `user_id` | `id`, `user_id` | KEEP |
| `name_de`, `name_en` | `name_de`, `name_en` | KEEP |
| — | `name_th` | NEW (NULL-able, aus SPEC-Korrektur §16) |
| `brand`, `barcode` | `brand`, `barcode` | KEEP |
| `serving_size_g`, `serving_name` (aus `006`) | `serving_size_g`, `serving_name` | KEEP |
| `source` TEXT | `source` CHECK(`'user'`,`'mealcam'`) | TRANSFORM: Rows mit `source='openfoodfacts'` → entweder `'user'` oder DROP (§16 entfernt den Wert). Confidence: `L` — SPEC sagt entfernen, Legacy-Daten können welche haben. |
| `confidence` | — | DROP |
| `is_verified` | — | DROP |
| `allergens` TEXT[] | — | DROP (foods_custom in Neu hat keine allergens — nur `foods` hat tags. Inkonsistenz: User-Allergien stecken in `food_preferences.allergies`) |
| `kcal` | `enercc` | RENAME |
| `protein_g, fat_g, carbs_g, sugar_g, fiber_g, salt_g` | `prot625, fat, cho, sugar, fibt, nacl` | RENAME |
| `fat_sat_g (fehlt in Legacy-DDL Seed!)` | `fasat` | **UNKNOWN**: `002` seed von foods_custom hat `sugar_g, fiber_g, salt_g`, aber `fat_sat_g` nicht gelistet. → §5 R-06 |
| Alle Mikros in foods_custom: `vitamin_a_ug, vitamin_c_mg, vitamin_d_ug, calcium_mg, iron_mg, magnesium_mg, potassium_mg, sodium_mg, zinc_mg` | `vita_ug, vitc_mg, vitd_ug, ca_mg, fe_mg, mg_mg, k_mg, na_mg, zn_mg` | RENAME |
| (neue Mikros) `vite_mg, vitk_ug, thia_mg, ribf_mg, nia_mg, vitb6_ug, fol_ug, vitb12_ug, p_mg, id_ug, cu_ug, mn_ug` | dito | NEW (NULL) |

### 3.4 meals (H)

| Legacy | Neu | Action |
|---|---|---|
| `id, user_id, date, meal_type, notes` | identisch | KEEP |
| `created_at, updated_at` | identisch | KEEP |
| CHECK(`breakfast,lunch,dinner,snack`) | CHECK inkl. `pre_workout, post_workout, other` | TRANSFORM: Enum erweitern |

### 3.5 meal_items (CRITICAL — größte Transformation)

| Legacy | Neu | Action | Regel |
|---|---|---|---|
| `id, meal_id, amount_g, food_name` | identisch | KEEP | — |
| `food_id` (nullable), `food_source` | `food_id` + `custom_food_id` (nullable FK), `food_source` | TRANSFORM | `food_source='bls'` → `food_id` gesetzt, `custom_food_id=NULL` `food_source='custom'` → `custom_food_id` gesetzt (FK!), `food_id=NULL` `food_source='mealcam'|'openfoodfacts'` → **UNKNOWN** §16 dropt `openfoodfacts` |
| `kcal` | `enercc` | RENAME | Snapshot-Wert bleibt |
| `protein_g, fat_g, carbs_g, fiber_g, sugar_g, salt_g, fat_sat_g, water_g` | `prot625, fat, cho, fibt, sugar, nacl, fasat, water_g` | RENAME | — |
| **16 weitere Mikro-Spalten** (vitamin_a/d/e/k/c, thia, rib, nia, b6, fol, b12, pant, biot, Ca, Fe, Mg, P, K, Na, Zn, Cu, Mn, Se, I, cholesterol, fat_mono, fat_poly) | → `nutrients JSONB` | SPLIT | bei Migration: `nutrients = jsonb_build_object('VITA', vitamin_a_ug, 'VITD', vitamin_d_ug, ...)` Nur non-null packen. Unit-Conversions wie in §3.1a (copper, manganese, b6: ×1000) |
| `created_at` | `created_at` | KEEP | — |
| — | `updated_at` | **UNKNOWN** | Legacy-DDL `002` hat kein `updated_at` auf meal_items (nur created_at). Neue SPEC_06 DDL auch nicht → ok |

### 3.6 nutrition_targets (CRITICAL — Semantik ändert sich!)

| Legacy | Neu | Action | Regel |
|---|---|---|---|
| `id` | `id` | KEEP | — |
| `user_id` UNIQUE | `user_id` + `date` (combined UNIQUE) | **TRANSFORM fundamental** | Legacy ist Current-State → Neu ist **per-Tag-Snapshot**. Bei Migration: 1 Row pro Legacy-User für `date = CURRENT_DATE`. **Historische Tage sind verloren** (kein Backfill möglich). |
| `user_level` | — | **DROP** | Wandert nach Goals-Modul |
| `kcal_target` | `calorie_target` | RENAME | — |
| `protein_g_target, carbs_g_target, fat_g_target, fiber_g_target, water_ml_target` | `protein_target, carbs_target, fat_target, fiber_target, water_target` | RENAME | Unit bleibt (g bzw. ml implizit) |
| Alle `*_ug_target, *_mg_target` (Mikros) | — | **DROP** | Mikro-Targets leben nicht mehr in targets — werden aus RDA abgeleitet oder aus Goals gezogen |
| — | `goal_phase` | NEW | aus Goals; bei Migration: `'maintain'` als Default |
| — | `source` | NEW | Default `'fallback_calculated'` für migrierte Rows |
| — | `fetched_at` | NEW | = `updated_at` bei Migration |
| `created_at, updated_at` | — | DROP | `fetched_at` ersetzt |

### 3.7 user_nutrition_goals (CRITICAL — Modulgrenze)

**Laut SPEC_01 `user_nutrition_goals` gehört nicht mehr ins Nutrition-Modul, sondern ins Goals-Modul.**
→ Tabelle **wandert komplett** zu `goals.*` oder äquivalentem Schema.
→ Nutrition zieht Targets per API: `GET http://goals:5900/api/goals/targets/today`.

**Für die Migration:** `user_nutrition_goals`, `macro_cycling_configs`, `refeed_schedules`, `auto_adjust_rules`, `tdee_history` → **aus Nutrition-Scope exportieren**. Mapping auf Goals-Schema ist **NOT IN SCOPE** dieser Analyse (unbekanntes Goals-Schema).

### 3.8 weight_logs → Goals-Modul

SPEC_01 §5: „Weight Logs (Körpergewicht) → Goals". **Tabelle wandert aus Nutrition raus.** Analog §3.7.

### 3.9 water_logs (KEEP, minimal)

| Legacy | Neu | Action |
|---|---|---|
| `id, user_id, date, amount_ml, source, created_at` | identisch | KEEP |
| CHECK auf `source` | CHECK(`manual,quick_add`) | TRANSFORM: `'auto'` in Legacy → droppen oder als `'quick_add'` mappen (L) |

### 3.10 nutrition_micro_flags → micro_flags (RENAME + Column-Change)

| Legacy `nutrition_micro_flags` | Neu `micro_flags` | Action |
|---|---|---|
| `id, user_id, date, flag_type, actual_value, target_value, percentage, severity, created_at` | `id, user_id, date, flag_type, actual_value, target_value, pct_of_target, severity, created_at` | RENAME (`percentage` → `pct_of_target`) |
| `nutrient` TEXT (freie Strings wie `'vitamin_d_ug'`) | `nutrient_code` TEXT FK → `nutrient_defs.code` | **TRANSFORM**: Mapping-Tabelle nötig (Legacy benutzt Spalten-Namen, Neu benutzt BLS-Codes) |
| CHECK flag_type IN (`deficit, surplus, optimal`) | CHECK (`deficit, surplus`) | TRANSFORM: Rows mit `optimal` → **DROP** (in Neu nicht mehr erfasst) |
| CHECK severity IN (`info, warn, block`) | CHECK (`info, warn, critical`) | RENAME: `block` → `critical` |

#### Legacy-Nutrient-String → BLS-Code Mapping (für flags)

| Legacy nutrient string | nutrient_code |
|---|---|
| `vitamin_a_ug` | `VITA` |
| `vitamin_d_ug` | `VITD` |
| `calcium_mg` | `CA` |
| `iron_mg` | `FE` |
| … (siehe §3.1a) | … |

### 3.11 recipes (SPLIT + ENHANCE)

| Legacy `recipes` | Neu `nutrition.recipes` | Action |
|---|---|---|
| `id, user_id, name, description, servings, prep_time_min, cook_time_min, instructions, tags, is_favorite` | identisch | KEEP |
| — | `name_en, name_th` | NEW (NULL) |
| — | `is_public` BOOLEAN | NEW (default `false`) |
| — | `total_weight_g, total_enercc, total_prot625, total_fat, total_cho, total_fibt, total_sugar` | NEW (Trigger berechnet) |
| — | `serving_*` GENERATED Columns | NEW |
| `created_at, updated_at` | identisch | KEEP |

**Backfill:** Nach Migration Trigger `trg_recipe_items_recalculate` manuell triggern, damit alle `total_*` befüllt werden. UPDATE `recipe_items` mit dummy-SET → feuert Trigger.

### 3.12 recipe_items (RENAME + Snapshot-Spalten)

| Legacy | Neu | Action |
|---|---|---|
| `id, recipe_id, food_id` | identisch | KEEP |
| `name` | — | DROP (Neu hat kein `name` — wird on-the-fly aus `foods.name_display` geholt) |
| `amount_g` | `amount_g` | KEEP |
| `calories_kcal` | `enercc` | RENAME |
| `protein_g, carbs_g, fat_g` | `prot625, cho, fat` | RENAME |
| — | `fibt, sugar` | NEW (aus food-Data berechnen beim Backfill) |
| `sort_order` | `sort_order` | KEEP |

### 3.13 meal_plans (ENHANCE mit Lifecycle)

| Legacy | Neu | Action |
|---|---|---|
| `id, user_id, name, description` | identisch | KEEP |
| `target_calories, target_protein_g, target_carbs_g, target_fat_g` | `target_kcal, target_protein, target_carbs, target_fat` | RENAME (kcal→kcal consistent) |
| `days_count, is_active` | `days_count` | TRANSFORM: `is_active=true` → `status='active'`, `start_date=created_at::date`, `end_date=start_date + days_count` |
| — | `source` TEXT CHECK(`user,coach,marketplace,buddy`) | NEW, Default `'user'` für migrierte Rows |
| — | `source_ref_id` | NEW (NULL) |
| — | `lifecycle_type` | NEW, Default `'once'` |
| — | `next_plan_id` | NEW (NULL) |
| — | `rollover_count` | NEW, Default 0 |
| — | `status` | NEW (siehe TRANSFORM oben) |
| — | `start_date, end_date, activated_at` | NEW (siehe TRANSFORM oben) |
| `created_at, updated_at` | identisch | KEEP |

### 3.14 meal_plan_days, meal_plan_items

**KEEP** strukturell. Einzige Differenzen:
- meal_plan_items: Legacy hat `calories_kcal, protein_g, carbs_g, fat_g` → RENAME nach `enercc, prot625, cho, fat`.
- Legacy hat keinen `exactly_one_item_source` CHECK → neu zu addieren. **Vor dem Add**: alle Rows prüfen, die mehrere FK-Spalten gleichzeitig gefüllt haben, oder keine → §5 R-07.

### 3.15 meal_plan_logs — komplett NEU

Existiert nicht im Legacy. Keine Mapping-Quelle.
Nach Migration: Tabelle anlegen, leer starten. Compliance-Tracking beginnt ab Deployment.

### 3.16 food_favorites

| Legacy | Neu | Action |
|---|---|---|
| PK `(user_id, food_id)`, `created_at` | **UNKNOWN** | SPEC_02/SPEC_06 listet `food_favorites` nicht explizit. Entweder KEEP (implizit) oder → `food_preference_items (preference='liked', target_type='food', food_id=X)`. Empfehlung: als **food_preference_items** migrieren, `food_favorites` droppen. → §5 R-08 |

### 3.17 user_food_preferences → food_preferences + food_preference_items

| Legacy `user_food_preferences` | Neu `nutrition.food_preferences` | Action |
|---|---|---|
| `id, user_id UNIQUE` | PK `user_id` | TRANSFORM (`id` droppen, `user_id` zu PK machen) |
| `diet_type, allergies, intolerances, preferred_cuisines` | identisch | KEEP |
| `avoided_cuisines` | — | DROP (nicht in Neu) |
| `meals_per_day, snacks_per_day` | — | DROP |
| `cooking_skill, prep_time_max` (→ `prep_time_max_min`), `meal_prep_ok, budget_level` | `cooking_skill, prep_time_max_min, budget_level` | RENAME/KEEP (`meal_prep_ok` → DROP) |
| `high_protein_foods, preferred_carb_sources, preferred_fat_sources` | — | DROP (zu unstrukturiert — ersetzt durch `food_preference_items`) |
| `liked_foods` JSONB `[{food_id,name,category}]` | → `food_preference_items` | **SPLIT**: für jedes Array-Element neue Row mit `preference='liked'`, `target_type='food'` (falls `food_id` gesetzt) oder `target_type='category'` (falls `category` gesetzt) oder DROP (falls nur `name`) |
| `disliked_foods` JSONB | dito mit `preference='disliked'` | SPLIT |
| `global_exclusions` TEXT[] (aus 20260319) | → `food_preference_items (preference='disliked', target_type='tag')` | SPLIT |
| `food_ratings` JSONB (aus 20260320) | — | **UNKNOWN** Schema des JSONB nicht dokumentiert → §5 R-09 |
| `notes` | — | DROP |
| `updated_at` | `updated_at` | KEEP |

### 3.18 user_settings

**Nicht in SPEC_02/06 als Nutrition-Tabelle gelistet.** → **UNKNOWN** ob migriert oder zu droppen. DATABASE.md listet sie in Table-Index, SPEC_06 nicht. → §5 R-11.

### 3.19 Tabellen ohne Mapping (Legacy-seitig verwaist)

Folgende Legacy-Tabellen haben **kein neues Äquivalent**:

| Tabelle | Legacy-Migration | Empfehlung |
|---|---|---|
| `weight_logs` | `002` | → Goals-Modul |
| `user_nutrition_goals` | `017` | → Goals-Modul |
| `macro_cycling_configs` | `017` | → Goals-Modul |
| `refeed_schedules` | `017` | → Goals-Modul |
| `auto_adjust_rules` | `017` | → Goals-Modul |
| `tdee_history` | `017` | → Goals-Modul |

### 3.20 Tabellen ohne Legacy (Neu-Seite Greenfield)

| Neu | Quelle |
|---|---|
| `nutrient_defs` (138 BLS-Codes Seed) | SPEC_06 §1 — **Greenfield** |
| `food_categories` (4-Ebenen-Baum) | SPEC_06 §2 — **Greenfield**, benötigt manuellen Seed |
| `food_nutrients` EAV | SPEC_06 §4 — aus `foods.*` + `nutrients_full` befüllen (§3.1) |
| `food_aliases` | SPEC_06 §7 — **Greenfield**, leer starten oder aus `foods.name_en` befüllen |
| `tag_definitions` + `food_tags` | SPEC_06 §5,6 — Trigger befüllt automatisch beim Re-Insert der Foods |
| `food_preference_items` | aus `user_food_preferences.liked_foods/disliked_foods/global_exclusions` (§3.17) |
| `meal_plan_logs` | **Greenfield**, leer |
| `shopping_lists`, `shopping_list_items` | **Greenfield**, leer (SPEC_02 §12,13; fehlt in SPEC_06 — siehe §5 R-12) |

---

## 4. MIGRATION PLAN (STEP-BY-STEP)

### Strategie: **Blue/Green mit Dual-Write-Window**

Grund:
- meal_items Snapshots sind historisch — kein Neu-Berechnen aus aktueller `foods`-DB erlaubt (bei späteren BLS-Updates würde das Verfälschung bedeuten).
- `foods` wird in fast jedes andere Objekt via FK referenziert → muss zuerst existieren.
- `nutrition_targets` ändert Semantik (global → per-Tag) → wenn das UI bereits auf Neu umschaltet, darf es keinen Misfire geben.

### Phase 0 — Preflight (1 Tag, kein Deploy)

| # | Aktion | Output |
|---|---|---|
| P0.1 | Dump vollständige Legacy-DB (nur `nutrition.*`, `public.foods*`, `public.meals*`, `public.water_logs`, `public.weight_logs`, `public.nutrition_*`, `public.user_*_goals|preferences|settings`, `public.recipes*`, `public.meal_plans*`, `public.food_favorites`, `public.tdee_history`, plus Relations). | `.dump.sql` + Zeilenzählung |
| P0.2 | `SELECT` für jede Tabelle: Zeilen mit `user_id = '00000000-0000-0000-0000-000000000001'` identifizieren. Entscheiden: migrieren (als Dev-Daten) oder droppen. | Liste |
| P0.3 | Integrity-Audit (siehe Skripte in §5): orphaned `meal_items` (`meal_id` ohne Parent), orphaned `food_id` in `meal_items` mit `food_source='bls'`, Duplikate in `nutrition_targets`, etc. | Report |
| P0.4 | `user_id` abgleichen gegen `auth.users`. Alles was nicht matched → in `_orphan_nutrition_*`-Tables umleiten. | Bridge-Tables |

### Phase 1 — Neues Schema bauen (parallel, kein Datenmove)

Reihenfolge hart — FKs zwingen sie:

1. `CREATE SCHEMA nutrition_v2;` (temporärer Name, wird am Ende umbenannt)
2. `nutrient_defs` → Seed aus SPEC_06 (138 INSERT-Statements)
3. RDA-UPDATEs aus SPEC_06 ausführen
4. `food_categories` → manueller Seed nach SPEC_05 (BLS-Kategorie-Baum, 4 Ebenen). **Block bis Seed verifiziert.**
5. `tag_definitions` → Seed aus SPEC_05 (Phase-1-Tags mindestens)
6. `foods_v2` DDL (ohne Trigger)
7. `food_nutrients_v2` DDL
8. `food_aliases_v2` DDL
9. `food_tags_v2` DDL
10. `foods_custom_v2`, `food_preferences_v2`, `food_preference_items_v2` DDL
11. `meals_v2`, `meal_items_v2` DDL
12. `recipes_v2`, `recipe_items_v2`, Trigger `trg_recipe_items_recalculate`
13. `meal_plans_v2` + days + items + logs
14. `water_logs_v2`, `nutrition_targets_v2`, `micro_flags_v2`
15. `shopping_lists_v2`, `shopping_list_items_v2` (SPEC_02 DDL — in SPEC_06 fehlt es, improvisieren oder §5 R-12 lösen)
16. `daily_nutrition_summary` VIEW
17. Grants nach SPEC_06 §18
18. `auto_tag_food()` Funktion + `trg_foods_auto_tag` Trigger, aber **deaktiviert während Massen-Import** (`ALTER TABLE ... DISABLE TRIGGER`)

### Phase 2 — Foods (inkl. EAV-Split)

Kritisch: Spalten-Nutrients → EAV. Idempotent bauen.

```sql
-- 2.1 Stammdaten rüberkopieren
INSERT INTO nutrition_v2.foods_v2 (id, bls_code, name_de, name_en,
                                   category_id, sort_weight, processing_level,
                                   enercc, enercj, water_g, prot625, fat, cho,
                                   fibt, sugar, fasat, nacl, alc,
                                   created_at, updated_at)
SELECT
  f.id, f.bls_code, f.name_de, f.name_en,
  (SELECT id FROM nutrition_v2.food_categories
   WHERE bls_hint IS NOT NULL
     AND f.bls_code ~ bls_hint
   ORDER BY level DESC LIMIT 1) AS category_id,
  500, 'raw',
  f.kcal, f.kj, f.water_g, f.protein_g, f.fat_g, f.carbs_g,
  f.fiber_g, f.sugar_g, f.fat_sat_g, f.salt_g, f.alcohol_g,
  f.created_at, f.updated_at
FROM nutrition.foods f;

-- 2.2 Direkte Nutrient-Spalten → food_nutrients (EAV)
-- generisch pro Spalte:
INSERT INTO nutrition_v2.food_nutrients (food_id, nutrient_code, value, data_source)
SELECT id, 'FE', iron_mg, 'Uebernommener Wert'
FROM nutrition.foods
WHERE iron_mg IS NOT NULL;

-- (wiederholen für alle Columns aus §3.1a, mit Unit-Conversion für CU/MN/VITB6)
INSERT INTO nutrition_v2.food_nutrients (food_id, nutrient_code, value, data_source)
SELECT id, 'CU', copper_mg * 1000, 'Uebernommener Wert'
FROM nutrition.foods WHERE copper_mg IS NOT NULL;

-- 2.3 nutrients_full JSONB → EAV
INSERT INTO nutrition_v2.food_nutrients (food_id, nutrient_code, value, data_source)
SELECT f.id, kv.key, kv.value::NUMERIC, 'Uebernommener Wert'
FROM nutrition.foods f,
     jsonb_each_text(f.nutrients_full) AS kv
WHERE kv.value ~ '^-?\d+(\.\d+)?$'
  AND kv.key IN (SELECT code FROM nutrition_v2.nutrient_defs)
ON CONFLICT (food_id, nutrient_code) DO NOTHING;

-- 2.4 allergens[] → food_tags
INSERT INTO nutrition_v2.food_tags (food_id, tag_code, confidence)
SELECT id,
  CASE a
    WHEN 'gluten' THEN 'allergen_gluten'
    WHEN 'dairy'  THEN 'allergen_milk'
    WHEN 'eggs'   THEN 'allergen_eggs'
    WHEN 'nuts'   THEN 'allergen_nuts'
    WHEN 'peanuts' THEN 'allergen_peanuts'
    WHEN 'soy'    THEN 'allergen_soy'
    WHEN 'fish'   THEN 'allergen_fish'
    WHEN 'shellfish' THEN 'allergen_crustaceans'
    ELSE NULL
  END, 1.0
FROM nutrition.foods, unnest(allergens) AS a
WHERE a IS NOT NULL
  AND (CASE a ...) IS NOT NULL  -- skip unmappable
ON CONFLICT DO NOTHING;

-- 2.5 Trigger aktivieren und Re-Tag alle Foods einmal
ALTER TABLE nutrition_v2.foods_v2 ENABLE TRIGGER trg_foods_auto_tag;
UPDATE nutrition_v2.foods_v2 SET updated_at = updated_at;  -- feuert Trigger
```

Audit nach Phase 2:
- `COUNT(foods)` muss gleich sein.
- `COUNT(food_nutrients)` sollte ~ 570k sein laut SPEC (7140 × ~80 non-null = grob).
- Jedes Food muss mindestens 1 Tag haben (sonst auto_tag fehlerhaft).

### Phase 3 — Custom Foods

1-zu-1-Copy mit Rename-Map aus §3.3.

```sql
INSERT INTO nutrition_v2.foods_custom (...)
SELECT
  id, user_id, name_de, name_en,
  NULL AS name_th,
  brand, barcode, serving_size_g, serving_name,
  CASE source WHEN 'openfoodfacts' THEN 'user' ELSE source END AS source,
  kcal AS enercc, protein_g AS prot625, fat_g AS fat, carbs_g AS cho,
  fiber_g AS fibt, sugar_g AS sugar, salt_g AS nacl, water_g, alcohol_g AS alc,
  NULL AS fasat,  -- §5 R-06: fat_sat_g fehlt in Legacy foods_custom
  vitamin_a_ug AS vita_ug, vitamin_d_ug AS vitd_ug,
  NULL AS vite_mg, NULL AS vitk_ug, vitamin_c_mg AS vitc_mg,
  NULL AS thia_mg, NULL AS ribf_mg, NULL AS nia_mg, NULL AS vitb6_ug,
  NULL AS fol_ug, NULL AS vitb12_ug,
  sodium_mg AS na_mg, potassium_mg AS k_mg, calcium_mg AS ca_mg,
  magnesium_mg AS mg_mg, NULL AS p_mg, iron_mg AS fe_mg, zinc_mg AS zn_mg,
  NULL AS id_ug, NULL AS cu_ug, NULL AS mn_ug,
  created_at, updated_at
FROM nutrition.foods_custom;
```

### Phase 4 — Meals + MealItems (kritisch: Snapshots)

```sql
-- 4.1 Meals 1:1
INSERT INTO nutrition_v2.meals
SELECT * FROM nutrition.meals;

-- 4.2 MealItems: 34 Spalten → direkte Spalten + JSONB
INSERT INTO nutrition_v2.meal_items (
  id, meal_id, food_id, custom_food_id, food_source, food_name, amount_g,
  enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g,
  nutrients, created_at
)
SELECT
  mi.id, mi.meal_id,
  CASE mi.food_source WHEN 'bls' THEN mi.food_id ELSE NULL END,
  CASE mi.food_source WHEN 'custom' THEN mi.food_id ELSE NULL END,
  CASE mi.food_source WHEN 'openfoodfacts' THEN 'mealcam' ELSE mi.food_source END,
  mi.food_name, mi.amount_g,
  mi.kcal, mi.protein_g, mi.fat_g, mi.carbs_g, mi.fiber_g, mi.sugar_g,
  mi.fat_sat_g, mi.salt_g, NULL AS water_g,  -- water_g nicht in Legacy meal_items
  jsonb_strip_nulls(jsonb_build_object(
    'ENERCC', mi.kcal, 'PROT625', mi.protein_g, 'FAT', mi.fat_g, 'CHO', mi.carbs_g,
    'FIBT', mi.fiber_g, 'SUGAR', mi.sugar_g, 'FASAT', mi.fat_sat_g, 'NACL', mi.salt_g,
    'VITA', mi.vitamin_a_ug, 'VITD', mi.vitamin_d_ug, 'VITE', mi.vitamin_e_mg,
    'VITK', mi.vitamin_k_ug, 'VITC', mi.vitamin_c_mg,
    'THIA', mi.thiamin_mg, 'RIBF', mi.riboflavin_mg, 'NIA', mi.niacin_mg,
    'VITB6', mi.vitamin_b6_mg * 1000,        -- Unit: mg → µg
    'FOL', mi.folate_ug, 'VITB12', mi.vitamin_b12_ug,
    'PANTAC', mi.pantothenic_acid_mg, 'BIOT', mi.biotin_ug,
    'CA', mi.calcium_mg, 'FE', mi.iron_mg, 'MG', mi.magnesium_mg,
    'P', mi.phosphorus_mg, 'K', mi.potassium_mg, 'NA', mi.sodium_mg,
    'ZN', mi.zinc_mg,
    'CU', mi.copper_mg * 1000,               -- Unit: mg → µg
    'MN', mi.manganese_mg * 1000,            -- Unit: mg → µg
    'ID', mi.iodine_ug,
    'CHORL', mi.cholesterol_mg, 'FAMS', mi.fat_mono_g, 'FAPU', mi.fat_poly_g
  )) AS nutrients,
  mi.created_at
FROM nutrition.meal_items mi;
```

**Wichtig:** `food_id` in neuer `meal_items` ist **nicht** FK (bewusst, wegen polymorph) — **UNKNOWN** ob SPEC_06 das so will. DDL in SPEC_06 §10 hat `food_id UUID` ohne REFERENCES → bestätigt. Bleibt polymorph.

### Phase 5 — Targets (Semantik-Wechsel)

```sql
-- 5.1 Aktuelle Targets als heutigen Snapshot
INSERT INTO nutrition_v2.nutrition_targets (
  id, user_id, date,
  calorie_target, protein_target, carbs_target, fat_target, fiber_target, water_target,
  goal_phase, source, fetched_at
)
SELECT
  gen_random_uuid(),
  user_id,
  CURRENT_DATE AS date,
  COALESCE(kcal_target, 2000)::INTEGER,
  COALESCE(protein_g_target, 120)::INTEGER,
  COALESCE(carbs_g_target, 200)::INTEGER,
  COALESCE(fat_g_target, 70)::INTEGER,
  COALESCE(fiber_g_target, 30)::INTEGER,
  COALESCE(water_ml_target, 2500)::INTEGER,
  'maintain',               -- default
  'fallback_calculated',    -- nicht von Goals
  updated_at
FROM nutrition.nutrition_targets;

-- 5.2 user_nutrition_goals → NICHT migrieren. Export für Goals-Team:
COPY (SELECT * FROM nutrition.user_nutrition_goals) TO '/export/goals/user_nutrition_goals.csv';
-- analog für macro_cycling_configs, refeed_schedules, auto_adjust_rules, tdee_history
```

### Phase 6 — Preferences (Split auf 2 Tabellen)

```sql
-- 6.1 Base
INSERT INTO nutrition_v2.food_preferences (
  user_id, diet_type, allergies, intolerances, preferred_cuisines,
  cooking_skill, prep_time_max_min, budget_level, updated_at
)
SELECT user_id, diet_type, allergies, intolerances, preferred_cuisines,
       cooking_skill, prep_time_max, budget_level, updated_at
FROM nutrition.user_food_preferences;

-- 6.2 liked_foods JSONB → food_preference_items
INSERT INTO nutrition_v2.food_preference_items (user_id, preference, target_type, food_id, created_at)
SELECT user_id, 'liked', 'food',
       (elem->>'food_id')::UUID, now()
FROM nutrition.user_food_preferences,
     jsonb_array_elements(liked_foods) AS elem
WHERE elem->>'food_id' IS NOT NULL
  AND EXISTS (SELECT 1 FROM nutrition_v2.foods_v2 WHERE id = (elem->>'food_id')::UUID);

-- analog für disliked_foods
-- global_exclusions TEXT[] → preference='disliked', target_type='tag'
```

### Phase 7 — Recipes + MealPlans + water_logs + flags

- `recipes`: rename Spalten + NULL für neue totals, dann `UPDATE recipes SET updated_at=updated_at` → Trigger feuert, totals berechnet.
- `recipe_items`: rename + Backfill `fibt`, `sugar` via Join auf `foods`.
- `meal_plans`: rename, `status` aus `is_active` ableiten, `source='user'` als Default.
- `meal_plan_items`: rename Spalten.
- `water_logs`: rename nicht nötig.
- `nutrition_micro_flags` → `micro_flags`: mapping nutrient-String → code, `optional` Rows droppen, severity `block`→`critical`.

### Phase 8 — Switchover

1. Applikation in Maintenance-Mode.
2. Finale Delta-Migration (alle neuen Rows seit Phase 2 nachziehen).
3. `ALTER SCHEMA nutrition RENAME TO nutrition_legacy;`
4. `ALTER SCHEMA nutrition_v2 RENAME TO nutrition;`
5. API-Deploy (neue Endpoints, neue Queries).
6. Rauchtests:
   - `GET /api/nutrition/for-ai` für 3 Test-User
   - `POST /api/nutrition/meals` + `items` → check `daily_nutrition_summary`
   - `GET /api/nutrition/summary/daily` → non-zero für User mit Legacy-Daten
7. RLS-Policies auf `auth.uid()` statt Dev-UUID prüfen (§5 R-03).

### Phase 9 — Cleanup (nach 2 Wochen Beobachtung)

- `DROP SCHEMA nutrition_legacy CASCADE;`
- Goals-Team hat `weight_logs` + `user_nutrition_goals`-Export importiert → bestätigen.
- `public.*` Compat-Views aus `071` → droppen.

### Reihenfolge zwingend (Grund):

```
  nutrient_defs + food_categories + tag_definitions
         │
         ▼
      foods (FKs auf categories) → food_nutrients (FKs auf foods+nutrient_defs)
                                 → food_aliases (FK auf foods)
                                 → food_tags (FKs auf foods+tag_defs)
         │
         ▼
      foods_custom (user_id)
         │
         ▼
      meals → meal_items (polymorph, kein FK auf foods)
                          (FK auf foods_custom wenn source='custom')
         │
      recipes → recipe_items (FK auf foods)
         │
      meal_plans → meal_plan_days → meal_plan_items (FKs auf foods/custom/recipes)
                                  → meal_plan_logs (FK auf meals)
         │
      water_logs, nutrition_targets, micro_flags (FK auf nutrient_defs)
      food_preferences, food_preference_items (FKs auf foods/custom/categories/tags)
      shopping_lists → shopping_list_items (FKs auf foods/custom)
```

---

## 5. RISKS & EDGE CASES

| # | Risiko | Trigger | Schaden | Mitigation |
|---|---|---|---|---|
| **R-01** | **Unit-Conversion-Fehler** bei CU/MN/VITB6 (mg→µg ×1000) | Developer übersieht in §3.1a / §4 Phase 4 | Falsche Mikro-Werte in allen MealItems + Foods nach Migration (×1000 zu klein oder groß) | Unit-Tests nach Phase 2 & Phase 4: Spot-Check 10 random Foods + 10 MealItems, kcal/Iron/Copper/Manganese/B6 vor und nach vergleichen |
| **R-02** | **Orphaned meal_items** (food_id → non-existent food) | Legacy hat keinen FK, kann verwaiste refs enthalten | Pre-Migration: OK (snapshots unabhängig). Post-Migration: UI könnte „Food not found"-Fehler werfen | Vor Migration: `SELECT meal_id, food_id FROM meal_items WHERE food_source='bls' AND food_id NOT IN (SELECT id FROM foods)` in orphan-Report dumpen. Fallback: `food_name` bleibt denormalisiert → UI rendert trotzdem |
| **R-03** | **Hardcoded Dev-UUID in RLS-Policies** | `004`, `006`, `017`, `021` nutzen `'00000000-0000-0000-0000-000000000001'` | Alle User sehen die Dev-Daten. RLS de facto nutzlos in prod | Phase 1: neue DDL mit `auth.uid()`-Policies schreiben. Phase 2: nach Migration `SELECT` aus `recipes/meal_plans/food_favorites/user_nutrition_goals/user_food_preferences` mit `user_id=dev-uuid` inspezieren — entweder migrieren oder löschen |
| **R-04** | **Semantic Tags Migration fehlt** | DATABASE.md erwähnt `20260331000004_food_semantic_tags.sql`, Datei nicht im Repo-Scan aufgetaucht | Neue Tag-Funktionalität fehlt nach Migration | Kläre mit User: existiert die Migration anderswo? Wenn nein: Tag-Seed manuell aus SPEC_05 aufbauen, trigger aus SPEC_06 §6 installieren |
| **R-05** | **foods_portions** in SPEC_02 nicht explizit gelistet | SPEC_02 Entity-Liste enthält es nicht, SPEC_06 auch nicht | Portionen gehen verloren oder Migration hat keinen Ziel-Table | Bestätigen mit User: Portions bleiben als Tabelle? Empfehlung: ja, KEEP as-is |
| **R-06** | **foods_custom.fat_sat_g fehlt in Legacy-DDL-Seed** | Migration `002` listet die Spalte nicht (`sugar, fiber, salt` ja, `fat_sat` nein) | Beim Mapping Phase 3 wird `fasat` auf NULL fallen — kein Datenverlust aber Lücke | Prüfen mit `\d nutrition.foods_custom` ob Spalte live evtl doch existiert (via spätere ALTER). Falls ja: in Phase 3 einbauen. Falls nein: NULL ist korrekt |
| **R-07** | **meal_plan_items hat keinen `exactly_one_item_source` CHECK in Legacy** | Neues Constraint verlangt: genau EINES von food_id / custom_food_id / recipe_id | Legacy-Rows, die 0 oder 2+ Referenzen haben → INSERT fails in Phase 7 | Pre-check: `SELECT COUNT(*) FROM meal_plan_items WHERE (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int + (recipe_id IS NOT NULL)::int != 1` — wenn > 0: manuelle Korrektur-SQL, Rows entweder DROP oder fehlende Referenz auffüllen |
| **R-08** | **food_favorites Mapping unklar** | SPEC_02/06 listet Tabelle nicht explizit | Entweder migrieren (als eigene Tabelle) oder zu `food_preference_items` mergen. Fehlentscheidung → UI-Feature bricht | Klärung: Erwartet neue App die Tabelle `food_favorites`? Wenn SPEC es weglässt → migriere zu `food_preference_items (preference='liked', target_type='food')`. Wenn App erwartet → KEEP |
| **R-09** | **`user_food_preferences.food_ratings` JSONB undokumentiert** | Migration `20260320` fügt Spalte hinzu, Schema nicht spezifiziert | Daten nicht migrierbar ohne Struktur-Info | `SELECT DISTINCT jsonb_typeof(food_ratings) FROM user_food_preferences` und Sample-Dump zur User-Klärung |
| **R-10** | **Selenium (SE) fehlt in nutrient_defs-Seed** | SPEC_06 §1 Seed hat kein `SE`-Entry (nur CU/MN/FD/CR/MO als Trace), Legacy hat `selenium_ug` | EAV-Split kann SE nicht schreiben (FK-Violation auf nutrient_defs) | SPEC_06 §1 ergänzen um `('SE','Selen','Selenium','µg','Elemente','Elements',...)`, dann RDA |
| **R-11** | **user_settings-Tabelle — Scope unklar** | DATABASE.md listet, SPEC_02/06 nicht | Tabelle wandert wohin? | Prüfe Inhalt — wenn keine nutrition-spezifischen Keys → droppen. Sonst: migrieren unter neuem Namen |
| **R-12** | **shopping_lists/shopping_list_items DDL fehlt in SPEC_06** | SPEC_02 §12,13 definiert Entities, SPEC_06 überspringt sie. SPEC_06 Anmerkung §"Ausstehende Korrekturen" Punkt 4 gibt es zu | Phase 1 DDL-Run bricht | SPEC_06 muss ergänzt werden ODER DDL aus SPEC_02 synthetisieren |
| **R-13** | **Doppelte Migration 071 ↔ 20250322030003** | Beide sind `_nutrition_schema_split.sql` mit identischem Content | Re-Run wirft Fehler wenn Schema schon existiert | Zu beheben BEVOR Legacy-Dump gezogen wird: im Legacy-Repo eine der beiden droppen, damit State deterministisch |
| **R-14** | **meal_items.nutrients JSONB verliert alle Nährstoffe, die nicht in den 34 Direktspalten waren** | Legacy-MealItems haben nur 34 Nutrient-Snapshots | Keine weiteren Mikros rekonstruierbar — historische Daten bleiben Tier-1/2 | Kein Fix. Dokumentieren als erwartete Einschränkung. Neue MealItems ab Cut-Over werden volle Snapshots haben |
| **R-15** | **`/summary/score` Endpoint liefert keine persistierten Scores** | DB hat kein Score-Feld, weder Legacy noch Neu | Score wird bei jedem GET neu berechnet. Bei DB-Schema-Änderung an foods (z.B. BLS 5.0 Update) ändern sich Scores rückwirkend | Entweder: `daily_nutrition_summary` um persistierte Score-Spalten erweitern (als Materialized View mit nightly refresh), oder akzeptieren dass Score volatil ist |
| **R-16** | **Nutrient-Unit-Inkonsistenz bei foods_custom Mikros** | Legacy: `foods_custom.vitamin_b6_mg`. Neu: `foods_custom.vitb6_ug` | ×1000 nötig beim Mapping | In Phase 3 SQL ergänzen (nicht nur Spalten-Rename) |
| **R-17** | **Verlust aller Mikro-Targets** | `nutrition_targets` hat 7 Mikro-Targets, Neu hat nur Makro-Targets | Features, die Mikro-Targets aus DB lesen, brechen | Mikro-Targets kommen jetzt aus `nutrient_defs.rda_*` (männlich/weiblich) + User-Gender. Neue Route: `GET /api/nutrition/micros/targets?user_id=...`. Bis diese existiert: UI-Fallback auf RDA |
| **R-18** | **Hidden Dependency: `packages/rules-engine`** | `useSummaryQuery.ts` importiert `NutritionAlert` von rules-engine, aber wir haben rules-engine nicht gesehen | Alerts-Endpoint könnte Legacy-Schema erwarten | Pre-Migration: `rules-engine/src/nutrition.ts` lesen, Interface zu `NutritionAlert` gegen neu-spec abgleichen |
| **R-19** | **meal_plan_logs → Compliance Historie startet leer** | Tabelle existiert nur neu | Compliance-Dashboard vor Cut-Over = leer | Akzeptieren; Entry-Point in User-Kommunikation |
| **R-20** | **Schema-Split „public-Views zeigen auf nutrition"** | `071` legt `CREATE VIEW public.foods AS SELECT * FROM nutrition.foods` | Wenn neue App immer noch `public.foods` queriest, funktioniert's — wenn aber neue SPEC verlangt `search_path=nutrition`, bricht API bei Views mit unterschiedlicher Spaltensemantik | Alle Consumer auf `nutrition.foods` direkt umstellen. Compat-Views in Cleanup-Phase droppen |

### Datenverlust-Szenarien (explizite Liste)

| Was geht verloren | Grund | Vermeidbar? |
|---|---|---|
| Historische Targets vor Heute | `nutrition_targets` Legacy UNIQUE(user_id), nur Current | Nein, kein Backfill möglich (nur `updated_at` zeigt letzte Änderung) |
| TDEE-Verlauf, Goals-Historie | wandert zu Goals-Modul | Nicht in Nutrition-Scope mehr, aber erhalten |
| `nutrition_micro_flags` mit `flag_type='optimal'` | Neue DB akzeptiert nur `deficit`/`surplus` | Ja: vor Migration in Report dumpen |
| foods_custom allergens | foods_custom hat in Neu keine allergen-Felder | Ja: → `food_preference_items(preference='disliked', target_type='tag', tag_code='allergen_*')` oder gar nicht — **Klärung nötig** |
| Mikros jenseits Tier-1/2 in Legacy meal_items | `nutrients_full` existiert nur auf `foods`, nicht auf `meal_items` | Nein. Historische Daten haben diese Präzision nie gehabt |
| `user_nutrition_goals.*` als Nutrition-Datum | wandert zu Goals | Nein, bewusste Modulgrenze |

### Logic-Mismatch-Szenarien

| Szenario | Legacy-Verhalten | Neu-Verhalten | Konflikt |
|---|---|---|---|
| User ändert Target heute | Update in-place, alte Werte verloren | Neue Row für `date=today`, historische bleiben | Anders — aber Neu ist richtiger |
| User löscht ein Food aus foods_custom | meal_items werden nicht kaskadiert (kein FK) | FK von meal_items.custom_food_id REFERENCES foods_custom(id) — DEFAULT-Verhalten ist wahrscheinlich RESTRICT → kann nicht löschen | **Breaking Change** — neue DDL sollte `ON DELETE SET NULL` verwenden, damit MealItem mit `food_name` Snapshot übrigbleibt |
| BLS-Food wird in v5 aktualisiert | `meal_items` Snapshots bleiben falsch (gut!) | gleich (gut!) | Kein Konflikt |
| User hat 3 aktive Goals in `user_nutrition_goals` | `is_active=true` mehrfach möglich | Goals-Modul — nicht unser Problem | — |

### Performance-Risiken

- `daily_nutrition_summary` als VIEW live-aggregiert `meals × meal_items` pro Query. Bei 7000 Usern × 3 Mahlzeiten/Tag × 5 Items = 100k+ Rows Scan pro Daily-Query. → empfehle **MATERIALIZED VIEW** mit Refresh-Trigger oder nightly cron.
- `food_nutrients` EAV bei 7140 Foods × ~80 Nährstoffe = ~570k Rows. Joins mit `meal_items` pro Logging-Event könnten teuer werden. Mitigation: `meal_items.nutrients` JSONB enthält bereits den Snapshot → Daily-Aggregate liest JSONB, nicht food_nutrients. Korrekt implementiert im SPEC_06 VIEW.
- gin_trgm auf `name_display` statt `name_de` — bei Migration Re-Index nötig.

### Hidden Dependencies (Code-Ebene)

Aus dem gelesenen Legacy-Code sichtbar:
- `apps/app/shared/lib/api-shim` — API-Layer (Code nicht gelesen, aber alle Queries gehen dadurch)
- `packages/rules-engine/src/nutrition` — Alerts-Engine (nicht gelesen, siehe R-18)
- `packages/scoring/src/nutrition.ts` — Scoring-Engine (nicht gelesen)
- `apps/web/.next/server/app/(app)/nutrition` — Next.js compiled (lumeos-app repo) — andere App-Schicht, deutet auf **Multi-Repo-Setup**

Empfehlung: vor Cut-Over diese 3 Packages abscannen auf Column-Name-Referenzen zu alten Namen (`kcal`, `protein_g`, etc.) → alle Stellen umstellen, sonst gibt es TypeErrors nach Schema-Rename.

---

## 6. OUTPUT SUMMARY

**Legacy-Datenmodell-Kern:** 22 Tabellen + 1 VIEW, davon 6 Goals-relevant (wandern aus Nutrition raus), 16 Nutrition-intern.
**Neues Datenmodell-Kern:** 22 Tabellen + 1 VIEW, davon 6 Greenfield (nutrient_defs, food_categories, food_nutrients, food_aliases, food_preference_items, meal_plan_logs), 2 unklar (shopping_lists — in SPEC_02 definiert, SPEC_06 fehlt sie, sowie food_favorites — unklare Zuordnung).

**Direkte 1:1-Migration möglich:** ~40% der Tabellen (mit Spalten-Renames).
**Transform-Migration nötig:** ~35% (EAV-Split, Snapshot→JSONB, Target-Semantik, Preferences-Split).
**Kein Mapping (Greenfield oder Out-of-Scope):** ~25%.

**Top 3 kritische Punkte:**
1. **R-01 Unit-Conversion CU/MN/VITB6** — Drei Spalten sind in Legacy `mg` und in Neu `µg`. Ohne ×1000-Fix produziert die Migration systematisch falsche Mikro-Werte.
2. **R-03 Hardcoded Dev-UUID in RLS** — Legacy RLS ist effektiv deaktiviert. Muss vor Deploy auf `auth.uid()` umgeschrieben werden, sonst sehen User andere User's Daten.
3. **nutrition_targets Semantik-Wechsel** — Current-State (UNIQUE user_id) → per-Tag-Snapshot (UNIQUE user_id+date). Alle historischen Target-Daten sind verloren, aber neues Modell ist deutlich korrekter.

**Empfohlener Cut-Over-Pfad:** Blue/Green in 9 Phasen, Goals-Modul-Split ziehen, meal_items-Snapshots unverändert lassen, EAV nur für `foods`-Stammdaten, nicht für User-Daten.

**Confidence-Aggregat:** 80% der Mappings `H` (aus SQL-DDL), 15% `M` (aus Code/Contract), 5% `U` (explizit gemarkierte Unklarheiten — siehe §5).

---

## ANHANG: Unerledigte Klärungen (für nächste Runde)

1. **shopping_lists DDL** — SPEC_06 synthetisieren oder aus SPEC_02 ableiten
2. **Tag-Seed vollständig** — Phase 1-Tags aus SPEC_05; SPEC_06 §6 Trigger hat mehr Codes als SPEC_05 definiert (z.B. `veal`, `molluscs`, `game_meat`, `liver`, `heart`, `rabbit`, `cheese`, `chicken`, `turkey`, `potato`, `vegetable`, `fruit`, `legumes`, `gluten_grain`, `processed_meat`, `very_high_protein`, `very_low_carb`, `low_carb`, `high_fiber`, `low_calorie`, `calorie_dense`, `low_fat`, `allergen_*`). Nicht alle sind in SPEC_05 gelistet. → SPEC_05 erweitern
3. **nutrient_defs: SE fehlt** — §5 R-10
4. **food_favorites**: KEEP oder merge → §5 R-08
5. **user_food_preferences.food_ratings** JSONB-Schema → §5 R-09
6. **Semantic-Tags-Migration `20260331000004` existiert sie?** → §5 R-04
7. **user_settings** Scope → §5 R-11
8. **Goals-Modul-Kontrakt** für `weight_logs`, `user_nutrition_goals`-Export → out-of-scope, aber Blocker für Full-Cut-Over
