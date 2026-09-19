---
nr: C-524
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-483
entscheidung: E-84
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-09-08
---

# C-524 - Planeintraege koennen keine Supplemente

## Befund

Aus G-483, Claude Code, 2026-09-08:

> *,,`nutrition.meal_plan_entries` hat keine
Supplementspalte."*

`[cmd]` **Selbst gemessen: KEINE.**

`[cmd]` **Die Spalten heute:** `entry_type`, `recipe_id`,
`food_id`, `custom_food_id`, `amount_g`, `planned_servings`,
`portion_name`, `portion_quantity`, `portion_amount_g`.

## Was C-519 fuer die anderen Wege gebaut hat

    meal_items           supplement_intake_log_id
    recipe_ingredients   food_source = supplement
                         plus supplements.
                         recipe_product_references

`[read]` **Zwei Bauformen, beide nach E-84: der Verweis zeigt
ins Supplement-Schema.**

`[cmd]` **MISS, welche fuer Planeintraege passt** ? **ein
geplanter Eintrag ist noch keine Einnahme.**

### Der Unterschied

`[read]` **`meal_items` verweist auf einen `intake_log`** ?
**eine Einnahme, die stattgefunden hat.**

`[read]` **Ein Planeintrag ist eine ABSICHT** ? **er braucht
das Produkt und die Portion, aber keinen Einnahmeeintrag.**

`[cmd]` **`recipe_product_references` ist die naehere
Bauform** ? **miss sie.**

## Und die Ghostentries

`[cmd]` **G-482 hat gemessen: Ghostentries funktionieren, sie
zeigen den Plan des Tages.**

`[read]` **Wenn ein Plan ein Supplement enthaelt, muss der
Ghost es zeigen** ? **und das Bestaetigen muss daraus eine
Einnahme machen.**

`[cmd]` **MISS, wie das Bestaetigen heute arbeitet.**

## Abnahmebedingungen

    A1  welche Bauform passt? Begruendet.
    A2  ein Supplement in einem Planeintrag.
    A3  der Ghost zeigt es.
    A4  Bestaetigen macht eine Einnahme daraus,
        mit intake_log.
    A5  ein Plan ohne Supplemente bleibt unveraendert.
    A6  Gegenprobe: eine Kapsel im Plan -> was passiert?
        (Toms Formregel: nur untermischbare)
    A7  Sicherung, Vollkette, ALLE Waechter.
