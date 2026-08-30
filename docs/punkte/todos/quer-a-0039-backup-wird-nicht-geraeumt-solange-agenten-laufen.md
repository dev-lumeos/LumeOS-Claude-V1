---
nr: A-39
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-21
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/punkte/00-LIESMICH.md"]
zahlen: null
---

# A-39 - `backup/` wird nicht geraeumt, solange Agenten laufen

## Befund

(neu 2026-08-21). **Fehler des Orchestrators.**

  `[cmd]` **Der G-147-Agent hat es gemeldet:** *„Zwei frisch angelegte
  Probeskripte verschwanden waehrend des Auftrags aus `backup/` —
  mutmasslich ein parallel aufraeumender Agent."*

  `[cmd]` **Das war der Orchestrator.** Er hat 13 Agentenskripte
  entfernt, waehrend drei Agenten arbeiteten.

  `[read]` **`backup/` ist in `.gitignore` und wird von Agenten als
  Ablage benutzt.** **Aufraeumen erst, wenn niemand arbeitet** —
  `LAUFEND.md` sagt, wer laeuft.

  `[cmd]` **Dasselbe gilt fuer `tools/`** — dort lagen die
  `_g135-*`-Skripte, als G-135 noch lief.
