-- C-236: 19 Kontrollzahlen nach dem Live-Einspielen.
WITH k AS (
  SELECT id, email FROM auth.users
  WHERE email IN ('dev@lumeos.app','tom.seed@example.com','test-user@lumeos.local')
)
SELECT  1 AS nr, 'checkins gesamt' AS was, count(*)::text AS wert FROM recovery.checkins
UNION ALL SELECT 2, 'scores gesamt', count(*)::text FROM recovery.scores
UNION ALL SELECT 3, 'checkins dev', count(*)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 4, 'checkins test-user', count(*)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='test-user@lumeos.local'
UNION ALL SELECT 5, 'scores test-user', count(*)::text FROM recovery.scores s JOIN k ON k.id=s.user_id AND k.email='test-user@lumeos.local'
UNION ALL SELECT 6, 'hrv dev: n', count(hrv_rmssd)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 7, 'hrv dev: min-max', min(hrv_rmssd)::text || ' - ' || max(hrv_rmssd)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 8, 'hrv dev: mittel/sd', round(avg(hrv_rmssd),1)::text || ' / ' || round(stddev_samp(hrv_rmssd),1)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 9, 'resting_hr dev: n, min-max', count(resting_hr)::text || ', ' || min(resting_hr)::text || '-' || max(resting_hr)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 10, 'spo2 dev: min-max', min(spo2_pct)::text || '-' || max(spo2_pct)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 11, 'resp_rate dev: min-max', min(respiratory_rate)::text || '-' || max(respiratory_rate)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 12, 'sleep_start dev: gefuellt', count(sleep_start_time)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 13, 'work/life_stress dev: gefuellt', count(work_stress)::text || '/' || count(life_stress)::text FROM recovery.checkins c JOIN k ON k.id=c.user_id AND k.email='dev@lumeos.app'
UNION ALL SELECT 14, 'sessions test-user', count(*)::text FROM training.workout_sessions s JOIN k ON k.id=s.user_id AND k.email='test-user@lumeos.local'
UNION ALL SELECT 15, 'sets test-user', count(*)::text FROM training.workout_sets st JOIN training.workout_exercises we ON we.id=st.workout_exercise_id JOIN training.workout_sessions s ON s.id=we.workout_session_id JOIN k ON k.id=s.user_id AND k.email='test-user@lumeos.local'
UNION ALL SELECT 16, 'intake test-user', count(*)::text FROM supplements.intake_logs il JOIN k ON k.id=il.user_id AND k.email='test-user@lumeos.local'
UNION ALL SELECT 17, 'meal_plans test-user (soll 0)', count(*)::text FROM nutrition.meal_plans mp JOIN k ON k.id=mp.user_id AND k.email='test-user@lumeos.local'
UNION ALL SELECT 18, 'medications test-user (soll 0)', count(*)::text FROM medical.user_medications um JOIN k ON k.id=um.user_id AND k.email='test-user@lumeos.local'
UNION ALL SELECT 19, 'training tom unveraendert: sets', count(*)::text FROM training.workout_sets st JOIN training.workout_exercises we ON we.id=st.workout_exercise_id JOIN training.workout_sessions s ON s.id=we.workout_session_id JOIN k ON k.id=s.user_id AND k.email='tom.seed@example.com'
ORDER BY nr;
