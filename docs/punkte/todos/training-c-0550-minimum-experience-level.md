---
nr: C-550
typ: feature
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-545
entscheidung: C-545
beruehrt:
  tabellen: [training.exercises]
zahlen:
  gemessen: 2026-09-08
---

# C-550 - minimum_experience_level statt difficulty

## Die Entscheidung (C-545)

`[read]` **Eine SCHWELLE sagt *,,ab hier"*, eine Note sagt
*,,so schwer ist es"*** ? **die Schwelle ist ehrlicher, weil
sie nur eine Grenze behauptet.**

`[cmd]` **Vier Stufen wie bei `profiles.experience_level`
(C-541): `beginner`, `advanced`, `pro`, `elite`.**

## Und was die Schwelle NICHT meint

> Codex in C-545: *,,Die Forschung trennt TECHNISCHE
Schwierigkeit ausdruecklich von LAST und PERSOENLICHER
Situation."*

`[read]` **Eine Kniebeuge mit 40 kg und eine mit 200 kg sind
dieselbe Uebung** ? **die Schwelle meint die TECHNIK.**

## Was offen ist

`[cmd]` **C-545 hat gemessen: die vorhandenen Daten erlauben
keine sichere Einstufung der 1.416.**

`[read]` **Die Spalte kann also entstehen, LEER** ? **und wird
gefuellt, wo eine Quelle es hergibt.**

`[read]` **Eine leere Spalte, die ehrlich leer ist, ist besser
als `intermediate` fuer alles.**

## Abnahmebedingungen

    A1  minimum_experience_level, vier Stufen,
        NULL erlaubt.
    A2  difficulty: umbenannt, ersetzt oder danebengelegt?
        Begruendet.
    A3  wer liest difficulty heute? Gemessen, GEMELDET.
    A4  eine Uebung ohne Schwelle erscheint fuer JEDEN.
        Belegt.
    A5  Gegenprobe: eine Schwelle "pro" blendet sie fuer
        beginner aus.
    A6  Sicherung, Vollkette, ALLE Waechter.
