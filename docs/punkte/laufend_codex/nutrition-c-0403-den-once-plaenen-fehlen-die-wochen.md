---
nr: C-403
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-401
entscheidung: E-62
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: [nutrition.meal_plan_weeks]
zahlen:
  gemessen: 2026-09-02
  cut_fehlt: 3
  lean_fehlt: 11
---

# C-403 — den `once`-Plaenen fehlen die Wochen

## Befund

Aus C-401, Codex, 2026-09-02.

`[cmd]` **`Cut 4-Meal 2200`: `days_count` 28, `lifecycle_type`
`once`, eine Woche.**
`[cmd]` **`Lean bulk 3100`: `days_count` 84, `once`, eine Woche.**

`[read]` **Bei `once` laeuft der Plan einmal ab** — **also braucht er
alle Tage, die er behauptet.**

`[read]` **Waere es `rollover`, waere eine Woche richtig** (E-44).
**Es ist `once`.**

`[cmd]` **Es fehlen 3 beziehungsweise 11 Wochen.**

## Was zu tun ist

`[read]` **Die Wochen anlegen** — **und in die C-380-Seedwege
eintragen**, damit sie den naechsten Kettenlauf ueberleben.

`[cmd]` **`meal_plan_slots` bekommen sie schon mit** (C-397).

`[read]` **`days_count` bleibt unveraendert** — **E-62: es ist die
Laufzeit, und die stimmt.**

## Und ein dritter Fall, umgekehrt

`[cmd]` **Nachgemessen: `Aufbau-Wochenplan` traegt 4 Wochen, 28 Tage,
84 Eintraege** — **bei `days_count 21`.**

`[read]` **28 Tage beschrieben, 21 behauptet.** `[read]` **Zu viele,
nicht zu wenige.**

`[read]` **Miss, was richtig ist:** **eine Woche zuviel, oder
`days_count 28`?**

`[cmd]` **Und `test` traegt 4 Wochen, 28 Tage, 0 Eintraege** — **die
Werkbank, richtig leer.**

## Auftrag

**Mitbeauftragt mit C-402 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.
