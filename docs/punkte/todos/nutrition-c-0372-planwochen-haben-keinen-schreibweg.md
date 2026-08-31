---
nr: C-372
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-304
entscheidung: null
beruehrt:
  tabellen: [nutrition.meal_plan_weeks, nutrition.meal_plan_days]
zahlen:
  gemessen: 2026-08-31
---

# C-372 — Planwochen haben keinen Schreibweg

## Befund

Aus G-304, Claude Code, 2026-08-31.

`[cmd]` **`meal_plan_weeks` wird nirgends im Code eingefuegt.**
`[cmd]` **`meal_plan_days` kommt nur in einem `select` vor.**

`[cmd]` **Auf `test-user` belegt: der ueber *New plan* angelegte Plan
hat 0 Wochen, 0 Tage, 0 Eintraege.**

`[read]` **Ein Plan ohne Wochen ist ein Datensatz, kein Plan.**

## Und dann luegt die Anzeige

`[cmd]` **Der Planner zeigt fuer genau diesen Plan *,,Es liegt kein
Plan vor"*.** `[cmd]` **Der Zweig ist `!d.plan || d.wochen.length ===
0`.**

`[read]` **Ein Plan ohne Wochen wird als *kein Plan* gemeldet** —
**und der einzige angebotene Knopf ist die *in Entwicklung*-Attrappe.**

`[read]` **Damit ist der Weg zu Ende: anlegen, dann nichts.**

## Warum das der Kern ist

Tom, 2026-08-31: *,,die diskrepanz ich kann da einen plan anlegen
zumindest namentlich und konfigs."*

`[read]` **Genau das ist es: das Formular fragt Name, Ziele,
Lebenszyklus, Startdatum und Tageszahl** — **nie Wochen, Tage oder
Eintraege.**

`[cmd]` **`SPEC_03` Flow 3 beschreibt kein Anlegen** (C-370) — **er
beginnt bei der Uebersicht.** `[read]` **Das Formular war eine
Erfindung des Orchestrators, und es erzeugt einen leeren Datensatz.**
