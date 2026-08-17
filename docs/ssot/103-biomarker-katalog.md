# C-70: Biomarker-Katalog

Stand: 2026-08-17

## Ergebnis

[cmd] Datendatei angelegt: `supabase/_pipeline/daten/biomarker-katalog.json`.

[cmd] Die Datei enthaelt 122 Biomarker-Kandidaten. Davon haben 86 einen LOINC-Code, 36 keinen LOINC-Code aus den gelesenen Repo-Quellen, 117 mindestens einen Referenzbereich-Kandidaten und 5 keinen Referenzbereich.

[cmd] Die Datei ist gueltiges JSON: `node -e "JSON.parse(...)"` meldete `json ok`.

[cmd] Die 464 Referenzbereich-Zeilen tragen jeweils einen Quellenstatus: 410 `source_named_in_predecessor_not_line_verified`, 54 `unbelegt_vorgaenger_seed`.

[cmd] Synonyme: 88 Marker haben englische Synonyme, 41 deutsche, 17 thailaendische. Insgesamt kamen die Synonyme aus 457 Paaren auf 90 kanonische Namen.

[cmd] Keine Tabelle, kein Schema, kein Kettenschritt und kein Import wurden gebaut.

## Was die Quellen hergeben

| Quelle | Befund |
|---|---:|
| `docs/specs/Medical/SPEC_05_BIOMARKER_CATALOG.md` | [cmd] 47 maschinell extrahierbare SQL-Zeilen aus dem abgedruckten Ausschnitt |
| Auftrag / Spec-Zaehlung | [read] 74 Marker in acht Panels: CBC 15, Metabolic 12, Lipid 8, Liver 7, Thyroid 6, Hormones 10, Inflammation 6, Vitamins & Minerals 10 |
| `referenz/lumeos-2026/src/modules/medical/data/biomarkerDetails.ts` | [cmd] 90 Detail-Eintraege, 90 Quellen-Freitexte, 85 unterschiedliche Quellen-Freitexte |
| `referenz/lumeos-2026/apps/app/modules/medical/data/biomarkerDetails.ts` | [cmd] 90 Detail-Eintraege; keine breitere 242er-Fassung an diesem Pfad gefunden |
| `referenz/lumeos-2026/src/modules/medical/data/biomarkerSynonyms.ts` | [cmd] 457 Synonympaare auf 90 kanonische Namen, 17-18 Thai-nahe Paare je Zaehllogik |
| `referenz/lumeos-2026/migrations/20240115000015_seed_medical_data.sql` | [cmd] 83 Biomarker-Zeilen, 76 LOINC-Nennungen, 74 eindeutige LOINC-Codes |
| `referenz/lumeos-2026/supabase/migrations/015_medical.sql` | [cmd] Schema fuer 7 Tabellen, aber kein Seed |

[cmd] Die Angabe aus dem Auftrag "242 Eintraege" liess sich in den gefundenen Pfaden nicht reproduzieren. Beide vorhandenen `biomarkerDetails.ts`-Kopien haben 90 Detail-Eintraege.

[cmd] Panel-Verteilung der Datendatei: `blood` 32, `cbc_panel` 5, `enzyme` 3, `hormone` 8, `hormone_panel` 8, `inflammation_panel` 4, `lipid_panel` 5, `liver_panel` 6, `metabolic_panel` 7, `thyroid_panel` 5, `vitamin` 4, `vitamins_panel` 6, ohne Panel 29.

[annahme] Die Panel-Verteilung ist noch nicht fachlich final, weil Spec, Seed und Detaildatei unterschiedliche Panel-/Kategoriebegriffe benutzen. Die Datei haelt diese Herkunft sichtbar, statt sie still zu harmonisieren.

## Stichproben mit externen Quellen

[cmd] Fuenf externe Pruefpunkte wurden in `external_source_checks` in der Datendatei hinterlegt.

| Marker | LOINC | Referenzbereich / Befund |
|---|---|---|
| Hemoglobin | [cmd] LOINC `718-7` | [cmd] Mayo nennt geschlechtsspezifische Erwachsenenbereiche: Maenner 13,2-16,6 g/dL, Frauen 11,6-15,0 g/dL |
| Glucose fasting | [cmd] LOINC `2345-7` | [cmd] Mayo nennt Nüchternblutzucker unter 100 mg/dL als normal; 100-125 Praediabetes, ab 126 Diabetes bei Wiederholung |
| HbA1c | [cmd] LOINC `4548-4` | [cmd] Mayo nennt unter 5,7 % gesund, 5,7-6,4 % Praediabetes, ab 6,5 % Diabetes-Schwelle |
| Total Cholesterol | [cmd] LOINC `2093-3` | [cmd] Mayo nennt Gesamtcholesterin unter 200 mg/dL als wuenschenswert und trennt LDL/HDL/Triglyzeride richtungsabhaengig |
| Vitamin D 25-OH | [cmd] LOINC-Abgleich vorgesehen | [cmd] Mayo Laboratories beschreibt D2, D3 und Gesamt-25-OH-Vitamin-D als getrennt messbare Groessen mit Referenzbereich am Summenwert |

[read] Diese Stichproben ersetzen keine Vollvalidierung. Sie zeigen, dass LOINC-Code, Einheit, Messvariante und Referenzbereich zusammen geprueft werden muessen.

## Wo sie sich widersprechen

[cmd] Hemoglobin: Vorgaenger-Details fuehren Maenner `14.0-17.5 g/dL`, Mayo fuehrt `13.2-16.6 g/dL`; der Seed fuehrt `12.0-16.0 g/dL` ohne Geschlechtertrennung. Das sind drei verschiedene Aussagen.

[cmd] Glucose: Spec nutzt `2345-7` fuer Glucose Serum/Plasma, der alte Seed nutzt fuer `Fasting Glucose` `1558-6`; beide sind plausible, aber nicht derselbe LOINC-Code.

[cmd] Vitamin D: Vorgaenger-Details und Seed fuehren 25-OH-Vitamin-D; externe Quelle betont, dass D2, D3 und Summe getrennte Messgroessen sein koennen. Ein Katalogeintrag muss entscheiden, ob er Summe oder Einzelform meint.

[cmd] LDL: Spec nennt `2089-1`, Seed nennt fuer LDL `18262-6`. Das ist ein direkter LOINC-Konflikt.

[cmd] ApoA1/ApoB: Seed hat `Apolopoprotein A1` mit LOINC `1869-7`, waehrend Spec `1869-7` fuer Apolipoprotein B fuehrt; Seed hat ApoB `1884-6`. Das ist entweder ein Tippfehler im Seed oder ein Mapping-Konflikt und darf nicht importiert werden, ohne LOINC-Abgleich.

[cmd] Homocystein: Seed fuehrt `4633-4`, derselbe Code steht dort auch bei `C-Peptid`. Das ist ein offensichtlicher Konflikt.

[annahme] Die Konflikte sprechen dagegen, die alte Seed-Datei direkt als Wahrheit zu uebernehmen. Sie ist ein Fundus fuer Namen und Kandidaten, nicht der Sollbestand.

## Welche Referenzbereiche zur Entscheidung anstehen

[read] Referenzbereiche sind alters- und geschlechtsabhaengig und unterscheiden sich je Labor. Der Katalog braucht deshalb mindestens Laborbereich und Optimalbereich getrennt.

[cmd] Die Datendatei markiert alle Vorgaenger-Detailbereiche mit `decision_status = needs_tom_decision`. Sie sind Quellenkandidaten, nicht Produktentscheidung.

[cmd] Die 54 numerischen Bereiche aus dem alten Seed stehen auf `source_status = unbelegt_vorgaenger_seed` und `decision_status = do_not_import_without_source`.

[cmd] Besonders entscheidungsbeduerftig sind:

| Bereich | Warum |
|---|---|
| CBC | Geschlechtsspezifische Bereiche schon bei Hämoglobin/RBC/Hämatokrit; Laborquellen weichen ab |
| Glucose/HbA1c | Diagnostische Schwellen sind nicht dasselbe wie "optimal" |
| Lipide | LDL/HDL/Triglyzeride haben richtungsabhaengige Risikokategorien statt einfachen Normalbereichs |
| Vitamin D | D2, D3 und Gesamtwert duerfen nicht verwechselt werden |
| Hormone | Stark geschlechts-, alters-, zyklus- und tageszeitabhaengig |
| Tumormarker | Referenzbereich ist nicht Screeningempfehlung; Bewertung waere medizinisch heikel |

[annahme] Fuer C-69 sollte das Schema deshalb mehrere Range-Typen koennen: `lab`, `optimal`, `critical`, dazu Alter, biologisches Geschlecht, Population, Quelle, Fundstelle und Labor-/Methodenhinweis.

## Was noch fehlt

[cmd] 36 Kandidaten haben keinen LOINC-Code aus den gelesenen Repo-Quellen.

[cmd] 5 Kandidaten haben keinen Referenzbereich in der Datendatei: `ft`, `tt`, `bsg_esr`, `mg_rbc`, `albumin_liver`. Das sind vor allem Alias-/Namensvarianten, die nach der Katalogentscheidung vermutlich mit Hauptmarkern zusammenfallen.

[cmd] Die Spec behauptet 74 Marker, der maschinell extrahierbare Ausschnitt liefert 47 SQL-Zeilen. Die fehlenden Spec-Marker muessen entweder in anderem Format im Dokument stehen oder in der Spec-Zaehlung aus nicht abgedruckten Teilen stammen.

[cmd] LOINC wurde nur aus vorhandenen Repo-Quellen plus fuenf Web-Stichproben geprueft. Ein vollstaendiger LOINC-Abgleich fuer alle 122 Kandidaten steht aus.

[cmd] Referenzbereiche wurden nicht vollstaendig extern validiert. Genau deshalb bleiben sie in der Datei als Kandidaten mit Quellenstatus stehen.

[read] Ein Bewertungssystem wurde nicht gebaut. Der Katalog sagt spaeter, was gemessen wurde und welche Bereiche gelten; er sagt nicht, ob ein Nutzer etwas tun soll.

## Validierung

[cmd] `node -e "JSON.parse(require('fs').readFileSync('supabase/_pipeline/daten/biomarker-katalog.json','utf8')); console.log('json ok')"`: Exit 0, `json ok`.

[cmd] `pnpm gate`: Exit 0; 8/8 Tasks erfolgreich, keine Fehler.
