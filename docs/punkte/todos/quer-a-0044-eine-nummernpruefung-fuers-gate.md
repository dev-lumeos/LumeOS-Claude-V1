---
nr: A-44
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-21
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["CLAUDE.md", "docs/todo/TODO.md", "docs/todo/ERLEDIGT.md", "tools/schemafreigabe-pruefen.mjs"]
zahlen: null
---

# A-44 - Eine Nummernpruefung fuers Gate

## Befund

(neu 2026-08-21).
  **Damit A-41 zugehen kann.**

  `[cmd]` **Am 2026-08-21 waren neun Nummern doppelt vergeben** —
  A-18, A-29, G-102, C-105, C-124, GO-21, G-89, G-98, G-99. **Und A-18
  heisst *„Berichtsnummern kollidieren"*.**

  `[read]` **Die Regel steht in `CLAUDE.md` und greift nicht** — weil
  sie ein Absatz ist, kein Werkzeug.

  ### Was sie pruefen muss

  `[cmd]` **Dubletten ueber alle Reihen** in `TODO.md` und
  `ERLEDIGT.md` — **auch ueber beide Dateien hinweg**, eine erledigte
  Nummer darf nicht neu vergeben werden.

  `[cmd]` **Den Zaehler im Kopf gegen die Datei.**

  `[cmd]` **Und die hoechste Nummer je Reihe ausgeben** — dann muss der
  Orchestrator nicht raten.

  `[read]` **In beide Richtungen belegen:** mit einer eingebauten
  Dublette muss sie rot werden. **Vorbild:
  `tools/schemafreigabe-pruefen.mjs`.**
