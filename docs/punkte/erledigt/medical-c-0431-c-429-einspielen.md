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
erledigt: 2026-09-08
commit: 6ba3d57f
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

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  Bucket medical-originals, public=false, 1 Objekt
        appointments 1, health_events 3, health_timeline 4
        summary_de/_en/_th, cycling.started_on 1
    A2  Sicherung 27.020.597 Byte
    A3  55 Byte abgelegt und zurueckgelesen, byte-identisch
    A4  Fremdkonto: HTTP 400, 0 passende storage.objects-Zeilen
    A5  Vollkette 301,5 s gruen

### Die Bytes sind jetzt belegt

`[read]` **In C-429 stand die Einschraenkung, die er selbst
nannte:** **die Wegwerf-Nachbildung prueft Metadaten, nicht
Bytes.**

`[cmd]` **Jetzt: 55 Byte abgelegt, zurueckgelesen,
byte-identisch.**

`[read]` **Damit ist der Weg vollstaendig belegt** — **nicht nur
die Struktur.**

### Und der Fremdzugriff scheitert zweifach

`[cmd]` **Storage-GET: HTTP 400.** `[cmd]` **Und direkt gegen
`storage.objects`: null Zeilen fuer den fremden Nutzer.**

`[read]` **Zwei Wege geprueft, nicht einer** — **die Sperre haengt
nicht an einer Schicht.**

`[cmd]` **E-75: die Zeilensicherheit laeuft ueber das erste
Segment, und sie tut es.**

### Das Schema ist eleganter als beauftragt

`[cmd]` **Ich hatte drei Ereignisarten genannt** — **er hat EINE
Tabelle gebaut:**

    medical.health_events     13 Spalten, 3 Zeilen
    medical.health_timeline   12 Spalten, 4 Zeilen
    medical.appointments      12 Spalten, 1 Zeile

`[read]` **Diagnose, Behandlung und Operation unterscheiden sich in
der Art, nicht im Aufbau** — **alle drei tragen Herkunft, Akteur,
Zeitpunkt und einen verknuepften Befund.**

`[read]` **Drei Tabellen haetten dreimal dieselben Spalten
gehabt.**

### Die drei roten Befunde waren meine

`[cmd]` **Er meldete: 28 statt 25, drei erledigte Punkte mit leerem
`beruehrt:`** — **C-269, G-17, G-152.**

`[cmd]` **Nachgemessen: `tabellen: []` und `dateien: []` in allen
dreien.**

`[read]` **Die habe ich beim Abnehmen gesetzt und nicht
gefuellt.**

`[read]` **Und er hat sie nicht selbst umgeschrieben** —
**richtig, `docs/` gehoert dem Orchestrator.**

`[cmd]` **Behoben, Punktelauf gruen: 25 von 25.**

**Abgenommen.**

