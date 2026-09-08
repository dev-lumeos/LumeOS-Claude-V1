---
nr: C-430
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-152
entscheidung: null
beruehrt:
  tabellen: [public.activity_stream]
zahlen:
  gemessen: 2026-09-08
  sprachen: 1
---

# C-430 — die Sicht traegt nur Deutsch

## Befund

Aus G-152, Claude Code, 2026-09-08. **Nachgemessen.**

`[cmd]` **`public.activity_stream` traegt `summary_de`, sonst
keine Sprachspalte.**

`[cmd]` **Und der deutsche Text steht als Zeichenkette IN der
Sichtdefinition:** `'Mahlzeit erfasst: '`, `'Abendessen'`.

`[cmd]` **`supplement_evidence` traegt `_de`, `_en`, `_th`** —
**die Sicht ist der Ausreisser.**

`[read]` **Die App ist dreisprachig** (DE/EN/TH) — **der
Aktivitaetsstrom ist es nicht.**

## Warum es zaehlt

`[cmd]` **C-420 hat gezeigt, was Einsprachigkeit anrichtet:** **der
Mockup-Waechter meldete 170 fehlende Elemente, 11 fehlten
wirklich** — **weil er `Muscle readiness` gegen
`Muskelbereitschaft` verglich.**

`[read]` **Hier ist es umgekehrt: die Daten sind deutsch, die
Oberflaeche kann drei Sprachen.**

## Zwei Wege

**1 · Drei Spalten** — `summary_de`, `summary_en`, `summary_th`.
`[read]` **Wie `supplement_evidence`.** `[read]` **Aber die Sicht
wuerde jeden Text dreimal zusammensetzen.**

**2 · Bausteine statt Saetze** — **die Sicht liefert
`event_type` und die Werte, die Oberflaeche setzt den Satz.**

`[read]` **Das ist der uebliche Weg** — **`apps/web/messages`
traegt die Vorlagen schon.**

`[cmd]` **Und `event_type` steht bereits in der Sicht.**

`[read]` **Der zweite Weg braucht keine Sprachspalte** — **aber er
verschiebt Arbeit von der Datenbank in die Oberflaeche.**
