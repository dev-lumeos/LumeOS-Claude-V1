---
nr: C-339
typ: feature
modul: recovery
schwere: niedrig
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: E-25
beruehrt:
  tabellen: [recovery.scores]
zahlen: null
---

# C-339 — ein Recovery-Gesamtscore, vorgesehen

## Befund

`[read]` **Tom, 2026-08-29:** *,,fuer recovery und training vorsehen
in den todos"* — zu **E-25**, wo Nutrition den NRF9.3-Score bekommt.

`[read]` **Vorgesehen heisst hier ausdruecklich: noch nicht bauen.**

`[cmd]` **`recovery.scores` existiert und wird gerechnet** —
`recalculate_score`, `refresh_scores_for_user`.

`[cmd]` **Aber zwei Wege liefern verschiedene Werte:** Browser-Vorschau
36 gegen Datenbank 35,3 (C-143, gemessen 2026-08-29). `[cmd]`
**C-218 beschreibt dasselbe von der anderen Seite:** Frontend und
Datenbank normieren verschieden.

`[read]` **Und G-106 warnt vor einem zweiten Gesamtwert daneben** —
der Readiness-Komposit.

**Also: erst C-143/C-218 aufloesen, dann diese Frage.**

`[read]` **Und die Vorfrage bleibt dieselbe wie bei Nutrition:** gibt
es eine belegte Formel? `[cmd]` **Fuer Nutrition gab es NRF9.3, in
vier Laendern validiert.** **Fuer Erholung waeren HRV-basierte
Bereitschaftsmasse, TSB oder ACWR die Kandidaten** — **aber das ist
eine Recherche, keine Annahme.**

## Recherche, 2026-08-29

**`docs/spezifikation/00-SCORES.md`** — wie Whoop, Oura, Garmin und
Coros rechnen.

`[read]` **Der Kernbefund kehrt die Frage um:** von 14
zusammengesetzten Scores bei 10 Herstellern **hat keiner eine
rigorose unabhaengige Validierung.** **Scores sind in dieser Branche
Produktentscheidungen, keine wissenschaftlichen.**

`[read]` **Damit ist die Vorfrage in diesem Punkt beantwortet:** eine
belegte Formel wie NRF9.3 gibt es fuer Erholung nicht. **Was es gibt,
sind belegte Eingaenge** — HRV bei 86 Prozent der Geraete als
Primaersignal, dazu Ruhepuls und Schlaf.

`[read]` **Und zwei Dinge, die uebernommen gehoeren:** die
Normierung gegen die eigene Basislinie (Whoop 60 Tage, Oura drei
Monate), **und die Offenlegung der Gewichtung — die niemand sonst
tut.**
