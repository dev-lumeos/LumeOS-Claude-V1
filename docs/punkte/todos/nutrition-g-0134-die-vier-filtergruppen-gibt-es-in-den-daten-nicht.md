---
nr: G-134
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: C-164
kinder: []
entscheidung: E-49
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-134 - Die vier Filtergruppen gibt es in den Daten nicht

## Befund

(neu
  2026-08-20). **Entscheidung.** Befund aus C-164.

  `[cmd]` **`tag_type` traegt drei Werte:** `diet` (9 Codes),
  `processing` (2), `allergen` (3).

  `[read]` **Die Oberflaeche zeigt vier Gruppen** — Ernaehrungsform,
  Naehrwert, Verarbeitung, Allergene. **„Ernaehrungsform" und „Naehrwert"
  sind beide `diet`.**

  `[cmd]` **Folge:** *„Wer stumpf nach `tag_type` gruppiert, verodert
  `vegan` mit `high_protein`."*

  `[read]` **Damit ist die Gruppierung eine Entscheidung, keine
  Ablesung.** **Entweder eine Gruppenspalte in `tag_definitions`, oder
  die Zuordnung bleibt in der Anzeige** — dann steht sie an zwei
  Stellen.

## Entschieden: E-49, 2026-09-02

Tom: *,,logisch optimieren dass es fuer menschen auch verstaendlich
ist."*

`[cmd]` **Gemessen: `diet` mischt drei Fragen** — was ich
grundsaetzlich esse, wonach ich gerade suche, welche Kueche.

    Ernaehrungsform    vegan, vegetarian, halal, kosher
    Naehrwert          high_protein, high_fiber, low_carb, low_fat
    Verarbeitung       whole_food, ultra_processed
    Allergene          contains_gluten, contains_lactose,
                       contains_nuts

`[cmd]` **`thai_food` faellt heraus** — eine Kueche, keine
Ernaehrungsform. `[cmd]` **`food_preferences.preferred_cuisines`
steht dafuer bereit** (E-47, zurueckgestellt). **Bis dahin geparkt,
mit Vermerk.**

`[read]` **Der Unterschied ist nicht kosmetisch:** `[cmd]` **koscher
trifft 6.451 Lebensmittel, ballaststoffreich 558.** `[read]`
**Ernaehrungsform ist ein dauerhafter Rahmen, Naehrwert eine Suche
fuer diesen Moment.**

`[cmd]` **Und die Zuordnung gehoert als Spalte in
`tag_definitions`** — heute steht sie nur in der Oberflaeche, **an
einer Stelle, die kein Waechter erreicht.**
