---
nr: G-165
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-165 - `nutrition-foods` zahlt die Preference-Kosten zweimal

## Befund

(neu 2026-08-22). Gehoert zu C-192.

  `[cmd]` **1.830 ms im Dokument und 1.750 ms im `fetch` danach** —
  beide mit `prefs=1`, dieselbe Abfrage. Gesamt 4.287 ms im zweiten
  Lauf, also kein Kaltstart.

  `[read]` **Das serverseitige Erstladen hat der Orchestrator in G-154
  beauftragt**, damit die Liste nicht von 7.140 auf 5.292 springt.
  **Dass es die teuerste Abfrage verdoppelt, war nicht bedacht.**

  `[cmd]` Nebenbefund: `supplements` liegt durchgehend bei ~2.100 ms
  ueber alle elf Tabs — kein Ausreisser, aber der langsamste
  Modulrahmen.
