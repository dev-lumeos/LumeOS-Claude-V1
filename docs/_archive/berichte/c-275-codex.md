# C-275 — Kimi-Stammdaten 446 vor C-272

Stand: 2026-08-25

Nicht committet, nicht gestaged, live eingespielt nach Vollsicherung.

## Erwartung vor dem Lauf

[cmd] Quelle in `docs/kimi_research/supplement_performance_database/data/substances/`:

| Datei | Zeilen |
|---|---:|
| `supplements.jsonl` | 243 |
| `peptides.jsonl` | 79 |
| `performance_compounds.jsonl` | 124 |
| `substance_user_texts.jsonl` | 446 |
| `substance_faq.jsonl` | 1.970 |

[cmd] Frische Kette vor C-275: `supplements.supplements` 566, davon `im_katalog` 290. Live vor C-275: 566, davon 318 sichtbar.

[read] Die abweichende Sichtbarkeitszahl ist kein Importfehler: `im_katalog` ist generiert als `parent_id IS NULL AND (description_de/en gefuellt OR evidence_grade IS NOT NULL)`. Unterformen mit `parent_id` bleiben trotz Text verborgen.

## Was gebaut wurde

[cmd] Neuer Kettenschritt:

`supabase/_pipeline/13_supplements/141aa_supplement_kimi_stammdaten_446.ts`

Er laeuft zwischen `141_supplement_textkorrektur.sql` und `141a_supplement_kimi_nutzertexte.ts`.

[cmd] Zuordnung:

| Klasse | Frische Kette | Wirkung |
|---|---:|---|
| bereits sichtbarer Treffer | 288 | bleibt bestehende Zeile |
| unsichtbare Huelse | 128 | Kimi-Stammdaten auf bestehende Zeile, kein Duplikat |
| neu anzulegen | 30 | neue Zeile mit Kimi-`entity_id` als Slug |

[read] Die Orchestrator-Zahl `99 Huelsen` gilt fuer live vor C-275. In der frisch gebauten Kette sind es 128, weil dort vor C-275 nur 290 statt 318 Zeilen sichtbar sind. Live wurden 99 Huelsen aufgeloest.

[cmd] `Testosterone (base)` und `Testosterone Base (No Ester)` sind zwei Kimi-Records. Die f05-Huelle `f05_testosterone_base_no_ester` wird durch den exakt passenden Record `Testosterone Base (No Ester)` gefuellt. `Testosterone (base)` wird neu angelegt. Das verhindert die Textkollision und haelt die beauftragten 30 Neuanlagen.

[cmd] `141a_supplement_kimi_nutzertexte.ts` und `141b_supplement_kimi_enhanced_textfelder.ts` mussten dieselbe Ranking-Regel bekommen: Slug, Kimi-Entity-Alias, normalisierter Name, `name_en`, Alias. Vorher gewann bei `Boldenone Acetate/Cypionate` ein sichtbarer Alias-Treffer gegen die exakte f05-Huelle.

## Wegwerf-Datenbank

[cmd] Kettenlauf:

`supabase/_pipeline/kette-ausfuehren.ts --database lumeos_c275_probe --keep-database`

Ergebnis: 102 Schritte, Exit 0.

[cmd] C-275-Zahlen in der Probe-DB:

| Wert | Ergebnis |
|---|---:|
| `supplements.supplements` | 596 |
| `im_katalog` | 416 |
| `supplement_user_texts` | 446 |
| `supplement_faq` | 1.970 |
| `source='f05_substance_candidate' AND NOT im_katalog` | 149 |
| sichtbare Namensdubletten | 0 |

[cmd] Gegenproben:

| Probe | Ergebnis |
|---|---:|
| `f05_testosterone_enanthate` sichtbar | 1 |
| `sub_4288c6b5be` Insulin Glargine sichtbar | 1 |
| `sub_3933b0551e` Humatrope sichtbar | 1 |
| sichtbarer Magnesium-Slug | `magnesium` |
| sichtbares `BPC-157` | 1 |

[cmd] Negativprobe: `C275_EXPECT_FINAL_VISIBLE=417` gegen die Probe-DB bricht ab mit `C-275 im_katalog 416, erwartet 417`.

[cmd] Schemapruefung auf Probe: `SCHEMA VOLLSTAENDIG`.

[cmd] `testdaten-pruefen.ts` auf Probe nach Testdaten-Seed: rot mit 5 nicht-C-275-Fehlern: drei Einkaufsliste-Faelle aus C-251 und zwei Refill-Faelle rund um Vitamin D3/C-244. Nicht mitrepariert.

## Live-Einspielung

[cmd] Vollsicherung vor Live-Eingriff:

`backup/vollsicherung/20260825_172244_c275_before_live.dump`

[cmd] Live vor/nach:

| Tabelle / Messung | vorher | nachher |
|---|---:|---:|
| `nutrition.meal_items` | 9.051 | 9.051 |
| `nutrition.meals` | 2.895 | 2.895 |
| `nutrition.water_logs` | 1.263 | 1.263 |
| `supplements.intake_logs` | 744 | 744 |
| `supplements.supplements` | 566 | 596 |
| `supplements.supplement_aliases` | 1.293 | 2.755 |
| `supplements.supplement_user_texts` | 318 | 446 |
| `supplements.supplement_faq` | 1.421 | 1.970 |
| `supplements.im_katalog` | 318 | 447 |
| `supplements.f05_invisible` | 248 | 149 |
| sichtbare Namensdubletten | 0 | 0 |
| `medical.medication_active_substances` | 498 | 498 |
| `medical.medication_formulations` | 453 | 453 |
| `medical.medication_products` | 448 | 448 |
| `goals.body_measurements` | 362 | 362 |
| `recovery.checkins` | 370 | 370 |
| `recovery.scores` | 370 | 370 |
| `medical.lab_result_values` | 280 | 280 |
| `supplements.supplement_lab_effects` | 222 | 222 |
| `training.workout_sets` | 238 | 238 |
| `recovery.modality_log` | 178 | 178 |
| `nutrition.nutrient_defs` | 138 | 138 |
| `nutrition.foods` | 7.140 | 7.140 |

[cmd] Live-Schemapruefung: `SCHEMA VOLLSTAENDIG`.

[cmd] Live-`testdaten-pruefen.ts`: gruen, `OK: C-82 Testdaten stimmen.`

## Sollstand

[cmd] `schema-sollstand.json` nachgezogen:

| Mindestwert | neu |
|---|---:|
| `supplements.supplements` | 596 |
| `supplements.supplement_aliases` | 2.413 |
| `supplements.supplement_user_texts` | 446 |
| `supplements.supplement_faq` | 1.970 |
| `supplements.supplement_dosing` | 596 |
| `supplements.supplement_evidence` | 596 |

[read] Live hat bei `supplement_aliases` 2.755 statt 2.413, weil live vor C-275 bereits 1.293 Aliaszeilen trug; die frische Kette erzeugt 2.413. Der Sollstand bleibt auf dem reproduzierbaren Kettenwert.

## Offene Befunde

[cmd] Die Auftragserwartung `im_katalog ~446` traegt nicht wortwoertlich, weil `parent_id IS NULL` Teil der generierten Spalte ist. Frische Kette: 416 sichtbar. Live: 447 sichtbar, weil live vor C-275 318 statt 290 sichtbare Zeilen hatte.

[cmd] Eine alte, gestoppte C-272-Arbeitsdatei liegt unverdrahtet im Baum: `supabase/_pipeline/13_supplements/141d_kimi_wada_scope.ts`. Sie wurde nicht ausgefuehrt und nicht in `kette.json` eingetragen.
