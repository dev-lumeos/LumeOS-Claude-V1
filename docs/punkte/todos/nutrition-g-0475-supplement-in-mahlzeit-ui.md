---
nr: G-475
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-513
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-475 - Supplemente in die Mahlzeit, in der Oberflaeche

## Was C-513 liefert

`[cmd]` **`meal_items.food_source` erlaubt jetzt
`supplement`.**

`[cmd]` **Vier Spalten:** `supplement_product_id`,
`supplement_serving_size`, `supplement_serving_quantity`,
`supplement_nutrient_status`.

`[cmd]` **Toms Beispiel rechnet: 557,5 kcal, 40,022 g
Protein** ? **Whey mit 120 kcal und 24 g.**

## Abnahmebedingungen

    A1  ein Supplement laesst sich einer Mahlzeit
        hinzufuegen. Foto.
    A2  die Tagesbilanz weist es SEPARAT aus. Foto.
    A3  Toms Fruehstueck: Haferflocken, Blaubeeren,
        Mandelmus, Whey. Foto mit der Summe.
    A4  mehrere Portionsgroessen: die Wahl steht.
    A5  ein Produkt ohne Naehrwerte: was steht da?
    A6  A7 aus C-513: dasselbe Produkt im Stack UND
        in der Mahlzeit innerhalb 60 Minuten ->
        die Nachfrage. Foto.
    A7  vier Module unveraendert.
    A8  apps/web 1835 oder mehr, apps/coach 65.
