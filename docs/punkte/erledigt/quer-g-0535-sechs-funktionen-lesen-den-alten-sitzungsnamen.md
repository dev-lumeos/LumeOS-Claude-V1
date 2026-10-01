---
nr: G-535
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-29
beauftragt: 2026-10-01
erledigt: 2026-10-01
agent: codex
commit: 79d50c60

braucht: []
kind_von: G-531

quellen:
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql
    - supabase/_pipeline/00_querschnitt/535_auth_uid_legacy_readers.sql
    - supabase/_pipeline/_validierung/quer-g535-auth-uid-readers.test.ts
    - supabase/_pipeline/kette.json

zahlen:
  gemessen: 2026-10-01
  funktionen_mit_altem_namen: 6
  treffer_gesamt_mit_auth_uid: 7
  funktionen_mit_auth_uid: 58
  betroffene_module: 3
  kettenschritte: 310
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

**Nachtrag 2026-10-01, A1 hat es gemessen:** fuenf fallen laut, eine war
der schlimmere Fall — `medical.import_lab_report_rows` liess den eigenen
Nutzervergleich wegen SQL-NULL ausfallen und wurde nur von RLS gehalten.
Die Vermutung oben ist damit beantwortet; siehe Abnahme.

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

---

## Abnahme — 2026-10-01, Commit `79d50c60`

**Gemessene Merkmale, keine nachgerechneten Agentenzahlen.**

### A1 ist beantwortet, und der mittlere Fall war dabei

`[cmd]` **Fuenf fallen laut**, mit woertlich erhaltenen Meldungen:
`coach.raise_alert` 42501, `goals.body_circumference_write` 42501, die
beiden medical-OCR-Funktionen 28000,
`nutrition.meal_plan_set_next_plan` 42501.

`[cmd]` **`medical.import_lab_report_rows` war der gefaehrliche Fall.**
`auth_user` war NULL, **der eigene Nutzervergleich fiel wegen SQL-NULL
aus** — ein fremder Nutzer lief in
`new row violates row-level security policy (42501)`. **Die Pruefung
griff nicht, die Mauer dahinter griff.** Nach der Korrektur meldet die
Funktion selbst: `medical import: user mismatch (P0001)`.

`[cmd]` **Stille Schaeden im Bestand: 0 Zeilen**, gezaehlt ueber
`coach.alerts.coach_id/created_by`, Koerperumfaenge, Laborberichte und
-werte und Ernaehrungsplaene. **Keine Datenreparatur noetig.**

### Die Merkmale

`[cmd]` **Sechs `CREATE OR REPLACE` in
`00_querschnitt/535_auth_uid_legacy_readers.sql`**, jede mit
`auth.uid()` — gezaehlt: 6 Funktionen, 6 Zuweisungen.

`[cmd]` **Der Waechter setzt `p.prokind = 'f'`** (Zeile 54) — die Falle,
an der der Orchestrator zweimal gescheitert ist — und **stellt
`auth.uid` am Schema UND am Namen frei**
(`AND NOT (schema_name = 'auth' AND proname = 'uid')`, Zeile 83), mit
dem Grund im Kommentar darueber. Die Gegenrichtung ist ebenfalls
gepruefte Zusicherung: `authUidCompatibilityHelpers` muss genau
`['auth.uid']` sein.

`[cmd]` **Beide Schritte stehen in `kette.json`** (Zeilen 2972 und
2985), die Probe mit `dependsOn: 535_auth_uid_legacy_readers`.
**Kettenlaenge 310 Schritte** — selbst gezaehlt, nicht aus dem Bericht
uebernommen.

### Was der Bericht offenliess, und selbst nachgesehen

`[cmd]` **Die alten Lesestellen stehen weiter in fuenf urspruenglichen
Pipelinedateien:** `11_goals/111_goals_ziele_phasen.sql` (2),
`11_goals/112_body_measurements.sql`, `14_medical/142_laborimport_matching.sql`,
`00_querschnitt/422_recovery_card_reads_and_phase_proposals.sql`,
`05_user_tabellen/058b_recipes_meal_plans.sql`.

`[read]` **Der Endzustand ist trotzdem richtig**, weil Schritt 535
spaeter laeuft und ersetzt — und **wer kuenftig eine dieser Dateien
anfasst, wird vom Waechter rot.** Das ist die Begruendung dafuer, dass
der Waechter dauerhaft in der Kette steht und nicht nur eine Einmalprobe
war. Die Quelle traegt zwei Fassungen, die Datenbank eine.

### Ein Befund, der daraus entsteht

`[cmd]` **Keine dieser sechs Funktionen hat einen Aufrufer in der
Anwendung** — selbst gezaehlt ueber `apps/` und `packages/`: ein
einziger Treffer, und das ist ein Kommentar in
`apps/web/src/app/v2/medical/katalog-suche.tsx:20`. **Sechs
Schreibwege existieren in der Datenbank und werden von nichts
benutzt.** Das ist G-571, mitsamt der neuen `P0001`-Meldung, die
`ladefehler.ts` heute nicht kennt.

**Nicht eingespielt.** Damit stehen drei Datenbankaenderungen gebaut und
nicht live: G-559, G-563, G-535.
