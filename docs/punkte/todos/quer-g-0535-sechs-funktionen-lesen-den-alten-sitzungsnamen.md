---
nr: G-535
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-29

braucht: []
kind_von: G-531

quellen:
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql

zahlen:
  gemessen: 2026-09-29
  funktionen_mit_altem_namen: 6
  betroffene_module: 3
---

# Sechs Funktionen lesen den alten Sitzungsnamen

`[cmd]` **Aus G-531, von Codex bei der Livesuche gefunden:** nach der
Korrektur der drei Phasenfunktionen bleiben **sechs Anwendungsleser**, die
weiterhin

```sql
NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
```

verwenden — den **Singular**-Namen von vor PostgREST 9. `[cmd]` Auf der
laufenden Instanz liefert er **NULL**, immer, fuer jeden Nutzer.

    coach.raise_alert
    goals.body_circumference_write
    medical.import_lab_report_rows
    medical.start_lab_report_ocr
    medical.store_lab_report_ocr_result
    nutrition.meal_plan_set_next_plan

`[read]` **Was das bedeutet, zeigt G-531:** die Phase engine war nicht
halb fertig, sie war **unbedienbar** — Anlegen, Beenden und Wechseln haben
nie funktioniert, fuer niemanden. Dieselbe Ursache liegt in diesen sechs.

**Die Vermutung ist naheliegend, aber sie ist eine Vermutung:**
`[annahme]` jede dieser Funktionen faellt mit „Anmeldung erforderlich"
oder schreibt ins Leere. Was tatsaechlich passiert, haengt davon ab, wie
jede mit NULL umgeht — eine schreibt vielleicht eine Zeile mit
`user_id IS NULL`, was schlimmer ist als ein Fehler.

## Was zu tun ist

1. **Je Funktion messen, was heute passiert.** Nicht annehmen. Faellt sie,
   schreibt sie NULL, oder wird sie stumm ueberhaupt nicht erreicht?
2. `auth.uid()` statt des alten Namens, wie in G-531.
3. **Genau eine Signatur je Funktion.** In G-531 war das der wichtigere
   Teil: blieben zwei stehen, trifft ein Aufruf stillschweigend die alte.
4. **Ein Waechter, der den Namen verbietet**, sonst kommt er zurueck.
   `request.jwt.claim.sub` (Singular) darf in keiner Funktionsdefinition
   mehr vorkommen — gezaehlt gegen die laufende Datenbank, nicht gegen
   Dateien.

## Warum es drei Bereiche betrifft

`goals` gehoert zum laufenden Strang. `coach`, `medical` und `nutrition`
nicht — **das ist der Grund, diesen Punkt nicht in einen Goals-Auftrag zu
haengen.** Er gehoert ganz zu Codex, aber als eigener Auftrag, nach den
Goals-Grundlagen.
