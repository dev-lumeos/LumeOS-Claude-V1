# C-272 Codex Bericht

Stand: 2026-08-25

## Kette und Live-Weg

- Kettenschritt angelegt: `supabase/_pipeline/13_supplements/141d_kimi_wada_scope.ts`
- Verdrahtung: `supabase/_pipeline/kette.json`, hinter `141c`, vor `141e`
- Wegwerf-Datenbank: `lumeos_c272_probe`
- Voller Kettenlauf: `SCHEMA VOLLSTAENDIG`, `KETTE OK: 248.4s`
- Live-Sicherung vor Einspielung:
  - `backup/vollsicherung/20260825_202124_c272_before.dump`
  - `backup/vollsicherung/20260825_202124_c272_before.sql`
- Live-Einspielung: nur Schritt `141d_kimi_wada_scope.ts`, danach `COMMIT`
- Live-Schemapruefung: `SCHEMA VOLLSTAENDIG`
- Live-Testdaten: `OK: C-82 Testdaten stimmen.`

Nachweise:

- `backup/c276/c272-kette.out`
- `backup/c276/c272-live-apply.out`
- `backup/c276/c272-final-counts-probe.txt`
- `backup/c276/c272-final-counts-live.txt`
- `backup/c276/c272-schema-live.out`
- `backup/c276/c272-testdaten-live.out`
- `backup/c276/c272-control-counts-live.txt`
- `backup/c276/c272-negativprobe.out`
- `backup/c276/c272-kennungen-live.out`

## Importierte Bloecke

Live nach C-272:

| Bereich | Zahl |
|---|---:|
| `supplements.supplement_wada` mit `note_de` | 320 |
| `supplements.supplement_wada` mit `scope_note_de` | 290 |
| `supplements.wada_conflict_records` | 6 |
| `supplements.lab_effect_enrichment_records` | 47 |
| davon auf `supplement_lab_effects` gemappt | 3 |
| `supplements.supplement_human_evidence_flags` | 293 |
| davon mit `supplement_id` | 290 |
| `supplements.thailand_regulatory_records` | 1061 |
| `supplements.entity_cyp` | 3001 |
| `supplements.entity_transporters` | 4617 |
| davon `not_relevant` | 4189 |
| `supplements.supplement_studies` | 43 |
| `supplements.supplement_study_subjects` | 47 |
| `supplements.alias_resolution_candidates` | 64 |
| `supplements.pubchem_conflict_records` | 20 |
| davon `OPEN_TRUE_CONFLICT` | 6 |

`im_katalog` blieb unveraendert:

| Umgebung | `im_katalog = true` | sichtbare Unterformen |
|---|---:|---:|
| Wegwerf-Kette final | 412 | 0 |
| Live nach Einspielung | 412 | 0 |

## Befunde und Abweichungen

- Die WADA-Scope- und WADA-Notes-Dateien widersprechen sich in der Zuordnung nicht: `wadaMismatches = 0`.
- Die sechs WADA-Korrekturrecords werden als Konflikte gespeichert, nicht still in `supplement_wada` ueberschrieben.
- Die Studiendatei enthaelt 43 Studien und 47 `subjects`-Eintraege. Die vorher angenommene Zahl 90 war falsch und wurde im Sollstand auf 47 korrigiert.
- `cyp_enrichment.jsonl` enthaelt 666 Records, daraus entstehen 3001 Enzymzeilen. Die vorherige Mindestannahme 3300 war zu hoch und wurde im Sollstand auf den gemessenen Quellenwert 3001 korrigiert.
- `entity_transporters` speichert `not_relevant`; das ist mit 4189 von 4617 Zeilen der groesste Teil und wird nicht weggelassen.
- Die 20 PubChem-Konfliktrecords enthalten 6 echte Konflikte, 2 InChIKey-Mismatches und gepruefte Artefakte. Kennungen wurden nicht korrigiert.
- Der alte C-267-Konflikt Chromium/Chromium picolinate steht nicht in Kimis 20 PubChem-Records. Der Kennungswaechter behaelt dafuer eine explizite C-267-Ausnahme; alle Kimi-Ausnahmen kommen aus `pubchem_conflict_records`.

## Pruefungen

- Negativprobe C-272: `C272_EXPECT_CYP_ROWS=3002` auf der Wegwerf-DB bricht rot mit `C-272 CYP rows 3001 statt 3002`.
- Kennungswaechter live:
  - 239 Substanzen mit CID/Formel/InChIKey geprueft
  - 19 bekannte PubChem-Konflikt-Entities aus `supplements.pubchem_conflict_records`
  - davon 6 echte Konflikte
  - 3 Konfliktgruppen, alle gelb, 0 neue
- Kennungswaechter Negativprobe: kuenstlich vierte Konfliktgruppe erzeugt rot.
- `pnpm gate` lief inhaltlich durch: 11/11 Tasks erfolgreich. Der Python-Ausgabewrapper brach erst beim Drucken eines nicht-ASCII-Zeichens ab; das Gate-Log liegt in `backup/c276/c272-pnpm-gate.out`.

## Kontrollzahlen live

Die 19 Kontrollzahlen nach Live-Einspielung:

| Tabelle | Zeilen |
|---|---:|
| `nutrition.meal_items` | 9051 |
| `nutrition.meals` | 2895 |
| `supplements.substance_aliases` | 1541 |
| `nutrition.water_logs` | 1263 |
| `supplements.intake_logs` | 744 |
| `supplements.substance_catalog_sources` | ABSENT |
| `supplements.substance_catalog` | ABSENT |
| `medical.medication_active_substances` | 498 |
| `medical.medication_formulations` | 453 |
| `medical.medication_products` | 448 |
| `goals.body_measurements` | 362 |
| `recovery.checkins` | 370 |
| `recovery.scores` | 370 |
| `medical.lab_result_values` | 280 |
| `supplements.substance_lab_effects` | ABSENT |
| `training.workout_sets` | 238 |
| `recovery.modality_log` | 178 |
| `nutrition.nutrient_defs` | 138 |
| `nutrition.foods` | 7140 |

Die drei `ABSENT`-Eintraege sind alte Substance-Tabellen, die im Supplements-Neuaufbau bereits entfernt wurden. C-272 nutzt die neuen Tabellen.
