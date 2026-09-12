---
nr: C-470
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-468
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 2b67acb1
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
---

# C-470 -- pg_default_acl vergibt in public alles

## Befund

C-468 mass in `public` nach einem Lauf fuer `authenticated` UPDATE und
TRUNCATE, obwohl der Schritt nur SELECT vergab. Die Ursache sind Default-ACLs:
neue Tabellen erhalten `arwdDxtm` fuer die drei App-Rollen. RLS hielt zwar,
aber aus dem falschen Grund.

Gemessen wurden:

    user_display_preferences   INSERT, SELECT, UPDATE, DELETE
    profiles                   INSERT, SELECT, UPDATE
    koerperflaechen            SELECT (mit REVOKE ALL davor)

Keine Rechte entziehen: `profiles` ohne UPDATE waere ein Ausfall. Apps und
`packages/ui` bleiben ausserhalb des Punkts. Nicht committen, stagen oder
pushen.

## Auftrag

Der vorhandene Waechter
`supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts` soll die
vollstaendige, exakte Rechtemenge je Rolle in den Anwendungsschemata pruefen.
`docs/ssot/53-kettenluecke.md` verlangt auch die Meldung einer nicht
vorgesehenen Rolle. Erwartete Rechte muessen je Tabelle mit der vergebenen
Quelle im Sollstand stehen; unklare Erwartungen werden gemessen, nicht geraten.

## Bericht

### A1 -- Messung `pg_default_acl` am 2026-09-11

Ausgelesen aus `pg_default_acl` der laufenden lokalen Datenbank; `r` steht
fuer Tabellen und Sichten. `arwdDxtm` bedeutet alle Tabellenrechte.

| Schema | Tabellen-Defaultrechte | Befund |
| --- | --- | --- |
| `public` | `postgres` und `supabase_admin`: `anon`, `authenticated`, `service_role` jeweils `arwdDxtm` | einziger Anwendungsschema-Fall mit Vollrechten fuer die drei App-Rollen |
| `nutrition` | `postgres`: `authenticated=r`, `service_role=arwdDxtm` | explizit in `20260805120000_baseline_structure.sql:2017-2018` (auch Zugriffsschicht 060) |
| `training` | `postgres`: `authenticated=r`, `service_role=arwdDxtm` | explizit in `100_training_schema.sql:241-242` |
| `coach`, `goals`, `marketplace`, `medical`, `recovery`, `supplements`, `wissen` | kein Eintrag | keine Tabellen-Default-ACL |
| `buddy` | Schema existiert nicht | deshalb keine ACL und keine Tabelle zu pruefen |

Die Supabase-Systemschemata besitzen ebenfalls Default-ACLs, sind aber keine
LumeOS-Anwendungsschemata: `storage`, `graphql`, `graphql_public` und
`supabase_functions` geben App-Rollen Vollrechte; `auth` und `realtime` geben
sie `postgres`/`dashboard_user`; `extensions` hat nur Owner-Privilegien.

### A2/A3 -- Abdeckung und Herkunft

Der Sollstand umfasst nun 203 Tabellen mit exakter Rechtemenge und
`grants_herkunft`, vollstaendig belegt: `nutrition` 35, `coach` 17, `goals` 8,
`marketplace` 14, `medical` 31, `public` 3, `recovery` 7, `supplements` 63,
`training` 15 und `wissen` 10. Das ist die gemessene aktuelle
Schemawirklichkeit: zehn Anwendungsschemata mit Tabellen. `buddy` fehlt;
`recovery` und `wissen` sind reale Schemata und bleiben deshalb abgedeckt.

Neu dokumentiert sind `public.profiles` (Baseline),
`public.user_display_preferences` (091) und `public.koerperflaechen` (C-471),
sowie die bislang fehlenden Quellen der C-461-, C-467-, C-460- und
Marketplace-Tabellen. Der Fremdschema-Zweig des Waechters meldet jetzt auch
eine Rolle, die im Sollstand gar nicht vorgesehen ist.

Die drei Medical-Katalogtabellen `biomarker_explanations`, `symptoms` und
`symptom_biomarker_map` haben gemessen jeweils `anon SELECT`,
`authenticated SELECT` und `service_role ALL`. Herkunft:
`supabase/_pipeline/13_supplements/143_kimi_wave2_biomarker_symptoms.ts:114-119`.
`nutrition.nutrient_defs` hat gemessen kein `anon`-Recht; der falsche
Sollwert wurde entfernt, kein Recht erteilt.

### A4 -- Gegenprobe

In der Wegwerf-Datenbank `lumeos_c470_acl_test` war eine Tabelle nur mit
`authenticated SELECT` im Sollstand eingetragen. Nach `GRANT ALL ... TO anon`
war der fruehere Fremdschema-Zweig noch gruen. Mit der Ergaenzung wird sie rot:
`nicht vorgesehene Rolle anon (INSERT, SELECT, UPDATE, DELETE, TRUNCATE,
REFERENCES, TRIGGER)`. Nach `REVOKE ALL ... FROM anon` war der Waechter wieder
gruen. Die Wegwerf-Datenbank wurde entfernt.

### A5 -- Gemessen, nicht behoben

`public.activity_stream` (Quelle 412) und `public.muscle_training_loads`
(Quelle C-421) haben heute fuer `anon`, `authenticated` und `service_role`
jeweils `DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE,
UPDATE`, obwohl ihre Quellen nur `SELECT` explizit vergeben. Ursache ist die
`public`-Default-ACL. Keine Rechte wurden entzogen.

### A6/A7 -- Laeufe

Die Vollkette lief in `lumeos_c470_full` bis zur Abschlusspruefung. Nach dem
Eintragen der gemessenen drei Medical-Rechte und der Korrektur von
`nutrient_defs` meldete der Abschlusswaechter `SCHEMA VOLLSTAENDIG`:
39/39 Nutrition-Objekte und 168/168 Fremdschema-Tabellen. Die Wegwerf-Datenbank
wurde anschliessend entfernt.

`node tools/punkte-pruefen.mjs` ist gruen: 636 Punkte, 25/25 Befunde.
`pnpm gate` laeuft bis `fragen-index` und endet dort rot, weil
`docs/ssot/00-FRAGEN.md` von den Punktdateien abweicht. Das ist eine bestehende
fremde Dokumentationsabweichung; sie wurde nicht veraendert. Apps und
`packages/ui` blieben unberuehrt.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    Sollstand   203 Tabellen mit Rechtemenge und
                grants_herkunft
    Abdeckung   zehn Anwendungsschemata
    Gegenprobe  GRANT ALL TO anon -> rot
    Vollkette   39/39 Nutrition, 168/168 Fremdschema

`[cmd]` **Den Waechter selbst laufen lassen** ? **er findet fuenf
Abweichungen, darunter die zwei Ueberrechte:**

    public.muscle_training_loads
      authenticated ZU VIEL: INSERT, UPDATE, DELETE
      service_role  ZU VIEL: INSERT, UPDATE, DELETE
      anon          nicht vorgesehene Rolle
    shopping_lists
      authenticated ZU VIEL: DELETE

`[read]` **Der Waechter misst** ? **er meldet nicht nur, dass
etwas da ist, sondern WAS zu viel ist und WOHER es kommt.**

### Die zwei Ueberrechte sind echt, aber nicht gefaehrlich

`[cmd]` **Beide sind SICHTEN mit `security_invoker=true`:**

    public.activity_stream         Sicht, 5.428 Zeilen
    public.muscle_training_loads   Sicht, 43 Zeilen

`[read]` **Die Sicht laeuft mit den Rechten des AUFRUFERS** ?
**`anon` kommt nicht an die Daten, auch mit SELECT-Recht
nicht.**

`[read]` **Aber das Recht steht da, und wer es liest, muss erst
`security_invoker` nachsehen** ? **eine Schutzschicht, die man
kennen muss.**

`[cmd]` **Und C-468 hat denselben Mechanismus gefunden:**
`pg_default_acl` **vergibt in `public` alles, `ON TABLES` umfasst
auch Sichten.**

### Was er richtig gemacht hat

> *,,Ueberrechte nur GELISTET, nicht geaendert."*

`[read]` **Mein Auftrag hat das verlangt** ? `profiles` **ohne
UPDATE waere ein Ausfall.**

`[cmd]` **Und `nutrient_defs` hat er aus dem Sollstand genommen,
statt das Recht zu vergeben** ? **die Messung schlaegt die
Erwartung.**

### Eine Praemisse meines Auftrags war falsch

`[cmd]` **Ich nannte `buddy` als Schema** ? **es existiert
nicht.**

`[cmd]` **`recovery` und `wissen` habe ich vergessen.**

`[read]` **Er hat beides gemessen und berichtigt.**

### Was offen bleibt

`[cmd]` **Der Waechter ist ROT** ? **fuenf Abweichungen, darunter
zehn fehlende Spalten in `medical.user_medications`.**

`[read]` **Das ist kein Fehler dieses Punktes** ? **es ist der
Zweck: er misst jetzt, was vorher niemand sah.**

`[read]` **Die fuenf gehoeren einzeln entschieden.**

**Abgenommen.**

