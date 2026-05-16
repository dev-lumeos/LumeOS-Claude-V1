# LUMEOS — Modul: Nutrition
> Konsolidiert | 2026-04-14
> API Port: 5100 | Status: ✅ 95% komplett

---

## 1. Zweck

Das Nutrition-Modul ist das Kern-Tracking-System für Ernährung in Lumeos. Es bietet umfassendes Food-Logging, Makro-/Mikronährstoff-Tracking, AI-gestützte Meal-Erkennung und personalisierte Ernährungsempfehlungen. Alle Scores und Empfehlungen sind auf das Goals-Modul ausgerichtet.

---

## 2. Architektur

```
Frontend (Next.js/Vite)
  apps/app/modules/nutrition/
    ├── components/  (41 Components)
    ├── hooks/       (22 Custom Hooks)
    ├── stores/      (3 Zustand Stores)
    └── types/       (6 Type Definitions)

API Layer (Hono, Port 5100)
  src/api/nutrition/
    ├── server.ts    (Route mounting, CORS, Auth)
    ├── routes/      (14 Route-Module)
    └── db.ts        (Postgres, search_path: nutrition,public)

Shared Packages
  packages/contracts/src/nutrition/   (TypeScript Interfaces)
  packages/scoring/src/nutrition.ts   (Score-Berechnung)

Database
  Schema: nutrition.*
  Compat-Views: public.* → nutrition.*
  15+ Tabellen, 1 Materialized View
```

---

## 3. Features

### 3.1 Food-Datenbank (BLS 4.0)
- **7.140+ Lebensmittel**, 98 Nährstoffe pro Food (46 direkte Spalten + `nutrients_full` JSONB)
- Trigram-Index (`pg_trgm`) für schnelle Name-Suche
- Quellen: BLS 4.0 DE, USDA, Fineli FI, CIQUAL FR, CoFID UK, Swiss NWD, OpenFoodFacts
- Kategorie-System, Allergen-Flags, Confidence Score (0-1)

### 3.2 Food Search + Smart Search
**Standard-Suche:** Text + Kategorie-Filter
**Smart Search (preference-aware):**
- Preference Score: +100 gelikte, -100 dislikte Foods
- Automatische Allergen-Ausschlüsse
- Diät-Filter (vegan, vegetarisch, pescatarisch, keto)
- Keto-Modus: High-Carb Foods -50 Score
- Name-Match Boost für Prefix-Matches
- Custom Foods optional einblendbar
- Suggestions-Endpoint für ähnliche Foods basierend auf Likes

### 3.3 Meal Tracking
- Mahlzeiten-Typen: `breakfast | lunch | dinner | snack | pre_workout | post_workout | other`
- Nährstoffberechnung: `meal_item.nutrient = food.nutrient × (amount_g / 100)`
- Copy Yesterday's Meals: `POST /meals/copy-day`
- Meal-Item CRUD (add/update/delete einzelne Foods)
- Automatische Aggregation der Mahlzeiten-Totals
- Ghost Meal Entries (aus Meal Plans)

### 3.4 Water Tracking
- Quick-Add Buttons: 250ml, 500ml, 750ml, 1000ml
- Default Target: 3.000ml/Tag
- Route: `src/api/nutrition/routes/water.ts`

### 3.5 Weight Tracking
- Gewichtsverlauf mit optionalem Körperfett
- Mini-Chart für Trendanzeige
- Integration mit TDEE-Berechnung

### 3.6 MealCam (AI)
- Claude Vision API für Mahlzeit-Erkennung per Foto/Kamera
- Kalorien + Makro-Schätzung aus Bild
- Confidence-Level der Erkennung

### 3.7 Nutrition Targets (TDEE-basiert)
- Adaptive Ziele basierend auf Training-Profil
- Macro Cycling Support
- Refeed-Schedules
- Auto-Adjust-Rules bei Plateau

### 3.8 Nutrition Score (0-100)
- Gewichteter Tages-Score
- Thresholds: ok ≥ 80, warn 50-79, block < 50
- Input in Goals-Modul

### 3.9 Recipes
- Rezept-Builder mit per-Serving Macros
- Mehrere Portionsgrößen

### 3.10 Meal Plans
- Ghost-Meal-Entries (vorausgeplante Mahlzeiten)
- Confirm / Skip / Adjust-Workflow

### 3.11 Custom Foods
- User-erstellte Lebensmittel
- Barcode-Support (OpenFoodFacts)

### 3.12 Food Preferences
- Diät-Typ, Allergien, Likes/Dislikes
- Persistent in `user_food_preferences`

### 3.13 Insights
- Trends: 7/14/30-Tage
- Heatmaps für Compliance
- Deficit-Suggestions
- Mikronährstoff-Lücken-Analyse (`micro_flags`)

### 3.14 Pre-Workout Optimizer
- AI-gestützte Trainingsmahlzeit-Empfehlung

---

## 4. Datenbank-Schema

### Haupt-Tabellen
| Tabelle | Inhalt |
|---|---|
| `nutrition.foods` | BLS 4.0 Food-Datenbank (7.140+ Einträge) |
| `nutrition.foods_portions` | Portionsgrößen pro Food |
| `nutrition.foods_custom` | User-erstellte Lebensmittel |
| `nutrition.meals` | Mahlzeiten-Container (user_id + date) |
| `nutrition.meal_items` | Items in Mahlzeiten (mit berechneten Nährstoffen) |
| `nutrition.water_logs` | Tägliche Wasseraufnahme |
| `nutrition.weight_logs` | Gewichtsverlauf |
| `nutrition.nutrition_targets` | User-spezifische Ziele (TDEE-basiert) |
| `nutrition.macro_cycling_configs` | Macro Cycling Konfiguration |
| `nutrition.refeed_schedules` | Refeed-Planung |
| `nutrition.auto_adjust_rules` | Automatische Zielanpassungen |
| `nutrition.tdee_history` | TDEE-Verlauf |
| `nutrition.nutrition_micro_flags` | Mikronährstoff-Warnungen |
| `nutrition.user_food_preferences` | Diät, Allergien, Likes/Dislikes |
| `nutrition.user_settings` | Key-Value JSONB für Einstellungen |
| `recipes` | Rezepte |
| `recipe_items` | Zutaten pro Rezept |
| `meal_plans` | Mahlzeitenpläne |
| `food_favorites` | Favoriten (user, food) |

### Key View
`daily_nutrition_summary` — Materialized View: meals ⟕ meal_items + water_logs

### `nutrition.foods` — Wichtigste Spalten
```sql
id          UUID PK
bls_code    TEXT UNIQUE       -- z.B. "F100100"
name_de     TEXT NOT NULL
name_en     TEXT
category    TEXT NOT NULL
kcal        NUMERIC(8,2)      -- pro 100g
protein_g   NUMERIC(8,3)
fat_g       NUMERIC(8,3)
carbs_g     NUMERIC(8,3)
sugar_g     NUMERIC(8,3)
fiber_g     NUMERIC(8,3)
-- + 40 weitere Nährstoff-Spalten
nutrients_full JSONB          -- Alle 98 BLS-Nährstoffe
allergen_flags TEXT[]
confidence  NUMERIC(3,2)
```

---

## 5. API-Endpunkte (14 Route-Module)

| Route-Datei | Hauptendpunkte |
|---|---|
| `foods.ts` | `GET /foods` (search), `GET /foods/:id` |
| `foods-smart-search.ts` | `GET /foods/smart-search`, `GET /foods/suggestions` |
| `meals.ts` | CRUD Meals + Items, `POST /meals/copy-day` |
| `water.ts` | `GET/POST/DELETE /water` |
| `weight.ts` | `GET/POST /weight` |
| `targets.ts` | `GET/PUT /targets` (TDEE-basiert) |
| `macro-cycling.ts` | Macro Cycling Konfiguration |
| `recipes.ts` | CRUD Recipes + Items |
| `meal-plans.ts` | CRUD Meal Plans |
| `insights.ts` | Trend-Analysen, Heatmaps |
| `preferences.ts` | Food Preferences |
| `custom-foods.ts` | User-erstellte Foods (⚠ Bug: Route-Konflikt mit `:id`) |
| `mealcam.ts` | Claude Vision Integration |
| `score.ts` | Nutrition Score Berechnung |

---

## 6. Scoring-Formel

```typescript
nutritionScore = (
  macro_compliance_score * 0.40 +   // Makro-Ziele eingehalten?
  calorie_accuracy_score * 0.30 +   // Kalorien im Zielbereich?
  meal_timing_score * 0.15 +        // Mahlzeiten-Timing
  micro_completeness_score * 0.15   // Mikronährstoff-Abdeckung
) * level_multiplier                // beginner 0.75 → elite 1.10
```

---

## 7. Verbindungen zu anderen Modulen

| Modul | Verbindung |
|---|---|
| **Goals** | Scores + Macro-Compliance fließen in Goal-Progress |
| **Coach (AI)** | Liest Daily Summary für Empfehlungen |
| **Supplements** | Supplement-Nutri-Content ergänzt Mikronährstoff-Tracking |
| **Medical** | Nutrition-Daten für Biomarker-Korrelationen |
| **Training** | Pre-Workout Optimizer, TDEE-Anpassung nach Training |

---

## 8. Offene Punkte / Bekannte Bugs

| # | Typ | Beschreibung |
|---|---|---|
| BUG | 🔴 | `GET /api/nutrition/foods/custom` → 500 Error (Route-Konflikt: `:id` catcht "custom") |
| BUG | 🟡 | Micro-Dashboard zeigt 0-Werte (muss `nutrients_full` aus `foods` nutzen, nicht `meal_items` Spalten) |
| TODO | 🟡 | Barcode Scanner (OpenFoodFacts) |
| TODO | 🟡 | Food-DB Expansion (USDA SR/FNDDS, Fineli vollständig) |
| TODO | 🟢 | Meal Plan Templates Library |
| TODO | 🟢 | Recipe Sharing / Community |
