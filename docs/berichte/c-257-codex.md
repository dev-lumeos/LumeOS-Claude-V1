# C-257 — Codex-Bericht

Stand: 2026-08-23, live eingespielt nach Vollsicherung.

## Was gebaut wurde

Kettenschritt: `supabase/_pipeline/13_supplements/140_supplement_nutzertexte.sql`, in `kette.json` als `140s` hinter Schritt 137 und vor `146a`.

Entscheidung zur Bauform:

- Lange Nutzertexte liegen in `supplements.supplement_user_texts` als 1:1-Tabelle, nicht als 27+ Spalten an `supplements.supplements`.
- Alltagsfragen liegen in `supplements.supplement_faq`.
- `supplements.supplements` bekam nur die Listen-/Strukturfelder `parent_id`, `form_note_de`, `form_note_en`, `form_note_th`.
- `im_katalog` wurde neu als generierte Spalte angelegt: nur Top-Level-Zeilen mit Beschreibung oder Evidenzgrad erscheinen im Katalog.
- `supplements.supplement_tags` bekam `evidence_grade`.

Warum so: Die Haupttabelle bleibt Katalogkern. Die langen Texte sind Anzeigeinhalt und wachsen weiter. Eine eigene 1:1-Tabelle ist der klarere Schnitt.

## C-244: Sammelname gewinnt

Die 15 Sammelnamen wurden als Eltern angelegt, 29 Kimi-Formen wurden darunter gehängt:

| Sammelname | Unterformen |
|---|---:|
| Magnesium | 7 |
| Whey Protein | 3 |
| Zinc | 3 |
| Caffeine | 2 |
| Calcium | 2 |
| Iron | 2 |
| Vitamin B12 | 2 |
| Collagen | 1 |
| Lion's Mane | 1 |
| Tongkat Ali | 1 |
| Vitamin A | 1 |
| Vitamin B6 | 1 |
| Vitamin C | 1 |
| Vitamin D3 | 1 |
| Vitamin E | 1 |

Der Text steht am Sammelnamen. Die Formen bleiben erhalten und tragen ein kurzes `form_note_*`.

Wichtiger Befund: Für Sammelnamen wie Magnesium wird kein Dosisbereich und kein Evidenzgrad still aus einer Salzform übernommen. Der Nutzer wählt "Magnesium"; die sieben Formen unterscheiden sich aber fachlich. Eine gemeinsame Evidenz-/Dosislogik braucht eine eigene Entscheidung.

Die Sichtbarkeit verschiebt sich dadurch: Erwartet waren ursprünglich 290 sichtbare Kimi-Zeilen. Nach C-244 sind es 289 Top-Level-Texte: 29 Formen werden Unterformen, 28 LumeOS-Sammelnamen kommen hinzu.

## Befüllung

Durchgangsstände:

| Gruppe | Texte | FAQ | Status |
|---|---:|---:|---|
| supplement | 153 | 459 | gefüllt |
| peptide | 61 | 183 | gefüllt |
| enhanced | 75 | 225 | gefüllt |
| Summe | 289 | 867 | gefüllt |

Nachweis-Snapshots:

- `backup/c257/supplement_texte.json`
- `backup/c257/peptide_texte.json`
- `backup/c257/enhanced_texte.json`

Die Texte sind bewusst konservativ. Da Kimi nicht verfügbar war, habe ich keine substanzindividuellen Behauptungen erfunden. Die Erstbefüllung nutzt vorhandene Katalogdaten, Gruppe, Filter, Dosis-/Evidenzfelder und allgemeine Primärquellen. Substanzspezifische redaktionelle Tiefe bleibt offen.

Quellen, die für die allgemeinen Aussagen herangezogen wurden:

- NIH Office of Dietary Supplements: Magnesium, Vitamin D, Zinc.
- ISSN Position Stands: Creatine und Protein/Exercise.
- FDA: SARMs und Bodybuilding-Produkte.
- WADA Prohibited List.
- DEA Steroids Fact Sheet.
- FDA-Liste zu riskanten Bulk-Drug-Substanzen für Compounding, darunter Peptide.

## Tags, Portionen, Aliase

`supplement_tag_definitions` bekam sieben Zweck-Tags:

- `zweck_versorgung`
- `zweck_training`
- `zweck_fokus`
- `zweck_stoffwechsel`
- `zweck_erholung`
- `zweck_hormon_labor`
- `zweck_recht_wada`

`supplement_tags`: 425 Zeilen.

`supplement_portions`: 79 Zeilen aus `studied_dose_ranges`.

Nicht parsebar als Betrag + Einheit:

| Slug | Text |
|---|---|
| `sub_1a13793ded` | `0.3` |
| `sub_7567ca120d` | `various preparations` |
| `sub_98d523f968` | `see sports entry` |
| `sub_c3aa6979bb` | `see sports entry` |

Alias-Dubletten:

- vorher: 598 überflüssige Aliaszeilen bei 527 Substanzen
- nachher: 0
- `supplement_aliases`: 943 Zeilen

## Nachweis

Wegwerf-Datenbank `lumeos_c257_probe`:

| Prüfung | Ergebnis |
|---|---:|
| `supplements.supplements` | 566 |
| `im_katalog = true` | 289 |
| Unterformen (`parent_id is not null`) | 29 |
| `supplement_user_texts` | 289 |
| `supplement_faq` | 867 |
| `supplement_tags` | 425 |
| `supplement_portions` | 79 |
| `supplement_aliases` | 943 |

Gegenproben:

- `im_katalog` ist wirklich generiert: `UPDATE ... SET im_katalog = true` schlägt fehl.
- künstliche Alias-Dublette wird gefunden.
- `kurz_was`: 0 Texte über 140 Zeichen.
- Sperrwörter im ersten Satz: 0 Treffer.

Kette:

- voller Kettenlauf auf Wegwerf-Datenbank: Exit 0
- Schemaprüfung auf Wegwerf-Datenbank: `SCHEMA VOLLSTAENDIG`

`testdaten-pruefen.ts` auf Wegwerf-Datenbank war zunächst rot mit fünf nicht-C-257-Fehlern aus C-251/Refill. Nach Live-Einspielung ist die Live-Prüfung grün.

## Live

Vollsicherung vor Live:

- `backup/vollsicherung/20260823_210004_c257_live.dump`
- `backup/vollsicherung/20260823_210004_c257_live.sql`

Live-Einspielung:

- SQL-Schritt `140_supplement_nutzertexte.sql` erfolgreich angewendet.
- Schemaprüfung live: `SCHEMA VOLLSTAENDIG`.
- `testdaten-pruefen.ts` live: `OK: C-82 Testdaten stimmen.`

Live-Zahlen:

| Tabelle / Messung | Zahl |
|---|---:|
| `supplements.supplements` | 566 |
| `im_katalog = true` | 289 |
| Unterformen | 29 |
| `supplement_user_texts` | 289 |
| `supplement_faq` | 867 |
| `supplement_tags` | 425 |
| `supplement_portions` | 79 |
| `supplement_aliases` | 943 |

Historische 19 Kontrollzahlen nach Live:

| Objekt | Zeilen |
|---|---:|
| `nutrition.meal_items` | 9051 |
| `nutrition.meals` | 2895 |
| `supplements.substance_aliases` | 1541 |
| `nutrition.water_logs` | 1263 |
| `supplements.intake_logs` | 744 |
| `supplements.substance_catalog_sources` | fehlt seit Schritt 5 |
| `supplements.substance_catalog` | fehlt seit Schritt 5 |
| `medical.medication_active_substances` | 498 |
| `medical.medication_formulations` | 453 |
| `medical.medication_products` | 448 |
| `goals.body_measurements` | 362 |
| `recovery.checkins` | 370 |
| `recovery.scores` | 370 |
| `medical.lab_result_values` | 280 |
| `supplements.substance_lab_effects` | fehlt seit Schritt 5 |
| `training.workout_sets` | 238 |
| `recovery.modality_log` | 178 |
| `nutrition.nutrient_defs` | 138 |
| `nutrition.foods` | 7140 |

Die drei fehlenden `substance_*`-Objekte sind kein C-257-Verlust, sondern Folge des vorherigen Alt-Katalog-Entfernens. Die Schemaprüfung prüft die neuen Tabellen und ist grün.

## Offen

- Substanzindividuelle redaktionelle Recherche ist nicht vollständig ersetzt. Der jetzige Stand ist eine saubere strukturelle Erstbefüllung ohne erfundene Einzelaussagen.
- Sammelnamen wie Magnesium brauchen eine fachliche Regel, wie Evidenzgrad und Dosisbereich aus mehreren Salzformen dargestellt werden.
- Vier `studied_dose_ranges` sind nicht als Portion parsebar.
- Thai bleibt leer.

Nicht gestaged, nicht committet, nicht gepusht.
