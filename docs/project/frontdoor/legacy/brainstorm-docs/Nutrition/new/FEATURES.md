# Nutrition Module — Features

Vollständige Feature-Liste mit Code-Referenzen. Alle "offenen Punkte / TODOs" aus alten Dateien werden hier als geplante Features geführt.

---

## Implementierte Features

### 1. Food-Datenbank (BLS 4.0)

7.140+ Lebensmittel aus der Bundeslebensmittelschlüssel (BLS) 4.0 Datenbank mit 138 Nährstoffen pro Food.

- 46+ Nährstoff-Spalten direkt in `foods` + `nutrients_full` JSONB für alle 98+ BLS-Nährstoffe
- Trigram-Index (`pg_trgm`) für Name-Suche
- Kategorie-System, Allergen-Flags, Confidence Score (0–1)
- Quellen: BLS 4.0 (Basis), USDA, Fineli, CIQUAL, CoFID, Swiss NWD

Code: `src/api/nutrition/routes/foods.ts` · `nutrition.foods` · `packages/contracts/src/nutrition/food.ts`

---

### 2. Food Search + Smart Search

Zwei Such-Modi: Standard (Text + Kategorie) und Smart Search (Preference-aware mit DB-Level Scoring).

**Smart Search:**
- Preference Score: +100 gelikte, −100 dislikte Foods
- Automatische Allergen-Ausschlüsse
- Diät-Filter (vegan, vegetarisch, pescatarisch, keto)
- Keto-Modus: High-Carb Foods −50 Score
- Name-Match Boost für Prefix-Matches
- Custom Foods optional einblendbar
- Suggestions-Endpoint: ähnliche Foods basierend auf Likes

Code: `routes/foods.ts` · `routes/foods-smart-search.ts` · `FoodSearch.tsx` · `useFoodSearch.ts`

---

### 3. Meal Tracking

Mahlzeiten mit Items loggen. Automatische Nährstoffberechnung: `meal_item.nutrient = food.nutrient × (amount_g / 100)`

- Meal-Typen: `breakfast | lunch | dinner | snack | pre_workout | post_workout | other`
- Copy Yesterday's Meals (`POST /meals/copy-day`)
- Meal-Item CRUD (add/update/delete einzelne Foods)
- Automatische Aggregation der Mahlzeiten-Totals
- Ghost Meal Entries (aus Meal Plans)

Code: `routes/meals.ts` · `nutrition.meals` · `nutrition.meal_items` · `DiaryView.tsx` · `DailyFoodLog.tsx`

---

### 4. Water Tracking

- Quick-Add Buttons: 250ml, 500ml, 750ml, 1000ml
- Default Target: 3.000ml/Tag
- Tages-Log mit Delete

Code: `routes/water.ts` · `nutrition.water_logs` · `WaterTracker.tsx` · `useWaterLog.ts`

---

### 5. Weight Tracking

- 30-Tage Verlauf
- 7-Tage Differenz-Anzeige
- Body-Fat-Percentage optional
- Mini Bar-Chart im Frontend
- Integration mit TDEE-Berechnung

Code: `routes/weight.ts` · `nutrition.weight_logs` · `WeightTracker.tsx` · `useWeightLog.ts`

---

### 6. Nutrition Targets (TDEE-basiert)

Personalisierte Ernährungsziele mit TDEE-Berechnung, Macro Cycling und Auto-Adjust.

- Goal Types: `lose | maintain | gain`
- Advanced: `aggressive_cut | moderate_cut | mini_cut | lean_bulk | clean_bulk`
- Macro Presets: `balanced | low_carb | keto | high_protein | custom`
- Activity Levels: `sedentary | light | moderate | active | very_active`
- Macro Cycling: Training- vs. Rest-Day-Makros
- Refeed Schedules
- Auto-Adjust Rules bei Plateau
- TDEE-History mit Confidence

Code: `routes/targets.ts` · `nutrition.user_nutrition_goals` + verknüpfte Tabellen · `NutritionTargetEditor.tsx` · `TDEECalculator.tsx`

---

### 7. Nutrition Score (0–100)

Gewichteter Compliance-Score pro Tag.

```
Score = (
  proteinCompliance × 0.30 +
  calorieCompliance × 0.25 +
  carbsCompliance   × 0.15 +
  fatCompliance     × 0.15 +
  fiberCompliance   × 0.15
) × level_multiplier × 100
```

Level-Multiplier: `beginner 0.75 | intermediate 0.90 | advanced 1.00 | elite 1.10`
Thresholds: `ok ≥ 80 | warn 50–79 | block < 50`

Code: `packages/scoring/src/nutrition.ts` · `NutritionScoreCard.tsx` · `useNutritionScore.ts`

---

### 8. Mikronährstoff-Tracking (3-Tier)

- **Tier 1 (Essential — 15):** Calcium, Iron, Mg, P, K, Zn, Vitamin A/D/E/K/C/B1/B2/B3/B6
- **Tier 2 (Athlete — +8):** Copper, Mn, Se, Iodine, Folate, B12, B5, Biotin
- **Tier 3 (Medical — 100+):** Alle BLS-Nährstoffe inkl. Aminosäuren, Fettsäuren
- Flags: deficit/surplus mit Severity `info | warn | critical`
- 42+ Mikronährstoff-Detail-Cards mit 3 Sprachen (DE/EN/TH), Symptome bei Mangel/Überschuss

Code: `MicroDashboard.tsx` · `useMicronutrients.ts` · `data/nutrientDetails.ts` · `nutrition.nutrition_micro_flags`

---

### 9. Recipes

- Rezept erstellen mit Zutaten (food_id + amount_g)
- Per-Serving Makro-Berechnung (PostgreSQL Generated Columns)
- Trigger: Rezept-Totals auto-update bei Item-Änderungen
- Tags, Prep/Cook Time, Anleitung
- Favoriten
- Log Recipe als Meal

Code: `routes/recipes.ts` · `recipes` + `recipe_items` · `RecipeBuilder.tsx` · `useRecipes.ts`

---

### 10. Meal Plans

- Wöchentliche/mehrtägige Essenspläne
- Ghost-Entries (vorausgeplante Mahlzeiten erscheinen im Tagebuch)
- Confirm / Skip / Adjust-Workflow

Code: `routes/meal-plans.ts` · `meal_plans → meal_plan_days → meal_plan_items` · `MealPlanView.tsx` · `GhostMealEntry.tsx`

---

### 11. Custom Foods

- User-erstellte Lebensmittel für nicht in BLS vorhandene Foods
- Barcode (EAN/UPC)
- Basis-Makros + optionale Mikros, Serving Size
- Source-Tracking: `user | mealcam | openfoodfacts`

Code: `routes/custom-foods.ts` · `nutrition.foods_custom` · `CustomFoodForm.tsx` · `useCustomFoods.ts`

---

### 12. Food Preferences

- Diet Type: `omnivore | pescatarian | vegetarian | vegan | keto | paleo | mediterranean | carnivore | custom`
- Allergien + Intolerances als Array
- Liked/Disliked Foods (JSONB)
- Bevorzugte Küchen, Kochskill, Max Prep-Time, Budget-Level
- Preferred Protein/Carb/Fat Sources

Code: `routes/food-preferences.ts` · `nutrition.user_food_preferences` · `FoodPreferences.tsx`

---

### 13. MealCam (KI-Erkennung)

Claude Vision API für Foto-basierte Mahlzeit-Erkennung.

- Confidence Thresholds: `AUTO_ACCEPT ≥ 0.85 | SUGGEST 0.50–0.84 | LOW 0.30–0.49 | REJECT < 0.15`
- Feedback Loop: `mealcam_scans` + `mealcam_feedback` Tabellen
- Kamera + Datei-Upload

Code: `routes/mealcam.ts` · `MealCam.tsx` · `MealCamModal.tsx` · `useMealCam.ts`

---

### 14. Insights & Analytics

**Macro Dashboard:** SVG Rings für Protein/Carbs/Fat, Remaining Bar
**Nutrient Heatmap:** 28-Tage Grid-Ansicht
**Trend Analysis:** 7d/14d/30d Perioden, Durchschnittswerte
**Day Summary:** Abend-Review mit Compliance %
**Deficit Suggestions:** Makro-Defizit → Food-Empfehlungen
**Cross-Module Insights:** Nutrition Score → Dashboard, Recovery

Code: `routes/summary.ts` · `InsightsView.tsx` · `NutrientHeatmap.tsx` · `TrendAnalysis.tsx` · `MacroDashboard.tsx`

---

### 15. Smart Features

| Feature | Beschreibung | Component | Hook |
|---|---|---|---|
| Smart Suggestions | "Wie gestern", Favoriten, Recent Foods, One-Click | `SmartSuggestions.tsx` | `useSmartSuggestions.ts` |
| Smart Nutrition Gaps | Erkennt fehlende Nährstoffe | `SmartNutritionGapsDetector.tsx` | — |
| Pre-Workout Optimizer | KI Trainingsmahlzeit-Empfehlungen | `PreWorkoutOptimizer.tsx` | — |
| Morning Quick Entry | Gewicht + Wasser auf Home-Screen | `MorningQuickEntry.tsx` | — |
| Quick Add Macros | Direkte Makro-Eingabe ohne Food-Suche | `QuickAdd.tsx` | — |
| Streak System | Current/Longest Streak, Badges | `StreakBadge.tsx` | `useStreaks.ts` |

---

### 16. Settings

Key-Value Store (JSONB) für Nutrition-Einstellungen.

- `meal_schedule` — Mahlzeiten-Zeitplan (JSON Array mit Zeiten + enabled)
- `preferences` — UI-Preferences (mealPlanConfirmMode, morningWeighIn, etc.)

Code: `routes/settings.ts` · `user_settings` · `SettingsView.tsx` · `useSettings.ts`

---

### 17. For-AI Endpoint

Kompakter Nutrition-Context für Buddy AI.

- Aggregiert: dailyStatus, lastMeal, recommendations
- Input für Buddy Engine (`docs/buddy/engines/nutrition-engine.md`)

Code: `routes/for-ai.ts`

---

### 18. Food Semantic Tags

Objektives Food-Klassifikationssystem basierend auf BLS-Codes und Makros.

**Phase 1 Tags (12):**

| Type | Tags |
|---|---|
| ingredient | `pork`, `beef`, `poultry`, `lamb`, `fish`, `shellfish`, `dairy`, `egg`, `offal` |
| diet | `vegetarian`, `vegan` |
| fitness | `high_protein` (≥15g Protein/100g) |

- Auto-Tagging via PostgreSQL Trigger bei Änderung von `bls_code`, `macros`, `name_de`
- Confidence Levels: 1.0 (BLS-sicher), 0.9 (Name-Heuristik), 0.7 (Default-Fallback)
- Tabellen: `nutrition.tag_definitions` + `nutrition.food_tags`

---

### 19. i18n

400+ Übersetzungs-Keys in Deutsch (DE), Englisch (EN), Thai (TH).

Code: `apps/app/i18n/translations/de.ts` / `en.ts` / `th.ts`

---

## Geplante Features

### Höchste Priorität

| Feature | Beschreibung |
|---|---|
| MealCam Real (Claude Vision) | Aktuell Mock-Implementierung → echte Claude Vision API anschließen |
| Barcode Scanner | OpenFoodFacts-Integration für physische Produkte |
| Custom Foods Route-Fix | Bug: `:id`-Parameter fängt "custom" als UUID → Route-Reihenfolge korrigieren |
| Micro-Dashboard Fix | Bug: liest `meal_items`-Spalten statt `nutrients_full` JSONB |

### Coach-Integration

| Feature | Beschreibung |
|---|---|
| Menu Plan per Coach | Coach erstellt Meal Plans für User (Tom Feedback) |
| Menu Plan Confirmation Flow | User bestätigt Meal Plan bei jeder Mahlzeit |
| AI Coach Nutrition Advice | Personalisierte Coach-basierte Ernährungsempfehlungen |

### Food-Datenbank Erweiterung

| Feature | Beschreibung |
|---|---|
| BLS 4.0 + EU-DBs Merge | Vollständige Anreicherung mit USDA, Fineli, CIQUAL, CoFID, Swiss NWD |
| OpenFoodFacts Barcode-Mapping | EAN/UPC Mapping für Packprodukte |
| Phase 2 Semantic Tags | Allergen-Tags: `gluten`, `nuts`, `soy`; Fitness: `low_carb`, `low_fat` |
| Phase 3 Semantic Tags | `halal`, `kosher`, `organic`, `processed` |

### Weitere geplante Features

| Feature | Beschreibung |
|---|---|
| Meal Plan Templates Library | Vorgefertigte Pläne (Cut, Bulk, Vegan, etc.) |
| Recipe Sharing / Community | Rezepte zwischen Usern teilen |
| Smart Scale Integration | Withings, Eufy, Renpho → Weight Sync |
| Apple Health / Google Health Connect | Import für Weight + Water |
| Adaptive TDEE (MacroFactor-Ansatz) | TDEE aus tatsächlichem Gewichtsverlauf berechnen |
| Food DB API Lizenzierung | Lumeos Food-DB als API für Drittanbieter |
| Wallet/Monetisierung | Integration mit LumeOS Wallet-System |
