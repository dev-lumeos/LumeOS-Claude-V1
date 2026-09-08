---
nr: G-152
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-100
kinder: []
entscheidung: E-52
agent: claudecode
beauftragt: 2026-09-08
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

`[cmd]` **Nachgemessen 2026-08-29, der Bericht steht in G-11.**
Die Zeitpunkte liegen unveraendert vollstaendig vor (725/725,
360/360, 30), und es gibt weiterhin keine gemeinsame
Ereignissicht. `[read]` **Es fehlt eine Entscheidung, keine
Spalte** — unveraendert offen.

## Zwischenstand, 2026-08-29

`[cmd]` **In G-11 geprueft und unveraendert offen.** Die Zeitpunkte
sind vollstaendig (725/725, 360/360, 30), **aber es gibt weiterhin
keine gemeinsame Ereignissicht.**

`[read]` **Das ist Codex' Bereich** — eine Sicht ueber mehrere
Module braucht eine Funktion, keine Oberflaeche.

## Entschieden: E-52, 2026-09-02

Tom: *,,wieso soll ich 6 straenge abfragen wenn wir die sowieso als
daten immer brauchen? also zusammenfassen als eine sicht in der db
und wenn was dazu kommt erweitern."*

**Eine Sicht in der Datenbank, keine Schleife im Browser.**

`[read]` **Und die Entscheidung reicht ueber diesen Punkt hinaus:**
**wo mehrere Abfragen dieselbe Frage beantworten, gehoert eine Sicht
hin.**

`[cmd]` **C-353 hat gemessen, was der andere Weg kostet:** TTFB von
410 auf 4.183 ms — **die Zeit lag im Warten auf mehrere Abfragen,
nicht in der Uebertragung.**

`[read]` **Der zweite Grund ist Wahrheit, nicht Tempo:** **wer im
Browser mischt, hat die Sortierregel in der Anzeige** — **an einer
Stelle, die kein Waechter erreicht.**

`[cmd]` **Der Ereignisstrom ist die erste modulschneidende Sicht** —
wie *Wasser* bei den Naehrwerten (E-48).

## Auftrag

**Mitbeauftragt mit G-348 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: braucht die Sicht

`[cmd]` **Die Entscheidung ist mit E-52 laengst gefallen:**
**gemeinsame Sichten statt sechs Abfragen.**

`[read]` **Der Punkt wartet auf Codex** — **die Sicht ist nicht
gebaut.**

`[cmd]` **Und ein Befund haengt daran: `intake_logs` endet am
19.08.** — **ein 7-Tage-Strom wuerde Supplements faelschlich als
still zeigen** (C-412).

`[read]` **Eine richtige Funktion auf altem Bestand erzeugt eine
falsche Aussage.**

## Auftrag

**Mitbeauftragt mit G-222 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-07: wartet weiter, aber die Sicht kommt.

`[cmd]` **Codex hat sie am 2026-09-07 gebaut** —
`activity_stream`, sechs Module, TTFB 4,60 ms warm (C-412).

`[cmd]` **Und ein Befund haengt daran: sie liegt in `nutrition`
statt querschnittlich** (C-414).

`[read]` **Der Anschluss ist ein UI-Auftrag** — **nach C-414.**

## Gemessen am 2026-09-08, vor der Auftragsvergabe

`[cmd]` **`public.activity_stream` steht seit C-412/C-414.**

    Spalten   user_id, event_date, event_time, occurred_at,
              module, event_type, event_id, summary_de

    nutrition    4170   bis 2026-11-16
    supplements   810   bis 2026-09-06
    recovery      370   bis 2026-11-06
    training       66   bis 2026-11-11
    medical        10   bis 2026-06-06
    ------------------
    gesamt       5426

`[cmd]` **Und null Dateien in `apps/` lesen sie.**

`[read]` **Achter Fall von A-71** — **der Leseweg steht, niemand
ruft ihn.**

`[cmd]` **TTFB warm 4,6 ms** (C-412) — **die Sicht ist schnell
genug.**

## Auftrag — den Aktivitaetsstrom anschliessen

**Mitbeauftragt: G-374.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt
dashboard.** `[cmd]` **Dann die Mockups, die dort genannt sind.**

`[read]` **Und sieh nach, wie das Mockup den Strom zeigt** — **eine
Liste, ein Verlauf, oder je Modul getrennt.**

### 1 · G-152 — der Strom im Dashboard

`[cmd]` **`dashboard-echt.tsx` und `entwurf.tsx` liegen da.**

`[read]` **Miss zuerst, was die Entwurfsfassung zeigt** — **und ob
`summary_de` reicht oder je Ereignisart etwas anderes noetig ist.**

`[cmd]` **`summary_de` heisst: die Sicht traegt deutschen Text.**
`[read]` **Die App ist dreisprachig** (DE/EN/TH) — **das ist zu
messen und zu melden, nicht zu loesen.**

### 2 · G-374 — Zyklen brauchen ein Startdatum

`[cmd]` **`{on_weeks, off_weeks}` ohne Beginn ergibt kein
*Wk 5 of 8*.**

`[cmd]` **`stack_items` traegt 17 Spalten** — **miss, ob eine den
Beginn haelt.**

`[read]` **Wenn nicht: melden, nicht in `supabase/` bauen.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  der Strom am Schirm. Zahl: Zeilen gezeigt / 5426.
        Und: welcher Zeitraum, welche Sortierung.
    A2  je Modul: erscheint es? Zahl: 5 Module / davon sichtbar.
    A3  E-72: keine nackte Null. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.
    A4  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.
    A5  summary_de gegen DE/EN/TH: was fehlt, gemessen.
    A6  G-374: haelt eine Spalte den Zyklusbeginn? Ja mit Namen,
        nein mit Vorschlag.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **Er war eben unten** — **`server.py start`, nicht `.next`
loeschen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
