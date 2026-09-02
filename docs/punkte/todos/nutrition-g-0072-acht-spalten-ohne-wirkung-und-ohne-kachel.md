---
nr: G-72
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-65
kinder: []
entscheidung: E-47
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-72 - Acht Spalten ohne Wirkung und ohne Kachel

## Befund

(neu
  2026-08-19). **Entscheidung fuer Tom.** Rest aus G-65.

  `[cmd]` **`cooking_skill`, `prep_time_max_min`, `budget_level`,
  `meals_per_day`, `snacks_per_day`, `meal_prep_ok`,
  `preferred_cuisines`, `planner_notes`** — gespeichert, ohne Wirkung,
  **und das Mockup hat fuer keine eine Stelle.**

  `[read]` **Der Agent hat richtig gemeldet statt gebaut:** *„Der
  Auftrag sagte „Zeigen ja" — aber das Mockup hat fuer keine eine
  Stelle, und eine zu erfinden waere eine doppelte Erfindung."*

  `[cmd]` **Sie stammen aus Schritt 3 des Vorgaenger-Assistenten** —
  Kochen & Alltag. **Und sie wirken erst mit Rezepten und
  Essensplaenen**, die es nicht gibt.

  **Zu entscheiden:** Kachel dazu, oder liegenlassen bis Meal plans?

## Neu bewertet, 2026-08-31

`[read]` **Der Punkt fragte: Kachel dazu, oder liegenlassen bis Meal
plans?**

`[cmd]` **Meal plans, Planner und Rezepte sind seit dem 31.08.
gebaut** (E-39, E-40, G-289, C-372).

`[read]` **Damit ist die Bedingung eingetreten** — **die acht Spalten
koennen jetzt wirken oder es zeigt sich, dass sie es nicht koennen.**

`[cmd]` **G-99 hat drei davon als wirkungslos gemessen:**
`budget_level`, `meal_prep_ok`, `planner_notes` — **weil `recipes`
kein Preis- und kein Vorkochfeld fuehrt.**

`[read]` **Das ist heute noch so** — nachgemessen: `recipes` traegt
`cooking_skill` und `prep_time_min`, sonst nichts davon.

`[read]` **Also bleibt die Frage, aber schaerfer:** **drei Spalten
brauchen Gegenstuecke an `recipes`, oder sie gehoeren weg.**

## Entschieden: E-47, 2026-09-02

Tom hat die acht Spalten einzeln zugeordnet:

    cooking_skill        vorsehen, auskommentiert -- spaeteres
    prep_time_max_min    Ausbaumodul mit Rezepten und Kochen
    budget_level

    meals_per_day        in Nutrition Diary: wie viele Mahlzeiten
    snacks_per_day       dargestellt werden. Gehoeren in Preferences
    meal_prep_ok         UND in die Nutzereinstellungen

    preferred_cuisines   weggelassen, allfaellig spaetere Ausbaustufe

    planner_notes        Freitext, den der Nutzer frei schreibt --
                         wird Buddy-Material

`[read]` **Damit ist der Punkt kein Entscheid mehr, sondern drei
Bauauftraege verschiedener Reife.**
