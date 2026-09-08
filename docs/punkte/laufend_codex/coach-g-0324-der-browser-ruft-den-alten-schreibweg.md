---
nr: G-324
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-381
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.pending_actions]
zahlen:
  gemessen: 2026-09-02
---

# G-324 — der Browser ruft den alten Schreibweg

## Befund

Aus C-381, Codex, 2026-09-02.

`[cmd]` **`coach.bestaetige_aktion` ist live, und die UPDATE-Regel
an `pending_actions` ist entfernt** — nur noch `SELECT`, `INSERT`,
`DELETE`.

`[cmd]` **`entscheideAktion` im Browser schreibt weiterhin direkt.**

`[read]` **Damit ruft die Oberflaeche einen Weg, den es nicht mehr
gibt.**

## Was zu tun ist

**Den Aufruf auf die RPC umstellen.**

`[cmd]` **Die Funktion nimmt den Akteur aus `auth.uid()`** — **der
Aufruf braucht `confirmed_by` nicht mehr mitzugeben.**

`[read]` **Und die Fehlerfaelle sind jetzt echt:** fremd, abgelaufen,
unbekannter Aktionstyp. `[read]` **Die Oberflaeche muss sie
unterscheiden koennen** — **eine Meldung *,,fehlgeschlagen"* ohne
Grund war der Befund aus G-298.**

## Wie es zu belegen ist

`[cmd]` **Zwei Aktionen stehen auf `pending` und abgelaufen**,
20.08. und 01.09.

`[read]` **Sie sind der Testfall:** **der Browser muss sie anzeigen
und beim Bestaetigen die Ablaufmeldung bekommen.**

## Auftrag — coach vorbereiten

**Mitbeauftragt: C-268, C-269.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Warum jetzt

`[cmd]` **Fuenf HOCH-Punkte liegen offen, drei davon in `coach`.**

`[cmd]` **Das Schema steht:** **13 Tabellen, 161 Spalten, 56
Zeilen** — **darunter vier Protokolltabellen fuer Rechte, Autonomie
und Beziehung.**

`[cmd]` **Und die Spec ist vollstaendig:**
`docs/specs/HumanCoach/`, **12 Dateien, 3.291 Zeilen.**

`[read]` **Bevor Claude Code die Oberflaeche baut, muss der
Schreibweg stimmen** — **sonst wiederholt sich A-71 in `coach`.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt Coach.**
`[cmd]` **Dann `docs/specs/HumanCoach/SPEC_06_DATABASE_SCHEMA.md`
und `SPEC_07_API.md`.**

`[cmd]` **Und `ADR_COACH_PERMISSIONS_V1.md`.**

### 1 · G-324 — der Browser ruft den alten Schreibweg

`[read]` **Miss, welcher Weg gemeint ist und ob es den neuen
gibt.**

`[read]` **Wenn ja: umstellen.** `[read]` **Wenn nein: melden, was
fehlt.**

### 2 · C-268 — beim Einladen fehlt die Namensaufloesung

`[cmd]` **`coach.relationships` traegt 16 Spalten, sechs Zeilen.**

`[read]` **Miss, was beim Einladen geschieht** — **und was der
Coach sieht, wenn er einen Namen eingibt.**

### 3 · C-269 — eine Einladung laesst sich nicht zuruecknehmen

`[read]` **Dieselbe Klasse wie `withdraw_stack_template`, das du
gerade gebaut hast** (C-423).

`[cmd]` **Und `relationship_change_log` traegt sieben Zeilen** —
**die Spur ist vorgesehen.**

`[read]` **Zuruecknehmen heisst nicht loeschen** — **wie bei den
Einkaufslisten** (E-64).

### Abnahmebedingungen

    A1  G-324: welcher Weg, alt und neu benannt. Umgestellt
        oder gemeldet, mit Grund.
    A2  C-268: eine Einladung mit Namen, belegt.
        Zahl: Treffer bei der Aufloesung.
    A3  C-269: eine Einladung zurueckgenommen. Zeile in
        relationship_change_log, vorher/nachher.
    A4  RLS je beruehrter Tabelle in beide Richtungen.
    A5  Vollkette laeuft durch. Schritte und Sekunden.

### Was nicht zu tun ist

**Keine Oberflaeche** — **`apps/coach` gehoert Claude Code.**
**Nie gegen die laufende Datenbank testen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
