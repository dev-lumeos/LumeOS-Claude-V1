# A-26: Schemafreigabe, Encoding-Pruefer und Sollstand

Stand: 2026-08-20

## Was `coach` blockiert hat

[cmd] `supabase/config.toml` fuehrte vor A-26 acht API-Schemata: `public`, `graphql_public`, `nutrition`, `goals`, `supplements`, `medical`, `recovery`, `training`. `coach` fehlte.

[cmd] Die Tabellen waren da: `coach.client_permissions`, `client_autonomy`, `pending_actions`, `action_log`, `permission_change_log`, `autonomy_change_log`. Ohne Freigabe lieferte PostgREST trotzdem `PGRST106`, weil das Schema nicht in der API-Schemaliste stand.

[cmd] `coach` wurde in `schemas = [...]` ergaenzt. Danach war ein voller Neustart noetig: `supabase stop; supabase start`. Ein Container-Restart reicht nicht, weil PostgREST die Schemaliste beim Start aus der Konfiguration bekommt.

[cmd] Nach dem Neustart liest ein authentifizierter REST-Aufruf mit `Accept-Profile: coach` gegen `client_permissions` wieder Daten: `dev@lumeos.app` sieht 1 Zeile. Kein `Invalid schema: coach` mehr.

## Wie die Pruefung misst

[cmd] Neu: `tools/schemafreigabe-pruefen.mjs`, im Gate zwischen `gruppenlabel-pruefen.mjs` und `i18n-pruefen.mjs`.

[cmd] Die Pruefung liest `supabase/config.toml` und `supabase/_pipeline/daten/schema-sollstand.json`. Erwartet werden `nutrition` plus alle Schemata, die in `fremde_schemata` oder `fremde_funktionen` vorkommen. `public` und `graphql_public` sind Supabase-Defaults und duerfen in `config.toml` stehen, ohne aus `schema-sollstand.json` zu kommen.

[cmd] Gruen: `schemafreigabe` meldet 9 config-Schemata und 7 freigegebene Anwendungsschemata.

[cmd] Rot, fehlender Eintrag: temporäre `config.toml` ohne `coach` meldet `In config.toml fehlen: coach` und beendet mit Exit 1.

[cmd] Rot, Gegenrichtung: temporäre `config.toml` mit zusaetzlichem `ghost` meldet `In config.toml freigegeben, aber nicht im Sollstand: ghost` und beendet mit Exit 1.

[cmd] `schema-vollstaendigkeit-pruefen.ts` kann nun optional einen Sollstand-Pfad als Argument bekommen. Damit wurde die Gegenprobe ohne Aenderung der echten Sollliste gefahren: ein temporärer Sollstand ohne `training.equipment` meldet `training.equipment steht da, aber NICHT in fremde_schemata` und beendet mit Exit 1.

## Was der Encoding-Pruefer auslaesst

[cmd] `tools/encoding-pruefen.mjs` nahm bereits `node_modules`, `.next`, `.next-gate`, `.git` und `.turbo` aus. A-26 hat die Regel auf `.next*` als Namensmuster erweitert und `dist`, `build`, `out`, `coverage` ergaenzt.

[read] Erzeugte Dateien sind keine Quelldateien. Der Pruefer soll Quellschaden blockieren, nicht Vendor- oder Build-Chunks.

[cmd] Nachweis mit vorhandenen `.next-gate`-Verzeichnissen in `apps/admin/.next-gate` und `apps/web/.next-gate`: `node tools/encoding-pruefen.mjs` prueft 3.773 Dateien, meldet keinen Fehler und bleibt bei Exit 0. Die 16 bekannten UTF-8-BOM-Hinweise bleiben Hinweise, kein Abbruch.

## Welche Tabellen im Sollstand fehlten

[cmd] Vor A-26 kannte `fremde_schemata` 36 Tabellen. Nach A-26 kennt es 40.

[cmd] Ergaenzt wurden die vier Training-Stammdatentabellen aus `100_training_schema.sql`: `training.muscle_groups`, `training.equipment`, `training.exercises`, `training.exercise_muscles`.

[cmd] Nach Kettenlauf auf Wegwerf-Datenbank `lumeos_kette_a26`: `schema-vollstaendigkeit-pruefen.ts` meldet `Fremde Tab. 40/40 vollstaendig`, `Fremde Fkt. 32/32 vorhanden`, Exit 0.

[cmd] Die laufende Datenbank hat bei diesen vier Tabellen aktuell nur SELECT-Policies, waehrend `100_training_schema.sql` Admin-Schreibpolicies erzeugt. Das ist Live-Drift, nicht Teil von A-26; der Auftrag erlaubte keine Schemaaenderung. Der Kettenlauf belegt den Sollzustand.

## Nachweis

[cmd] `supabase stop; supabase start`: erfolgreich, lokaler Stack neu gestartet.

[cmd] REST-API `coach.client_permissions`: authentifiziert als `dev@lumeos.app`, 1 Zeile.

[cmd] `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_kette_a26 --keep-database`: Exit 0.

[cmd] `PGDATABASE=lumeos_kette_a26 pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`: Exit 0.

[cmd] `node tools/schemafreigabe-pruefen.mjs`: Exit 0; beide roten Gegenproben: Exit 1.

[cmd] `pnpm gate` erreicht `encoding`, `gruppenlabel`, `schemafreigabe` und `i18n` gruen. Danach scheitert es in `@lumeos/web:test` an zwei vorhandenen Frontend-Attrappen-Tests in `apps/web/src/components/shell/__tests__/v2-attrappen.test.ts`: Supplements erwartet 1 Attrappenmarke, findet 17; `TodayAttrappe` braucht laut Test eine Rueckfallmarke. `apps/web` wurde fuer A-26 nicht angefasst.

