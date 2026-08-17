# C-68 Supplements-Schema

Stand: 2026-08-17

## Ausgangslage

[cmd] Vor C-68 gab es kein `supplements`-Schema in der lokalen Datenbank. `/v2/supplements` konnte deshalb nur Attrappen anzeigen.

[read] `docs/specs/Supplements/SPEC_06_DATABASE_SCHEMA.md` beschreibt zehn Tabellen: Katalog, erweiterte Substanzen, Interaktionen, Nutzereinstellungen, Stacks, Stack-Items, Intake-Logs, Inventar, Templates und Template-Items. `SPEC_02_ENTITIES.md` beschreibt dazu neun fachliche Entitäten.

[read] Das Vorgängerrepo enthält vier Supplement-Migrationen: `008_supplements.sql`, `009_supplement_enhanced.sql`, `047_coach_planning_system.sql` und `050_supplements_schema_expansion.sql`. Sie verwenden ein anderes Schema und waren deshalb Material, keine direkte Migration.

## Gebaut

[cmd] Neuer Kettenschritt `130`: `supabase/_pipeline/13_supplements/130_supplements_schema.sql`.

[cmd] Neuer Kettenschritt `131`: `supabase/_pipeline/13_supplements/131_supplements_katalog.ts`, gespeist aus `supabase/_pipeline/daten/supplement-katalog.json`.

[cmd] Live stehen im Schema `supplements` fünf Tabellen, eine Sicht und zwei Funktionen:

| Objekt | Zweck |
|---|---|
| `supplement_catalog` | aktiver Standardkatalog |
| `supplement_interactions` | Struktur fuer spaetere Wechselwirkungen, heute unbefuellt |
| `user_stacks` | nutzereigene Supplement-Stacks |
| `stack_items` | Praeparate, Dosierung, Timing und Low-Stock-Daten im Stack |
| `intake_logs` | Einnahmeprotokoll mit eingefrorenem Namen und Dosis |
| `daily_intake_summary` | Tageszaehlung aus Einnahmen |

[cmd] `supabase/config.toml` fuehrt `supplements` in der API-Schemaliste. Nach `supabase stop; supabase start` waren die Datenbankobjekte weiterhin vorhanden: `nutrition.foods` 7.140, `nutrition.food_nutrients` 869.501, `supplements.supplement_catalog` 44 aktive Eintraege.

[cmd] `kette.json` und `supabase/README.md` enthalten die Schritte `130` und `131`. `kette-readme-pruefen.ts` meldet: `README/Kette: ok (52 Schritte dokumentiert)`.

[cmd] `daten/schema-sollstand.json` enthaelt die fuenf Supplement-Tabellen und zwei Funktionen. Die Live-Schemapruefung meldet: `Tabellen 22/22`, `Funktionen 20/20`, `Zeilenschutz 22/22`, `Policies 22/22`, `GRANTs 24/24`, `Fremde Tab. 12/12`, `Fremde Fkt. 11/11`, `SCHEMA VOLLSTAENDIG`.

## Einfrieren

[cmd] `supplements.intake_logs` speichert `supplement_name_snapshot`, `dose_snapshot` und `dose_unit_snapshot`. Wird ein Stack-Item spaeter geaendert, verschiebt das eine alte Einnahme nicht.

[annahme] Das ist dieselbe Entscheidung wie bei `nutrition.meal_items`: die aktuelle Stack-Konfiguration ist die Eingabehilfe, das historische Log ist die Wahrheit des damaligen Eintrags.

[cmd] Zeit wird wie bei Mahlzeiten, Recovery und Training als lokales Datum plus lokale Uhrzeit gespeichert: `intake_date date`, `intake_time time`. Es gibt keinen serverseitigen UTC-Zeitpunkt als fachliche Einnahmezeit.

## Was aus SPEC_06 nicht uebernommen wurde

[read] Nicht uebernommen wurden `enhanced_substances`, `user_supplement_settings`, `user_inventory`, `stack_templates` und `stack_template_items`.

[annahme] Grund: Der Auftrag wollte Katalog und Stack. Enhanced Substances, Inventar und Templates sind Folgeflaechen. Low-Stock ist fuer den sichtbaren Refill-Fall in `stack_items` enthalten, ohne eine vollstaendige Inventarverwaltung zu bauen.

[read] Nicht uebernommen wurden Protokolle, Erinnerungen, Zyklusereignisse, Coach-Planung und die erweiterten Planungsobjekte aus `047_coach_planning_system.sql`.

[annahme] Grund: Sie setzen echte Nutzung, Coach-Kontext oder Zyklusplanung voraus. Fuer eine erste echte Supplements-Datenseite waeren sie Pflegeaufwand ohne messbaren Nutzen.

[read] Die Spec und das Vorgängerrepo fuehren Wechselwirkungen. Gebaut wurde nur die Tabelle `supplement_interactions`, nicht die Bewertung.

[annahme] Grund: Eine Wechselwirkungswarnung ist eine medizinische Aussage. Ohne abgenommene Regeln und Quellen waere eine automatische Bewertung riskanter als eine leere Struktur.

## Was der Injection Planner Change Request aendert

[read] `docs/specs/Supplements/Injection Planner · Spec Change Request.md` ist juenger als die Kernspec und beschreibt einen eigenen Planer mit Injektionsorten, Injektionslogs, abgeleitetem Schedule, Site-Rotation, Validierungen, Physician Overrides und i18n.

[cmd] C-68 hat `injection_logs` und `cycle_plans` nicht angelegt.

[annahme] Der Change Request aendert den spaeteren Zuschnitt fuer den Injektions-Tab deutlich, aber nicht den heutigen Standardkatalog und nicht den Nutzer-Stack. Er gehoert als eigener Punkt gebaut, damit Halbwertszeit, Dosisintervall und Sicherheitsregeln nicht still in einen generischen Supplement-Stack rutschen.

## Was der Katalog hergibt

[cmd] `supplement-katalog.json` enthaelt 44 Standard-Supplements, uebernommen aus `referenz/lumeos-2026/supabase/seed.disabled/seed_supplements.sql` und normalisiert auf die heutige Struktur.

[cmd] Live-Verteilung der 44 aktiven Katalogeintraege: Vitamins 9, Minerals 6, Adaptogens 5, Amino Acids 5, Performance 5, Longevity 4, Recovery 4, Other 3, Gut Health 2, Sleep 1.

[cmd] Das Vorgängerrepo enthaelt zusaetzlich Mini-PC-Importdaten: `supplements_rows.csv` mit 702 Zeilen und `supplement_interactions_rows.csv` mit 28 Zeilen.

[annahme] Die 702 Mini-PC-Zeilen wurden nicht uebernommen, weil Quellen, Felder und medizinische Einordnung nicht im selben Durchgang auditiert wurden. Die 44 Standardeintraege reichen, um Katalog, Stack, Intake-Logs und Refill-Fall messbar zu machen.

## Testdaten

[cmd] `_testdaten/testdaten-einspielen.ts` legt live und in der Wegwerf-Datenbank einen Stack fuer Tom Miller an: `Muskelaufbau Basics`, vier Items und vier Einnahmen am 2026-08-18.

[cmd] Der Testfall enthaelt `creatine-monohydrate`, `vitamin-d3`, `omega-3-epa-dha` und `magnesium`. `vitamin-d3` hat `stock_remaining 4` bei `low_stock_threshold 7`; die Abfrage liefert `refill_urgent = true`.

[cmd] `supplements.daily_intake_summary` liefert fuer Tom am 2026-08-18: `total_logged 4`, `total_taken 3`, `total_planned 1`, `total_skipped 0`, `total_snoozed 0`, `compliance_pct 100.0`.

[cmd] `_testdaten/testdaten-register.json` enthaelt den Fall `Supplement-Stack mit Einnahmen und Nachkauf-Fall`.

## Nachweis

[cmd] Wegwerf-Kettenlauf `lumeos_kette_c68`: 52 Schritte, Abschluss ohne Fehler, `130` meldet `OK: supplements schema mit Katalog, Stack, Items, Logs und Interaktionsstruktur`, `131` meldet `OK: 44 aktive Supplements im Katalog (44 insgesamt)`.

[cmd] Schemapruefung in `lumeos_kette_c68`: `SCHEMA VOLLSTAENDIG`.

[cmd] Testdaten in `lumeos_kette_c68`: `3 Nutzer, 513 Mahlzeiten, 1561 Positionen, 212 Wassereintraege, 9 Trainingssitzungen, 18 Trainingsuebungen, 60 Saetze, 36 Recovery-Check-ins, 3 Ziele, 3 Phasen, 1 Supplement-Stacks, 4 Supplement-Items, 4 Supplement-Einnahmen`.

[cmd] `testdaten-pruefen.ts` in der Wegwerf-Datenbank und live: `OK: C-82 Testdaten stimmen.`

[cmd] RLS-Gegenprobe: Tom sieht `1` Stack, `4` Items und `4` Logs; Sarah sieht `0/0/0`. Ein Insert als Sarah fuer Toms `user_id` scheitert mit `new row violates row-level security policy for table "user_stacks"`.

[cmd] Cleanup in der Wegwerf-Datenbank entfernt `4` Supplement-Einnahmen, `4` Stack-Items und `1` Stack. Danach meldet `testdaten-pruefen.ts --clean`: `Supplements Katalog/Stacks/Items/Logs: 44/0/0/0`, `OK: C-82 Testdaten stimmen.`

[cmd] Live-Einspielung: Schritt `130` und `131` liefen gegen `postgres`, danach `supabase stop; supabase start`.

[cmd] Live-Schemapruefung: `SCHEMA VOLLSTAENDIG`.

[cmd] `pnpm gate`: 8/8 Tasks erfolgreich. Der vorher gemeldete `/v2/goals`-Fehler `fehlendes ./modale` trat nicht mehr auf.

## Was noch fehlt

[cmd] Es gibt keine Oberflaeche und keinen Schreibpfad in `apps/web`; C-68 fasst `apps/web` nicht an.

[cmd] Es gibt keine automatische Wechselwirkungsbewertung und keine medizinische Warnlogik.

[cmd] Es gibt keine Injektionsplanung, keine Cycle-Plans, keine Erinnerungen, keine Protokolle und keine Coach-Planung.

[annahme] Der naechste sinnvolle Datenseiten-Schritt ist entweder ein kleiner Lesepfad fuer Katalog/Stack/Logs oder ein eigener Auftrag fuer den Injection Planner, nicht beides zusammen.
