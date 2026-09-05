---
nr: C-411
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [nutrition.food_curation_candidates]
zahlen:
  gemessen: 2026-09-07
  kandidaten: 0
---

# C-411 — Rezeptvorschlaege in der Kuration

## Befund

Tom, 2026-09-07, zu MealCam: *,,das rezept muss aber auch im
adminbereich zur validierung auftauchen, dann koennen wir einen
ausbau administrieren."*

`[cmd]` **Der Weg existiert, fuer Lebensmittel:**

    food_curation_candidates
      food_id, target_type, target_field, proposed_value,
      source, reason, status, reviewer
      0 Zeilen

    food_curation_decisions
      candidate_id, decision, reviewer, reason
      0 Zeilen

`[cmd]` **`status`:** `pending`, `accepted`, `rejected`,
`superseded`.

`[cmd]` **`target_type`:** `category_assignment`, `display_name`,
`alias`, `preference_item_mapping`.

`[read]` **Kein Wert fuer Rezepte** — **das ist die Luecke.**

`[read]` **Und `food_id` ist Pflicht** — **ein Rezeptvorschlag haengt
an keinem einzelnen Lebensmittel.**

## Zu entscheiden

`[read]` **Ein `target_type` fuer Rezepte** — **oder eine eigene
Kandidatentabelle?**

`[read]` **Ein Rezept traegt Zutaten mit Mengen** — **das passt
schlecht in `proposed_value`.**

`[cmd]` **Und `food_id` muesste optional werden** — **eine
Strukturaenderung an einer Tabelle mit 0 Zeilen ist billig, spaeter
nicht.**

## Und der Herkunftswert

`[cmd]` **`recipes.source` kennt `user`, `coach`, `marketplace`,
`buddy`.**

`[read]` **Traegt ein MealCam-Rezept `buddy`, oder braucht es einen
eigenen Wert?**

`[read]` **`buddy` ist der Gefaehrte, MealCam ist eine Kamera** —
**zwei verschiedene Herkuenfte.**

`[cmd]` **E-45 regelt, was mit jeder Herkunft geschieht** —
**ein fuenfter Wert braucht dort einen Eintrag.**
