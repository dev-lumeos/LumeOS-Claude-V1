# SPEC_10 — Component Patch-Notizen April 2026

Ergänzungen zu `SPEC_10_COMPONENTS.md`.

---

## Diary Components — QuickMacroEntry hinzufügen

In die Tabelle "Diary Components (10)" einfügen (macht 11):

| Component | Beschreibung |
|---|---|
| `QuickMacroEntry` | Direktes Eingeben von Makros ohne Food-Suche (enercc/P/KH/F + Label). Erstellt MealItem mit food_source='manual', nutrients JSONB leer. |

---

## Food Search Components — CustomFoodForm erweitern

`CustomFoodForm` Beschreibung aktualisieren:

| Component | Beschreibung |
|---|---|
| `CustomFoodForm` | Formular Custom Food erstellen/bearbeiten. Inkl. Allergen-Selektor (EU 14 Checkboxen → custom_allergens[]) und Barcode-Feld (EAN/UPC als Identifier). |

---

## Barcode Scanner

Neuer Entry in "Food Search Components":

| Component | Beschreibung |
|---|---|
| `BarcodeScanner` | Barcode scannen → Lookup in foods_custom (barcode = $scanned). Treffer: direkt in Mengen-Eingabe. Kein Treffer: CustomFoodForm mit vorausgefülltem Barcode öffnen. |

---

## data/nutrientDetails.ts — food_sources entfernen

`food_sources: string[]` Array aus `NutrientDetail` Interface **entfernen**.

Ersetzen durch API-Aufruf:
```typescript
// Statt statischem food_sources Array:
const topFoods = await api.get(`/api/nutrition/nutrients/${code}/top-foods?limit=10`);
```

`NutrientDetail` Interface anpassen:
```typescript
interface NutrientDetail {
  code: string;
  name_de: string;
  name_en: string;
  name_th: string;
  icon: string;
  group: string;
  tier: 1 | 2 | 3;
  unit: string;
  rda_male: number;
  rda_female: number;
  benefits: string[];
  deficit_symptoms: string[];
  surplus_symptoms: string[];
  // food_sources entfernt → dynamisch via GET /nutrients/:code/top-foods
}
```

---

## Hooks — useQuickMacroAdd hinzufügen

```typescript
useQuickMacroAdd()
// POST /api/nutrition/meals/:mealId/items/quick-add
// Body: { label, enercc, prot625, fat, cho, fibt? }
```

## Hooks — useBarcodeLookup hinzufügen

```typescript
useBarcodeLookup(barcode: string)
// GET /api/nutrition/foods/custom/barcode/:barcode
// Returns: { found: boolean, food?: CustomFood, prefill?: { barcode } }
```

## Hooks — useNutrientTopFoods hinzufügen

```typescript
useNutrientTopFoods(nutrientCode: string, limit = 10)
// GET /api/nutrition/nutrients/:code/top-foods
// Returns: Top-Foods für Mikro-Detail Anzeige
```
