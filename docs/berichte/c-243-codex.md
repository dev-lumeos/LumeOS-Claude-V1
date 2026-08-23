# C-243 / C-242 Codex-Bericht

Stand: 2026-08-23

## Geaendert

- Neuer Kettenschritt: `supabase/_pipeline/13_supplements/138_supplements_stack_umhaengen.sql`
- `supabase/_pipeline/kette.json`: Schritt `138` hinter `137_supplements_neuaufbau_befuellen.sql`
- `supabase/_pipeline/daten/schema-sollstand.json`: `supplements.supplements.im_katalog` und neuer FK `stack_items_supplement_id_fkey`
- `supabase/_pipeline/_validierung/testdaten-pruefen.ts`: Supplement-Checks lesen Schritt 3 ueber `supplements.supplements`; Vitamin D3 bleibt als bewusst nicht aufgeloester `custom_name`

Nicht committet, nicht gestaged.

## Erwartung vor dem Lauf

- `supplements.supplements`: 566 Zeilen
- `im_katalog`: 290 `true`, 276 `false`, Summe 566
- `supplements.stack_items`: bestehende 10 Zeilen bleiben erhalten
- Automatisch aufloesbar: zwei Katalogtypen, `Creatine Monohydrate` und `Omega-3 (EPA/DHA)`
- Nicht automatisch aufloesbar: zwei Katalogtypen, `Magnesium` und `Vitamin D3`
- `test-user@lumeos.local`: mindestens zwei neue Positionen mit gesetzter `supplement_id`

## Wegwerf-Kettenlauf

Sicherung vor dem Lauf:

- `backup/schema/20260823_153956_c243_vor_kette_schema.sql`

Finaler Wegwerf-Lauf:

- Datenbank: `wegwerf_c243_final`
- Log: `backup/c243/kette-final.log`
- Ergebnis: `SCHEMA VOLLSTAENDIG`
- Ergebnis: `KETTE OK: 168.2s`
- Schrittzahl: 90
- Schritt 138: `OK C-243/C-242: im_katalog true 290, false 276`

Nachzaehlung Wegwerf:

| Messpunkt | Zahl |
|---|---:|
| `im_katalog = true` | 290 |
| `im_katalog = false` | 276 |
| `supplements.supplements` | 566 |
| `supplements.stack_items` | 0 |

`stack_items = 0` ist im frischen Kettenaufbau korrekt; die Nutzer-Seeds liegen in der laufenden Instanz.

## Live eingespielt

Vollsicherung vor dem Einspielen:

- `backup/vollsicherung/20260823_154329_c243_vor_live_lumeos_voll.dump`
- `backup/vollsicherung/20260823_154329_c243_vor_live_lumeos_voll.sql`

Live vor C-243:

| Tabelle / Sicht | Zahl |
|---|---:|
| `supplements.supplements` | 566 |
| `supplements.supplement_catalog` | 44 |
| `supplements.stack_items` | 10 |
| `dev@lumeos.app` Stack-Positionen | 4 |
| `tom.seed@example.com` Stack-Positionen | 4 |
| `test-user@lumeos.local` Stack-Positionen | 2 |

Live nach C-243:

| Messpunkt | Zahl |
|---|---:|
| `im_katalog = true` | 290 |
| `im_katalog = false` | 276 |
| `supplements.stack_items` gesamt | 12 |
| Stack-Positionen mit `supplement_id` | 6 |
| Stack-Positionen mit `custom_name` | 6 |
| `test-user@lumeos.local` Positionen mit `supplement_id` | 2 |

Aufgeloeste Positionen:

| Katalogtyp | Ziel |
|---|---|
| Creatine Monohydrate | `sub_9f9bb8c160` |
| Omega-3 (EPA/DHA) | `sub_4480fcfa86` |

Nicht aufgeloest:

| Katalogtyp | Grund |
|---|---|
| Magnesium | Kimi fuehrt Salze, keinen Sammelnamen |
| Vitamin D3 | Kimi fuehrt Cholecalciferol; die Salz-/Formentscheidung ist C-244 |

Die nicht aufloesbaren Zeilen bleiben erhalten, aber ohne `supplement_id`; der alte Name steht in `custom_name`, die Notiz nennt C-243/C-244.

## Generierte Spalte

Nachweisdatei:

- `backup/c243/generated-column-proof.log`

Gegenprobe:

| Test | Ergebnis |
|---|---|
| Testzeile mit Beschreibung, ohne `evidence_grade` | `im_katalog = true` |
| Testzeile ohne Beschreibung und ohne `evidence_grade` | `im_katalog = false` |
| `UPDATE supplements.supplements SET im_katalog = true` auf inhaltslose Zeile | Fehler `428C9`, Spalte kann nur auf `DEFAULT` gesetzt werden |

Negativprobe:

- Datei: `backup/c243/138-negativ-im-katalog-final.sql`
- Log: `backup/c243/negativ-im-katalog-final.log`
- Erwartung absichtlich `291` statt `290`
- Ergebnis: rot mit `C-243 im_katalog: true 290, false 276, total 566`

## Kontrollzahlen live

Nachweisdatei:

- `backup/c243/live-19-counts.log`

| Tabelle | Zahl |
|---|---:|
| `nutrition.meal_items` | 9051 |
| `nutrition.meals` | 2895 |
| `supplements.substance_aliases` | 1541 |
| `nutrition.water_logs` | 1263 |
| `supplements.intake_logs` | 744 |
| `supplements.substance_catalog_sources` | 668 |
| `supplements.substance_catalog` | 566 |
| `medical.medication_active_substances` | 498 |
| `medical.medication_formulations` | 453 |
| `medical.medication_products` | 448 |
| `goals.body_measurements` | 362 |
| `recovery.checkins` | 370 |
| `recovery.scores` | 370 |
| `medical.lab_result_values` | 280 |
| `supplements.substance_lab_effects` | 222 |
| `training.workout_sets` | 238 |
| `recovery.modality_log` | 178 |
| `nutrition.nutrient_defs` | 138 |
| `nutrition.foods` | 7140 |

Einige Zahlen liegen ueber aelteren Auftragserwartungen, weil die laufende Instanz seitdem weitergewachsen ist. C-243 hat diese Tabellen nicht geaendert.

## Validierung

`testdaten-pruefen.ts` nach C-243:

- Log: `backup/c243/live-testdaten-nach-validierung.log`
- Supplement-Checks aus C-243 sind gruen
- Offen bleibt ein nicht zu C-243 gehoerender Fehler: `medical.biomarker_reference_ranges: 566, erwartet 564`

Schemapruefung live:

- Log: `backup/c243/live-schema-final.log`
- C-243-Sollstand wird erkannt: `medical.biomarker_reference_ranges 566 / 566 ok`, `supplements.supplements 566 / 566 ok`
- Offen bleibt eine nicht zu C-243 gehoerende Live-Drift aus Schritt `058b`: `shopping_lists`, `shopping_list_items`, Guards, Trigger und FKs fehlen in der laufenden Instanz

## Bemerkung

`supplements.supplement_catalog` und `supplements.substance_catalog` bleiben stehen. Es wurde nichts in `apps/`, `docs/todo/` oder `docs/ssot/` geaendert.
