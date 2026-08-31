# ADR: Recipes / Meal Plans / Shopping Lists — Schema-only V1

**Datum:** April 2026 | **Status:** Final — V1 Entscheidung


> **Abgeloest, Stand 2026-08-31.**
>
> **E-39** entscheidet: Rezepte, Meal Plans und Einkaufslisten werden
> in V1 gebaut. Die Begruendung dieses ADR — *"wenn Zeit knapp wird"* —
> traegt nicht mehr: das Schema steht, die Tabellen tragen Daten, und
> die Reiter sind sichtbar.
>
> **Was hier weiter gilt:** die V1-Pflichtliste der Tabellen, und die
> drei unberuehrten Entscheidungen am Ende — universelles
> MealPlan-Schema, Shopping Lists in Nutrition, Einzelfoods-Prinzip
> beim Loggen.
>
> Vermerkt in E-39.

---

## Kontext

Recipes, Meal Plans und Shopping Lists sind komplexe Features mit viel UI/API-Aufwand. Die Frage war: Sind sie V1-Pflicht oder kann der Scope reduziert werden?

## Entscheidung

**V1: Schema vorbereiten — kein Full-UI, kein Full-API Pflicht.**

Wenn Zeit knapp wird: Recipes, Meal Plans und Shopping Lists **komplett auf Phase 2** verschieben.

## V1 Pflicht (immer)

```
Tabellen anlegen:
  nutrition.recipes
  nutrition.recipe_items
  nutrition.meal_plans
  nutrition.meal_plan_days
  nutrition.meal_plan_items
  nutrition.meal_plan_logs
  nutrition.shopping_lists
  nutrition.shopping_list_items
```

Das Schema existiert, damit spätere Phase-2-Features sauber darauf aufbauen können.

## V1 Optional (wenn Zeit reicht)

```
Read-Endpoints für eigene Recipes und Meal Plans
Einfaches Recipe erstellen
Plan aktivieren
Shopping List aus Rezept generieren
```

## Phase 2 (nicht V1-Pflicht)

```
Full Recipe Builder UI
Full Meal Plan Builder UI
Shopping List UI mit Abhak-Funktion
Marketplace Recipes
Buddy MealPlan Builder
Coach MealPlan UI
```

## Keine Änderung an bestehenden Entscheidungen

- `MealPlan universelles Schema` (user/coach/marketplace/buddy) — bleibt
- `Shopping Lists in Nutrition` — bleibt
- `Einzelfoods-Prinzip beim Loggen von Rezepten` — bleibt
