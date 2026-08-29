---
nr: G-261
typ: entscheidung
modul: nutrition
schwere: niedrig
angelegt: 2026-08-29
braucht: []
kind_von: G-250
entscheidung: E-31
beruehrt:
  tabellen: [goals.nutrition_targets]
zahlen:
  gemessen: 2026-08-29
  naehrstoffspalten: 6
  mit_beiden_achsen: 3
  abweichend: 1
---

# G-261 — die Vergleichsfunktionen anbinden

## Befund

Aus G-250, Claude Code, 2026-08-29.

`[cmd]` **`goals.nutrition_targets` hat sechs Naehrstoffspalten**,
nicht sechzig. `[cmd]` **Drei davon tragen beide Achsen, und genau
eine geht auseinander:** `F18:3CN3` ist gegen das persoenliche Ziel
gedeckt (85,7 %) und gegen EFSA zu wenig (51,6 %).

`[read]` **Nach dem G-218-Massstab ist das *selten*** — eine Achse
mit Vermerk genuegt, **und der Vermerk steht bereits in der
Kopfzeile.**

`[cmd]` **Die Vergleichsfunktionen sind gebaut, getestet und
absichtlich an nichts gehaengt.**

## Die Frage

**Sollen sie angebunden werden, obwohl heute nur ein Fall
abweicht?**

`[read]` **Dagegen: eine zweite Achse fuer einen einzigen Fall macht
jede Zeile schwerer zu lesen.** `[read]` **Dafuer: sobald mehr
persoenliche Ziele gesetzt werden, waechst die Zahl** — und dann
faellt es auf, ohne dass jemand hinsieht.

## Entschieden: E-31

**Nicht anbinden, aber messbar halten.**

`[cmd]` **`tools/zwei-wahrheiten-pruefen.mjs` steht im Gate**,
Sollstand 6 Naehrstoffspalten. **Kommt eine dazu, faellt das Gate**
und dieser Punkt wird von selbst wieder zur Frage.

`[read]` **Die Zurueckstellung hat damit ein Ablaufdatum, das sich
selbst meldet.**
