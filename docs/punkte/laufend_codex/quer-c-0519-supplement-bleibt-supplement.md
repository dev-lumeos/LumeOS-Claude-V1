---
nr: C-519
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-84
entscheidung: E-84
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.intake_logs]
zahlen:
  gemessen: 2026-09-08
---

# C-519 - ein Supplement bleibt ein Supplement

## Toms Entscheidung (E-84)

> ich bin der meinung, dass ein supplement, selbst wenn es in
> einem meal gelistet ist, immer noch ein supplement ist und
> mit dem stack gespeichert wird. das macht es sowieso
> einfacher zu sagen, woher die daten kommen

    Wo es steht        supplements  -- EINE Wahrheit
    Wo es erscheint    Meal, Rezept, Plan -- als VERWEIS
    Woher die Zahl     immer "aus Supplement"

`[read]` **Damit stimmt der Modulvertrag wieder** ?
`SPEC_01_MODULE_CONTRACT.md:84`: *,,Nutrition speichert KEINE
Supplement-Produkte."* ? **der Widerspruch W1 aus E-83 loest
sich auf.**

## Was schon da ist

`[cmd]` **`supplements.intake_logs` traegt
`supplier_product_id`** ? **810 Zeilen.**

`[cmd]` **`stack_items.timing`:** `morning`, `midday`,
`evening`, `pre_workout`, `post_workout`, `bedtime`,
`with_meal`, `any`.

## Was C-513 stattdessen gebaut hat

`[cmd]` **`nutrition.meal_items`:** `supplement_product_id`,
`supplement_serving_size`, `supplement_serving_quantity`,
`supplement_nutrient_status`, `nutrients`.

`[cmd]` **1 Zeile Daten betroffen** ? **jetzt ist die
Umstellung billig.**

## Toms zwei Antworten

**1** ? **Kein Abhaken.**

> ein whey im fruehstueck ist nicht teil des stacks, den er
> abhaken muss. er bestaetigt die einnahme ja mit dem meal

**2** ? **Einnahme ohne Stackeintrag ist erlaubt.**

`[cmd]` **`intake_logs.stack_item_id` muss NULL-faehig
werden.**

### Und das Argument, das alles entscheidet

> er kann keinen shake in den stack legen, weil wir da milch
> nicht kennen

`[read]` **Der Stack fuehrt Substanzen und Produkte, keine
Lebensmittel** ? **ein Shake aus Milch, Blaubeeren und Whey
kann dort nicht liegen.**

`[read]` **Also: Rezept mit Whey drin, einmal ins
Fruehstueck.**

## Zu bauen

    supplements.intake_logs
      + meal_id (welche Mahlzeit, darf leer sein)
      stack_item_id wird NULL-faehig
    nutrition.meal_items
      die fuenf Spalten werden zu EINEM Verweis
    nutrition.recipe_ingredients
      dieselbe Bauform -- ein Rezept darf Supplemente
      enthalten

`[cmd]` **MISS, ob der Snapshot in `intake_logs` gehoert** ?
**dort stehen schon `supplement_name_snapshot`,
`dose_snapshot`, `dose_unit_snapshot`.**

## Abnahmebedingungen

    A1  intake_logs.meal_id, stack_item_id NULL-faehig.
    A2  die eine bestehende meal_items-Zeile umgezogen.
    A3  Toms Fruehstueck rechnet weiter: 557,5 kcal,
        40,022 g.
    A4  ein Rezept mit Whey: gebaut und gerechnet.
    A5  eine Einnahme OHNE Stackeintrag und OHNE
        Mahlzeit ist moeglich.
    A6  die Bilanz weist Supplemente weiter separat
        aus (C-466).
    A7  Gegenprobe: eine Einnahme, die zu keiner
        Mahlzeit gehoert, taucht nicht im Meal auf.
    A8  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

