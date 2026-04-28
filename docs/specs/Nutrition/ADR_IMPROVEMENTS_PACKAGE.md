# ADR: Verbesserungen Nutrition — Paket April 2026

Alle Entscheidungen aus der Spec-Review-Runde.

---

## #13 — Offline-Logging: V2

Offline-Logging (lokaler Queue + Sync) ist explizit **V2**.
V1 setzt aktive Internetverbindung voraus.

In SPEC_04 Feature 5 (Meal Logging) ergänzen:
> Offline-Fähigkeit: V2. V1 erfordert aktive Verbindung zu nutrition:5100.

---

## #14 — Quick-Add Makros (ohne Food-Suche)

Eigener Flow für Power-User die direkt Makros eingeben ohne Food auszuwählen.

**UI:**
```
+ Schnell-Makros
─────────────────────────────────
Kalorien:  [___] kcal
Protein:   [___] g
Kohlenhydrate: [___] g
Fett:      [___] g
Label:     [___] z.B. "Meal Prep Bowl"

[Hinzufügen]
```

**Technisch:**
- MealItem ohne `food_id` / `custom_food_id`
- `food_source = 'manual'`
- `food_name = user-eingegebenes Label` (oder "Manuelle Eingabe")
- `nutrients JSONB = {}` (leer — keine Mikros verfügbar)
- Direkte Makro-Spalten werden befüllt (enercc, prot625, fat, cho)

**SPEC_03:** Als Flow 6.5 "Quick-Add Makros" ergänzen.
**SPEC_10:** `QuickMacroEntry` Component zur Diary-Components-Liste hinzufügen.

---

## #17 — MealPlanItems sind immutable nach Plan-Aktivierung

Sobald ein MealPlan `status: active` hat, können seine Items
nicht mehr verändert werden.

**Regel:**
```
MealPlan.status = 'active'
  → MealPlanDay: READ-ONLY
  → MealPlanItem: READ-ONLY
  → API gibt 409 Conflict zurück bei PUT/PATCH/DELETE auf Items
```

**Warum:** MealPlanLog referenziert `plan_item_id`. Wenn Items
nachträglich geändert werden, stimmt die Compliance-History nicht
mehr und Deviation-Berechnungen werden falsch.

**Wenn Änderung nötig:**
Coach oder User muss Plan pausieren (`status: paused`),
eine Kopie erstellen, bearbeiten und neu aktivieren.
Original-Plan mit seinem Log bleibt unverändert erhalten.

**SPEC_02 Entity 15:** Constraint-Hinweis zu MealPlanItem ergänzen.
**SPEC_07 API:** 409-Response für PUT /meal-plans/:id/days/:day/items/:item dokumentieren.

---

## #18 — Custom Foods: Allergen-Selektor

Custom Foods bekommen ein `custom_allergens` Feld.
Im Custom Food Formular: EU-14 Checkboxen (+ häufige Intoleranzen).
Smart Search filtert `custom_allergens` identisch zu BLS `allergen_*` Tags.

**Schema-Ergänzung für `nutrition.foods_custom`:**
```sql
custom_allergens  TEXT[]  DEFAULT '{}'
-- Werte: EU-14 Codes analog zu tag_definitions
-- z.B. ['allergen_milk', 'allergen_gluten']
```

**UI im Custom Food Formular:**
```
Allergene (EU 14)
[Gluten ☐] [Milch ☑] [Eier ☐] [Nüsse ☐] [Erdnüsse ☐]
[Fisch ☐] [Schalentiere ☐] [Soja ☐] [Sesam ☐] ...
```

**Smart Search Filter-Logik für Custom Foods:**
```typescript
if (userAllergies.includes('allergen_milk')) {
  // BLS Foods: WHERE NOT EXISTS (food_tag mit tag_code = 'allergen_milk')
  // Custom Foods: WHERE NOT ('allergen_milk' = ANY(custom_allergens))
}
```

**SPEC_02 Entity 7:** `custom_allergens TEXT[]` zu CustomFood Schema hinzufügen.
**SPEC_10:** `CustomFoodForm` Component um Allergen-Sektion erweitern.

---

## #19 — Barcode: Nur Custom Foods, kein BLS-Lookup

**Klarstellung:** BLS 4.0 hat keine Barcodes.
Barcode-Scanning ist **ausschliesslich** für Custom Foods.

**Zweck:** User erfasst ein gekauftes Produkt (z.B. Proteinshake einer Marke)
und ordnet ihm einen Barcode zu. Beim nächsten Scan wird das
eigene Custom Food direkt gefunden — ohne erneute manuelle Suche.

**Flow:**
```
User will Produkt loggen
  → Scannt Barcode
  → Suche in nutrition.foods_custom WHERE barcode = $scanned

  TREFFER:
  → Custom Food direkt in Mengen-Eingabe laden

  KEIN TREFFER:
  → "Produkt noch nicht erfasst"
  → Custom Food Formular öffnet sich mit Barcode vorausgefüllt
  → User gibt Namen, Makros, optional Mikros manuell ein
  → Speichern → beim nächsten Scan direkt gefunden
```

**Kein OpenFoodFacts-Lookup.** Kein automatisches Nährstoff-Befüllen
aus externen Quellen. User ist verantwortlich für die eingegebenen Werte.

**Technisch:**
```typescript
// Barcode-Scan Handler
async function handleBarcodeScan(barcode: string, userId: string) {
  const existing = await db.query(
    'SELECT * FROM nutrition.foods_custom WHERE user_id = $1 AND barcode = $2',
    [userId, barcode]
  );

  if (existing.rows.length > 0) {
    return { found: true, food: existing.rows[0] };
  } else {
    return { found: false, prefill: { barcode } };
    // → Client öffnet CustomFoodForm mit barcode vorausgefüllt
  }
}
```

**SPEC_03:** Flow 6 (Custom Food erstellen) um Barcode-Scan Einstieg ergänzen.
**SPEC_04 Feature 4:** Klärung "Barcode = Custom Food Identifier" ergänzen.

---

## #20 — Top-Foods Endpoint statt statischem Array

`data/nutrientDetails.ts` hat `food_sources: string[]` als statisches Array.
Ersetzen durch dynamischen Endpoint.

**Neuer API Endpoint:**
```
GET /api/nutrition/nutrients/:code/top-foods?limit=10

Response:
[
  { "food_id": "uuid", "name_display": "Lachs", "value_per_100g": 11.2, "unit": "µg", "category": "Fetter Seefisch" },
  { "food_id": "uuid", "name_display": "Hering",  "value_per_100g": 9.8,  "unit": "µg", "category": "Fetter Seefisch" },
  ...
]

Query:
SELECT
  f.id, f.name_display, fn.value as value_per_100g,
  fc.name_de as category
FROM nutrition.foods f
JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
JOIN nutrition.food_categories fc ON fc.id = f.category_id
WHERE fn.nutrient_code = $1
ORDER BY fn.value DESC
LIMIT $2
```

**Vorteil:** Immer korrekt, kein Maintenance, zeigt echte BLS-Werte.
Gibt automatisch die richtigen Quellen für jeden der 138 Nährstoffe.

**SPEC_07 API:** Neuen Endpoint `GET /nutrients/:code/top-foods` dokumentieren.
**SPEC_10 data/nutrientDetails.ts:** `food_sources[]` Array entfernen,
stattdessen Hinweis auf API-Endpoint.

---

## Spec-Update Übersicht

| ADR | Betrifft | Dateien zu updaten |
|---|---|---|
| #13 Offline V2 | SPEC_04 Feature 5 | SPEC_04_FEATURES.md |
| #14 Quick-Add Makros | SPEC_03 Flow 6.5, SPEC_10 | SPEC_03, SPEC_10 |
| #17 Immutable Items | SPEC_02 Entity 15, SPEC_07 | SPEC_02, SPEC_07 |
| #18 Custom Allergens | SPEC_02 Entity 7, SPEC_10 | SPEC_02, SPEC_07, SPEC_10 |
| #19 Barcode Custom Only | SPEC_03 Flow 6, SPEC_04 F4 | SPEC_03, SPEC_04 |
| #20 Top-Foods Endpoint | SPEC_07, SPEC_10 | SPEC_07, SPEC_10 |
