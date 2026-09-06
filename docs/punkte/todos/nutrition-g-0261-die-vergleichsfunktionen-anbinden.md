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

## Auftrag

**Mitbeauftragt mit G-352 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

**Claude Code, 2026-09-06.** Mitbeauftragt mit G-352. **Der
vollstaendige Bericht steht in
[G-352](quer-g-0352-drei-zielskalen-widersprechen-sich.md#bericht).**

`[read]` **Er wartet nicht auf sich selbst** — **er ist mit E-31
entschieden:** *,,nicht anbinden, aber messbar halten"*.

`[cmd]` **Nachgemessen 2026-09-06:** `tools/zwei-wahrheiten-pruefen.mjs`
meldet *,,gruen: 6 Naehrstoffspalten, Soll 6"* — **und steht im Gate**
(`package.json:10`).

`[read]` **Nichts blockiert ihn.** **Kommt eine siebte Spalte, faellt
das Gate und der Punkt wird von selbst wieder zur Frage.**

`[read]` **Vorschlag: nach `todos/`** — **er laeuft nicht, und
`laufend_*` soll ehrlich bleiben.**

## Abnahme

_(vom Orchestrator)_

## Gemessen am 2026-09-07: bewusst zurueckgestellt.

`[cmd]` **Hinter einem funktionierenden Gate-Waechter** — **gemessen
am 2026-09-07.**

`[read]` **Der Punkt wartet nicht auf sich selbst, sondern auf eine
Entscheidung.**
