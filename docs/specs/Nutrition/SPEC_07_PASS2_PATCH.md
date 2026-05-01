# SPEC_07 — Pass 2 API Ergänzungen
# docs/specs/Nutrition/SPEC_07_PASS2_PATCH.md
# Ergänzt SPEC_07_API.md um V1-Entscheidungen aus NUTRITION_NEXT_SPEC_DECISIONS.md

> Stand: April 2026 | Pass 2 nach NUTRITION_NEXT_SPEC_DECISIONS.md

---

## Übersicht der Änderungen

| Bereich | Änderung |
|---|---|
| Food Search | Ranking, Tags, Alias, Custom-Food-Merge dokumentiert |
| Food Portions | Neuer Endpoint |
| Micronutrient Review | Supplements-API Input, UL-Logik |
| MealCam V1 | Vollständiger Flow dokumentiert |
| Nutrition Preferences | Onboarding + Settings + Coach Suggestions |
| Coach Access | Read-only-Regeln, Suggestion CRUD |
| Recipes/Meal Plans/Shopping Lists | Explizit als schema-only/Phase 2 markiert |

---

## 1. Food Search — Ranking und Tags (Ergänzung zu SPEC_07 §1)

### Ranking-Reihenfolge

```
1. Exakter Name-Match (name_display ILIKE $q)
2. Exakter Alias-Match (food_aliases.alias ILIKE $q)
3. Prefix-Match (name_display ILIKE $q || '%')
4. User Custom Foods (sort_weight 1001 → immer bevorzugt)
5. User Liked Foods (Ranking-Boost +100)
6. Häufig genutzte Foods (aus user_recent_portions, Boost nach Frequenz)
7. BLS sort_weight (0–1000)
8. Kategorie-Match (Ranking-Boost +30)
9. Tag-Match wenn Suchbegriff = Tag-Name (Boost +30)
10. Fuzzy-Match (pg_trgm similarity > 0.15)
```

**Mindest-Score für Fuzzy-Match:** `similarity > 0.15`
Sehr unsichere Treffer (< 0.10) werden nicht angezeigt.

### Response-Ergänzung: source + Alias-Match

```json
{
  "id": "uuid",
  "name_display": "Hähnchenbrust (roh)",
  "food_source": "bls",          // "bls" | "custom"
  "matched_via": "name",         // "name" | "alias" | "fuzzy" | "tag"
  "matched_alias": null,         // Wenn via Alias: der gefundene Alias
  "tags": ["high_protein", "poultry"],
  "enercc": 109,
  "prot625": 23.1,
  "fat": 1.7,
  "cho": 0
}
```

### Allergen-Filter

Wenn `food_preferences.allergies` gesetzt:
- BLS Foods mit matchenden `allergen_*` Tags werden ausgeblendet
- Custom Foods mit `custom_allergens && userAllergies` werden ausgeblendet
- Gilt auch bei direkter Suche (nicht nur Smart Search)

---

## 2. Food Portions — Neuer Endpoint

### `GET /api/nutrition/foods/:id/portions`

Portionsgrößen für ein BLS-Food.

**Response:**
```json
{
  "ok": true,
  "data": {
    "food_id": "uuid",
    "portions": [
      {
        "id": "uuid",
        "portion_name_de": "1 Stück",
        "portion_name_en": "1 piece",
        "portion_name_th": null,
        "amount_g": 120.0,
        "sort_order": 1,
        "source": "editorial"
      },
      {
        "id": "uuid",
        "portion_name_de": "1 Scheibe",
        "amount_g": 30.0,
        "sort_order": 2,
        "source": "editorial"
      }
    ],
    "recent_amount_g": 200.0,   // Letzte vom User genutzte Menge (aus user_recent_portions)
    "recent_portion_name": "1 Stück"
  }
}
```

**Fallback:** Wenn keine Portionen vorhanden → `portions: []`, Client zeigt Gramm-Eingabe.

---

### `GET /api/nutrition/foods/custom/:id/portions`

Portionsgrößen für ein Custom Food.

---

### `POST /api/nutrition/foods/:id/portions/user`

User legt eigene Portionsgröße für ein Food an.

**Body:**
```json
{
  "portion_name_de": "meine Portion",
  "amount_g": 175
}
```

---

## 3. Micronutrient Review — Neuer Endpoint mit Supplements

### `GET /api/nutrition/summary/micronutrients`

Vollständiger Micronutrient Review für ein Datum.
Kombiniert Food-Intake + Supplements-API.

**Query:** `date` (default: heute), `user_id` (aus JWT)

**Was intern passiert:**
```
1. DailyNutritionSummary laden (Food-Nährstoffe)
2. Supplements-API abfragen:
   GET http://supplements:5200/api/supplements/daily-intake?user_id=:uid&date=:date
3. Kombination: food_totals + supplement_totals
4. nutrient_reference_values für user.age + user.sex laden
5. calcMicroFlagsEnhanced() aufrufen
6. Response zusammenbauen
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "supplement_data_available": true,
    "overall_score": 72,
    "nutrients": [
      {
        "code": "VITD",
        "name_de": "Vitamin D",
        "unit": "µg",
        "food_amount": 4.2,
        "supplement_amount": 25.0,
        "total_amount": 29.2,
        "rda": 20.0,
        "ul": 100.0,
        "pct_of_rda": 146,
        "ul_pct": 29.2,
        "status": "ok",
        "flag": null,
        "display_tier": 1
      },
      {
        "code": "FE",
        "name_de": "Eisen",
        "unit": "mg",
        "food_amount": 8.1,
        "supplement_amount": 0,
        "total_amount": 8.1,
        "rda": 15.0,
        "ul": 45.0,
        "pct_of_rda": 54,
        "ul_pct": 18,
        "status": "warn",
        "flag": {
          "flag_type": "deficit",
          "severity": "warn",
          "pct_of_target": 54
        },
        "display_tier": 1
      }
    ],
    "critical_flags": [...],
    "warn_flags": [...],
    "recommendations": [
      "Eisen heute nur 54% der Empfehlung — rotes Fleisch oder Hülsenfrüchte"
    ]
  }
}
```

**Fallback wenn Supplements nicht erreichbar:**
```json
{
  "supplement_data_available": false,
  "supplement_error": "Supplements service temporarily unavailable"
}
```
Nutrient-Werte zeigen dann nur `food_amount`, `supplement_amount` wird ausgeblendet.

---

## 4. MealCam V1 — Vollständiger Flow

### Schritt 1: Scan starten

`POST /api/nutrition/mealcam/scan`

**Body:** `FormData` mit `image` (JPEG/PNG max. 10MB) oder:
```json
{
  "image_base64": "...",
  "mime_type": "image/jpeg",
  "date": "2026-04-15",
  "meal_type": "lunch",
  "plan_item_id": null
}
```

**Response (processing):**
```json
{
  "ok": true,
  "data": {
    "scan_id": "uuid",
    "status": "processing"
  }
}
```

**Response (completed — synchron wenn schnell):**
```json
{
  "ok": true,
  "data": {
    "scan_id": "uuid",
    "status": "completed",
    "confidence_level": "suggest",
    "detected_items": [
      {
        "food_id": "uuid",
        "food_name": "Hähnchenbrust (roh)",
        "food_source": "bls",
        "confidence": 0.78,
        "estimated_amount_g": 180,
        "portions": [
          { "portion_name_de": "1 Stück", "amount_g": 120 }
        ]
      },
      {
        "food_id": null,
        "food_name": "Unbekannte Sauce",
        "food_source": "custom_suggestion",
        "confidence": 0.41,
        "estimated_amount_g": 30,
        "custom_food_prefill": {
          "name_de": "Unbekannte Sauce",
          "enercc": null,
          "prot625": null
        }
      }
    ],
    "plan_comparison": null
  }
}
```

**Regeln:**
- `confidence_level = 'low'` → Client warnt User, kein automatisches Hinzufügen
- `food_id = null` → Custom-Food-Vorschlag anzeigen
- `food_source = 'custom_suggestion'` → User muss Custom Food anlegen oder verwerfen

---

### Schritt 2: Scan-Status prüfen (wenn asynchron)

`GET /api/nutrition/mealcam/scan/:scanId`

**Response:** Wie oben.

---

### Schritt 3: User-Korrektur speichern

`POST /api/nutrition/mealcam/scan/:scanId/correct`

```json
{
  "corrections": [
    {
      "item_index": 0,
      "corrected_food_id": "uuid",
      "corrected_amount_g": 200
    },
    {
      "item_index": 1,
      "action": "remove"
    }
  ]
}
```

---

### Schritt 4: Bestätigen → Meal Items erstellen

`POST /api/nutrition/mealcam/scan/:scanId/confirm`

```json
{
  "meal_id": "uuid",
  "items_to_log": [
    {
      "food_id": "uuid",
      "food_source": "bls",
      "amount_g": 200
    }
  ]
}
```

**Was intern passiert:**
1. MealItems erstellen mit `food_source = 'mealcam'`, `scan_id` referenziert
2. Nährstoffe berechnen und einfrieren
3. `mealcam_scans.scan_status = 'user_confirmed'`
4. `mealcam_scans.meal_id` setzen
5. `user_recent_portions` aktualisieren

**Response:** Standard-Meal-Objekt mit erstellten Items.

---

### Schritt 5: Training Consent setzen

`POST /api/nutrition/mealcam/scan/:scanId/consent`

```json
{ "training_consent": true }
```

Standardmäßig immer `false`. Separater UI-Schritt mit expliziter Erklärung.

---

### `GET /api/nutrition/mealcam/scan/:scanId/feedback`

Zeigt gespeichertes Feedback + Korrekturen eines Scans.

---

## 5. Nutrition Preferences — Onboarding + Settings

### `GET /api/nutrition/preferences/onboarding`

Onboarding-Status und bestehende Preferences laden.

**Response:**
```json
{
  "ok": true,
  "data": {
    "onboarding_complete": false,
    "preferences": {
      "diet_type": null,
      "allergies": [],
      "intolerances": [],
      "religious_dietary": null,
      "religious_is_hard": false,
      "excluded_foods": [],
      "preferred_foods": [],
      "preferred_cuisines": [],
      "meal_slots": []
    },
    "preference_items": []
  }
}
```

---

### `POST /api/nutrition/preferences/onboarding`

Onboarding-Preferences speichern.

```json
{
  "diet_type": "omnivore",
  "allergies": ["nuts", "shellfish"],
  "intolerances": ["lactose"],
  "religious_dietary": null,
  "religious_is_hard": false,
  "excluded_foods": [],
  "preferred_cuisines": ["mediterranean", "thai_food"],
  "meal_slots": [
    { "id": "breakfast", "name": "Frühstück", "time": "07:00", "enabled": true },
    { "id": "lunch",     "name": "Mittagessen", "time": "12:30", "enabled": true },
    { "id": "dinner",    "name": "Abendessen", "time": "18:30", "enabled": true }
  ],
  "likes": [
    { "target_type": "tag", "tag_code": "high_protein" },
    { "target_type": "food", "food_id": "uuid" }
  ],
  "dislikes": [
    { "target_type": "tag", "tag_code": "ultra_processed" }
  ]
}
```

**Intern:**
- `food_preferences` Zeile upserten
- `food_preference_items` Einträge mit `source: 'onboarding'` anlegen
- `onboarding_complete = true` setzen

---

### `GET /api/nutrition/preferences/settings`

Alle bearbeitbaren Preferences für Nutrition Settings.

**Response:** Wie Onboarding + bestehende `preference_items`

---

### `PUT /api/nutrition/preferences/settings`

Preferences aktualisieren (PATCH-Semantik — nur geänderte Felder).

---

### `GET /api/nutrition/preferences/coach-suggestions`

Offene Coach-Suggestions für Preferences.

```json
{
  "ok": true,
  "data": [
    {
      "suggestion_id": "uuid",
      "suggestion_type": "preference",
      "status": "pending",
      "payload": {
        "preference": "disliked",
        "target_type": "tag",
        "tag_code": "ultra_processed",
        "reason": "Verarbeitung reduzieren empfohlen"
      },
      "coach_id": "uuid",
      "expires_at": "2026-05-07T12:00:00Z"
    }
  ]
}
```

---

### `POST /api/nutrition/preferences/coach-suggestions/:id/accept`

Coach-Suggestion für Preferences annehmen.
Erzeugt `food_preference_item` mit `source: 'coach_suggestion'`.

---

### `POST /api/nutrition/preferences/coach-suggestions/:id/reject`

Coach-Suggestion ablehnen.

---

## 6. Coach Access — Read-Only Endpoints

Coach-Zugriff erfordert:
- Gültiges Coach-JWT
- User-Freigabe für den jeweiligen Bereich

### `GET /api/nutrition/coach/:userId/diary`

Diary eines Users lesen (Coach-Zugriff).

**Auth:** Coach-JWT + `coach_permission: nutrition.diary`

**Response:** Wie normales Diary, aber read-only.

---

### `GET /api/nutrition/coach/:userId/micronutrients`

Micronutrient Review eines Users (Coach-Zugriff).

**Auth:** Coach-JWT + `coach_permission: nutrition.micronutrient`

---

### `GET /api/nutrition/coach/:userId/targets`

Nutrition Targets eines Users (Coach-Zugriff).

---

### `GET /api/nutrition/coach/:userId/preferences`

Preferences eines Users (Coach-Zugriff).

---

### `POST /api/nutrition/coach/:userId/suggestions`

Coach-Suggestion erstellen.

```json
{
  "suggestion_type": "nutrition_target",
  "payload": {
    "calorie_target": 2100,
    "protein_target": 175,
    "reason": "Körperziel angepasst auf Cutting"
  }
}
```

**Response:** Erstellte Suggestion mit `status: 'pending'`

---

### `GET /api/nutrition/suggestions/pending`

Offene Coach-Suggestions des eingeloggten Users (alle Typen).

---

### `POST /api/nutrition/suggestions/:id/accept`

Coach-Suggestion annehmen. Typ-spezifische Umsetzung:
- `nutrition_target` → Nutrition Target aktualisieren
- `preference` → Preference Item erstellen
- `food_alternative` → Info-only, kein direktes Schreiben
- `micronutrient_comment` → als gelesen markieren

---

### `POST /api/nutrition/suggestions/:id/reject`

Coach-Suggestion ablehnen.

---

## 7. Recipes / Meal Plans / Shopping Lists — Phase 2 Klarstellung

Die Endpoints aus SPEC_07 §9–§11 bleiben technisch vorhanden, sind aber V1 optional:

| Endpoint | Status |
|---|---|
| `GET/POST /api/nutrition/recipes` | V1 optional — Phase 2 wenn Zeit knapp |
| `GET/POST /api/nutrition/meal-plans` | V1 optional — Phase 2 wenn Zeit knapp |
| `GET /api/nutrition/shopping-lists` | V1 optional — Phase 2 wenn Zeit knapp |
| `POST /api/nutrition/meal-plans/:id/activate` | V1 optional |

**Wenn Phase 2:** Endpoints geben `501 Not Implemented` zurück mit:
```json
{
  "ok": false,
  "error": "FEATURE_PHASE_2",
  "message": "Recipes sind für Phase 2 geplant."
}
```

---

## 8. nutrient_reference_values Endpoint

### `GET /api/nutrition/nutrients/reference-values`

Alle Referenzwerte (RDA/AI/UL) für den aktuellen User (nach Alter + Geschlecht).

**Query:** `user_id` aus JWT → Age + Sex aus User-Profil

**Response:**
```json
{
  "ok": true,
  "data": {
    "user_age": 32,
    "user_sex": "male",
    "values": [
      {
        "nutrient_code": "VITD",
        "rda": 20.0,
        "ai": null,
        "ul": 100.0,
        "unit": "µg",
        "source": "DACH 2020"
      }
    ]
  }
}
```

---

## Routing-Ergänzung (zu SPEC_07 Routing-Tabelle)

```typescript
// Pass 2 Additions — vor bestehenden Routes einfügen wo nötig
app.route('/api/nutrition/mealcam',                  mealcamRouter)
app.route('/api/nutrition/preferences/onboarding',    preferencesOnboardingRouter)
app.route('/api/nutrition/preferences/settings',      preferencesSettingsRouter)
app.route('/api/nutrition/preferences/coach-suggestions', prefCoachSuggRouter)
app.route('/api/nutrition/coach',                    coachAccessRouter)
app.route('/api/nutrition/suggestions',              suggestionsRouter)
app.route('/api/nutrition/summary/micronutrients',   micronutrientsRouter)
app.route('/api/nutrition/nutrients/reference-values', nutrientRefRouter)
app.route('/api/nutrition/foods/:id/portions',       portionsRouter)
```
