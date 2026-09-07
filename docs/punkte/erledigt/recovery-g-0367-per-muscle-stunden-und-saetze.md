---
nr: G-367
typ: feature
modul: recovery
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-364
entscheidung: null
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: c3067369
beruehrt:
  tabellen: [training.workout_sessions]
zahlen:
  gemessen: 2026-09-07
---

# G-367 — Stunden und Saetze je Muskel

## Befund

Aus G-364, Claude Code, 2026-09-07.

`[cmd]` **Die Muskelkacheln lesen jetzt echt** — Muskelkater aus dem
Check-in.

`[cmd]` **Aber `HOURS` und `SETS` je Muskel kommen weiter aus dem
Entwurf** — **es fehlt ein Leseweg ins Training.**

`[cmd]` **`training.workout_sessions` und `training.exercise_muscles`
(6.588 Zeilen) tragen die Daten.**

## Zu klaeren

`[read]` **Eine Sicht ueber die Modulgrenze** — **oder eine
Funktion, die `recovery` aufruft?**

`[cmd]` **E-65: jedes Modul ist in sich geschlossen** — **aber E-52
erlaubt gemeinsame Sichten.**

`[cmd]` **`public.activity_stream` ist der Praezedenzfall** (C-414):
**sechs Module in `public`, nicht im Fachschema.**

## Auftrag

**Mitbeauftragt mit C-421 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-07, mit C-421 abgenommen.**

`[cmd]` **`public.muscle_training_loads` liefert echte Working-Sets
und Stunden je Muskelgruppe.**

`[read]` **Der Ort ist richtig:** `public`, **nicht `recovery` oder
`training`** — **wie `activity_stream`** (C-414, E-65).

`[cmd]` **Der vollstaendige Muskelvergleich steht im
C-421-Bericht.**
