# supabase/

Alles, was die lokale Supabase-Instanz aufbaut.

**Stand:** 2026-08-05 (vierte Fassung — Baseline „Weg B", Rollenteilung
migrations/↔_pipeline/, Kette vollständig bis 090)

---

## Rollenteilung: `migrations/` gegen `_pipeline/`

Seit 2026-08-05 (D-17, Weg B) gilt:

| Ort | Rolle |
|---|---|
| `migrations/` | **Deploybare Struktur.** Eine Baseline-Migration stellt den vollständigen Strukturzustand her (Schemas, Tabellen, Constraints, Indizes, Funktionen, Trigger, Policies, Grants). Läuft gegen jede Umgebung — lokal wie Cloud. **Keine Daten.** |
| `_pipeline/` | **Lokale Aufbaukette und lokale Wahrheit.** Nummerierte Schritte inkl. Katalog-Seeds, CSV-Import und Ableitungen. Wird NICHT deployt. |

Künftige Strukturänderungen entstehen als neue Migration in `migrations/`
**und** — wo sie zur Kette gehören — als Pipeline-Schritt; Stammdaten und
Seeds bleiben ausschliesslich in `_pipeline/`.

### Harte Grenze: Struktur ja, Daten nein

Eine Migration darf Tabellen, Spalten, Constraints, Indizes, Funktionen,
Trigger, RLS, Policies und Grants definieren. Sie darf **keine** Katalogdaten
oder Ableitungen schreiben: `INSERT`, `UPDATE`, `COPY`, `DELETE`, `TRUNCATE`
und `MERGE` gehoeren in einen nummerierten Schritt unter `_pipeline/`. Das gilt
auch fuer Backfills. Die Migrationsdatei macht eine Umgebung strukturell
lauffaehig; der Kettenschritt stellt erst den lokalen Datenzustand her.

`node tools/migration-datenlogik-pruefen.mjs` prueft diese Grenze und laeuft
in `pnpm gate`. Der Waechter ignoriert Kommentare und Zeichenketten, prueft
aber auch Dollar-quotierte Funktionskoerper. Einzige benannte Ausnahme ist
`public.handle_new_user()` in `20260805120000_baseline_structure.sql`: dessen
`INSERT INTO public.profiles (id)` erzeugt beim Auth-Trigger das Profil zum
neuen Benutzer und ist kein Katalog-Backfill. Jede weitere ausfuehrbare
Datenoperation in `migrations/` ist ein Fehler.

---

## Warum es diesen Ordner in dieser Form gibt

`[cmd]` Das Migrations-Register der laufenden Datenbank
(`supabase_migrations.schema_migrations`) enthielt genau **einen** Eintrag,
während 11 Nutrition-Tabellen mit rund 727.000 Zeilen existieren.
Die Datenbank entstand über eine Kette einzeln ausgeführter Skripte; die lag
verstreut in `docs/project/p1-005/` und `tmp/`, war aber vollständig.
`_pipeline/` bündelt sie und macht die Reihenfolge sichtbar.

`[cmd]` Dreifach verifiziert (2026-08-02, `docs/ssot/33-pipeline-verifikation.md`):
Die Kette erzeugt aus einer leeren Datenbank einen bitgenau identischen
Zustand — zuletzt vollständig aus dem versionierten Archiv
`_data/bls_4_0_local_import.zip`, ohne untracked Quellen.

`[cmd]` 2026-08-05 (D-17): Der eine Registereintrag war ein **Geist**
(Datei archiviert, Tabellen gedroppt), die drei Slice-Dateien waren nicht
registriert, `public.profiles` stammte aus keiner Migration. Antwort ist die
**Baseline** `migrations/20260805120000_baseline_structure.sql` — erzeugt per
`pg_dump --schema-only` aus dem verifizierten Ist-Zustand, strukturgleich
belegt (0 Abweichungen in der Wegwerf-DB-Gegenprobe).

---

## Ordner

| Ordner | Inhalt | Wer nutzt ihn |
|---|---|---|
| `migrations/` | **1 Baseline-Migration** (Struktur, Stand 2026-08-05) | **Supabase CLI** — was hier liegt, wird bei `db reset`/`db push` angewendet |
| `_pipeline/` | Die lokale Aufbaukette, nummeriert, inkl. `060`–`090` | Manuell, in Reihenfolge |
| `_data/` | BLS-Rohdaten als Archiv — **verifizierte Quelle** | Von `_pipeline/03_bls_import/` |
| `_archive/` | Ausrangiertes: 7 Alt-Migrationen (inkl. der 3 Slices, seit 2026-08-05), `migrations-draft/` | niemand (nicht mehr zitieren) |
| `_snippets/` | Introspektionsabfragen (Kopien der Studio-Snippets) | Diagnose |
| `snippets/` | untracked Studio-Reste — **steht auf der Löschliste** | niemand |
| `.branches/`, `.temp/`, `config.toml` | CLI-eigen | Supabase CLI |

---

## Lokaler Neubau (frische Datenbank)

Reihenfolge ist verbindlich. Validierungen unter `_pipeline/_validierung/`.

| # | Datei | Erzeugt | Erwartet |
|---|---|---|---|
| B | `migrations/20260805120000_baseline_structure.sql` | **Gesamte Struktur**: Schema `nutrition` (11 Tabellen), `public.profiles` + Trigger, alle Funktionen/Indizes/Policies/Grants, pg_trgm | v060 22, v070 18, v090 14 Prüfungen |
| 015 | `015_kataloge/015_nutrient_defs_seed.sql` | 138 Nährstoffdefinitionen | 138 |
| 015a | `015_kataloge/015a_nutrient_tree_details.ts` | `nutrient_defs.parent_code` und `nutrient_details` | 40 Wurzeln, 98 Kinder, 110 Detailzeilen (107 exakt, 3 Legacy-Mapping; 3 Legacy-Dubletten ersetzt) |
| 016 | `015_kataloge/016_nutrient_reference_values.ts` | `nutrient_reference_values`: Referenzwert-Antworten für alle Nährstoffcodes, inklusive `NO_REFERENCE`-Zeilen; `nutrient_defs.rda_*` als überholt markiert | mindestens 138 Codes |
| 020 | `02_human_layer/020_food_human_layer.sql` | Kategorien-/Tag-Seeds, **Tag- und Alias-Ableitungen** (Strukturteile: durch Baseline bereits da, Guards greifen) | 518 Kategorien, 16 Tag-Definitionen |
| 030 | `03_bls_import/030_apply_local.sql` | `foods`, `food_nutrients` aus CSV | 7.140 / 698.092 |
| 031 | `03_bls_import/031_fettsaeuren_nachtrag.sql` | 30 Einzelfettsäuren aus `bls_4_0_fettsaeuren.zip` | +171.409, gesamt 869.501 / 138 Codes |
| 020 **erneut** | dito | Ableitungen greifen jetzt: Aliase, Tags, Kategoriezuweisungen | 21.420 / 9.265 / 7.140 |
| 021 | `02_human_layer/021_wild_category_apply.sql` | **Kategoriezuweisung `V2%` → `wild`** | `affected_rows = 49` |
| 022 | `02_human_layer/022_alias_ableitung.sql` | abgeleitete Aliase | 32.522 gesamt |
| 023 | `02_human_layer/023_zubereitung_ableitung.sql` | `preparation_kinds` (11), `food_groups` (19) | 11 / 19 |
| 023a | `02_human_layer/023a_food_group_category_bridge.sql` | `food_categories.food_group_code` als Bruecke zu `food_groups`; sichere Kategorie-Nachzuege fuer N/X/Y | 7.067 kategorisiert, 73 bewusst leer |
| 024 | `02_human_layer/024_suchsynonyme.sql` | `search_synonyms` | 4.877, davon 21 von Hand |
| 025 | `_ableitung/anzeigenamen-einspielen.ts` | kuratierte `name_display_de`/`name_display_en` aus `daten/anzeigenamen.jsonl` | 7.140 Anzeigenamen, 33 `sicher=false` sichtbar im Lauf |
| 026 | `_ableitung/anzeigenamen-nebennamen-aliase.ts` | kuratierte `nebennamen` als `food_aliases.source='curated_nebenname'` | 576 Foods mit Nebennamen, 663 kuratierte Namen vor Deduplikation |
| 027 | `_ableitung/027_lebensmittel-tags.ts` | kuratierte C-44-Tags aus `daten/lebensmittel-tags.jsonl`, `processing_level` nach C-100 und Sortweight-Refresh, ohne die Makro-Tags aus `020` zu löschen | 5.150 Foods, 8.702 Tags; `processing_level`: 927 hochverarbeitet |
| 018 | `015_kataloge/018_ausschluss_presets.sql` | `exclusion_presets`, `exclusion_preset_rules` und `exclusion_preset_matches` fuer benannte Ausschlussregeln der Lebensmittelsuche | 11 Presets, Regelbasis fuer halal/kosher/no_pork |
| 032 | `_ableitung/032-halal-koscher-tags.sql` | halal- und kosher-Zuordnungen aus den Presets | halal/kosher-Tags aus Ausschlussregeln |
| 028 | `_ableitung/028_kuratierte-aliase.ts` | kuratierte Suchbegriffe und Sortenaliase aus `daten/reis-alias-kuration.json` als `food_aliases.source='curated_suchbegriff'` | 13 Zuordnungen vor Deduplikation |
| 029 | `_ableitung/029_portionen-einspielen.ts` | `foods_portions` mit kuratierten Haushaltsportionen aus `daten/portionen.json`; Gramm bleibt kanonisch | 23.402 Portionszeilen für 7.048 Foods, 92 ohne Portion |
| **052** | `05_user_tabellen/052_diary_foundation.sql` | **`meals`, `meal_items`**, `touch_updated_at()`, `meal_items_owner_guard()`, 4 Trigger, 8 Policies | 2 Tabellen |
| **052a** | `05_user_tabellen/052a_meal_time.sql` | `meals.meal_time`, Sortierindizes und Wegfall des Unique-Index auf Nutzer/Tag/Typ | mehrere Mahlzeiten je Typ speicherbar |
| **053** | `05_user_tabellen/053_daily_summary.sql` | Sicht **`daily_summary`** | 1 Sicht |
| **059b** | `05_user_tabellen/059b_daily_nutrient_summary_long.sql` | Lange Tagesbilanz **`daily_nutrient_summary_long`**, Zeitfensterfunktion `nutrient_summary_window()` und Baumwert-Pruefung fuer alle 138 Naehrstoffe | 1 Sicht, 2 Funktionen |
| **054** | `05_user_tabellen/054_preference_uniques.sql` | Eindeutigkeitsregeln auf `food_preference_items` | — |
| **055** | `05_user_tabellen/055_water_logs.sql` | **`water_logs`** + Policies | 1 Tabelle |
| **056** | `05_user_tabellen/056_hydration_summary.sql` | Sicht **`hydration_summary`** | 1 Sicht |
| **057** | `05_user_tabellen/057_search_events.sql` | **`search_events`** + Auswertung `search_events_report()` | 1 Tabelle, 1 Funktion |
| **058** | `05_user_tabellen/058_custom_foods.sql` | **`foods_custom`**, `meal_items.custom_food_id`, Plausibilitaetsfunktion | 1 Tabelle, 1 Funktion, 1 FK |
| **058a** | `05_user_tabellen/058a_meal_item_portions.sql` | `meal_items` speichert Portionssnapshot (`portion_name`, `portion_quantity`, `portion_amount_g`) | 3 Spalten, 1 Check |
| 060 | `06_zugriff/060_zugriffsschicht.sql` | pg_trgm, Trigram-Indizes, Grants, RLS | v060: 22 Prüfungen |
| 061 | `06_zugriff/061_rollen_admin.sql` | `public.is_admin()` + Policies | v061: 15 Prüfungen |
| 062 | `06_zugriff/062_pruef_objektliste.sql` | `nutrition.pruef_objektliste()` fuer Objektlisten- und Rechtepruefung | 1 Funktion |
| 070 | `07_lesefunktionen/070_lesefunktionen.sql` | 6 RPC-Funktionen | v070: 18 Prüfungen |
| 071 | `07_lesefunktionen/071_suchrelevanz.sql` | aliasbewusste Suchrelevanz | `food_search` ersetzt |
| 072 | `07_lesefunktionen/072_normalisierung.sql` | `search_fold`, Ausdrucksindex | — |
| 073 | `07_lesefunktionen/073_suchfilter.sql` | `food_search` samt Rangfunktionen | 1 Signatur |
| 074 | `07_lesefunktionen/074_preferences_api.sql` | `food_preferences_read()` und `food_preferences_write()` fuer Nutrition-Preferences, ohne `food_search` zu veraendern | 2 Funktionen |
| 075 | `07_lesefunktionen/075_preference_search_application.sql` | `food_search` mit optionaler Nutzer-Praeferenzanwendung und zehn Sortierwerten; `p_user_id = NULL` bleibt ungefiltert | 1 Signatur, hard/strong/soft/boost wirksam; unbekannter Sortierwert wird als `unsupported_sort` gemeldet |
| 080 | `08_bereinigung/080_public_bereinigen.sql` | Bereinigung alter Governance-Objekte in `public` | idempotent |
| 090 | `09_identitaet/090_profile.sql` | `public.profiles` + Trigger auf `auth.users`, C-47-Profilachsen, C-63 `locale` und C-140 `experience_level` | v090: 18 Prüfungen |
| 091 | `09_identitaet/091_user_display_preferences.sql` | Allgemeine gespeicherte Anzeigeeinstellungen je Nutzer | 1 Public-Tabelle, RLS je Operation |
| 056a | `05_user_tabellen/056a_hydration_day.sql` | Funktion `hydration_day(user_id, date)` mit Tagesziel, Gläserzahl und 14-Tage-Vergleich | 1 Funktion |
| 100 | `10_training/100_training_schema.sql` | Schema `training` mit `exercises`, `muscle_groups`, `equipment`, `exercise_muscles` | 4 Tabellen |
| 101 | `10_training/101_training_seed.sql` | Training-Stammdaten aus Legacy-Export | 1.416 Uebungen, 109 Muskelgruppen, 58 Geraete, 6.625 Zuordnungen vor Merge |
| 102 | `10_training/102_plural_merge.sql` | Plural-Merge fuer Muskelgruppen | Nachpflege |
| 103 | `10_training/103_calvicular_merge.sql` | Calvicular-/Clavicular-Merge | Nachpflege |
| 104 | `10_training/104_body_region.sql` | `body_region`-Nachpflege fuer Muskelgruppen | Nachpflege |
| 105 | `10_training/105_mideus_merge.sql` | Mideus-/Medius-Merge | Endbestand 1.416 Uebungen, 107 Muskelgruppen, 58 Geraete, 6.624 Zuordnungen |
| 107 | `10_training/107_muscle_groups_hierarchy.sql` | Muskelgruppen-Kuration: Anzeigeebene, Hierarchie, Regionskorrekturen, Dubletten-Merge | Endbestand 1.416 Uebungen, 96 Muskelgruppen, 58 Geraete, 6.624 Zuordnungen |
| 108 | `10_training/108_exercise_curation_rest.sql` | Rest-Kuration E-14 bis E-19: Achilles-Sehne entfernt, none geprueft, Primary/Secondary-Doppelrollen bereinigt | Endbestand 1.416 Uebungen, 95 Muskelgruppen, 58 Geraete, 6.588 Zuordnungen |
| 109 | `10_training/109_exercise_catalog_enrichment.ts` | XLSX-Anreicherung aus `media/exercises/katalog/1500+ exercise data.xlsx`: Muskel-Rohtexte, Geraete- und Kategorie-Rohwerte fuer sichere Bestandsuebungen | 1.407 eindeutige Anreicherungen, 8 mehrdeutig, 1 fehlend |
| 109a | `10_training/109a_equipment_groups_disciplines.sql` | Geraetegruppen, deutsche Geraetenamen und Disziplinen fuer die Uebungssuche | 58 Geraete gruppiert, 1.416 Disziplinen gesetzt, 6.588 Muskelzuordnungen unveraendert |
| 106 | `10_training/106_workout_sessions.sql` | Training-Userdaten: `workout_sessions`, `workout_exercises`, `workout_sets` | 3 Tabellen, 4 Funktionen, RLS je Operation |
| 120 | `12_recovery/120_recovery_checkins.sql` | Recovery-Userdaten: `checkins` | 1 Tabelle, 1 Funktion, RLS je Operation |
| 121 | `12_recovery/121_recovery_scores_modalities.sql` | Recovery-Score-Schnappschuesse und Modalitaeten: `scores`, `modality_log`, zentrale Konstanten | 2 Tabellen, 7 Funktionen, RLS je Operation |
| 130 | `13_supplements/130_supplements_schema.sql` | Supplements-Schema: `supplement_catalog`, `supplement_interactions`, `user_stacks`, `stack_items`, `intake_logs`, `daily_intake_summary` | 5 Tabellen, 1 Sicht, 2 Funktionen, RLS je Operation |
| 131 | `13_supplements/131_supplements_katalog.ts` | Standard-Supplement-Katalog aus `daten/supplement-katalog.json` | 44 aktive Supplements |
| 132 | `13_supplements/132_substance_alias_bridge.ts` | Substanz-Aliasbrücke zwischen LumeOS-Supplements, F-05-Kandidaten und Kimi-Substanzen | `crawl_022`: 291 Kimi-Substanzen, mindestens 16 LumeOS↔Kimi-Treffer |
| 134 | `13_supplements/134_substance_catalog.ts` | Konsolidierter Substanzkatalog aus Kimi, LumeOS und F-05 mit Herkunft je Zeile | 567 Substanzen, 667 Herkunftszeilen |
| 135 | `13_supplements/135_supplement_nutrients.ts` | Supplement-Naehrstoffbruecke aus `daten/supplement-naehrstoffcodes.json` | 17 Zuordnungen, 1 Tagesfunktion |
| 149 | `13_supplements/149_folate_unit_guard.sql` | C-149: Folat ohne belegte DFE-Umrechnung aus der bekannten Naehrstoffbilanz ausschliessen | 1 Folat-Zeile `unbekannt`; keine Referenzwerte geaendert |
| 221 | `_ableitung/221_food_tag_set_v1.sql` | G-221: E-22-V1 nur fuer belegte, konfliktfreie Tags: `high_fat` aus amtlicher 100-g-Schwelle und `gluten_free` aus expliziten BLS-Namen | `FAT > 17,5 g/100 g`; keine Negationsableitung; `lactose_free` und drei Makro-Schwellen bleiben offen |
| 140 | `14_medical/140_medical_schema.sql` | Medical-Schema: `biomarker_catalog`, `biomarker_reference_ranges`, `lab_reports`, `lab_result_values`, `lab_result_values_read()` | 4 Tabellen, 1 Funktion, RLS je Operation |
| 141 | `14_medical/141_biomarker_katalog.ts` | LOINC-Masterkatalog aus `daten/biomarker-loinc/` und kuratierte Referenzbereich-Kandidaten aus `biomarker-katalog.json` | 11.676 LOINC-Codes, 464 Referenzbereich-Zeilen |
| 142 | `14_medical/142_laborimport_matching.sql` | Laborimport-Zuordnung: `biomarker_aliases`, Importfunktionen und Match-Status an Messwerten | 1 Tabelle, 2 Funktionen, unbekannte Marker bleiben speicherbar |
| 143 | `14_medical/143_biomarker_aliases.ts` | Biomarker-Aliase aus dem Vorgaengerrepo und kuratierte Mehrdeutigkeitszeilen | 292 Aliaszeilen, davon 6 bewusst mehrdeutig |
| 144 | `14_medical/144_biomarker_spec_enrichment.ts` | Spec-Extraktion fuer Medical-Panels, deutsche Namen, Kurznamen und nutzbare numerische Bereichszeilen | 49 Spec-/Alias-Marker im LOINC-Katalog, 45 display-nutzbar, 564 Referenzbereich-Zeilen gesamt |
| 145 | `14_medical/145_medications_schema.sql` | Medikamente und Conditions: Katalogtabellen, `user_medications`, `user_conditions` | 5 Tabellen, RLS je Operation auf Nutzerdaten |
| 146 | `14_medical/146_medications_katalog.ts` | Kimi-Medikamentenkatalog aus `backup/kimi-research/.../data/medications/` | 56 Wirkstoffe, 119 Formulierungen, 124 Produkte |
| 147 | `14_medical/147_substance_lab_markers.ts` | Substanz-Labormarker-Bruecke aus Kimi `lab_effects` gegen den LOINC-Katalog | 66 Marker, 222 Effektzeilen, 203 Markerlinks |
| 146a | `13_supplements/132a_rule_input_status.sql` | Regel-Eingangsdiagnose für Kimi-Regeln: fehlende Pfade werden als `missing_input` gemeldet | 1 Funktion, kein Regelimport |
| 133 | `13_supplements/133_kimi_rules.ts` | Kimi-Warn-, Gap- und Medikamentenregeln als Katalogdaten, plus dreistufige Regelauswertung | 29 Warnregeln, 15 Gap-Regeln, 20 Medikamentenregeln |
| 110 | `11_goals/110_goals_zielwerte.sql` | Schema `goals`, `nutrition_targets`, `berechne_zielwerte`, `zielwerte_am` | Tagesziele mit Gueltigkeitsdatum (GO-03/GO-04) |
| 111 | `11_goals/111_goals_ziele_phasen.sql` | Goals-Userdaten: `user_goals`, `goal_phases`, `phase_am`; Zielhistorie kennt `achieved`, `missed`, `abandoned` | 2 Tabellen, 1 Funktion, RLS je Operation |
| 112 | `11_goals/112_body_measurements.sql` | Goals-Koerperdaten: `body_measurements`, `body_circumferences` und Profilgewicht-Sync | 2 Tabellen, 3 Funktionen, RLS je Operation |
| 113 | `11_goals/113_goal_milestones_adaptive_tdee.sql` | Goals-Meilensteine, adaptive TDEE mit `alpha = 1` und Fortschritts-Trigger fuer Koerper- und Trainingswerte | 1 Tabelle, 5 Funktionen, 2 Trigger, RLS je Operation |
| 059 | `05_user_tabellen/059_daily_reference_assessment.sql` | Funktion `daily_reference_assessment()` fuer lange Tageswerte gegen Profil, Referenzwerte und Goals-Fettsaeureziele | 1 Funktion |
| 059a | `_ableitung/030_mikro-uebersicht.ts` | Kuratierte Mikro-Overview-Auswahl, `micronutrient_snapshot()` und `micronutrient_below_threshold()` | 8 Auswahlzeilen, 2 Funktionen |
| 017 | `00_querschnitt/017_datenherkunft.sql` | A-17 Herkunftsspalten fuer User-Messdaten vor Geraeteanbindungen | 7 Tabellen ergaenzt, Bestandsdaten `manual` |
| 058b | `05_user_tabellen/058b_recipes_meal_plans.sql` | Rezepte, Rezeptzutaten, Wochenplaene und Uebernahmefunktionen; Naehrwerte bleiben aus Zutaten berechnet und werden erst in `meal_items` eingefroren | 6 Tabellen, 4 Funktionen, RLS je Operation |
| 150 | `15_coach/150_coach_permissions_autonomy.sql` | Coach-Rechtemodell: `client_permissions`, `client_autonomy`, Widerrufshistorie, Pending Actions und Action Log | 6 Tabellen, 19 Policies, RLS je Operation |
| 151 | `15_coach/151_coach_relationships.sql` | Coach-Beziehung mit Anbahnung, Annahme, Ende und Historie: `relationships`, `relationship_change_log` | 2 Tabellen, 5 Policies, kein DELETE |
| 152 | `15_coach/152_coach_lesepfad.sql` | Coach-Lesepfad: `coach.hat_sicht()` als eine Sichtregel, full-Policies auf den Nutzerdaten der sechs Module, summary-Funktionen je Modul | 22 `coach_read`-Policies, 7 Funktionen |
| 153 | `15_coach/153_coach_checkins.sql` | Check-in-Vorlagen und -Instanzen mit Statusmaschine `pending/submitted/reviewed/missed`; Analyse rechnet die Anwendung, nicht die DB | 2 Tabellen, 7 Policies |
| 154 | `15_coach/154_coach_messages_alerts.sql` | Nachrichten Coach↔Klient und Alerts als Arbeitsliste — beide RLS, Alerts bewusst ohne Schweregrad | 2 Tabellen, 6 Policies |

**Reihenfolge innerhalb von 05:** `[cmd]` `053` braucht `meals` aus `052`,
`055` braucht `nutrition.touch_updated_at()` aus `052`, `056` braucht
`water_logs` aus `055`, `056a` liest die Sicht aus `056` und
`public.profiles.body_weight_kg` aus `090`. Einzeln laufen sie nicht.

**`052` bis `056` brauchen das Schema `auth`.** `[cmd]` Ihre Policies
rufen `auth.uid()`; ohne `auth` bricht `052` bei der ersten Policy ab —
mit `ERROR: schema "auth" does not exist`, nachdem die Tabellen bereits
angelegt waren. Da der Schritt in einer Transaktion läuft, wird alles
zurückgerollt und **es bleibt keine Spur**. Bei einem Aufbau gegen eine
Datenbank ohne Supabase-Auth fehlen die Diary-Objekte deshalb
kommentarlos.

**Ausfuehrung:** `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts` liest
`supabase/_pipeline/kette.json`. Diese Datei ist die Steuerung; die Tabelle
hier ist Dokumentation und wird mit
`pnpm exec tsx supabase/_pipeline/_validierung/kette-readme-pruefen.ts`
gegen die Steuerdatei abgeglichen.

**Abschlussprüfung:** `pnpm exec tsx
_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts` — vergleicht
das Schema gegen die Sollliste in
`_pipeline/daten/schema-sollstand.json`. `[cmd]` Am 2026-08-16 fielen
`meals`, `meal_items`, `water_logs` und zwei Sichten aus, ohne dass ein
Kettenlauf sich beschwert hätte; die Prüfung zählte nur, was sie
erwartete.

**Zwei Stolpersteine beim Neuaufbau von leer** (`[cmd]` 2026-08-16
erlebt):

1. **`public.handle_new_user()` und `public.is_admin()` überleben
   `DROP SCHEMA nutrition CASCADE`** — sie liegen in `public`. Die
   Baseline bricht dann mit `function "handle_new_user" already exists`
   ab, und wegen `ON_ERROR_STOP=1` steht die ganze Kette. Beim Leeren
   mit weglöschen:
   ```
   DROP SCHEMA IF EXISTS nutrition CASCADE;
   DROP TABLE IF EXISTS public.profiles CASCADE;
   DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
   DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
   ```
2. **Schritt `030` liest die CSVs im Container**, nicht im Repo:
   `\copy` läuft im psql-Client. Die Dateien aus `supabase/_data/`
   müssen vorher nach `/tmp/p1-005-bls-local-import/` **im Container**
   kopiert werden (`docker cp`), sonst
   `No such file or directory`.

**Herkunft der Baseline-Struktur** (historische Kettenschritte, bleiben als
Referenz und für Weiterentwicklung):

| # | Datei | Beitrag zur Struktur |
|---|---|---|
| Slices | `_archive/20260513_001`, `_002`, `20260514_001` | Schema `nutrition`, `nutrient_defs`, `foods`, `food_nutrients` (seit 2026-08-05 archiviert — durch die Baseline ersetzt) |
| 050 | `05_user_tabellen/050_preferences_foundation.sql` | `food_preferences`, `food_preference_items` inkl. RLS + `uq_food_pref_items_user_food` |
| 051 | `05_user_tabellen/051_curation_persistence.sql` | `food_curation_candidates`, `_decisions` |
| 052 | `05_user_tabellen/052_diary_foundation.sql` | **`nutrition.meals` + `nutrition.meal_items`** (C-03/WP-02, ADR-0003) inkl. eigener Grants, RLS und **je 4 Policies pro Tabelle**, historischer `uq_meals_user_date_type` (wird durch 052a entfernt), Eigentümer-Wachhund auf `meal_items` — v052: 21 Prüfungen. **Noch nicht live** (Stand 2026-08-06, wartet auf Freigabe) |
| 060 | `06_zugriff/060_zugriffsschicht.sql` | pg_trgm, 2 Trigram-Indizes, Grants, RLS/Policies auf allen 11 Tabellen — **live seit 2026-08-02** |
| 061 | `06_zugriff/061_rollen_admin.sql` | **`public.is_admin()`** (liest nur den JWT-Claim `app_metadata->>role`, Standard `false`) + SELECT-Grant und je 1 SELECT-Policy auf die beiden Curation-Tabellen — **live seit 2026-08-06** (C.3). Keine Schreib-Policies. Rollen werden **nicht** von der Kette vergeben, siehe Dateikopf. v061: 15 Prüfungen |
| 070 | `07_lesefunktionen/070_lesefunktionen.sql` | 6 RPC-Funktionen (`search_fold`, `food_search`, `food_categories_tree`, `preference_search_preview` mit 14 Argumenten, `curation_overview`, `schema_debug`) — v070: 18 Prüfungen |
| 090 | `09_identitaet/090_profile.sql` | **`public.profiles` + Trigger `on_auth_user_created` auf `auth.users`** (die Anmeldung), C-47-Profilachsen, C-63 `locale`, C-140 `experience_level`, 4 Policies — v090: 18 Prüfungen |

**`020` läuft zweimal:** Es legt Strukturen an *und* enthält die Ableitungen,
die gegen `food_nutrients` arbeiten — also gegen Daten, die erst `030`
einspielt. Erster Lauf `INSERT 0 0`, zweiter Lauf greift. Durchgängig
`ON CONFLICT DO NOTHING`, gefahrlos wiederholbar. `[cmd]` verifiziert.

**`021` ist notwendig (D-16, geklärt 2026-08-02):** Die frühere Annahme
„ohne sichtbaren Effekt, durch `020` abgedeckt" ist **widerlegt**.
`[cmd]` `020` legt den `wild`-Kategoriebaum nur an; die Zuweisung der
BLS-Präfixe `V2%` macht ausschliesslich `021` — `affected_rows = 49`
im Kettenlauf, Container: 49 von 49 `V2%`-Foods in `wild`, 0 ohne
Kategorie. 49 der 4.903 Kategoriezuweisungen stammen aus `021`.

### Die Ableitungen

`[read]` Deterministisch aus `food_nutrients`, je 100 g, Konfidenz fest 1.0:

| Tag | Regel | Zeilen im Container |
|---|---|---|
| `high_protein` | `PROT625 >= 20` | 1.400 |
| `low_carb` | `CHO <= 10` | 4.659 |
| `low_fat` | `FAT <= 3` | 2.648 |
| `high_fiber` | `FIBT >= 6` | 558 |
| `high_fat` | `FAT > 17,5` | 1.233 |

`gluten_free` wird ausschliesslich bei explizitem `glutenfrei`/`gluten-free`
im kanonischen BLS-Namen gesetzt; fehlendes `contains_gluten` ist keine
Gegenprobe. `lactose_free` bleibt offen: 11 von 12 explizit laktosefreien
Namen tragen noch `contains_lactose`.

**Diese Regeln existieren nur an einer Stelle: in `020` beziehungsweise fuer
die belegten E-22-Ergaenzungen in `221`.** Nicht kopieren.
Die archivierte Migration `20240522_002` beschreibt einen abweichenden Weg
über denormalisierte Makro-Spalten und einen Trigger — `[cmd]` beides
existiert im Container nicht und ist nicht der reale Weg.

### Die Zugriffsschicht (`060`)

Seit 2026-08-02 (M1 Teil A) und **live auf der laufenden Instanz**:
pg_trgm + 2 Trigram-GIN-Indizes (`foods.name_display`,
`food_aliases.alias`), Grants (USAGE; SELECT auf die 7 Stammdatentabellen
für `authenticated`; DML auf die 2 Preference-Tabellen; ALL für
`service_role`; **anon hat kein USAGE**), RLS auf allen 11 Tabellen
(Stammdaten: 1 SELECT-Policy; Nutzerdaten: 4 Policies je Operation mit
`auth.uid()`; Curation: RLS an, keine Policy — keine `user_id`-Spalte,
offene Frage). Validierung: `_pipeline/_validierung/v060_zugriff.sql`
(Soll/Ist, 22 Prüfungen). `config.toml`: `[api].schemas` enthält
`nutrition` (aktiv).

**Warum `052` seine Grants selbst mitbringt** (2026-08-06): `060` ist
live und beschreibt die 11 Tabellen des Altbestands. Neue Tabellen dort
nachzutragen hiesse, eine bereits angewendete Datei zu ändern — und die
Default-Privileges aus `060` Abschnitt 3e vergeben bewusst nur `SELECT`
an `authenticated`, nicht DML. Eine neue Nutzerdaten-Tabelle bekäme also
ohne eigenen Grant Policies, die ins Leere greifen (PostgREST prüft
Tabellenrechte **vor** RLS). Deshalb trägt `052` Grants, RLS und Policies
für seine beiden Tabellen selbst — nach demselben Muster wie `060`
Abschnitt 4c. Wer künftig Nutzerdaten-Tabellen ergänzt, macht es genauso.

---

## Rohdaten

`_data/bls_4_0_local_import.zip` (4,1 MB) enthält:

| Datei | Zeilen | Ziel |
|---|---|---|
| `foods.csv` | 7.140 (+ Kopf) | `nutrition.foods` |
| `food_nutrients.csv` | 698.092 (+ Kopf) | `nutrition.food_nutrients` |

`[cmd]` 2026-08-02: Archiv-Inhalt ist **byte-identisch** (MD5) mit der
historischen Container-Kopie, und ein vollständiger Kettenlauf aus dem
entpackten Archiv erzeugte den identischen Endzustand
(`docs/ssot/33-pipeline-verifikation.md`, dritter Lauf). Damit ist das
Archiv die verifizierte Quelle; `tmp/nutrition/p1-005-bls-local-import/`
ist entbehrlich (Löschliste A-05).

Nur das Archiv ist versioniert; entpackte CSV sind über `_data/.gitignore`
ausgeschlossen. **Vor dem Import entpacken:** `030_apply_local.sql` erwartet
die Dateien unter `/tmp/p1-005-bls-local-import/` (Pfad im Skript;
im Docker-Setup per `docker cp` in den DB-Container legen —
die Container-Kopie ist flüchtig und nach Neustarts neu einzuspielen).

---

## Was noch offen ist

1. **Register-Umtrag (D-17, Schritt 5):** Die Baseline liegt und ist
   belegt; der Umtrag des Registers der laufenden DB (Geist-Eintrag raus,
   Baseline rein) ist **vorgelegt und wartet auf Toms Freigabe**.
2. **Seed-Strategie (O-5):** Kataloge als Migration oder Pipeline-Schritt?
3. **Curation-Tabellen ohne `user_id`:** Policies erst möglich, wenn die
   Spalte kommt — oder bewusst Service-Role-only lassen.

---

## Regeln

- Kein `supabase db reset` gegen die laufende Instanz — Deny-Regel in
  `.claude/settings.json`. Jeder Test gehört in eine Wegwerf-Datenbank.
- Ableitungsregeln nur an einer Stelle (`020`). Wer sie kopiert, erzeugt Drift.
- `021` gehört zur Kette — nicht überspringen (49 Zuweisungen).
- Vor jedem Schritt die zugehörige Validierung aus `_pipeline/_validierung/`.
- `_archive/` ist tot: nicht zitieren, nicht ausführen.

---

## Wiederholbarkeit — Einschränkung

`[cmd]` 2026-08-03 geprüft: Die Kettenschritte **015 bis 090** sind
wiederholbar, jeder zweite Lauf liefert dasselbe Ergebnis ohne Fehler.

Für die **Baseline** gilt das nicht und soll es nicht: sie ist eine
Einmal-Migration (`CREATE TABLE` ohne Guards), das Register führt sie genau
einmal aus. Von Hand nur gegen leere Datenbanken anwenden.

Für die drei **archivierten Slices** (bis 2026-08-05 in `migrations/`) galt:

| Datei (jetzt `_archive/`) | Lauf 1 | Lauf 2 |
|---|---|---|
| `20260513_001` | ok | Fehler |
| `20260513_002` | ok | Fehler |
| `20260514_001` | ok | ok |

Ursache in `001` ist ein falsch-positiver Textvergleich im eigenen
Drift-Wächter. Praktisch folgenlos, weil das CLI-Register jede Migration nur
einmal ausführt — aber wer die Dateien von Hand anwendet, muss es wissen.

Eine frühere Fassung dieser Datei nannte die Schema-Stufe „idempotent".
Das war aus der Existenz der Guards geschlossen, nicht getestet.
