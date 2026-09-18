---
nr: E-84
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-83
entscheidung: null
beruehrt:
  tabellen: [supplements.intake_logs]
zahlen:
  gemessen: 2026-09-08
---

# E-84 - ein Supplement bleibt ein Supplement

## Toms Entscheidung

Tom, 2026-09-08:

> ich bin der meinung, dass ein supplement, selbst wenn es in
> einem meal gelistet ist, immer noch ein supplement ist und
> mit dem stack gespeichert wird. das macht es sowieso
> einfacher zu sagen, woher die daten kommen

> wir haben eigene deklarationen, wann supplements genommen
> werden, kann mit einem meal passen, muss aber nicht

> dieselbe regel fuer rezepte betreffs supplements wie wenn ich
> ein meal machen wuerde. ja klar kann ich zb 500ml
> milch/blaubeeren und whey protein ein rezept fuer meinen
> eigenen shake machen

## Die Regel

    Wo es steht        supplements  -- EINE Wahrheit
    Wo es erscheint    Meal, Rezept, Plan -- als VERWEIS
    Woher die Zahl     immer "aus Supplement"

`[read]` **Damit stimmt der Modulvertrag wieder** ?
`SPEC_01_MODULE_CONTRACT.md:84`: *,,Nutrition speichert KEINE
Supplement-Produkte."*

`[read]` **Der Widerspruch W1 aus E-83 loest sich auf.**

## Was schon da ist

`[cmd]` **`supplements.intake_logs` traegt bereits
`supplier_product_id`** ? **810 Zeilen.**

`[cmd]` **Und `stack_items.timing` hat ACHT Werte:**

    morning | midday | evening | pre_workout
    post_workout | bedtime | with_meal | any
    gefuellt: morning 6, evening 2, with_meal 2

`[cmd]` **`frequency`:** `daily`, `weekdays`, `training_days`,
`custom`, `cycling`.

`[read]` **Toms Deklaration steht seit langem** ? `with_meal`
**heisst *,,mit einer Mahlzeit"*, aber nicht, mit welcher.**

## Was C-513 stattdessen gebaut hat

`[cmd]` **`nutrition.meal_items`:**

    supplement_product_id
    supplement_serving_size
    supplement_serving_quantity
    supplement_nutrient_status
    nutrients (Snapshot)

`[cmd]` **1 Zeile Daten betroffen.**

`[read]` **Jetzt ist die Umstellung billig. In einem Monat
nicht.**

## Was die Regel loest

**1** ? **Eine Wahrheit statt zwei.**

`[read]` **Heute koennte jemand ein Whey im Stack abhaken UND
ins Fruehstueck eintragen** ? **zwei unabhaengige Zeilen.**

`[read]` **Mit der Regel ist es EINE Einnahme, die zufaellig im
Fruehstueck steht.**

**2** ? **C-513s A7 wird ueberfluessig.**

`[cmd]` **Die 60-Minuten-Nachfrage braucht es nicht mehr** ?
**es ist dieselbe Zeile.**

**3** ? **Rezepte brauchen keine eigene Loesung.**

`[read]` **Ein Rezept verweist auf ein Supplement wie eine
Mahlzeit** ? **dieselbe Bauform.**

## Was zu bauen ist

`[read]` **Die Verbindung zwischen Einnahme und Mahlzeit.**

    supplements.intake_logs
      + meal_id   (welche Mahlzeit, darf leer sein)

    nutrition.meal_items
      supplement_product_id und die vier Spalten
      werden zu EINEM Verweis auf intake_logs

`[cmd]` **MISS, ob der Snapshot in `intake_logs` gehoert** ?
**dort stehen schon `supplement_name_snapshot`,
`dose_snapshot`, `dose_unit_snapshot`.**

## Was zu klaeren ist

`[read]` **Ein Whey im Fruehstueck IST eine Einnahme.**

    a  es taucht im Stack-Reiter auf, abgehakt
    b  es zaehlt nur in der Bilanz

`[cmd]` **`intake_logs.status` gibt es** ? **miss, welche Werte
er traegt.**

`[read]` **Und: braucht ein Supplement im Meal ueberhaupt einen
`stack_item_id`?** **Wer ein Whey einmalig ins Fruehstueck tut,
hat es nicht im Stack.**

