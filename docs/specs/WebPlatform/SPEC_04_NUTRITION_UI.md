# SPEC_04 — Nutrition UI
> WebPlatform | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/Nutrition/01_current_specs/ (Backend-Spec)

---

## 1. Übersicht

Nutrition ist das komplexeste Modul. 117-Nährstoff-Tracking-System auf Basis der BLS-Datenbank.
Accent: `--acc-nutri` (clay/amber, oklch(0.78 0.10 70)).

**Datenbank:** Ausschließlich BLS (Bundeslebensmittelschlüssel), ~10.840 Einträge.
Kein USDA, kein OpenFoodFacts.

---

## 2. Routing

```
/nutrition               — Diary (default)
/nutrition/foods         — Food Database + Search
/nutrition/planner       — Meal Planner (Woche)
/nutrition/insights      — Trends, Heatmap, Deep-Dive
```

---

## 3. Tab-Navigation

4 Tabs im Modul-Header:

| Tab | Route | Default? |
|---|---|---|
| Diary | `/nutrition` | ✅ |
| Foods | `/nutrition/foods` | — |
| Planner | `/nutrition/planner` | — |
| Insights | `/nutrition/insights` | — |

---

## 4. Diary (Tab 1)

### Layout

```
[Datums-Navigation  ← Heute →]
[Header: Macro-KPI-Strip]

[Meal-List]
  ├── Breakfast Card
  │     ├── Meal Header (Name, Zeit, Total-Makros)
  │     └── Food Item Rows
  │           Item: Name · Menge · P/C/F/kcal · [···]
  │
  ├── Lunch Card
  └── ...

[Smart Suggestions Card]
[Pre-Workout Optimizer Card]  (erscheint 2h vor Training-Slot)
[Hydration Card]
```

### Macro-KPI-Strip

Direkt unter Topbar. 4 Werte inline:

```tsx
<MacroStrip>
  <MacroKpi label="Calories" current={1840} target={2400} unit="kcal" />
  <MacroKpi label="Protein"  current={142}  target={180}  unit="g" />
  <MacroKpi label="Carbs"    current={180}  target={240}  unit="g" />
  <MacroKpi label="Fat"      current={52}   target={70}   unit="g" />
</MacroStrip>
```

Jeder KPI: Zahl (Mono) + Fortschrittsbalken (dünn, 2px, Accent-Farbe).

### Meal Cards

```tsx
<MealCard meal={meal}>
  <MealHeader
    name={meal.type}          // "Breakfast"
    time="08:30"
    totals={{ kcal, protein, carbs, fat }}
    onAddFood={() => openFoodSearch(meal.id)}
  />
  <FoodItemTable items={meal.items} />
</MealCard>
```

### FoodItemTable

```
Name                    Menge     Protein  Carbs   Fat    kcal   [···]
Haferflocken (BLS)      80 g      10 g     54 g    7 g    304   [···]
Vollmilch               200 ml    7 g      10 g    7 g    138   [···]
```

- `table-layout: fixed; width: 100%`
- Einheit mit 3px Abstand zum Wert (eigenes Span, opacity 0.6)
- Action-Spalte (···): kein Border-Bottom, padding-right: 0
- Click auf Zeile → Food-Detail-Modal (alle 117 Nährstoffe)
- Hover: `surface-hover` Background

### Smart Suggestions Card

```tsx
<SmartSuggestionsCard>
  <SuggestionItem
    label="Same as yesterday"
    items={["Haferflocken", "Vollmilch", "Banane"]}
    onAdd={addSameAsYesterday}
  />
  <SuggestionItem
    label="High adherence"
    items={topAdherenceItems}
    onAdd={addItem}
  />
</SmartSuggestionsCard>
```

### Pre-Workout Optimizer

Erscheint als Card im Diary, wenn ein Training in 60–120 Minuten geplant ist.

```tsx
<PreWorkoutOptimizer
  trainingTime="14:30"
  windowMinutes={90}
  suggestions={{
    calories: 350,
    protein: 25,
    carbs: 45,
    fat: 10,
  }}
/>
```

### Header-Actions

```
[Recalc Macros] [Add Meal] [MealCam]
```

"Recalc Macros" → MacroCalculatorModal (3-Step Wizard).

---

## 5. MealCam (Online-only Feature)

Kamera/Upload-Interface → KI-Erkennung → Review → Bestätigung.

### Flow (3 Steps)

```
Step 1: Capture
  ├── Camera-Capture Button
  ├── File-Upload
  └── URL-Input (für Desktop)

Step 2: AI Review
  ├── Erkannte Foods als Overlay-Labels
  ├── Confidence-Score pro Item
  ├── Edit: Menge per Slider / Input
  └── Remove / Add-Missing Buttons

Step 3: Confirm
  ├── Summary: Erkannte Items + Makros
  ├── Mahlzeit-Typ auswählen
  └── [Speichern]
```

### Implementierung

```tsx
<MealCamModal onConfirm={addMealCamResult}>
  <CameraCapture onCapture={setCapturedImage} />
  <AIRecognitionOverlay
    image={capturedImage}
    detectedItems={recognizedFoods}
    onEdit={editItem}
    onRemove={removeItem}
    onAdd={addMissingFood}
  />
  <ConfirmSummary items={finalItems} onSave={saveMeal} />
</MealCamModal>
```

**Hinweis:** MealCam-API läuft über den MealCam-Vision-Service (RTX 5090 / Qwen3-VL). Offline-Guard: Button disabled + Hinweis wenn `syncState === 'offline'`.

---

## 6. Foods / BLS-Datenbank (Tab 2)

### Suche und Filter

```tsx
<FoodSearchView>
  <SearchInput placeholder="Search BLS database... (10.840 entries)" />
  <CategoryFilter categories={['Grains', 'Dairy', 'Meat', 'Vegetables', ...]} />
  <FoodResultTable
    items={searchResults}
    onRowClick={openFoodDetail}
    onAdd={addToCurrentMeal}
  />
</FoodSearchView>
```

### Food Detail Modal

Öffnet bei Click auf Tabellenzeile.

```tsx
<FoodDetailModal food={selectedFood}>
  <FoodHeader name={food.name} source="BLS" />
  <PortionSelector value={portion} onChange={setPortion} />

  <NutrientSection title="Macros">
    <NutrientRow name="Calories" value={...} unit="kcal" />
    <NutrientRow name="Protein" value={...} unit="g" />
    <NutrientRow name="Carbs" value={...} unit="g" />
    <NutrientRow name="Fat" value={...} unit="g" />
  </NutrientSection>

  {/* Alle 117 Nährstoffe in Parent/Child-Gruppen */}
  <NutrientTree food={food} portion={portion} />

  <AllergenList allergens={food.allergens} />
  <AddToMealButton food={food} portion={portion} />
</FoodDetailModal>
```

---

## 7. 117-Nährstoff-Tree (Nutrient Detail)

Hierarchische Darstellung aller Nährstoffe. Wird in Food Detail Modal und im Insights-Tab verwendet.

### Struktur (Parent/Child, 3 Ebenen)

```
Energie
  └── Kalorien (kcal)

Makronährstoffe
  ├── Protein
  │     ├── Essentielle Aminosäuren (8)
  │     └── Nicht-essentielle (10)
  ├── Kohlenhydrate
  │     ├── Zucker (Glucose, Fructose, ...)
  │     ├── Stärke
  │     ├── Ballaststoffe (löslich / unlöslich)
  │     └── Zuckeralkohole
  └── Fette
        ├── Gesättigte Fettsäuren
        ├── Einfach ungesättigt (MUFA)
        └── Mehrfach ungesättigt (PUFA)
              ├── Omega-3 (ALA, EPA, DHA)
              └── Omega-6

Vitamine (fettlöslich + wasserlöslich)
  ├── A, D3, E, K1, K2
  └── B1, B2, B3, B5, B6, B7, B9, B12, C

Mineralstoffe + Spurenelemente
  ├── Ca, Mg, P, K, Na
  └── Fe, Zn, Cu, Mn, I, Se, Mo, Cr, F
```

### NutrientRow Komponente

```tsx
<NutrientRow
  name="Omega-3"
  value={2.4}
  unit="g"
  dailyTarget={3.0}
  ul={null}               // Kein Tolerable Upper Level
  pct={80}
  status="ok"             // ok | warn | over
  expandable={true}
  depth={2}               // Einrückung
/>
```

Click auf expandable Row → zeigt Child-Rows mit Animation.
Row-Status: `ok` (neutral), `warn` (< 50% DGE), `over` (> UL).

### NutrientDetailModal

Click auf Info-Icon pro Row → Modal mit:
- Was ist dieser Nährstoff?
- Min / DGE / Tolerable Upper Level (UL)
- Probleme bei Mangel
- Probleme bei Überdosierung
- Top Food Sources (5 BLS-Lebensmittel)
- Verlinkung zum verwandten Modul (z.B. Supplements für Mikronährstoffe)

---

## 8. Meal Planner (Tab 3)

### Wochen-Grid

```tsx
<MealPlannerView>
  <WeekNav week={currentWeek} onChange={setWeek} />
  <WeekGrid
    days={weekDays}
    mealTypes={['Breakfast', 'Lunch', 'Dinner', 'Snacks']}
    onCellClick={openCellEditor}
  />
  <PlanActions>
    <Button onClick={openRecipeBuilder}>New Recipe</Button>
    <Button onClick={openMacroCalculator}>Recalc Targets</Button>
  </PlanActions>
</MealPlannerView>
```

### Recipe Builder Modal

```tsx
<RecipeBuilderModal>
  <RecipeName />
  <IngredientSearch onAdd={addIngredient} />
  <IngredientList
    ingredients={recipe.ingredients}
    onAmountChange={updateAmount}
    onRemove={removeIngredient}
  />
  <LiveMacroTotal macros={calculateTotals(recipe)} />
  <ServingSizeSelector />
  <SaveRecipeButton />
</RecipeBuilderModal>
```

### Macro Calculator Modal (3-Step)

```
Step 1: Baseline
  — Gewicht, Größe, Alter, Geschlecht
  → Berechnet BMR (Mifflin-St-Jeor)

Step 2: Goal
  — Aktivitätslevel (Multiplikator)
  — Ziel: Bulk / Maintain / Cut
  → Berechnet TDEE + Anpassung

Step 3: Macros
  — Protein-Priorität (0.8–2.5 g/kg)
  — Fett-Minimum (0.8 g/kg)
  → Zeigt finales Makro-Split
  → [Apply Targets]
```

---

## 9. Insights (Tab 4)

### Sub-Bereiche

```tsx
<NutritionInsightsView>
  <InsightsTabs>
    <InsightsTab label="30d Trends">
      <MacroTrendChart data={last30Days} />
      <MicroHighlights deficits={topDeficits} excesses={topExcesses} />
    </InsightsTab>

    <InsightsTab label="Heatmap">
      <NutritionHeatmapView nutrients={top12Nutrients} days={90} />
    </InsightsTab>

    <InsightsTab label="Nutrient Deep-Dive">
      <NutrientTree mode="insights" userId={userId} dateRange={last30Days} />
    </InsightsTab>
  </InsightsTabs>
</NutritionInsightsView>
```

### Nutrition Heatmap

GitHub-Contribution-Style. 90d × 12 Top-Nährstoffe.
Farb-Intensität: % DGE (0% = leer, 100%+ = voll).

---

## 10. Context Panel (Nutrition)

```tsx
CONTEXT_DATA.nutrition = {
  buddy: {
    state: 'idle',
    message: 'Noch 38g Protein. Kleiner Schütteli vor dem Schlafen = perfekt.',
  },
  insights: [
    { type: 'warn', text: 'Vitamin D unter 50% DGE — 5. Tag in Folge' },
    { type: 'pos',  text: 'Omega-3 Ziel heute erreicht' },
    { type: 'info', text: '117 nutrients · BLS 10.840 Einträge' },
  ],
  quickActions: ['Log Meal', 'Open MealCam', 'Search Food', 'View Targets'],
};
```

---

## 11. Acceptance Criteria

```
[ ] Diary zeigt heutige Mahlzeiten korrekt
[ ] FoodItemTable nie breiter als Card (table-layout: fixed)
[ ] MealCam disabled bei Offline-State
[ ] Nährstoff-Tree expandiert/kollabiert korrekt (3 Ebenen)
[ ] NutrientDetailModal für alle 117 Nährstoffe korrekt
[ ] BLS-Suche zeigt "BLS" als Source — kein USDA, kein OFF
[ ] MacroCalculator berechnet TDEE korrekt
[ ] RecipeBuilder zeigt Live-Makro-Total
[ ] Heatmap 90d × 12 Nährstoffe, kein Overflow
[ ] MealCam Flow 3 Steps — Cancel jederzeit möglich
```
