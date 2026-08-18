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

## C-70 neu: Masterlist aus LOINC

Stand: 2026-08-18

[cmd] Datendatei angelegt: `supabase/_pipeline/daten/biomarker-loinc-masterlist.json`.

[cmd] Die bisherige Datei `supabase/_pipeline/daten/biomarker-katalog.json` bleibt unveraendert. Sie ist die angereicherte 122er-Teilmenge mit Referenzbereich-Kandidaten; die neue LOINC-Datei ist die breite Import-Masterlist.

[cmd] LOINC 2.82 liegt lokal unter `docs/ssot/daten/Loinc_2.82/`, inklusive `LoincLicense_5.8.txt`.

[cmd] `LoincTable/Loinc.csv`: 109.325 Codes insgesamt, 97.314 aktiv. Nach `CLASSTYPE`: 60.009 Labor, 24.999 Klinisch, 503 Anhang, 11.803 Umfrage.

[cmd] `COMMON_TEST_RANK` ist bei 19.644 aktiven Codes belegt.

[cmd] Linguistic Variants: `deDE15LinguisticVariant.csv` und `deAT24LinguisticVariant.csv` vorhanden; keine thailaendische Sprachvariantendatei gefunden.

## Wie der Zuschnitt zustande kam

[cmd] Gemessene Alternativen, jeweils aktiv, `CLASSTYPE` 1 oder 2, mit `COMMON_TEST_RANK`:

| Zuschnitt | Zeilen | Labor | Klinisch | UCUM-Einheit | Definition |
|---|---:|---:|---:|---:|---:|
| Rank <= 2.000 | 1.964 | 1.834 | 130 | 1.144 | 233 |
| Rank <= 5.000 | 4.911 | 4.595 | 316 | 2.776 | 523 |
| Rank <= 10.000 | 9.834 | 9.134 | 700 | 5.492 | 921 |
| Alle gerankten CLASSTYPE 1/2 | 19.582 | 18.543 | 1.039 | 11.344 | 1.482 |
| Alle gerankten CLASSTYPE 1/2 nach Domaenenausschluss | 11.676 | 11.232 | 444 | 8.267 | 823 |

[cmd] Gewaehlter Zuschnitt: aktive LOINC-Codes mit `CLASSTYPE` 1 oder 2 und belegtem `COMMON_TEST_RANK`; kein Top-2000-Cap.

[cmd] Ausgeschlossen wurden Klassen-Segmente fuer Radiologie/Imaging, Mikrobiologie-Einzelkeime, Antibiotika-Suszeptibilitaet, Allergietests, Frageboegen, Dokumenten-Ontologie, Genetik/Molekularpathologie, HLA, Pathologie/Zytologie, Admin-/Geraete-/Order-Klassen, Public-Health- und andere Nicht-Messwert-Domaenen.

[cmd] Therapeutic Drug/Toxicology (`DRUG/TOX`, 2.903 Zeilen) bleibt enthalten. Begruendung: reale Analyseberichte koennen Medikamentenspiegel oder Toxikologie enthalten; die spaetere Healthcheck-Anzeige kann enger filtern, der Importkatalog sollte diese Werte nicht verlieren.

[cmd] Ergebnisdatei: 11.676 Eintraege. Davon 11.232 Labor, 444 klinisch; 8.267 mit UCUM-Beispieleinheit, 823 mit Definition, 11.268 mit Consumer Name, 4.593 mit deutschem LOINC-Namen, 4.137 mit Panelzuordnung.

[cmd] Groesste Klassen im Zuschnitt: `CHEM` 3.717, `DRUG/TOX` 2.903, `HEM/BC` 985, `SERO` 897, `CHAL` 695, `COAG` 467, `CELLMARK` 349, `UA` 338.

[cmd] Fuenf Stichproben sind enthalten:

| Art | LOINC | Name | Einheit | Deutscher Name |
|---|---|---|---|---|
| Blutwert | `718-7` | Hemoglobin [Mass/volume] in Blood | g/dL | Haemoglobin [Masse/Volumen] in Blut |
| Urinwert | `5804-0` | Protein [Mass/volume] in Urine by Test strip | mg/dL | Protein [Masse/Volumen] in Urin mittels Teststreifen |
| Vitalzeichen | `8867-4` | Heart rate | {beats}/min;{counts}/min | Herzfrequenz |
| Tumormarker | `2039-6` | Carcinoembryonic Ag [Mass/volume] in Serum or Plasma | ng/mL | Carcinoembryonales Antigen [Masse/Volumen] in Serum oder Plasma |
| Stuhlwert | `38445-3` | Calprotectin [Mass/mass] in Stool | ug/g | Calprotectin [Masse/Masse] in Stuhl |

[annahme] Der Zuschnitt ist fuer Import robuster als fuer Anzeige. Die Anzeige filtert spaeter nach gelieferten Werten, Panel und Produktentscheidung; der Katalog darf deshalb breiter sein als eine sichtbare Healthcheck-Liste.

## Was LOINC liefert und was nicht

[cmd] LOINC liefert fuer jeden Eintrag den Code, Status, Komponentenname, Langname, Kurzname, Display Name, Klasse, `CLASSTYPE`, Ranking, System, Property, Scale, Time Aspect, Methode, Beispiel-Einheiten, Related Names und teilweise Definitionen.

[cmd] Der Consumer Name steht in `Loinc.csv` im Zuschnitt nicht sinnvoll belegt, aber `AccessoryFiles/ConsumerName/ConsumerName.csv` liefert fuer 11.268 der 11.676 gewaehlten Eintraege einen Consumer Name.

[cmd] Deutsche Namen kommen aus `deDE15LinguisticVariant.csv`; 4.593 der 11.676 gewaehlten Eintraege haben dort mindestens Komponente, Langname oder Display Name.

[cmd] Panelzuordnungen kommen aus `AccessoryFiles/PanelsAndForms/PanelsAndForms.csv`; 4.137 der 11.676 gewaehlten Eintraege haben mindestens eine Panelbeziehung.

[cmd] LOINC liefert keine Normbereiche. Jeder Eintrag in der neuen Datei hat deshalb `reference_ranges.status = not_in_loinc`.

[cmd] Vier gewaehlte Eintraege tragen `EXTERNAL_COPYRIGHT_NOTICE` direkt oder ueber die Paneldaten: Braden Scale, FLACC-Schmerzskala und EarlyCDT-Lung-Cancer-Antibody-Interpretation. Diese duerfen nicht blind in eine eigene UI-/Katalogbeschreibung umformuliert werden.

[read] Ein Wert ohne Normbereich ist trotzdem ein bekannter Test. Er kann importiert und angezeigt werden, aber nicht bewertet werden. Das entspricht der `NO_REFERENCE`-Logik bei den Naehrstoffen.

## Was die Lizenz bedeutet

[read] Die LOINC-Lizenz erlaubt Nutzung, Kopie und Verteilung ohne Lizenzgebuehren fuer kommerzielle und nicht-kommerzielle Zwecke, aber nicht zur Entwicklung eines konkurrierenden Identifikationsstandards.

[read] Feldnamen und Feldinhalte der LOINC-Artefakte duerfen nicht veraendert werden. Lokale Zusatzfelder duerfen angehaengt werden.

[read] Bei Einbindung von LOINC-Inhalten muss der LOINC-Hinweis mitgefuehrt werden. Die neue Datendatei fuehrt deshalb `license_notice_required` top-level mit.

[read] Extrahierte LOINC-Information muss mit dem passenden LOINC-Identifier und einem LOINC-Anzeigenamen verbunden bleiben. Die Datei fuehrt deshalb `loinc_code` plus LOINC-Namen je Eintrag.

[read] LOINC-Sprachuebersetzungen sind eigene Lizenzthemen. Wir nutzen nur die mitgelieferte deutsche Sprachvariante; eine thailaendische Variante liegt lokal nicht vor.

[annahme] Fuer C-69 sollte die spaetere Tabelle mindestens LOINC-Version, Lizenzhinweis und einen Marker fuer externe Copyright-Hinweise fuehren. Sonst ist nicht erkennbar, welche Eintraege besondere Rechte tragen.

## Wie Normbereiche spaeter andocken

[cmd] Die Masterlist selbst enthaelt keine Normbereiche. Sie unterscheidet bewusst zwischen "Test bekannt" und "Normbereich bekannt".

[cmd] Die vorhandene 122er-Datei enthaelt 464 Referenzbereich-Kandidaten mit Quellenstatus und bleibt als erste Andockquelle erhalten.

[read] NHANES-Referenzintervalle und Laborhandbuecher gehoeren in einen eigenen Schritt, weil sie Alters-, Geschlechts-, Ethnie-, Methoden- und Laborabhaengigkeiten tragen.

[annahme] C-69 sollte Normbereiche als eigene Kindstruktur modellieren: `loinc_code`, Range-Typ (`lab`, `optimal`, `critical`), Geschlecht, Alter, Population/Ethnie, Methode/Labor, Einheit, Unter-/Obergrenze, Quelle, Fundstelle, Quellenstatus.

[annahme] Ein LOINC-Eintrag ohne Range bleibt importierbar und sichtbar. Die Bewertung muss dann explizit `no_reference_range` liefern, statt eine Null oder ein Normalurteil zu erfinden.

## Validierung

[cmd] `node -e "JSON.parse(require('fs').readFileSync('supabase/_pipeline/daten/biomarker-katalog.json','utf8')); console.log('json ok')"`: Exit 0, `json ok`.

[cmd] `node -e "JSON.parse(require('fs').readFileSync('supabase/_pipeline/daten/biomarker-loinc-masterlist.json','utf8')); console.log('json ok')"`: Exit 0, `json ok`.

[cmd] `pnpm gate`: Exit 0; 8/8 Tasks erfolgreich, keine Fehler.
