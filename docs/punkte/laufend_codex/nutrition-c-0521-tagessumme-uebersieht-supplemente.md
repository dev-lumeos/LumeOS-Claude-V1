---
nr: C-521
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-519
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [nutrition.daily_summary]
zahlen:
  gemessen: 2026-09-08
---

# C-521 - die Tagessumme uebersieht die Supplemente

## Befund

Aus G-485, Claude Code, 2026-09-08:

> *,,`nutrition.daily_summary` rechnet die Supplemente nicht
mehr mit ? 2.007,53 statt 2.127,53 kcal, weil die Sicht
`sum(mi.enercc)` liest und das seit C-519 NULL ist. Die
Mahlzeitensumme stimmt (sie rechnet im Browser), die
Tagessumme nicht."*

## Selbst gemessen, und groesser

`[cmd]` **DREI Supplementzeilen in `meal_items`, alle mit:**

    enercc      NULL
    food_name   NULL

`[read]` **Er meldet EINE Zeile mit 120 kcal** ? **es sind
drei.**

`[cmd]` **C-519 hat `food_name` nullable gemacht und die
Naehrwerte in den JSON-Schnappschuss verlegt** ? **die Sicht
liest noch die Spalte.**

## Was daran haengt

`[read]` **Zwei Summen, die auseinanderlaufen:**

    Mahlzeitensumme   rechnet im Browser   RICHTIG
    Tagessumme        liest sum(mi.enercc) FALSCH

`[read]` **Der Nutzer sieht beide auf demselben Schirm.**

`[cmd]` **Und C-466 fuehrt Nahrung und Supplement getrennt** ?
**miss, ob `nutrient_intake_source_totals_for_day` dasselbe
Problem hat.**

## Abnahmebedingungen

    A1  daily_summary holt die Supplementwerte aus
        intake_logs.
    A2  Toms Tagessumme stimmt mit der
        Mahlzeitensumme ueberein. Zahl.
    A3  alle DREI Supplementzeilen zaehlen, nicht
        eine.
    A4  MISS, ob C-466 dasselbe Problem hat.
    A5  Gegenprobe: ein Tag ohne Supplemente bleibt
        unveraendert.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

