# Nutrition Module — API Specification

> Spec Phase 7 | Alle Endpoints mit Request/Response-Schemas

---

## Übersicht

**Base URL:** `http://nutrition:5100`**Auth:** JWT via `Authorization: Bearer <token>` (globalAuthMiddleware) **User-ID:** aus JWT extrahiert → `userId` in allen Handlers **Schema:** `search_path = nutrition`**Format:** Alle Responses: `{ ok: boolean, data?: T, error?: string }`

---

## Route-Mounting Reihenfolge (kritisch)

```typescript
// Smart Search MUSS vor /foods gemounted werden
// damit /foods/smart-search nicht als /foods/:id matcht
app.route('/api/nutrition/foods/smart-search', smartSearchRouter)
app.route('/api/nutrition/foods',              foodsRouter)
app.route('/api/nutrition/meals',              mealsRouter)
app.route('/api/nutrition/water',              waterRouter)
app.route('/api/nutrition/targets',            targetsRouter)
app.route('/api/nutrition/recipes',            recipesRouter)
app.route('/api/nutrition/shopping-lists',     shoppingListsRouter)
app.route('/api/nutrition/meal-plans',         mealPlansRouter)
app.route('/api/nutrition/preferences',        preferencesRouter)
app.route('/api/nutrition/summary',            summaryRouter)
app.route('/api/nutrition/score',              scoreRouter)
app.route('/api/nutrition/for-ai',             forAiRouter)
app.route('/api/nutrition/for-goals',          forGoalsRouter)
app.route('/api/nutrition/pending-actions',    pendingActionsRouter)
app.route('/api/nutrition/settings',           settingsRouter)
app.route('/api/nutrition/mealcam',            mealcamRouter)
```

---

## 1. Foods — `/api/nutrition/foods`

### `GET /api/nutrition/foods`

Food-Suche (BLS-Foods + Custom Foods gemischt, Custom zuerst).

**Query-Parameter:**

ParamTypDefaultBeschreibung`q`string`''`Suchbegriff`category_id`uuid—Filter auf Kategorie (inkl. Sub-Kategorien)`tag`string—Filter auf Tag-Code (z.B. 'high_protein')`limit`integer20Max Ergebnisse`offset`integer0Paginierung`sort`string'relevance'relevance | protein_desc | kcal_asc | name_asc`include_custom`booleantrueCustom Foods einschliessen

**Response:**

```json
{
  "ok": true,
  "data": {
    "hits": [
      {
        "id": "uuid",
        "bls_code": "V416100",
        "name_display": "Hähnchenbrust (roh)",
        "name_display_en": "Chicken breast (raw)",
        "name_display_th": null,
        "is_custom": false,
        "category_id": "uuid",
        "sort_weight": 940,
        "enercc": 109,
        "prot625": 23.1,
        "fat": 1.7,
        "cho": 0,
        "fibt": 0,
        "tags": ["poultry","chicken","high_protein","very_high_protein","lean_protein","allergen_none"]
      }
    ],
    "total": 142,
    "limit": 20,
    "offset": 0
  }
}
```

---

### `GET /api/nutrition/foods/:id`

Einzelnes BLS-Food mit allen Nährstoffen.

**Response:**

```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "bls_code": "V416100",
    "name_de": "Hähnchen Brustfilet, roh",
    "name_display": "Hähnchenbrust (roh)",
    "name_display_en": "Chicken breast (raw)",
    "name_display_th": null,
    "category": { "id": "uuid", "slug": "chicken", "name_de": "Hähnchen" },
    "sort_weight": 940,
    "processing_level": "raw",
    "macros": {
      "enercc": 109, "enercj": 457, "prot625": 23.1,
      "fat": 1.7, "cho": 0, "fibt": 0, "sugar": 0,
      "fasat": 0.5, "nacl": 0.1, "water_g": 74.9, "alc": 0
    },
    "nutrients": {
      "ENERCC": 109, "PROT625": 23.1, "FAT": 1.7,
      "VITD": 0.1, "FE": 0.5, "ZN": 1.2,
      "LEU": 1.87, "ILE": 1.08, "VAL": 1.14
    },
    "tags": ["poultry","chicken","high_protein","very_high_protein","lean_protein"],
    "aliases": ["Hühnerbrust","Chicken Breast","Brustfilet"]
  }
}
```

---

### `GET /api/nutrition/foods/categories`

Alle Kategorien als Baum.

**Response:**

```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid", "slug": "meat_poultry",
      "name_de": "Fleisch & Geflügel", "name_en": "Meat & Poultry", "name_th": null,
      "icon": "🥩", "level": 1, "sort_order": 1,
      "children": [
        {
          "id": "uuid", "slug": "beef", "name_de": "Rindfleisch",
          "level": 2, "children": [...]
        }
      ]
    }
  ]
}
```

---

## 2. Smart Search — `/api/nutrition/foods/smart-search`

### `GET /api/nutrition/foods/smart-search`

Preference-aware Suche. Lädt user_food_preferences + food_preference_items.

**Query-Parameter:** gleich wie `/foods` + kein `include_custom` (immer true)

**Zusätzliche Response-Felder:**

```json
{
  "ok": true,
  "data": {
    "hits": [...],
    "preference_context": {
      "diet_type": "keto",
      "allergies_excluded": 2,
      "liked_boost_count": 3,
      "disliked_suppressed": 1
    }
  }
}
```

---

### `GET /api/nutrition/foods/smart-search/suggestions`

Personalisierte Food-Vorschläge ohne Suchbegriff.

**Query:** `limit` (default: 10)

**Logik:** Liked-Food-Kategorien → ähnliche Foods → diät-kompatibel sortiert

---

## 3. Custom Foods — `/api/nutrition/foods/custom`

### `GET /api/nutrition/foods/custom`

Alle Custom Foods des eingeloggten Users.

**Response:** Array von CustomFood-Objekten.

---

### `POST /api/nutrition/foods/custom`

Custom Food erstellen.

**Body:**

```json
{
  "name_de": "Mein Proteinriegel",
  "name_en": "My protein bar",
  "brand": "MyBrand",
  "barcode": "4012345678901",
  "serving_size_g": 60,
  "serving_name": "1 Riegel",
  "enercc": 220,
  "prot625": 20,
  "fat": 8,
  "cho": 22,
  "fibt": 3,
  "sugar": 5
}
```

**Validation:** `enercc`, `prot625`, `fat`, `cho` sind Pflichtfelder.

---

### `PUT /api/nutrition/foods/custom/:id`

Custom Food aktualisieren (nur eigene).

---

### `DELETE /api/nutrition/foods/custom/:id`

Custom Food löschen (nur eigene). Schlägt fehl wenn noch in meal_items referenziert.

---

## 4. Meals — `/api/nutrition/meals`

### `GET /api/nutrition/meals`

Mahlzeiten für ein Datum.

**Query:** `date` (YYYY-MM-DD, default: heute)

**Response:**

```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "date": "2026-04-15",
      "meal_type": "lunch",
      "notes": null,
      "items": [
        {
          "id": "uuid",
          "food_id": "uuid",
          "food_source": "bls",
          "food_name": "Hähnchenbrust (roh)",
          "amount_g": 200,
          "enercc": 218,
          "prot625": 46.2,
          "fat": 3.4,
          "cho": 0
        }
      ],
      "totals": {
        "enercc": 218, "prot625": 46.2, "fat": 3.4, "cho": 0, "fibt": 0
      }
    }
  ]
}
```

---

### `POST /api/nutrition/meals`

Neue Mahlzeit anlegen.

**Body:**

```json
{
  "date": "2026-04-15",
  "meal_type": "lunch",
  "notes": "optional"
}
```

---

### `PUT /api/nutrition/meals/:id`

meal_type oder notes updaten.

---

### `DELETE /api/nutrition/meals/:id`

Mahlzeit + alle Items löschen (CASCADE).

---

### `POST /api/nutrition/meals/:mealId/items`

Food zu Mahlzeit hinzufügen. Berechnet und friert alle Nährstoffe ein.

**Body:**

```json
{
  "food_id": "uuid",
  "food_source": "bls",
  "amount_g": 200
}
```

Für Custom Food:

```json
{
  "custom_food_id": "uuid",
  "food_source": "custom",
  "amount_g": 60
}
```

**Was intern passiert:**

1. Alle `food_nutrients` für `food_id` laden
2. Jeden Wert skalieren: `value × (amount_g / 100)`
3. Direkte Makro-Spalten setzen (enercc, prot625, ...)
4. `nutrients JSONB` befüllen mit allen skalierten Werten

---

### `PUT /api/nutrition/meals/:mealId/items/:itemId`

amount_g ändern → **Nährstoffe werden neu berechnet und eingefroren**.

**Body:** `{ "amount_g": 250 }`

---

### `DELETE /api/nutrition/meals/:mealId/items/:itemId`

Einzelnes Item löschen.

---

### `POST /api/nutrition/meals/copy-day`

Mahlzeiten eines Tages auf neues Datum kopieren.

**Body:**

```json
{
  "from_date": "2026-04-14",
  "to_date": "2026-04-15",
  "meal_types": ["breakfast","lunch"]
}
```

`meal_types` optional — wenn leer, alle Mahlzeiten kopieren.

---

## 5. Water — `/api/nutrition/water`

### `GET /api/nutrition/water`

Water-Logs für ein Datum + Tagessumme + Target.

**Query:** `date` (default: heute)

**Response:**

```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "total_ml": 1500,
    "target_ml": 2800,
    "pct": 53.6,
    "logs": [
      { "id": "uuid", "amount_ml": 500, "source": "quick_add", "created_at": "..." }
    ]
  }
}
```

---

### `POST /api/nutrition/water`

**Body:** `{ "date": "2026-04-15", "amount_ml": 500 }`

---

### `DELETE /api/nutrition/water/:id`

Einzelnen Water-Log löschen.

---

## 6. Targets — `/api/nutrition/targets`

### `GET /api/nutrition/targets`

Aktives Target für heute. Wenn nicht gecacht → von Goals abrufen und speichern.

**Response:**

```json
{
  "ok": true,
  "data": {
    "calorie_target": 2400,
    "protein_target": 180,
    "carbs_target": 250,
    "fat_target": 75,
    "fiber_target": 30,
    "water_target": 3200,
    "goal_phase": "cut",
    "source": "goals",
    "fetched_at": "2026-04-15T06:00:00Z"
  }
}
```

---

### `POST /api/nutrition/targets/refresh`

Goals-Targets erneut abrufen und Cache überschreiben.

---

## 7. Summary — `/api/nutrition/summary`

### `GET /api/nutrition/summary`

Tagesübersicht mit allen Makros, Mikros und Compliance.

**Query:** `date` (default: heute)

**Response:**

```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "meal_count": 3,
    "macros": {
      "total_kcal": 1840,
      "total_protein_g": 156,
      "total_fat_g": 62,
      "total_carbs_g": 180,
      "total_fiber_g": 22,
      "total_sugar_g": 45,
      "total_salt_g": 3.2,
      "total_water_ml": 1200
    },
    "micros": {
      "VITD": 4.2, "FE": 12.1, "MG": 280,
      "CA": 650, "ZN": 8.2, "K": 3100
    },
    "water_ml": 2100,
    "targets": {
      "calorie_target": 2400, "protein_target": 180
    },
    "compliance": {
      "calorie_pct": 76.7, "protein_pct": 86.7,
      "carbs_pct": 72.0, "fat_pct": 82.7, "fiber_pct": 73.3
    },
    "score": 81,
    "score_status": "ok",
    "micro_flags": [
      { "nutrient_code": "VITD", "flag_type": "deficit", "pct_of_target": 42, "severity": "critical" }
    ]
  }
}
```

---

### `GET /api/nutrition/summary/range`

Aggregat über Zeitraum.

**Query:** `from` (YYYY-MM-DD), `to` (YYYY-MM-DD)

**Response:**

```json
{
  "ok": true,
  "data": {
    "from": "2026-04-08",
    "to": "2026-04-14",
    "days": 7,
    "daily": [
      { "date": "2026-04-08", "total_kcal": 2150, "total_protein_g": 170, ... }
    ],
    "averages": {
      "avg_kcal": 2080, "avg_protein_g": 162, "avg_score": 78
    }
  }
}
```

---

## 8. Score — `/api/nutrition/score`

### `GET /api/nutrition/score`

Nutrition Score für ein Datum (berechnet oder gecacht).

**Query:** `date` (default: heute)

**Response:**

```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "score": 81,
    "status": "ok",
    "breakdown": {
      "protein_compliance": 0.867,
      "calorie_compliance": 0.767,
      "carbs_compliance": 0.720,
      "fat_compliance": 0.827,
      "fiber_compliance": 0.733
    },
    "level_multiplier": 0.90,
    "user_level": "intermediate"
  }
}
```

---

## 9. Recipes — `/api/nutrition/recipes`

### `GET /api/nutrition/recipes`

Alle Rezepte des Users (eigene + coach + marketplace).

**Query:** `source` (user|coach|marketplace, optional), `limit`, `offset`

---

### `POST /api/nutrition/recipes`

Rezept erstellen.

**Body:**

```json
{
  "name": "Protein Bowl",
  "name_en": "Protein Bowl",
  "description": "High-protein meal prep",
  "servings": 2,
  "prep_time_min": 15,
  "cook_time_min": 20,
  "instructions": "1. ...",
  "tags": ["meal_prep", "high_protein"],
  "items": [
    { "food_id": "uuid", "amount_g": 300 },
    { "food_id": "uuid", "amount_g": 200 }
  ]
}
```

**Was intern passiert:**

1. Recipe erstellen
2. RecipeItems erstellen (Nährstoffe einfrieren)
3. Trigger aktualisiert Recipe.total\_\*

---

### `GET /api/nutrition/recipes/:id`

Rezept mit Items und Nährstoff-Details.

---

### `PUT /api/nutrition/recipes/:id`

Rezept updaten (name, servings, instructions, tags). Items separat via Item-Endpoints.

---

### `DELETE /api/nutrition/recipes/:id`

Rezept + Items löschen. Schlägt fehl wenn als MealPlanItem referenziert.

---

### `POST /api/nutrition/recipes/:id/items`

Zutat hinzufügen.

**Body:** `{ "food_id": "uuid", "amount_g": 200 }`

---

### `PUT /api/nutrition/recipes/:id/items/:itemId`

Menge einer Zutat ändern.

---

### `DELETE /api/nutrition/recipes/:id/items/:itemId`

Zutat entfernen.

---

### `POST /api/nutrition/recipes/:id/log`

Rezept als Mahlzeit loggen.

**Body:**

```json
{
  "date": "2026-04-15",
  "meal_type": "lunch",
  "servings": 1
}
```

**Was intern passiert:**

1. Meal erstellen
2. Pro RecipeItem → MealItem erstellen (Nährstoffe skaliert auf servings einfrieren)

---

### `POST /api/nutrition/recipes/:id/shopping-list`

Einkaufsliste aus Rezept generieren.

**Body:** `{ "servings": 4, "name": "Einkauf Woche 17" }`

**Response:** ShoppingList-Objekt mit Items.

---

## 10. Shopping Lists — `/api/nutrition/shopping-lists`

### `GET /api/nutrition/shopping-lists`

Alle Einkaufslisten des Users.

---

### `GET /api/nutrition/shopping-lists/:id`

Einkaufsliste mit Items.

**Response:**

```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "Einkauf Woche 17",
    "recipe_id": "uuid",
    "servings": 4,
    "items": [
      {
        "id": "uuid",
        "food_name": "Hähnchenbrust (roh)",
        "amount_g": 800,
        "unit_display": "g",
        "is_checked": false,
        "sort_order": 1
      }
    ],
    "checked_count": 2,
    "total_count": 5
  }
}
```

---

### `DELETE /api/nutrition/shopping-lists/:id`

Einkaufsliste löschen.

---

### `PUT /api/nutrition/shopping-lists/:id/items/:itemId`

Item abhaken oder Menge anpassen.

**Body:** `{ "is_checked": true }` oder `{ "amount_g": 600 }`

---

## 11. Meal Plans — `/api/nutrition/meal-plans`

### `GET /api/nutrition/meal-plans`

Alle Meal Plans des Users (alle status-Werte).

**Query:** `status` (assigned|active|completed|paused|archived, optional)

---

### `POST /api/nutrition/meal-plans`

Neuen Plan erstellen (source: user).

**Body:**

```json
{
  "name": "Cutting Week",
  "description": "7 Tage Low-Carb",
  "days_count": 7,
  "target_kcal": 2000,
  "target_protein": 180,
  "days": [
    {
      "day_number": 1,
      "name": "Montag",
      "items": [
        {
          "meal_type": "breakfast",
          "food_id": "uuid",
          "name": "Haferflocken",
          "amount_g": 80
        }
      ]
    }
  ]
}
```

---

### `GET /api/nutrition/meal-plans/:id`

Plan mit Days und Items.

---

### `PUT /api/nutrition/meal-plans/:id`

Plan-Metadaten updaten (name, description, target_kcal).

---

### `DELETE /api/nutrition/meal-plans/:id`

Plan löschen (nur wenn status != active).

---

### `POST /api/nutrition/meal-plans/:id/activate`

Plan aktivieren.

**Body:**

```json
{
  "start_date": "2026-04-16",
  "lifecycle_type": "once",
  "next_plan_id": null
}
```

Lifecycle `sequence`: `next_plan_id` muss gesetzt sein.

**Was intern passiert:**

1. Aktuell aktiver Plan → `status: paused`
2. Dieser Plan → `status: active`, `start_date` gesetzt
3. `end_date` = `start_date + days_count - 1`
4. MealPlanLog Einträge für alle Items der nächsten 7 Tage erstellen (status: pending)

---

### `POST /api/nutrition/meal-plans/:id/pause`

Plan pausieren.

---

### `POST /api/nutrition/meal-plans/:id/complete`

Plan als abgeschlossen markieren.

---

### `GET /api/nutrition/meal-plans/active/today`

Heutige Ghost Entries aus dem aktiven Plan.

**Response:**

```json
{
  "ok": true,
  "data": {
    "plan_id": "uuid",
    "plan_name": "Cutting Week",
    "day_number": 3,
    "date": "2026-04-15",
    "ghost_entries": [
      {
        "log_id": "uuid",
        "plan_item_id": "uuid",
        "meal_type": "lunch",
        "status": "pending",
        "items": [
          { "food_id": "uuid", "food_name": "Hähnchenbrust (roh)", "amount_g": 200, "enercc": 218 }
        ],
        "total_kcal": 426
      }
    ]
  }
}
```

---

## 12. Meal Plan Log — `/api/nutrition/meal-plans/logs`

### `POST /api/nutrition/meal-plans/logs/:logId/confirm`

Ghost Entry bestätigen.

**Body:**

```json
{
  "actual_meal_id": "uuid",
  "logged_via": "manual",
  "deviation_kcal": -42,
  "deviation_pct": -9.8
}
```

---

### `POST /api/nutrition/meal-plans/logs/:logId/skip`

Ghost Entry überspringen.

---

### `GET /api/nutrition/meal-plans/:id/compliance`

Plan-Compliance-Übersicht.

**Response:**

```json
{
  "ok": true,
  "data": {
    "plan_id": "uuid",
    "total_items": 21,
    "confirmed": 14,
    "deviated": 3,
    "skipped": 2,
    "pending": 2,
    "compliance_pct": 85.0,
    "avg_deviation_kcal": -38
  }
}
```

---

## 13. Food Preferences — `/api/nutrition/preferences`

### `GET /api/nutrition/preferences`

Alle Präferenzen des Users.

**Response:**

```json
{
  "ok": true,
  "data": {
    "diet_type": "keto",
    "allergies": ["gluten"],
    "cooking_skill": "intermediate",
    "prep_time_max_min": 30,
    "budget_level": "medium",
    "preference_items": [
      { "preference": "liked", "target_type": "food", "food_id": "uuid", "food_name": "Lachs" },
      { "preference": "disliked", "target_type": "category", "category_slug": "offal" },
      { "preference": "liked", "target_type": "tag", "tag_code": "high_protein" }
    ]
  }
}
```

---

### `PUT /api/nutrition/preferences`

Basis-Präferenzen updaten (UPSERT).

**Body:**

```json
{
  "diet_type": "keto",
  "allergies": ["gluten", "dairy"],
  "cooking_skill": "intermediate",
  "prep_time_max_min": 30,
  "budget_level": "medium"
}
```

---

### `POST /api/nutrition/preferences/items`

Like/Dislike hinzufügen.

**Body (Food):**

```json
{ "preference": "liked", "target_type": "food", "food_id": "uuid" }
```

**Body (Kategorie):**

```json
{ "preference": "disliked", "target_type": "category", "category_id": "uuid" }
```

**Body (Tag):**

```json
{ "preference": "liked", "target_type": "tag", "tag_code": "high_protein" }
```

---

### `DELETE /api/nutrition/preferences/items/:id`

Like/Dislike entfernen.

---

## 14. MealCam — `/api/nutrition/mealcam`

### `POST /api/nutrition/mealcam/scan`

Foto analysieren und Foods erkennen.

**Body:** `FormData` mit `image` Feld (JPEG/PNG) oder `{ "image_base64": "...", "mime_type": "image/jpeg" }`

**Optionale Parameter:**

```json
{
  "plan_item_id": "uuid",
  "compare_with_plan": true
}
```

**Response (ohne Plan):**

```json
{
  "ok": true,
  "data": {
    "scan_id": "uuid",
    "confidence_level": "suggest",
    "detected_foods": [
      {
        "food_id": "uuid",
        "food_name": "Hähnchenbrust (roh)",
        "confidence": 0.78,
        "estimated_amount_g": 180
      }
    ]
  }
}
```

**Response (mit Plan-Vergleich):**

```json
{
  "ok": true,
  "data": {
    "scan_id": "uuid",
    "comparison": {
      "matches": [
        {
          "plan_item": { "food_name": "Hähnchenbrust", "planned_g": 200 },
          "detected": { "food_id": "uuid", "detected_g": 180, "confidence": 0.82 },
          "status": "match",
          "suggested_amount_g": 180
        }
      ],
      "missing_from_scan": [
        { "food_name": "Brokkoli", "planned_g": 100 }
      ],
      "extra_in_scan": [
        { "food_name": "Pommes", "food_id": "uuid", "estimated_kcal": 380 }
      ]
```
    }
  }
}
```

---

### `POST /api/nutrition/mealcam/feedback`

User-Korrektur zu einem Scan speichern.

**Body:**
```json
{
  "scan_id": "uuid",
  "correction_type": "wrong_food",
  "correct_food_id": "uuid"
}
```

---

## 15. For-AI — `/api/nutrition/for-ai`

### `GET /api/nutrition/for-ai`

Kompakter Buddy-Kontext für heute.

**Response:**
```json
{
  "ok": true,
  "data": {
    "daily_status": "156/180g Protein · 1.840/2.400 kcal · Wasser 75%",
    "last_meal": "vor 2h (Mittagessen)",
    "remaining": {
      "protein_g": 24,
      "calories_kcal": 560,
      "water_ml": 700
    },
    "flags": ["fiber_low", "vitd_deficit"],
    "active_plan": {
      "name": "Cutting Week",
      "pending_confirms": 1,
      "next_meal": "Abendessen um 18:00"
    },
    "recommendations": [
      "Noch 24g Protein offen — Casein-Shake oder Quark abends",
      "Vitamin D heute nur 42% — fetter Fisch oder Supplement"
    ]
  }
}
```

---

## 16. For-Goals — `/api/nutrition/for-goals`

### `GET /api/nutrition/for-goals`

Compliance-Daten für Goals-Modul.

**Query:** `date` (default: heute)

**Response:**
```json
{
  "ok": true,
  "data": {
    "module": "nutrition",
    "user_id": "uuid",
    "date": "2026-04-15",
    "compliance_score": 81,
    "details": {
      "calorie_adherence_pct": 76.7,
      "protein_adherence_pct": 86.7,
      "carbs_adherence_pct": 72.0,
      "fat_adherence_pct": 82.7,
      "fiber_adherence_pct": 73.3,
      "water_target_met": false,
      "water_pct": 75.0,
      "plan_compliance_pct": 85.0
    }
  }
}
```

---

## 17. Pending Actions — `/api/nutrition/pending-actions`

### `GET /api/nutrition/pending-actions`

Offene User-Actions für Buddy's Tages-TODO.

**Response:**
```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "pending": [
      {
        "id": "uuid",
        "type": "meal_confirm",
        "priority": "high",
        "label": "Mittagessen bestätigen",
        "subtitle": "Hähnchenbrust · Reis · Brokkoli (426 kcal)",
        "plan_item_id": "uuid",
        "meal_type": "lunch",
        "scheduled_time": "12:00",
        "action_url": "/nutrition/diary?confirm=uuid"
      },
      {
        "id": "water-reminder",
        "type": "water_reminder",
        "priority": "normal",
        "label": "Noch 700ml bis Tagesziel",
        "current_ml": 2100,
        "target_ml": 2800,
        "action_url": "/nutrition/water"
      }
    ],
    "count": 2
  }
}
```

---

## 18. Settings — `/api/nutrition/settings`

### `GET /api/nutrition/settings`

Alle Settings des Users.

### `GET /api/nutrition/settings/:key`

Einzelnes Setting.

### `PUT /api/nutrition/settings/:key`

Setting upsert.

**Body:** `{ "value": <beliebiger JSON-Wert> }`

---

## 19. Health

### `GET /api/nutrition/health`

```json
{ "ok": true, "module": "nutrition", "port": 5100, "schema": "nutrition" }
```

---

## Error Format

```json
{
  "ok": false,
  "error": "Human readable message",
  "code": "ERROR_CODE"
}
```

**HTTP Status Codes:**
- `400` — Bad Request (Validierung)
- `401` — Unauthorized (kein/ungültiger JWT)
- `403` — Forbidden (nicht der Eigentümer)
- `404` — Not Found
- `409` — Conflict (z.B. doppelter Eintrag)
- `500` — Internal Server Error
