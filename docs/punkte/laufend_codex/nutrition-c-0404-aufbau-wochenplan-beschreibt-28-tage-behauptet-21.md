---
nr: C-404
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-09-02
braucht: []
kind_von: C-403
entscheidung: E-62
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-02
  beschrieben: 28
  behauptet: 21
---

# C-404 — `Aufbau-Wochenplan` beschreibt 28 Tage, behauptet 21

## Befund

Aus C-403, 2026-09-02.

`[cmd]` **`Aufbau-Wochenplan`: 4 Wochen, 28 Tage, 84 Eintraege** —
**bei `days_count 21`.**

`[read]` **Der umgekehrte Fall zu Cut und Lean:** **zu viele Tage,
nicht zu wenige.**

    Aufbau-Wochenplan   21 behauptet, 28 beschrieben
    Cut 4-Meal 2200     28 behauptet, 28 beschrieben   -- geloest
    Lean bulk 3100      84 behauptet, 84 beschrieben   -- geloest
    Buddy auto-plan      7 behauptet,  7 beschrieben

## Zu klaeren

`[read]` **Eine Woche zuviel, oder `days_count 28`?**

`[cmd]` **E-62: `days_count` ist die Laufzeit.** `[read]` **Wenn der
Plan vier Wochen beschreibt, laeuft er vier Wochen** — **dann ist die
Zahl falsch.**

`[read]` **Oder die vierte Woche gehoert nicht dazu** — **dann sind
84 Eintraege zu viel.**

`[cmd]` **Und `test` traegt 4 Wochen, 28 Tage, 0 Eintraege** — **die
Werkbank, richtig leer.**

## Auftrag

**Mitbeauftragt mit C-410 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.