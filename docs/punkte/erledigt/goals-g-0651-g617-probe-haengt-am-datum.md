---
nr: G-651
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-16
agent: codex
beauftragt: 2026-10-16
erledigt: 2026-10-16
commit: 7f83d0b2

braucht: []
kind_von: G-617

quellen:
  - supabase/_pipeline/_validierung/goals-g617-measurement-goals.test.ts
  - backup/_manifests/kettenlauf-lumeos_tageskette_20261016.log

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_validierung/goals-g617-measurement-goals.test.ts
---
# G-617-Probe hängt am Datum: Tageskettenlauf 16.10. rot

## Befund

`[cmd]` Der tägliche Kettenlauf vom 16.10.2026 um 04:12 ist fehlgeschlagen, bei `goals-g617-measurement-goals.test.ts`: 2 von 4 Proben sind rot.
- Probe 2 (Bankdrücken/Kniebeuge, Z. 92): erwartet 99.3, ist 98.81
- Probe 4 (Messart, Z. 300): erwartet 82.48, ist 82.06

`[read]` Der Lauf von Codex am selben Tag war grün (409 Schritte).
`[annahme]` Die Probe rechnet mit einem Zeitfenster relativ zu `current_date` oder zur Uhrzeit (UTC/lokal). Dann ändert sich der erwartete Wert mit dem Tag.

Die Wegwerf-Datenbank `lumeos_tageskette_20261016` ist zur Prüfung erhalten geblieben.

## Was zu tun ist (Codex)

- Ursache belegen: welcher Wert vom Datum oder der Zeitzone abhängt.
- Die Probe mit festem Stichtag rechnen. Den Wert nicht nachziehen.
- Gegenprobe: Mit verschobenem Datum muss die Probe grün bleiben. Mit eingebautem Fehler muss sie rot werden.
- Danach die Wegwerf-Datenbank verwerfen.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-651 G-617-Probe haengt am Datum
    Bereich: supabase/_pipeline/_validierung/
    Fremd:   apps/, docs/
    Stand:   2026-10-16, HEAD 5137e69f

## Erledigt - 2026-10-16, Commit `7f83d0b2`

Ursache: Der Trainings-Seed wächst mit `--today` mit. Die Einheit vom 12.10. hebt 98,81 auf 99,30 und 82,06 auf 82,48.
Lösung: Die Probe prüft jetzt mit festen Stichtagen, am 08.10. und am 16.10.
`[read]` Codex: Kette 409/409 grün. Ein absichtlich um 1 erhöhter Erwartungswert macht G-617 rot. Wegwerf-Datenbanken: 0.
`[cmd]` `pg_database` like `lumeos_%`: 0 Zeilen.
