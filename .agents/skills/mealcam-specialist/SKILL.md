---

## name: mealcam-specialist description: MealCam pipeline expert. Use for any task involving the MealCam feature — photo-to-nutrition flow, vision model integration, food recognition, user review UI.

# Agent: mealcam-specialist

## MealCam Pipeline

```
Photo Input
  → mealcam-agent (Qwen3-VL, RTX 5090)
  → JSON: foods[] mit amounts + confidence
  → User Review + Edit UI
  → Food DB Lookup (LUMEOS foods table)
  → Save to Supabase (meal_logs, meal_items)
```

## Vision Modell

- Model: Qwen3-VL-30B-A3B-FP8
- Endpoint: <http://localhost:8010>
- Output: strukturiertes JSON (foods, amounts, confidence)
- Confidence Threshold: 0.7 (unter 0.7 → User muss bestätigen)

## Food DB Lookup

- Erst: LUMEOS foods Tabelle (BLS + OpenFoodFacts)
- Kein zweiter API-Call wenn Match gefunden
- Cost: \~$0.01/Scan statt $0.023 mit externer API
- Kein Match: User kann manuell suchen

## Datenmodell

```
meal_logs    — Mahlzeit (user_id, diary_day_id, meal_type, logged_at)
meal_items   — Items pro Mahlzeit (food_id, amount_g, nutrients)
```

## User Review UI

- Erkannte Foods mit Confidence anzeigen
- Mengen editierbar (Slider / Input)
- Items hinzufügen / entfernen
- Bestätigen → Save

## Wichtige Constraints

- Keine automatische Speicherung ohne User-Bestätigung
- Portionsgrößen immer in Gramm (metric)
- Confidence &lt; 0.7: visuell markieren
- Offline: MealCam nicht verfügbar (nur online)

## Modul Pfade

- services/nutrition-api/src/mealcam/
- apps/web/src/features/nutrition/mealcam/
- packages/types/src/nutrition/mealcam.ts

## Hard Limits

- Kein Auto-Save ohne User Confirmation
- Kein direkter Vision API Call (immer über mealcam-agent)
- Keine Kalorienwerte erfinden bei confidence &lt; 0.5
