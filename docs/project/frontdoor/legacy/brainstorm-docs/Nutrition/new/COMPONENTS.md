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
│   └── data/                 # nutrientDetails.ts
└── modules/goals/components/nutrition/  # Goal-Module Nutrition Views
```

---

## Pages

### `nutrition/page.tsx` — Hauptseite

5-Tab Navigation:

| Tab | Component | Beschreibung |
|---|---|---|
| Tagebuch | `DiaryView` | Tagesansicht mit Mahlzeiten |
| Insights | `InsightsView` | Analyse & Statistiken |
| Lebensmittel | `FoodsView` | Food-Suche & Browse |
| Trends | `NutrientHeatmap` | 28-Tage Heatmap |
| Einstellungen | `FoodPreferences` + `PreWorkoutOptimizer` | Preferences & KI |

Header KPIs: Kalorien, Protein, Wasser

### `nutrition/water/page.tsx`
Fortschrittsbalken (% von 3L Ziel), Quick-Add Buttons, Custom Amount Input, Tages-Log mit Delete.

### `nutrition/weight/page.tsx`
Aktuelles Gewicht (groß), 7-Tage Differenz (↑↓), Eingabeformular, 30-Tage Mini-Chart (Bar), History-Liste.

---

## Components (41 Total)

### Core Views

| Component | Beschreibung |
|---|---|
| `DiaryView.tsx` | Tagesansicht: Mahlzeiten + Macro Dashboard + Score |
| `InsightsView.tsx` | Analyse-Dashboard mit Trends + Cross-Module |
| `FoodsView.tsx` | Food-Browsing mit Suche + Kategorien |
| `SettingsView.tsx` | Nutrition-Einstellungen |
| `MealPlanView.tsx` | Meal Plan Ansicht + Ghost Entries |

### Meal Tracking

| Component | Beschreibung |
|---|---|
| `DailyFoodLog.tsx` | Tageslog aller Mahlzeiten |
| `FoodLogEntry.tsx` | Einzelner Meal-Item Eintrag |
| `SmartMealEntry.tsx` | Intelligente Mahlzeit-Eingabe |
| `GhostMealEntry.tsx` | Geplante Mahlzeit (aus Meal Plan) |
| `AddFoodModal.tsx` | Modal: Food zu Mahlzeit hinzufügen |
| `AdjustMealModal.tsx` | Modal: Mahlzeit anpassen |
| `QuickAdd.tsx` | Direkte Makro-Eingabe ohne Food-Suche |
| `MorningQuickEntry.tsx` | Morgen-Routine: Gewicht + Wasser |

### Food Search

| Component | Beschreibung |
|---|---|
| `FoodSearch.tsx` | Haupt-Suchkomponente |
| `FoodPreferences.tsx` | Diät/Allergie Einstellungen |
| `CustomFoodForm.tsx` | Custom Food erstellen |
| `SmartSuggestions.tsx` | KI-Vorschläge (Favoriten, Recent) |

### Macro & Micro Dashboards

| Component | Beschreibung |
|---|---|
| `MacroDashboard.tsx` | Makro-Übersicht mit SVG Ringen |
| `MacroRing.tsx` | SVG Ring-Diagramm (Protein/Carbs/Fat) |
| `MacroDetail.tsx` | Detail-Tab (Parent/Child Hierarchie) |
| `MicroDashboard.tsx` | Mikronährstoff-Dashboard (Traffic Light) |
| `RemainingBar.tsx` | "Was fehlt noch" Fortschrittsbalken |

### Score & Analytics

| Component | Beschreibung |
|---|---|
| `NutritionScoreCard.tsx` | Score 0–100 Anzeige |
| `NutrientHeatmap.tsx` | 28-Tage Nährstoff-Grid |
| `TrendAnalysis.tsx` | 7d/14d/30d Trend-Charts |
| `DaySummary.tsx` | Abend-Review mit Compliance % |
| `StreakBadge.tsx` | Streak-Anzeige + Badges |
| `AlertsPanel.tsx` | Warnungen + Safety Alerts |

### KI Features

| Component | Beschreibung |
|---|---|
| `MealCam.tsx` | Kamera-basierte Food-Erkennung |
| `MealCamModal.tsx` | MealCam Upload Modal |
| `PreWorkoutOptimizer.tsx` | KI Pre-Workout Empfehlungen |
| `SmartNutritionGapsDetector.tsx` | Nährstoff-Lücken Erkennung |
| `DeficitSuggestions.tsx` | Defizit-basierte Food-Empfehlungen |
| `CrossModuleInsights.tsx` | Cross-Module Korrelationen |

### Recipes & Plans

| Component | Beschreibung |
|---|---|
| `RecipeBuilder.tsx` | Rezept erstellen/bearbeiten |
| `RecipeList.tsx` | Rezept-Übersicht |

### Tracking Widgets

| Component | Beschreibung |
|---|---|
| `WaterTracker.tsx` | Water Tracking Widget |
| `WeightTracker.tsx` | Weight Tracking Widget |

### Navigation & Layout

| Component | Beschreibung |
|---|---|
| `DateNavigation.tsx` | Datums-Picker (← Heute →) |
| `NutritionTargetEditor.tsx` | Target-Bearbeitung |
| `TDEECalculator.tsx` | TDEE-Rechner |

---

## Custom Hooks (22 Total)

| Hook | Beschreibung |
|---|---|
| `useFoodSearch.ts` | Food-Suche mit Debounce |
| `useFoodLog.ts` | Meal-Item CRUD |
| `useFoodPortions.ts` | Portionsgrößen laden |
| `useCustomFoods.ts` | Custom Foods CRUD |
| `useDailyTotals.ts` | Tages-Aggregat laden |
| `useMealCam.ts` | MealCam Upload + Parse |
| `useMealConfirm.ts` | Ghost Meal bestätigen |
| `useMealPlans.ts` | Meal Plan CRUD |
| `useMicronutrients.ts` | Mikro-Daten laden |
| `useNutritionScore.ts` | Score berechnen |
| `useNutritionTargets.ts` | Targets CRUD |
| `useRecipes.ts` | Rezept CRUD |
| `useSettings.ts` | Settings Key-Value |
| `useSmartSuggestions.ts` | KI Food Suggestions |
| `useStreaks.ts` | Streak-Berechnung |
| `useTDEE.ts` | TDEE-Kalkulation |
| `useTrendAnalysis.ts` | Trend-Daten laden |
| `useWaterLog.ts` | Water CRUD |
| `useWeightLog.ts` | Weight CRUD |
| `useMacroDetail.ts` | Makro-Detail Breakdown |
| `useCrossModule.ts` | Cross-Module Daten |

---

## Zustand Stores (3)

| Store | Inhalt |
|---|---|
| `stores/foodStore.ts` | Food-Suche State, aktuell ausgewähltes Food, Suchhistorie |
| `stores/mealStore.ts` | Aktuelle Mahlzeiten (Tagesansicht), Meal-Items, Copy/Paste State |
| `stores/targetStore.ts` | Aktive Nutrition Targets, TDEE-Konfiguration |

---

## Type Definitions (6)

| Datei | Beschreibung |
|---|---|
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
- 42+ Mikronährstoff-Details mit 3 Sprachen (DE/EN/TH)
- Symptome bei Mangel und Überschuss
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

---

## Shared Contracts (packages/contracts)

```
packages/contracts/src/nutrition/
├── food.ts          → Food, FoodCustom Interfaces
├── meal.ts          → Meal, MealItem Interfaces
├── tracking.ts      → WaterLog, WeightLog, NutritionTarget
├── scoring.ts       → NutritionScore, Tier-Definitionen
└── aggregates.ts    → DailyNutritionAggregate, WeeklyAggregate, NutritionTrend
```
