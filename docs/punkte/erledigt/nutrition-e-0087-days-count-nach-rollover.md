---
nr: E-87
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-488
entscheidung: null
erledigt: 2026-09-08
commit: entschieden
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-08
---

# E-87 - was bedeutet days_count nach einem Rollover?

## Der Befund

Aus G-488, Claude Code, 2026-09-08:

> *,,`ablaufKlaeren` verschiebt bei einem Rollover die Wochen
und erhoeht `rollover_count`, fuehrt aber `days_count` NIE
nach."*

`[cmd]` **Selbst gemessen:**

    Aufbau-Wochenplan  days_count 28  rollover 1  35 Tage
    Nachweiswoche      days_count  7  rollover 0   7 Tage
    Aufbau-Wochenplan  days_count 21  rollover 0  21 Tage

`[read]` **28 + 7 = 35** ? **die Abweichung ist genau ein
Rollover.**

## Zwei Wege

**a** ? **`ablaufKlaeren` zieht `days_count` mit.**

`[read]` **Dann heisst die Spalte *,,wie lang der Plan
JETZT ist"*.**

**b** ? **`days_count` bleibt, was es war.**

`[read]` **Dann heisst es *,,Laenge beim Anlegen"* und muss
ueberall so benannt werden.**

## Was dafuer spricht

`[cmd]` **Heute rechnet der Schirm die Tage und zeigt die
Abweichung** ? **er kommt ohne die Spalte aus.**

`[read]` **Aber jeder andere Leser (ein Bericht, der Coach,
ein Export) traut der Spalte.**

`[read]` **Eine Zahl, die falsch aussieht und stimmt, ist
dasselbe Problem wie eine, die stimmt und falsch aussieht.**

## Entschieden, 2026-09-08, Orchestrator

Tom: *,,loes es einfach logisch und funktionierend, wenn ich
mich um solche lappalien kuemmern muss, brauche ich dich als
orchestrator nicht"*

### Weg a: `days_count` zieht mit

`[read]` **Der Plan IST nach dem Rollover 35 Tage lang.**

`[read]` **Zwei Zahlen fuer dieselbe Sache sind der Fehler,
nicht die falsche davon.**

`[cmd]` **`ablaufKlaeren` verschiebt die Wochen ohnehin** ?
**dort steht die Zahl schon, sie muss nur geschrieben
werden.**

### Warum nicht b

`[read]` **`Laenge beim Anlegen` muesste ueberall so heissen** ?
**im Schirm, im Bericht, im Export, beim Coach.**

`[read]` **Eine Spalte, deren Name eine Fussnote braucht, wird
falsch gelesen** ? **so wie `client-grenze.test.ts` (G-470)
und `status_compatibility` (C-526).**

### Und ein Waechter

`[cmd]` **`days_count` muss gleich der Zahl der
materialisierten Tage sein** ? **das ist pruefbar und faengt
den naechsten Rollover, der es vergisst.**

`[cmd]` **Umsetzung als C-537.**

