---
nr: G-152
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-100
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-28
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-152 - Der Aktivitaetsstrom des Dashboards

## Befund

(neu 2026-08-20,
  aus G-100).

  `[cmd]` **Er waere baubar** — anders als der Tagesverlauf braucht er
  keine Dauer, nur Zeitpunkt, Modul und einen Satz. Die Zeitpunkte
  liegen vollstaendig vor: `meals.meal_time` **725/725**,
  `intake_logs.intake_time` **360/360**,
  `workout_sessions.started_time` **30/30**.

  `[read]` **Was fehlt, ist eine Entscheidung, keine Spalte:** Es gibt
  keine gemeinsame Ereignistabelle. Sechs Abfragen je Seitenaufruf,
  nach Zeit gemischt — **oder** eine Sicht in der Datenbank, die das
  einmal tut. Das Zweite waere die Loesung, das Erste die Abkuerzung.

## Auftrag

**Mitbeauftragt mit G-11 am 2026-08-28.** Der Auftragstext
und der Bericht stehen dort.
