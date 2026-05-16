# Nutrition Module — Frontend Components
> Spec Phase 10 | Seiten, Components, Hooks, Stores

---

## Verzeichnisstruktur

```
apps/app/
├── app/(app)/nutrition/
│   ├── page.tsx                  # Hauptseite (5-Tab Layout)
│   ├── water/page.tsx            # Water Tracking Page
│   └── shopping-lists/page.tsx  # Einkaufslisten
│
└── modules/nutrition/
    ├── components/               # UI Components
    ├── hooks/                    # Custom Hooks (API-Calls + State)
    ├── stores/                   # Zustand Stores (Client State)
    ├── types/                    # TypeScript Types
    └── data/                     # Statische Daten (nutrient details)
```

---

## Pages

### `nutrition/page.tsx` — Hauptseite

5-Tab Navigation. Jeder Tab lädt seinen Content lazy.

| Tab | Slot | Component | Icon |
|---|---|---|---|
| Tagebuch | 1 | `DiaryView` | 📋 |
| Suche | 2 | `FoodSearchView` | 🔍 |
| Pläne | 3 | `MealPlansView` | 📅 |
| Insights | 4 | `InsightsView` | 📊 |
| Einstellungen | 5 | `PreferencesView` | ⚙️ |

**Header:** Datum-Navigation + KPI-Strip (Kalorien % · Protein % · Wasser %)

---

### `nutrition/water/page.tsx`

Fortschrittsbalken + Quick-Add Buttons + Tages-Log

### `nutrition/shopping-lists/page.tsx`

Liste aller Einkaufslisten + Detail-Ansicht mit Abhak-Funktion

---

## Components

### Core Views (5)

| Component | Beschreibung |
|---|---|
| `DiaryView` | Tagesansicht: Mahlzeiten-Liste + Macro Dashboard + Ghost Entries + Score |
| `FoodSearchView` | Vollständige Food-Suche mit Filtern, Quick-Access Buttons, Ergebnisliste |
| `MealPlansView` | Plan-Liste (alle Quellen) + Plan-Detail + Activation Flow |
| `InsightsView` | Trend-Charts, Heatmap, Cross-Module Summary |
| `PreferencesView` | Diät-Typ, Allergien, Likes/Dislikes, Settings |

---

### Diary Components (10)

| Component | Beschreibung |
|---|---|
| `DailyFoodLog` | Mahlzeiten-Liste für einen Tag (gruppiert nach meal_type) |
| `MealGroup` | Eine Mahlzeit mit ihren Items + Totals |
| `FoodLogEntry` | Einzelner MealItem-Eintrag (Name, Menge, Makros, Delete) |
| `GhostMealEntry` | Ghost Entry aus Meal Plan (pending/confirmed/skipped visuell unterschieden) |
| `GhostConfirmModal` | Modal für manuelle Ghost-Bestätigung (Case 2 aus Flow 4) |
| `MacroDashboard` | SVG Ringe für Protein/Carbs/Fat + Remaining Bar |
| `MacroRing` | Einzelner SVG Fortschritts-Ring |
| `RemainingBar` | "Was fehlt noch" Balken (alle 5 Makros) |
| `NutritionScoreCard` | Score 0–100 mit Status-Farbe und Breakdown |
| `DaySummary` | Abend-Review: Compliance + Score + Flags + Buddy-Empfehlung |

---

### Food Search Components (8)

| Component | Beschreibung |
|---|---|
| `FoodSearch` | Haupt-Suchkomponente mit Input, Filter, Quick-Access Buttons |
| `FoodSearchFilters` | Filter-Panel: Kategorien (L1+L2), Diet-Tags, Sortierung |
| `FoodSearchResults` | Ergebnis-Liste (Custom Foods Section + BLS Foods) |
| `FoodCard` | Einzelnes Suchergebnis: Name, kcal, P/C/F Badges |
| `FoodAmountInput` | Mengen-Eingabe mit Portions-Selector und Live-Nährstoff-Preview |
| `CustomFoodForm` | Formular Custom Food erstellen/bearbeiten |
| `FoodDetail` | Detail-Ansicht eines Foods: alle Nährstoffe, Tier-System |
| `SmartSuggestions` | Personalisierte Vorschläge ohne Suchbegriff |

---

### MealCam Components (3)

| Component | Beschreibung |
|---|---|
| `MealCamButton` | Kamera-Button mit Confidence-Anzeige |
| `MealCamModal` | Kamera/Upload-Interface + Erkennungs-Flow |
| `MealCamComparison` | Plan-Vergleichs-Ansicht (Match/Abweichung/Fehlt/Extra) |

---

### Meal Plan Components (8)

| Component | Beschreibung |
|---|---|
| `MealPlanList` | Liste aller Pläne (assigned/active/completed) mit Source-Badge |
| `MealPlanCard` | Plan-Karte: Name, Quelle, Status, Tage, kcal/Tag |
| `MealPlanDetail` | Plan-Vorschau: Tages-Accordion mit Items |
| `MealPlanActivationModal` | Startdatum + Lifecycle-Wahl + Bestätigung |
| `MealPlanDayView` | Ein Tag innerhalb eines Plans |
| `MealPlanComplianceBar` | Plan-Compliance Fortschrittsbalken |
| `GhostEntryList` | Alle heutigen Ghost Entries aus aktivem Plan |
| `LifecyclePicker` | once / rollover / sequence Auswahl mit visueller Sequenz-Preview |

---

### Recipe Components (5)

| Component | Beschreibung |
|---|---|
| `RecipeList` | Liste eigener + zugewiesener Rezepte |
| `RecipeCard` | Rezept-Karte: Name, Portionen, kcal/Portion, Source-Badge |
| `RecipeBuilder` | Rezept erstellen/bearbeiten mit Zutaten-Liste + Live-Nährstoffe |
| `RecipeDetail` | Rezept-Detail: Zutaten, Anleitung, Nährstoffe pro Portion |
| `RecipeLogModal` | Portionen wählen + Meal Type → Als Mahlzeit loggen |

---

### Shopping List Components (3)

| Component | Beschreibung |
|---|---|
| `ShoppingListView` | Einkaufslisten-Übersicht |
| `ShoppingListDetail` | Liste mit Abhak-Items, Fortschrittsbalken (X von N) |
| `ShoppingListItem` | Einzelne Position: Name, Menge, Einheit, Checkbox |

---

### Tracking Widgets (4)

| Component | Beschreibung |
|---|---|
| `WaterTracker` | Tages-Fortschritt + Quick-Add + Log-Liste |
| `WaterQuickAdd` | Quick-Add Buttons (konfigurierbare Mengen) |
| `MicroDashboard` | Mikronährstoff-Dashboard mit Tier-System (Traffic-Light) |
| `MicroNutrientCard` | Einzelner Mikronährstoff: aktuell/RDA, Severity-Farbe, Details |

---

### Insights Components (6)

| Component | Beschreibung |
|---|---|
| `TrendChart` | Linien-Chart (7d/14d/30d): Kalorien, Protein, Score |
| `NutrientHeatmap` | 28-Tage Grid: Compliance-Farbe pro Tag |
| `MacroDetail` | Parent/Child Hierarchie (Fette: Gesättigt/Ungesättigt/Omega-3) |
| `DeficitSuggestions` | Food-Empfehlungen basierend auf aktuellen Defiziten |
| `CrossModuleInsights` | Nutrition Score → Dashboard-Karte für Goals |
| `MicroFlagsList` | Aktuelle Mikronährstoff-Warnungen (sortiert nach Severity) |

---

### Settings/Preferences Components (4)

| Component | Beschreibung |
|---|---|
| `DietTypeSelector` | Diät-Typ Auswahl (Chips/Grid) |
| `AllergenSelector` | EU 14 Allergene als Toggle-Chips |
| `PreferenceItemList` | Likes/Dislikes verwalten (food/category/tag) |
| `MealScheduleEditor` | Mahlzeiten-Zeitplan konfigurieren |

---

## Custom Hooks (24)

### Food & Search

| Hook | Beschreibung |
|---|---|
| `useFoodSearch(query, filters)` | Debounced Search mit Kategorie-Filter + Smart Search Toggle |
| `useSmartSearchSuggestions()` | Personalisierte Vorschläge ohne Suchbegriff |
| `useFoodDetail(id)` | Einzelnes Food mit allen Nährstoffen |
| `useFoodCategories()` | Kategorie-Baum (gecacht, selten neu geladen) |
| `useCustomFoods()` | CRUD Custom Foods |
| `useFoodPreferences()` | Präferenzen laden + updaten |
| `useFoodPreferenceItems()` | Likes/Dislikes CRUD |

### Meal Logging

| Hook | Beschreibung |
|---|---|
| `useDailyMeals(date)` | Mahlzeiten des Tages mit Items |
| `useMealActions()` | Meal + Item CRUD (create, delete, copy-day) |
| `useMealItemActions()` | Item hinzufügen, Menge ändern, löschen |
| `useNutritionSummary(date)` | Tages-Aggregat + Compliance + Score + Flags |
| `useDailyTotals(date)` | Schneller Zugriff auf Makro-Totals für Dashboard |

### Meal Plans

| Hook | Beschreibung |
|---|---|
| `useMealPlans(filter?)` | Plan-Liste mit optionalem Status-Filter |
| `useMealPlanDetail(id)` | Plan-Detail mit Days und Items |
| `useMealPlanActions()` | activate, pause, complete, delete |
| `useActivePlanToday()` | Heutige Ghost Entries aus aktivem Plan |
| `usePlanCompliance(id)` | Compliance-Daten eines Plans |
| `useGhostEntryActions()` | confirm, skip (mit oder ohne MealCam) |

### Tracking

| Hook | Beschreibung |
|---|---|
| `useWaterLog(date)` | Water-Logs + Totals + Target |
| `useWaterActions()` | Eintrag hinzufügen, löschen |
| `usePendingActions()` | Offene Actions für Buddy-TODO |

### Recipes & Shopping

| Hook | Beschreibung |
|---|---|
| `useRecipes(filter?)` | Rezept-Liste |
| `useRecipeDetail(id)` | Rezept mit Items + berechneten Nährstoffen |
| `useShoppingLists()` | Einkaufslisten + CRUD |

---

## Zustand Stores (3)

### `stores/foodSearchStore.ts`

```typescript
interface FoodSearchStore {
  // State
  query: string;
  filters: FoodSearchFilters;
  selectedCategory: FoodCategory | null;
  isSmartSearch: boolean;
  recentFoodIds: string[];    // Zuletzt geloggte (persisted in localStorage)
  favoriteFoodIds: string[];  // Persistiert

  // Actions
  setQuery: (q: string) => void;
  setFilter: (key: keyof FoodSearchFilters, value: unknown) => void;
  toggleSmartSearch: () => void;
  addRecentFood: (id: string) => void;
}
```

### `stores/diaryStore.ts`

```typescript
interface DiaryStore {
  // State
  selectedDate: string;       // YYYY-MM-DD
  selectedMealType: MealType | null;  // für neues Item
  addingToMealId: string | null;

  // Actions
  setDate: (date: string) => void;
  setSelectedMealType: (type: MealType | null) => void;
  setAddingToMeal: (mealId: string | null) => void;
}
```

### `stores/mealPlanStore.ts`

```typescript
interface MealPlanStore {
  // State
  activePlanId: string | null;
  activationModal: {
    open: boolean;
    planId: string | null;
  };

  // Actions
  setActivePlan: (id: string | null) => void;
  openActivationModal: (planId: string) => void;
  closeActivationModal: () => void;
}
```

---

## Type Definitions

```
modules/nutrition/types/
├── food.ts          Food, CustomFood, FoodNutrient, FoodCategory, FoodTag
├── meal.ts          Meal, MealItem, DailyMacros
├── plan.ts          MealPlan, MealPlanDay, MealPlanItem, MealPlanLog, PlanCompliance
├── recipe.ts        Recipe, RecipeItem, ShoppingList, ShoppingListItem
├── preferences.ts   FoodPreference, FoodPreferenceItem
├── scoring.ts       NutritionScore, MicroFlag, WaterCompliance, PendingAction
└── api.ts           ApiResponse<T>, Paginated<T>
```

---

## Statische Daten

### `data/nutrientDetails.ts`

42+ Mikronährstoff-Details für UI-Anzeige.

```typescript
interface NutrientDetail {
  code: string;          // BLS-Code
  name_de: string;
  name_en: string;
  name_th: string;
  icon: string;          // Emoji
  group: string;
  tier: 1 | 2 | 3;
  unit: string;
  rda_male: number;
  rda_female: number;
  benefits: string[];    // Was dieser Nährstoff tut
  deficit_symptoms: string[];
  surplus_symptoms: string[];
  food_sources: string[];  // Beste Quellen (display-only)
}
```

### `data/mealScheduleDefaults.ts`

Standard-Mahlzeiten-Zeitplan der als Settings-Default gilt.

```typescript
const DEFAULT_MEAL_SCHEDULE = [
  { id: 'breakfast',    name_de: 'Frühstück',   time: '07:00', enabled: true },
  { id: 'snack1',       name_de: 'Snack 1',     time: '10:00', enabled: true },
  { id: 'lunch',        name_de: 'Mittagessen', time: '12:30', enabled: true },
  { id: 'snack2',       name_de: 'Snack 2',     time: '15:00', enabled: true },
  { id: 'dinner',       name_de: 'Abendessen',  time: '18:30', enabled: true },
  { id: 'pre_workout',  name_de: 'Pre-Workout', time: '17:00', enabled: false },
  { id: 'post_workout', name_de: 'Post-Workout',time: '19:00', enabled: false },
];
```

---

## i18n

400+ Übersetzungs-Keys in DE / EN / TH (TH initial leer).

```
apps/app/i18n/translations/
  de.ts    — Deutsch (vollständig)
  en.ts    — English (vollständig)
  th.ts    — Thai (initial leer, Keys vorhanden)

Namespace: 'nutrition'

Schlüssel-Beispiele:
  nutrition.diary.title              = "Tagebuch"
  nutrition.meals.breakfast          = "Frühstück"
  nutrition.ghost.confirm_btn        = "Bestätigen"
  nutrition.ghost.skip_btn           = "Überspringen"
  nutrition.search.placeholder       = "Lebensmittel suchen..."
  nutrition.search.most_used_btn     = "Meist genutzt"
  nutrition.search.custom_btn        = "Eigene Foods"
  nutrition.score.status_ok          = "Ziele erfüllt"
  nutrition.score.status_warn        = "Verbesserungsbedarf"
  nutrition.score.status_block       = "Ziele weit verfehlt"
  nutrition.plan.source_coach        = "Von {coach_name}"
  nutrition.plan.source_marketplace  = "Gekauft"
  nutrition.plan.lifecycle_once      = "Einmalig"
  nutrition.plan.lifecycle_rollover  = "Wiederholend"
  nutrition.plan.lifecycle_sequence  = "Gefolgt von..."
  nutrition.water.quick_add          = "+{amount}ml"
  nutrition.micro.deficit_critical   = "Kritisch niedrig"
  nutrition.shopping.checked_count   = "{checked} von {total} erledigt"
```

---

## Shared Contracts (packages/contracts/src/nutrition/)

```
food.ts           Food, CustomFood, FoodCategory, FoodTag, FoodAlias
meal.ts           Meal, MealItem, DailyMacros, MealType
recipe.ts         Recipe, RecipeItem, ShoppingList, ShoppingListItem
plan.ts           MealPlan, MealPlanDay, MealPlanItem, MealPlanLog
preference.ts     FoodPreference, FoodPreferenceItem
target.ts         NutritionTarget
summary.ts        DailyNutritionSummary, RangeSummary
scoring.ts        NutritionScore, MicroFlag, WaterCompliance, PendingAction
for-ai.ts         BuddyContext, GoalsContribution
```

Alle Types werden von Frontend und Backend gemeinsam genutzt.
Kein Typ wird doppelt definiert.
