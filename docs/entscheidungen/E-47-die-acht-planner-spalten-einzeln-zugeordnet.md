---
nr: E-47
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-72, G-99, G-222]
modul: nutrition
---

# E-47 — die acht Planner-Spalten, einzeln zugeordnet

## Entscheidung

Tom, 2026-09-02, zu G-72:

    cooking_skill        vorsehen, auskommentiert -- kommen in einem
    prep_time_max_min    spaeteren Ausbaumodul mit Rezepten und
    budget_level         Kochen

    meals_per_day        definiert in Nutrition Diary, wie viele
    snacks_per_day       Mahlzeiten dargestellt werden. Gehoeren
    meal_prep_ok         ebenfalls in Preferences und in die
                         Nutzereinstellungen

    preferred_cuisines   in Preferences weggelassen, allfaellig
                         eine spaetere Ausbaustufe

    planner_notes        Freitext, den der Nutzer frei schreibt --
                         wird Buddy-Material

## Was daraus folgt

### Drei bleiben stehen, sichtbar auskommentiert

`[read]` **`cooking_skill`, `prep_time_max_min` und `budget_level`
brauchen Gegenstuecke an `recipes`**, die es nicht gibt (G-99).

`[cmd]` **`recipes` traegt `cooking_skill` und `prep_time_min`** —
**kein Preis- und kein Vorkochfeld.**

`[read]` **Auskommentieren heisst hier: mit Kommentarblock, der sagt
warum** — **nicht loeschen und nicht still lassen** (A-59).

### Drei bekommen eine Wirkung

`[cmd]` **`meals_per_day`, `snacks_per_day`, `meal_prep_ok` steuern,
wie viele Mahlzeiten das Tagebuch zeigt.**

`[read]` **Das ist heute schon sichtbar, aber unerklaert:** `[cmd]`
**der Planner schreibt *,,4 Reihen aus deinen Vorlieben — 4
Hauptmahlzeiten und 1 Snack. Fuer 4 Hauptmahlzeiten fuehrt das Schema
nur drei Reihen"*.**

`[read]` **Die Spalten wirken also bereits im Planner** — **und
sollen es auch im Tagebuch tun, mit Einstellmoeglichkeit an zwei
Orten.**

### Eine bleibt liegen

`[cmd]` **`preferred_cuisines`** — in Preferences bewusst
weggelassen.

### Und eine wird Buddy-Material

`[cmd]` **`planner_notes` stammt aus
`P1-005-preferences-spec-gap-patch.md`:** *,,free-text notes for
future planner context"*.

`[read]` **Ein Freitextfeld fuer das, was kein Filter abbildet** —
*,,sonntags koche ich vor"*, *,,keine Zwiebeln fuer meine Frau"*.

`[cmd]` **Es wird nicht ausgewertet, sondern gelesen** — von Buddy,
wenn er einen Plan baut.

`[read]` **Damit gehoert es zu `wissen`-Material, nicht zu
Filterlogik** — und der Punkt, ab wann Buddy es liest, haengt an der
Autonomiestufe (E-11).
