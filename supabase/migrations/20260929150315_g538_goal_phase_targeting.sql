-- G-538: Phasen sind Terminierungen eines Nutzerziels.
-- Offene Phasen brauchen ihr Ziel; abgeschlossene Phasen duerfen nach einer
-- Ziel-Loeschung als ungebundene Historie erhalten bleiben.

BEGIN;

ALTER TABLE goals.user_goals
  ADD COLUMN linked_modules text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE goals.user_goals
  ADD CONSTRAINT user_goals_linked_modules_check
  CHECK (
    linked_modules <@ ARRAY[
      'nutrition', 'training', 'recovery', 'supplements', 'medical'
    ]::text[]
    AND array_position(linked_modules, NULL) IS NULL
  );

COMMENT ON COLUMN goals.user_goals.linked_modules IS
  'Module, aus denen der Ist-Wert dieses Ziels automatisch gezogen wird. Leer bedeutet: noch keine Datenquelle verknuepft.';

ALTER TABLE goals.goal_phases
  ADD CONSTRAINT goal_phases_open_requires_goal
  CHECK (actual_end_date IS NOT NULL OR goal_id IS NOT NULL)
  NOT VALID;

DROP INDEX goals.uq_goal_phases_one_open;
CREATE UNIQUE INDEX uq_goal_phases_one_open
  ON goals.goal_phases(goal_id)
  WHERE actual_end_date IS NULL;

COMMENT ON TABLE goals.goal_phases IS
  'Terminiert Strategien fuer konkrete Nutzerziele. Offene Phasen brauchen ein Ziel; abgeschlossene Phasen bleiben als Historie erhalten.';

COMMENT ON COLUMN goals.goal_phases.goal_id IS
  'Das terminierte Nutzerziel. Bei abgeschlossenen Phasen darf die Bindung durch Ziel-Loeschung entfallen.';

COMMIT;
