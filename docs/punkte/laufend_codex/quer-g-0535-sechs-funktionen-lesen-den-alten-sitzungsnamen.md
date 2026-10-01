---
nr: G-535
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-29
beauftragt: 2026-10-01
agent: codex

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
  treffer_gesamt_mit_auth_uid: 7
  funktionen_mit_auth_uid: 52
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

## Auftrag

    AUFTRAG FUER Codex - G-535: sechs Funktionen lesen den alten
                               Sitzungsnamen, ohne Rueckfall
    Bereich: supabase/_pipeline/ (coach, goals, medical, nutrition)
             supabase/_pipeline/_validierung/
             supabase/_pipeline/kette.json
    Fremd:   apps/ gehoert Claude Code, der gerade an G-565 baut (der
             Einheitenschalter). Faellt eine Funktion kuenftig anders,
             MELDE die neue Meldung woertlich - die Oberflaeche zeigt
             sie ueber ladefehler.ts.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/sessions/2026-09-30-uebergabe.md`.

---

## Drei Messungen des Orchestrators, damit der Auftrag nicht auf einer Annahme steht

`[cmd]` **Es sind SIEBEN Treffer, nicht sechs** — und der siebte ist
`auth.uid` selbst:

    auth.uid
    coach.raise_alert
    goals.body_circumference_write
    medical.import_lab_report_rows
    medical.start_lab_report_ocr
    medical.store_lab_report_ocr_result
    nutrition.meal_plan_set_next_plan

`[cmd]` **`auth.uid()` traegt den Rueckfall und ist deshalb richtig:**

    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid

**Sie gehoert Supabase. Sie wird NICHT angefasst.** `[cmd]` **52
Funktionen rufen `auth.uid()` schon** — das ist die Zielform.

`[cmd]` **Die sechs anderen lesen den Singular DIREKT, ohne Rueckfall.**
Beispiel `coach.raise_alert`:

    v_coach uuid := nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
    IF v_coach IS NULL OR NOT EXISTS(...) THEN
      RAISE EXCEPTION 'active own relationship required' USING ERRCODE='42501';

**Diese faellt also laut.** Die anderen fuenf sind nicht gemessen — das
ist A1.

`[cmd]` **Und eine Falle fuer den Waechter:** ein Lauf ueber `pg_proc`
muss `p.prokind = 'f'` setzen. Sonst trifft `pg_get_functiondef()` auf
ein Aggregat und wirft
`"array_agg" is an aggregate function` — der Orchestrator ist zweimal
daran gescheitert, bevor er es gemerkt hat.

---

**A1 — je Funktion messen, was heute passiert.** Nicht annehmen, und je
Funktion sagen, welche der drei Faelle zutrifft:

    faellt laut        wie coach.raise_alert, mit Fehlercode
    schreibt NULL      eine Zeile mit user_id IS NULL - das ist der
                       schlimmste Fall, weil er aussieht wie Erfolg
    unerreichbar       der Aufrufer kommt nie dort an

**Der mittlere Fall entscheidet, ob es eine Datenreparatur braucht.** Gibt
es Zeilen mit `user_id IS NULL`, die so entstanden sind, dann zaehle sie —
und melde sie, raeume sie nicht weg.

**A2 — `auth.uid()` statt des alten Namens**, wie in G-531. Nicht den
`coalesce` in jede Funktion kopieren: **eine Quelle, und die heisst
`auth.uid()`.**

**A3 — genau eine Signatur je Funktion.** In G-531 war das der
wichtigere Teil: blieben zwei stehen, trifft ein Aufruf stillschweigend
die alte. `[cmd]` **Zu belegen mit `pg_proc`**, nicht mit der Datei.

**A4 — der Waechter, und er braucht eine Freistellung.**
`request.jwt.claim.sub` darf in keiner Funktionsdefinition mehr
vorkommen — **ausser in `auth.uid`**, die Supabase gehoert. **Eine
Freistellung am NAMEN, nicht am Muster**, und mit dem Grund im Kommentar.

`[read]` **Ein Waechter, der dauerhaft rot ist, wird umgangen, nicht
repariert** — genau daran ist die Encoding-Disziplin dreimal gescheitert.
Ohne die Freistellung waere dieser hier ab dem ersten Lauf rot.

**A5 — gegen die laufende Datenbank gezaehlt, nicht gegen Dateien.** Der
Name kann in einer Migration stehen, die nie lief, und er kann in einer
Funktion stehen, die keine Datei mehr hat. **`pg_proc` ist die Wahrheit.**

**Nicht Teil:** die Oberflaechen, die diese Funktionen rufen. Faellt eine
kuenftig anders, melde die Meldung woertlich — Claude Code haengt sie an
`ladefehler.ts`.

**Zu belegen:** je Funktion der gemessene Ist-Zustand VOR der Aenderung ·
rote Gegenprobe zuerst · Nachweise auf `test-user@lumeos.local` mit
angemeldeter Sitzung, weil `auth.uid()` ohne sie NULL ist · voller
Kettenlauf gruen mit Schrittzahl · welcher Lauf die neue Probe aufruft ·
Wegwerf-DB verworfen mit Zaehler · kein `db push` · nichts committen.
