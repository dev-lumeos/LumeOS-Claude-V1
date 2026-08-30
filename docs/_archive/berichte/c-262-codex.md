# C-262 Codex-Bericht

Stand: 2026-08-24, live eingespielt. Nicht committet, nicht gestaged.

## Welle 1 - Pharmakologie

Eingespielt aus Kimi `data/evidence/*` in zeilenfoermige Tabellen, nicht als 20 Spalten:

| Tabelle | Zeilen |
|---|---:|
| `supplements.entity_cyp` | 3.001 |
| `supplements.entity_transporters` | 4.617 |
| `supplements.entity_pk` | 1.937 |
| `supplements.entity_renal_hepatic` | 7.872 |

`not_relevant` wird nicht weggelassen, sondern als `status = 'nicht_zutreffend'` gespeichert. Die Kimi-IDs werden bei Supplements ueber `supplements.supplements.slug` verknuepft, nicht ueber UUID `id`.

FK-Abdeckung nach Live-Lauf:

| Tabelle | Zeilen | mit `supplement_id` |
|---|---:|---:|
| `entity_cyp` | 3.001 | 1.111 |
| `entity_transporters` | 4.617 | 135 |
| `entity_pk` | 1.937 | 0 |
| `entity_renal_hepatic` | 7.872 | 0 |

Befund: `supplement_dosing` und `supplement_evidence` wurden in Wave 1 nicht aktualisiert (`UPDATE 0`), weil diese Enrichment-Dateien in der aktuellen Quelle nicht auf die bestehenden Supplement-IDs mappen. WADA/Thailand aus den Wave-1-Dateien ergaben ebenfalls `INSERT 0` in die vorhandenen Supplement-Regulatory-Tabellen; die Dateien enthalten ueberwiegend medication/product-Kontext.

## Welle 2 - Biomarker und Symptome

Eingespielt:

| Tabelle | Zeilen |
|---|---:|
| `medical.biomarker_explanations` | 66 |
| `medical.symptoms` | 34 |
| `medical.symptom_biomarker_map` | 102 |

LOINC-Abgleich:

| Status | Zeilen |
|---|---:|
| `matched` | 64 |
| `no_candidate` | 2 |

Kantenstatus:

| Status | Zeilen |
|---|---:|
| `edge_marker.matched` | 100 |
| `edge_marker.marker_not_in_explanations` | 2 |
| `edge_symptom.matched` | 53 |
| `edge_symptom.symptom_not_in_catalog` | 49 |

Befund: Die Quelle enthaelt 102 Kanten, aber 49 davon verweisen auf Symptom-IDs ausserhalb des 34er-Symptomkatalogs. Diese Kanten werden gespeichert und mit Match-Status markiert, nicht verworfen. Zwei Kanten verweisen auf Marker ohne Erklaerungszeile (`lab_bnp`, `lab_crp`).

## Welle 3 - Namensbruecke

`data/admin/_canonical_id_lookup.json` enthaelt 1.131 Namen, davon:

| Zieltyp | Zeilen |
|---|---:|
| `sub_*` | 633 |
| `drug_*` | 498 |

Live-Ergebnis:

| Messung | Zeilen |
|---|---:|
| neue `supplement_aliases` aus `kimi:_canonical_id_lookup` | 350 |
| `f05_substance_candidate` mit gesetztem `parent_id` | 0 |
| `supplements.im_katalog = true` | 318 |
| `supplements.im_katalog = false` | 248 |

Befund: Der Auftragstext sagt "1.131 Namen auf `sub_`-IDs"; die Datei enthaelt aber 498 `drug_*`-Ziele. Diese wurden nicht in Supplement-Aliase gezwungen. Die 248 verborgenen F05-Zeilen liessen sich ueber den vorhandenen Lookup nicht deterministisch per exaktem Namen aufloesen. Ich habe keine Handelsnamen manuell zu Wirkstoffen entschieden.

Die 29 Unterformen sind wieder sichtbar, weil `im_katalog` nicht mehr an `parent_id` haengt, sondern nur an Beschreibung oder Evidenzgrad.

## Welle 4 - Medikamente und Regeln

Eingespielt:

| Tabelle | Zeilen |
|---|---:|
| `medical.medication_active_substances` | 498 |
| `medical.medication_formulations` | 453 |
| `medical.medication_products` | 448 |
| `supplements.rule_catalog` mit `source = 'kimi:medication_rules'` | 20 |

Der Import uebernimmt Kimis Schema nicht direkt: Medikamente gehen in die bestehenden Medical-Tabellen, Regeln in `supplements.rule_catalog`. `rule_type` wird auf den bestehenden Enum-Wert `medication` gemappt; Kimis Typ wie `interaction` bleibt im `raw`.

Wichtig: `drug_class` wird aus Kimis Klassen plus `rule_trait_mapping.json` plus den tatsaechlichen CYP-Feldern gebildet. CYP-Traits werden nicht aus Klassennamen geraten. Warfarin steht danach mit:

`drug_class = {anticoagulant:warfarin, anticoagulant_vka, CYP2C9_substrate}`  
`cyp_profile = {CYP2C9_substrate}`

Seed-Snapshots mit `measurement_source = 'seed'` wurden nach dem Wirkstoffimport auf die aktuelle Katalogreihenfolge von `drug_class`/`cyp_profile` nachgezogen (`UPDATE 2`), damit `testdaten-pruefen.ts` nicht an Array-Reihenfolge scheitert.

## Gegenproben

Fuenf Entitaeten:

| Name | Befund |
|---|---|
| Digoxin | `drug_d447fc3e7e`, Medication; 6 CYP-, 9 Transporter-, 18 Renal/Hepatic-Zeilen |
| Metformin | `drug_bc3687cdc2`, Medication; 6 CYP-, 9 Transporter-Zeilen |
| Kreatin | mehrere Supplement-Formen, z. B. `sub_9f9bb8c160`; je 6 CYP-Zeilen |
| Biotin | `sub_f335fda43d`; 6 CYP-, 9 Transporter-Zeilen |
| Semaglutid | Medication `drug_8f0587d87f` und Peptid `sub_8f0587d87f`; Medication mit 6 CYP-, 9 Transporter-Zeilen |

Kimi-Referenzengine:

- `tools/validate_dataset.py`: `status=valid errors=0 warnings=0`.
- `tools/rule_engine.py` mit Probeprofil aus Digoxin, Metformin, Kreatin, Biotin, Semaglutid: feuert `wr_drug_digoxin_tdm` und `wr_drug_metformin_b12`.
- Per-`rule_id`-Diff zwischen `data/platform/medication_rules.jsonl` und importiertem `rule_catalog.raw`: `diff_count = 0`.

## Live-Kontrollzahlen

Aus der alten 19er-Kontrollliste:

| Tabelle | Live |
|---|---:|
| `nutrition.meal_items` | 9.051 |
| `nutrition.meals` | 2.895 |
| `supplements.substance_aliases` | 1.541 |
| `nutrition.water_logs` | 1.263 |
| `supplements.intake_logs` | 744 |
| `medical.medication_active_substances` | 498 |
| `medical.medication_formulations` | 453 |
| `medical.medication_products` | 448 |
| `goals.body_measurements` | 362 |
| `recovery.checkins` | 370 |
| `recovery.scores` | 370 |
| `medical.lab_result_values` | 280 |
| `training.workout_sets` | 238 |
| `recovery.modality_log` | 178 |
| `nutrition.nutrient_defs` | 138 |
| `nutrition.foods` | 7.140 |

Befund zur Kontrollliste: `supplements.substance_catalog_sources`, `supplements.substance_catalog` und `supplements.substance_lab_effects` existieren live nicht mehr. Das ist der Stand nach dem Supplements-Neuaufbau/Altbestand-Abbau, nicht C-262.

## Pruefungen

Gruen:

- `pnpm gate`
- `npx tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`: `SCHEMA VOLLSTAENDIG`, `Medical LOINC-Slug-Eindeutigkeit 0 Abweichungen`
- `npx tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts`: `OK: C-82 Testdaten stimmen.`

Headless-Schuesse:

| Pfad | Ergebnis |
|---|---|
| `/v2/supplements` | gerendert, 1 Attrappe, 1 Konsolenwarnung |
| `/v2/medical` | gerendert, 5 Attrappen, 1 Konsolenwarnung |

Die Konsolenwarnung ist in beiden Faellen dieselbe React-Warnung: `Extra attributes from the server: data-mode` am `html`-Element. Damit ist der Schuss nicht "ohne Konsolenfehler"; es ist aber kein Datenbank-/Importfehler aus C-262.

Kettenlauf:

- Die C-262-Schritte laufen im Wegwerf-Kettenlauf nach Korrektur der Reihenfolge bis durch.
- Der volle Kettenlauf scheitert danach im abschliessenden Schema-Waechter an nicht-C-262-Medical-Luecken im frischen Wegwerfstand:
  - `medical.biomarker_reference_ranges` 464 statt erwartet 560
  - `medical.biomarker_spec_enrichment` fehlt
  - `medical.biomarker_aliases` fehlt
  - `medical.biomarker_marker_candidates` fehlt
  - `medical.import_lab_report_rows` fehlt
  - 3 LOINC-Codes mit mehreren `curated_slug`

Live ist diese Schemapruefung gruen. Der Unterschied zeigt: die laufende Instanz hat C-248/C-84/C-140/C-191-Stand, der frische Kettenlauf baut diese Medical-Schritte nicht vollstaendig nach.

## Sicherungen

Nach jeder Live-Welle wurden Dumps unter `backup/c262/` erzeugt. Letzte erfolgreiche Dumps je Welle:

| Welle | Backup danach |
|---|---|
| 1 | `backup/c262/20260824_145858_wave1_after.dump` |
| 2 | `backup/c262/20260824_145906_wave2_after.dump` |
| 3 | `backup/c262/20260824_151917_wave3_after.dump` |
| 4 | `backup/c262/20260824_150936_wave4_after.dump` |

