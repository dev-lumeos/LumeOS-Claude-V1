# C-255 Codex-Bericht

Stand: 2026-08-23

## Geaendert

- `[cmd]` Neuer Kettenschritt `139_supplements_altkataloge_entfernen.sql` nach Schritt 138/137.
- `[cmd]` `supplements.supplement_catalog`, `supplements.substance_catalog`, `supplements.substance_catalog_sources`, `supplements.supplement_nutrient_mappings`, `supplements.substance_lab_effects` werden erst nach Datenvergleich entfernt.
- `[cmd]` `supplements.stack_item_substance_matches` wird entfernt; `platform_input_status` und `rule_assessment` lesen den Stack direkt ueber `stack_items -> supplements.supplements`.
- `[cmd]` `testdaten-einspielen.ts` loest Creatine und Omega-3 ueber `substance_alias_matches`; Magnesium und Vitamin D3 bleiben Custom-Namen, weil C-244 offen ist.
- `[cmd]` `schema-sollstand.json` kennt die alten Tabellen nicht mehr und erwartet `supplement_field_sources = 2815`.

## Beleg vor dem Loeschen

`[cmd]` Vorher live:

| Objekt | Zeilen |
|---|---:|
| `substance_lab_effects` | 222 |
| `supplement_lab_effects` | 222 |
| `supplement_nutrient_mappings` | 17 |
| `supplement_nutrients` | 17 |
| `substance_catalog_sources` | 668 |
| `supplement_field_sources` | 2147 |

`[cmd]` `substance_catalog_sources` war nicht bereits zeilengleich in `supplement_field_sources` enthalten. C-255 uebernimmt die 668 alten Herkunftszeilen deshalb als `catalog_source.*` nach `supplement_field_sources`.

`[cmd]` Nachher live:

| Objekt | Zeilen |
|---|---:|
| `supplement_lab_effects` | 222 |
| `supplement_nutrients` | 17 |
| `supplement_field_sources` | 2815 |
| `catalog_source.*` in `supplement_field_sources` | 668 |
| alte Tabellen/Sicht | 0 |
| FKs auf alte Kataloge | 0 |

## Seed-Korrektur

`[cmd]` Der Seed lief auf der Ketten-Wegwerf-DB ohne `supplement_catalog` durch:

- 4 Supplement-Items
- 360 Intake-Logs
- Creatine monohydrate -> `sub_9f9bb8c160`, 90 Logs
- Omega-3 (EPA/DHA) -> `sub_4480fcfa86`, 90 Logs
- Vitamin D3 bleibt `custom_name`, 90 Logs
- Magnesium bleibt `custom_name`, 90 Logs

`[read]` Vitamin D3 und Magnesium wurden nicht auf eine Salzform geraten. Das bleibt C-244.

## Nachweise

- `[cmd]` Voller Kettenlauf: 91 Schritte, Exit 0, `SCHEMA VOLLSTAENDIG`.
- `[cmd]` Wegwerf-Probelauf von Schritt 139: alte Objekte 0, alte FKs 0, `supplement_field_sources` 2815.
- `[cmd]` Negativprobe: Erwartung `substance_catalog_sources = 669` statt 668 laeuft rot.
- `[cmd]` Live-Vollsicherung vor Einspielung: `backup/c255/20260823_193234_live_before.dump` und `.sql`.
- `[cmd]` Live-Schemapruefung nach Einspielung: `SCHEMA VOLLSTAENDIG`.
- `[cmd]` Live-`testdaten-pruefen.ts`: gruen.

## Kontrollzahlen live

Unveraendert:

| Tabelle | vorher | nachher |
|---|---:|---:|
| `nutrition.meal_items` | 9051 | 9051 |
| `nutrition.meals` | 2895 | 2895 |
| `supplements.substance_aliases` | 1541 | 1541 |
| `nutrition.water_logs` | 1263 | 1263 |
| `supplements.intake_logs` | 744 | 744 |
| `medical.medication_active_substances` | 498 | 498 |
| `medical.medication_formulations` | 453 | 453 |
| `medical.medication_products` | 448 | 448 |
| `goals.body_measurements` | 362 | 362 |
| `recovery.checkins` | 370 | 370 |
| `recovery.scores` | 370 | 370 |
| `medical.lab_result_values` | 280 | 280 |
| `training.workout_sets` | 238 | 238 |
| `recovery.modality_log` | 178 | 178 |
| `nutrition.nutrient_defs` | 138 | 138 |
| `nutrition.foods` | 7140 | 7140 |

Gezielt geaendert:

| Objekt | vorher | nachher |
|---|---:|---:|
| `supplements.substance_catalog_sources` | 668 | entfernt |
| `supplements.substance_catalog` | 566 | entfernt |
| `supplements.substance_lab_effects` | 222 | entfernt |
| `supplements.supplement_field_sources` | 2147 | 2815 |

## Offene Befunde

- `[cmd]` Der Auftrag nannte 2 Policies und 2 Trigger. Live gemessen waren 5 Policies und 4 Trigger auf den alten Tabellen. Alle fielen mit den Tabellen weg.
- `[cmd]` `pnpm gate` ist rot, aber nicht durch C-255: `nummern-pruefen` meldet `docs/todo/00-UEBERSICHT.md` Kopf 225 offen, gezaehlt 229. `docs/todo/` wurde nicht angefasst.
- `[cmd]` `tools/schuss.mjs /v2/supplements` und `/v2/medical` laden die Seiten, melden aber je 1 Konsolenwarnung: React-Hydration `Extra attributes from the server: data-mode`. Das ist kein fehlender Tabellenzugriff.
- `[cmd]` Screenshots/Logs liegen unter `backup/c255/20260823_193953_*`.

