# SPEC_07 — API Patch-Notizen April 2026

Ergänzungen zu `SPEC_07_API.md`.

---

## Neu: `GET /api/nutrition/nutrients/:code/top-foods`

Dynamischer Top-Foods-Endpoint statt statischem `food_sources[]` Array in SPEC_10.
Gibt die 10 Foods mit dem höchsten Wert für einen Nährstoff zurück.

```
GET /api/nutrition/nutrients/VITD/top-foods?limit=10
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "nutrient_code": "VITD",
    "nutrient_name_de": "Vitamin D",
    "unit": "µg",
    "foods": [
      {
        "food_id": "uuid",
        "name_display": "Lachs (roh)",
        "value_per_100g": 11.2,
        "category_name_de": "Fetter Seefisch"
      },
      {
        "food_id": "uuid",
        "name_display": "Hering (roh)",
        "value_per_100g": 9.8,
        "category_name_de": "Fetter Seefisch"
      }
    ]
  }
}
```

**Query:**
```sql
SELECT
  f.id,
  f.name_display,
  fn.value AS value_per_100g,
  fc.name_de AS category_name_de
FROM nutrition.foods f
JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
  AND fn.nutrient_code = $1
JOIN nutrition.food_categories fc ON fc.id = f.category_id
ORDER BY fn.value DESC
LIMIT $2
```

---

## Neu: Allergen-Filter für Custom Foods in Smart Search

`GET /api/nutrition/foods/smart-search` filtert Custom Foods bereits auf
`custom_allergens[]` analog zu BLS `allergen_*` Tags.

**Ergänzung im Smart Search Handler:**
```typescript
// Zusätzlicher Filter für Custom Foods
if (userAllergies.length > 0) {
  // BLS: WHERE NOT EXISTS (food_tag mit allergen_code in userAllergies)
  // Custom: WHERE NOT (userAllergies && custom_allergens)
  // (PostgreSQL Array-Overlap Operator &&)
}
```

---

## Geändert: Meal Plan Items — 409 bei aktivem Plan

`PUT /api/nutrition/meal-plans/:id/days/:dayId/items/:itemId`
`DELETE /api/nutrition/meal-plans/:id/days/:dayId/items/:itemId`

Wenn `MealPlan.status = 'active'`:

**Response: 409 Conflict**
```json
{
  "ok": false,
  "error": "PLAN_ACTIVE_IMMUTABLE",
  "message": "MealPlanItems können nicht geändert werden wenn der Plan aktiv ist. Plan pausieren, Kopie erstellen und neu aktivieren.",
  "hint": "POST /api/nutrition/meal-plans/:id/pause"
}
```

---

## Neu: Quick-Add Makros (ohne Food)

`POST /api/nutrition/meals/:mealId/items/quick-add`

Makros direkt eingeben ohne Food-Referenz.

**Body:**
```json
{
  "label": "Meal Prep Bowl",
  "enercc": 520,
  "prot625": 45,
  "fat": 18,
  "cho": 35,
  "fibt": 6
}
```

**Was intern passiert:**
- MealItem ohne food_id/custom_food_id
- `food_source = 'manual'`
- `food_name = label` (oder "Manuelle Eingabe" wenn leer)
- `nutrients JSONB = {}` — keine Mikros
- Makro-Spalten direkt befüllen

**Response:** Standard MealItem-Objekt mit `food_source: 'manual'`

---

## Neu: Barcode Lookup (Custom Foods)

`GET /api/nutrition/foods/custom/barcode/:barcode`

Sucht Custom Food des eingeloggten Users mit diesem Barcode.

**Response (gefunden):**
```json
{
  "ok": true,
  "data": {
    "found": true,
    "food": { ...CustomFood Objekt... }
  }
}
```

**Response (nicht gefunden):**
```json
{
  "ok": true,
  "data": {
    "found": false,
    "prefill": { "barcode": "4012345678901" }
  }
}
```

Client öffnet bei `found: false` das Custom Food Formular mit vorausgefülltem Barcode.

---

## Geändert: Water Summary — food_water_ml hinzufügen

`GET /api/nutrition/water` Response erweitern:

```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "logged_ml": 2000,
    "food_ml": 620,
    "total_ml": 2620,
    "target_ml": 3000,
    "pct": 87.3,
    "status": "warn",
    "logs": [...]
  }
}
```

`food_ml` = `SUM(meal_items.water_g × 10)` für dieses Datum (g → ml).
Aus `DailyNutritionSummary` VIEW gelesen — kein zusätzlicher JOIN nötig.
