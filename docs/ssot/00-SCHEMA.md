# Schema: Funktionen, Policies, CHECKs, Sichten

**Erzeugt von `tools/ssot-schema.mjs`.** `[read]` **Nicht von Hand
aendern** ? **die Quelle ist die Datenbank.**

`[read]` **Tabellen und Spalten stehen in `00-MODULTABELLEN.md`.**

`[cmd]` **Stand 2026-09-09: 173 Funktionen, 414 Policies, 575 CHECKs, 13 Sichten.**

## Funktionen und Prozeduren

`[read]` **Der Name allein reicht nicht** ? **die Argumente sagen,
ob man sie rufen kann.**

| Modul | Name | Argumente | Art |
|---|---|---|---|
| coach | accept_pending_invite | p_token text | Funktion |
| coach | bestaetige_aktion | p_action_id uuid | Funktion |
| coach | create_pending_invite | p_client_email text, p_expires_at timestamp with time zone, p_initial_autonomy smallint DEFAULT 2 | Funktion |
| coach | create_relationship_invite | p_coach_id uuid, p_note text DEFAULT NULL::text | Funktion |
| coach | darf_nutrition_plan_aendern | p_client uuid | Funktion |
| coach | hat_sicht | p_client uuid, p_modul text, p_stufe text DEFAULT 'full'::text | Funktion |
| coach | klienten |  | Funktion |
| coach | lehne_aktion_ab | p_action_id uuid | Funktion |
| coach | log_autonomy_change |  | Funktion |
| coach | log_permission_change |  | Funktion |
| coach | log_relationship_change |  | Funktion |
| coach | offene_aktionen | p_modul text | Funktion |
| coach | resolve_invite_user_id | p_email text | Funktion |
| coach | set_changed_by |  | Funktion |
| coach | summary_goals | p_client uuid | Funktion |
| coach | summary_medical | p_client uuid | Funktion |
| coach | summary_nutrition | p_client uuid | Funktion |
| coach | summary_recovery | p_client uuid | Funktion |
| coach | summary_supplements | p_client uuid | Funktion |
| coach | summary_training | p_client uuid | Funktion |
| coach | touch_updated_at |  | Funktion |
| coach | withdraw_relationship_invite | p_relationship_id uuid, p_reason text DEFAULT NULL::text | Funktion |
| goals | active_goal_create | p_goal_type text, p_title text, p_gueltig_ab date DEFAULT CURRENT_DATE, p_subtype text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_target_value numeric DEFAULT NULL::numeric, p_target_unit text DEFAULT NULL::text, p_target_date date DEFAULT NULL::date | Funktion |
| goals | adaptive_tdee | p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE, p_window_days integer DEFAULT 14 | Funktion |
| goals | berechne_zielwerte | p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE | Funktion |
| goals | body_circumference_write | p_measurement_date date, p_measurement_time time without time zone, p_measurement_source text DEFAULT 'manual'::text, p_source_detail text DEFAULT NULL::text, p_notes text DEFAULT NULL::text, p_neck_cm numeric DEFAULT NULL::numeric, p_shoulders_cm numeric DEFAULT NULL::numeric, p_chest_cm numeric DEFAULT NULL::numeric, p_upper_arm_left_cm numeric DEFAULT NULL::numeric, p_upper_arm_right_cm numeric DEFAULT NULL::numeric, p_forearm_left_cm numeric DEFAULT NULL::numeric, p_forearm_right_cm numeric DEFAULT NULL::numeric, p_waist_cm numeric DEFAULT NULL::numeric, p_hip_cm numeric DEFAULT NULL::numeric, p_thigh_left_cm numeric DEFAULT NULL::numeric, p_thigh_right_cm numeric DEFAULT NULL::numeric, p_calf_left_cm numeric DEFAULT NULL::numeric, p_calf_right_cm numeric DEFAULT NULL::numeric | Funktion |
| goals | body_composition_navy | p_user_id uuid, p_date date DEFAULT CURRENT_DATE | Funktion |
| goals | fill_body_measurement_snapshot |  | Funktion |
| goals | goal_milestone_status | p_milestone_id uuid, p_stichtag date DEFAULT CURRENT_DATE | Funktion |
| goals | goal_phase_end | p_phase_id uuid, p_transition_reason text, p_actual_end_date date DEFAULT CURRENT_DATE | Funktion |
| goals | goal_phase_start | p_phase_type text, p_gueltig_ab date DEFAULT CURRENT_DATE, p_goal_id uuid DEFAULT NULL::uuid, p_projected_end_date date DEFAULT NULL::date, p_variant text DEFAULT NULL::text, p_parameters jsonb DEFAULT '{}'::jsonb | Funktion |
| goals | goal_progress_at | p_goal_id uuid, p_stichtag date DEFAULT CURRENT_DATE | Funktion |
| goals | phase_am | p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE | Funktion |
| goals | phase_transition_recommendation | p_user_id uuid, p_as_of date DEFAULT CURRENT_DATE | Funktion |
| goals | phase_transition_respond | p_phase_id uuid, p_response text, p_reason text DEFAULT NULL::text | Funktion |
| goals | refresh_goal_progress_from_body_measurement |  | Funktion |
| goals | refresh_goal_progress_from_workout_set |  | Funktion |
| goals | refresh_profile_body_weight | p_user_id uuid | Funktion |
| goals | refresh_user_goal_progress | p_goal_id uuid, p_stichtag date DEFAULT CURRENT_DATE | Funktion |
| goals | refresh_user_goals_progress_for_user | p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE | Funktion |
| goals | sync_profile_weight_from_measurement |  | Funktion |
| goals | touch_updated_at |  | Funktion |
| goals | zielwerte_am | p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE | Funktion |
| medical | appointments_validate_owner_links |  | Funktion |
| medical | attach_lab_report_original | p_report_id uuid, p_object_name text | Funktion |
| medical | biomarker_marker_candidates | p_marker_name text, p_unit text DEFAULT NULL::text | Funktion |
| medical | health_events_validate_source_report |  | Funktion |
| medical | import_lab_report_rows | p_user_id uuid, p_report_date date, p_report_time time without time zone, p_lab_name text, p_title text, p_source text, p_rows jsonb | Funktion |
| medical | injection_body_measurement_context | p_user_id uuid DEFAULT auth.uid() | Funktion |
| medical | injection_needle_suggestions | p_site text, p_route text, p_user_id uuid DEFAULT auth.uid() | Funktion |
| medical | lab_result_values_read | p_user_id uuid, p_report_id uuid DEFAULT NULL::uuid | Funktion |
| medical | touch_updated_at |  | Funktion |
| medical | validate_provenance |  | Funktion |
| nutrition | copy_meal_plan_week | p_week_id uuid, p_target_week_start date | Funktion |
| nutrition | copy_user_slots_to_new_self_created_plan |  | Funktion |
| nutrition | curate_food_tag | p_food_id uuid, p_tag_code text, p_action text | Funktion |
| nutrition | curation_overview | p_unassigned_only boolean, p_category text, p_tag text, p_alias_state text, p_sort text | Funktion |
| nutrition | custom_food_energy_plausibility | p_enercc numeric, p_prot625 numeric, p_fat numeric, p_cho numeric, p_alc numeric DEFAULT NULL::numeric, p_tolerance numeric DEFAULT 0.10 | Funktion |
| nutrition | daily_reference_assessment | p_user_id uuid, p_entry_date date | Funktion |
| nutrition | food_categories_tree |  | Funktion |
| nutrition | food_match_reason | p_food_id uuid, p_name_de text, p_query text, p_normalized_query text, p_tokens text[], p_token_groups jsonb, p_food_source text | Funktion |
| nutrition | food_nutrient_snapshot | p_food_source text, p_food_id uuid, p_custom_food_id uuid, p_amount_g numeric | Funktion |
| nutrition | food_preferences_read | p_user_id uuid DEFAULT auth.uid() | Funktion |
| nutrition | food_preferences_write | p_user_id uuid, p_preferences jsonb, p_items jsonb DEFAULT '[]'::jsonb | Funktion |
| nutrition | food_search | p_query text, p_normalized_query text, p_tokens text[], p_selected_food_id uuid, p_category_slug text, p_category_id uuid, p_tag_code text, p_sort text, p_limit integer, p_offset integer, p_preparations text[] DEFAULT NULL::text[], p_groups text[] DEFAULT NULL::text[], p_basics_only boolean DEFAULT false, p_token_groups jsonb DEFAULT NULL::jsonb, p_user_id uuid DEFAULT NULL::uuid, p_filters jsonb DEFAULT NULL::jsonb | Funktion |
| nutrition | hydration_day | p_user_id uuid, p_entry_date date | Funktion |
| nutrition | meal_items_inventory_deduct |  | Funktion |
| nutrition | meal_items_owner_guard |  | Funktion |
| nutrition | meal_plan_day_to_diary | p_day_id uuid, p_entry_date date DEFAULT NULL::date | Funktion |
| nutrition | meal_plan_days_owner_guard |  | Funktion |
| nutrition | meal_plan_entries_owner_guard |  | Funktion |
| nutrition | meal_plan_logs_owner_guard |  | Funktion |
| nutrition | meal_plan_set_next_plan | p_plan_id uuid, p_next_plan_id uuid | Funktion |
| nutrition | meal_plan_slots_owner_guard |  | Funktion |
| nutrition | meal_plan_weeks_owner_guard |  | Funktion |
| nutrition | meal_plans_status_compatibility |  | Funktion |
| nutrition | micronutrient_below_threshold | p_user_id uuid, p_entry_date date, p_threshold_pct numeric DEFAULT 75 | Funktion |
| nutrition | micronutrient_snapshot | p_user_id uuid, p_entry_date date | Funktion |
| nutrition | nrf93_daily | p_user_id uuid, p_entry_date date DEFAULT CURRENT_DATE | Funktion |
| nutrition | nrf93_score_from_amounts | p_protein_g numeric, p_fiber_g numeric, p_vitamin_a_iu numeric, p_vitamin_c_mg numeric, p_vitamin_e_mg_alpha_tocopherol numeric, p_calcium_mg numeric, p_iron_mg numeric, p_magnesium_mg numeric, p_potassium_mg numeric, p_saturated_fat_g numeric, p_total_sugar_g numeric, p_sodium_mg numeric | Funktion |
| nutrition | nutrient_summary_window | p_user_id uuid, p_end_date date, p_days integer DEFAULT 30 | Funktion |
| nutrition | nutrient_tree_value_anomalies | p_user_id uuid, p_entry_date date | Funktion |
| nutrition | preference_search_preview | p_query text, p_normalized_query text, p_tokens text[], p_excluded_category_slugs text[], p_liked_category_slugs text[], p_disliked_category_slugs text[], p_liked_tags text[], p_disliked_tags text[], p_sort text, p_limit integer, p_offset integer, p_liked_food_ids uuid[] DEFAULT ARRAY[]::uuid[], p_disliked_food_ids uuid[] DEFAULT ARRAY[]::uuid[], p_excluded_food_ids uuid[] DEFAULT ARRAY[]::uuid[] | Funktion |
| nutrition | pruef_objektliste |  | Funktion |
| nutrition | recipe_ingredients_owner_guard |  | Funktion |
| nutrition | recipe_nutrition | p_recipe_id uuid, p_servings numeric DEFAULT NULL::numeric | Funktion |
| nutrition | reference_assessment_window | p_user_id uuid, p_end_date date, p_days integer DEFAULT 30 | Funktion |
| nutrition | reference_assessment_window_flags | p_user_id uuid, p_end_date date, p_days integer DEFAULT 30 | Funktion |
| nutrition | refresh_food_preference_search_targets | p_user_id uuid | Funktion |
| nutrition | refresh_food_preference_search_targets_trigger |  | Funktion |
| nutrition | schema_debug |  | Funktion |
| nutrition | search_events_report |  | Funktion |
| nutrition | search_fold | t text | Funktion |
| nutrition | shopping_list_archive | p_shopping_list_id uuid | Funktion |
| nutrition | shopping_list_from_meal_plan_week | p_week_id uuid, p_name text DEFAULT NULL::text | Funktion |
| nutrition | shopping_list_items_owner_guard |  | Funktion |
| nutrition | shopping_list_read | p_shopping_list_id uuid | Funktion |
| nutrition | shopping_lists_owner_guard |  | Funktion |
| nutrition | such_alias_treffer | p_groups jsonb | Funktion |
| nutrition | such_rang_wortgrenze | p_name text, p_groups jsonb | Funktion |
| nutrition | such_rang_zubereitung | p_bls_code text | Funktion |
| nutrition | touch_updated_at |  | Funktion |
| nutrition | user_inventory_owner_guard |  | Funktion |
| nutrition | user_inventory_set_state |  | Funktion |
| nutrition | vitamin_a_iu_daily | p_user_id uuid, p_entry_date date | Funktion |
| public | daitch_mokotoff | text | Funktion |
| public | difference | text, text | Funktion |
| public | dmetaphone | text | Funktion |
| public | dmetaphone_alt | text | Funktion |
| public | gin_extract_query_trgm | text, internal, smallint, internal, internal, internal, internal | Funktion |
| public | gin_extract_value_trgm | text, internal | Funktion |
| public | gin_trgm_consistent | internal, smallint, text, integer, internal, internal, internal, internal | Funktion |
| public | gin_trgm_triconsistent | internal, smallint, text, integer, internal, internal, internal | Funktion |
| public | gtrgm_compress | internal | Funktion |
| public | gtrgm_consistent | internal, text, smallint, oid, internal | Funktion |
| public | gtrgm_decompress | internal | Funktion |
| public | gtrgm_distance | internal, text, smallint, oid, internal | Funktion |
| public | gtrgm_in | cstring | Funktion |
| public | gtrgm_options | internal | Funktion |
| public | gtrgm_out | gtrgm | Funktion |
| public | gtrgm_penalty | internal, internal, internal | Funktion |
| public | gtrgm_picksplit | internal, internal | Funktion |
| public | gtrgm_same | gtrgm, gtrgm, internal | Funktion |
| public | gtrgm_union | internal, internal | Funktion |
| public | handle_new_user |  | Funktion |
| public | is_admin |  | Funktion |
| public | levenshtein | text, text, integer, integer, integer | Funktion |
| public | levenshtein | text, text | Funktion |
| public | levenshtein_less_equal | text, text, integer, integer, integer, integer | Funktion |
| public | levenshtein_less_equal | text, text, integer | Funktion |
| public | metaphone | text, integer | Funktion |
| public | set_limit | real | Funktion |
| public | show_limit |  | Funktion |
| public | show_trgm | text | Funktion |
| public | similarity | text, text | Funktion |
| public | similarity_dist | text, text | Funktion |
| public | similarity_op | text, text | Funktion |
| public | soundex | text | Funktion |
| public | strict_word_similarity | text, text | Funktion |
| public | strict_word_similarity_commutator_op | text, text | Funktion |
| public | strict_word_similarity_dist_commutator_op | text, text | Funktion |
| public | strict_word_similarity_dist_op | text, text | Funktion |
| public | strict_word_similarity_op | text, text | Funktion |
| public | text_soundex | text | Funktion |
| public | touch_updated_at |  | Funktion |
| public | word_similarity | text, text | Funktion |
| public | word_similarity_commutator_op | text, text | Funktion |
| public | word_similarity_dist_commutator_op | text, text | Funktion |
| public | word_similarity_dist_op | text, text | Funktion |
| public | word_similarity_op | text, text | Funktion |
| recovery | card_read_all | p_user_id uuid | Funktion |
| recovery | modality_bonus_value | p_modality_type text | Funktion |
| recovery | recalculate_score | p_user_id uuid, p_entry_date date | Funktion |
| recovery | refresh_modality_deltas | p_user_id uuid, p_entry_date date | Funktion |
| recovery | refresh_scores_for_user | p_user_id uuid | Funktion |
| recovery | scoring_constants |  | Funktion |
| recovery | touch_updated_at |  | Funktion |
| supplements | create_curated_stack_template | p_name_de text, p_goal text, p_description_de text, p_items jsonb | Funktion |
| supplements | decide_stack_curation_candidate | p_candidate_id uuid, p_decision text, p_reason text | Funktion |
| supplements | platform_input_status | p_user_id uuid, p_entry_date date DEFAULT CURRENT_DATE | Funktion |
| supplements | publish_stack_template | p_stack_id uuid, p_reason text DEFAULT ''::text | Funktion |
| supplements | refresh_stack_item_count |  | Funktion |
| supplements | rule_assessment | p_user_id uuid DEFAULT auth.uid(), p_entry_date date DEFAULT CURRENT_DATE | Funktion |
| supplements | rule_operator_supported | p_rule_id text, p_module text, p_field text, p_operator text | Funktion |
| supplements | supplement_nutrient_intake_for_day | p_user_id uuid, p_entry_date date DEFAULT CURRENT_DATE | Funktion |
| supplements | touch_updated_at |  | Funktion |
| supplements | withdraw_stack_template | p_stack_id uuid | Funktion |
| training | calc_workout_set_metrics |  | Funktion |
| training | fill_workout_exercise_snapshot |  | Funktion |
| training | refresh_workout_totals |  | Funktion |
| training | refresh_workout_totals_for_exercise | p_workout_exercise_id uuid | Funktion |
| training | touch_updated_at |  | Funktion |
| wissen | touch_updated_at |  | Funktion |

## Sichten

`[read]` **`security_invoker` heisst: die Sicht laeuft mit den
Rechten des Lesers, nicht des Erzeugers.**

| Modul | Sicht | Rechte |
|---|---|---|
| medical | health_timeline | security_invoker |
| nutrition | daily_nutrient_summary_long | security_invoker |
| nutrition | daily_summary | security_invoker |
| nutrition | exclusion_preset_matches | security_invoker |
| nutrition | food_tags_effective | security_invoker |
| nutrition | frequent_food_positions | security_invoker |
| nutrition | hydration_summary | security_invoker |
| nutrition | nutrient_search_aliases | security_invoker |
| public | activity_stream | security_invoker |
| public | muscle_training_loads | security_invoker |
| supplements | community_anzeige | definer |
| supplements | daily_intake_summary | security_invoker |
| supplements | substance_alias_matches | security_invoker |

## CHECK-Bedingungen

`[read]` **Die erlaubten Werte** ? **genau das, was aus dem
Gedaechtnis falsch abgeschrieben wird** (G-373).

| Modul | Tabelle | Name | Bedingung |
|---|---|---|---|
| coach | action_log | action_log_module_check | CHECK ((module = ANY (ARRAY['nutrition'::text, 'training'::text, 'recovery'::text, 'goals'::text, 'supplements'::text, 'medical':: |
| coach | alerts | alerts_done_ck | CHECK (((status <> 'done'::text) OR (done_at IS NOT NULL))) |
| coach | alerts | alerts_metric_check | CHECK ((jsonb_typeof(metric) = 'object'::text)) |
| coach | alerts | alerts_module_check | CHECK ((module = ANY (ARRAY['nutrition'::text, 'training'::text, 'recovery'::text, 'goals'::text, 'supplements'::text, 'medical':: |
| coach | alerts | alerts_not_self_ck | CHECK ((coach_id <> client_id)) |
| coach | alerts | alerts_status_check | CHECK ((status = ANY (ARRAY['open'::text, 'read'::text, 'done'::text]))) |
| coach | autonomy_change_log | autonomy_change_log_change_kind_check | CHECK ((change_kind = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text]))) |
| coach | checkin_templates | checkin_templates_cadence_check | CHECK ((cadence = ANY (ARRAY['weekly'::text, 'biweekly'::text, 'monthly'::text]))) |
| coach | checkin_templates | checkin_templates_fields_check | CHECK ((jsonb_typeof(fields) = 'array'::text)) |
| coach | checkin_templates | checkin_templates_not_self_ck | CHECK ((coach_id <> client_id)) |
| coach | checkins | checkins_auto_data_check | CHECK ((jsonb_typeof(auto_data) = 'object'::text)) |
| coach | checkins | checkins_client_data_check | CHECK ((jsonb_typeof(client_data) = 'object'::text)) |
| coach | checkins | checkins_not_self_ck | CHECK ((coach_id <> client_id)) |
| coach | checkins | checkins_reviewed_ck | CHECK (((status <> 'reviewed'::text) OR (reviewed_at IS NOT NULL))) |
| coach | checkins | checkins_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'submitted'::text, 'reviewed'::text, 'missed'::text]))) |
| coach | checkins | checkins_submitted_ck | CHECK (((status <> ALL (ARRAY['submitted'::text, 'reviewed'::text])) OR (submitted_at IS NOT NULL))) |
| coach | client_autonomy | client_autonomy_levels_ck | CHECK ((((nutrition_level >= 1) AND (nutrition_level <= 5)) AND ((training_level >= 1) AND (training_level <= 5)) AND ((recovery_l |
| coach | client_autonomy | client_autonomy_not_self_ck | CHECK ((coach_id <> client_id)) |
| coach | client_consent_log | client_consent_log_event_check | CHECK ((((event_kind = 'granted'::text) AND (revokes_consent_id IS NULL)) OR ((event_kind = 'revoked'::text) AND (revokes_consent_ |
| coach | client_consent_log | client_consent_log_policy_version_check | CHECK ((length(TRIM(BOTH FROM policy_version)) > 0)) |
| coach | client_consent_log | client_consent_log_purpose_check | CHECK ((purpose_code ~ '^[a-z][a-z0-9_]*$'::text)) |
| coach | client_consent_log | client_consent_log_recipient_check | CHECK ((((recipient_type = 'lumeos'::text) AND (recipient_id IS NULL)) OR ((recipient_type = 'coach'::text) AND (recipient_id IS N |
| coach | client_permissions | client_permissions_not_self_ck | CHECK ((coach_id <> client_id)) |
| coach | client_permissions | client_permissions_visibility_ck | CHECK (((nutrition_visibility = ANY (ARRAY['none'::text, 'summary'::text, 'full'::text])) AND (training_visibility = ANY (ARRAY['n |
| coach | coach_profiles | coach_profiles_display_name_check | CHECK ((btrim(display_name) <> ''::text)) |
| coach | coach_profiles | coach_profiles_email_check | CHECK ((btrim(email) <> ''::text)) |
| coach | messages | messages_body_check | CHECK ((length(btrim(body)) > 0)) |
| coach | messages | messages_not_self_ck | CHECK ((coach_id <> client_id)) |
| coach | messages | messages_sender_ck | CHECK (((sender_id = coach_id) OR (sender_id = client_id))) |
| coach | pending_actions | pending_actions_confirmed_ck | CHECK ((((status = 'confirmed'::text) AND (confirmed_at IS NOT NULL) AND (confirmed_by IS NOT NULL)) OR (status <> 'confirmed'::te |
| coach | pending_actions | pending_actions_module_check | CHECK ((module = ANY (ARRAY['nutrition'::text, 'training'::text, 'recovery'::text, 'goals'::text, 'supplements'::text, 'medical':: |
| coach | pending_actions | pending_actions_not_self_ck | CHECK ((coach_id <> client_id)) |
| coach | pending_actions | pending_actions_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text, 'expired'::text, 'cancelled'::text]))) |
| coach | pending_invites | pending_invites_coach_display_name_check | CHECK ((btrim(coach_display_name) <> ''::text)) |
| coach | pending_invites | pending_invites_drafts_object_ck | CHECK (((jsonb_typeof(permission_draft) = 'object'::text) AND (jsonb_typeof(autonomy_draft) = 'object'::text))) |
| coach | pending_invites | pending_invites_email_normalized_check | CHECK (((email_normalized = lower(btrim(email_normalized))) AND (email_normalized ~ '^[^[:space:]@]+@[^[:space:]@]+$'::text))) |
| coach | pending_invites | pending_invites_state_ck | CHECK ((((status = 'pending'::text) AND (token_hash IS NOT NULL) AND (accepted_at IS NULL) AND (accepted_by IS NULL) AND (accepted |
| coach | pending_invites | pending_invites_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text]))) |
| coach | permission_change_log | permission_change_log_change_kind_check | CHECK ((change_kind = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text]))) |
| coach | relationship_change_log | relationship_change_log_change_kind_check | CHECK ((change_kind = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text]))) |
| coach | relationships | relationships_active_ck | CHECK (((status <> 'active'::text) OR (started_at IS NOT NULL))) |
| coach | relationships | relationships_ended_ck | CHECK (((status <> 'ended'::text) OR ((ended_at IS NOT NULL) AND (ended_by IS NOT NULL)))) |
| coach | relationships | relationships_invited_coach_name_ck | CHECK (((status <> 'invited'::text) OR (coach_display_name IS NOT NULL))) NOT VALID |
| coach | relationships | relationships_not_self_ck | CHECK ((coach_id <> client_id)) |
| coach | relationships | relationships_status_check | CHECK ((status = ANY (ARRAY['invited'::text, 'active'::text, 'ended'::text, 'withdrawn'::text]))) |
| coach | relationships | relationships_withdrawn_ck | CHECK (((status <> 'withdrawn'::text) OR ((withdrawn_at IS NOT NULL) AND (withdrawn_by IS NOT NULL)))) |
| goals | body_circumferences | body_circumferences_at_least_one_ck | CHECK (((neck_cm IS NOT NULL) OR (shoulders_cm IS NOT NULL) OR (chest_cm IS NOT NULL) OR (upper_arm_left_cm IS NOT NULL) OR (upper |
| goals | body_circumferences | body_circumferences_positive_ck | CHECK ((((neck_cm IS NULL) OR ((neck_cm >= (10)::numeric) AND (neck_cm <= (80)::numeric))) AND ((shoulders_cm IS NULL) OR ((should |
| goals | body_circumferences | body_circumferences_source_ck | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text]))) |
| goals | body_measurements | body_measurements_body_fat_ck | CHECK (((body_fat_pct IS NULL) OR ((body_fat_pct >= (2)::numeric) AND (body_fat_pct <= (70)::numeric)))) |
| goals | body_measurements | body_measurements_height_ck | CHECK (((height_cm_snapshot IS NULL) OR ((height_cm_snapshot >= (80)::numeric) AND (height_cm_snapshot <= (250)::numeric)))) |
| goals | body_measurements | body_measurements_method_ck | CHECK (((bf_method IS NULL) OR (bf_method = ANY (ARRAY['caliper_3'::text, 'caliper_7'::text, 'dexa'::text, 'bia'::text, 'visual':: |
| goals | body_measurements | body_measurements_source_ck | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text]))) |
| goals | body_measurements | body_measurements_weight_ck | CHECK (((weight_kg >= (20)::numeric) AND (weight_kg <= (400)::numeric))) |
| goals | goal_milestones | goal_milestones_source_ck | CHECK ((source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text, 'derived'::text]))) |
| goals | goal_milestones | goal_milestones_status_ck | CHECK ((status = ANY (ARRAY['open'::text, 'achieved'::text, 'missed'::text, 'abandoned'::text]))) |
| goals | goal_milestones | goal_milestones_target_ck | CHECK ((((milestone_type = 'absolute_value'::text) AND (target_value IS NOT NULL) AND (target_unit IS NOT NULL)) OR ((milestone_ty |
| goals | goal_milestones | goal_milestones_type_ck | CHECK ((milestone_type = ANY (ARRAY['absolute_value'::text, 'percentage'::text, 'date'::text, 'behavioral'::text]))) |
| goals | goal_phases | goal_phases_check | CHECK (((projected_end_date IS NULL) OR (projected_end_date >= gueltig_ab))) |
| goals | goal_phases | goal_phases_check1 | CHECK (((actual_end_date IS NULL) OR (actual_end_date >= gueltig_ab))) |
| goals | goal_phases | goal_phases_parameters_check | CHECK ((jsonb_typeof(parameters) = 'object'::text)) |
| goals | goal_phases | goal_phases_phase_type_check | CHECK ((phase_type = ANY (ARRAY['fat_loss'::text, 'lean_bulk'::text, 'maintenance'::text, 'recomp'::text, 'contest_prep'::text, 'r |
| goals | nutrition_targets | nutrition_targets_alpha_linolenic_acid_check | CHECK (((alpha_linolenic_acid_g IS NULL) OR ((alpha_linolenic_acid_g >= (0)::numeric) AND (alpha_linolenic_acid_g <= (50)::numeric |
| goals | nutrition_targets | nutrition_targets_carbs_check | CHECK (((carbs_g IS NULL) OR ((carbs_g >= (0)::numeric) AND (carbs_g <= (1500)::numeric)))) |
| goals | nutrition_targets | nutrition_targets_fat_check | CHECK (((fat_g IS NULL) OR ((fat_g >= (0)::numeric) AND (fat_g <= (500)::numeric)))) |
| goals | nutrition_targets | nutrition_targets_herkunft_check | CHECK ((herkunft = ANY (ARRAY['formel'::text, 'manuell'::text]))) |
| goals | nutrition_targets | nutrition_targets_kcal_check | CHECK (((kcal IS NULL) OR ((kcal >= (500)::numeric) AND (kcal <= (10000)::numeric)))) |
| goals | nutrition_targets | nutrition_targets_linoleic_acid_check | CHECK (((linoleic_acid_g IS NULL) OR ((linoleic_acid_g >= (0)::numeric) AND (linoleic_acid_g <= (200)::numeric)))) |
| goals | nutrition_targets | nutrition_targets_protein_check | CHECK (((protein_g IS NULL) OR ((protein_g >= (0)::numeric) AND (protein_g <= (500)::numeric)))) |
| goals | phase_transition_responses | phase_transition_responses_response_check | CHECK ((response = ANY (ARRAY['accepted'::text, 'rejected'::text]))) |
| goals | user_goals | user_goals_check | CHECK (((target_date IS NULL) OR (target_date >= gueltig_ab))) |
| goals | user_goals | user_goals_check1 | CHECK (((status <> 'active'::text) OR ((priority >= 1) AND (priority <= 3)))) |
| goals | user_goals | user_goals_difficulty_level_check | CHECK (((difficulty_level IS NULL) OR (difficulty_level = ANY (ARRAY['easy'::text, 'moderate'::text, 'challenging'::text, 'aggress |
| goals | user_goals | user_goals_goal_type_check | CHECK ((goal_type = ANY (ARRAY['body_composition'::text, 'performance'::text, 'health'::text, 'lifestyle'::text]))) |
| goals | user_goals | user_goals_priority_check | CHECK (((priority >= 1) AND (priority <= 10))) |
| goals | user_goals | user_goals_progress_pct_check | CHECK (((progress_pct >= (0)::numeric) AND (progress_pct <= (100)::numeric))) |
| goals | user_goals | user_goals_status_check | CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'achieved'::text, 'missed'::text, 'abandoned'::text, 'on_hold'::text]) |
| goals | user_goals | user_goals_title_check | CHECK ((btrim(title) <> ''::text)) |
| medical | appointments | appointments_appointment_type_check | CHECK ((appointment_type = ANY (ARRAY['doctor'::text, 'labor'::text, 'other'::text]))) |
| medical | appointments | appointments_status_check | CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text]))) |
| medical | appointments | appointments_time_zone_check | CHECK ((btrim(time_zone) <> ''::text)) |
| medical | biomarker_aliases | biomarker_aliases_confidence_check | CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))) |
| medical | biomarker_aliases | biomarker_aliases_locale_check | CHECK ((locale = ANY (ARRAY['de'::text, 'en'::text, 'th'::text, 'und'::text]))) |
| medical | biomarker_aliases | biomarker_aliases_match_policy_check | CHECK ((match_policy = ANY (ARRAY['exact'::text, 'ambiguous'::text]))) |
| medical | biomarker_aliases | biomarker_aliases_source_check | CHECK ((source = ANY (ARRAY['predecessor_synonym'::text, 'curated_ambiguous'::text]))) |
| medical | biomarker_catalog | biomarker_catalog_class_type_check | CHECK ((class_type = ANY (ARRAY[1, 2]))) |
| medical | biomarker_catalog | biomarker_catalog_common_test_rank_check | CHECK ((common_test_rank > 0)) |
| medical | biomarker_catalog | biomarker_catalog_panels_check | CHECK ((jsonb_typeof(panels) = 'array'::text)) |
| medical | biomarker_catalog | biomarker_catalog_synonyms_check | CHECK ((jsonb_typeof(synonyms) = 'object'::text)) |
| medical | biomarker_reference_ranges | biomarker_reference_ranges_check | CHECK (((age_min_years IS NULL) OR (age_max_years IS NULL) OR (age_min_years <= age_max_years))) |
| medical | biomarker_reference_ranges | biomarker_reference_ranges_check1 | CHECK (((min_value IS NULL) OR (max_value IS NULL) OR (min_value <= max_value))) |
| medical | biomarker_reference_ranges | biomarker_reference_ranges_check2 | CHECK (((min_value IS NOT NULL) OR (max_value IS NOT NULL) OR (value_text IS NOT NULL))) |
| medical | biomarker_reference_ranges | biomarker_reference_ranges_check3 | CHECK (((loinc_code IS NOT NULL) OR (curated_slug IS NOT NULL))) |
| medical | biomarker_reference_ranges | biomarker_reference_ranges_range_type_check | CHECK ((range_type = ANY (ARRAY['lab'::text, 'optimal'::text, 'threshold'::text]))) |
| medical | biomarker_reference_ranges | biomarker_reference_ranges_sex_check | CHECK ((sex = ANY (ARRAY['all'::text, 'male'::text, 'female'::text]))) |
| medical | biomarker_spec_enrichment | biomarker_spec_enrichment_catalog_match_status_check | CHECK ((catalog_match_status = ANY (ARRAY['accepted'::text, 'identity_mismatch'::text, 'unit_mismatch'::text]))) |
| medical | health_events | health_events_event_type_check | CHECK ((event_type = ANY (ARRAY['diagnosis'::text, 'treatment'::text, 'operation'::text]))) |
| medical | health_events | health_events_source_actor_check | CHECK ((btrim(source_actor) <> ''::text)) |
| medical | health_events | health_events_source_kind_check | CHECK ((source_kind = ANY (ARRAY['user'::text, 'clinician'::text, 'document'::text, 'import'::text, 'seed'::text]))) |
| medical | health_events | health_events_title_check | CHECK ((btrim(title) <> ''::text)) |
| medical | injection_needle_recommendations | injection_needle_recommendations_applicability_check | CHECK ((jsonb_typeof(applicability) = 'object'::text)) |
| medical | injection_needle_recommendations | injection_needle_recommendations_body_size_modifier_check | CHECK ((btrim(body_size_modifier) <> ''::text)) |
| medical | injection_needle_recommendations | injection_needle_recommendations_evidence_type_check | CHECK ((evidence_type = ANY (ARRAY['guideline'::text, 'study'::text, 'practice_rule'::text, 'product_label'::text]))) |
| medical | injection_needle_recommendations | injection_needle_recommendations_gauge_range_check | CHECK ((btrim(gauge_range) <> ''::text)) |
| medical | injection_needle_recommendations | injection_needle_recommendations_length_range_check | CHECK ((btrim(length_range) <> ''::text)) |
| medical | injection_needle_recommendations | injection_needle_recommendations_medication_viscosity_check | CHECK ((btrim(medication_viscosity) <> ''::text)) |
| medical | injection_needle_recommendations | injection_needle_recommendations_route_check | CHECK ((route = ANY (ARRAY['im'::text, 'sc'::text]))) |
| medical | injection_needle_recommendations | injection_needle_recommendations_site_check | CHECK ((btrim(site) <> ''::text)) |
| medical | injection_needle_recommendations | injection_needle_recommendations_source_citation_check | CHECK ((btrim(source_citation) <> ''::text)) |
| medical | injection_needle_recommendations | injection_needle_recommendations_source_key_check | CHECK ((btrim(source_key) <> ''::text)) |
| medical | injection_site_conditions | injection_site_conditions_avoidance_months_check | CHECK (((avoidance_months >= 3) AND (avoidance_months <= 6))) |
| medical | injection_site_conditions | injection_site_conditions_check | CHECK ((((status = 'active'::text) AND (resolved_at IS NULL)) OR ((status = 'resolved'::text) AND (resolved_at IS NOT NULL) AND (r |
| medical | injection_site_conditions | injection_site_conditions_status_check | CHECK ((status = ANY (ARRAY['active'::text, 'resolved'::text]))) |
| medical | injection_sites | injection_sites_check | CHECK ((((route = 'im'::text) AND (rotation_distance_mm IS NULL) AND (rotation_quadrant_interval_days IS NULL)) OR ((route = 'sc': |
| medical | injection_sites | injection_sites_display_name_check | CHECK ((btrim(display_name) <> ''::text)) |
| medical | injection_sites | injection_sites_id_check | CHECK ((btrim(id) <> ''::text)) |
| medical | injection_sites | injection_sites_minimum_rest_days_check | CHECK ((minimum_rest_days IS NULL)) |
| medical | injection_sites | injection_sites_minimum_rest_days_reason_check | CHECK ((btrim(minimum_rest_days_reason) <> ''::text)) |
| medical | injection_sites | injection_sites_route_check | CHECK ((route = ANY (ARRAY['im'::text, 'sc'::text]))) |
| medical | injection_tissue_condition_guidance | injection_tissue_condition_guidance_avoidance_max_months_check | CHECK ((avoidance_max_months = 6)) |
| medical | injection_tissue_condition_guidance | injection_tissue_condition_guidance_avoidance_min_months_check | CHECK ((avoidance_min_months = 3)) |
| medical | injection_tissue_condition_guidance | injection_tissue_condition_guidance_check | CHECK ((avoidance_min_months <= avoidance_max_months)) |
| medical | injection_tissue_condition_guidance | injection_tissue_condition_guidance_condition_code_check | CHECK ((condition_code = 'lipohypertrophy'::text)) |
| medical | injection_tissue_condition_guidance | injection_tissue_condition_guidance_evidence_type_check | CHECK ((evidence_type = ANY (ARRAY['guideline'::text, 'study'::text, 'practice_rule'::text, 'product_label'::text]))) |
| medical | injection_tissue_condition_guidance | injection_tissue_condition_guidance_rationale_check | CHECK ((btrim(rationale) <> ''::text)) |
| medical | injection_tissue_condition_guidance | injection_tissue_condition_guidance_source_citation_check | CHECK ((btrim(source_citation) <> ''::text)) |
| medical | lab_marker_catalog | lab_marker_catalog_check | CHECK ((((validation_status = 'unresolved_no_unique_loinc'::text) AND (loinc_code IS NULL) AND (unresolved_reason IS NOT NULL)) OR |
| medical | lab_marker_catalog | lab_marker_catalog_raw_check | CHECK ((jsonb_typeof(raw) = 'object'::text)) |
| medical | lab_marker_catalog | lab_marker_catalog_validation_status_check | CHECK ((validation_status = ANY (ARRAY['kimi_candidate_validated'::text, 'repo_resolved_without_kimi_candidate'::text, 'unresolved |
| medical | lab_reports | lab_reports_report_time_check | CHECK (((report_time IS NULL) OR (EXTRACT(second FROM report_time) = (0)::numeric))) |
| medical | lab_reports | lab_reports_source_check | CHECK ((source = ANY (ARRAY['manual'::text, 'pdf_upload'::text, 'photo_ocr'::text, 'lab_import'::text, 'seed'::text]))) |
| medical | lab_result_values | lab_result_values_check | CHECK (((value_numeric IS NOT NULL) OR (value_text IS NOT NULL))) |
| medical | lab_result_values | lab_result_values_check1 | CHECK (((lab_reference_low IS NULL) OR (lab_reference_high IS NULL) OR (lab_reference_low <= lab_reference_high))) |
| medical | lab_result_values | lab_result_values_entry_confidence_check | CHECK (((entry_confidence >= (0)::numeric) AND (entry_confidence <= (1)::numeric))) |
| medical | lab_result_values | lab_result_values_fasting_status_check | CHECK ((fasting_status = ANY (ARRAY['fasting'::text, 'non_fasting'::text, 'unknown'::text]))) |
| medical | lab_result_values | lab_result_values_match_candidates_json_check | CHECK ((jsonb_typeof(match_candidates) = 'array'::text)) |
| medical | lab_result_values | lab_result_values_match_integrity_check | CHECK ((((match_status = ANY (ARRAY['exact'::text, 'manual_verified'::text])) AND (loinc_code IS NOT NULL)) OR ((match_status = AN |
| medical | lab_result_values | lab_result_values_match_status_check | CHECK ((match_status = ANY (ARRAY['exact'::text, 'ambiguous'::text, 'unknown'::text, 'manual_verified'::text]))) |
| medical | lab_result_values | lab_result_values_source_check | CHECK ((source = ANY (ARRAY['manual'::text, 'pdf_upload'::text, 'photo_ocr'::text, 'lab_import'::text, 'seed'::text]))) |
| medical | lab_result_values | lab_result_values_value_operator_check | CHECK ((value_operator = ANY (ARRAY['='::text, '<'::text, '<='::text, '>'::text, '>='::text]))) |
| medical | medication_active_substances | medication_active_substances_canonical_name_check | CHECK ((btrim(canonical_name) <> ''::text)) |
| medical | medication_active_substances | medication_active_substances_contraindications_check | CHECK ((jsonb_typeof(contraindications) = 'array'::text)) |
| medical | medication_active_substances | medication_active_substances_cyp_raw_check | CHECK ((jsonb_typeof(cyp_raw) = 'object'::text)) |
| medical | medication_active_substances | medication_active_substances_dosage_models_check | CHECK ((jsonb_typeof(dosage_models) = 'array'::text)) |
| medical | medication_active_substances | medication_active_substances_evidence_provenance_check | CHECK ((jsonb_typeof(evidence_provenance) = 'object'::text)) |
| medical | medication_active_substances | medication_active_substances_food_interactions_check | CHECK ((jsonb_typeof(food_interactions) = 'array'::text)) |
| medical | medication_active_substances | medication_active_substances_lab_effects_check | CHECK ((jsonb_typeof(lab_effects) = 'array'::text)) |
| medical | medication_active_substances | medication_active_substances_pharmacology_check | CHECK ((jsonb_typeof(pharmacology) = 'object'::text)) |
| medical | medication_active_substances | medication_active_substances_precautions_check | CHECK ((jsonb_typeof(precautions) = 'array'::text)) |
| medical | medication_active_substances | medication_active_substances_regulatory_state_check | CHECK ((jsonb_typeof(regulatory_state) = 'array'::text)) |
| medical | medication_active_substances | medication_active_substances_risk_flags_check | CHECK ((jsonb_typeof(risk_flags) = 'object'::text)) |
| medical | medication_active_substances | medication_active_substances_sources_check | CHECK ((jsonb_typeof(sources) = 'array'::text)) |
| medical | medication_clinical_context_evidence | medication_clinical_context_evidence_payload_check | CHECK ((jsonb_typeof(payload) = 'object'::text)) |
| medical | medication_faq | medication_faq_antwort_de_check | CHECK ((btrim(antwort_de) <> ''::text)) |
| medical | medication_faq | medication_faq_frage_de_check | CHECK ((btrim(frage_de) <> ''::text)) |
| medical | medication_faq | medication_faq_sort_order_check | CHECK ((sort_order > 0)) |
| medical | medication_faq | medication_faq_sources_check | CHECK ((jsonb_typeof(sources) = 'array'::text)) |
| medical | medication_formulations | medication_formulations_strength_value_check | CHECK (((strength_value IS NULL) OR (strength_value > (0)::numeric))) |
| medical | medication_pk_evidence | medication_pk_evidence_missing_check | CHECK ((jsonb_typeof(missing) = 'object'::text)) |
| medical | medication_pk_evidence | medication_pk_evidence_pk_fields_check | CHECK ((jsonb_typeof(pk_fields) = 'object'::text)) |
| medical | medication_products | medication_products_brand_name_check | CHECK ((btrim(brand_name) <> ''::text)) |
| medical | medication_products | medication_products_identifiers_check | CHECK ((jsonb_typeof(identifiers) = 'object'::text)) |
| medical | medication_renal_hepatic_evidence | medication_renal_hepatic_evidence_hepatic_check | CHECK (((hepatic IS NULL) OR (jsonb_typeof(hepatic) = 'object'::text))) |
| medical | medication_renal_hepatic_evidence | medication_renal_hepatic_evidence_missing_hepatic_check | CHECK ((jsonb_typeof(missing_hepatic) = 'object'::text)) |
| medical | medication_renal_hepatic_evidence | medication_renal_hepatic_evidence_missing_renal_check | CHECK ((jsonb_typeof(missing_renal) = 'object'::text)) |
| medical | medication_renal_hepatic_evidence | medication_renal_hepatic_evidence_renal_check | CHECK (((renal IS NULL) OR (jsonb_typeof(renal) = 'object'::text))) |
| medical | medication_reproductive_evidence | medication_reproductive_evide_missing_pregnancy_lactation_check | CHECK ((jsonb_typeof(missing_pregnancy_lactation) = 'object'::text)) |
| medical | medication_reproductive_evidence | medication_reproductive_evidence_fertility_check | CHECK (((fertility IS NULL) OR (jsonb_typeof(fertility) = 'object'::text))) |
| medical | medication_reproductive_evidence | medication_reproductive_evidence_lactation_check | CHECK (((lactation IS NULL) OR (jsonb_typeof(lactation) = 'object'::text))) |
| medical | medication_reproductive_evidence | medication_reproductive_evidence_missing_fertility_sex_check | CHECK ((jsonb_typeof(missing_fertility_sex) = 'object'::text)) |
| medical | medication_reproductive_evidence | medication_reproductive_evidence_pregnancy_check | CHECK (((pregnancy IS NULL) OR (jsonb_typeof(pregnancy) = 'object'::text))) |
| medical | medication_reproductive_evidence | medication_reproductive_evidence_sources_check | CHECK ((jsonb_typeof(sources) = 'array'::text)) |
| medical | medication_thailand_regulatory_evidence | medication_thailand_regulatory_evidence_payload_check | CHECK ((jsonb_typeof(payload) = 'object'::text)) |
| medical | medication_user_texts | medication_user_texts_absetzen_de_check | CHECK ((btrim(absetzen_de) <> ''::text)) |
| medical | medication_user_texts | medication_user_texts_kurz_was_de_check | CHECK (((char_length(kurz_was_de) <= 140) AND (btrim(kurz_was_de) <> ''::text))) |
| medical | medication_user_texts | medication_user_texts_mythen_de_check | CHECK (((mythen_de IS NULL) OR (jsonb_typeof(mythen_de) = ANY (ARRAY['string'::text, 'array'::text])))) |
| medical | medication_user_texts | medication_user_texts_null_context_check | CHECK ((jsonb_typeof(null_context) = 'object'::text)) |
| medical | medication_user_texts | medication_user_texts_sources_check | CHECK ((jsonb_typeof(sources) = 'array'::text)) |
| medical | medication_user_texts | medication_user_texts_verschreibungspflicht_klartext_de_check | CHECK ((btrim(verschreibungspflicht_klartext_de) <> ''::text)) |
| medical | medication_user_texts | medication_user_texts_wann_wie_de_check | CHECK ((btrim(wann_wie_de) <> ''::text)) |
| medical | medication_user_texts | medication_user_texts_was_bringt_es_de_check | CHECK ((btrim(was_bringt_es_de) <> ''::text)) |
| medical | medication_user_texts | medication_user_texts_wechselwirkung_alltag_de_check | CHECK ((btrim(wechselwirkung_alltag_de) <> ''::text)) |
| medical | medication_user_texts | medication_user_texts_wer_nicht_de_check | CHECK ((cardinality(wer_nicht_de) > 0)) |
| medical | medication_user_texts | medication_user_texts_wie_wirkt_de_check | CHECK ((btrim(wie_wirkt_de) <> ''::text)) |
| medical | medication_user_texts | medication_user_texts_wofuer_de_check | CHECK ((cardinality(wofuer_de) > 0)) |
| medical | medication_user_texts | medication_user_texts_zu_viel_de_check | CHECK ((btrim(zu_viel_de) <> ''::text)) |
| medical | user_conditions | user_conditions_check | CHECK (((end_date IS NULL) OR (start_date IS NULL) OR (end_date >= start_date))) |
| medical | user_conditions | user_conditions_condition_code_check | CHECK ((condition_code = ANY (ARRAY['hypertension'::text, 'CKD'::text, 'diabetes'::text, 'pregnancy'::text, 'pregnancy_planned'::t |
| medical | user_conditions | user_conditions_measurement_source_check | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| medical | user_conditions | user_conditions_status_check | CHECK ((status = ANY (ARRAY['active'::text, 'resolved'::text, 'planned'::text, 'unknown'::text]))) |
| medical | user_medications | user_medications_check | CHECK (((end_date IS NULL) OR (end_date >= start_date))) |
| medical | user_medications | user_medications_dose_amount_check | CHECK (((dose_amount IS NULL) OR (dose_amount > (0)::numeric))) |
| medical | user_medications | user_medications_doses_per_day_check | CHECK (((doses_per_day IS NULL) OR (doses_per_day > (0)::numeric))) |
| medical | user_medications | user_medications_measurement_source_check | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| medical | user_medications | user_medications_name_check | CHECK ((btrim(name) <> ''::text)) |
| nutrition | exclusion_preset_rules | exclusion_preset_rules_rule_kind_check | CHECK ((rule_kind = ANY (ARRAY['category'::text, 'bls_prefix'::text, 'name'::text, 'name_not'::text, 'raw_animal'::text]))) |
| nutrition | exclusion_preset_rules | exclusion_preset_rules_rule_value_check | CHECK ((btrim(rule_value) <> ''::text)) |
| nutrition | exclusion_presets | exclusion_presets_kind_check | CHECK ((kind = ANY (ARRAY['religious'::text, 'personal'::text]))) |
| nutrition | food_aliases | food_aliases_source_check | CHECK ((source = ANY (ARRAY['editorial'::text, 'ai_generated'::text, 'user'::text, 'derived'::text, 'curated_nebenname'::text, 'cu |
| nutrition | food_categories | food_categories_level_check | CHECK ((level = ANY (ARRAY[1, 2, 3, 4]))) |
| nutrition | food_curation_candidates | food_curation_candidates_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'superseded'::text]))) |
| nutrition | food_curation_candidates | food_curation_candidates_target_type_check | CHECK ((target_type = ANY (ARRAY['category_assignment'::text, 'display_name'::text, 'alias'::text, 'preference_item_mapping'::text |
| nutrition | food_curation_decisions | food_curation_decisions_decision_check | CHECK ((decision = ANY (ARRAY['accepted'::text, 'rejected'::text, 'superseded'::text]))) |
| nutrition | food_nutrients | food_nutrients_bls_value_status_ck | CHECK ((bls_value_status = ANY (ARRAY['measured'::text, 'censored'::text, 'missing'::text, 'logical_zero'::text, 'trace'::text]))) |
| nutrition | food_preference_items | food_preference_items_exactly_one_target | CHECK (((((((((food_id IS NOT NULL))::integer + ((category_id IS NOT NULL))::integer) + ((tag_code IS NOT NULL))::integer) + ((NUL |
| nutrition | food_preference_items | food_preference_items_preference_check | CHECK ((preference = ANY (ARRAY['liked'::text, 'disliked'::text, 'hard_exclude'::text]))) |
| nutrition | food_preference_items | food_preference_items_strength_check | CHECK ((strength = ANY (ARRAY['hard_exclude'::text, 'soft_dislike'::text, 'neutral'::text, 'like'::text, 'boost'::text]))) |
| nutrition | food_preference_items | food_preference_items_target_type_check | CHECK ((target_type = ANY (ARRAY['food'::text, 'category'::text, 'tag'::text, 'cuisine'::text, 'exclusion_preset'::text, 'catalog_ |
| nutrition | food_preference_search_targets | food_preference_search_targets_constraint_level_check | CHECK ((constraint_level = ANY (ARRAY['hard'::text, 'strong'::text, 'soft'::text, 'boost'::text]))) |
| nutrition | food_preferences | food_preferences_budget_level_check | CHECK ((budget_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'no_limit'::text]))) |
| nutrition | food_preferences | food_preferences_cooking_skill_check | CHECK ((cooking_skill = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))) |
| nutrition | food_preferences | food_preferences_diet_type_check | CHECK ((diet_type = ANY (ARRAY['omnivore'::text, 'pescatarian'::text, 'vegetarian'::text, 'vegan'::text, 'keto'::text, 'paleo'::te |
| nutrition | food_preferences | food_preferences_prep_time_max_min_check | CHECK ((prep_time_max_min = ANY (ARRAY[15, 20, 30, 45, 60]))) |
| nutrition | food_preferences | food_preferences_snacks_per_day_check | CHECK ((snacks_per_day = ANY (ARRAY[0, 1, 2, 3]))) |
| nutrition | food_tags | food_tags_confidence_check | CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))) |
| nutrition | food_tags_kuriert | food_tags_kuriert_action_check | CHECK ((action = ANY (ARRAY['set'::text, 'removed'::text]))) |
| nutrition | foods | foods_processing_level_check | CHECK ((processing_level = ANY (ARRAY['raw'::text, 'minimally_processed'::text, 'processed'::text, 'ultra_processed'::text, 'cooke |
| nutrition | foods | foods_sort_weight_check | CHECK (((sort_weight >= 0) AND (sort_weight <= 1000))) |
| nutrition | foods_custom | foods_custom_alc_check | CHECK ((alc >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_ca_mg_check | CHECK ((ca_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_cho_check | CHECK ((cho >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_cu_ug_check | CHECK ((cu_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_custom_allergens_check | CHECK ((custom_allergens <@ ARRAY['allergen_gluten'::text, 'allergen_milk'::text, 'allergen_eggs'::text, 'allergen_fish'::text, 'a |
| nutrition | foods_custom | foods_custom_enercc_check | CHECK ((enercc >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_fasat_check | CHECK ((fasat >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_fat_check | CHECK ((fat >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_fe_mg_check | CHECK ((fe_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_fibt_check | CHECK ((fibt >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_fol_ug_check | CHECK ((fol_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_id_ug_check | CHECK ((id_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_k_mg_check | CHECK ((k_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_mg_mg_check | CHECK ((mg_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_mn_ug_check | CHECK ((mn_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_na_mg_check | CHECK ((na_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_nacl_check | CHECK ((nacl >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_name_de_check | CHECK ((length(TRIM(BOTH FROM name_de)) >= 2)) |
| nutrition | foods_custom | foods_custom_nia_mg_check | CHECK ((nia_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_p_mg_check | CHECK ((p_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_prot625_check | CHECK ((prot625 >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_ribf_mg_check | CHECK ((ribf_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_serving_size_g_check | CHECK ((serving_size_g > (0)::numeric)) |
| nutrition | foods_custom | foods_custom_source_check | CHECK ((source = ANY (ARRAY['user'::text, 'manual'::text, 'import'::text, 'admin'::text]))) |
| nutrition | foods_custom | foods_custom_sugar_check | CHECK ((sugar >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_thia_mg_check | CHECK ((thia_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_vita_ug_check | CHECK ((vita_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_vitb12_ug_check | CHECK ((vitb12_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_vitb6_ug_check | CHECK ((vitb6_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_vitc_mg_check | CHECK ((vitc_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_vitd_ug_check | CHECK ((vitd_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_vite_mg_check | CHECK ((vite_mg >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_vitk_ug_check | CHECK ((vitk_ug >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_water_g_check | CHECK ((water_g >= (0)::numeric)) |
| nutrition | foods_custom | foods_custom_zn_mg_check | CHECK ((zn_mg >= (0)::numeric)) |
| nutrition | foods_portions | foods_portions_amount_g_check | CHECK ((amount_g > (0)::numeric)) |
| nutrition | meal_items | meal_items_amount_g_check | CHECK ((amount_g > (0)::numeric)) |
| nutrition | meal_items | meal_items_food_source_check | CHECK ((food_source = ANY (ARRAY['bls'::text, 'manual'::text, 'custom'::text]))) |
| nutrition | meal_items | meal_items_measurement_source_ck | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| nutrition | meal_items | meal_items_portion_input_check | CHECK ((((portion_name IS NULL) AND (portion_quantity IS NULL) AND (portion_amount_g IS NULL)) OR ((portion_name IS NOT NULL) AND  |
| nutrition | meal_items | meal_items_source_target_check | CHECK ((((food_source = 'bls'::text) AND (food_id IS NOT NULL) AND (custom_food_id IS NULL)) OR ((food_source = 'custom'::text) AN |
| nutrition | meal_plan_days | meal_plan_days_day_index_check | CHECK (((day_index >= 1) AND (day_index <= 7))) |
| nutrition | meal_plan_entries | meal_plan_entries_amount_g_check | CHECK (((amount_g IS NULL) OR (amount_g > (0)::numeric))) |
| nutrition | meal_plan_entries | meal_plan_entries_entry_type_check | CHECK ((entry_type = ANY (ARRAY['recipe'::text, 'bls'::text, 'custom'::text]))) |
| nutrition | meal_plan_entries | meal_plan_entries_meal_type_check | CHECK ((meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'pre_workout'::text, 'post_workout |
| nutrition | meal_plan_entries | meal_plan_entries_planned_servings_check | CHECK (((planned_servings IS NULL) OR (planned_servings > (0)::numeric))) |
| nutrition | meal_plan_entries | meal_plan_entries_portion_check | CHECK ((((portion_name IS NULL) AND (portion_quantity IS NULL) AND (portion_amount_g IS NULL)) OR ((entry_type = ANY (ARRAY['bls': |
| nutrition | meal_plan_entries | meal_plan_entries_slot_order_check | CHECK ((slot_order >= 0)) |
| nutrition | meal_plan_entries | meal_plan_entries_target_check | CHECK ((((entry_type = 'recipe'::text) AND (recipe_id IS NOT NULL) AND (food_id IS NULL) AND (custom_food_id IS NULL) AND (planned |
| nutrition | meal_plan_logs | meal_plan_logs_confirmation_mode_check | CHECK (((confirmation_mode IS NULL) OR (confirmation_mode = ANY (ARRAY['mealcam'::text, 'manual'::text])))) |
| nutrition | meal_plan_logs | meal_plan_logs_resolution_check | CHECK ((((status = 'pending'::text) AND (actual_meal_id IS NULL) AND (confirmation_mode IS NULL) AND (confirmed_at IS NULL) AND (s |
| nutrition | meal_plan_logs | meal_plan_logs_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'deviated'::text, 'skipped'::text]))) |
| nutrition | meal_plan_slots | meal_plan_slots_name_check | CHECK ((btrim(name) <> ''::text)) |
| nutrition | meal_plan_slots | meal_plan_slots_position_check | CHECK (("position" > 0)) |
| nutrition | meal_plans | meal_plans_days_count_check | CHECK (((days_count IS NULL) OR (days_count > 0))) |
| nutrition | meal_plans | meal_plans_lifecycle_type_check | CHECK (((lifecycle_type IS NULL) OR (lifecycle_type = ANY (ARRAY['once'::text, 'rollover'::text, 'sequence'::text])))) |
| nutrition | meal_plans | meal_plans_measurement_source_check | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| nutrition | meal_plans | meal_plans_name_check | CHECK ((length(TRIM(BOTH FROM name)) >= 2)) |
| nutrition | meal_plans | meal_plans_plan_origin_check | CHECK (((plan_origin IS NULL) OR (plan_origin = ANY (ARRAY['self_created'::text, 'coach_created'::text, 'marketplace'::text, 'budd |
| nutrition | meal_plans | meal_plans_rollover_count_check | CHECK (((rollover_count IS NULL) OR (rollover_count >= 0))) |
| nutrition | meal_plans | meal_plans_sequence_not_self_check | CHECK (((next_plan_id IS NULL) OR (next_plan_id <> id))) |
| nutrition | meal_plans | meal_plans_sequence_target_check | CHECK (((lifecycle_type IS NULL) OR ((lifecycle_type = 'sequence'::text) AND (next_plan_id IS NOT NULL)) OR ((lifecycle_type <> 's |
| nutrition | meal_plans | meal_plans_status_check | CHECK ((status = ANY (ARRAY['assigned'::text, 'active'::text, 'completed'::text, 'paused'::text, 'archived'::text]))) |
| nutrition | meal_plans | meal_plans_target_carbs_g_check | CHECK (((target_carbs_g IS NULL) OR (target_carbs_g >= (0)::numeric))) |
| nutrition | meal_plans | meal_plans_target_fat_g_check | CHECK (((target_fat_g IS NULL) OR (target_fat_g >= (0)::numeric))) |
| nutrition | meal_plans | meal_plans_target_kcal_check | CHECK (((target_kcal IS NULL) OR (target_kcal >= (0)::numeric))) |
| nutrition | meal_plans | meal_plans_target_protein_g_check | CHECK (((target_protein_g IS NULL) OR (target_protein_g >= (0)::numeric))) |
| nutrition | meals | meals_entry_source_ck | CHECK ((entry_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| nutrition | meals | meals_meal_time_minute_check | CHECK (((meal_time IS NULL) OR (EXTRACT(second FROM meal_time) = (0)::numeric))) |
| nutrition | meals | meals_meal_type_check | CHECK ((meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'pre_workout'::text, 'post_workout |
| nutrition | micronutrient_overview_items | micronutrient_overview_items_display_order_check | CHECK ((display_order > 0)) |
| nutrition | micronutrient_overview_items | micronutrient_overview_items_value_source_check | CHECK ((value_source = ANY (ARRAY['daily_reference_assessment'::text, 'goals_alpha_linolenic_acid'::text]))) |
| nutrition | nutrient_aliases | nutrient_aliases_alias_check | CHECK (((length(alias) >= 2) AND (length(alias) <= 80))) |
| nutrition | nutrient_aliases | nutrient_aliases_alias_folded_check | CHECK ((alias_folded ~ '^[a-z0-9]{2,80}$'::text)) |
| nutrition | nutrient_aliases | nutrient_aliases_kind_check | CHECK ((kind = ANY (ARRAY['umgangssprache'::text, 'uebersetzung'::text, 'abkuerzung'::text, 'schreibvariante'::text, 'gruppe'::tex |
| nutrition | nutrient_aliases | nutrient_aliases_lang_check | CHECK ((lang = ANY (ARRAY['de'::text, 'en'::text, 'th'::text, 'und'::text]))) |
| nutrition | nutrient_defs | nutrient_defs_display_tier_check | CHECK ((display_tier = ANY (ARRAY[1, 2, 3]))) |
| nutrition | nutrient_reference_values | nutrient_reference_values_applies_to_intake_sources_check | CHECK (((cardinality(applies_to_intake_sources) > 0) AND (applies_to_intake_sources <@ ARRAY['foods'::text, 'fortified_foods'::tex |
| nutrition | nutrient_reference_values | nutrient_reference_values_basis_check | CHECK ((basis = ANY (ARRAY['per_day'::text, 'per_kg_bw_per_day'::text, 'energy_percent'::text, 'per_mj'::text, 'profile_calculated |
| nutrition | nutrient_reference_values | nutrient_reference_values_check | CHECK (((age_max IS NULL) OR (age_min IS NULL) OR (age_min <= age_max))) |
| nutrition | nutrient_reference_values | nutrient_reference_values_check1 | CHECK (((reference_kind = ANY (ARRAY['NO_REFERENCE'::text, 'NO_STANDALONE_REFERENCE'::text, 'FORMULA'::text, 'ALAP'::text])) OR (( |
| nutrition | nutrient_reference_values | nutrient_reference_values_check2 | CHECK (((value_max IS NULL) OR (value_min IS NULL) OR (value_min <= value_max))) |
| nutrition | nutrient_reference_values | nutrient_reference_values_derived_note_check | CHECK (((NOT is_derived) OR (NULLIF(btrim(derivation_note), ''::text) IS NOT NULL))) |
| nutrition | nutrient_reference_values | nutrient_reference_values_reference_kind_check | CHECK ((reference_kind = ANY (ARRAY['AR'::text, 'PRI'::text, 'AI'::text, 'RI'::text, 'UL'::text, 'ALAP'::text, 'FORMULA'::text, 'N |
| nutrition | nutrient_reference_values | nutrient_reference_values_sex_check | CHECK ((sex = ANY (ARRAY['male'::text, 'female'::text, 'both'::text]))) |
| nutrition | nutrient_reference_values | nutrient_reference_values_source_priority_check | CHECK ((source_priority >= 0)) |
| nutrition | nutrient_reference_values | nutrient_reference_values_ul_positive_check | CHECK (((reference_kind <> 'UL'::text) OR ((value_min IS NOT NULL) AND (value_min > (0)::numeric) AND (value_max IS NOT NULL) AND  |
| nutrition | nutrient_unit_conversion_factors | nutrient_unit_conversion_factors_factor_check | CHECK ((factor > (0)::numeric)) |
| nutrition | nutrient_unit_conversion_factors | nutrient_unit_conversion_factors_source_check | CHECK ((length(btrim(source)) > 0)) |
| nutrition | nutrient_unit_conversion_factors | nutrient_unit_conversion_factors_source_locator_check | CHECK ((length(btrim(source_locator)) > 0)) |
| nutrition | nutrient_unit_conversion_factors | nutrient_unit_conversion_factors_source_url_check | CHECK ((length(btrim(source_url)) > 0)) |
| nutrition | nutrient_unit_conversion_factors | nutrient_unit_conversion_factors_source_version_check | CHECK ((length(btrim(source_version)) > 0)) |
| nutrition | recipe_curation_candidate_ingredients | recipe_curation_candidate_ingredients_amount_g_check | CHECK ((amount_g > (0)::numeric)) |
| nutrition | recipe_curation_candidate_ingredients | recipe_curation_candidate_ingredients_food_name_snapshot_check | CHECK ((length(btrim(food_name_snapshot)) > 0)) |
| nutrition | recipe_curation_candidate_ingredients | recipe_curation_candidate_ingredients_food_source_check | CHECK ((food_source = ANY (ARRAY['bls'::text, 'custom'::text]))) |
| nutrition | recipe_curation_candidate_ingredients | recipe_curation_candidate_ingredients_sort_order_check | CHECK ((sort_order >= 0)) |
| nutrition | recipe_curation_candidates | recipe_curation_candidates_cook_time_min_check | CHECK (((cook_time_min IS NULL) OR (cook_time_min >= 0))) |
| nutrition | recipe_curation_candidates | recipe_curation_candidates_name_de_check | CHECK ((length(btrim(name_de)) >= 2)) |
| nutrition | recipe_curation_candidates | recipe_curation_candidates_prep_time_min_check | CHECK (((prep_time_min IS NULL) OR (prep_time_min >= 0))) |
| nutrition | recipe_curation_candidates | recipe_curation_candidates_servings_check | CHECK ((servings > (0)::numeric)) |
| nutrition | recipe_curation_candidates | recipe_curation_candidates_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'superseded'::text]))) |
| nutrition | recipe_curation_candidates | recipe_curation_candidates_submitted_via_check | CHECK ((submitted_via = 'mealcam'::text)) |
| nutrition | recipe_curation_decisions | recipe_curation_decisions_decision_check | CHECK ((decision = ANY (ARRAY['accepted'::text, 'rejected'::text, 'superseded'::text]))) |
| nutrition | recipe_ingredients | recipe_ingredients_amount_g_check | CHECK ((amount_g > (0)::numeric)) |
| nutrition | recipe_ingredients | recipe_ingredients_food_source_check | CHECK ((food_source = ANY (ARRAY['bls'::text, 'custom'::text]))) |
| nutrition | recipe_ingredients | recipe_ingredients_portion_check | CHECK ((((portion_name IS NULL) AND (portion_quantity IS NULL) AND (portion_amount_g IS NULL)) OR ((portion_name IS NOT NULL) AND  |
| nutrition | recipe_ingredients | recipe_ingredients_sort_order_check | CHECK ((sort_order >= 0)) |
| nutrition | recipe_ingredients | recipe_ingredients_source_target_check | CHECK ((((food_source = 'bls'::text) AND (food_id IS NOT NULL) AND (custom_food_id IS NULL)) OR ((food_source = 'custom'::text) AN |
| nutrition | recipes | recipes_cook_time_min_check | CHECK (((cook_time_min IS NULL) OR (cook_time_min >= 0))) |
| nutrition | recipes | recipes_cooking_skill_check | CHECK ((cooking_skill = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))) |
| nutrition | recipes | recipes_measurement_source_check | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| nutrition | recipes | recipes_name_de_check | CHECK ((length(TRIM(BOTH FROM name_de)) >= 2)) |
| nutrition | recipes | recipes_prep_time_min_check | CHECK (((prep_time_min IS NULL) OR (prep_time_min >= 0))) |
| nutrition | recipes | recipes_servings_check | CHECK ((servings > (0)::numeric)) |
| nutrition | recipes | recipes_source_check | CHECK ((source = ANY (ARRAY['user'::text, 'coach'::text, 'marketplace'::text, 'buddy'::text]))) |
| nutrition | search_events | search_events_result_count_check | CHECK ((result_count >= 0)) |
| nutrition | search_events | search_events_selected_rank_check | CHECK (((selected_rank IS NULL) OR (selected_rank > 0))) |
| nutrition | search_events | search_events_session_id_check | CHECK ((length(TRIM(BOTH FROM session_id)) >= 16)) |
| nutrition | search_synonyms | search_synonyms_source_check | CHECK ((source = ANY (ARRAY['openthesaurus'::text, 'handarbeit'::text]))) |
| nutrition | shopping_list_items | shopping_list_items_amount_g_check | CHECK (((amount_g IS NULL) OR (amount_g > (0)::numeric))) |
| nutrition | shopping_list_items | shopping_list_items_amount_or_quantity_check | CHECK (((amount_g IS NOT NULL) OR (quantity IS NOT NULL))) |
| nutrition | shopping_list_items | shopping_list_items_food_name_check | CHECK ((length(TRIM(BOTH FROM food_name)) >= 1)) |
| nutrition | shopping_list_items | shopping_list_items_item_source_check | CHECK ((item_source = ANY (ARRAY['bls'::text, 'custom'::text, 'free_text'::text]))) |
| nutrition | shopping_list_items | shopping_list_items_quantity_check | CHECK (((quantity IS NULL) OR (quantity > (0)::numeric))) |
| nutrition | shopping_list_items | shopping_list_items_sort_order_check | CHECK ((sort_order >= 0)) |
| nutrition | shopping_list_items | shopping_list_items_source_target_check | CHECK ((((item_source = 'bls'::text) AND (food_id IS NOT NULL) AND (custom_food_id IS NULL)) OR ((item_source = 'custom'::text) AN |
| nutrition | shopping_lists | shopping_lists_measurement_source_check | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| nutrition | shopping_lists | shopping_lists_name_check | CHECK ((length(TRIM(BOTH FROM name)) >= 2)) |
| nutrition | shopping_lists | shopping_lists_servings_check | CHECK ((servings > (0)::numeric)) |
| nutrition | shopping_lists | shopping_lists_source_target_check | CHECK ((((source_type = 'recipe'::text) AND (recipe_id IS NOT NULL) AND (meal_plan_week_id IS NULL)) OR ((source_type = 'meal_plan |
| nutrition | shopping_lists | shopping_lists_source_type_check | CHECK ((source_type = ANY (ARRAY['manual'::text, 'recipe'::text, 'meal_plan'::text, 'supplement_reorder'::text, 'nutrition_reorder |
| nutrition | shopping_lists | shopping_lists_status_check | CHECK ((status = ANY (ARRAY['open'::text, 'completed'::text, 'archived'::text]))) |
| nutrition | tag_definitions | tag_definitions_filter_group_check | CHECK (((filter_group IS NULL) OR (filter_group = ANY (ARRAY['dietary_pattern'::text, 'nutrient'::text, 'processing'::text, 'aller |
| nutrition | tag_definitions | tag_definitions_tag_type_check | CHECK ((tag_type = ANY (ARRAY['ingredient'::text, 'diet'::text, 'allergen'::text, 'fitness'::text, 'gym'::text, 'processing'::text |
| nutrition | user_inventory | user_inventory_menge_g_check | CHECK ((menge_g >= (0)::numeric)) |
| nutrition | user_inventory | user_inventory_schwelle_g_check | CHECK (((schwelle_g IS NULL) OR (schwelle_g >= (0)::numeric))) |
| nutrition | user_inventory | user_inventory_source_target_check | CHECK ((((food_id IS NOT NULL) AND (custom_food_id IS NULL)) OR ((food_id IS NULL) AND (custom_food_id IS NOT NULL)))) |
| nutrition | water_logs | water_logs_amount_ml_check | CHECK ((amount_ml > (0)::numeric)) |
| nutrition | water_logs | water_logs_measurement_source_ck | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| nutrition | water_logs | water_logs_source_check | CHECK ((source = ANY (ARRAY['manual'::text, 'quick_add'::text]))) |
| public | profiles | profiles_activity_level_check | CHECK (((activity_level IS NULL) OR (activity_level = ANY (ARRAY['sedentary'::text, 'light'::text, 'moderate'::text, 'active'::tex |
| public | profiles | profiles_biological_sex_check | CHECK (((biological_sex IS NULL) OR (biological_sex = ANY (ARRAY['male'::text, 'female'::text])))) |
| public | profiles | profiles_birth_date_check | CHECK (((birth_date IS NULL) OR ((birth_date >= '1900-01-01'::date) AND (birth_date <= CURRENT_DATE)))) |
| public | profiles | profiles_body_weight_kg_check | CHECK (((body_weight_kg IS NULL) OR ((body_weight_kg >= (20)::numeric) AND (body_weight_kg <= (400)::numeric)))) |
| public | profiles | profiles_experience_level_check | CHECK (((experience_level IS NULL) OR (experience_level = ANY (ARRAY['beginner'::text, 'advanced'::text, 'pro'::text, 'elite'::tex |
| public | profiles | profiles_height_cm_check | CHECK (((height_cm IS NULL) OR ((height_cm >= (80)::numeric) AND (height_cm <= (260)::numeric)))) |
| public | profiles | profiles_lactation_period_check | CHECK (((lactation_started_on IS NULL) OR (lactation_ended_on IS NULL) OR (lactation_ended_on >= lactation_started_on))) |
| public | profiles | profiles_locale_check | CHECK (((locale IS NULL) OR (locale = ANY (ARRAY['de'::text, 'en'::text, 'th'::text])))) |
| public | profiles | profiles_nutrition_goal_check | CHECK (((nutrition_goal IS NULL) OR (nutrition_goal = ANY (ARRAY['lose_weight'::text, 'maintain'::text, 'gain_muscle'::text, 'reco |
| public | profiles | profiles_pregnancy_period_check | CHECK (((pregnancy_started_on IS NULL) OR (pregnancy_ended_on IS NULL) OR (pregnancy_ended_on >= pregnancy_started_on))) |
| public | user_display_preferences | user_display_preferences_key_check | CHECK ((preference_key ~ '^[a-z0-9_.:-]{3,120}$'::text)) |
| public | user_display_preferences | user_display_preferences_value_object_check | CHECK ((jsonb_typeof(value) = 'object'::text)) |
| recovery | checkins | checkins_alcohol_units_check | CHECK (((alcohol_units IS NULL) OR (alcohol_units >= (0)::numeric))) |
| recovery | checkins | checkins_caffeine_mg_check | CHECK (((caffeine_mg IS NULL) OR (caffeine_mg >= 0))) |
| recovery | checkins | checkins_checkin_time_check | CHECK (((checkin_time IS NULL) OR (EXTRACT(second FROM checkin_time) = (0)::numeric))) |
| recovery | checkins | checkins_energy_level_check | CHECK (((energy_level IS NULL) OR ((energy_level >= 1) AND (energy_level <= 10)))) |
| recovery | checkins | checkins_hrv_rmssd_check | CHECK (((hrv_rmssd IS NULL) OR (hrv_rmssd >= (0)::numeric))) |
| recovery | checkins | checkins_life_stress_check | CHECK (((life_stress IS NULL) OR ((life_stress >= 1) AND (life_stress <= 10)))) |
| recovery | checkins | checkins_mood_check | CHECK ((mood = ANY (ARRAY['motivated'::text, 'good'::text, 'neutral'::text, 'tired'::text, 'sick'::text]))) |
| recovery | checkins | checkins_motivation_check | CHECK (((motivation IS NULL) OR ((motivation >= 1) AND (motivation <= 10)))) |
| recovery | checkins | checkins_respiratory_rate_check | CHECK (((respiratory_rate IS NULL) OR (respiratory_rate > (0)::numeric))) |
| recovery | checkins | checkins_resting_hr_check | CHECK (((resting_hr IS NULL) OR ((resting_hr >= 25) AND (resting_hr <= 240)))) |
| recovery | checkins | checkins_screen_time_before_bed_check | CHECK (((screen_time_before_bed IS NULL) OR (screen_time_before_bed >= 0))) |
| recovery | checkins | checkins_sleep_hours_check | CHECK (((sleep_hours IS NULL) OR ((sleep_hours >= (0)::numeric) AND (sleep_hours <= (14)::numeric)))) |
| recovery | checkins | checkins_sleep_quality_check | CHECK (((sleep_quality IS NULL) OR ((sleep_quality >= 1) AND (sleep_quality <= 10)))) |
| recovery | checkins | checkins_soreness_check | CHECK ((jsonb_typeof(soreness) = 'object'::text)) |
| recovery | checkins | checkins_spo2_pct_check | CHECK (((spo2_pct IS NULL) OR ((spo2_pct >= (50)::numeric) AND (spo2_pct <= (100)::numeric)))) |
| recovery | checkins | checkins_stress_level_check | CHECK (((stress_level IS NULL) OR ((stress_level >= 1) AND (stress_level <= 10)))) |
| recovery | checkins | checkins_subjective_feeling_check | CHECK (((subjective_feeling IS NULL) OR ((subjective_feeling >= 1) AND (subjective_feeling <= 10)))) |
| recovery | checkins | checkins_work_stress_check | CHECK (((work_stress IS NULL) OR ((work_stress >= 1) AND (work_stress <= 10)))) |
| recovery | checkins | recovery_checkins_measurement_source_ck | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| recovery | modality_log | modality_log_bonus_value_check | CHECK (((bonus_value >= (0)::numeric) AND (bonus_value <= (5)::numeric))) |
| recovery | modality_log | modality_log_duration_min_check | CHECK (((duration_min IS NULL) OR (duration_min >= 0))) |
| recovery | modality_log | modality_log_immediate_effect_check | CHECK (((immediate_effect IS NULL) OR ((immediate_effect >= 1) AND (immediate_effect <= 10)))) |
| recovery | modality_log | modality_log_logged_time_check | CHECK (((logged_time IS NULL) OR (EXTRACT(second FROM logged_time) = (0)::numeric))) |
| recovery | modality_log | modality_log_measurement_source_check | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| recovery | modality_log | modality_log_modality_type_check | CHECK ((modality_type = ANY (ARRAY['sauna'::text, 'cold_plunge'::text, 'contrast_therapy'::text, 'massage'::text, 'foam_rolling':: |
| recovery | modality_log | modality_log_next_day_effect_check | CHECK (((next_day_effect IS NULL) OR ((next_day_effect >= 1) AND (next_day_effect <= 10)))) |
| recovery | overtraining_alerts | overtraining_alerts_severity_check | CHECK ((severity = ANY (ARRAY['normal'::text, 'moderate'::text, 'high'::text, 'critical'::text]))) |
| recovery | overtraining_alerts | overtraining_alerts_signals_check | CHECK ((jsonb_typeof(signals) = 'array'::text)) |
| recovery | overtraining_alerts | overtraining_alerts_status_check | CHECK ((status = ANY (ARRAY['active'::text, 'acknowledged'::text, 'resolved'::text]))) |
| recovery | recovery_protocols | recovery_protocols_completed_days_check | CHECK ((completed_days >= 0)) |
| recovery | recovery_protocols | recovery_protocols_daily_activities_check | CHECK ((jsonb_typeof(daily_activities) = 'array'::text)) |
| recovery | recovery_protocols | recovery_protocols_duration_days_check | CHECK (((duration_days >= 1) AND (duration_days <= 31))) |
| recovery | recovery_protocols | recovery_protocols_protocol_key_check | CHECK ((protocol_key = ANY (ARRAY['active_recovery_week'::text, 'passive_deload'::text, 'sleep_optimization'::text, 'injury_protoc |
| recovery | recovery_protocols | recovery_protocols_status_check | CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'discontinued'::text]))) |
| recovery | score_contributions | score_contributions_input_score_check | CHECK (((input_score >= (0)::numeric) AND (input_score <= (100)::numeric))) |
| recovery | score_contributions | score_contributions_source_module_check | CHECK ((source_module = ANY (ARRAY['recovery'::text, 'training'::text, 'nutrition'::text, 'medical'::text]))) |
| recovery | score_contributions | score_contributions_source_status_check | CHECK ((source_status = ANY (ARRAY['measured'::text, 'fallback'::text, 'unavailable'::text]))) |
| recovery | score_contributions | score_contributions_weight_percent_check | CHECK (((weight_percent >= (0)::numeric) AND (weight_percent <= (100)::numeric))) |
| recovery | scores | scores_fallbacks_check | CHECK ((jsonb_typeof(fallbacks) = 'object'::text)) |
| recovery | scores | scores_hrv_score_check | CHECK (((hrv_score IS NULL) OR ((hrv_score >= (0)::numeric) AND (hrv_score <= (100)::numeric)))) |
| recovery | scores | scores_measurement_source_check | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text, 'derived'::te |
| recovery | scores | scores_modality_bonus_check | CHECK (((modality_bonus >= (0)::numeric) AND (modality_bonus <= (5)::numeric))) |
| recovery | scores | scores_mode_check | CHECK ((mode = 'manual'::text)) |
| recovery | scores | scores_mood_score_check | CHECK (((mood_score >= (0)::numeric) AND (mood_score <= (100)::numeric))) |
| recovery | scores | scores_nutrition_score_check | CHECK (((nutrition_score >= (0)::numeric) AND (nutrition_score <= (100)::numeric))) |
| recovery | scores | scores_score_check | CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric))) |
| recovery | scores | scores_sleep_duration_score_check | CHECK (((sleep_duration_score >= (0)::numeric) AND (sleep_duration_score <= (100)::numeric))) |
| recovery | scores | scores_sleep_quality_score_check | CHECK (((sleep_quality_score >= (0)::numeric) AND (sleep_quality_score <= (100)::numeric))) |
| recovery | scores | scores_soreness_reported_count_check | CHECK ((soreness_reported_count >= 0)) |
| recovery | scores | scores_soreness_score_check | CHECK (((soreness_score >= (0)::numeric) AND (soreness_score <= (100)::numeric))) |
| recovery | scores | scores_subjective_feeling_score_check | CHECK (((subjective_feeling_score >= (0)::numeric) AND (subjective_feeling_score <= (100)::numeric))) |
| recovery | scores | scores_training_load_score_check | CHECK (((training_load_score >= (0)::numeric) AND (training_load_score <= (100)::numeric))) |
| recovery | stress_logs | stress_logs_life_stress_check | CHECK (((life_stress >= 1) AND (life_stress <= 10))) |
| recovery | stress_logs | stress_logs_source_check | CHECK ((source = ANY (ARRAY['checkin'::text, 'manual'::text, 'import'::text]))) |
| recovery | stress_logs | stress_logs_stress_level_check | CHECK (((stress_level >= 1) AND (stress_level <= 10))) |
| recovery | stress_logs | stress_logs_work_stress_check | CHECK (((work_stress >= 1) AND (work_stress <= 10))) |
| supplements | entity_cyp | entity_cyp_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | entity_pk | entity_pk_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | entity_renal_hepatic | entity_renal_hepatic_organ_check | CHECK ((organ = ANY (ARRAY['renal'::text, 'hepatic'::text, 'reproductive'::text]))) |
| supplements | entity_renal_hepatic | entity_renal_hepatic_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | entity_transporters | entity_transporters_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | intake_logs | intake_logs_actual_dose_check | CHECK (((actual_dose IS NULL) OR (actual_dose > (0)::numeric))) |
| supplements | intake_logs | intake_logs_dose_snapshot_check | CHECK ((dose_snapshot > (0)::numeric)) |
| supplements | intake_logs | intake_logs_dose_unit_snapshot_check | CHECK ((btrim(dose_unit_snapshot) <> ''::text)) |
| supplements | intake_logs | intake_logs_intake_time_check | CHECK (((intake_time IS NULL) OR (EXTRACT(second FROM intake_time) = (0)::numeric))) |
| supplements | intake_logs | intake_logs_measurement_source_ck | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| supplements | intake_logs | intake_logs_status_check | CHECK ((status = ANY (ARRAY['planned'::text, 'taken'::text, 'skipped'::text, 'snoozed'::text]))) |
| supplements | intake_logs | intake_logs_supplement_name_snapshot_check | CHECK ((btrim(supplement_name_snapshot) <> ''::text)) |
| supplements | intake_schedule | intake_schedule_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | rule_catalog | rule_catalog_conditions_check | CHECK ((jsonb_typeof(conditions) = 'array'::text)) |
| supplements | rule_catalog | rule_catalog_effects_check | CHECK ((jsonb_typeof(effects) = 'array'::text)) |
| supplements | rule_catalog | rule_catalog_evidence_check | CHECK ((jsonb_typeof(evidence) = 'array'::text)) |
| supplements | rule_catalog | rule_catalog_input_coverage_status_check | CHECK ((input_coverage_status = ANY (ARRAY['auswertbar'::text, 'teilweise'::text, 'blockiert'::text]))) |
| supplements | rule_catalog | rule_catalog_message_key_check | CHECK ((btrim(message_key) <> ''::text)) |
| supplements | rule_catalog | rule_catalog_rule_id_check | CHECK ((btrim(rule_id) <> ''::text)) |
| supplements | rule_catalog | rule_catalog_rule_type_check | CHECK ((rule_type = ANY (ARRAY['warning'::text, 'nutrient_gap'::text, 'medication'::text]))) |
| supplements | stack_curation_candidate_items | stack_curation_candidate_items_identity_check | CHECK ((((supplement_id IS NOT NULL) AND (NULLIF(btrim(COALESCE(custom_name, ''::text)), ''::text) IS NULL)) OR ((supplement_id IS |
| supplements | stack_curation_candidate_items | stack_curation_candidate_items_tier_check | CHECK ((tier = ANY (ARRAY['must'::text, 'good'::text, 'nice'::text]))) |
| supplements | stack_curation_candidates | stack_curation_candidates_name_de_check | CHECK ((length(btrim(name_de)) >= 2)) |
| supplements | stack_curation_candidates | stack_curation_candidates_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text]))) |
| supplements | stack_curation_decisions | stack_curation_decisions_decision_check | CHECK ((decision = ANY (ARRAY['accepted'::text, 'rejected'::text]))) |
| supplements | stack_items | stack_items_check | CHECK (((supplement_id IS NOT NULL) OR (custom_name IS NOT NULL))) |
| supplements | stack_items | stack_items_cycling_check | CHECK (((cycling IS NULL) OR (((jsonb_typeof(cycling) = 'object'::text) AND (jsonb_typeof((cycling -> 'on_weeks'::text)) = 'number |
| supplements | stack_items | stack_items_dose_check | CHECK ((dose > (0)::numeric)) |
| supplements | stack_items | stack_items_dose_unit_check | CHECK ((btrim(dose_unit) <> ''::text)) |
| supplements | stack_items | stack_items_frequency_check | CHECK ((frequency = ANY (ARRAY['daily'::text, 'weekdays'::text, 'training_days'::text, 'custom'::text, 'cycling'::text]))) |
| supplements | stack_items | stack_items_low_stock_threshold_check | CHECK (((low_stock_threshold IS NULL) OR (low_stock_threshold >= (0)::numeric))) |
| supplements | stack_items | stack_items_stock_remaining_check | CHECK (((stock_remaining IS NULL) OR (stock_remaining >= (0)::numeric))) |
| supplements | stack_items | stack_items_timing_check | CHECK ((timing = ANY (ARRAY['morning'::text, 'midday'::text, 'evening'::text, 'pre_workout'::text, 'post_workout'::text, 'bedtime' |
| supplements | stack_template_items | stack_template_items_identity_check | CHECK ((((supplement_id IS NOT NULL) AND (NULLIF(btrim(COALESCE(custom_name, ''::text)), ''::text) IS NULL)) OR ((supplement_id IS |
| supplements | stack_template_items | stack_template_items_tier_check | CHECK ((tier = ANY (ARRAY['must'::text, 'good'::text, 'nice'::text]))) |
| supplements | stack_templates | stack_templates_source_check | CHECK ((source = ANY (ARRAY['system'::text, 'coach'::text, 'community'::text, 'curated'::text, 'user'::text]))) |
| supplements | stack_templates | stack_templates_user_origin_check | CHECK (((origin_stack_id IS NULL) OR (source = 'user'::text))) |
| supplements | stack_templates | stack_templates_user_owner_check | CHECK (((source = 'user'::text) = (owner_id IS NOT NULL))) |
| supplements | substance_aliases | substance_aliases_alias_check | CHECK ((btrim(alias) <> ''::text)) |
| supplements | substance_aliases | substance_aliases_alias_folded_check | CHECK ((btrim(alias_folded) <> ''::text)) |
| supplements | substance_aliases | substance_aliases_catalog_check | CHECK ((catalog = ANY (ARRAY['lumeos_supplement_catalog'::text, 'f05_substance_candidate'::text, 'kimi_substance'::text]))) |
| supplements | substance_aliases | substance_aliases_entity_id_check | CHECK ((btrim(entity_id) <> ''::text)) |
| supplements | substance_aliases | substance_aliases_entity_label_check | CHECK ((btrim(entity_label) <> ''::text)) |
| supplements | substance_aliases | substance_aliases_source_check | CHECK ((btrim(source) <> ''::text)) |
| supplements | substance_aliases | substance_aliases_source_ref_check | CHECK ((btrim(source_ref) <> ''::text)) |
| supplements | substance_group_memberships | substance_group_memberships_source_check | CHECK ((btrim(source) <> ''::text)) |
| supplements | substance_group_memberships | substance_group_memberships_substance_group_id_check | CHECK ((btrim(substance_group_id) <> ''::text)) |
| supplements | supplement_aas_ratings | supplement_aas_ratings_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_aliases | supplement_aliases_alias_check | CHECK ((btrim(alias) <> ''::text)) |
| supplements | supplement_aliases | supplement_aliases_confidence_check | CHECK (((confidence IS NULL) OR ((confidence >= (0)::numeric) AND (confidence <= (1)::numeric)))) |
| supplements | supplement_aliases | supplement_aliases_source_check | CHECK ((btrim(source) <> ''::text)) |
| supplements | supplement_categories | supplement_categories_slug_check | CHECK ((btrim(slug) <> ''::text)) |
| supplements | supplement_cycle_events | supplement_cycle_events_event_type_check | CHECK ((event_type = ANY (ARRAY['created'::text, 'confirmed'::text, 'paused'::text, 'resumed'::text, 'stopped'::text, 'reminder_se |
| supplements | supplement_dosing | supplement_dosing_anecdotal_dose_ranges_check | CHECK (((anecdotal_dose_ranges IS NULL) OR (jsonb_typeof(anecdotal_dose_ranges) = ANY (ARRAY['object'::text, 'array'::text])))) |
| supplements | supplement_dosing | supplement_dosing_guideline_dose_check | CHECK (((guideline_dose IS NULL) OR (jsonb_typeof(guideline_dose) = ANY (ARRAY['object'::text, 'array'::text, 'string'::text, 'num |
| supplements | supplement_dosing | supplement_dosing_official_label_dose_check | CHECK (((official_label_dose IS NULL) OR (jsonb_typeof(official_label_dose) = ANY (ARRAY['object'::text, 'array'::text, 'string':: |
| supplements | supplement_dosing | supplement_dosing_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_dosing | supplement_dosing_studied_dose_ranges_check | CHECK (((studied_dose_ranges IS NULL) OR (jsonb_typeof(studied_dose_ranges) = ANY (ARRAY['object'::text, 'array'::text])))) |
| supplements | supplement_dosing | supplement_dosing_upper_limit_check | CHECK (((upper_limit IS NULL) OR (jsonb_typeof(upper_limit) = ANY (ARRAY['object'::text, 'array'::text, 'string'::text, 'number':: |
| supplements | supplement_evidence | supplement_evidence_human_trials_check | CHECK (((human_trials IS NULL) OR (human_trials >= 0))) |
| supplements | supplement_evidence | supplement_evidence_meta_analyses_check | CHECK (((meta_analyses IS NULL) OR (meta_analyses >= 0))) |
| supplements | supplement_evidence | supplement_evidence_overall_grade_check | CHECK (((overall_grade IS NULL) OR (overall_grade = ANY (ARRAY['S'::text, 'A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, ' |
| supplements | supplement_evidence | supplement_evidence_randomized_trials_check | CHECK (((randomized_trials IS NULL) OR (randomized_trials >= 0))) |
| supplements | supplement_evidence | supplement_evidence_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_faq | supplement_faq_antwort_de_check | CHECK ((btrim(antwort_de) <> ''::text)) |
| supplements | supplement_faq | supplement_faq_antwort_en_check | CHECK ((btrim(antwort_en) <> ''::text)) |
| supplements | supplement_faq | supplement_faq_frage_de_check | CHECK ((btrim(frage_de) <> ''::text)) |
| supplements | supplement_faq | supplement_faq_frage_en_check | CHECK ((btrim(frage_en) <> ''::text)) |
| supplements | supplement_field_sources | supplement_field_sources_field_name_check | CHECK ((btrim(field_name) <> ''::text)) |
| supplements | supplement_field_sources | supplement_field_sources_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_groups | supplement_groups_code_check | CHECK ((btrim(code) <> ''::text)) |
| supplements | supplement_groups | supplement_groups_min_experience_level_check | CHECK (((min_experience_level IS NULL) OR (min_experience_level = ANY (ARRAY['beginner'::text, 'advanced'::text, 'pro'::text, 'eli |
| supplements | supplement_identifiers | supplement_identifiers_identifier_type_check | CHECK ((btrim(identifier_type) <> ''::text)) |
| supplements | supplement_identifiers | supplement_identifiers_identifier_value_check | CHECK ((btrim(identifier_value) <> ''::text)) |
| supplements | supplement_identifiers | supplement_identifiers_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_interactions | supplement_interactions_evidence_level_check | CHECK (((evidence_level IS NULL) OR (evidence_level = ANY (ARRAY['low'::text, 'moderate'::text, 'high'::text])))) |
| supplements | supplement_interactions | supplement_interactions_interaction_type_check | CHECK ((interaction_type = ANY (ARRAY['synergy'::text, 'absorption'::text, 'conflict'::text, 'timing'::text, 'contraindication'::t |
| supplements | supplement_interactions | supplement_interactions_partner_type_check | CHECK (((partner_type IS NULL) OR (partner_type = ANY (ARRAY['supplement'::text, 'drug'::text, 'food'::text, 'alcohol'::text, 'dis |
| supplements | supplement_interactions | supplement_interactions_severity_check | CHECK ((severity = ANY (ARRAY['info'::text, 'caution'::text, 'warning'::text, 'critical'::text]))) |
| supplements | supplement_interactions | supplement_interactions_source_check | CHECK ((source = ANY (ARRAY['curated'::text, 'import'::text, 'legacy_seed'::text]))) |
| supplements | supplement_interactions | supplement_interactions_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_interactions | supplement_interactions_timing_recommendation_check | CHECK (((timing_recommendation IS NULL) OR (timing_recommendation = ANY (ARRAY['separate_2h'::text, 'separate_4h'::text, 'separate |
| supplements | supplement_lab_effects | supplement_lab_effects_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_monitoring | supplement_monitoring_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_nutrients | supplement_nutrients_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_organ_risks | supplement_organ_risks_organ_check | CHECK ((btrim(organ) <> ''::text)) |
| supplements | supplement_organ_risks | supplement_organ_risks_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_pharmacology | supplement_pharmacology_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_portions | supplement_portions_amount_check | CHECK (((amount IS NULL) OR (amount > (0)::numeric))) |
| supplements | supplement_protocol_requirements | supplement_protocol_requirements_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_protocols | supplement_protocols_status_check | CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text]))) |
| supplements | supplement_quality | supplement_quality_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_regulatory | supplement_regulatory_jurisdiction_check | CHECK ((btrim(jurisdiction) <> ''::text)) |
| supplements | supplement_regulatory | supplement_regulatory_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_safety | supplement_safety_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_tag_definitions | supplement_tag_definitions_code_check | CHECK ((btrim(code) <> ''::text)) |
| supplements | supplement_tag_definitions | supplement_tag_definitions_tag_type_check | CHECK ((btrim(tag_type) <> ''::text)) |
| supplements | supplement_tags | supplement_tags_confidence_check | CHECK (((confidence IS NULL) OR ((confidence >= (0)::numeric) AND (confidence <= (1)::numeric)))) |
| supplements | supplement_tags | supplement_tags_evidence_grade_check | CHECK (((evidence_grade IS NULL) OR (evidence_grade = ANY (ARRAY['S'::text, 'A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, |
| supplements | supplement_user_texts | supplement_user_texts_kurz_was_de_check | CHECK ((char_length(kurz_was_de) <= 140)) |
| supplements | supplement_user_texts | supplement_user_texts_kurz_was_en_check | CHECK ((char_length(kurz_was_en) <= 140)) |
| supplements | supplement_user_texts | supplement_user_texts_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_user_texts | supplement_user_texts_wofuer_de_check | CHECK (((array_length(wofuer_de, 1) >= 1) AND (array_length(wofuer_de, 1) <= 4))) |
| supplements | supplement_user_texts | supplement_user_texts_wofuer_en_check | CHECK (((array_length(wofuer_en, 1) >= 1) AND (array_length(wofuer_en, 1) <= 4))) |
| supplements | supplement_wada | supplement_wada_detection_time_days_check | CHECK (((detection_time_days IS NULL) OR (detection_time_days >= (0)::numeric))) |
| supplements | supplement_wada | supplement_wada_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplement_warnings | supplement_warnings_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | supplements | supplements_evidence_grade_check | CHECK (((evidence_grade IS NULL) OR (evidence_grade = ANY (ARRAY['S'::text, 'A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, |
| supplements | supplements | supplements_slug_check | CHECK ((btrim(slug) <> ''::text)) |
| supplements | user_inventory | user_inventory_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| supplements | user_stacks | user_stacks_goal_check | CHECK ((goal = ANY (ARRAY['muscle_building'::text, 'fat_loss'::text, 'recovery_sleep'::text, 'health'::text, 'longevity'::text, 'p |
| supplements | user_stacks | user_stacks_item_count_check | CHECK ((item_count >= 0)) |
| supplements | user_stacks | user_stacks_name_check | CHECK ((btrim(name) <> ''::text)) |
| supplements | user_stacks | user_stacks_source_check | CHECK ((source = ANY (ARRAY['user'::text, 'coach'::text, 'marketplace'::text, 'template'::text]))) |
| supplements | user_supplement_cycles | user_supplement_cycles_source_check | CHECK ((source = ANY (ARRAY['coach_suggested'::text, 'confirmed_by_user'::text]))) |
| supplements | user_supplement_cycles | user_supplement_cycles_status_check | CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'stopped'::text]))) |
| supplements | user_supplement_cycles | user_supplement_cycles_suggestion_source_check | CHECK (((suggestion_source IS NULL) OR (suggestion_source = ANY (ARRAY['ai_suggested'::text, 'marketplace_product'::text, 'coach_r |
| supplements | user_supplement_settings | user_supplement_settings_low_stock_days_check | CHECK (((low_stock_days IS NULL) OR (low_stock_days >= 0))) |
| supplements | user_supplement_settings | user_supplement_settings_status_check | CHECK ((status = ANY (ARRAY['bekannt'::text, 'unbekannt'::text, 'nicht_zutreffend'::text]))) |
| training | equipment | equipment_group_known | CHECK (((equipment_group IS NULL) OR (equipment_group = ANY (ARRAY['free_weights'::text, 'cables_bands'::text, 'machines_benches': |
| training | exercise_catalog_enrichment | exercise_catalog_enrichment_match_status_check | CHECK ((match_status = ANY (ARRAY['unique'::text, 'duplicate_identical'::text, 'duplicate_one_filled'::text]))) |
| training | exercise_muscles | exercise_muscles_role_check | CHECK ((role = ANY (ARRAY['primary'::text, 'secondary'::text, 'stabilizer'::text]))) |
| training | exercises | exercises_category_check | CHECK ((category = ANY (ARRAY['Bodyweight'::text, 'Free Weights'::text, 'Resistance'::text, 'Cardio'::text, 'Stretching'::text]))) |
| training | exercises | exercises_difficulty_check | CHECK ((difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))) |
| training | exercises | exercises_discipline_known | CHECK (((discipline IS NULL) OR (discipline = ANY (ARRAY['Strength'::text, 'Cardio'::text, 'Stretching'::text, 'Yoga'::text, 'Body |
| training | exercises | exercises_exercise_type_check | CHECK ((exercise_type = ANY (ARRAY['strength'::text, 'cardio'::text, 'stretching'::text, 'yoga'::text, 'calisthenics'::text, 'plyo |
| training | exercises | exercises_sort_weight_check | CHECK (((sort_weight >= 0) AND (sort_weight <= 1000))) |
| training | exercises | exercises_tracking_type_check | CHECK ((tracking_type = ANY (ARRAY['weight_reps'::text, 'reps_only'::text, 'duration'::text, 'distance_duration'::text]))) |
| training | muscle_groups | muscle_groups_body_region_check | CHECK (((body_region IS NULL) OR (body_region = ANY (ARRAY['chest'::text, 'back'::text, 'shoulders'::text, 'arms'::text, 'core'::t |
| training | muscle_groups | muscle_groups_parent_not_self | CHECK (((parent_id IS NULL) OR (parent_id <> id))) |
| training | workout_exercises | workout_exercises_exercise_order_check | CHECK ((exercise_order > 0)) |
| training | workout_exercises | workout_exercises_planned_sets_check | CHECK (((planned_sets IS NULL) OR (planned_sets > 0))) |
| training | workout_exercises | workout_exercises_planned_weight_kg_check | CHECK (((planned_weight_kg IS NULL) OR (planned_weight_kg >= (0)::numeric))) |
| training | workout_sessions | workout_sessions_check | CHECK (((ended_time IS NULL) OR (ended_time >= started_time))) |
| training | workout_sessions | workout_sessions_duration_minutes_check | CHECK (((duration_minutes IS NULL) OR (duration_minutes >= 0))) |
| training | workout_sessions | workout_sessions_measurement_source_ck | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| training | workout_sessions | workout_sessions_status_check | CHECK ((status = ANY (ARRAY['planned'::text, 'active'::text, 'completed'::text, 'cancelled'::text]))) |
| training | workout_sets | workout_sets_check | CHECK (((reps IS NOT NULL) OR (duration_seconds IS NOT NULL) OR (distance_meters IS NOT NULL))) |
| training | workout_sets | workout_sets_distance_meters_check | CHECK (((distance_meters IS NULL) OR (distance_meters >= (0)::numeric))) |
| training | workout_sets | workout_sets_duration_seconds_check | CHECK (((duration_seconds IS NULL) OR (duration_seconds > 0))) |
| training | workout_sets | workout_sets_logged_via_check | CHECK ((logged_via = ANY (ARRAY['manual'::text, 'voice'::text, 'auto'::text]))) |
| training | workout_sets | workout_sets_measurement_source_ck | CHECK ((measurement_source = ANY (ARRAY['manual'::text, 'device'::text, 'import'::text, 'admin'::text, 'seed'::text]))) |
| training | workout_sets | workout_sets_reps_check | CHECK (((reps IS NULL) OR (reps > 0))) |
| training | workout_sets | workout_sets_rest_seconds_check | CHECK (((rest_seconds IS NULL) OR (rest_seconds >= 0))) |
| training | workout_sets | workout_sets_rir_check | CHECK (((rir IS NULL) OR ((rir >= 0) AND (rir <= 10)))) |
| training | workout_sets | workout_sets_rpe_check | CHECK (((rpe IS NULL) OR ((rpe >= (1)::numeric) AND (rpe <= (10)::numeric)))) |
| training | workout_sets | workout_sets_set_number_check | CHECK ((set_number > 0)) |
| training | workout_sets | workout_sets_set_type_check | CHECK ((set_type = ANY (ARRAY['working'::text, 'warmup'::text, 'dropset'::text, 'failure'::text]))) |
| training | workout_sets | workout_sets_weight_kg_check | CHECK (((weight_kg IS NULL) OR (weight_kg >= (0)::numeric))) |

## Policies

`[read]` **Wer darf was.** `[cmd]` **Bedingung auf 90 Zeichen
gekuerzt** ? **wer mehr braucht, fragt `pg_policy`.**

| Modul | Tabelle | Policy | Recht | Bedingung |
|---|---|---|---|---|
| coach | action_log | action_log_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | alerts | alerts_insert | INSERT | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | alerts | alerts_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | alerts | alerts_update | UPDATE | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | autonomy_change_log | autonomy_change_log_insert | INSERT | ((( SELECT auth.uid() AS uid) = changed_by) AND ((( SELECT auth.uid() AS uid) = coach_id)  |
| coach | autonomy_change_log | autonomy_change_log_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | checkin_templates | checkin_templates_delete | DELETE | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | checkin_templates | checkin_templates_insert | INSERT | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | checkin_templates | checkin_templates_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | checkin_templates | checkin_templates_update | UPDATE | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | checkins | checkins_insert | INSERT | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | checkins | checkins_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | checkins | checkins_update | UPDATE | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | client_autonomy | client_autonomy_delete | DELETE | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | client_autonomy | client_autonomy_insert | INSERT | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | client_autonomy | client_autonomy_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | client_autonomy | client_autonomy_update | UPDATE | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | client_consent_log | client_consent_log_client_select | SELECT | (( SELECT auth.uid() AS uid) = client_id) |
| coach | client_consent_log | client_consent_log_coach_select | SELECT | ((recipient_type = 'coach'::text) AND (( SELECT auth.uid() AS uid) = recipient_id)) |
| coach | client_permissions | client_permissions_delete | DELETE | (( SELECT auth.uid() AS uid) = client_id) |
| coach | client_permissions | client_permissions_insert | INSERT | (( SELECT auth.uid() AS uid) = client_id) |
| coach | client_permissions | client_permissions_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | client_permissions | client_permissions_update | UPDATE | (( SELECT auth.uid() AS uid) = client_id) |
| coach | coach_profiles | coach_profiles_insert_own | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| coach | coach_profiles | coach_profiles_select_own | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| coach | coach_profiles | coach_profiles_update_own | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| coach | messages | messages_insert | INSERT | ((( SELECT auth.uid() AS uid) = sender_id) AND ((( SELECT auth.uid() AS uid) = coach_id) O |
| coach | messages | messages_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | messages | messages_update | UPDATE | (((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) A |
| coach | pending_actions | pending_actions_delete | DELETE | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | pending_actions | pending_actions_insert | INSERT | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | pending_actions | pending_actions_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | pending_invites | pending_invites_select_own | SELECT | (( SELECT auth.uid() AS uid) = coach_id) |
| coach | permission_change_log | permission_change_log_insert | INSERT | ((( SELECT auth.uid() AS uid) = changed_by) AND ((( SELECT auth.uid() AS uid) = coach_id)  |
| coach | permission_change_log | permission_change_log_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | relationship_change_log | relationship_change_log_insert | INSERT | ((( SELECT auth.uid() AS uid) = changed_by) AND ((( SELECT auth.uid() AS uid) = coach_id)  |
| coach | relationship_change_log | relationship_change_log_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | relationships | relationships_insert | INSERT | (((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) A |
| coach | relationships | relationships_select | SELECT | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| coach | relationships | relationships_update | UPDATE | ((( SELECT auth.uid() AS uid) = coach_id) OR (( SELECT auth.uid() AS uid) = client_id)) |
| goals | body_circumferences | body_circumferences_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| goals | body_circumferences | body_circumferences_delete_own | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | body_circumferences | body_circumferences_insert_own | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | body_circumferences | body_circumferences_select_own | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | body_circumferences | body_circumferences_update_own | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | body_measurements | body_measurements_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| goals | body_measurements | body_measurements_delete_own | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | body_measurements | body_measurements_insert_own | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | body_measurements | body_measurements_select_own | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | body_measurements | body_measurements_update_own | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | goal_milestones | goal_milestones_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| goals | goal_milestones | goal_milestones_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | goal_milestones | goal_milestones_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | goal_milestones | goal_milestones_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | goal_milestones | goal_milestones_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | goal_phases | goal_phases_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| goals | goal_phases | goal_phases_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | goal_phases | goal_phases_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | goal_phases | goal_phases_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | goal_phases | goal_phases_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | nutrition_targets | nutrition_targets_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| goals | nutrition_targets | nutrition_targets_delete | DELETE | (auth.uid() = user_id) |
| goals | nutrition_targets | nutrition_targets_insert | INSERT | (auth.uid() = user_id) |
| goals | nutrition_targets | nutrition_targets_select | SELECT | (auth.uid() = user_id) |
| goals | nutrition_targets | nutrition_targets_update | UPDATE | (auth.uid() = user_id) |
| goals | phase_transition_responses | phase_transition_responses_delete_own | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | phase_transition_responses | phase_transition_responses_insert_own | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | phase_transition_responses | phase_transition_responses_select_own | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | phase_transition_responses | phase_transition_responses_update_own | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | user_goals | user_goals_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| goals | user_goals | user_goals_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| goals | user_goals | user_goals_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | user_goals | user_goals_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| goals | user_goals | user_goals_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | appointments | appointments_coach_read | SELECT | coach.hat_sicht(user_id, 'medical'::text, 'full'::text) |
| medical | appointments | appointments_delete_own | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | appointments | appointments_insert_own | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | appointments | appointments_select_own | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | appointments | appointments_update_own | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | biomarker_aliases | biomarker_aliases_select | SELECT | true |
| medical | biomarker_catalog | biomarker_catalog_select | SELECT | true |
| medical | biomarker_explanations | biomarker_explanations_read | SELECT | true |
| medical | biomarker_reference_ranges | biomarker_reference_ranges_select | SELECT | true |
| medical | biomarker_spec_enrichment | biomarker_spec_enrichment_select | SELECT | true |
| medical | health_events | health_events_coach_read | SELECT | coach.hat_sicht(user_id, 'medical'::text, 'full'::text) |
| medical | health_events | health_events_delete_own | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | health_events | health_events_insert_own | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | health_events | health_events_select_own | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | health_events | health_events_update_own | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_logs | injection_logs_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_logs | injection_logs_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_logs | injection_logs_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_logs | injection_logs_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_needle_recommendations | injection_needle_recommendations_select | SELECT | true |
| medical | injection_site_conditions | injection_site_conditions_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_site_conditions | injection_site_conditions_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_site_conditions | injection_site_conditions_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_site_conditions | injection_site_conditions_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | injection_sites | injection_sites_select | SELECT | true |
| medical | injection_tissue_condition_guidance | injection_tissue_condition_guidance_select | SELECT | true |
| medical | lab_marker_catalog | lab_marker_catalog_select | SELECT | true |
| medical | lab_reports | lab_reports_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| medical | lab_reports | lab_reports_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | lab_reports | lab_reports_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | lab_reports | lab_reports_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | lab_reports | lab_reports_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | lab_result_values | lab_result_values_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| medical | lab_result_values | lab_result_values_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | lab_result_values | lab_result_values_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | lab_result_values | lab_result_values_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | lab_result_values | lab_result_values_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | medication_active_substances | medication_active_substances_select | SELECT | true |
| medical | medication_clinical_context_evidence | medication_clinical_context_evidence_select | SELECT | true |
| medical | medication_faq | medication_faq_select | SELECT | true |
| medical | medication_formulations | medication_formulations_select | SELECT | true |
| medical | medication_pk_evidence | medication_pk_evidence_select | SELECT | true |
| medical | medication_products | medication_products_select | SELECT | true |
| medical | medication_renal_hepatic_evidence | medication_renal_hepatic_evidence_select | SELECT | true |
| medical | medication_reproductive_evidence | medication_reproductive_evidence_select | SELECT | true |
| medical | medication_thailand_regulatory_evidence | medication_thailand_regulatory_evidence_select | SELECT | true |
| medical | medication_user_texts | medication_user_texts_select | SELECT | true |
| medical | symptom_biomarker_map | symptom_biomarker_map_read | SELECT | true |
| medical | symptoms | symptoms_read | SELECT | true |
| medical | user_conditions | user_conditions_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| medical | user_conditions | user_conditions_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | user_conditions | user_conditions_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | user_conditions | user_conditions_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | user_conditions | user_conditions_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | user_medications | user_medications_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| medical | user_medications | user_medications_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| medical | user_medications | user_medications_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | user_medications | user_medications_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| medical | user_medications | user_medications_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| nutrition | exclusion_preset_rules | exclusion_preset_rules_select | SELECT | true |
| nutrition | exclusion_presets | exclusion_presets_select | SELECT | is_active |
| nutrition | food_aliases | food_aliases_select | SELECT | true |
| nutrition | food_categories | food_categories_select | SELECT | true |
| nutrition | food_curation_candidates | food_curation_candidates_select_admin | SELECT | is_admin() |
| nutrition | food_curation_decisions | food_curation_decisions_select_admin | SELECT | is_admin() |
| nutrition | food_groups | food_groups_select | SELECT | true |
| nutrition | food_nutrients | food_nutrients_select | SELECT | true |
| nutrition | food_preference_items | food_preference_items_delete | DELETE | (auth.uid() = user_id) |
| nutrition | food_preference_items | food_preference_items_insert | INSERT | (auth.uid() = user_id) |
| nutrition | food_preference_items | food_preference_items_select | SELECT | (auth.uid() = user_id) |
| nutrition | food_preference_items | food_preference_items_update | UPDATE | (auth.uid() = user_id) |
| nutrition | food_preference_search_targets | food_preference_search_targets_delete | DELETE | (auth.uid() = user_id) |
| nutrition | food_preference_search_targets | food_preference_search_targets_insert | INSERT | (auth.uid() = user_id) |
| nutrition | food_preference_search_targets | food_preference_search_targets_select | SELECT | (auth.uid() = user_id) |
| nutrition | food_preference_search_targets | food_preference_search_targets_update | UPDATE | (auth.uid() = user_id) |
| nutrition | food_preferences | food_preferences_delete | DELETE | (auth.uid() = user_id) |
| nutrition | food_preferences | food_preferences_insert | INSERT | (auth.uid() = user_id) |
| nutrition | food_preferences | food_preferences_select | SELECT | (auth.uid() = user_id) |
| nutrition | food_preferences | food_preferences_update | UPDATE | (auth.uid() = user_id) |
| nutrition | food_tags | food_tags_select | SELECT | true |
| nutrition | food_tags_kuriert | food_tags_kuriert_select | SELECT | true |
| nutrition | foods | foods_select | SELECT | true |
| nutrition | foods_custom | foods_custom_delete | DELETE | (auth.uid() = user_id) |
| nutrition | foods_custom | foods_custom_insert | INSERT | (auth.uid() = user_id) |
| nutrition | foods_custom | foods_custom_select | SELECT | (auth.uid() = user_id) |
| nutrition | foods_custom | foods_custom_update | UPDATE | (auth.uid() = user_id) |
| nutrition | foods_portions | foods_portions_select | SELECT | true |
| nutrition | meal_items | meal_items_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| nutrition | meal_items | meal_items_delete | DELETE | (auth.uid() = user_id) |
| nutrition | meal_items | meal_items_insert | INSERT | (auth.uid() = user_id) |
| nutrition | meal_items | meal_items_select | SELECT | (auth.uid() = user_id) |
| nutrition | meal_items | meal_items_update | UPDATE | (auth.uid() = user_id) |
| nutrition | meal_plan_days | meal_plan_days_delete | DELETE | (auth.uid() = user_id) |
| nutrition | meal_plan_days | meal_plan_days_insert | INSERT | (auth.uid() = user_id) |
| nutrition | meal_plan_days | meal_plan_days_select | SELECT | (auth.uid() = user_id) |
| nutrition | meal_plan_days | meal_plan_days_update | UPDATE | (auth.uid() = user_id) |
| nutrition | meal_plan_entries | meal_plan_entries_delete | DELETE | (auth.uid() = user_id) |
| nutrition | meal_plan_entries | meal_plan_entries_insert | INSERT | (auth.uid() = user_id) |
| nutrition | meal_plan_entries | meal_plan_entries_select | SELECT | (auth.uid() = user_id) |
| nutrition | meal_plan_entries | meal_plan_entries_update | UPDATE | (auth.uid() = user_id) |
| nutrition | meal_plan_logs | meal_plan_logs_delete | DELETE | (auth.uid() = user_id) |
| nutrition | meal_plan_logs | meal_plan_logs_insert | INSERT | (auth.uid() = user_id) |
| nutrition | meal_plan_logs | meal_plan_logs_select | SELECT | (auth.uid() = user_id) |
| nutrition | meal_plan_logs | meal_plan_logs_update | UPDATE | (auth.uid() = user_id) |
| nutrition | meal_plan_slots | meal_plan_slots_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| nutrition | meal_plan_slots | meal_plan_slots_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| nutrition | meal_plan_slots | meal_plan_slots_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| nutrition | meal_plan_slots | meal_plan_slots_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| nutrition | meal_plan_weeks | meal_plan_weeks_delete | DELETE | (auth.uid() = user_id) |
| nutrition | meal_plan_weeks | meal_plan_weeks_insert | INSERT | (auth.uid() = user_id) |
| nutrition | meal_plan_weeks | meal_plan_weeks_select | SELECT | (auth.uid() = user_id) |
| nutrition | meal_plan_weeks | meal_plan_weeks_update | UPDATE | (auth.uid() = user_id) |
| nutrition | meal_plans | meal_plans_delete | DELETE | (auth.uid() = user_id) |
| nutrition | meal_plans | meal_plans_insert | INSERT | (auth.uid() = user_id) |
| nutrition | meal_plans | meal_plans_select | SELECT | (auth.uid() = user_id) |
| nutrition | meal_plans | meal_plans_update | UPDATE | (auth.uid() = user_id) |
| nutrition | meal_slots | meal_slots_delete | DELETE | (auth.uid() = user_id) |
| nutrition | meal_slots | meal_slots_insert | INSERT | (auth.uid() = user_id) |
| nutrition | meal_slots | meal_slots_select | SELECT | (auth.uid() = user_id) |
| nutrition | meal_slots | meal_slots_update | UPDATE | (auth.uid() = user_id) |
| nutrition | meals | meals_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| nutrition | meals | meals_delete | DELETE | (auth.uid() = user_id) |
| nutrition | meals | meals_insert | INSERT | (auth.uid() = user_id) |
| nutrition | meals | meals_select | SELECT | (auth.uid() = user_id) |
| nutrition | meals | meals_update | UPDATE | (auth.uid() = user_id) |
| nutrition | micronutrient_overview_items | micronutrient_overview_items_select | SELECT | true |
| nutrition | nutrient_aliases | nutrient_aliases_select | SELECT | true |
| nutrition | nutrient_defs | nutrient_defs_select | SELECT | true |
| nutrition | nutrient_details | nutrient_details_select | SELECT | true |
| nutrition | nutrient_reference_values | nutrient_reference_values_select | SELECT | true |
| nutrition | nutrient_unit_conversion_factors | nutrient_unit_conversion_factors_select | SELECT | true |
| nutrition | preparation_kinds | preparation_kinds_select | SELECT | true |
| nutrition | recipe_curation_candidate_ingredients | recipe_curation_candidate_ingredients_select_admin | SELECT | is_admin() |
| nutrition | recipe_curation_candidates | recipe_curation_candidates_select_admin | SELECT | is_admin() |
| nutrition | recipe_curation_decisions | recipe_curation_decisions_select_admin | SELECT | is_admin() |
| nutrition | recipe_ingredients | recipe_ingredients_delete | DELETE | (auth.uid() = user_id) |
| nutrition | recipe_ingredients | recipe_ingredients_insert | INSERT | (auth.uid() = user_id) |
| nutrition | recipe_ingredients | recipe_ingredients_select | SELECT | (auth.uid() = user_id) |
| nutrition | recipe_ingredients | recipe_ingredients_update | UPDATE | (auth.uid() = user_id) |
| nutrition | recipes | recipes_delete | DELETE | (auth.uid() = user_id) |
| nutrition | recipes | recipes_insert | INSERT | (auth.uid() = user_id) |
| nutrition | recipes | recipes_select | SELECT | (auth.uid() = user_id) |
| nutrition | recipes | recipes_update | UPDATE | (auth.uid() = user_id) |
| nutrition | search_events | search_events_insert | INSERT | (auth.uid() IS NOT NULL) |
| nutrition | search_synonyms | search_synonyms_select | SELECT | true |
| nutrition | shopping_list_items | shopping_list_items_delete | DELETE | (auth.uid() = user_id) |
| nutrition | shopping_list_items | shopping_list_items_insert | INSERT | (auth.uid() = user_id) |
| nutrition | shopping_list_items | shopping_list_items_select | SELECT | (auth.uid() = user_id) |
| nutrition | shopping_list_items | shopping_list_items_update | UPDATE | (auth.uid() = user_id) |
| nutrition | shopping_lists | shopping_lists_delete | DELETE | (auth.uid() = user_id) |
| nutrition | shopping_lists | shopping_lists_insert | INSERT | (auth.uid() = user_id) |
| nutrition | shopping_lists | shopping_lists_select | SELECT | (auth.uid() = user_id) |
| nutrition | shopping_lists | shopping_lists_update | UPDATE | (auth.uid() = user_id) |
| nutrition | tag_definitions | tag_definitions_select | SELECT | true |
| nutrition | user_inventory | user_inventory_delete | DELETE | (auth.uid() = user_id) |
| nutrition | user_inventory | user_inventory_insert | INSERT | (auth.uid() = user_id) |
| nutrition | user_inventory | user_inventory_select | SELECT | (auth.uid() = user_id) |
| nutrition | user_inventory | user_inventory_update | UPDATE | (auth.uid() = user_id) |
| nutrition | water_logs | water_logs_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| nutrition | water_logs | water_logs_delete | DELETE | (auth.uid() = user_id) |
| nutrition | water_logs | water_logs_insert | INSERT | (auth.uid() = user_id) |
| nutrition | water_logs | water_logs_select | SELECT | (auth.uid() = user_id) |
| nutrition | water_logs | water_logs_update | UPDATE | (auth.uid() = user_id) |
| public | profiles | profiles_delete | DELETE | (auth.uid() = id) |
| public | profiles | profiles_insert | INSERT | (auth.uid() = id) |
| public | profiles | profiles_select | SELECT | (auth.uid() = id) |
| public | profiles | profiles_update | UPDATE | (auth.uid() = id) |
| public | user_display_preferences | user_display_preferences_delete | DELETE | (auth.uid() = user_id) |
| public | user_display_preferences | user_display_preferences_insert | INSERT | (auth.uid() = user_id) |
| public | user_display_preferences | user_display_preferences_select | SELECT | (auth.uid() = user_id) |
| public | user_display_preferences | user_display_preferences_update | UPDATE | (auth.uid() = user_id) |
| recovery | checkins | recovery_checkins_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| recovery | checkins | recovery_checkins_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | checkins | recovery_checkins_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | checkins | recovery_checkins_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | checkins | recovery_checkins_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | modality_log | recovery_modality_log_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| recovery | modality_log | recovery_modality_log_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | modality_log | recovery_modality_log_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | modality_log | recovery_modality_log_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | modality_log | recovery_modality_log_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | overtraining_alerts | recovery_overtraining_alerts_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | overtraining_alerts | recovery_overtraining_alerts_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | overtraining_alerts | recovery_overtraining_alerts_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | overtraining_alerts | recovery_overtraining_alerts_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | recovery_protocols | recovery_protocols_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | recovery_protocols | recovery_protocols_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | recovery_protocols | recovery_protocols_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | recovery_protocols | recovery_protocols_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | score_contributions | recovery_score_contributions_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | score_contributions | recovery_score_contributions_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | score_contributions | recovery_score_contributions_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | score_contributions | recovery_score_contributions_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | scores | recovery_scores_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| recovery | scores | recovery_scores_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | scores | recovery_scores_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | scores | recovery_scores_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | scores | recovery_scores_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | stress_logs | recovery_stress_logs_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | stress_logs | recovery_stress_logs_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | stress_logs | recovery_stress_logs_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| recovery | stress_logs | recovery_stress_logs_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | alias_resolution_candidates | alias_resolution_candidates_read | SELECT | true |
| supplements | entity_cyp | entity_cyp_read | SELECT | true |
| supplements | entity_pk | entity_pk_read | SELECT | true |
| supplements | entity_renal_hepatic | entity_renal_hepatic_read | SELECT | true |
| supplements | entity_transporters | entity_transporters_read | SELECT | true |
| supplements | intake_logs | intake_logs_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| supplements | intake_logs | intake_logs_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | intake_logs | intake_logs_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | intake_logs | intake_logs_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | intake_logs | intake_logs_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | intake_schedule | intake_schedule_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | intake_schedule | intake_schedule_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | intake_schedule | intake_schedule_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | intake_schedule | intake_schedule_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | lab_effect_enrichment_records | lab_effect_enrichment_records_read | SELECT | true |
| supplements | pubchem_conflict_records | pubchem_conflict_records_read | SELECT | true |
| supplements | rule_catalog | rule_catalog_select | SELECT | true |
| supplements | stack_curation_candidate_items | stack_curation_candidate_items_select | SELECT | (EXISTS ( SELECT 1    FROM supplements.stack_curation_candidates c   WHERE ((c.id = stack_ |
| supplements | stack_curation_candidates | stack_curation_candidates_select | SELECT | ((owner_id = ( SELECT auth.uid() AS uid)) OR is_admin()) |
| supplements | stack_curation_decisions | stack_curation_decisions_select | SELECT | (EXISTS ( SELECT 1    FROM supplements.stack_curation_candidates c   WHERE ((c.id = stack_ |
| supplements | stack_items | stack_items_coach_read | SELECT | (EXISTS ( SELECT 1    FROM supplements.user_stacks us   WHERE ((us.id = stack_items.stack_ |
| supplements | stack_items | stack_items_delete | DELETE | (EXISTS ( SELECT 1    FROM supplements.user_stacks us   WHERE ((us.id = stack_items.stack_ |
| supplements | stack_items | stack_items_insert | INSERT | (EXISTS ( SELECT 1    FROM supplements.user_stacks us   WHERE ((us.id = stack_items.stack_ |
| supplements | stack_items | stack_items_select | SELECT | (EXISTS ( SELECT 1    FROM supplements.user_stacks us   WHERE ((us.id = stack_items.stack_ |
| supplements | stack_items | stack_items_update | UPDATE | (EXISTS ( SELECT 1    FROM supplements.user_stacks us   WHERE ((us.id = stack_items.stack_ |
| supplements | stack_template_items | stack_template_items_select | SELECT | (EXISTS ( SELECT 1    FROM supplements.stack_templates t   WHERE ((t.id = stack_template_i |
| supplements | stack_templates | stack_templates_select | SELECT | ((source <> 'user'::text) OR is_public OR (owner_id = ( SELECT auth.uid() AS uid))) |
| supplements | substance_aliases | substance_aliases_select | SELECT | true |
| supplements | substance_group_memberships | substance_group_memberships_select | SELECT | true |
| supplements | supplement_aas_ratings | supplement_aas_ratings_select | SELECT | true |
| supplements | supplement_aliases | supplement_aliases_select | SELECT | true |
| supplements | supplement_categories | supplement_categories_select | SELECT | true |
| supplements | supplement_cycle_events | supplement_cycle_events_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_cycle_events | supplement_cycle_events_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_cycle_events | supplement_cycle_events_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_cycle_events | supplement_cycle_events_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_dosing | supplement_dosing_select | SELECT | true |
| supplements | supplement_evidence | supplement_evidence_select | SELECT | true |
| supplements | supplement_faq | supplement_faq_select | SELECT | true |
| supplements | supplement_field_sources | supplement_field_sources_select | SELECT | true |
| supplements | supplement_groups | supplement_groups_select | SELECT | true |
| supplements | supplement_human_evidence_flags | supplement_human_evidence_flags_read | SELECT | true |
| supplements | supplement_identifiers | supplement_identifiers_select | SELECT | true |
| supplements | supplement_interactions | supplement_interactions_select | SELECT | is_active |
| supplements | supplement_lab_effects | supplement_lab_effects_select | SELECT | true |
| supplements | supplement_monitoring | supplement_monitoring_select | SELECT | true |
| supplements | supplement_nutrients | supplement_nutrients_select | SELECT | true |
| supplements | supplement_organ_risks | supplement_organ_risks_select | SELECT | true |
| supplements | supplement_pharmacology | supplement_pharmacology_select | SELECT | true |
| supplements | supplement_portions | supplement_portions_select | SELECT | true |
| supplements | supplement_protocol_items | supplement_protocol_items_delete | DELETE | (EXISTS ( SELECT 1    FROM supplements.supplement_protocols p   WHERE ((p.id = supplement_ |
| supplements | supplement_protocol_items | supplement_protocol_items_insert | INSERT | (EXISTS ( SELECT 1    FROM supplements.supplement_protocols p   WHERE ((p.id = supplement_ |
| supplements | supplement_protocol_items | supplement_protocol_items_select | SELECT | (EXISTS ( SELECT 1    FROM supplements.supplement_protocols p   WHERE ((p.id = supplement_ |
| supplements | supplement_protocol_items | supplement_protocol_items_update | UPDATE | (EXISTS ( SELECT 1    FROM supplements.supplement_protocols p   WHERE ((p.id = supplement_ |
| supplements | supplement_protocol_requirements | supplement_protocol_requirements_select | SELECT | true |
| supplements | supplement_protocols | supplement_protocols_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_protocols | supplement_protocols_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_protocols | supplement_protocols_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_protocols | supplement_protocols_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_quality | supplement_quality_select | SELECT | true |
| supplements | supplement_regulatory | supplement_regulatory_select | SELECT | true |
| supplements | supplement_reminders | supplement_reminders_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_reminders | supplement_reminders_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_reminders | supplement_reminders_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_reminders | supplement_reminders_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | supplement_safety | supplement_safety_select | SELECT | true |
| supplements | supplement_studies | supplement_studies_read | SELECT | true |
| supplements | supplement_study_subjects | supplement_study_subjects_read | SELECT | true |
| supplements | supplement_tag_definitions | supplement_tag_definitions_select | SELECT | true |
| supplements | supplement_tags | supplement_tags_select | SELECT | true |
| supplements | supplement_user_texts | supplement_user_texts_select | SELECT | true |
| supplements | supplement_wada | supplement_wada_select | SELECT | true |
| supplements | supplement_warnings | supplement_warnings_select | SELECT | true |
| supplements | supplements | supplements_select | SELECT | is_active |
| supplements | thailand_regulatory_records | thailand_regulatory_records_read | SELECT | true |
| supplements | user_inventory | user_inventory_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_inventory | user_inventory_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_inventory | user_inventory_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_inventory | user_inventory_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_stacks | user_stacks_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| supplements | user_stacks | user_stacks_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_stacks | user_stacks_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_stacks | user_stacks_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_stacks | user_stacks_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_supplement_cycles | user_supplement_cycles_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_supplement_cycles | user_supplement_cycles_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_supplement_cycles | user_supplement_cycles_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_supplement_cycles | user_supplement_cycles_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_supplement_settings | user_supplement_settings_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_supplement_settings | user_supplement_settings_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_supplement_settings | user_supplement_settings_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | user_supplement_settings | user_supplement_settings_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| supplements | wada_conflict_records | wada_conflict_records_read | SELECT | true |
| training | equipment | equipment_admin_delete | DELETE | is_admin() |
| training | equipment | equipment_admin_insert | INSERT | is_admin() |
| training | equipment | equipment_admin_update | UPDATE | is_admin() |
| training | equipment | equipment_select | SELECT | true |
| training | exercise_catalog_enrichment | exercise_catalog_enrichment_admin_delete | DELETE | is_admin() |
| training | exercise_catalog_enrichment | exercise_catalog_enrichment_admin_insert | INSERT | is_admin() |
| training | exercise_catalog_enrichment | exercise_catalog_enrichment_admin_update | UPDATE | is_admin() |
| training | exercise_catalog_enrichment | exercise_catalog_enrichment_select | SELECT | true |
| training | exercise_muscles | exercise_muscles_admin_delete | DELETE | is_admin() |
| training | exercise_muscles | exercise_muscles_admin_insert | INSERT | is_admin() |
| training | exercise_muscles | exercise_muscles_admin_update | UPDATE | is_admin() |
| training | exercise_muscles | exercise_muscles_select | SELECT | true |
| training | exercises | exercises_admin_delete | DELETE | is_admin() |
| training | exercises | exercises_admin_insert | INSERT | is_admin() |
| training | exercises | exercises_admin_update | UPDATE | is_admin() |
| training | exercises | exercises_select | SELECT | (is_active OR is_admin()) |
| training | muscle_groups | muscle_groups_admin_delete | DELETE | is_admin() |
| training | muscle_groups | muscle_groups_admin_insert | INSERT | is_admin() |
| training | muscle_groups | muscle_groups_admin_update | UPDATE | is_admin() |
| training | muscle_groups | muscle_groups_select | SELECT | true |
| training | workout_exercises | workout_exercises_coach_read | SELECT | (EXISTS ( SELECT 1    FROM training.workout_sessions s   WHERE ((s.id = workout_exercises. |
| training | workout_exercises | workout_exercises_delete | DELETE | (EXISTS ( SELECT 1    FROM training.workout_sessions s   WHERE ((s.id = workout_exercises. |
| training | workout_exercises | workout_exercises_insert | INSERT | (EXISTS ( SELECT 1    FROM training.workout_sessions s   WHERE ((s.id = workout_exercises. |
| training | workout_exercises | workout_exercises_select | SELECT | (EXISTS ( SELECT 1    FROM training.workout_sessions s   WHERE ((s.id = workout_exercises. |
| training | workout_exercises | workout_exercises_update | UPDATE | (EXISTS ( SELECT 1    FROM training.workout_sessions s   WHERE ((s.id = workout_exercises. |
| training | workout_sessions | workout_sessions_coach_read | SELECT | (user_id IN ( SELECT p.client_id    FROM coach.client_permissions p   WHERE ((p.coach_id = |
| training | workout_sessions | workout_sessions_delete | DELETE | (( SELECT auth.uid() AS uid) = user_id) |
| training | workout_sessions | workout_sessions_insert | INSERT | (( SELECT auth.uid() AS uid) = user_id) |
| training | workout_sessions | workout_sessions_select | SELECT | (( SELECT auth.uid() AS uid) = user_id) |
| training | workout_sessions | workout_sessions_update | UPDATE | (( SELECT auth.uid() AS uid) = user_id) |
| training | workout_sets | workout_sets_coach_read | SELECT | (EXISTS ( SELECT 1    FROM (training.workout_exercises we      JOIN training.workout_sessi |
| training | workout_sets | workout_sets_delete | DELETE | (EXISTS ( SELECT 1    FROM (training.workout_exercises we      JOIN training.workout_sessi |
| training | workout_sets | workout_sets_insert | INSERT | (EXISTS ( SELECT 1    FROM (training.workout_exercises we      JOIN training.workout_sessi |
| training | workout_sets | workout_sets_select | SELECT | (EXISTS ( SELECT 1    FROM (training.workout_exercises we      JOIN training.workout_sessi |
| training | workout_sets | workout_sets_update | UPDATE | (EXISTS ( SELECT 1    FROM (training.workout_exercises we      JOIN training.workout_sessi |
| wissen | buddy_knowledge_records | buddy_knowledge_records_service_role_all | ALL | true |
| wissen | community_records | community_records_service_role_all | ALL | true |
| wissen | evidence_register_entries | evidence_register_entries_service_role_all | ALL | true |
| wissen | knowledge_gap_records | knowledge_gap_records_service_role_all | ALL | true |
| wissen | product_entities | product_entities_service_role_all | ALL | true |
| wissen | rule_engine_field_specs | rule_engine_field_specs_service_role_all | ALL | true |
| wissen | rule_engine_rules | rule_engine_rules_service_role_all | ALL | true |
| wissen | rule_trait_mappings | rule_trait_mappings_service_role_all | ALL | true |
| wissen | travel_medication_records | travel_medication_records_service_role_all | ALL | true |
| wissen | vision_contract_records | vision_contract_records_service_role_all | ALL | true |
