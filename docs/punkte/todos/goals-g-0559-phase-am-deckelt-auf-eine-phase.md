---
nr: G-559
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30

braucht: [G-538, G-544]
kind_von: G-544

quellen:
  - docs/punkte/erledigt/goals-g-0544-der-phase-reiter-zeigt-keine-zeitachse.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_phases
  funktionen:
    - goals.phase_am
  dateien:
    - apps/web/src/app/v2/goals/ansicht.tsx
    - apps/web/src/lib/goals/lesen.ts

zahlen:
  gemessen: 2026-09-30
  position_limit_1: 933
---

# `phase_am` deckelt auf eine Phase, und der Phasenkopf haengt daran

## Der Befund

`[cmd]` **`goals.phase_am()` endet auf `LIMIT 1`** — vom Orchestrator
selbst nachgelesen, Position 933 in `pg_get_functiondef`. Solange eine
Anzeige an dieser Funktion haengt, **kann** sie nur eine Phase zeigen,
egal was in der Tabelle steht.

`[cmd]` **Claude Code hat es beim Bau von G-544 gefunden und gemeldet,
statt es mitzunehmen:** die Zeitachse liest jetzt ueber
`ladeOffenePhasen` die Tabelle. **`PhaseEcht` oben im Reiter liest
weiter `phase_am`.** Die Kopfmarke hat er berichtigt, weil sie direkt
neben der neuen Achse eine andere Zahl behauptete — bei zwei offenen
Phasen stand dort *„Phase lean bulk"*.

`[read]` **Damit stehen zwei Wahrheiten im selben Reiter:** die Achse
zeigt zwei Phasen, der Phasenkopf eine. **Das ist der Zustand, den
G-544 zur Haelfte behoben hat.**

## Warum das mehr ist als eine Anzeige

`[read]` Seit G-538 laeuft der Eindeutigkeitsindex auf `goal_id`, nicht
auf `user_id` — **mehrere offene Phasen sind der Normalfall, nicht die
Ausnahme.** Eine Funktion, die davon eine zurueckgibt, gibt eine
beliebige zurueck. `[annahme]` **Welche, entscheidet die Sortierung im
Rumpf** — und wer sie nicht kennt, liest das Ergebnis als *die* Phase.

`[read]` **Zu klaeren ist deshalb nicht nur die Anzeige, sondern die
Funktion:** wer ruft `phase_am` sonst noch, und was erwartet der
Aufrufer? Eine Funktion mit `LIMIT 1` kann richtig sein, wenn sie
*,,die Phase an einem Stichtag fuer EIN Ziel"* heisst. Sie ist falsch,
wenn sie *,,die Phase des Nutzers"* heisst.
