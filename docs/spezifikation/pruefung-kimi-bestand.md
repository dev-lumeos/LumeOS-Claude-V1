# Pruefung Kimi-Bestand gegen LumeOS

Stand: 2026-08-20

**Auftrag:** nichts importieren, nichts committen, nur messen und melden.

## Was der Bestand enthaelt

`[cmd]` Quelle: `backup/kimi-research/Kimi_Agent/supplement_performance_database`.

| Datei | Zeilen |
|---|---:|
| `data/substances/supplements.jsonl` | 154 |
| `data/substances/peptides.jsonl` | 54 |
| `data/substances/performance_compounds.jsonl` | 29 |
| `data/medications/medication_active_substances.jsonl` | 56 |
| `data/medications/medication_products.jsonl` | 124 |
| `data/platform/warning_rules.jsonl` | 29 |
| `data/platform/interactions_matrix.jsonl` | 24 |
| `data/platform/nutrient_gap_rules.jsonl` | 15 |
| `data/platform/medication_rules.jsonl` | 20 |
| `data/metadata/sources.jsonl` | 157 |
| `data/metadata/conflicts.jsonl` | 9 |

`[cmd]` Der eigentliche Substanzblock fuer Supplemente/Peptide/Performance umfasst 237 Zeilen. Die Medikamentenseite ist getrennt: 56 Wirkstoffe und 124 Produkte.

`[cmd]` `data/indexes/aliases.json` enthaelt 506 Alias-Schluessel. Das weicht von der Auftragszahl 457 ab; gemessen wurde die Datei im Kimi-Bestand.

`[cmd]` `validation_report.md` meldet Status `VALID`, 0 Errors, 0 Warnings. Die dortige Zusammenfassung zaehlt 237 substances, 29 warning_rules, 15 gap_rules, 24 interaction_pairs und 77 lab_analytes.

`[cmd]` Evidenzgrade in den 237 Substanzen:

| Bestand | A | B | C | D | E | F |
|---|---:|---:|---:|---:|---:|---:|
| Supplements | 21 | 56 | 58 | 13 | 3 | 3 |
| Peptides | 12 | 5 | 7 | 13 | 16 | 1 |
| Performance compounds | 1 | 1 | 5 | 3 | 12 | 7 |

`[read]` Gegenueber den bisherigen KI-Specs ist der Bestand strukturell besser belegt: Quellenregister, Konfliktdatei, Validation Report und Evidenzgrade liegen vor. Das ersetzt keine fachliche Abnahme, aber es ist nicht dieselbe Fehlerklasse wie die sieben gemessenen Spec-Fehler aus A-20.

## Feld fuer Feld gegen unser Schema

`[cmd]` Feldvertrag: `data/platform/module_field_spec.json`, Version `crawl_016`.

| Erwartetes Feld | Bei uns vorhanden? | Luecke |
|---|---|---|
| `supplements.stack_item.substance_id` | teilweise | `stack_items` zeigt auf `supplement_catalog.id`; eine substanzstabile ID oder Alias-Aufloesung fehlt. |
| `supplements.stack_item.product_id` | nein | Produkte gibt es im Supplements-Schema nicht. |
| `supplements.stack_item.dose_amount` | ja | Entspricht `stack_items.dose`. |
| `supplements.stack_item.dose_unit` | ja | Entspricht `stack_items.dose_unit`. |
| `supplements.stack_item.doses_per_day` | teilweise | `frequency` ist Text; eine numerische Tagesfrequenz muss abgeleitet oder gespeichert werden. |
| `supplements.stack_item.start_date` | ja | `added_at`, aber als Timestamp statt reines Datum. |
| `supplements.stack_item.active` | ja | `is_active`. |
| `supplements.stack_item.self_declared_enhanced` | nein | Das ist C-113 / Enhanced Mode; im Stack-Item fehlt es. |
| `supplements.computed.daily_totals` | teilweise | Aus Stack-Items berechenbar, aber ohne `substance_id` nicht stabil. |
| `supplements.computed.stimulant_load_mg_caffeine_equiv` | nein | Kein Rechenpfad und keine Aequi-Faktoren. |
| `medical.medications.name` | nein | Medical fuehrt Befunde, keine Medikamente. |
| `medical.medications.drug_class` | nein | Blockiert die meisten Interaktionsregeln. |
| `medical.medications.cyp_profile` | nein | Blockiert CYP-Regeln. |
| `medical.conditions.*` | nein | Die 15 Zustandswerte sind nicht modelliert. |
| `medical.labs.analyte/value/unit/date` | ja | `lab_result_values` plus `lab_reports`; Analyte ist LOINC/Markername. |
| `nutrition.daily.protein_g` | ja | `daily_summary.prot625`. |
| `nutrition.daily.fish_servings_week` | teilweise | Aus `meal_items` nur mit Food-Kuration/Portionslogik ableitbar. |
| `nutrition.daily.dairy_servings_day` | teilweise | Aus Lebensmitteln ableitbar, aber keine fertige Kennzahl. |
| `nutrition.daily.magnesium_dietary_low` | teilweise | `daily_reference_assessment` kann Deckung liefern; die Bool-Regel fehlt. |
| `nutrition.daily.d_vitamin_dietary_low` | teilweise | Wie Magnesium. |
| `nutrition.daily.alcohol` | teilweise | Als Lebensmittel/Meal-Item moeglich, keine Tagesklassifikation. |
| `nutrition.daily.caffeine_mg_day` | teilweise | `recovery.checkins.caffeine_mg` existiert; Nahrung/Supplements werden nicht addiert. |
| `nutrition.diet_type` | teilweise | Preferences/Diet existieren, aber nicht als ein kanonisches Tagesfeld. |
| `nutrition.tracked_since` | ja | Aus erster Mahlzeit ableitbar. |
| `training.resistance_sessions_per_week` | ja | Aus `workout_sessions` ableitbar. |
| `training.endurance_sessions` | nein | Training kennt Sitzungen/Saetze, aber keine Endurance-Struktur. |
| `training.load_spike` | teilweise | ACWR ist fuer Recovery ableitbar; kein eigenes Feld. |
| `training.strength_focus` | ja | Aus Disziplin/Workout-Daten ableitbar. |
| `training.high_impact` | teilweise | Aus Uebungen/Disziplinen nur mit Kuration ableitbar. |
| `profile.age` | ja | Aus `profiles.birth_date`. |
| `profile.sex` | ja | `profiles.biological_sex`. |
| `profile.pregnancy_planned` | teilweise | Schwangerschaftszeitraum existiert, Planungszustand nicht. |
| `profile.high_screen_time` | nein | Kein Profilfeld. |
| `profile.indoor_dominant` | nein | Kein Profilfeld. |
| `profile.athlete_tested_pool` | nein | WADA-Relevanz ist nicht erfasst. |
| `sleep.sleep_latency_min` | nein | Kein Sleep-Schema. |
| `sleep.quality_score` | teilweise | `recovery.checkins.sleep_quality`, aber kein Sleep-Modul. |
| `sleep.tracked_nights` | teilweise | Aus Check-ins ableitbar. |

`[cmd]` Drei vom Auftrag vorab vermutete Luecken bestaetigt: `medical.medications` fehlt, `fish_servings_week` ist nicht direkt ableitbar, `training.load_spike` muss gerechnet werden.

## Wie die drei Substanzbestaende zueinander stehen

`[cmd]` Aktueller LumeOS-Katalog: `supplements.supplement_catalog` hat 44 Zeilen. Davon tragen 11 `nutrients_provided`, 33 nicht. Die belegten Codes sind `CA`, `FE`, `FOL`, `MG`, `PROT625`, `VITB12`, `VITB6`, `VITC`, `VITD`, `VITK`, `ZN`.

`[cmd]` F-05-Katalog: `supabase/_pipeline/daten/substanz-katalog.json` hat 320 Zeilen.

`[cmd]` Kimi gegen 44er-Supplement-Katalog: 16 direkte Treffer ueber Name/Slug/Alias. Beispiele: Kreatin, Beta-Alanin, Citrullin-Malat, Taurin, HMB, Alpha-GPC, Omega-3, CoQ10, Berberin, Resveratrol.

`[cmd]` Kimi gegen 320er-Substanzkatalog: 53 Treffer. Dort treffen nicht nur Standard-Supplemente, sondern auch Peptide und Enhanced-Substanzen wie Tirzepatid, Tesamorelin, Sermorelin, HGH, BPC-157, GHK-Cu, Ostarine, LGD-4033 und RAD-140.

`[cmd]` 44er-Katalog gegen 320er-Katalog: 24 Treffer. Das zeigt: Der 320er-Katalog ist nicht einfach eine Obermenge der 44 Importzeilen; auch dort braucht es eine Alias-/Kurationsbruecke.

`[cmd]` Der Kimi-Bestand liefert fuer alle 237 Substanzen ein `platform`-Objekt (`recommendable`, `warning_only`, `physician_referral`, `athlete_flag`, Module). Er liefert aber nicht direkt unser Feld `nutrients_provided`. Fuer den Gap-Score ist er damit eher Regel- und Substanzquelle, nicht sofortiger Ersatz fuer die 33 fehlenden `nutrients_provided` im 44er-Katalog.

`[read]` Namen zusammenzufuehren ist Kuration, nicht Ersetzung. Die richtige Zielstruktur waere eine substanzstabile ID plus Alias-Tabelle, damit 44er-Katalog, F-05-Katalog und Kimi-Bestand nicht nebeneinanderstehen wie die frueheren Wechselwirkungs- und Referenzbereichsquellen.

## Welche Regeln auswertbar waeren

`[cmd]` `warning_rules.jsonl`: 29 Regeln.

| Status heute | Anzahl | Grund |
|---|---:|---|
| voll auswertbar | 0 | Alle haengen mindestens an einer fehlenden `substance_id`-Bruecke oder an Medical-Feldern. |
| teilweise auswertbar | 18 | Stack, Labs oder Tagesdaten sind vorhanden, aber Substanzauflosung/Rechenfelder fehlen. |
| nicht auswertbar | 11 | 10 brauchen `medical.medications`, 1 braucht `medical.conditions`. |

`[cmd]` `nutrient_gap_rules.jsonl`: 15 Regeln.

| Status heute | Anzahl | Grund |
|---|---:|---|
| voll auswertbar | 1 | `gap_creatine_strength` braucht nur Trainingsfokus. |
| teilweise auswertbar | 10 | Protein pro kg, Fisch-/Dairy-Servings, Vitamin-D-/Magnesium-Low, ACWR oder Diet-Dauer muessen abgeleitet werden. |
| nicht auswertbar | 4 | Blocker: Location/Lifestyle, Sleep-Latency, Joint-Complaints, High-Screen-Time. |

`[cmd]` `medication_rules.jsonl`: 20 Regeln.

| Status heute | Anzahl | Grund |
|---|---:|---|
| voll auswertbar | 0 | Kein Medikamentenmodell. |
| teilweise auswertbar | 0 | Auch Regeln mit Laborbezug brauchen zusaetzlich Medikamente. |
| nicht auswertbar | 20 | `medical.medications` fehlt. |

`[cmd]` `interactions_matrix.jsonl`: 24 Paare. Sie sind als Matrix strukturell interessant, aber ohne substanzstabile IDs im Stack heute nicht produktiv auswertbar.

`[read]` Wichtig fuer einen spaeteren Rule-Runner: fehlende Daten duerfen nicht als Nicht-Treffer verschwinden. Eine Regel mit fehlendem `medical.medications` oder fehlender `athlete_tested_pool`-Angabe braucht einen Status wie `missing_input`, nicht `false`.

## In welchen Stufen ein Import ginge

`[read]` Kein Import in diesem Auftrag. Der folgende Zuschnitt ist nur die gemessene Abhaengigkeitsfolge.

| Stufe | Tabellen/Struktur | Zeilen aus Kimi | Blocker |
|---|---|---:|---|
| 1. Medikamente | `medical.medication_active_substances`, `medical.medication_products`, Nutzer-Medikationsliste mit `drug_class`, `cyp_profile`, Status/Quelle | 56 Wirkstoffe, 124 Produkte | Neues Medical-Schema, RLS, Herkunft, sensible Daten; braucht Security Review. |
| 2. Conditions | Nutzer-Zustandstabelle oder Profil-Erweiterung fuer 15 Conditions | keine Stammdatenzeilen, aber 15 Felder im Vertrag | Datenschutz/Medical-Entscheidung: welche Zustandswerte Nutzer selbst pflegt. |
| 3. Substanzbruecke | Substanz-Master, Alias-Tabelle, Mapping auf `supplement_catalog` und F-05 | 237 Substanzen, 506 Alias-Schluessel | Kuration wegen nur 16/44 direkten Treffern und 53/320 Treffern. |
| 4. Stack-Felder | `substance_id`, `doses_per_day`, `self_declared_enhanced`, ggf. Produktbezug | bestehende Stack-Zeilen migrieren | C-113 Enhanced Mode; keine stillen Defaults. |
| 5. Ableitungen | Daily totals, Stimulanzienlast, Fish/Dairy-Servings, ACWR/load_spike, Sleep-Ableitungen | keine Stammdatenzeilen | Rechenfunktionen mit `missing_input`-Status. |
| 6. Regeln | Warning-, Gap-, Medication-Regeln plus Interaktionsmatrix | 29 + 15 + 20 + 24 | Erst sinnvoll, wenn Eingabefelder und Substanzbruecke stehen. |

`[cmd]` Skalierung: Der Kimi-Probelauf ist klein, aber die Struktur muss tausende Medikamente tragen. Die Groessenordnung ist technisch plausibel: LOINC laeuft mit 11.676 Katalogzeilen. Der Engpass wird nicht das Speichern, sondern Suche/Matching und regelbasierte Auswertung. Bei LOINC lag die Katalogsuche zuletzt im Bereich 130-160 ms; fuer Medikamente braucht es deshalb von Anfang an Indizes auf kanonischen Namen, Alias, ATC/RxNorm/CYP und Wirkstoffklasse.

`[annahme]` Der erste produktive Import sollte Medikamente und Substanzbruecke getrennt halten. Sonst entsteht derselbe Fehler wie bei C-108/C-84: zwei belegte Quellen stehen nebeneinander, aber keine weiss, ob sie dieselbe Sache meint.
