# Nutrition Module — API

**Base URL:** `http://localhost:5100`
**Auth:** JWT via `Authorization: Bearer <token>` (globalAuthMiddleware)
**DB:** `search_path = nutrition,public`

---

## Route-Module Übersicht

| Route-Datei | Prefix | Beschreibung |
|---|---|---|
| `foods.ts` | `/api/nutrition/foods` | Food-DB CRUD + Search |
| `foods-smart-search.ts` | `/api/nutrition/foods/smart-search` | Preference-aware Search |
| `meals.ts` | `/api/nutrition/meals` | Meal + MealItem CRUD |
| `water.ts` | `/api/nutrition/water` | Water-Log CRUD |
| `weight.ts` | `/api/nutrition/weight` | Weight-Log CRUD |
| `targets.ts` | `/api/nutrition/targets` | Nutrition Targets CRUD |
| `summary.ts` | `/api/nutrition/summary` | Daily/Range Aggregates |
| `recipes.ts` | `/api/nutrition/recipes` | Recipe CRUD |
| `custom-foods.ts` | `/api/nutrition/custom-foods` | Custom Foods CRUD |
| `meal-plans.ts` | `/api/nutrition/meal-plans` | Meal Plan Management |
| `settings.ts` | `/api/nutrition/settings` | User Settings Key-Value |
| `mealcam.ts` | `/api/nutrition/mealcam` | KI Meal Recognition |
| `food-preferences.ts` | `/api/nutrition/food-preferences` | Diät/Allergie Preferences |
| `for-ai.ts` | `/api/nutrition/for-ai` | Compact Context für Buddy AI |

> **Wichtig:** Smart Search wird VOR dem generellen Foods-Router gemounted, damit `/foods/smart-search` nicht als `/foods/:id` interpretiert wird.

---

## 1. Foods — `/api/nutrition/foods`

### `GET /api/nutrition/foods`
Food-Suche mit Text-Match, Kategorie-Filter und Paginierung.

| Param | Typ | Default | Beschreibung |
|---|---|---|---|
| `q` | string | `''` | Suchbegriff (name_de, name_en, category) |
| `category` | string | — | Kategorie-Filter (ILIKE) |
| `limit` | number | `20` | Max Ergebnisse |
| `offset` | number | `0` | Paginierung |

Response: `{ ok, data: { hits[], query, limit, offset, estimatedTotalHits } }`

### `GET /api/nutrition/foods/categories`
Alle einzigartigen Kategorien.

### `GET /api/nutrition/foods/:id`
Einzelnes Food per UUID.

### `GET /api/nutrition/foods/favorites`
Favoriten des Users (JOIN mit `food_favorites`).

### `POST /api/nutrition/foods/:id/favorite`
Food als Favorit markieren.

### `DELETE /api/nutrition/foods/:id/favorite`
Favorit entfernen.

---

## 2. Smart Search — `/api/nutrition/foods/smart-search`

### `GET /api/nutrition/foods/smart-search`
Preference-aware Suche mit Database-Level Scoring.

| Param | Typ | Default | Beschreibung |
|---|---|---|---|
| `q` | string | `''` | Suchbegriff |
| `category` | string | — | Kategorie-Filter |
| `limit` | number | `20` | Max Ergebnisse |
| `offset` | number | `0` | Paginierung |
| `includeCustom` | boolean | `false` | Custom Foods einschließen |

**Scoring-Logik:** Lädt `user_food_preferences` → Preference +100/−100 → Allergen-Ausschluss → Diät-Filter → Keto-Bonus → Name-Match Boost.

### `GET /api/nutrition/foods/smart-search/suggestions`
Personalisierte Food-Vorschläge basierend auf Preferences. Fallback: zufällige diät-kompatible Foods.

---

## 3. Meals — `/api/nutrition/meals`

### `GET /api/nutrition/meals?date=YYYY-MM-DD`
Mahlzeiten für ein Datum (default: heute). Meals mit aggregierten Items-Totals.

### `POST /api/nutrition/meals`
```json
{ "date": "2026-03-25", "meal_type": "lunch", "notes": "Optional" }
```

### `PUT /api/nutrition/meals/:id`
meal_type, notes updaten.

### `DELETE /api/nutrition/meals/:id`
Mahlzeit + alle Items löschen (CASCADE).

### `POST /api/nutrition/meals/:mealId/items`
Item zu Mahlzeit hinzufügen. Nährstoffwerte auto-berechnet: `food_nutrient × (amount_g / 100)`.
```json
{ "food_id": "uuid", "food_source": "bls", "food_name": "Hähnchenbrust", "amount_g": 200 }
```

### `PUT /api/nutrition/meals/:mealId/items/:itemId`
Meal-Item updaten (amount_g, food_id).

### `DELETE /api/nutrition/meals/:mealId/items/:itemId`
Einzelnes Item löschen.

### `POST /api/nutrition/meals/copy-day`
```json
{ "from_date": "2026-03-24", "to_date": "2026-03-25" }
```

---

## 4. Water — `/api/nutrition/water`

### `GET /api/nutrition/water?date=YYYY-MM-DD`
### `POST /api/nutrition/water`
```json
{ "date": "2026-03-25", "amount_ml": 250 }
```
### `DELETE /api/nutrition/water/:id`

---

## 5. Weight — `/api/nutrition/weight`

### `GET /api/nutrition/weight?days=30`
### `POST /api/nutrition/weight`
```json
{ "date": "2026-03-25", "weight_kg": 85.5, "body_fat_pct": 15.0, "notes": "Morgens, nüchtern" }
```
### `DELETE /api/nutrition/weight/:id`

---

## 6. Targets — `/api/nutrition/targets`

### `GET /api/nutrition/targets`
Aktives Nutrition Target des Users.

### `POST /api/nutrition/targets`
Neues Target anlegen (deaktiviert vorheriges).
```json
{
  "kcal_target": 2600, "protein_g_target": 180,
  "carbs_g_target": 280, "fat_g_target": 75,
  "fiber_g_target": 30, "water_ml_target": 3000,
  "user_level": "intermediate"
}
```

### `PUT /api/nutrition/targets/:id`

---

## 7. Summary — `/api/nutrition/summary`

### `GET /api/nutrition/summary?date=YYYY-MM-DD`
Tagesübersicht mit Aggregaten aus `daily_nutrition_summary` View.

### `GET /api/nutrition/summary/range?from=YYYY-MM-DD&to=YYYY-MM-DD`
Aggregat über Zeitraum (täglich + Durchschnittswerte).

---

## 8. Recipes — `/api/nutrition/recipes`

### `GET /api/nutrition/recipes`
### `POST /api/nutrition/recipes`
```json
{
  "name": "Protein Shake", "servings": 1, "prep_time_min": 5,
  "items": [
    { "food_id": "uuid", "name": "Whey Protein", "amount_g": 30 },
    { "food_id": "uuid", "name": "Milch", "amount_g": 300 }
  ]
}
```
### `GET /api/nutrition/recipes/:id`
### `PUT /api/nutrition/recipes/:id`
### `DELETE /api/nutrition/recipes/:id` (CASCADE auf Items)
### `POST /api/nutrition/recipes/:id/log`
Rezept als Mahlzeit loggen (erstellt Meal + Items aus Rezept-Zutaten).

---

## 9. Custom Foods — `/api/nutrition/custom-foods`

### `GET /api/nutrition/custom-foods`
### `POST /api/nutrition/custom-foods`
```json
{
  "name_de": "Mein Proteinriegel", "kcal": 200,
  "protein_g": 20, "carbs_g": 22, "fat_g": 8,
  "barcode": "4012345678901", "brand": "MyProtein"
}
```
### `PUT /api/nutrition/custom-foods/:id`
### `DELETE /api/nutrition/custom-foods/:id`

> ⚠️ **Bug:** Route gibt 500 zurück weil `:id` den String "custom" als UUID parst. Fix: Route-Reihenfolge anpassen.

---

## 10. Meal Plans — `/api/nutrition/meal-plans`

### `GET /api/nutrition/meal-plans`
### `POST /api/nutrition/meal-plans`
```json
{
  "name": "Cutting Week", "target_calories": 2200, "days_count": 7,
  "days": [{
    "day_number": 1, "name": "Montag",
    "items": [{ "meal_type": "breakfast", "food_id": "uuid", "name": "Haferflocken", "amount_g": 80 }]
  }]
}
```
### `GET /api/nutrition/meal-plans/:id`
### `PUT /api/nutrition/meal-plans/:id`
### `DELETE /api/nutrition/meal-plans/:id`
### `POST /api/nutrition/meal-plans/:id/activate`
Plan aktivieren (deaktiviert alle anderen).

---

## 11. Settings — `/api/nutrition/settings`

### `GET /api/nutrition/settings`
Alle Settings als Object (Key-Value JSONB Store).

### `GET /api/nutrition/settings/meal_schedule`
Default Meal Schedule:
```json
[
  { "id": "breakfast", "name": "Frühstück", "time": "07:00", "enabled": true },
  { "id": "snack1", "name": "Snack 1", "time": "10:00", "enabled": true },
  { "id": "lunch", "name": "Mittagessen", "time": "12:00", "enabled": true },
  { "id": "snack2", "name": "Snack 2", "time": "15:00", "enabled": true },
  { "id": "dinner", "name": "Abendessen", "time": "18:00", "enabled": true }
]
```
### `GET /api/nutrition/settings/:key`
### `PUT /api/nutrition/settings/:key`
```json
{ "value": { "any": "json value" } }
```

---

## 12. MealCam — `/api/nutrition/mealcam`

### `POST /api/nutrition/mealcam/scan`
**Body:** `FormData` mit `image` Feld oder Base64.

**Response:**
```json
{
  "ok": true,
  "data": {
    "detected_foods": [
      { "name": "Reis", "confidence": 0.92, "estimated_amount_g": 200, "matched_food_id": "uuid" }
    ]
  }
}
```

Confidence Thresholds: `≥0.85 Auto-Accept | 0.50–0.84 User Review | 0.30–0.49 Suggestions | <0.15 Manual`

---

## 13. Food Preferences — `/api/nutrition/food-preferences`

### `GET /api/nutrition/food-preferences`
### `PUT /api/nutrition/food-preferences`
UPSERT on `user_id`. Felder: `diet_type`, `allergies[]`, `liked_foods[]`, `disliked_foods[]`, `preferred_cuisines[]`, `cooking_skill`, `prep_time_max`, `budget_level`.

---

## 14. For-AI — `/api/nutrition/for-ai`

### `GET /api/nutrition/for-ai`
```json
{
  "dailyStatus": "65% protein target, 71% calories",
  "lastMeal": "3h ago",
  "recommendations": ["more protein"]
}
```

---

## Health Checks

### `GET /api/nutrition/health`
```json
{ "ok": true, "module": "nutrition", "port": 5100 }
```

---

## Error Format

```json
{ "ok": false, "error": "Human readable message", "code": "ERROR_CODE", "details": null }
```

HTTP Status Codes: `400` Bad Request · `404` Not Found · `500` Internal Error
