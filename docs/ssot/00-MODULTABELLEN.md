# Die Tabellen der Modulschemata

**Erzeugt von `tools/ssot-modultabellen.mjs`.** `[read]` **Nicht von
Hand aendern** — **die Quelle ist die Datenbank.**

`[read]` **Diese Datei sagt, WAS an Tabellen da ist.** `[read]`
**Warum etwas so gebaut ist, ob es angebunden ist und was fehlt,
steht in den Modul-Dateien** — das bleibt Handarbeit.

`[cmd]` **Jede Zahl kommt aus `information_schema` oder `pg_*`.**
**Keine aus einem Dateinamen** — nachweisbar mit
`node tools/ssot-modultabellen.mjs --pruefen`. `[read]` **Der Grund
steht in G-382:** ein Erzeuger, der nach Dateinamen zaehlt, meldete
fuer `goals` null Lesewege, weil `goals` seine Dateien anders nennt.

`[cmd]` **Stand: 2026-09-10 — 170 Tabellen, 2402 Spalten in 7 Modulen.**

`[read]` **Die Zeilenzahlen sind der Bestand der Entwicklungs-
datenbank an diesem Tag, ueber alle Konten** — kein Nutzerstand.

## coach — 15 Tabellen, 184 Spalten

| Tabelle | Spalten | Zeilen | seit |
|---|---|---|---|
| `action_log` | 12 | 1 | ? |
| `alerts` | 13 | 6 | ? |
| `autonomy_change_log` | 9 | 6 | ? |
| `checkin_templates` | 10 | 2 | ? |
| `checkins` | 16 | 6 | ? |
| `client_autonomy` | 15 | 4 | ? |
| `client_consent_log` | 9 | 0 | ? |
| `client_permissions` | 22 | 4 | ? |
| `coach_profiles` | 7 | 1 | ? |
| `messages` | 7 | 6 | ? |
| `pending_actions` | 14 | 2 | ? |
| `pending_invites` | 15 | 0 | 2026-09-09 |
| `permission_change_log` | 9 | 6 | ? |
| `relationship_change_log` | 9 | 9 | ? |
| `relationships` | 17 | 6 | ? |

## goals — 7 Tabellen, 116 Spalten

| Tabelle | Spalten | Zeilen | seit |
|---|---|---|---|
| `body_circumferences` | 22 | 54 | ? |
| `body_measurements` | 17 | 362 | ? |
| `goal_milestones` | 20 | 13 | ? |
| `goal_phases` | 14 | 5 | ? |
| `nutrition_targets` | 14 | 5 | ? |
| `phase_transition_responses` | 6 | 0 | ? |
| `user_goals` | 23 | 11 | ? |

## medical — 29 Tabellen, 457 Spalten

| Tabelle | Spalten | Zeilen | seit |
|---|---|---|---|
| `appointments` | 16 | 3 | 2026-09-08 |
| `biomarker_aliases` | 12 | 292 | ? |
| `biomarker_catalog` | 34 | 11676 | ? |
| `biomarker_explanations` | 21 | 66 | ? |
| `biomarker_reference_ranges` | 19 | 560 | ? |
| `biomarker_spec_enrichment` | 31 | 51 | ? |
| `health_events` | 13 | 4 | 2026-09-08 |
| `injection_logs` | 12 | 0 | 2026-09-02 |
| `injection_needle_recommendations` | 12 | 8 | 2026-09-02 |
| `injection_site_conditions` | 10 | 0 | 2026-09-02 |
| `injection_sites` | 10 | 16 | 2026-09-02 |
| `injection_tissue_condition_guidance` | 6 | 1 | 2026-09-02 |
| `lab_marker_catalog` | 13 | 66 | ? |
| `lab_reports` | 12 | 12 | ? |
| `lab_result_values` | 27 | 280 | ? |
| `medication_active_substances` | 28 | 498 | ? |
| `medication_clinical_context_evidence` | 5 | 107 | ? |
| `medication_faq` | 13 | 2313 | ? |
| `medication_formulations` | 13 | 453 | ? |
| `medication_pk_evidence` | 8 | 407 | ? |
| `medication_products` | 11 | 448 | ? |
| `medication_renal_hepatic_evidence` | 9 | 391 | ? |
| `medication_reproductive_evidence` | 11 | 498 | ? |
| `medication_thailand_regulatory_evidence` | 6 | 477 | ? |
| `medication_user_texts` | 42 | 498 | ? |
| `symptom_biomarker_map` | 15 | 102 | ? |
| `symptoms` | 8 | 34 | ? |
| `user_conditions` | 15 | 2 | ? |
| `user_medications` | 25 | 2 | ? |

## nutrition — 45 Tabellen, 540 Spalten

| Tabelle | Spalten | Zeilen | seit |
|---|---|---|---|
| `_sortweight_neu` | 2 | 7140 | ? |
| `exclusion_preset_rules` | 6 | 33 | ? |
| `exclusion_presets` | 8 | 11 | ? |
| `food_aliases` | 4 | 32845 | 2026-08-05 |
| `food_categories` | 11 | 518 | 2026-08-05 |
| `food_curation_candidates` | 12 | 0 | 2026-08-05 |
| `food_curation_decisions` | 6 | 0 | 2026-08-05 |
| `food_groups` | 5 | 19 | ? |
| `food_nutrients` | 5 | 985320 | 2026-08-05 |
| `food_preference_items` | 13 | 15 | 2026-08-05 |
| `food_preference_search_targets` | 8 | 39603 | ? |
| `food_preferences` | 14 | 3 | 2026-08-05 |
| `food_tags` | 3 | 30797 | 2026-08-05 |
| `food_tags_kuriert` | 5 | 0 | 2026-09-02 |
| `foods` | 14 | 7140 | 2026-08-05 |
| `foods_custom` | 46 | 0 | ? |
| `foods_portions` | 12 | 23402 | ? |
| `meal_items` | 26 | 9065 | ? |
| `meal_plan_days` | 8 | 224 | ? |
| `meal_plan_entries` | 18 | 728 | ? |
| `meal_plan_logs` | 14 | 8 | ? |
| `meal_plan_slots` | 7 | 38 | 2026-09-02 |
| `meal_plan_weeks` | 8 | 32 | ? |
| `meal_plans` | 21 | 10 | ? |
| `meal_slots` | 4 | 14 | ? |
| `meals` | 10 | 2906 | ? |
| `micronutrient_overview_items` | 8 | 8 | ? |
| `nutrient_aliases` | 7 | 98 | ? |
| `nutrient_defs` | 20 | 138 | 2026-08-05 |
| `nutrient_details` | 31 | 110 | ? |
| `nutrient_reference_values` | 25 | 166 | ? |
| `nutrient_unit_conversion_factors` | 13 | 10 | ? |
| `preparation_kinds` | 6 | 11 | ? |
| `recipe_curation_candidate_ingredients` | 13 | 0 | ? |
| `recipe_curation_candidates` | 18 | 0 | ? |
| `recipe_curation_decisions` | 6 | 0 | ? |
| `recipe_ingredients` | 15 | 22 | ? |
| `recipes` | 19 | 6 | ? |
| `search_events` | 9 | 337 | ? |
| `search_synonyms` | 4 | 4877 | ? |
| `shopping_list_items` | 15 | 33 | ? |
| `shopping_lists` | 12 | 6 | ? |
| `tag_definitions` | 10 | 14 | 2026-08-05 |
| `user_inventory` | 9 | 0 | ? |
| `water_logs` | 10 | 1264 | ? |

## recovery — 7 Tabellen, 126 Spalten

| Tabelle | Spalten | Zeilen | seit |
|---|---|---|---|
| `checkins` | 29 | 370 | ? |
| `modality_log` | 17 | 178 | ? |
| `overtraining_alerts` | 11 | 1 | 2026-09-07 |
| `recovery_protocols` | 12 | 2 | 2026-09-07 |
| `score_contributions` | 11 | 21 | 2026-09-07 |
| `scores` | 34 | 370 | ? |
| `stress_logs` | 12 | 7 | 2026-09-07 |

## supplements — 59 Tabellen, 874 Spalten

| Tabelle | Spalten | Zeilen | seit |
|---|---|---|---|
| `alias_resolution_candidates` | 15 | 64 | ? |
| `entity_cyp` | 15 | 3001 | ? |
| `entity_pk` | 14 | 0 | ? |
| `entity_renal_hepatic` | 13 | 0 | ? |
| `entity_transporters` | 15 | 4617 | ? |
| `intake_logs` | 16 | 810 | ? |
| `intake_schedule` | 18 | 0 | ? |
| `lab_effect_enrichment_records` | 16 | 47 | ? |
| `pubchem_conflict_records` | 16 | 20 | ? |
| `rule_catalog` | 26 | 64 | ? |
| `stack_curation_candidate_items` | 11 | 2 | ? |
| `stack_curation_candidates` | 12 | 2 | ? |
| `stack_curation_decisions` | 6 | 0 | ? |
| `stack_items` | 17 | 12 | ? |
| `stack_template_items` | 13 | 6 | ? |
| `stack_templates` | 17 | 6 | ? |
| `substance_aliases` | 11 | 1541 | ? |
| `substance_group_memberships` | 5 | 8 | 2026-08-29 |
| `supplement_aas_ratings` | 11 | 0 | ? |
| `supplement_aliases` | 8 | 2843 | ? |
| `supplement_categories` | 12 | 23 | ? |
| `supplement_cycle_events` | 11 | 0 | ? |
| `supplement_dosing` | 24 | 596 | ? |
| `supplement_evidence` | 23 | 596 | ? |
| `supplement_faq` | 13 | 1970 | ? |
| `supplement_field_sources` | 12 | 2815 | ? |
| `supplement_groups` | 10 | 3 | ? |
| `supplement_human_evidence_flags` | 17 | 293 | ? |
| `supplement_identifiers` | 9 | 1259 | ? |
| `supplement_interactions` | 22 | 78 | ? |
| `supplement_lab_effects` | 26 | 271 | ? |
| `supplement_monitoring` | 14 | 46 | ? |
| `supplement_nutrients` | 10 | 17 | ? |
| `supplement_organ_risks` | 14 | 1450 | ? |
| `supplement_pharmacology` | 17 | 577 | ? |
| `supplement_portions` | 11 | 79 | ? |
| `supplement_protocol_items` | 15 | 0 | ? |
| `supplement_protocol_requirements` | 13 | 0 | ? |
| `supplement_protocol_template_items` | 12 | 9 | 2026-09-09 |
| `supplement_protocol_templates` | 10 | 3 | 2026-09-09 |
| `supplement_protocols` | 12 | 0 | ? |
| `supplement_quality` | 19 | 237 | ? |
| `supplement_regulatory` | 14 | 1119 | ? |
| `supplement_reminders` | 11 | 0 | ? |
| `supplement_safety` | 20 | 290 | ? |
| `supplement_studies` | 13 | 43 | ? |
| `supplement_study_subjects` | 6 | 47 | ? |
| `supplement_tag_definitions` | 10 | 7 | ? |
| `supplement_tags` | 6 | 425 | ? |
| `supplement_user_texts` | 48 | 446 | ? |
| `supplement_wada` | 22 | 337 | ? |
| `supplement_warnings` | 14 | 290 | ? |
| `supplements` | 22 | 596 | ? |
| `thailand_regulatory_records` | 18 | 1061 | ? |
| `user_inventory` | 15 | 0 | ? |
| `user_stacks` | 12 | 6 | ? |
| `user_supplement_cycles` | 14 | 0 | ? |
| `user_supplement_settings` | 11 | 0 | ? |
| `wada_conflict_records` | 17 | 8 | ? |

## training — 8 Tabellen, 105 Spalten

| Tabelle | Spalten | Zeilen | seit |
|---|---|---|---|
| `equipment` | 7 | 58 | ? |
| `exercise_catalog_enrichment` | 17 | 1407 | ? |
| `exercise_muscles` | 3 | 6588 | ? |
| `exercises` | 17 | 1416 | ? |
| `muscle_groups` | 7 | 95 | ? |
| `workout_exercises` | 16 | 132 | ? |
| `workout_sessions` | 17 | 66 | ? |
| `workout_sets` | 21 | 258 | ? |
