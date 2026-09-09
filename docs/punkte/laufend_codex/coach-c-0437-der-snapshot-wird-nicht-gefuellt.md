---
nr: C-437
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-387
entscheidung: E-74
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
  zeilen: 6
  mit_snapshot: 0
---

# C-437 — der Snapshot wird nicht gefuellt

## Befund

Aus G-387, Claude Code, 2026-09-08.

`[cmd]` **Auf `dev` nachgemessen:**

    coach.relationships          6 Zeilen
    davon coach_display_name     0 gefuellt
    coach.coach_profiles         0 Zeilen

`[read]` **Der Snapshot aus C-268 ist auf `dev` nirgends
gefuellt** ? **die Anzeige ist ganz auf den Rueckfall
angewiesen.**

`[cmd]` **Und Claude Codes Fund aus der Wegwerf-Kette:** **dort
tragen drei von sechs einen Namen, und alle drei sind AELTER als
die Spalte.**

> *,,Ein Snapshot, der nachtraeglich gefuellt wurde, ist keiner ?
> er traegt den heutigen Namen mit dem Datum von damals."*

`[read]` **Das ist schaerfer als es klingt:** **eine Einladung vom
20.08. behauptet, ein Coach habe damals so geheissen** ? **obwohl
der Name aus dem Seed von heute stammt.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Miss, woher die drei Namen kamen

`[cmd]` **In der Wegwerf-Kette: drei von sechs gefuellt.**
`[cmd]` **Auf `dev`: null.**

`[read]` **Der Unterschied ist der Seed** ? **miss, ob er den
Snapshot setzt und mit welchem Wert.**

`[read]` **Wenn ja: soll er das?** **Ein Seed darf Daten
erzeugen** ? **aber ein Snapshot mit falschem Datum ist eine
Behauptung ueber die Vergangenheit.**

### 2 · Die drei Altbeziehungen

`[cmd]` **Drei Zeilen vom 20.08., drei vom 06.09.** ? **alle vor
C-268.**

`[read]` **Sie haben keinen Snapshot und koennen keinen bekommen**
? **niemand weiss, wie der Coach damals hiess.**

`[read]` **Das ist derselbe Fall wie die sieben Zeilen ohne
Herkunft in C-435:** **leer ist ehrlich.**

`[cmd]` **Miss, ob der Leseweg damit umgehen kann** ? **oder ob er
eine Null zeigt** (E-72).

### 3 · `coach_profiles` ist leer

`[cmd]` **Null Zeilen auf `dev`.**

`[read]` **Ein Coach ohne Profil hat keinen Namen** ? **weder
aktuell noch als Snapshot.**

`[read]` **Miss, wann ein Profil entsteht:** **beim Anlegen des
Kontos, bei der ersten Einladung, oder gar nicht?**

`[cmd]` **`SPEC_02:39` und `SPEC_06:37` nennen `display_name`** ?
**aber nicht, wer die Zeile anlegt.**

### Abnahmebedingungen

    A1  woher die drei Namen in der Kette kamen. Fundstelle.
    A2  setzt der Seed den Snapshot? Ja mit Wert, nein.
    A3  die sechs dev-Zeilen: koennen sie einen bekommen?
        Ja mit Weg, nein mit Grund.
    A4  wann entsteht ein coach_profiles-Eintrag? Gemessen
        oder als Vorschlag.
    A5  Vollkette laeuft durch. Schritte und Sekunden.

### Was nicht zu tun ist

**Keinen Snapshot nachtraeglich fuellen** ? **er waere eine
Behauptung ueber die Vergangenheit.**
`apps/` nicht anfassen ? **Claude Code arbeitet dort.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
