# C-273 Codex-Bericht

## Was gebaut wurde

Neues Schema `wissen`, getrennt von `supplements` und `medical`, fuer Kimi-Wissen, das nicht angezeigt werden soll. Die Kette hat 9 neue Schritte:

- `273` `supabase/_pipeline/16_wissen/273_wissen_schema.sql`
- `273a` Regel-Engine
- `273b` Register
- `273c` Lueckenkarten
- `273d` Produktebene
- `273e` Scan-Konzept
- `273f` Reise mit Medikamenten
- `273g` Buddy
- `273h` Community

Die 10 Tabellen sind RLS-geschuetzt und haben nur `service_role`-Policies. `anon` und `authenticated` haben 0 Grants. Es gibt keinen Lesepfad und keine Anzeige.

## Blockzahlen

Wegwerf-Kette und Live liefern dieselben C-273-Zahlen:

| Tabelle | Zeilen |
|---|---:|
| `wissen.rule_engine_rules` | 64 |
| `wissen.rule_engine_field_specs` | 22 |
| `wissen.rule_trait_mappings` | 43 |
| `wissen.evidence_register_entries` | 265 |
| `wissen.knowledge_gap_records` | 407 |
| `wissen.product_entities` | 353 |
| `wissen.vision_contract_records` | 15 |
| `wissen.travel_medication_records` | 27 |
| `wissen.buddy_knowledge_records` | 2.861 |
| `wissen.community_records` | 1.033 |

Marken:

- Community: 1.033 von 1.033 mit `admin_only = true`, `not_medical_recommendation = true`, `evidence_class = E`.
- Register: 265 von 265 mit `current_value = null`.
- Scan: 4 schema-only-Vertraege. Befund: `peptide_cam_contract` traegt in der Quelle `synthetic_schema_only: true`, nicht den gleichen Literalwert wie die anderen drei.
- Medienrechte: 8 Statuszeilen mit `can_display`/`can_store`/`can_train`.

Gegenproben:

- `supplements.rule_catalog` und `wissen.rule_engine_rules`: 64/64 gleiche Rule-IDs.
- `kgap_852572baac` ist vorhanden.
- `prd_882416d5` ist importiert; seine Zutaten zeigen auf vorhandene `supplements.supplements.slug`.
- Negativprobe: `C273_EXPECT_RULES=65` laeuft rot mit `C-273 Block1 Regeln 64, erwartet 65`.

## Befunde

Die Buddy-Zahl aus dem Auftrag (`2.817`) passt nicht zur konkret benannten Quelle. Voll gezaehlt ergeben die genannten Dateien 2.861 Zeilen: Population/Resolver 2.508, Semantik 14, synthetische Beispiele 46, Capabilities 23, Dependency-Graph 64/140 und Readiness 66.

Zwei Quelldateien enthalten fachlich doppelte Schluessel. Ich habe sie nicht zusammengelegt, sondern den Record-Key deterministisch mit Positionsanteil gespeichert:

- Reise: `travel_medication_requirement` hat doppelt `JP`.
- Buddy: `population_response_atlas` hat mehrfach `lab_igf1`.

## Nachweis

Wegwerf-Kette:

- Datenbank: `lumeos_c273_probe`
- Ergebnis: `KETTE OK: 287.5s`
- Nachweis: `backup/c273/c273-kette.out`
- Zaehlung: `backup/c273/c273-probe-counts.tsv`

Live:

- Vorher-Vollsicherung: `backup/vollsicherung/20260826_091827_c273_before.dump`
- Nach jedem Block gesichert: `backup/vollsicherung/20260826_091831_c273_0_schema.dump` bis `backup/vollsicherung/20260826_091907_c273_8_community.dump`
- Live-Zaehlung: `backup/c273/live-final-counts.tsv`
- 19 Kontrollzahlen dynamisch: `backup/c273/live-control-counts-dynamic.tsv`

`im_katalog`:

| Ort | `im_katalog = true` | sichtbare Unterformen |
|---|---:|---:|
| Wegwerf-Kette | 412 | 0 |
| Live | 412 | 0 |

Validierung:

- Schemapruefung live: `SCHEMA VOLLSTAENDIG`
- `testdaten-pruefen.ts`: `OK: C-82 Testdaten stimmen.`

Hinweis zu den 19 Kontrollzahlen: live existieren `supplements.substance_catalog`, `supplements.substance_catalog_sources` und `supplements.substance_lab_effects` nicht mehr; die dynamische Kontrolle weist sie als `MISSING` aus statt abzubrechen. Die C-273-Tabellen und die betroffenen Live-Mindestzeilen sind davon nicht abhaengig.
