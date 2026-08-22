# C-187: Fuenf Datenluecken, ein Durchgang

Datum: 2026-08-22  
Bereich: `supabase/_pipeline/`

## Was gelesen wurde

- `[read]` `supabase/README.md`: Der Stand entsteht aus der Kette, nicht aus `supabase/migrations/`.
- `[cmd]` `supabase/_pipeline/kette.json`: 87 Schritte; die C-187-Aenderungen liegen in vorhandenen Pipeline-Bloecken.
- `[read]` `docs/specs/Nutrition/01_current_specs/SPEC_02_ENTITIES.md`, `SPEC_06_DATABASE_SCHEMA.md`, `03_sql/SPEC_06_V1_MIGRATION.sql`, `ADR_RECIPES_SCHEMA_ONLY.md`: Shopping Lists sind in der Nutrition-Spec vorgesehen und gehoeren zum schema-only-Block mit Rezepten und Wochenplaenen.
- `[read]` G-122/G-126 in `docs/todo/TODO.md` und `docs/ssot/166-naehrstoffbaum-anzeige.md`: `CHOL`/`CHORL`, `SE` und die 28 fehlenden Texte.
- `[read]` G-124/G-130 in `docs/todo/TODO.md` und `docs/ssot/170-medical-lab-marker.md`: die zehn Medikationsspalten.
- `[read]` C-178/G-135 in `docs/todo/TODO.md`, `docs/ssot/171-health-score.md` und C-186 in `docs/ssot/175-supplements-schreibwege.md`: Medical-Systemgruppen gegen Supplement-Nebenwirkungen.

Vor strukturellen Aenderungen wurde eine Schema-Sicherung geschrieben: `backup/schema/20260822074559_c187_vor_schema.sql`.

## Was gebaut wurde

### Shopping Lists

`[cmd]` Vorher gab es in keinem Schema eine Tabelle mit `shopping` im Namen. Die Nutrition-Spec und die ADR nennen Shopping Lists als Teil von Recipes/Meal Plans; deshalb wurden sie im vorhandenen Schritt `058b_recipes_meal_plans.sql` ergaenzt, nicht als eigener isolierter Block.

Neu:

- `nutrition.shopping_lists`
- `nutrition.shopping_list_items`

Die Tabellen tragen RLS mit je vier Policies, Grants fuer `authenticated` und `service_role`, Owner-Guards, Touch-Trigger, Fremdschluessel zu Rezepten, Wochenplaenen, BLS-Foods und Custom-Foods. `source_type = 'supplement_reorder'` ist vorgesehen, ohne eine Supplement-Tabelle als Abhaengigkeit einzubauen; ein Reorder kann zunaechst als freie Position in die Liste.

### EAA unter `AAE9`

`[cmd]` In der Pipeline waren die neun Einzelcodes schon vorhanden: `HIS`, `ILE`, `LEU`, `LYS`, `MET`, `PHE`, `THR`, `TRP`, `VAL`. Das Problem war nicht der BLS-Code-Bestand, sondern die Elternbeziehung.

`AAE9` hat jetzt exakt diese neun Kinder. `CYSTE` und `TYR` haengen nicht mehr unter `AAE9`, sondern unter `PROT625`, weil sie nicht zu den neun unentbehrlichen Aminosaeuren gehoeren. Die Pruefung in `015a_nutrient_tree_details.ts` bricht, wenn `AAE9` wieder mehr oder weniger als diese neun Kinder hat.

### Zehn Medication-Spalten

`[cmd]` Geprueft gegen die vier vorhandenen Tabellen:

- `medical.medication_active_substances`
- `medical.medication_formulations`
- `medical.medication_products`
- `medical.user_medications`

Die zehn G-124-Spalten waren dort nicht vorhanden und gehoeren fachlich an `medical.user_medications`, weil sie die nutzerbezogene Ueberwachung einer konkreten Medikation beschreiben:

`monitoring`, `monitoring_frequency`, `last_test`, `next_due`, `monitoring_overdue`, `targets`, `side_effects`, `physician`, `rx`, `prescription_ref`.

Der Pipeline-Schritt `145_medications_schema.sql` legt sie in `CREATE TABLE` an und zieht sie fuer bestehende Datenbanken per `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` nach. Dazu kommen Indizes fuer aktive Ueberwachung und `targets`.

### Drei Reste aus G-122

`[cmd]` Cholesterin heisst im Bestand `CHORL`, nicht `CHOL`. Die Pipeline hatte die Legacy-Abbildung bereits: `CHOL -> CHORL`. Der Kettenlauf bestaetigt, dass der Legacy-Key aufgeloest wird.

`[cmd]` Selen wurde nicht gefunden. Wichtig: `SE` ist hier kein Selen, sondern der alte Key fuer `SER`/Serin. In `nutrition.nutrient_defs` stehen 16 Elemente (`NACL`, `NA`, `CLD`, `K`, `CA`, `MG`, `P`, `S`, `FE`, `ZN`, `ID`, `CU`, `MN`, `FD`, `CR`, `MO`), aber kein Selenium/Selen-Code. Das bleibt ein Datenbefund, nicht geraten.

`[read]` Die 28 fehlenden Texte bleiben leer. Es sind 26 einzelne Fettsaeuren plus `OLSAC` und `F18:2C9T11`; das Vorgaengerrepo liefert dafuer keine passenden Erklaerungen. Es wurde nichts erfunden.

### Prolactin, ApoB und `system_groups`

`[cmd]` `medical.lab_markers` existiert nicht. Die reale Katalogtabelle heisst `medical.lab_marker_catalog`.

`[cmd]` Eine Tabelle `system_groups` existiert nicht. `system_groups` ist eine Spalte auf `medical.biomarker_spec_enrichment`.

`[cmd]` Prolactin liegt als Messwert/Katalogcode vor, hat aber keine passende Enrichment-Zeile. ApoB ist ebenfalls kein einfacher Tabellenname-Fall: der Katalog fuehrt `1884-6`, waehrend die Enrichment-Zuordnung mit `1869-7` arbeitet. Das ist eine Identitaets- und Kurationsfrage; es wurde nichts auf einem geratenen Namen gebaut.

`[annahme]` Der Punkt ist nicht derselbe wie C-186. C-186 betrifft fehlende Supplement-Schreibwege fuer Nebenwirkungen und Zyklen; C-187 Punkt 5 betrifft Medical-Biomarker-Gruppierung und Enrichment.

## Was geprueft wurde

- `[cmd]` Kettenlauf auf Wegwerf-Datenbank: 87 Schritte, Exit 0. Log: `backup/c187/kette-c187.log`.
- `[cmd]` Wegwerf-Datenbank `lumeos_c187_check` wurde danach verworfen.
- `[cmd]` `pnpm gate` lief bis zum Web-Testblock, ist aber nicht gruen: 471/472 Web-Tests bestanden; Subtest 85 in `apps/web/src/components/shell/__tests__/v2-attrappen.test.ts` scheitert mit `Bonusdeckel 5.0 fehlt`. Das liegt ausserhalb des beauftragten Bereichs `supabase/_pipeline/`.
- `[cmd]` `testdaten-pruefen.ts` wurde gegen die Wegwerf-Datenbank ausgefuehrt und meldet bestehende Szenario-Luecken aus anderen Modulen. C-187 hat diese nicht umgangen; die Ausgabe liegt in `backup/c187/testdaten-c187.log`.

## Was offen bleibt

- `[cmd]` Selen/Selenium fehlt im Naehrstoffbestand. Ohne Quelle und Code wurde kein Eintrag gebaut.
- `[read]` Die 28 fehlenden Naehrstofftexte bleiben leer, weil das Vorgaengerrepo dafuer keine belastbaren Texte liefert.
- `[cmd]` Prolactin und ApoB muessen ueber die realen Objekte `medical.lab_marker_catalog` und `medical.biomarker_spec_enrichment.system_groups` kuriert werden. Eine Tabelle `medical.lab_markers` oder `system_groups` gibt es nicht.
- `[read]` C-186 bleibt ein eigener Supplements-Punkt; er wurde nicht in C-187 hineingezogen.
