---
nr: G-262
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-254
entscheidung: null
beruehrt:
  dateien: [apps/web/src/app/v2/nutrition/ansicht.tsx]
zahlen: null
---
# G-262 — Pre-workout window ist Attrappe

## Befund

**Tom, 2026-08-29**, beim Durchgehen des Nutrition-Moduls.

`[read]` **Eine der Kacheln aus G-254, von Tom benannt.**

## Vor dem Bauen zu klaeren

`[read]` **Woraus soll die Zahl entstehen?** Ein Pre-Workout-Fenster
setzt voraus, dass bekannt ist, wann trainiert wird.

`[cmd]` **`training.workout_sessions` traegt Sitzungen mit Zeit.**
`[read]` **Ob das Tagebuch daraus liest, ist eine Modulgrenze** —
dieselbe Frage wie bei G-258 und `coach.pending_actions`, dort mit
E-29 zugunsten einer Funktion entschieden.
