---
nr: E-52
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-152, G-100, C-353]
modul: quer
---

# E-52 — gemeinsame Sichten statt sechs Abfragen

## Entscheidung

Tom, 2026-09-02, zu G-152:

> ich denke das erklaert unsere daten philosophy selber. wieso soll
> ich 6 straenge abfragen wenn wir die sowieso als daten immer
> brauchen? also zusammenfassen als eine sicht in der db und wenn was
> dazu kommt erweitern.

## Der Anlass

`[cmd]` **Das Dashboard braucht einen Ereignisstrom** — Zeitpunkt,
Modul, ein Satz.

`[cmd]` **Die Zeitpunkte liegen vollstaendig vor:**
`meals.meal_time` 725/725, `intake_logs.intake_time` 360/360,
`workout_sessions.started_time` 30/30.

`[read]` **Es fehlte keine Spalte, sondern eine Entscheidung:** sechs
Abfragen je Seitenaufruf und im Speicher mischen, **oder eine Sicht,
die es einmal tut.**

## Die Regel

**Wenn dieselben Daten immer zusammen gebraucht werden, entsteht
eine Sicht in der Datenbank** — **nicht eine Schleife im Browser.**

`[read]` **Und sie waechst mit:** kommt ein Modul dazu, wird die
Sicht erweitert, **nicht jeder Aufrufer.**

## Warum das mehr ist als Bequemlichkeit

`[cmd]` **C-353 hat gemessen, was der andere Weg kostet:** TTFB von
410 auf 4.183 ms — **die Zeit lag nicht in der Uebertragung, sondern
im Warten auf mehrere Abfragen.**

`[cmd]` **Und G-252 nennt dieselbe Klasse:** eine Abfrage je Zeile
statt einer ueber alle Zeilen.

`[read]` **Sechs Abfragen sind sechs Rundreisen** — **eine Sicht ist
eine.**

`[read]` **Der zweite Grund ist Wahrheit, nicht Tempo:** **wer im
Browser mischt, hat die Sortierregel in der Anzeige.** `[cmd]` **Kein
Waechter erreicht sie** — dasselbe Problem wie bei den vier
Filtergruppen (E-49).

## Was daraus folgt

`[cmd]` **Fuer den Ereignisstrom: eine Sicht ueber die
Modultabellen**, mit Zeitpunkt, Modul, Kennung und Text.

`[read]` **Und die Regel gilt weiter:** **wo heute mehrere Abfragen
dieselbe Frage beantworten, gehoert eine Sicht hin.**

`[cmd]` **Bereits so gebaut:** `nutrition.daily_summary`,
`daily_nutrient_summary_long`, `supplements.daily_intake_summary`.

`[read]` **Der Ereignisstrom ist die erste modulschneidende Sicht** —
**wie *Wasser* bei den Naehrwerten** (E-48).
