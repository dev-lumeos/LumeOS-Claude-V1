# Nutrition Module — Frontend Components

## Verzeichnisstruktur

```
apps/app/
├── app/(app)/nutrition/
│   ├── page.tsx              # Hauptseite (5-Tab Layout)
│   ├── water/page.tsx        # Water Tracking Page
│   └── weight/page.tsx       # Weight Tracking Page
├── modules/nutrition/
│   ├── components/           # 41 Components
│   ├── hooks/                # 22 Custom Hooks
│   ├── stores/               # 3 Zustand Stores
│   ├── types/                # 6 Type Definitions
│   └── data/                 # Statische Daten
└── modules/goals/components/nutrition/  # Goal-Module Nutrition Views
```

---

## Page Routes

### `apps/app/app/(app)/nutrition/page.tsx`

**Hauptseite** mit 5-Tab Navigation:

| Tab | Component | Icon | Beschreibung |
|-----|-----------|------|-------------|
| Tagebuch | `DiaryView` | 📝 | Tagesansicht mit Mahlzeiten |
| Insights | `InsightsView` | 📊 | Analyse & Statistiken |
| Lebensmittel | `FoodsView` | 🔍 | Food-Suche & Browse |
| Trends | `NutrientHeatmap` | 📈 | 28-Tage Heatmap |
| Einstellungen | `FoodPreferences` + `PreWorkoutOptimizer` | ⚙️ | Preferences & AI |

**KPIs im Header:** Kalorien, Protein, Wasser

**Imports:**
- `ModuleHeader` — Hero-Header mit Gradient
- `ResponsiveTabNav` — Tab-Navigation
- `DateNavigation` — Datums-Navigation

### `apps/app/app/(app)/nutrition/water/page.tsx`

Water Tracking mit:
- Fortschrittsbalken (% von 3L Ziel)
- Quick-Add Buttons (250/500/750/1000ml)
- Custom Amount Input
- Tages-Log mit Delete

### `apps/app/app/(app)/nutrition/weight/page.tsx`

Weight Tracking mit:
- Aktuelles Gewicht (groß)
- 7-Tage Differenz (↑↓)
- Eingabeformular (kg + Datum)
- 30-Tage Mini-Chart (Bar)
- History-Liste

---

## Components (41 Total)

### Core Views

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `DiaryView` | `DiaryView.tsx` | Tagesansicht: Mahlzeiten + Macro Dashboard + Score |
| `InsightsView` | `InsightsView.tsx` | Analyse-Dashboard mit Trends + Cross-Module |
| `FoodsView` | `FoodsView.tsx` | Food-Browsing mit Suche + Kategorien |
| `SettingsView` | `SettingsView.tsx` | Nutrition-Einstellungen |
| `MealPlanView` | `MealPlanView.tsx` | Meal Plan Ansicht + Ghost Entries |

### Meal Tracking

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `DailyFoodLog` | `DailyFoodLog.tsx` | Tageslog aller Mahlzeiten |
| `FoodLogEntry` | `FoodLogEntry.tsx` | Einzelner Meal-Item Eintrag |
| `SmartMealEntry` | `SmartMealEntry.tsx` | Intelligente Mahlzeit-Eingabe |
| `GhostMealEntry` | `GhostMealEntry.tsx` | Geplante Mahlzeit (aus Meal Plan) |
| `AddFoodModal` | `AddFoodModal.tsx` | Modal: Food zu Mahlzeit hinzufügen |
| `AdjustMealModal` | `AdjustMealModal.tsx` | Modal: Mahlzeit anpassen |
| `QuickAdd` | `QuickAdd.tsx` | Direkte Makro-Eingabe |
| `MorningQuickEntry` | `MorningQuickEntry.tsx` | Morgen-Routine (Gewicht + Wasser) |

### Food Search

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `FoodSearch` | `FoodSearch.tsx` | Haupt-Suchkomponente |
| `FoodPreferences` | `FoodPreferences.tsx` | Diät/Allergie Einstellungen |
| `CustomFoodForm` | `CustomFoodForm.tsx` | Custom Food erstellen |
| `SmartSuggestions` | `SmartSuggestions.tsx` | AI-Vorschläge (Favoriten, Recent) |

### Macro & Micro Dashboards

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `MacroDashboard` | `MacroDashboard.tsx` | Makro-Übersicht mit Ringen |
| `MacroRing` | `MacroRing.tsx` | SVG Ring-Diagramm (Protein/Carbs/Fat) |
| `MacroDetail` | `MacroDetail.tsx` | Detail-Tab (Parent/Child Hierarchie) |
| `MicroDashboard` | `MicroDashboard.tsx` | Mikronährstoff-Dashboard (Traffic Light) |
| `RemainingBar` | `RemainingBar.tsx` | "Was fehlt noch" Balken |

### Score & Analytics

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `NutritionScoreCard` | `NutritionScoreCard.tsx` | Score 0-100 Anzeige |
| `NutrientHeatmap` | `NutrientHeatmap.tsx` | 28-Tage Nährstoff-Grid |
| `TrendAnalysis` | `TrendAnalysis.tsx` | 7d/14d/30d Trend-Charts |
| `DaySummary` | `DaySummary.tsx` | Abend-Review (Compliance %) |
| `StreakBadge` | `StreakBadge.tsx` | Streak-Anzeige + Badges |
| `AlertsPanel` | `AlertsPanel.tsx` | Warnungen + Safety Alerts |

### AI Features

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `MealCam` | `MealCam.tsx` | Kamera-basierte Food-Erkennung |
| `MealCamModal` | `MealCamModal.tsx` | MealCam Upload Modal |
| `PreWorkoutOptimizer` | `PreWorkoutOptimizer.tsx` | AI Pre-Workout Empfehlungen |
| `SmartNutritionGapsDetector` | `SmartNutritionGapsDetector.tsx` | Nährstoff-Lücken Erkennung |
| `DeficitSuggestions` | `DeficitSuggestions.tsx` | Defizit-basierte Food-Empfehlungen |
| `CrossModuleInsights` | `CrossModuleInsights.tsx` | Cross-Module Korrelationen |

### Recipes & Plans

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `RecipeBuilder` | `RecipeBuilder.tsx` | Rezept erstellen/bearbeiten |
| `RecipeList` | `RecipeList.tsx` | Rezept-Übersicht |

### Tracking

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `WaterTracker` | `WaterTracker.tsx` | Water Tracking Widget |
| `WeightTracker` | `WeightTracker.tsx` | Weight Tracking Widget |

### Navigation & Layout

| Component | Datei | Beschreibung |
|-----------|-------|-------------|
| `DateNavigation` | `DateNavigation.tsx` | Datums-Picker (←Heute→) |
| `NutritionTargetEditor` | `NutritionTargetEditor.tsx` | Target-Bearbeitung |
| `TDEECalculator` | `TDEECalculator.tsx` | TDEE-Rechner |

---

## Custom Hooks (22 Total)

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| `useFoodSearch` | `hooks/useFoodSearch.ts` | Food-Suche mit Debounce |
| `useFoodLog` | `hooks/useFoodLog.ts` | Meal-Item CRUD |
| `useFoodPortions` | `hooks/useFoodPortions.ts` | Portionsgrößen laden |
| `useCustomFoods` | `hooks/useCustomFoods.ts` | Custom Foods CRUD |
| `useDailyTotals` | `hooks/useDailyTotals.ts` | Tages-Aggregat laden |
| `useMealCam` | `hooks/useMealCam.ts` | MealCam Upload + Parse |
| `useMealConfirm` | `hooks/useMealConfirm.ts` | Ghost Meal bestätigen |
| `useMealPlans` | `hooks/useMealPlans.ts` | Meal Plan CRUD |
| `useMicronutrients` | `hooks/useMicronutrients.ts` | Mikro-Daten laden |
| `useNutritionScore` | `hooks/useNutritionScore.ts` | Score berechnen |
| `useNutritionTargets` | `hooks/useNutritionTargets.ts` | Targets CRUD |
| `useRecipes` | `hooks/useRecipes.ts` | Rezept CRUD |
| `useSettings` | `hooks/useSettings.ts` | Settings Key-Value |
| `useSmartSuggestions` | `hooks/useSmartSuggestions.ts` | AI Food Suggestions |
| `useStreaks` | `hooks/useStreaks.ts` | Streak-Berechnung |
| `useTDEE` | `hooks/useTDEE.ts` | TDEE-Kalkulation |
| `useTrendAnalysis` | `hooks/useTrendAnalysis.ts` | Trend-Daten laden |
| `useWaterLog` | `hooks/useWaterLog.ts` | Water CRUD |
| `useWeightLog` | `hooks/useWeightLog.ts` | Weight CRUD |
| `useMacroDetail` | `hooks/useMacroDetail.ts` | Makro-Detail Breakdown |
| `useCrossModule` | `hooks/useCrossModule.ts` | Cross-Module Daten |

---

## Zustand Stores (3)

### `stores/foodStore.ts`
- Food-Suche State
- Aktuell ausgewähltes Food
- Suchhistorie

### `stores/mealStore.ts`
- Aktuelle Mahlzeiten (Tagesansicht)
- Meal-Items
- Copy/Paste State

### `stores/targetStore.ts`
- Aktive Nutrition Targets
- TDEE-Konfiguration

---

## Type Definitions (6)

| Datei | Beschreibung |
|-------|-------------|
| `types.ts` | Allgemeine Nutrition Types |
| `types/food.ts` | Food-spezifische Types |
| `types/meal.ts` | Meal-spezifische Types |
| `types/rules.ts` | Rules Engine Types (8 Regeln) |
| `types/scoring.ts` | Score Types |
| `types/scoring-fn.ts` | Score-Funktionen Types |
| `types/scoring-types.ts` | Score-Konstanten |

---

## Statische Daten

### `data/nutrientDetails.ts`
- 42+ Mikronährstoff-Details
- 3 Sprachen (DE/EN/TH)
- Symptome bei Mangel/Überschuss
- RDA-Werte
- 7 Nährstoff-Gruppen

---

## Goal Module Integration

```
apps/app/modules/goals/components/nutrition/
├── TodayTargetsCard.tsx       # Heutige Ziele
├── MacroCyclingConfig.tsx     # Training/Rest Day Macros
├── MacroPresetsCard.tsx       # Macro Preset Auswahl
├── AdaptiveTDEESidebar.tsx    # TDEE Sidebar
├── GoalSelector.tsx           # Ziel-Typ Auswahl
└── GoalHistory.tsx            # Ziel-Verlauf
```

Diese Components werden im Goal-Modul verwendet, greifen aber auf Nutrition-Daten zu.
