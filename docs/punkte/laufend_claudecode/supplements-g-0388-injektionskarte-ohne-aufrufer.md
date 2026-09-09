---
nr: G-388
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-53
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-spec.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-388 — `InjektionsKarte` und die Reste

## Befund

`[cmd]` **G-53: `InjektionsKarte` liegt in `packages/ui` und hat
keinen Aufrufer.**

`[cmd]` **Und C-429 hat `injection_sites` und `injection_logs`
gebaut** ? **zwei der wenigen Tabellen mit echter Beschreibung
(G-384, A1).**

`[read]` **Dreizehnter A-71-Fall, vermutlich** ? **aber gemessen,
nicht angenommen.**

## Auftrag

**Mitbeauftragt: G-126 (drei Reste aus G-122).** Bericht in diese
Datei.

**Beauftragt am 2026-09-08.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt
supplements.**

`[cmd]` **Und `docs/ssot/00-MODULTABELLEN.md`** ? **dort stehen
`injection_sites` und `injection_logs` mit Spalten und Zeilen.**

`[read]` **Nachsehen, nicht messen** ? **das ist der Zweck der
Datei.**

### 1 · G-53 — die Karte

`[read]` **Miss zuerst, ob sie zu den Tabellen passt** ? **eine
Karte aus `packages/ui` kennt das Schema von C-429 nicht.**

`[cmd]` **Und `packages/ui` gehoert Admin und Coach mit** ? **deine
eigene Lehre aus G-17.**

`[read]` **Wenn sie passt: anbinden.** `[read]` **Wenn nicht:
melden, was fehlt.**

### 2 · G-126 — die drei Reste

`[read]` **Lies den Punkt und miss, was heute davon steht.**

### Abnahmebedingungen

    A1  passt die Karte zum Schema? Zahl: Felder / davon
        gedeckt.
    A2  wenn angebunden: Zeilen am Schirm, gemessen.
    A3  G-126: je Rest, steht er noch? Mit Messung.
    A4  E-72: keine nackte Null. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.
    A5  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.

### Was nicht zu tun ist

**Nichts in `packages/ui` aendern** ? **melden, wenn dort etwas
fehlt.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-439.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
