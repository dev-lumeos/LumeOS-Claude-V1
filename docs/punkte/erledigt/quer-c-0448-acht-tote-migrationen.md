---
nr: C-448
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-447
entscheidung: E-77
erledigt: 2026-09-08
commit: OFFEN
beruehrt:
  dateien:
    - tools/migration-kette-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  tot: 8
---

# C-448 — acht tote Migrationen

## Befund

Aus C-447, Codex, 2026-09-08. **Je Datei einzeln gemessen.**

`[cmd]` **Alle acht sind tot oder ueberholt, keine ist
vergessen:**

    search_events   bereits in Pipeline 057
    C-283           Katalogfelder in Pipeline 283
    C-286           bytegleich zur Pipeline
    C-293           bytegleich
    G-107           bytegleich
    C-371           Pipeline-Superset vorhanden
    C-362           Pipeline-Superset vorhanden
    C-381           Pipeline 381 traegt die Revokes UND die
                    sicheren RPCs

`[cmd]` **Die Ausnahmeliste steht bei 8, war 11.**

## Die Entscheidung

`[read]` **Sie liegen in `supabase/migrations/`, sind nirgends
registriert und werden nie ausgefuehrt.**

**a** ? **Loeschen.** `[read]` **Dann faellt die Ausnahmeliste
auf null, und der Waechter braucht keine mehr.**

`[read]` **Eine Liste, die es nicht gibt, kann nicht veralten.**

**b** ? **Liegen lassen.** `[read]` **Sie sind Protokoll:** **sie
zeigen, wie das Schema entstanden ist.**

`[cmd]` **Aber die Kette zeigt das auch** ? **und sie ist die
Wahrheit** (`supabase/README.md`).

**c** ? **Nach `backup/` verschieben.** `[read]` **Aus dem Weg,
aber nicht weg.**

`[cmd]` **Dort loescht niemand ausser Tom** ? **die Regel steht
schon.**

## Was fuer c spricht

`[read]` **`C-381 secure_pending_action_execution` klang nach einer
Sicherung** ? **es war eine, und die Pipeline traegt sie
vollstaendiger.**

`[read]` **Wer das in einem Jahr nachliest, will sehen, dass die
Frage gestellt wurde** ? **nicht nur, dass eine Datei fehlt.**

`[cmd]` **Und Codex' Nachsatz:** *,,C-381-Schutz bleibt ueber den
Pipeline-Superset aktiv."*

## Entschieden am 2026-09-08 — Variante c

Tom: *,,ja weg mit den toten migrationen in das backupverzeichnis,
ich move heute abend."*

`[cmd]` **Acht Dateien nach `backup/tote-migrationen/` verschoben,
per `git mv`** ? **die Geschichte bleibt.**

`[cmd]` **`00-LIESMICH.md` daneben:** **warum jede tot ist, mit
der Fundstelle aus C-447.**

`[cmd]` **Und `KNOWN_NON_CHAIN_MIGRATIONS` ist LEER** ? **von 8 auf
0.**

`[read]` **Eine Liste, die es nicht gibt, kann nicht veralten.**

`[cmd]` **Waechter gruen: 20 Dateien, 9 in Kette und live, 11 in
Kette und nicht live, 0 Bestand.**

`[cmd]` **Gegenprobe: eine neue Datei ohne Kettenschritt -> ROT,
zurueckgebaut -> gruen.** `[cmd]` **Eigene Tests 2/2.**

`[read]` **Jede Migrationsdatei ohne Kettenschritt macht das Gate
jetzt rot** ? **ohne Ausnahme.**
