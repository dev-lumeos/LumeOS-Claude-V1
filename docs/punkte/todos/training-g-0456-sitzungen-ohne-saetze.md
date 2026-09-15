---
nr: G-456
typ: befund
modul: training
schwere: niedrig
angelegt: 2026-09-08
braucht: []
kind_von: G-450
entscheidung: null
beruehrt:
  tabellen: [training.workout_sessions]
zahlen:
  gemessen: 2026-09-08
---

# G-456 - fuenfzehn Sitzungen ohne Saetze

## Befund

Aus G-450, Claude Code, 2026-09-08:

> *,,`dev@lumeos.app` traegt zehn Sitzungen mit Datum bis
2026-11-11, alle mit 0 Saetzen ? stoeren die Rechnung nicht,
aber der Wechsler zeigt dort NAMEN OHNE INHALT."*

`[cmd]` **Selbst nachgemessen: FUENFZEHN, nicht zehn.**

`[read]` **Der Befund ist groesser als gemeldet.**

## Was zu messen ist

`[read]` **Woher kommen sie?**

`[cmd]` **C-493 hat zehn Sitzungen angelegt** ? **die fuenf
uebrigen sind aelter.**

`[read]` **Eine Sitzung ohne Saetze ist entweder ein
Abbruch oder ein Seed-Fehler.**

## Was zu tun ist

`[read]` **Messen, dann entscheiden** ? **loeschen, fuellen
oder als geplant markieren.**

`[cmd]` **`workout_sessions.status` gibt es** ? **miss, was
drinsteht.**
