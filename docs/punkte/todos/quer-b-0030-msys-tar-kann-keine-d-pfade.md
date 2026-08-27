---
nr: B-30
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: C-236
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["tools/lauf.py"]
zahlen: null
---

# B-30 - MSYS-`tar` kann keine `D:\`-Pfade

## Befund

(neu 2026-08-23).
  Aus C-236.

  `[cmd]` Die Kette lief zweimal rot, bis System32-`tar` im PATH
  stand. Die Git-Bash bringt ein MSYS-`tar` mit, das
  Windows-Laufwerkspfade nicht aufloest.

  **Gehoert in `tools/lauf.py`** — wer einen Befehl braucht, der nicht
  darueber geht, erweitert die Datei. `_aufloesen()` macht das bereits
  fuer `pnpm.cmd` und `npx.cmd`; `tar` gehoert dazu.

  `[cmd]` **Zweiter Stolperer aus demselben Lauf:** Backticks um
  `[cmd]` innerhalb eines SQL-Template-Literals beenden den String
  (`ReferenceError`). Gehoert in die Schreibregeln.
