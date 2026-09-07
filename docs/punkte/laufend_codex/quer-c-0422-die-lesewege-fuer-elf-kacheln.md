---
nr: C-422
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-421
entscheidung: E-72
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [recovery.checkins]
zahlen:
  gemessen: 2026-09-07
  anbindbar: 11
  blockiert: 6
---

# C-422 — die Lesewege fuer elf Kacheln

## Befund

Aus C-421, Codex, 2026-09-07.

`[cmd]` **Vier Tabellen gebaut, 1 / 2 / 7 / 21 Seedzeilen.**
`[cmd]` **`public.muscle_training_loads` liefert echte Saetze und
Stunden je Muskelgruppe.**

`[cmd]` **11 von 17 Kacheln sind jetzt anbindbar, 6 bleiben
blockiert.**

## Auftrag — die Lesewege

**Mitbeauftragt: G-363.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-422 — elf Lesewege

`[read]` **Die Tabellen stehen, die Kacheln koennen lesen** — **aber
es gibt noch keine Funktion, die es tut.**

`[cmd]` **A-71: viermal am 07.09. lag ein Leseweg ungenutzt
daneben** — **hier fehlt er ganz.**

`[read]` **Bau je Kachel den Leseweg.** `[read]` **Und sag, welche
sechs blockiert bleiben und woran.**

`[cmd]` **E-72: eine Kachel ohne Daten zeigt einen benannten
Leerhinweis, keine Null.**

### 2 · G-363 — wer schlaegt die naechste Phase vor

`[cmd]` **`recommended_next` in `goal_phases` bleibt leer.**

`[cmd]` **`00_MASTER_VISION.md`, Kernprinzip 3:** *,,Rule-first, AI
second."*

`[read]` **Also: die Regel schlaegt vor, das Modell formuliert.**

`[read]` **Bau die Regel** — **Eingaben sind `projected_end_date`
gegen `actual_end_date` und die 362 Koerpermessungen.**

`[cmd]` **`transition_reason` ist seit G-357 Pflicht** — **ein
Vorschlag liefert einen mit.**

`[read]` **Und der Nutzer kann widersprechen** (E-69).

### Abnahmebedingungen

    A1  je Kachel: liest sie echte Daten? Zahl 11 / angebunden.
    A2  je angebundener Kachel: Zeilen auf test-user > 0.
    A3  die sechs blockierten: woran genau, je Kachel.
    A4  Vollkette laeuft durch. Schritte und Sekunden.
    A5  G-363: ein Vorschlag entsteht, mit Begruendung, belegt.

### Was nicht zu tun ist

**Keine Oberflaeche.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet dort.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
