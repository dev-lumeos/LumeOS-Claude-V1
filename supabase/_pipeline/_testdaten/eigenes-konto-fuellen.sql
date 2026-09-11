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
\set coach_email '''coach.seed@example.com'''

BEGIN;

SELECT id AS ziel_id FROM auth.users WHERE email = :ziel_email \gset
SELECT id AS quelle_id FROM auth.users WHERE email = :quelle_email \gset
SELECT id AS pruefkonto_id FROM auth.users WHERE email = :pruefkonto_email \gset
SELECT id AS coach_id FROM auth.users WHERE email = :coach_email \gset

\set ziel :ziel_id
\set quelle :quelle_id
\set pruefkonto :pruefkonto_id
\set coach :coach_id

SELECT 1 / CASE WHEN :'ziel'::uuid = :'quelle'::uuid THEN 0 ELSE 1 END
  AS ziel_ist_nicht_quelle;

-- G-46-Nachweisreste: test-user ist Pruefkonto, kein Demokonto.
DELETE FROM medical.user_conditions WHERE user_id = :'pruefkonto'::uuid;
DELETE FROM medical.user_medications WHERE user_id = :'pruefkonto'::uuid;
DELETE FROM medical.lab_reports WHERE user_id = :'pruefkonto'::uuid;

DELETE FROM coach.alerts WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
DELETE FROM coach.messages WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
DELETE FROM coach.checkins WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
DELETE FROM coach.checkin_templates WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
DELETE FROM coach.relationship_change_log WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
ALTER TABLE coach.relationships DISABLE TRIGGER relationships_change_log;
DELETE FROM coach.relationships WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
ALTER TABLE coach.relationships ENABLE TRIGGER relationships_change_log;
DELETE FROM coach.action_log WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
DELETE FROM coach.pending_actions WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
DELETE FROM coach.permission_change_log WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
DELETE FROM coach.autonomy_change_log WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
ALTER TABLE coach.client_permissions DISABLE TRIGGER client_permissions_change_log;
ALTER TABLE coach.client_autonomy DISABLE TRIGGER client_autonomy_change_log;
DELETE FROM coach.client_permissions WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
DELETE FROM coach.client_autonomy WHERE client_id = :'pruefkonto'::uuid OR coach_id = :'pruefkonto'::uuid;
ALTER TABLE coach.client_permissions ENABLE TRIGGER client_permissions_change_log;
ALTER TABLE coach.client_autonomy ENABLE TRIGGER client_autonomy_change_log;

-- Wiederholbar: erst Demo-Daten des Zielkontos raeumen, dann neu kopieren.
-- F-07, zweite Fassung: Die Coach-Raeumung ist auf DEN SEED-COACH
-- begrenzt. Die erste Fassung raeumte pauschal alles, woran das
-- Zielkonto haengt — und loeschte damit auch die Beziehung des echten
-- Portal-Coaches (coach@lumeos.app -> dev), sobald jemand die Seeds
-- auffrischte. [cmd] Genau so gemessen am 2026-08-20: Tom stand nach
-- der Auffrischung vor "Kein Coach-Zugang". Dieses Skript besitzt nur
-- die coach.seed-Beziehung; fremde Coaches bleiben unberuehrt.
DELETE FROM coach.alerts WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
DELETE FROM coach.messages WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
DELETE FROM coach.checkins WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
DELETE FROM coach.checkin_templates WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
DELETE FROM coach.relationship_change_log WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
ALTER TABLE coach.relationships DISABLE TRIGGER relationships_change_log;
DELETE FROM coach.relationships WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
ALTER TABLE coach.relationships ENABLE TRIGGER relationships_change_log;
DELETE FROM coach.action_log WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
DELETE FROM coach.pending_actions WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
DELETE FROM coach.permission_change_log WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
DELETE FROM coach.autonomy_change_log WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
ALTER TABLE coach.client_permissions DISABLE TRIGGER client_permissions_change_log;
ALTER TABLE coach.client_autonomy DISABLE TRIGGER client_autonomy_change_log;
DELETE FROM coach.client_permissions WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
DELETE FROM coach.client_autonomy WHERE client_id = :'ziel'::uuid AND coach_id = :'coach'::uuid;
ALTER TABLE coach.client_permissions ENABLE TRIGGER client_permissions_change_log;
ALTER TABLE coach.client_autonomy ENABLE TRIGGER client_autonomy_change_log;

DELETE FROM medical.user_conditions WHERE user_id = :'ziel'::uuid;
DELETE FROM medical.user_medications WHERE user_id = :'ziel'::uuid;
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
DELETE FROM nutrition.meal_plan_entries WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.meal_plan_days WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.meal_plan_weeks WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.meal_plans WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.recipe_ingredients WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.recipes WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.water_logs WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.meal_items WHERE user_id = :'ziel'::uuid;
DELETE FROM nutrition.meals WHERE user_id = :'ziel'::uuid;

-- Coach-Demo: explizit neu aufbauen, damit die Trigger die Historie
-- fuer das echte Dev-Konto erzeugen. test-user bleibt ohne Coach.
INSERT INTO coach.client_permissions (
  coach_id, client_id,
  nutrition_visibility, training_visibility, recovery_visibility, goals_visibility,
  supplements_visibility, medical_visibility, buddy_visibility,
  nutrition_auto_apply, training_auto_apply, recovery_auto_apply, goals_auto_apply,
  supplements_auto_apply, medical_auto_apply, buddy_auto_apply,
  client_note, changed_by
)
VALUES (
  :'coach'::uuid, :'ziel'::uuid,
  'summary', 'summary', 'none', 'summary',
  'none', 'none', 'none',
  false, false, false, false,
  false, false, false,
  'C-147 Dev-Kopie: Ausgangszustand vor differenzierten Coach-Rechten',
  :'ziel'::uuid
);

UPDATE coach.client_permissions
SET nutrition_visibility = 'full',
    training_visibility = 'full',
    recovery_visibility = 'summary',
    goals_visibility = 'full',
    supplements_visibility = 'summary',
    medical_visibility = 'none',
    buddy_visibility = 'summary',
    training_auto_apply = true,
    client_note = 'C-147 Dev-Kopie: Training offen, Medical gesperrt, Nutrition mit Bestaetigung',
    changed_by = :'ziel'::uuid
WHERE coach_id = :'coach'::uuid
  AND client_id = :'ziel'::uuid;

INSERT INTO coach.client_autonomy (
  coach_id, client_id,
  nutrition_level, training_level, recovery_level, goals_level,
  supplements_level, medical_level, buddy_level, safety_level,
  coach_note, changed_by
)
VALUES (
  :'coach'::uuid, :'ziel'::uuid,
  2, 2, 2, 2, 2, 2, 2, 1,
  'C-147 Dev-Kopie: Ausgangszustand fuer Autonomy-Historie',
  :'coach'::uuid
);

UPDATE coach.client_autonomy
SET nutrition_level = 3,
    training_level = 4,
    recovery_level = 2,
    goals_level = 3,
    supplements_level = 2,
    medical_level = 1,
    buddy_level = 3,
    safety_level = 2,
    coach_note = 'C-147 Dev-Kopie: Coach setzt differenzierte Reifegrade je Modul',
    changed_by = :'coach'::uuid
WHERE coach_id = :'coach'::uuid
  AND client_id = :'ziel'::uuid;

INSERT INTO coach.pending_actions (
  coach_id, client_id, module, action_type, preview, payload,
  status, expires_at, created_by
)
VALUES (
  :'coach'::uuid,
  :'ziel'::uuid,
  'nutrition',
  'adjust_macro_targets',
  '{"title":"Protein leicht anheben","summary":"Coach schlaegt +10 g Protein am Trainingstag vor"}'::jsonb,
  '{"protein_g_delta":10,"reason":"C-147 Pending Action mit Nutzerbestaetigung"}'::jsonb,
  'pending',
  now() + interval '10 minutes',
  :'coach'::uuid
);

INSERT INTO coach.action_log (
  coach_id, client_id, module, action_type,
  payload_snapshot, undo_data, executed_by
)
VALUES (
  :'coach'::uuid,
  :'ziel'::uuid,
  'training',
  'adjust_training_day',
  '{"day":"upper","change":"Bench-Topset priorisiert"}'::jsonb,
  '{"restore":{"day":"upper","change":"vorherige Uebungsreihenfolge"}}'::jsonb,
  :'coach'::uuid
);

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
  nutrition_goal, notiz, fiber_g, linoleic_acid_g, alpha_linolenic_acid_g
)
SELECT
  :'ziel'::uuid, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee,
  nutrition_goal, 'Kopie aus Seed-Konto fuer dev@lumeos.app',
  fiber_g, linoleic_acid_g, alpha_linolenic_acid_g
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

-- 5b. Rezepte und Wochenplaene. Auch hier wird kopiert, nicht neu
-- gerechnet; die Nahrwerte bleiben in Rezepten/Plan aus Zutaten
-- ableitbar und werden erst bei meal_items eingefroren.
CREATE TEMP TABLE recipe_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE meal_plan_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE meal_plan_week_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE meal_plan_day_map (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;

INSERT INTO recipe_map (neu, alt)
SELECT gen_random_uuid(), id
FROM nutrition.recipes
WHERE user_id = :'quelle'::uuid;

INSERT INTO nutrition.recipes (
  id, user_id, name_de, name_en, description, instructions, cuisine_code,
  cooking_skill, prep_time_min, cook_time_min, servings, is_favorite,
  tags, measurement_source, source_detail
)
SELECT
  rm.neu, :'ziel'::uuid, name_de, name_en, description, instructions,
  cuisine_code, cooking_skill, prep_time_min, cook_time_min, servings,
  is_favorite, tags, 'seed', 'Kopie aus tom.seed@example.com'
FROM nutrition.recipes r
JOIN recipe_map rm ON rm.alt = r.id;

INSERT INTO nutrition.recipe_ingredients (
  id, recipe_id, user_id, sort_order, food_source, food_id, custom_food_id,
  food_name_snapshot, amount_g, portion_name, portion_quantity,
  portion_amount_g, notes
)
SELECT
  gen_random_uuid(), rm.neu, :'ziel'::uuid, sort_order, food_source,
  food_id, custom_food_id, food_name_snapshot, amount_g, portion_name,
  portion_quantity, portion_amount_g, notes
FROM nutrition.recipe_ingredients ri
JOIN recipe_map rm ON rm.alt = ri.recipe_id
WHERE ri.user_id = :'quelle'::uuid;

INSERT INTO meal_plan_map (neu, alt)
SELECT gen_random_uuid(), id
FROM nutrition.meal_plans
WHERE user_id = :'quelle'::uuid;

INSERT INTO nutrition.meal_plans (
  id, user_id, name, description, target_kcal, target_protein_g,
  target_carbs_g, target_fat_g, is_active, measurement_source, source_detail
)
SELECT
  mpm.neu, :'ziel'::uuid, name, description, target_kcal,
  target_protein_g, target_carbs_g, target_fat_g, is_active,
  'seed', 'Kopie aus tom.seed@example.com'
FROM nutrition.meal_plans mp
JOIN meal_plan_map mpm ON mpm.alt = mp.id;

INSERT INTO meal_plan_week_map (neu, alt)
SELECT gen_random_uuid(), id
FROM nutrition.meal_plan_weeks
WHERE user_id = :'quelle'::uuid;

INSERT INTO nutrition.meal_plan_weeks (
  id, plan_id, user_id, week_start, name, copied_from_week_id
)
SELECT
  mpwm.neu, mpm.neu, :'ziel'::uuid, w.week_start, w.name, src.neu
FROM nutrition.meal_plan_weeks w
JOIN meal_plan_week_map mpwm ON mpwm.alt = w.id
JOIN meal_plan_map mpm ON mpm.alt = w.plan_id
LEFT JOIN meal_plan_week_map src ON src.alt = w.copied_from_week_id;

INSERT INTO meal_plan_day_map (neu, alt)
SELECT gen_random_uuid(), id
FROM nutrition.meal_plan_days
WHERE user_id = :'quelle'::uuid;

INSERT INTO nutrition.meal_plan_days (
  id, week_id, user_id, plan_date, day_index, notes
)
SELECT
  mpdm.neu, mpwm.neu, :'ziel'::uuid, d.plan_date, d.day_index, d.notes
FROM nutrition.meal_plan_days d
JOIN meal_plan_day_map mpdm ON mpdm.alt = d.id
JOIN meal_plan_week_map mpwm ON mpwm.alt = d.week_id;

INSERT INTO nutrition.meal_plan_entries (
  id, day_id, user_id, meal_type, planned_time, slot_order, entry_type,
  recipe_id, food_id, custom_food_id, amount_g, planned_servings,
  portion_name, portion_quantity, portion_amount_g, note
)
SELECT
  gen_random_uuid(), mpdm.neu, :'ziel'::uuid, e.meal_type, e.planned_time,
  e.slot_order, e.entry_type, rm.neu, e.food_id, e.custom_food_id,
  e.amount_g, e.planned_servings, e.portion_name, e.portion_quantity,
  e.portion_amount_g, e.note
FROM nutrition.meal_plan_entries e
JOIN meal_plan_day_map mpdm ON mpdm.alt = e.day_id
LEFT JOIN recipe_map rm ON rm.alt = e.recipe_id
WHERE e.user_id = :'quelle'::uuid;

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

INSERT INTO medical.user_medications (
  id, user_id, active_substance_id, product_id, name, drug_class,
  cyp_profile, dose_amount, dose_unit, doses_per_day, route, start_date,
  end_date, is_active, indication, notes, measurement_source,
  source_detail, source_kind, source_actor, source_recorded_at,
  source_lab_report_id, frozen_at
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, active_substance_id, product_id, name,
  drug_class, cyp_profile, dose_amount, dose_unit, doses_per_day, route,
  start_date, end_date, is_active, indication, notes, 'seed',
  'Kopie aus tom.seed@example.com', 'seed',
  'Kopie aus tom.seed@example.com', now(), NULL, frozen_at
FROM medical.user_medications
WHERE user_id = :'quelle'::uuid;

INSERT INTO medical.user_conditions (
  id, user_id, condition_code, status, start_date, end_date, notes,
  measurement_source, source_detail, source_kind, source_actor,
  source_recorded_at, source_lab_report_id
)
SELECT
  gen_random_uuid(), :'ziel'::uuid, condition_code, status, start_date,
  end_date, notes, 'seed', 'Kopie aus tom.seed@example.com', 'seed',
  'Kopie aus tom.seed@example.com', now(), NULL
FROM medical.user_conditions
WHERE user_id = :'quelle'::uuid;

-- =============================================================
-- 12. C-236: das Pruefkonto bekommt EIGENE Daten.
--
-- [read] test-user@lumeos.local ist laut C-209 das Nachweiskonto —
-- und war fuer Recovery, Training und Supplements leer. Drei
-- Auftraege (G-158, G-159, G-160) mussten deshalb auf dev ausweichen.
-- Genug fuer einen Nachweis, nicht so viel wie dev: 30 Tage
-- Check-ins, 6 Sitzungen, ein kleiner Stack mit Einnahmen.
--
-- Was das Konto WEITER NICHT bekommt (Pruefungen im Gate erwarten 0):
-- meal_plans, user_medications — und keine Coach-Beziehung
-- (coach-portal-fuellen.sql: Zeilenschutz-Konto).
--
-- Determinismus ohne random(): md5(name||tag) liefert je Tag
-- denselben Pseudowert; der Anker haengt am Seed-Fenster der Quelle
-- (max(entry_date) - 75 Tage ~ "heute" im +/-90-Fenster), nicht an
-- der Uhr.
-- =============================================================

DELETE FROM supplements.intake_logs WHERE user_id = :'pruefkonto'::uuid;
DELETE FROM supplements.stack_items si
  USING supplements.user_stacks us
  WHERE si.stack_id = us.id AND us.user_id = :'pruefkonto'::uuid;
DELETE FROM supplements.user_stacks WHERE user_id = :'pruefkonto'::uuid;
DELETE FROM nutrition.shopping_list_items WHERE user_id = :'pruefkonto'::uuid;
DELETE FROM nutrition.shopping_lists WHERE user_id = :'pruefkonto'::uuid;
DELETE FROM training.workout_sets ws
  USING training.workout_exercises we, training.workout_sessions s
  WHERE ws.workout_exercise_id = we.id AND we.workout_session_id = s.id
    AND s.user_id = :'pruefkonto'::uuid;
DELETE FROM training.workout_exercises we
  USING training.workout_sessions s
  WHERE we.workout_session_id = s.id AND s.user_id = :'pruefkonto'::uuid;
DELETE FROM training.workout_sessions WHERE user_id = :'pruefkonto'::uuid;
DELETE FROM recovery.scores WHERE user_id = :'pruefkonto'::uuid;
DELETE FROM recovery.checkins WHERE user_id = :'pruefkonto'::uuid;

SELECT (max(entry_date) - 75)::date AS anker
FROM recovery.checkins WHERE user_id = :'quelle'::uuid \gset

-- 12a. 30 Tage Check-ins. rausch(tag, salz) in 0..1 aus md5.
INSERT INTO recovery.checkins (
  user_id, entry_date, checkin_time, sleep_hours, sleep_quality,
  sleep_start_time, sleep_end_time, subjective_feeling, mood,
  energy_level, motivation, soreness, stress_level, work_stress,
  life_stress, alcohol_units, caffeine_mg, screen_time_before_bed,
  resting_hr, hrv_rmssd, spo2_pct, respiratory_rate, notes,
  measurement_source, source_detail
)
SELECT
  :'pruefkonto'::uuid,
  (:'anker'::date - t.d),
  '07:05'::time,
  w.schlaf,
  w.qualitaet,
  (time '06:45' - make_interval(mins => round(w.schlaf * 60)::int + 15)),
  time '06:45',
  w.gefuehl,
  CASE WHEN w.gefuehl >= 8 THEN 'good'
       WHEN w.gefuehl <= 4 THEN 'tired'
       ELSE 'neutral' END,
  least(9, greatest(3, w.gefuehl)),
  least(9, greatest(3, w.gefuehl)),
  '{}'::jsonb,
  w.stress,
  least(9, greatest(1, w.stress + 1)),
  least(9, greatest(1, w.stress - 1)),
  0,
  180 + (t.d % 3) * 40,
  20 + (t.d % 4) * 10,
  CASE WHEN t.d % 4 = 0 THEN round(54 - 4 * sin(t.d / 6.0) + (w.r3 - 0.5) * 6)::int END,
  CASE WHEN t.d % 4 = 0 THEN round((52 + 6 * sin(t.d / 6.0) + (w.r1 - 0.5) * 14)::numeric, 1) END,
  CASE WHEN t.d % 4 = 0 THEN round((96.9 + (w.r2 - 0.5) * 2.0)::numeric, 1) END,
  CASE WHEN t.d % 4 = 0 THEN round((14.0 + (w.r3 - 0.5) * 2.8)::numeric, 1) END,
  'C-236: eigener Check-in des Pruefkontos',
  'seed', 'C-236 test-user Nachweisdaten'
FROM generate_series(0, 29) AS t(d)
CROSS JOIN LATERAL (
  SELECT r1, r2, r3,
         round((6.6 + 1.2 * sin(t.d / 4.7) + (r1 - 0.5) * 1.4)::numeric, 1) AS schlaf,
         least(9, greatest(4, round(6.8 + 1.5 * sin(t.d / 4.7) + (r2 - 0.5) * 3)))::int AS qualitaet,
         least(9, greatest(3, round(6.5 + 1.5 * sin(t.d / 5.9) + (r3 - 0.5) * 3)))::int AS gefuehl,
         least(8, greatest(1, round(4 + 2 * sin(t.d / 6.8) + (r1 - 0.5) * 4)))::int AS stress
  FROM (
    SELECT
      (('x' || substr(md5('tu-a-' || t.d), 1, 8))::bit(32)::bigint % 65536) / 65536.0 AS r1,
      (('x' || substr(md5('tu-b-' || t.d), 1, 8))::bit(32)::bigint % 65536) / 65536.0 AS r2,
      (('x' || substr(md5('tu-c-' || t.d), 1, 8))::bit(32)::bigint % 65536) / 65536.0 AS r3
  ) rr
) w;

SELECT recovery.refresh_scores_for_user(:'pruefkonto'::uuid);

-- 12b. Sechs Trainingssitzungen mit je zwei Uebungen und drei Saetzen.
INSERT INTO training.workout_sessions (
  id, user_id, session_date, started_time, ended_time, name, status,
  location, duration_minutes, measurement_source, source_detail
)
SELECT
  ('c2360000-0000-0000-0000-00000000000' || s.n)::uuid,
  :'pruefkonto'::uuid,
  (:'anker'::date - (s.n * 3 + 1)),
  '17:30'::time, '18:40'::time,
  CASE WHEN s.n % 2 = 1 THEN 'Push' ELSE 'Pull' END,
  'completed', 'Gym', 70,
  'seed', 'C-236 test-user Nachweisdaten'
FROM generate_series(1, 6) AS s(n);

INSERT INTO training.workout_exercises (
  id, workout_session_id, exercise_id, exercise_order,
  planned_sets, planned_reps, planned_weight_kg
)
SELECT
  gen_random_uuid(),
  ws.id,
  e.id,
  eo.ord,
  3, 8, eo.basis
FROM training.workout_sessions ws
JOIN LATERAL (VALUES
  (1, 'Barbell Bench Press', 80.0),
  (2, 'Barbell bent over row pronated grip', 70.0)
) AS eo(ord, name, basis) ON TRUE
JOIN training.exercises e ON e.name = eo.name
WHERE ws.user_id = :'pruefkonto'::uuid
  AND ws.source_detail = 'C-236 test-user Nachweisdaten';

INSERT INTO training.workout_sets (
  workout_exercise_id, set_number, reps, weight_kg, rpe, rir, set_type,
  measurement_source, source_detail
)
SELECT
  we.id,
  sn.n,
  8 - (CASE WHEN (('x' || substr(md5('tu-set-' || ws.session_date || sn.n), 1, 4))::bit(16)::int % 3) = 0 THEN 1 ELSE 0 END),
  we.planned_weight_kg
    + round((2.5 * sin(extract(day FROM ws.session_date) / 3.1))::numeric, 1)
    + (('x' || substr(md5('tu-w-' || ws.session_date || we.exercise_name || sn.n), 1, 4))::bit(16)::int % 3) * 1.25,
  7.5, 2, 'working',
  'seed', 'C-236 test-user Nachweisdaten'
FROM training.workout_exercises we
JOIN training.workout_sessions ws ON ws.id = we.workout_session_id
CROSS JOIN generate_series(1, 3) AS sn(n)
WHERE ws.user_id = :'pruefkonto'::uuid
  AND ws.source_detail = 'C-236 test-user Nachweisdaten';

-- 12c. Ein kleiner Stack mit 24 Einnahmen (12 Tage x 2 Positionen).
INSERT INTO supplements.user_stacks (id, user_id, name, is_active)
VALUES ('c2360000-0000-0000-0000-0000000000aa'::uuid, :'pruefkonto'::uuid,
        'Nachweis-Stack', true);

INSERT INTO supplements.stack_items (
  id, stack_id, custom_name, dose, dose_unit, frequency, timing
)
VALUES
  ('c2360000-0000-0000-0000-0000000000ab'::uuid,
   'c2360000-0000-0000-0000-0000000000aa'::uuid,
   'Creatin Monohydrat', 5, 'g', 'daily', 'any'),
  ('c2360000-0000-0000-0000-0000000000ac'::uuid,
   'c2360000-0000-0000-0000-0000000000aa'::uuid,
   'Vitamin D3', 2000, 'IU', 'daily', 'morning');

INSERT INTO supplements.intake_logs (
  user_id, stack_item_id, intake_date, intake_time, status,
  supplement_name_snapshot, dose_snapshot, dose_unit_snapshot,
  measurement_source, source_detail
)
SELECT
  :'pruefkonto'::uuid,
  si.id,
  (:'anker'::date - t.d),
  CASE WHEN si.timing = 'morning' THEN time '07:10' ELSE time '12:30' END,
  CASE WHEN (('x' || substr(md5('tu-i-' || si.id || t.d), 1, 4))::bit(16)::int % 7) = 0
       THEN 'skipped' ELSE 'taken' END,
  si.custom_name, si.dose, si.dose_unit,
  'seed', 'C-236 test-user Nachweisdaten'
FROM supplements.stack_items si
CROSS JOIN generate_series(0, 11) AS t(d)
WHERE si.stack_id = 'c2360000-0000-0000-0000-0000000000aa'::uuid;

-- 12d. C-251: Einkaufslisten-Nachweis fuer test-user.
-- Echte foods-Zeilen, keine Freitexte: Claude Code kann damit die
-- Kacheln "Shopping list" und "Scale list" ueber die Verknuepfung
-- pruefen. Die FK-Spalte heisst shopping_list_id.
INSERT INTO nutrition.shopping_lists (
  id, user_id, name, source_type, servings, status,
  measurement_source, source_detail
)
VALUES (
  'c2510000-0000-0000-0000-000000000001'::uuid,
  :'pruefkonto'::uuid,
  'Nachweis-Einkaufsliste',
  'manual',
  1,
  'open',
  'seed',
  'C-251 test-user Einkaufsliste'
);

CREATE TEMP TABLE c251_shopping_items (
  sort_order integer NOT NULL,
  bls_code text NOT NULL,
  amount_g numeric,
  quantity numeric,
  unit_display text NOT NULL,
  notes text
) ON COMMIT DROP;

INSERT INTO c251_shopping_items VALUES
  (10, 'C133000', 500, NULL, 'g', 'Oats fuer Fruehstueck'),
  (20, 'F503100', 750, NULL, 'g', 'Banane'),
  (30, 'E111100', NULL, 12, 'Stueck', 'Eier'),
  (40, 'V416100', 800, NULL, 'g', 'Haehnchen'),
  (50, 'C351000', 1000, NULL, 'g', 'Reis'),
  (60, 'Q120000', 250, NULL, 'ml', 'Olivenoel');

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(i.bls_code, ', ' ORDER BY i.bls_code)
    INTO v_missing
  FROM c251_shopping_items i
  LEFT JOIN nutrition.foods f ON f.bls_code = i.bls_code
  WHERE f.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'C-251 Einkaufslisten-Seed: BLS-Codes fehlen: %', v_missing;
  END IF;
END $$;

INSERT INTO nutrition.shopping_list_items (
  shopping_list_id, user_id, sort_order, item_source, food_id, food_name,
  amount_g, quantity, unit_display, notes
)
SELECT
  'c2510000-0000-0000-0000-000000000001'::uuid,
  :'pruefkonto'::uuid,
  i.sort_order,
  'bls',
  f.id,
  COALESCE(NULLIF(f.name_display_de, ''), f.name_de),
  i.amount_g,
  i.quantity,
  i.unit_display,
  i.notes
FROM c251_shopping_items i
JOIN nutrition.foods f ON f.bls_code = i.bls_code;

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
  UNION ALL SELECT u.email, 'recipes', count(r.*)
  FROM users u LEFT JOIN nutrition.recipes r ON r.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'recipe_ingredients', count(ri.*)
  FROM users u LEFT JOIN nutrition.recipe_ingredients ri ON ri.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'meal_plans', count(mp.*)
  FROM users u LEFT JOIN nutrition.meal_plans mp ON mp.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'meal_plan_weeks', count(mpw.*)
  FROM users u LEFT JOIN nutrition.meal_plan_weeks mpw ON mpw.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'meal_plan_days', count(mpd.*)
  FROM users u LEFT JOIN nutrition.meal_plan_days mpd ON mpd.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'meal_plan_entries', count(mpe.*)
  FROM users u LEFT JOIN nutrition.meal_plan_entries mpe ON mpe.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'shopping_lists', count(sl.*)
  FROM users u LEFT JOIN nutrition.shopping_lists sl ON sl.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'shopping_list_items', count(sli.*)
  FROM users u LEFT JOIN nutrition.shopping_list_items sli ON sli.user_id = u.id GROUP BY u.email
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
  UNION ALL SELECT u.email, 'user_medications', count(um.*)
  FROM users u LEFT JOIN medical.user_medications um ON um.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'user_conditions', count(uc.*)
  FROM users u LEFT JOIN medical.user_conditions uc ON uc.user_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'coach_client_permissions', count(cp.*)
  FROM users u LEFT JOIN coach.client_permissions cp ON cp.client_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'coach_client_autonomy', count(ca.*)
  FROM users u LEFT JOIN coach.client_autonomy ca ON ca.client_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'coach_pending_actions', count(pa.*)
  FROM users u LEFT JOIN coach.pending_actions pa ON pa.client_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'coach_action_log', count(al.*)
  FROM users u LEFT JOIN coach.action_log al ON al.client_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'coach_permission_change_log', count(pcl.*)
  FROM users u LEFT JOIN coach.permission_change_log pcl ON pcl.client_id = u.id GROUP BY u.email
  UNION ALL SELECT u.email, 'coach_autonomy_change_log', count(acl.*)
  FROM users u LEFT JOIN coach.autonomy_change_log acl ON acl.client_id = u.id GROUP BY u.email
)
SELECT email, table_name, rows
FROM counts
ORDER BY email, table_name;
