---
nr: C-349
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: G-273
entscheidung: null
beruehrt:
  dateien:
    - supabase/_pipeline/05_user_tabellen/059d_reference_assessment_window_flags.sql
zahlen:
  gemessen: 2026-08-30
  zeilen: 78
  reiter_ms: 6898
---

# C-349 — die Flag-Funktion einspielen

## Befund

Aus G-273, Claude Code, 2026-08-30.

`[cmd]` **`nutrition.reference_assessment_window_flags` existiert
nicht in der laufenden Datenbank.** Sie liegt in
`supabase/_pipeline/05_user_tabellen/059d_…sql`, **78 Zeilen, nie
eingespielt.**

`[read]` **Das ist der C-195-Fall aus `CLAUDE.md`: die Kette ist
gruen, die Aenderung steht nicht dort, wo man sie sieht.**

## Was daran haengt

`[cmd]` **G-273 ist blockiert** — ein Aufruf auf eine nicht
existierende Funktion bricht die Seite.

`[cmd]` **Der Reiter steht bei 6.898 ms**, davon rund 895 ms
Uebertragung. `[cmd]` **Die Funktion liefert dieselben zehn Flags mit
1.814 statt 8.298.086 Byte.**

## Vor dem Einspielen

`[read]` **Die Regeln der Funktion stimmen mit `flagVon` ueberein** —
80 Prozent, mindestens vier Tage, 0,5 Anteil. `[read]` **Das ist
gemessen, nicht angenommen** — **aber es gehoert nach dem Einspielen
belegt: dieselben Flags, dieselben Tageszaehlungen.**

`[cmd]` **Vollsicherung vor dem Live-Eingriff.**
