# ADR: Wasser-Tracking — Gesamt-Hydration (Option B)

**Datum:** April 2026 | **Status:** Final

## Entscheidung

Der WaterTracker zeigt **Gesamt-Hydration** = explizit geloggtes Wasser + Wasser aus Lebensmitteln.

```
Wasser heute
─────────────────────────────────────────
💧 Getrunken:        2.0 L   (explizit geloggt)
🥗 Aus Nahrung:      0.6 L   (aus meal_items.water_g)
─────────────────────────────────────────
Gesamt:              2.6 L  / 3.0 L Ziel  (87%)

████████████████████░░░░  87%
```

## Datenquelle

- **Getrunken:** `SUM(water_logs.amount_ml)` für das Datum
- **Aus Nahrung:** `SUM(meal_items.water_g)` via `DailyNutritionSummary` VIEW
  (bereits vorhanden — `water_g` ist direktes Makro-Spalte in meal_items)
- **Gesamt:** Summe beider Quellen
- **Ziel:** `nutrition_targets.water_target` (von Goals geliefert)

## Warum das ein Differenzierungsmerkmal ist

Kein Competitor (MFP, YAZIO, Cronometer, Lifesum) zeigt Nahrungswasser.
BLS 4.0 hat `water_g` für alle 7.140 Foods — wir haben die Daten sowieso.
Hähnchenbrust 75% Wasser, Gemüse 90% — bei 500g Nahrung kommen schnell
300-600ml zusammen. Für Hydrations-Tracking relevant.

## UI-Darstellung

```
WaterTracker Komponente:

  [💧 2.0L getrunken]  [🥗 +0.6L aus Nahrung]  = 2.6L / 3.0L

  Fortschrittsbalken — zweifarbig:
  [████████████████ blau (getrunken) ░░░░ hellblau (nahrung) ░░░░ leer]

  Quick-Add Buttons: [+250ml] [+500ml] [+750ml] [+1L]
  (nur für explizites Wasser — Nahrungswasser auto-berechnet)
```

## API-Anpassung

`GET /api/nutrition/summary/today` Response erweitern:

```json
{
  "water": {
    "logged_ml": 2000,
    "food_ml": 620,
    "total_ml": 2620,
    "target_ml": 3000,
    "pct": 87.3,
    "status": "warn"
  }
}
```

`WaterCompliance` Type in `packages/scoring/src/nutrition.ts` erweitern:

```typescript
interface WaterCompliance {
  logged_ml:  number;   // explizit geloggt
  food_ml:    number;   // aus Nahrung (neu)
  total_ml:   number;   // Summe (Basis für Status/Pct)
  target_ml:  number;
  pct:        number;
  met:        boolean;
  status:     'ok' | 'warn' | 'low';
}
```

## Pending Actions Logik bleibt gleich

`calcPendingActions()` in SPEC_09 prüft weiterhin `waterCompliance.pct < 80` nach 18:00 Uhr.
Basis ist jetzt `total_ml` (inkl. Nahrungswasser) — fairer für User.
