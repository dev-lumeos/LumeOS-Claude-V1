---
nr: C-400
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-397
entscheidung: null
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-09-02
  wochen: 2
  eintraege: 57
---

# C-400 — eine Woche zuviel im Buddy-Plan

## Befund

Aus C-397, Codex, 2026-09-02: *,,Buddy auto-plan hat 29 statt 28
Eintraege (am 02.09. fuenf)."*

`[cmd]` **Nachgemessen: zwei Wochen, 14 Tage, 57 Eintraege.**

    18.-24.06.     je 4                     = 28
    31.08.-06.09.  je 4, am 02.09. fuenf    = 29

`[read]` **Die zweite Woche hat der Orchestrator am 02.09.
angelegt**, als er die drei Plaene fuellte — `[cmd]` **und der fuenfte
Eintrag entstand beim Ausprobieren.**

`[cmd]` **C-380 fuellte die Plaene danach mit passenden Naehrwerten**
— **die alte Woche blieb stehen.**

`[read]` **Codex hat nichts geloescht und den Test nicht
abgeschwaecht** — richtig.

## Zu klaeren

`[read]` **Welche Woche gehoert zum Plan?** `[cmd]` **`days_count`
steht auf 7** — **also eine, nicht zwei.**

`[read]` **Und der Test erwartet 28.** `[read]` **Entweder die
ueberzaehlige Woche faellt weg, oder der Plan traegt 14 Tage und der
Test ist falsch.**

`[cmd]` **`Cut 4-Meal 2200` und `Lean bulk 3100` sind zu pruefen** —
**sie entstanden im selben Lauf.**
