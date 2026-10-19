---
nr: G-682
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-10-19

braucht: []
kind_von: null

quellen:
  - docs/punkte/00-LIESMICH.md
  - supabase/_pipeline/kette-ausfuehren.ts

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/kette-ausfuehren.ts
    - tools/kettenlauf-taeglich.mjs
---
# Jeder Datenbankauftrag baut seine Wegwerf-Datenbank über die halbe Kette

## Befund

`[cmd]` 19.10.: `kette.json` hat 556 Schritte. Der Grunddaten-Dump (418 MB) deckt 263 davon ab.
Jede Wegwerf-Datenbank stellt deshalb erst den Dump wieder her und fährt dann die übrigen **293 Schritte**, davon **172 tsx-Proben**.

`[cmd]` 08:05 lief Codex' `kette-ausfuehren.ts --database g675_probe_20261019 --keep-database`. Das ist so ein Aufbau.

`[read]` Codex meldet je Auftrag "Kette … grün" und zusätzlich Sabotage-Läufe, bei G-667 waren es sechs. Baut jeder dieser Läufe die Datenbank neu auf, kostet ein Auftrag Stunden.

`[read]` Die Regel vom 01.10. (00-LIESMICH) verlangt "den geänderten Schritt und seine Probe gegen eine Wegwerf-Datenbank". Sie sagt aber nicht, wie diese Datenbank billig entsteht. Die Lücke liegt in den Aufträgen des Orchestrators.

`[read]` Tom am 19.10.: Er verliert dadurch immens produktive Zeit. Die ganze Kette läuft nur einmal, nachts.

## Was zu tun ist (Codex)

1. Der Nachtlauf hinterlässt bei Grün eine Basis-Datenbank `lumeos_basis` mit dem Stand der Kette. Die vom Vortag wird ersetzt.
2. Eine Wegwerf-Datenbank entsteht per `CREATE DATABASE … TEMPLATE lumeos_basis` und nicht über die Kette.
3. `kette-ausfuehren.ts` bekommt einen Modus, der auf dieser Kopie nur die geänderten oder neuen Schritte und ihre Proben fährt.
4. Für Sabotageproben wird nur die betroffene Probe wiederholt, auf derselben Datenbank. Danach wird die Datenbank verworfen.
5. Gemessen wird die Dauer: Kopie, Schritte, Proben, gegen den heutigen Aufbau.
6. Danach zieht der Orchestrator 00-LIESMICH und die Auftragsvorlage nach.

## Ergaenzung - 2026-10-19 08:12 (Orchestrator)

7. Erzwingen statt beschreiben: `kette-ausfuehren.ts` bricht ausserhalb des Nachtlaufs ab, wenn es ueber die Kette aufbauen soll, und verweist auf die Kopie aus `lumeos_basis`. Ausnahme ist ein ausdruecklicher Schalter mit Begruendung im Bericht. Die Gegenprobe ist ein Aufbau tagsueber ohne Schalter: Er muss abbrechen.
