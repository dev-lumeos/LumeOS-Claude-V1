---
nr: G-488
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-488 - drei Zahlen zum Plan, keine zwei passen

## Befund

`[cmd]` **Auf einem Schirm gemessen, 2026-09-08:**

    Flaeche oben:    "Tag 3 von 35"
    Flaeche unten:   "Dauer 28 Tage"
    meal_plans:      days_count 28
    meal_plan_days:  63 Tage, 2026-06-18 bis 2026-10-23

`[cmd]` **Und *,,Laeuft bis 23.10."*** ? **19.09. + 28 Tage =
17.10.**

## Abnahmebedingungen

    A1  "Tag 3 von 35" gegen "28 Tage": welche stimmt?
        Berichtigt.
    A2  63 Tage in meal_plan_days gegen 28 im Plan:
        GEMELDET, wenn es ein Datenfehler ist.
    A3  "Laeuft bis": gerechnet oder gelesen?
    A4  vier Module unveraendert.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
