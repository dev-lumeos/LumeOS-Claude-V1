---
nr: C-435
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-434
entscheidung: E-74
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.client_permissions]
zahlen:
  gemessen: 2026-09-08
---

# C-435 — C-434 einspielen

## Befund

`[cmd]` **C-434 ist gebaut und gruen** ? **168 Schritte, 650,4 s.**

`[cmd]` **Nicht live.**

## Auftrag

**Mitbeauftragt: C-71.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### 1 · Einspielen

`[read]` **Vorher Sicherung nach `backup/`, wie bei C-421 bis
C-433.**

`[cmd]` **Danach messen:** **die zwei Policies, die vier
Herkunftsfelder je Tabelle, und dass ein Coach mit `full` die
Originale nicht sieht.**

`[cmd]` **Und: auf `dev` gibt es Altbestand** ? **in der
Wegwerf-Datenbank waren die Tabellen leer.**

`[read]` **Miss, ob die vier neuen Felder dort leer bleiben** ?
**und ob das richtig ist.**

`[read]` **E-74: die Herkunft ist Pflicht bei neuen Zeilen** ?
**alte Zeilen ohne Herkunft sind ehrlich leer, nicht
nachzuerfinden.**

### 2 · C-71 — Permissions und Autonomy sind zwei verschiedene
Sachen

`[cmd]` **`coach.client_permissions` traegt 22 Spalten,
`client_autonomy` acht Achsen.**

`[cmd]` **C-426 hat gemessen: sieben von acht Achsen haben keine
Erlaubnisliste, genau ein Leser
(`coach.darf_nutrition_plan_aendern`).**

`[read]` **Miss den Unterschied:** **was regelt `permissions`, was
regelt `autonomy`?**

`[read]` **Und wo ueberschneiden sie sich** ? **`medical_visibility`
in `permissions`, `medical_level` in `autonomy`.**

`[read]` **Messen und melden, nicht bauen** ? **die acht Matrizen
sind ein eigener Tag.**

### Abnahmebedingungen

    A1  live: die zwei Policies, gemessen mit full und summary.
    A2  die vier Herkunftsfelder je Tabelle. Zahl vorher/nachher.
    A3  Altbestand auf dev: wie viele Zeilen ohne Herkunft,
        je Tabelle.
    A4  Sicherung: Pfad, Groesse, Pruefsumme.
    A5  ein Coach mit full sieht 0 Objekte. Belegt.
    A6  C-71: was regelt permissions, was autonomy, wo
        ueberschneiden sie sich. Je mit Fundstelle.
    A7  Punktelauf gruen nach dem Einspielen.

### Was nicht zu tun ist

`apps/` nicht anfassen ? **Claude Code arbeitet an G-382.**
**Den Dev-Server nicht anfassen** ? **Tom haelt ihn selbst.**
**Keine Herkunft nacherfinden** ? **leer ist ehrlich.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
