# C-248 + C-240 Codex-Bericht

Stand: 2026-08-23

## Erwartung vor dem Lauf

- `medical.biomarker_reference_ranges`: C-248 sollte den falschen ApoB-Block auf `1869-7` klaeren und danach keinen nicht-leeren `loinc_code` mit mehreren `curated_slug` mehr zulassen.
- `supplements.supplement_evidence`: C-240 sollte klaeren, warum nur 259 statt der erwarteten 290 Kimi-Zeilen einen `overall_grade` tragen.
- Live-Eingriff nur nach Vollsicherung.

## C-248: ApoB/ApoA1 und weitere LOINC-Dubletten

Vorher gemessen:

- `medical.biomarker_reference_ranges`: 566 Zeilen.
- Nicht-leere LOINC-Codes mit mehreren `curated_slug`: 13.
- `1869-7` trug zwei verschiedene Marker:
  - `apob`: 6 Zeilen, alle ohne `min_value`, `max_value`, `unit`, Status `source_named_in_predecessor_not_line_verified` / `needs_tom_decision`.
  - `apolipoprotein_a1`: 2 Zeilen, numerisch, Status `do_not_import_without_source`.
- ApoB liegt korrekt auf `1884-6` mit 2 Spec-Zeilen.

Entscheidung:

- Die 6 ApoB-Zeilen auf `1869-7` wurden entfernt. Sie waren fachlich falsch und leer.
- Die weiteren 12 LOINC-Dubletten waren keine zweiten Messwerte, sondern Slug-Varianten aus Spec/Katalog. Dort wurden nur `curated_slug` und `canonical_name_en` vereinheitlicht; Werte, Quellen und Status blieben erhalten.
- Leere `loinc_code`-Gruppen werden vom Waechter ausgeschlossen. Sie sind keine LOINC-Identitaet.

Nachher:

- `medical.biomarker_reference_ranges`: 560 Zeilen.
- Nicht-leere LOINC-Codes mit mehreren `curated_slug`: 0.
- Schemapruefung enthaelt jetzt den Waechter `Medical LOINC-Slug-Eindeutigkeit`.

## C-240: Evidenzgrad 259 statt 290

Messung der Quelle:

- Kimi-Supplements: 154/154 mit `evidence.overall_grade`.
- Kimi-Performance: 75/75 mit `evidence.overall_grade`.
- Kimi-Peptides: 61/61 mit `evidence.overall_grade`.
- Summe Quelle: 290/290.

Messung in der Datenbank vorher:

- `supplements.supplement_evidence`: 566 Zeilen, 259 mit `overall_grade`.
- `supplements.supplements`: 259 mit `evidence_grade`.
- Die 31 fehlenden Zeilen hatten in Quelle und `substance_catalog.evidence` alle Grad `E`.

Ursache:

- Der Import liess `E` nicht als Evidenzgrad zu. Das war ein Importfehler, keine fehlende Kimi-Quelle.

Geaendert:

- Checks fuer `supplements.evidence_grade` und `supplement_evidence.overall_grade` erlauben jetzt `S,A,B,C,D,E,F`.
- Befuellschritt 137 hebt Grad `E` mit.
- Schritt 137 prueft jetzt, dass `supplement_evidence.overall_grade` genau 290 Zeilen traegt.
- `docs/specs/Supplements/SCHEMA_NEUAUFBAU.md` ist korrigiert: 290 ist die Zahl in der Quelle; vor C-248 importiert waren nur 259, weil Grad `E` abgewiesen wurde.

Die 31 nachgezogenen Zeilen:

- Peptides: BPC-157, Cortagen, Dihexa, Epitalon, Humanin, IGF-1 DES, IGF-1 LR3, KPV, LL-37, MGF, PEG-MGF, Pinealon, TB-500, Thymalin, Vesugen, Vilon.
- Performance: AC-262356, ACP-105, Andarine (S4), BAM15, Cardarine, Fladrafinil, Flmodafinil, LGD-3303, RAD-140, S-23, Stenabolic, YK-11.
- Supplements: Ca-AKG, Horny goat weed, Muira puama.

Nachher:

- `supplements.supplement_evidence`: 290 mit `overall_grade`.
- `supplements.supplements`: 290 mit `evidence_grade`.

## Nachweise

Wegwerf-Datenbank:

- Voller Kettenlauf: `KETTE OK: 172.8s`.
- `medical.biomarker_reference_ranges`: 560.
- Nicht-leere LOINC-Dubletten: 0.
- `supplement_evidence_graded`: 290.
- `supplements_evidence_grade`: 290.

Live:

- Vollsicherung vorher:
  - `backup/vollsicherung/20260823_165204_c248_vor_live_lumeos_voll.dump`
  - `backup/vollsicherung/20260823_165204_c248_vor_live_lumeos_voll.sql`
- Minimaler Delta live:
  - 31 Evidenzgrade in `supplements.supplements` gehoben.
  - 31 Evidenzgrade in `supplement_evidence` gehoben.
  - 6 falsche ApoB-Zeilen auf `1869-7` entfernt.
  - 98 Slug-Zeilen normalisiert.
- Live nachher:
  - `ranges_total|560`
  - `multi_slug_loinc|0`
  - `supplement_evidence_graded|290`
  - `supplements_evidence_grade|290`

Pruefungen:

- `schema-vollstaendigkeit-pruefen.ts`: `SCHEMA VOLLSTAENDIG`.
- `testdaten-pruefen.ts`: `OK: C-82 Testdaten stimmen.`
- Negativprobe LOINC-Slug: absichtliche zweite Slug-Zeile fuer `1884-6` wurde rot.
- Negativprobe Evidenzgrad: absichtlich falsche Erwartung 291 wurde rot.

19 Live-Kontrollzahlen nach dem Eingriff:

| Tabelle | Zeilen |
|---|---:|
| nutrition.meal_items | 9051 |
| nutrition.meals | 2895 |
| supplements.substance_aliases | 1541 |
| nutrition.water_logs | 1263 |
| supplements.intake_logs | 744 |
| supplements.substance_catalog_sources | 668 |
| supplements.substance_catalog | 566 |
| medical.medication_active_substances | 498 |
| medical.medication_formulations | 453 |
| medical.medication_products | 448 |
| goals.body_measurements | 362 |
| recovery.checkins | 370 |
| recovery.scores | 370 |
| medical.lab_result_values | 280 |
| supplements.substance_lab_effects | 222 |
| training.workout_sets | 238 |
| recovery.modality_log | 178 |
| nutrition.nutrient_defs | 138 |
| nutrition.foods | 7140 |

## Dateien

- Pipeline:
  - `supabase/_pipeline/14_medical/144_biomarker_spec_enrichment.ts`
  - `supabase/_pipeline/13_supplements/136_supplements_neuaufbau.sql`
  - `supabase/_pipeline/13_supplements/137_supplements_neuaufbau_befuellen.sql`
  - `supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`
  - `supabase/_pipeline/_validierung/testdaten-pruefen.ts`
  - `supabase/_pipeline/daten/schema-sollstand.json`
- Spec-Korrektur:
  - `docs/specs/Supplements/SCHEMA_NEUAUFBAU.md`
- Nachweise:
  - `backup/c248/`

Nicht gestaged, nicht committet, nicht gepusht.
