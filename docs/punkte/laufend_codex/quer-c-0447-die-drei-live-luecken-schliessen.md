---
nr: C-447
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-446
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [medical.injection_sites]
zahlen:
  gemessen: 2026-09-08
  live_ohne_kette: 3
  altbestand: 8
---

# C-447 — die drei Live-Luecken schliessen

## Befund

Aus C-446, Codex, 2026-09-08. **Selbst nachgemessen: 28 Dateien,
Gegenprobe rot, zurueckgebaut gruen, Waechter im Gate.**

`[cmd]` **Der Bestand:**

    in Kette, live registriert           6
    in Kette, nicht live registriert    11
    NICHT in Kette, live registriert     3   <- das Problem
    nicht in Kette, nicht registriert    8   Altbestand

## Die drei sind das eigentliche Risiko

    20260829003109_c327_substance_group_membership.sql
    20260902070117_c327a_chelation_mineral_membership.sql
    20260902073914_c366_effective_tag_readers.sql

`[read]` **Sie sind auf `dev` angewandt und stehen in keiner
Kette** ? **ein frischer Aufbau erzeugt einen anderen Zustand als
`dev`.**

`[read]` **Genau der Fall, den C-446 fuer `measurement_context`
behoben hat** ? **dreimal offen.**

`[cmd]` **C-327 und C-327a betreffen Substanzgruppen und
Chelat-Mineralien, C-366 die Leser wirksamer Marken** ? **alle drei
im Supplements-Kern.**

## Und die acht ohne Registrierung

    search_events   C-283   C-286   C-293
    G-107           C-371   C-362   C-381

`[read]` **Nicht angewandt, nicht verkettet** ? **entweder tot oder
vergessen.**

`[cmd]` **`C-381` heisst
`secure_pending_action_execution`** ? **das klingt nicht nach
Altlast.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die drei live-Luecken

`[read]` **Wie bei `measurement_context`: an die richtige Stelle in
die Kette, dann frisch aufbauen und pruefen.**

`[cmd]` **Und: laufen sie zweimal?** ? **auf `dev` sind sie
angewandt.**

`[read]` **Miss je Datei, ob sie idempotent ist** ? **eine
Migration, die zweimal laeuft und dabei Daten verdoppelt, ist
schlimmer als eine, die fehlt.**

### 2 · Die acht ohne Registrierung, je einzeln

`[read]` **Nicht als Block behandeln.**

`[read]` **Je Datei: was tut sie, und gibt es das im Schema
bereits?**

    tot        das Ziel existiert unter anderem Weg
               -> melden, nicht loeschen
    vergessen  das Ziel fehlt
               -> in die Kette

`[cmd]` **`C-381 secure_pending_action_execution`
zuerst** ? `coach.pending_actions` **ist leer, und der Name klingt
nach einer Sicherung.**

`[cmd]` **`docs/ssot/00-SPEC-ABGLEICH.md` und
`00-SCHEMA.md`** ? **dort steht, was existiert.**

### 3 · Die Ausnahmeliste danach

`[read]` **Sie hat elf Namen.** `[read]` **Was du schliesst, faellt
heraus.**

`[cmd]` **Und der Waechter faellt weiterhin bei einer neuen
Luecke** ? **Gegenprobe hat es belegt.**

### Abnahmebedingungen

    A1  die drei in der Kette. Frischer Aufbau gruen.
    A2  je Datei: idempotent? Gemessen.
    A3  die acht: je ein Satz, tot oder vergessen.
    A4  die Ausnahmeliste: von 11 auf wie viele?
    A5  Gegenprobe des Waechters weiterhin rot.
    A6  Vollkette und Punktelauf gruen.

### Was nicht zu tun ist

**Keine Migration loeschen** ? **melden.**
**Keine live-Migration erneut ausfuehren** ? **du hast das in
C-446 richtig gemacht.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-392.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
