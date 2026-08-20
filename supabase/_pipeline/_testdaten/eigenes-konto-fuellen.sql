-- Ein ECHTES Anmeldekonto bekommt die Tage und Modul-Seeds eines Seed-Nutzers.
--
-- Aufruf (Standard: dev@lumeos.app aus tom.seed@example.com):
--   docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres \
--     < supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql
--
-- Anderes Zielkonto: -v ziel_email="'jemand@example.com'" voranstellen.
--
-- WARUM KOPIEREN STATT DEN SEED UMBIEGEN:
-- testdaten-einspielen.ts macht DELETE FROM auth.users WHERE id IN (...).
-- Zeigte der Seed auf ein echtes Konto, loeschte er dessen Anmeldedaten
-- samt Passwort. Ausserdem pruefen testdaten-pruefen.ts und das
-- Szenarienregister die drei festen Seed-UUIDs -- andere IDs braechen
-- genau die Pruefung, die gruen sein soll.
--
-- Vorlage ist tom.seed@example.com: vollstaendiges Profil und die
-- Demo-Daten aus Nutrition, Goals, Recovery, Training, Supplements
-- und Medical. Wiederholbar: raeumt die Daten des Zielkontos und
-- kopiert neu. Das auth.users-Konto selbst wird NIE angefasst.
\set ON_ERROR_STOP on

\if :{?ziel_email}
\else
  \set ziel_email '''dev@lumeos.app'''
\endif
\set quelle_email '''tom.seed@example.com'''
\set pruefkonto_email '''test-user@lumeos.local'''

BEGIN;

SELECT id AS ziel_id FROM auth.users WHERE email = :ziel_email \gset
SELECT id AS quelle_id FROM auth.users WHERE email = :quelle_email \gset
SELECT id AS pruefkonto_id FROM auth.users WHERE email = :pruefkonto_email \gset

\set ziel :ziel_id
\set quelle :quelle_id
\set pruefkonto :pruefkonto_id

SELECT 1 / CASE WHEN :'ziel'::uuid = :'quelle'::uuid THEN 0 ELSE 1 END
  AS ziel_ist_nicht_quelle;

-- G-46-Nachweisreste: test-user ist Pruefkonto, kein Demokonto.
DELETE FROM medical.lab_reports WHERE user_id = :'pruefkonto'::uuid;

-- Wiederholbar: erst Demo-Daten des Zielkontos raeumen, dann neu kopieren.
DELETE FROM medical.lab_reports WHERE user_id = :'ziel'::uuid;

DELETE FROM supplements.intake_logs WHERE user_id = :'ziel'::uuid;
DELETE FROM supplements.stack_items si
USING supplements.user_stacks us
WHERE si.stack_id = us.id AND us.user_id = :'ziel'::uuid;
DELETE FROM supplements.user_stacks WHERE user_id = :'ziel'::uuid;

DELETE FROM training.workout_sets ws
USING training.workout_exercises we, training.workout_sessions s
WHERE ws.workout_exercise_id = we.id
  AND we.workout_session_id = s.id
  AND s.user_id = :'ziel'::uuid;
DELETE FROM training.workout_exercises we
USING training.workout_sessions s
WHERE we.workout_session_id = s.id
  AND s.user_id = :'ziel'::uuid;
DELETE FROM training.workout_sessions WHERE user_id = :'ziel'::uuid;

DELETE FROM recovery.modality_log WHERE user_id = :'ziel'::uuid;
DELETE FROM recovery.scores WHERE user_id = :'ziel'::uuid;
DELETE FROM recovery.checkins WHERE user_id = :'ziel'::uuid;

DELETE FROM goals.body_circumferences WHERE user_id = :'ziel'::uuid;
DELETE FROM goals.body_measurements WHERE user_id = :'ziel'::uuid;
DELETE FROM goals.goal_milestones WHERE user_id = :'ziel'::uuid;
DELETE FROM goals.goal_phases WHERE user_id = :'ziel'::uuid;
DELETE FROM goals.user_goals WHERE user_id = :'ziel'::uuid;
DELETE FROM goals.nutrition_targets WHERE user_id = :'ziel'::uuid;

DELETE FROM nutrition.food_preference_items WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.food_preferences WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.water_logs WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.meal_items WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.meals WHERE user_id = :'ziel'::uuid;

-- 1. Profil: die Felder, an denen Referenzwerte und Formeln haengen.
-- locale bleibt unberuehrt, weil es die echte Browser-/Nutzerwahl ist.
UPDATE public.profiles p
SET birth_date             = q.birth_date,
    biological_sex         = q.biological_sex,
    height_cm              = q.height_cm,
    body_weight_kg         = q.body_weight_kg,
    activity_level         = q.activity_level,
    nutrition_goal         = q.nutrition_goal,
    pregnancy_started_on   = q.pregnancy_started_on,
    pregnancy_ended_on     = q.pregnancy_ended_on,
    lactation_started_on   = q.lactation_started_on,
    lactation_ended_on     = q.lactation_ended_on,
    updated_at             = now()
FROM public.profiles q
WHERE p.id = :'ziel'::uuid AND q.id = :'quelle'::uuid;

-- 2. Zielwerte. gueltig_ab bleibt wie in der Vorlage -- ein Ziel wirkt
-- vorwaerts, ein frueheres Datum wuerde die aelteren Tage falsch bewerten.
INSERT INTO goals.nutrition_targets (
  user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee,
  nutrition_goal, notiz, linoleic_acid_g, alpha_linolenic_acid_g
)
SELECT
  :'ziel'::uuid, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee,
  nutrition_goal, 'Kopie aus Seed-Konto fuer dev@lumeos.app',
  linoleic_acid_g, alpha_linolenic_acid_g
FROM goals.nutrition_targets
WHERE user_id = :'quelle'::uuid;

-- 3. Mahlzeiten mit neuer id, aber gemerkter Herkunft fuer die Positionen.
-- Die Abbildung laeuft explizit ueber IDs, nicht ueber
-- (entry_date, meal_type): seit C-59 darf derselbe Typ mehrfach am Tag
-- vorkommen.
CREATE TEMP TABLE meal_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;

INSERT INTO meal_map (neu, alt)
SELECT gen_random_uuid(), id
FROM nutrition.meals
WHERE user_id = :'quelle'::uuid;

INSERT INTO nutrition.meals (
  id, user_id, entry_date, meal_type, notes, meal_time, entry_source, source_detail
)
SELECT
  mm.neu, :'ziel'::uuid, m.entry_date, m.meal_type, m.notes, m.meal_time,
  'seed', 'Kopie aus tom.seed@example.com'
FROM nutrition.meals m
JOIN meal_map mm ON mm.alt = m.id;

-- Die eingefrorenen Naehrwerte werden UNVERAENDERT uebernommen
-- (ADR-0003) -- nicht neu gegen food_nutrients gerechnet.
INSERT INTO nutrition.meal_items (
  id, meal_id, user_id, food_id, food_source, food_name, amount_g,
  enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g,
  nutrients, frozen_at, custom_food_id, portion_name, portion_quantity,
  portion_amount_g, measurement_source, source_detail
)
SELECT
  gen_random_uuid(), mm.neu, :'ziel'::uuid, i.food_id, i.food_source,
  i.food_name, i.amount_g, i.enercc, i.prot625, i.fat, i.cho, i.fibt,
  i.sugar, i.fasat, i.nacl, i.water_g, i.nutrients, i.frozen_at,
  i.custom_food_id, i.portion_name, i.portion_quantity, i.portion_amount_g,
  'seed', 'Kopie aus tom.seed@example.com'
FROM nutrition.meal_items i
JOIN meal_map mm ON mm.alt = i.meal_id
WHERE i.user_id = :'quelle'::uuid;

-- 4. Wasser.
INSERT INTO nutrition.water_logs (
  id, user_id, entry_date, amount_ml, source, logged_at,
  measurement_source, source_detail
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, entry_date, amount_ml, source, logged_at,
  'seed', 'Kopie aus tom.seed@example.com'
FROM nutrition.water_logs
WHERE user_id = :'quelle'::uuid;

-- 5. Praeferenzen.
INSERT INTO nutrition.food_preferences (
  user_id, diet_type, allergies, intolerances, general_exclusions,
  preferred_cuisines, meals_per_day, snacks_per_day, cooking_skill,
  prep_time_max_min, budget_level, meal_prep_ok, planner_notes
)
SELECT
  :'ziel'::uuid, diet_type, allergies, intolerances, general_exclusions,
  preferred_cuisines, meals_per_day, snacks_per_day, cooking_skill,
  prep_time_max_min, budget_level, meal_prep_ok, planner_notes
FROM nutrition.food_preferences
WHERE user_id = :'quelle'::uuid;

INSERT INTO nutrition.food_preference_items (
  id, user_id, preference, strength, target_type, food_id, category_id,
  tag_code, cuisine_code, exclusion_preset_code, catalog_item_code, source
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, preference, strength, target_type,
  food_id, category_id, tag_code, cuisine_code, exclusion_preset_code,
  catalog_item_code, source
FROM nutrition.food_preference_items
WHERE user_id = :'quelle'::uuid;

-- 6. Goals: Ziele, Phasen und Meilensteine.
CREATE TEMP TABLE goal_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;

INSERT INTO goal_map (neu, alt)
SELECT gen_random_uuid(), id
FROM goals.user_goals
WHERE user_id = :'quelle'::uuid;

INSERT INTO goals.user_goals (
  id, user_id, goal_type, subtype, title, description, target_value,
  target_unit, start_value, current_value, gueltig_ab, target_date,
  status, priority, is_primary, progress_pct, motivation_reason,
  difficulty_level, auto_update, celebration_enabled, achievement_date
)
SELECT
  gm.neu, :'ziel'::uuid, goal_type, subtype, title, description,
  target_value, target_unit, start_value, current_value, gueltig_ab,
  target_date, status, priority, is_primary, progress_pct, motivation_reason,
  difficulty_level, auto_update, celebration_enabled, achievement_date
FROM goals.user_goals g
JOIN goal_map gm ON gm.alt = g.id;

INSERT INTO goals.goal_phases (
  id, user_id, goal_id, phase_type, variant, parameters, gueltig_ab,
  projected_end_date, actual_end_date, transitioned_from, recommended_next,
  transition_reason
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, gm.neu, phase_type, variant, parameters,
  gueltig_ab, projected_end_date, actual_end_date, transitioned_from,
  recommended_next, transition_reason
FROM goals.goal_phases gp
LEFT JOIN goal_map gm ON gm.alt = gp.goal_id
WHERE gp.user_id = :'quelle'::uuid;

INSERT INTO goals.goal_milestones (
  id, goal_id, user_id, milestone_type, title, description, target_value,
  target_unit, threshold_pct, target_date, status, achieved_date,
  achieved_value, celebration_message, auto_generated, notification_sent,
  source, source_detail
)
SELECT
  gen_random_uuid(), gm.neu, :'ziel'::uuid, milestone_type, title,
  description, target_value, target_unit, threshold_pct, target_date, status,
  achieved_date, achieved_value, celebration_message, auto_generated,
  notification_sent, 'seed', 'Kopie aus tom.seed@example.com'
FROM goals.goal_milestones ms
JOIN goal_map gm ON gm.alt = ms.goal_id
WHERE ms.user_id = :'quelle'::uuid;

-- 7. Koerpermessungen. Die Tabellen erlauben aktuell kein source='seed';
-- deshalb bleibt measurement_source='manual' und die Kopie steht im Detail.
INSERT INTO goals.body_measurements (
  id, user_id, measurement_date, measurement_time, weight_kg, body_fat_pct,
  bf_method, height_cm_snapshot, notes, measurement_source, source_detail
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, measurement_date, measurement_time,
  weight_kg, body_fat_pct, bf_method, height_cm_snapshot, notes,
  measurement_source,
  'Kopie aus tom.seed@example.com'
FROM goals.body_measurements
WHERE user_id = :'quelle'::uuid;

INSERT INTO goals.body_circumferences (
  id, user_id, measurement_date, measurement_time, neck_cm, shoulders_cm,
  chest_cm, upper_arm_left_cm, upper_arm_right_cm, forearm_left_cm,
  forearm_right_cm, waist_cm, hip_cm, thigh_left_cm, thigh_right_cm,
  calf_left_cm, calf_right_cm, notes, measurement_source, source_detail
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, measurement_date, measurement_time,
  neck_cm, shoulders_cm, chest_cm, upper_arm_left_cm, upper_arm_right_cm,
  forearm_left_cm, forearm_right_cm, waist_cm, hip_cm, thigh_left_cm,
  thigh_right_cm, calf_left_cm, calf_right_cm, notes, measurement_source,
  'Kopie aus tom.seed@example.com'
FROM goals.body_circumferences
WHERE user_id = :'quelle'::uuid;

-- 8. Recovery.
INSERT INTO recovery.checkins (
  id, user_id, entry_date, checkin_time, sleep_hours, sleep_quality,
  sleep_start_time, sleep_end_time, subjective_feeling, mood, energy_level,
  motivation, soreness, pain_areas, stress_level, work_stress, life_stress,
  alcohol_units, caffeine_mg, screen_time_before_bed, resting_hr, hrv_rmssd,
  spo2_pct, respiratory_rate, notes, measurement_source, source_detail
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, entry_date, checkin_time, sleep_hours,
  sleep_quality, sleep_start_time, sleep_end_time, subjective_feeling, mood,
  energy_level, motivation, soreness, pain_areas, stress_level, work_stress,
  life_stress, alcohol_units, caffeine_mg, screen_time_before_bed, resting_hr,
  hrv_rmssd, spo2_pct, respiratory_rate, notes, 'seed',
  'Kopie aus tom.seed@example.com'
FROM recovery.checkins
WHERE user_id = :'quelle'::uuid;

INSERT INTO recovery.modality_log (
  id, user_id, entry_date, logged_time, modality_type, duration_min,
  detail, immediate_effect, next_day_effect, bonus_value, bonus_source,
  next_day_score_delta, notes, measurement_source, source_detail
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, entry_date, logged_time, modality_type,
  duration_min, detail, immediate_effect, next_day_effect, bonus_value,
  bonus_source, next_day_score_delta, notes, 'seed',
  'Kopie aus tom.seed@example.com'
FROM recovery.modality_log
WHERE user_id = :'quelle'::uuid;

-- 9. Training.
CREATE TEMP TABLE workout_session_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE workout_exercise_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;

INSERT INTO workout_session_map (neu, alt)
SELECT gen_random_uuid(), id
FROM training.workout_sessions
WHERE user_id = :'quelle'::uuid;

INSERT INTO training.workout_sessions (
  id, user_id, session_date, started_time, ended_time, name, status,
  location, notes, duration_minutes, total_volume_kg, total_sets,
  total_reps, measurement_source, source_detail
)
SELECT
  wsm.neu, :'ziel'::uuid, session_date, started_time, ended_time, name,
  status, location, notes, duration_minutes, total_volume_kg, total_sets,
  total_reps, 'seed', 'Kopie aus tom.seed@example.com'
FROM training.workout_sessions ws
JOIN workout_session_map wsm ON wsm.alt = ws.id;

INSERT INTO workout_exercise_map (neu, alt)
SELECT gen_random_uuid(), we.id
FROM training.workout_exercises we
JOIN workout_session_map wsm ON wsm.alt = we.workout_session_id;

INSERT INTO training.workout_exercises (
  id, workout_session_id, exercise_id, exercise_order, superset_group,
  exercise_name, planned_sets, planned_reps, planned_weight_kg, notes,
  actual_sets, actual_volume_kg, max_weight_kg, total_reps,
  best_estimated_1rm
)
SELECT
  wem.neu, wsm.neu, exercise_id, exercise_order, superset_group,
  exercise_name, planned_sets, planned_reps, planned_weight_kg, notes,
  actual_sets, actual_volume_kg, max_weight_kg, total_reps,
  best_estimated_1rm
FROM training.workout_exercises we
JOIN workout_exercise_map wem ON wem.alt = we.id
JOIN workout_session_map wsm ON wsm.alt = we.workout_session_id;

INSERT INTO training.workout_sets (
  id, workout_exercise_id, set_number, reps, weight_kg, duration_seconds,
  distance_meters, rpe, rir, set_type, rest_seconds, notes, logged_via,
  completed_at, volume_kg, estimated_1rm, is_pr, measurement_source,
  source_detail
)
SELECT
  gen_random_uuid(), wem.neu, set_number, reps, weight_kg,
  duration_seconds, distance_meters, rpe, rir, set_type, rest_seconds,
  notes, logged_via, completed_at, volume_kg, estimated_1rm, is_pr,
  'seed', 'Kopie aus tom.seed@example.com'
FROM training.workout_sets ws
JOIN workout_exercise_map wem ON wem.alt = ws.workout_exercise_id;

SELECT recovery.refresh_scores_for_user(:'ziel'::uuid);

-- 10. Supplements.
CREATE TEMP TABLE stack_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE stack_item_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;

INSERT INTO stack_map (neu, alt)
SELECT gen_random_uuid(), id
FROM supplements.user_stacks
WHERE user_id = :'quelle'::uuid;

INSERT INTO supplements.user_stacks (
  id, user_id, name, description, goal, source, source_ref_id, is_active,
  total_monthly_cost, item_count
)
SELECT
  sm.neu, :'ziel'::uuid, name, description, goal, source, source_ref_id,
  is_active, total_monthly_cost, item_count
FROM supplements.user_stacks us
JOIN stack_map sm ON sm.alt = us.id;

INSERT INTO stack_item_map (neu, alt)
SELECT gen_random_uuid(), si.id
FROM supplements.stack_items si
JOIN stack_map sm ON sm.alt = si.stack_id;

INSERT INTO supplements.stack_items (
  id, stack_id, supplement_id, custom_name, notes, dose, dose_unit,
  frequency, timing, cycling, stock_remaining, stock_unit,
  low_stock_threshold, sort_order, is_active
)
SELECT
  sim.neu, sm.neu, supplement_id, custom_name, notes, dose, dose_unit,
  frequency, timing, cycling, stock_remaining, stock_unit,
  low_stock_threshold, sort_order, is_active
FROM supplements.stack_items si
JOIN stack_item_map sim ON sim.alt = si.id
JOIN stack_map sm ON sm.alt = si.stack_id;

INSERT INTO supplements.intake_logs (
  id, user_id, stack_item_id, intake_date, intake_time, status,
  supplement_name_snapshot, dose_snapshot, dose_unit_snapshot, actual_dose,
  actual_dose_unit, notes, measurement_source, source_detail
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, sim.neu, intake_date, intake_time,
  status, supplement_name_snapshot, dose_snapshot, dose_unit_snapshot,
  actual_dose, actual_dose_unit, notes, 'seed',
  'Kopie aus tom.seed@example.com'
FROM supplements.intake_logs il
LEFT JOIN stack_item_map sim ON sim.alt = il.stack_item_id
WHERE il.user_id = :'quelle'::uuid;

-- 11. Medical.
CREATE TEMP TABLE lab_report_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;

INSERT INTO lab_report_map (neu, alt)
SELECT gen_random_uuid(), id
FROM medical.lab_reports
WHERE user_id = :'quelle'::uuid;

INSERT INTO medical.lab_reports (
  id, user_id, report_date, report_time, lab_name, title, source,
  source_detail, file_ref, notes
)
SELECT
  lrm.neu, :'ziel'::uuid, report_date, report_time, lab_name, title,
  'seed', 'Kopie aus tom.seed@example.com', file_ref, notes
FROM medical.lab_reports lr
JOIN lab_report_map lrm ON lrm.alt = lr.id;

INSERT INTO medical.lab_result_values (
  id, report_id, user_id, loinc_code, marker_name_snapshot, unit_snapshot,
  value_numeric, value_text, value_operator, lab_reference_low,
  lab_reference_high, lab_reference_text, lab_reference_unit,
  lab_reference_source, fasting_status, source, source_detail,
  entry_confidence, needs_verification, notes, frozen_at, raw_marker_name,
  match_status, match_candidates, match_source
)
SELECT
  gen_random_uuid(), lrm.neu, :'ziel'::uuid, loinc_code,
  marker_name_snapshot, unit_snapshot, value_numeric, value_text,
  value_operator, lab_reference_low, lab_reference_high, lab_reference_text,
  lab_reference_unit, lab_reference_source, fasting_status, 'seed',
  'Kopie aus tom.seed@example.com', entry_confidence, needs_verification,
  notes, frozen_at, raw_marker_name, match_status, match_candidates,
  match_source
FROM medical.lab_result_values lv
JOIN lab_report_map lrm ON lrm.alt = lv.report_id
WHERE lv.user_id = :'quelle'::uuid;

COMMIT;

WITH users AS (
  SELECT id, email
  FROM auth.users
  WHERE email IN (:ziel_email, :quelle_email, :pruefkonto_email)
),
counts AS (
  SELECT u.email, 'meals' AS table_name, count(m.*)::bigint AS rows
  FROM users u LEFT JOIN nutrition.meals m ON m.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'meal_items', count(i.*)
  FROM users u LEFT JOIN nutrition.meal_items i ON i.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'water_logs', count(w.*)
  FROM users u LEFT JOIN nutrition.water_logs w ON w.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'food_preferences', count(fp.*)
  FROM users u LEFT JOIN nutrition.food_preferences fp ON fp.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'food_preference_items', count(fpi.*)
  FROM users u LEFT JOIN nutrition.food_preference_items fpi ON fpi.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'nutrition_targets', count(nt.*)
  FROM users u LEFT JOIN goals.nutrition_targets nt ON nt.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'user_goals', count(ug.*)
  FROM users u LEFT JOIN goals.user_goals ug ON ug.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'goal_phases', count(gp.*)
  FROM users u LEFT JOIN goals.goal_phases gp ON gp.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'goal_milestones', count(gm.*)
  FROM users u LEFT JOIN goals.goal_milestones gm ON gm.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'body_measurements', count(bm.*)
  FROM users u LEFT JOIN goals.body_measurements bm ON bm.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'body_circumferences', count(bc.*)
  FROM users u LEFT JOIN goals.body_circumferences bc ON bc.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'recovery_checkins', count(rc.*)
  FROM users u LEFT JOIN recovery.checkins rc ON rc.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'recovery_scores', count(rs.*)
  FROM users u LEFT JOIN recovery.scores rs ON rs.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'recovery_modalities', count(rm.*)
  FROM users u LEFT JOIN recovery.modality_log rm ON rm.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'workout_sessions', count(ws.*)
  FROM users u LEFT JOIN training.workout_sessions ws ON ws.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'workout_exercises', count(we.*)
  FROM users u
  LEFT JOIN training.workout_sessions ws ON ws.user_id = u.id
  LEFT JOIN training.workout_exercises we ON we.workout_session_id = ws.id
  GROUP BY u.email
  UNION ALL SELECT u.email, 'workout_sets', count(wset.*)
  FROM users u
  LEFT JOIN training.workout_sessions ws ON ws.user_id = u.id
  LEFT JOIN training.workout_exercises we ON we.workout_session_id = ws.id
  LEFT JOIN training.workout_sets wset ON wset.workout_exercise_id = we.id
  GROUP BY u.email
  UNION ALL SELECT u.email, 'user_stacks', count(us.*)
  FROM users u LEFT JOIN supplements.user_stacks us ON us.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'stack_items', count(si.*)
  FROM users u
  LEFT JOIN supplements.user_stacks us ON us.user_id = u.id
  LEFT JOIN supplements.stack_items si ON si.stack_id = us.id
  GROUP BY u.email
  UNION ALL SELECT u.email, 'intake_logs', count(il.*)
  FROM users u LEFT JOIN supplements.intake_logs il ON il.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'lab_reports', count(lr.*)
  FROM users u LEFT JOIN medical.lab_reports lr ON lr.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'lab_result_values', count(lv.*)
  FROM users u LEFT JOIN medical.lab_result_values lv ON lv.user_id = u.id GROUP BY u.email
)
SELECT email, table_name, rows
FROM counts
ORDER BY email, table_name;
