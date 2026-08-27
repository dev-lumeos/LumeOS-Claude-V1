-- C-305: Die noch direkten Coach-Lesepolicies pruefen Freigaben einmal je
-- Abfrage ueber client_permissions. Die EXISTS-Policies fuer Kindtabellen
-- bleiben unveraendert, weil ihre Unterplaene bereits materialisiert sind.

BEGIN;

DROP POLICY IF EXISTS meals_coach_read ON nutrition.meals;
CREATE POLICY meals_coach_read ON nutrition.meals
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.nutrition_visibility = 'full')
  );

DROP POLICY IF EXISTS meal_items_coach_read ON nutrition.meal_items;
CREATE POLICY meal_items_coach_read ON nutrition.meal_items
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.nutrition_visibility = 'full')
  );

DROP POLICY IF EXISTS water_logs_coach_read ON nutrition.water_logs;
CREATE POLICY water_logs_coach_read ON nutrition.water_logs
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.nutrition_visibility = 'full')
  );

DROP POLICY IF EXISTS lab_reports_coach_read ON medical.lab_reports;
CREATE POLICY lab_reports_coach_read ON medical.lab_reports
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.medical_visibility = 'full')
  );

DROP POLICY IF EXISTS workout_sessions_coach_read ON training.workout_sessions;
CREATE POLICY workout_sessions_coach_read ON training.workout_sessions
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.training_visibility = 'full')
  );

DROP POLICY IF EXISTS user_goals_coach_read ON goals.user_goals;
CREATE POLICY user_goals_coach_read ON goals.user_goals
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.goals_visibility = 'full')
  );

DROP POLICY IF EXISTS goal_phases_coach_read ON goals.goal_phases;
CREATE POLICY goal_phases_coach_read ON goals.goal_phases
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.goals_visibility = 'full')
  );

DROP POLICY IF EXISTS goal_milestones_coach_read ON goals.goal_milestones;
CREATE POLICY goal_milestones_coach_read ON goals.goal_milestones
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.goals_visibility = 'full')
  );

DROP POLICY IF EXISTS body_measurements_coach_read ON goals.body_measurements;
CREATE POLICY body_measurements_coach_read ON goals.body_measurements
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.goals_visibility = 'full')
  );

DROP POLICY IF EXISTS body_circumferences_coach_read ON goals.body_circumferences;
CREATE POLICY body_circumferences_coach_read ON goals.body_circumferences
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.goals_visibility = 'full')
  );

DROP POLICY IF EXISTS nutrition_targets_coach_read ON goals.nutrition_targets;
CREATE POLICY nutrition_targets_coach_read ON goals.nutrition_targets
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.goals_visibility = 'full')
  );

DROP POLICY IF EXISTS recovery_checkins_coach_read ON recovery.checkins;
CREATE POLICY recovery_checkins_coach_read ON recovery.checkins
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.recovery_visibility = 'full')
  );

DROP POLICY IF EXISTS recovery_scores_coach_read ON recovery.scores;
CREATE POLICY recovery_scores_coach_read ON recovery.scores
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.recovery_visibility = 'full')
  );

DROP POLICY IF EXISTS recovery_modality_log_coach_read ON recovery.modality_log;
CREATE POLICY recovery_modality_log_coach_read ON recovery.modality_log
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT p.client_id FROM coach.client_permissions p
      WHERE p.coach_id = (SELECT auth.uid())
        AND (p.expires_at IS NULL OR p.expires_at > now())
        AND p.recovery_visibility = 'full')
  );

COMMIT;
