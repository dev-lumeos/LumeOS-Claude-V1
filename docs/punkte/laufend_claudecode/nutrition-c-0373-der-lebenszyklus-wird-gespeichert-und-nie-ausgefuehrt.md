---
nr: C-373
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: G-304
entscheidung: E-42
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-08-31
  rollover_count: 0
---

# C-373 — der Lebenszyklus wird gespeichert und nie ausgefuehrt

## Befund

Aus G-304, Claude Code, 2026-08-31.

`[cmd]` **Die Lebenszykluswahl aus G-290 wird gespeichert.** `[cmd]`
**Ausgefuehrt wird sie nie: keine Funktion, kein Zeitplaner,
`rollover_count` steht auf 0.**

`[cmd]` **Und ein abgelaufener Plan kann nicht beendet werden** —
**kein Knopf setzt `completed`, `paused` oder `archived`.**

`[read]` **Damit laufen Flow 11–13 gar nicht.**

## Die Frage dahinter ist dieselbe wie in C-358

`[cmd]` **Bei den Coach-Aktionen war es genauso:** `expired` im CHECK
erlaubt, live 0 Zeilen, kein Schreiber.

`[read]` **Dort wurde entschieden: beim Anzeigevermerk bleiben** —
weil es keinen autoritativen Schreiber gibt.

`[read]` **Hier ist es anders:** `[cmd]` **`rollover` und `sequence`
sind Versprechen** — *,,startet automatisch neu"*, *,,geht in einen
Folgeplan ueber"*. `[read]` **Ein Versprechen ohne Ausfuehrung ist
schlimmer als ein Vermerk.**

`[read]` **Also entweder ein Schreiber, oder die zwei Zyklen werden
nicht angeboten, bis es einen gibt.**

## Auftrag

**Mitbeauftragt mit G-306 am 2026-08-31.** Bericht dort.

`[read]` **C-377 loest es: die Meldung beim Ablauf ist die
Ausfuehrung.** **Kein Zeitplaner noetig.**
