---
nr: C-390
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: G-134
entscheidung: E-49
beruehrt:
  tabellen: [nutrition.tag_definitions]
zahlen:
  gemessen: 2026-09-02
  spalten: 9
---

# C-390 — `tag_definitions` hat keine Untergruppe

## Befund

Aus G-134, Claude Code, 2026-09-02.

`[cmd]` **`tag_definitions` hat neun Spalten:** `code`, `name_de`,
`name_en`, `tag_type`, `is_exclusion_relevant`, `icon`, `sort_order`,
`requires_macro_check`, `macro_rule`.

`[cmd]` **Keine fuer die Untergruppe.**

`[read]` **E-49 hat entschieden, dass `diet` drei Fragen mischt:**
Ernaehrungsform, Naehrwert, Kueche.

`[cmd]` **Die Zuordnung steht heute nur in der Oberflaeche** — **an
einer Stelle, die kein Waechter erreicht.**

## Was zu bauen ist

**Eine Spalte, die die vier Gruppen traegt.**

    Ernaehrungsform   vegan, vegetarian, halal, kosher
    Naehrwert         high_protein, high_fiber, low_carb, low_fat
    Verarbeitung      whole_food, ultra_processed
    Allergene         contains_gluten, contains_lactose,
                      contains_nuts

`[cmd]` **`thai_food` bleibt geparkt** — **eine Kueche, bis
`preferred_cuisines` kommt** (E-47).

`[read]` **Und dann bekommt der naechste Tag seine Gruppe beim
Anlegen, nicht beim Anzeigen.**

## Vorsicht bei den Schreibern

`[cmd]` **C-387 hat gemessen: vier Kettenschritte schreiben Tags,
027 loescht zehn Codes und liest neu ein.**

`[read]` **Die Spalte gehoert an `tag_definitions`, nicht an
`food_tags`** — **sie beschreibt den Tag, nicht die Zuordnung.**
`[read]` **Damit ueberlebt sie den Import.**
