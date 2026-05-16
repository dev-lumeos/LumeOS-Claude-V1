# Nutrition Module — Features

Vollständige Feature-Liste mit Code-Referenzen und Implementierungsdetails.

---

## 1. Food Database (BLS 4.0)

**Beschreibung:** 7140+ Lebensmittel aus der Bundeslebensmittelschlüssel (BLS) 4.0 Datenbank mit 98 Nährstoffen pro Food.

**Code-Referenzen:**
- DB Table: `nutrition.foods` — `supabase/migrations/001_create_foods_table.sql`
- API Route: `src/api/nutrition/routes/foods.ts`
- Contract: `packages/contracts/src/nutrition/food.ts` → `Food` Interface
- Frontend: `apps/app/modules/nutrition/components/FoodsView.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useFoodSearch.ts`

**Details:**
- 46+ Nährstoff-Spalten direkt in der `foods` Tabelle
- Zusätzlich `nutrients_full` JSONB Spalte für alle 98 BLS-Nährstoffe
- Trigram-Index (`pg_trgm`) für Name-Suche
- Kategorien: Gemüse, Obst, Fleisch, Milchprodukte, etc.
- Confidence Score (0-1) pro Food
- Allergen-Flags (Array): gluten, dairy, eggs, nuts, soy, fish, etc.

---

## 2. Food Search + Smart Search

**Beschreibung:** Zwei Such-Modi: Standard-Suche (Text + Kategorie) und Smart Search (Preference-aware mit DB-Level Scoring).

**Code-Referenzen:**
- Standard: `src/api/nutrition/routes/foods.ts` → `GET /api/nutrition/foods`
- Smart: `src/api/nutrition/routes/foods-smart-search.ts` → `GET /api/nutrition/foods/smart-search`
- Frontend: `apps/app/modules/nutrition/components/FoodSearch.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useFoodSearch.ts`

**Smart Search Features:**
- Preference Score: +100 liked, -100 disliked Foods
- Automatische Allergen-Ausschlüsse
- Diät-Filter (vegan, vegetarisch, pescatarisch, keto)
- Keto-Modus: High-Carb Foods -50 Score
- Name-Match Boost für Prefix-Matches
- Custom Foods optional einblendbar
- Suggestions-Endpoint: Ähnliche Foods basierend auf Likes

---

## 3. Meal Tracking

**Beschreibung:** Mahlzeiten mit Items loggen. Automatische Nährstoffberechnung basierend auf Menge.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/meals.ts`
- Contract: `packages/contracts/src/nutrition/meal.ts` → `Meal`, `MealItem`
- Frontend: `apps/app/modules/nutrition/components/DiaryView.tsx`
- Components: `DailyFoodLog.tsx`, `FoodLogEntry.tsx`, `SmartMealEntry.tsx`
- Hooks: `useFoodLog.ts`, `useMealConfirm.ts`
- Store: `apps/app/modules/nutrition/stores/mealStore.ts`

**Meal Types:** `breakfast`, `lunch`, `dinner`, `snack`, `pre_workout`, `post_workout`, `other`

**Berechnung:** `meal_item.nutrient = food.nutrient * (amount_g / 100)`

**Features:**
- Copy Yesterday's Meals (`POST /meals/copy-day`)
- Meal-Item CRUD (add/update/delete einzelne Foods)
- Automatische Aggregation der Mahlzeiten-Totals
- Ghost Meal Entries (aus Meal Plans)

---

## 4. Water Tracking

**Beschreibung:** Tägliche Wasseraufnahme tracken mit Quick-Add Buttons.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/water.ts`
- Contract: `packages/contracts/src/nutrition/tracking.ts` → `WaterLog`
- Frontend Page: `apps/app/app/(app)/nutrition/water/page.tsx`
- Component: `apps/app/modules/nutrition/components/WaterTracker.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useWaterLog.ts`

**Quick-Add Amounts:** 250ml (Glas), 500ml (Flasche), 750ml (Groß), 1000ml (Liter)
**Default Target:** 3000ml

---

## 5. Weight Tracking

**Beschreibung:** Gewichtsverlauf mit optionalem Körperfett und Mini-Chart.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/weight.ts`
- Contract: `packages/contracts/src/nutrition/tracking.ts` → `WeightLog`
- Frontend Page: `apps/app/app/(app)/nutrition/weight/page.tsx`
- Component: `apps/app/modules/nutrition/components/WeightTracker.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useWeightLog.ts`

**Features:**
- 30-Tage Verlauf
- 7-Tage Differenz-Anzeige
- Body-Fat-Percentage optional
- Mini Bar-Chart im Frontend

---

## 6. Nutrition Targets (TDEE-basiert)

**Beschreibung:** Personalisierte Ernährungsziele mit TDEE-Berechnung, Macro Cycling und Auto-Adjust.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/targets.ts`
- DB: `supabase/migrations/017_nutrition_goals.sql`
- Contract: `packages/contracts/src/nutrition/tracking.ts` → `NutritionTarget`
- Frontend: `apps/app/modules/nutrition/components/NutritionTargetEditor.tsx`, `TDEECalculator.tsx`
- Hooks: `useNutritionTargets.ts`, `useTDEE.ts`
- Store: `apps/app/modules/nutrition/stores/targetStore.ts`

**TDEE-Tabellen:**
- `user_nutrition_goals` — Hauptziele (Kalorien, Makros, Profil)
- `macro_cycling_configs` — Training vs Rest Day Makros
- `refeed_schedules` — Refeed-Day Konfiguration
- `auto_adjust_rules` — Adaptive TDEE-Anpassung
- `tdee_history` — TDEE-Verlauf mit Confidence

**Goal Types:** lose, maintain, gain
**Advanced Goal Types:** aggressive_cut, moderate_cut, mini_cut, lean_bulk, clean_bulk
**Macro Presets:** balanced, low_carb, keto, high_protein, custom
**Activity Levels:** sedentary, light, moderate, active, very_active

---

## 7. Nutrition Score

**Beschreibung:** Gewichteter Compliance-Score (0-100) basierend auf Makro-Erfüllung.

**Code-Referenzen:**
- Berechnung: `packages/scoring/src/nutrition.ts` → `calcNutritionScore()`
- Contract: `packages/contracts/src/nutrition/scoring.ts` → `NutritionScore`
- Frontend: `apps/app/modules/nutrition/components/NutritionScoreCard.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useNutritionScore.ts`

**Formel:**
```
Score = (
  proteinCompliance * 0.30 +    // Höchste Priorität
  calorieCompliance * 0.25 +
  carbsCompliance   * 0.15 +
  fatCompliance     * 0.15 +
  fiberCompliance   * 0.15
) × 100
```

**Level-Multiplier:**
| Level | Multiplier | Bedeutung |
|-------|-----------|-----------|
| beginner | 0.75 | 75% vom Target = 100% Score |
| intermediate | 0.90 | 90% = 100% |
| advanced | 1.00 | 100% = 100% |
| elite | 1.10 | 110% = 100% |

**Status Thresholds:** ≥80 = ok, ≥50 = warn, <50 = block

---

## 8. Micronutrient Tracking

**Beschreibung:** 3-Tier Mikronährstoff-Tracking mit RDA-Zielen und Deficit-Flags.

**Code-Referenzen:**
- Contract: `packages/contracts/src/nutrition/scoring.ts` → Tier-Definitionen
- DB: `nutrition_micro_flags` Tabelle
- Frontend: `apps/app/modules/nutrition/components/MicroDashboard.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useMicronutrients.ts`
- Data: `apps/app/modules/nutrition/data/nutrientDetails.ts`

**Tiers:**
- **Tier 1 (Essential):** 15 Mikronährstoffe — Calcium, Iron, Mg, P, K, Zn, Vitamin A/D/E/K/C/B1/B2/B3/B6
- **Tier 2 (Athlete):** +8 — Copper, Mn, Se, Iodine, Folate, B12, B5, Biotin
- **Tier 3 (Medical):** 100+ — Alle BLS-Nährstoffe inkl. Aminosäuren, Fettsäuren

**Flags:** deficit/surplus mit Severity (info/warn/critical)

---

## 9. Recipes

**Beschreibung:** Rezept-Builder mit Zutaten, Portionen und Log-to-Meal Funktion.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/recipes.ts`
- DB: `supabase/migrations/004_create_recipes_tables.sql`
- Frontend: `apps/app/modules/nutrition/components/RecipeBuilder.tsx`, `RecipeList.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useRecipes.ts`

**Features:**
- Rezept erstellen mit Zutaten (food_id + amount_g)
- Per-Serving Makro-Berechnung
- Tags, Prep/Cook Time, Anleitung
- Favoriten
- Log Recipe als Meal (erstellt Meal + Items)

---

## 10. Meal Plans

**Beschreibung:** Wöchentliche/mehrtägige Essenspläne mit Ghost-Entries und Confirm/Skip/Adjust.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/meal-plans.ts`
- DB: `supabase/migrations/006_portions_custom_foods_mealplans.sql`
- Frontend: `apps/app/modules/nutrition/components/MealPlanView.tsx`, `GhostMealEntry.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useMealPlans.ts`

**Struktur:**
```
meal_plans → meal_plan_days → meal_plan_items
                                 ↓
                    food_id | custom_food_id | recipe_id
```

---

## 11. Custom Foods

**Beschreibung:** User-erstellte Lebensmittel für nicht in der BLS-DB vorhandene Foods.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/custom-foods.ts`
- DB: `nutrition.foods_custom` Tabelle
- Contract: `packages/contracts/src/nutrition/food.ts` → `FoodCustom`
- Frontend: `apps/app/modules/nutrition/components/CustomFoodForm.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useCustomFoods.ts`

**Features:**
- Name, Brand, Barcode (EAN/UPC)
- Basis-Makros + optionale Mikros
- Serving Size + Name
- Source-Tracking (user, mealcam, openfoodfacts)

---

## 12. Food Preferences

**Beschreibung:** Diät-Typ, Allergien, Likes/Dislikes für AI-Personalisierung.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/food-preferences.ts`
- DB: `supabase/migrations/021_food_preferences.sql` → `user_food_preferences`
- Frontend: `apps/app/modules/nutrition/components/FoodPreferences.tsx`

**Konfigurierbar:**
- Diet Type: omnivore, pescatarian, vegetarian, vegan, keto, paleo, mediterranean, carnivore, custom
- Allergien: Array (lactose, gluten, nuts, etc.)
- Liked/Disliked Foods: JSON Array mit Name + optional food_id
- Bevorzugte Küchen
- Kochskill (beginner/intermediate/advanced)
- Max Prep-Time
- Budget-Level
- Bevorzugte Protein/Carb/Fat Sources

---

## 13. MealCam (AI Food Recognition)

**Beschreibung:** Foto-basierte Mahlzeit-Erkennung via AI.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/mealcam.ts`
- Frontend: `apps/app/modules/nutrition/components/MealCam.tsx`, `MealCamModal.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useMealCam.ts`

**Status:** Mock-Implementierung. Real Claude Vision API für Phase 2 geplant.

---

## 14. Insights & Analytics

**Beschreibung:** Verschiedene Analyse-Views für Ernährungsdaten.

**Code-Referenzen:**
- Summary API: `src/api/nutrition/routes/summary.ts`
- Frontend: `InsightsView.tsx`, `NutrientHeatmap.tsx`, `TrendAnalysis.tsx`, `MacroDashboard.tsx`, `MacroDetail.tsx`
- Hooks: `useDailyTotals.ts`, `useTrendAnalysis.ts`, `useMacroDetail.ts`

**Sub-Features:**

### Macro Dashboard
- SVG Rings für Protein/Carbs/Fat
- Remaining Bar (was fehlt noch)
- Component: `MacroDashboard.tsx`, `MacroRing.tsx`, `RemainingBar.tsx`

### Nutrient Heatmap
- 28-Tage Grid-Ansicht
- Component: `NutrientHeatmap.tsx`

### Trend Analysis
- 7d/14d/30d Perioden
- Durchschnittswerte
- Component: `TrendAnalysis.tsx`
- Hook: `useTrendAnalysis.ts`

### Day Summary
- Abend-Review mit Compliance %
- Component: `DaySummary.tsx`

### Deficit Suggestions
- Makro-Defizit → Food-Empfehlungen
- Component: `DeficitSuggestions.tsx`

### Cross-Module Insights
- Nutrition Score → Dashboard, Recovery
- Component: `CrossModuleInsights.tsx`
- Hook: `useCrossModule.ts`

---

## 15. Smart Features

### Smart Suggestions
- "Wie gestern", Favoriten, Recent Foods, One-Click Add
- Component: `SmartSuggestions.tsx`
- Hook: `useSmartSuggestions.ts`

### Smart Nutrition Gaps Detector
- Erkennt fehlende Nährstoffe
- Component: `SmartNutritionGapsDetector.tsx`

### Pre-Workout Optimizer
- AI-powered Trainingsmahlzeit-Empfehlungen
- Component: `PreWorkoutOptimizer.tsx`

### Morning Quick Entry
- Gewicht + Wasser auf Home-Screen
- Component: `MorningQuickEntry.tsx`

### Quick Add Macros
- Direkte Makro-Eingabe ohne Food-Suche
- Component: `QuickAdd.tsx`

### Streak System
- Current/Longest Streak, Badges
- Component: `StreakBadge.tsx`
- Hook: `useStreaks.ts`

---

## 16. Settings

**Beschreibung:** Key-Value Store für Nutrition-Einstellungen.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/settings.ts`
- DB: `user_settings` Tabelle
- Frontend: `apps/app/modules/nutrition/components/SettingsView.tsx`
- Hook: `apps/app/modules/nutrition/hooks/useSettings.ts`

**Bekannte Settings:**
- `meal_schedule` — Mahlzeiten-Zeitplan (JSON Array)
- `preferences` — UI-Preferences (mealPlanConfirmMode, morningWeighIn, etc.)

---

## 17. For AI Context

**Beschreibung:** Kompakter Endpoint für Buddy AI Integration.

**Code-Referenzen:**
- API: `src/api/nutrition/routes/for-ai.ts`
- Buddy Engine: `docs/buddy/engines/nutrition-engine.md`

**Output:** dailyStatus, lastMeal, recommendations — minimal für Kontext-Fenster.

---

## 18. Aggregation Views

**Beschreibung:** DB-Views für schnelle Tagesaggregate.

**Code-Referenzen:**
- View: `daily_nutrition_summary` — `supabase/migrations/002_create_nutrition_tables.sql`
- Contract: `packages/contracts/src/nutrition/aggregates.ts`

**Aggregates:**
- `DailyNutritionAggregate` — Alle Makros + Mikros + Score + Flags
- `WeeklyNutritionAggregate` — 7-Tage Zusammenfassung
- `MonthlyNutritionAggregate` — Monatszusammenfassung
- `NutritionTrend` — Chart-Daten

---

## 19. i18n

**Beschreibung:** Mehrsprachigkeit für 400+ Keys.

**Code-Referenzen:**
- Translations: `apps/app/i18n/translations/de.ts`, `en.ts`, `th.ts`

**Sprachen:** Deutsch (DE), English (EN), Thai (TH)
