---
nr: C-431
typ: feature
modul: medical
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-429
entscheidung: E-75
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [medical.lab_reports]
zahlen:
  gemessen: 2026-09-08
---

# C-431 — C-429 einspielen

## Befund

`[cmd]` **C-429, C-430 und G-374 sind gebaut und auf
`lumeos_c429_final` geprueft** — **367,3 s, gruen.**

`[cmd]` **Nicht live.**

`[read]` **Und A1 traegt eine Einschraenkung, die er selbst
nennt:** **die Wegwerf-Nachbildung prueft Metadaten, RLS und
Referenz, nicht die Bytes.**

`[read]` **Der echte Storage-Dienst haengt an der laufenden
Datenbank** — **erst das Einspielen zeigt, ob eine Datei
ankommt.**

## Auftrag

**Beauftragt am 2026-09-08.**

### Einspielen, wie bei C-421 bis C-424

`[read]` **Vorher Sicherung nach `backup/`.**

`[cmd]` **Danach messen, was auf `dev` steht:** **Bucket,
`appointments`, die drei Ereignisarten, die Zeitachse, die drei
Sprachspalten, `cycling.started_on`.**

### Und dann die Bytes

`[read]` **Der echte Dienst laeuft jetzt** — **leg eine Datei ab
und lies sie zurueck.**

`[cmd]` **E-75: Bucket `medical-originals`, privat, Pfad
`<user_id>/<report_id>.<ext>`.**

`[read]` **Miss, ob ein fremdes Konto an den Pfad kommt** — **die
Zeilensicherheit laeuft ueber das erste Segment.**

### Abnahmebedingungen

    A1  live: je Objekt eine Zahl. Bucket, appointments,
        Ereignisarten, Zeitachse, Sprachspalten, started_on.
    A2  Sicherung: Pfad und Groesse.
    A3  eine Datei abgelegt und zurueckgelesen. Groesse in Byte.
    A4  ein fremdes Konto kommt NICHT an den Pfad. Belegt.
    A5  Punktelauf gruen nach dem Einspielen.

### Was nicht zu tun ist

`apps/` nicht anfassen — **Claude Code arbeitet an G-375.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
