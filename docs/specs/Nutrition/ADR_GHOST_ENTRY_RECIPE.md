# ADR: Ghost Entry aus Rezept — Einzelfoods-Prinzip

**Datum:** April 2026 | **Status:** Final

## Entscheidung

Ghost Entries die aus einem `MealPlanItem.recipe_id` stammen zeigen
**immer alle Einzelzutaten** — nie das Rezept als Einheit.

```
Mittagessen — Plan-Vorschlag (📖 Hähnchen-Reis-Bowl)
────────────────────────────────────────────────────
● Hähnchenbrust    [200] g    218 kcal  46g P
● Basmati Reis     [150] g    174 kcal   3g P
● Broccoli         [100] g     34 kcal   3g P
● Olivenöl          [10] g     88 kcal   0g P
────────────────────────────────────────────────────
Gesamt: 514 kcal · 52g P

[Bestätigen ✓]  [Hinzufügen +]  [Skip]
```

Jede Zeile hat ein editierbares Mengenfeld.
"Hinzufügen +" erlaubt weitere Foods zum Slot.

## Begründung

LUMEOS rechnet grundsätzlich mit Einzelfoods. Jedes MealItem bekommt
seinen eigenen Nährstoff-Snapshot (food × amount_g / 100).
Ein "Rezept als Einheit bestätigen" würde dieses Prinzip brechen und
die Mengen-Anpassbarkeit pro Zutat wegnehmen.

Das Rezept ist nur eine **Vorlage** — beim Loggen werden immer
einzelne MealItems erstellt, eines pro Zutat.

## Technische Konsequenz

Beim Bestätigen eines Recipe-basierten Ghost Entry:
```
FOR EACH RecipeItem in recipe.items:
  MealItem erstellen mit:
    food_id     = recipe_item.food_id
    amount_g    = recipe_item.amount_g (oder User-angepasster Wert)
    nutrients   = food.nutrients × (amount_g / 100)   ← eingefroren
```

MealPlanLog.actual_meal_id zeigt auf die Meal die alle Items enthält.
Deviation wird auf Kalorien-Basis der Gesamt-Mahlzeit berechnet.
