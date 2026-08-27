---
nr: C-145
typ: befund
modul: training
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: G-86
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-145 - `Plan` braucht ein Schema, keine Anzeige

## Befund

(neu
  2026-08-19). **Befund aus G-86, eindeutig gemessen.**

  `[cmd]` **Von elf Feldern, die die zwei Kacheln brauchen, fuehrt
  `workout_sessions` keines.**

  `[read]` **Der entscheidende Punkt:** *„`name` traegt 30 Sitzungen mit
  30 verschiedenen Namen, jeder genau einmal — **eine Routine ist etwas
  Wiederverwendbares, hier wiederholt sich nichts.**"*

  `[read]` **Und die Abgrenzung zum Kalender sitzt:** *„Der Kalender
  zeigt datierte Sitzungen, **Plan zeigt die Struktur darueber** —
  Bloecke, Wochen mit Phasenzweck, Routinen mit Herkunft. Fehlendes
  Schema, kein Anzeigeproblem."*

  `[cmd]` **Was es braeuchte:** Routinen als eigene Objekte,
  Bloecke/Wochen, und eine Verbindung von der Sitzung zur Routine.
