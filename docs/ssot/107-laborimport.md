# C-72 Laborimport

**Stand:** 2026-08-18

## Ergebnis

[read] C-72 baut keine Datei-Erkennung. PDF, OCR und Bildverarbeitung bleiben ausgenommen; gebaut wurde die Zuordnungsschicht fuer bereits extrahierte Zeilen aus Rohname, Wert und Einheit.

[cmd] Neuer Kettenschritt `142_laborimport_matching.sql`: `medical.biomarker_aliases`, `medical.biomarker_marker_candidates(...)` und `medical.import_lab_report_rows(...)`. `lab_result_values` kann jetzt `loinc_code = NULL` tragen, solange `match_status` `ambiguous` oder `unknown` ist und `needs_verification = true` gesetzt ist.

[cmd] Neuer Kettenschritt `143_biomarker_aliases.ts`: `292` Aliaszeilen importiert, davon `286` eindeutige Legacy-Aliaszeilen und `6` bewusst mehrdeutige Zeilen fuer `Glukose`/`glucose`.

[cmd] Live-Schemapruefung nach dem Einspielen: 22/22 Tabellen, 20/20 Funktionen, 24/24 GRANT-Objekte, `medical.biomarker_aliases 292 / 292`, Exit 0.

## Wie weit sich LOINC-Synonyme und die 457 Paare decken

[cmd] `referenz/lumeos-2026/src/modules/medical/data/biomarkerSynonyms.ts` enthaelt textuell 457 Paare. Aktiv sind 454; drei stehen nur in einem Kommentar als entfernte Duplikate.

[cmd] Von den 454 aktiven Paaren sind 286 als eindeutige Aliaszeilen importierbar. Sie zeigen auf 54 LOINC-Ziele im aktuellen 11.676er-Katalog.

[cmd] 128 importierbare Aliase stehen bereits sinngemaess im LOINC-Katalog; 158 kommen durch die Legacy-Kuration zusaetzlich dazu.

[cmd] 152 Paare wurden nicht importiert: 115 ohne LOINC-Ziel im kuratierten Altmaterial, 18 mit Zielcodes ausserhalb des aktuellen LOINC-Zuschnitts, 17 wegen der aktuellen lateinischen Faltung fuer Thai-Text, 2 wegen nackter Glukose-Mehrdeutigkeit ohne Systemkontext.

[read] Die LOINC-Synonyme aus `RELATEDNAMES2` bleiben im Katalog. Die neue Alias-Tabelle ersetzt sie nicht; sie ergaenzt sie mit kuratierten Schreibweisen aus dem Vorgaengerrepo und eigener Herkunft.

## Wie mehrdeutige Treffer behandelt werden

[cmd] `medical.import_lab_report_rows(...)` unterscheidet drei Faelle: `exact`, `ambiguous`, `unknown`.

[cmd] `Hämoglobin` im Testbefund landet als `exact` auf `718-7`, `entry_confidence = 0.98`, `needs_verification = false`. Obwohl der Katalog weitere schwache Treffer wie MCHC oder HbA1c findet, setzt sich der starke kuratierte Top-Treffer durch.

[cmd] `Glukose` landet als `ambiguous`, `loinc_code = NULL`, `needs_verification = true`, `match_candidates = 3`. Die Kandidaten trennen Serum/Plasma, Blut und Urin. Ohne Systemkontext waere eine automatische Wahl falsch.

[read] `SPEC_08_IMPORT_PIPELINE.md` beschreibt Name-Matching als eigenes Problem nach der Texterkennung. `UserMedicalInsight` und `UserHealthReport` werden dafuer nicht benoetigt; die Zuordnung passt in `lab_reports` und `lab_result_values`.

## Was mit unbekannten Markern geschieht

[cmd] `Unbekannter Marker X` im Testbefund wird gespeichert: `raw_marker_name = 'Unbekannter Marker X'`, `loinc_code = NULL`, `match_status = 'unknown'`, `entry_confidence = 0.00`, `needs_verification = true`, `match_candidates = []`.

[read] Das ist absichtlich anders als ein stilles Verwerfen. Ein importierter Befund bleibt vollstaendig sichtbar, auch wenn LumeOS den Marker noch nicht kennt.

## Was die Einheiten angeht

[cmd] Die Befundeinheit wird in `unit_snapshot` eingefroren. Der Import rechnet nichts um.

[cmd] Die Einheit beeinflusst nur die Kandidatenreihenfolge leicht, wenn sie zur Katalogeinheit passt. `mg/dL` gegen `mmol/L` wird nicht automatisch umgerechnet.

[read] GO-00 ist hier die Begrenzung: falsche Bezugs- oder Einheitannahmen erzeugen plausible, aber falsche Prozentwerte. Deshalb bleibt die Umrechnung ein eigener Entscheidungs- und Implementierungsschritt.

## Nachweis

[cmd] Kettenlauf auf Wegwerf-Datenbank `lumeos_c72_laborimport`: 57 Schritte, Abschlusspruefung gruen, `medical.biomarker_aliases = 292`.

[cmd] Testdaten auf Wegwerf-Datenbank: Importbefund mit 3 Zeilen ergibt `exact_count = 1`, `ambiguous_count = 1`, `unknown_count = 1`; `testdaten-pruefen.ts` Exit 0.

[cmd] Cleanup auf Wegwerf-Datenbank: danach `medical.lab_reports = 0`, `medical.lab_result_values = 0`, `foods = 7140`, `food_nutrients = 869501`; `testdaten-pruefen.ts --clean` Exit 0.

[cmd] Live nach Einspielen: `medical.biomarker_catalog = 11676`, `medical.biomarker_reference_ranges = 464`, `medical.biomarker_aliases = 292`.

[cmd] Live-Testdaten: 3 Nutzer, 513 Mahlzeiten, 1561 Positionen, 2 Medical-Befunde, 6 Medical-Messwerte; `testdaten-pruefen.ts` Exit 0.

[cmd] Zeilenschutz live: Tom sieht 2 Befunde und 6 Werte, Max sieht 0 Befunde und 0 Werte. Ein Import mit Max-Claim auf Toms `user_id` bricht mit `medical import: user mismatch` ab.

## Was dieser Schritt nicht tut

[read] Keine Dateiverarbeitung, kein OCR, keine medizinische Bewertung, keine Einheitenumrechnung.

[annahme] Thai-Laborformate brauchen eine eigene Faltung oder eine nicht-lateinische Suchnormalisierung. Die 18 aktiven Thai-Aliase aus dem Vorgaengerrepo bleiben bis dahin dokumentiert; 17 scheitern direkt an der aktuellen lateinischen Faltung.
