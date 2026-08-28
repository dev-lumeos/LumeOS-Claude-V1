---
nr: E-22
getroffen: 2026-08-28
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-221, G-229, G-134]
modul: nutrition
---

# E-22 — das Food-Tag-Set V1

## Frage

`[cmd]` **Vier Quellen, vier Listen.** `NUTRITION_NEXT_SPEC_DECISIONS
§5` nennt 16 Tags, `SPEC_04` Feature 3 und `SPEC_05` ueber 100, die
Datenbank fuehrt **14 mit 30.797 Zuordnungen.** Die Review nennt das
CRIT-2.

## Entscheidung

Tom, 2026-08-28.

**Bleiben, wie gebaut:**

    high_protein   >= 20 g PROT625      1.400 Zuordnungen
    low_carb       <= 10 g CHO          4.659
    low_fat        <=  3 g FAT          2.648
    high_fiber     >=  6 g FIBT           558
    vegan                                1.377
    vegetarian                           1.751

**Neu, und der eigentliche Punkt:** *,,fuer einen bodybuilder fehlen
hier die umgekehrten"* —

    low_protein · high_carb · high_fat · low_fiber

`[read]` **Die vier bestehenden Makro-Tags kennen nur eine Richtung.**
Wer Kohlenhydrate sucht, findet nur, was wenige hat. **Fuer eine
Aufbauphase ist das die falsche Haelfte.**

`[cmd]` **Die Schwellen liegen als `macro_rule` in
`tag_definitions`** — die Umkehrungen brauchen eigene Werte, **nicht
die Negation der bestehenden.** Zwischen `low_carb` (<= 10 g) und
einem sinnvollen `high_carb` liegt ein Bereich, der zu keinem von
beiden gehoert.

**Ebenfalls neu:** `gluten_free`, `lactose_free`.

`[read]` **Und das ist nicht die Negation von `contains_*`.** Ein
Lebensmittel ohne `contains_gluten` kann glutenfrei **oder
ungeprueft** sein. `[cmd]` Bei 622 von rund 15.000 Eintraegen mit
`contains_gluten` ist der Rest ueberwiegend ungeprueft. **Dieselbe
Unterscheidung wie *begruendet leer* gegen *nicht bearbeitet* aus
G-208.**

**Ohne Prioritaet:** `halal`, `kosher`. Tom: *,,nice to have aber
keine prioritaet, denn diese will ich gar nicht auf der plattform
haben"*. `[cmd]` Beide sind gebaut mit ueber 6.000 Zuordnungen —
**sie bleiben liegen, werden aber nicht ausgebaut.**

**Weggelassen:** Kuechenrichtungen. Tom: *,,die kochrichtungen lassen
wir weg, bauen wir spaeter in den mealplaner ein"*. `[cmd]` Betrifft
`thai_food` (definiert, **0 Zuordnungen**) und `mediterranean` (nie
gebaut).

**Phase 2:** die ueber 100 Profi-Tags aus `SPEC_04`/`SPEC_05` —
`creatine_source`, `leucine_rich`, `contest_prep`,
`powerlifting_bulk` und die uebrigen. `[read]` **Eine andere
Produktstufe, keine V1-Frage.**

## Was daraus folgt

**`SPEC_04` Feature 3 und `SPEC_05` werden nachgezogen**, gemaess Toms
Regel vom 28.08.: *,,ja wenn es aus einem brainstorm mit mir
abgeleitet wird und ein adr fuer die entscheidung hat. es ist nicht
alles gold oder endzustand in den specs."*

**Die Schwellen der vier neuen Makro-Tags sind offen** und gehoeren
belegt, nicht gesetzt — **wie die Umrechnungsfaktoren in C-149.**

`[cmd]` **`is_exclusion_relevant` traegt heute fuenf Tags**
(`contains_gluten`, `contains_lactose`, `contains_nuts`, `vegan`,
`vegetarian`). `[read]` **Ob `gluten_free` und `lactose_free` dort
hineingehoeren, ist eine eigene Frage** — ein Ausschluss filtert,
eine Eigenschaft beschreibt.
