# C-69 Medical-Schema

Stand: 2026-08-18.

## Kurzstand

[cmd] Angelegt wurden zwei Kettenschritte:

- `140_medical_schema.sql`: Schema `medical`, vier Tabellen, zwei Funktionen, RLS und GRANTs.
- `141_biomarker_katalog.ts`: Import der acht C-70b-Dateien aus `supabase/_pipeline/daten/biomarker-loinc/` plus der kurierten Referenzbereiche aus `biomarker-katalog.json`.

[cmd] Der Kettenlauf gegen die Wegwerf-Datenbank `lumeos_c69_medical` lief vollständig durch. `schema-vollstaendigkeit-pruefen.ts` meldete dort Exit 0: 22/22 Tabellen, 2/2 Sichten, 20/20 Funktionen, 22/22 RLS-Tabellen, 22/22 Policies, 24/24 GRANT-Objekte.

[cmd] Live eingespielt: `medical.biomarker_catalog` 11.676 Zeilen, `medical.biomarker_reference_ranges` 464 Zeilen, Testdaten 1 Befund mit 3 Messwerten. Nach Neustart ist `medical` über PostgREST erreichbar; `Accept-Profile: medical` auf `biomarker_catalog` liefert Zeilen.

## Gelesene Grundlagen

[read] `docs/specs/Medical/SPEC_06_DATABASE_SCHEMA.md` beschreibt acht Tabellen: Biomarker-Katalog, Referenzbereiche, Laborbefunde, Biomarker-Ergebnisse, Health Metrics, Symptome, Medikamente und Alerts.

[read] `docs/specs/Medical/SPEC_02_ENTITIES.md` beschreibt zehn Entitäten. `UserMedicalInsight` und `UserHealthReport` kommen dort vor, aber nicht in `SPEC_06`.

[read] `docs/ssot/70-spec-audit/Medical.md` bestätigt diesen Widerspruch als härtesten Befund des Moduls.

[read] Das Vorgängerrepo hat in `015_medical.sql` sieben Tabellen mit abweichenden Namen und einem kleineren Zuschnitt. Die API-Pfade `biomarkers.ts` und `labs.ts` waren Material, aber kein übernehmbares Schema.

## Was aus `SPEC_06` nicht übernommen wurde

[cmd] Übernommen wurden nur Katalog und Befunde: `biomarker_catalog`, `biomarker_reference_ranges`, `lab_reports`, `lab_result_values`.

[read] Nicht übernommen wurden `user_health_metrics`, `user_symptoms`, `user_medications` und `medical_alerts`. Sie gehören zu Health-Metrics, Symptomtracking, Medikamenten und Bewertung/Benachrichtigung; der Auftrag war Katalog plus Befund.


**Berichtigt 2026-09-08 (G-383).** `[cmd]` **Der Satz darueber ist
teilweise ueberholt** ? **diese Tabellen EXISTIEREN inzwischen:**

    `medical.user_medications`        25 Spalten, live

`[cmd]` **Gemessen gegen `information_schema`.** `[read]` **Die
uebrigen Namen der Aufzaehlung stimmen weiter** ? **und genau das
war die Tuecke: wer stichprobenartig prueft, trifft einen wahren
Namen und haelt die ganze Zeile fuer belegt.**

[read] `UserMedicalInsight` und `UserHealthReport` wurden nicht gebaut, weil sie in `SPEC_06` keine Tabelle haben. Der Widerspruch bleibt notiert, nicht aufgelöst.

[annahme] Eine `latest`-Materialized-View wurde bewusst nicht übernommen. Für den ersten echten Befund reicht die lesbare Befundfunktion; eine aktuelle Snapshot-Sicht wird sinnvoll, wenn die Oberfläche konkrete Abfrageformen vorgibt.

## Wie der Katalog eingespielt wird

[cmd] `141_biomarker_katalog.ts` liest die Übersichtsdatei und acht Split-Dateien unter `daten/biomarker-loinc/`. Die Summe muss 11.676 ergeben, sonst bricht der Import ab.

[cmd] Der Import in der Wegwerf-Datenbank dauerte laut Skriptausgabe 0,8 s für die eigentliche SQL-Transaktion; der gemessene Prozesslauf dauerte 2,4 s. Live meldete der Schritt 0,7 s Importzeit.

[cmd] Eingespielt wurden 11.676 LOINC-Einträge, davon 8.267 mit UCUM-Einheit und 4.593 mit deutschem Namen. Die 464 kuratierten Referenzbereich-Zeilen bleiben vollständig erhalten: 296 sind direkt an einen LOINC-Code aus der Masterlist gebunden, 168 bleiben als kuratierte Kandidaten ohne `loinc_code`.

[read] Der LOINC-Quellordner selbst bleibt ignoriert. Die Ableitung ist reproduzierbar, wenn `docs/ssot/daten/Loinc_2.82/` vorhanden ist; der Import selbst braucht nur die bereits versionierten Split-Dateien.

## Wo der Referenzbereich herkommt

[read] LOINC identifiziert den Test, liefert aber keinen Labor-Normbereich.

[cmd] `lab_result_values` speichert den labor-eigenen Bereich direkt am Messwert: numerisch, textuell, Einheit und Quelle. Dieser Bereich gewinnt immer vor dem Katalog.

[cmd] Wenn der Befund keinen eigenen Bereich mitliefert, fällt `medical.lab_result_values_read()` auf `medical.biomarker_reference_ranges` zurück. Belegt am Testbefund: Hämoglobin `718-7` liefert `reference_source = 'lab_report'`, Calcium `17861-6` liefert `reference_source = 'catalog_fallback'` mit `8.5–10.5 mg/dL`.

[cmd] Gibt es weder Labor- noch Katalogbereich, liefert die Lesefunktion `reference_source = 'none'`. Es wird keine Bewertung und kein Status erfunden.

## Herkunft und Einfrieren

[cmd] `lab_reports.source` und `lab_result_values.value_source` unterscheiden `manual`, `pdf_upload`, `photo_ocr`, `lab_import` und `seed`.

[cmd] `lab_result_values` friert `marker_name_snapshot`, `unit_snapshot` und `frozen_at` am Befundwert ein. Eine spätere Korrektur am Katalog verschiebt damit alte Befunde nicht.

[cmd] Zeit wird wie bei Mahlzeiten, Check-ins, Workouts und Körpermessungen als lokales Datum plus lokale Uhrzeit geführt: `report_date`, `report_time`, optional `collected_date`, `collected_time`. Keine neue Zeitzonenlogik.

## RLS-Nachweis

[cmd] Als `authenticated` mit Toms JWT-Sub sah die Probe 1 Befund und 3 Messwerte.

[cmd] Als `authenticated` mit Max' JWT-Sub sah dieselbe Probe 0 Befunde und 0 Messwerte.

[cmd] Ein Insert als Max mit Toms `user_id` schlug mit `new row violates row-level security policy for table "lab_reports"` fehl.

[cmd] Katalog und Referenzbereiche sind Stammdaten: `authenticated` hat `SELECT`, `service_role` hat volle Rechte. Befunde und Werte haben eigene-Zeilen-Policies für `SELECT`, `INSERT`, `UPDATE`, `DELETE`.

## Testdaten

[cmd] `testdaten-einspielen.ts` legt live 1 Medical-Befund mit 3 Messwerten an. `testdaten-pruefen.ts` meldete danach: Medical Katalog/Bereiche/Befunde/Werte 11676/464/1/3 und Exit 0.

[cmd] Das Register enthält den Fall `Medical-Laborbefund mit Laborbereich und Katalog-Fallback` am 2026-08-18 für Tom.

[cmd] Das Gegenstück `testdaten-entfernen.ts` räumte in der Wegwerf-Datenbank 1 Befund und 3 Messwerte ab; `testdaten-pruefen.ts --clean` meldete danach Medical Katalog/Bereiche/Befunde/Werte 11676/464/0/0 und Exit 0.

## Was ein Befund noch nicht kann

[read] Kein Import-Pfad: PDF, Fotoerkennung und Laborschnittstelle sind nicht gebaut.

[read] Keine medizinische Bewertung: kein `High`, `Low`, `Optimal`, keine Empfehlung, keine Warnung.

[annahme] Kein Konfliktauflöser für mehrere Laboreinheiten desselben Markers. Der Messwert speichert seine Einheit; eine spätere Anzeige muss entscheiden, ob und wie konvertiert wird.

[annahme] Keine dedizierte Latest-Sicht und keine Trendfunktion. Die Tabellen tragen die Daten, aber die Oberflächenabfrage für Verlauf und letzte Werte ist ein eigener Schritt.

[read] Keine Insights, Reports, Arztkontakte, Medikamente, Symptome oder Alerts. Diese Teile sind in der Spec oder im Vorgängerrepo vorhanden, aber nicht Teil des Zuschnitts.

## Nachweis

[cmd] `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_c69_medical --keep-database` lief vollständig durch; der Kettenlauf hatte 55 Schritte.

[cmd] `PGDATABASE=lumeos_c69_medical pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts` meldete Exit 0 und `SCHEMA VOLLSTAENDIG`.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts` meldete live Exit 0 und `SCHEMA VOLLSTAENDIG`.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/kette-readme-pruefen.ts` meldete `README/Kette: ok (55 Schritte dokumentiert)`.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts` meldete live Exit 0.

[cmd] `pnpm gate` lief grün: 8 erfolgreiche Tasks von 8.
