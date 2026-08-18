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

---

# C-76/C-74/C-79/C-80 Medical-Datenrest

**Stand:** 2026-08-18

## Was die Seed-Befunde enthalten

[cmd] `module-medical-data.jsx` enthaelt 49 Biomarker-Zeilen in `BIOMARKERS`. Die aktuelle Vorlagen-Reportzeile nennt aber `markers: 34`; der Seed folgt dieser Reportzahl, nicht der hoeheren Gesamtliste.

[cmd] Der 34er-Seed nutzt die 34 hoechstpriorisierten Vorlagenmarker mit vorhandenem LOINC-Code im lokalen Katalog. `HOMA-IR` und `Reverse T3` haben keinen LOINC-Code in der Vorlage; `eGFR` nennt dort `33914-3`, dieser Code ist im 11.676er-Katalog nicht enthalten. Gefunden wurden nur formelspezifische Alternativen wie `48642-3` und `62238-1`; sie wurden nicht still als Ersatz gesetzt.

[cmd] Wegwerf-Datenbank `lumeos_c76_medical_seed`: Kettenlauf 61 Schritte, Abschlusspruefung gruen. Danach Testdaten: 5 Medical-Befunde, 140 Medical-Messwerte; `testdaten-pruefen.ts` Exit 0.

[cmd] Live nach Einspielen und Kopie ueber `eigenes-konto-fuellen.sql`: `dev@lumeos.app` und `tom.seed@example.com` tragen je 5 Befunde und 140 Werte, Zeitraum `2026-02-18` bis `2026-08-19`. `test-user@lumeos.local` traegt 0 Befunde und 0 Werte.

[cmd] Ein Verlauf ist belegt: Glukose `1558-6` auf `dev@lumeos.app` steigt ueber die vier Verlaufspanel-Befunde `88 -> 94 -> 99 -> 102 mg/dL`; HbA1c steigt `5,2 -> 5,3 -> 5,4 -> 5,4 %`. Die drei Importzustaende sind auf `dev@lumeos.app` je einmal vorhanden: `exact`, `ambiguous`, `unknown`.

[annahme] Der Verlauf ist ein UI-Testbestand, kein physiologisch mit Ernaehrung, Training oder Gewicht korrespondierendes Modell. Innerhalb der Laborwerte ist er konsistent genug fuer Tabelle, Sparkline und Trenddarstellung.

## Warum die 54 keine Quelle tragen

[cmd] `medical.biomarker_reference_ranges`: 464 Zeilen gesamt, 54 numerisch, 410 nur Text. Alle 54 numerischen Zeilen tragen `source_status = 'unbelegt_vorgaenger_seed'`, `decision_status = 'do_not_import_without_source'`, Quelle `predecessor seed without medical citation`.

[cmd] Kein LOINC-Code hat heute Labor- und Optimalbereich beide numerisch belegt: `0` Codes mit numerischem `lab` und numerischem `optimal`.

[read] Damit ist der Ausschluss richtig. Es fehlt nicht nur ein Herkunftsvermerk an belastbaren Zahlen; die Zahlen stammen aus dem Vorgaenger-Seed ohne medizinische Fundstelle. Sie duerfen weiter nicht als Normbereich in `lab_result_values_read` durchgereicht werden.

## Was aus den 152 wird

[cmd] `biomarker-aliases.json`: 457 Legacy-Textpaare, davon 454 aktiv. Importiert sind 286 eindeutige Aliaspaare plus 6 bewusst mehrdeutige Aliaszeilen. 152 bleiben draussen.

[cmd] Die 152 teilen sich auf: 115 `target_without_loinc_code`, 18 `target_loinc_not_in_masterlist`, 17 `folding_function_latin_only`, 2 `ambiguous_without_system_context`.

[annahme] Das sind drei verschiedene Arbeiten: Die 115 brauchen Kuration gegen konkrete LOINC-Ziele; die 18 zeigen Luecken oder bewusste Schnitte im aktuellen Masterlist-Zuschnitt; die 17 Thai-Faelle brauchen eine nicht-lateinische Normalisierung. Nur die 2 Glukose-Faelle sind echte fachliche Mehrdeutigkeit ohne Systemkontext.

## Was NHANES kosten wuerde

[cmd] Die heutige Struktur von `medical.biomarker_reference_ranges` traegt `sex`, `age_min_years`, `age_max_years`, `population`, `min_value`, `max_value`, `unit`, `source` und `source_path`. Sie kann geschlechts-, alters- und populationsbezogene NHANES-Zeilen aufnehmen, ohne das Schema zu erweitern.

[annahme] Ein NHANES-Import waere kein kleiner Nachtrag: Er braucht Mapping von 38 NHANES-Tests auf LOINC, Entscheidung zur Population/Ethnie-Anzeige, Quellenpfade je Zeile und eine Regel, ob NHANES als Laborbereich, populationsbezogener Referenzbereich oder separater Fallback neben Laborbereichen gilt. Der Aufwand liegt eher bei Kurations- und Entscheidungsarbeit als bei der Tabellenstruktur.

## C-80: Schema-Lesbarkeit

[read] `142_laborimport_matching.sql` erweitert `medical.lab_result_values` bewusst um `raw_marker_name`, `match_status`, `match_candidates` und `match_source`.

[cmd] Kleinster Eingriff: `140_medical_schema.sql` verweist im Kopf jetzt auf Schritt `142`, statt die Spalten nach `140` umzuziehen. Die Trennung bleibt in der Kette erhalten, aber wer das vollstaendige Importschema liest, sieht den Anschluss.
