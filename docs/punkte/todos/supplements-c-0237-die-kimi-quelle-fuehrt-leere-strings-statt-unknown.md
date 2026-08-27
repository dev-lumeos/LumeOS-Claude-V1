---
nr: C-237
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: C-235
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-237 - Die Kimi-Quelle fuehrt leere Strings statt `unknown`

## Befund

(neu 2026-08-23). Aus C-235.

  `[cmd]` **331 leere Strings** im `regulatory`-Block: UK **175**,
  Australia **156**. Dazu 53 `unknown` je Rechtsraum.

  `[read]` **`""` heisst „nie gefragt", `unknown` heisst „gefragt,
  nichts gefunden".** Die Quelle unterscheidet das nicht — damit ist
  bei 331 Feldern nicht sagbar, ob recherchiert wurde.

  `[cmd]` Codex hat sie nicht als Zeile importiert und den Grund als
  `NOTICE` ins SQL geschrieben, statt sie passend zu machen. Deshalb
  `supplement_regulatory` 1.119 statt der vom Orchestrator
  vorgegebenen 1.185 — **dessen Zaehlmuster zaehlte leere Strings mit.**

  **Beim naechsten Crawl melden:** leere Felder gehoeren als `unknown`
  oder gar nicht geliefert.
