# Nutrition API Documentation

## Base URL

```
http://localhost:5100
```

## Authentication

Alle Endpoints benötigen JWT-Token via `Authorization: Bearer <token>` Header.
Auth wird durch `globalAuthMiddleware` (aus `src/api/shared/auth-middleware.ts`) gehandhabt.

**User-ID** wird aus dem JWT extrahiert und als `c.get('userId')` bereitgestellt.

## Entrypoint

**Datei:** `src/api/nutrition/index.ts`

```typescript
// Bootstrap: DB init → Hono serve on port 5100
async function bootstrap() {
  await initNutritionDb();  // Sets search_path to nutrition,public
  serve({ fetch: app.fetch, port: 5100 });
}
```

**Datei:** `src/api/nutrition/server.ts` — Route-Mounting, CORS, Error Handler

---

## Route-Module Übersicht

| Route | Datei | Beschreibung |
|-------|-------|-------------|
| `/api/nutrition/foods` | `routes/foods.ts` | Food-DB CRUD + Search |
| `/api/nutrition/foods/smart-search` | `routes/foods-smart-search.ts` | Preference-aware Search |
| `/api/nutrition/meals` | `routes/meals.ts` | Meal + MealItem CRUD |
| `/api/nutrition/water` | `routes/water.ts` | Water-Log CRUD |
| `/api/nutrition/weight` | `routes/weight.ts` | Weight-Log CRUD |
| `/api/nutrition/targets` | `routes/targets.ts` | Nutrition Targets CRUD |
| `/api/nutrition/summary` | `routes/summary.ts` | Daily/Range Aggregates |
| `/api/nutrition/recipes` | `routes/recipes.ts` | Recipe CRUD |
| `/api/nutrition/custom-foods` | `routes/custom-foods.ts` | Custom Foods CRUD |
| `/api/nutrition/meal-plans` | `routes/meal-plans.ts` | Meal Plan Management |
| `/api/nutrition/settings` | `routes/settings.ts` | User Settings Key-Value |
| `/api/nutrition/mealcam` | `routes/mealcam.ts` | AI Meal Recognition |
| `/api/nutrition/food-preferences` | `routes/food-preferences.ts` | Diät/Allergie Preferences |
| `/api/nutrition/for-ai` | `routes/for-ai.ts` | Compact Context für Buddy AI |

**Wichtig:** Smart Search wird VOR dem generellen Foods-Router gemounted, damit `/foods/smart-search` nicht als `/foods/:id` interpretiert wird.

---

## 1. Foods — `/api/nutrition/foods`

**Datei:** `src/api/nutrition/routes/foods.ts`

### GET `/api/nutrition/foods`

Food-Suche mit Text-Match, Kategorie-Filter und Paginierung.

**Query-Parameter:**

| Param | Typ | Default | Beschreibung |
|-------|-----|---------|-------------|
| `q` | string | `''` | Suchbegriff (name_de, name_en, category) |
| `category` | string | — | Kategorie-Filter (ILIKE) |
| `limit` | number | `20` | Max Ergebnisse |
| `offset` | number | `0` | Paginierung |

**Response:**
```json
{
  "ok": true,
  "data": {
    "hits": [{ "id": "uuid", "name_de": "Apfel", "kcal": 52, ... }],
    "query": "apfel",
    "limit": 20,
    "offset": 0,
    "estimatedTotalHits": 42
  }
}
```

### GET `/api/nutrition/foods/categories`

Alle einzigartigen Kategorien.

**Response:**
```json
{
  "ok": true,
  "data": ["Gemüse", "Obst", "Fleisch, Wild, Innereien", ...]
}
```

### GET `/api/nutrition/foods/:id`

Einzelnes Food per UUID.

**Response:**
```json
{
  "ok": true,
  "data": { "id": "uuid", "name_de": "Apfel", "bls_code": "F100100", ... }
}
```

### GET `/api/nutrition/foods/favorites`

Favoriten des Users (JOIN mit `food_favorites`).

### POST `/api/nutrition/foods/:id/favorite`

Food als Favorit markieren.

### DELETE `/api/nutrition/foods/:id/favorite`

Favorit entfernen.

---

## 2. Smart Search — `/api/nutrition/foods/smart-search`

**Datei:** `src/api/nutrition/routes/foods-smart-search.ts`

Preference-aware Suche mit Database-Level Scoring. Berücksichtigt Diät-Typ, Allergien, Liked/Disliked Foods.

### GET `/api/nutrition/foods/smart-search`

**Query-Parameter:**

| Param | Typ | Default | Beschreibung |
|-------|-----|---------|-------------|
| `q` | string | `''` | Suchbegriff |
| `category` | string | — | Kategorie-Filter |
| `limit` | number | `20` | Max Ergebnisse |
| `offset` | number | `0` | Paginierung |
| `includeCustom` | boolean | `false` | Custom Foods einschließen |

**Features:**
- Lädt User-Preferences (`user_food_preferences`) automatisch
- **Preference Score:** +100 für liked, -100 für disliked Foods
- **Diät-Filter:** Kategorien automatisch ausgeschlossen (vegan→kein Fleisch, etc.)
- **Allergen-Filter:** Foods mit User-Allergenen werden ausgeschlossen
- **Keto-Bonus:** Kohlenhydrat-reiche Foods werden deprioritisiert bei Keto-Diät
- **Name-Match Boost:** Exakte Prefix-Matches werden bevorzugt

**Response:**
```json
{
  "ok": true,
  "data": {
    "hits": [...],
    "query": "chicken",
    "preferenceSettings": {
      "dietType": "keto",
      "allergiesExcluded": 2,
      "likedFoods": 5,
      "dislikedFoods": 3
    }
  }
}
```

### GET `/api/nutrition/foods/smart-search/suggestions`

Personalisierte Food-Vorschläge basierend auf Preferences.

**Query-Parameter:** `limit` (default: 10)

**Logik:**
1. Liked Foods → Finde ähnliche Kategorien → Vorschläge aus denselben Kategorien
2. Fallback: Zufällige diät-kompatible Foods

---

## 3. Meals — `/api/nutrition/meals`

**Datei:** `src/api/nutrition/routes/meals.ts`

### GET `/api/nutrition/meals`

Mahlzeiten für ein Datum.

**Query-Parameter:**

| Param | Typ | Default | Beschreibung |
|-------|-----|---------|-------------|
| `date` | string | heute | Datum (YYYY-MM-DD) |

**Response:** Meals mit aggregierten Items-Totals.

### POST `/api/nutrition/meals`

Neue Mahlzeit anlegen.

**Body:**
```json
{
  "date": "2026-03-25",
  "meal_type": "lunch",
  "notes": "Optional"
}
```

### PUT `/api/nutrition/meals/:id`

Mahlzeit updaten (meal_type, notes).

### DELETE `/api/nutrition/meals/:id`

Mahlzeit + alle Items löschen (CASCADE).

### POST `/api/nutrition/meals/:mealId/items`

Item zu Mahlzeit hinzufügen. Nährstoffwerte werden automatisch berechnet: `food_nutrient * (amount_g / 100)`.

**Body:**
```json
{
  "food_id": "uuid",
  "food_source": "bls",
  "food_name": "Hähnchenbrust",
  "amount_g": 200
}
```

### PUT `/api/nutrition/meals/:mealId/items/:itemId`

Meal-Item updaten (amount_g, food_id, etc.).

### DELETE `/api/nutrition/meals/:mealId/items/:itemId`

Einzelnes Item löschen.

### POST `/api/nutrition/meals/copy-day`

Mahlzeiten eines Tages auf einen anderen kopieren.

**Body:**
```json
{
  "from_date": "2026-03-24",
  "to_date": "2026-03-25"
}
```

---

## 4. Water — `/api/nutrition/water`

**Datei:** `src/api/nutrition/routes/water.ts`

### GET `/api/nutrition/water`

Water-Logs für ein Datum.

**Query-Parameter:** `date` (YYYY-MM-DD, default: heute)

### POST `/api/nutrition/water`

**Body:**
```json
{
  "date": "2026-03-25",
  "amount_ml": 250
}
```

### DELETE `/api/nutrition/water/:id`

Einzelnen Water-Log löschen.

---

## 5. Weight — `/api/nutrition/weight`

**Datei:** `src/api/nutrition/routes/weight.ts`

### GET `/api/nutrition/weight`

Weight-Logs mit Zeitrahmen.

**Query-Parameter:** `days` (default: 30)

### POST `/api/nutrition/weight`

**Body:**
```json
{
  "date": "2026-03-25",
  "weight_kg": 85.5,
  "body_fat_pct": 15.0,
  "notes": "Morgens, nüchtern"
}
```

### DELETE `/api/nutrition/weight/:id`

Weight-Log löschen.

---

## 6. Targets — `/api/nutrition/targets`

**Datei:** `src/api/nutrition/routes/targets.ts`

### GET `/api/nutrition/targets`

Aktives Nutrition Target des Users.

### POST `/api/nutrition/targets`

Neues Target anlegen (deaktiviert vorheriges).

**Body:**
```json
{
  "kcal_target": 2600,
  "protein_g_target": 180,
  "carbs_g_target": 280,
  "fat_g_target": 75,
  "fiber_g_target": 30,
  "water_ml_target": 3000,
  "user_level": "intermediate"
}
```

### PUT `/api/nutrition/targets/:id`

Target updaten.

---

## 7. Summary — `/api/nutrition/summary`

**Datei:** `src/api/nutrition/routes/summary.ts`

### GET `/api/nutrition/summary`

Tagesübersicht mit Aggregaten.

**Query-Parameter:** `date` (YYYY-MM-DD, default: heute)

**Response:** Summen aller Makros + Mikros aus `daily_nutrition_summary` View.

### GET `/api/nutrition/summary/range`

Aggregat über Zeitraum.

**Query-Parameter:** `from`, `to` (YYYY-MM-DD)

**Response:** Tägliche + Durchschnitts-Werte.

---

## 8. Recipes — `/api/nutrition/recipes`

**Datei:** `src/api/nutrition/routes/recipes.ts`

### GET `/api/nutrition/recipes`

Alle Rezepte des Users.

### POST `/api/nutrition/recipes`

**Body:**
```json
{
  "name": "Protein Shake",
  "servings": 1,
  "prep_time_min": 5,
  "items": [
    { "food_id": "uuid", "name": "Whey Protein", "amount_g": 30 },
    { "food_id": "uuid", "name": "Milch", "amount_g": 300 }
  ]
}
```

### GET `/api/nutrition/recipes/:id`

Rezept mit Items.

### PUT `/api/nutrition/recipes/:id`

Rezept updaten.

### DELETE `/api/nutrition/recipes/:id`

Rezept löschen (CASCADE auf Items).

### POST `/api/nutrition/recipes/:id/log`

Rezept als Mahlzeit loggen (erstellt Meal + Items aus Rezept-Zutaten).

---

## 9. Custom Foods — `/api/nutrition/custom-foods`

**Datei:** `src/api/nutrition/routes/custom-foods.ts`

### GET `/api/nutrition/custom-foods`

Alle Custom Foods des Users.

### POST `/api/nutrition/custom-foods`

**Body:**
```json
{
  "name_de": "Mein Proteinriegel",
  "kcal": 200,
  "protein_g": 20,
  "carbs_g": 22,
  "fat_g": 8,
  "barcode": "4012345678901",
  "brand": "MyProtein"
}
```

### PUT `/api/nutrition/custom-foods/:id`

Custom Food updaten.

### DELETE `/api/nutrition/custom-foods/:id`

Custom Food löschen.

---

## 10. Meal Plans — `/api/nutrition/meal-plans`

**Datei:** `src/api/nutrition/routes/meal-plans.ts`

### GET `/api/nutrition/meal-plans`

Alle Meal Plans des Users.

### POST `/api/nutrition/meal-plans`

Neuen Plan erstellen.

**Body:**
```json
{
  "name": "Cutting Week",
  "target_calories": 2200,
  "days_count": 7,
  "days": [
    {
      "day_number": 1,
      "name": "Montag",
      "items": [
        { "meal_type": "breakfast", "food_id": "uuid", "name": "Haferflocken", "amount_g": 80 }
      ]
    }
  ]
}
```

### GET `/api/nutrition/meal-plans/:id`

Plan mit Days und Items.

### PUT `/api/nutrition/meal-plans/:id`

Plan updaten.

### DELETE `/api/nutrition/meal-plans/:id`

Plan löschen.

### POST `/api/nutrition/meal-plans/:id/activate`

Plan aktivieren (deaktiviert andere).

---

## 11. Settings — `/api/nutrition/settings`

**Datei:** `src/api/nutrition/routes/settings.ts`

Key-Value Store für User-spezifische Einstellungen (JSONB-Werte).

### GET `/api/nutrition/settings`

Alle Settings als Object.

### GET `/api/nutrition/settings/meal_schedule`

Meal Schedule mit Default-Werten:
```json
[
  { "id": "breakfast", "name": "Frühstück", "time": "07:00", "enabled": true },
  { "id": "snack1", "name": "Snack 1", "time": "10:00", "enabled": true },
  { "id": "lunch", "name": "Mittagessen", "time": "12:00", "enabled": true },
  { "id": "snack2", "name": "Snack 2", "time": "15:00", "enabled": true },
  { "id": "dinner", "name": "Abendessen", "time": "18:00", "enabled": true }
]
```

### GET `/api/nutrition/settings/:key`

Einzelnes Setting.

### PUT `/api/nutrition/settings/:key`

Setting upsert.

**Body:**
```json
{ "value": { "any": "json value" } }
```

---

## 12. MealCam — `/api/nutrition/mealcam`

**Datei:** `src/api/nutrition/routes/mealcam.ts`

AI-basierte Mahlzeit-Erkennung per Kamera/Foto-Upload.

### POST `/api/nutrition/mealcam/scan`

**Body:** `FormData` mit Bild (`image` field) oder Base64.

**Response:**
```json
{
  "ok": true,
  "data": {
    "detected_foods": [
      {
        "name": "Reis",
        "confidence": 0.92,
        "estimated_amount_g": 200,
        "matched_food_id": "uuid"
      }
    ]
  }
}
```

**Status:** Mock-Implementierung (Phase 1). Real Claude Vision API geplant für Phase 2.

---

## 13. Food Preferences — `/api/nutrition/food-preferences`

**Datei:** `src/api/nutrition/routes/food-preferences.ts`

### GET `/api/nutrition/food-preferences`

User-Preferences laden.

**Response:**
```json
{
  "ok": true,
  "data": {
    "diet_type": "keto",
    "allergies": ["lactose", "gluten"],
    "liked_foods": [{ "name": "Lachs" }, { "name": "Avocado" }],
    "disliked_foods": [{ "name": "Tofu" }],
    "preferred_cuisines": ["mediterran", "asiatisch"],
    "cooking_skill": "intermediate",
    "prep_time_max": 30,
    "budget_level": "medium"
  }
}
```

### PUT `/api/nutrition/food-preferences`

Preferences upsert (UPSERT on `user_id`).

---

## 14. For AI — `/api/nutrition/for-ai`

**Datei:** `src/api/nutrition/routes/for-ai.ts`

Kompakter Nutrition-Context für Buddy AI Consumption.

### GET `/api/nutrition/for-ai`

**Response:**
```json
{
  "dailyStatus": "65% protein target, 71% calories",
  "lastMeal": "3h ago",
  "recommendations": ["more protein"]
}
```

**Logik:**
- Liest Targets (`user_nutrition_goals`)
- Aggregiert heutiges Essen (SUM aus meals/meal_items)
- Berechnet Wasser-Intake
- Generiert Recommendations (protein < 80% → "more protein")

---

## Health Check

### GET `/api/nutrition/health`

```json
{ "ok": true, "module": "nutrition", "port": 5100 }
```

### GET `/`

```json
{ "ok": true, "service": "lumeos-nutrition-api", "version": "1.0.0" }
```

---

## Error Format

Alle Errors folgen dem Schema:
```json
{
  "ok": false,
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "details": null
}
```

HTTP Status Codes: `400` (Bad Request), `404` (Not Found), `500` (Internal Error).

## Database Connection

**Datei:** `src/api/nutrition/db.ts`

```typescript
import { createDb } from '../shared/create-db';
import { setSearchPath } from '../shared/db-init';

const sql = createDb();

export async function initNutritionDb() {
  await setSearchPath(sql, 'nutrition,public');
}
```

Der `search_path` ist auf `nutrition,public` gesetzt — Queries ohne Schema-Prefix suchen zuerst in `nutrition`, dann in `public`.
