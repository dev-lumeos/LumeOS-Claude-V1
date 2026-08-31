---
nr: E-39
getroffen: 2026-08-31
von: Tom
status: gueltig
loest_ab: ADR_RECIPES_SCHEMA_ONLY
abgeloest_durch: null
betrifft: [G-289, G-288, G-300, G-301, C-370]
modul: nutrition
---

# E-39 — Rezepte, Plaene und Einkaufslisten werden in V1 gebaut

## Entscheidung

Tom, 2026-08-31: *,,schliess das sauber ab und lass es richtig bauen.
vorsehen dass coach und marketplace angebunden wird spaeter."*

**`ADR_RECIPES_SCHEMA_ONLY` ist abgeloest.** Die Oberflaechen fuer
Rezepte, Meal Plans und Einkaufslisten gehoeren in V1.

## Was der ADR sagte

`[cmd]` **April 2026:** *,,V1: Schema vorbereiten — kein Full-UI, kein
Full-API Pflicht. Wenn Zeit knapp wird: komplett auf Phase 2."*

`[cmd]` **`SPEC_10_PASS2_PATCH` FIX-7 fuehrt die Liste:**
`RecipeView`/`RecipeForm`/`RecipeDetail`, `ShoppingListView`/`Detail`,
`MealPlansView`/`MealPlanDetail`/`PlanActivation`, `GhostEntryCard` —
**alle *Schema-only V1 → Phase 2*.**

## Warum die Begruendung nicht mehr traegt

`[read]` **Der ADR begruendet sich mit *,,wenn Zeit knapp wird"*.**
`[cmd]` **Das Schema steht seit Monaten, die Tabellen tragen Daten:**
`recipes` 6, `meal_plans` 2, `meal_plan_entries` 112,
`shopping_lists` 1.

`[cmd]` **Und die Reiter sind sichtbar** — Meal plans, Planner,
Shopping list. `[read]` **Ein Reiter, der etwas verspricht, was V1
nicht baut, ist schlimmer als kein Reiter.**

`[read]` **Tom, 2026-08-31 zu genau diesen Reitern:** *,,was soll das
fuer ein activer plan sein? willkuerlich irgendwas geseeded und
aufgelistet wo keiner definieren, anlegen oder editieren kann."*

## Was gilt

**Gebaut wird, was in `SPEC_03` steht:** Flow 3 (Plan aktivieren),
Flow 7 (Rezept erstellen und loggen), Flow 8 (Einkaufsliste aus
Rezept), Flow 11–13 (Lebenszyklus).

**Und `ADR_GHOST_ENTRY_RECIPE` bleibt unberuehrt:** ein Rezept ist
eine Vorlage, beim Loggen entstehen immer Einzelzutaten, je Zutat ein
`MealItem` mit eingefrorenen Naehrwerten.

## Vorgesehen, nicht gebaut: Coach und Marketplace

Tom: *,,vorsehen dass coach und marketplace angebunden wird spaeter."*

`[cmd]` **Die Herkunft steht bereits im Schema:** `plan_origin` mit
`self_created`, `coach_created`, `marketplace` (C-342). `[cmd]`
**`Recipe.source` traegt `user | coach | marketplace | buddy`**
(ADR_RECIPE_SOURCE_BUDDY).

`[cmd]` **Und `SPEC_03` Flow 3 nennt die Beschriftung je Quelle:**
*,,Von [Coach-Name]"*, *,,Gekauft: [Produkt-Name]"*, *,,Erstellt von
Buddy"*.

**Das heisst konkret:**

    die Herkunft wird angezeigt      auch wenn heute alle
                                     self_created sind
    die Liste ist nach Quelle        nicht nach Reiter getrennt
      gruppierbar
    kein eigener Weg fuer Coach      E-29 gilt: ueber eine Funktion
      oder Marketplace
    keine Sperre gegen fremde        G-269 hat die Coach-Sperre
      Herkunft                       schon gebaut

`[read]` **Vorsehen heisst: die Anzeige traegt die Unterscheidung,
bevor es etwas zu unterscheiden gibt.** **Nicht: einen leeren
Coach-Bereich bauen.**

## Was das fuer die drei Reiter bedeutet

`[cmd]` **G-301: die Unterreiter *Active plan*, *Plan library*,
*Shopping list* stehen in keiner Spec.** `[cmd]` **Flow 3 kennt eine
Uebersicht, in der ein Plan `status: active` traegt.**

`[cmd]` **Und Flow 8 sagt: Einkaufsliste aus einem Rezept** — **nicht
aus einer Planwoche.** `[read]` **Sie gehoert zum Rezept, nicht in den
Plan-Reiter.**
