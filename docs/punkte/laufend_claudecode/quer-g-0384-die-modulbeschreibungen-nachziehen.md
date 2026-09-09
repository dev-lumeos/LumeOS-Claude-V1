---
nr: G-384
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-383
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - tools/ssot-modultabellen.mjs
zahlen:
  gemessen: 2026-09-08
  tabellen: 167
  falschaussagen: 4
---

# G-384 — die Modulbeschreibungen nachziehen

## Befund

Aus G-383, Claude Code, 2026-09-08.

`[cmd]` **`tools/ssot-modultabellen.mjs` erzeugt 167 Tabellen,
2.352 Spalten, 7 Module** ? **mit Zeilenzahl und dem Datum der
erzeugenden Migration.**

`[read]` **Damit ist die Struktur erzeugt.** `[read]` **Was fehlt,
ist die Beschreibung: warum etwas so gebaut ist, und was bewusst
nicht.**

`[cmd]` **Und vier Abwesenheitsbehauptungen stehen noch:**

    128-recovery-scores.md:52    overtraining_alerts
    96-recovery-checkins.md:27   recovery_protocols
    105-medical-schema.md:30     user_medications
    98-supplements-schema.md:46  vier Supplements-Tabellen

`[read]` **Der Orchestrator berichtigt sie** ? `docs/` **gehoert
ihm.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Je Modul: was fehlt in der Beschreibung?

`[cmd]` **`00-MODULTABELLEN.md` sagt, WAS es gibt.**

`[read]` **Die Moduldateien sollen sagen, WOZU** ? **und das ist
Handarbeit.**

`[read]` **Miss je Modul, welche der neuen Tabellen keine
Beschreibung hat** ? **und schreib je Tabelle EINEN Satz, was sie
traegt.**

`[cmd]` **Nicht in `docs/`** ? **im Bericht.** `[read]` **Ich
uebernehme sie.**

### 2 · Der Waechter, mit deiner Einschraenkung

`[read]` **Dein Vorschlag: *,,keine SSOT-Datei behauptet eine
Tabelle als nicht gebaut, die `information_schema` fuehrt."***

`[cmd]` **Und deine Einschraenkung: 54 richtige Faelle brauchen
eine Ausnahmeliste, und die altert nur nach oben.**

`[read]` **Bau ihn OHNE Ausnahmeliste** ? **er meldet alle 58, und
die Meldung nennt je Zeile, welche Namen existieren und welche
nicht.**

`[read]` **Ein Waechter, der 54 richtige Faelle meldet, ist
laestig** ? **aber eine Ausnahmeliste, die niemand pflegt, ist
schlimmer.**

`[read]` **Miss zuerst, ob die Meldung kurz genug bleibt.**
`[read]` **Wenn nicht: melden, warum, und nicht bauen.**

### 3 · Die Gegenprobe fuer den Erzeuger

`[cmd]` **A2 hat gezeigt: die Summen bewegen sich nicht** ? **7
Tabellen, 126 Spalten, vor und nach der Umbenennung.**

`[read]` **Wer nur die Summe vergleicht, sieht nichts.**

`[read]` **Miss, ob der Erzeuger im Gate laufen soll** ? **und was
er dort meldet.**

### Abnahmebedingungen

    A1  je Modul: Tabellen ohne Beschreibung. Zahl: neu /
        beschrieben / offen.
    A2  je offener Tabelle ein Satz, was sie traegt.
    A3  der Waechter: laeuft er, wie lang ist die Meldung?
        Zahl: Zeilen der Ausgabe.
    A4  Gegenprobe des Waechters: eine wahre Aussage einfuegen
        -> wird sie gemeldet? Zurueckgebaut.
    A5  gehoert der Erzeuger ins Gate? Ja mit Meldung, nein
        mit Grund.

### Was nicht zu tun ist

**Nichts in `docs/` schreiben** ? **auch nicht die vier
Berichtigungen.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-435.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
