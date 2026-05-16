## SPEC_02 — Patch-Notizen für direkte Einarbeitung

Diese Datei dokumentiert alle Änderungen die in SPEC_02_ENTITIES.md
noch direkt eingearbeitet werden müssen.

---

### Entity 7: CustomFood — custom_allergens hinzufügen

Nach `updated_at TIMESTAMPTZ` einfügen:
```sql
custom_allergens  TEXT[] DEFAULT '{}'
  -- allergen_gluten | allergen_milk | allergen_eggs | allergen_fish
  -- allergen_crustaceans | allergen_molluscs | allergen_peanuts | allergen_nuts
  -- allergen_soy | allergen_celery | allergen_mustard | allergen_sesame
  -- allergen_sulphites | allergen_lupin
```

Barcode-Kommentar anpassen:
```
barcode  TEXT   EAN / UPC (Identifier für eigene Produkte — kein externer Lookup)
```

---

### Entity 9: MealItem — food_source 'manual' ergänzen

`food_source TEXT NOT NULL` Kommentar erweitern:
```
food_source  TEXT NOT NULL  bls | custom | mealcam | manual
-- 'manual' = Quick-Add Makros ohne food_id/custom_food_id
-- nutrients JSONB bleibt leer bei 'manual'
```

---

### Entity 10: Recipe — source 'buddy' ergänzen

```
source  TEXT NOT NULL DEFAULT 'user'
          user | coach | marketplace | buddy
```

---

### Entity 15: MealPlanItem — Immutabilität ergänzen

Nach der CONSTRAINT-Zeile hinzufügen:
```
-- IMMUTABILITÄT: READ-ONLY sobald MealPlan.status = 'active'
-- API gibt 409 Conflict zurück bei PUT/PATCH/DELETE
-- Änderungen: Plan pausieren → Kopie erstellen → neu aktivieren
```

---

### Entity 16: MealPlanLog — ADR-Referenz hinzufügen

Nach Compliance-Berechnung hinzufügen:
```
-- Retroaktive Bestätigungen ändern Goals-Export NICHT (Snapshot-Prinzip)
-- Vollständige Entscheidungsdokumentation: SPEC_02_PATCH_MEALPLANLOG_ADR.md
```

---

### DailyNutritionSummary VIEW — Wasser-Felder ergänzen

Beschreibung erweitern:
```
Wasser:
  water_logged_ml  -- SUM(water_logs.amount_ml)
  water_food_ml    -- SUM(meal_items.water_g) × 10  (g → ml)
  water_total_ml   -- Summe beider Quellen
```

---

Status: Patches dokumentiert. SPEC_02 direkt editen wenn Zeit ist.
