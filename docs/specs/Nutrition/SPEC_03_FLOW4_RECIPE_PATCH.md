# SPEC_03 Flow 4 — Ergänzung: Rezept-basierte Ghost Entries

Ergänzt `docs/specs/Nutrition/SPEC_03_USER_FLOWS.md` Flow 4 (Ghost Entry bestätigen).

## Zusatz: MealPlanItem mit recipe_id

Wenn `MealPlanItem.recipe_id` gesetzt ist (statt food_id/custom_food_id),
werden alle RecipeItems als Einzelfoods im Ghost Entry dargestellt.

Das Rezept ist nur eine Vorlage — in der UI und beim Loggen existiert
es nur als Sammlung seiner Einzelzutaten.

**UI-Darstellung:**
```
Ghost Entry zeigt Rezept-Name als Überschrift (📖 [Name])
darunter alle Einzelzutaten mit individuellen Mengenfeldern
```

**Bestätigungs-Flow identisch zu Case 2 (manuelle Bestätigung):**
- Jede Zutat = eine Zeile mit editierbarer Menge
- User kann Mengen ändern, Zutaten weglassen, neue hinzufügen
- Bestätigen → ein Meal + N MealItems (eines pro Zutat)
- Deviation = Kaloriendifferenz Plan vs. tatsächlich

**MealCam-Flow (Case 1) mit Rezept:**
- Erkannte Foods werden gegen alle Rezept-Zutaten einzeln verglichen
- Gleiche Matching-Logik wie bei food_id-basierten Items

→ Vollständige Entscheidungsdokumentation: `ADR_GHOST_ENTRY_RECIPE.md`
