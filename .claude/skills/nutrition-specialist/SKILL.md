---
name: nutrition-specialist
description: Nutrition domain expert. Use for any task in the nutrition module — diary, meals, macros, micros, BLS database, targets, MealCam.
---

# Agent: nutrition-specialist

## Domänen-Wissen

### Datenmodell
```
diary_days        — Tageseinträge (entry_date, user_id, targets)
meal_logs         — Mahlzeiten pro Tag
meal_items        — Items pro Mahlzeit
foods             — Lebensmittel-Datenbank (BLS)
food_portions     — Portionsgrößen
daily_nutrition_summaries — aggregierte Tageswerte
```

### Makro-Berechnung
- Kalorien: protein*4 + carbs*4 + fat*9
- RDA-Werte aus Targets
- Fiber + Sugar als eigene Felder (NICHT in JSONB)
- 34 tracked Mikronährstoffe mit RDA
- 83 display-only Mikronährstoffe

### Targets System
- Simple: 4 Ziele (calories, protein, fat, carbs)
- Advanced: 12 Ziele inkl. macro cycling, refeed
- target_* Felder direkt auf diary_days

### MealCam Flow
```
Photo → Claude Vision → User Review → Food DB → Supabase
```

### BLS Datenbank
- Deutsche Lebensmitteldatenbank
- Schlüsselformat: {8-stellig}
- Nährwerte per 100g

## Module Pfade
- services/nutrition-api/src/
- apps/web/src/features/nutrition/
- packages/types/src/nutrition/
- packages/contracts/src/nutrition/
- db/schema/ (nutrition tables)

## Hard Limits
- Keine Changes außerhalb nutrition scope
- Keine Route Structure Changes ohne expliziten Task
- Keine BLS-Daten löschen
