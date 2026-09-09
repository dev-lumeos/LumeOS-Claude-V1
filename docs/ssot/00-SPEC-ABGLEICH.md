# Spec gegen Schema

**Erzeugt von `tools/spec-abgleich.mjs`.** `[read]` **Nicht von
Hand aendern.**

`[read]` **Es ersetzt das Lesen nicht** ? **es sagt, WO gelesen
werden muss.**

`[cmd]` **Stand 2026-09-09: 176 Tabellen, 103 in Specs genannt, 57 ohne Entsprechung, 129 ohne Erwaehnung.**

## Die Spec nennt, das Schema hat nicht

`[read]` **Entweder ungebaut, oder umbenannt** ? **der zweite Fall
ist der gefaehrliche, weil der Name plausibel bleibt.**

| Genannt | Art | Fundstelle |
|---|---|---|
| `coach.client_adherence_summary` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:302 |
| `coach.client_autonomy_history` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:279 |
| `coach.client_autonomy_levels` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:252 |
| `coach.coach_alerts` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:149 (+1) |
| `coach.coach_checkin_templates` | ungebaut | docs\specs\HumanCoach\SPEC_08_IMPORT_PIPELINE.md:244 (+1) |
| `coach.coach_client_permissions` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:113 (+1) |
| `coach.coach_clients` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:74 (+2) |
| `coach.coach_messages` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:330 |
| `coach.coach_rule_templates` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:228 (+4) |
| `coach.coach_rules` | ungebaut | docs\specs\HumanCoach\SPEC_06_DATABASE_SCHEMA.md:165 (+1) |
| `goals.goal_adjustments` | ungebaut | docs\specs\Goals\CONSOLIDATED_KNOWLEDGE.md:159 (+2) |
| `goals.goal_contributions` | ungebaut | docs\specs\Goals\CONSOLIDATED_KNOWLEDGE.md:157 (+5) |
| `goals.progress_photos` | ungebaut | docs\specs\Goals\CONSOLIDATED_KNOWLEDGE.md:162 (+4) |
| `goals.tdee_settings` | ungebaut | docs\specs\Goals\CONSOLIDATED_KNOWLEDGE.md:158 (+5) |
| `goals.user_goal_dashboard` | ungebaut | docs\specs\Goals\DATABASE.md:25 |
| `goals.weekly_contributions_summary` | ungebaut | docs\specs\Goals\DATABASE.md:26 |
| `goals.weekly_reports` | ungebaut | docs\specs\Goals\DATABASE.md:22 (+1) |
| `medical.biomarker_population_statistics` | ungebaut | docs\specs\Medical\SPEC_08_IMPORT_PIPELINE.md:102 (+2) |
| `medical.medical_alerts` | ungebaut | docs\specs\Medical\SPEC_06_DATABASE_SCHEMA.md:342 (+1) |
| `medical.user_biomarker_results` | ungebaut | docs\specs\Medical\SPEC_06_DATABASE_SCHEMA.md:145 (+4) |
| `medical.user_health_metrics` | ungebaut | docs\specs\Medical\SPEC_06_DATABASE_SCHEMA.md:234 (+1) |
| `medical.user_symptoms` | ungebaut | docs\specs\Medical\SPEC_06_DATABASE_SCHEMA.md:266 (+1) |
| `nutrition.coach_nutrition_suggestions` | ungebaut | docs\specs\Nutrition\05_reviews\OPUS_REVIEW_NUTRITION_02_DATA_API.md:58 (+2) |
| `nutrition.daily_nutrition_summary` | ungebaut | docs\specs\Goals\OPEN_ITEMS.md:11 (+1) |
| `nutrition.daily_summary` | ungebaut | docs\specs\Nutrition\04_adrs\ADR_SUPPLEMENTS_API_BOUNDARY.md:8 |
| `nutrition.food_portions` | ungebaut | docs\specs\Nutrition\01_current_specs\SPEC_06_DATABASE_SCHEMA.md:1310 (+1) |
| `nutrition.meal_item_snapshot_history` | ungebaut | docs\specs\Nutrition\05_reviews\OPUS_REVIEW_NUTRITION_02_DATA_API.md:528 (+1) |
| `nutrition.meal_plan_items` | ungebaut | docs\specs\Nutrition\01_current_specs\SPEC_06_DATABASE_SCHEMA.md:34 (+3) |
| `nutrition.mealcam_scans` | ungebaut | docs\specs\Nutrition\01_current_specs\SPEC_06_DATABASE_SCHEMA.md:1312 (+3) |
| `nutrition.micro_flags` | ungebaut | docs\specs\Nutrition\01_current_specs\SPEC_06_DATABASE_SCHEMA.md:38 (+2) |
| `nutrition.nutrition_targets` | anderes Schema: goals | docs\specs\Nutrition\01_current_specs\SPEC_06_DATABASE_SCHEMA.md:37 (+2) |
| `nutrition.recipe_items` | ungebaut | docs\specs\Nutrition\01_current_specs\SPEC_06_DATABASE_SCHEMA.md:31 (+9) |
| `nutrition.user_recent_portions` | ungebaut | docs\specs\Nutrition\01_current_specs\SPEC_06_DATABASE_SCHEMA.md:1311 (+1) |
| `nutrition.weight_logs` | ungebaut | docs\specs\Goals\OPEN_ITEMS.md:11 |
| `recovery.hrv_baselines` | ungebaut | docs\specs\Recovery\SPEC_06_DATABASE_SCHEMA.md:226 (+1) |
| `recovery.hrv_measurements` | ungebaut | docs\specs\Recovery\SPEC_06_DATABASE_SCHEMA.md:194 (+2) |
| `recovery.muscle_recovery_params` | ungebaut | docs\specs\Recovery\SPEC_08_IMPORT_PIPELINE.md:86 (+1) |
| `recovery.recovery_checkins` | ungebaut | docs\specs\Recovery\SPEC_06_DATABASE_SCHEMA.md:16 (+3) |
| `recovery.recovery_modalities` | ungebaut | docs\specs\Recovery\SPEC_06_DATABASE_SCHEMA.md:291 (+2) |
| `recovery.recovery_scores` | ungebaut | docs\specs\Recovery\SPEC_06_DATABASE_SCHEMA.md:68 (+4) |
| `recovery.sleep_data` | ungebaut | docs\specs\Recovery\SPEC_06_DATABASE_SCHEMA.md:246 (+1) |
| `recovery.training_load_logs` | ungebaut | docs\specs\Recovery\SPEC_06_DATABASE_SCHEMA.md:125 (+3) |
| `recovery.user_protocol_assignments` | ungebaut | docs\specs\Recovery\SPEC_06_DATABASE_SCHEMA.md:415 (+1) |
| `recovery.wearable_source_config` | ungebaut | docs\specs\Recovery\SPEC_08_IMPORT_PIPELINE.md:126 (+1) |
| `supplements.daily_intake_summary` | ungebaut | docs\specs\Nutrition\04_adrs\ADR_SUPPLEMENTS_API_BOUNDARY.md:9 |
| `supplements.enhanced_substances` | ungebaut | docs\specs\Supplements\SPEC_06_DATABASE_SCHEMA.md:89 (+10) |
| `supplements.supplement_catalog` | ungebaut | docs\specs\Supplements\SPEC_06_DATABASE_SCHEMA.md:16 (+17) |
| `training.exercise_aliases` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:18 (+4) |
| `training.exercise_progression_configs` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:28 (+2) |
| `training.muscle_readiness` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:32 |
| `training.personal_records` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:27 (+2) |
| `training.post_workout_feedback` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:29 (+2) |
| `training.routine_exercises` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:22 (+2) |
| `training.routine_schedule_days` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:23 (+2) |
| `training.strength_standards` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:20 (+2) |
| `training.volume_landmarks` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:30 (+3) |
| `training.weekly_volume_summary` | ungebaut | docs\specs\Training\SPEC_06_DATABASE_SCHEMA.md:31 |

## Das Schema hat, keine Spec nennt es

`[read]` **Undokumentiert** ? **oder unter anderem Namen
beschrieben.**

- `coach.action_log`
- `coach.alerts`
- `coach.autonomy_change_log`
- `coach.checkin_templates`
- `coach.client_autonomy`
- `coach.client_consent_log`
- `coach.client_permissions`
- `coach.messages`
- `coach.pending_actions`
- `coach.pending_invites`
- `coach.permission_change_log`
- `coach.relationship_change_log`
- `coach.relationships`
- `goals.phase_transition_responses`
- `medical.appointments`
- `medical.biomarker_aliases`
- `medical.biomarker_catalog`
- `medical.biomarker_explanations`
- `medical.biomarker_spec_enrichment`
- `medical.health_events`
- `medical.injection_logs`
- `medical.injection_needle_recommendations`
- `medical.injection_site_conditions`
- `medical.injection_sites`
- `medical.injection_tissue_condition_guidance`
- `medical.lab_marker_catalog`
- `medical.lab_result_values`
- `medical.medication_clinical_context_evidence`
- `medical.medication_faq`
- `medical.medication_formulations`
- `medical.medication_pk_evidence`
- `medical.medication_products`
- `medical.medication_renal_hepatic_evidence`
- `medical.medication_reproductive_evidence`
- `medical.medication_thailand_regulatory_evidence`
- `medical.medication_user_texts`
- `medical.symptom_biomarker_map`
- `medical.symptoms`
- `medical.user_conditions`
- `nutrition._sortweight_neu`
- `nutrition.exclusion_preset_rules`
- `nutrition.exclusion_presets`
- `nutrition.food_curation_decisions`
- `nutrition.food_preference_search_targets`
- `nutrition.food_tags_kuriert`
- `nutrition.foods`
- `nutrition.meal_plan_entries`
- `nutrition.meal_plan_slots`
- `nutrition.meal_plan_weeks`
- `nutrition.meal_slots`
- `nutrition.meals`
- `nutrition.micronutrient_overview_items`
- `nutrition.nutrient_aliases`
- `nutrition.nutrient_details`
- `nutrition.nutrient_unit_conversion_factors`
- `nutrition.preparation_kinds`
- `nutrition.recipe_curation_candidate_ingredients`
- `nutrition.recipe_curation_candidates`
- `nutrition.recipe_curation_decisions`
- `nutrition.recipes`
- `nutrition.search_events`
- `nutrition.search_synonyms`
- `nutrition.shopping_list_items`
- `recovery.checkins`
- `recovery.modality_log`
- `recovery.score_contributions`
- `recovery.scores`
- `recovery.stress_logs`
- `supplements.alias_resolution_candidates`
- `supplements.entity_cyp`
- `supplements.entity_pk`
- `supplements.entity_renal_hepatic`
- `supplements.entity_transporters`
- `supplements.intake_schedule`
- `supplements.lab_effect_enrichment_records`
- `supplements.pubchem_conflict_records`
- `supplements.rule_catalog`
- `supplements.stack_curation_candidate_items`
- `supplements.stack_curation_candidates`
- `supplements.stack_curation_decisions`
- `supplements.substance_aliases`
- `supplements.substance_group_memberships`
- `supplements.supplement_aas_ratings`
- `supplements.supplement_aliases`
- `supplements.supplement_categories`
- `supplements.supplement_cycle_events`
- `supplements.supplement_dosing`
- `supplements.supplement_evidence`
- `supplements.supplement_faq`
- `supplements.supplement_field_sources`
- `supplements.supplement_groups`
- `supplements.supplement_human_evidence_flags`
- `supplements.supplement_identifiers`
- `supplements.supplement_lab_effects`
- `supplements.supplement_monitoring`
- `supplements.supplement_nutrients`
- `supplements.supplement_organ_risks`
- `supplements.supplement_pharmacology`
- `supplements.supplement_portions`
- `supplements.supplement_protocol_items`
- `supplements.supplement_protocol_requirements`
- `supplements.supplement_protocols`
- `supplements.supplement_quality`
- `supplements.supplement_regulatory`
- `supplements.supplement_reminders`
- `supplements.supplement_safety`
- `supplements.supplement_studies`
- `supplements.supplement_study_subjects`
- `supplements.supplement_tag_definitions`
- `supplements.supplement_tags`
- `supplements.supplement_user_texts`
- `supplements.supplement_wada`
- `supplements.supplement_warnings`
- `supplements.supplements`
- `supplements.thailand_regulatory_records`
- `supplements.user_supplement_cycles`
- `supplements.wada_conflict_records`
- `training.equipment`
- `training.exercise_catalog_enrichment`
- `training.exercises`
- `wissen.buddy_knowledge_records`
- `wissen.community_records`
- `wissen.evidence_register_entries`
- `wissen.knowledge_gap_records`
- `wissen.product_entities`
- `wissen.rule_engine_field_specs`
- `wissen.rule_engine_rules`
- `wissen.rule_trait_mappings`
- `wissen.travel_medication_records`
