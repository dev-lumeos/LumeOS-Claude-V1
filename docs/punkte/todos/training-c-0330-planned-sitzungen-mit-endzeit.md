---
nr: C-330
typ: befund
modul: training
schwere: niedrig
angelegt: 2026-08-28
braucht: []
kind_von: G-216
entscheidung: null
beruehrt:
  tabellen: [training.workout_sessions]
zahlen:
  gemessen: 2026-08-28
  sitzungen: 66
  planned: 28
  planned_mit_ended_time: 28
  completed: 36
  cancelled: 2
  active: 0
---

# C-330 — geplante Sitzungen tragen eine Endzeit

## Befund

Aus G-216, 2026-08-28. **Vom Orchestrator nachgemessen.**

`[cmd]` **28 von 28 `planned`-Sitzungen tragen eine `ended_time`** —
obwohl sie nicht stattgefunden haben.

`[read]` **Eine geplante Sitzung, die schon weiss, wann sie zu Ende
war, ist ein Widerspruch im Datenbestand.** `[read]` Es sind
Seed-Daten, also heute harmlos — **aber jede Auswertung, die
`ended_time` als *stattgefunden* liest, zaehlt sie mit.**

`[cmd]` **Der Leseweg tut das nicht:** *absolviert* kommt seit G-69
aus dem Datum, nicht aus `status`. `[read]` **Das ist Glueck, kein
Schutz** — die naechste Auswertung kann es anders machen.

## Was zu tun ist

**Entweder die Seed-Daten berichtigen, oder einen `CHECK`, der
`planned` mit `ended_time` verbietet.**

`[read]` **Der `CHECK` ist der bessere Weg**, weil er auch fuer das
Formular aus G-217 gilt — **und das wird der erste sein, der
`planned`-Sitzungen wirklich anlegt.**
